import {offsetMetres,distanceMetres,bearingTo} from './motion.js';
import {BUSINESS_RINGS} from './airport-business-map.js';
export const BUSINESS_SITES=[
 {id:'accra-marriott',name:'Accra Marriott Hotel',family:'marriott',type:'hotel',emoji:'🏨',position:[-.1767,5.60494],width:190,depth:100,height:29,sourceIds:[801590616],aliases:['Marriott Accra Hotel','Accra Marriott','Accra Marriot Hotel'],arrival:[-.17675,5.60456],target:[-.17698,5.60492],seat:{x:-25,z:30},walk:{x:-17,z:40,length:6},guide:{x:-8,z:36.5},description:'Explore the Marriott’s cream-and-brown hotel wings, central entrance and public forecourt. Meet friends, take photos and relax outside.'},
 {id:'stanbic-heights',name:'Stanbic Heights',family:'stanbic',type:'office',emoji:'🏦',position:[-.1778,5.5993],width:170,depth:130,height:42,sourceIds:[687362746,687362748],aliases:['Icon House','Stanbic Heights Airport City'],arrival:offsetMetres([-.1778,5.5993],25,22),target:[-.17771,5.59935],seat:{x:31,z:-17},walk:{x:36,z:-18,length:5},guide:{x:21,z:-22},description:'See Stanbic Heights’ rounded office frontage, shaded windows and split steel roof. Meet friends and relax along the public approach.'},
 {id:'atlantic-tower',name:'Atlantic Tower',family:'atlantic',type:'office',emoji:'🏢',position:[-.17791,5.60288],width:100,depth:110,height:46,sourceIds:[801590622],aliases:['Atlantic Towers','Atlantic Tower Airport City','Atlantic Towers Ghana'],arrival:offsetMetres([-.17791,5.60288],-25,-4),target:[-.17792,5.60288],seat:{x:-26,z:6},walk:{x:-24,z:-12,length:4},guide:{x:-24,z:-6},description:'Visit Atlantic Tower’s blue-glass facade, pale office bands and entrance approach. Photograph the tower or take a seat nearby.'},
];
export const businessPoint=(s,x,z)=>offsetMetres(s.position,x,-z);
export const businessLocal=(s,p)=>[(p[0]-s.position[0])*111320*Math.cos(s.position[1]*Math.PI/180),(s.position[1]-p[1])*111320];
export const businessRing=(s,id)=>BUSINESS_RINGS[id].map(p=>businessLocal(s,p));
export const businessRect=(s,x,z,w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([a,b])=>businessPoint(s,x+a,z+b));
const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function businessForPlace(p){return BUSINESS_SITES.find(s=>typeof p==='string'?[s.name,...s.aliases].some(n=>norm(n)===norm(p)):p?.id===s.id||[s.name,...s.aliases].some(n=>norm(n)===norm(p?.name))&&Number.isFinite(p?.lng)&&Number.isFinite(p?.lat)&&distanceMetres([p.lng,p.lat],s.position)<180&&(s.family!=='atlantic'||p.lat<5.6032&&p.lng<-.1776));}
export const BUSINESS_PLACES=BUSINESS_SITES.map(s=>({id:s.id,name:s.name,lng:s.arrival[0],lat:s.arrival[1],type:s.type,emoji:s.emoji,area:'Airport City',aliases:s.aliases,description:s.description,activities:['stroll','connect']}));
export function businessColliders(s){return [
 ...s.sourceIds.map(id=>({id:'business:'+id,rings:[BUSINESS_RINGS[id]],minHeight:0,height:s.height,noDoor:true})),
 {id:'business:'+s.id+':seat',rings:[businessRect(s,s.seat.x,s.seat.z,2.6,.65)],minHeight:0,height:.95,noDoor:true},
 {id:'business:'+s.id+':guide',rings:[businessRect(s,s.guide.x+1.4,s.guide.z,1,.3)],minHeight:0,height:1,noDoor:true},
 ...(s.family==='stanbic'?[{id:'business:stanbic-rounded-front',rings:[[...Array.from({length:21},(_,j)=>{const a=Math.PI+j*Math.PI/20;return businessPoint(s,10+Math.cos(a)*16,2+Math.sin(a)*16)}),businessPoint(s,-6,2)]],minHeight:0,height:32,noDoor:true}]:[]),
 ...(s.family==='marriott'?[{id:'business:hotel-cylinder',rings:[[...Array.from({length:25},(_,i)=>{const a=i*Math.PI/12;return businessPoint(s,-32+Math.cos(a)*3.8,22+Math.sin(a)*3.8)})]],minHeight:0,height:28,noDoor:true},{id:'business:hotel-canopy',rings:[businessRect(s,-32,25,15,9)],minHeight:3.7,height:4.2,noDoor:true},...[-38,-26].map(x=>({id:'business:hotel-post:'+x,rings:[businessRect(s,x,28,.25,.25)],minHeight:0,height:3.8,noDoor:true}))]:[]),
 ];}
export const BUSINESS_ACTIVITIES=BUSINESS_SITES.flatMap(s=>[
 {id:'business:'+s.id+':photo',kind:'photo',label:'Photograph '+s.name,position:s.arrival,target:s.target,elevation:0,heading:bearingTo(s.arrival,s.target)},
 {id:'business:'+s.id+':seat',kind:'sit',label:'Sit outside '+s.name,position:businessPoint(s,s.seat.x,s.seat.z-1.2),seatPosition:businessPoint(s,s.seat.x,s.seat.z),heading:180,elevation:0,offset:-.45},
 {id:'business:'+s.id+':guide',kind:'watch',label:'Read the '+s.name+' visitor guide',position:businessPoint(s,s.guide.x,s.guide.z),target:s.target,elevation:0,text:s.description+' You can explore the public approach, sit and take photographs. Private interiors are closed.'},
]);
export const nearBusiness=p=>BUSINESS_SITES.find(s=>distanceMetres(p,s.arrival)<70);
export function businessPeople(t,position){const s=nearBusiness(position);if(!s)return null;const phase=t*.6%(s.walk.length*2),d=phase<s.walk.length?phase:s.walk.length*2-phase;return [{id:'business:'+s.id+':visitor',name:s.family==='marriott'?'Akosua':'Kwesi',avatar:'👩🏾',position:businessPoint(s,s.walk.x,s.walk.z+d),heading:phase<s.walk.length?180:0,elevation:0,moving:true,speed:.6},{id:'business:'+s.id+':seated',name:'Yaw',avatar:'👨🏾',position:businessPoint(s,s.seat.x,s.seat.z),heading:180,elevation:0,moving:false,action:'sit',poseOffset:-.45}];}
