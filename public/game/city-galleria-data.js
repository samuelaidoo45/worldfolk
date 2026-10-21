import {offsetMetres} from './motion.js';
// Source ID is the bundled osmium area ID (2 × OSM way 1137453837).
// Five floors and a rooftop are documented by the property operator; dimensions
// and interior subdivisions below are photo-informed game interpretations.
export const CITY_GALLERIA={id:'city-galleria',name:'City Galleria',sourceIds:[2274907674,1137453837],position:[-.1724068238202247,5.62131645],width:90,depth:100,height:20.4};
export const GALLERIA_RING=[[-.1725278,5.6212524],[-.1725146,5.6213805],[-.1724997,5.6215323],[-.1724275,5.6216375],[-.1722797,5.6216316],[-.1722977,5.6211866],[-.1729373,5.620869],[-.1730122,5.6210183],[-.1725278,5.6212524]];
export const galleriaPoint=(x,z)=>offsetMetres(CITY_GALLERIA.position,x,-z);
export const galleriaLocal=p=>[(p[0]-CITY_GALLERIA.position[0])*111320*Math.cos(CITY_GALLERIA.position[1]*Math.PI/180),(CITY_GALLERIA.position[1]-p[1])*111320];
export const GALLERIA_OUTLINE=GALLERIA_RING.slice(0,-1).flatMap((p,i)=>{
 const a=galleriaLocal(p);if(i!==0)return [a];const b=galleriaLocal(GALLERIA_RING[1]);return Array.from({length:9},(_,j)=>{const t=j/9;return [a[0]+(b[0]-a[0])*t-Math.sin(t*Math.PI)*2.1,a[1]+(b[1]-a[1])*t];});
});
export const GALLERIA_PLACE={id:CITY_GALLERIA.id,name:'City Galleria',lng:CITY_GALLERIA.position[0],lat:CITY_GALLERIA.position[1],type:'mall',category:'mall',emoji:'🛍️',area:'Accra Mall · Spintex Road',description:'Explore the blue-and-white City Galleria, its glazed retail lobby, upper offices and rooftop terrace.',activities:['shopping','stroll']};
export const isCityGalleria=p=>/^(city galleria)( mall)?$/i.test(typeof p==='string'?p:p?.name||'')||p?.id===CITY_GALLERIA.id;
export const GALLERIA_ARRIVAL=galleriaPoint(-22,-5);
export const GALLERIA_ENTRY=galleriaPoint(-19,-5);
export const GALLERIA_ACTIVITIES=[{id:'city-galleria-enter',kind:'galleria-enter',label:'Enter City Galleria',position:GALLERIA_ENTRY,heading:90,elevation:0}];
export const GALLERIA_STOCK=['water','shirt','trainers','phone'];
export const GALLERIA_PARKING=[{x:-28,z:10,heading:0,kind:'hatchback',color:0x344859},{x:-40,z:15,heading:0,kind:'suv',color:0x4c5050},{x:-52,z:20,heading:0,kind:'car',color:0x8c8980}];
export function galleriaColliders(){return [
 {id:CITY_GALLERIA.id,noDoor:true,height:CITY_GALLERIA.height,rings:[[...GALLERIA_OUTLINE,GALLERIA_OUTLINE[0]].map(p=>galleriaPoint(...p))]},
 ...GALLERIA_PARKING.map((b,i)=>({id:'city-galleria-parked-'+i,noDoor:true,height:1.8,rings:[[[-1,-2.4],[1,-2.4],[1,2.4],[-1,2.4],[-1,-2.4]].map(([x,z])=>galleriaPoint(b.x+x,b.z+z))]})),
];}
export const GALLERIA_RETAIL=[{id:'style',name:'STYLE · GAME SHOP',x:-12,z:7,kinds:['clothing'],stock:['shirt','trainers']},{id:'tech',name:'TECH · GAME SHOP',x:12,z:7,kinds:['device'],stock:['phone']},{id:'refresh',name:'REFRESH · GAME COUNTER',x:12,z:-8,kinds:['food'],stock:['water']}];
// Explicit lift destinations preserve a clear return path at every level.
export const GALLERIA_AREAS={
 retail:{name:'City Galleria · retail lobby',bounds:{left:-17.5,right:17.5,back:-24,front:24},spawn:[0,19],exit:[0,22],hotspots:[
  {id:'directory',label:'Read the Galleria directory',x:0,z:12},
  {id:'lift:offices',label:'Lift · upper offices',x:-3,z:-19},
  {id:'lift:rooftop',label:'Lift · rooftop terrace',x:1,z:-19},
  {id:'sit:lobby',label:'Sit in the lobby',x:-3.5,z:6,seat:{x:-5,z:6,yaw:-Math.PI/2}},
  ...GALLERIA_RETAIL.map(s=>({id:'shop:'+s.id,label:'Browse '+s.name.split(' · ')[0].toLowerCase(),x:s.x<0?-7.5:7.5,z:s.z}))
 ]},
 offices:{name:'City Galleria · upper offices',bounds:{left:-17.5,right:17.5,back:-24,front:24},spawn:[0,18],hotspots:[
  {id:'lift:retail',label:'Lift · ground-floor lobby',x:-3,z:20},
  {id:'lift:rooftop',label:'Lift · rooftop terrace',x:1,z:20},
  {id:'work',label:'Work at the office desk',x:-6.5,z:0},
  {id:'gallery',label:'Explore the creative display',x:7.5,z:-8},
  {id:'sit:office',label:'Sit in the meeting lounge',x:8,z:8,seat:{x:10,z:8,yaw:Math.PI/2}},
 ]},
 rooftop:{name:'City Galleria · rooftop terrace',bounds:{left:-17.5,right:17.5,back:-24,front:24},spawn:[0,18],hotspots:[
  {id:'lift:retail',label:'Lift · ground-floor lobby',x:-3,z:20},
  {id:'lift:offices',label:'Lift · upper offices',x:1,z:20},
  {id:'dance',label:'Dance on the rooftop',x:0,z:-4},
  {id:'sit:roof',label:'Sit on the rooftop terrace',x:8,z:8,seat:{x:10,z:8,yaw:Math.PI/2}},
  {id:'roof-story',label:'Read about the rooftop',x:0,z:-19},
 ]}
};
// Shared controller state is independent of rendering. Rest only ends explicitly;
// remote UI action IDs cannot switch levels or activate out-of-reach counters.
export function createGalleriaVisit(initial='retail'){
 let area=galleriaArea(initial),position=[...GALLERIA_AREAS[area].spawn],active=null;
 return {get area(){return area},get position(){return [...position]},get active(){return active},move(p){if(!active)position=[...p]},nearby(){if(active)return {id:'stop-activity',actionId:'stop-activity',kind:'local',label:active.kind==='sit'?'Stand up':'Stop dancing'};const a=GALLERIA_AREAS[area];if(a.exit&&Math.hypot(position[0]-a.exit[0],position[1]-a.exit[1])<1.7)return {kind:'exit',label:'Leave City Galleria'};const h=a.hotspots.find(h=>Math.hypot(position[0]-h.x,position[1]-h.z)<1.8);return h?{...h,kind:'local',actionId:h.id}:null;},interact(id){const h=this.nearby();if(h?.actionId!==id)return null;if(id==='stop-activity'){active=null;return {stopped:true};}if(id.startsWith('lift:')){area=galleriaArea(id.slice(5));position=[...GALLERIA_AREAS[area].spawn];return {area};}if(id.startsWith('sit:')){active={kind:'sit',seat:h.seat};return {active};}if(id==='dance'){active={kind:'dance'};return {active};}return {action:id};}};
}
function galleriaArea(id){return Object.hasOwn(GALLERIA_AREAS,id)?id:'retail';}
