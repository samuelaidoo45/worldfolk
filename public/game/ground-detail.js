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
  map.addImage('worldfolk-'+kind,{width:size,height:size,data:pixels});
 }
 map.addLayer({id:'worldfolk-ground-texture',type:'fill',source:'accralife-streets','source-layer':'landuse',minzoom:17,paint:{'fill-pattern':['match',['get','class'],['parking','commercial'],'worldfolk-paving',['grass','park','garden','wood','pitch'],'worldfolk-grass','worldfolk-earth'],'fill-opacity':.65}},'worldfolk-water');
 const road=map.getStyle().layers.find(layer=>layer.id==='worldfolk-roads');
 if(road)map.addLayer({id:'worldfolk-asphalt-texture',type:'line',source:road.source,'source-layer':road['source-layer'],minzoom:17,layout:road.layout,filter:['all',road.filter,['!=',['get','surface'],'unpaved']],paint:{'line-pattern':'worldfolk-asphalt','line-width':road.paint['line-width'],'line-opacity':.4}},'worldfolk-road-labels');
}
