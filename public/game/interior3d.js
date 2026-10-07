import * as THREE from './three.module.js';
import {createActor} from './world3d.js';
import {worldAtmosphere} from './atmosphere.js';

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
  const outdoors=['market','beach'].includes(kind);const scene=new THREE.Scene();scene.background=new THREE.Color(outdoors?0x8fbfd2:kind==='church'?0x302a31:kind==='mosque'?0x173a3b:0x152b31);scene.fog=new THREE.Fog(scene.background,25,outdoors?140:55);
  const camera=new THREE.PerspectiveCamera(58,1,.1,100);camera.position.set(0,3.2,10.1);camera.lookAt(0,1.2,1.4);
  const ambient=new THREE.AmbientLight(0xd9efff,1.25);scene.add(ambient);const sun=new THREE.DirectionalLight(0xffdfaa,2.3);sun.position.set(-5,11,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;scene.add(sun);
  const lamp=new THREE.PointLight(0xffc77f,22,18);lamp.position.set(0,3.1,-2);scene.add(lamp);
  const floorMaterial=new THREE.MeshStandardMaterial({color:kind==='beach'?0xe4c58d:kind==='mosque'?0xbac0b3:kind==='church'?0xaba293:kind==='market'?0xad9979:0x8e6044,roughness:.92});const floor=box(scene,floorMaterial,kind==='market'?160:kind==='beach'?160:14,.28,kind==='market'?160:kind==='beach'?18:12,0,-.14,kind==='beach'?3:0);floor.receiveShadow=true;
  if(!outdoors){for(let x=-6.7;x<7;x+=1.35)box(scene,darkWood,.022,.006,12,x,.006,0);
  for(let z=-5.5;z<6;z+=1.5)box(scene,darkWood,14,.006,.022,0,.007,z);
  box(scene,cream,14,3.6,.25,0,1.8,-6);box(scene,cream,.25,3.6,12,-7,1.8,0);box(scene,cream,.25,3.6,12,7,1.8,0);
  box(scene,darkWood,14,.2,.35,0,3.5,-6);box(scene,darkWood,.2,3.6,.2,-7,1.8,0);box(scene,darkWood,.2,3.6,.2,7,1.8,0);
  for(const x of [-4.6,4.6]){box(scene,darkWood,2.55,1.75,.09,x,2,-5.77);box(scene,glass,2.28,1.48,.1,x,2,-5.71);box(scene,cream,.06,1.55,.13,x,2,-5.64);box(scene,cream,2.3,.06,.13,x,2,-5.64)}
  }
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.8),new THREE.MeshBasicMaterial({map:labelTexture(kind==='home'?'WELCOME HOME':kind==='cafe'?'ACCRA CAFÉ':kind==='shop'?'LOCAL SHOP':kind==='office'?'CITY OFFICE':kind==='market'?'MARKET COURT':kind==='beach'?'COASTAL RETREAT':kind==='church'?'QUIET REFLECTION':kind==='mosque'?'PRAYER HALL':'ACCRA LIFE')}));sign.position.set(0,2.8,-5.85);scene.add(sign);if(outdoors)for(const x of [-1.5,1.5])box(scene,wood,.08,3.25,.08,x,1.6,-5.9);
  const exitMat=new THREE.MeshStandardMaterial({color:0x58d6a1,emissive:0x16804e,emissiveIntensity:.55});box(scene,exitMat,1.8,.035,.65,0,.025,4.65);
  const blockers=[],hotspots=[],residents=[],waves=[];let lastSky='';
  const block=(x,z,w,d)=>blockers.push({x,z,w,d});
  const spot=(x,z,label,actionId)=>hotspots.push({x,z,label,actionId});
  if(kind==='church'){
    const pew=new THREE.MeshStandardMaterial({color:0x704331});for(const x of [-3.4,3.4])for(const z of [-2.4,-.6,1.2]){box(scene,pew,4.2,.18,.6,x,.55,z);box(scene,pew,4.2,.75,.13,x,.96,z+.3);block(x,z,4.2,.8)}box(scene,cream,3.5,.32,1.7,0,.16,-4.4);box(scene,darkWood,2.2,.9,.7,0,.75,-4.6);box(scene,metal,.14,1.8,.14,0,2.1,-5.5);box(scene,metal,1,.14,.14,0,2.5,-5.5);spot(0,-2.6,'Quiet reflection','explore');
    for(const x of [-6.7,6.7])for(const z of [-4,0,4])cylinder(scene,cream,.25,5,x,2.5,z);
  }else if(kind==='mosque'){
    const carpet=new THREE.MeshStandardMaterial({color:0x326e64}),edge=new THREE.MeshStandardMaterial({color:0xd5bd73});for(const z of [-3.7,-2.1,-.5,1.1])for(const x of [-4.5,-2.25,0,2.25,4.5]){box(scene,edge,1.8,.025,1.35,x,.02,z);box(scene,carpet,1.68,.03,1.23,x,.04,z)}box(scene,cream,2.7,3.4,.32,0,1.7,-5.7);const arch=new THREE.Mesh(new THREE.TorusGeometry(.8,.12,10,24,Math.PI),edge);arch.position.set(0,2.25,-5.43);scene.add(arch);box(scene,carpet,1.4,1.8,.08,0,1.2,-5.4);spot(0,-3.6,'Quiet reflection','explore');box(scene,darkWood,2.4,.65,.5,4,.32,3.6);block(4,3.6,2.4,.6);
  }else if(kind==='market'){
    for(const [i,x] of [-12,-6,0,6,12].entries()){const wall=new THREE.MeshStandardMaterial({color:[0xb87451,0xcaa466,0x6e9a92][i%3]});box(scene,wall,5.8,3.6,4,x,1.8,-11);box(scene,metal,2.4,2.5,.08,x,1.25,-8.97);box(scene,cream,5.9,.16,4.2,x,3.65,-11);for(const xx of [-1.6,1.6])box(scene,glass,.55,1,.09,x+xx,1.9,-8.95)}
    for(const x of [-9,9]){box(scene,cream,1.4,.85,1.4,x,.4,2);cylinder(scene,wood,.14,4.2,x,2.1,2);const leaves=new THREE.Mesh(new THREE.SphereGeometry(1.9,12,8),new THREE.MeshStandardMaterial({color:0x567b4b}));leaves.position.set(x,4.2,2);scene.add(leaves)}
    const stallColors=[0xcf6b42,0xd4ab42,0x337e77];for(const [i,x] of [-4.3,4.3].entries())for(const z of [-3,1]){const cloth=new THREE.MeshStandardMaterial({color:stallColors[(i+(z>0?1:0))%3],side:THREE.DoubleSide});box(scene,darkWood,3.8,.18,1.6,x,.9,z);for(const sx of [-1.8,1.8])box(scene,metal,.09,2.7,.09,x+sx,1.35,z);box(scene,cloth,4.2,.1,2.2,x,2.7,z);for(let n=0;n<15;n++){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.13,7,6),new THREE.MeshStandardMaterial({color:[0xb9b541,0xca7241,0x75a454][n%3]}));fruit.position.set(x+(n%5)*.55-1.1,1.12,z+Math.floor(n/5)*.35-.35);scene.add(fruit)}block(x,z,3.8,1.6);if(z<0){const vendor=createActor(i?'👨🏾':'👩🏾');vendor.group.position.set(x,0,z-1.3);vendor.group.rotation.y=Math.PI;scene.add(vendor.group);residents.push(vendor)}}spot(-1.5,-2.3,'Buy fresh produce',activities.includes('marketfood')?'marketfood':'shopping');spot(1.5,.8,'Browse the market',activities.includes('shopping')?'shopping':activities[0]||'explore');
  }else if(kind==='beach'){
    const sea=new THREE.MeshStandardMaterial({color:0x339cae,roughness:.23,metalness:.2});box(scene,sea,200,.05,140,0,-.1,-76);for(let n=0;n<8;n++)waves.push(box(scene,new THREE.MeshBasicMaterial({color:0x9adbd5,transparent:true,opacity:.5}),60,.015,.18,0,-.06,-9-n*2.6));
    for(const x of [-4.2,4.2]){cylinder(scene,wood,.045,2.5,x,1.25,-1.5);const umbrella=new THREE.Mesh(new THREE.ConeGeometry(1.85,.65,12),new THREE.MeshStandardMaterial({color:x<0?0xe0a651:0x379999,side:THREE.DoubleSide}));umbrella.position.set(x,2.7,-1.5);scene.add(umbrella);box(scene,cream,1.9,.2,.7,x,.5,-.3);for(const side of [-.75,.75])box(scene,wood,.12,.45,.5,x+side,.23,-.3);block(x,-.3,1.9,.8)}spot(0,-3.5,'Enjoy the ocean view',activities.includes('beach')?'beach':'explore');
  }else if(kind==='home'){
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
  function render(t,moving){resize();if(outdoors){const sky=worldAtmosphere(),key=sky.preset+sky.weather;if(key!==lastSky){lastSky=key;const night=sky.preset==='night',warm=['dusk','dawn'].includes(sky.preset);scene.background.set(night?0x101c30:warm?0xc39883:0x8fbfd2);scene.fog.color.copy(scene.background);ambient.intensity=night?.4:1.25;sun.intensity=night?.35:2.3;sun.color.set(warm?0xffb877:0xffdfaa)}}for(const resident of residents)resident.animate(t,false);waves.forEach((w,i)=>{w.position.z=-9-i*2.6+Math.sin(t*.6+i)*.5;w.material.opacity=.25+Math.sin(t+i)*.15});actor.animate(t,moving&&t>=actionUntil);const active=t<actionUntil,blend=active?Math.min(1,(t-actionStart)*3,(actionUntil-t)*3):0;actor.group.rotation.z=actionKind==='sleep'?-Math.PI*.43*blend:0;if(actionKind==='sleep')actor.group.position.y=.52*blend;else if(actionKind==='relax')actor.group.position.y=-.25*blend;if(active){actor.leftArm.rotation.x=-1.2*blend+Math.sin(t*12)*.16*blend;actor.rightArm.rotation.x=-1.2*blend-Math.sin(t*12)*.16*blend}camera.position.lerp(new THREE.Vector3(x,window.innerHeight>window.innerWidth?3.4:2.9,z+(window.innerHeight>window.innerWidth?5.2:6.5)),.14);camera.lookAt(x,1.25,z-2);renderer.render(scene,camera)}
  function destroy(){renderer.dispose();canvas.remove()}
  return {move,nearby,render,playAction,destroy,get position(){return [x,z]},get name(){return name}};
}
