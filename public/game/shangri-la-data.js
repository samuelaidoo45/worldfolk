import {offsetMetres,distanceMetres,bearingTo,projectOnSegment} from './motion.js';
import {SHANGRI_RINGS,SHANGRI_ROADS,SHANGRI_BUILDINGS} from './shangri-la-map.js';
export {SHANGRI_RINGS,SHANGRI_ROADS};
// September 2024 street evidence, not a claim of present-day occupancy or a survey.
export const SHANGRI_BLOCK={id:'shangri-la-frontages',name:'Shangri-La · Liberation / Kofi Annan',position:[-.17625,5.61745],width:230,depth:235,height:12,rotation:0,sourceIds:[2469962810,2475835060]};
export const SHANGRI_BOUNDS=[-.1770,5.61665,-.17555,5.61835];
export const inShangri=p=>p[0]>SHANGRI_BOUNDS[0]&&p[0]<SHANGRI_BOUNDS[2]&&p[1]>SHANGRI_BOUNDS[1]&&p[1]<SHANGRI_BOUNDS[3];
export const shangriLocal=p=>[(p[0]-SHANGRI_BLOCK.position[0])*111320*Math.cos(SHANGRI_BLOCK.position[1]*Math.PI/180),(SHANGRI_BLOCK.position[1]-p[1])*111320];
export const shangriPoint=(x,z)=>offsetMetres(SHANGRI_BLOCK.position,x,-z);
export const shangriRect=(x,z,w,d,yaw=0)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([a,b])=>shangriPoint(x+a*Math.cos(yaw)+b*Math.sin(yaw),z-a*Math.sin(yaw)+b*Math.cos(yaw)));
const roads=SHANGRI_ROADS.filter(r=>r.class!=='path').flatMap(r=>r.coordinates.slice(1).map((b,i)=>({id:r.id,a:r.coordinates[i],b,width:r.width})));
export const shangriRoadClear=(p,radius=0,ignore=null)=>!roads.some(r=>r.id!==ignore&&projectOnSegment(p,r.a,r.b).distance<r.width/2+radius);
export const SHANGRI_AUTHORED_ROADS=SHANGRI_ROADS.filter(r=>[34571980,98552049,98552052,518607277,510151406,510252769,511790086,515537582,974540788,1076825780,1076825781].includes(r.id));
export const shangriWidth=(id,fallback)=>SHANGRI_AUTHORED_ROADS.find(r=>String(r.id)===String(id))?.width??fallback;
function inside(p,r){let yes=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;}
export const shangriBuildingClear=(p,radius=.3)=>!SHANGRI_BUILDINGS.some(rs=>inside(p,rs[0])&&!rs.slice(1).some(r=>inside(p,r))||rs.some(r=>r.slice(1).some((b,i)=>projectOnSegment(p,r[i],b).distance<radius)));
export const SHANGRI_MASSES=[{id:'christman',source:2469962810,height:10.0},{id:'bank',source:2475835060,height:6.4}];
// Separate wall segments leave the mapped service approaches open.
export const SHANGRI_WALLS=[
 {id:'christman-south-west',a:[-.17694,5.617335],b:[-.17679,5.61733],height:1.25},
 {id:'christman-south-east',a:[-.17672,5.617326],b:[-.17649,5.61731],height:1.25},
 {id:'christman-east',a:[-.176465,5.61734],b:[-.17646,5.61786],height:1.7},
 {id:'bank-front-west',a:[-.176705,5.617065],b:[-.17668,5.617065],height:1.8},
 {id:'bank-front-east',a:[-.17659,5.617065],b:[-.17640,5.61705],height:1.8},
];
export const SHANGRI_LODGE={position:[-.176692,5.617035],width:4.1,depth:3.2,height:2.75};
export const SHANGRI_STELE={position:[-.176635,5.61704],width:1,depth:.25,height:2.9};
export const SHANGRI_LAMP=[-.17666,5.61712];
// Trees observed inside the compounds, away from pedestrian and vehicle routes.
export const SHANGRI_TREES=[[-.17652,5.61738],[-.17656,5.61745],[-.17662,5.61736],[-.17683,5.61710],[-.17691,5.61712]];
export const SHANGRI_PALMS=[[-.17666,5.6170],[-.17676,5.61755]];
export const SHANGRI_BOUNDARY=[];
const eastRoad=SHANGRI_ROADS.find(r=>r.id===515537582);
// Fence tracks the carriageway's actual curve, including its changing longitude.
for(let lat=5.61696;lat<=5.61831;lat+=.000045){let hit=null;for(let i=1;i<eastRoad.coordinates.length;i++){const a=eastRoad.coordinates[i-1],b=eastRoad.coordinates[i];if(lat>=a[1]&&lat<=b[1]){const t=(lat-a[1])/(b[1]-a[1]);hit=[a[0]+(b[0]-a[0])*t,lat];break;}}if(hit)SHANGRI_BOUNDARY.push(offsetMetres(hit,12.3,0));}
export function shangriColliders(){
 const out=SHANGRI_MASSES.map(m=>({id:'shangri:'+m.id,rings:[SHANGRI_RINGS[m.source]],height:m.height+1.5,noDoor:true}));
 for(const w of SHANGRI_WALLS){const a=shangriLocal(w.a),b=shangriLocal(w.b);out.push({id:'shangri:'+w.id,rings:[shangriRect((a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1]),.22,Math.atan2(a[1]-b[1],b[0]-a[0]))],height:w.height,noDoor:true});}
 for(let i=1;i<SHANGRI_BOUNDARY.length;i++){const a=shangriLocal(SHANGRI_BOUNDARY[i-1]),b=shangriLocal(SHANGRI_BOUNDARY[i]);out.push({id:'shangri:fence-'+i,rings:[shangriRect((a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(b[0]-a[0],b[1]-a[1]),.15,Math.atan2(a[1]-b[1],b[0]-a[0]))],height:2.1,noDoor:true});}
 const [x,z]=shangriLocal(SHANGRI_LODGE.position);out.push({id:'shangri:lodge',rings:[shangriRect(x,z,SHANGRI_LODGE.width,SHANGRI_LODGE.depth)],height:3,noDoor:true});
 const [sx,sz]=shangriLocal(SHANGRI_STELE.position);out.push({id:'shangri:bank-sign',rings:[shangriRect(sx,sz,SHANGRI_STELE.width,SHANGRI_STELE.depth)],height:SHANGRI_STELE.height,noDoor:true});const [px,pz]=shangriLocal(SHANGRI_LAMP);out.push({id:'shangri:solar-lamp',rings:[shangriRect(px,pz,.18,.18)],height:7,noDoor:true});
 for(const [i,p] of [...SHANGRI_TREES,...SHANGRI_PALMS].entries()){const [x,z]=shangriLocal(p);out.push({id:'shangri:tree-'+i,rings:[shangriRect(x,z,.5,.5)],height:8,noDoor:true});}return out;
}
export const SHANGRI_ACTIVITIES=[
 {id:'shangri-christman-view',kind:'watch',label:'View Christman House',position:[-.17661,5.61727],target:[-.17667,5.61760],elevation:0,text:'Christman House · brown framing, horizontal window bands and a stepped roofline. September 2024 Street View informs the exterior. Private offices remain closed.'},
 {id:'shangri-bank-view',kind:'watch',label:'View the turquoise bank frontage',position:[-.17653,5.61713],target:[-.17657,5.61684],elevation:0,text:'The turquoise First National Bank frontage, shaded rooftop and security lodge face Kofi Annan Street. This is exterior exploration; no real banking service is offered.'},
 {id:'shangri-boundary-view',kind:'watch',label:'Explore the Shangri-La roadside',position:[-.17591,5.61742],target:[-.17574,5.61748],elevation:0,text:'Shangri-La roadside · a metal fence, broad paved walkway and dense trees appear in September 2024 imagery. Proposed redevelopment renderings are not treated as completed buildings.'},
];
export const SHANGRI_PLACES=[{id:SHANGRI_BLOCK.id,name:'Shangri-La roadside',aliases:['Shangri La','Shangri-La','Shangri-la Bus Stop'],activity:'shangri-boundary-view',lng:-.17591,lat:5.61742,type:'neighbourhood',emoji:'🌳',description:'Explore the fenced Shangri-La frontage and the adjoining Kofi Annan junction.',activities:['explore','stroll']},{id:'christman-house-frontage',name:'Christman House',activity:'shangri-christman-view',lng:-.17661,lat:5.61727,type:'office',emoji:'🏢',description:'View the brown-framed building from the public Kofi Annan approach.',activities:['explore','stroll']},{id:'fnb-airport-frontage',name:'First National Bank · Airport frontage',aliases:['First National Bank','First National Bank Airport','GHL Bank'],activity:'shangri-bank-view',lng:-.17653,lat:5.61713,type:'bank',emoji:'🏦',description:'Explore the turquoise bank exterior and its public approach on Kofi Annan Street.',activities:['explore','stroll']}].map(p=>({...p,area:'Shangri-La / Airport Residential'}));
const norm=n=>String(n||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const shangriForPlace=p=>SHANGRI_PLACES.find(s=>s.id===p?.id||Number.isFinite(p?.lng)&&Number.isFinite(p?.lat)&&distanceMetres([s.lng,s.lat],[p.lng,p.lat])<70&&[s.name,...s.aliases||[]].some(n=>norm(n)===norm(p.name)));
export function shangriPeople(t,p){if(!inShangri(p))return null;const progress=t*.6%10,along=progress<5?progress:10-progress,position=offsetMetres([-.17591,5.61739],0,along);return [{id:'shangri-walker',name:'Akua',avatar:'👩🏾',position,heading:progress<5?0:180,moving:true,speed:.6,elevation:0},{id:'kofi-junction-walker',name:'Kofi',avatar:'👨🏾',position:offsetMetres([-.17655,5.61713],along,0),heading:progress<5?90:270,moving:true,speed:.6,elevation:0}];}
