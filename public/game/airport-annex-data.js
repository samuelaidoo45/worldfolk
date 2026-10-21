import {offsetMetres,distanceMetres,bearingTo} from './motion.js';
// GACL's 2026 directional video establishes three entry approaches / two exits.
// The user confirmed the north/CIP parcel. This is a bounded, playable sample:
// bay count, perimeter and gate offsets are estimates, not a surveyed car park.
export const AIRPORT_ANNEX={id:'airport-t3-parking-annex',name:'Terminal 3 parking annex · CIP approach',position:[-.17235,5.60472],rotation:0,width:120,depth:120,height:5,sourceIds:[]};
export const annexPoint=(x,z)=>offsetMetres(AIRPORT_ANNEX.position,x,-z);
export const annexLocal=p=>[(p[0]-AIRPORT_ANNEX.position[0])*111320*Math.cos(AIRPORT_ANNEX.position[1]*Math.PI/180),(AIRPORT_ANNEX.position[1]-p[1])*111320];
export const annexRect=(x,z,w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([a,b])=>annexPoint(x+a,z+b));
export const ANNEX_RING=annexRect(0,0,36,34);
export const ANNEX_ARRIVAL=annexPoint(9,14.5);
export const ANNEX_PLACE={id:AIRPORT_ANNEX.id,name:AIRPORT_ANNEX.name,aliases:['Terminal 3 parking annex','Airport car park annex','CIP parking annex'],lng:ANNEX_ARRIVAL[0],lat:ANNEX_ARRIVAL[1],type:'parking',category:'transport',emoji:'🅿️',area:'Airport · north of Terminal 3',description:'Visit the north/CIP parking approach, ticket gates, marked bays and waiting pavement. The former Terminal 3 car park is closed.',activities:['explore','connect']};
export const ANNEX_GATES=[
 {id:'ramp',label:'ENTRY · RAMP APPROACH',x:-18,z:0,heading:90,connection:[-.1726055,5.6048519],exits:true},
 {id:'cip',label:'CIP ENTRY',x:18,z:0,heading:270,connection:[-.1719182,5.6048353],exits:true},
 {id:'south',label:'ENTRY · SOUTH APPROACH',x:0,z:17,heading:0,connection:[-.1723561,5.6044362],exits:false},
];
export const ANNEX_BAYS=[-9,9].flatMap(z=>[-14,-11.2,-8.4,-5.6,5.6,8.4,11.2,14].map(x=>({x,z,width:2.7,depth:5.2,heading:z<0?180:0})));
export const ANNEX_CARS=ANNEX_BAYS.filter((_,i)=>i%3!==1).map((p,i)=>({...p,kind:i%4===0?'suv':'car',color:['#28485a','#d4d7d2','#42474a','#8e403b','#a1a7aa'][i%5]}));
export const ANNEX_FURNITURE=[
 {id:'booth-west',x:-15,z:-3.8,w:2.1,d:2.2,h:2.6},
 {id:'booth-east',x:15,z:3.8,w:2.1,d:2.2,h:2.6},
 {id:'ticket-west',x:-17,z:-2.3,w:.55,d:.55,h:1.35},
 {id:'ticket-east',x:17,z:2.3,w:.55,d:.55,h:1.35},
 {id:'ticket-south',x:2.2,z:16,w:.55,d:.55,h:1.35},
 {id:'seat',x:10,z:16,w:3,d:.65,h:1},
 {id:'guide',x:13.5,z:16,w:1.8,d:.15,h:2.1},
];
export const ANNEX_ACTIVITIES=[
 {id:'airport-annex-guide',kind:'watch',label:'Read the parking annex guide',position:annexPoint(13.5,14.7),target:annexPoint(13.5,16),elevation:0,heading:180,text:'GACL’s directional video shows three entry approaches: beneath the departure-road structure, from Aviation Social Center / Silver Star Towers, and from Airport Shell Roundabout through CIP. There are two exit routes, including CIP. This game models a small north/CIP parking area; follow the arrows, leave the aisles clear and use the waiting pavement. The old Terminal 3 car park is closed. Airport staff and on-site signs take priority in real life.'},
 {id:'airport-annex-seat',kind:'sit',label:'Sit at the parking annex',position:ANNEX_ARRIVAL,seatPosition:annexPoint(10,16),elevation:0,heading:0,offset:-.45},
];
export const annexArrival=p=>p?.id===ANNEX_PLACE.id?{position:[...ANNEX_ARRIVAL],target:AIRPORT_ANNEX.position,cameraPitch:18,hint:'Parking annex · north/CIP approach. E sits or opens the parking guide. Keep the marked aisles clear.'}:null;
export function annexColliders(){return [
 {id:'airport-annex:exit-wall',rings:[annexRect(0,-17.2,27,.18)],minHeight:0,height:1.65,noDoor:true},
 ...ANNEX_GATES.flatMap(g=>[-1,1].map(side=>{const a=g.heading*Math.PI/180;return {id:'airport-annex:gate-post-'+g.id+side,rings:[annexRect(g.x+side*3.4*Math.cos(a),g.z+side*3.4*Math.sin(a),.28,.28)],minHeight:0,height:3.7,noDoor:true};})),
 ...ANNEX_FURNITURE.map(p=>({id:'airport-annex:'+p.id,rings:[annexRect(p.x,p.z,p.w,p.d)],minHeight:0,height:p.h,noDoor:true})),
 ...ANNEX_CARS.map((p,i)=>({id:'airport-annex:parked-'+i,rings:[annexRect(p.x,p.z,2.05,4.8)],minHeight:0,height:2,noDoor:true})),
 ];}
export const nearAirportAnnex=p=>distanceMetres(p,AIRPORT_ANNEX.position)<65;
export function annexPeople(seconds,position){if(!nearAirportAnnex(position))return null;const t=seconds*.75%18,x=2+(t<9?t:18-t);return [
 {id:'airport-annex-attendant',name:'Adwoa',avatar:'👩🏾',position:annexPoint(14,5.6),heading:270,speed:0,moving:false,elevation:0,action:'watch'},
 {id:'airport-annex-waiting',name:'Kofi',avatar:'👨🏾',position:annexPoint(10,16),heading:0,speed:0,moving:false,elevation:0,action:'sit',poseOffset:-.45},
 {id:'airport-annex-visitor',name:'Esi',avatar:'👩🏾',position:annexPoint(x,-14.5),heading:t<9?90:270,speed:.75,moving:true,elevation:0},
 ];}
