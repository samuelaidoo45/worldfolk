import {distanceMetres} from './motion.js';

export const STREAM_BUDGETS=Object.freeze({
 desktop:{models:20,vertices:1200000,draws:280,near:230},
 mobile:{models:12,vertices:650000,draws:180,near:160},
});
export function modelCost(root){
 let vertices=0,draws=0;root.traverse(o=>{if(o.isMesh){vertices+=o.geometry?.attributes.position?.count||0;draws+=Array.isArray(o.material)?Math.max(1,o.geometry.groups.length):1}});return {vertices,draws};
}
export function actorRenderPolicy(distance,{mobile=false,driving=false}={}){
 return {visible:distance<(driving?(mobile?150:200):(mobile?55:90)),animationMs:distance<15?0:distance<35?50:100,castShadow:distance<(mobile?22:38)};
}
export function planFacadeDetails(items,{mobile=false}={}){
 return items.filter(i=>Number.isFinite(i.distance)&&i.distance<(mobile?140:220)).sort((a,b)=>a.distance-b.distance).slice(0,mobile?24:48);
}
export function selectAmbientDetails(items,position,{mobile=false,previous=new Set()}={}){
 const counts={people:0,vehicles:0},limits={people:mobile?4:8,vehicles:mobile?10:16},selected=new Set();
 const ranked=items.map(item=>({item,distance:distanceMetres(item.position,position)})).filter(({item,distance})=>actorRenderPolicy(distance,{mobile,driving:item.driving}).visible).sort((a,b)=>(a.distance-(previous.has(a.item.id)?8:0))-(b.distance-(previous.has(b.item.id)?8:0)));
 for(const {item} of ranked){const kind=item.driving?'vehicles':'people';if(counts[kind]>=limits[kind])continue;counts[kind]++;selected.add(item.id);}return selected;
}
export function landmarkRange(data,mobile=false){
 const finite=v=>Number.isFinite(v)&&v>0?v:0;
 const radius=Math.hypot(finite(data.width),finite(data.depth))*.5;
 // Use the footprint edge for large compounds and retain visible high towers.
 return radius+Math.min(1200,Math.max(STREAM_BUDGETS[mobile?'mobile':'desktop'].near,finite(data.height)*12));
}
// Keep recognizable exteriors within the same GPU budget. Reserve a few slots
// for prominent towers: small nearby street packages must not erase the skyline.
export function planLandmarkStream(items,position,{mobile=false}={}){
 const budget=STREAM_BUDGETS[mobile?'mobile':'desktop'];
 const ranked=items.map(item=>{
  const distance=distanceMetres(item.data.position,position),radius=Math.hypot(item.data.width||0,item.data.depth||0)*.5;
  return {item,distance,edge:Math.max(0,distance-radius)};
 }).filter(({item,distance})=>distance<landmarkRange(item.data,mobile)+(item.model?100:0))
 .sort((a,b)=>a.edge-b.edge||a.distance-b.distance||String(a.item.data.id).localeCompare(String(b.item.data.id)));
 const hasMedium=item=>!!item.costs?.medium&&!item.lodFailed;
 const skyline=ranked.filter(({item})=>hasMedium(item)&&item.data.height>=25)
 .sort((a,b)=>b.item.data.height/Math.max(50,b.edge)-a.item.data.height/Math.max(50,a.edge))
 .slice(0,mobile?3:4);
 const priority=[...new Set([ranked[0],...skyline,...ranked].filter(Boolean))];
 const chosen=[],usage={models:0,vertices:0,draws:0};
 const fits=cost=>usage.vertices+cost.vertices<=budget.vertices&&usage.draws+cost.draws<=budget.draws;
 for(const {item} of priority){
  if(usage.models>=budget.models)break;
  const preferred=item.preferredDetail??item.desiredDetail;
  // Fit complete lighter exteriors first, then spend spare capacity on close
  // detail. Never build a costly near model just to discover it cannot fit.
  const closestNear=item===ranked[0]?.item&&preferred==='near'&&item.costs?.near;
  const detail=hasMedium(item)?(closestNear&&fits(closestNear)?'near':'medium'):preferred;
  const cost=item.costs?.[detail]||item.cost||{vertices:0,draws:0};
  if(chosen.length&&!fits(cost))continue;
  chosen.push({item,detail,preferred,cost});usage.models++;usage.vertices+=cost.vertices;usage.draws+=cost.draws;
 }
 for(const {item} of ranked){
  const entry=chosen.find(e=>e.item===item);if(!entry||entry.preferred!=='near'||entry.detail==='near')continue;
  const cost=item.costs?.near;if(!cost)continue;
  const extra={vertices:cost.vertices-entry.cost.vertices,draws:cost.draws-entry.cost.draws};
  if(fits(extra)){usage.vertices+=extra.vertices;usage.draws+=extra.draws;entry.detail='near';entry.cost=cost;}
 }
 const selected=chosen.map(entry=>{entry.item.desiredDetail=entry.detail;return entry.item;}),keep=new Set(selected);
 return {selected,evict:items.filter(i=>i.model&&!keep.has(i)),next:selected.find(i=>!i.model)||selected.find(i=>i.desiredDetail&&i.detail!==i.desiredDetail),usage,budget};
}

// A bounded ring collects CPU submission and frame interval samples without
// growing arrays over a long session. GPU memory bytes/FPS are not inferred.
export function createRenderMetrics(size=120){
 const cpu=new Float32Array(size),interval=new Float32Array(size);let count=0,index=0,previous=0;
 return {sample(now,cpuMs){cpu[index]=cpuMs;interval[index]=previous?Math.min(1000,now-previous):0;previous=now;index=(index+1)%size;count=Math.min(size,count+1)},snapshot(renderer,loaded){const percentile=a=>{const values=Array.from(a.slice(0,count)).filter(v=>v>0).sort((a,b)=>a-b);return values[Math.max(0,Math.ceil(values.length*.95)-1)]||0;};return {samples:count,cpuSubmitP95Ms:+percentile(cpu).toFixed(2),frameIntervalP95Ms:+percentile(interval).toFixed(2),draws:renderer.info.render.calls,triangles:renderer.info.render.triangles,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,loadedLandmarks:loaded}}};
}
// Coarse, slow resolution steps avoid oscillation and keep the canvas bounded.
// The MapLibre canvas owns the shared context; Three must never resize it.
export function createResolutionGovernor(maximum,{mobile=false}={}){
 const floor=Math.min(maximum,mobile?.8:1);let ratio=maximum,changedAt=0;
 return {update(now,stats,{visible=true,settled=true}={}){
  if(!visible||!settled||stats.samples<120||now-changedAt<10000)return ratio;
  const next=stats.frameIntervalP95Ms>40?Math.max(floor,+(ratio*.85).toFixed(2)):stats.frameIntervalP95Ms<22?Math.min(maximum,+(ratio+.1).toFixed(2)):ratio;
  if(next!==ratio){ratio=next;changedAt=now;}return ratio;
 },get ratio(){return ratio}};
}
