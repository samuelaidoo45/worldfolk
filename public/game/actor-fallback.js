import {casualOutfit} from './outfit-catalog.js';
import * as THREE from './three.module.js';
import {tagSurface,contactShadow} from './graphics-materials.js';
import {batchStaticMeshes} from './render-utils.js';
function colorForAvatar(icon){
  const dark=icon.includes('🏿'),medium=icon.includes('🏽');
  return {skin:dark?0x65402f:medium?0xa87350:0x8b563b,shirt:icon.startsWith('👩')?0xe57082:icon.startsWith('👨')?0x297b9c:0x42a46e,hair:0x211b19};
}
export function createFallbackActor(icon,identity=''){
 let wardrobe=0;for(const char of identity)wardrobe=(Math.imul(wardrobe,31)+char.charCodeAt(0))>>>0;
 const colors=colorForAvatar(icon),group=new THREE.Group(),skin=new THREE.MeshStandardMaterial({color:colors.skin,roughness:.72}),shirt=new THREE.MeshStandardMaterial({color:colors.shirt,roughness:.86}),pants=new THREE.MeshStandardMaterial({color:0x26323d,roughness:.94}),hair=new THREE.MeshStandardMaterial({color:colors.hair,roughness:.98}),shoes=new THREE.MeshStandardMaterial({color:0x232525,roughness:.64});
 if(identity){shirt.color.setHex([0xbcb3a1,0x3b6477,0x9e7544,0x566648,0x95564e,0xd3c9b0,0x3c4249,0x886877][wardrobe%8]);pants.color.setHex([0x303942,0x4b453b,0x273c50,0x646157][(wardrobe>>>4)%4]);}
 tagSurface(skin,'skin');tagSurface(shirt,'fabric');tagSurface(pants,'fabric');tagSurface(hair,'rubber');tagSurface(shoes,'rubber');
 const part=(parent,geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m};
 const torso=part(group,new THREE.LatheGeometry([[.17,0],[.18,.08],[.185,.2],[.225,.39],[.215,.46],[.12,.53]].map(p=>new THREE.Vector2(...p)),24),shirt,0,.88,0);torso.scale.z=.67;
 part(group,new THREE.CylinderGeometry(.065,.08,.13,10),skin,0,1.45,0);
 const head=part(group,new THREE.SphereGeometry(.15,24,20),skin,0,1.64,-.01);head.scale.set(.87,1.22,.98);
 part(group,new THREE.SphereGeometry(.15,24,12,0,Math.PI*2,0,Math.PI*.46),hair,0,1.645,-.005).scale.set(.88,1.26,1.01);
 const eyeWhite=new THREE.MeshStandardMaterial({color:0xd4c8b7,roughness:.45});tagSurface(eyeWhite,'smooth');
 for(const sign of [-1,1]){part(group,new THREE.SphereGeometry(.032,8,6),skin,sign*.13,1.64,0);const white=part(group,new THREE.SphereGeometry(.019,8,6),eyeWhite,sign*.051,1.66,-.139);white.scale.set(1,.65,.3);const eye=part(group,new THREE.SphereGeometry(.009,6,5),hair,sign*.051,1.66,-.147);eye.scale.z=.35}
 const backHair=part(group,new THREE.SphereGeometry(.092,12,8),hair,0,1.69,.095);backHair.scale.set(.9,icon.startsWith('👩')?1.4:.7,.75);
 part(group,new THREE.ConeGeometry(.025,.065,8),skin,0,1.625,-.155).rotation.x=-Math.PI/2;
 for(const sign of [-1,1]){const brow=part(group,new THREE.BoxGeometry(.05,.012,.009),hair,sign*.052,1.695,-.139);brow.rotation.z=sign*.09;const collar=part(group,new THREE.BoxGeometry(.11,.045,.025),shirt,sign*.052,1.363,-.108);collar.rotation.z=sign*.35;}
 part(group,new THREE.BoxGeometry(.05,.009,.012),hair,0,1.565,-.134);
 part(group,new THREE.CylinderGeometry(.185,.185,.038,12),shoes,0,.885,0).scale.z=.72;
 part(group,new THREE.BoxGeometry(.025,.32,.012),shirt,0,1.145,-.139);
 const leftArm=new THREE.Group(),rightArm=new THREE.Group(),leftLeg=new THREE.Group(),rightLeg=new THREE.Group(),elbows=[],knees=[];
 for(const [pivot,sign] of [[leftArm,-1],[rightArm,1]]){pivot.position.set(sign*.24,1.34,0);group.add(pivot);part(pivot,new THREE.CapsuleGeometry(.072,.17,4,8),shirt,0,-.13,0);const elbow=new THREE.Group();elbow.position.y=-.3;pivot.add(elbow);elbows.push(elbow);part(elbow,new THREE.CapsuleGeometry(.055,.16,4,8),skin,0,-.13,0);const hand=part(elbow,new THREE.SphereGeometry(.064,8,6),skin,0,-.29,0);hand.scale.set(.7,1,.6)}
 for(const [pivot,sign] of [[leftLeg,-1],[rightLeg,1]]){pivot.position.set(sign*.115,.88,0);group.add(pivot);part(pivot,new THREE.LatheGeometry([[.077,0],[.086,.09],[.105,.3],[.105,.4]].map(p=>new THREE.Vector2(...p)),16),pants,0,-.4,0);const knee=new THREE.Group();knee.position.y=-.4;pivot.add(knee);knees.push(knee);part(knee,new THREE.CylinderGeometry(.075,.052,.36,10),pants,0,-.18,0);const foot=part(knee,new THREE.CapsuleGeometry(.07,.13,4,8),shoes,0,-.39,-.055);foot.rotation.x=Math.PI/2;foot.scale.y=1.05}
 for(const limb of [leftArm,rightArm,leftLeg,rightLeg])limb.traverse(o=>o.userData.dynamic=true);
 const shadow=part(group,new THREE.PlaneGeometry(.95,.75),new THREE.MeshBasicMaterial({map:contactShadow(),color:0x10201c,transparent:true,opacity:.58,depthWrite:false}),0,.015,0);shadow.rotation.x=-Math.PI/2;
 batchStaticMeshes(group);return {group,leftArm,rightArm,leftLeg,rightLeg,knees,outfit(id){const clothes=casualOutfit(id,wardrobe);shirt.color.setHex(clothes.shirt);pants.color.setHex(clothes.pants);shoes.color.setHex(clothes.shoes)},animate(t,moving){leftArm.rotation.z=rightArm.rotation.z=leftLeg.rotation.z=rightLeg.rotation.z=0;const phase=t*8,step=moving?Math.sin(phase)*.5:0;leftLeg.rotation.x=step;rightLeg.rotation.x=-step;leftArm.rotation.x=-step*.7;rightArm.rotation.x=step*.7;knees[0].rotation.x=moving?Math.max(0,-Math.sin(phase))*.7:0;knees[1].rotation.x=moving?Math.max(0,Math.sin(phase))*.7:0;elbows.forEach(e=>e.rotation.x=-.15-Math.abs(step)*.3);group.position.y=moving?Math.abs(Math.sin(phase))*.018:Math.sin(t*2)*.003}};
}
