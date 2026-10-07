export const BUILDING_LAYER='accralife-real-buildings';
const SOURCE='accralife-streets';

// Mapbox Streets v8 records building footprints and heights in metres. Keep
// the recorded height when present, with a one-storey fallback for gaps.
export function installRealBuildings(map){
  if(map.getLayer(BUILDING_LAYER))return;
  if(!map.getSource(SOURCE))map.addSource(SOURCE,{type:'vector',url:'mapbox://mapbox.mapbox-streets-v8'});
  map.addLayer({
    id:BUILDING_LAYER,type:'fill-extrusion',source:SOURCE,'source-layer':'building',slot:'middle',minzoom:14,
    filter:['==',['get','extrude'],'true'],
    layout:{'fill-extrusion-edge-radius':.12},
    paint:{
      'fill-extrusion-height':['max',4.5,['to-number',['get','height'],4.5]],
      'fill-extrusion-base':['to-number',['get','min_height'],0],
      'fill-extrusion-color':['match',['get','type'],'residential','#cfbda4','commercial','#b7b6b1','hotel','#bec3c1','school','#cbb89b','#c9b9a4'],
      'fill-extrusion-vertical-gradient':true,
      'fill-extrusion-ambient-occlusion-intensity':.3,
      'fill-extrusion-cast-shadows':true,
      'fill-extrusion-opacity':.98,
    },
  });
}
