import {facadeLayout} from './facade-layout.js';
import {hipRoofVertices} from './roof-geometry.js';
import {createRoofDetail} from './architecture-models.js';
import {batchStaticMeshes} from './render-utils.js';
import {insideBuilding} from './building-design.js';
import * as THREE from './three.module.js';
import {PAINTS} from './building-design.js';
const materials=new Map();let night=false;
export function setFacadeLighting(preset){night=['night','dusk','dawn'].includes(preset);for(const material of materials.values())material.emissiveIntensity=night?.65:0;}
// Repeating bays keep human-scale windows and plaster detail on actual footprints.
function facadeTexture(seed,style,palette,layout){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');
 c.fillStyle=palette.wall;c.fillRect(0,0,256,256);let n=seed||1;
 for(let i=0;i<1900;i++){n=(Math.imul(n,1664525)+1013904223)>>>0;c.fillStyle=i%2?'#ffffff0b':'#342f250c';c.fillRect(n%256,(n>>>8)%256,2,2)}
 if(style==='brick'){c.strokeStyle='#574d3b55';c.lineWidth=1.5;for(let row=0;row<20;row++)for(let col=-1;col<10;col++)c.strokeRect(col*30+(row%2)*15,row*13,30,13)}
 // Water marks, a foundation course and narrow floor joints break up flat walls.
 const wear=c.createLinearGradient(0,175,0,256);wear.addColorStop(0,'#554d3800');wear.addColorStop(1,`rgba(61,57,43,${layout.weathering})`);c.fillStyle=wear;c.fillRect(0,170,256,86);
 c.fillStyle='#6c6c5c33';c.fillRect(0,245,256,11);c.fillStyle=palette.trim;c.fillRect(0,250,256,3);
 const type=layout.window,x=type==='curtain'?5:type==='storefront'?16:type==='louvre'?66:49,y=type==='curtain'?6:type==='storefront'?65:52,w=256-2*x,h=type==='curtain'?244:type==='storefront'?174:137;
 c.fillStyle='#263432';c.fillRect(x-7,y-7,w+14,h+14);c.fillStyle=palette.trim;c.fillRect(x-4,y-4,w+8,h+8);
 const glass=c.createLinearGradient(x,y,x+w,y+h);glass.addColorStop(0,'#65818a');glass.addColorStop(.48,'#2c464e');glass.addColorStop(1,'#172e35');c.fillStyle=glass;c.fillRect(x,y,w,h);
 c.fillStyle='#d6e2d51e';c.beginPath();c.moveTo(x,y);c.lineTo(x+w*.3,y);c.lineTo(x+w,y+h*.7);c.lineTo(x+w,y+h);c.fill();
 c.fillStyle=palette.trim;c.fillRect(126,y,4,h);if(type==='curtain'||type==='sliding')c.fillRect(x,y+h*.55,w,3);
 if(type==='louvre'){for(let yy=y+8;yy<y+h;yy+=12){c.fillStyle='#91a7a7';c.fillRect(x,yy,w,2);c.fillStyle='#182d3266';c.fillRect(x,yy+2,w,3)}}
 if(type==='shutter'){for(const sx of [x-25,x+w+5]){c.fillStyle=palette.accent;c.fillRect(sx,y,20,h);for(let yy=y+6;yy<y+h;yy+=9){c.fillStyle='#111c1b55';c.fillRect(sx+2,yy,16,2)}}}
 if(type==='storefront'){c.fillStyle=palette.accent;c.fillRect(9,17,238,34);c.fillStyle=palette.trim;c.fillRect(17,31,80,3);c.fillRect(110,31,127,3);c.fillStyle='#d3d3c7';c.fillRect(12,55,232,7);c.fillStyle='#9ea29a';c.fillRect(183,145,4,18)}
 if(!['curtain','storefront'].includes(type)){c.fillStyle=palette.trim;c.fillRect(x-9,y+h+5,w+18,5);c.fillStyle='#1b272333';c.fillRect(x-9,y+h+10,w+18,5)}
 if(['church','mosque'].includes(style)){c.fillStyle=palette.trim;c.beginPath();c.moveTo(49,52);c.quadraticCurveTo(128,-15,207,52);c.lineTo(201,59);c.quadraticCurveTo(128,0,55,59);c.fill();c.fillStyle=palette.accent;for(let xx=65;xx<199;xx+=27)c.fillRect(xx,60,8,120)}
 const texture=new THREE.CanvasTexture(canvas);texture.userData.shared=true;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
export function createBuildingFacade(data){const group=new THREE.Group(),vertices=[],uvs=[];const local=p=>[(p[0]-data.position[0])*111320*Math.cos(data.position[1]*Math.PI/180),(data.position[1]-p[1])*111320];const ring=data.rings[0].map(local),area=ring.slice(1).reduce((s,p,i)=>s+ring[i][0]*p[1]-p[0]*ring[i][1],0),h=data.height,layout=facadeLayout(data.design);let longest=null;
 for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<.5)continue;const sign=area>0?1:-1,nx=dz/length*sign*.07,nz=-dx/length*sign*.07,A=[a[0]+nx,a[1]+nz],B=[b[0]+nx,b[1]+nz];vertices.push(A[0],0,A[1],B[0],0,B[1],B[0],h,B[1],A[0],0,A[1],B[0],h,B[1],A[0],h,A[1]);const u=Math.max(1,Math.round(length/layout.bayWidth)),v=Math.max(1,Math.max(1,Math.round(h/layout.floorHeight)));uvs.push(0,0,u,0,u,v,0,0,u,v,0,v);if(!longest||length>longest.length)longest={a:A,b:B,length,nx,nz};}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.computeVertexNormals();const palette=data.design?.palette||PAINTS[data.seed%PAINTS.length],key=`${data.style||'plaster'}:${palette.wall}:${palette.roof}:${layout.window}:${data.seed%4}`;let material=materials.get(key);if(!material){material=new THREE.MeshStandardMaterial({map:facadeTexture(data.seed%4,data.style,palette,layout),emissive:0xffc77b,emissiveMap:windowGlow(data.seed),emissiveIntensity:night?.65:0,roughness:['glass','office','bank'].includes(data.style)?.3:.86,metalness:['glass','office','bank'].includes(data.style)?.25:0,side:THREE.DoubleSide});material.userData.shared=true;material.userData.refs=0;materials.set(key,material)}material.userData.refs++;group.userData.releaseResources=()=>{if(--material.userData.refs===0){materials.delete(key);material.map?.dispose();material.emissiveMap?.dispose();material.dispose()}};const wall=new THREE.Mesh(geometry,material);group.add(wall);
 // Roof follows the footprint, including courtyard holes.
 const shape=new THREE.Shape(data.rings[0].map(p=>{const [x,z]=local(p);return new THREE.Vector2(x,-z)}));for(const hole of data.rings.slice(1))shape.holes.push(new THREE.Path(hole.map(p=>{const [x,z]=local(p);return new THREE.Vector2(x,-z)})));const simple=layout.roof==='pitched'&&data.rings.length===1&&ring.length===5&&h<14&&['home','classroom','restaurant','shop'].includes(data.design?.kind),hip=simple?hipRoofVertices(ring.slice(0,4),Math.min(2.5,h*.27)):null;
 let roofGeometry;if(hip){roofGeometry=new THREE.BufferGeometry();roofGeometry.setAttribute('position',new THREE.Float32BufferAttribute(hip,3));roofGeometry.setAttribute('uv',new THREE.Float32BufferAttribute(hip.flatMap((_,i)=>i%3===0?[hip[i]/3,hip[i+2]/3]:[]),2));roofGeometry.computeVertexNormals()}else roofGeometry=new THREE.ShapeGeometry(shape);
 const roof=new THREE.Mesh(roofGeometry,new THREE.MeshStandardMaterial({color:palette.roof,map:layout.roof==='pitched'?roofTexture():null,roughness:.86,metalness:layout.roof==='pitched'?.28:.04,side:THREE.DoubleSide}));if(!hip)roof.rotation.x=-Math.PI/2;roof.position.y=h+.08;group.add(roof);
 if(data.distance<150){
  const trim=new THREE.MeshStandardMaterial({color:palette.trim,roughness:.9}),shade=new THREE.MeshStandardMaterial({color:palette.accent,roughness:.8}),steel=new THREE.MeshStandardMaterial({color:'#707b79',metalness:.35,roughness:.7});
  const detail=(a,b,width,height,depth,y,offset,mat)=>{const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),sign=area>0?1:-1,nx=dz/len*sign,nz=-dx/len*sign;const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),mat);mesh.position.set((a[0]+b[0])/2+nx*offset,y,(a[1]+b[1])/2+nz*offset);mesh.rotation.y=Math.atan2(nx,nz);group.add(mesh)};
  for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<3)continue;
   detail(a,b,len,.17,.12,h-.12,.07,trim);
   if(!hip&&layout.roof==='flat')detail(a,b,len,.42,.16,h+.21,0,trim);
   if(h>6)for(let y=3.1;y<h-1;y+=3.1)detail(a,b,len,.13,.18,y,.1,trim);
  }
  if(longest){const {a,b,length}=longest;
   if(layout.awning)detail(a,b,Math.min(length*.8,9),.16,.7,2.7,.3,shade);
   if(layout.balcony&&h>6){detail(a,b,Math.min(length*.65,7),.18,.65,3.12,.3,trim);detail(a,b,Math.min(length*.65,7),.8,.08,3.58,.58,steel)}
   if(layout.aircon&&h>3.4)detail(a,b,.85,.48,.26,2.8,.16,steel);
  }
 }
 if(longest?.length>3){const {a,b,nx,nz}=longest;const door=new THREE.Mesh(new THREE.PlaneGeometry(1.25,2.25),new THREE.MeshStandardMaterial({color:palette.accent,metalness:.15,roughness:.38,side:THREE.DoubleSide}));door.position.set((a[0]+b[0])/2+nx,.0+1.125,(a[1]+b[1])/2+nz);door.rotation.y=Math.atan2(nx,nz);group.add(door);
 if(data.design?.placeName&&data.distance<100){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle=palette.accent;c.fillRect(0,0,1024,128);c.fillStyle=palette.trim;c.font='600 52px sans-serif';c.textAlign='center';c.fillText(data.design.placeName,512,82,990);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const sign=new THREE.Mesh(new THREE.PlaneGeometry(Math.min(10,longest.length*.7),.8),new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide}));sign.position.copy(door.position);sign.position.y=Math.min(h-.5,3.3);sign.rotation.copy(door.rotation);group.add(sign)}
 }
 if(!hip&&data.distance<100&&insideBuilding(data.position,data.rings)){const xs=ring.map(p=>p[0]),zs=ring.map(p=>p[1]);let width=Math.max(...xs)-Math.min(...xs),depth=Math.max(...zs)-Math.min(...zs);const at=(x,z)=>[data.position[0]+x/(111320*Math.cos(data.position[1]*Math.PI/180)),data.position[1]-z/111320];for(let attempt=0;attempt<6&&![-1,1].every(sx=>[-1,1].every(sz=>insideBuilding(at(sx*width*.41,sz*depth*.41),data.rings)));attempt++){width*=.75;depth*=.75}if(width>3&&depth>3){const detail=createRoofDetail({...data,width,depth,roof:data.design?.roofMapped?layout.roof:'flat'});group.add(detail.group)}}
 batchStaticMeshes(group);return {group};}

function windowGlow(seed){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#000';ctx.fillRect(0,0,256,256);ctx.fillStyle=seed%3?'#fff':'#333';ctx.fillRect(58,55,66,62);if(seed%2)ctx.fillRect(130,122,68,64);const texture=new THREE.CanvasTexture(c);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.userData.shared=true;return texture}

let sheetTexture;function roofTexture(){if(sheetTexture)return sheetTexture;const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#d2d1c9';c.fillRect(0,0,128,128);for(let x=0;x<128;x+=8){c.fillStyle='#999f9c';c.fillRect(x,0,2,128);c.fillStyle='#e2e2d8';c.fillRect(x+2,0,1,128)}c.fillStyle='#858d8844';c.fillRect(0,62,128,2);sheetTexture=new THREE.CanvasTexture(canvas);sheetTexture.wrapS=sheetTexture.wrapT=THREE.RepeatWrapping;sheetTexture.colorSpace=THREE.SRGBColorSpace;sheetTexture.userData.shared=true;return sheetTexture}
