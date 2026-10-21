import {t3Point,t3Local,t3Rect,AIRPORT_T3} from './airport-t3-space.js';
import {distanceMetres,bearingTo} from './motion.js';
// GACL closed the old T3 parking facility on 20 July 2026. This bounded game
// cordon is inset within the previously reconstructed lot, not a surveyed
// October contractor perimeter. Outer native circulation and the deck stay open.
export const T3_WORKS={x:-2.5,z:-126.5,width:165,depth:29,height:2.1};
export const T3_WORKS_RING=t3Rect(T3_WORKS.x,T3_WORKS.z,T3_WORKS.width,T3_WORKS.depth);
export const T3_CLOSED_ROAD_IDS=new Set([626883874,776380958,776380959,1210036865,1210036866,1210036867,1210036868,1210036869,1210036870,1210036871,1210036872,1210036875,1210036877,1210036879,1210036880,1210036881,1210036883,626883867]);
export function insideT3Works(p,pad=0){if(Math.abs(p[0]-AIRPORT_T3.position[0])>.008||Math.abs(p[1]-AIRPORT_T3.position[1])>.008)return false;const [x,z]=t3Local(p);return Math.abs(x-T3_WORKS.x)<T3_WORKS.width/2+pad&&Math.abs(z-T3_WORKS.z)<T3_WORKS.depth/2+pad;}
export function crossesT3Works(a,b,pad=0){
 const minX=T3_WORKS.x-T3_WORKS.width/2-pad,maxX=T3_WORKS.x+T3_WORKS.width/2+pad,minZ=T3_WORKS.z-T3_WORKS.depth/2-pad,maxZ=T3_WORKS.z+T3_WORKS.depth/2+pad;
 // Exact segment/rectangle clipping, including edges whose endpoints are both
 // outside. The test is shared by the browser Worker and server ride routing.
 const p=t3Local(a),q=t3Local(b),dx=q[0]-p[0],dz=q[1]-p[1];let lo=0,hi=1;
 for(const [d,v] of [[-dx,p[0]-minX],[dx,maxX-p[0]],[-dz,p[1]-minZ],[dz,maxZ-p[1]]]){if(Math.abs(d)<1e-12){if(v<0)return false;}else{const t=v/d;if(d<0)lo=Math.max(lo,t);else hi=Math.min(hi,t);if(lo>hi)return false;}}
 return lo<=hi;
}
export const T3_PUBLIC_ARRIVAL=t3Point(-20,-50);
export const T3_WORKS_ARRIVAL=t3Point(5,-98);
export const T3_WORKS_PLACE={id:'airport-t3-public-access',name:'Terminal 3 · public access and parking update',lng:T3_WORKS_ARRIVAL[0],lat:T3_WORKS_ARRIVAL[1],area:'Accra airport · landside',type:'airport approach',category:'transport',emoji:'🚧',description:'Use the public terminal approach beside the closed former car park. The departure loop remains open; follow the parking update board.',activities:['explore','connect']};
export const isOldT3CarPark=p=>/^terminal\s*3\s*car\s*park$/i.test(p?.name||'')&&Number.isFinite(p.lng)&&Number.isFinite(p.lat)&&distanceMetres([p.lng,p.lat],t3Point(10,-127))<180;
export function airportAccessArrival(p){return p?.id===T3_WORKS_PLACE.id||isOldT3CarPark(p)?{position:[...T3_WORKS_ARRIVAL],target:t3Point(5,-125),cameraPitch:16,hint:'The former Terminal 3 car park is closed for redevelopment. Use the public terminal approach. The departure ramp remains open.'}:null;}
export const T3_ACCESS_ACTIVITIES=[{id:'airport-t3-parking-update',kind:'watch',label:'Read the Terminal 3 parking update',position:T3_WORKS_ARRIVAL,target:t3Point(5,-112),elevation:0,heading:bearingTo(T3_WORKS_ARRIVAL,t3Point(5,-112)),text:'The former Terminal 3 car park closed for redevelopment in July 2026. GACL directs motorists to its parking annex and on-site attendants. Keep the public approach and departure ramp clear. The north/CIP parking annex is available on the city map. Its visitor guide explains the three approach options and two exit routes.'}];
export const airportWorksColliders=()=>[{id:'t3:closed-car-park',rings:[T3_WORKS_RING],minHeight:0,height:T3_WORKS.height,noDoor:true}];
