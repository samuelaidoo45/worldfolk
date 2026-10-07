import * as THREE from './three.module.js';
import {createActor} from './world3d.js';

const wood=new THREE.MeshStandardMaterial({color:0x8e6044,roughness:.77});
const darkWood=new THREE.MeshStandardMaterial({color:0x5a3e30,roughness:.78});
const cream=new THREE.MeshStandardMaterial({color:0xe9ddc7,roughness:.95});
const fabric=new THREE.MeshStandardMaterial({color:0x297d77,roughness:.9});
const metal=new THREE.MeshStandardMaterial({color:0x394d51,metalness:.45,roughness:.48});
const glass=new THREE.MeshStandardMaterial({color:0x8dd4ec,metalness:.12,roughness:.18,emissive:0x326c8b,emissiveIntensity:.25});
function box(scene,material,w,h,d,x,y,z){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh}
function cylinder(scene,material,r,h,x,y,z){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),material);mesh.position.set(x,y,z);mesh.castShadow=true;scene.add(mesh);return mesh}
function labelTexture(text){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#214436';ctx.fillRect(0,0,512,128);ctx.fillStyle='#f4dfaa';ctx.font='bold 49px sans-serif';ctx.textAlign='center';ctx.fillText(text.slice(0,18),256,78);return new THREE.CanvasTexture(canvas)}
export function createInterior3D({avatar,kind,name,activities,furniture=[]}){
  const canvas=document.createElement('canvas');canvas.className='interior-canvas';canvas.setAttribute('aria-hidden','true');document.body.appendChild(canvas);
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x152b31);scene.fog=new THREE.Fog(0x152b31,22,45);
  const camera=new THREE.PerspectiveCamera(58,1,.1,100);camera.position.set(0,3.2,10.1);camera.lookAt(0,1.2,1.4);
  scene.add(new THREE.AmbientLight(0xd9efff,1.25));const sun=new THREE.DirectionalLight(0xffdfaa,2.3);sun.position.set(-5,11,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;scene.add(sun);
  const lamp=new THREE.PointLight(0xffc77f,22,18);lamp.position.set(0,3.1,-2);scene.add(lamp);
  const floor=box(scene,wood,14,.28,12,0,-.14,0);floor.receiveShadow=true;
  for(let x=-6.7;x<7;x+=1.35)box(scene,darkWood,.022,.006,12,x,.006,0);
  for(let z=-5.5;z<6;z+=1.5)box(scene,darkWood,14,.006,.022,0,.007,z);
  box(scene,cream,14,3.6,.25,0,1.8,-6);box(scene,cream,.25,3.6,12,-7,1.8,0);box(scene,cream,.25,3.6,12,7,1.8,0);
  box(scene,darkWood,14,.2,.35,0,3.5,-6);box(scene,darkWood,.2,3.6,.2,-7,1.8,0);box(scene,darkWood,.2,3.6,.2,7,1.8,0);
  for(const x of [-4.6,4.6]){box(scene,darkWood,2.55,1.75,.09,x,2,-5.77);box(scene,glass,2.28,1.48,.1,x,2,-5.71);box(scene,cream,.06,1.55,.13,x,2,-5.64);box(scene,cream,2.3,.06,.13,x,2,-5.64)}
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.8),new THREE.MeshBasicMaterial({map:labelTexture(kind==='home'?'WELCOME HOME':kind==='cafe'?'ACCRA CAFÉ':kind==='shop'?'LOCAL SHOP':kind==='office'?'CITY OFFICE':'ACCRA LIFE')}));sign.position.set(0,2.8,-5.85);scene.add(sign);
  const exitMat=new THREE.MeshStandardMaterial({color:0x58d6a1,emissive:0x16804e,emissiveIntensity:.55});box(scene,exitMat,1.8,.035,.65,0,.025,4.65);
  const blockers=[],hotspots=[];
  const block=(x,z,w,d)=>blockers.push({x,z,w,d});
  const spot=(x,z,label,actionId)=>hotspots.push({x,z,label,actionId});
  if(kind==='home'){
    box(scene,cream,3,.55,2.25,-3,.42,-2.25);box(scene,fabric,2.8,.22,2,-3,.77,-2.25);box(scene,cream,1,.16,.62,-3,.96,-3.02);block(-3,-2.25,3,2.25);spot(-3,-.4,'Rest on the bed',activities.includes('sleep')?'sleep':'explore');
    box(scene,darkWood,3,.5,1.2,3,.48,-2);box(scene,fabric,3,.7,.35,3,1,-2.48);block(3,-2,3,1.3);spot(3,-.25,'Sit and relax',activities.includes('relax')?'relax':'explore');
    box(scene,cream,3.2,.95,.72,0,.49,-4.9);box(scene,metal,.8,.02,.45,0,.98,-4.9);block(0,-4.9,3.2,.75);spot(0,-3.5,'Use the kitchen',activities.includes('cook')?'cook':'explore');
  }else if(kind==='cafe'){
    box(scene,darkWood,7,1.1,1.1,0,.55,-4.5);block(0,-4.5,7,1.1);spot(0,-2.8,'Order at the counter',activities.includes('meal')?'meal':activities.includes('cafe')?'cafe':'explore');
    for(const x of [-3.8,3.8]){cylinder(scene,darkWood,.8,.13,x,.75,.6);cylinder(scene,metal,.11,.7,x,.35,.6);block(x,.6,1.6,1.6)}
  }else if(kind==='shop'){
    for(const x of [-5,5])for(const z of [-3,0,3]){box(scene,darkWood,1.35,1.7,.58,x,.85,z);for(const y of [.5,1.05,1.6])box(scene,cream,1.3,.06,.62,x,y,z);block(x,z,1.35,.7)}
    box(scene,darkWood,2.8,1.1,1.1,0,.55,-3.5);block(0,-3.5,2.8,1.1);spot(0,-1.7,'Browse the shop',activities.includes('shopping')?'shopping':'explore');
  }else if(kind==='office'){
    for(const x of [-3.4,3.4]){box(scene,darkWood,2.7,.13,1.25,x,.8,-2);for(const sx of [-1,1])box(scene,metal,.1,.8,.1,x+sx*1.1,.4,-2);box(scene,metal,1.1,.7,.07,x,1.22,-2.25);block(x,-2,2.7,1.25)}spot(0,-1.1,'Work at a desk',activities.includes('office')?'office':activities.includes('study')?'study':'explore');
  }else{
    box(scene,darkWood,4,1,1.1,0,.5,-3.6);block(0,-3.6,4,1.1);spot(0,-1.8,'Explore this place',activities.includes('explore')?'explore':activities[0]||'explore');
    for(const x of [-4.5,4.5]){cylinder(scene,new THREE.MeshStandardMaterial({color:0x287453}),.38,1.3,x,.65,-3);cylinder(scene,cream,.48,.45,x,.22,-3)}
  }
  if(kind==='home'){
    if(furniture.includes('television')){box(scene,metal,2.1,1.3,.12,0,1.5,-5.62);box(scene,glass,1.9,1.1,.13,0,1.5,-5.52)}
    if(furniture.includes('sofa')){box(scene,fabric,3,.65,1.2,3,.6,1.6);block(3,1.6,3,1.2)}
    if(furniture.includes('bed'))box(scene,new THREE.MeshStandardMaterial({color:0xc7a454}),2.75,.12,1.5,-3,.94,-2.05);
  }
  const actor=createActor(avatar);actor.group.position.set(0,0,3.4);scene.add(actor.group);
  let x=0,z=3.4,width=0,height=0,actionStart=0,actionUntil=0,actionKind='';
  function resize(){const w=window.innerWidth,h=window.innerHeight;if(w===width&&h===height)return;width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  function allowed(px,pz){if(Math.abs(px)>6.25||pz<-5.15||pz>4.7)return false;return !blockers.some(b=>Math.abs(px-b.x)<b.w/2+.38&&Math.abs(pz-b.z)<b.d/2+.38)}
  function move(dx,dz){if(performance.now()/1000<actionUntil)return;const tx=x+dx,tz=z+dz;if(allowed(tx,tz)){x=tx;z=tz}else if(allowed(tx,z))x=tx;else if(allowed(x,tz))z=tz;actor.group.position.x=x;actor.group.position.z=z;actor.group.rotation.y=Math.atan2(-dx,-dz)}
  function nearby(){if(z>3.7&&Math.abs(x)<1.8)return {kind:'exit',label:'Leave building'};let best=null,distance=2.35;for(const spot of hotspots){const d=Math.hypot(x-spot.x,z-spot.z);if(d<distance){best={kind:'activity',...spot};distance=d}}return best}
  function playAction(kind){actionKind=kind;actionStart=performance.now()/1000;actionUntil=actionStart+2.3}
  function render(t,moving){resize();actor.animate(t,moving&&t>=actionUntil);const active=t<actionUntil,blend=active?Math.min(1,(t-actionStart)*3,(actionUntil-t)*3):0;actor.group.rotation.z=actionKind==='sleep'?-Math.PI*.43*blend:0;if(actionKind==='sleep')actor.group.position.y=.52*blend;else if(actionKind==='relax')actor.group.position.y=-.25*blend;if(active){actor.leftArm.rotation.x=-1.2*blend+Math.sin(t*12)*.16*blend;actor.rightArm.rotation.x=-1.2*blend-Math.sin(t*12)*.16*blend}camera.position.lerp(new THREE.Vector3(x,window.innerHeight>window.innerWidth?3.4:2.9,z+(window.innerHeight>window.innerWidth?5.2:6.5)),.14);camera.lookAt(x,1.25,z-2);renderer.render(scene,camera)}
  function destroy(){renderer.dispose();canvas.remove()}
  return {move,nearby,render,playAction,destroy,get position(){return [x,z]},get name(){return name}};
}
