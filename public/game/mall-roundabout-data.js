import {MALL_APPROACH_ROADS} from './mall-roundabout-map.js';
import {offsetMetres,distanceMetres,bearingTo,projectOnSegment} from './motion.js';
export const MALL_ROUNDABOUT={id:'accra-mall-roundabout',name:'Accra Mall roundabout',position:[-.1752002,5.62128665],rotation:0,width:410,depth:360,height:0};
export const roundaboutLocal=p=>[(p[0]-MALL_ROUNDABOUT.position[0])*111320*Math.cos(MALL_ROUNDABOUT.position[1]*Math.PI/180),(MALL_ROUNDABOUT.position[1]-p[1])*111320];
export const roundaboutPoint=(x,z)=>offsetMetres(MALL_ROUNDABOUT.position,x,-z);
const byId=new Map(MALL_APPROACH_ROADS.map(r=>[r.id,r]));
// Follow the stored one-way direction, without replacing the mapped circle by an ideal circle.
export const MALL_CIRCLE=[...byId.get(40651982).coordinates,...byId.get(510192630).coordinates.slice(1),...byId.get(510192625).coordinates.slice(1),...byId.get(510192621).coordinates.slice(1),...byId.get(510192617).coordinates.slice(1)];
export const circleDistance=p=>Math.min(...MALL_CIRCLE.slice(1).map((b,i)=>projectOnSegment(p,MALL_CIRCLE[i],b).distance));
export const MALL_ISLAND=MALL_CIRCLE.map(p=>{const [x,z]=roundaboutLocal(p),r=Math.hypot(x,z),u=(r-7.3)/r;return roundaboutPoint(x*u,z*u)});
export const ROUNDABOUT_FOUNTAIN={radius:5.3,height:1.16};
export const ROUNDABOUT_ARRIVAL=[-.1752786,5.6209119];
export const ROUNDABOUT_PLACE={id:MALL_ROUNDABOUT.id,name:MALL_ROUNDABOUT.name,lng:ROUNDABOUT_ARRIVAL[0],lat:ROUNDABOUT_ARRIVAL[1],area:'Accra Mall · Spanner · Spintex Road',type:'Roundabout',emoji:'🔄',description:'See the Tetteh Quarshie cocoa-pod statue and fountain, and follow the mapped pedestrian approach from Spanner towards Accra Mall.',activities:['stroll']};
export const isMallRoundabout=p=>p?.id===MALL_ROUNDABOUT.id||/^(accra mall|mall[- ]side) roundabout( and approaches)?$/i.test(p?.name||'');
export const ROUNDABOUT_ACTIVITY={id:'mall-roundabout-view',kind:'watch',label:'Watch the mall roundabout traffic',position:ROUNDABOUT_ARRIVAL,elevation:0,heading:bearingTo(ROUNDABOUT_ARRIVAL,MALL_ROUNDABOUT.position),text:'Accra Mall approach · Tetteh Quarshie holds a cocoa pod above the blue-rimmed fountain. One-way traffic circulates around its lawn. Use the pedestrian route towards Spanner.'};
export const ROUNDABOUT_WALK=[ROUNDABOUT_ARRIVAL,[-.1750172,5.6210373]];
// A playable marked crossing at the mapped Spanner-path/road junction.
// Its paint is game guidance, not a claim of a surveyed zebra crossing.
const approach=byId.get(40651992).coordinates;
export const ROUNDABOUT_CROSSING={position:[-.1754389,5.6209024],heading:bearingTo(approach[7],approach[8]),width:14};
// Shared by ambient drivers, public transport and auto-driving through trafficSpeed.
// An entering driver yields to circulating traffic; an exiting/circulating driver keeps moving.
export function mallRoundaboutLimit(position,heading,actors=[],id=''){
 const radius=distanceMetres(position,MALL_ROUNDABOUT.position);if(radius>62)return Infinity;
 const headingIn=Math.abs(((bearingTo(position,MALL_ROUNDABOUT.position)-heading+540)%360)-180);
 if(radius<28||headingIn>65)return 7;
 const entering=actors.some(a=>a.id!==id&&a.driving&&distanceMetres(a.position,MALL_ROUNDABOUT.position)<28&&circleDistance(a.position)<7&&distanceMetres(a.position,position)<25);
 return entering?Math.sqrt(2*3*Math.max(0,radius-30)):10;
}
export function mallRoundaboutColliders(){return [{id:'mall-roundabout-island',rings:[MALL_ISLAND],height:.16,noDoor:true,precinctWalkable:true},{id:'quarshie-fountain',rings:[Array.from({length:49},(_,i)=>roundaboutPoint(Math.sin(i*Math.PI/24)*(ROUNDABOUT_FOUNTAIN.radius+.1),Math.cos(i*Math.PI/24)*(ROUNDABOUT_FOUNTAIN.radius+.1)))],height:ROUNDABOUT_FOUNTAIN.height,noDoor:true}];}
