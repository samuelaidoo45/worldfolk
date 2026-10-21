import {roadHeight,profiledRoadWidth} from './road-elevation.js';
import {roadFeatures} from './road-cache.js';
import {projectOnSegment,offsetMetres,distanceMetres,bearingTo} from './motion.js';
export const roadWidth=kind=>({motorway:16,trunk:14,primary:11,secondary:9,tertiary:8,service:5,pedestrian:4,path:2,steps:2}[kind]||7);
export const isHighway=kind=>kind==='motorway'||kind==='trunk';
export function sweptHit(previous,next,person,radius=1.4){return projectOnSegment(person,previous,next).distance<radius}
export const pedestrianDamage=(speed,highway=false)=>Math.min(100,Math.max(0,Math.round((speed-1.5)*(highway?8:6))));
export function createStreetSafety(map,physics){let roads=[],lastScan=0;
 function scan(){if(performance.now()-lastScan<1200)return;lastScan=performance.now();const seen=new Set();roads=[];for(const f of roadFeatures(map)){const kind=f.properties?.class;if(/rail|ferry/.test(kind)||f.properties?.structure==='tunnel')continue;for(const line of f.geometry.type==='LineString'?[f.geometry.coordinates]:f.geometry.type==='MultiLineString'?f.geometry.coordinates:[]){const key=JSON.stringify([line[0],line.at(-1)]);if(seen.has(key))continue;seen.add(key);for(let i=1;i<line.length;i++)roads.push({roadId:f.id??null,a:line[i-1],b:line[i],kind,width:profiledRoadWidth(f.id,roadWidth(kind)),name:f.properties?.name||''})}}}
 function at(position){scan();let best=null;for(const r of roads){const point=projectOnSegment(position,r.a,r.b);if(roadHeight(point.position,bearingTo(r.a,r.b),r.roadId)>2.2)continue;if(!best||point.distance<best.distance)best={...r,...point}}if(!best||best.distance>best.width/2+3)return {kind:'off-road',onRoad:false,highway:false};return {...best,onRoad:!['path','pedestrian','steps','cycleway'].includes(best.kind)&&best.distance<best.width/2,highway:isHighway(best.kind)}}
 function sidewalk(position){const road=at(position);if(!road.onRoad)return position;const east=(road.b[0]-road.a[0])*110800,north=(road.b[1]-road.a[1])*111320,len=Math.hypot(east,north)||1;for(const side of [1,-1]){const p=offsetMetres(road.position,north/len*(road.width/2+1.3)*side,-east/len*(road.width/2+1.3)*side);if(distanceMetres(position,p)<20&&!physics.collision(p,.65))return p}return position}
 return {at,sidewalk};
}
