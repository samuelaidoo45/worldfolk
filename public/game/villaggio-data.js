import {offsetMetres,bearingTo,distanceMetres} from './motion.js';
// Mapped footprints with photo-estimated vertical subdivisions. See reference record.
export const VILLAGGIO={id:'villaggio-vista',name:'Villaggio Vista',position:[-.1781,5.6205],rotation:0,width:250,depth:160,height:72,sourceIds:[1216282334, 1216282338, 1216282328, 1216282326, 1216282324]};
export const VILLAGGIO_ROTATION=-.568;
export const villaggioPoint=(x,z)=>{const a=VILLAGGIO_ROTATION;return offsetMetres(VILLAGGIO.position,x*Math.cos(a)+z*Math.sin(a),x*Math.sin(a)-z*Math.cos(a));};
export const villaggioLocal=p=>{const x=(p[0]-VILLAGGIO.position[0])*111320*Math.cos(VILLAGGIO.position[1]*Math.PI/180),z=(VILLAGGIO.position[1]-p[1])*111320,a=VILLAGGIO_ROTATION;return [x*Math.cos(a)-z*Math.sin(a),x*Math.sin(a)+z*Math.cos(a)];};
export const VILLAGGIO_RINGS={"1216282324": [[-0.1778668, 5.6201022], [-0.1778354, 5.6201505], [-0.1777012, 5.6200641], [-0.1777687, 5.6199604], [-0.1779028, 5.6200468], [-0.1778668, 5.6201022]], "1216282326": [[-0.1780893, 5.6201698], [-0.1779028, 5.6200468], [-0.1779257, 5.6199875], [-0.1781268, 5.6201077], [-0.1780893, 5.6201698]], "1216282328": [[-0.1779756, 5.6203508], [-0.1777801, 5.620229], [-0.1778354, 5.6201505], [-0.1778668, 5.6201022], [-0.1779028, 5.6200468], [-0.1780893, 5.6201698], [-0.1779756, 5.6203508]], "1216282334": [[-0.1775904, 5.6205695], [-0.1775605, 5.6206173], [-0.1773583, 5.620492], [-0.1773882, 5.6204442], [-0.1775518, 5.6201828], [-0.177754, 5.6203082], [-0.1775904, 5.6205695]], "1216282338": [[-0.1785184, 5.6211198], [-0.1783316, 5.6210006], [-0.1777837, 5.620651], [-0.1778641, 5.6205262], [-0.1784121, 5.6208758], [-0.1785989, 5.620995], [-0.1785184, 5.6211198]]};
// Rectangular massing follows the almost orthogonal source parts. Roof elevations
// are intentionally not exposed as walkable floors until verified access is authored.
export const VILLAGGIO_BLOCKS=[
 {id:'alto-core',family:'yellow',x:57,z:-17.5,w:26,d:30,bottom:0,top:48,end:'north'},
 {id:'alto-cantilever',family:'yellow',x:57,z:-23,w:26,d:41,bottom:48,top:72,end:'north',sky:true},
 {id:'aqua-wing',family:'green',x:-27.8,z:-24.9,w:96.7,d:16.3,bottom:0,top:21,end:'west'},
 {id:'aqua-raised',family:'green',x:-64,z:-24.9,w:24.3,d:16.3,bottom:21,top:39,end:'west'},
 {id:'azure-main',family:'red',x:33.3,z:18.6,w:25.3,d:24.2,bottom:0,top:42,end:'north',sky:true},
 {id:'azure-overhang',family:'red',x:33.7,z:34.5,w:25.1,d:7.2,bottom:21,top:42,end:'south'},
 {id:'azure-low',family:'red',x:54.5,z:24,w:17.4,d:13.4,bottom:0,top:18,end:'south'},
];
export const VILLAGGIO_ARRIVAL=villaggioPoint(8,-5);
export const VILLAGGIO_PLACE={id:'villaggio',name:'Villaggio Vista',lng:VILLAGGIO_ARRIVAL[0],lat:VILLAGGIO_ARRIVAL[1],area:'Tetteh Quarshie',type:'Apartments',category:'apartments',emoji:'🏙️',description:'Explore the yellow, green and red patterned towers and garden approach.',activities:['stroll','connect']};
export const isVillaggio=p=>p?.id==='villaggio'||/^villag+io vista$/i.test(p?.name||'')||(/^villag+io$/i.test(p?.name||'')&&Number.isFinite(p.lng)&&Number.isFinite(p.lat)&&distanceMetres([p.lng,p.lat],VILLAGGIO.position)<150);
export const VILLAGGIO_WALK=[[8,-5],[-10,-5],[-32,-5],[-47,-5]];
export const VILLAGGIO_BENCH=[-32,-10];
export const VILLAGGIO_PROPS=[[-32,-10,2.3,.7,.9],[-40,-10,2,2,1],[-20,-10,2,2,1],[0,-10,2,2,1],[-51,-10,2,2,1]];
export function villaggioRectangle(x,z,w,d){return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>villaggioPoint(x+dx,z+dz));}
export function villaggioColliders(){return VILLAGGIO_BLOCKS.filter(b=>b.bottom===0).map(b=>({id:`villaggio:${b.id}`,rings:[villaggioRectangle(b.x,b.z,b.w,b.d)],height:b.top,noDoor:true})).concat(VILLAGGIO_PROPS.map(([x,z,w,d,height],i)=>({id:`villaggio:prop-${i}`,rings:[villaggioRectangle(x,z,w,d)],height,noDoor:true})));}
export const VILLAGGIO_ACTIVITIES=[
 {id:'villaggio-photo',kind:'photo',label:'Photograph Villaggio Vista',position:VILLAGGIO_ARRIVAL,target:villaggioPoint(57,-20),elevation:0,text:'Villaggio Vista · three colour families, patterned facades and projecting upper floors.'},
 {id:'villaggio-seat',kind:'sit',label:'Sit in the Villaggio garden',position:villaggioPoint(-32,-8.8),seatPosition:villaggioPoint(...VILLAGGIO_BENCH),heading:180+VILLAGGIO_ROTATION*180/Math.PI,elevation:0,offset:-.45},
].map(p=>({...p,heading:p.heading??bearingTo(p.position,p.target)}));
