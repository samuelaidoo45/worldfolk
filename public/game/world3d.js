import * as THREE from './three.module.js';

const DEG=Math.PI/180;
const METERS_PER_DEGREE=111320;
function colorForAvatar(icon){
  const dark=icon.includes('🏿'),medium=icon.includes('🏽');
  return {skin:dark?0x65402f:medium?0xa87350:0x8b563b,shirt:icon.startsWith('👩')?0xe57082:icon.startsWith('👨')?0x297b9c:0x42a46e,hair:0x211b19};
}
export function createActor(icon){
  const colors=colorForAvatar(icon),group=new THREE.Group();
  const skin=new THREE.MeshLambertMaterial({color:colors.skin}),shirt=new THREE.MeshLambertMaterial({color:colors.shirt}),pants=new THREE.MeshLambertMaterial({color:0x27394c}),hair=new THREE.MeshLambertMaterial({color:colors.hair}),shoes=new THREE.MeshLambertMaterial({color:0x1a2424});
  const mesh=(geometry,material,x,y,z)=>{const part=new THREE.Mesh(geometry,material);part.position.set(x,y,z);part.castShadow=true;group.add(part);return part};
  mesh(new THREE.CapsuleGeometry(.29,.52,5,10),shirt,0,1.01,0);
  mesh(new THREE.SphereGeometry(.235,16,12),skin,0,1.65,0);
  mesh(new THREE.SphereGeometry(.245,16,8,0,Math.PI*2,0,Math.PI*.42),hair,0,1.73,0);
  const nose=mesh(new THREE.SphereGeometry(.055,8,6),skin,0,1.61,-.225);nose.scale.set(.8,1,.9);
  for(const sign of [-1,1]){const eye=mesh(new THREE.SphereGeometry(.018,6,6),hair,sign*.09,1.68,-.206);eye.scale.set(1,1,.4)}
  const leftArm=new THREE.Group(),rightArm=new THREE.Group(),leftLeg=new THREE.Group(),rightLeg=new THREE.Group();
  for(const [pivot,sign] of [[leftArm,-1],[rightArm,1]]){pivot.position.set(sign*.34,1.28,0);const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.105,.09,.32,10),shirt);sleeve.position.y=-.15;pivot.add(sleeve);const forearm=new THREE.Mesh(new THREE.CylinderGeometry(.075,.07,.35,10),skin);forearm.position.y=-.47;pivot.add(forearm);group.add(pivot)}
  for(const [pivot,sign] of [[leftLeg,-1],[rightLeg,1]]){pivot.position.set(sign*.16,.72,0);const leg=new THREE.Mesh(new THREE.CylinderGeometry(.12,.095,.58,10),pants);leg.position.y=-.28;pivot.add(leg);const foot=new THREE.Mesh(new THREE.BoxGeometry(.2,.11,.33),shoes);foot.position.set(0,-.61,-.08);pivot.add(foot);group.add(pivot)}
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(.42,24),new THREE.MeshBasicMaterial({color:0x10251c,transparent:true,opacity:.25,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.025;group.add(shadow);
  return {group,leftArm,rightArm,leftLeg,rightLeg,animate(t,moving){const step=moving?Math.sin(t*10)*.62:0;leftLeg.rotation.x=step;rightLeg.rotation.x=-step;leftArm.rotation.x=-step*.75;rightArm.rotation.x=step*.75;group.position.y=moving?Math.abs(Math.sin(t*10))*.05:Math.sin(t*2)*.018}};
}
function createCar(color=0x236f91){
  const group=new THREE.Group(),paint=new THREE.MeshStandardMaterial({color,metalness:.42,roughness:.3}),glass=new THREE.MeshStandardMaterial({color:0x36515b,metalness:.25,roughness:.12}),rubber=new THREE.MeshStandardMaterial({color:0x1d2529,roughness:.9}),chrome=new THREE.MeshStandardMaterial({color:0xd4d8d3,metalness:.85,roughness:.23});
  const part=(geometry,material,x,y,z)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);group.add(mesh);return mesh};
  part(new THREE.BoxGeometry(1.75,.48,3.6),paint,0,.73,0);part(new THREE.BoxGeometry(1.54,.62,1.9),paint,0,1.22,.08);part(new THREE.BoxGeometry(1.41,.45,.04),glass,0,1.27,-.88);part(new THREE.BoxGeometry(1.41,.42,.04),glass,0,1.27,1.04);for(const sign of [-1,1]){part(new THREE.BoxGeometry(.04,.4,1.2),glass,sign*.78,1.28,.02);for(const z of [-1.17,1.17]){const wheel=part(new THREE.CylinderGeometry(.36,.36,.2,16),rubber,sign*.94,.36,z);wheel.rotation.z=Math.PI/2;const hub=part(new THREE.CylinderGeometry(.17,.17,.205,12),chrome,sign*1.03,.36,z);hub.rotation.z=Math.PI/2}part(new THREE.BoxGeometry(.31,.13,.06),new THREE.MeshBasicMaterial({color:0xffe7ac}),sign*.57,.77,-1.82);part(new THREE.BoxGeometry(.28,.13,.06),new THREE.MeshBasicMaterial({color:0xc7352e}),sign*.57,.77,1.82)}
  part(new THREE.BoxGeometry(1.8,.14,.09),chrome,0,.53,-1.81);part(new THREE.BoxGeometry(1.8,.14,.09),chrome,0,.53,1.81);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.3,4.1),new THREE.MeshBasicMaterial({color:0x071413,transparent:true,opacity:.25,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.015;group.add(shadow);
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
function buildFacades(features,origin){
  const group=new THREE.Group(),instances=[];
  const latScale=METERS_PER_DEGREE*Math.cos(origin[1]*DEG);
  const point=coordinate=>[(coordinate[0]-origin[0])*latScale,(origin[1]-coordinate[1])*METERS_PER_DEGREE];
  const nearby=features.map(feature=>{const ring=feature.rings?.[0]||[];if(ring.length<4)return null;const center=ring.reduce((sum,p)=>[sum[0]+p[0],sum[1]+p[1]],[0,0]).map(v=>v/ring.length);return {feature,ring,distance:Math.hypot(...point(center))}}).filter(item=>item&&item.distance<140).sort((a,b)=>a.distance-b.distance).slice(0,75);
  for(const {feature,ring} of nearby){
    const coordinates=ring.map(point);let area=0;for(let i=0;i<coordinates.length-1;i++){const a=coordinates[i],b=coordinates[i+1];area+=a[0]*b[1]-b[0]*a[1]}
    const direction=area>0?1:-1;const height=Math.max(4.5,feature.height||4.5);
    for(let i=0;i<coordinates.length-1;i++){
      const a=coordinates[i],b=coordinates[i+1],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);
      if(length<3.8)continue;
      const nx=direction*dz/length,nz=-direction*dx/length,rotation=Math.atan2(nx,nz);
      const columns=Math.min(12,Math.floor(length/3.15)),floors=Math.min(8,Math.max(1,Math.floor((height-.8)/3.2)));
      for(let floor=0;floor<floors;floor++)for(let column=0;column<columns;column++){
        const along=(column+.5)*length/columns;if(along<1.15||length-along<1.15)continue;
        const x=a[0]+dx*along/length+nx*.16,z=a[1]+dz*along/length+nz*.16,y=Math.min(height-.95,2.18+floor*3.2);
        instances.push({x,y,z,nx,nz,rotation});
      }
    }
  }
  if(!instances.length)return group;
  const geometry=new THREE.BoxGeometry(1,1,1),materials=[new THREE.MeshBasicMaterial({color:0xeee3cc}),new THREE.MeshBasicMaterial({color:0x294856}),new THREE.MeshBasicMaterial({color:0xa18c71})];
  const meshes=materials.map(material=>{const mesh=new THREE.InstancedMesh(geometry,material,instances.length);mesh.frustumCulled=false;group.add(mesh);return mesh});
  const position=new THREE.Vector3(),quaternion=new THREE.Quaternion(),scale=new THREE.Vector3(),matrix=new THREE.Matrix4(),axis=new THREE.Vector3(0,1,0);
  instances.forEach((item,index)=>{
    quaternion.setFromAxisAngle(axis,item.rotation);
    const set=(mesh,w,h,d,x,y,z)=>{position.set(x,y,z);scale.set(w,h,d);matrix.compose(position,quaternion,scale);mesh.setMatrixAt(index,matrix)};
    set(meshes[0],1.48,1.5,.13,item.x,item.y,item.z);
    set(meshes[1],1.17,1.22,.14,item.x+item.nx*.09,item.y,item.z+item.nz*.09);
    set(meshes[2],1.75,.12,.37,item.x+item.nx*.14,item.y-.76,item.z+item.nz*.14);
  });
  meshes.forEach(mesh=>mesh.instanceMatrix.needsUpdate=true);
  return group;
}
export function createWorld3D(map,mapboxgl){
  const scene=new THREE.Scene(),facadeScene=new THREE.Scene(),camera=new THREE.Camera();
  const ambient=new THREE.AmbientLight(0xffffff,1.55);scene.add(ambient);
  const light=new THREE.DirectionalLight(0xffedcb,1.35);light.position.set(-8,18,10);scene.add(light);
  const own=createActor('🧑🏾');own.group.scale.setScalar(2.2);scene.add(own.group);
  const foregroundCanvas=document.createElement('canvas');foregroundCanvas.className='foreground-avatar';foregroundCanvas.setAttribute('aria-hidden','true');document.body.appendChild(foregroundCanvas);
  const foregroundRenderer=new THREE.WebGLRenderer({canvas:foregroundCanvas,alpha:true,antialias:true});foregroundRenderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));foregroundRenderer.setSize(260,300,false);foregroundRenderer.outputColorSpace=THREE.SRGBColorSpace;
  const foregroundScene=new THREE.Scene(),foregroundCamera=new THREE.PerspectiveCamera(35,260/300,.1,100);foregroundCamera.position.set(0,2.2,6.5);foregroundCamera.lookAt(0,1.15,0);foregroundScene.add(new THREE.AmbientLight(0xffffff,1.75));const foregroundLight=new THREE.DirectionalLight(0xffe8b5,2);foregroundLight.position.set(-3,8,-6);foregroundScene.add(foregroundLight);let foregroundActor=createActor('🧑🏾');foregroundScene.add(foregroundActor.group);const foregroundCar=createCar(0xc34842);foregroundScene.add(foregroundCar.group);foregroundCar.group.visible=false;
  const parkedCar=createCar(0xc34842);scene.add(parkedCar.group);const others=new Map(),beacons=[],doors=[];
  let renderer=null,enabled=false,driving=false,cabinView=false,position=[-0.1949,5.5682],carPosition=null,carHeading=0,heading=0,moving=false,actionUntil=0,facadeOrigin=null,facadeGroup=null,lastFacadeFeatures=null;
  const layer={id:'accralife-3d-people',type:'custom',renderingMode:'3d',onAdd(_map,gl){renderer=new THREE.WebGLRenderer({canvas:map.getCanvas(),context:gl,antialias:true});renderer.autoClear=false;renderer.outputColorSpace=THREE.SRGBColorSpace},render(_gl,matrix){if(!renderer||!enabled)return;
    const t=performance.now()/1000,ground=map.queryTerrainElevation?.(position)||0,mercator=mapboxgl.MercatorCoordinate.fromLngLat(position,ground),scale=mercator.meterInMercatorCoordinateUnits();
    const transform=new THREE.Matrix4().makeTranslation(mercator.x,mercator.y,mercator.z).scale(new THREE.Vector3(scale,-scale,scale)).multiply(new THREE.Matrix4().makeRotationX(Math.PI/2));
    camera.projectionMatrix=new THREE.Matrix4().fromArray(matrix).multiply(transform);
    own.group.visible=false;foregroundActor.animate(t,moving||performance.now()<actionUntil);foregroundActor.group.rotation.y=.12*Math.sin(t*.5);foregroundCar.group.rotation.y=.045*Math.sin(t*2);
    if(carPosition){parkedCar.group.position.x=(carPosition[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);parkedCar.group.position.z=(position[1]-carPosition[1])*METERS_PER_DEGREE;parkedCar.group.rotation.y=carHeading*DEG;parkedCar.group.visible=!driving}else parkedCar.group.visible=false;
    for(const item of others.values()){const [lng,lat]=item.position;item.model.group.position.x=(lng-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.model.group.position.z=(position[1]-lat)*METERS_PER_DEGREE;item.model.group.visible=Math.hypot(item.model.group.position.x,item.model.group.position.z)<220;item.model.group.rotation.y=item.heading*DEG;item.actor?.animate(t,false)}
    for(const item of beacons){item.beacon.group.position.x=(item.lng-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.beacon.group.position.z=(position[1]-item.lat)*METERS_PER_DEGREE;item.beacon.group.visible=Math.hypot(item.beacon.group.position.x,item.beacon.group.position.z)<170;item.beacon.gem.position.y=2.7+Math.sin(t*2+item.phase)*.22;item.beacon.gem.rotation.y=t*.8;item.beacon.ring.rotation.z=t*.5}
    for(const item of doors){item.door.group.position.x=(item.lng-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);item.door.group.position.z=(position[1]-item.lat)*METERS_PER_DEGREE;item.door.group.rotation.y=item.heading*DEG;item.door.glow.material.opacity=.42+Math.sin(t*3)*.16}
    if(facadeGroup&&facadeOrigin){facadeGroup.position.x=(facadeOrigin[0]-position[0])*METERS_PER_DEGREE*Math.cos(position[1]*DEG);facadeGroup.position.z=(position[1]-facadeOrigin[1])*METERS_PER_DEGREE}
    renderer.resetState();renderer.render(facadeScene,camera);renderer.clearDepth();renderer.render(scene,camera);foregroundRenderer.render(foregroundScene,foregroundCamera);map.triggerRepaint();
  }};
  map.addLayer(layer);
  return {
    setEnabled(value){enabled=value;foregroundCanvas.style.display=value&&!cabinView?'block':'none';map.triggerRepaint()},
    setSelf(icon){scene.remove(own.group);const next=createActor(icon);Object.assign(own,next);own.group.scale.setScalar(2.2);scene.add(own.group);foregroundScene.remove(foregroundActor.group);foregroundActor=createActor(icon);foregroundScene.add(foregroundActor.group);map.triggerRepaint()},
    setDriving(value){driving=value;foregroundActor.group.visible=!value;foregroundCar.group.visible=value;foregroundCamera.position.set(0,value?3.2:2.2,value?8.5:6.5);foregroundCamera.lookAt(0,value?0.7:1.15,0);map.triggerRepaint()},
    setTimeOfDay(preset){ambient.intensity=preset==='night'?.8:preset==='dusk'||preset==='dawn'?1.1:1.55;light.intensity=preset==='night'?.45:preset==='dusk'||preset==='dawn'?.9:1.35;map.triggerRepaint()},
    setCabinView(value){cabinView=value;foregroundCanvas.style.display=enabled&&!value?'block':'none';map.triggerRepaint()},
    setCarPosition(lng,lat,direction=carHeading){carPosition=[lng,lat];carHeading=direction;map.triggerRepaint()},
    setPosition(lng,lat,direction=heading){position=[lng,lat];heading=direction;map.triggerRepaint()},
    setMoving(value){moving=value},
    playAction(){actionUntil=performance.now()+1300;map.triggerRepaint()},
    setPlayers(players,selfId){const visible=new Set();for(const p of players){if(p.id===selfId||!Number.isFinite(p.lng)||!Number.isFinite(p.lat))continue;visible.add(p.id);let item=others.get(p.id);if(!item||item.driving!==!!p.driving){if(item)scene.remove(item.model.group);const model=p.driving?createCar(0x40858c):createActor(p.avatar);item={model,actor:p.driving?null:model,driving:!!p.driving,position:[p.lng,p.lat],heading:p.heading||0};others.set(p.id,item);scene.add(model.group)}item.position=[p.lng,p.lat];item.heading=p.heading||0}for(const [id,item] of others){if(!visible.has(id)){scene.remove(item.model.group);others.delete(id)}}map.triggerRepaint()},
    setBuildings(features){if(features===lastFacadeFeatures)return;lastFacadeFeatures=features;if(facadeGroup){facadeScene.remove(facadeGroup);facadeGroup.traverse(object=>{if(object.isInstancedMesh)object.material.dispose()});facadeGroup.children.find(object=>object.isInstancedMesh)?.geometry.dispose()}facadeOrigin=[...position];facadeGroup=buildFacades(features||[],facadeOrigin);facadeScene.add(facadeGroup);map.triggerRepaint()},
    setBeacons(places){for(const item of beacons)scene.remove(item.beacon.group);beacons.length=0;places.slice(0,8).forEach((p,index)=>{const beacon=createBeacon();beacons.push({beacon,lng:p.lng,lat:p.lat,phase:index});scene.add(beacon.group)});map.triggerRepaint()},
    setDoors(entries){entries.slice(0,3).forEach((p,index)=>{let item=doors[index];if(!item){const door=createDoorway();item={door};doors[index]=item;scene.add(door.group)}Object.assign(item,{lng:p.lng,lat:p.lat,heading:p.heading||0});item.door.group.visible=true});for(let i=entries.length;i<doors.length;i++)doors[i].door.group.visible=false;map.triggerRepaint()},
    destroy(){if(map.getLayer(layer.id))map.removeLayer(layer.id);renderer?.dispose();foregroundRenderer.dispose();foregroundCanvas.remove()}
  };
}
