import {INTERCHANGE_ROADS} from './interchange-map.js';
import {offsetMetres,projectOnSegment,distanceMetres,bearingTo} from './motion.js';
export const INTERCHANGE={id:'tetteh-quarshie-interchange',name:'Tetteh Quarshie Interchange',position:[-.17643,5.62319],width:1160,depth:1000,height:8,rotation:0};
export const interchangePoint=(x,z)=>offsetMetres(INTERCHANGE.position,x,-z);
export const interchangeLocal=p=>[(p[0]-INTERCHANGE.position[0])*111320*Math.cos(INTERCHANGE.position[1]*Math.PI/180),(INTERCHANGE.position[1]-p[1])*111320];
export const INTERCHANGE_ARRIVAL=[-.17598,5.62240];
export const INTERCHANGE_PLACE={id:INTERCHANGE.id,name:INTERCHANGE.name,lng:INTERCHANGE.position[0],lat:INTERCHANGE.position[1],type:'interchange',category:'transport',emoji:'🛣️',area:'Accra Mall · N1 / N4',description:'Explore the motorway bridges, looping ramps and lower Accra–Madina carriageways beside Accra Mall.',activities:['stroll','explore']};
export const isInterchange=p=>p?.id===INTERCHANGE.id||/^tetteh quarshie interchange$/i.test(typeof p==='string'?p:p?.name||'');
export const INTERCHANGE_ACTIVITIES=[{id:'interchange-guide',kind:'watch',label:'Read the interchange guide',position:INTERCHANGE_ARRIVAL,elevation:0,heading:340,text:'Tetteh Quarshie connects the N1 motorway and N4 Accra–Madina road. The motorway crosses above the lower carriageways. Follow public pedestrian approaches; use a vehicle to explore the motorway. Bridge expansion was photographed in March 2026; this game keeps the verified mapped lanes rather than inventing a finished redesign.'},{id:'interchange-photo',kind:'photo',label:'Photograph Tetteh Quarshie Interchange',position:offsetMetres(INTERCHANGE_ARRIVAL,0,5),target:INTERCHANGE.position,elevation:0}];
// Estimated vertical profile. Native map coordinates define every horizontal lane;
// photographs establish the grade separation, not a surveyed deck height.
export const DECK_HEIGHT=6.6;
const bridges=INTERCHANGE_ROADS.filter(r=>r.structure==='bridge');
const main=INTERCHANGE_ROADS.filter(r=>r.name==='Kwame Nkrumah Motorway'||r.name==='George Walker Bush Highway');
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
function mainHeight(p){let nearest=Infinity;for(const r of bridges){const a=r.coordinates[0],b=r.coordinates.at(-1),q=projectOnSegment(p,a,b);nearest=Math.min(nearest,distanceMetres(p,q.position));}return DECK_HEIGHT*(1-smooth(nearest/180));}
const nodeHeights=new Map();for(const r of main)for(const p of r.coordinates)nodeHeights.set(p.join(','),mainHeight(p));
export const INTERCHANGE_PROFILES=INTERCHANGE_ROADS.map(r=>{const lengths=r.coordinates.slice(1).map((p,i)=>distanceMetres(r.coordinates[i],p)),total=lengths.reduce((a,b)=>a+b,0),isMain=main.includes(r),a=nodeHeights.get(r.coordinates[0].join(','))||0,b=nodeHeights.get(r.coordinates.at(-1).join(','))||0;let run=0;return {...r,width:r.class==='motorway'?16:14,segments:lengths.map((length,i)=>{const start=run/total;run+=length;return {a:r.coordinates[i],b:r.coordinates[i+1],length,start,end:run/total};}),height(p,t){return isMain?mainHeight(p):a+(b-a)*smooth(t);}};});
const segments=[];for(const road of INTERCHANGE_PROFILES)for(const s of road.segments)segments.push({...s,road,heading:bearingTo(s.a,s.b)});
const cells=new Map(),cell=(x,z)=>`${Math.floor(x/40)},${Math.floor(z/40)}`;
for(const s of segments){const a=interchangeLocal(s.a),b=interchangeLocal(s.b),pad=s.road.width/2+2;for(let x=Math.floor((Math.min(a[0],b[0])-pad)/40);x<=Math.floor((Math.max(a[0],b[0])+pad)/40);x++)for(let z=Math.floor((Math.min(a[1],b[1])-pad)/40);z<=Math.floor((Math.max(a[1],b[1])+pad)/40);z++){const k=`${x},${z}`;if(!cells.has(k))cells.set(k,[]);cells.get(k).push(s);}}
const gap=(a,b)=>Math.abs(((a-b+540)%360)-180);
export function interchangeSurface(position,heading=0,roadId=null){
 const [x,z]=interchangeLocal(position);if(Math.abs(x)>750||Math.abs(z)>650)return null;let best=null;
 for(const s of cells.get(cell(x,z))||[]){if(roadId!==null&&String(s.road.id)!==String(roadId))continue;const q=projectOnSegment(position,s.a,s.b);if(q.distance>s.road.width/2+1)continue;const turn=Math.min(gap(heading,s.heading),gap(heading,s.heading+180));if(roadId===null&&turn>65)continue;const score=q.distance+turn*.12;if(!best||score<best.score){const t=s.start+(s.end-s.start)*q.t;best={position:q.position,height:s.road.height(q.position,t),roadId:s.road.id,layer:s.road.layer,heading:s.heading,score};}}
 return best;
}
export const interchangeHeight=(p,heading=0,roadId=null)=>interchangeSurface(p,heading,roadId)?.height||0;
export const bodyRoadHeight=b=>b.driving?interchangeHeight(b.position,b.heading||0,b.roadId??null):Number(b.elevation)||0;
export const sameRoadLevel=(a,b)=>Math.abs(bodyRoadHeight(a)-bodyRoadHeight(b))<3;
// Ends of bridge spans sit beyond the lower carriageways. The same supports
// drive collision and modelling; no slab is treated as a ground-level wall.
export const INTERCHANGE_SUPPORTS=bridges.flatMap(r=>[0,1].map((t,i)=>{const p=r.coordinates[t? r.coordinates.length-1:0],h=bearingTo(r.coordinates[0],r.coordinates.at(-1))*Math.PI/180,point=offsetMetres(p,Math.sin(h)*(i?1:-1)*1.8,Math.cos(h)*(i?1:-1)*1.8);return {id:'interchange-abutment-'+r.id+'-'+i,position:point,heading:h*180/Math.PI,w:1.3,d:15,base:0,top:5.55};}));
export function interchangeColliders(origin=null){return INTERCHANGE_SUPPORTS.filter(s=>!origin||distanceMetres(origin,s.position)<110).map(s=>{const a=s.heading*Math.PI/180,ring=[[-s.d/2,-s.w/2],[s.d/2,-s.w/2],[s.d/2,s.w/2],[-s.d/2,s.w/2],[-s.d/2,-s.w/2]].map(([side,forward])=>offsetMetres(s.position,Math.cos(a)*side+Math.sin(a)*forward,-Math.sin(a)*side+Math.cos(a)*forward));return {id:s.id,rings:[ring],minHeight:s.base,height:s.top,noDoor:true};});}
const nearCore=p=>{const [x,z]=interchangeLocal(p);return Math.abs(x)<520&&Math.abs(z)<440&&p[1]>5.6219;};
export const INTERCHANGE_BARRIERS=[];
for(const r of INTERCHANGE_PROFILES)for(const s of r.segments){const n=Math.ceil(s.length/5);for(let i=0;i<n;i++){const a=s.a.map((v,j)=>v+(s.b[j]-v)*i/n),b=s.a.map((v,j)=>v+(s.b[j]-v)*(i+1)/n),m=a.map((v,j)=>(v+b[j])/2),t=s.start+(s.end-s.start)*(i+.5)/n,y=r.height(m,t);if(!nearCore(m)||y<1)continue;const angle=s.heading??bearingTo(a,b),rad=angle*Math.PI/180;
 for(const side of [-1,1]){const p=offsetMetres(m,Math.cos(rad)*side*(r.width/2+.15),-Math.sin(rad)*side*(r.width/2+.15));let merge=false;for(const other of segments){if(other.road.id===r.id)continue;const q=projectOnSegment(p,other.a,other.b);if(q.distance<other.road.width/2+.8&&Math.abs(other.road.height(q.position,other.start+(other.end-other.start)*q.t)-y)<2){merge=true;break;}}if(!merge)INTERCHANGE_BARRIERS.push({position:p,heading:angle,length:distanceMetres(a,b)+.04,y});}
}}
export function interchangeBarrierColliders(origin=null){return INTERCHANGE_BARRIERS.filter(s=>!origin||distanceMetres(origin,s.position)<100).map((s,i)=>{const a=s.heading*Math.PI/180;return {id:'interchange-rail-'+i,noDoor:true,minHeight:Math.max(0,s.y-.35),height:s.y+1.1,rings:[[[-.19,-s.length/2],[.19,-s.length/2],[.19,s.length/2],[-.19,s.length/2],[-.19,-s.length/2]].map(([side,forward])=>offsetMetres(s.position,Math.cos(a)*side+Math.sin(a)*forward,-Math.sin(a)*side+Math.cos(a)*forward))]};});}

export const INTERCHANGE_WALLS=[];
for(const r of INTERCHANGE_PROFILES.filter(r=>[413842862,413842863,613967475].includes(r.id)))for(const s of r.segments){const n=Math.ceil(s.length/5),angle=bearingTo(s.a,s.b),rad=angle*Math.PI/180;for(let i=0;i<n;i++){const p=s.a.map((v,j)=>v+(s.b[j]-v)*(i+.5)/n),distance=distanceMetres(p,INTERCHANGE.position),height=5.55*(1-smooth((distance-30)/60));if(height<.2)continue;INTERCHANGE_WALLS.push({position:offsetMetres(p,Math.cos(rad)*(r.width/2+2.1),-Math.sin(rad)*(r.width/2+2.1)),heading:angle,length:s.length/n+.1,height});}}
export function interchangeWallColliders(origin=null){return INTERCHANGE_WALLS.filter(s=>!origin||distanceMetres(origin,s.position)<110).map((s,i)=>{const a=s.heading*Math.PI/180;return {id:'interchange-wall-'+i,minHeight:0,height:s.height,noDoor:true,rings:[[[-.28,-s.length/2],[.28,-s.length/2],[.28,s.length/2],[-.28,s.length/2],[-.28,-s.length/2]].map(([side,forward])=>offsetMetres(s.position,Math.cos(a)*side+Math.sin(a)*forward,-Math.sin(a)*side+Math.cos(a)*forward))]};});}
// Keep the current carriageway through steering changes at an overlap. A recent
// adjacent sample may preserve its road identity; a teleport or leaving its width
// must resolve a fresh road rather than carrying a height across the city.
export function trackInterchangeRoad(position,heading,previous=null){
 const held=previous&&distanceMetres(position,previous.position)<20?interchangeSurface(position,heading,previous.roadId):null;
 const sample=held||interchangeSurface(position,heading);return sample?{...sample,position:[...position]}:null;
}
