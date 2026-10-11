import {distanceMetres,bearingTo,offsetMetres} from './motion.js';
import {roadWidth} from './street-safety.js';
import {stableHash} from './districts.js';
// Simulated signals at major mapped junctions, not a survey of installed lights.
export function signalPhase(signal,now=Date.now()){const t=(now/1000+signal.offset)%44,axis=Math.abs(Math.cos(signal.heading*Math.PI/180))>.707?0:1;const local=(t+axis*22)%44;return local<17?'green':local<20?'amber':'red'}
const angleGap=(a,b)=>Math.abs(((a-b+540)%360)-180);
export function junctionSignals(features,position){
 const nodes=new Map();
 for(const f of features){
  const p=f.properties||{};
  if(!['primary','secondary','tertiary','street','street_limited'].includes(p.class)||Number(p.layer||0)!==0||['bridge','tunnel'].includes(p.structure))continue;
  const lines=f.geometry?.type==='LineString'?[f.geometry.coordinates]:f.geometry?.type==='MultiLineString'?f.geometry.coordinates:[];
  for(const line of lines)for(let i=0;i<line.length;i++){
   const point=line[i];if(distanceMetres(point,position)>240)continue;
   const key=point.map(n=>n.toFixed(5)).join(',');let node=nodes.get(key);
   if(!node){node={key,point,arms:[],major:false};nodes.set(key,node)}
   node.major||=['primary','secondary'].includes(p.class);
   for(const j of [i-1,i+1])if(line[j]&&distanceMetres(point,line[j])>1){
    const heading=bearingTo(line[j],point),existing=node.arms.find(a=>angleGap(a.heading,heading)<30);
    if(existing)existing.width=Math.max(existing.width,roadWidth(p.class));else node.arms.push({heading,width:roadWidth(p.class)});
   }
  }
 }
 // Tile duplicates and split carriageways must not produce forests of poles.
 const junctions=[...nodes.values()].filter(n=>n.major&&n.arms.length>=3&&n.arms.length<=5).sort((a,b)=>Math.max(...b.arms.map(a=>a.width))-Math.max(...a.arms.map(a=>a.width))||a.key.localeCompare(b.key));
 const selected=[],signals=[];
 for(const node of junctions){
  if(selected.some(n=>distanceMetres(n.point,node.point)<85))continue;
  selected.push(node);const offset=stableHash(node.key)%44;
  const setback=Math.max(9,...node.arms.map(a=>a.width/2+3));
  for(const arm of node.arms){
   const r=arm.heading*Math.PI/180,stop=offsetMetres(node.point,-Math.sin(r)*setback,-Math.cos(r)*setback),pole=offsetMetres(stop,Math.cos(r)*(arm.width/2+1),-Math.sin(r)*(arm.width/2+1));
   signals.push({id:`signal:${node.key}:${Math.round(arm.heading)}`,junction:node.key,kind:'signal',position:pole,stop,heading:arm.heading,offset,width:arm.width});
  }
  if(selected.length===4)break;
 }
 return signals;
}
export function signalSpeedLimit(position,heading,signals,now=Date.now()){let limit=Infinity;for(const signal of signals){if(signalPhase(signal,now)==='green'||Math.abs(((signal.heading-heading+540)%360)-180)>40)continue;const r=signal.heading*Math.PI/180,east=(signal.stop[0]-position[0])*111320*Math.cos(position[1]*Math.PI/180),north=(signal.stop[1]-position[1])*111320,along=east*Math.sin(r)+north*Math.cos(r),lateral=Math.abs(east*Math.cos(r)-north*Math.sin(r));if(along>=-1&&along<38&&lateral<signal.width/2+1)limit=Math.min(limit,Math.sqrt(2*3.5*Math.max(0,along-3)))}return limit}
