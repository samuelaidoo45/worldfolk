import * as THREE from './three.module.js';
import {applyPbrSurface,reflectionSky} from './pbr-materials.js';

// Small, deterministic textures are shared by every district and interior. They
// add surface detail without network requests or one texture allocation per mesh.
const cache=new Map();
export function surfaceTexture(kind){
 if(cache.has(kind))return cache.get(kind);
 const size=128,data=new Uint8Array(size*size*4);let seed=971;
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  seed=(Math.imul(seed,1664525)+1013904223)>>>0;
  const grain=(seed>>>24)/255-.5;let v=210+grain*22;
  if(kind==='paving')v=(x<1||y<1?150:218)+grain*15+Math.sin(x*.034+y*.027)*9;
  if(kind==='fabric')v=200+grain*12+((x%4<2)===(y%4<2)?15:-15);
  if(kind==='wood')v=204+Math.sin(x*.42+Math.sin(y*.06)*1.5)*16+Math.sin(x*1.2+y*.012)*6+grain*9;
  if(kind==='stone')v=218+Math.sin(x*.07+Math.sin(y*.06))*6+grain*14;
  if(kind==='rubber')v=191+grain*15+(x%16<2?-15:0);
  if(kind==='metal')v=224+Math.sin(y*2)*6+grain*4;
  if(kind==='skin')v=226+grain*7;
  const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=Math.round(v);data[i+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);
 texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.anisotropy=4;texture.needsUpdate=true;texture.userData.shared=true;texture.name=`worldfolk-${kind}`;cache.set(kind,texture);return texture;
}
export function tagSurface(material,kind){material.userData.surface=kind;return material}
export function enhanceMaterials(root){
 const seen=new Set();root.traverse(object=>{
  const source=object.material,old=object.geometry,kind=source?.userData?.surface;
  if(old?.type==='BoxGeometry'&&['fabric','wood'].includes(kind)&&!old.userData.finished){
   const {width:w,height:h,depth:d}=old.parameters;
   if(Math.min(w,h,d)>.08&&Math.max(w,h,d)<6){
    const r=Math.min(.035,Math.min(w,h,d)*.16),shape=new THREE.Shape();shape.moveTo(0,0);shape.lineTo(w-2*r,0);shape.lineTo(w-2*r,h-2*r);shape.lineTo(0,h-2*r);shape.closePath();
    const geometry=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,steps:1,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2});geometry.translate(-w/2+r,-h/2+r,-d/2+r);geometry.userData.finished=true;object.geometry=geometry;if(!old.userData.shared)old.dispose();
   }
  }

  for(const material of Array.isArray(object.material)?object.material:object.material?[object.material]:[]){
   if(seen.has(material)||!material.isMeshStandardMaterial||material.userData.graphicsEnhanced)continue;
   seen.add(material);material.userData.graphicsEnhanced=true;
   const kind=material.userData.surface||(material.roughness<.35?'smooth':material.metalness>.3?'metal':'plaster');
   material.envMapIntensity=kind==='glass'?1.15:kind==='paint'?.8:.35;
   if(applyPbrSurface(material,kind))continue;
   // Keep authored signs, facade windows, floor patterns and foliage intact.
   if(!['glass','smooth','paint','foliage'].includes(kind)&&!material.bumpMap){material.bumpMap=surfaceTexture(kind);material.bumpScale=kind==='skin'?.0009:kind==='wood'?.018:kind==='fabric'?.006:.009;}
   if(!material.map&&['fabric','wood','stone','rubber','plaster'].includes(kind))material.map=surfaceTexture(kind);
   if(material.map)material.map.anisotropy=4;
   material.needsUpdate=true;
  }
 });return root;
}
const environments=new Map();let shadow;
export function cityEnvironment(preset='day',{photographic=true}={}){
 if(photographic&&preset==='day'&&reflectionSky())return reflectionSky();
 const key=preset==='night'?'night':['dawn','dusk'].includes(preset)?'golden':'day';if(environments.has(key))return environments.get(key);
 const w=256,h=128,data=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const sky=y<h/2,t=sky?y/(h/2):(y-h/2)/(h/2),a=sky?[92,140,192]:[157,155,139],b=sky?[207,224,235]:[64,73,64];
  const cloud=sky?Math.max(0,Math.sin(x*.049+Math.sin(y*.14))*Math.sin(y*.065))*22:0;
  const sun=Math.exp(-((x-w*.73)**2/90+(y-h*.3)**2/40))*100,i=(y*w+x)*4;
  for(let c=0;c<3;c++){const tone=a[c]*(1-t)+b[c]*t+cloud+sun;data[i+c]=Math.min(255,tone*(key==='night'?[.17,.23,.36][c]:key==='golden'?[1,.78,.58][c]:1));}data[i+3]=255;
 }
 const environment=new THREE.DataTexture(data,w,h,THREE.RGBAFormat);environment.mapping=THREE.EquirectangularReflectionMapping;environment.colorSpace=THREE.SRGBColorSpace;environment.magFilter=environment.minFilter=THREE.LinearFilter;environment.needsUpdate=true;environment.userData.shared=true;environments.set(key,environment);return environment;
}
export function contactShadow(){
 if(shadow)return shadow;
 const size=64,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const r=Math.hypot((x+ .5-size/2)/(size/2),(y+.5-size/2)/(size/2)),i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=255;data[i+3]=Math.round(Math.max(0,1-r)**2*255)}
 shadow=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);shadow.magFilter=shadow.minFilter=THREE.LinearFilter;shadow.needsUpdate=true;shadow.userData.shared=true;return shadow;
}
