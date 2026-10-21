import {offsetMetres,distanceMetres,bearingTo} from './motion.js';
import {NEIGHBOUR_RINGS} from './villaggio-neighbours-map.js';

// Seven mapped buildings in three connected visits. Heights and facade bay
// subdivisions are photo estimates, not a survey. See villaggio-neighbours.md.
export const NEIGHBOUR_SITES=[
 {id:'villaggio-primavera',name:'Villaggio Primavera',position:[-.17916,5.62065],width:170,depth:120,height:22,sourceIds:[1216282304,1216282306,1216282308,1216282310,1216282318],family:'primavera',arrival:[-.17898,5.620285],target:[-.17923,5.62043],emoji:'🏘️',type:'apartments',description:'Explore the earlier Villaggio blocks, pitched roofs, recessed balconies and planted courtyard.'},
 {id:'santoku',name:'Santoku',position:[-.178354,5.620369],width:39,depth:38,height:4.8,sourceIds:[1216282314],family:'santoku',arrival:[-.17846,5.62019],target:[-.17836,5.62032],emoji:'🍽️',type:'restaurant',description:'Visit the timber-screened restaurant frontage and shaded terrace at Villaggio.'},
 {id:'african-regent-hotel',name:'African Regent Hotel',position:[-.17678,5.61902],width:98,depth:110,height:22,sourceIds:[1025799036],family:'regent',arrival:[-.17713,5.61938],target:[-.17693,5.61915],emoji:'🏨',type:'hotel',description:'Explore the peach-coloured hotel, arched entrance, garden approach and pool-side terrace.'},
];
export const NEIGHBOUR_BUILDINGS=NEIGHBOUR_SITES.flatMap(s=>s.sourceIds.map((sourceId,i)=>({sourceId,siteId:s.id,family:s.family,rings:[NEIGHBOUR_RINGS[sourceId]],height:s.family==='primavera'?[19.2,19.2,16,16,19.2][i]:s.family==='regent'?19.2:4.8})));
export const NEIGHBOUR_PLACES=NEIGHBOUR_SITES.map(s=>({id:s.id,name:s.name,lng:s.arrival[0],lat:s.arrival[1],area:'Villaggio / Airport West',type:s.type,category:s.type,emoji:s.emoji,description:s.description,activities:['stroll','explore','connect']}));
export function neighbourForPlace(p){return NEIGHBOUR_SITES.find(s=>s.id===p?.id||s.name.toLowerCase()===String(p?.name||'').replace(/^the /i,'').toLowerCase());}
export function neighbourLocal(site,p){return [(p[0]-site.position[0])*111320*Math.cos(site.position[1]*Math.PI/180),(site.position[1]-p[1])*111320];}
export const neighbourPoint=(site,x,z)=>offsetMetres(site.position,x,-z);
function clip(points,axis,value,keepLess){
 const inside=p=>keepLess?p[axis]<=value:p[axis]>=value,out=[];
 for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib){const t=(value-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,j)=>v+(b[j]-v)*t));}}
 return out;
}
// Hotel pool wing is visibly lower than its room wings. The subdivision follows
// the native outline, but its internal dividing lines are photo interpretations.
// September 2024 Liberation Road evidence also places the east-facing return
// at two storeys; keep the northern room block tall instead of a six-storey street wall.
export const NEIGHBOUR_MASSES=NEIGHBOUR_BUILDINGS.flatMap(b=>{
 if(b.family!=='regent')return [b];const site=NEIGHBOUR_SITES.find(s=>s.id===b.siteId),pts=b.rings[0].slice(0,-1).map(p=>neighbourLocal(site,p)),south=clip(pts,1,-4,false);
 return [{points:clip(pts,1,-4,true),height:19.2},{points:clip(south,0,10,false),height:6.4},{points:clip(south,0,10,true),height:6.4}].map((part,i)=>({...b,part:i,height:part.height,rings:[[...part.points,part.points[0]].map(p=>neighbourPoint(site,...p))]}));
});
// Estimated roof details must sit entirely on the retained tall western roof.
export const REGENT_ROOF_DETAILS=[{x:-22,z:-17,w:3.5,d:4,base:19.2,height:2.8},{x:-18,z:-7,w:3.5,d:4,base:19.2,height:2.8}];
export function neighbourRect(site,x,z,w,d){return [[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2],[x-w/2,z-d/2]].map(p=>neighbourPoint(site,...p));}
// Small approach features only; no invented perimeter wall across mapped roads.
export const NEIGHBOUR_PROPS={
 'villaggio-primavera':[{kind:'seat',x:31,z:38,w:2.2,d:.65,h:.95},{kind:'planter',x:12,z:37,w:2,d:1.2,h:.65}],
 santoku:[{kind:'seat',x:-13,z:8,w:2.2,d:.7,h:.95},{kind:'planter',x:-16,z:3,w:1.2,d:2,h:1.2},{kind:'planter',x:-16,z:13,w:1.2,d:2,h:1.2}],
 'african-regent-hotel':[{kind:'seat',x:-34,z:-39,w:2.2,d:.7,h:.95},{kind:'planter',x:-30,z:-39,w:1.5,d:1.5,h:.6}],
};
const cubic=(a,b,c,d,t)=>a*(1-t)**3+3*b*t*(1-t)**2+3*c*t*t*(1-t)+d*t**3;
export const PRIMAVERA_POOL=[[[ -20,-3],[-21,-13],[-4,-14],[5,-8]],[[5,-8],[13,-3],[7,8],[-3,8]],[[-3,8],[-10,8],[-21,5],[-20,-3]]].flatMap(points=>Array.from({length:12},(_,i)=>[0,1].map(j=>cubic(...points.map(p=>p[j]),i/12)))).concat([[-20,-3]]);
export const neighbourColliders=site=>NEIGHBOUR_MASSES.filter(b=>b.siteId===site.id).map(b=>({id:`neighbours:${b.sourceId}:${b.part??0}`,rings:b.rings,height:b.height,noDoor:true})).concat((NEIGHBOUR_PROPS[site.id]||[]).map((p,i)=>({id:`neighbours:${site.id}:prop-${i}`,rings:[neighbourRect(site,p.x,p.z,p.w,p.d)],height:p.h,noDoor:true})),site.family==='primavera'?[{id:'neighbours:primavera-pool',rings:[PRIMAVERA_POOL.map(p=>neighbourPoint(site,...p))],height:.2,noDoor:true}]:site.family==='regent'?[{id:'neighbours:regent-pool',rings:[neighbourRect(site,-38,7,16.8,20.8)],height:.2,noDoor:true},{id:'neighbours:regent-wading-pool',rings:[Array.from({length:33},(_,i)=>neighbourPoint(site,-38+3.6*Math.cos(i*Math.PI/16),21+3.6*Math.sin(i*Math.PI/16)))],height:.2,noDoor:true},{id:'neighbours:regent-wall',rings:[neighbourRect(site,-50,-1, .4,56)],height:2.2,noDoor:true}]:[]);
export const NEIGHBOUR_ACTIVITIES=NEIGHBOUR_SITES.flatMap(s=>{
 const p=NEIGHBOUR_PROPS[s.id][0],seat=neighbourPoint(s,p.x,p.z);
 return [{id:`neighbours:${s.id}:photo`,kind:'photo',label:`Photograph ${s.name}`,position:s.arrival,target:s.target,elevation:0,heading:bearingTo(s.arrival,s.target)},
 {id:`neighbours:${s.id}:seat`,kind:'sit',label:`Sit outside ${s.name}`,position:neighbourPoint(s,p.x,p.z+1.2),seatPosition:seat,elevation:0,heading:180,offset:-.45}];
});
export const nearbyNeighbour=p=>NEIGHBOUR_SITES.find(s=>distanceMetres(p,s.arrival)<(s.family==='primavera'?60:45));
export function neighbourPeople(seconds,position,minute=720){
 const s=nearbyNeighbour(position);if(!s)return null;
 const seat=NEIGHBOUR_ACTIVITIES.find(a=>a.id===`neighbours:${s.id}:seat`),[x,z]=neighbourLocal(s,s.arrival),length=s.family==='primavera'?12:5;
 // Short interpreted visitor paths along each clear approach, not on roads.
 return Array.from({length:minute>=360&&minute<1260?2:1},(_,i)=>{
  if(i===1)return {id:`neighbours:${s.id}:visitor-seat`,name:'Esi',avatar:'👩🏾',position:seat.seatPosition,elevation:0,heading:180,speed:0,moving:false,action:'sit',poseOffset:-.45};
  const speed=.8,phase=seconds*speed%(length*2),forward=phase<length,step=forward?phase:2*length-phase,p=neighbourPoint(s,x-step,z);
  return {id:`neighbours:${s.id}:visitor-walk`,name:'Kojo',avatar:'👨🏾',position:p,elevation:0,heading:forward?270:90,speed,moving:true};
 });
}
