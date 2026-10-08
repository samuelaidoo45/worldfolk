import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/game/three.module.js';
import {batchStaticMeshes,instanceAnimatedModels} from '../public/game/render-utils.js';
import {interiorKind,LARGE_VENUES} from '../public/game/venue-layouts.js';
import {createRoomPhysics} from '../public/game/room-physics.js';
import {roadFeatures} from '../public/game/road-cache.js';
import {createActor,createCar} from '../public/game/world3d.js';
test('venue classification separates malls, stadiums, worship, education and hospitality',()=>{
 for(const [name,kind] of [['Accra Mall','mall'],['Accra Sports Stadium','stadium'],['Kotoka International Airport','terminal'],['National Theatre','theatre'],['Holy Trinity Cathedral','church'],['National Mosque','mosque'],['University of Ghana','campus'],['Makola Market','market'],['City Hospital','clinic'],['Coastal Hotel','hotel'],['National Museum','gallery'],['Fitness Centre','gym'],['Guest Hotel','hotel'],['Library','library']])assert.equal(interiorKind({name}),kind,name);
});
test('large venue entrances are in bounds and stadium concourse can be walked to pitch side',()=>{
 for(const layout of Object.values(LARGE_VENUES)){const physics=createRoomPhysics([],layout.bounds);assert.ok(physics.clear(...layout.spawn));assert.ok(physics.clear(...layout.exit))}
 const physics=createRoomPhysics([{x:0,z:0,w:70,d:107}],LARGE_VENUES.stadium.bounds);let p=LARGE_VENUES.stadium.spawn;p=physics.move(p,[0,-64]);assert.ok(Math.abs(p[1])<.01);p=physics.move(p,[-20,0]);assert.ok(p[0]>35);assert.ok(physics.visible(p,[39,0]));
});
test('static batching keeps geometry bounds and leaves animated actors intact',()=>{
 const root=new THREE.Group(),material=new THREE.MeshStandardMaterial();for(let i=0;i<100;i++){const m=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),material);m.position.x=i;root.add(m)}const before=new THREE.Box3().setFromObject(root);const stats=batchStaticMeshes(root),after=new THREE.Box3().setFromObject(root);assert.equal(stats.after,1);assert.ok(before.min.distanceTo(after.min)<.001);assert.ok(before.max.distanceTo(after.max)<.001);
 const actor=createActor('🧑🏾');actor.animate(.5,true);assert.ok(actor.leftArm.parent);assert.notEqual(actor.leftArm.rotation.x,0);let calls=0;const car=createCar();car.group.traverse(m=>{if(m.isMesh)calls++});assert.ok(calls<15,`car needs ${calls} draw calls`);
});
test('road consumers share snapshots and refresh when their interval expires',()=>{
 let calls=0;const map={querySourceFeatures(){calls++;return [{id:calls}]}};for(let i=0;i<600;i++)roadFeatures(map,i*2);assert.equal(calls,1);assert.equal(roadFeatures(map,1600)[0].id,2);assert.equal(calls,2);
});

test('animated crowds share draw calls while preserving individual positions and joints',()=>{
 const actors=Array.from({length:22},(_,i)=>createActor(i%2?'👩🏾':'👨🏽'));
 const crowd=instanceAnimatedModels(actors.map(a=>a.group));assert.ok(crowd.drawCalls<20);
 actors.forEach((a,i)=>{a.animate(i*.3,true);a.group.position.x=i*3});crowd.update();
 const matrix=new THREE.Matrix4();crowd.group.children.at(-1).getMatrixAt(21,matrix);assert.ok(Math.abs(matrix.elements[12]-63)<.001);
 assert.notEqual(actors[2].leftLeg.rotation.x,actors[3].leftLeg.rotation.x);
});

test('car variants have distinct silhouettes and remain efficiently batched',()=>{
 const signatures=new Set();
 for(const kind of ['car','hatchback','suv','pickup','van','taxi']){
  const {group}=createCar(0xcc4422,kind),box=new THREE.Box3().setFromObject(group);let calls=0,vertices=0;
  group.traverse(m=>{if(m.isMesh){calls++;vertices+=m.geometry.attributes.position.count}});
  assert.ok(calls<18,kind+' draw calls');assert.ok(box.max.x-box.min.x<2.3);assert.ok(box.max.z-box.min.z<4.2);
  signatures.add([vertices,box.max.y].join(':'));
 }
 assert.equal(signatures.size,6,'each model has its own geometry');
});

test('billboards render readable ads on both faces above traffic',async()=>{
 const old=globalThis.document,labels=[];
 globalThis.document={createElement:()=>({getContext:()=>({fillRect(){},fillText(text){labels.push(text)}})})};
 try{const {createBillboard,BILLBOARD_ADS}=await import('../public/game/billboards.js');
 for(let i=0;i<BILLBOARD_ADS.length;i++){const {group}=createBillboard(i),faces=group.children.filter(m=>m.material.map);assert.equal(faces.length,2);assert.ok(faces.every(m=>m.position.y>5));assert.ok(labels.includes(BILLBOARD_ADS[i].headline));assert.ok(faces[0].material.map.image.width>=1024)}}finally{globalThis.document=old}
});
