// Small, locally generated surface maps add paving joints and aggregate without
// downloading imagery or replacing the mapped land-use colours.
export function installGroundDetail(map){
 const size=128;
 for(const kind of ['paving','earth']){
  const pixels=new Uint8Array(size*size*4);let seed=824;
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;const i=(y*size+x)*4,joint=kind==='paving'&&(y%32===0||(x+(Math.floor(y/32)%2)*32)%64===0),tone=seed%2?255:0;
   pixels[i]=pixels[i+1]=pixels[i+2]=joint?40:tone;pixels[i+3]=joint?52:kind==='paving'?seed%13:seed%22;
  }
  map.addImage('worldfolk-'+kind,{width:size,height:size,data:pixels});
 }
 map.addLayer({id:'worldfolk-ground-texture',type:'fill',source:'accralife-streets','source-layer':'landuse',minzoom:17,paint:{'fill-pattern':['match',['get','class'],['parking','residential','commercial','industrial'],'worldfolk-paving','worldfolk-earth'],'fill-opacity':.65}},'worldfolk-water');
}
