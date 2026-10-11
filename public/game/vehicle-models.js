import * as THREE from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface,contactShadow} from './graphics-materials.js';
export const VEHICLE_PALETTE=[0x174c89,0x9c172a,0x12624f,0xf0eee5,0x202631,0x7b8189,0xe7ad20,0x51326a];
function kit(color){
 const group=new THREE.Group(),wheels=[],wheelMeshes=[];let wheelPhase=0,steering=0,brakeHold=0;const paint=tagSurface(new THREE.MeshPhysicalMaterial({color,metalness:.27,roughness:.27,clearcoat:1,clearcoatRoughness:.16}),'paint'),glass=tagSurface(new THREE.MeshPhysicalMaterial({color:0x739497,metalness:.06,roughness:.08,clearcoat:1,transparent:true,opacity:.56,depthWrite:false,side:THREE.DoubleSide}),'glass'),rubber=tagSurface(new THREE.MeshStandardMaterial({color:0x141719,roughness:.88}),'rubber'),chrome=tagSurface(new THREE.MeshStandardMaterial({color:0xb8c2c9,metalness:.88,roughness:.22}),'metal'),headlight=new THREE.MeshStandardMaterial({color:0xe8f3ff,emissive:0xa6c5e0,emissiveIntensity:.4,roughness:.15}),tail=new THREE.MeshStandardMaterial({color:0xa40c15,emissive:0x8e0010,emissiveIntensity:.35,roughness:.2});
 const cabin=tagSurface(new THREE.MeshStandardMaterial({color:0x343b3b,roughness:.92}),'fabric');
 const add=(geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o};
 const box=(m,w,h,d,x=0,y=h/2,z=0)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 function profile(points,width,m,bevel=.035){const shape=new THREE.Shape(points.map(([z,y])=>new THREE.Vector2(z,y)));const o=add(new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,steps:1}),m,width/2,0,0);o.rotation.y=-Math.PI/2;return o}
 function wheel(x,z,r=.34){wheels.push({x,z,r,front:z<0})}
 function seat(x,y,z,width=.46){
  box(cabin,width,.13,.43,x,y,z);const back=box(cabin,width,.44,.12,x,y+.23,z+.2);back.rotation.x=-.08;
  box(cabin,width*.63,.16,.11,x,y+.53,z+.22);
 }
 function steeringWheel(x,y,z){const rim=add(new THREE.TorusGeometry(.17,.022,6,20),rubber,x,y,z);rim.rotation.x=-.45;box(rubber,.28,.023,.035,x,y,z);box(rubber,.05,.13,.055,x,y-.045,z)}
 function plate(x,y,z,rear=false){box(new THREE.MeshStandardMaterial({color:0xecebdc}),.39,.115,.035,x,y,z);if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=256;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#e8e7d3';ctx.fillRect(0,0,256,80);ctx.fillStyle='#17252b';ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.fillText('GR 2026',128,56);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const o=add(new THREE.PlaneGeometry(.38,.11),new THREE.MeshStandardMaterial({map:t}),x,y,z+(rear?.022:-.022));if(!rear)o.rotation.y=Math.PI;}
 function finish(w,l){
  const o=add(new THREE.PlaneGeometry(w,l),new THREE.MeshBasicMaterial({map:contactShadow(),color:0x091211,transparent:true,opacity:.58,depthWrite:false}),0,.018,0);o.rotation.x=-Math.PI/2;o.castShadow=false;
  batchStaticMeshes(group);
  // Four independently turning wheels share just two instanced draw calls.
  const r=wheels[0].r,parts=wheelGeometry(r),dummy=new THREE.Object3D();
  for(const [geo,m] of [[parts.tire,rubber],[parts.rim,chrome]]){const mesh=new THREE.InstancedMesh(geo,m,wheels.length);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.userData.dynamic=true;mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;group.add(mesh);wheelMeshes.push(mesh)}
  function poseWheels(){wheels.forEach((v,i)=>{dummy.position.set(v.x,v.r,v.z);dummy.rotation.set(0,v.front?steering:0,0);dummy.rotateX(wheelPhase);dummy.updateMatrix();for(const mesh of wheelMeshes)mesh.setMatrixAt(i,dummy.matrix)});for(const mesh of wheelMeshes)mesh.instanceMatrix.needsUpdate=true}
  function animateVehicle({distance=0,steer=0,braking=false,preset='day'}={},dt=1/60){
   const elapsed=Math.min(.1,Math.max(0,dt));wheelPhase=(wheelPhase-distance/r)%(Math.PI*2);steering+=(steer-steering)*(1-Math.exp(-elapsed*12));brakeHold=braking?.32:Math.max(0,brakeHold-elapsed);
   const dark=['night','dawn','dusk'].includes(preset);headlight.emissiveIntensity=dark?2.4:.18;tail.emissiveIntensity=brakeHold>0?3.2:dark?.65:.12;poseWheels();
  }
  poseWheels();group.userData.wheelRadius=r;
  return {group,animateVehicle,wheels:wheelMeshes,lights:{headlight,tail},get steering(){return steering},get wheelPhase(){return wheelPhase}};
 }

 return {group,paint,glass,rubber,chrome,headlight,tail,add,box,profile,wheel,plate,seat,steeringWheel,cabin,finish};
}
export function createCar(color=0x174c89,kind='car'){
 const k=kit(color),{paint,glass,rubber,chrome,headlight,tail,box,profile,add,wheel,plate,seat,steeringWheel,cabin}=k;
 const tall=kind==='suv'||kind==='van',van=kind==='van',pickup=kind==='pickup',hatch=kind==='hatchback',roofY=van?1.85:tall?1.7:1.46;
 // Side panels follow a continuous contour, with open wheel arches cut into the lower edge.
 const side=new THREE.Shape();side.moveTo(-1.78,.47);side.lineTo(-1.83,.69);side.quadraticCurveTo(-1.6,.85,-.9,.94);side.lineTo(.88,.94);side.quadraticCurveTo(1.65,.9,1.82,.7);side.lineTo(1.82,.47);side.lineTo(1.57,.47);side.absarc(1.17,.39,.43,.18,Math.PI-.18,false);side.lineTo(-.76,.47);side.absarc(-1.17,.39,.43,.18,Math.PI-.18,false);side.closePath();
 for(const x of [-.79,.79]){const o=add(new THREE.ExtrudeGeometry(side,{depth:.1,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:3}),paint,x+.05,0,0);o.rotation.y=-Math.PI/2;}
 box(rubber,1.37,.13,2.9,0,.4,0);profile([[-1.73,.78],[-1.35,.91],[-.78,.95],[.97,.95],[1.73,.78]],1.46,paint,.045);
 const a=van?-1.32:-1.01,b=van?-.98:-.55,c=pickup?-.08:van?1.31:hatch?.82:tall?.95:.5,e=pickup?.31:van?1.51:hatch?1.42:tall?1.4:1.08;
 profile([[a,.94],[b,roofY-.05],[c,roofY-.05],[e,.94]],1.29,glass,.026);
 profile([[b-.05,roofY-.07],[b+.08,roofY+.02],[c-.06,roofY+.02],[c+.08,roofY-.07]],1.36,paint,.035);
 for(const s of [-1,1]){
  const pillar=(z1,y1,z2,y2,width=.055)=>{const o=box(paint,width,Math.hypot(z2-z1,y2-y1),.07,s*.67,(y1+y2)/2,(z1+z2)/2);o.rotation.x=Math.atan2(z2-z1,y2-y1)};
  pillar(a,.94,b,roofY);pillar(e,.94,c,roofY);pillar(.08,.94,.08,roofY,.085);
  box(chrome,.035,.027,e-a,s*.704,.96,(e+a)/2);
  box(rubber,.026,.31,.012,s*.858,.75,.12);box(rubber,.028,.014,1.57,s*.858,.54,.15);box(chrome,.05,.027,.17,s*.867,.87,.3);
  box(paint,.17,.12,.22,s*.93,1.02,a+.1);box(glass,.014,.075,.14,s*1.02,1.035,a+.12);
  for(const z of [-1.17,1.17])wheel(s*.86,z);
  box(headlight,.42,.14,.07,s*.57,.74,-1.79);box(tail,.36,.14,.07,s*.63,.77,1.79);
  box(headlight,.22,.045,.08,s*.59,.66,-1.81);box(rubber,.27,.075,.07,s*.6,.51,-1.78);
  const wiper=box(rubber,.49,.013,.017,s*.31,1.025,-.96);wiper.rotation.y=s*.13;
 }
 box(rubber,.8,.18,.075,0,.59,-1.83);for(const y of [.55,.6,.65])box(chrome,.77,.012,.09,0,y,-1.837);
 box(paint,1.6,.08,.12,0,.47,-1.77);box(paint,1.6,.08,.12,0,.47,1.77);plate(0,.55,1.85,true);plate(0,.49,-1.865);
 for(const x of [-.37,.37]){seat(x,.65,-.05);if(!pickup&&!van)seat(x,.65,.68)}
 box(cabin,1.23,.16,.24,0,.98,-.65);steeringWheel(-.37,1.1,-.48);
 if(pickup){box(rubber,1.3,.07,1.3,0,.96,1.05);for(const s of [-1,1])box(paint,.13,.29,1.42,s*.76,1.07,1.01);box(paint,1.6,.29,.12,0,1.07,1.68)}
 if(tall)for(const s of [-1,1])box(chrome,.04,.06,1.76,s*.55,roofY+.12,.22);
 if(van){box(paint,1.38,.61,1.48,0,1.38,.74);for(const s of [-1,1])box(rubber,.02,.55,.015,s*.83,1.17,.22)}
 if(kind==='taxi'){const orange=new THREE.MeshPhysicalMaterial({color:0xee7c14,roughness:.3,clearcoat:1});for(const s of [-1,1])for(const z of [-1.4,1.4])box(orange,.02,.19,.45,s*.861,.8,z);box(orange,.43,.13,.2,0,roofY+.13,0);}
 k.group.userData.vehicleKind=kind;return k.finish(2.1,3.9);
}
export function createBus(){
 const k=kit(0xedece3),{paint,glass,rubber,chrome,headlight,tail,box,profile,wheel,plate,seat,steeringWheel,cabin}=k;
 // An actual shell leaves the cabin visible through the glazing.
 box(paint,2.18,.64,6.55,0,.89,0);box(paint,2.18,.14,6.3,0,2.78,.03);box(cabin,2.05,.12,6.35,0,.61,0);
 for(const side of [-1,1]){box(paint,.12,.45,6.24,side*1.06,1.4,0);for(let i=0;i<6;i++)box(paint,.13,1.1,.1,side*1.06,2.16,-2.98+i*1.19)}
 for(const z of [-3.17,3.17])for(const side of [-1,1])box(paint,.13,1.12,.15,side*1.04,2.16,z);
 for(let row=0;row<4;row++)for(const x of [-.64,.64])seat(x,.86,-1.4+row*1.08,.64);seat(-.63,.85,-2.53,.6);box(cabin,1.98,.22,.28,0,1.48,-2.94);steeringWheel(-.63,1.64,-2.81);
 const stripe=new THREE.MeshPhysicalMaterial({color:0x1c6187,roughness:.33,clearcoat:.8});
 for(const s of [-1,1]){
  box(stripe,.018,.31,6.48,s*1.16,1.15,0);box(rubber,.025,.11,6.45,s*1.16,.68,0);
  for(let i=0;i<5;i++){const z=-2.4+i*1.18;box(glass,.029,.88,.94,s*1.178,2.15,z);box(chrome,.032,.017,.91,s*1.19,2.29,z)}
  for(const z of [-2.1,2.1])wheel(s*1.08,z,.48);
  box(headlight,.37,.22,.08,s*.76,.96,-3.38);box(tail,.19,.42,.08,s*.92,1.07,3.4);box(rubber,.09,.6,.11,s*1.245,2.02,-2.97);box(chrome,.22,.3,.08,s*1.19,2.14,-3.02);
 }
 const screen=box(glass,1.99,.94,.045,0,2.12,-3.24);screen.rotation.x=.2;box(rubber,.04,1,.05,0,2.1,-3.27);
 box(rubber,1.22,.32,.08,0,1.12,-3.4);for(const y of [1.03,1.11,1.19])box(chrome,1.12,.018,.09,0,y,-3.42);
 box(rubber,2.26,.19,.11,0,.62,-3.4);box(rubber,2.26,.19,.11,0,.62,3.4);box(glass,1.9,.76,.035,0,2.13,3.4);
 for(const x of [-.47,.47]){const w=box(rubber,.65,.025,.03,x,1.78,-3.36);w.rotation.z=x*.3;}
 for(const z of [-2.04,-1.18])box(rubber,.024,1.88,.045,1.196,1.57,z);for(const z of [-1.82,-1.4])box(glass,.03,1.61,.36,1.213,1.68,z);box(chrome,.12,.08,.86,1.22,.69,-1.61);
 box(chrome,1.2,.16,1,0,2.97,.9);plate(0,.77,-3.46);plate(0,.9,3.48,true);k.group.userData.vehicleKind='bus';return k.finish(2.6,7.1);
}

const wheelCache=new Map();
function wheelGeometry(r){
 if(wheelCache.has(r))return wheelCache.get(r);
 const root=new THREE.Group(),rubber=new THREE.MeshStandardMaterial(),metal=new THREE.MeshStandardMaterial();
 function add(geo,mat,x=0){const m=new THREE.Mesh(geo,mat);m.position.x=x;root.add(m);return m}
 const tire=add(new THREE.TorusGeometry(r*.77,r*.23,10,28),rubber);tire.rotation.y=Math.PI/2;
 const inner=add(new THREE.CylinderGeometry(r*.72,r*.72,.19,24),rubber);inner.rotation.z=Math.PI/2;
 for(const side of [-1,1]){const lip=add(new THREE.TorusGeometry(r*.63,r*.055,6,24),metal,side*.115);lip.rotation.y=Math.PI/2;
  for(let n=0;n<5;n++){const a=n*Math.PI*2/5,m=add(new THREE.BoxGeometry(.035,r*.51,.046),metal,side*.115);m.position.y=Math.cos(a)*r*.34;m.position.z=Math.sin(a)*r*.34;m.rotation.x=a;}
  const hub=add(new THREE.CylinderGeometry(r*.17,r*.17,.025,12),metal,side*.125);hub.rotation.z=Math.PI/2;
 }
 batchStaticMeshes(root);const parts={};root.traverse(o=>{if(o.isMesh){o.geometry.userData.shared=true;parts[o.material===rubber?'tire':'rim']=o.geometry}});rubber.dispose();metal.dispose();wheelCache.set(r,parts);return parts;
}
