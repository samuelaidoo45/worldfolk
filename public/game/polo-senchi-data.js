import {offsetMetres,distanceMetres,projectOnSegment} from './motion.js';
import {POLO_RINGS,POLO_GROUNDS,POLO_ROADS,POLO_CONTEXT_BUILDINGS} from './polo-senchi-map.js';
export {POLO_RINGS,POLO_GROUNDS,POLO_ROADS};
export const POLO_SITES=[
 {id:'elizabeth-senchi',name:'The Elizabeth · Senchi frontage',position:[-.17654,5.61521],width:105,depth:115,height:19.6,rotation:0,sourceIds:[451713890,2904703356],family:'elizabeth'},
 {id:'polo-heights-frontage',name:'Polo Heights · Chukka, Saddle and Mallet',position:[-.17491,5.61549],width:80,depth:125,height:37,rotation:0,sourceIds:[981756484,981756486,981756490],family:'heights'},
 {id:'polo-club-grounds',name:'Accra Polo Club · grounds',position:[-.17350,5.61625],width:150,depth:250,height:7,rotation:0,sourceIds:[],family:'polo'},
];
export const poloLocal=(s,p)=>[(p[0]-s.position[0])*111320*Math.cos(s.position[1]*Math.PI/180),(s.position[1]-p[1])*111320];
export const poloPoint=(s,x,z)=>offsetMetres(s.position,x,-z);
export const inPoloSenchi=p=>p[0]>-.17705&&p[0]<-.1728&&p[1]>5.6146&&p[1]<5.61745;
export const POLO_MASSES=[
 {source:451713890,site:'elizabeth-senchi',height:16.5,base:1.05,floors:5,family:'elizabeth'},
 {source:2904703356,site:'elizabeth-senchi',height:18,base:0,floors:6,family:'south-block'},
 ...[981756484,981756486,981756490].map(source=>({source,site:'polo-heights-frontage',height:35.2,base:0,floors:11,family:'heights'})),
];
// Native heights are defaults here. The subdivisions/floor heights remain estimates.
const segments=POLO_ROADS.filter(r=>!['path','steps','pedestrian'].includes(r.class)).flatMap(r=>r.coordinates.slice(1).map((b,i)=>({a:r.coordinates[i],b,width:r.width,id:r.id})));
export const poloRoadClear=(p,radius=0)=>!segments.some(r=>projectOnSegment(p,r.a,r.b).distance<r.width/2+radius);
export function poloInside(p,r){let inside=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;}return inside;}
export const poloBuildingClear=(p,radius=.5)=>!POLO_CONTEXT_BUILDINGS.some(rs=>poloInside(p,rs[0])&&!rs.slice(1).some(r=>poloInside(p,r))||rs.some(r=>r.slice(1).some((b,i)=>projectOnSegment(p,r[i],b).distance<radius)));
export function poloRoadPoint(id,lat,west=0){const r=POLO_ROADS.find(r=>r.id===id);for(let i=1;i<r.coordinates.length;i++){const a=r.coordinates[i-1],b=r.coordinates[i];if(lat>=Math.min(a[1],b[1])&&lat<=Math.max(a[1],b[1]))return offsetMetres([a[0]+(b[0]-a[0])*(lat-a[1])/(b[1]-a[1]),lat],-west,0);}throw Error('Outside Polo native road');}
export function poloStrip(a,b,width){const dx=(b[0]-a[0])*110800,dy=(b[1]-a[1])*111320,len=Math.hypot(dx,dy)||1;return [...[-1,1].map(sign=>offsetMetres(a,dy/len*width/2*sign,-dx/len*width/2*sign)),... [1,-1].map(sign=>offsetMetres(b,dy/len*width/2*sign,-dx/len*width/2*sign)),offsetMetres(a,-dy/len*width/2,dx/len*width/2)];}
export const ELIZ_PLINTH=[[-.17672,5.615135],[-.17643,5.615055],[-.17629,5.615065],[-.17625,5.61530],[-.17665,5.615355],[-.17672,5.615135]];
export const POLO_WALLS=[];
function wall(id,a,b,height,width=.22,style='estate'){
 const len=distanceMetres(a,b),n=Math.ceil(len/2);for(let i=0;i<n;i++){const at=t=>a.map((v,j)=>v+(b[j]-v)*t),aa=at(i/n),bb=at((i+1)/n),p=at((i+.5)/n);if(poloRoadClear(p,width/2+.7))POLO_WALLS.push({id:id+'-'+i,a:aa,b:bb,height,width,style});}
}
wall('elizabeth-retaining',[-.17626,5.61508],[-.17624,5.61532],1.2,.55,'stone');
const estate=POLO_GROUNDS[981756488];for(let i=1;i<estate.length;i++)wall('heights-boundary-'+i,estate[i-1],estate[i],1.65,.22);
// Low field boards and flexible-looking goal posts, not a football stadium.
export const POLO_FIELD=POLO_GROUNDS[890787154];
export const POLO_POSTS=[[POLO_FIELD[0],POLO_FIELD[3],-4],[POLO_FIELD[1],POLO_FIELD[2],4]].flatMap(([a,b,north])=>[-3.65,3.65].map(x=>({position:offsetMetres([(a[0]+b[0])/2,(a[1]+b[1])/2],x,north),height:4.2})));
export const POLO_PLANTING=[
 ...Array.from({length:8},(_,i)=>({position:[-.17512+i*.000072,5.615008],height:7.5,kind:'palm',site:'polo-heights-frontage'})),
 ...[[-.17664,5.61529],[-.17667,5.61521],[-.17668,5.61514]].map(position=>({position,height:8,kind:'column',site:'elizabeth-senchi'})),
 ...Array.from({length:7},(_,i)=>({position:[-.17408,5.61535+i*.00025],height:6.5,kind:'palm',site:'polo-club-grounds'})),
].filter(p=>poloRoadClear(p.position,.8)&&poloBuildingClear(p.position,.5));
export const POLO_ACTIVITIES=[
 {id:'elizabeth-street-guide',kind:'watch',label:'View The Elizabeth',position:poloRoadPoint(316575722,5.61522,13),target:[-.17652,5.61521],text:'The Elizabeth · pale cladding, red curved bands and horizontal glazing above a raised forecourt. The adjoining white/red block has a separate native footprint and unverified identity. September 2024 imagery informs this exterior; offices remain closed.'},
 {id:'polo-heights-guide',kind:'watch',label:'View the Polo Heights towers',position:[-.17479,5.614970],target:[-.17479,5.61519],text:'Polo Heights · separate Chukka, Saddle and Mallet towers, pale yellow walls, reddish vertical panels, stacked recessed balconies and square openings. August 2024 imagery informs their forms; heights and concealed details are estimates. Private apartments stay closed.'},
 {id:'polo-field-guide',kind:'watch',label:'View the Polo Club grounds',position:[-.17417,5.61572],target:[-.1735,5.61625],text:'Accra Polo Club · grass grounds and polo goal posts. This is an exterior viewing approach. The club and neighbouring Polo residential estates are separate; clubhouse interiors, matches and horse riding are not opened by this visit.'},
].map(a=>({...a,elevation:0}));
export const POLO_PLACES=POLO_SITES.map((s,i)=>({id:i===2?'g_-1735_56163':s.id,name:i===2?'Accra Polo Club':s.name,aliases:i===0?['The Elizabeth','Elizabeth Senchi']:i===1?['Polo Heights','Chukka Block','Saddle Block','Mallet Block']:['Polo Club','Accra Polo grounds'],lng:POLO_ACTIVITIES[i].position[0],lat:POLO_ACTIVITIES[i].position[1],type:i===0?'office':i===1?'apartment':'park',emoji:i===0?'🏢':i===1?'🏙️':'🐎',area:'Polo / Senchi / Airport Residential',description:POLO_ACTIVITIES[i].text,activities:['explore','stroll'],siteId:s.id}));
const norm=n=>String(n||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function poloForPlace(p){return POLO_PLACES.find(s=>p?.id===s.id||Number.isFinite(p?.lng)&&Number.isFinite(p?.lat)&&distanceMetres([p.lng,p.lat],[s.lng,s.lat])<240&&[s.name,...s.aliases].some(n=>norm(n)===norm(p.name)));}
export function poloArrival(p){const s=poloForPlace(p);if(!s)return null;const a=POLO_ACTIVITIES[POLO_PLACES.indexOf(s)];return {position:[...a.position],target:a.target,cameraPitch:14,hint:'E starts and stops the outdoor guide. Private interiors remain closed.'};}
export function poloColliders(site){
 const out=POLO_MASSES.filter(m=>m.site===site.id).map(m=>({id:'polo:'+m.source,rings:[POLO_RINGS[m.source]],height:m.base+m.height+1.6,noDoor:true}));
 if(site.family==='elizabeth')out.push({id:'polo:elizabeth-plinth',rings:[ELIZ_PLINTH],height:1.05,noDoor:true});
 for(const w of POLO_WALLS.filter(w=>site.family==='elizabeth'?w.style==='stone':site.family==='heights'?w.style==='estate':false))out.push({id:'polo:'+w.id,rings:[poloStrip(w.a,w.b,w.width)],height:w.height+(w.style==='stone'?.75:.3),noDoor:true});
 for(const [i,p] of POLO_PLANTING.entries()){if(p.site!==site.id)continue;const a=offsetMetres(p.position,-.25,-.25),b=offsetMetres(p.position,.25,.25);out.push({id:'polo:tree-'+i,rings:[[a,[b[0],a[1]],b,[a[0],b[1]],a]],height:p.height,noDoor:true});}
 if(site.family==='heights')out.push({id:'polo:pool',rings:[POLO_GROUNDS[981756482]],height:.2,noDoor:true});
 if(site.family==='polo')for(const [i,p] of POLO_POSTS.entries())out.push({id:'polo:goal-'+i,rings:[poloStrip(offsetMetres(p.position,0,-.1),offsetMetres(p.position,0,.1),.2)],height:4.2,noDoor:true});
 return out;
}
export function poloPeople(seconds,position){if(!inPoloSenchi(position))return null;const d=seconds*.65%12,u=d<6?d:12-d;return [{id:'senchi-visitor',name:'Yaw',avatar:'👨🏾',position:offsetMetres(POLO_ACTIVITIES[0].position,-1.2,u-3),heading:d<6?0:180,moving:true,speed:.65,elevation:0},{id:'polo-visitor',name:'Esi',avatar:'👩🏾',position:offsetMetres(POLO_ACTIVITIES[2].position,1.1,u-3),heading:d<6?0:180,moving:true,speed:.65,elevation:0}].filter(a=>distanceMetres(a.position,position)<180);}
const authoredIds=new Set([111557768,277792478,277792479,121772677,316575722,419694822,758665997,172920773,96638771,637682768,637698454,1076825772,1076825773,1076825774,1076825775]);
export const POLO_AUTHORED_ROADS=POLO_ROADS.filter(r=>authoredIds.has(r.id));
const widths=new Map(POLO_AUTHORED_ROADS.map(r=>[String(r.id),r.width]));
export const poloRoadWidth=(id,fallback)=>widths.get(String(id))??fallback;
