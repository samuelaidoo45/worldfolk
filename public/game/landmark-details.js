import * as THREE from './three.module.js';
// Roof details stay inside the mapped building envelope; no guessed street props.
export function landmarkRoof(data){
 const profile=data.design?.landmark;if(!profile?.detail)return null;
 const group=new THREE.Group(),p=data.design.palette,stone=new THREE.MeshStandardMaterial({color:p.wall,roughness:.85}),trim=new THREE.MeshStandardMaterial({color:p.trim,roughness:.8}),roof=new THREE.MeshStandardMaterial({color:p.roof,roughness:.62}),dark=new THREE.MeshStandardMaterial({color:p.accent,roughness:.5});
 const w=Math.min(30,data.width*.7),d=Math.min(30,data.depth*.7),h=data.height;
 const add=(geometry,material,x,y,z)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.castShadow=true;group.add(mesh);return mesh};
 const box=(m,a,b,c,x,y,z)=>add(new THREE.BoxGeometry(a,b,c),m,x,y,z);
 if(profile.detail==='sculpted-shells'){
  for(let i=0;i<3;i++){const angle=i*Math.PI*2/3,r=Math.min(w,d)*.2;const shell=add(new THREE.SphereGeometry(1,32,20,0,Math.PI*1.55,0,Math.PI*.62),roof,Math.sin(angle)*r,h,Math.cos(angle)*r);shell.scale.set(w*.27,Math.min(14,w*.5),d*.42);shell.rotation.y=angle;shell.material.side=THREE.DoubleSide;}
 }else if(profile.detail==='mall-canopy'){
  const span=Math.min(18,w),depth=Math.min(10,d),vertices=[];
  for(let i=0;i<24;i++){const a=i*Math.PI/24,b=(i+1)*Math.PI/24,A=[Math.cos(a)*span/2,h+.2+Math.sin(a)*2.2],B=[Math.cos(b)*span/2,h+.2+Math.sin(b)*2.2];vertices.push(A[0],A[1],-depth/2,B[0],B[1],-depth/2,B[0],B[1],depth/2,A[0],A[1],-depth/2,B[0],B[1],depth/2,A[0],A[1],depth/2)}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();roof.side=THREE.DoubleSide;add(geometry,roof,0,0,0);
  for(const side of [-1,1])box(stone,.65,2,depth,side*span/2,h-1,0);
  for(let z=-depth/2;z<=depth/2;z+=2){const curve=new THREE.CatmullRomCurve3(Array.from({length:25},(_,i)=>{const a=i*Math.PI/24;return new THREE.Vector3(Math.cos(a)*span/2,h+.25+Math.sin(a)*2.2,z)}));add(new THREE.TubeGeometry(curve,24,.06,5,false),dark,0,0,0)}
 }else if(['clock-tower','brick-tower'].includes(profile.detail)){
  const width=Math.min(5,w*.4,d*.4),height=profile.detail==='brick-tower'?9:7;box(stone,width,height,width,0,h+height/2,0);box(trim,width+.35,.3,width+.35,0,h+height-.2,0);
  const cap=add(new THREE.ConeGeometry(width*.8,2.1,4),roof,0,h+height+1,0);cap.rotation.y=Math.PI/4;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#e8e1c9';c.fillRect(0,0,256,256);c.strokeStyle='#3c433d';c.lineWidth=7;c.beginPath();c.arc(128,128,111,0,Math.PI*2);c.stroke();for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(128+Math.sin(a)*91,128-Math.cos(a)*91);c.lineTo(128+Math.sin(a)*103,128-Math.cos(a)*103);c.stroke()}c.lineWidth=9;c.beginPath();c.moveTo(128,128);c.lineTo(92,83);c.moveTo(128,128);c.lineTo(183,97);c.stroke();const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const face=new THREE.MeshStandardMaterial({map:texture,roughness:.75});for(let i=0;i<4;i++){const a=i*Math.PI/2,clock=add(new THREE.PlaneGeometry(width*.7,width*.7),face,Math.sin(a)*(width/2+.02),h+height-1.8,Math.cos(a)*(width/2+.02));clock.rotation.y=a}
 }else if(profile.detail==='ottoman-domes'){
  const radius=Math.min(w,d)*.25;add(new THREE.SphereGeometry(radius,24,12,0,Math.PI*2,0,Math.PI/2),roof,0,h+.5,0);
  for(const side of [-1,1])for(const front of [-1,1]){add(new THREE.SphereGeometry(radius*.48,16,8,0,Math.PI*2,0,Math.PI/2),roof,side*radius*.9,h,front*radius*.9);const x=side*w*.44,z=front*d*.44,tower=Math.max(10,radius*2.5);add(new THREE.CylinderGeometry(.4,.65,tower,12),stone,x,h+tower/2,z);for(const y of [.55,.8])add(new THREE.CylinderGeometry(.85,.75,.3,12),trim,x,h+tower*y,z);add(new THREE.ConeGeometry(.65,2.6,12),roof,x,h+tower+1.3,z)}
 }
 return {group};
}
