import {ASOM_FRAME,ASOM_NAVIGATION} from './castle-asomdwe-data.js';
import {SPANNER,SPANNER_NAVIGATION,stripLocal,surfaceHeight,surfaceOffset} from './spanner-data.js';
import {SQUARE_STANDS} from './square-stands.js';
import {offsetMetres,distanceMetres} from './motion.js';
// These same metre-space surfaces build the meshes and drive pedestrian physics.
export const PRECINCT_LANDMARKS=[SPANNER,...SQUARE_STANDS,
 {id:'independence-parade-ground',name:'Independence Square parade ground',position:[-.19256,5.54742],rotation:-11,width:210,depth:160,height:0},
 {id:'black-star-gate',name:'Black Star Gate',sourceId:339732252,position:[-.1928568532,5.54899685],rotation:101,width:25,depth:9,height:27},
 {id:'independence-arch',name:'Independence Arch',sourceId:339732244,position:[-.1924081,5.54647445],rotation:-11,width:50,depth:17,height:30},
 {id:'unknown-soldier',name:'Unknown Soldier Memorial',sourceId:1055196850,position:[-.1927328,5.54826075],rotation:-11,width:28,depth:18,height:16},
];
const NAVIGATION_SPACES=[...PRECINCT_LANDMARKS,ASOM_FRAME];
export function precinctPoint(data,x,z){const a=data.rotation*Math.PI/180;return offsetMetres(data.position,x*Math.cos(a)+z*Math.sin(a),x*Math.sin(a)-z*Math.cos(a))}
export function precinctLocal(data,position){const a=data.rotation*Math.PI/180,e=(position[0]-data.position[0])*111320*Math.cos(data.position[1]*Math.PI/180),n=(position[1]-data.position[1])*111320;return [e*Math.cos(a)+n*Math.sin(a),e*Math.sin(a)-n*Math.cos(a)]}
const cache=new Map();
export function precinctNavigation(data){
 if(data.id===ASOM_FRAME.id)return ASOM_NAVIGATION;
 if(data.id===SPANNER.id)return SPANNER_NAVIGATION;
 if(cache.has(data.id))return cache.get(data.id);
 const surfaces=[],solids=[];
 const floor=(x,z,w,d,y,kind='platform',base=y-.22)=>{const s={x,z,w,d,y,kind,base};if(w>0&&d>0)surfaces.push(s);return s};
 const solid=(x,z,w,d,base,top)=>solids.push({x,z,w,d,base,top});
 const stairs=(x,start,end,w,low,high,steps)=>{const run=(end-start)/steps;for(let i=0;i<steps;i++)floor(x,start+(i+.5)*run,w,Math.abs(run),low+(high-low)*(i+1)/steps,'step',low)};
 if(data.id==='independence-arch'){
  // Separate return flights leave headroom; both join full-width landings.
  for(const x of [-15,15]){
   stairs(x,25,9,3.2,0,11,55);
   stairs(Math.sign(x)*5,9,-7,3.2,11,17.2,31);
  }
  // Deck openings are kept around the stair wells, not filled with slabs.
  for(const [y,w,d] of [[11,46,20],[17.2,49,20]]){
   const stairX=y<12?15:5,start=y<12?9:-7,end=y<12?10:9;
   const cuts=[-w/2,-stairX-1.6,-stairX+1.6,stairX-1.6,stairX+1.6,w/2];
   for(let i=0;i<cuts.length-1;i++){
    const x=(cuts[i]+cuts[i+1])/2,width=cuts[i+1]-cuts[i];
    if(i===1||i===3){floor(x,(-10+start)/2,width,start+10,y);floor(x,(end+10)/2,width,10-end,y);}
    else floor(x,0,width,d,y);
   }
   // Continuous deck-edge guardrails; stair mouths are internal openings.
   for(const z of [-10,10]){if(y<12&&z===10){solid(0,z,26.2,.12,y,y+1.1);for(const side of [-1,1])solid(side*(w/2+16.9)/2,z,w/2-16.9,.12,y,y+1.1);}else solid(0,z,w,.12,y,y+1.1);}
   for(const x of [-w/2,w/2])solid(x,0,.12,20,y,y+1.1);
  }
  const edge=(y,outer)=>{let lo=0,hi=1;for(let i=0;i<20;i++){const t=(lo+hi)/2,h=2*(1-t)*t*(outer?27:25)+t*t*(outer?29.7:27.5);if(h<y)lo=t;else hi=t;}const t=(lo+hi)/2;return (1-t)**2*(outer?24:18)+2*(1-t)*t*(outer?12:10)+t*t*(outer?2:1.3)};
  for(let y=0;y<27;y+=.5){const outside=edge(y,true),inside=edge(y+.5,false);for(const side of [-1,1])solid(side*(outside+inside)/2,0,outside-inside,7.5,y,y+.5);}
  for(const x of [-12,0,12])solid(x,-4.8,.48,.48,11,16.6);
 }else if(data.id.startsWith('square-stand')){
  const w=data.width,d=data.depth,run=(d-3)/12;
  floor(0,d/2-.45,w,.9,.21,'step',0);
  for(let row=0;row<12;row++){
   const front=d/2-.9-row*run,top=.42+row*.36;
   for(let bay=0;bay<5;bay++)floor(-w/2+(bay+.5)*w/5,front-run/2,w/5-1.25,run,top,'terrace',0);
   for(let aisle=1;aisle<5;aisle++){const x=-w/2+aisle*w/5;floor(x,front-run/4,1.25,run/2,top-.18,'step',0);floor(x,front-run*.75,1.25,run/2,top,'step',0);}
   for(let bay=0;bay<5;bay++)solid(-w/2+(bay+.5)*w/5,front-run*.77,w/5-1.25,.3,top,top+.42);
  }
  floor(0,-d/2+1.15,w,1.9,4.38,'platform',0);
  for(const x of [-w/2,w/2])solid(x,0,.12,d,0,5.6);
  solid(0,-d/2+.2,w,.12,0,5.6);
 }else if(data.id==='unknown-soldier'){
  for(let i=0;i<5;i++)floor(0,0,28-i*.7,18-i*.7,(i+1)*.16,'step',0);
  solid(0,-1.8,2.8,2.8,.8,16);solid(0,4.3,4.5,4.5,.8,2.8);
 }
 const result={surfaces,solids};cache.set(data.id,result);return result;
}
function contains(s,x,z,pad=0){const [u,v]=stripLocal(s,x,z);return Math.abs(u)<=s.w/2+pad+1e-6&&Math.abs(v)<=s.d/2+pad+1e-6}
export function precinctFloors(position){
 const values=[0];for(const d of NAVIGATION_SPACES){if(distanceMetres(position,d.position)>65)continue;const [x,z]=precinctLocal(d,position),nav=precinctNavigation(d);
  // In a stair aisle a lower half-tread cuts into the terrace beneath it.
  const half=nav.surfaces.filter(s=>s.kind==='step'&&contains(s,x,z));
  for(const s of nav.surfaces){if(!contains(s,x,z))continue;if(s.kind==='terrace'&&half.some(h=>h.y<s.y&&s.y-h.y<.2))continue;values.push(surfaceHeight(s,x,z))}
 }return values;
}
export function floorHeight(position,previous=0){return precinctFloors(position).filter(y=>Math.abs(y-previous)<=.245).sort((a,b)=>b-a)[0]??null}
export function precinctCollision(position,radius=.3,elevation=0){
 for(const d of NAVIGATION_SPACES){if(distanceMetres(position,d.position)>65)continue;const [x,z]=precinctLocal(d,position),nav=precinctNavigation(d);
  for(const s of nav.solids){const rise=surfaceOffset(s,x,z);if(elevation<s.top+rise-.02&&elevation+1.75>s.base+rise+.05&&contains(s,x,z,radius))return d;}
  for(const s of nav.surfaces){const rise=surfaceOffset(s,x,z);if(s.y+rise<=elevation+.245||s.base+rise>=elevation+1.75)continue;
   if(s.kind==='terrace'&&nav.surfaces.some(h=>h.kind==='step'&&contains(h,x,z)&&h.y<=elevation+.245&&s.y-h.y<.2))continue;
   if(contains(s,x,z,s.kind==='step'?0:radius))return d;
  }
 }return null;
}
export function moveOnPrecinct(from,to,elevation,groundMove){
 const metres=distanceMetres(from,to),steps=Math.max(1,Math.ceil(metres/.12));let position=[...from],height=elevation||0,blocked=false;
 for(let i=0;i<steps;i++){
  const dx=(to[0]-from[0])/steps,dy=(to[1]-from[1])/steps;
  const attempt=p=>{const y=floorHeight(p,height);if(y===null||precinctCollision(p,.28,y))return null;const moved=groundMove(position,p,y);if(moved.blocked&&distanceMetres(moved.position,p)>.01)return null;return {position:p,height:y}};
  const next=attempt([position[0]+dx,position[1]+dy])||attempt([position[0]+dx,position[1]])||attempt([position[0],position[1]+dy]);
  if(!next){blocked=true;break}if(distanceMetres(next.position,[position[0]+dx,position[1]+dy])>.001)blocked=true;position=next.position;height=next.height;
 }return {position,elevation:height,blocked};
}
// Persist only a real surface height at this coordinate, and disallow vertical jumps.
export function validatedElevation(from,to,previous,requested,driving=false){
 if(driving)return Number(requested||0)===0?0:null;const y=Number(requested||0),saved=Number(previous||0),old=precinctFloors(from).some(h=>Math.abs(h-saved)<.03)?saved:0;if(!Number.isFinite(y)||y<0||y>18)return null;
 if(!precinctFloors(to).some(h=>Math.abs(h-y)<.03))return null;
 if(Math.abs(y-old)>.45+distanceMetres(from,to)*1.1)return null;return y;
}
