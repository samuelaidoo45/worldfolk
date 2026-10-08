import * as THREE from './three.module.js';
import {tagSurface,contactShadow} from './graphics-materials.js';
import {batchStaticMeshes} from './render-utils.js';

export function createPalm(data={}){
 const group=new THREE.Group(),seed=String(data.id||'palm').split('').reduce((s,c)=>s+c.charCodeAt(0),0),height=5.1+(seed%8)*.12,lean=(seed%5-2)*.1;
 const bark=tagSurface(new THREE.MeshStandardMaterial({color:0x8b7960,roughness:.98}),'wood'),leaf=tagSurface(new THREE.MeshStandardMaterial({color:0x426e3d,roughness:.85,side:THREE.DoubleSide}),'foliage'),dry=tagSurface(new THREE.MeshStandardMaterial({color:0x807547,roughness:.96,side:THREE.DoubleSide}),'foliage');
 const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.115,.24,height,10,10),bark);trunk.position.set(lean/2,height/2,0);trunk.rotation.z=-Math.atan2(lean,height);group.add(trunk);
 for(let n=0;n<23;n++){const t=n/23,ring=new THREE.Mesh(new THREE.TorusGeometry(.232-t*.108,.013,3,10),bark);ring.rotation.x=Math.PI/2;ring.position.set(lean*t,height*t+.09,0);group.add(ring);}
 for(let f=0;f<11;f++){
  const angle=f*Math.PI*2/11+(seed%7)*.14,length=2.05+(f%3)*.22,vertices=[],uv=[];
  const at=(t,side=0)=>{const radial=t*length;return [lean+Math.sin(angle)*radial+Math.cos(angle)*side,height+Math.sin(t*Math.PI)*.48-t*t*.85,Math.cos(angle)*radial-Math.sin(angle)*side]};
  const tri=(a,b,c)=>{vertices.push(...a,...b,...c);uv.push(0,0,.5,1,1,0)};
  // A central spine and separate leaflets make the canopy read as a palm.
  for(let n=0;n<12;n++){const t=n/12,next=(n+1)/12;tri(at(t,-.018),at(next,0),at(t,.018));}
  for(let n=1;n<14;n++){const t=n/15,width=Math.sin(t*Math.PI)*.43;for(const side of [-1,1]){const tip=at(Math.min(.99,t+.17),side*width);tip[1]-=.12;tri(at(t-.025),tip,at(t+.047));}}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.computeVertexNormals();group.add(new THREE.Mesh(geo,f===10?dry:leaf));
 }
 for(let i=0;i<4;i++){const nut=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),bark);nut.position.set(lean+Math.sin(i*1.57)*.18,height-.13,Math.cos(i*1.57)*.18);group.add(nut)}
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3,3),new THREE.MeshBasicMaterial({map:contactShadow(),color:0x25322a,opacity:.28,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.012;group.add(shadow);
 batchStaticMeshes(group);return {group};
}
