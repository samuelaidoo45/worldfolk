import * as THREE from './three.module.js';
import {GLTFLoader,clone} from './humanoid-loader.js';
import {createFallbackActor} from './actor-fallback.js';
import {contactShadow,tagSurface,enhanceMaterials,surfaceTexture} from './graphics-materials.js';
import {casualOutfit} from './outfit-catalog.js';
import {gaitPose} from './human-gait.js';
import {civilianGeometry} from './human-garments.js';
import {disposeScene} from './render-utils.js';

const templates=new Map(),loads=new Map();
const shirts=[0x326854,0xc1aa83,0x3b617b,0x944d3e,0x636d48,0xd4cbb8];
const trousers=[0x243343,0x343631,0x645847];
const q=new THREE.Quaternion(),q2=new THREE.Quaternion();
function hash(value){let n=0;for(const c of value)n=(Math.imul(n,31)+c.charCodeAt(0))>>>0;return n}
const gender=icon=>String(icon).startsWith('👩')?'Female':'Male';
let clothTexture;
const material=(name,color,roughness)=>{const m=tagSurface(new THREE.MeshStandardMaterial({color,roughness,metalness:0}),name==='skin'?'skin':'fabric');m.name=name;if(!clothTexture){clothTexture=surfaceTexture('fabric').clone();clothTexture.repeat.set(12,12);clothTexture.userData.shared=true;clothTexture.needsUpdate=true}m.map=clothTexture;m.bumpMap=clothTexture;m.bumpScale=.0015;m.userData.graphicsEnhanced=true;return m};

// Convert the CC0 base into a clothed civilian. Skin retains the authored face
// and normal maps; clothing gets its own opaque materials and garment volume.
export function prepareHumanTemplate(scene){
 scene.updateMatrixWorld(true);
 let body;scene.traverse(o=>{if(o.isSkinnedMesh&&(!body||o.geometry.attributes.position.count>body.geometry.attributes.position.count))body=o});
 if(!body)throw new Error('Humanoid has no skinned body');
 const geometry=civilianGeometry(body.geometry);
 // The source's normal map is for skin anatomy; never put it on a shirt.
 const skin=body.material;skin.name='skin';skin.roughness=.73;skin.normalScale.set(.25,.25);skin.metalness=0;skin.side=THREE.FrontSide;skin.userData.graphicsEnhanced=true;skin.vertexColors=false;skin.roughnessMap=null;skin.metalnessMap=null;
 const shirt=material('shirt',shirts[0],.86),pants=material('pants',trousers[0],.94),shoes=material('shoes',0x282522,.62);
 body.geometry=geometry;body.material=[skin,shirt,pants,shoes];
 const hair=scene.getObjectByName('Worldfolk_Hair');
 if(hair){
  const head=body.skeleton.bones.findIndex(b=>b.name==='Head');
  const g=hair.geometry.clone();g.applyMatrix4(hair.matrixWorld);const count=g.attributes.position.count;
  const joints=new Uint16Array(count*4),weights=new Float32Array(count*4);for(let i=0;i<count;i++){joints[i*4]=head;weights[i*4]=1}
  g.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(joints,4));g.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));
  const m=hair.material.clone();m.color.set(0x332822);m.roughness=.94;m.side=THREE.FrontSide;
  const skinned=new THREE.SkinnedMesh(g,m);skinned.name='Hair';skinned.bind(body.skeleton,body.bindMatrix);hair.removeFromParent();scene.add(skinned);
 }
 scene.traverse(o=>{o.userData.dynamic=true;if(!o.isMesh)return;o.frustumCulled=false;o.castShadow=true;o.receiveShadow=true;o.geometry.userData.shared=true;for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const value of Object.values(m))if(value?.isTexture){value.userData.shared=true;value.anisotropy=4}}});
 enhanceMaterials(scene);return scene;
}
export function loadHumanTemplate(sex='Male'){
 if(templates.has(sex))return Promise.resolve(templates.get(sex));
 if(!loads.has(sex)){
  const loader=new GLTFLoader();const url=new URL(`./assets/humans/Superhero_${sex}_FullBody.gltf`,import.meta.url).href;
  loads.set(sex,loader.loadAsync(url).then(gltf=>{const scene=prepareHumanTemplate(gltf.scene);templates.set(sex,scene);return scene}).catch(error=>{loads.delete(sex);throw error}));
 }
 return loads.get(sex);
}

// A proxy preserves the existing room/vehicle pose API while driving real bones.
// Rotations are expressed in the game's human space (Y up, facing -Z), not the
// source rig's mixed local bone axes. Parent motion still carries the child.
function poseJoint(bone,parentBind,restLocal,restDelta=new THREE.Quaternion()){
 const proxy=new THREE.Object3D(),inverse=parentBind.clone().invert();
 proxy.rotation._onChange(()=>{
  proxy.quaternion.setFromEuler(proxy.rotation,false);
  // The source faces +Z; the container faces game -Z. The legacy pose API
  // uses negative flexion for forward thighs/arms and positive knee bends.
  q.set(proxy.quaternion.x,proxy.quaternion.y,-proxy.quaternion.z,proxy.quaternion.w);
  q.multiply(restDelta);q2.copy(inverse).multiply(q).multiply(parentBind);
  bone.quaternion.copy(restLocal).premultiply(q2);
 });
 proxy.rotation.set(0,0,0);return proxy;
}
export function createRiggedActor(template,icon='🧑🏾',identity=''){
 const group=new THREE.Group(),visual=clone(template),seed=hash(identity||icon),bones=new Map(),binds=new Map();
 group.name='Worldfolk human';group.userData.humanoid=true;visual.name='rigged-human';group.add(visual);
 visual.updateMatrixWorld(true);
 visual.traverse(o=>{if(o.isBone){bones.set(o.name,o);binds.set(o.name,{local:o.quaternion.clone(),parent:o.parent.getWorldQuaternion(new THREE.Quaternion())})}});
 const originals=new Map();visual.traverse(o=>{if(!o.isMesh)return;const copy=m=>{if(!originals.has(m)){const c=m.clone();c.userData={...m.userData};originals.set(m,c)}return originals.get(m)};o.material=Array.isArray(o.material)?o.material.map(copy):copy(o.material);o.frustumCulled=false});
 const byName=new Map([...originals.values()].map(m=>[m.name,m]));
 function outfit(id){const clothes=casualOutfit(id,seed);for(const part of ['shirt','pants','shoes'])byName.get(part).color.setHex(clothes[part])}
 outfit(null);
 // The authored dark skin texture keeps facial detail; small tints add variety.
 const tone=String(icon).includes('🏽')?0xe1ba9b:String(icon).includes('🏿')?0x82624f:0xd6b195;byName.get('skin').color.setHex(tone);
 const joint=(name,rest=new THREE.Quaternion())=>{const b=bones.get(name),v=binds.get(name);b.parent.updateWorldMatrix(true,false);return poseJoint(b,b.parent.getWorldQuaternion(new THREE.Quaternion()),v.local,rest)};
 const armRest=(side)=>{
  const from=bones.get('upperarm_'+side).getWorldPosition(new THREE.Vector3()),to=bones.get('lowerarm_'+side).getWorldPosition(new THREE.Vector3());
  return new THREE.Quaternion().setFromUnitVectors(to.sub(from).normalize(),new THREE.Vector3(side==='l'?.09:-.09,-1,0).normalize());
 };
 // Capture both arms before applying either rest pose.
 const leftRest=armRest('l'),rightRest=armRest('r');
 const leftArm=joint('upperarm_l',leftRest),rightArm=joint('upperarm_r',rightRest),leftLeg=joint('thigh_l'),rightLeg=joint('thigh_r');
 const elbows=[joint('lowerarm_l'),joint('lowerarm_r')],knees=[joint('calf_l'),joint('calf_r')],ankles=[joint('foot_l'),joint('foot_r')];
 const spine=joint('spine_02'),head=joint('Head');
 visual.rotation.y=Math.PI;visual.position.y=.025;
 // Keep both bases near 1.8m; do not scale NPCs down relative to the player.
 if(gender(icon)==='Female')visual.scale.setScalar(1.02);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(.8,.65),new THREE.MeshBasicMaterial({map:contactShadow(),color:0x172723,transparent:true,opacity:.48,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;shadow.userData.dynamic=true;group.add(shadow);
 const boneDistance=(a,b)=>bones.get(a).getWorldPosition(new THREE.Vector3()).distanceTo(bones.get(b).getWorldPosition(new THREE.Vector3()));
 const upper=boneDistance('thigh_l','calf_l'),lower=boneDistance('calf_l','foot_l');
 let last=null,phase=0,blend=0,smoothSpeed=0;
 function animate(t,moving,options={}){
  const dt=last===null?1/60:Math.max(0,Math.min(.05,t-last));last=t;
  const speed=options.speed??(moving?1.65:0),target=moving?Math.max(0,Math.min(7,speed)):0;
  const ease=1-Math.exp(-dt*10);smoothSpeed+=(target-smoothSpeed)*ease;blend+=((moving&&target>.08?1:0)-blend)*ease;
  const gait=gaitPose(phase,smoothSpeed,upper,lower),run=gait.run;
  phase=(phase+dt*gait.cadence*Math.min(1,smoothSpeed/.65))%1;
  for(const p of [leftArm,rightArm,leftLeg,rightLeg,...elbows,...knees,...ankles,spine,head])p.rotation.set(0,0,0);
  for(const [i,leg] of [gait.left,gait.right].entries()){
   [leftLeg,rightLeg][i].rotation.x=leg.hip*blend;knees[i].rotation.x=leg.knee*blend;ankles[i].rotation.x=leg.ankle*blend;
  }
  const swing=Math.cos(phase*Math.PI*2),arm=(.24+run*.3)*blend;
  leftArm.rotation.x=swing*arm;rightArm.rotation.x=-swing*arm;
  elbows.forEach((e,i)=>e.rotation.x=-.12-(run*.95+Math.max(0,Math.sin(phase*Math.PI*2+i*Math.PI))*.12)*blend);
  spine.rotation.set(run*.075*blend,swing*.035*blend,swing*.012*blend);
  head.rotation.y=Math.sin(t*.53+seed%9)*.035*(1-blend);
  group.position.y=gait.bodyOffset*blend;
  visual.position.y=.025+Math.sin(t*1.8)*.002*(1-blend);
  if(options.action)pose(options.action,t,options.blend??1);
 }
 function pose(action,t,weight=1){
  const w=Math.max(0,Math.min(1,weight));
  if(['sit','relax','drive'].includes(action)){
   leftLeg.rotation.x=rightLeg.rotation.x=-1.5*w;knees.forEach(k=>k.rotation.x=1.5*w);elbows.forEach(e=>e.rotation.x=-.65*w);
   leftArm.rotation.x=rightArm.rotation.x=-(action==='drive'?.65:.12)*w;spine.rotation.x=.035*w;
  }else if(action==='sleep'){
   elbows.forEach(e=>e.rotation.x=-.18*w);leftArm.rotation.z=-.06*w;rightArm.rotation.z=.06*w;head.rotation.y=.14*w;
  }else if(action==='dance'){
   spine.rotation.set(Math.sin(t*3)*.08*w,Math.sin(t*2)*.12*w,Math.sin(t*3)*.1*w);
   leftArm.rotation.set(-.4*w,0,-(.45+Math.sin(t*3)*.3)*w);rightArm.rotation.set(-.4*w,0,(.45-Math.sin(t*3)*.3)*w);
   elbows.forEach((e,i)=>e.rotation.x=-(.7+Math.sin(t*3+i)*.25)*w);knees.forEach((k,i)=>k.rotation.x=(.14+Math.max(0,Math.sin(t*3+i*Math.PI))*.22)*w);group.position.y=-.02+Math.abs(Math.sin(t*3))*.035*w;
  }else if(action==='shower'){
   leftArm.rotation.x=(-2.35+Math.sin(t*2)*.15)*w;rightArm.rotation.x=(-2.3-Math.sin(t*2)*.15)*w;elbows.forEach(e=>e.rotation.x=-1.15*w);head.rotation.x=.12*w;
  }else if(['office','study','eat','cook','speak'].includes(action)){
   leftArm.rotation.x=-.35*w;rightArm.rotation.x=(-.45+Math.sin(t*2)*.1)*w;elbows.forEach(e=>e.rotation.x=-1.1*w);
  }
 }
 group.userData.releaseResources=()=>{const seen=new Set();visual.traverse(o=>{if(o.skeleton&&!seen.has(o.skeleton)){seen.add(o.skeleton);o.skeleton.dispose()}})};
 return {group,leftArm,rightArm,leftLeg,rightLeg,knees,elbows,spine,head,rigged:true,animate,pose,outfit};
}

export function createActor(icon='🧑🏾',identity=''){
 const sex=gender(icon),template=templates.get(sex);
 if(template)return createRiggedActor(template,icon,identity);
 const actor=createFallbackActor(icon,identity),root=actor.group;root.userData.humanoid=true;root.traverse(o=>o.userData.dynamic=true);
 // This fallback is only used while the local model downloads or on load failure.
 // Preserve the root so existing city/interior references and world state survive.
 if(typeof window!=='undefined'){
  let disposed=false,lastOutfit;const fallbackOutfit=actor.outfit;actor.outfit=id=>{lastOutfit=id;fallbackOutfit(id)};root.userData.releaseResources=()=>{disposed=true};
  actor.ready=loadHumanTemplate(sex).then(template=>{
   if(disposed)return false;
   const upgraded=createRiggedActor(template,icon,identity),fresh=upgraded.group;upgraded.outfit(lastOutfit);
   for(const child of [...root.children]){root.remove(child);disposeScene(child)}
   for(const child of [...fresh.children])root.add(child);
   root.userData.releaseResources=fresh.userData.releaseResources;
   Object.assign(actor,upgraded,{group:root,animate(...args){upgraded.animate(...args);root.position.y=fresh.position.y},pose(...args){upgraded.pose(...args);root.position.y=fresh.position.y}});return true;
  }).catch(error=>{root.userData.assetError=error.message;console.warn('Worldfolk human asset unavailable:',error.message);return false});
 }
 return actor;
}
