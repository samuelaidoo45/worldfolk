import {offsetMetres,bearingTo} from './motion.js';
// Bundled OSM building features (encoded IDs); photo-estimated vertical detail.
// Source: docs/realism/the-signature.md. Footprints are not survey drawings.
export const SIGNATURE={id:'the-signature',name:'The Signature Apartments',position:[-.174646,5.625977],rotation:0,width:155,depth:155,height:49,sourceIds:[2249549204,2249549206]};
export const SIGNATURE_BOUNDARY=[[-.1755747,5.6259584],[-.1751348,5.6258216],[-.174544,5.6264761],[-.1741371,5.6261212],[-.174821,5.6251302],[-.1755895,5.6256994],[-.1755747,5.6259584]];
export const signaturePoint=(x,z)=>offsetMetres(SIGNATURE.position,x,-z);
export const signatureLocal=p=>[(p[0]-SIGNATURE.position[0])*111320*Math.cos(SIGNATURE.position[1]*Math.PI/180),(SIGNATURE.position[1]-p[1])*111320];
const rings=[
 [[-.1743878,5.6261706],[-.1742453,5.6260824],[-.1745645,5.6255712],[-.174707,5.6256594],[-.1743878,5.6261706]],
 [[-.1745515,5.6263587],[-.1744094,5.6262207],[-.1748958,5.6257249],[-.1750379,5.6258629],[-.1745515,5.6263587]],
];
export const SIGNATURE_TOWERS=rings.map((ring,i)=>{
 const p=ring.slice(0,4).map(signatureLocal),north=p[0].map((v,j)=>(v+p[1][j])/2),south=p[2].map((v,j)=>(v+p[3][j])/2);
 return {ring,sourceId:SIGNATURE.sourceIds[i],centre:north.map((v,j)=>(v+south[j])/2),length:Math.hypot(north[0]-south[0],north[1]-south[1]),width:Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]),rotation:Math.atan2(south[1]-north[1],north[0]-south[0]),levels:14};
});
export const COURT={centre:[9,0],rotation:-.65,pool:[4.4,18],bench:[-10,13],walk:[[-22,30],[-12,18],[-3,6],[6.5,-5],[20,-17]]};
export const SIGNATURE_ARRIVAL=signaturePoint(-31,38);
export const SIGNATURE_PLACE={id:'signature',name:SIGNATURE.name,lng:SIGNATURE_ARRIVAL[0],lat:SIGNATURE_ARRIVAL[1],area:'Tetteh Quarshie',type:'Apartments',category:'apartments',emoji:'🏙️',description:'Explore the stepped twin towers and their landscaped courtyard beside Accra Mall.',activities:['stroll','connect']};
export const isSignature=place=>place?.id==='signature'||/^(the )?signature apartments$/i.test(place?.name||'');
// Use the same polygon for the pool render and its collision. Keep the coping
// narrow enough that walking space is not blocked before reaching the edge.
export function courtPoint(x,z){const a=COURT.rotation;return [COURT.centre[0]+x*Math.cos(a)+z*Math.sin(a),COURT.centre[1]-x*Math.sin(a)+z*Math.cos(a)]}
export const SIGNATURE_POOL_RING=[[-2.4,-9.2],[2.4,-9.2],[2.4,9.2],[-2.4,9.2],[-2.4,-9.2]].map(p=>signaturePoint(...courtPoint(...p)));
export const SIGNATURE_PROPS=[[-36,25,5.2,.3,2.4],[-10,13,.65,2.2,.95],[-18,22,1.2,1.2,1.2],[-15,17,1.2,1.2,1.2],[-7,14,1.2,1.2,1.2],[-25,35,1.2,1.2,1.2]];
export function signatureColliders(){return SIGNATURE_TOWERS.map((t,i)=>({id:`the-signature:tower-${i}`,rings:[t.ring],height:49,noDoor:true})).concat([{id:'the-signature:pool',rings:[SIGNATURE_POOL_RING],height:.24,noDoor:true}],SIGNATURE_PROPS.map(([x,z,w,d,height],i)=>({id:`the-signature:prop-${i}`,height,noDoor:true,rings:[[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>signaturePoint(x+dx,z+dz))]})));}
export const SIGNATURE_ACTIVITIES=[
 {id:'signature-photo',kind:'photo',label:'Photograph The Signature',position:SIGNATURE_ARRIVAL,target:SIGNATURE.position,elevation:0,text:'The Signature · its stepped twin towers frame a courtyard with deep balconies and bronze bands.'},
 {id:'signature-seat',kind:'sit',label:'Sit in the Signature courtyard',position:signaturePoint(-11.2,13),seatPosition:signaturePoint(...COURT.bench),heading:90,elevation:0,offset:-.45},
].map(p=>({...p,heading:p.heading??bearingTo(p.position,p.target)}));
