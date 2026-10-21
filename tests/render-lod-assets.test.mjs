import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import * as T from '../public/game/three.module.js';
import {STATIC_LODS,HUMAN_LODS,decodeLodGeometry,loadStaticLod,loadHumanLod,getHumanLod} from '../public/game/lod-assets.js';
import {GLTFLoader} from '../public/game/humanoid-loader.js';
import {prepareHumanTemplate,createRiggedActor} from '../public/game/human-character.js';
import {disposeScene} from '../public/game/render-utils.js';
import {createVillaggio} from '../public/game/villaggio.js';
import {VILLAGGIO_BLOCKS,VILLAGGIO_ROTATION} from '../public/game/villaggio-data.js';
import {CIVIC_SITES,CIVIC_BUILDINGS,civicLocal} from '../public/game/independence-neighbourhood-data.js';
const base=new URL('../public/game/assets/lods/',import.meta.url),humanBase=new URL('../public/game/assets/humans/',import.meta.url);
async function asset(entry){const bin=await fs.readFile(new URL(entry.binary,base)),header=JSON.parse(await fs.readFile(new URL(entry.json,base)));return {bin,header,buffer:bin.buffer.slice(bin.byteOffset,bin.byteOffset+bin.byteLength)}}
test('all prebuilt LOD assets are finite, checksum pinned, smaller and independently disposable',async()=>{
 const manifest=JSON.parse(await fs.readFile(new URL('manifest.json',base)));for(const [file,digest] of Object.entries(manifest.sourceFiles)){assert.equal(createHash('sha256').update(await fs.readFile(new URL('../'+file,import.meta.url))).digest('hex'),digest,'Regenerate LODs after changing '+file);}
 let near=0,far=0,compressed=0;assert.equal(Object.keys(STATIC_LODS).length,45);
 for(const id of ['villaggio-vista','the-signature','the-gallery','polo-heights-frontage','stanbic-heights','one-airport-square','kwarleyz-residence','accra-stadium','independence-volta','independence-finance','independence-commission','independence-club','asomdwe-park'])assert.ok(STATIC_LODS[id],id+' must retain a distant exterior');
 for(const entry of [...Object.values(STATIC_LODS),...Object.values(HUMAN_LODS)]){
  const {bin,header,buffer}=await asset(entry),gz=await fs.readFile(new URL(entry.compressed,base));assert.equal(bin.length,entry.bytes);assert.equal(gz.length,entry.compressedBytes);assert.equal(createHash('sha256').update(bin).digest('hex'),entry.sha256);assert.deepEqual(gunzipSync(gz),bin);assert.ok(entry.triangles<=entry.nearTriangles);near+=entry.nearTriangles;far+=entry.triangles;compressed+=gz.length;
  for(const spec of header.geometry?[header.geometry]:header.meshes.map(m=>m.geometry)){
   const g=decodeLodGeometry(spec,buffer);assert.ok(g.attributes.position.count>0);for(const a of Object.values(g.attributes))assert.ok(a.array.every(Number.isFinite));assert.ok(g.index.array.every(i=>i<g.attributes.position.count));assert.ok(Number.isFinite(g.boundingSphere.radius));assert.ok(g.boundingSphere.radius>0);let disposed=0;g.addEventListener('dispose',()=>disposed++);const root=new T.Mesh(g,new T.MeshStandardMaterial());disposeScene(root);assert.equal(disposed,1);
  }
 }
 assert.ok(far/near<.62,`combined triangle ratio ${far/near}`);assert.ok(compressed<6500000,`compressed bytes ${compressed}`);
});
test('LOD decoder rejects truncated/misaligned binary ranges',()=>{
 const header={attributes:{position:{type:'Float32Array',offset:4,length:12,itemSize:3}},index:{type:'Uint32Array',offset:0,length:3}};assert.throws(()=>decodeLodGeometry(header,new ArrayBuffer(8)),/range/);header.attributes.position.offset=1;assert.throws(()=>decodeLodGeometry(header,new ArrayBuffer(200)),/range/);
});
test('Finance Drive medium models keep both courtyard holes, mapped ownership and roof height',async()=>{
 for(const zone of ['finance','commission']){
  const site=CIVIC_SITES.find(s=>s.zone===zone),entry=STATIC_LODS[site.id],{header,buffer}=await asset(entry),root=new T.Group();
  assert.deepEqual(header.sourceIds,site.sourceIds);
  for(const m of header.meshes)root.add(new T.Mesh(decodeLodGeometry(m.geometry,buffer),new T.MeshStandardMaterial({...m.material,side:T.DoubleSide,color:new T.Color().fromArray(m.material.color),emissive:new T.Color().fromArray(m.material.emissive)})));
  root.updateMatrixWorld(true);
  try{assert.ok(entry.triangles/entry.nearTriangles<.2);const bound=new T.Box3().setFromObject(root);assert.ok(bound.max.y>=site.height-.25&&bound.max.y<site.height+1);
   if(zone==='finance')for(const hole of CIVIC_BUILDINGS.find(b=>b.id===16546541).rings.slice(1)){const p=[0,1].map(k=>hole.slice(0,-1).reduce((n,p)=>n+p[k],0)/(hole.length-1)),[x,z]=civicLocal(site,p);assert.equal(new T.Raycaster(new T.Vector3(x,25,z),new T.Vector3(0,-1,0),0,24).intersectObject(root,true).length,0,'open courtyard survives');}
  }finally{disposeScene(root);}
 }
});
test('Villaggio medium exterior retains all tower silhouettes, colours and open undercrofts',async()=>{
 const {header,buffer}=await asset(STATIC_LODS['villaggio-vista']),medium=new T.Group(),near=createVillaggio().group;
 for(const mesh of header.meshes)medium.add(new T.Mesh(decodeLodGeometry(mesh.geometry,buffer),new T.MeshStandardMaterial({...mesh.material,color:new T.Color().fromArray(mesh.material.color),emissive:new T.Color().fromArray(mesh.material.emissive)})));
 try{
  const a=new T.Box3().setFromObject(near),b=new T.Box3().setFromObject(medium);assert.ok(a.min.distanceTo(b.min)<.2);assert.ok(a.max.distanceTo(b.max)<.2);
  const colors=root=>{const out=new Set();root.traverse(o=>{const c=o.geometry?.attributes.color;if(c)for(let i=0;i<c.count;i++)out.add([c.getX(i),c.getY(i),c.getZ(i)].map(v=>v.toFixed(3)).join(','));});return out;};assert.deepEqual(colors(medium),colors(near),'all three patterned palettes survive');
  const angle=VILLAGGIO_ROTATION,point=(x,y,z)=>new T.Vector3(x*Math.cos(angle)+z*Math.sin(angle),y,-x*Math.sin(angle)+z*Math.cos(angle));medium.updateMatrixWorld(true);
  for(const block of VILLAGGIO_BLOCKS){const hits=new T.Raycaster(point(block.x,block.top+5,block.z),new T.Vector3(0,-1,0),0,6).intersectObject(medium,true);assert.ok(hits.length,block.id+' retains its roof at the authored height');}
  const direction=point(1,0,0);assert.equal(new T.Raycaster(point(40,2,-39),direction,0,32).intersectObject(medium,true).length,0);assert.ok(new T.Raycaster(point(40,55,-39),direction,0,32).intersectObject(medium,true).length);
  assert.ok(STATIC_LODS['villaggio-vista'].triangles/STATIC_LODS['villaggio-vista'].nearTriangles<.25);
  assert.ok(STATIC_LODS['villaggio-vista'].vertices/STATIC_LODS['villaggio-vista'].nearVertices<.2);
 }finally{disposeScene(near);disposeScene(medium);}
});
test('reduced civilian bodies retain weighted animation, clothing and close geometry on return',async()=>{
 globalThis.ProgressEvent??=class{constructor(type,data){this.type=type;Object.assign(this,data)}};
 const originalFetch=globalThis.fetch;globalThis.window={};globalThis.fetch=async url=>{const u=new URL(typeof url==='string'||url instanceof URL?url:url.url);if(u.protocol!=='file:')return originalFetch(url);return new Response(await fs.readFile(u),{status:200})};
 try{for(const [sex,icon]of [['Male','👨🏾'],['Female','👩🏾']]){
  const data=JSON.parse(await fs.readFile(new URL(`Superhero_${sex}_FullBody.gltf`,humanBase)));for(const b of data.buffers)b.uri='data:application/octet-stream;base64,'+(await fs.readFile(new URL(b.uri,humanBase))).toString('base64');for(const m of data.materials){delete m.normalTexture;delete m.pbrMetallicRoughness.baseColorTexture;delete m.pbrMetallicRoughness.metallicRoughnessTexture;}delete data.images;delete data.textures;
  const template=prepareHumanTemplate((await new GLTFLoader().parseAsync(JSON.stringify(data),'')).scene);await loadHumanLod(sex);assert.ok(getHumanLod(sex));const actor=createRiggedActor(template,icon),body=actor.group.getObjectsByProperty('isSkinnedMesh',true).find(o=>Array.isArray(o.material)),near=body.geometry;
  actor.setDetail('medium');assert.notEqual(body.geometry,near);assert.equal(body.skeleton.bones.length>40,true);assert.deepEqual(body.material.map(m=>m.name),['skin','shirt','pants','shoes']);assert.deepEqual(body.geometry.groups.map(g=>g.materialIndex),[0,1,2,3]);
  const {skinIndex,skinWeight}=body.geometry.attributes;for(let i=0;i<skinWeight.count;i++){let total=0;for(let j=0;j<4;j++){const at=i*4+j;total+=skinWeight.array[at];assert.ok(skinIndex.array[at]<body.skeleton.bones.length)}assert.ok(Math.abs(total-1)<1e-5)}
  for(const action of [null,'sit','sleep','dance','shower']){for(let n=0;n<30;n++)actor.animate(1+n/30,true,{speed:5.8,action});actor.group.updateMatrixWorld(true);body.skeleton.update();body.computeBoundingBox();const size=body.boundingBox.getSize(new T.Vector3());assert.ok([size.x,size.y,size.z].every(Number.isFinite));assert.ok(Math.max(size.x,size.y,size.z)<3,'no detached weighted spikes');}
  actor.outfit('coastal');assert.equal(body.material[1].color.getHex(),0x517fa1);actor.setDetail('near');assert.equal(body.geometry,near);let disposed=0;getHumanLod(sex).addEventListener('dispose',()=>disposed++);disposeScene(actor.group);assert.equal(disposed,0,'shared reduced mesh survives actor eviction');
 }}finally{delete globalThis.window;globalThis.fetch=originalFetch;}
});

test('static LODs load both gzip and CDN-auto-decoded responses and honour cancellation',async()=>{
 const originalFetch=globalThis.fetch,entry=STATIC_LODS['airport-bound-upper-west'];
 try{for(const decoded of [false,true]){globalThis.fetch=async(url,options)=>{if(options?.signal?.aborted)throw new DOMException('Aborted','AbortError');const name=new URL(url).pathname.split('/').at(-1),file=decoded&&name.endsWith('.gz')?name.slice(0,-3):name;return new Response(await fs.readFile(new URL(file,base)));};const model=await loadStaticLod('airport-bound-upper-west');assert.equal(model.group.children.length,entry.draws);assert.equal(model.group.userData.renderLod,'medium');disposeScene(model.group);}
 const controller=new AbortController();controller.abort();await assert.rejects(loadStaticLod('airport-bound-upper-west',{signal:controller.signal}),/Aborted/);
 }finally{globalThis.fetch=originalFetch;}
});
