import {surfaceClass,unpavedRoad} from './surface-style.js';
// The optional photographic aggregate is local CC0 material detail, not map
// imagery. Keep the procedural pattern if a browser/asset cannot decode it.
function upgradePattern(map,kind,family){
 if(typeof document==='undefined'||!map.updateImage)return;
 const image=new Image();image.onload=()=>{
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const context=canvas.getContext('2d');context.drawImage(image,0,0,128,128);const data=context.getImageData(0,0,128,128);
  for(let i=0;i<data.data.length;i+=4){const grain=data.data[i]-225;data.data[i]=data.data[i+1]=data.data[i+2]=grain<0?32:230;data.data[i+3]=Math.min(105,Math.abs(grain)*4);}
  if(map.hasImage('worldfolk-'+kind)){map.updateImage('worldfolk-'+kind,{width:128,height:128,data:data.data});map.triggerRepaint();}
 };image.src=new URL(`./assets/materials/${family}-color.webp`,import.meta.url).href;
}
// Locally generated aggregate, grass and paving retain mapped surface classes.
export function installGroundDetail(map){
 const size=128;
 for(const kind of ['paving','earth','asphalt','grass']){
  const pixels=new Uint8Array(size*size*4);let seed=824;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;const i=(y*size+x)*4,joint=kind==='paving'&&(y%32<2||(x+(Math.floor(y/32)%2)*32)%64<2),tone=seed%2?175:45;
   pixels[i]=pixels[i+1]=pixels[i+2]=joint?40:tone;
   pixels[i+3]=joint?75:kind==='paving'?seed%20:kind==='asphalt'?seed%55:seed%32;
   if(kind==='grass'){pixels[i]=seed%2?132:49;pixels[i+1]=seed%2?155:77;pixels[i+2]=seed%2?100:36;}
  }
  if(!map.hasImage('worldfolk-'+kind))map.addImage('worldfolk-'+kind,{width:size,height:size,data:pixels});
  if(kind==='paving'||kind==='asphalt')upgradePattern(map,kind,kind==='paving'?'concrete':'asphalt');
 }
 map.addLayer({id:'worldfolk-ground-texture',type:'fill',source:'accralife-streets','source-layer':'landuse',minzoom:17,paint:{'fill-pattern':['match',surfaceClass,'paving','worldfolk-paving','grass','worldfolk-grass','worldfolk-earth'],'fill-opacity':['case',['==',surfaceClass,'unknown'],0,.45]}},'worldfolk-water');
 const road=map.getStyle().layers.find(layer=>layer.id==='worldfolk-roads');
 if(road)map.addLayer({id:'worldfolk-asphalt-texture',type:'line',source:road.source,'source-layer':road['source-layer'],minzoom:17,layout:road.layout,filter:['all',road.filter,['!',unpavedRoad]],paint:{'line-pattern':'worldfolk-asphalt','line-width':road.paint['line-width'],'line-opacity':.4}},'worldfolk-road-labels');
}
