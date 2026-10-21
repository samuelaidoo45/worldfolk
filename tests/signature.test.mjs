import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/three.module.js';
import {SIGNATURE,SIGNATURE_TOWERS,SIGNATURE_ACTIVITIES,SIGNATURE_ARRIVAL,signaturePoint,signatureLocal} from '../public/game/signature-data.js';
import {createSignature} from '../public/game/signature.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {createPrecinctLife,nearPrecinctActivity} from '../public/game/precinct-life.js';
import {isCityLandmark} from '../public/game/city-landmarks.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {distanceMetres} from '../public/game/motion.js';
import {disposeScene} from '../public/game/render-utils.js';
const physics=()=>{const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>[],isSourceLoaded:()=>true});p.refresh(SIGNATURE.position,true);return p};
test('Signature is searchable, has a safe framed arrival and never substitutes a generic interior',()=>{
 const found=searchPlaceIndex(indexPlaces([]),'signature apartments').items;assert.equal(found.length,1);assert.equal(found[0].id,'signature');
 const a=landmarkArrival(found[0]);assert.deepEqual(a.position,SIGNATURE_ARRIVAL);assert.ok(isOutdoorLandmark(found[0]));assert.equal(physics().collision(a.position,.4),null);
 assert.ok(SIGNATURE.sourceIds.every(isCityLandmark));assert.equal(isCityLandmark(888975188),false,'neighbouring church must remain visible');
});
test('two mapped towers step back toward their north ends at a bounded render cost',()=>{
 const {group}=createSignature();const data=group.userData.signature;assert.equal(data.towers,2);assert.ok(group.userData.batching.after<18);
 assert.ok(new T.Box3().setFromObject(group).max.y>=49);
 for(let i=0;i<2;i++){const levels=data.floorSpecs.filter(f=>f.tower===i);assert.equal(levels.length,14);for(let j=2;j<levels.length;j++){assert.ok(levels[j].start>levels[j-1].start);assert.equal(levels[j].end,levels[0].end);}}
 group.updateMatrixWorld(true);
 for(const tower of SIGNATURE_TOWERS){const [x,z]=tower.centre;const ray=new T.Raycaster(new T.Vector3(x,2,z),new T.Vector3(1,0,0),0,80);assert.ok(ray.intersectObject(group,true).length,'tower has tangible facade geometry');}
 disposeScene(group);
});
test('courtyard activities are physically reachable from arrival; pool and tower contacts allow retreat',()=>{
 const p=physics();for(const spot of SIGNATURE_ACTIVITIES){assert.equal(p.collision(spot.position,.28),null,spot.id);assert.equal(nearPrecinctActivity(spot.position,0).id,spot.id);}
 let pos=SIGNATURE_ARRIVAL;const seat=SIGNATURE_ACTIVITIES[1];for(const next of [signaturePoint(-21,28),signaturePoint(-12,21),seat.position]){const result=p.moveWalker(pos,next);assert.ok(distanceMetres(result.position,next)<.15,'clear walk from arrival to seat');pos=result.position;}
 const start=signaturePoint(1,0),target=signaturePoint(7,0),contact=p.move(start,target,.28);assert.ok(contact.blocked);assert.ok(distanceMetres(contact.position,target)>1);assert.ok(distanceMetres(p.move(contact.position,start,.28).position,start)<.1);
 for(const t of SIGNATURE_TOWERS)assert.ok(p.collision(signaturePoint(...t.centre),.28));
});
test('court visitors stay off pools and buildings throughout continuous routes, and leave with the area',()=>{
 const p=physics(),life=createPrecinctLife();let previous;
 for(let t=0;t<300;t+=.25){const actors=life.tick(t,SIGNATURE.position,720);assert.equal(actors.length,4);for(const a of actors){assert.equal(p.collision(a.position,.3),null,`${a.id} at ${signatureLocal(a.position)}`);if(previous){const old=previous.find(b=>b.id===a.id);assert.ok(distanceMetres(old.position,a.position)<.3);}}previous=actors;}
 assert.equal(life.tick(0,SIGNATURE.position,0).length,1);assert.equal(life.tick(0,[-.1,5.7],720).length,0);
});
