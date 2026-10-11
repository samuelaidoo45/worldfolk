import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {precinctNavigation} from './precinct-navigation.js';
import {surfaceTexture} from './graphics-materials.js';

// Photo-led exterior approximations; dimensions remain the mapped envelopes.
// Shared ground-level solids keep the visible openings and physics in agreement.
export function precinctSolids(data) {
 if(data.id==='black-star-gate')return [[-9,0,5.5,8],[9,0,5.5,8],[-4,0,.8,8],[4,0,.8,8],[-22,0,11,11],[22,0,11,11]];
 if(data.id==='unknown-soldier')return [[0,0,28,18]];
 if(data.id==='independence-arch')return [[-21,0,6,8],[21,0,6,8],[-15,17,3.2,16],[15,17,3.2,16]];
 if(data.id.startsWith('square-stand'))return [[0,-1.1,data.width,data.depth-2.2]];
 return [];
}
export function createPrecinctLandmark(data) {
 const group=new T.Group();group.name=data.name;
 const material=(color,roughness=.87)=>new T.MeshStandardMaterial({color,roughness});
 const stone=material('#ded8c6'),trim=material('#ece7d7'),joint=material('#b3ae9c'),dark=material('#222a28'),red=material('#a13b32'),gold=material('#d4ad38'),green=material('#386747'),paving=material('#94958e'),grass=material('#687851'),water=material('#639d9e',.24);
 stone.bumpMap=surfaceTexture('stone');stone.bumpScale=.035;
 const add=(geometry,mat,x,y,z,name)=>{const mesh=new T.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;mesh.name=name||'';group.add(mesh);return mesh;};
 const box=(mat,w,h,d,x,y,z,name)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z,name);
 const beam=(mat,a,b,width=.12)=>{const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);const o=add(new T.BoxGeometry(width,delta.length(),width),mat,...start.add(end).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;};
 const star=(r,x,y,z,depth=.18)=>{const shape=new T.Shape();for(let i=0;i<10;i++){const angle=i*Math.PI/5,size=i%2?r*.43:r;const p=[Math.sin(angle)*size,Math.cos(angle)*size];i?shape.lineTo(...p):shape.moveTo(...p);}shape.closePath();return add(new T.ExtrudeGeometry(shape,{depth,bevelEnabled:false}),dark,x,y,z,'Black star');};
 const rail=(x1,x2,y,z)=>{beam(trim,[x1,y+1,z],[x2,y+1,z],.09);beam(trim,[x1,y+.45,z],[x2,y+.45,z],.07);for(let x=x1;x<=x2;x+=1.3)box(trim,.08,1.05,.08,x,y+.52,z);};
 const floor=(mat,w,d,x,z,y=.025)=>{const o=add(new T.PlaneGeometry(w,d),mat,x,y,z);o.rotation.x=-Math.PI/2;o.castShadow=false;return o;};
 const signMaterials=new Map();
 const sign=(text,w,h,y,z,back=false)=>{
  if(typeof document==='undefined')return;
  let mat=signMaterials.get(text);
  if(!mat){const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#292e27';ctx.font='500 132px Georgia';ctx.textAlign='center';ctx.fillText(text,1024,176,1990);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;mat=new T.MeshStandardMaterial({map:tex,transparent:true,depthWrite:false,roughness:1});signMaterials.set(text,mat);}
  const o=add(new T.PlaneGeometry(w,h),mat,0,y,z);o.castShadow=false;if(back)o.rotation.y=Math.PI;
 };
 if(data.id==='independence-parade-ground'){
  paving.map=surfaceTexture('paving').clone();paving.map.userData={};paving.map.repeat.set(data.width/5,data.depth/5);paving.bumpMap=paving.map;paving.bumpScale=.015;
  floor(paving,data.width,data.depth,0,0);
  // Sparse ceremonial guide lines, rather than an invented street grid.
  floor(trim,.18,data.depth,0,0,.035);
  for(const x of [-data.width/2+2,data.width/2-2])floor(trim,.12,data.depth-4,x,0,.035);
  group.userData.precinct={kind:'parade-ground',openGround:true};
 }else if(data.id.startsWith('square-stand')){
  const w=data.width,d=data.depth,nav=precinctNavigation(data);
  for(const f of nav.surfaces)box(stone,f.w,f.y-f.base,f.d,f.x,(f.y+f.base)/2,f.z);
  for(const f of nav.solids)if(f.w>1&&f.d<.5&&f.base>0)box(trim,f.w,f.top-f.base,f.d,f.x,(f.top+f.base)/2,f.z);
  const roof=box(trim,w+1.8,.25,d+1,0,7.94,0);roof.rotation.x=.016;
  for(let x=-w/2+1;x<w/2;x+=5.8){
   beam(stone,[x,0,d/2-.8],[x,4.9,d/2-2.2],.44);
   beam(stone,[x,4.9,d/2-2.2],[x,7.8,d/2+.3],.38);
   beam(stone,[x,7.8,d/2+.3],[x,8.05,-d/2],.27);
   beam(stone,[x,0,-d/2+.4],[x,8,-d/2+.4],.32);
  }
  // Flag fascia is on the face that points into the mapped parade square.
  [red,gold,green].forEach((m,i)=>box(m,w+1.8,.24,.17,0,7.98-i*.24,d/2+.58));
  star(.37,0,7.75,d/2+.69);
  rail(-w/2,w/2,4.7,-d/2+.2);
  group.userData.precinct={kind:'grandstand',terraces:12,aisles:4,flagFascia:true};
 }else if(data.id==='unknown-soldier'){
  const granite=material('#706555'),bronze=material('#344139',.62),patina=material('#647564',.75);
  granite.bumpMap=surfaceTexture('stone');granite.bumpScale=.055;
  for(const f of precinctNavigation(data).surfaces)box(granite,f.w,f.y,f.d,f.x,f.y/2,f.z);
  box(granite,3.8,.45,3.8,0,1.025,-1.8);box(granite,2.8,10.65,2.8,0,6.55,-1.8);box(trim,3,.2,3,0,11.98,-1.8);
  for(let y=1.8;y<11.7;y+=1.1)for(const z of [-3.21,-.39])box(joint,2.79,.018,.015,0,y,z);
  // Bronze sentry at attention: boots, puttees, tunic, helmet and grounded rifle.
  const ellipsoid=(x,y,z,sx,sy,sz,mat=bronze)=>{const m=add(new T.SphereGeometry(1,16,12),mat,x,y,z);m.scale.set(sx,sy,sz);return m};
  for(const side of [-1,1]){const x=side*.32;box(bronze,.42,.25,.85,x,12.22,-1.57);ellipsoid(x,12.91,-1.8,.22,.65,.23);ellipsoid(x,13.65,-1.8,.27,.55,.29);for(let y=12.4;y<13.25;y+=.13)box(patina,.4,.025,.44,x,y,-1.8);}
  const tunic=add(new T.CylinderGeometry(.48,.63,1.35,16),bronze,0,14.32,-1.8);tunic.scale.z=.68;
  box(patina,1.04,.14,.66,0,13.95,-1.8);for(const x of [-.27,.27])box(patina,.28,.28,.08,x,14.5,-1.45);
  ellipsoid(0,15.35,-1.8,.31,.4,.28);ellipsoid(0,15.65,-1.8,.46,.21,.43);add(new T.CylinderGeometry(.45,.49,.08,24),bronze,0,15.57,-1.8);
  for(const side of [-1,1]){beam(bronze,[side*.57,14.85,-1.8],[side*.64,14.05,-1.64],.26);beam(bronze,[side*.64,14.05,-1.64],[side*.54,13.65,-1.45],.2);ellipsoid(side*.54,13.6,-1.45,.13,.19,.13);}
  beam(bronze,[.69,12.18,-1.36],[.69,14.65,-1.36],.1);box(bronze,.18,.9,.17,.69,12.72,-1.36);
  // Ceremonial flame bowl in front, with an open interior and bronze rim.
  add(new T.CylinderGeometry(1.05,1.35,.4,24),granite,0,1,4.3);
  const bowl=add(new T.SphereGeometry(2.15,32,16,0,Math.PI*2,Math.PI/2,Math.PI/2),bronze,0,2.45,4.3);bowl.scale.y=.52;
  const rim=add(new T.TorusGeometry(2.15,.075,8,48),patina,0,2.45,4.3);rim.rotation.x=Math.PI/2;
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const emblem=add(new T.TorusGeometry(.18,.045,6,16),gold,Math.sin(a)*1.92,1.95,4.3+Math.cos(a)*1.92);emblem.rotation.y=a;}
  // Regular flag rows frame the memorial without filling the ceremonial approach.
  for(const side of [-1,1])for(let i=0;i<4;i++){
   const x=side*(5+i*2.25),z=-3.4;box(trim,.12,11,.12,x,6.3,z);
   [red,gold,green].forEach((m,row)=>box(m,2.1,.42,.035,x+1.05,11.55-row*.42,z));star(.2,x+1.05,11.13,z+.025,.02);
  }
  group.userData.precinct={kind:'memorial',sentry:true,flameBowl:true,flagpoles:8,walkableSteps:5};
 }else if(data.id==='black-star-gate'){
  // Three portals, recessed date panel, ring medallions and coffered soffit.
  for(const x of [-9,9]){box(stone,5.5,13.7,8,x,7.05,0);box(joint,5.9,.4,8.4,x,.2,0);box(trim,5.7,.18,8.2,x,.52,0);}
  for(const x of [-4,4])box(stone,.8,13.7,8,x,7.05,0);
  box(stone,25,1.9,8.5,0,14.85,0);box(trim,26,.3,9.4,0,15.92,0);
  box(stone,24,2.55,8,0,17.4,0);box(trim,24.7,.28,8.6,0,18.82,0);
  box(trim,7,.35,5.5,0,19.14,0);box(stone,5.4,2.5,4.4,0,20.5,0);
  star(3.6,0,23.65,-2.4,4.8);
  for(const side of [-1,1]){
   for(let y=1.3;y<13.5;y+=.82){for(const x of [-9,9]){box(joint,5.48,.018,.014,x,y,side*4.009);for(let j=0;j<3;j++)box(joint,.014,.8,.014,x-1.75+j*1.75+((Math.round(y/.82)%2)*.4),y+.4,side*4.011);}}
   for(const x of [-11,-7,-4,4,7,11])add(new T.TorusGeometry(.3,.045,6,24),dark,x,12.65,side*4.035);
   box(trim,9,.13,.14,0,18.17,side*4.07);box(trim,9,.13,.14,0,16.73,side*4.07);
   for(const x of [-4.5,4.5])box(trim,.13,1.5,.14,x,17.45,side*4.07);
   sign('F R E E D O M   A N D   J U S T I C E',19,1.1,14.8,side*4.27,side<0);
   sign('A D   1 9 5 7',7.7,1.1,17.45,side*4.09,side<0);
  }
  for(let x=-11;x<=11;x+=1.4)box(trim,.15,.16,8.1,x,13.84,0);
  for(let z=-3.5;z<=3.5;z+=1.4)box(trim,24,.16,.15,0,13.84,z);
  // Discrete fountain gardens keep the ceremonial driveway open.
  for(const x of [-22,22]){
   floor(grass,16,23,x,0);box(trim,16,.16,.22,x,.08,-11.5);box(trim,16,.16,.22,x,.08,11.5);
   add(new T.CylinderGeometry(5.5,5.7,.45,40),stone,x,.25,0);
   add(new T.CylinderGeometry(4.95,4.95,.035,40),water,x,.5,0);
   add(new T.CylinderGeometry(.6,.95,2,16),stone,x,1.4,0);
   add(new T.CylinderGeometry(1.7,1.1,.3,24),trim,x,2.5,0);
   add(new T.CylinderGeometry(1.35,1.35,.025,24),water,x,2.66,0);
  }
  floor(paving,7.1,36,0,0,.03);
  group.userData.precinct={kind:'gate',portals:3,medallions:12,cofferedSoffit:true};
 }else if(data.id==='independence-arch'){
  // A continuous sweeping arch above two open viewing decks, photographed
  // by HACSA. No invented dates or gate inscriptions on this separate monument.
  const arch=new T.Shape();arch.moveTo(-24,0);arch.quadraticCurveTo(-12,27,-2,29.7);arch.quadraticCurveTo(0,30.5,2,29.7);arch.quadraticCurveTo(12,27,24,0);arch.lineTo(18,0);arch.quadraticCurveTo(10,25,1.3,27.5);arch.quadraticCurveTo(0,28,-1.3,27.5);arch.quadraticCurveTo(-10,25,-18,0);arch.closePath();
  add(new T.ExtrudeGeometry(arch,{depth:7.5,bevelEnabled:false,curveSegments:28}),stone,0,0,-3.75);
  for(const side of [-1,1]){const curve=new T.QuadraticBezierCurve3(new T.Vector3(-21,0,side*3.78),new T.Vector3(0,56,side*3.78),new T.Vector3(21,0,side*3.78));add(new T.TubeGeometry(curve,64,.055,4,false),joint,0,0,0);}
  const nav=precinctNavigation(data);
  for(const f of nav.surfaces)box(f.kind==='step'?stone:trim,f.w,f.y-f.base,f.d,f.x,(f.y+f.base)/2,f.z);
  for(const [y,w] of [[11,46],[17.2,49]]){
   for(const z of [-10,10]){if(y<12&&z===10){rail(-w/2,-16.9,y,z);rail(-13.1,13.1,y,z);rail(16.9,w/2,y,z);}else rail(-w/2,w/2,y,z);}
   for(const x of [-w/2,w/2]){beam(trim,[x,y+1,10],[x,y+1,-10],.09);for(let z=-10;z<=10;z+=1.3)box(trim,.08,1,.08,x,y+.5,z);}
  }
  for(const x of [-12,0,12])box(stone,.48,5.2,.48,x,13.5,-4.8);
  for(const side of [-1,1])for(const [x,z0,z1,y0,y1] of [[side*15,25,9,0,11],[side*5,9,-7,11,17.2]]){
   for(const edge of [-1.65,1.65]){beam(trim,[x+edge,y0+1,z0],[x+edge,y1+1,z1],.09);for(let t=0;t<=1;t+=.125){const y=y0+(y1-y0)*t,z=z0+(z1-z0)*t;box(trim,.07,1,.07,x+edge,y+.5,z);}}
  }
  // Black star at the front of the upper viewing platform.
  star(1.45,0,18.8,10.12);
  group.userData.precinct={kind:'arch',viewingDecks:2,stairFlights:4,openCentre:true};
 }
 group.userData.collisionSolids=precinctSolids(data);
 batchStaticMeshes(group);group.rotation.y=data.rotation*Math.PI/180;
 return {group};
}
