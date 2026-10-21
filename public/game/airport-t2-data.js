import {offsetMetres,distanceMetres,bearingTo} from './motion.js';
import {T2_RINGS} from './airport-t2-map.js';
// Horizontal outlines are native OSM. Heights and current work-screen extent
// are interpretations; see docs/realism/airport-terminal-2.md.
export const AIRPORT_T2={id:'accra-airport-terminal-2',name:'Accra International Airport · Terminal 2',position:[-.1719,5.6069],rotation:67.4,width:285,depth:240,height:13,sourceIds:[738854676,738854674,1159898176]};
const angle=AIRPORT_T2.rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
export const t2Point=(x,z)=>offsetMetres(AIRPORT_T2.position,x*c+z*s,x*s-z*c);
export const t2Local=p=>{const e=(p[0]-AIRPORT_T2.position[0])*111320*Math.cos(AIRPORT_T2.position[1]*Math.PI/180),n=(p[1]-AIRPORT_T2.position[1])*111320;return [e*c+n*s,e*s-n*c];};
export const t2World=p=>[(p[0]-AIRPORT_T2.position[0])*111320*Math.cos(AIRPORT_T2.position[1]*Math.PI/180),(AIRPORT_T2.position[1]-p[1])*111320];
export const t2Rect=(x,z,w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>t2Point(x+dx,z+dz));
export const T2_ARRIVAL=t2Point(-47,8);
export const T2_PLACE={id:AIRPORT_T2.id,name:AIRPORT_T2.name,aliases:['Terminal 2','Terminal 2Domestic Departures','Terminal 2 Domestic Departures','Domestic Arrivals','Accra airport domestic terminal','Kotoka Terminal 2','Kotoka International Airport Terminal 2','Accra International Airport Terminal 2'],lng:T2_ARRIVAL[0],lat:T2_ARRIVAL[1],area:'Accra airport · domestic terminal',type:'airport',emoji:'🛬',description:'Explore the Terminal 2 public approach, shaded waiting area and separate glazed domestic arrivals hall.',activities:['stroll','explore','connect']};
const normalize=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const isAirportT2=p=>{
 if(p?.id===T2_PLACE.id)return true;
 if(![T2_PLACE.name,...T2_PLACE.aliases].some(n=>normalize(n)===normalize(p?.name)))return false;
 const position=p.position||[p.lng,p.lat];
 return !position.every(Number.isFinite)||distanceMetres(position,AIRPORT_T2.position)<350;
};
export const T2_SEATS=[{id:'west',x:-62,z:13},{id:'east',x:9,z:17}];
export const T2_POSTS=[-76,-56,-36,-16,4,24,44].map(x=>({x,z:13,w:.18,d:.18,height:3.65}));
export const T2_SCREENS=[{x:83.5,z:5.5,w:57,d:.35,height:2.4},{x:55,z:12,w:.35,d:13,height:2.4}];
export const T2_CANOPIES=[{x:-16,z:14.2,w:132,d:8.5,y:3.8},{x:84,z:.5,w:56,d:7,y:3.8}];
export const airportT2Colliders=()=>[
 ...[738854676,738854674].map(id=>({id:'t2:terminal-'+id,rings:[T2_RINGS[id]],minHeight:0,height:id===738854676?11.8:10.3,noDoor:true})),
 {id:'t2:east-wing',rings:[T2_RINGS[1159898176]],minHeight:0,height:8.8,noDoor:true},
 ...T2_CANOPIES.map((p,i)=>({id:'t2:canopy-'+i,rings:[t2Rect(p.x,p.z,p.w,p.d)],minHeight:p.y-.15,height:p.y+.15,noDoor:true})),
 ...T2_POSTS.map((p,i)=>({id:'t2:post-'+i,rings:[t2Rect(p.x,p.z,p.w,p.d)],minHeight:0,height:p.height,noDoor:true})),
 ...T2_SEATS.map(p=>({id:'t2:seat-'+p.id,rings:[t2Rect(p.x,p.z,3,.7)],minHeight:0,height:1,noDoor:true})),
 ...[[-20,17,.55,.55,1.1],[17,17,.55,.55,1.1],...[-66,-6,35].map(x=>[x,7.4,.7,1.4,.6]),...[-73,-71.8,-70.6].map(x=>[x,16.4,.8,1,1.1])].map(([x,z,w,d,height],i)=>({id:'t2:furniture-'+i,rings:[t2Rect(x,z,w,d)],minHeight:0,height,noDoor:true})),
 ...T2_SCREENS.map((p,i)=>({id:'t2:works-screen-'+i,rings:[t2Rect(p.x,p.z,p.w,p.d)],minHeight:0,height:p.height,noDoor:true})),
];
export const T2_ACTIVITIES=[
 {id:'airport-t2-photo',kind:'photo',label:'Photograph airport Terminal 2',position:T2_ARRIVAL,target:t2Point(-20,35),elevation:0,heading:bearingTo(T2_ARRIVAL,t2Point(-20,35))},
 {id:'airport-t2-arrivals-photo',kind:'photo',label:'Photograph the domestic arrivals hall',position:t2Point(12,-19),target:t2Point(50,-35),elevation:0,heading:bearingTo(t2Point(12,-19),t2Point(50,-35))},
 {id:'airport-t2-guide',kind:'watch',label:'Read the Terminal 2 visitor guide',position:t2Point(-15,10),target:t2Point(-15,18),elevation:0,text:'Akwaaba to Terminal 2. Meet friends and wait under the entrance shade. The separate glazed hall serves the domestic arrivals side. Renovation is ongoing in 2026; the screened area is closed in this reconstruction. Use the city map to visit Terminal 3. Flight information, tickets and airport services are not live.'},
 ...T2_SEATS.map(p=>({id:'airport-t2-seat-'+p.id,kind:'sit',label:'Wait outside Terminal 2',position:t2Point(p.x,p.z-1.2),seatPosition:t2Point(p.x,p.z),elevation:0,heading:360-AIRPORT_T2.rotation,offset:-.45})),
];
export const nearAirportT2=p=>distanceMetres(p,t2Point(0,0))<165;
export function airportT2People(seconds,position){
 if(!nearAirportT2(position))return null;const phase=seconds*.7%40,x=-48+(phase<20?phase:40-phase),p=t2Point(x,10.3),seat=T2_SEATS[0];
 return [{id:'airport-t2-traveller',name:'Adwoa',avatar:'👩🏾',position:p,heading:bearingTo(p,t2Point(x+(phase<20?1:-1),10.3)),moving:true,speed:.7,elevation:0},
 {id:'airport-t2-waiting',name:'Kojo',avatar:'👨🏾',position:t2Point(seat.x,seat.z),heading:360-AIRPORT_T2.rotation,moving:false,speed:0,elevation:0,action:'sit',poseOffset:-.45},
 {id:'airport-t2-greeter',name:'Esi',avatar:'👩🏾',position:t2Point(-5,13),heading:360-AIRPORT_T2.rotation,moving:false,speed:0,elevation:0,action:'watch'}];
}
