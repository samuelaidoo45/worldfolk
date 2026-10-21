import {MAHAMA_RAILS,MAHAMA_WEST_APPROACH,NORTH_POLO_BUILDINGS,MAHAMA_ROADS} from './mahama-bypass-map.js';
import {offsetMetres,distanceMetres,bearingTo,projectOnSegment} from './motion.js';
export {MAHAMA_RAILS,MAHAMA_WEST_APPROACH,NORTH_POLO_BUILDINGS,MAHAMA_ROADS};
export const MAHAMA_SITES=[
 {id:'mahama-bypass-rail-bridge',name:'Mahama / Airport Bypass · railway bridge',position:[-.17204,5.61867],width:180,depth:510,height:8,rotation:0,sourceIds:[],family:'bypass'},
 {id:'shangri-rail-connection',name:'Shangri-La · railway connection',position:[-.17433,5.61855],width:470,depth:110,height:8,rotation:0,sourceIds:[],family:'rail'},
 {id:'polo-north-stables',name:'Polo Club · northern stable buildings',position:[-.17323,5.61799],width:160,depth:115,height:6,rotation:0,sourceIds:NORTH_POLO_BUILDINGS.map(f=>f.id),family:'stables'},
];
export const mahamaLocal=(site,p)=>[(p[0]-site.position[0])*111320*Math.cos(site.position[1]*Math.PI/180),(site.position[1]-p[1])*111320];
export const inMahama=p=>p[0]>-.17675&&p[0]<-.1715&&((p[1]>5.6183&&p[1]<5.6188)||(p[0]>-.174&&p[1]>5.61735&&p[1]<5.6203));
export const mahamaWidth=(id,fallback)=>MAHAMA_ROADS.find(r=>String(r.id)===String(id))?.width??fallback;
const segments=MAHAMA_ROADS.flatMap(r=>r.coordinates.slice(1).map((b,i)=>({a:r.coordinates[i],b,width:r.width,id:r.id})));
export const mahamaRoadClear=(p,radius=0)=>!segments.some(s=>projectOnSegment(p,s.a,s.b).distance<s.width/2+radius);
export function mahamaRoadPoint(id,lat,east=0){const r=MAHAMA_ROADS.find(r=>r.id===id);for(let i=1;i<r.coordinates.length;i++){const a=r.coordinates[i-1],b=r.coordinates[i];if(lat>=Math.min(a[1],b[1])&&lat<=Math.max(a[1],b[1]))return offsetMetres([a[0]+(b[0]-a[0])*(lat-a[1])/(b[1]-a[1]),lat],east,0);}throw Error('Outside bypass road');}
export const mahamaStrip=(a,b,width)=>{const h=bearingTo(a,b)*Math.PI/180,side=(p,n)=>offsetMetres(p,Math.cos(h)*n,-Math.sin(h)*n);return [side(a,-width/2),side(b,-width/2),side(b,width/2),side(a,width/2),side(a,-width/2)];};
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
// Road remains below rail. The visible 5 m sign sets clearance; other dimensions
// are estimates. No road ramp or train route is invented on the railway.
export const RAIL_DECK_TOP=6.15,RAIL_UNDERSIDE=5.05,RAIL_GAUGE=1.067;
export const MAHAMA_BRIDGES=MAHAMA_RAILS.filter(r=>r.properties.bridge==='yes').map(r=>({...r,site:r.id===187792807?'mahama-bypass-rail-bridge':'shangri-rail-connection',depth:r.id===187792807?13:7.5}));
export const MAHAMA_PILLARS=MAHAMA_BRIDGES.flatMap(r=>{
 const x=r.id===187792807?(-.1719933660546766-.1720684831768311)/2:(-.1762027204131616-.1760731128994083)/2;
 const [a,b]=[r.coordinates[0],r.coordinates.at(-1)],p=[x,a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])];
 return [-1,0,1].map((n,i)=>({id:'rail-pier-'+r.id+'-'+i,site:r.site,position:offsetMetres(p,0,n*(r.depth/2-1.4)),radius:r.id===187792807?.48:.55,height:RAIL_UNDERSIDE}));
});
export const BYPASS_WALLS=[];
for(const [roadId,east] of [[510192633,-5.35],[187792813,5.35]])for(let lat=5.6172;lat<5.62025;lat+=.000045){
 const a=mahamaRoadPoint(roadId,lat,east),b=mahamaRoadPoint(roadId,lat+.000045,east),mid=a.map((v,j)=>(v+b[j])/2),distance=Math.abs((mid[1]-5.618674)*111320),height=1.1+5.2*(1-smooth((distance-65)/135));
 BYPASS_WALLS.push({id:'bypass-wall-'+roadId+'-'+lat.toFixed(6),a,b,height,width:.4});
}
export const MAHAMA_ACTIVITIES=[
 {id:'mahama-bridge-guide',kind:'watch',label:'View the bypass railway bridge',position:mahamaRoadPoint(187792813,5.61838,4.5),target:[-.17204,5.618674],text:'Mahama / Airport Bypass · the railway crosses above the two carriageways. Concrete retaining walls, median piers and the photographed 5 m clearance sign follow August 2024 Street View. Keep to the roadside path; the track is not a road or a playable train service.'},
 {id:'shangri-rail-guide',kind:'watch',label:'View the Shangri-La railway crossing',position:mahamaRoadPoint(510151406,5.61828,-7.3),target:[-.17612,5.61847],text:'The railway continues west from the Airport Bypass to this Liberation Road crossing beside Shangri-La. September 2024 Street View informs the concrete deck and stone-faced banks. Railway operation and access are not simulated.'},
 {id:'polo-north-guide',kind:'watch',label:'View the northern Polo buildings',position:[-.17377389,5.6176461],target:[-.17328,5.61792],text:'North of the Polo field · seven separately mapped stable blocks and the long northern service shed. Roof positions and pale corrugated forms follow overhead reference imagery; wall heights and concealed elevations are estimated. Staff areas and stable interiors remain closed.'},
].map(a=>({...a,elevation:0}));
export const MAHAMA_PLACES=MAHAMA_SITES.map((s,i)=>({id:s.id,name:s.name,lng:MAHAMA_ACTIVITIES[i].position[0],lat:MAHAMA_ACTIVITIES[i].position[1],aliases:i===0?['Mahama bypass','Mahama railway bridge','Airport Bypass railway bridge','Spintex Bypass railway bridge']:i===1?['Shangri-La railway bridge']:['Polo north','Polo stables'],type:i===2?'landmark':'bridge',emoji:i===2?'🐎':'🌉',area:'Airport Bypass / Shangri-La / Polo',description:MAHAMA_ACTIVITIES[i].text,activities:['explore','stroll']}));
export const mahamaForPlace=p=>MAHAMA_PLACES.find(s=>p?.id===s.id||[s.name,...s.aliases].some(n=>n.toLowerCase()===String(p?.name||'').toLowerCase())&&Number.isFinite(p?.lng)&&Number.isFinite(p?.lat)&&distanceMetres([p.lng,p.lat],[s.lng,s.lat])<250);
export function mahamaArrival(p){const s=mahamaForPlace(p);if(!s)return null;const a=MAHAMA_ACTIVITIES[MAHAMA_PLACES.indexOf(s)];return {position:[...a.position],target:a.target,cameraPitch:12,hint:'E starts/stops the exterior guide. Road traffic passes beneath the railway.'};}
export const NORTH_POLO_MASSES=NORTH_POLO_BUILDINGS.map(f=>({id:f.id,rings:f.geometry.coordinates,wallHeight:f.id===888975164?3.4:2.8,roofRise:f.id===888975164?1.3:1.1}));
export function mahamaColliders(site){
 const out=[];
 if(site.family==='rail')for(const r of [...MAHAMA_RAILS,MAHAMA_WEST_APPROACH].filter(r=>r.properties.bridge!=='yes'))for(let i=1;i<r.coordinates.length;i++)out.push({id:'rail-bank:'+r.id+':'+i,rings:[mahamaStrip(r.coordinates[i-1],r.coordinates[i],20)],minHeight:0,height:RAIL_DECK_TOP,noDoor:true});
 if(site.family==='stables')return NORTH_POLO_MASSES.map(m=>({id:'polo-north:'+m.id,rings:m.rings,height:m.wallHeight+m.roofRise,noDoor:true}));
 for(const r of MAHAMA_BRIDGES.filter(r=>r.site===site.id)){
  const a=r.coordinates[0],b=r.coordinates.at(-1);out.push({id:'rail-deck:'+r.id,rings:[mahamaStrip(a,b,r.depth)],minHeight:RAIL_UNDERSIDE,height:RAIL_DECK_TOP+.6,noDoor:true});
  for(const [i,p] of [a,b].entries())out.push({id:'rail-abutment:'+r.id+':'+i,rings:[mahamaStrip(offsetMetres(p,0,-r.depth/2),offsetMetres(p,0,r.depth/2),.8)],minHeight:0,height:RAIL_DECK_TOP,noDoor:true});
 }
 for(const p of MAHAMA_PILLARS.filter(p=>p.site===site.id))out.push({id:p.id,rings:[mahamaStrip(offsetMetres(p.position,0,-p.radius),offsetMetres(p.position,0,p.radius),p.radius*2)],minHeight:0,height:p.height,noDoor:true});
 if(site.family==='bypass')for(const w of BYPASS_WALLS)out.push({id:w.id,rings:[mahamaStrip(w.a,w.b,w.width)],minHeight:0,height:w.height,noDoor:true});
 return out;
}

export function mahamaPeople(t,p){if(!inMahama(p))return null;const phase=t*.65%12,lat=5.61903+(phase<6?phase:12-phase)/111320;return [{id:'bypass-visitor',name:'Kojo',avatar:'👨🏾',position:mahamaRoadPoint(187792813,lat,4.5),heading:phase<6?0:180,speed:.65,moving:true,elevation:0}].filter(a=>distanceMetres(p,a.position)<180);}
// A generic eastward car offset crosses the retaining wall at these two arrivals.
// Put the player's vehicle in the adjacent carriageway, facing its native flow.
export function mahamaVehicleSpawn(position,physics,kind='car'){
 const i=MAHAMA_ACTIVITIES.findIndex((a,i)=>i<2&&distanceMetres(a.position,position)<18);if(i<0)return null;
 const id=i===0?187792813:510151406,lat=MAHAMA_ACTIVITIES[i].position[1],point=mahamaRoadPoint(id,lat,i===0?1.8:-3.5),north=mahamaRoadPoint(id,lat+.00002),south=mahamaRoadPoint(id,lat-.00002),heading=i===0?bearingTo(south,north):bearingTo(north,south);
 if(physics?.vehicleCollision?.(point,heading,kind,id))return null;
 return {position:point,heading,roadId:id};
}
