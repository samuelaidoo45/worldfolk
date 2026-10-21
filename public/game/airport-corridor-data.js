import {CORRIDOR_PAVEMENTS,CORRIDOR_LAMPS,CORRIDOR_MEDIAN} from './airport-corridor-layout.js';
export {CORRIDOR_PAVEMENTS,CORRIDOR_LAMPS,CORRIDOR_MEDIAN};
import {CORRIDOR_ROADS,CORRIDOR_CONTEXT,CORRIDOR_BUILDINGS} from './airport-corridor-map.js';
import {offsetMetres,distanceMetres,bearingTo,projectOnSegment} from './motion.js';
export const AIRPORT_CORRIDOR={id:'airport-city-streets',name:'Airport City public approaches',position:[-.1772,5.6024],width:1200,depth:1600,height:0,rotation:0};
export const corridorLocal=p=>[(p[0]-AIRPORT_CORRIDOR.position[0])*111320*Math.cos(AIRPORT_CORRIDOR.position[1]*Math.PI/180),(AIRPORT_CORRIDOR.position[1]-p[1])*111320];
export const corridorPoint=(x,z)=>offsetMetres(AIRPORT_CORRIDOR.position,x,-z);
export const CORRIDOR_WIDTHS=new Map(CORRIDOR_ROADS.map(r=>[String(r.id),r.width]));
export const corridorWidth=(id,fallback)=>CORRIDOR_WIDTHS.get(String(id))??fallback;
export const CORRIDOR_BOUNDS=[-.17915,5.5991,-.1711,5.6088];
// The eastern extension begins north of the T3 ramp; never flatten the deck.
export const inAirportCorridor=p=>p[0]>CORRIDOR_BOUNDS[0]&&p[0]<CORRIDOR_BOUNDS[2]&&p[1]>CORRIDOR_BOUNDS[1]&&p[1]<CORRIDOR_BOUNDS[3]&&(p[0]<-.17535||p[1]>5.6042);
const fallback=k=>({trunk:14,secondary:9,tertiary:8,service:5}[k]||7);
const context=CORRIDOR_CONTEXT.filter(r=>r.class!=='path').flatMap(r=>r.coordinates.slice(1).map((b,i)=>({id:r.id,a:r.coordinates[i],b,width:corridorWidth(r.id,fallback(r.class))})));
const inside=(p,r)=>{let yes=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
export function corridorBuildingClear(p,radius=.3){return !CORRIDOR_BUILDINGS.some(rings=>inside(p,rings[0])&&!rings.slice(1).some(r=>inside(p,r))||rings.some(r=>r.slice(1).some((b,i)=>projectOnSegment(p,r[i],b).distance<radius)));}
export const corridorRoadClear=(p,radius=0,ignore=null)=>!context.some(r=>r.id!==ignore&&projectOnSegment(p,r.a,r.b).distance<r.width/2+radius);
function pathFor(r){const lengths=r.coordinates.slice(1).map((b,i)=>distanceMetres(r.coordinates[i],b)),total=lengths.reduce((a,b)=>a+b,0);return {total,at(d,side=0){let left=Math.max(0,Math.min(total,d));for(let i=0;i<lengths.length;i++){if(left<=lengths[i]||i===lengths.length-1){const a=r.coordinates[i],b=r.coordinates[i+1],t=left/(lengths[i]||1),h=bearingTo(a,b),v=h*Math.PI/180,p=a.map((x,j)=>x+(b[j]-x)*t);return {position:offsetMetres(p,Math.cos(v)*side,-Math.sin(v)*side),heading:h};}left-=lengths[i];}}};}
export const CORRIDOR_PATHS=CORRIDOR_ROADS.map(r=>({...r,path:pathFor(r)}));
export const corridorColliders=()=>CORRIDOR_LAMPS.map((p,i)=>{const ring=[[-.16,-.16],[.16,-.16],[.16,.16],[-.16,.16],[-.16,-.16]].map(([x,z])=>offsetMetres(p.position,x,z));return {id:'airport-corridor:lamp:'+i,rings:[ring],minHeight:0,height:7.5,noDoor:true};});

// Clip only the visible surface at the documented precinct boundary. Keep full
// native ways and one-way connectivity for navigation.
export function corridorDrawLines(r){const bounds=[...CORRIDOR_BOUNDS];if(r.coordinates.some(p=>p[0]>=-.17535))bounds[1]=5.6042;const out=[];let line=[];for(let i=1;i<r.coordinates.length;i++){const a=r.coordinates[i-1],b=r.coordinates[i],d=[b[0]-a[0],b[1]-a[1]];let lo=0,hi=1,valid=true;for(const [p,q] of [[-d[0],a[0]-bounds[0]],[d[0],bounds[2]-a[0]],[-d[1],a[1]-bounds[1]],[d[1],bounds[3]-a[1]]]){if(Math.abs(p)<1e-14){if(q<0)valid=false;}else {const t=q/p;if(p<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);}}if(!valid||lo>hi){if(line.length>1)out.push(line);line=[];continue;}const start=a.map((v,j)=>v+d[j]*lo),end=a.map((v,j)=>v+d[j]*hi);if(line.length&&distanceMetres(line.at(-1),start)>.01){out.push(line);line=[];}if(!line.length)line.push(start);line.push(end);}if(line.length>1)out.push(line);if(r.class!=='path')return out;
 // Mapped pedestrian links retain their route through crossings, but asphalt
 // crossing portions do not become grey pavement painted across vehicle lanes.
 const walks=[];for(const points of out){let walk=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],steps=Math.ceil(distanceMetres(a,b));for(let j=0;j<=steps;j++){const p=a.map((v,k)=>v+(b[k]-v)*j/steps);if(corridorRoadClear(p,r.width/2+.05)){if(!walk.length||distanceMetres(walk.at(-1),p)>.05)walk.push(p);}else{if(walk.length>1)walks.push(walk);walk=[];}}}if(walk.length>1)walks.push(walk);}return walks;}
