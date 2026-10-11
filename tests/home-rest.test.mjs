import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/game/three.module.js';
import {createRoomAction,restPrompt,REST_SPOTS,applyRestPose} from '../public/game/resting.js';
import {createActor} from '../public/game/world3d.js';
import {createRoomPhysics} from '../public/game/room-physics.js';

test('sleep and sitting remain active until explicitly ended, including after long tab suspension',()=>{
 for(const kind of ['sleep','relax','shower','dance']){
  let time=10;const action=createRoomAction('home',()=>time);
  assert.equal(action.start(kind),true);time+=86400*7;
  assert.equal(action.active,true);assert.equal(action.resting,kind);
  assert.equal(action.frame(time).blend,1);
  assert.equal(action.start('office'),false,'background animations must not wake the player');
  assert.equal(action.resting,kind);
  assert.ok(restPrompt(kind).label);
  assert.equal(action.end(),true);assert.equal(action.active,false);assert.equal(action.resting,null);
  assert.equal(action.start('shower'),true,'activities can resume after standing');
 }
});
test('short activities and purchased experiences keep their finite animation',()=>{
 let time=0;const action=createRoomAction('home',()=>time);
 action.start('shower',{persistent:false});time=3;assert.equal(action.active,false);
 action.start('relax',{persistent:false});time=6;assert.equal(action.active,false);assert.equal(action.resting,null);
 const cafe=createRoomAction('cafe',()=>time);cafe.start('relax');time=10;assert.equal(cafe.active,true);cafe.end();assert.equal(cafe.active,false);
});
test('sleep lies on the mattress and sitting bends both knees onto the sofa',()=>{
 const actor=createActor('🧑🏾');actor.animate(1,false);applyRestPose(actor,'sleep',1);
 const up=new THREE.Vector3(0,1,0).applyEuler(actor.group.rotation);
 assert.ok(up.z<-.99);assert.deepEqual(actor.group.position.toArray(),[-3,1.1,-1.35]);
 actor.group.rotation.set(0,0,0);actor.animate(2,false);applyRestPose(actor,'relax',1);
 assert.ok(Math.abs(actor.group.position.y+.12)<1e-8);
 assert.equal(actor.leftLeg.rotation.x,-Math.PI/2);assert.equal(actor.rightLeg.rotation.x,-Math.PI/2);
 assert.ok(actor.knees.every(knee=>knee.rotation.x===Math.PI/2));
 actor.animate(3,true);assert.ok(actor.knees.every(knee=>knee.rotation.x!==Math.PI/2),'walking resets seated joints');
});
test('waking and standing return to walkable furniture hotspots',()=>{
 const physics=createRoomPhysics([{x:-3,z:-2.25,w:3,d:2.25},{x:3,z:-2,w:3,d:1.3},{x:-1.25,z:-3.2,w:.16,d:4.2}]);
 for(const point of Object.values(REST_SPOTS)){
  assert.equal(physics.clear(...point),true);
  const after=physics.move(point,[0,.5]);assert.ok(after[1]>point[1]+.4,'player can move away without being stuck');
 }
});
