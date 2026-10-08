import * as THREE from './three.module.js';
// Combine static meshes that share a material into a single draw call.
// Call before adding animated actors. This preserves each vertex's world transform.
export function batchStaticMeshes(root){
 root.updateMatrixWorld(true);const groups=new Map();
 root.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o.userData.dynamic||Array.isArray(o.material)||!o.visible)return;const key=`${o.material.uuid}:${o.castShadow}:${o.receiveShadow}`;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o)});
 let before=0,after=0;const inverse=root.matrixWorld.clone().invert();
 for(const meshes of groups.values()){const material=meshes[0].material;before+=meshes.length;after++;if(meshes.length<2)continue;const arrays={position:[],normal:[],uv:[]};
  for(const mesh of meshes){let geometry=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();geometry.applyMatrix4(inverse.clone().multiply(mesh.matrixWorld));for(const key of Object.keys(arrays)){const attr=geometry.getAttribute(key);if(attr)arrays[key].push(...attr.array)}geometry.dispose();mesh.removeFromParent()}
  const geometry=new THREE.BufferGeometry();for(const [key,values] of Object.entries(arrays))if(values.length)geometry.setAttribute(key,new THREE.Float32BufferAttribute(values,key==='uv'?2:3));const combined=new THREE.Mesh(geometry,material);combined.castShadow=meshes.some(m=>m.castShadow);combined.receiveShadow=meshes.some(m=>m.receiveShadow);root.add(combined);
  for(const geo of new Set(meshes.map(m=>m.geometry)))geo.dispose();
 }
 root.userData.batching={before,after};return {before,after};
}
export function disposeScene(root){const gs=new Set(),ms=new Set(),ts=new Set();root.traverse(o=>{if(o.geometry)gs.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:o.material?[o.material]:[]){ms.add(m);for(const v of Object.values(m))if(v?.isTexture)ts.add(v)}});ts.forEach(t=>{if(!t.userData.shared)t.dispose()});gs.forEach(g=>{if(!g.userData.shared)g.dispose()});ms.forEach(m=>{if(!m.userData.shared)m.dispose()})}
export function interiorRenderer(canvas){const r=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});r.setPixelRatio(Math.min(devicePixelRatio||1,matchMedia('(pointer:coarse)').matches?1.25:1.5));r.outputColorSpace=THREE.SRGBColorSpace;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=1.1;r.shadowMap.enabled=true;r.shadowMap.type=THREE.PCFSoftShadowMap;r.shadowMap.autoUpdate=false;return r}

// Identical animated rigs share GPU geometry. Bone transforms still update per person.
export function instanceAnimatedModels(models){
 const group=new THREE.Group(),parts=models.map(model=>{const nodes=[];model.traverse(o=>{if(o.isMesh)nodes.push(o)});return nodes});
 if(!parts.length)return {group,update(){},drawCalls:0};
 if(parts.some(p=>p.length!==parts[0].length))throw new Error('Instanced rigs must have the same mesh layout');
 const meshes=parts[0].map((node,index)=>{const material=node.material.clone();if(material.color)material.color.set(0xffffff);const mesh=new THREE.InstancedMesh(node.geometry.clone(),material,models.length);mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;mesh.castShadow=false;mesh.receiveShadow=false;parts.forEach((p,i)=>mesh.setColorAt(i,p[index].material.color||new THREE.Color(0xffffff)));group.add(mesh);return mesh});
 function update(){models.forEach((model,i)=>{model.updateMatrixWorld(true);meshes.forEach((mesh,j)=>mesh.setMatrixAt(i,parts[i][j].matrixWorld))});meshes.forEach(mesh=>mesh.instanceMatrix.needsUpdate=true)}
 update();return {group,update,drawCalls:meshes.length};
}
