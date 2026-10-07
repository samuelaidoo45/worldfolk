// Keep Mapbox Standard's native buildings and landmarks. Streets footprints are
// loaded only for collision/navigation; no invented heights, facades or roofs.
export const BUILDING_LAYER='accralife-real-buildings';
export function installRealBuildings(map){
  if(!map.getSource('accralife-streets'))map.addSource('accralife-streets',{type:'vector',url:'mapbox://mapbox.mapbox-streets-v8'});
  // A hidden collision layer keeps building tiles loaded without drawing over Standard.
  if(!map.getLayer('accralife-collision-footprints'))map.addLayer({id:'accralife-collision-footprints',type:'fill',source:'accralife-streets','source-layer':'building',slot:'bottom',paint:{'fill-opacity':0}});
  map.setConfigProperty?.('basemap','show3dBuildings',true);
  map.setConfigProperty?.('basemap','show3dFacades',true);
  map.setConfigProperty?.('basemap','show3dLandmarks',true);
}
export function createArchitecture(){return {details:[],update(){}}}
