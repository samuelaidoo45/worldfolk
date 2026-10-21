import {createCastleAsomdwe} from '../../public/game/castle-asomdwe.js';
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import * as T from '../../public/game/three.module.js';
import {GLTFLoader} from '../../public/game/humanoid-loader.js';
import {prepareHumanTemplate} from '../../public/game/human-character.js';
import {disposeScene} from '../../public/game/render-utils.js';
import {SKY_SITES} from '../../public/game/senchi-skyline-data.js';
import {BOUND_SITES} from '../../public/game/airport-bound-data.js';
import {AREA_SITES} from '../../public/game/mahama-neighbourhood-data.js';
import {POLO_SITES} from '../../public/game/polo-senchi-data.js';
import {MAHAMA_SITES} from '../../public/game/mahama-bypass-data.js';
import {CITY_LANDMARKS,createCityLandmark} from '../../public/game/city-landmarks.js';
import {createCivicNeighbourhood} from '../../public/game/independence-neighbourhood.js';
import {createVillaggio} from '../../public/game/villaggio.js';
import {BUSINESS_SITES} from '../../public/game/airport-business-data.js';
import {AIRPORT_CITY_SITES} from '../../public/game/airport-city-data.js';
import {KOFI_SITES} from '../../public/game/kofi-annan-data.js';
import {modelCost} from '../../public/game/world-streaming.js';
import {simplifyGeometry,packGeometry,removeSubpixelComponents} from './lod-geometry.mjs';
globalThis.ProgressEvent??=class{constructor(type,data){this.type=type;Object.assign(this,data)}};
const output=new URL('../../public/game/assets/lods/',import.meta.url),humanBase=new URL('../../public/game/assets/humans/',import.meta.url),hash=b=>createHash('sha256').update(b).digest('hex');await fs.mkdir(output,{recursive:true});
const manifest={version:1,generator:'meshoptimizer 1.1.1; attribute-aware offline simplification',date:'2026-10-21',static:{},humans:{}};
async function write(id,header,chunks){const bin=Buffer.concat(chunks),compressed=gzipSync(bin,{level:9});await fs.writeFile(new URL(id+'.bin.gz',output),compressed);await fs.writeFile(new URL(id+'.bin',output),bin);await fs.writeFile(new URL(id+'.json',output),JSON.stringify({...header,binary:id+'.bin',bytes:bin.length,sha256:hash(bin)})+'\n');return {json:id+'.json',binary:id+'.bin',compressed:id+'.bin.gz',compressedBytes:compressed.length,bytes:bin.length,sha256:hash(bin)};}
for(const sex of ['Male','Female']){
 const raw=await fs.readFile(new URL(`Superhero_${sex}_FullBody.gltf`,humanBase)),data=JSON.parse(raw);for(const buffer of data.buffers)buffer.uri='data:application/octet-stream;base64,'+(await fs.readFile(new URL(buffer.uri,humanBase))).toString('base64');
 for(const m of data.materials){delete m.normalTexture;delete m.pbrMetallicRoughness?.baseColorTexture;delete m.pbrMetallicRoughness?.metallicRoughnessTexture;}delete data.images;delete data.textures;
 const scene=prepareHumanTemplate((await new GLTFLoader().parseAsync(JSON.stringify(data),'')).scene);let body;scene.traverse(o=>{if(o.isSkinnedMesh&&Array.isArray(o.material))body=o;});
 const {geometry,errors}=await simplifyGeometry(body.geometry,{ratio:.25,error:.008,skinned:true}),chunks=[],packed=packGeometry(geometry,chunks),nearTriangles=body.geometry.attributes.position.count/3,triangles=geometry.index.count/3;
 manifest.humans[sex]={...await write('human-'+sex.toLowerCase(),{kind:'skinned-civilian-body',sex,geometry:packed,sourceGltfSha256:hash(raw),errors},chunks),nearTriangles,triangles,vertices:geometry.attributes.position.count};console.log('human',sex,nearTriangles,'->',triangles);disposeScene(scene);geometry.dispose();
}
// These updates only animate pool materials (or are no-ops). Freeze them at
// distance; moving vehicles and other genuinely dynamic packages stay authored.
const staticSnapshots=new Set(['villaggio-vista','the-signature','the-gallery',...BUSINESS_SITES.map(s=>s.id),...AIRPORT_CITY_SITES.map(s=>s.id),...KOFI_SITES.map(s=>s.id),...POLO_SITES.map(s=>s.id)]);
const sites=[...new Map([...SKY_SITES,...BOUND_SITES,...AREA_SITES,...POLO_SITES,...MAHAMA_SITES,...CITY_LANDMARKS.filter(s=>s.height>=25||['independence-finance','independence-commission','independence-club','asomdwe-park'].includes(s.id))].map(s=>[s.id,s])).values()];
for(const site of sites){
 const result=createCityLandmark(site);if(result.update&&!staticSnapshots.has(site.id)){console.log('Keep authored dynamic model:',site.id);disposeScene(result.group);continue;}const nearCost=modelCost(result.group);let before=0;result.group.traverse(o=>{if(o.isMesh)before+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});
 const root=site.id==='asomdwe-park'?createCastleAsomdwe(site,{detail:'medium'}).group:['independence-finance','independence-commission','independence-club'].includes(site.id)?createCivicNeighbourhood(site,{detail:'medium'}).group:site.id==='villaggio-vista'?createVillaggio({detail:'medium'}).group:result.group;if(root!==result.group)disposeScene(result.group);
 root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert(),meshes=[],chunks=[];let after=0,vertices=0;
 const nodes=[];root.traverse(o=>{if(o.isMesh){if(o.isSkinnedMesh||o.isInstancedMesh||Array.isArray(o.material)||o.userData.dynamic)throw Error('Unsupported dynamic mesh: '+site.id);nodes.push(o);}});
 for(const mesh of nodes){
  const input=mesh.geometry.clone().applyMatrix4(inverse.clone().multiply(mesh.matrixWorld)),filtered=removeSubpixelComponents(input),{geometry}=await simplifyGeometry(filtered,{ratio:.18,error:.12}),material=mesh.material;delete geometry.attributes.uv;
  after+=geometry.index.count/3;vertices+=geometry.attributes.position.count;
  if(geometry.index.count){const color=material.color?.toArray()||[1,1,1];meshes.push({geometry:packGeometry(geometry,chunks),material:{color,roughness:material.roughness??.9,metalness:material.metalness??0,opacity:material.opacity,transparent:material.transparent,side:material.side,depthWrite:material.depthWrite,vertexColors:material.vertexColors,emissive:material.emissive?.toArray(),emissiveIntensity:material.emissiveIntensity},castShadow:false,receiveShadow:mesh.receiveShadow});}input.dispose();filtered.dispose();geometry.dispose();
 }
 manifest.static[site.id]={...await write(site.id,{kind:'static-exterior-medium',id:site.id,sourceIds:site.sourceIds||[],meshes},chunks),nearTriangles:before,nearVertices:nearCost.vertices,nearDraws:nearCost.draws,triangles:after,vertices,draws:meshes.length};console.log(site.id,before,'->',after);disposeScene(root);
}
manifest.sourceFiles={};for(const file of ['scripts/assets/lod-geometry.mjs','scripts/assets/build-render-lods.mjs',...['human-garments','human-character','graphics-materials','pbr-materials','render-utils','city-landmarks','world-streaming','motion','popular-landmarks','popular-landmarks-data','coastal-precinct','coastal-precinct-data','coastal-precinct-map','castle-asomdwe','castle-asomdwe-data','castle-asomdwe-map','castle-asomdwe-layout','finance-frontages','finance-frontage-data','finance-frontage-map','independence-neighbourhood','independence-neighbourhood-data','independence-neighbourhood-map','independence-public-spaces','independence-public-space-data','independence-public-space-map','independence-precinct','precinct-navigation',...['villaggio','signature','gallery','airport-business','airport-city','kofi-annan'].flatMap(n=>[n,n+'-data']),...['senchi-skyline','airport-bound','mahama-neighbourhood','mahama-bypass','polo-senchi'].flatMap(n=>[n,n+'-data',n+'-map'])].map(n=>'public/game/'+n+'.js'),...['Male','Female'].flatMap(sex=>['gltf','bin'].map(ext=>'public/game/assets/humans/Superhero_'+sex+'_FullBody.'+ext))])manifest.sourceFiles[file]=hash(await fs.readFile(new URL('../../'+file,import.meta.url)));
await fs.writeFile(new URL('manifest.json',output),JSON.stringify(manifest,null,2)+'\n');
await fs.writeFile(new URL('../../public/game/lod-catalog.js',import.meta.url),'// Generated by scripts/assets/build-render-lods.mjs; geometry is authored, not photographic.\nexport const STATIC_LODS='+JSON.stringify(manifest.static)+';\nexport const HUMAN_LODS='+JSON.stringify(manifest.humans)+';\n');
await fs.copyFile(new URL('../../node_modules/meshoptimizer/LICENSE.md',import.meta.url),new URL('MESHOPTIMIZER-LICENSE.txt',output));
console.log('Built',Object.keys(manifest.static).length,'static LODs and two civilian body LODs');
