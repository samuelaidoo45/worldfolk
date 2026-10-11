import {createActor} from './human-character.js';
export {createActor} from './human-character.js';
import {updateVehicleMotion} from './vehicle-motion.js';
import {syncMapCamera} from './map-camera.js';
import {createCar,createBus,VEHICLE_PALETTE} from './vehicle-models.js';
export {createCar,createBus} from './vehicle-models.js';
import {CITY_LANDMARKS,createCityLandmark,isCityLandmark} from './city-landmarks.js';
import {enhanceMaterials,tagSurface,cityEnvironment} from './graphics-materials.js';
import {createPalm} from './scenery-models.js';
import {createBillboard} from './billboards.js';
import {createPlayerLabels} from './player-labels.js';
import {createBuildingVisibility} from './building-visibility.js';
import {batchStaticMeshes,disposeScene} from './render-utils.js';
import {potholeImpact} from './road-surface.js';
import {createStreetLight} from './street-lighting.js';
import {createBuildingFacade,setFacadeLighting} from './building-facades.js';
import {damp,turnToward,distanceMetres} from './motion.js';
import * as THREE from './three.module.js';

const disposeModel=disposeScene;
const DEG=Math.PI/180;
const METERS_PER_DEGREE=111320;
function createMotorcycle(){
  const group=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color:0xd8ad3c,metalness:.4,roughness:.35}),dark=new THREE.MeshStandardMaterial({color:0x253336}),chrome=new THREE.MeshStandardMaterial({color:0xaabbbc,metalness:.8,roughness:.25});
  tagSurface(paint,'paint');tagSurface(dark,'rubber');tagSurface(chrome,'metal');
  const part=(geo,mat,x,y,z)=>{const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);group.add(m);return m};
  for(const z of [-.85,.85]){part(new THREE.CylinderGeometry(.36,.36,.18,20),dark,0,.36,z).rotation.z=Math.PI/2;part(new THREE.CylinderGeometry(.18,.18,.19,16),chrome,0,.36,z).rotation.z=Math.PI/2}
  part(new THREE.BoxGeometry(.38,.28,1.4),dark,0,.57,0);part(new THREE.BoxGeometry(.5,.33,.6),paint,0,.95,-.28);part(new THREE.BoxGeometry(.42,.16,.75),dark,0,1.02,.4);part(new THREE.BoxGeometry(.76,.07,.1),chrome,0,1.3,-.62);part(new THREE.BoxGeometry(.09,.85,.09),chrome,0,.77,-.82);
  part(new THREE.SphereGeometry(.12,12,8),new THREE.MeshBasicMaterial({color:0xffecc1}),0,1.04,-.92);
  const rider=createActor('🧑🏾');rider.group.scale.setScalar(.75);rider.group.position.set(0,.55,.25);rider.leftArm.rotation.x=1;rider.rightArm.rotation.x=1;rider.leftLeg.rotation.x=1.05;rider.rightLeg.rotation.x=1.05;group.add(rider.group);
  enhanceMaterials(group);return {group,rider:rider.group};
}
function createVenueProp(kind){const group=new THREE.Group(),wood=new THREE.MeshStandardMaterial({color:0x8c603d}),green=new THREE.MeshStandardMaterial({color:0x3d8e7a,side:THREE.DoubleSide}),fabric=new THREE.MeshStandardMaterial({color:kind==='stall'?0xe0aa45:0x48a9bd,side:THREE.DoubleSide});tagSurface(wood,'wood');tagSurface(fabric,'fabric');tagSurface(green,'foliage');const part=(g,m,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o};if(kind==='stall'||kind==='kiosk'){for(const x of [-1.1,1.1])for(const z of [-.6,.6])part(new THREE.BoxGeometry(.08,2.5,.08),wood,x,1.25,z);part(new THREE.BoxGeometry(2.6,.12,1.7),fabric,0,2.5,0);part(new THREE.BoxGeometry(2.2,.12,1.2),wood,0,.9,0);if(kind==='stall')for(let n=0;n<12;n++)part(new THREE.SphereGeometry(.13,6,5),n%3?green:fabric,(n%4)*.42-.65,1.08,Math.floor(n/4)*.3-.3)}else if(kind==='umbrella'){part(new THREE.CylinderGeometry(.035,.045,2.4,8),wood,0,1.2,0);part(new THREE.ConeGeometry(1.6,.6,12),fabric,0,2.6,0);part(new THREE.BoxGeometry(1.8,.15,.65),wood,0,.48,1.3)}else{part(new THREE.BoxGeometry(2,.16,.6),wood,0,.5,0);part(new THREE.BoxGeometry(2,.65,.1),wood,0,.9,.28);for(const x of [-.8,.8])part(new THREE.BoxGeometry(.12,.5,.45),green,x,.25,0)}return {group};}
function createStreetProp(kind,data={}){if(kind==='palm')return createPalm(data);if(kind==='billboard')return createBillboard(data.adIndex||0);if(kind==='momo'){const kiosk=createVenueProp('kiosk');const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#f3c938';c.fillRect(0,0,512,128);c.fillStyle='#253d35';c.font='bold 48px sans-serif';c.textAlign='center';c.fillText('MoMo AGENT',256,78);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.8,.7),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));sign.position.set(0,2.4,.91);kiosk.group.add(sign);const person=createActor('👩🏾');person.group.position.set(0,0,-1);kiosk.group.add(person.group);return kiosk;}if(["stall","umbrella","bench"].includes(kind))return createVenueProp(kind);const group=new THREE.Group(),trunk=new THREE.MeshStandardMaterial({color:kind==='palm'?0x766043:0x495450,roughness:.85});const post=new THREE.Mesh(new THREE.CylinderGeometry(.11,.2,kind==='palm'?5.5:4.7,7),trunk);post.position.y=kind==='palm'?2.75:2.35;group.add(post);if(kind==='palm'){const green=new THREE.MeshStandardMaterial({color:0x497545,roughness:.9,side:THREE.DoubleSide});for(let n=0;n<7;n++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,8,5),green);leaf.scale.set(.37,.09,1.75);leaf.position.set(Math.sin(n*6.28/7)*1.1,5.35,Math.cos(n*6.28/7)*1.1);leaf.rotation.set(.25,n*6.28/7,0);group.add(leaf)}}else{const arm=new THREE.Mesh(new THREE.BoxGeometry(1.1,.09,.1),trunk);arm.position.set(.5,4.6,0);group.add(arm);const bulb=new THREE.Mesh(new THREE.BoxGeometry(.55,.13,.32),new THREE.MeshBasicMaterial({color:0xffe4a6}));bulb.position.set(.85,4.5,0);group.add(bulb)}return {group};}
function createAircraft(){
 const group=new THREE.Group(),body=new THREE.MeshStandardMaterial({color:0xf3eee1,metalness:.2,roughness:.4}),trim=new THREE.MeshStandardMaterial({color:0x26765c}),glass=new THREE.MeshStandardMaterial({color:0x234650});
 tagSurface(body,'paint');tagSurface(trim,'paint');tagSurface(glass,'glass');
 const part=(g,m,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);group.add(o);return o};
 part(new THREE.CylinderGeometry(.7,.58,9,20),body,0,0,0).rotation.x=Math.PI/2;part(new THREE.ConeGeometry(.7,1.8,20),body,0,0,-5.2).rotation.x=-Math.PI/2;part(new THREE.BoxGeometry(13,.15,1.65),trim,0,-.05,.2);part(new THREE.BoxGeometry(4.2,.12,1),trim,0,.35,3.7);part(new THREE.BoxGeometry(.12,1.8,1.5),trim,0,1,3.65);part(new THREE.BoxGeometry(1.04,.38,.5),glass,0,.44,-3.9);
 for(const sign of [-1,1]){for(let z=-2.8;z<3;z+=1)part(new THREE.BoxGeometry(.04,.3,.45),glass,sign*.68,.2,z);part(new THREE.CylinderGeometry(.3,.3,1.5,12),body,sign*2,-.45,-.15).rotation.x=Math.PI/2;part(new THREE.BoxGeometry(.08,1.8,.08),trim,sign*2,-.45,-.94)}
 batchStaticMeshes(group);return {group};
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
  const scene=new THREE.Scene(),camera=new THREE.Camera(),nameTags=createPlayerLabels(map);let selfIdentity=null;
  scene.environment=cityEnvironment();
  const ambient=new THREE.HemisphereLight(0xc5dff6,0x786853,1.45);scene.add(ambient);
  const light=new THREE.DirectionalLight(0xffedcb,2.2);light.position.set(-60,100,50);light.castShadow=true;light.shadow.mapSize.set(1024,1024);Object.assign(light.shadow.camera,{left:-75,right:75,top:75,bottom:-75,near:1,far:240});light.shadow.normalBias=.05;light.shadow.bias=-.0002;scene.add(light);const shadowGround=new THREE.Mesh(new THREE.PlaneGeometry(160,160),new THREE.ShadowMaterial({opacity:.3,depthWrite:false}));shadowGround.rotation.x=-Math.PI/2;shadowGround.position.y=.055;shadowGround.receiveShadow=true;scene.add(shadowGround);let shadowAt=0;
  let own=createActor('🧑🏾');own.group.scale.setScalar(1);scene.add(own.group);
  let parkedCar=createCar(0xc34842);scene.add(parkedCar.group);const aircraft=createAircraft();scene.add(aircraft.group);aircraft.group.visible=false;let flying=false,altitude=0,vehicleKind='car';const architectureItems=new Map();let architectureKey="";const sceneryItems=new Map();let scenerySource=null;const others=new Map(),ambientActors=new Map(),beacons=[],doors=[];
  const landmarkItems=CITY_LANDMARKS.map(data=>({data,model:null}));
  let beaconKey='',architectureSource=null,pendingArchitecture=[];
  let cameraDistance=7;
  let frameTime=performance.now(),roadBounce=0,roadRoll=0,roadHoles=[];
  let preset='day';
  let preview=false;
  let renderer=null,enabled=false,driving=false,cabinView=false,position=[-0.1949,5.5682],carPosition=null,carHeading=0,heading=0,moving=false,movementSpeed=0,ownsVehicle=true,actionUntil=0;
  const syncShellVisibility=createBuildingVisibility(map);
  function syncBuildingShells(){syncShellVisibility([...architectureItems.values(),...landmarkItems.filter(i=>i.model)].map(i=>i.data),enabled,pendingArchitecture)}
  const layer={id:'accralife-3d-people',type:'custom',renderingMode:'3d',onAdd(_map,gl){renderer=new THREE.WebGLRenderer({canvas:map.getCanvas(),context:gl,antialias:true});renderer.autoClear=false;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false},render(_gl,matrix){if(!renderer||!enabled)return;
    const t=performance.now()/1000,ground=map.queryTerrainElevation?.(position)||0,mercator=mapEngine.MercatorCoordinate.fromLngLat(position,ground),scale=mercator.meterInMercatorCoordinateUnits();
    const transform=new THREE.Matrix4().makeTranslation(mercator.x,mercator.y,mercator.z).scale(new THREE.Vector3(scale,-scale,scale)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
    const combined=new THREE.Matrix4().fromArray(matrix.defaultProjectionData?.mainMatrix||matrix.defaultProjectionData?.projectionMatrix||matrix).multiply(transform);syncMapCamera(camera,combined);
    const now=performance.now(),dt=Math.min(.1,(now-frameTime)/1000);frameTime=now;
    own.group.visible=!preview&&!driving&&!flying&&cameraDistance>1.3;aircraft.group.visible=flying;aircraft.group.position.y=altitude;aircraft.group.rotation.y=-heading*DEG;own.animate(t,moving||now<actionUntil,{speed:movementSpeed});own.group.rotation.y=-heading*DEG;
    parkedCar.group.position.y=driving?roadBounce:0;parkedCar.group.rotation.z=driving?roadRoll:0;if(parkedCar.rider)parkedCar.rider.visible=driving;
    if(carPosition){updateVehicleMotion(parkedCar,carPosition,carHeading,dt,preset);parkedCar.group.position.x=(carPosition[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);parkedCar.group.position.z=(position[1]-carPosition[1])*METERS_PER_DEGREE;parkedCar.group.rotation.y=-carHeading*DEG;parkedCar.group.visible=(ownsVehicle||driving)&&!cabinView&&!flying}else parkedCar.group.visible=false;
    for(const item of others.values()){
      const previous=[...item.position];item.position=item.position.map((v,i)=>damp(v,item.target[i],4,dt));item.heading=turnToward(item.heading,item.targetHeading,5,dt);
      if(item.driving)updateVehicleMotion(item.model,item.position,item.heading,dt,preset);
      const [lng,lat]=item.position;item.model.group.position.x=(lng-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.model.group.position.z=(position[1]-lat)*METERS_PER_DEGREE;item.model.group.visible=Math.hypot(item.model.group.position.x,item.model.group.position.z)<220;item.model.group.rotation.y=-item.heading*DEG;item.actor?.animate(t,distanceMetres(previous,item.position)>.003,{speed:distanceMetres(previous,item.position)/Math.max(.001,dt)});
    }
    let builtLandmark=false;for(const item of landmarkItems){const visible=distanceMetres(item.data.position,position)<1800;if(visible&&!item.model&&!builtLandmark){builtLandmark=true;item.model=createCityLandmark(item.data);scene.add(item.model.group);syncBuildingShells()}if(item.model){item.model.group.visible=visible;item.model.group.position.set((item.data.position[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG),0,(position[1]-item.data.position[1])*METERS_PER_DEGREE)}}
    for(const item of architectureItems.values()){item.model.group.position.x=(item.data.position[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.model.group.position.z=(position[1]-item.data.position[1])*METERS_PER_DEGREE;}
    for(const item of sceneryItems.values()){item.model.update?.(preset);item.model.group.rotation.y=-(item.data.heading||0)*DEG;item.model.group.position.x=(item.data.position[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.model.group.position.z=(position[1]-item.data.position[1])*METERS_PER_DEGREE;}
    for(const item of ambientActors.values()){
      const npc=item.data;if(npc.driving)updateVehicleMotion(item.model,npc.position,npc.heading,dt,preset);if(!npc.driving){const impact=Math.max(0,Math.min(1,((npc.impactUntil||0)-now)/900));item.model.group.rotation.z=impact*.95;}if(npc.driving){const hit=potholeImpact(roadHoles,item.roadPrevious||npc.position,npc.position,npc.speed||0);if(hit&&hit.id!==item.lastRoadHole){item.roadHitAt=now;item.roadStrength=Math.min(.19,.035+(npc.speed||0)*.004)}item.lastRoadHole=hit?.id;item.roadPrevious=[...npc.position];const age=(now-(item.roadHitAt||-10000))/1000,bounce=age<1?Math.sin(age*32)*(item.roadStrength||0)*Math.exp(-age*5):0;item.model.group.position.y=bounce;item.model.group.rotation.z=bounce*.35;}item.model.group.position.x=(npc.position[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.model.group.position.z=(position[1]-npc.position[1])*METERS_PER_DEGREE;item.model.group.rotation.y=-npc.heading*DEG;item.actor?.animate(t,npc.moving,{speed:npc.speed||1.4});
    }
    for(const item of beacons){item.beacon.group.position.x=(item.lng-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.beacon.group.position.z=(position[1]-item.lat)*METERS_PER_DEGREE;const beaconDistance=Math.hypot(item.beacon.group.position.x,item.beacon.group.position.z);item.beacon.group.visible=beaconDistance<170&&beaconDistance>4;item.beacon.gem.position.y=2.7+Math.sin(t*2+item.phase)*.22;item.beacon.gem.rotation.y=t*.8;item.beacon.ring.rotation.z=t*.5}
    for(const item of doors){item.door.group.position.x=(item.lng-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.door.group.position.z=(position[1]-item.lat)*METERS_PER_DEGREE;item.door.group.rotation.y=item.heading*DEG;item.door.glow.material.opacity=.42+Math.sin(t*3)*.16}
    if(now-shadowAt>120){renderer.shadowMap.needsUpdate=true;shadowAt=now}renderer.resetState();renderer.render(scene,camera);renderer.resetState();
    const tags=[...others.values()].map(item=>({player:item.identity,x:item.model.group.position.x,y:item.driving?(item.vehicle==='bus'?3.7:2.3):2.15,z:item.model.group.position.z,distance:Math.hypot(item.model.group.position.x,item.model.group.position.z),visible:item.model.group.visible}));
    if(selfIdentity)tags.push({player:selfIdentity,x:0,y:driving?(vehicleKind==='bus'?3.7:2.3):2.15,z:0,distance:0,self:true,visible:!flying&&!cabinView&&(driving||own.group.visible)});
    nameTags.update(tags,combined,now);map.triggerRepaint();
  }};
  map.addLayer(layer);
  return {
    setArchitecture(items){if(items!==architectureSource){architectureSource=items;const ids=new Set(items.map(i=>i.id));for(const data of items){const old=architectureItems.get(data.id);if(old&&(old.data.style!==data.style||Math.floor(Math.min(2,old.data.distance/100))!==Math.floor(Math.min(2,data.distance/100)))){scene.remove(old.model.group);disposeModel(old.model.group);architectureItems.delete(data.id)}}pendingArchitecture=items.filter(i=>!isCityLandmark(i.sourceId)&&!architectureItems.has(i.id));for(const [id,item] of architectureItems)if(!ids.has(id)){scene.remove(item.model.group);disposeModel(item.model.group);architectureItems.delete(id)}}const start=performance.now();while(pendingArchitecture.length&&performance.now()-start<2){const data=pendingArchitecture.shift(),model=createBuildingFacade(data);architectureItems.set(data.id,{data,model});scene.add(model.group)}syncBuildingShells()},
    setScenery(items){if(items===scenerySource)return;scenerySource=items;items=items.filter(item=>!['vendor','stall'].includes(item.kind));const ids=new Set(items.map(i=>i.id));for(const data of items)if(sceneryItems.has(data.id)){sceneryItems.get(data.id).data=data}else{const model=['lamp','signal'].includes(data.kind)?createStreetLight(data):createStreetProp(data.kind,data);sceneryItems.set(data.id,{data,model});batchStaticMeshes(model.group);scene.add(model.group)}for(const [id,item] of sceneryItems)if(!ids.has(id)){scene.remove(item.model.group);disposeModel(item.model.group);sceneryItems.delete(id)}},
    setCameraDistance(value){cameraDistance=value},
    setIdentity(player){selfIdentity=player},
    setPreview(value){preview=value},
    setEnabled(value){enabled=value;if(!value)nameTags.hide();syncBuildingShells();map.triggerRepaint()},
    setSelf(icon){scene.remove(own.group);disposeModel(own.group);own=createActor(icon,selfIdentity?.id||'');scene.add(own.group);map.triggerRepaint()},
    setOutfit(id){own.outfit(id);map.triggerRepaint()},
    setAircraft(value,height=0){flying=value;altitude=height;map.triggerRepaint()},
    setVehicleOwned(value){ownsVehicle=value},
    setVehicleKind(kind){if(kind===vehicleKind)return;vehicleKind=kind;scene.remove(parkedCar.group);disposeModel(parkedCar.group);parkedCar=kind==='bus'?createBus():kind==='motorcycle'?createMotorcycle():createCar(0xc34842,kind);scene.add(parkedCar.group)},
    setDriving(value){driving=value;map.triggerRepaint()},
    setAmbient(actors){const ids=new Set();for(const data of actors){ids.add(data.id);let item=ambientActors.get(data.id);if(!item){const model=data.driving?(data.vehicle==='bus'?createBus():createCar(data.vehicle==='taxi'?0xe9e6dc:VEHICLE_PALETTE[ambientActors.size%VEHICLE_PALETTE.length],data.vehicle)):createActor(data.avatar,data.id);item={model,actor:data.driving?null:model};ambientActors.set(data.id,item);scene.add(model.group)}item.data=data}for(const [id,item] of ambientActors){if(!ids.has(id)){scene.remove(item.model.group);disposeModel(item.model.group);ambientActors.delete(id)}}},
    setTimeOfDay(value){preset=value;setFacadeLighting(preset);const night=preset==='night',golden=preset==='dusk'||preset==='dawn';ambient.intensity=night?.55:golden?.95:1.45;light.intensity=night?.5:golden?1.6:2.2;light.color.set(night?0x9bbde9:golden?0xffbd83:0xffedcb);scene.environment=cityEnvironment(preset);map.triggerRepaint()},
    setCabinView(value){cabinView=value;map.triggerRepaint()},
    setPotholes(holes){roadHoles=holes},
    setRoadJolt(bounce,roll){roadBounce=bounce;roadRoll=roll},
    setCarPosition(lng,lat,direction=carHeading){carPosition=[lng,lat];carHeading=direction;map.triggerRepaint()},
    setPosition(lng,lat,direction=heading){position=[lng,lat];heading=direction;map.triggerRepaint()},
    setMoving(value,speed=0){moving=value;movementSpeed=speed},
    playAction(){actionUntil=performance.now()+1300;map.triggerRepaint()},
    setPlayers(players,selfId){const visible=new Set();for(const p of players){if(p.id===selfId||!Number.isFinite(p.lng)||!Number.isFinite(p.lat))continue;visible.add(p.id);let item=others.get(p.id);if(!item||item.driving!==!!p.driving||item.vehicle!==p.vehicle){if(item){scene.remove(item.model.group);disposeModel(item.model.group)}const model=p.driving?(p.vehicle==='bus'?createBus():p.vehicle==='motorcycle'?createMotorcycle():createCar(0x40858c,p.vehicle)):createActor(p.avatar,p.id);item={model,actor:p.driving?null:model,driving:!!p.driving,vehicle:p.vehicle,position:[p.lng,p.lat],heading:p.heading||0};others.set(p.id,item);scene.add(model.group)}item.identity=p;item.target=[p.lng,p.lat];item.targetHeading=p.heading||0}for(const [id,item] of others){if(!visible.has(id)){scene.remove(item.model.group);disposeModel(item.model.group);others.delete(id)}}map.triggerRepaint()},
    setBeacons(places){const key=places.slice(0,8).map(p=>p.id).join(',');if(key===beaconKey)return;beaconKey=key;for(const item of beacons){scene.remove(item.beacon.group);disposeModel(item.beacon.group)}beacons.length=0;places.slice(0,8).forEach((p,index)=>{const beacon=createBeacon();beacons.push({beacon,lng:p.lng,lat:p.lat,phase:index});scene.add(beacon.group)});map.triggerRepaint()},
    setDoors(entries){entries.slice(0,3).forEach((p,index)=>{let item=doors[index];if(!item){const door=createDoorway();item={door};doors[index]=item;scene.add(door.group)}Object.assign(item,{lng:p.lng,lat:p.lat,heading:p.heading||0});item.door.group.visible=true});for(let i=entries.length;i<doors.length;i++)doors[i].door.group.visible=false;map.triggerRepaint()},
    destroy(){if(map.getLayer(layer.id))map.removeLayer(layer.id);renderer?.dispose()}
  };
}
