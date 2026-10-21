import {offsetMetres,distanceMetres,bearingTo} from './motion.js';
// OSM ways 413842865 (span), 413842864/869 (stairs), 427838937/938
// (return ramps). Height and widths are photographic estimates, in metres.
export const SPANNER={id:'spanner-footbridge',name:'Spanner pedestrian footbridge',position:[-.1762807,5.62060825],rotation:0,width:70,depth:65,height:15};
export const SPANNER_DECK_HEIGHT=6.2;
export const spannerPoint=(x,z)=>offsetMetres(SPANNER.position,x,-z);
export const spannerLocal=p=>[(p[0]-SPANNER.position[0])*111320*Math.cos(SPANNER.position[1]*Math.PI/180),(SPANNER.position[1]-p[1])*111320];
const west=[-.1765144,5.620595],east=[-.176047,5.6206215];
export const SPANNER_ROUTES={
 span:[west,east],
 westStairs:[[-.1765786,5.6206288],[-.1765831,5.620724],[-.1765435,5.6207295],west],
 eastStairs:[[-.1759923,5.620754],[-.1760607,5.6207502],east],
 westRamp:[[-.1766309,5.6206275],[-.1766018,5.6202825],[-.176514,5.6202878],west],
 eastRamp:[[-.1759923,5.620754],[-.1759493,5.6203225],[-.1760244,5.6203188],east],
};
export const SPANNER_ARRIVAL=offsetMetres(SPANNER_ROUTES.eastStairs[0],3,3);
export const SPANNER_PLACE={id:SPANNER.id,name:SPANNER.name,lng:SPANNER_ARRIVAL[0],lat:SPANNER_ARRIVAL[1],area:'Spanner · Accra Mall · Tetteh Quarshie',type:'Footbridge',emoji:'🌉',description:'Cross Liberation Road on the silver-arched Spanner footbridge. Climb the concrete stairs or follow the return ramps and watch traffic below.',activities:['stroll']};
export const isSpanner=p=>p?.id===SPANNER.id||/^(spanner (pedestrian )?(footbridge|walkover)|tetteh quarshie (pedestrian |overhead )?bridge)$/i.test(p?.name||'');
export function orientedStrip(a,b,width,extra={}){const [ax,az]=spannerLocal(a),[bx,bz]=spannerLocal(b);return {x:(ax+bx)/2,z:(az+bz)/2,w:Math.hypot(bx-ax,bz-az),d:width,angle:Math.atan2(bz-az,bx-ax),...extra};}
export function stripLocal(s,x,z){const dx=x-s.x,dz=z-s.z,c=Math.cos(s.angle||0),n=Math.sin(s.angle||0);return [dx*c+dz*n,-dx*n+dz*c];}
export function surfaceOffset(s,x,z){return s.rise?s.rise*Math.max(-.5,Math.min(.5,stripLocal(s,x,z)[0]/s.w)):0;}
export function surfaceHeight(s,x,z){return s.y+surfaceOffset(s,x,z);}
const surfaces=[],solids=[],rails=[],supports=[],ground=[];
const addSurface=s=>{surfaces.push(s);return s};
function rail(s,side){const angle=s.angle||0,offset=side*(s.d/2-.04),x=s.x-Math.sin(angle)*offset,z=s.z+Math.cos(angle)*offset;const r={...s,x,z,d:.1,base:s.y+.04,top:s.y+1.18};rails.push(r);}
const deck=addSurface(orientedStrip(west,east,4.4,{y:SPANNER_DECK_HEIGHT,kind:'bridge',base:SPANNER_DECK_HEIGHT-.32}));
for(const side of [-1,1])rail({...deck,w:deck.w-6},side);
for(const [name,mappedRoute] of Object.entries(SPANNER_ROUTES)){
 const route=mappedRoute.map(p=>[...p]);
 if(name==='span')continue;
 const stair=name.endsWith('Stairs'),width=stair?2.6:2.25;
 // OSM maps the top junction at the deck centreline. Finish the rise at
 // its edge, then keep the short connector level to prevent slab head strikes.
 const top=route.pop(),before=route.at(-1),len=distanceMetres(before,top),u=2.6/len;route.push([top[0]+(before[0]-top[0])*u,top[1]+(before[1]-top[1])*u],top);
 const lengths=route.slice(1).map((b,i)=>distanceMetres(route[i],b));
 // The short return bends are level landings; the long runs share the rise.
 const level=lengths.map((len,i)=>i===lengths.length-1||(stair&&name==='eastStairs'?i===0:i===1));
 const run=lengths.reduce((sum,len,i)=>sum+(level[i]?0:len),0);let height=0;
 for(let i=0;i<lengths.length;i++){
  const a=route[i],b=route[i+1],rise=level[i]?0:SPANNER_DECK_HEIGHT*lengths[i]/run,strip=orientedStrip(a,b,width,{y:height+rise/2,rise,base:height+rise/2-.22,kind:stair?'step':'ramp'});
  ground.push(strip);
  if(stair&&rise){const steps=Math.ceil(rise/.18);for(let n=0;n<steps;n++){const u=(n+.5)/steps,x=strip.x+Math.cos(strip.angle)*strip.w*(u-.5),z=strip.z+Math.sin(strip.angle)*strip.w*(u-.5),y=height+rise*(n+1)/steps;addSurface({...strip,x,z,w:strip.w/steps,y,rise:0,base:y-.22});}}
  else addSurface(strip);
  for(const side of [-1,1])rail(strip,side);
  height+=rise;
 }
}
// Bearings sit at the two ends, outside the carriageways; no centre pier.
for(const end of [west,east]){const [x,z]=spannerLocal(end);supports.push({x,z,w:1.1,d:2.2,base:0,top:SPANNER_DECK_HEIGHT-.32});}
// Remove rail sections that cross another connected walking surface at a
// bend or junction. Keep the external edge continuous and the junction open.
const continuousRails=[];
for(const r of rails){
 const count=Math.ceil(r.w/.12);let start=null;
 const emit=end=>{if(start===null)return;const u=(start+end)/2-.5,scale=end-start;continuousRails.push({...r,x:r.x+Math.cos(r.angle||0)*r.w*u,z:r.z+Math.sin(r.angle||0)*r.w*u,w:r.w*scale,y:r.y+(r.rise||0)*u,base:r.base+(r.rise||0)*u,top:r.top+(r.rise||0)*u,rise:(r.rise||0)*scale});start=null;};
 for(let i=0;i<count;i++){const u=(i+.5)/count-.5,x=r.x+Math.cos(r.angle||0)*r.w*u,z=r.z+Math.sin(r.angle||0)*r.w*u,y=r.y+(r.rise||0)*u;
  const junction=y<.4||[deck,...ground,...surfaces.filter(s=>s.kind==='landing')].some(s=>{const [a,b]=stripLocal(s,x,z);return Math.abs(a)<s.w/2-.06&&Math.abs(b)<s.d/2-.12&&Math.abs(surfaceHeight(s,x,z)-y)<1.2});
  if(junction)emit(i/count);else if(start===null)start=i/count;
 }emit(1);
}
rails.splice(0,rails.length,...continuousRails);
for(const s of ground){if(s.kind!=='ramp'||s.w<8)continue;for(let i=1;i<=Math.floor(s.w/14)+1;i++){const u=i/(Math.floor(s.w/14)+2)-.5,y=s.y+(s.rise||0)*u;if(y>.8)supports.push({x:s.x+Math.cos(s.angle)*s.w*u,z:s.z+Math.sin(s.angle)*s.w*u,w:.55,d:.65,base:0,top:y-.22});}}
solids.push(...supports,...rails);
export const SPANNER_NAVIGATION={surfaces,solids};
export const SPANNER_RAILS=rails;
export const SPANNER_SUPPORTS=supports;
export const SPANNER_GROUND_STRIPS=ground;
export const SPANNER_DECK=deck;
export function spannerColliders(){return [...supports,...ground].map((s,i)=>{const c=Math.cos(s.angle||0),n=Math.sin(s.angle||0),ring=[[-s.w/2,-s.d/2],[s.w/2,-s.d/2],[s.w/2,s.d/2],[-s.w/2,s.d/2],[-s.w/2,-s.d/2]].map(([x,z])=>spannerPoint(s.x+x*c-z*n,s.z+x*n+z*c));return {id:`spanner-support-${i}`,rings:[ring],height:SPANNER_DECK_HEIGHT,noDoor:true,precinctWalkable:true};});}
export const SPANNER_ACTIVITIES=[{id:'spanner-view',kind:'watch',label:'Watch traffic from Spanner bridge',position:SPANNER.position,elevation:SPANNER_DECK_HEIGHT,heading:bearingTo(SPANNER.position,spannerPoint(0,-60)),text:'Spanner footbridge · Liberation Road and the Tetteh Quarshie approach.'}];
