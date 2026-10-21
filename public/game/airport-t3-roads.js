import {corridorWidth} from './airport-corridor-data.js';
import {T3_ROADS} from './airport-t3-map.js';
import {CORRIDOR_ROADS} from './airport-corridor-map.js';
// The down-ramp ends on a separate native ground way. Include its profile so
// lane-following can leave bridge layer 1 at the shared zero-height endpoint.
const groundJoins=CORRIDOR_ROADS.filter(r=>[765383568,520275736].includes(r.id)&&!T3_ROADS.some(t=>t.id===r.id));
import {t3Local} from './airport-t3-space.js';
import {distanceMetres,bearingTo,projectOnSegment,offsetMetres} from './motion.js';
// Six metres is a photo estimate, shared by rendering, vehicle heights and
// clearance. It is not a vertical survey. Ramp endpoints meet ground at 0.
export const T3_DECK_HEIGHT=6;
const bridgeIds=new Set([626883873,626883875,626883872]);
const smooth=t=>{t=Math.min(1,Math.max(0,t));return t*t*(3-2*t);};
export const T3_ROAD_PROFILES=[...T3_ROADS,...groundJoins].filter(r=>!['path','pedestrian','cycleway','steps'].includes(r.class)).map(r=>{
 const lengths=r.coordinates.slice(1).map((p,i)=>distanceMetres(r.coordinates[i],p)),total=lengths.reduce((a,b)=>a+b,0);let run=0;
 return {...r,width:corridorWidth(r.id,bridgeIds.has(r.id)?9:r.class==='service'?5:7),segments:lengths.map((length,i)=>{const start=run/total;run+=length;return {a:r.coordinates[i],b:r.coordinates[i+1],length,start,end:run/total};}),height(p,t){return r.id===626883875?6:r.id===626883873?6*smooth(t):r.id===626883872?6*(1-smooth(t)):0;}};
});
const segments=T3_ROAD_PROFILES.flatMap(road=>road.segments.map(s=>({...s,road,heading:bearingTo(s.a,s.b)})));
const cell=(x,z)=>`${Math.floor(x/40)},${Math.floor(z/40)}`,cells=new Map();
for(const s of segments){const a=t3Local(s.a),b=t3Local(s.b),pad=s.road.width/2+1;for(let x=Math.floor((Math.min(a[0],b[0])-pad)/40);x<=Math.floor((Math.max(a[0],b[0])+pad)/40);x++)for(let z=Math.floor((Math.min(a[1],b[1])-pad)/40);z<=Math.floor((Math.max(a[1],b[1])+pad)/40);z++){const key=`${x},${z}`;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(s);}}
const gap=(a,b)=>Math.abs((a-b+540)%360-180);
export function airportRoadSurface(position,heading=0,roadId=null){
 const [x,z]=t3Local(position);if(Math.abs(x)>500||Math.abs(z)>350)return null;let best=null;
 for(const s of cells.get(cell(x,z))||[]){if(roadId!==null&&String(roadId)!==String(s.road.id))continue;const q=projectOnSegment(position,s.a,s.b);if(q.distance>s.road.width/2+.7)continue;const turn=Math.min(gap(heading,s.heading),gap(heading,s.heading+180));if(roadId===null&&turn>65)continue;const score=q.distance+turn*.12;if(!best||score<best.score){const t=s.start+(s.end-s.start)*q.t;best={height:s.road.height(q.position,t),position:q.position,roadId:s.road.id,layer:s.road.layer,heading:s.heading,score};}}
 return best;
}
export const T3_DECK_SEGMENTS=T3_ROAD_PROFILES.filter(r=>bridgeIds.has(r.id)).flatMap(r=>r.segments.flatMap(s=>{const count=Math.ceil(s.length/5);return Array.from({length:count},(_,i)=>{const a=s.a.map((v,j)=>v+(s.b[j]-v)*i/count),b=s.a.map((v,j)=>v+(s.b[j]-v)*(i+1)/count);return {a,b,heading:bearingTo(a,b),width:r.width,ya:r.height(a,s.start+(s.end-s.start)*i/count),yb:r.height(b,s.start+(s.end-s.start)*(i+1)/count)};});}));
export const T3_RAILS=T3_DECK_SEGMENTS.flatMap(s=>{const y=(s.ya+s.yb)/2;if(y<.8)return [];const a=s.heading*Math.PI/180,mid=s.a.map((v,j)=>(v+s.b[j])/2);return [-1,1].map(side=>({position:offsetMetres(mid,Math.cos(a)*side*(s.width/2+.15),-Math.sin(a)*side*(s.width/2+.15)),heading:s.heading,length:distanceMetres(s.a,s.b)+.05,y}));});
export function t3RailColliders(){return T3_RAILS.map((r,i)=>{const a=r.heading*Math.PI/180;return {id:'t3:rail-'+i,minHeight:Math.max(0,r.y-.4),height:r.y+1,noDoor:true,rings:[[[-.18,-r.length/2],[.18,-r.length/2],[.18,r.length/2],[-.18,r.length/2],[-.18,-r.length/2]].map(([x,z])=>offsetMetres(r.position,Math.cos(a)*x+Math.sin(a)*z,-Math.sin(a)*x+Math.cos(a)*z))]};});}
