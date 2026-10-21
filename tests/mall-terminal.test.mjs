import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/three.module.js';
import {MALL_TERMINAL,TERMINAL_PLACE,TERMINAL_SERVICES,TERMINAL_ARRIVAL,TERMINAL_SEATS,TERMINAL_WORK_CAR,terminalPoint,terminalLocal,terminalDeparture,insideTerminal,terminalPeople,terminalColliders} from '../public/game/mall-terminal-data.js';
import {TERMINAL_BOUNDARY} from '../public/game/mall-terminal-map.js';
import {createMallTerminal} from '../public/game/mall-terminal.js';
import {landmarkArrival} from '../public/game/landmark-arrival.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {makeRoadPath,advanceRoad,vehiclesOverlap} from '../public/game/traffic-routing.js';
import {nearPrecinctActivity,createPrecinctLife} from '../public/game/precinct-life.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {JOBS} from '../public/game/life-catalog.js';
import {disposeScene} from '../public/game/render-utils.js';
import {distanceMetres} from '../public/game/motion.js';
const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};
test('terminal search uses the mapped site and a clear pedestrian arrival',()=>{
 assert.equal(TERMINAL_BOUNDARY.length,6);assert.ok(insideTerminal(TERMINAL_ARRIVAL));
 const index=indexPlaces([{name:'Accra Mall Bus Terminal',type:'bus station',lng:MALL_TERMINAL.position[0],lat:MALL_TERMINAL.position[1]}]),found=searchPlaceIndex(index,'Accra Mall Bus Terminal').items;assert.equal(found.length,1);assert.equal(found[0].id,TERMINAL_PLACE.id);assert.deepEqual(landmarkArrival(found[0]).position,TERMINAL_ARRIVAL);
 const p=createBuildingPhysics(map);p.refresh(MALL_TERMINAL.position,true);assert.equal(p.collision(TERMINAL_ARRIVAL,.35,0),null);assert.equal(p.vehicleCollision(TERMINAL_WORK_CAR,0,'minibus'),false);
});
test('every bay admits a minibus departure while other parked vehicles remain solid',()=>{
 for(const service of TERMINAL_SERVICES){const p=createBuildingPhysics(map,()=>({transit:{terminalId:MALL_TERMINAL.id,serviceId:service.id}}));p.refresh(MALL_TERMINAL.position,true);
  assert.equal(p.vehicleCollision(service.vehiclePosition,0,'minibus'),false);
  for(const other of TERMINAL_SERVICES.filter(s=>s!==service))assert.equal(p.vehicleCollision(other.vehiclePosition,0,'minibus'),true);
  const path=makeRoadPath(terminalDeparture(service),1.6);let move={distance:0,speed:0};for(let i=0;i<6000&&move.distance<path.total;i++)move=advanceRoad(path,move.distance,move.speed,1/60,p,[],'minibus');assert.ok(move.distance>path.total-.05,`${service.id} blocked at ${move.distance}/${path.total}`);
 }
 for(let i=0;i<TERMINAL_SERVICES.length;i++)for(let j=i+1;j<TERMINAL_SERVICES.length;j++)assert.equal(vehiclesOverlap(TERMINAL_SERVICES[i].vehiclePosition,0,TERMINAL_SERVICES[j].vehiclePosition,0,'minibus','minibus'),false);
});
test('boarding points and waiting passengers stay out of the clear driving corridor',()=>{
 const p=createBuildingPhysics(map);p.refresh(MALL_TERMINAL.position,true);
 for(let t=0;t<90;t+=.5){const people=terminalPeople(t,720);assert.ok(people.length<=13);for(const a of people){assert.ok(insideTerminal(a.position),a.id);if(a.action==='sit')assert.equal(p.collision(a.position,.28,0)?.id,'terminal-bench-1');else assert.equal(p.collision(a.position,.28,0),null,a.id);for(const service of TERMINAL_SERVICES){const path=makeRoadPath(terminalDeparture(service));for(let d=0;d<path.total;d+=3)assert.ok(distanceMetres(a.position,path.at(d).position)>2,a.id+' in departure lane');}}}
 for(const s of TERMINAL_SERVICES)assert.equal(nearPrecinctActivity(s.platform).serviceId,s.id);
 for(const s of TERMINAL_SEATS)assert.equal(nearPrecinctActivity(s.position).kind,'sit');
 const boarded={terminalId:MALL_TERMINAL.id,serviceId:'airport'},life=createPrecinctLife();assert.ok(!life.tick(1,MALL_TERMINAL.position,720,boarded).some(p=>p.id.startsWith('terminal-queue-0-')));
});
test('the authored waiting area is open and a departed vehicle is removed from rendering and collision',()=>{
 const model=createMallTerminal();model.group.updateMatrixWorld(true);assert.ok(model.group.userData.batching.after<=14);assert.equal(model.group.userData.terminal.parkedVehicles,3);
 model.update(1,MALL_TERMINAL.position,{transit:{terminalId:MALL_TERMINAL.id,serviceId:'airport'}});assert.equal(model.group.getObjectByName('Terminal bay 1 minibus').visible,false);assert.equal(model.group.getObjectByName('Terminal bay 2 minibus').visible,true);
 const ray=new T.Raycaster(new T.Vector3(24,2,-40),new T.Vector3(0,1,0));assert.ok(ray.intersectObject(model.group,true).some(h=>h.point.y>3.2));
 assert.equal(terminalColliders({transit:{terminalId:'another-terminal',serviceId:'airport'}}).filter(c=>c.id.startsWith('terminal-parked')).length,3);
 const job=JOBS.find(j=>j.id==='mall-trotro');assert.equal(job.place,TERMINAL_PLACE.id);assert.equal(job.vehicle,'minibus');assert.equal(job.steps[1].place,'airport');assert.equal(job.wage,180);disposeScene(model.group);
});
