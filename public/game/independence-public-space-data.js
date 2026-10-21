import {SPACE_FENCES} from './independence-public-space-map.js';
export {SPACE_FENCES,SPACE_VERGES,SPACE_PATH_PIECES,SPACE_CROSSINGS} from './independence-public-space-map.js';
import {CIVIC_LAND,CIVIC_ROADS,CIVIC_BUILDINGS} from './independence-neighbourhood-map.js';
import {areaInside} from './mahama-neighbourhood-data.js';
import {offsetMetres,distanceMetres,projectOnSegment} from './motion.js';
import {roadWidth} from './street-safety.js';

// Native boundaries/courts; photo-informed objects have estimated placements.
// See docs/realism/independence-public-spaces.md for dates and remaining gaps.
export const PARK_RING=CIVIC_LAND.find(f=>f.id===1167623806).geometry.coordinates[0];
export const STADIUM_RING=CIVIC_LAND.find(f=>f.id===23053858).geometry.coordinates[0];
export const SPACE_EGG={id:'nationalism-egg',position:[-.19182,5.54972],radius:5.1,height:6.8,layoutEstimated:true};
export const SPACE_SERVICE={id:'nationalism-washrooms',position:[-.19159,5.549455],width:17,depth:5.4,height:5,rotation:-11,layoutEstimated:true};
export const SPACE_PLAY={id:'nationalism-playground',position:[-.19240,5.54972],width:21,depth:17,rotation:-11,layoutEstimated:true};
export const SPACE_HERITAGE=[
 {id:'crossroads-memorial',position:[-.19098,5.54953],width:15,depth:14,height:19,rotation:-11,layoutEstimated:true},
 {id:'bonnie-monument',position:[-.19230,5.54991],width:12,depth:5,height:4.2,rotation:-11,layoutEstimated:true},
];
export const SPACE_LIGHTS=[[-.19255,5.54994],[-.19236,5.55002],[-.19220,5.54995],[-.19231,5.54988],[-.19257,5.54986],[-.19248,5.55007]];
export const SPACE_GATES={park:[[-.19285,5.54977],[-.19215,5.55007],[-.191075,5.54979],[-.19142,5.54934]],stadium:[[-.19240,5.55046],[-.19367,5.55102],[-.19094,5.55117],[-.19212,5.55266]]};
export const SPACE_COURTS=CIVIC_LAND.filter(f=>[1202584024,1215781800,1215781802,1215781804].includes(f.id));
export function spaceRect(position,w,d,rotation=0){const a=rotation*Math.PI/180;return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([x,z])=>offsetMetres(position,x*Math.cos(a)+z*Math.sin(a),x*Math.sin(a)-z*Math.cos(a)));}
export function spacePoint(spec,x,z){const a=spec.rotation*Math.PI/180;return offsetMetres(spec.position,x*Math.cos(a)+z*Math.sin(a),x*Math.sin(a)-z*Math.cos(a));}
export const SPACE_SERVICE_SOLIDS=[{position:spacePoint(SPACE_SERVICE,-4,0),width:9,depth:5.4},{position:spacePoint(SPACE_SERVICE,4.5,2.65),width:8,depth:.2}];
export const SPACE_PLAY_BARRIERS=[{a:spacePoint(SPACE_PLAY,-10.5,-8.5),b:spacePoint(SPACE_PLAY,10.5,-8.5)},{a:spacePoint(SPACE_PLAY,-10.5,8.5),b:spacePoint(SPACE_PLAY,-1.8,8.5)},{a:spacePoint(SPACE_PLAY,1.8,8.5),b:spacePoint(SPACE_PLAY,10.5,8.5)}];
export const spaceRoadClear=(p,r=0)=>!CIVIC_ROADS.filter(v=>!['path','pedestrian','steps','cycleway'].includes(v.class)).some(v=>v.coordinates.slice(1).some((b,i)=>projectOnSegment(p,v.coordinates[i],b).distance<roadWidth(v.class)/2+r));
export const spaceBuildingClear=(p,r=0)=>!CIVIC_BUILDINGS.some(b=>areaInside(p,b.rings)||b.rings.some(v=>v.slice(1).some((q,i)=>projectOnSegment(p,v[i],q).distance<r)));
export const SPACE_PATHS=[
 [[-.19285,5.54977],[-.19247,5.54984],[-.19219,5.55006]],
 [[-.19247,5.54984],[-.19188,5.549955],[-.19142,5.54934]],
 [[-.19247,5.54984],[-.19240,5.54972],[-.19182,5.54972],[-.19122,5.54971],[-.19098,5.54953]],
 [[-.19182,5.54972],[-.19180,5.54958],[-.19159,5.54950]],
];
SPACE_PATHS.push(Array.from({length:33},(_,i)=>offsetMetres(SPACE_EGG.position,Math.cos(i*Math.PI/16)*7,Math.sin(i*Math.PI/16)*7)));
export function spaceObstacle(p,pad=0){return SPACE_SERVICE_SOLIDS.some(s=>areaInside(p,[spaceRect(s.position,s.width+2*pad,s.depth+2*pad,SPACE_SERVICE.rotation)]))||areaInside(p,[spaceRect(SPACE_PLAY.position,2.6+2*pad,2.6+2*pad,SPACE_PLAY.rotation)])||distanceMetres(p,SPACE_EGG.position)<SPACE_EGG.radius+pad||SPACE_HERITAGE.some(m=>areaInside(p,[spaceRect(m.position,m.width+2*pad,m.depth+2*pad,m.rotation)]));}
export function spaceLineRing(a,b,width){const p=a.map((n,k)=>(n+b[k])/2),angle=Math.atan2(b[0]-a[0],b[1]-a[1])*180/Math.PI;return spaceRect(p,width,distanceMetres(a,b),angle);}
export const SPACE_ACTIVITIES=[
 {id:'nationalism-egg-photo',kind:'photo',label:'Photograph the egg-on-stone sculpture',position:[-.19182,5.54964],target:SPACE_EGG.position,elevation:0,text:'Koklozi le kpedzi · an egg resting on stone, surrounded by cultural symbols.'},
 {id:'nationalism-play-watch',kind:'watch',label:'Explore the park playground',position:[-.19240,5.54960],target:SPACE_PLAY.position,elevation:0,text:'The park’s play area combines a coloured climbing tower and slide, a sand surface and a fenced turf zone.'},
 {id:'stadium-courts-watch',kind:'watch',label:'View the stadium tennis courts',position:[-.19345,5.55117],target:[-.19339,5.55142],elevation:0,text:'The stadium’s western sports area includes separately mapped tennis courts. Court positions follow the map; fence details are estimates.'},
];
const collisionCache=new Map();
export function spaceColliders(zone){if(collisionCache.has(zone))return collisionCache.get(zone);const result=[
 ...SPACE_FENCES.filter(f=>f.zone===zone).map((f,i)=>({id:'civic-fence-'+zone+i,rings:[spaceLineRing(f.a,f.b,.22)],height:f.height,noDoor:true})),
 ...(zone==='park'?[{id:SPACE_EGG.id,rings:[Array.from({length:25},(_,i)=>offsetMetres(SPACE_EGG.position,Math.cos(i*Math.PI/12)*SPACE_EGG.radius,Math.sin(i*Math.PI/12)*SPACE_EGG.radius))],height:SPACE_EGG.height,noDoor:true},...SPACE_SERVICE_SOLIDS.map((s,i)=>({id:SPACE_SERVICE.id+i,rings:[spaceRect(s.position,s.width,s.depth,SPACE_SERVICE.rotation)],height:SPACE_SERVICE.height,noDoor:true})),{id:'park-play-tower',rings:[spaceRect(SPACE_PLAY.position,2.6,2.6,SPACE_PLAY.rotation)],height:4.2,noDoor:true},{id:'park-play-slide',rings:[spaceRect(spacePoint(SPACE_PLAY,0,2.7),1.25,3.4,SPACE_PLAY.rotation)],height:1.7,noDoor:true},...SPACE_PLAY_BARRIERS.map((b,i)=>({id:'park-play-fence-'+i,rings:[spaceLineRing(b.a,b.b,.09)],height:1.1,noDoor:true})),...SPACE_LIGHTS.map((p,i)=>({id:'park-dandelion-'+i,rings:[spaceRect(p,.6,.6)],height:5.4,noDoor:true}))]:[]),
 ];collisionCache.set(zone,result);return result;}
