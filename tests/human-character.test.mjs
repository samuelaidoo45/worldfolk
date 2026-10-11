import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as T from '../public/game/three.module.js';
import {GLTFLoader} from '../public/game/humanoid-loader.js';
import {prepareHumanTemplate,createRiggedActor} from '../public/game/human-character.js';
import {instanceAnimatedModels,disposeScene,batchStaticMeshes} from '../public/game/render-utils.js';
import {chaseCamera} from '../public/game/chase-camera.js';
import {distanceMetres} from '../public/game/motion.js';

// Test the shipped geometry/skeleton without browser image decoding or network.
const dir=new URL('../public/game/assets/humans/',import.meta.url);
globalThis.ProgressEvent??=class{constructor(type,data){this.type=type;Object.assign(this,data)}};
async function template(sex){
 const data=JSON.parse(await readFile(new URL(`Superhero_${sex}_FullBody.gltf`,dir),'utf8'));
 for(const buffer of data.buffers)buffer.uri='data:application/octet-stream;base64,'+(await readFile(new URL(buffer.uri,dir))).toString('base64');
 for(const material of data.materials){delete material.normalTexture;delete material.pbrMetallicRoughness.baseColorTexture;delete material.pbrMetallicRoughness.metallicRoughnessTexture}
 delete data.images;delete data.textures;
 return prepareHumanTemplate((await new GLTFLoader().parseAsync(JSON.stringify(data),'')).scene);
}
const male=await template('Male'),female=await template('Female');
function bounds(actor){actor.group.updateMatrixWorld(true);actor.group.traverse(o=>{if(o.isSkinnedMesh){o.skeleton.update();o.computeBoundingBox()}});return new T.Box3().setFromObject(actor.group)}

test('male and female assets have weighted hands, human stature and opaque civilian clothes',()=>{
 for(const [model,icon]of [[male,'👨🏾'],[female,'👩🏾']]){
  const actor=createRiggedActor(model,icon),b=bounds(actor),height=b.max.y-b.min.y;assert.ok(height>1.7&&height<1.95,`height ${height}`);assert.ok(b.max.x-b.min.x<1,'resting arms must be down');
  let body,bones=0;actor.group.traverse(o=>{if(o.isBone)bones++;if(Array.isArray(o.material))body=o});assert.ok(bones>40,'finger and facial attachment bones are preserved');
  assert.deepEqual(body.material.map(m=>m.name),['skin','shirt','pants','shoes']);assert.equal(body.material[0].vertexColors,false,'garment remeshing cannot leave an absent colour attribute rendering skin black');
  const weights=body.geometry.attributes.skinWeight;for(let i=0;i<weights.count;i++){const sum=weights.getX(i)+weights.getY(i)+weights.getZ(i)+weights.getW(i);assert.ok(Math.abs(sum-1)<1e-5)}
  assert.ok(body.geometry.attributes.position.count<100000,'bounded remeshing cost');disposeScene(actor.group);
 }
});
test('real bones deform while crowd characters keep separate skeletons and clothing',()=>{
 const a=createRiggedActor(male,'👨🏾','a'),b=createRiggedActor(male,'👨🏾','b'),crowd=instanceAnimatedModels([a.group,b.group]);
 assert.equal(crowd.group.children[0],a.group);let mesh;a.group.traverse(o=>{if(Array.isArray(o.material))mesh=o});
 const before=bounds(a).clone();for(let i=0;i<60;i++)a.animate(i/60,true,{speed:5.8});const after=bounds(a);assert.ok(before.min.distanceTo(after.min)+before.max.distanceTo(after.max)>.05);
 assert.equal(b.leftArm.rotation.x,0,'one player animation never moves another');assert.ok(crowd.drawCalls<=16);
 batchStaticMeshes(crowd.group);assert.ok(mesh.parent,'static batching must preserve the skinned body');
 let disposed=0;mesh.geometry.addEventListener('dispose',()=>disposed++);disposeScene(a.group);assert.equal(disposed,0,'shared template geometry survives another player leaving');disposeScene(b.group);
});
test('run and walk have different cadence, and pose transitions reset all joints',()=>{
 const a=createRiggedActor(male),b=createRiggedActor(male);
 for(let i=0;i<60;i++){a.animate(i/60,true,{speed:1.5});b.animate(i/60,true,{speed:5.8})}
 assert.notEqual(a.leftLeg.rotation.x,b.leftLeg.rotation.x);assert.ok(Math.abs(b.elbows[0].rotation.x)>Math.abs(a.elbows[0].rotation.x));
 b.animate(2,false,{action:'sit'});assert.ok(b.knees.every(k=>k.rotation.x>1));
 b.animate(3,false,{action:'shower'});assert.ok(b.leftArm.rotation.x<-2);
 b.animate(4,false,{action:'dance'});assert.notEqual(b.spine.rotation.z,0);
 b.animate(5,false);assert.ok(b.leftArm.rotation.x>-.8,'stopped activities cannot leave the arms overhead');disposeScene(a.group);disposeScene(b.group);
});
test('default camera keeps an adult readable without filling the screen or showing mostly ground',()=>{
 const origin=[-.19,5.56],pose=chaseCamera({position:origin,heading:0}),ahead=distanceMetres(origin,pose.to);
 const camera=new T.PerspectiveCamera(58,16/9,.05,2000);camera.position.set(0,pose.altitude,pose.distance);camera.lookAt(0,pose.targetAltitude,-ahead);camera.updateMatrixWorld();
 const foot=new T.Vector3(0,0,0).project(camera),head=new T.Vector3(0,1.8,0).project(camera);const fraction=(head.y-foot.y)/2;
 assert.ok(fraction>.18&&fraction<.33,`character screen height ${fraction}`);assert.ok(foot.y>-.85&&head.y<.7,'whole body remains in frame');
 const near=chaseCamera({position:origin,heading:0,previousDistance:pose.distance,physics:{collision:p=>distanceMetres(origin,p)>2}});assert.ok(near.distance<2);
});
