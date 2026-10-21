import {CORRIDOR_ROADS} from './airport-corridor-map.js';
import {offsetMetres} from './motion.js';
// Native roundabout rings. Island offsets and planting are dated-photo estimates.
const chain=ids=>ids.flatMap((id,i)=>{const c=CORRIDOR_ROADS.find(r=>r.id===id).coordinates;return i?c.slice(1):c;});
function island(id,name,ring,arrival){const open=ring.slice(0,-1),position=[0,1].map(j=>open.reduce((n,p)=>n+p[j],0)/open.length);return {id,name,position,ring,arrival,width:68,depth:68,height:13,rotation:0};}
export const AIRPORT_ISLANDS=[
 island('airport-big-six-roundabout','Big Six roundabout',chain([514484050,514484056,514484055,514484054,514484053,514484052,4790608,514484051]),[-.17579,5.60581]),
 island('airport-terminal-road-split','Airport Road · terminal approach roundabout',CORRIDOR_ROADS.find(r=>r.id===4790600).coordinates,[-.1734182,5.6058156]),
];
export function islandLocal(s,p){return [(p[0]-s.position[0])*111320*Math.cos(s.position[1]*Math.PI/180),(s.position[1]-p[1])*111320];}
export const islandPoint=(s,x,z)=>offsetMetres(s.position,x,-z);
export function islandEdge(s,inset=5.3){return s.ring.map(p=>{const [x,z]=islandLocal(s,p),n=Math.hypot(x,z);return [x*(n-inset)/n,z*(n-inset)/n];});}
export const AIRPORT_ISLAND_PLACES=AIRPORT_ISLANDS.map(s=>({id:s.id,name:s.name,lng:s.arrival[0],lat:s.arrival[1],type:'roundabout',category:'transport',area:'Airport Road · Airport City',emoji:'🛣️',description:s.id==='airport-big-six-roundabout'?'Explore the planted Big Six junction from the public pavement, then follow Airport Road to the terminal approaches.':'Explore the divided terminal approach, planted island and ground-level connections towards Terminals 2 and 3.',activities:['explore','stroll']}));
export const airportIslandForPlace=p=>AIRPORT_ISLANDS.find(s=>p?.id===s.id);
export const airportIslandArrival=p=>{const s=airportIslandForPlace(p);return s?{position:[...s.arrival],target:s.position,cameraPitch:18,hint:s.name+' · stay on the public pavement. Airport Road leads to the terminal approaches. E starts/stops the junction guide.'}:null;};
export const AIRPORT_ISLAND_ACTIVITIES=AIRPORT_ISLANDS.map(s=>({id:'airport-island:'+s.id+':guide',kind:'watch',label:'Read '+s.name+' guide',position:s.arrival,target:s.position,elevation:0,text:'Follow the mapped public approaches towards Terminal 2 or Terminal 3. The departure ramp is elevated; ground traffic stays below it. Use the pavements and mapped crossing links. The landscaped island is surrounded by traffic.'}));
// Only the compact monuments/mast are solid. No invisible wall surrounds the
// carriageway or the low kerb; the viewing arrival stays on the outside pavement.
export function airportIslandColliders(s){const boxes=s.id==='airport-big-six-roundabout'?[[-3,-2,5,5,3.5],[4,1,.7,.7,11]]:[[2,1,1.7,1.7,10]];const solids=boxes.map(([x,z,w,d,height],i)=>({id:s.id+':solid-'+i,rings:[[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([a,b])=>islandPoint(s,x+a,z+b))],height,noDoor:true}));if(s.id==='airport-terminal-road-split')solids.push({id:s.id+':overhead-board',rings:[[[-4,-.1],[8,-.1],[8,.1],[-4,.1],[-4,-.1]].map(([x,z])=>islandPoint(s,x,z+2.4))],minHeight:9.3,height:12.7,noDoor:true});return solids;}
