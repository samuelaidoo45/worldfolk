import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../public/game/three.module.js';
import {OSU_SITES,OSU_MASSES,OSU_ACTIVITIES,osuForPlace,osuPeople,osuFrontPoint} from '../public/game/osu-oxford-data.js';
import {OSU_MALL_PROPERTY,OSU_MALL_WING} from '../public/game/osu-oxford-map.js';
import {CITY_LANDMARKS,createCityLandmark,isCityLandmark} from '../public/game/city-landmarks.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {nearPrecinctActivity,createPrecinctLife} from '../public/game/precinct-life.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {roadWidth} from '../public/game/street-safety.js';
import {distanceMetres,projectOnSegment,bearingTo} from '../public/game/motion.js';
import {chaseCamera} from '../public/game/chase-camera.js';
import {modelCost} from '../public/game/world-streaming.js';
import {disposeScene} from '../public/game/render-utils.js';
const context=JSON.parse(readFileSync(new URL('./fixtures/osu-oxford-context.json',import.meta.url)));
const physics=origin=>{const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.buildings,isSourceLoaded:()=>true});p.refresh(origin,true);return p;};
function clearRoad(p,radius=.28){for(const f of context.roads){if(['path','steps','pedestrian'].includes(f.properties.class)||f.geometry.type!=='LineString')continue;const ps=f.geometry.coordinates;for(let i=1;i<ps.length;i++)assert.ok(projectOnSegment(p,ps[i-1],ps[i]).distance>roadWidth(f.properties.class)/2+radius,`${f.properties.name||f.id} carriageway at ${p}`);}}
test('canonical Osu destinations preserve Frankie’s ID and do not capture other branches',()=>{
 const index=indexPlaces([{name:"Frankie's Hotel",lng:-.1821117,lat:5.5611404,type:'hotel'},{name:'Papaye',lng:-.1820154,lat:5.5596303,type:'restaurant'},{name:'Papaye',lng:-.187,lat:5.667,type:'restaurant'}]);
 for(const s of OSU_SITES){assert.ok(CITY_LANDMARKS.includes(s));assert.equal(createCityLandmark(s).group.userData.osu.siteId,s.id);assert.equal(searchPlaceIndex(index,s.name).items.filter(p=>p.id===s.id).length,1);assert.deepEqual(landmarkArrival(s).position,s.arrival);assert.ok(isOutdoorLandmark(s));}
 assert.equal(OSU_SITES[0].id,'g_-1821_55612');assert.equal(searchPlaceIndex(index,'Frankies').items.length,1);assert.equal(searchPlaceIndex(index,'Papaye').items.length,2);assert.equal(osuForPlace({name:'Papaye',lng:-.187,lat:5.667}),undefined);assert.equal(osuForPlace({name:'Papaye'}),undefined);assert.equal(landmarkArrival({id:'osu'}).position[0],OSU_SITES[1].arrival[0]);
});
test('mapped building ownership is exact; mall property is not extruded or hidden',()=>{
 for(const id of [1179058850,1179058852,1179058864])assert.ok(isCityLandmark(id));
 assert.equal(isCityLandmark(1775975828),false);assert.equal(isCityLandmark(518160692),false);
 assert.equal(OSU_SITES[1].sourceIds.length,0);assert.notDeepEqual(OSU_MALL_PROPERTY,OSU_MALL_WING);
 for(const m of OSU_MASSES.filter(m=>m.geometrySource==='native-building-polygon'))assert.deepEqual(m.ring,context.buildings.find(f=>String(f.id)===m.id).geometry.coordinates[0]);
});
test('arrivals and activity points clear both native buildings and carriageways',()=>{
 for(const s of OSU_SITES){const p=physics(s.arrival);assert.equal(p.collision(s.arrival,.4),null,s.id);clearRoad(s.arrival,.4);const camera=chaseCamera({position:s.arrival,heading:bearingTo(s.arrival,s.target),physics:p,scenic:true});assert.equal(p.collision(camera.from,.25),null,s.id+' camera');assert.ok(camera.distance>3,s.id+' camera clearance');
  const hit=p.move(s.arrival,s.target,.3);assert.ok(hit.blocked,s.id);assert.ok(distanceMetres(p.move(hit.position,s.arrival,.3).position,s.arrival)<.1,s.id+' escape');
 }
 for(const a of OSU_ACTIVITIES){assert.equal(physics(a.position).collision(a.position,.3),null,a.id);clearRoad(a.position,.3);assert.equal(nearPrecinctActivity(a.position)?.id,a.id);}
});
test('visitors stay on public forecourts with bounded, continuous movement',()=>{
 for(const s of OSU_SITES){const p=physics(s.arrival);let previous=new Map();
  for(let t=0;t<35;t+=.25){const actors=osuPeople(t,s.arrival,720);assert.ok(actors.length<=6);for(const a of actors){assert.equal(p.collision(a.position,.28),null,a.id);clearRoad(a.position);if(previous.has(a.id))assert.ok(distanceMetres(a.position,previous.get(a.id))<=.18,a.id+' continuity');previous.set(a.id,a.position);}}
  assert.ok(createPrecinctLife().tick(0,s.arrival).every(a=>a.id.startsWith('osu:')));
 }
 assert.equal(osuPeople(0,[-.175,5.62]),null);
});
test('modest static geometry, complete silhouettes and finite attributes',()=>{
 let total=0;for(const s of OSU_SITES){const {group}=createCityLandmark(s),cost=modelCost(group),box=new T.Box3().setFromObject(group);assert.ok(cost.vertices<25000,s.id);assert.ok(cost.draws<18,s.id);assert.ok(box.max.y>=s.height-.5,s.id+' height');assert.ok(group.userData.osu.windowBays>20);total+=cost.vertices;group.traverse(o=>{if(o.isMesh){assert.ok(Array.from(o.geometry.attributes.position.array).every(Number.isFinite));assert.equal(o.geometry.attributes.uv.count,o.geometry.attributes.position.count);}});disposeScene(group);}assert.ok(total<55000);
});
test('new structure volumes do not block Oxford Street or its service access',()=>{
 const p=physics(OSU_SITES[1].position);
 for(const f of context.roads.filter(f=>[511734751,514875710,259080348].includes(f.id))){const ps=f.geometry.coordinates;for(let i=1;i<ps.length;i++)for(let n=0;n<=10;n++){const point=ps[i-1].map((v,j)=>v+(ps[i][j]-v)*n/10),hit=p.collision(point,.8);assert.ok(!hit||!String(hit.id).startsWith('osu:'),`${f.id} blocked by ${hit?.id}`);}}
});
