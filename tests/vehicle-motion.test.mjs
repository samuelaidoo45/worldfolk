import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/game/three.module.js';
import {createCar,createBus} from '../public/game/vehicle-models.js';
import {updateVehicleMotion} from '../public/game/vehicle-motion.js';
import {disposeScene} from '../public/game/render-utils.js';
import {offsetMetres} from '../public/game/motion.js';

test('four wheels share two draws and roll one revolution per circumference',()=>{
 const car=createCar();assert.equal(car.wheels.length,2);assert.ok(car.wheels.every(m=>m.isInstancedMesh&&m.count===4));
 const radius=car.group.userData.wheelRadius;car.animateVehicle({distance:radius*Math.PI},.05);assert.ok(Math.abs(car.wheelPhase+Math.PI)<1e-6);
 car.animateVehicle({distance:-radius*Math.PI},.05);assert.ok(Math.abs(car.wheelPhase)<1e-6);
 car.animateVehicle({steer:.4},.1);const front=new THREE.Matrix4(),rear=new THREE.Matrix4();car.wheels[0].getMatrixAt(0,front);car.wheels[0].getMatrixAt(1,rear);assert.ok(Math.abs(front.elements[2])>.1);assert.ok(Math.abs(rear.elements[2])<.001);
 disposeScene(car.group);
});
test('brake lights release and headlights follow time of day',()=>{
 const car=createCar();car.animateVehicle({preset:'day'},.1);const day=car.lights.headlight.emissiveIntensity;
 car.animateVehicle({preset:'night'},.1);assert.ok(car.lights.headlight.emissiveIntensity>day*4);const night=car.lights.tail.emissiveIntensity;
 car.animateVehicle({braking:true,preset:'night'},.1);assert.ok(car.lights.tail.emissiveIntensity>night*3);
 for(let i=0;i<5;i++)car.animateVehicle({preset:'night'},.1);assert.equal(car.lights.tail.emissiveIntensity,night);disposeScene(car.group);
});
test('streamed vehicles retain cached wheels after another car is disposed',()=>{
 const a=createCar(),b=createCar();assert.equal(a.wheels[0].geometry,b.wheels[0].geometry);let disposed=0;a.wheels[0].geometry.addEventListener('dispose',()=>disposed++);disposeScene(a.group);assert.equal(disposed,0);b.animateVehicle({distance:1},.05);assert.ok(Number.isFinite(b.wheelPhase));disposeScene(b.group);
});
test('travel samples handle reverse, steering, stopping and location jumps',()=>{
 const calls=[],model={animateVehicle:(input,dt)=>calls.push({input,dt})};const p=[-.19,5.55];updateVehicleMotion(model,p,0,.05);
 updateVehicleMotion(model,offsetMetres(p,0,1),0,.05);assert.ok(Math.abs(calls.at(-1).input.distance-1)<.01);
 updateVehicleMotion(model,offsetMetres(p,0,.5),0,.05);assert.ok(calls.at(-1).input.distance<0);
 updateVehicleMotion(model,offsetMetres(p,.1,1),10,.05);assert.ok(calls.at(-1).input.steer<0);
 updateVehicleMotion(model,offsetMetres(p,.1,1),10,.05);assert.equal(calls.at(-1).input.braking,true);
 updateVehicleMotion(model,offsetMetres(p,1000,0),10,.05);assert.equal(calls.at(-1).input.distance,undefined);assert.equal(model.motionSpeed,0);
});
test('bus cabin is open behind windows and uses tinted glazing without depth writes',()=>{
 const bus=createBus(),windows=[];bus.group.traverse(o=>{if(o.material?.userData.surface==='glass')windows.push(o)});assert.ok(windows.length>0);assert.ok(windows.every(o=>o.material.transparent&&o.material.opacity<.8&&!o.material.depthWrite));
 // A ray through an upper side window should reach the cabin, not a solid bus block.
 const ray=new THREE.Raycaster(new THREE.Vector3(3,2.35,0),new THREE.Vector3(-1,0,0),0,2.9);bus.group.updateMatrixWorld(true);const hits=ray.intersectObject(bus.group,true);assert.ok(hits.some(h=>h.object.material.userData.surface==='glass'));assert.ok(!hits.some(h=>h.object.material.userData.surface==='paint'));
 disposeScene(bus.group);
});
