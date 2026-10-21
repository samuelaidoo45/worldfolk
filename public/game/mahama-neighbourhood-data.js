import {AREA_BUILDINGS,AREA_REFERENCE_BUILDINGS,AREA_LAND,MAHAMA_AREA_BOUNDS,MAHAMA_EXISTING_IDS} from './mahama-neighbourhood-map.js';
import {offsetMetres,distanceMetres,projectOnSegment} from './motion.js';
import {MAHAMA_ROADS,mahamaStrip} from './mahama-bypass-data.js';
import {SHANGRI_ROADS} from './shangri-la-data.js';
import {POLO_ROADS} from './polo-senchi-map.js';
export {AREA_BUILDINGS,AREA_REFERENCE_BUILDINGS,AREA_LAND,MAHAMA_AREA_BOUNDS,MAHAMA_EXISTING_IDS};
export const AREA_MASSES=[...AREA_BUILDINGS,...AREA_REFERENCE_BUILDINGS];
export const AREA_SITES=[
 {id:'mahama-north-courtyard',name:'Shangri-La · northern courtyard complex',position:[-.17454,5.6204],width:345,depth:275,height:11,rotation:0,zone:'north'},
 {id:'mahama-north-yard-buildings',name:'Airport Bypass · northern yard buildings',position:[-.17338,5.61895],width:200,depth:300,height:6,rotation:0,zone:'yard'},
 {id:'mahama-west-compounds',name:'Liberation Road · west-side compounds',position:[-.17692,5.6181],width:105,depth:500,height:9,rotation:0,zone:'west'},
 {id:'polo-court-exterior',name:'Polo Court · exterior cluster',position:[-.17482,5.61675],width:105,depth:160,height:9,rotation:0,zone:'court'},
].map(s=>({...s,sourceIds:AREA_BUILDINGS.filter(b=>b.zone===s.zone).map(b=>b.id)}));
export const areaLocal=(s,p)=>[(p[0]-s.position[0])*111320*Math.cos(s.position[1]*Math.PI/180),(s.position[1]-p[1])*111320];
export function areaInside(p,rings){const ring=r=>{let hit=false;for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit;}return hit;};return ring(rings[0])&&!rings.slice(1).some(ring);}
const roads=new Map([...POLO_ROADS,...SHANGRI_ROADS,...MAHAMA_ROADS].map(r=>[r.id,r]));
export const areaRoadClear=(p,radius=0)=>![...roads.values()].some(r=>r.coordinates.slice(1).some((b,i)=>projectOnSegment(p,r.coordinates[i],b).distance<(r.width||4)/2+radius));
export const areaBuildingClear=(p,radius=0)=>!AREA_MASSES.some(b=>areaInside(p,b.rings)||b.rings.some(r=>r.slice(1).some((v,i)=>projectOnSegment(p,r[i],v).distance<radius)));
export const inMahamaArea=p=>p[0]>MAHAMA_AREA_BOUNDS[0]&&p[0]<-.1723&&p[1]>5.6158&&p[1]<5.6208;
// Open-air observations only. No business identity, private access or room use is
// inferred from old map labels. Photo dates and estimates live in the inventory.
export const AREA_ACTIVITIES=[
 {id:'mahama-courtyard-view',kind:'watch',label:'View the northern courtyard complex',position:[-.176486,5.61973],target:[-.17454,5.6204],text:'Shangri-La northern block · the low courtyard complex has weathered hipped roofs and repeated arched openings in September 2024 Street View. The open centre, adjoining unfinished frame and overgrown grounds are represented separately. Heights and concealed elevations remain estimates; this is an exterior view.'},
 {id:'polo-court-view',kind:'watch',label:'View the Polo Court roof cluster',position:[-.174405,5.61659],target:[-.17485,5.61669],text:'Polo Court · separate cream residential blocks with brown hipped roofs, a central access aisle and shared garden/pool court. Five roof footprints supplement the native eastern building using overhead viewing estimates. This is exterior exploration; private apartments are closed.'},
 {id:'mahama-west-compounds-view',kind:'watch',label:'Explore the western roadside compounds',position:[-.17718,5.617172],target:[-.17699,5.61791],text:'West of Liberation Road · small compound roofs, low service rooms and narrow approach gaps retain their individual mapped shapes. Concealed facades and heights are estimated. These buildings are not branded as businesses without evidence.'},
].map(a=>({...a,elevation:0}));
export const AREA_PLACES=AREA_ACTIVITIES.map((a,i)=>({id:['mahama-north-courtyard','polo-court-exterior','mahama-west-compounds'][i],name:['Shangri-La northern courtyard','Polo Court exterior','Liberation Road west compounds'][i],lng:a.position[0],lat:a.position[1],area:'Mahama Bypass / Shangri-La / Polo',type:i===1?'residential':'neighbourhood',emoji:i===1?'🏘️':'🏛️',description:a.text,activities:['explore','stroll'],aliases:i===1?['Polo Court','Polo Court Gated Community']:[]}));
export function areaArrival(p){const i=AREA_PLACES.findIndex(s=>p?.id===s.id||Number.isFinite(p?.lng)&&Number.isFinite(p?.lat)&&distanceMetres([p.lng,p.lat],[s.lng,s.lat])<170&&[s.name,...s.aliases].some(n=>n.toLowerCase()===String(p.name||'').toLowerCase()));if(i<0)return null;const a=AREA_ACTIVITIES[i];return {position:[...a.position],target:a.target,cameraPitch:i===0?12:16,hint:'E starts/stops the exterior guide. Private buildings remain closed.'};}
// Trees are placed within the observed native wood parcels, never on roads,
// roof plates, the railway bank or the unfinished frame. Canopies are estimates.
export const AREA_TREES=[];
for(let row=0;row<15;row++)for(let col=0;col<20;col++){const p=[-.17595+col*.000135+(row%2)*.00004+Math.sin(row*3.1+col*2.7)*.000065,5.61894+row*.00012+Math.sin(row*5.9-col*1.7)*.000045];if(p[1]>5.6189&&(col+row)%2===0&&AREA_LAND.filter(f=>f.properties.class==='wood').some(f=>areaInside(p,f.geometry.coordinates))&&areaBuildingClear(p,5)&&areaRoadClear(p,6))AREA_TREES.push({position:p,height:4.2+(row%5)*.85,radius:3.1+(col%4)*.65});}
export const COURT_POOL={position:[-.174681,5.616574],radius:4.0};
export function areaColliders(site){const out=AREA_MASSES.filter(b=>b.zone===site.zone).map(b=>({id:'mahama-area:'+b.id,rings:b.rings,height:b.wallHeight+b.roofRise,noDoor:true}));
 if(site.zone==='north')for(const [i,t] of AREA_TREES.entries())out.push({id:'mahama-area:tree-'+i,rings:[mahamaStrip(offsetMetres(t.position,0,-.17),offsetMetres(t.position,0,.17),.34)],height:t.height,noDoor:true});
 if(site.zone==='court')out.push({id:'mahama-area:court-pool',rings:[Array.from({length:33},(_,i)=>offsetMetres(COURT_POOL.position,Math.cos(i*Math.PI/16)*COURT_POOL.radius,Math.sin(i*Math.PI/16)*COURT_POOL.radius))],height:.25,noDoor:true});
 return out;
}
