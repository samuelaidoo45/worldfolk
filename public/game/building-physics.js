import {precinctCollision,moveOnPrecinct} from './precinct-navigation.js';
import {isCityLandmark,landmarkColliders} from './city-landmarks.js';
// The polygons come from the rendered OpenStreetMap building layer.
// All distances below are computed in a small, local metre coordinate system.
import {BUILDING_LAYER} from './real-buildings.js';
const M=111320;
const target={featuresetId:'buildings',importId:'basemap'};
function local(origin,point){return [(point[0]-origin[0])*M*Math.cos(origin[1]*Math.PI/180),(point[1]-origin[1])*M]}
function global(origin,x,y){return [origin[0]+x/(M*Math.cos(origin[1]*Math.PI/180)),origin[1]+y/M]}
function inRing(point,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside}
function inPolygon(point,rings){return rings.length>0&&inRing(point,rings[0])&&!rings.slice(1).some(ring=>inRing(point,ring))}
function segments(ring){const out=[];for(let i=0;i<ring.length-1;i++)out.push([ring[i],ring[i+1]]);return out}
function closestSegment(point,a,b){const vx=b[0]-a[0],vy=b[1]-a[1],length=vx*vx+vy*vy,t=length?Math.max(0,Math.min(1,((point[0]-a[0])*vx+(point[1]-a[1])*vy)/length)):0;const x=a[0]+t*vx,y=a[1]+t*vy;return {x,y,distance:Math.hypot(point[0]-x,point[1]-y)}}
function polygons(feature){const g=feature.geometry;if(g?.type==='Polygon')return [g.coordinates];if(g?.type==='MultiPolygon')return g.coordinates;return []}
export function createBuildingPhysics(map){
  let features=[],lastCenter=null,lastScan=0;
  function refresh(position,force=false){if(!map?.queryRenderedFeatures||!position)return features;const now=performance.now();if(!force&&lastCenter&&Math.hypot(...local(lastCenter,position))<12&&now-lastScan<1400)return features;lastCenter=[...position];lastScan=now;
    try{const p=map.project(position),bounds=[[p.x-250,p.y-250],[p.x+250,p.y+250]],rendered=()=>map.queryRenderedFeatures(bounds,map.getLayer?.(BUILDING_LAYER)?{layers:[BUILDING_LAYER]}:{target}),source=map.getSource?.('accralife-streets')?map.querySourceFeatures('accralife-streets',{sourceLayer:'building'}):[],raw=source.length?source:rendered();const seen=new Set(),next=[];for(const feature of raw){if(isCityLandmark(feature.id))continue;if(Number(feature.properties?.min_height||0)>1.5||String(feature.properties?.extrude)==='false')continue;for(const rings of polygons(feature)){const first=rings[0]?.[0];if(!first||rings[0].length<4)continue;const coords=rings[0].map(p=>local(position,p));if(Math.min(...coords.map(p=>p[0]))>90||Math.max(...coords.map(p=>p[0]))< -90||Math.min(...coords.map(p=>p[1]))>90||Math.max(...coords.map(p=>p[1]))< -90)continue;const key=`${feature.id||''}:${first[0].toFixed(6)}:${first[1].toFixed(6)}:${rings[0].length}`;if(seen.has(key))continue;seen.add(key);next.push({id:key,rings,bounds:[Math.min(...rings[0].map(p=>p[0])),Math.min(...rings[0].map(p=>p[1])),Math.max(...rings[0].map(p=>p[0])),Math.max(...rings[0].map(p=>p[1]))],height:Number(feature.properties?.height||4.5)})}}next.push(...landmarkColliders(position));if(next.length||!features.length||map.isSourceLoaded?.('accralife-streets'))features=next}catch(error){console.warn('Building collision data',error)}return features}
  function collision(position,radius=.6,elevation=null){if(elevation!==null&&precinctCollision(position,radius,elevation))return {id:"precinct-surface",rings:[]};for(const feature of features){if(elevation!==null&&feature.precinctWalkable)continue;const b=feature.bounds,pad=radius/110000;if(b&&(position[0]<b[0]-pad||position[0]>b[2]+pad||position[1]<b[1]-pad||position[1]>b[3]+pad))continue;const rings=feature.rings;if(inPolygon(position,rings))return feature;const p=local(position,position);for(const ring of rings)for(const [a,b] of segments(ring)){const aa=local(position,a),bb=local(position,b);if(closestSegment(p,aa,bb).distance<radius)return feature}}return null}
  function penetration(position,radius=.6,elevation=null){let total=0;for(const feature of features){if(elevation!==null&&feature.precinctWalkable)continue;const b=feature.bounds,pad=radius/110000;if(b&&(position[0]<b[0]-pad||position[0]>b[2]+pad||position[1]<b[1]-pad||position[1]>b[3]+pad))continue;let nearest=Infinity;for(const ring of feature.rings)for(const [a,b] of segments(ring))nearest=Math.min(nearest,closestSegment([0,0],local(position,a),local(position,b)).distance);total+=inPolygon(position,feature.rings)?nearest+radius:Math.max(0,radius-nearest)}return total}
  function move(from,to,radius=.6,elevation=null){
    const delta=local(from,to),steps=Math.max(1,Math.ceil(Math.hypot(...delta)/.28));let current=[...from],blocked=false;
    for(let i=0;i<steps;i++){
      const next=global(current,delta[0]/steps,delta[1]/steps),hit=collision(next,radius,elevation);
      if(!hit){current=next;continue}
      blocked=true;const startDepth=penetration(current,radius,elevation),endDepth=penetration(next,radius,elevation);
      if(startDepth>0&&endDepth<=startDepth+1e-7){current=next;continue}
      let edge=null;for(const ring of hit.rings)for(const [a,b] of segments(ring)){const aa=local(current,a),bb=local(current,b),closest=closestSegment([0,0],aa,bb);if(!edge||closest.distance<edge.distance)edge={a:aa,b:bb,distance:closest.distance}}
      if(edge){const dx=edge.b[0]-edge.a[0],dy=edge.b[1]-edge.a[1],len=Math.hypot(dx,dy)||1,along=(delta[0]*dx+delta[1]*dy)/len/steps,slide=global(current,dx/len*along,dy/len*along);if(!collision(slide,radius,elevation)||startDepth>0&&penetration(slide,radius,elevation)<=startDepth+1e-7){current=slide;continue}}
      break;
    }
    return {position:current,blocked};
  }
  function vehicleCollision(position,heading,kind='car'){const angle=heading*Math.PI/180,length=kind==='motorcycle'?.65:1.05,radius=kind==='motorcycle'?.46:.88;return [-length,0,length].some(d=>collision(global(position,Math.sin(angle)*d,Math.cos(angle)*d),radius))}
  function vehicleDepth(position,heading,kind='car'){const angle=heading*Math.PI/180,length=kind==='motorcycle'?.65:1.05,radius=kind==='motorcycle'?.46:.88;return [-length,0,length].reduce((sum,d)=>sum+penetration(global(position,Math.sin(angle)*d,Math.cos(angle)*d),radius),0)}
  function moveVehicle(from,to,heading,kind='car'){
    const delta=local(from,to),steps=Math.max(1,Math.ceil(Math.hypot(...delta)/.2));let current=[...from],blocked=false;
    for(let i=0;i<steps;i++){
      const dx=delta[0]/steps,dy=delta[1]/steps,startDepth=vehicleCollision(current,heading,kind)?vehicleDepth(current,heading,kind):0;
      const allowed=p=>!vehicleCollision(p,heading,kind)||startDepth>0&&vehicleDepth(p,heading,kind)<=startDepth+1e-7;
      const next=global(current,dx,dy);if(allowed(next)){current=next;continue}
      blocked=true;
      // Keep tangential motion at glancing impacts. A head-on contact stops;
      // reversing away remains possible even when streamed geometry overlaps.
      let best=null,bestProgress=0;
      for(const feature of features)for(const ring of feature.rings)for(const [a,b] of segments(ring)){
        const aa=local(current,a),bb=local(current,b);if(closestSegment([0,0],aa,bb).distance>4)continue;
        const ex=bb[0]-aa[0],ey=bb[1]-aa[1],len=Math.hypot(ex,ey)||1,along=(dx*ex+dy*ey)/len;
        const candidate=global(current,ex/len*along,ey/len*along);
        if(Math.abs(along)>bestProgress&&allowed(candidate)){best=candidate;bestProgress=Math.abs(along)}
      }
      if(!best||bestProgress<.00001)break;current=best;
    }
    return {position:current,blocked};
  }
  function findOpen(position,radius=.7){if(!collision(position,radius))return position;for(let metres=2;metres<=36;metres+=2)for(let i=0;i<24;i++){const angle=i*Math.PI/12,candidate=global(position,Math.cos(angle)*metres,Math.sin(angle)*metres);if(!collision(candidate,radius))return candidate}return position}
  function vehicleExit(position,heading){for(const distance of [2.2,3.2,3.8])for(const turn of [90,-90,180,0,135,-135,45,-45]){const a=(heading+turn)*Math.PI/180,point=global(position,Math.sin(a)*distance,Math.cos(a)*distance);if(!collision(point,.7))return point}return null}
  function nearestDoor(position,maxDistance=24){let best=null;for(const feature of features){if(feature.precinctWalkable||feature.noDoor)continue;const ring=feature.rings[0];for(const [a,b] of segments(ring)){const aa=local(position,a),bb=local(position,b),point={x:(aa[0]+bb[0])/2,y:(aa[1]+bb[1])/2,distance:Math.hypot((aa[0]+bb[0])/2,(aa[1]+bb[1])/2)};if(Math.hypot(bb[0]-aa[0],bb[1]-aa[1])<3)continue;if(point.distance>maxDistance+3||best&&point.distance>=best.distance)continue;const dx=bb[0]-aa[0],dy=bb[1]-aa[1],len=Math.hypot(dx,dy)||1;let nx=-dy/len,ny=dx/len;let door=global(position,point.x+nx*1.5,point.y+ny*1.5);if(inPolygon(door,feature.rings)){nx=-nx;ny=-ny;door=global(position,point.x+nx*1.5,point.y+ny*1.5)}if(collision(door,.4))door=global(position,point.x+nx*2.5,point.y+ny*2.5);if(collision(door,.62))continue;best={id:feature.id,position:door,facade:global(position,point.x+nx*.12,point.y+ny*.12),heading:(Math.atan2(nx,ny)*180/Math.PI+360)%360,distance:Math.hypot(...local(position,door)),height:feature.height}}}return best&&best.distance<=maxDistance?best:null}
  return {refresh,collision,move,moveWalker:(from,to,elevation=0)=>moveOnPrecinct(from,to,elevation,(a,b,y)=>move(a,b,.28,y)),vehicleCollision,moveVehicle,vehicleDepth,vehicleExit,findOpen,nearestDoor,get count(){return features.length},get nearby(){return features}};
}
