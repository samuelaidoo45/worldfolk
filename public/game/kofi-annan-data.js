import {offsetMetres,distanceMetres,bearingTo} from './motion.js';
import {KOFI_RINGS} from './kofi-annan-map.js';

// Mapped outer outlines, photo-estimated heights. Do not treat these as surveys.
export const KOFI_SITES=[
 {id:'octavia-154',name:'Octavia 154',aliases:['Octavia'],position:[-.18007,5.61929],width:60,depth:60,height:26.2,sourceIds:[2514066478],family:'octavia',arrival:[-.18003,5.61908],target:[-.18006,5.61927],emoji:'🏙️',type:'apartments',description:'Explore the white balcony frames, glazed ground floor and rooftop pool silhouette of Octavia 154.'},
 {id:'airport-womens-hospital',name:"Airport Women’s Hospital",aliases:['Airport Womens Hospital','Airport Women Hospital'],position:[-.17886,5.61778],width:42,depth:55,height:8.2,sourceIds:[2518616880],family:'hospital',arrival:[-.17904,5.61756],target:[-.17888,5.61772],emoji:'🏥',type:'hospital',description:'Visit the hospital forecourt, red-roofed entrance and blue-grey clinical block on Kofi Annan Street.'},
 {id:'kwarleyz-residence',name:'Kwarleyz Residence',position:[-.17820,5.61772],width:55,depth:75,height:28.8,sourceIds:[1388256660],family:'kwarleyz',arrival:[-.17817,5.61737],target:[-.17817,5.61765],emoji:'🏨',type:'hotel',description:'Explore Kwarleyz’s dark curtain wall, stone-clad stepped wings and palm-lined approach.'},
];
export const kofiLocal=(s,p)=>[(p[0]-s.position[0])*111320*Math.cos(s.position[1]*Math.PI/180),(s.position[1]-p[1])*111320];
export const kofiPoint=(s,x,z)=>offsetMetres(s.position,x,-z);
export const kofiRect=(s,x,z,w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>kofiPoint(s,x+dx,z+dz));
const normalName=v=>String(v||'').toLowerCase().replace(/[’']/g,'').replace(/\s+/g,' ').trim();
export const kofiForPlace=p=>KOFI_SITES.find(s=>s.id===p?.id||[s.name,...(s.aliases||[])].some(n=>normalName(n)===normalName(p?.name)));
export const KOFI_PLACES=KOFI_SITES.map(s=>({id:s.id,name:s.name,aliases:s.aliases||[],lng:s.arrival[0],lat:s.arrival[1],area:'Airport Residential / Kofi Annan Street',type:s.type,category:s.type,emoji:s.emoji,description:s.description,activities:['stroll','explore','connect']}));
function clip(ring,axis,value,less){
 const points=ring.slice(0,-1),out=[],inside=p=>less?p[axis]<=value:p[axis]>=value;
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib){const t=(value-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,j)=>v+(b[j]-v)*t));}}
 return out.length?[...out,out[0]]:[];
}
export const KOFI_MASSES=KOFI_SITES.flatMap(s=>{
 const ring=KOFI_RINGS[s.sourceIds[0]],part=(id,ring,height)=>({id,siteId:s.id,ring,height});
 if(s.family==='hospital')return [part('clinic-rear',clip(ring,1,5.61778,false),7.2),part('clinic-entrance',clip(ring,1,5.61778,true),3.3)];
 if(s.family==='kwarleyz'){
  const front=clip(ring,1,5.61770,true),rear=clip(ring,1,5.61770,false);
  return [part('hotel-tower',front,27.2),part('hotel-mid-wing',clip(rear,0,-.17820,false),18),part('hotel-low-wing',clip(rear,0,-.17820,true),9.6)];
 }
 const points=ring.slice(0,-1),cx=points.reduce((n,p)=>n+p[0],0)/points.length,cy=points.reduce((n,p)=>n+p[1],0)/points.length;
 const inset=scale=>ring.map(([x,y])=>[cx+(x-cx)*scale,cy+(y-cy)*scale]);
 return [part('octavia-ground',ring,4.2),{...part('octavia-main',inset(.78),18),minHeight:4.2},{...part('octavia-penthouse',inset(.58),21.6),minHeight:18}];
});
// Small public approach furniture; never build a wall across the mapped streets.
export const KOFI_SEATS={
 'octavia-154':[-.18010,5.61904],
 'airport-womens-hospital':[-.17904,5.61764],
 'kwarleyz-residence':[-.17831,5.61738],
};
export const kofiColliders=s=>KOFI_MASSES.filter(b=>b.siteId===s.id).map(b=>({id:`kofi:${b.id}`,rings:[b.ring],height:b.height,minHeight:b.minHeight||0,noDoor:true})).concat([{id:`kofi:${s.id}:bench`,rings:[kofiRect(s,...kofiLocal(s,KOFI_SEATS[s.id]),2.2,.65)],height:.95,noDoor:true}],s.family==='kwarleyz'?[...[-4,16].map((x,i)=>({id:`kofi:canopy-post-${i}`,rings:[kofiRect(s,x,33.6,.65,.65)],height:3.65,noDoor:true})),{id:'kofi:canopy',rings:[kofiRect(s,6,32.7,21.5,3.8)],minHeight:3.625,height:3.975,noDoor:true}]:[]);
export const KOFI_ACTIVITIES=KOFI_SITES.flatMap(s=>[
 {id:`kofi:${s.id}:photo`,kind:'photo',label:`Photograph ${s.name}`,position:s.arrival,target:s.target,elevation:0,heading:bearingTo(s.arrival,s.target)},
 {id:`kofi:${s.id}:seat`,kind:'sit',label:s.family==='hospital'?'Wait outside the hospital':`Sit outside ${s.name}`,position:offsetMetres(KOFI_SEATS[s.id],0,-1.2),seatPosition:KOFI_SEATS[s.id],elevation:0,heading:180,offset:-.45},
]);
export const nearbyKofi=p=>KOFI_SITES.find(s=>distanceMetres(p,s.arrival)<35);
export function kofiPeople(seconds,position,minute=720){
 const s=nearbyKofi(position);if(!s)return null;
 const seat=KOFI_SEATS[s.id],phase=seconds*.7%8,step=phase<4?phase:8-phase;
 // Keep visitors on the short, clear forecourt strips, away from carriageways.
 const p=offsetMetres(s.arrival,s.family==='octavia'?-step:step,2);
 return [{id:`kofi:${s.id}:visitor`,name:s.family==='hospital'?'Akua':'Yaw',avatar:'👨🏾',position:p,elevation:0,heading:(phase<4?90:270)+(s.family==='octavia'?180:0),speed:.7,moving:true},...(minute>=360&&minute<1260?[{id:`kofi:${s.id}:waiting`,name:'Ama',avatar:'👩🏾',position:seat,elevation:0,heading:180,speed:0,moving:false,action:'sit',poseOffset:-.45}]:[])];
}
