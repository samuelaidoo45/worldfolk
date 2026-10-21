import * as THREE from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface,contactShadow} from './graphics-materials.js';
import {vehicleSpec} from './vehicle-catalog.js';
export const VEHICLE_PALETTE=[0x174c89,0x9c172a,0x12624f,0xf0eee5,0x202631,0x7b8189,0xe7ad20,0x51326a];
export function vehicleKit(color){
 const group=new THREE.Group(),wheels=[],wheelMeshes=[];let wheelPhase=0,steering=0,brakeHold=0;const paint=tagSurface(new THREE.MeshPhysicalMaterial({color,metalness:.27,roughness:.27,clearcoat:1,clearcoatRoughness:.16}),'paint'),glass=tagSurface(new THREE.MeshPhysicalMaterial({color:0x739497,metalness:.06,roughness:.08,clearcoat:1,transparent:true,opacity:.56,depthWrite:false,side:THREE.DoubleSide}),'glass'),rubber=tagSurface(new THREE.MeshStandardMaterial({color:0x141719,roughness:.88}),'rubber'),chrome=tagSurface(new THREE.MeshStandardMaterial({color:0xb8c2c9,metalness:.88,roughness:.22}),'metal'),headlight=new THREE.MeshStandardMaterial({color:0xe8f3ff,emissive:0xa6c5e0,emissiveIntensity:.4,roughness:.15}),tail=new THREE.MeshStandardMaterial({color:0xa40c15,emissive:0x8e0010,emissiveIntensity:.35,roughness:.2});
 const cabin=tagSurface(new THREE.MeshStandardMaterial({color:0x343b3b,roughness:.92}),'fabric');
 const add=(geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o};
 const box=(m,w,h,d,x=0,y=h/2,z=0)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 function profile(points,width,m,bevel=.035){const shape=new THREE.Shape(points.map(([z,y])=>new THREE.Vector2(z,y)));const o=add(new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,steps:1}),m,width/2,0,0);o.rotation.y=-Math.PI/2;return o}
 function wheel(x,z,r=.34){wheels.push({x,z,r,front:z<0})}
 function tube(m,a,b,r=.025){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),o=add(new THREE.CylinderGeometry(r,r,start.distanceTo(end),8),m);o.position.copy(start.add(end).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(new THREE.Vector3(...a)).normalize());return o}
 function rounded(m,w,h,d,x=0,y=h/2,z=0,r=.06){const s=new THREE.Shape(),a=-w/2,b=-h/2; r=Math.min(r,w/3,h/3,d/3);s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);const o=add(new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSize:r,bevelThickness:r,bevelSegments:2,curveSegments:3}),m,x,y,z-d/2+r);return o}
 function panel(m,rows,crown=.035){const pos=[],idx=[],columns=12;for(const [z,y,width] of rows)for(let i=0;i<=columns;i++){const t=i/columns*2-1;pos.push(t*width/2,y+crown*(1-t*t),z)}for(let row=0;row<rows.length-1;row++)for(let i=0;i<columns;i++){const a=row*(columns+1)+i,b=a+columns+1;idx.push(a,b,a+1,b,b+1,a+1)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return add(g,m)}
 function label(text,w,h,x,y,z,rotation=0,bg='#173c38',fg='#f5f0d7'){
  const t=signTexture(text,bg,fg);if(!t)return;const o=add(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:t,roughness:.7}),x,y,z);o.rotation.y=rotation;
 }
 function seat(x,y,z,width=.46){
  box(cabin,width,.13,.43,x,y,z);const back=box(cabin,width,.44,.12,x,y+.23,z+.2);back.rotation.x=-.08;
  box(cabin,width*.63,.16,.11,x,y+.53,z+.22);
 }
 function steeringWheel(x,y,z){const rim=add(new THREE.TorusGeometry(.17,.022,6,20),rubber,x,y,z);rim.rotation.x=-.45;box(rubber,.28,.023,.035,x,y,z);box(rubber,.05,.13,.055,x,y-.045,z)}
 function plate(x,y,z,rear=false){box(chrome,.41,.125,.035,x,y,z);label('GR 2026 · 26',.39,.115,x,y,z+(rear?.022:-.022),rear?0:Math.PI,'#f2d259','#182327')}
 function finish(w,l,{scale=[1,1,1],spokes=false,steel=false}={}){
  const o=add(new THREE.PlaneGeometry(w,l),new THREE.MeshBasicMaterial({map:contactShadow(),color:0x091211,transparent:true,opacity:.58,depthWrite:false}),0,.018,0);o.rotation.x=-Math.PI/2;o.castShadow=false;
  for(const child of group.children){child.position.multiply(new THREE.Vector3(...scale));child.scale.multiply(new THREE.Vector3(...scale))}
  for(const v of wheels){v.x*=scale[0];v.z*=scale[2];v.r*=scale[1]}
  batchStaticMeshes(group);
  // Four independently turning wheels share just two instanced draw calls.
  const r=wheels[0].r,parts=wheelGeometry(r,spokes,steel),dummy=new THREE.Object3D();
  for(const [geo,m] of [[parts.tire,rubber],[parts.rim,chrome]]){const mesh=new THREE.InstancedMesh(geo,m,wheels.length);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.userData.dynamic=true;mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;group.add(mesh);wheelMeshes.push(mesh)}
  function poseWheels(){wheels.forEach((v,i)=>{dummy.position.set(v.x,v.r,v.z);dummy.rotation.set(0,v.front?steering:0,0);dummy.rotateX(wheelPhase);dummy.updateMatrix();for(const mesh of wheelMeshes)mesh.setMatrixAt(i,dummy.matrix)});for(const mesh of wheelMeshes)mesh.instanceMatrix.needsUpdate=true}
  function animateVehicle({distance=0,steer=0,braking=false,preset='day'}={},dt=1/60){
   const elapsed=Math.min(.1,Math.max(0,dt));wheelPhase=(wheelPhase-distance/r)%(Math.PI*2);steering+=(steer-steering)*(1-Math.exp(-elapsed*12));brakeHold=braking?.32:Math.max(0,brakeHold-elapsed);
   const dark=['night','dawn','dusk'].includes(preset);headlight.emissiveIntensity=dark?2.4:.18;tail.emissiveIntensity=brakeHold>0?3.2:dark?.65:.12;poseWheels();
  }
  poseWheels();group.userData.wheelRadius=r;
  return {group,animateVehicle,wheels:wheelMeshes,lights:{headlight,tail},get steering(){return steering},get wheelPhase(){return wheelPhase}};
 }

 return {group,paint,glass,rubber,chrome,headlight,tail,add,box,profile,wheel,plate,seat,steeringWheel,cabin,finish,tube,rounded,label,panel};
}
const signs=new Map();
function signTexture(text,bg,fg){if(typeof document==='undefined')return null;const key=text+bg+fg;if(signs.has(key))return signs.get(key);const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');if(!ctx)return null;ctx.fillStyle=bg;ctx.fillRect(0,0,512,128);ctx.fillStyle=fg;ctx.font='bold 60px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,69,490);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.userData.shared=true;signs.set(key,t);return t}
export function createCar(color=0x174c89,kind='car',{taxiLivery=false}={}){
 const k=vehicleKit(color),{paint,glass,rubber,chrome,headlight,tail,box,profile,add,wheel,plate,seat,steeringWheel,cabin,rounded,label,panel}=k;
 const tall=['suv','van','pickup'].includes(kind),van=kind==='van',pickup=kind==='pickup',hatch=kind==='hatchback',roofY=van?1.85:tall?1.7:1.46;
 glass.color.setHex(0x314e5c);glass.opacity=.76;
 // Side panels follow a continuous contour, with open wheel arches cut into the lower edge.
 const side=new THREE.Shape();side.moveTo(-1.78,.47);side.lineTo(-1.83,.69);side.quadraticCurveTo(-1.6,.85,-.9,.94);side.lineTo(.88,.94);side.quadraticCurveTo(1.65,.9,1.82,.7);side.lineTo(1.82,.47);side.lineTo(1.57,.47);side.absarc(1.17,.39,.43,.18,Math.PI-.18,false);side.lineTo(-.76,.47);side.absarc(-1.17,.39,.43,.18,Math.PI-.18,false);side.closePath();
 for(const x of [-.79,.79]){const o=add(new THREE.ExtrudeGeometry(side,{depth:.1,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:3}),paint,x+.05,0,0);o.rotation.y=-Math.PI/2;}
 box(rubber,1.37,.13,2.9,0,.4,0);rounded(paint,1.39,.3,3.45,0,.63,0,.1);
 // Crown the bonnet and rear deck; a tapered nose avoids the old flat box face.
 panel(paint,[[-1.81,.75,1.45],[-1.65,.82,1.6],[-1.3,.9,1.64],[-.82,.94,1.57]],.035);
 panel(paint,[[.89,.94,1.61],[1.36,.89,1.64],[1.74,.77,1.47]],.025);
 rounded(paint,1.63,.22,.24,0,.61,-1.73,.065);rounded(paint,1.65,.23,.22,0,.61,1.73,.06);
 const a=van?-1.32:-1.01,b=van?-.98:-.55,c=pickup?.4:van?1.31:hatch?.82:tall?.95:.5,e=pickup?.78:van?1.51:hatch?1.42:tall?1.4:1.08;
 panel(glass,[[a,.955,1.48],[a+(b-a)*.5,(roofY+.92)/2,1.35],[b,roofY-.045,1.23]],.015);
 panel(glass,[[c,roofY-.045,1.23],[e,.955,1.48]],.012);
 panel(paint,[[b-.025,roofY-.03,1.24],[b+.13,roofY+.015,1.3],[c-.1,roofY+.015,1.3],[c+.035,roofY-.03,1.24]],.038);
 for(const s of [-1,1]){const pts=[new THREE.Vector3(s*.735,.96,a+.035),new THREE.Vector3(s*.615,roofY-.055,b+.045),new THREE.Vector3(s*.615,roofY-.055,c-.035),new THREE.Vector3(s*.735,.96,e-.025)],g=new THREE.BufferGeometry().setFromPoints(pts);g.setIndex(s>0?[0,1,2,0,2,3]:[0,2,1,0,3,2]);g.computeVertexNormals();add(g,glass);}
 for(const s of [-1,1]){
  const pillar=(z1,y1,z2,y2,width=.039)=>k.tube(paint,[s*.739,y1,z1],[s*.624,y2,z2],width);
  pillar(a,.94,b,roofY);pillar(e,.94,c,roofY);k.tube(rubber,[s*.74,.96,.08],[s*.627,roofY,.08],.043);
  k.tube(rubber,[s*.737,.951,a],[s*.618,roofY-.047,b],.018);k.tube(rubber,[s*.618,roofY-.047,b],[s*.618,roofY-.047,c],.016);k.tube(rubber,[s*.618,roofY-.047,c],[s*.737,.951,e],.018);
  box(chrome,.025,.021,e-a,s*.741,.96,(e+a)/2);
  box(rubber,.026,.31,.012,s*.858,.75,.12);box(rubber,.028,.014,1.57,s*.858,.54,.15);box(chrome,.05,.027,.17,s*.867,.87,.3);
  box(paint,.17,.12,.22,s*.93,1.02,a+.1);box(glass,.014,.075,.14,s*1.02,1.035,a+.12);
  for(const z of [-1.17,1.17])wheel(s*.86,z);
  const lampY=tall?.77:.74,lampH=tall?.105:.135;
  rounded(rubber,.46,lampH+.045,.08,s*.57,lampY,-1.83,.022);rounded(chrome,.4,lampH,.028,s*.57,lampY,-1.881,.012);
  for(const dx of [-.09,.09]){const lens=add(new THREE.SphereGeometry(.052,10,6),headlight,s*.57+dx,lampY,-1.914);lens.scale.set(1,1,.34)}rounded(tail,.36,.115,.07,s*.63,.77,1.79,.025);
  for(const z of [-.32,.7]){box(chrome,.045,.025,.15,s*.868,.87,z);box(rubber,.025,.29,.012,s*.86,.73,z-.14)}
  box(chrome,.021,.02,2.4,s*.865,.57,0);
  const amber=new THREE.MeshStandardMaterial({color:0xffa929,roughness:.24});box(amber,.09,.07,.078,s*.77,.74,-1.83);box(amber,.018,.047,.07,s*.866,.84,-.83);
  box(headlight,.22,.035,.08,s*.59,.68,-1.866);rounded(rubber,.28,.08,.075,s*.6,.53,-1.86,.02);
  const wiper=box(rubber,.49,.013,.017,s*.31,1.025,-.96);wiper.rotation.y=s*.13;
 }
 rounded(rubber,tall?.91:.7,tall?.27:.17,.075,0,tall?.65:.61,-1.87,.045);for(const y of (tall?[.55,.65,.75]:[.57,.63]))box(chrome,tall?.82:.66,.012,.026,0,y,-1.916);
 box(paint,1.6,.08,.12,0,.47,-1.77);box(paint,1.6,.08,.12,0,.47,1.77);plate(0,.55,1.85,true);plate(0,.49,-1.865);
 for(const x of [-.37,.37]){seat(x,.65,-.05);if(!van)seat(x,.65,pickup?.46:.68)}
 box(cabin,1.23,.16,.24,0,.98,-.65);steeringWheel(-.37,1.1,-.48);
 if(pickup){box(rubber,1.3,.07,.88,0,.96,1.24);for(const s of [-1,1])box(paint,.13,.29,.95,s*.76,1.07,1.27);box(paint,1.6,.29,.12,0,1.07,1.68)}
 if(tall)for(const s of [-1,1])box(chrome,.04,.06,1.76,s*.55,roofY+.12,.22);
 if(van){box(paint,1.38,.61,1.48,0,1.38,.74);for(const s of [-1,1])box(rubber,.02,.55,.015,s*.83,1.17,.22)}
 // Separate wing paint follows the wheel opening; it is not a floating stripe.
 if(kind==='taxi'||taxiLivery){const orange=new THREE.MeshPhysicalMaterial({color:0xee8f20,metalness:.16,roughness:.34,clearcoat:1});for(const s of [-1,1])for(const z of [-1.17,1.17]){const sh=new THREE.Shape();sh.moveTo(z-.53,.72);sh.lineTo(z-.53,.85);sh.lineTo(z+.53,.85);sh.lineTo(z+.53,.72);sh.absarc(z,.39,.43,.85,Math.PI-.85,false);sh.closePath();const m=add(new THREE.ShapeGeometry(sh),orange,s*.873,0,0);m.rotation.y=-Math.PI/2;orange.side=THREE.DoubleSide;}rounded(orange,.43,.14,.2,0,roofY+.13,-.3,.025);label('TAXI',.35,.09,0,roofY+.14,-.408,Math.PI,'#f2be36','#152625')}
 if(!van&&!pickup){const rear=box(chrome,1.02,.014,.017,0,.87,1.49);rear.rotation.x=.04;box(rubber,.052,.052,.19,-.57,.38,1.73)}
 if(pickup){for(let n=0;n<7;n++)box(chrome,.018,.015,.8,-.52+n*.17,.999,1.24);box(chrome,1.1,.026,.022,0,1.17,1.75)}
 const spec=vehicleSpec(kind);k.group.userData.vehicleKind=kind;return k.finish(2.1,3.9,{scale:[spec.width/1.78,kind==='taxi'?1:spec.height/(roofY+.13),spec.length/3.78]});
}
export function createBus(){
 const k=vehicleKit(0xe8e4d4),{paint,glass,rubber,chrome,headlight,tail,box,profile,wheel,plate,seat,steeringWheel,cabin,rounded,label}=k;
 // An actual shell leaves the cabin visible through the glazing.
 rounded(paint,2.18,.64,6.55,0,.89,0,.1);rounded(paint,2.18,.14,6.3,0,2.78,.03,.04);box(cabin,2.05,.12,6.35,0,.61,0);
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
 rounded(paint,1.2,.16,1,0,2.97,.9,.05);plate(0,.77,-3.46);plate(0,.9,3.48,true);label('ACCRA · CITY',1.48,.22,0,2.62,-3.275,Math.PI);label('SAFE JOURNEY',1.34,.18,0,1.63,3.43);for(const s of [-1,1]){box(chrome,.018,.025,5.9,s*1.185,1.38,.1);for(const z of [-2.64,0,2.65])box(tail,.028,.08,.14,s*1.19,.78,z)}k.group.userData.vehicleKind='bus';return k.finish(2.6,7.1,{steel:true});
}

const wheelCache=new Map();
function wheelGeometry(r,spokes=false,steel=false){
 const key=`${r}:${spokes}:${steel}`;if(wheelCache.has(key))return wheelCache.get(key);
 const root=new THREE.Group(),rubber=new THREE.MeshStandardMaterial(),metal=new THREE.MeshStandardMaterial();
 function add(geo,mat,x=0){const m=new THREE.Mesh(geo,mat);m.position.x=x;root.add(m);return m}
 const tire=add(new THREE.TorusGeometry(r*(spokes?.94:.77),r*(spokes?.06:.23),8,32),rubber);tire.rotation.y=Math.PI/2;
 if(!spokes){const inner=add(new THREE.CylinderGeometry(r*.72,r*.72,.19,24),rubber);inner.rotation.z=Math.PI/2;}
 for(const side of [-1,1]){const lip=add(new THREE.TorusGeometry(r*(spokes?.89:.63),r*(spokes?.018:.055),6,24),metal,side*(spokes?.019:.115));lip.rotation.y=Math.PI/2;
  if(steel){const disc=add(new THREE.CylinderGeometry(r*.59,r*.59,.02,24),metal,side*.116);disc.rotation.z=Math.PI/2;for(let n=0;n<8;n++){const a=n*Math.PI/4,hole=add(new THREE.CylinderGeometry(r*.075,r*.075,.024,8),rubber,side*.13);hole.rotation.z=Math.PI/2;hole.position.y=Math.cos(a)*r*.44;hole.position.z=Math.sin(a)*r*.44}}
  for(let n=0;n<(spokes?24:10);n++){const a=n*Math.PI*2/(spokes?24:10),m=add(new THREE.BoxGeometry(spokes?.006:.025,r*(spokes?.86:.51),spokes?.006:.028),metal,side*(spokes?.019:.115));m.position.y=Math.cos(a)*r*(spokes?.43:.34);m.position.z=Math.sin(a)*r*(spokes?.43:.34);m.rotation.x=a;}
  const hub=add(new THREE.CylinderGeometry(r*.17,r*.17,.025,12),metal,side*(spokes?.025:.125));hub.rotation.z=Math.PI/2;
 }
 batchStaticMeshes(root);root.updateMatrixWorld(true);const parts={};
 // Batching bakes transforms only when a material has multiple meshes. A
 // bicycle tyre is a single torus: preserve its axle rotation before instancing.
 root.traverse(o=>{if(o.isMesh){const geometry=o.geometry.clone().applyMatrix4(o.matrixWorld);geometry.userData.shared=true;parts[o.material===rubber?'tire':'rim']=geometry;o.geometry.dispose()}});
 rubber.dispose();metal.dispose();wheelCache.set(key,parts);return parts;
}
