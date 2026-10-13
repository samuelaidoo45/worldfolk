import {isAccraMall} from './accra-mall-data.js';
import {createAccraMallInterior} from './accra-mall-interior.js';
import {createRoomAction,restPrompt,REST_SPOTS,applyRestPose} from './resting.js';
import {tagSurface,cityEnvironment} from './graphics-materials.js';
import {mobileFieldOfView} from './display-settings.js';
import {PUBLIC_VENUES} from './public-venues.js';
import {createPublicVenueScene} from './public-venue-scene.js';
import {createVenueScene} from './venue-scenes.js';
import {PAINTS} from './building-design.js';
import {LARGE_VENUES} from './venue-layouts.js';
import {batchStaticMeshes,interiorRenderer,disposeScene} from './render-utils.js';
import {createRoomPhysics} from './room-physics.js';
import * as THREE from './three.module.js';
import {createActor} from './world3d.js';
import {worldAtmosphere} from './atmosphere.js';

function box(scene,material,w,h,d,x,y,z){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh}
function cylinder(scene,material,r,h,x,y,z){const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,16),material);mesh.position.set(x,y,z);mesh.castShadow=true;scene.add(mesh);return mesh}
function roomFloor(kind){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d');const tiled=['clinic','shop','cafe'].includes(kind);c.fillStyle=tiled?'#c9d3cc':kind==='library'?'#806346':'#b19b7e';c.fillRect(0,0,256,256);c.strokeStyle=tiled?'#eef1e9':'#6d57413a';c.lineWidth=2;for(let y=0;y<256;y+=tiled?64:32){c.strokeRect(0,y,256,tiled?64:32);for(let x=(y/32%2)*64;x<256;x+=tiled?64:128)c.strokeRect(x,y,tiled?64:128,tiled?64:32)}const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(4,4);texture.colorSpace=THREE.SRGBColorSpace;return texture}
function labelTexture(text){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');ctx.fillStyle='#214436';ctx.fillRect(0,0,512,128);ctx.fillStyle='#f4dfaa';ctx.font='bold 49px sans-serif';ctx.textAlign='center';ctx.fillText(text.slice(0,18),256,78);return new THREE.CanvasTexture(canvas)}
export function createInterior3D({avatar,identity,outfit,kind,name,activities=[],furniture=[],design={}}){
  if(isAccraMall(name))return createAccraMallInterior({avatar,identity,outfit});
  if(PUBLIC_VENUES[kind])return createPublicVenueScene({avatar,identity,outfit,kind,name,activities,design});
  if(LARGE_VENUES[kind])return createVenueScene({avatar,identity,outfit,kind,name,activities,design});
  const palette=design.palette||PAINTS[0],cream=new THREE.MeshStandardMaterial({color:palette.wall,roughness:.88}),fabric=new THREE.MeshStandardMaterial({color:palette.accent,roughness:.8}),darkWood=new THREE.MeshStandardMaterial({color:palette.roof,roughness:.75}),wood=new THREE.MeshStandardMaterial({color:palette.roof,roughness:.8}),metal=new THREE.MeshStandardMaterial({color:0x394d51,metalness:.45,roughness:.48}),glass=new THREE.MeshStandardMaterial({color:0x8dd4ec,roughness:.18,emissive:0x326c8b,emissiveIntensity:.25});
  tagSurface(cream,'plaster');tagSurface(fabric,'fabric');tagSurface(wood,'wood');tagSurface(darkWood,'wood');tagSurface(glass,'glass');tagSurface(metal,'metal');
  const canvas=document.createElement('canvas');canvas.className='interior-canvas';canvas.setAttribute('aria-label',`${name} · ${kind} interior`);canvas.dataset.design=design.style||kind;canvas.dataset.paint=palette.wall;document.body.appendChild(canvas);
  const renderer=interiorRenderer(canvas);
  const outdoors=['market','beach'].includes(kind);const scene=new THREE.Scene();scene.environment=cityEnvironment();scene.background=new THREE.Color(outdoors?0x8fbfd2:kind==='church'?0x302a31:kind==='mosque'?0x173a3b:0x152b31);scene.fog=new THREE.Fog(scene.background,25,outdoors?140:55);
  const camera=new THREE.PerspectiveCamera(58,1,.1,100);camera.position.set(0,2.2,4.6);camera.lookAt(0,1.2,1.4);
  const ambient=new THREE.AmbientLight(0xd9efff,1.25);scene.add(ambient);const sun=new THREE.DirectionalLight(0xffdfaa,2.3);sun.position.set(-5,11,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;scene.add(sun);
  const lamp=new THREE.PointLight(0xffc77f,22,18);lamp.position.set(0,3.1,-2);scene.add(lamp);
  const floorMaterial=new THREE.MeshStandardMaterial({color:kind==='beach'?0xe4c58d:kind==='mosque'?0xbac0b3:kind==='church'?0xaba293:kind==='market'?0xad9979:0x8e6044,roughness:.92,map:!outdoors&&kind!=='mosque'?roomFloor(kind):null});const floor=box(scene,floorMaterial,kind==='market'?160:kind==='beach'?160:14,.28,kind==='market'?160:kind==='beach'?18:12,0,-.14,kind==='beach'?3:0);floor.receiveShadow=true;
  if(!outdoors){for(let x=-6.7;x<7;x+=1.35)box(scene,darkWood,.022,.006,12,x,.006,0);
  for(let z=-5.5;z<6;z+=1.5)box(scene,darkWood,14,.006,.022,0,.007,z);
  const ceiling=design.ceiling||3.6;const ceilingMat=new THREE.MeshStandardMaterial({color:palette.trim,roughness:.95});const roof=box(scene,ceilingMat,14,.12,12,0,ceiling,0);roof.castShadow=false;box(scene,cream,14,ceiling,.25,0,ceiling/2,6);box(scene,darkWood,1.8,2.55,.12,0,1.275,5.82);box(scene,cream,14,ceiling,.25,0,ceiling/2,-6);box(scene,cream,.25,ceiling,12,-7,ceiling/2,0);box(scene,cream,.25,ceiling,12,7,ceiling/2,0);
  box(scene,darkWood,14,.2,.35,0,3.5,-6);box(scene,darkWood,.2,3.6,.2,-7,1.8,0);box(scene,darkWood,.2,3.6,.2,7,1.8,0);
  for(const x of [-4.6,4.6]){box(scene,darkWood,2.55,1.75,.09,x,2,-5.77);box(scene,glass,2.28,1.48,.1,x,2,-5.71);box(scene,cream,.06,1.55,.13,x,2,-5.64);box(scene,cream,2.3,.06,.13,x,2,-5.64)}
  }
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(3.2,.8),new THREE.MeshBasicMaterial({map:labelTexture(kind==='home'?'WELCOME HOME':kind==='cafe'?'ACCRA CAFÉ':kind==='shop'?'LOCAL SHOP':kind==='office'?'CITY OFFICE':kind==='market'?'MARKET COURT':kind==='beach'?'COASTAL RETREAT':kind==='church'?'QUIET REFLECTION':kind==='mosque'?'PRAYER HALL':'ACCRA LIFE')}));sign.position.set(0,2.8,-5.85);scene.add(sign);if(outdoors)for(const x of [-1.5,1.5])box(scene,wood,.08,3.25,.08,x,1.6,-5.9);
  if(!outdoors){const art=document.createElement('canvas');art.width=256;art.height=192;const c=art.getContext('2d');c.fillStyle=palette.trim;c.fillRect(0,0,256,192);for(let i=0;i<8;i++){c.fillStyle=[palette.wall,palette.accent,palette.roof][i%3];c.beginPath();c.moveTo(i*40-50,192);c.lineTo(i*40+60,20+(design.seed||0)%65);c.lineTo(i*40+150,192);c.fill()}const tex=new THREE.CanvasTexture(art);tex.colorSpace=THREE.SRGBColorSpace;for(const side of [-1,1]){box(scene,darkWood,.1,1.6,2.1,side*6.82,2,1);const painting=new THREE.Mesh(new THREE.PlaneGeometry(1.9,1.4),new THREE.MeshBasicMaterial({map:tex}));painting.position.set(side*6.75,2,1);painting.rotation.y=-side*Math.PI/2;scene.add(painting)}}
  const exitMat=new THREE.MeshStandardMaterial({color:0x58d6a1,emissive:0x16804e,emissiveIntensity:.55});box(scene,exitMat,1.8,.035,.65,0,.025,4.65);
  const blockers=[],hotspots=[],residents=[],waves=[];let lastSky='';
  const block=(x,z,w,d)=>blockers.push({x,z,w,d});
  const spot=(x,z,label,actionId)=>hotspots.push({x,z,label,actionId});
  const accent=new THREE.MeshStandardMaterial({color:palette.accent,roughness:.8});
  const plaque=(text,x,z,w=2)=>{const material=new THREE.MeshBasicMaterial({map:labelTexture(text)}),mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,.4),material);mesh.position.set(x,2.6,z);scene.add(mesh)};
  const plant=(x,z)=>{cylinder(scene,cream,.25,.45,x,.225,z);const leaves=new THREE.Mesh(new THREE.SphereGeometry(.48,10,8),fabric);leaves.position.set(x,1,z);leaves.scale.set(.8,1.4,.8);scene.add(leaves);block(x,z,.55,.55)};
  const chair=(x,z)=>{box(scene,fabric,.65,.15,.65,x,.48,z);box(scene,fabric,.65,.7,.13,x,.87,z+.3);for(const dx of [-.25,.25])for(const dz of [-.25,.25])box(scene,metal,.06,.45,.06,x+dx,.225,z+dz);block(x,z,.7,.7)};
  if(!outdoors){for(const x of [-4,0,4]){box(scene,metal,.55,.08,.55,x,3.2,-1);const glow=new THREE.MeshBasicMaterial({color:0xffe3ad});box(scene,glow,.45,.025,.45,x,3.14,-1)}box(scene,accent,14,.16,.28,0,.1,-5.8);plant(6,-4.8);plant(-6,4);}

  if(kind==='church'){
    const pew=new THREE.MeshStandardMaterial({color:0x704331});for(const x of [-3.4,3.4])for(const z of [-2.4,-.6,1.2]){box(scene,pew,4.2,.18,.6,x,.55,z);box(scene,pew,4.2,.75,.13,x,.96,z+.3);block(x,z,4.2,.8)}box(scene,cream,3.5,.32,1.7,0,.16,-4.4);box(scene,darkWood,2.2,.9,.7,0,.75,-4.6);box(scene,metal,.14,1.8,.14,0,2.1,-5.5);box(scene,metal,1,.14,.14,0,2.5,-5.5);spot(0,-2.6,'Quiet reflection','explore');
    for(const x of [-6.7,6.7])for(const z of [-4,0,4])cylinder(scene,cream,.25,5,x,2.5,z);
  }else if(kind==='mosque'){
    const carpet=new THREE.MeshStandardMaterial({color:0x326e64}),edge=new THREE.MeshStandardMaterial({color:0xd5bd73});for(const z of [-3.7,-2.1,-.5,1.1])for(const x of [-4.5,-2.25,0,2.25,4.5]){box(scene,edge,1.8,.025,1.35,x,.02,z);box(scene,carpet,1.68,.03,1.23,x,.04,z)}box(scene,cream,2.7,3.4,.32,0,1.7,-5.7);const arch=new THREE.Mesh(new THREE.TorusGeometry(.8,.12,10,24,Math.PI),edge);arch.position.set(0,2.25,-5.43);scene.add(arch);box(scene,carpet,1.4,1.8,.08,0,1.2,-5.4);spot(0,-3.6,'Quiet reflection','explore');box(scene,darkWood,2.4,.65,.5,4,.32,3.6);block(4,3.6,2.4,.6);
  }else if(kind==='market'){
    for(const [i,x] of [-12,-6,0,6,12].entries()){const wall=new THREE.MeshStandardMaterial({color:[0xb87451,0xcaa466,0x6e9a92][i%3]});box(scene,wall,5.8,3.6,4,x,1.8,-11);box(scene,metal,2.4,2.5,.08,x,1.25,-8.97);box(scene,cream,5.9,.16,4.2,x,3.65,-11);for(const xx of [-1.6,1.6])box(scene,glass,.55,1,.09,x+xx,1.9,-8.95)}
    for(const x of [-9,9]){box(scene,cream,1.4,.85,1.4,x,.4,2);cylinder(scene,wood,.14,4.2,x,2.1,2);const leaves=new THREE.Mesh(new THREE.SphereGeometry(1.9,12,8),new THREE.MeshStandardMaterial({color:0x567b4b}));leaves.position.set(x,4.2,2);scene.add(leaves)}
    const stallColors=[0xcf6b42,0xd4ab42,0x337e77];for(const [i,x] of [-4.3,4.3].entries())for(const z of [-3,1]){const cloth=new THREE.MeshStandardMaterial({color:stallColors[(i+(z>0?1:0))%3],side:THREE.DoubleSide});box(scene,darkWood,3.8,.18,1.6,x,.9,z);for(const sx of [-1.8,1.8])box(scene,metal,.09,2.7,.09,x+sx,1.35,z);box(scene,cloth,4.2,.1,2.2,x,2.7,z);for(let n=0;n<15;n++){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.13,7,6),new THREE.MeshStandardMaterial({color:[0xb9b541,0xca7241,0x75a454][n%3]}));fruit.position.set(x+(n%5)*.55-1.1,1.12,z+Math.floor(n/5)*.35-.35);scene.add(fruit)}block(x,z,3.8,1.6);if(z<0){const vendor=createActor(i?'👨🏾':'👩🏾');vendor.group.position.set(x,0,z-1.3);vendor.group.rotation.y=Math.PI;scene.add(vendor.group);vendor.group.traverse(o=>o.userData.dynamic=true);residents.push(vendor)}}spot(-1.5,-2.3,'Buy fresh produce',activities.includes('marketfood')?'marketfood':'shopping');spot(1.5,.8,'Browse the market',activities.includes('shopping')?'shopping':activities[0]||'explore');
  }else if(kind==='beach'){
    const sea=new THREE.MeshStandardMaterial({color:0x339cae,roughness:.23,metalness:.2});box(scene,sea,200,.05,140,0,-.1,-76);for(let n=0;n<8;n++)waves.push(box(scene,new THREE.MeshBasicMaterial({color:0x9adbd5,transparent:true,opacity:.5}),60,.015,.18,0,-.06,-9-n*2.6));
    for(const x of [-4.2,4.2]){cylinder(scene,wood,.045,2.5,x,1.25,-1.5);const umbrella=new THREE.Mesh(new THREE.ConeGeometry(1.85,.65,12),new THREE.MeshStandardMaterial({color:x<0?0xe0a651:0x379999,side:THREE.DoubleSide}));umbrella.position.set(x,2.7,-1.5);scene.add(umbrella);box(scene,cream,1.9,.2,.7,x,.5,-.3);for(const side of [-.75,.75])box(scene,wood,.12,.45,.5,x+side,.23,-.3);block(x,-.3,1.9,.8)}spot(0,-3.5,'Enjoy the ocean view',activities.includes('beach')?'beach':'explore');
  }else if(kind==='home'||kind==='hotel'){
    box(scene,cream,3,.55,2.25,-3,.42,-2.25);box(scene,fabric,2.8,.22,2,-3,.77,-2.25);box(scene,cream,1,.16,.62,-3,.96,-3.02);block(-3,-2.25,3,2.25);spot(-3,-.4,'Rest on the bed',activities.includes('sleep')?'sleep':'explore');
    box(scene,darkWood,3,.5,1.2,3,.48,-2);box(scene,fabric,3,.7,.35,3,1,-2.48);block(3,-2,3,1.3);spot(3,-.25,'Sit and relax',activities.includes('relax')?'relax':'explore');
    box(scene,cream,3.2,.95,.72,0,.49,-4.9);box(scene,metal,.8,.02,.45,0,.98,-4.9);block(0,-4.9,3.2,.75);spot(0,-3.5,'Use the kitchen',activities.includes('cook')?'cook':'explore');
    if(kind==='home'){
      // Bedroom partition leaves a wide opening toward the entrance corridor.
      box(scene,cream,.16,2.9,4.2,-1.25,1.45,-3.2);block(-1.25,-3.2,.16,4.2);
      box(scene,accent,2.9,.03,2.5,3,.025,-.8);plaque('LIVING',3,-5.65);plaque('BEDROOM',-3.8,-5.65);
      box(scene,darkWood,1.25,2.3,.55,-5.6,1.15,-4.6);block(-5.6,-4.6,1.25,.55);for(const dx of [-.08,.08])box(scene,metal,.035,.27,.04,-5.6+dx,1.2,-4.29);plaque('WARDROBE',-5.6,-4.3,1.1);spot(-5.6,-3.5,'Change clothes','wardrobe');
      box(scene,cream,2.5,.04,2.6,-4.8,.025,1.5);
      box(scene,glass,.08,2.1,2.2,-5.9,1.05,1.4);block(-5.9,1.4,.08,2.2);
      cylinder(scene,metal,.045,2.2,-5.5,1.1,.5);box(scene,metal,.4,.06,.4,-5.5,2.15,.5);
      box(scene,cream,.8,.8,.5,-5.7,.4,2.8);block(-5.7,2.8,.8,.5);spot(-4.8,1.5,'Take a shower',activities.includes('shower')?'shower':'explore');
      box(scene,glass,1.5,1,.05,-4.1,1.6,-5.7);
    }else{plaque('GUEST SUITE',0,-5.6);box(scene,accent,3,.04,3,0,.025,0);box(scene,darkWood,1.8,.8,.7,5,.4,-4.8);block(5,-4.8,1.8,.7);spot(4,-3.4,'Explore the guest suite','explore')}
  }else if(kind==='cafe'){
    box(scene,darkWood,7,1.1,1.1,0,.55,-4.5);block(0,-4.5,7,1.1);spot(0,-2.8,'Order at the counter',activities.includes('meal')?'meal':activities.includes('cafe')?'cafe':'explore');
    for(const x of [-3.8,3.8]){cylinder(scene,darkWood,.8,.13,x,.75,.6);cylinder(scene,metal,.11,.7,x,.35,.6);block(x,.6,1.6,1.6);chair(x,2);chair(x,-.8);box(scene,cream,.18,.22,.18,x,.94,.6)}
    plaque('MENU · COFFEE & FOOD',0,-5.65,3);for(const x of [-2,0,2])box(scene,accent,.5,.3,.3,x,1.25,-4.5);
  }else if(kind==='shop'){
    for(const x of [-5,5])for(const z of [-3,0,3]){box(scene,darkWood,1.35,1.7,.58,x,.85,z);for(const y of [.5,1.05,1.6]){box(scene,cream,1.3,.06,.62,x,y,z);for(let n=0;n<4;n++)box(scene,n%2?accent:fabric,.2,.28,.23,x-.45+n*.3,y+.18,z)}block(x,z,1.35,.7)}
    box(scene,darkWood,2.8,1.1,1.1,0,.55,-3.5);block(0,-3.5,2.8,1.1);spot(0,-1.7,'Browse the shop','shopping');
  }else if(kind==='gallery'){
    plaque('ART · HISTORY · CULTURE',0,-5.65,4);
    for(const x of [-4,0,4]){box(scene,darkWood,2.7,1.8,.12,x,2,-5.65);box(scene,x?fabric:accent,2.4,1.5,.14,x,2,-5.56);for(let i=0;i<5;i++)box(scene,i%2?cream:wood,.18,1.15,.02,x-.9+i*.45,2,-5.47);spot(x,-3.8,'View the exhibition',activities.includes('museum')?'museum':'explore')}
    for(const x of [-3.5,3.5]){box(scene,cream,1.2,.9,1.2,x,.45,.5);cylinder(scene,accent,.35,1.4,x,1.6,.5);block(x,.5,1.2,1.2)}
  }else if(kind==='gym'){
    plaque('TRAINING FLOOR',0,-5.65,3);for(const x of [-4,4]){box(scene,metal,2.1,.28,3.2,x,.14,-2.5);box(scene,metal,.1,1.5,.1,x-1,.9,-3.5);box(scene,glass,1.6,.8,.08,x,1.5,-3.6);block(x,-2.5,2.1,3.2);spot(x,-.1,'Train on the treadmill','explore')}for(const x of [-3,0,3]){box(scene,fabric,1.2,.05,1.8,x,.04,2);spot(x,2,'Stretch and exercise','explore')}
  }else if(kind==='library'){
    plaque('READ · DISCOVER',0,-5.65,3);
    for(const x of [-5.3,5.3])for(const z of [-3.8,-.8,2.2]){box(scene,darkWood,1.2,2.4,1.25,x,1.2,z);block(x,z,1.2,1.25);for(const y of [.4,1.1,1.8])for(let n=0;n<5;n++)box(scene,n%2?accent:fabric,.14,.42,.5,x-.4+n*.2,y+.25,z+.5)}
    box(scene,wood,3,.12,1.6,0,.8,-1.8);block(0,-1.8,3,1.6);chair(-1,-.1);chair(1,-.1);spot(0,.2,'Read and study',activities.includes('study')?'study':activities.includes('museum')?'museum':'explore');
  }else if(kind==='classroom'){
    box(scene,new THREE.MeshStandardMaterial({color:0x234c40}),4,1.6,.08,0,2,-5.7);plaque('LEARN TOGETHER',0,-5.6,3);
    for(const x of [-3,3])for(const z of [-2.5,1]){box(scene,wood,2,.12,1,x,.8,z);block(x,z,2,1);chair(x,z+1.05)}spot(0,-2.5,'Study at the classroom',activities.includes('study')?'study':'explore');
  }else if(kind==='clinic'){
    plaque('RECEPTION',0,-5.65);box(scene,cream,3,1.1,.8,0,.55,-3.9);block(0,-3.9,3,.8);for(const x of [-4,4]){box(scene,cream,2.2,.5,2.3,x,.4,-2);box(scene,fabric,2,.12,2.1,x,.72,-2);block(x,-2,2.2,2.3)}for(const x of [-3,0,3])chair(x,2);spot(0,-2.4,'Visit reception','explore');
  }else if(kind==='office'){
    for(const x of [-3.4,3.4]){box(scene,darkWood,2.7,.13,1.25,x,.8,-2);for(const sx of [-1,1])box(scene,metal,.1,.8,.1,x+sx*1.1,.4,-2);box(scene,metal,1.1,.7,.07,x,1.22,-2.25);block(x,-2,2.7,1.25);chair(x,-.8);box(scene,glass,1,.55,.08,x,1.22,-2.2)}plaque('WORKSPACE',0,-5.65);spot(0,-1.1,'Work at a desk',activities.includes('office')?'office':activities.includes('study')?'study':'explore');
  }else{
    box(scene,darkWood,4,1,1.1,0,.5,-3.6);block(0,-3.6,4,1.1);spot(0,-1.8,'Explore this place',activities.includes('explore')?'explore':activities[0]||'explore');
    for(const x of [-4.5,4.5]){cylinder(scene,new THREE.MeshStandardMaterial({color:0x287453}),.38,1.3,x,.65,-3);cylinder(scene,cream,.48,.45,x,.22,-3)}
  }
  if(kind==='home'){
    if(furniture.includes('television')){box(scene,metal,2.1,1.3,.12,0,1.5,-5.62);box(scene,glass,1.9,1.1,.13,0,1.5,-5.52)}
    if(furniture.includes('sofa')){box(scene,fabric,3,.65,1.2,3,.6,1.6);block(3,1.6,3,1.2)}
    if(furniture.includes('bed'))box(scene,new THREE.MeshStandardMaterial({color:0xc7a454}),2.75,.12,1.5,-3,.94,-2.05);
  }
  if(!['home','hotel','market'].includes(kind)){const floorPhysics=createRoomPhysics(blockers);for(const [px,pz] of [[2,2.5],[-2,-2.5],[4,3]]){if(!floorPhysics.clear(px,pz))continue;const guest=createActor(residents.length%2?'👩🏾':'👨🏽');guest.group.position.set(px,0,pz);guest.group.traverse(o=>o.userData.dynamic=true);scene.add(guest.group);residents.push(guest)}}
  const marker=new THREE.Mesh(new THREE.RingGeometry(.34,.42,32),new THREE.MeshBasicMaterial({color:0xf2cd77,transparent:true,opacity:.8,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.y=.035;scene.add(marker);
  waves.forEach(o=>o.userData.dynamic=true);marker.userData.dynamic=true;batchStaticMeshes(scene);renderer.shadowMap.needsUpdate=true;
  const actor=createActor(avatar,identity);actor.outfit(outfit);actor.group.traverse(o=>o.castShadow=false);actor.group.position.set(0,0,3.4);scene.add(actor.group);
  const showerDrops=new THREE.InstancedMesh(new THREE.SphereGeometry(.013,4,3),new THREE.MeshBasicMaterial({color:0xb4dbe2,transparent:true,opacity:.65}),64),dropMatrix=new THREE.Matrix4();showerDrops.visible=false;scene.add(showerDrops);
  let yaw=0,lookPitch=0;let x=0,z=3.4,width=0,height=0;const action=createRoomAction(kind);let serverRest=false;
  function resize(){const w=window.innerWidth,h=window.innerHeight;if(w===width&&h===height)return;width=w;height=h;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=mobileFieldOfView(58,w,h,matchMedia('(any-pointer: coarse)').matches||navigator.maxTouchPoints>0);camera.updateProjectionMatrix()}
  const physics=createRoomPhysics(blockers),cameraPhysics=createRoomPhysics(blockers,{left:-6.6,right:6.6,back:-5.6,front:5.6});
  let animationDistance=0,animationTime=0;
  function move(dx,dz){if(action.active)return;const previous=[x,z];[x,z]=physics.move([x,z],[dx,dz]);animationDistance+=Math.hypot(x-previous[0],z-previous[1]);actor.group.position.set(x,0,z);if(Math.hypot(dx,dz)>.0001)actor.group.rotation.y=Math.atan2(-dx,-dz)}
  function nearby(){if(action.resting)return restPrompt(action.resting);if(z>3.7&&Math.abs(x)<1.8)return {kind:'exit',label:'Leave building'};const resident=residents.find(a=>Math.hypot(x-a.group.position.x,z-a.group.position.z)<1.8&&physics.visible([x,z],[a.group.position.x,a.group.position.z]));if(resident)return {kind:'local',actionId:'talk',label:'Talk to a visitor'};let best=null,distance=1.65;for(const spot of hotspots){const d=Math.hypot(x-spot.x,z-spot.z);if(d<distance&&physics.visible([x,z],[spot.x,spot.z])){best={kind:['shopping','wardrobe'].includes(spot.actionId)?'local':'activity',...spot};distance=d}}return best}
  function playAction(id,options){return action.start(id,options)}
  function setRest(id){if(!id&&!serverRest)return;serverRest=!!id;if(action.resting===id)return;if(action.resting)action.end();actor.group.rotation.set(0,0,0);if(REST_SPOTS[id]){[x,z]=REST_SPOTS[id];action.start(id,{persistent:true})}}
  function render(t,moving,cameraMode='third'){resize();const target=nearby();marker.visible=target?.kind==='activity';if(marker.visible){marker.position.set(target.x,.035,target.z);marker.material.opacity=.6+Math.sin(t*3)*.2}if(outdoors){const sky=worldAtmosphere(),key=sky.preset+sky.weather;if(key!==lastSky){lastSky=key;scene.environment=cityEnvironment(sky.preset);const night=sky.preset==='night',warm=['dusk','dawn'].includes(sky.preset);scene.background.set(night?0x101c30:warm?0xc39883:0x8fbfd2);scene.fog.color.copy(scene.background);ambient.intensity=night?.4:1.25;sun.intensity=night?.35:2.3;sun.color.set(warm?0xffb877:0xffdfaa)}}for(const resident of residents)resident.animate(t,false);waves.forEach((w,i)=>{w.position.z=-9-i*2.6+Math.sin(t*.6+i)*.5;w.material.opacity=.25+Math.sin(t+i)*.15});const {kind:actionKind,active,blend}=action.frame(t);actor.animate(t,moving&&!active,{speed:animationDistance/Math.max(.001,t-animationTime),action:active?actionKind:null,blend});animationTime=t;animationDistance=0;actor.group.position.set(x,actor.group.position.y,z);actor.group.rotation.x=actor.group.rotation.z=0;if(active&&['sleep','relax'].includes(actionKind)){applyRestPose(actor,actionKind,blend)}else if(active&&actionKind==='shower'){actor.group.position.lerp(new THREE.Vector3(-4.8,0,1.5),blend)}if(active&&!actor.rigged&&!['sleep','relax'].includes(actionKind)){actor.leftArm.rotation.x=-1.2*blend+Math.sin(t*12)*.16*blend;actor.rightArm.rotation.x=-1.2*blend-Math.sin(t*12)*.16*blend}showerDrops.visible=active&&actionKind==='shower';if(showerDrops.visible){for(let i=0;i<64;i++){dropMatrix.makeTranslation(-4.8+Math.sin(i*51)*.35,2.1-((t*1.6+i*.17)%2),1.5+Math.cos(i*37)*.35);showerDrops.setMatrixAt(i,dropMatrix)}showerDrops.instanceMatrix.needsUpdate=true}const angle=yaw*Math.PI/180;let distance=cameraMode==='first'?0:cameraMode==='overview'?9:outdoors?10:5;for(;distance>.6;distance-=.15){const cx=x-Math.sin(angle)*distance,cz=z+Math.cos(angle)*distance;if(cameraPhysics.clear(cx,cz)&&physics.visible([x,z],[cx,cz]))break}camera.position.lerp(new THREE.Vector3(x-Math.sin(angle)*distance,cameraMode==='first'?1.65:Math.min((design.ceiling||3.6)-.5,2.1+distance*.12+lookPitch),z+Math.cos(angle)*distance),.18);actor.group.visible=distance>1.1;camera.lookAt(x+Math.sin(angle)*3,1.35,z-Math.cos(angle)*3);renderer.render(scene,camera)}
  function destroy(){disposeScene(scene);renderer.dispose();renderer.forceContextLoss();canvas.remove()}
  return {setOutfit(id){actor.outfit(id)},look(delta,tilt=0){yaw=(yaw+delta+360)%360;lookPitch=Math.max(-.4,Math.min(.4,lookPitch+tilt*.03))},get bearing(){return yaw},move,nearby,render,playAction,setRest,destroy,get resting(){return action.resting},get description(){return action.resting==='sleep'?'Sleeping · wake up when you are ready':action.resting==='relax'?'Sitting · stand up when you are ready':action.resting==='shower'?'Showering · choose Finish shower to stop':action.resting==='dance'?'Dancing · choose Stop dancing to stop':''},interact(id){if(['wake','stand','stop-activity'].includes(id)){action.end();actor.group.rotation.set(0,0,0);return}if(id==='shopping')return 'shops';if(id==='wardrobe')return 'wardrobe';return {dialogue:`Visitor · Welcome to ${name}. Explore the room and use the marked activity spots. You can also chat with other players.`}},get isActing(){return action.active},get position(){return [x,z]},get name(){return name}};
}
