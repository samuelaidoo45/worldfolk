import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/three.module.js';
import {NKRUMAH_PARK,PARK_ACTIVITIES,parkPoint,parkLocal} from '../public/game/nkrumah-park-data.js';
import {createNkrumahPark} from '../public/game/nkrumah-park.js';
import {isCityLandmark,landmarkColliders} from '../public/game/city-landmarks.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {createPrecinctLife,nearPrecinctActivity} from '../public/game/precinct-life.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {distanceMetres} from '../public/game/motion.js';
import {disposeScene} from '../public/game/render-utils.js';
const physics=()=>{const p=createBuildingPhysics({queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true});p.refresh(NKRUMAH_PARK.position,true);return p};
test('mapped monument and museum shells are replaced and arrivals land on the clear fountain approach',()=>{
 for(const id of NKRUMAH_PARK.sourceIds)assert.equal(isCityLandmark(id),true);
 for(const name of ['Kwame Nkrumah Memorial Park','Nkrumah Memorial Park','Kwame Nkrumah Mausoleum']){const arrival=landmarkArrival({name});assert.ok(isOutdoorLandmark({name}));assert.ok(distanceMetres(arrival.position,parkPoint(0,76))<.01);assert.equal(physics().collision(arrival.position,.3,0),null)}
});
test('all activities are reachable; fountain water, piers, tomb, displays and walls have solid footprints',()=>{
 const p=physics();assert.equal(p.nearestDoor(parkPoint(0,49)),null,'pool edges must not create fake building doors');for(const s of PARK_ACTIVITIES){assert.equal(p.collision(s.position,.28,0),null,s.id);assert.equal(nearPrecinctActivity(s.position).id,s.id)}
 for(const [x,z] of [[9,49],[-14.5,0],[7.5,6],[0,0],[0,23],[10,-43],[-6,-42.5],[-7,-48]])assert.ok(p.collision(parkPoint(x,z),.28,0),`${x},${z}`);
 const approach=p.moveWalker(parkPoint(0,76),parkPoint(0,28),0);assert.ok(distanceMetres(approach.position,parkPoint(0,28))<.05);
 const gallery=p.moveWalker(parkPoint(0,-29),parkPoint(0,-46),0);assert.ok(distanceMetres(gallery.position,parkPoint(0,-46))<.05,'open gallery door');
 const pool=p.moveWalker(parkPoint(0,49),parkPoint(9,49),0);assert.ok(distanceMetres(pool.position,parkPoint(9,49))>5,'cannot walk into pool');
 const retreat=p.moveWalker(pool.position,parkPoint(0,49),0);assert.ok(distanceMetres(retreat.position,parkPoint(0,49))<.05,'can reverse after collision');
 assert.ok(landmarkColliders(NKRUMAH_PARK.position).some(c=>c.height===.35));
});
test('museum door is open in actual mesh geometry and overhead roof reveals only for visitors inside',()=>{
 const m=createNkrumahPark();m.group.rotation.y=0;m.group.updateMatrixWorld(true);
 const ray=new T.Raycaster(new T.Vector3(0,1.7,-29),new T.Vector3(0,0,-1),0,16);
 assert.equal(ray.intersectObject(m.group,true).length,0,'entrance and gallery aisle');
 const roof=m.group.getObjectByName('Museum roof');m.update(0,parkPoint(0,-40));assert.equal(roof.visible,false);m.update(1,parkPoint(0,76));assert.equal(roof.visible,true);
 for(const mesh of m.group.children.filter(o=>o.isMesh)){for(const v of mesh.geometry.attributes.position.array)assert.ok(Number.isFinite(v))}
 assert.ok(m.group.userData.batching.after<18);disposeScene(m.group);
});
test('park visitors follow continuous pedestrian paths, remain clear of pools and reduce at night',()=>{
 const life=createPrecinctLife(),p=physics();let previous;
 for(let t=0;t<260;t+=.5){const actors=life.tick(t,NKRUMAH_PARK.position,720);assert.equal(actors.length,8);for(const a of actors){const [x,z]=parkLocal(a.position);assert.ok(Math.abs(Math.abs(x)-23)<.01&&z>=-24.01&&z<=74.01);assert.equal(p.collision(a.position,.3,0),null);if(previous)assert.ok(distanceMetres(previous.find(b=>b.id===a.id).position,a.position)<.6,'no route-end teleport')}previous=actors}
 assert.equal(life.tick(0,NKRUMAH_PARK.position,0).length,2);
});
