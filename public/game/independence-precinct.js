import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {surfaceTexture} from './graphics-materials.js';

// Photo-led exterior approximations; dimensions remain the mapped envelopes.
// Shared ground-level solids keep the visible openings and physics in agreement.
export function precinctSolids(data) {
 if(data.id==='black-star-gate')return [[-9,0,5.5,8],[9,0,5.5,8],[-4,0,.8,8],[4,0,.8,8],[-22,0,11,11],[22,0,11,11]];
 if(data.id==='independence-arch')return [[-21,0,6,8],[21,0,6,8],[-15,0,4,14],[15,0,4,14]];
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
  const w=data.width,d=data.depth,step=(d-3)/12;
  box(stone,w,.3,d,0,.15,0);
  // Concrete terraces with four stair aisles and continuous bench sections.
  for(let row=0;row<12;row++){
   const z=d/2-1.5-row*step,y=.42+row*.36;
   box(stone,w,y,step,0,y/2,z);
   for(let bay=0;bay<5;bay++){const bw=w/5-1.25,x=-w/2+(bay+.5)*w/5;box(trim,bw,.13,.48,x,y+.15,z);}
   for(let aisle=1;aisle<5;aisle++)box(joint,.08,.025,step,-w/2+aisle*w/5,y+.015,z);
  }
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
  for(const [y,w,d] of [[10.4,46,14],[16.6,49,17]]){
   box(stone,w,1,d,0,y,0);box(trim,w+.7,.18,d+.5,0,y+.57,0);
   for(const z of [-d/2,d/2])rail(-w/2+.3,w/2-.3,y+.7,z);
  }
  for(const x of [-12,-6,0,6,12])box(stone,.48,5.2,.48,x,13.5,-4.8);
  for(const x of [-15,15]){
   // Two short returns visible behind the side platforms.
   for(let step=0;step<26;step++){const rise=10.9/26,h=(step+1)*rise,z=6.6-step*.5;box(stone,4,rise,.5,x,h-rise/2,z);}
   for(let step=0;step<16;step++){const h=11+step*.35,z=-5+step*.56;box(stone,3.2,.35,.56,x,h-.175,z);}
   beam(trim,[x-1.8,1,6.7],[x-1.8,11,-6.3],.09);beam(trim,[x+1.8,1,6.7],[x+1.8,11,-6.3],.09);
  }
  // Black star at the front of the upper viewing platform.
  star(1.45,0,18.5,8.65);
  group.userData.precinct={kind:'arch',viewingDecks:2,stairFlights:4,openCentre:true};
 }
 group.userData.collisionSolids=precinctSolids(data);
 batchStaticMeshes(group);group.rotation.y=data.rotation*Math.PI/180;
 return {group};
}
