import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/game/three.module.js';
import {CITY_LANDMARKS,createCityLandmark,landmarkColliders} from '../public/game/city-landmarks.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {buildingDesign} from '../public/game/building-design.js';
import {offsetMetres,distanceMetres} from '../public/game/motion.js';
import {chaseCamera} from '../public/game/chase-camera.js';
import {disposeScene} from '../public/game/render-utils.js';
test('separate geographically anchored gate, arch and eight real grandstands',()=>{
 const gate=CITY_LANDMARKS.find(l=>l.id==='black-star-gate'),arch=CITY_LANDMARKS.find(l=>l.id==='independence-arch');
 assert.ok(gate.position[1]>arch.position[1]);assert.ok(distanceMetres(gate.position,arch.position)>270);
 assert.equal(CITY_LANDMARKS.filter(l=>l.id.startsWith('square-stand')).length,8);
 for(const l of CITY_LANDMARKS){const m=createCityLandmark(l),b=new THREE.Box3().setFromObject(m.group);assert.ok(b.max.y>=l.height-.5,`${l.name} height`);assert.ok(m.group.userData.batching.after<18);disposeScene(m.group)}
});
test('the gate opening remains walkable while its stone piers collide',()=>{
 const gate=CITY_LANDMARKS.find(l=>l.id==='black-star-gate'),map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};
 const physics=createBuildingPhysics(map);physics.refresh(gate.position,true);
 assert.equal(physics.collision(gate.position,.4),null);
 const a=gate.rotation*Math.PI/180,pier=offsetMetres(gate.position,9*Math.cos(a),9*Math.sin(a));assert.ok(physics.collision(pier,.4));
 assert.ok(landmarkColliders(gate.position).length>=4);
});
test('a shop POI within Accra Mall cannot replace its named architectural identity',()=>{
 const ring=[[-.1801,5.5599],[-.1799,5.5599],[-.1799,5.5601],[-.1801,5.5601],[-.1801,5.5599]],d=buildingDesign({properties:{name:'Accra Mall',class:'retail',height:7},geometry:{type:'Polygon',coordinates:[ring]}},[{name:'Restaurant counter',type:'restaurant',lng:-.18,lat:5.56}]);
 assert.equal(d.landmark.id,'accra-mall');assert.equal(d.placeName,'Accra Mall');assert.equal(d.kind,'mall');
});
test('overview remains near the player and first-person stays at eye height',()=>{
 const p={position:[-.19,5.55],heading:90};assert.ok(chaseCamera({...p,scenic:true}).distance<20);assert.ok(chaseCamera({...p,cabin:true}).altitude<1.8);
});

import {landmarkArrival} from '../public/game/landmark-arrival.js';
import {startingPlace} from '../public/game/city-places.js';
test('landmark arrivals frame the full gate and use the actual parade ground',()=>{
 const gate=landmarkArrival({name:'Black Star Gate'});assert.ok(distanceMetres(gate.position,gate.target)>70);assert.ok(gate.position[0]>gate.target[0]);assert.ok(gate.cameraPitch>=5&&gate.cameraPitch<=12);
 const square=startingPlace('square');assert.ok(distanceMetres([square.lng,square.lat],[-.19256,5.54742])<1);assert.equal(landmarkArrival({name:'Unknown church'}),null);
});

test('popular landmarks retain mapped footprints and remain discoverable',()=>{
 const names=['National Theatre','Ghana National Mosque','The Balme Library','Accra Mall','Kaneshie Market Complex','Jamestown Lighthouse','Jubilee House','Osu Castle','National Museum'];
 for(const name of names){const l=CITY_LANDMARKS.find(l=>l.name===name);assert.ok(l?.sourceId);assert.ok(l.rings[0].length>=4);const colliders=landmarkColliders(l.position);assert.ok(colliders.some(c=>c.id===l.id));}
 assert.ok(distanceMetres([startingPlace('theatre').lng,startingPlace('theatre').lat],[-.2005931,5.5536671])<1);
 assert.ok(distanceMetres([startingPlace('kaneshie').lng,startingPlace('kaneshie').lat],[-.236208,5.56594])<1);
});

test('precinct openings are open in both mesh geometry and ground collisions',()=>{
 for(const id of ['black-star-gate','independence-arch']){
  const data=CITY_LANDMARKS.find(l=>l.id===id),model=createCityLandmark(data).group;
  model.rotation.y=0;model.updateMatrixWorld(true);
  const ray=new THREE.Raycaster(new THREE.Vector3(0,1,30),new THREE.Vector3(0,0,-1),0,60);
  assert.equal(ray.intersectObject(model,true).length,0,`${id} centre must not be filled by a facade`);
  const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};
  const physics=createBuildingPhysics(map);physics.refresh(data.position,true);
  for(let z=-10;z<=10;z+=2){const a=data.rotation*Math.PI/180,p=offsetMetres(data.position,z*Math.sin(a),-z*Math.cos(a));assert.equal(physics.collision(p,.35),null,`${id} portal ${z}`);}
  disposeScene(model);
 }
});
test('fountains, arch stairs and stand terraces are solid, with clear walking space in front',()=>{
 const cases=[['black-star-gate',22,0],['independence-arch',15,0],['square-stand-339732242',0,0]];
 for(const [id,x,z] of cases){const data=CITY_LANDMARKS.find(l=>l.id===id);assert.ok(data,id);const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};const physics=createBuildingPhysics(map);physics.refresh(data.position,true);const a=data.rotation*Math.PI/180;
  const point=(x,z)=>offsetMetres(data.position,x*Math.cos(a)+z*Math.sin(a),x*Math.sin(a)-z*Math.cos(a));
  assert.ok(physics.collision(point(x,z),.3),id);assert.equal(physics.collision(point(0,data.depth/2+4),.3),null);
 }
});
test('all eight grandstands face the square and the model keeps the reference features',()=>{
 const centre=[-.19256,5.54742];
 for(const d of CITY_LANDMARKS.filter(l=>l.id.startsWith('square-stand'))){const a=d.rotation*Math.PI/180,front=offsetMetres(d.position,4*Math.sin(a),-4*Math.cos(a));assert.ok(distanceMetres(front,centre)<distanceMetres(d.position,centre));const {group}=createCityLandmark(d);assert.equal(group.userData.precinct.flagFascia,true);assert.equal(group.userData.precinct.aisles,4);disposeScene(group);}
});
