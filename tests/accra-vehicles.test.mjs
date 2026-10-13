import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/three.module.js';
import {createVehicle} from '../public/game/accra-vehicles.js';
import {VEHICLE_MODELS,vehicleSpec,trafficModelsForRoad} from '../public/game/vehicle-catalog.js';
import {GOODS} from '../public/game/life-catalog.js';
import {bodyContact} from '../public/game/vehicle-contacts.js';
import {footprintGap} from '../public/game/obstacle-motion.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {offsetMetres} from '../public/game/motion.js';
import {disposeScene} from '../public/game/render-utils.js';
const origin=[-.19,5.56],point=(x,y)=>offsetMetres(origin,x,y);

test('all Accra families have finite geometry, animated wheels and bounded render cost',()=>{
 for(const kind of Object.keys(VEHICLE_MODELS)){
  const model=createVehicle(kind);assert.equal(model.group.userData.vehicleKind,kind);
  const count=kind==='truck'?6:kind==='tricycle'?3:['motorcycle','bicycle'].includes(kind)?2:4;
  assert.equal(model.wheels.length,2);assert.equal(model.wheels[0].count,count);
  model.animateVehicle({distance:1,steer:.25,braking:true,preset:'night'},.1);
  assert.ok(Number.isFinite(model.wheelPhase));assert.ok(model.lights.tail.emissiveIntensity>2);
  let triangles=0,calls=0;model.group.traverse(o=>{if(!o.isMesh)return;calls++;const g=o.geometry;triangles+=(g.index?.count||g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);assert.ok([...g.attributes.position.array].every(Number.isFinite),kind)});
  assert.ok(calls<=32,kind+' draw calls');assert.ok(triangles<24000,kind+' triangle budget');
  const size=new T.Box3().setFromObject(model.group).getSize(new T.Vector3()),spec=vehicleSpec(kind);assert.ok(size.z<spec.length+.65,kind+' length');assert.ok(size.x<spec.width+.6,kind+' width');disposeScene(model.group);
 }
});
test('truck has rear dual wheels and only the front axle steers',()=>{
 const truck=createVehicle('truck');truck.animateVehicle({steer:.4},.1);for(let i=0;i<6;i++){const m=new T.Matrix4();truck.wheels[0].getMatrixAt(i,m);assert.equal(Math.abs(m.elements[2])>.1,i===0||i===3)}disposeScene(truck.group);
});
test('the new catalogue families can be bought through the existing vehicle shop',()=>{
 for(const id of ['minibus','truck','bicycle','tricycle']){const item=GOODS.find(g=>g.id===id);assert.equal(item.kind,'vehicle');assert.equal(item.price,vehicleSpec(id).price)}
 assert.ok(!trafficModelsForRoad(12,true).includes('bicycle'));assert.ok(!trafficModelsForRoad(12,true).includes('tricycle'));assert.ok(!trafficModelsForRoad(6).includes('truck'));assert.ok(trafficModelsForRoad(9).includes('minibus'));
});
test('both movable-object solvers use the visible fleet dimensions',()=>{
 for(const kind of Object.keys(VEHICLE_MODELS)){const spec=vehicleSpec(kind),a={position:origin,heading:0,driving:true,vehicle:kind};for(const [x,y,hit] of [[spec.width+.05,0,false],[spec.width-.05,0,true],[0,spec.length+.05,false],[0,spec.length-.05,true]]){const b={...a,position:point(x,y)};assert.equal(!!bodyContact(a,b),hit,kind);assert.equal(footprintGap(a,b)<0,hit,kind)}}
});
test('long vehicle nose meets a wall before its cabin centre reaches it and can reverse',()=>{
 const ring=[[point(-10,0),point(10,0),point(10,.25),point(-10,.25),point(-10,0)]];
 const physics=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>[{id:1,geometry:{type:'Polygon',coordinates:ring},properties:{height:8}}]});physics.refresh(point(0,-5),true);
 for(const kind of ['bus','truck','minibus']){const h=vehicleSpec(kind).length/2;assert.ok(physics.vehicleCollision(point(0,-h+.1),0,kind),kind);assert.ok(!physics.vehicleCollision(point(0,-h-.2),0,kind),kind);const hit=physics.moveVehicle(point(0,-7),point(0,4),0,kind);assert.ok(hit.blocked);assert.ok(!physics.moveVehicle(hit.position,point(0,-8),0,kind).blocked)}
});
test('tro-tro side windows open onto seats rather than a solid painted block',()=>{
 const bus=createVehicle('minibus');bus.group.updateMatrixWorld(true);const ray=new T.Raycaster(new T.Vector3(3,1.8,-.22),new T.Vector3(-1,0,0),0,2.6),hits=ray.intersectObject(bus.group,true);assert.ok(hits.some(h=>h.object.material.userData.surface==='glass'));assert.ok(!hits.some(h=>h.object.material.userData.surface==='paint'));disposeScene(bus.group);
});
