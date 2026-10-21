import {CASTLE_VISITS,CASTLE_ACTIVITIES} from './castle-asomdwe-data.js';
import {CIVIC_BOUNDS,CIVIC_BUILDINGS,CIVIC_LAND,CIVIC_ROADS} from './independence-neighbourhood-map.js';
import {areaInside,areaLocal} from './mahama-neighbourhood-data.js';
import {offsetMetres,distanceMetres,projectOnSegment,bearingTo} from './motion.js';
import {roadWidth} from './street-safety.js';
import {SPACE_ACTIVITIES,spaceColliders,spaceObstacle,SPACE_HERITAGE} from './independence-public-space-data.js';
import {COAST_SITES,COAST_ACTIVITIES,COAST_VISITS,coastColliders} from './coastal-precinct-data.js';
import {financeColliders,FINANCE_ACTIVITIES} from './finance-frontage-data.js';
export {CIVIC_BOUNDS,CIVIC_BUILDINGS,CIVIC_LAND};
export const civicLocal=areaLocal,civicInside=areaInside;
const names={stadium:'Accra Sports Stadium',volta:'Electro Volta House',water:'Ghana Water Company Head Office',club:'Ghana Club',finance:'Finance Drive · former Finance Ministry and courtyard offices',commission:'Public Services Commission','west-north':'Ministries · western northern blocks','west-south':'Customs / Finance Drive · western blocks','east-north':'Ministries · eastern northern blocks','east-south':'Finance Drive · eastern blocks'};
export const CIVIC_SITES=Object.entries(names).map(([zone,name])=>{const bs=CIVIC_BUILDINGS.filter(b=>b.zone===zone),ps=bs.flatMap(b=>b.rings.flat()),xs=ps.map(p=>p[0]),ys=ps.map(p=>p[1]);return {id:zone==='stadium'?'accra-stadium':'independence-'+zone,zone,name,position:[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2],width:(Math.max(...xs)-Math.min(...xs))*110800+18,depth:(Math.max(...ys)-Math.min(...ys))*111320+18,height:zone==='stadium'?38:Math.max(...bs.map(b=>b.wallHeight+b.roofRise)),rotation:0,sourceIds:bs.map(b=>b.id)};});
const stadiumSite=CIVIC_SITES.find(s=>s.zone==='stadium');stadiumSite.width=390;stadiumSite.depth=320;
export const CIVIC_PARK={id:'independence-nationalism-park',zone:'park',name:'Nationalism Park',position:[-.19172,5.5498],width:310,depth:135,height:20,rotation:0,sourceIds:[]};
const clubSite=CIVIC_SITES.find(s=>s.zone==='club');clubSite.width=110;clubSite.depth=110;clubSite.height=12;
CIVIC_SITES.push(CIVIC_PARK,...COAST_SITES);
export const CIVIC_MASTS=[[-.19262,5.55263],[-.19133,5.55240],[-.19107,5.55065],[-.1926319491,5.5504859324]];
export const CIVIC_MONUMENTS=SPACE_HERITAGE;
export function civicRect(p,w,d,rotation=0){const a=rotation*Math.PI/180;return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([x,z])=>offsetMetres(p,x*Math.cos(a)+z*Math.sin(a),x*Math.sin(a)-z*Math.cos(a)));}
export const civicRoadClear=(p,radius=0)=>!CIVIC_ROADS.filter(r=>!['path','pedestrian','steps','cycleway'].includes(r.class)).some(r=>r.coordinates.slice(1).some((b,i)=>projectOnSegment(p,r.coordinates[i],b).distance<roadWidth(r.class)/2+radius));
export const civicBuildingClear=(p,radius=0)=>!CIVIC_BUILDINGS.some(b=>areaInside(p,b.rings)||b.rings.some(r=>r.slice(1).some((v,i)=>projectOnSegment(p,r[i],v).distance<radius)));
export const CIVIC_VISITS=[
 {id:'g_-1918_55516',site:'stadium',name:'Accra Sports Stadium',aliases:['Ohene Djan Stadium','Accra Stadium'],position:[-.1923961017,5.5505040676],target:[-.19192,5.55148],emoji:'⚽',type:'stadium',text:'Explore the stadium approach, the curved seating bowl, floodlights and west stand. Watch a simulated football match or explore the stadium.'},
 {id:'independence-volta-visit',site:'volta',name:'Electro Volta House',aliases:['Electro-Volta House','ECG head office'],position:[-.19467,5.54920],target:[-.19466,5.54935],emoji:'🏢',type:'office',text:'View the horizontal pale ribbons and dark window bands of Electro Volta House from Finance Drive.'},
 {id:'independence-water-visit',site:'water',name:'Ghana Water Company Head Office',aliases:['Ghana Water head office'],position:[-.19380,5.5493379662],target:[-.19388,5.54950],emoji:'🏢',type:'office',text:'Walk the public frontage beside the water company’s long windowed office block and landscaped boundary.'},
 {id:'independence-club-visit',site:'club',name:'Ghana Club',aliases:[],position:[-.19712,5.54698],target:[-.19704,5.54712],emoji:'🏡',type:'restaurant',text:'Explore the Ghana Club frontage, with its raised timber room, pale shutters and hipped roof. This reconstruction covers the exterior.'},
 {id:'independence-finance-visit',site:'finance',name:'Finance Drive · former Finance Ministry / GSS',aliases:['Finance Drive offices','Former Ministry of Finance','Ministry of Finance','Ghana Statistical Service frontage'],position:[-.19632,5.5492840676],target:[-.19628,5.54962],emoji:'🏛️',type:'office',text:'Explore the patterned former Finance Ministry / GSS frontage and adjoining office grid. The Finance Ministry moved its headquarters to Kanda in February 2026; this visit reconstructs the older exterior, with estimated details.'},
 {id:'independence-commission-visit',site:'commission',name:'Public Services Commission',aliases:['PSC Finance Drive'],position:[-.19546,5.549088],target:[-.19549,5.54901],emoji:'🏛️',type:'office',text:'View the Commission’s deep vertical fins, recessed window rows and folded entrance canopies from Finance Drive. The facade is reconstructed from dated imagery; interiors remain closed.'},
 {id:'independence-park-visit',site:'park',name:'Nationalism Park',aliases:['Nationalist Park'],position:[-.19180,5.54958],target:CIVIC_MONUMENTS[0].position,emoji:'🌳',type:'park',text:'Explore the 28th February memorial and national heritage monuments. The park’s redevelopment, public paths and planted areas connect the square with the stadium.'},
 ...COAST_VISITS,...CASTLE_VISITS,
 {id:'independence-coast-visit',site:'coast',name:'Independence Square coastal approach',aliases:['Independence Beach approach'],position:[-.19265,5.54575],target:[-.19241,5.54647],emoji:'🌊',type:'attraction',text:'Walk the southern approach between the coastal road and Independence Arch, then continue to the ceremonial square.'},
];
const norm=v=>String(v||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function civicForPlace(p){return CIVIC_VISITS.find(v=>v.id===p?.id||p?.id==='accra-stadium'&&v.site==='stadium'||[v.name,...v.aliases].some(n=>norm(n)===norm(p?.name))&&(!Number.isFinite(p?.lng)||distanceMetres([p.lng,p.lat],v.target)<250));}
export const CIVIC_PLACES=CIVIC_VISITS.map(v=>({id:v.id,name:v.name,aliases:v.aliases,lng:v.position[0],lat:v.position[1],area:v.area||'Independence Square surroundings',type:v.type,emoji:v.emoji,description:v.text,activities:v.site==='stadium'?['explore']:['explore','stroll']}));
export const CIVIC_ACTIVITIES=CIVIC_VISITS.filter(v=>v.site!=='stadium').map(v=>({id:v.id+'-guide',kind:'watch',label:v.site==='stadium'?'View Accra Sports Stadium':'Explore '+v.name,position:v.position,target:v.target,elevation:0,text:v.text}));
export const CIVIC_SEATS=[[-.19242,5.54984],[-.19179,5.54964]];
export const CIVIC_LAMPS=[[-.19245,5.54982],[-.19216,5.54975],[-.19197,5.54965],[-.19142,5.54965]];
CIVIC_ACTIVITIES.push(...CASTLE_ACTIVITIES,...COAST_ACTIVITIES,...FINANCE_ACTIVITIES,...SPACE_ACTIVITIES,...CIVIC_SEATS.map((p,i)=>({id:'nationalism-bench-'+i,kind:'sit',label:'Sit in Nationalism Park',position:offsetMetres(p,0,-1.2),seatPosition:p,elevation:0,heading:180,offset:-.45})));
export const CIVIC_WALKS=[
 {a:[-.19246,5.54988],b:[-.19180,5.54958],width:2},
 {a:[-.19180,5.54958],b:[-.19148,5.54961],width:2},
 {a:[-.19148,5.54961],b:[-.19131,5.54978],width:2},
];
export const CIVIC_WALK_PIECES=[];
for(const w of CIVIC_WALKS){const n=Math.ceil(distanceMetres(w.a,w.b)/2);for(let i=0;i<n;i++){const a=w.a.map((v,k)=>v+(w.b[k]-v)*i/n),b=w.a.map((v,k)=>v+(w.b[k]-v)*(i+1)/n),mid=a.map((v,k)=>(v+b[k])/2);if([a,mid,b].every(p=>areaInside(p,CIVIC_LAND.find(f=>f.properties.name==='Nationalism Park').geometry.coordinates)&&civicRoadClear(p,w.width/2+.3)&&civicBuildingClear(p,w.width/2+.3)&&!spaceObstacle(p,w.width/2+.3)&&!CIVIC_MONUMENTS.some(m=>areaInside(p,[civicRect(m.position,m.width+3,m.depth+3,m.rotation)]))))CIVIC_WALK_PIECES.push({...w,a,b});}}
export const CIVIC_TREES=[[-.19243,5.54972],[-.19256,5.54991],[-.19219,5.54952],[-.19190,5.54994],[-.19168,5.54992],[-.19123,5.54976],[-.19395,5.54929],[-.19408,5.54929],[-.19491,5.54921]].filter(p=>civicRoadClear(p,2.5)&&civicBuildingClear(p,3)&&!CIVIC_MONUMENTS.some(m=>areaInside(p,[civicRect(m.position,m.width+6,m.depth+6,m.rotation)])));
const civicColliderCache=new Map();
export function civicColliders(site,origin=null){
 if(!civicColliderCache.has(site.zone)){
  const shapes=[...spaceColliders(site.zone),...financeColliders(site.zone),...coastColliders(site.zone),...(site.zone==='park'?
   [...CIVIC_MONUMENTS.map(m=>({id:m.id,rings:[civicRect(m.position,m.width,m.depth,m.rotation)],height:m.height,noDoor:true})),...CIVIC_SEATS.map((p,i)=>({id:'park-seat-'+i,rings:[civicRect(p,2.5,.7)],height:1,noDoor:true})),...CIVIC_LAMPS.map((p,i)=>({id:'park-lamp-'+i,rings:[civicRect(p,.25,.25)],height:3.8,noDoor:true}))]:
   [...CIVIC_BUILDINGS.filter(b=>b.zone===site.zone).map(b=>({id:'civic:'+b.id,rings:b.rings,height:b.wallHeight+b.roofRise,noDoor:true})),...(site.zone==='stadium'?CIVIC_MASTS.map((p,i)=>({id:'civic-floodlight-'+i,rings:[civicRect(p,.8,.8)],height:36,noDoor:true})):[])])];
  civicColliderCache.set(site.zone,shapes.map(s=>{const ps=s.rings.flat();return {...s,bounds:[Math.min(...ps.map(p=>p[0])),Math.min(...ps.map(p=>p[1])),Math.max(...ps.map(p=>p[0])),Math.max(...ps.map(p=>p[1]))]};}));
 }
 const shapes=civicColliderCache.get(site.zone);if(!origin)return shapes;
 const dy=105/111320,dx=dy/Math.cos(origin[1]*Math.PI/180);return shapes.filter(s=>s.bounds[0]<origin[0]+dx&&s.bounds[2]>origin[0]-dx&&s.bounds[1]<origin[1]+dy&&s.bounds[3]>origin[1]-dy);
}
export function civicPeople(seconds,position){
 const spots=CIVIC_VISITS.filter(v=>v.site!=='coast'&&distanceMetres(position,v.position)<100);if(!spots.length)return null;
 return spots.map((v,i)=>{const a=offsetMetres(v.position,-1.2,0),b=offsetMetres(v.position,1.2,0),t=(seconds*.18+i)%2,u=t<1?t:2-t,p=a.map((n,k)=>n+(b[k]-n)*u);return {id:'civic-visitor-'+v.site,name:i%2?'Ama':'Kwesi',avatar:i%2?'👩🏾':'👨🏾',position:p,elevation:0,heading:bearingTo(p,t<1?b:a),speed:.43,moving:true};});
}
