import {offsetMetres,distanceMetres,bearingTo,projectOnSegment} from './motion.js';
import {RESIDENTIAL_RINGS,RESIDENTIAL_ROADS,RESIDENTIAL_CONTEXT,RESIDENTIAL_BUILDINGS} from './airport-residential-map.js';
export {RESIDENTIAL_RINGS,RESIDENTIAL_ROADS};
// Native outlines; facade heights, boundary positions and visit-room layout are photo estimates.
export const RESIDENTIAL_BLOCK={id:'regus-kofi-annan',name:'Airport Residential · Kofi Annan / Mary Dei',position:[-.1794,5.6173],rotation:0,width:300,depth:240,height:12,sourceIds:[1330242140,1330242138,2883827350,2883827352,2883827354,2883827346,2407935212,2746717488,2407935214,1337567096,2518360966,1330242142,1330242146,2883827358]};
export const residentialPoint=(x,z)=>offsetMetres(RESIDENTIAL_BLOCK.position,x,-z);
export const residentialLocal=p=>[(p[0]-RESIDENTIAL_BLOCK.position[0])*111320*Math.cos(RESIDENTIAL_BLOCK.position[1]*Math.PI/180),(RESIDENTIAL_BLOCK.position[1]-p[1])*111320];
export const residentialRect=(x,z,w,d,yaw=0)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([a,b])=>residentialPoint(x+a*Math.cos(yaw)+b*Math.sin(yaw),z-a*Math.sin(yaw)+b*Math.cos(yaw)));
export const REGUS_ARRIVAL=[-.18021,5.61712],REGUS_ENTRY=[-.18014,5.617091];
export const REGUS_PLACE={id:RESIDENTIAL_BLOCK.id,name:'Regus · 19 Kofi Annan Street',aliases:['Regus Airport Residential','Regus Accra Airport Residential Area','Regus 19 Kofi Annan Street'],lng:REGUS_ARRIVAL[0],lat:REGUS_ARRIVAL[1],type:'office',emoji:'💼',area:'Airport Residential · Kofi Annan Street',description:'Visit the white two-storey office, open carport, blue-carpet workspace, planted courtyard and kitchen.',activities:['explore','connect']};
const match=n=>/^regus(?:\s*[·,-]\s*19 kofi annan street|(?: -)? accra,? airport residential(?: area)?| airport residential| 19 kofi annan street)?$/i.test(n||'');
export const isRegus=p=>typeof p==='string'?match(p)&&p.toLowerCase()!=='regus':p?.id===REGUS_PLACE.id||match(p?.name)&&Number.isFinite(p?.lng)&&Number.isFinite(p?.lat)&&distanceMetres([p.lng,p.lat],[-.1800748,5.6169978])<65;
export const regusArrival=p=>isRegus(p)?{position:[...REGUS_ARRIVAL],target:[...REGUS_ENTRY],cameraPitch:14,hint:'Regus · 19 Kofi Annan Street · follow the marked entrance to the workspace, courtyard and kitchen.'}:null;
export const inResidentialBlock=p=>p[0]>=-.18055&&p[0]<=-.1778&&p[1]>=5.6163&&p[1]<=5.61776;
export const residentialWidth=(id,fallback)=>RESIDENTIAL_ROADS.find(r=>String(r.id)===String(id))?.width??fallback;
export const residentialRoadClear=(p,radius=0,except=null)=>!RESIDENTIAL_CONTEXT.some(r=>String(r.id)!==String(except)&&!['footway','path'].includes(r.kind)&&r.coordinates.slice(1).some((b,i)=>projectOnSegment(p,r.coordinates[i],b).distance<(residentialWidth(r.id,({trunk:14,primary:12,secondary:10,tertiary:8,service:5}[r.kind]||7)))/2+radius));
function inside(p,r){let c=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const a=r[i],b=r[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])c=!c;}return c;}
export const residentialBuildingClear=(p,r=0)=>!RESIDENTIAL_BUILDINGS.some(rings=>inside(p,rings[0])||r>0&&rings[0].slice(1).some((b,i)=>projectOnSegment(p,rings[0][i],b).distance<r));
export const RESIDENTIAL_WALLS=[
 {id:'west-north',a:[-.17926,5.61716],b:[-.17894,5.61716],height:2.5,cream:true},
 {id:'west-upper',a:[-.17894,5.61716],b:[-.17894,5.61690],height:2.5,cream:true},
 {id:'west-lower',a:[-.17894,5.61684],b:[-.17894,5.61670],height:2.5,cream:true},
 {id:'east-upper',a:[-.17865,5.61715],b:[-.17865,5.61681],height:3.2},
 {id:'east-lower',a:[-.17865,5.61675],b:[-.17865,5.61668],height:3.2},
 {id:'east-north-west',a:[-.17865,5.61715],b:[-.17839,5.61715],height:2.4},
 {id:'east-north-east',a:[-.17833,5.61715],b:[-.17802,5.61715],height:2.4},
];
export const RESIDENTIAL_TREES=[[-.17900,5.61712],[-.17900,5.61705],[-.17900,5.61697],[-.17900,5.61674],[-.17862,5.61712],[-.17858,5.61697],[-.17861,5.61668]].filter(p=>residentialRoadClear(p,1)&&residentialBuildingClear(p,.5));
export const RESIDENTIAL_SOUTH_TREES=[[-.17972,5.61722],[-.17964,5.61722],[-.17943,5.61721],[-.17930,5.61721]];
export const RESIDENTIAL_SOUTH_PALMS=[[-.17980,5.617205]];
export const RESIDENTIAL_FRONTAGE_PALMS=[[-.17959,5.617445],[-.17929,5.617445]];
export const RESIDENTIAL_FRONTAGE_BOARD={position:[-.17947,5.61744],width:.9,height:1.7};
export const RESIDENTIAL_FRONTAGE_TREES=[[-.18028,5.617445],[-.17992,5.617445],[-.17985,5.617445],[-.17972,5.61744]];
export const RESIDENTIAL_MASSES=[{id:'regus',source:1330242140,height:7.2,roof:1.5,cream:false},{id:'residence',source:2883827350,height:6.6,roof:2.1,cream:true,frontage:'hip-home'},
 {id:'residence-annex',source:2883827352,height:2.7,roof:1.1,cream:true,frontage:'annex'},
 {id:'residence-gatehouse',source:2883827354,height:2.7,roof:1.1,cream:true,frontage:'gatehouse'},
 {id:'mary-modern',source:2883827346,height:6.5,roof:2.1,cream:true,frontage:'modern'},
 {id:'kofi-veranda',source:2407935212,height:6.4,roof:1.6,cream:true,frontage:'veranda'},
 {id:'kofi-arched',source:2746717488,height:6.4,roof:.35,frontage:'arched'},
 {id:'kofi-screened',source:2407935214,height:6.1,roof:.35,frontage:'screened'},
 {id:'kofi-west-cream',source:1337567096,height:9.3,roof:1.9,frontage:'west-cream'},
 {id:'regus-street-block',source:2518360966,height:6.4,roof:.7,frontage:'south-grey'},
 {id:'ghana-life-frontage',source:1330242142,height:6.4,roof:.3,frontage:'south-glass'},
 {id:'south-balcony-house',source:1330242146,height:6.25,roof:.35,frontage:'south-screen'},
 {id:'south-tiled-house',source:2883827358,height:6.2,roof:2.0,frontage:'south-tiled'}];
// Public evidence only identifies exterior forms, not owners or private room layouts.
export const RESIDENTIAL_GATES=[
 {id:'west-home',a:[-.17894,5.61684],b:[-.17894,5.61690],height:2.35,color:'#343b3a'},
 {id:'west-modern',a:[-.17894,5.61655],b:[-.17894,5.61661],height:2.4,color:'#87654a',slatted:true},
 {id:'north-arch',a:[-.17943,5.61749],b:[-.17937,5.61749],height:2.1,color:'#555e63'},
 {id:'north-screened',a:[-.17982,5.61748],b:[-.17976,5.61748],height:2.6,color:'#5e3e31'},
 {id:'north-cream',a:[-.18016,5.61748],b:[-.18010,5.61748],height:2.6,color:'#5e3e31'},
 {id:'south-life',a:[-.179914,5.61716],b:[-.179864,5.61716],height:2.3,color:'#768563',slatted:true},
 {id:'south-balcony',a:[-.17959,5.617135],b:[-.17953,5.617135],height:2.4,color:'#5e3e31',panels:true},
 {id:'east-compound',a:[-.17865,5.61675],b:[-.17865,5.61681],height:2.8,color:'#aa9878'},
];
export const RESIDENTIAL_FRONTAGE_WALLS=[
 {id:'modern-upper',a:[-.17894,5.61670],b:[-.17894,5.61661],height:2.45,cream:true},
 {id:'modern-lower',a:[-.17894,5.61655],b:[-.17894,5.61647],height:2.45,cream:true},
 {id:'north-wire-west',a:[-.18038,5.617435],b:[-.18017,5.617435],height:.85,wire:true},
 {id:'north-wire-middle',a:[-.18009,5.617425],b:[-.17983,5.617425],height:.85,wire:true},
 {id:'north-wire-east',a:[-.17975,5.617415],b:[-.17964,5.617415],height:.85,wire:true},
 {id:'arch-hedge-base-west',a:[-.17963,5.61749],b:[-.17943,5.61749],height:.55,cream:true},
 {id:'arch-hedge-base-east',a:[-.17937,5.61749],b:[-.17910,5.61749],height:.55,cream:true},
 {id:'screened-west',a:[-.17996,5.61748],b:[-.17982,5.61748],height:2.4},
 {id:'screened-east',a:[-.17976,5.61748],b:[-.17964,5.61748],height:2.4},
 {id:'cream-west',a:[-.18038,5.61748],b:[-.18016,5.61748],height:2.3,cream:true},
 {id:'cream-east',a:[-.18010,5.61748],b:[-.17997,5.61748],height:2.3,cream:true},
 {id:'south-regus-screen',a:[-.180145,5.617287],b:[-.17994,5.617287],height:1.2,wire:true},
 {id:'south-life-east',a:[-.179864,5.61716],b:[-.17967,5.61716],height:1.8,cream:true,plain:true,color:'#b4c2ad'},
 {id:'south-life-west',a:[-.17994,5.61716],b:[-.179914,5.61716],height:1.8,cream:true,plain:true,color:'#b4c2ad'},
 {id:'south-balcony-west',a:[-.17967,5.617135],b:[-.17959,5.617135],height:2.1,cream:true,plain:true},
 {id:'south-balcony-east',a:[-.17953,5.617135],b:[-.17951,5.617135],height:2.1,cream:true,plain:true},
 {id:'south-tiled-boundary',a:[-.17944,5.61713],b:[-.17927,5.61713],height:2.4,cream:true,infill:true,plain:true},
 {id:'kofi-fence',a:[-.17936,5.61746],b:[-.17910,5.61746],height:1.05,cream:true,perforated:true},
];
RESIDENTIAL_WALLS.push(...RESIDENTIAL_FRONTAGE_WALLS);
export function residentialColliders(){const out=RESIDENTIAL_MASSES.map(m=>({id:'residential:'+m.id,rings:[RESIDENTIAL_RINGS[m.source]],height:m.height+m.roof,noDoor:true}));out.push({id:'residential:carport',rings:[RESIDENTIAL_RINGS[1330242138]],minHeight:3.2,height:3.5,noDoor:true});
 for(const [i,p] of RESIDENTIAL_RINGS[1330242138].slice(0,-1).entries()){const [x,z]=residentialLocal(p);out.push({id:'residential:carport-post-'+i,rings:[residentialRect(x,z,.22,.22)],height:3.2,noDoor:true});}
 for(const w of RESIDENTIAL_WALLS){const a=residentialLocal(w.a),b=residentialLocal(w.b),yaw=Math.atan2(a[1]-b[1],b[0]-a[0]);out.push({id:'residential:'+w.id,rings:[residentialRect((a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(a[0]-b[0],a[1]-b[1]),.25,yaw)],height:w.height,noDoor:true});}
 const veranda=RESIDENTIAL_RINGS[2407935212].map(residentialLocal),sx=Math.max(...veranda.map(p=>p[0]))-2.5,sz=Math.max(...veranda.map(p=>p[1]))+2.4;out.push({id:'residential:veranda-stair',rings:[residentialRect(sx,sz,1.7,4.8)],height:3.9,noDoor:true});
 for(const g of RESIDENTIAL_GATES){const a=residentialLocal(g.a),b=residentialLocal(g.b),yaw=Math.atan2(a[1]-b[1],b[0]-a[0]);out.push({id:'residential:gate:'+g.id,rings:[residentialRect((a[0]+b[0])/2,(a[1]+b[1])/2,Math.hypot(a[0]-b[0],a[1]-b[1]),.2,yaw)],height:g.height,noDoor:true});}
 for(const [i,p] of [...RESIDENTIAL_TREES,...RESIDENTIAL_FRONTAGE_TREES,...RESIDENTIAL_FRONTAGE_PALMS,...RESIDENTIAL_SOUTH_TREES,...RESIDENTIAL_SOUTH_PALMS].entries()){const [x,z]=residentialLocal(p);out.push({id:'residential:tree-'+i,rings:[residentialRect(x,z,.45,.45)],height:7,noDoor:true});}const [bx,bz]=residentialLocal(RESIDENTIAL_FRONTAGE_BOARD.position);out.push({id:'residential:frontage-board',rings:[residentialRect(bx,bz,RESIDENTIAL_FRONTAGE_BOARD.width,.08)],height:RESIDENTIAL_FRONTAGE_BOARD.height,noDoor:true});return out;
}
export const RESIDENTIAL_ACTIVITIES=[{id:'regus-enter',kind:'regus-enter',label:'Enter Regus workspace',position:REGUS_ENTRY,heading:180,elevation:0},{id:'regus-photo',kind:'photo',label:'Photograph Regus · Kofi Annan Street',position:REGUS_ARRIVAL,target:[-.18007,5.6169978],heading:bearingTo(REGUS_ARRIVAL,[-.18007,5.6169978]),elevation:0},{id:'mary-dei-guide',kind:'watch',label:'Explore the Mary Dei Amoah street frontage',position:[-.17891,5.61718],target:[-.1788,5.6169],elevation:0,text:'Airport Residential · Mary Dei Amoah Road meets Kofi Annan Street. Walled homes, office compounds, grass verges and covered drains. Private compounds remain closed.'}];
RESIDENTIAL_ACTIVITIES.push({id:'mary-frontage-view',kind:'watch',label:'View the Mary Dei roadside homes',position:[-.17886,5.61668],target:[-.17904,5.61659],elevation:0,text:'Mary Dei Amoah Road · red-tiled residential roofs, a brick stair tower, balcony rails and walled compounds. The private buildings are viewed from the street.'},{id:'kofi-frontage-view',kind:'watch',label:'View the Kofi Annan veranda house',position:[-.17921,5.61740],target:[-.17925,5.61761],elevation:0,text:'A cream house with a red hipped roof and shaded veranda behind a low perforated fence. July 2024 Street View informs this exterior; dimensions are estimates.'});
RESIDENTIAL_ACTIVITIES.push({id:'kofi-arched-view',kind:'watch',label:'View the arched Kofi Annan frontage',position:[-.17949,5.617425],target:[-.179506,5.61764],elevation:0,text:'A terracotta arch, shaded veranda and metal rails distinguish this compound. The street sign identifies Geodrill; July 2024 imagery informs the exterior. Private offices are closed.'},{id:'kofi-west-buildings-view',kind:'watch',label:'View the screened office and cream building',position:[-.17994,5.617445],target:[-.18003,5.61762],elevation:0,text:'Separate mapped buildings: white patterned screening and flat blue-grey fascia, beside a larger cream building with a brown hipped roof. Facades and boundaries are photo-informed estimates.'});
RESIDENTIAL_ACTIVITIES.push({id:'kofi-south-office-view',kind:'watch',label:'View Ghana Life and the Regus street frontage',position:[-.17983,5.617285],target:[-.17984,5.61703],elevation:0,text:'Ghana Life House has a green-framed glazed frontage beside the separate grey Regus street block. July 2024 Street View informs these exterior forms; the current Regus workspace entrance remains along the open western approach.'},{id:'kofi-south-home-view',kind:'watch',label:'View the south-side balcony and tiled roofs',position:[-.17953,5.61726],target:[-.17953,5.61701],elevation:0,text:'A cream building with patterned balcony screening and a neighbouring tiled-roof house sit in separate walled compounds. Heights, boundaries and concealed sides are estimates; private interiors remain closed.'});
export const nearResidential=p=>distanceMetres(p,REGUS_ARRIVAL)<27;
export function residentialPeople(t,p){if(!nearResidential(p))return null;const phase=t*.65%6,z=5.61712+(phase<3?phase:6-phase)/111320;return [{id:'regus-office-visitor',name:'Esi',avatar:'👩🏾',position:[-.180235,z],heading:phase<3?0:180,moving:true,speed:.65,elevation:0}];}
export const REGUS_STOCK=['water'];
const links=(area,z,x)=>['workspace','courtyard','kitchen'].filter(id=>id!==area).map((id,i)=>({id:'door:'+id,label:'Visit the '+id,x:i?x:-x,z}));
export const REGUS_AREAS={
 workspace:{name:'Regus · Kofi Annan workspace',width:8,depth:9,bounds:{left:-3.65,right:3.65,back:-4.15,front:4.15},spawn:[0,1.5],exit:[0,4],hotspots:[...links('workspace',3.5,2.3),{id:'work',label:'Work at the coding desk',x:-.8,z:-1.3},{id:'sit:workspace',label:'Sit at the workspace desk',x:2.2,z:-.8,seat:{x:2.2,z:-2.2,yaw:0}},{id:'guide',label:'Read the workspace guide',x:-2.5,z:2}]},
 courtyard:{name:'Regus · planted courtyard',width:4.8,depth:11,bounds:{left:-2.05,right:2.05,back:-5.15,front:5.15},spawn:[0,3],hotspots:[...links('courtyard',4.2,1.2),{id:'sit:courtyard',label:'Sit at the courtyard table',x:1.8,z:0,seat:{x:.9,z:0,yaw:Math.PI/2}},{id:'courtyard-guide',label:'Enjoy the courtyard',x:-1.2,z:2}]},
 kitchen:{name:'Regus · office kitchen',width:6,depth:6,bounds:{left:-2.65,right:2.65,back:-2.65,front:2.65},spawn:[0,.5],hotspots:[...links('kitchen',2,1.5),{id:'shop:water',label:'Get a Worldfolk bottled water',x:0,z:-1.2},{id:'kitchen-guide',label:'Read the kitchen guide',x:1.5,z:0}]}
};
export function createRegusVisit(initial='workspace'){
 let area=Object.hasOwn(REGUS_AREAS,initial)?initial:'workspace',position=[...REGUS_AREAS[area].spawn],active=null;
 return {get area(){return area},get position(){return [...position]},get active(){return active},move(p){if(!active)position=[...p]},nearby(){if(active)return {kind:'local',actionId:'stop-activity',label:'Stand up'};const l=REGUS_AREAS[area];if(l.exit&&Math.hypot(position[0]-l.exit[0],position[1]-l.exit[1])<.9)return {kind:'exit',label:'Leave Regus workspace'};const h=l.hotspots.find(h=>Math.hypot(position[0]-h.x,position[1]-h.z)<1.2);return h?{...h,kind:'local',actionId:h.id}:null},interact(id){if(typeof id!=='string'||this.nearby()?.actionId!==id)return null;const h=this.nearby();if(id==='stop-activity'){active=null;return {stopped:true}}if(id.startsWith('door:')){area=id.slice(5);position=[...REGUS_AREAS[area].spawn];return {area}}if(id.startsWith('sit:')){active={kind:'sit',seat:h.seat};return {active}}if(id==='work')return {panel:'work',context:{jobId:'regus-coder'}};if(id==='shop:water')return {panel:'shops',context:{title:'Regus kitchen · Worldfolk prices',kinds:['food'],itemIds:REGUS_STOCK}};return {dialogue:({guide:'Akwaaba! Use a desk for the fictional Worldfolk coding role, relax in the courtyard or visit the kitchen. These public rooms are a photo-informed game interpretation; private offices stay closed.', 'courtyard-guide':'A quiet planted court with turf, timber seating and a cantilever parasol. Sit as long as you like; select Stand up when you are ready.', 'kitchen-guide':'Keep the shared kitchen tidy. Bottled water uses Worldfolk cedis; this is not a real Regus purchase.'})[id]||'Welcome to the workspace.'}}};
}
