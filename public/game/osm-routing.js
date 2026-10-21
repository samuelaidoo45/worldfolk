import {crossesT3Works} from './airport-access-data.js';
// Shared by a browser Worker and the authoritative ride service. No external API.
const metres=(a,b)=>Math.hypot((a[0]-b[0])*110800,(a[1]-b[1])*111320);
class Heap{items=[];push(v){let i=this.items.length;this.items.push(v);while(i){const p=(i-1)>>1;if(this.items[p][0]<=v[0])break;this.items[i]=this.items[p];i=p}this.items[i]=v}pop(){const root=this.items[0],last=this.items.pop();if(this.items.length){let i=0;while(i*2+1<this.items.length){let c=i*2+1;if(c+1<this.items.length&&this.items[c+1][0]<this.items[c][0])c++;if(this.items[c][0]>=last[0])break;this.items[i]=this.items[c];i=c}this.items[i]=last}return root}}
export function decodeRoad(encoded){let i=0,lng=0,lat=0,out=[];while(i<encoded.length){const values=[];for(let j=0;j<2;j++){let shift=0,value=0,part;do{part=encoded.charCodeAt(i++)-63;value|=(part&31)<<shift;shift+=5}while(part>=32);values.push(value&1?~(value>>>1):value>>>1)}lat+=values[0];lng+=values[1];out.push([lng/1e6,lat/1e6])}return out}
export function readRoadGraph(buffer){
 const view=new DataView(buffer);if(view.getUint32(0)!==0x57465231)throw Error('Unsupported road graph');const n=view.getUint32(4,true),e=view.getUint32(8,true),shapeOffset=view.getUint32(12,true),metaOffset=view.getUint32(16,true),metaLength=view.getUint32(20,true);if(metaOffset+metaLength!==buffer.byteLength||shapeOffset!==32+n*16+e*24+(e+1)*4)throw Error('Invalid road graph');const decoder=new TextDecoder();return {...JSON.parse(decoder.decode(new Uint8Array(buffer,metaOffset,metaLength))),nodeData:new Float64Array(buffer,32,n*2),edgeData:new Uint32Array(buffer,32+n*16,e*6),shapeOffsets:new Uint32Array(buffer,32+n*16+e*24,e+1),shapeBytes:new Uint8Array(buffer,shapeOffset,metaOffset-shapeOffset)};
}
export function createRouter(graph){
 const {names,bounds}=graph,nodeData=graph.nodeData||new Float64Array(graph.nodes.length*2),edgeData=graph.edgeData||new Uint32Array(graph.edges.length*6),shapes=[],head=new Int32Array(nodeData.length/2).fill(-1),links=new Int32Array(edgeData.length/3).fill(-1),grid=new Map(),restrictions=new Map();
 const shapeBytes=graph.shapeBytes,shapeOffsets=graph.shapeOffsets,decoder=new TextDecoder(),shapeAt=i=>shapeBytes?decoder.decode(shapeBytes.subarray(shapeOffsets[i],shapeOffsets[i+1])):shapes[i];
 const coord=i=>[nodeData[i*2],nodeData[i*2+1]],edgeAt=i=>{const o=i*6;return [edgeData[o],edgeData[o+1],edgeData[o+2]/100,edgeData[o+3]/100,edgeData[o+4],edgeData[o+5]]};
 const cell=p=>[Math.floor(p[0]*500),Math.floor(p[1]*500)];
 if(!graph.edgeData)graph.edges.forEach((e,id)=>{for(let c=0;c<6;c++)edgeData[id*6+c]=Math.round(e[c]*(c===2||c===3?100:1));shapes[id]=e[6]});
 for(let id=0;id<edgeData.length/6;id++)for(let d=0;d<2;d++){const node=edgeData[id*6+d],link=id*2+d;links[link]=head[node];head[node]=link}

 function* neighbours(node){for(let link=head[node];link!==-1;link=links[link]){const id=link>>1,d=link%2;yield [id,edgeData[id*6+1-d],d+1]}}
 function usable(i,mode,outgoing){for(const [id,to,d] of neighbours(i))if(allowed(edgeAt(id),outgoing?d:3-d,mode,id))return true;return false}
 if(!graph.nodeData)graph.nodes.forEach((p,i)=>{nodeData[i*2]=p[0];nodeData[i*2+1]=p[1]});
 for(let i=0;i<nodeData.length/2;i++){const k=cell(coord(i)).join(',');if(!grid.has(k))grid.set(k,[]);grid.get(k).push(i)}

 for(const [from,via,to,kind] of graph.restrictions||[]){const key=via+':'+from;if(!restrictions.has(key))restrictions.set(key,[]);restrictions.get(key).push({to,kind})}
 const accessCache=new Map();
 function accessOpen(id,edge){if(accessCache.has(id))return accessCache.get(id);const a=coord(edge[0]),b=coord(edge[1]);
  // Urban graph edges near the airport need their full native shape checked;
  // distant districts avoid decoding geometry for this bounded closure.
  if(Math.max(a[0],b[0])<-.185||Math.min(a[0],b[0])>-.16||Math.max(a[1],b[1])<5.59||Math.min(a[1],b[1])>5.615){accessCache.set(id,true);return true;}
  const encoded=shapeAt(id),points=encoded?decodeRoad(encoded):[a,b],open=!points.slice(1).some((p,i)=>crossesT3Works(points[i],p));accessCache.set(id,open);return open;
 }
 const allowed=(edge,direction,mode,id)=>!!(edge[4]&(mode==='walking'?4:direction))&&accessOpen(id,edge);
 function snap(p,mode,outgoing){const [x,y]=cell(p);let best=-1,dist=mode==='walking'?600:400;for(let dx=-3;dx<=3;dx++)for(let dy=-3;dy<=3;dy++)for(const i of grid.get(`${x+dx},${y+dy}`)||[]){if(!usable(i,mode,outgoing))continue;const d=metres(p,coord(i));if(d<dist){dist=d;best=i}}if(best<0)throw Error('No accessible road near this location. Choose a nearby street.');return best}
 function route(from,to,mode='driving'){
  if(!['walking','driving'].includes(mode)||![from,to].every(p=>Array.isArray(p)&&p.length===2&&p.every(Number.isFinite)&&p[0]>=bounds[0]&&p[0]<=bounds[2]&&p[1]>=bounds[1]&&p[1]<=bounds[3]))throw Error('Choose locations inside the Accra map area.');
  const start=snap(from,mode,true),goal=snap(to,mode,false),maxSpeed=mode==='walking'?1.4:28,heap=new Heap(),distance=new Map(),previous=new Map(),startKey=start+':-1';
  distance.set(startKey,0);heap.push([metres(coord(start),coord(goal))/maxSpeed,start,-1,0]);let end=null,visited=0;
  while(heap.items.length){const [,node,inWay,g]=heap.pop(),key=node+':'+inWay;if(g!==distance.get(key))continue;if(node===goal){end=key;break}if(++visited>250000)throw Error('Route is too complex. Choose a closer destination.');
   for(const [id,next,direction] of neighbours(node)){const edge=edgeAt(id);if(!allowed(edge,direction,mode,id))continue;
    if(mode==='driving'){const rules=restrictions.get(key)||[];if(rules.some(r=>r.kind.startsWith('no_')&&r.to===edge[5]||r.kind.startsWith('only_')&&r.to!==edge[5]))continue}
    const cost=edge[2]/(mode==='walking'?1.4:edge[3]),nextG=g+cost,nextKey=next+':'+edge[5];if(nextG>=(distance.get(nextKey)??Infinity))continue;
    distance.set(nextKey,nextG);previous.set(nextKey,[key,id,next]);heap.push([nextG+metres(coord(next),coord(goal))/maxSpeed,next,edge[5],nextG]);
   }
  }
  if(end===null)throw Error('No connected road route was found. Try another nearby street.');
  const traversed=[];for(let key=end;key!==startKey;){const p=previous.get(key);traversed.push(p);key=p[0]}traversed.reverse();
  const coordinates=[coord(start)];for(const [,id,next] of traversed){const e=edgeAt(id),encoded=shapeAt(id),shape=encoded?decodeRoad(encoded):[coord(e[0]),coord(e[1])];if(next!==e[1])shape.reverse();coordinates.push(...shape.slice(1))}if(coordinates.length<2)throw Error('You are already at the nearest road point.');
  let total=0;const steps=[];let lastName=null;for(const [,id,next] of traversed){const e=edgeAt(id),name=names[e[5]]||'the road';if(name!==lastName){steps.push({distance:0,name,maneuver:{instruction:`Follow ${name}`,type:steps.length?'continue':'depart',modifier:'straight'}});lastName=name}steps.at(-1).distance+=e[2];total+=e[2]}
  steps.push({distance:0,maneuver:{instruction:'Arrive near your destination',type:'arrive',modifier:''}});
  return {distance:Math.round(total),duration:Math.round(distance.get(end)),geometry:{type:'LineString',coordinates},legs:[{steps}],snapped:[coordinates[0],coordinates.at(-1)]};
 }
 return {route,walkingArrival:position=>coord(snap(position,'walking',false))};
}
