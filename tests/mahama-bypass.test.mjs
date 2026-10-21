import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import * as T from '../public/game/three.module.js';
import {MAHAMA_SITES,MAHAMA_ROADS,MAHAMA_BRIDGES,MAHAMA_RAILS,NORTH_POLO_MASSES,NORTH_POLO_BUILDINGS,MAHAMA_ACTIVITIES,MAHAMA_PLACES,mahamaArrival,mahamaColliders,mahamaRoadClear,mahamaRoadPoint,mahamaPeople,mahamaVehicleSpawn,mahamaLocal,RAIL_UNDERSIDE,RAIL_GAUGE} from '../public/game/mahama-bypass-data.js';
import {createMahamaBypass} from '../public/game/mahama-bypass.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';import {CITY_LANDMARKS,isCityLandmark} from '../public/game/city-landmarks.js';
import {landmarkArrival} from '../public/game/landmark-arrival.js';import {nearPrecinctActivity} from '../public/game/precinct-life.js';import {roadFeatures} from '../public/game/road-cache.js';import {profiledRoadWidth,roadHeight} from '../public/game/road-elevation.js';import {distanceMetres,offsetMetres,bearingTo} from '../public/game/motion.js';import {disposeScene} from '../public/game/render-utils.js';
const context=JSON.parse(readFileSync(new URL('./fixtures/mahama-bypass-context.json',import.meta.url))),railSource=JSON.parse(readFileSync(new URL('./fixtures/mahama-rail-source.json',import.meta.url)));
function physics(position){const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.building,isSourceLoaded:()=>true});p.refresh(position,true);return p;}
test('native railway crosses over the bypass and continues to Shangri-La without inventing a road',()=>{
 assert.deepEqual(MAHAMA_RAILS,railSource.rails);assert.deepEqual(MAHAMA_BRIDGES.map(r=>r.id).sort(),[187792807,187792808]);assert.equal(RAIL_GAUGE,1.067);
 for(const r of MAHAMA_RAILS)assert.equal(r.properties.railway,'rail');
 assert.equal(MAHAMA_ROADS.some(r=>MAHAMA_RAILS.some(rail=>rail.id===r.id)),false);
 assert.ok(RAIL_UNDERSIDE>=5);for(const r of MAHAMA_ROADS.filter(r=>r.name==='Airport Bypass'))assert.equal(r.oneway,1);
});
test('eight northern buildings preserve individual mapped rings, including seven stables and the long shed',()=>{
 assert.equal(NORTH_POLO_MASSES.length,8);assert.equal(NORTH_POLO_BUILDINGS.filter(f=>f.properties.class==='stable').length,7);
 for(const b of NORTH_POLO_MASSES){assert.deepEqual(b.rings,context.building.find(f=>f.id===b.id).geometry.coordinates);assert.ok(isCityLandmark(b.id));}
 assert.equal(isCityLandmark(2491216764),true); // Added by the adjoining neighbourhood closure.assert.equal(isCityLandmark(81300070),false);
});
test('public guides and arrivals remain clear of traffic, buildings and retaining walls',()=>{
 for(let i=0;i<MAHAMA_PLACES.length;i++){const a=MAHAMA_ACTIVITIES[i],p=physics(a.position);assert.equal(p.collision(a.position,.5,0),null,a.id);assert.ok(mahamaRoadClear(a.position,.5),a.id);assert.deepEqual(landmarkArrival(MAHAMA_PLACES[i]),mahamaArrival(MAHAMA_PLACES[i]));assert.equal(nearPrecinctActivity(a.position)?.id,a.id);}
});
test('rendering, traffic and safety share native bypass paths and widths',()=>{
 const map={querySourceFeatures:()=>MAHAMA_ROADS.map(r=>({id:r.id,properties:{class:r.class},geometry:{type:'LineString',coordinates:[r.coordinates[0],r.coordinates.at(-1)]}}))};const out=roadFeatures(map);
 for(const r of MAHAMA_ROADS){assert.deepEqual(out.find(f=>f.id===r.id).geometry.coordinates,r.coordinates);assert.equal(profiledRoadWidth(r.id,99),r.width);}
});
test('cars and minibuses pass beneath both rail bridges in every lane without hitting deck or median supports',()=>{
 for(const [roadIds,centre,span] of [[[187792813,510192633],5.618674,.00026],[[510151406,515537582],5.61847,.00024]]){
  for(const id of roadIds){const road=MAHAMA_ROADS.find(r=>r.id===id),heading=road.oneway===1?(id===187792813||id===515537582?0:180):0;const p=physics(mahamaRoadPoint(id,centre));
   for(let lat=centre-span;lat<=centre+span;lat+=.000008){const mid=mahamaRoadPoint(id,lat);for(const east of [-road.width/4,0,road.width/4]){const point=offsetMetres(mid,east,0);assert.equal(roadHeight(point,heading,id),0);for(const kind of ['minibus','bus','truck'])assert.equal(p.vehicleCollision(point,heading,kind,id),false,id+' '+lat+' '+east+' '+kind);assert.equal(p.collision(point,.62,0),null);}}
  }
 }
});
test('roadside pedestrian stays continuous and clear of the road and retaining walls',()=>{let old;for(let t=0;t<30;t+=.25){const a=mahamaPeople(t,MAHAMA_ACTIVITIES[0].position)[0],p=physics(a.position);assert.ok(a);assert.equal(p.collision(a.position,.5,0),null);assert.ok(mahamaRoadClear(a.position,.5));if(old)assert.ok(distanceMetres(old.position,a.position)<.2);old=a;}});
test('owned vehicles spawn on the road side of both retaining walls within boarding distance',()=>{for(const a of MAHAMA_ACTIVITIES.slice(0,2)){const p=physics(a.position),car=mahamaVehicleSpawn(a.position,p,'minibus');assert.ok(car);assert.ok(distanceMetres(car.position,a.position)<7.5);assert.equal(p.vehicleCollision(car.position,car.heading,'minibus',car.roadId),false);const road=MAHAMA_ROADS.find(r=>r.id===car.roadId);assert.ok(road);assert.equal(mahamaVehicleSpawn([-.20,5.56],p),null);}});
test('retaining walls stop direct entry while allowing retreat, and overhead decks are height bounded',()=>{
 const p=physics(mahamaRoadPoint(187792813,5.61835)),a=mahamaRoadPoint(187792813,5.61835,4.5),b=mahamaRoadPoint(187792813,5.61835,8),hit=p.move(a,b,.5,0);assert.ok(hit.blocked);assert.ok(distanceMetres(p.move(hit.position,a,.5,0).position,a)<.1);
 for(const site of MAHAMA_SITES.filter(s=>s.family!=='stables')){const deck=mahamaColliders(site).find(c=>c.id.startsWith('rail-deck:'));assert.equal(deck.minHeight,RAIL_UNDERSIDE);}
});
test('geometry has finite UVs/normals, open bridge underpasses and separate northern roofs within a draw budget',()=>{
 let total=0;for(const site of MAHAMA_SITES){assert.ok(CITY_LANDMARKS.some(s=>s.id===site.id));const {group}=createMahamaBypass(site);group.updateMatrixWorld(true);let draws=0,vertices=0;group.traverse(o=>{if(!o.isMesh)return;draws++;const p=o.geometry.attributes.position;vertices+=p.count;assert.equal(o.geometry.attributes.uv.count,p.count);assert.ok(o.geometry.attributes.normal);for(const v of p.array)assert.ok(Number.isFinite(v));});assert.ok(draws<18);total+=vertices;
  if(site.family==='bypass'){const point=mahamaRoadPoint(187792813,5.618674),[x,z]=mahamaLocal(site,point),hits=new T.Raycaster(new T.Vector3(x,1,z),new T.Vector3(0,1,0)).intersectObject(group,true);assert.ok(hits.length);assert.ok(hits[0].point.y>=5,'underpass blocked by low geometry');}
  console.log(site.id,{draws,vertices});disposeScene(group);
 }assert.ok(total<240000);
});
