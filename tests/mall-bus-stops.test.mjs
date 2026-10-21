import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {gunzipSync} from 'node:zlib';
import * as T from '../public/game/three.module.js';
import {MALL_BUS_STOPS,BUS_STOP_PLACES,BUS_STOP_SEATS,BUS_STOP_ACTIVITIES,stopPoint,stopLocal,stopStructures,stopModules,stopTaxiBays,busStopForPlace,busStopPeople,busStopArrival} from '../public/game/mall-bus-stops-data.js';
import {createMallBusStop} from '../public/game/mall-bus-stops.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {nearPrecinctActivity,createPrecinctLife} from '../public/game/precinct-life.js';
import {roadWidth} from '../public/game/street-safety.js';
import {projectOnSegment,distanceMetres,bearingTo} from '../public/game/motion.js';
import {chaseCamera} from '../public/game/chase-camera.js';
import {disposeScene} from '../public/game/render-utils.js';
const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};
const roads=[0,1].flatMap(i=>JSON.parse(gunzipSync(readFileSync(`public/maps/accra-v1/source-road-${i}.geojson.gz`))).features).filter(f=>f.geometry.type==='LineString'&&!['path','steps','pedestrian','track'].includes(f.properties.class)&&!f.properties.layer);
function segments(stop){return roads.flatMap(r=>r.geometry.coordinates.slice(1).map((b,i)=>({r,a:r.geometry.coordinates[i],b}))).filter(v=>projectOnSegment(stop.position,v.a,v.b).distance<30);}
test('all stop sides are searchable outdoor places with clear arrivals and seats',()=>{
 const index=indexPlaces([]);
 for(const place of BUS_STOP_PLACES){const stop=MALL_BUS_STOPS.find(s=>s.id===place.id),found=searchPlaceIndex(index,place.name).items;assert.equal(found.filter(p=>p.id===place.id).length,1);assert.ok(isOutdoorLandmark(place));assert.deepEqual(landmarkArrival(place),busStopArrival(stop));const physics=createBuildingPhysics(map);physics.refresh(stop.position,true);assert.equal(physics.collision(landmarkArrival(place).position,.28,0),null);assert.ok(distanceMetres(stop.position,stop.mappedPosition)<9);
  for(const spot of BUS_STOP_ACTIVITIES.filter(a=>a.stopId===stop.id)){assert.equal(nearPrecinctActivity(spot.position).id,spot.id);assert.equal(physics.collision(spot.position,.28,0),null,spot.id);}
  for(const seat of BUS_STOP_SEATS.filter(a=>a.stopId===stop.id)){const start=stopPoint(stop,stopLocal(stop,seat.position)[0],3);const move=physics.moveWalker(start,seat.position,0);assert.ok(distanceMetres(move.position,seat.position)<.02);assert.ok(physics.collision(seat.seatPosition,.1,0)?.id.endsWith('-bench'));const camera=chaseCamera({position:seat.position,heading:seat.cameraHeading,physics,dt:1/60});assert.ok(camera.distance>3.2,'bench camera should face the open front and stop before parked taxis');const exit=physics.moveWalker(move.position,start,0);assert.ok(distanceMetres(exit.position,start)<.02);}
 }
});
test('shelter structures, pedestrian routes and boarding points stay outside mapped carriageways',()=>{
 for(const stop of MALL_BUS_STOPS){const local=segments(stop);assert.ok(local.length);const clearance=p=>Math.min(...local.map(v=>projectOnSegment(p,v.a,v.b).distance-roadWidth(v.r.properties.class)/2));
  for(const s of stopStructures(stop))for(const x of [-s.w/2,s.w/2])for(const z of [-s.d/2,s.d/2])assert.ok(clearance(stopPoint(stop,s.x+x,s.z+z))>.3,stop.id+' '+s.id);
  for(const spot of BUS_STOP_ACTIVITIES.filter(a=>a.stopId===stop.id))assert.ok(clearance(spot.position)>.6,spot.id);
  for(let t=0;t<60;t+=.5)for(const p of busStopPeople(stop,t)){assert.ok(clearance(p.position)>.7,p.id);const physics=createBuildingPhysics(map);physics.refresh(stop.position,true);if(p.action==='sit')assert.ok(physics.collision(p.position,.1,0)?.id.endsWith('-chairs'),p.id);else assert.equal(physics.collision(p.position,.28,0),null,p.id);}
  const physics=createBuildingPhysics(map);physics.refresh(stop.position,true);
  for(const {a,b} of local)for(let i=0;i<=10;i++){const p=a.map((v,j)=>v+(b[j]-v)*i/10);if(distanceMetres(p,stop.position)>20)continue;assert.equal(physics.vehicleCollision(p,bearingTo(a,b),'minibus'),false,'road lane obstructed by '+stop.id);}
 }
});
test('each cover has walking headroom, aligned bench geometry and bounded batches',()=>{
 for(const stop of MALL_BUS_STOPS){const model=createMallBusStop(stop);model.group.updateMatrixWorld(true);assert.ok(model.group.userData.batching.after<=16);assert.equal(model.group.userData.busStop.osmNode,stop.osmNode);for(const spot of BUS_STOP_SEATS.filter(a=>a.stopId===stop.id)){const q=stopLocal(stop,spot.seatPosition),a=Math.PI-stop.heading*Math.PI/180,v=new T.Vector3(q[0],0,q[1]).applyAxisAngle(new T.Vector3(0,1,0),a);const hits=new T.Raycaster(new T.Vector3(v.x,2,v.z),new T.Vector3(0,1,0)).intersectObject(model.group,true);assert.ok(hits.some(h=>h.point.y>2.6));}disposeScene(model.group);}
});
test('local waiting NPCs do not replace bridge visitors at the deck or wander onto roads',()=>{
 const life=createPrecinctLife();for(const stop of MALL_BUS_STOPS){const people=life.tick(5,stop.position,720);assert.equal(people.length,stop.variant==='spanner'?2:5);assert.ok(people.every(p=>p.id.startsWith(stop.id)));assert.equal(life.tick(5,stop.position,60).length,stop.variant==='spanner'?1:4);}
 const bridge=life.tick(5,[-.1762807,5.62060825],720);assert.ok(bridge.every(p=>p.id.startsWith('spanner-visitor-')));assert.ok(bridge.every(p=>p.elevation>6));
});

test('opposite row has a distinct identity, multiple covers and taxi clearance',()=>{
 const front=MALL_BUS_STOPS.find(s=>s.variant==='mall'),opposite=MALL_BUS_STOPS.find(s=>s.variant==='opposite');
 assert.equal(stopModules(front).length,3);assert.equal(stopModules(opposite).length,3);
 assert.equal(busStopForPlace({name:'Accra Mall taxi waiting area'}).id,opposite.id);
 assert.equal(busStopForPlace({name:'Spanner bus shelter'}).id,'spanner-bus-stop');
 const physics=createBuildingPhysics(map);physics.refresh(opposite.position,true);
 for(const bay of stopTaxiBays(opposite)){assert.ok(physics.collision(stopPoint(opposite,bay.x,bay.z),.2,0)?.id.endsWith(bay.id));}
 // The pedestrian corridor between the benches and parked taxis stays open.
 for(let x=-opposite.shelterWidth/2;x<=opposite.shelterWidth/2;x+=.4)assert.equal(physics.collision(stopPoint(opposite,x,2.6),.28,0),null);
 assert.ok(distanceMetres(front.position,opposite.position)>50);
});
