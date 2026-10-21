import {T3_PUBLIC_ARRIVAL,airportWorksColliders} from './airport-access-data.js';
import {AIRPORT_T3,t3Point,t3Rect,t3Local} from './airport-t3-space.js';
import {T3_RINGS} from './airport-t3-map.js';
import {t3RailColliders} from './airport-t3-roads.js';
import {distanceMetres,bearingTo} from './motion.js';
export {AIRPORT_T3,t3Point,t3Local};
export const T3_ARRIVAL=T3_PUBLIC_ARRIVAL;
export const T3_PLACE={id:AIRPORT_T3.id,name:AIRPORT_T3.name,aliases:['Terminal 3','Accra airport Terminal 3','Kotoka International Airport Terminal 3','Accra International Airport Terminal 3'],lng:T3_ARRIVAL[0],lat:T3_ARRIVAL[1],area:'Accra airport · public forecourt',type:'airport',emoji:'✈️',description:'Explore Terminal 3’s sweeping roof, glazed facade, covered arrivals waiting area and airport forecourt.',activities:['stroll','explore','connect']};
const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const isAirportT3=p=>p?.id===T3_PLACE.id||[T3_PLACE.name,...T3_PLACE.aliases].some(n=>normalize(n)===normalize(p?.name));
export const T3_SEATS=[{id:'arrivals-west',x:-8,z:-42},{id:'arrivals-east',x:25,z:-42},{id:'parking',x:1,z:-95.5}];
export const T3_SUPPORTS=[-60,-20,20,60].map((x,i)=>({id:'deck-column-'+i,x,z:-76.3,w:1.1,d:1.1,h:5.7}));
export const T3_CARS=[]; // The former open parking facility is closed in 2026.
export function airportT3Colliders(){return [
 ...airportWorksColliders(),
 {id:'t3:main-terminal',rings:[T3_RINGS[1197119150]],minHeight:0,height:17.5,noDoor:true},
 {id:'t3:arrivals-roof',rings:[T3_RINGS[2420073752]],minHeight:5.55,height:17.5,noDoor:true},
 ...[2676037408,2676037410,2676037412,2676037414,2676037416,2676037418].map(id=>({id:'t3:jetbridge-'+id,rings:[T3_RINGS[id]],minHeight:4.8,height:8.4,noDoor:true})),
 ...[2420018458,2420018460].map(id=>({id:'t3:parking-shade-'+id,rings:[T3_RINGS[id]],minHeight:3.4,height:3.65,noDoor:true})),
 ...T3_SUPPORTS.map(p=>({id:'t3:'+p.id,rings:[t3Rect(p.x,p.z,p.w,p.d)],minHeight:0,height:p.h,noDoor:true})),
 ...T3_SEATS.map(p=>({id:'t3:seat-'+p.id,rings:[t3Rect(p.x,p.z,3,.7)],minHeight:0,height:1,noDoor:true})),
 ...T3_CARS.map((p,i)=>({id:'t3:parked-'+i,rings:[t3Rect(p.x,p.z,2.2,5.2)],minHeight:0,height:2.4,noDoor:true})),
 ...[-29,42].flatMap(x=>[-54,-28].map(z=>({id:`t3:arrivals-post-${x}:${z}`,rings:[t3Rect(x,z,.7,.7)],minHeight:0,height:5.7,noDoor:true}))),
 ...t3RailColliders(),
 ];}
export const T3_ACTIVITIES=[
 {id:'airport-t3-photo',kind:'photo',label:'Photograph airport Terminal 3',position:T3_ARRIVAL,target:t3Point(10,-20),elevation:0,heading:bearingTo(T3_ARRIVAL,t3Point(10,-20))},
 {id:'airport-t3-guide',kind:'watch',label:'Read the airport visitor guide',position:t3Point(34,-95),elevation:0,heading:90-AIRPORT_T3.rotation,text:'Akwaaba! Use the public approach to the covered arrivals waiting area. The former car park is closed for redevelopment; keep out of the screened zone. Find a seat or meet other players here. The departure road is elevated; use a vehicle and return to ground level before exiting. This is a game reconstruction: flight boards and services are not live airport information.'},
 ...T3_SEATS.map(p=>({id:'airport-t3-seat-'+p.id,kind:'sit',label:p.id==='parking'?'Sit beside the public terminal approach':'Wait in the covered arrivals area',position:t3Point(p.x,p.z-1.2),seatPosition:t3Point(p.x,p.z),elevation:0,heading:360-AIRPORT_T3.rotation,offset:-.45})),
];
export const nearAirportT3=p=>distanceMetres(p,AIRPORT_T3.position)<245;
export function airportT3People(seconds,position,minute=720){
 if(!nearAirportT3(position))return null;const phase=seconds*.85%88,x=-17+(phase<44?phase:88-phase),seat=T3_SEATS[0];
 return [{id:'airport-t3-traveller',name:'Kweku',avatar:'👨🏾',position:t3Point(x,-34),heading:(90-AIRPORT_T3.rotation+(phase<44?0:180)+360)%360,speed:.85,moving:true,elevation:0},
 {id:'airport-t3-waiting',name:'Akua',avatar:'👩🏾',position:t3Point(seat.x,seat.z),heading:360-AIRPORT_T3.rotation,speed:0,moving:false,elevation:0,action:'sit',poseOffset:-.45},
 {id:'airport-t3-greeter',name:'Nana',avatar:'👨🏾',position:t3Point(35,-48),heading:270-AIRPORT_T3.rotation,speed:0,moving:false,elevation:0,action:'watch'}];
}
