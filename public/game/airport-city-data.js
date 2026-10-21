import {offsetMetres,distanceMetres,bearingTo} from './motion.js';
import {AIRPORT_CITY_RINGS} from './airport-city-map.js';
export const AIRPORT_CITY_SITES=[
 {id:'marina-mall',name:'Marina Mall',family:'marina',position:[-.17618,5.60299],width:90,depth:130,height:40.5,sourceIds:[626143418],type:'mall',emoji:'🛍️',aliases:['Marina Mall Accra','Marina Mall Airport City'],arrival:[-.175765,5.602855],target:[-.17615,5.60310],description:'Explore Marina Mall’s checker-panel office tower, curved retail wing and a three-level shopping interpretation.'},
 {id:'one-airport-square',name:'One Airport Square',family:'square',position:[-.1772,5.60065],width:130,depth:140,height:39,sourceIds:[749853156],type:'office',emoji:'🏢',aliases:['Airport Square One'],arrival:[-.176902,5.600973],target:[-.17722,5.60062],description:'Visit the public plaza and distinctive concrete lattice, shaded terraces and glazed office tower of One Airport Square.'},
];
export const cityPoint=(s,x,z)=>offsetMetres(s.position,x,-z);
export const cityLocal=(s,p)=>[(p[0]-s.position[0])*111320*Math.cos(s.position[1]*Math.PI/180),(s.position[1]-p[1])*111320];
export const cityRect=(s,x,z,w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>cityPoint(s,x+dx,z+dz));
const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function airportCityForPlace(p){if(typeof p==='string')return AIRPORT_CITY_SITES.find(s=>[s.name,...s.aliases].some(n=>norm(n)===norm(p)));return AIRPORT_CITY_SITES.find(s=>p?.id===s.id||[s.name,...s.aliases].some(n=>norm(n)===norm(p?.name))&&(!Number.isFinite(p.lng)||distanceMetres([p.lng,p.lat],s.position)<180));}
export const AIRPORT_CITY_PLACES=AIRPORT_CITY_SITES.map(s=>({id:s.id,name:s.name,lng:s.arrival[0],lat:s.arrival[1],aliases:s.aliases,type:s.type,emoji:s.emoji,area:'Airport City',description:s.description,activities:['shopping','stroll','connect']}));
export const MARINA=AIRPORT_CITY_SITES[0],SQUARE=AIRPORT_CITY_SITES[1],MARINA_PLACE=AIRPORT_CITY_PLACES[0];
export const MARINA_ENTRY=cityPoint(MARINA,22,13);
export const isMarinaMall=p=>airportCityForPlace(p)?.id===MARINA.id;
export function clipCityRing(ring,z,less){const ps=ring.slice(0,-1),out=[],inside=p=>less?p[1]<=z:p[1]>=z;for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib){const t=(z-a[1])/(b[1]-a[1]);out.push([a[0]+(b[0]-a[0])*t,z]);}}return out.length?[...out,out[0]]:[];}
export const cityRing=s=>AIRPORT_CITY_RINGS[s.sourceIds[0]].map(p=>cityLocal(s,p));
// Native square footprint includes the low northern retail arm. Its southern
// office tower, atrium and terrace setback dimensions are photo interpretations.
export const SQUARE_TOWER=clipCityRing(cityRing(SQUARE),-9,false);
export const SQUARE_RETAIL=clipCityRing(cityRing(SQUARE),-9,true);
export const SQUARE_ATRIUM=[[-15,0],[0,-3],[10,8],[7,18],[-8,21],[-18,13],[-15,0]];
export const CITY_SEATS={marina:[{x:22.5,z:-4}],square:[{x:21,z:-33},{x:35,z:-18}]};
export const airportCityColliders=s=>[
 ...(s.family==='square'?[{id:'airport-city:square-tower',rings:[SQUARE_TOWER.map(p=>cityPoint(s,...p)),SQUARE_ATRIUM.map(p=>cityPoint(s,...p))],height:37.5,minHeight:0,noDoor:true},{id:'airport-city:square-retail',rings:[SQUARE_RETAIL.map(p=>cityPoint(s,...p))],height:5.4,minHeight:0,noDoor:true}]:[{id:'airport-city:marina-shell',rings:[AIRPORT_CITY_RINGS[s.sourceIds[0]]],height:40,minHeight:0,noDoor:true}]),
 ...(s.family==='marina'?[{id:'airport-city:marina-canopy',rings:[cityRect(s,22,13,5,8)],minHeight:3.55,height:4.05,noDoor:true},...[9.8,16.2].map(z=>({id:'airport-city:marina-post-'+z,rings:[cityRect(s,24,z,.17,.17)],minHeight:0,height:3.6,noDoor:true})),...[-20,-12,2].map(z=>({id:'airport-city:marina-planter-'+z,rings:[cityRect(s,23,z,1.1,1.1)],minHeight:0,height:1.6,noDoor:true}))]:[[19,-29],[37,-15]].map(([x,z],i)=>({id:'airport-city:square-planter-'+i,rings:[cityRect(s,x,z,2,2)],minHeight:0,height:1.6,noDoor:true}))),
 ...CITY_SEATS[s.family].map((p,i)=>({id:`airport-city:${s.id}:seat-${i}`,rings:[cityRect(s,p.x,p.z,2.6,.65)],minHeight:0,height:.95,noDoor:true})),
 ...(s.family==='square'?[{id:'airport-city:square-guide-plinth',rings:[cityRect(s,30,-33.3,1.4,.24)],minHeight:0,height:.9,noDoor:true}]:[]),
];
export const AIRPORT_CITY_ACTIVITIES=AIRPORT_CITY_SITES.flatMap(s=>[
 {id:'airport-city:'+s.id+':photo',kind:'photo',label:'Photograph '+s.name,position:s.arrival,target:s.target,elevation:0,heading:bearingTo(s.arrival,s.target)},
 ...CITY_SEATS[s.family].map((p,i)=>({id:`airport-city:${s.id}:seat-${i}`,kind:'sit',label:s.family==='marina'?'Sit outside Marina Mall':'Sit in the One Airport Square plaza',position:cityPoint(s,p.x,p.z-1.2),seatPosition:cityPoint(s,p.x,p.z),elevation:0,heading:180,offset:-.45})),
 ...(s.family==='marina'?[{id:'airport-city:marina-enter',kind:'marina-enter',label:'Enter Marina Mall',position:MARINA_ENTRY,elevation:0,heading:270}]:[{id:'airport-city:square-guide',kind:'watch',label:'Read about One Airport Square',position:cityPoint(s,30,-32),target:s.target,elevation:0,text:'One Airport Square combines offices with a ground-level retail plaza. Its inclined concrete piers and projecting terraces shade the glazing; the central atrium brings daylight and ventilation. Explore the public plaza and meet friends here. Upper offices and private tenancies are not open in this game pass.'}]),
]);
export const nearbyAirportCity=p=>AIRPORT_CITY_SITES.find(s=>distanceMetres(p,s.arrival)<80);
export function airportCityPeople(seconds,position){const s=nearbyAirportCity(position);if(!s)return null;const phase=seconds*.65%12,d=phase<6?phase:12-phase,p=s.family==='marina'?cityPoint(s,21,2+d):cityPoint(s,31.5,-26+d),seat=CITY_SEATS[s.family][0];return [{id:'airport-city:'+s.id+':visitor',name:'Efua',avatar:'👩🏾',position:p,heading:phase<6?180:0,elevation:0,moving:true,speed:.65},{id:'airport-city:'+s.id+':waiting',name:'Kofi',avatar:'👨🏾',position:cityPoint(s,seat.x,seat.z),heading:180,elevation:0,moving:false,speed:0,action:'sit',poseOffset:-.45}];}
