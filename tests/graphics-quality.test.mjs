import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/game/three.module.js';
import {createBus,createCar} from '../public/game/world3d.js';
import {createFallbackActor} from '../public/game/actor-fallback.js';
import {createPalm} from '../public/game/scenery-models.js';
import {enhanceMaterials,surfaceTexture,cityEnvironment,contactShadow,tagSurface} from '../public/game/graphics-materials.js';
import {disposeScene,instanceAnimatedModels,batchStaticMeshes} from '../public/game/render-utils.js';
import {vehicleSpec} from '../public/game/vehicle-catalog.js';
import {unpavedRoad} from '../public/game/surface-style.js';
import {installGroundDetail} from '../public/game/ground-detail.js';

const measure=group=>{let calls=0,vertices=0;group.traverse(o=>{if(o.isMesh){calls++;vertices+=o.geometry.attributes.position.count}});return {calls,vertices,bounds:new THREE.Box3().setFromObject(group)}};
test('all vehicles retain physics dimensions and bus has a proper full-height cabin',()=>{
 for(const kind of ['car','suv','van','pickup','taxi','hatchback']){const {group}=createCar(0x235eab,kind),stats=measure(group);assert.ok(stats.calls<18);const spec=vehicleSpec(kind);assert.ok(stats.bounds.max.x<=spec.width/2+.22);assert.ok(stats.bounds.min.x>=-spec.width/2-.22);assert.ok(stats.bounds.max.z<spec.length/2+.06);assert.ok(stats.bounds.min.z> -spec.length/2-.06);disposeScene(group)}
 const {group}=createBus(),stats=measure(group);assert.ok(stats.calls<=14);assert.ok(stats.bounds.max.x<=1.31);assert.ok(stats.bounds.max.z<=3.56);assert.ok(stats.bounds.min.z>=-3.56);assert.ok(stats.bounds.max.y>2.8&&stats.bounds.max.y<3.2);assert.deepEqual(group.scale.toArray(),[1,1,1]);disposeScene(group);
});
test('loading fallback retains bounded crowd topology and life-size proportions',()=>{
 const actors=['🧑🏾','👩🏾','👨🏽'].map(icon=>createFallbackActor(icon)),crowd=instanceAnimatedModels(actors.map(a=>a.group));assert.ok(crowd.drawCalls<20);
 for(const actor of actors){const stats=measure(actor.group);assert.ok(stats.bounds.max.y>1.75&&stats.bounds.max.y<2);actor.animate(.4,true);assert.notEqual(actor.leftArm.rotation.x,0);disposeScene(actor.group)}disposeScene(crowd.group);
});
test('palm leaflets are batched and scenery has a bounded geometry cost',()=>{
 const {group}=createPalm({id:'palm-osu-12'}),stats=measure(group);assert.ok(stats.calls<=4);assert.ok(stats.vertices<15000);assert.ok(stats.bounds.max.y>5);disposeScene(group);
});
test('streaming objects reuses textures without disposing shared GPU inputs',()=>{
 const texture=surfaceTexture('fabric');assert.equal(texture,surfaceTexture('fabric'));assert.equal(texture.image.data.length,128*128*4);assert.equal(texture.userData.shared,true);let disposed=0;texture.addEventListener('dispose',()=>disposed++);
 for(let i=0;i<20;i++){const root=new THREE.Group(),material=tagSurface(new THREE.MeshStandardMaterial(),'fabric');root.add(new THREE.Mesh(new THREE.BoxGeometry(1,.3,.8),material));enhanceMaterials(root);assert.equal(material.map,texture);disposeScene(root)}assert.equal(disposed,0);
 assert.equal(cityEnvironment(),cityEnvironment());assert.notEqual(cityEnvironment('night'),cityEnvironment('day'));assert.equal(cityEnvironment('dusk'),cityEnvironment('dawn'));
 const night=cityEnvironment('night').image.data,day=cityEnvironment().image.data;assert.ok(night[0]<day[0]);const alpha=contactShadow().image.data;assert.equal(alpha[3],0);assert.ok(alpha[(32*64+32)*4+3]>220);
});
test('furniture edges are rounded within their collision boxes and batching is stable',()=>{
 const material=tagSurface(new THREE.MeshStandardMaterial(),'wood'),root=new THREE.Group(),mesh=new THREE.Mesh(new THREE.BoxGeometry(3,.6,1.5),material);root.add(mesh);const before=new THREE.Box3().setFromObject(root);batchStaticMeshes(root);const after=new THREE.Box3().setFromObject(root);assert.ok(before.min.distanceTo(after.min)<.001);assert.ok(before.max.distanceTo(after.max)<.001);assert.equal(mesh.geometry.type,'ExtrudeGeometry');const count=mesh.geometry.attributes.position.count;enhanceMaterials(root);assert.equal(mesh.geometry.attributes.position.count,count);disposeScene(root);
});
test('authored artwork and glass remain intact when the material pass runs',()=>{
 const root=new THREE.Group(),texture=new THREE.Texture(),sign=new THREE.MeshBasicMaterial({map:texture}),glass=tagSurface(new THREE.MeshStandardMaterial({roughness:.1}),'glass');root.add(new THREE.Mesh(new THREE.PlaneGeometry(1,1),sign),new THREE.Mesh(new THREE.BoxGeometry(1,1,.1),glass));enhanceMaterials(root);assert.equal(sign.map,texture);assert.equal(glass.map,null);assert.equal(glass.bumpMap,null);disposeScene(root);
});
test('road detail follows paved roads and is inserted under labels',()=>{
 const images=[],layers=[],road={id:'worldfolk-roads',source:'accralife-streets','source-layer':'road',filter:['!', ['in',['get','class'],['literal',['path','steps','pedestrian']]]],paint:{'line-width':6},layout:{'line-join':'round'}};
 installGroundDetail({hasImage:()=>false,addImage:(id,data)=>images.push({id,data}),addLayer:(layer,before)=>layers.push({layer,before}),getStyle:()=>({layers:[road]})});assert.equal(images.length,4);assert.ok(images.every(i=>i.data.data.length===128*128*4));const asphalt=layers.find(l=>l.layer.id==='worldfolk-asphalt-texture');assert.deepEqual(asphalt.layer.filter,['all',road.filter,['!',unpavedRoad]]);assert.equal(asphalt.before,'worldfolk-road-labels');assert.equal(asphalt.layer.paint['line-width'],6);
});
