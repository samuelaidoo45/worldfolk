import * as T from './three.module.js';
import {STATIC_LODS,HUMAN_LODS} from './lod-catalog.js';
export {STATIC_LODS,HUMAN_LODS};
const humanGeometry=new Map(),humanJobs=new Map();
const constructors={Float32Array,Uint16Array,Uint32Array};
export function decodeLodGeometry(header,buffer,{shared=false}={}){
 const geometry=new T.BufferGeometry();
 const read=a=>{const C=constructors[a.type];if(!C||!Number.isSafeInteger(a.offset)||!Number.isSafeInteger(a.length)||a.offset%4||a.offset<0||a.length<0||a.offset+a.length*C.BYTES_PER_ELEMENT>buffer.byteLength)throw Error('Invalid LOD buffer range');return new C(buffer,a.offset,a.length);};
 for(const [name,a] of Object.entries(header.attributes)){const data=read(a);if(!Number.isInteger(a.itemSize)||a.itemSize<1||a.itemSize>4||data.length%a.itemSize)throw Error('Invalid LOD attribute');geometry.setAttribute(name,new T.BufferAttribute(data,a.itemSize,!!a.normalized));}
 geometry.setIndex(new T.BufferAttribute(read(header.index),1));for(const group of header.groups||[])geometry.addGroup(group.start,group.count,group.materialIndex);geometry.computeBoundingBox();geometry.computeBoundingSphere();geometry.userData.shared=shared;geometry.userData.renderLod='medium';return geometry;
}
async function readAsset(entry,signal){
 const base=new URL('./assets/lods/',import.meta.url),compressed=entry.compressed&&typeof DecompressionStream!=='undefined',url=file=>{const u=new URL(file,base);u.searchParams.set('v',entry.sha256.slice(0,12));return u;},responses=await Promise.all([fetch(url(entry.json),{signal}),fetch(url(compressed?entry.compressed:entry.binary),{signal})]);if(responses.some(r=>!r.ok))throw Error('LOD asset unavailable');const [header,payload]=await Promise.all([responses[0].json(),responses[1].arrayBuffer()]);const magic=new Uint8Array(payload,0,Math.min(2,payload.byteLength));const buffer=compressed&&magic[0]===0x1f&&magic[1]===0x8b?await new Response(new Response(payload).body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer():payload;if(header.binary!==entry.binary||buffer.byteLength!==entry.bytes||header.sha256!==entry.sha256)throw Error('LOD manifest mismatch');return {header,buffer};
}
export async function loadStaticLod(id,{signal}={}){
 const entry=STATIC_LODS[id];if(!entry)throw Error('No static LOD: '+id);const {header,buffer}=await readAsset(entry,signal),group=new T.Group();group.name=id+' · medium';group.userData.renderLod='medium';
 for(const item of header.meshes){const material=new T.MeshStandardMaterial({...item.material,color:new T.Color().fromArray(item.material.color),emissive:new T.Color().fromArray(item.material.emissive||[0,0,0])}),mesh=new T.Mesh(decodeLodGeometry(item.geometry,buffer),material);mesh.castShadow=false;mesh.receiveShadow=item.receiveShadow;group.add(mesh);}return {group};
}
export function getHumanLod(sex){return humanGeometry.get(sex)}
export function loadHumanLod(sex){
 if(humanGeometry.has(sex))return Promise.resolve(humanGeometry.get(sex));if(typeof window==='undefined')return Promise.resolve(null);
 if(!humanJobs.has(sex))humanJobs.set(sex,readAsset(HUMAN_LODS[sex]).then(({header,buffer})=>{const geometry=decodeLodGeometry(header.geometry,buffer,{shared:true});humanGeometry.set(sex,geometry);return geometry;}).catch(()=>null));return humanJobs.get(sex);
}
