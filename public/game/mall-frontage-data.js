import {offsetMetres,distanceMetres,projectOnSegment} from './motion.js';
import {TERMINAL_ROADS} from './mall-terminal-map.js';
// Photo-led trading frontage south of Spintex Road. Dated 2024-08 panoramas
// establish the physical character, not today's tenants or exact stall count.
export const MALL_FRONTAGE={id:'mall-spintex-frontage',name:'Accra Mall · Spintex roadside shops',position:[-.17405,5.62080],width:112,depth:30,height:9.5};
export const frontagePoint=(x,z)=>offsetMetres(MALL_FRONTAGE.position,x,-z);
export const frontageLocal=p=>[(p[0]-MALL_FRONTAGE.position[0])*111320*Math.cos(MALL_FRONTAGE.position[1]*Math.PI/180),(MALL_FRONTAGE.position[1]-p[1])*111320];
export const FRONTAGE_STALLS=[
 {x:-43,w:7.2,kind:'rack',color:0}, {x:-34,w:7.8,kind:'umbrella',color:2},
 {x:-25,w:5.4,kind:'kiosk',color:3}, {x:-16,w:7.8,kind:'rack',color:1},
 {x:-7,w:7.2,kind:'awning',color:0}, {x:3,w:6.5,kind:'umbrella',color:1},
 {x:12,w:5.8,kind:'kiosk',color:4}, {x:22,w:8.2,kind:'rack',color:2},
 {x:32,w:7.4,kind:'awning',color:3}, {x:42,w:6.8,kind:'umbrella',color:0}
];
export const FRONTAGE_PLACE={id:'mall-roadside-shops',name:'Accra Mall roadside shops',lng:frontagePoint(-16,-4.5)[0],lat:frontagePoint(-16,-4.5)[1],type:'shop',category:'shop',emoji:'🛍️',area:'Accra Mall · Spintex Road',description:'Explore the covered roadside stalls, meet traders, buy supplies and earn cedis on a vendor shift.',activities:['stroll','connect']};
export const FRONTAGE_STOCK=['water','trainers'];
export const isMallFrontage=p=>p?.id===MALL_FRONTAGE.id||p?.id===FRONTAGE_PLACE.id||/^accra mall (roadside shops|outside shops|vendor frontage)$/i.test(p?.name||'');
export const FRONTAGE_ARRIVAL=frontagePoint(-16,-3.7);
export const frontageRange=p=>{const [x,z]=frontageLocal(p);return Math.abs(x)<54&&z> -8&&z<5;};
export function atFrontageCounter(p){return !!p&&!p.driving&&Number.isFinite(p.pos_lng)&&Number.isFinite(p.pos_lat)&&distanceMetres([p.pos_lng,p.pos_lat],[FRONTAGE_PLACE.lng,FRONTAGE_PLACE.lat])<22;}
export const FRONTAGE_ACTIVITIES=[
 {id:'frontage-shop',kind:'frontage-shop',label:'Shop at the roadside counter',position:frontagePoint(-16,-3),heading:180,elevation:0},
 {id:'frontage-work',kind:'frontage-work',label:'Work a roadside vendor shift',position:frontagePoint(-7,-3),heading:180,elevation:0},
 {id:'frontage-chat',kind:'watch',label:'Talk to the traders',position:frontagePoint(22,-3),heading:180,elevation:0,text:'Akwaaba! Browse the stalls from the pavement. The seller desk has paid game shifts; the terminal entrance is at the east end.'}
];
// Barrier centres follow the actual curved Spintex alignment. Gaps preserve
// pedestrian entry; stop before the terminal's eastern access road.
const road=TERMINAL_ROADS.find(r=>r.id===5032504).coordinates;
// OSM service way 1337970093 separates the pitches from the main carriageway.
export const FRONTAGE_SERVICE_ROAD=[[-.1733935,5.6209591],[-.173606,5.6209094],[-.1737817,5.620892],[-.173956,5.6208987],[-.174239,5.6209468],[-.1744227,5.6210082],[-.1744737,5.6210789]];
const nearest=(p,line)=>line.slice(1).map((b,i)=>projectOnSegment(p,line[i],b)).sort((a,b)=>a.distance-b.distance)[0];
export const FRONTAGE_BARRIERS=Array.from({length:22},(_,i)=>-51+i*4.6).filter((x,i)=>![6,7,16,17].includes(i)).map(x=>{
 const main=nearest(frontagePoint(x,-20),road).position,service=nearest(main,FRONTAGE_SERVICE_ROAD),d=service.distance;
 // Stay between both mapped road edges, never down the service lane itself.
 const widthGap=d-4.5-2.5;if(widthGap<1.5)return null;
 const u=(4.5+widthGap/2)/d,p=main.map((v,j)=>v+(service.position[j]-v)*u),[bx,z]=frontageLocal(p);
 return {x:bx,z};
}).filter(Boolean).filter(b=>[-1.2,1.2].every(dx=>[-.31,.31].every(dz=>{
 const p=frontagePoint(b.x+dx,b.z+dz);return nearest(p,road).distance>4.8&&nearest(p,FRONTAGE_SERVICE_ROAD).distance>2.8;
})));
export const FRONTAGE_BOARDS=[{x:-39,w:9,h:3.2,y:5.7},{x:-12,w:4.2,h:6.1,y:6.1},{x:13,w:8.2,h:3.8,y:5.9},{x:38,w:4.4,h:5.8,y:6.2}];
export function frontageStructures(){return [
 ...FRONTAGE_STALLS.flatMap((s,i)=>[
  {id:`stall-${i}-back`,x:s.x,z:1.5,w:s.w,d:.12,h:2.5},
  ...[-s.w/2,s.w/2].map((dx,j)=>({id:`stall-${i}-post-${j}`,x:s.x+dx,z:-1.8,w:.09,d:.09,h:2.6})),
  {id:`stall-${i}-counter`,x:s.x,z:0,w:s.w-1.4,d:.7,h:.9},
  ...(s.kind==='kiosk'?[{id:`stall-${i}-left`,x:s.x-s.w/2,z:0,w:.1,d:3,h:2.5},{id:`stall-${i}-right`,x:s.x+s.w/2,z:0,w:.1,d:3,h:2.5}]:[])
 ]),
 ...FRONTAGE_BOARDS.flatMap((b,i)=>[-b.w*.35,b.w*.35].map((dx,j)=>({id:`board-${i}-post-${j}`,x:b.x+dx,z:2.5,w:.16,d:.16,h:b.y+b.h/2}))),
 ...Array.from({length:8},(_,i)=>({id:'frame-post-'+i,x:-32+i*8,z:5.3,w:.13,d:.13,h:4.6})),
 ...FRONTAGE_BARRIERS.map((b,i)=>({id:'barrier-'+i,...b,w:2.4,d:.62,h:.65}))
];}
export const frontageColliders=()=>frontageStructures().map(s=>({id:MALL_FRONTAGE.id+':'+s.id,height:s.h,noDoor:true,rings:[[[-s.w/2,-s.d/2],[s.w/2,-s.d/2],[s.w/2,s.d/2],[-s.w/2,s.d/2],[-s.w/2,-s.d/2]].map(([x,z])=>frontagePoint(s.x+x,s.z+z))]}));
export function frontagePeople(seconds,minute=720){const open=minute>=360&&minute<1260;if(!open)return [];
 const vendors=[1,3,5,7].map((i,j)=>({id:'frontage-trader-'+i,name:['Adwoa','Kwesi','Akos','Yaw'][j],avatar:j%2?'👨🏾':'👩🏾',position:frontagePoint(FRONTAGE_STALLS[i].x,.9),heading:0,moving:false,speed:0,elevation:0,action:'watch'}));
 for(let i=0;i<3;i++){const length=80,phase=(seconds*.7+i*23)%(length*2),forward=phase<length;vendors.push({id:'frontage-shopper-'+i,name:['Esi','Kojo','Ama'][i],avatar:i%2?'👨🏾':'👩🏾',position:frontagePoint(-40+(forward?phase:length*2-phase),-6.1+i*.8),heading:forward?90:270,moving:true,speed:.7,elevation:0});}return vendors;
}
