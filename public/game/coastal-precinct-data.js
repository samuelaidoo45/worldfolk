import {offsetMetres,distanceMetres} from './motion.js';
import {COAST_GROUND,COAST_WALKS,COAST_WALLS,COAST_TREES} from './coastal-precinct-map.js';
export {COAST_GROUND,COAST_WALKS,COAST_WALLS,COAST_TREES};
// Dated view reconstruction: paths/surfaces are game navigation estimates,
// not a surveyed public right of way or the unbuilt Marine Drive masterplan.
export const COAST_SITES=[
 {id:'independence-shore-west',zone:'shore-west',name:'Ghana Club · coastal road surroundings',position:[-.1962,5.5462],width:330,depth:390,height:0,rotation:0,sourceIds:[]},
 {id:'independence-shore-east',zone:'shore-east',name:'Independence Arch · coastal approach',position:[-.19265,5.54543],width:490,depth:250,height:0,rotation:0,sourceIds:[]},
];
export const COAST_BOUNDS=[-.1976,5.5445,-.1905,5.5479];
export const CLUB_GATE={position:[-.197198,5.54702],width:5};
export const CLUB_WALL_OUTLINE=[
 [[-.19714,5.54683],[-.19683,5.54691]],
 [[-.19683,5.54691],[-.19672,5.54720]],
 [[-.19725,5.54719],[-.19714,5.54683]],
];
// Broad bare plots / sparse cover observed overhead. No residential zoning is
// treated as proof of paving, no map pixels and no speculative tower models.
export const COAST_SURFACE_SEEDS=[
 {id:'club-open-ground',kind:'earth',ring:[[-.19750,5.54778],[-.19533,5.54778],[-.19503,5.54627],[-.19678,5.54595],[-.19750,5.54778]]},
 {id:'western-lower-plots',kind:'earth',ring:[[-.19701,5.54622],[-.19502,5.54625],[-.19497,5.54530],[-.19660,5.54487],[-.19701,5.54622]]},
 {id:'square-coastal-ground',kind:'earth',ring:[[-.19498,5.54627],[-.19327,5.54625],[-.19139,5.54654],[-.19053,5.54625],[-.19053,5.5445],[-.19505,5.5445],[-.19498,5.54627]]},
 {id:'club-north-tree-ground',kind:'grass',ring:[[-.19723,5.54743],[-.19692,5.54743],[-.19687,5.54725],[-.19715,5.54719],[-.19723,5.54743]]},
 {id:'club-garden',kind:'grass',ring:[[-.19721,5.54700],[-.19688,5.54700],[-.19679,5.54690],[-.19718,5.54682],[-.19721,5.54700]]},
 {id:'central-sparse-green',kind:'sparse',ring:[[-.19663,5.54701],[-.19612,5.54704],[-.19586,5.54689],[-.19593,5.54645],[-.19648,5.54631],[-.19664,5.54659],[-.19663,5.54701]]},
 {id:'coast-verge-green',kind:'sparse',ring:[[-.19473,5.54613],[-.19415,5.54628],[-.19386,5.54603],[-.19413,5.54573],[-.19474,5.54566],[-.19473,5.54613]]},
];
export const COAST_TREE_SEEDS=[
 {position:[-.19720,5.54727],height:8.3,radius:4.2},
 {position:[-.19720,5.54740],height:8.6,radius:4.5},
 {position:[-.19690,5.54720],height:7.2,radius:4.0},
 {position:[-.19713,5.54687],height:7.5,radius:3.6},
 {position:[-.19685,5.54690],height:8,palm:true,radius:2.4},
 {position:[-.19681,5.54701],height:7,palm:true,radius:2.4},
 {position:[-.19745,5.54752],height:8,radius:4},
];
export const COAST_ACTIVITIES=[
 {id:'ghana-club-facade-photo',kind:'photo',label:'Photograph Ghana Club',position:[-.19715,5.546945],target:[-.19704,5.54712],elevation:0,text:'Ghana Club · green timber siding, pale shutters and a raised concrete frame beneath the hipped roof. The exterior uses dated references; current compound details remain provisional.'},

];
export const CLUB_TANK={position:[-.196889,5.547132],radius:.95,height:7};
export const COAST_VISITS=[{id:'independence-coastal-road-visit',site:'shore-west',name:'Ghana Club to Independence coastal road',aliases:['Marine Drive coastal approach'],position:[-.19658,5.54512],target:[-.1954,5.54518],emoji:'🌊',type:'attraction',text:'Explore the mapped coastal road, compacted verges, open bare plots and sparse vegetation. This outdoor game walk does not reconstruct the unbuilt Marine Drive masterplan or guarantee real-world access.'}];
export const COAST_WALK_ROUTE=[[-.19712,5.54698],CLUB_GATE.position,[-.197222,5.54702],[-.197206,5.54694],[-.19694,5.54617],[-.19676,5.5456],[-.19655,5.54499],[-.19588,5.54512],[-.1949,5.5453],[-.19345,5.54547],[-.1928,5.54556],[-.19268,5.5457],[-.19265,5.54575]];
export function coastLineRing(a,b,width){const dx=(b[0]-a[0])*110800,dy=(b[1]-a[1])*111320,len=Math.hypot(dx,dy),x=-dy/len*width/2,y=dx/len*width/2;const ring=[offsetMetres(a,x,y),offsetMetres(b,x,y),offsetMetres(b,-x,-y),offsetMetres(a,-x,-y)];return [...ring,ring[0]];}
const cache=new Map();
export function coastColliders(zone){if(!cache.has(zone))cache.set(zone,[
 ...COAST_WALLS.filter(w=>w.zone===zone).map((w,i)=>({id:'coastal-wall-'+i,rings:[coastLineRing(w.a,w.b,.26)],height:w.height,noDoor:true})),
 ...(zone==='club'?[{id:'ghana-club-tank',rings:[Array.from({length:17},(_,i)=>offsetMetres(CLUB_TANK.position,Math.cos(i*Math.PI/8)*1.3,Math.sin(i*Math.PI/8)*1.3))],height:CLUB_TANK.height,noDoor:true}]:[]),
 ...COAST_TREES.filter(t=>t.zone===zone).map((t,i)=>({id:'coastal-tree-'+i,rings:[coastLineRing(offsetMetres(t.position,0,-.18),offsetMetres(t.position,0,.18),.36)],height:t.height,noDoor:true})),
 ]);return cache.get(zone);}
