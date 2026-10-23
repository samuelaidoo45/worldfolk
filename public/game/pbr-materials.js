import * as THREE from './three.module.js';

// One shared pack for all districts. Lazy loading never blocks entry/movement.
// Texture identity stays stable while its image upgrades from a neutral pixel.
export const PBR_SURFACES=Object.freeze({
 plaster:{family:'plaster',metres:2,normal:.24,ao:.12},
 stone:{family:'concrete',metres:2,normal:.35,ao:.18},
 paving:{family:'concrete',metres:2,normal:.4,ao:.18},
 asphalt:{family:'asphalt',metres:3,normal:.55,ao:.15},
});
const textures=new Map(),pending=new Set(),listeners=new Set();
let sky=null,skyPromise=null;
export function onPbrReady(listener){listeners.add(listener);return()=>listeners.delete(listener)}
function changed(){for(const listener of listeners)listener()}
function sharedTexture(family,channel){
 const key=family+'-'+channel;if(textures.has(key))return textures.get(key);
 const rgb=channel==='normal'?[128,128,255,255]:[255,255,255,255];
 const texture=new THREE.DataTexture(new Uint8Array(rgb),1,1);texture.name='worldfolk-pbr-'+key;
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.anisotropy=4;
 texture.colorSpace=channel==='color'?THREE.SRGBColorSpace:THREE.NoColorSpace;texture.userData.shared=true;texture.needsUpdate=true;textures.set(key,texture);
 // Node geometry tests can use the same materials without a DOM or requests.
 if(typeof document!=='undefined'&&(typeof WorkerGlobalScope==='undefined'||!(globalThis instanceof WorkerGlobalScope))){
  const job=new THREE.ImageLoader().loadAsync(new URL(`./assets/materials/${key}.webp`,import.meta.url).href).then(image=>{
   const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const context=canvas.getContext('2d');context.drawImage(image,0,0);
   texture.image={data:new Uint8Array(context.getImageData(0,0,image.width,image.height).data),width:image.width,height:image.height};texture.flipY=true;texture.needsUpdate=true;changed();
  }).catch(()=>{texture.userData.loadFailed=true;changed()}).finally(()=>pending.delete(job));pending.add(job);
 }
 return texture;
}
export function applyPbrSurface(material,kind){
 const spec=PBR_SURFACES[kind];if(!spec||material.userData.pbrSurface)return false;
 // Authored window sheets, roof patterns, art and loaded glTF textures stay intact.
 if(material.map&&!material.map.name.startsWith('worldfolk-'))return false;
 material.map=sharedTexture(spec.family,'color');material.normalMap=sharedTexture(spec.family,'normal');material.normalScale.set(spec.normal,spec.normal);
 material.roughnessMap=sharedTexture(spec.family,'orm');material.aoMap=material.roughnessMap;material.aoMapIntensity=spec.ao;material.roughness=1;material.bumpMap=null;
 material.userData.pbrSurface=kind;material.userData.textureMetres=spec.metres;material.needsUpdate=true;return true;
}

// Project each static triangle in metres after its local transform is baked.
// Replaces primitive 0..1 UVs, so a 40 m wall does not stretch one 2 m tile.
// Group-local space keeps texture detail fixed when the floating origin moves.
export function projectSurfaceUV(geometry,metres){
 if(!(metres>0)||!Number.isFinite(metres))return geometry;
 const p=geometry.getAttribute('position'),normal=geometry.getAttribute('normal');if(!p||!normal)return geometry;
 const uv=new Float32Array(p.count*2);
 for(let i=0;i<p.count;i+=3){
  const nx=Math.abs(normal.getX(i)),ny=Math.abs(normal.getY(i)),nz=Math.abs(normal.getZ(i)),axis=ny>=nx&&ny>=nz?'y':nx>=nz?'x':'z';
  for(let j=i;j<Math.min(i+3,p.count);j++){uv[j*2]=(axis==='x'?p.getZ(j):p.getX(j))/metres;uv[j*2+1]=(axis==='y'?p.getZ(j):p.getY(j))/metres;}
 }
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));return geometry;
}
export async function loadReflectionSky(){
 if(sky)return sky;if(typeof document==='undefined')return null;
 if(!skyPromise)skyPromise=import('./rgbe-loader.js').then(({RGBELoader})=>new RGBELoader().loadAsync(new URL('./assets/materials/day-sky.hdr',import.meta.url).href)).then(texture=>{
  texture.mapping=THREE.EquirectangularReflectionMapping;texture.userData.shared=true;texture.name='worldfolk-reflection-sky';sky=texture;changed();return texture;
 }).catch(()=>null);
 return skyPromise;
}
export function reflectionSky(){return sky}
export function pbrAssetState(){return {textures:textures.size,loaded:[...textures.values()].filter(t=>t.image.width>1).length,failed:[...textures.values()].filter(t=>t.userData.loadFailed).length,skyReady:!!sky}}
export async function settlePbrTextures(){await Promise.all([...pending])}
