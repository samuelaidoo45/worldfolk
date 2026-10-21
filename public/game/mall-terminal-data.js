import {offsetMetres,distanceMetres,bearingTo} from './motion.js';
import {TERMINAL_BOUNDARY,TERMINAL_ROADS} from './mall-terminal-map.js';
export const MALL_TERMINAL={id:'accra-mall-terminal',name:'Accra Mall trotro terminal',position:[-.17318610374680649,5.6199791],rotation:0,width:82,depth:92,height:4.4};
export const terminalPoint=(x,z)=>offsetMetres(MALL_TERMINAL.position,x,-z);
export const terminalLocal=p=>[(p[0]-MALL_TERMINAL.position[0])*111320*Math.cos(MALL_TERMINAL.position[1]*Math.PI/180),(MALL_TERMINAL.position[1]-p[1])*111320];
export const TERMINAL_ARRIVAL=terminalPoint(18,-25);
export const TERMINAL_PLACE={id:'g_-1732_56200',name:'Accra Mall Bus Terminal',lng:MALL_TERMINAL.position[0],lat:MALL_TERMINAL.position[1],area:'Accra Mall · Spintex Road',type:'bus station',emoji:'🚐',description:'Explore the southern mall terminal, wait under the shelter, speak to a mate, board a tro-tro or start a driving shift. Services and fares are part of the game.',activities:['stroll','connect']};
export const isMallTerminal=p=>p?.id===MALL_TERMINAL.id||p?.id===TERMINAL_PLACE.id||/^accra mall (bus |trotro |tro-tro )?(terminal|station)$/i.test(p?.name||'');
// These are Worldfolk services, not claims about real station destinations or fares.
export const TERMINAL_SERVICES=[
 {id:'airport',name:'Airport City',place:'airport',destination:[-.1787,5.6093],bay:1,z:-35,color:0xc6c4b7},
 {id:'legon',name:'University of Ghana',place:'legon',destination:[-.1874,5.651],bay:2,z:-22,color:0xb2bdc0},
 {id:'osu',name:'Oxford Street · Osu',place:'osu',destination:[-.1819,5.5598],bay:3,z:-9,color:0xd1b777}
].map(s=>({...s,vehicle:'minibus',vehiclePosition:terminalPoint(8,s.z),platform:terminalPoint(14.5,s.z)}));
export const TERMINAL_SHELTER={x:24,z:-40,w:15,d:8,h:3.35};
export const TERMINAL_WORK_POSITION=terminalPoint(19,-49);
export const TERMINAL_WORK_CAR=terminalPoint(5,-50);
export const TERMINAL_SEATS=[-44,-40,-36].map((z,i)=>({id:'terminal-seat-'+i,kind:'sit',label:'Sit in the terminal waiting area',position:terminalPoint(23,z+.85),seatPosition:terminalPoint(23,z),elevation:0,heading:180,offset:-.44}));
export const TERMINAL_ACTIVITIES=[...TERMINAL_SERVICES.map(s=>({id:'terminal-board-'+s.id,kind:'terminal-board',label:`Board bay ${s.bay} · ${s.name}`,serviceId:s.id,position:s.platform,elevation:0,heading:270})),...TERMINAL_SEATS,
 {id:'terminal-work',kind:'terminal-work',label:'Work as a mall terminal tro-tro driver',position:TERMINAL_WORK_POSITION,elevation:0,heading:0},
 {id:'terminal-mate',kind:'watch',label:'Speak to the terminal mate',position:terminalPoint(19,-16),elevation:0,heading:270,text:'Mate · NPC: Akwaaba! Choose a marked bay to board a game service. You can watch the road from outside, chat during the ride, or skip to arrival. The driver desk has paid shifts.'}
];
export const TERMINAL_INTERNAL_ROAD_IDS=new Set([300519835,1052595503,1213211330,1213211333]);
export const TERMINAL_APPROACH=TERMINAL_ROADS.find(r=>r.id===300519835).coordinates;
export function terminalDeparture(service){
 // Pull out north of the parked row, then join the mapped western access road.
 // The short yard connector is authored gameplay circulation inside the mapped site.
 const yard=[[8,service.z],[8,service.z-4],[6,service.z-7],[2,service.z-9],[0,-43],[-3,-47],[-9,-49],[-15,-47],[-19,-43]].map(p=>terminalPoint(...p));
 // Follow actual service-road vertices back to the Spintex Road junction.
 const road=TERMINAL_APPROACH.slice(0,4).reverse();
 return [...yard,...road];
}
export function insideTerminal(position){const [x,z]=terminalLocal(position),ring=TERMINAL_BOUNDARY.map(terminalLocal);let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>z)!==(b[1]>z)&&x<(b[0]-a[0])*(z-a[1])/(b[1]-a[1])+a[0])inside=!inside}return inside;}
export function terminalStructures(){const s=TERMINAL_SHELTER;return [
 ...[-1,1].flatMap(side=>[-1,1].map(end=>({id:`terminal-post-${side}-${end}`,x:s.x+side*(s.w/2-.25),z:s.z+end*(s.d/2-.25),w:.16,d:.16,h:s.h}))),
 ...[-44,-40,-36].map((z,i)=>({id:'terminal-bench-'+i,x:23,z,w:3.4,d:.5,h:.46})),
 ...TERMINAL_SERVICES.map(s=>({id:'terminal-bay-post-'+s.id,x:12.5,z:s.z-3.6,w:.08,d:.08,h:2.65})),
 {id:'terminal-board-post',x:29,z:-26,w:.13,d:.13,h:2.55}
];}
function boxRing(x,z,w,d){return [[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2],[x-w/2,z-d/2]].map(p=>terminalPoint(...p))}
export function terminalColliders(context={}){return [
 ...terminalStructures().map(s=>({id:s.id,rings:[boxRing(s.x,s.z,s.w,s.d)],height:s.h,noDoor:true})),
 ...TERMINAL_SERVICES.filter(s=>!(context.transit?.terminalId===MALL_TERMINAL.id&&context.transit.serviceId===s.id)).map(s=>({id:'terminal-parked-'+s.id,rings:[boxRing(8,s.z,1.98,5.25)],height:2.2,noDoor:true}))
];}
export const terminalBoardingPoint=(position,service)=>distanceMetres(position,service.platform)<=6;
export function terminalPeople(seconds,minute=720,transit=null){
 const day=minute>=300&&minute<1320,names=['Ama','Kojo','Esi','Yaw','Abena','Kwesi'],people=[];
 for(const [i,s] of TERMINAL_SERVICES.entries()){
  if(transit?.terminalId===MALL_TERMINAL.id&&transit.serviceId===s.id)continue;
  for(let j=0;j<(day?3:1);j++)people.push({id:`terminal-queue-${i}-${j}`,name:names[(i+j)%names.length],avatar:j%2?'👩🏾':'👨🏾',position:terminalPoint(17.5+j*.8,s.z+2.4+j*1.2),heading:270,moving:false,speed:0,elevation:0,action:'watch'});
 }
 people.push({id:'terminal-mate',name:'Kofi · mate',avatar:'👨🏾',position:terminalPoint(20,-16),heading:270,moving:false,speed:0,elevation:0,action:'speak'});
 if(day){people.push({id:'terminal-driver',name:'Yaw · driver',avatar:'👨🏾',position:terminalPoint(20,-51),heading:180,moving:false,speed:0,elevation:0});
  const phase=seconds%58,u=phase<29?phase:58-phase,p=terminalPoint(32,-49+u*.9);people.push({id:'terminal-walker',name:'Adwoa',avatar:'👩🏾',position:p,heading:phase<29?180:0,moving:true,speed:.9,elevation:0});
  const s=TERMINAL_SEATS[1];people.push({id:'terminal-seated',name:'Nana',avatar:'👨🏾',position:s.seatPosition,heading:s.heading,moving:false,speed:0,elevation:0,action:'sit',poseOffset:s.offset});
 }return people;
}
