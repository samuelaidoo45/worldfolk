import {batchStaticMeshes,disposeScene} from './render-utils.js';
import {potholeImpact} from './road-surface.js';
import {createStreetLight} from './street-lighting.js';
import {createBuildingFacade,setFacadeLighting} from './building-facades.js';
import {damp,turnToward,distanceMetres} from './motion.js';
import * as THREE from './three.module.js';

const disposeModel=disposeScene;
const DEG=Math.PI/180;
const METERS_PER_DEGREE=111320;
function colorForAvatar(icon){
  const dark=icon.includes('🏿'),medium=icon.includes('🏽');
  return {skin:dark?0x65402f:medium?0xa87350:0x8b563b,shirt:icon.startsWith('👩')?0xe57082:icon.startsWith('👨')?0x297b9c:0x42a46e,hair:0x211b19};
}
export function createActor(icon){
 const colors=colorForAvatar(icon),group=new THREE.Group(),skin=new THREE.MeshStandardMaterial({color:colors.skin,roughness:.72}),shirt=new THREE.MeshStandardMaterial({color:colors.shirt,roughness:.86}),pants=new THREE.MeshStandardMaterial({color:0x26323d,roughness:.94}),hair=new THREE.MeshStandardMaterial({color:colors.hair,roughness:.98}),shoes=new THREE.MeshStandardMaterial({color:0x232525,roughness:.64});
 const part=(parent,geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m};
 const torso=part(group,new THREE.CylinderGeometry(.215,.18,.53,12),shirt,0,1.12,0);torso.scale.z=.62;
 part(group,new THREE.CylinderGeometry(.065,.08,.13,10),skin,0,1.45,0);
 const head=part(group,new THREE.SphereGeometry(.15,16,12),skin,0,1.64,-.01);head.scale.set(.87,1.22,.98);
 part(group,new THREE.SphereGeometry(.154,16,8,0,Math.PI*2,0,Math.PI*.42),hair,0,1.71,0);
 for(const sign of [-1,1]){part(group,new THREE.SphereGeometry(.032,8,6),skin,sign*.13,1.64,0);const eye=part(group,new THREE.SphereGeometry(.012,6,5),hair,sign*.051,1.66,-.143);eye.scale.z=.35}
 part(group,new THREE.ConeGeometry(.025,.065,8),skin,0,1.625,-.155).rotation.x=-Math.PI/2;
 const leftArm=new THREE.Group(),rightArm=new THREE.Group(),leftLeg=new THREE.Group(),rightLeg=new THREE.Group(),elbows=[],knees=[];
 for(const [pivot,sign] of [[leftArm,-1],[rightArm,1]]){pivot.position.set(sign*.24,1.34,0);group.add(pivot);part(pivot,new THREE.CapsuleGeometry(.072,.17,4,8),shirt,0,-.13,0);const elbow=new THREE.Group();elbow.position.y=-.3;pivot.add(elbow);elbows.push(elbow);part(elbow,new THREE.CapsuleGeometry(.055,.16,4,8),skin,0,-.13,0);const hand=part(elbow,new THREE.SphereGeometry(.064,8,6),skin,0,-.29,0);hand.scale.set(.7,1,.6)}
 for(const [pivot,sign] of [[leftLeg,-1],[rightLeg,1]]){pivot.position.set(sign*.115,.88,0);group.add(pivot);part(pivot,new THREE.CylinderGeometry(.105,.077,.4,10),pants,0,-.19,0);const knee=new THREE.Group();knee.position.y=-.4;pivot.add(knee);knees.push(knee);part(knee,new THREE.CylinderGeometry(.075,.052,.36,10),pants,0,-.18,0);const foot=part(knee,new THREE.CapsuleGeometry(.07,.13,4,8),shoes,0,-.39,-.055);foot.rotation.x=Math.PI/2;foot.scale.y=1.05}
 for(const limb of [leftArm,rightArm,leftLeg,rightLeg])limb.traverse(o=>o.userData.dynamic=true);
 const shadow=part(group,new THREE.CircleGeometry(.3,16),new THREE.MeshBasicMaterial({color:0x10251c,transparent:true,opacity:.22,depthWrite:false}),0,.015,0);shadow.rotation.x=-Math.PI/2;
 batchStaticMeshes(group);return {group,leftArm,rightArm,leftLeg,rightLeg,outfit(id){shirt.color.setHex(id==='shirt'?0xcc993d:colors.shirt);shoes.color.setHex(id==='trainers'?0xeeeecc:0x232525)},animate(t,moving){const phase=t*8,step=moving?Math.sin(phase)*.5:0;leftLeg.rotation.x=step;rightLeg.rotation.x=-step;leftArm.rotation.x=-step*.7;rightArm.rotation.x=step*.7;knees[0].rotation.x=moving?Math.max(0,-Math.sin(phase))*.7:0;knees[1].rotation.x=moving?Math.max(0,Math.sin(phase))*.7:0;elbows.forEach(e=>e.rotation.x=-.15-Math.abs(step)*.3);group.position.y=moving?Math.abs(Math.sin(phase))*.018:Math.sin(t*2)*.003}};
}
export function createCar(color=0x236f91){
 const group=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color,metalness:.65,roughness:.28}),glass=new THREE.MeshStandardMaterial({color:0x304b58,metalness:.65,roughness:.14}),rubber=new THREE.MeshStandardMaterial({color:0x14191b,roughness:.93}),chrome=new THREE.MeshStandardMaterial({color:0xadb9be,metalness:.8,roughness:.25}),wheels=[];
 const part=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;group.add(m);return m};
 const profile=(points,width,mat)=>{const shape=new THREE.Shape(points.map(([z,y])=>new THREE.Vector2(z,y)));const geo=new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSize:.045,bevelThickness:.035,bevelSegments:2,steps:1});const mesh=part(geo,mat,width/2,0,0);mesh.rotation.y=-Math.PI/2;return mesh};
 profile([[-1.74,.49],[-1.8,.7],[-1.42,.89],[-.82,.96],[.95,.95],[1.76,.78],[1.8,.49]],1.66,paint);
 profile([[-.98,.91],[-.53,1.46],[.5,1.46],[1.07,.91]],1.38,glass);
 part(new THREE.BoxGeometry(1.4,.065,1.12),paint,0,1.48,-.01);
 for(const sign of [-1,1]){
  part(new THREE.BoxGeometry(.045,.54,.055),paint,sign*.711,1.18,.05);part(new THREE.BoxGeometry(.04,.065,1.5),chrome,sign*.727,.95,.05);
  part(new THREE.BoxGeometry(.045,.42,.025),rubber,sign*.856,.68,.23);part(new THREE.BoxGeometry(.05,.025,.17),chrome,sign*.875,.83,.35);part(new THREE.BoxGeometry(.17,.12,.23),paint,sign*.94,1.07,-.7);
  for(const z of [-1.17,1.17]){const wheel=part(new THREE.CylinderGeometry(.34,.34,.22,20),rubber,sign*.92,.34,z);wheel.rotation.z=Math.PI/2;wheels.push(wheel);const hub=part(new THREE.CylinderGeometry(.23,.23,.235,12),chrome,sign*.93,.34,z);hub.rotation.z=Math.PI/2;const center=part(new THREE.CylinderGeometry(.1,.1,.24,10),rubber,sign*.94,.34,z);center.rotation.z=Math.PI/2;}
  part(new THREE.BoxGeometry(.42,.13,.045),new THREE.MeshStandardMaterial({color:0xe4f2ff,emissive:0x9cbed7,emissiveIntensity:.35}),sign*.59,.72,-1.81);part(new THREE.BoxGeometry(.37,.12,.045),new THREE.MeshStandardMaterial({color:0xac2222,emissive:0x770800,emissiveIntensity:.3}),sign*.62,.74,1.81);
 }
 part(new THREE.BoxGeometry(.86,.2,.06),rubber,0,.56,-1.81);for(const y of [.51,.56,.61])part(new THREE.BoxGeometry(.76,.014,.07),chrome,0,y,-1.82);
 part(new THREE.BoxGeometry(.38,.105,.065),new THREE.MeshStandardMaterial({color:0xe9c743}),0,.64,1.83);
 const shadow=part(new THREE.PlaneGeometry(2.1,3.9),new THREE.MeshBasicMaterial({color:0x071413,transparent:true,opacity:.22,depthWrite:false}),0,.015,0);shadow.rotation.x=-Math.PI/2;
 batchStaticMeshes(group);return {group};
}

function createMotorcycle(){
  const group=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color:0xd8ad3c,metalness:.4,roughness:.35}),dark=new THREE.MeshStandardMaterial({color:0x253336}),chrome=new THREE.MeshStandardMaterial({color:0xaabbbc,metalness:.8,roughness:.25});
  const part=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);return m};
  for(const z of [-.85,.85]){part(new THREE.CylinderGeometry(.36,.36,.18,20),dark,0,.36,z).rotation.z=Math.PI/2;part(new THREE.CylinderGeometry(.18,.18,.19,16),chrome,0,.36,z).rotation.z=Math.PI/2}
  part(new THREE.BoxGeometry(.38,.28,1.4),dark,0,.57,0);part(new THREE.BoxGeometry(.5,.33,.6),paint,0,.95,-.28);part(new THREE.BoxGeometry(.42,.16,.75),dark,0,1.02,.4);part(new THREE.BoxGeometry(.76,.07,.1),chrome,0,1.3,-.62);part(new THREE.BoxGeometry(.09,.85,.09),chrome,0,.77,-.82);
  part(new THREE.SphereGeometry(.12,12,8),new THREE.MeshBasicMaterial({color:0xffecc1}),0,1.04,-.92);
  const rider=createActor('🧑🏾');rider.group.scale.setScalar(.75);rider.group.position.set(0,.55,.25);rider.leftArm.rotation.x=1;rider.rightArm.rotation.x=1;rider.leftLeg.rotation.x=1.05;rider.rightLeg.rotation.x=1.05;group.add(rider.group);
  return {group,rider:rider.group};
}
function createVenueProp(kind){const group=new THREE.Group(),wood=new THREE.MeshStandardMaterial({color:0x8c603d}),green=new THREE.MeshStandardMaterial({color:0x3d8e7a,side:THREE.DoubleSide}),fabric=new THREE.MeshStandardMaterial({color:kind==='stall'?0xe0aa45:0x48a9bd,side:THREE.DoubleSide});const part=(g,m,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o};if(kind==='stall'){for(const x of [-1.1,1.1])for(const z of [-.6,.6])part(new THREE.BoxGeometry(.08,2.5,.08),wood,x,1.25,z);part(new THREE.BoxGeometry(2.6,.12,1.7),fabric,0,2.5,0);part(new THREE.BoxGeometry(2.2,.12,1.2),wood,0,.9,0);for(let n=0;n<12;n++)part(new THREE.SphereGeometry(.13,6,5),n%3?green:fabric,(n%4)*.42-.65,1.08,Math.floor(n/4)*.3-.3)}else if(kind==='umbrella'){part(new THREE.CylinderGeometry(.035,.045,2.4,8),wood,0,1.2,0);part(new THREE.ConeGeometry(1.6,.6,12),fabric,0,2.6,0);part(new THREE.BoxGeometry(1.8,.15,.65),wood,0,.48,1.3)}else{part(new THREE.BoxGeometry(2,.16,.6),wood,0,.5,0);part(new THREE.BoxGeometry(2,.65,.1),wood,0,.9,.28);for(const x of [-.8,.8])part(new THREE.BoxGeometry(.12,.5,.45),green,x,.25,0)}return {group};}
function createStreetProp(kind){if(kind==='momo'||kind==='vendor'){const kiosk=createVenueProp('stall');const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle=kind==='momo'?'#f3c938':'#b65736';c.fillRect(0,0,512,128);c.fillStyle=kind==='momo'?'#253d35':'#fff1da';c.font='bold 48px sans-serif';c.textAlign='center';c.fillText(kind==='momo'?'MoMo AGENT':'WAAKYE · FRUIT',256,78);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.8,.7),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));sign.position.set(0,2.4,.91);kiosk.group.add(sign);const person=createActor('👩🏾');person.group.position.set(0,0,-1);kiosk.group.add(person.group);return kiosk;}if(["stall","umbrella","bench"].includes(kind))return createVenueProp(kind);const group=new THREE.Group(),trunk=new THREE.MeshStandardMaterial({color:kind==='palm'?0x766043:0x495450,roughness:.85});const post=new THREE.Mesh(new THREE.CylinderGeometry(.11,.2,kind==='palm'?5.5:4.7,7),trunk);post.position.y=kind==='palm'?2.75:2.35;group.add(post);if(kind==='palm'){const green=new THREE.MeshStandardMaterial({color:0x497545,roughness:.9,side:THREE.DoubleSide});for(let n=0;n<7;n++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,8,5),green);leaf.scale.set(.37,.09,1.75);leaf.position.set(Math.sin(n*6.28/7)*1.1,5.35,Math.cos(n*6.28/7)*1.1);leaf.rotation.set(.25,n*6.28/7,0);group.add(leaf)}}else{const arm=new THREE.Mesh(new THREE.BoxGeometry(1.1,.09,.1),trunk);arm.position.set(.5,4.6,0);group.add(arm);const bulb=new THREE.Mesh(new THREE.BoxGeometry(.55,.13,.32),new THREE.MeshBasicMaterial({color:0xffe4a6}));bulb.position.set(.85,4.5,0);group.add(bulb)}return {group};}
function createBus(){const bus=createCar(0xe6b343);bus.group.scale.set(1.2,1.55,1.85);const body=new THREE.Mesh(new THREE.BoxGeometry(2.1,.7,3.3),new THREE.MeshStandardMaterial({color:0xe8b844,roughness:.55}));body.position.set(0,1.25,.25);bus.group.add(body);for(const z of [-1.42,1.92]){const glass=new THREE.Mesh(new THREE.BoxGeometry(1.75,.43,.04),new THREE.MeshStandardMaterial({color:0x294650,roughness:.2,metalness:.4}));glass.position.set(0,1.3,z);bus.group.add(glass)}for(const side of [-1,1])for(let z=-.7;z<1.6;z+=.75){const window=new THREE.Mesh(new THREE.BoxGeometry(.04,.42,.58),new THREE.MeshStandardMaterial({color:0x294650,metalness:.4,roughness:.18}));window.position.set(side*1.06,1.3,z);bus.group.add(window)}return bus;}
function createAircraft(){
 const group=new THREE.Group(),body=new THREE.MeshStandardMaterial({color:0xf3eee1,metalness:.2,roughness:.4}),trim=new THREE.MeshStandardMaterial({color:0x26765c}),glass=new THREE.MeshStandardMaterial({color:0x234650});
 const part=(g,m,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o};
 part(new THREE.CylinderGeometry(.7,.58,9,20),body,0,0,0).rotation.x=Math.PI/2;part(new THREE.ConeGeometry(.7,1.8,20),body,0,0,-5.2).rotation.x=-Math.PI/2;part(new THREE.BoxGeometry(13,.15,1.65),trim,0,-.05,.2);part(new THREE.BoxGeometry(4.2,.12,1),trim,0,.35,3.7);part(new THREE.BoxGeometry(.12,1.8,1.5),trim,0,1,3.65);part(new THREE.BoxGeometry(1.04,.38,.5),glass,0,.44,-3.9);
 for(const sign of [-1,1]){for(let z=-2.8;z<3;z+=1)part(new THREE.BoxGeometry(.04,.3,.45),glass,sign*.68,.2,z);part(new THREE.CylinderGeometry(.3,.3,1.5,12),body,sign*2,-.45,-.15).rotation.x=Math.PI/2;part(new THREE.BoxGeometry(.08,1.8,.08),trim,sign*2,-.45,-.94)}
 return {group};
}
function createBeacon(color=0x67efa1){
  const group=new THREE.Group(),glow=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.85,depthWrite:false});
  const gem=new THREE.Mesh(new THREE.OctahedronGeometry(.4),glow);gem.position.y=2.7;group.add(gem);
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,2.3,6),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.35,depthWrite:false}));pole.position.y=1.2;group.add(pole);
  const ring=new THREE.Mesh(new THREE.RingGeometry(.46,.52,28),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.7,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.y=.04;group.add(ring);
  return {group,gem,ring};
}
function createDoorway(){
  const group=new THREE.Group();
  const stone=new THREE.MeshBasicMaterial({color:0xe7dac1}),wood=new THREE.MeshBasicMaterial({color:0x47372d}),glass=new THREE.MeshBasicMaterial({color:0x244b56}),light=new THREE.MeshBasicMaterial({color:0xffd181});
  const part=(material,w,h,d,x,y,z)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);group.add(mesh)};
  part(stone,1.85,2.65,.2,0,1.32,.04);part(wood,1.52,2.35,.1,0,1.2,-.1);
  part(glass,.45,1.2,.02,0,1.5,-.17);part(light,.09,.09,.05,.55,1.18,-.19);
  part(stone,2.35,.18,.8,0,2.73,-.25);part(stone,2.15,.12,.65,0,.06,-.42);
  const glow=new THREE.Mesh(new THREE.CircleGeometry(.42,24),new THREE.MeshBasicMaterial({color:0xffcc73,transparent:true,opacity:.6,depthWrite:false}));glow.rotation.x=-Math.PI/2;glow.position.set(0,.025,-.72);group.add(glow);
  return {group,glow};
}
export function createWorld3D(map,mapEngine){
  const scene=new THREE.Scene(),camera=new THREE.Camera();
  const ambient=new THREE.AmbientLight(0xffffff,1.55);scene.add(ambient);
  const light=new THREE.DirectionalLight(0xffedcb,1.35);light.position.set(-8,18,10);scene.add(light);
  const own=createActor('🧑🏾');own.group.scale.setScalar(1);scene.add(own.group);
  let parkedCar=createCar(0xc34842);scene.add(parkedCar.group);const aircraft=createAircraft();scene.add(aircraft.group);aircraft.group.visible=false;let flying=false,altitude=0,vehicleKind='car';const architectureItems=new Map();let architectureKey="";const sceneryItems=new Map();let scenerySource=null;const others=new Map(),ambientActors=new Map(),beacons=[],doors=[];
  let beaconKey='',architectureSource=null,pendingArchitecture=[];
  let cameraDistance=7;
  let frameTime=performance.now(),roadBounce=0,roadRoll=0,roadHoles=[];
  let preset='day';
  let renderer=null,enabled=false,driving=false,cabinView=false,position=[-0.1949,5.5682],carPosition=null,carHeading=0,heading=0,moving=false,ownsVehicle=true,actionUntil=0;
  const layer={id:'accralife-3d-people',type:'custom',renderingMode:'3d',onAdd(_map,gl){renderer=new THREE.WebGLRenderer({canvas:map.getCanvas(),context:gl,antialias:true});renderer.autoClear=false;renderer.outputColorSpace=THREE.SRGBColorSpace},render(_gl,matrix){if(!renderer||!enabled)return;
    const t=performance.now()/1000,ground=map.queryTerrainElevation?.(position)||0,mercator=mapEngine.MercatorCoordinate.fromLngLat(position,ground),scale=mercator.meterInMercatorCoordinateUnits();
    const transform=new THREE.Matrix4().makeTranslation(mercator.x,mercator.y,mercator.z).scale(new THREE.Vector3(scale,-scale,scale)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
    camera.projectionMatrix=new THREE.Matrix4().fromArray(matrix.defaultProjectionData?.mainMatrix||matrix.defaultProjectionData?.projectionMatrix||matrix).multiply(transform);
    const now=performance.now(),dt=Math.min(.1,(now-frameTime)/1000);frameTime=now;
    own.group.visible=!driving&&!flying&&cameraDistance>3;aircraft.group.visible=flying;aircraft.group.position.y=altitude;aircraft.group.rotation.y=-heading*DEG;own.animate(t,moving||now<actionUntil);own.group.rotation.y=-heading*DEG;
    parkedCar.group.position.y=driving?roadBounce:0;parkedCar.group.rotation.z=driving?roadRoll:0;if(parkedCar.rider)parkedCar.rider.visible=driving;
    if(carPosition){parkedCar.group.position.x=(carPosition[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);parkedCar.group.position.z=(position[1]-carPosition[1])*METERS_PER_DEGREE;parkedCar.group.rotation.y=-carHeading*DEG;parkedCar.group.visible=(ownsVehicle||driving)&&!cabinView&&!flying}else parkedCar.group.visible=false;
    for(const item of others.values()){
      const previous=[...item.position];item.position=item.position.map((v,i)=>damp(v,item.target[i],4,dt));item.heading=turnToward(item.heading,item.targetHeading,5,dt);
      const [lng,lat]=item.position;item.model.group.position.x=(lng-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.model.group.position.z=(position[1]-lat)*METERS_PER_DEGREE;item.model.group.visible=Math.hypot(item.model.group.position.x,item.model.group.position.z)<220;item.model.group.rotation.y=-item.heading*DEG;item.actor?.animate(t,distanceMetres(previous,item.position)>.003);
    }
    for(const item of architectureItems.values()){item.model.group.position.x=(item.data.position[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.model.group.position.z=(position[1]-item.data.position[1])*METERS_PER_DEGREE;}
    for(const item of sceneryItems.values()){item.model.update?.(preset);item.model.group.rotation.y=-(item.data.heading||0)*DEG;item.model.group.position.x=(item.data.position[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.model.group.position.z=(position[1]-item.data.position[1])*METERS_PER_DEGREE;}
    for(const item of ambientActors.values()){
      const npc=item.data;if(!npc.driving){const impact=Math.max(0,Math.min(1,((npc.impactUntil||0)-now)/900));item.model.group.rotation.z=impact*.95;}if(npc.driving){const hit=potholeImpact(roadHoles,item.roadPrevious||npc.position,npc.position,npc.speed||0);if(hit&&hit.id!==item.lastRoadHole){item.roadHitAt=now;item.roadStrength=Math.min(.19,.035+(npc.speed||0)*.004)}item.lastRoadHole=hit?.id;item.roadPrevious=[...npc.position];const age=(now-(item.roadHitAt||-10000))/1000,bounce=age<1?Math.sin(age*32)*(item.roadStrength||0)*Math.exp(-age*5):0;item.model.group.position.y=bounce;item.model.group.rotation.z=bounce*.35;}item.model.group.position.x=(npc.position[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.model.group.position.z=(position[1]-npc.position[1])*METERS_PER_DEGREE;item.model.group.rotation.y=-npc.heading*DEG;item.actor?.animate(t,npc.moving);
    }
    for(const item of beacons){item.beacon.group.position.x=(item.lng-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.beacon.group.position.z=(position[1]-item.lat)*METERS_PER_DEGREE;const beaconDistance=Math.hypot(item.beacon.group.position.x,item.beacon.group.position.z);item.beacon.group.visible=beaconDistance<170&&beaconDistance>4;item.beacon.gem.position.y=2.7+Math.sin(t*2+item.phase)*.22;item.beacon.gem.rotation.y=t*.8;item.beacon.ring.rotation.z=t*.5}
    for(const item of doors){item.door.group.position.x=(item.lng-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.door.group.position.z=(position[1]-item.lat)*METERS_PER_DEGREE;item.door.group.rotation.y=item.heading*DEG;item.door.glow.material.opacity=.42+Math.sin(t*3)*.16}
    renderer.resetState();renderer.render(scene,camera);map.triggerRepaint();
  }};
  map.addLayer(layer);
  return {
    setArchitecture(items){if(items!==architectureSource){architectureSource=items;const ids=new Set(items.map(i=>i.id));for(const data of items){const old=architectureItems.get(data.id);if(old&&old.data.style!==data.style){scene.remove(old.model.group);disposeModel(old.model.group);architectureItems.delete(data.id)}}pendingArchitecture=items.filter(i=>!architectureItems.has(i.id));for(const [id,item] of architectureItems)if(!ids.has(id)){scene.remove(item.model.group);disposeModel(item.model.group);architectureItems.delete(id)}}const start=performance.now();while(pendingArchitecture.length&&performance.now()-start<2){const data=pendingArchitecture.shift(),model=createBuildingFacade(data);architectureItems.set(data.id,{data,model});scene.add(model.group)}},
    setScenery(items){if(items===scenerySource)return;scenerySource=items;const ids=new Set(items.map(i=>i.id));for(const data of items)if(!sceneryItems.has(data.id)){const model=['lamp','signal'].includes(data.kind)?createStreetLight(data):createStreetProp(data.kind);sceneryItems.set(data.id,{data,model});batchStaticMeshes(model.group);scene.add(model.group)}for(const [id,item] of sceneryItems)if(!ids.has(id)){scene.remove(item.model.group);disposeModel(item.model.group);sceneryItems.delete(id)}},
    setCameraDistance(value){cameraDistance=value},
    setEnabled(value){enabled=value;map.triggerRepaint()},
    setSelf(icon){scene.remove(own.group);disposeModel(own.group);Object.assign(own,createActor(icon));scene.add(own.group);map.triggerRepaint()},
    setOutfit(id){own.outfit(id);map.triggerRepaint()},
    setAircraft(value,height=0){flying=value;altitude=height;map.triggerRepaint()},
    setVehicleOwned(value){ownsVehicle=value},
    setVehicleKind(kind){if(kind===vehicleKind)return;vehicleKind=kind;scene.remove(parkedCar.group);disposeModel(parkedCar.group);parkedCar=kind==='bus'?createBus():kind==='motorcycle'?createMotorcycle():createCar(0xc34842);scene.add(parkedCar.group)},
    setDriving(value){driving=value;map.triggerRepaint()},
    setAmbient(actors){const ids=new Set();for(const data of actors){ids.add(data.id);let item=ambientActors.get(data.id);if(!item){const model=data.driving?(data.vehicle==='bus'?createBus():createCar(data.vehicle==='taxi'?0xe5b13a:[0xd1b057,0x53696f,0xe5e3d8,0x495985][ambientActors.size%4])):createActor(data.avatar);item={model,actor:data.driving?null:model};ambientActors.set(data.id,item);scene.add(model.group)}item.data=data}for(const [id,item] of ambientActors){if(!ids.has(id)){scene.remove(item.model.group);disposeModel(item.model.group);ambientActors.delete(id)}}},
    setTimeOfDay(value){preset=value;setFacadeLighting(preset);ambient.intensity=preset==='night'?.8:preset==='dusk'||preset==='dawn'?1.1:1.55;light.intensity=preset==='night'?.45:preset==='dusk'||preset==='dawn'?.9:1.35;map.triggerRepaint()},
    setCabinView(value){cabinView=value;map.triggerRepaint()},
    setPotholes(holes){roadHoles=holes},
    setRoadJolt(bounce,roll){roadBounce=bounce;roadRoll=roll},
    setCarPosition(lng,lat,direction=carHeading){carPosition=[lng,lat];carHeading=direction;map.triggerRepaint()},
    setPosition(lng,lat,direction=heading){position=[lng,lat];heading=direction;map.triggerRepaint()},
    setMoving(value){moving=value},
    playAction(){actionUntil=performance.now()+1300;map.triggerRepaint()},
    setPlayers(players,selfId){const visible=new Set();for(const p of players){if(p.id===selfId||!Number.isFinite(p.lng)||!Number.isFinite(p.lat))continue;visible.add(p.id);let item=others.get(p.id);if(!item||item.driving!==!!p.driving||item.vehicle!==p.vehicle){if(item){scene.remove(item.model.group);disposeModel(item.model.group)}const model=p.driving?(p.vehicle==='bus'?createBus():p.vehicle==='motorcycle'?createMotorcycle():createCar(0x40858c)):createActor(p.avatar);item={model,actor:p.driving?null:model,driving:!!p.driving,vehicle:p.vehicle,position:[p.lng,p.lat],heading:p.heading||0};others.set(p.id,item);scene.add(model.group)}item.target=[p.lng,p.lat];item.targetHeading=p.heading||0}for(const [id,item] of others){if(!visible.has(id)){scene.remove(item.model.group);disposeModel(item.model.group);others.delete(id)}}map.triggerRepaint()},
    setBeacons(places){const key=places.slice(0,8).map(p=>p.id).join(',');if(key===beaconKey)return;beaconKey=key;for(const item of beacons){scene.remove(item.beacon.group);disposeModel(item.beacon.group)}beacons.length=0;places.slice(0,8).forEach((p,index)=>{const beacon=createBeacon();beacons.push({beacon,lng:p.lng,lat:p.lat,phase:index});scene.add(beacon.group)});map.triggerRepaint()},
    setDoors(entries){entries.slice(0,3).forEach((p,index)=>{let item=doors[index];if(!item){const door=createDoorway();item={door};doors[index]=item;scene.add(door.group)}Object.assign(item,{lng:p.lng,lat:p.lat,heading:p.heading||0});item.door.group.visible=true});for(let i=entries.length;i<doors.length;i++)doors[i].door.group.visible=false;map.triggerRepaint()},
    destroy(){if(map.getLayer(layer.id))map.removeLayer(layer.id);renderer?.dispose()}
  };
}
