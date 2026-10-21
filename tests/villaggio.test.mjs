import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/three.module.js';
import {VILLAGGIO,VILLAGGIO_BLOCKS,VILLAGGIO_ARRIVAL,VILLAGGIO_ACTIVITIES,villaggioPoint} from '../public/game/villaggio-data.js';
import {createVillaggio} from '../public/game/villaggio.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {createPrecinctLife,nearPrecinctActivity} from '../public/game/precinct-life.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {isCityLandmark} from '../public/game/city-landmarks.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {distanceMetres} from '../public/game/motion.js';
import {disposeScene} from '../public/game/render-utils.js';
const physics=()=>{const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>[],isSourceLoaded:()=>true});p.refresh(VILLAGGIO.position,true);return p;};
test('Villaggio is searchable with outdoor arrival and exact shell replacement IDs',()=>{
 const found=searchPlaceIndex(indexPlaces([]),'Villaggio Vista').items.find(p=>p.id==='villaggio');assert.ok(found);assert.deepEqual(landmarkArrival(found).position,VILLAGGIO_ARRIVAL);assert.ok(isOutdoorLandmark(found));assert.ok(isOutdoorLandmark({name:'Villaggio',lng:-.17858074,lat:5.6204694}));assert.equal(isOutdoorLandmark({name:'Villaggio',lng:0,lat:0}),false);
 assert.ok(VILLAGGIO.sourceIds.every(isCityLandmark));assert.equal(isCityLandmark(2266652080),false,'neighbouring hotel stays intact');assert.equal(physics().collision(VILLAGGIO_ARRIVAL,.4),null);
});
test('distinct tower heights, upper cantilever and clear undercroft agree with physics',()=>{
 const p=physics();for(const b of VILLAGGIO_BLOCKS.filter(b=>!b.bottom))assert.ok(p.collision(villaggioPoint(b.x,b.z),.3));
 assert.equal(p.collision(villaggioPoint(57,-39),.3),null,'under Alto overhang is open');assert.equal(p.collision(villaggioPoint(33,35),.3),null,'under Azure overhang is open');
 const target=villaggioPoint(57,-30),start=villaggioPoint(57,-40),contact=p.move(start,target,.3);assert.ok(contact.blocked);assert.ok(distanceMetres(p.move(contact.position,start,.3).position,start)<.1);
 const {group}=createVillaggio();assert.ok(group.userData.batching.after<18);let colored=0;group.traverse(o=>{if(o.isMesh&&o.material.vertexColors){const c=o.geometry.getAttribute('color');assert.equal(c.count,o.geometry.getAttribute('position').count);assert.ok(new Set(Array.from(c.array).map(v=>v.toFixed(3))).size>12);colored++;}});assert.ok(colored>0);assert.ok(group.userData.villaggio.skyVoids.length>=2);assert.ok(new T.Box3().setFromObject(group).max.y>72);
 // Rays through the upper parts hit while rays below their overhangs remain clear.
 const a=-.568,point=(x,y,z)=>new T.Vector3(x*Math.cos(a)+z*Math.sin(a),y,-x*Math.sin(a)+z*Math.cos(a)),dir=point(1,0,0);
 group.updateMatrixWorld(true);assert.equal(new T.Raycaster(point(40,2,-39),dir,0,32).intersectObject(group,true).length,0);assert.ok(new T.Raycaster(point(40,55,-39),dir,0,32).intersectObject(group,true).length>0);disposeScene(group);
});
test('garden activities and continuous visitor paths are reachable without building contacts',()=>{
 const p=physics();let pos=VILLAGGIO_ARRIVAL;for(const next of [villaggioPoint(-32,-5),VILLAGGIO_ACTIVITIES[1].position]){assert.ok(distanceMetres(p.moveWalker(pos,next).position,next)<.1);pos=next;}
 for(const a of VILLAGGIO_ACTIVITIES){assert.equal(p.collision(a.position,.3),null);assert.equal(nearPrecinctActivity(a.position,0).id,a.id);}
 const life=createPrecinctLife();let old;
 for(let t=0;t<240;t+=.25){const actors=life.tick(t,VILLAGGIO.position,720);assert.equal(actors.length,3);for(const a of actors){assert.equal(p.collision(a.position,.3),null);if(old)assert.ok(distanceMetres(a.position,old.find(b=>b.id===a.id).position)<.3);}old=actors;}
 assert.equal(life.tick(0,VILLAGGIO.position,0).length,1);assert.equal(life.tick(0,[-.1,5.7],720).length,0);
});
