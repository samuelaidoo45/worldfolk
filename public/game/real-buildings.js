import {buildingDesign,buildingDistance} from './building-design.js';
import {createRoadGeometry} from './road-geometry.js';
import {distanceMetres} from './motion.js';
import {lineMayBeNear} from './road-proximity.js';
export const BUILDING_LAYER='accralife-real-buildings';
export function installRealBuildings(map){
 if(!map.getSource('accralife-streets'))throw new Error('OpenStreetMap tiles are not configured');
 if(!map.getLayer('accralife-collision-footprints'))map.addLayer({id:'accralife-collision-footprints',type:'fill',source:'accralife-streets','source-layer':'building',paint:{'fill-opacity':0}});
 if(!map.getLayer(BUILDING_LAYER))map.addLayer({id:BUILDING_LAYER,type:'fill-extrusion',source:'accralife-streets','source-layer':'building',minzoom:14,filter:['!=',['get','extrude'],'false'],paint:{'fill-extrusion-color':['match',['get','class'],['commercial','office'],'#b5c1c5',['house','residential','apartments'],'#cfc2ac',['church','mosque'],'#e3d9c5','#c5baa8'],'fill-extrusion-height':['case',['boolean',['feature-state','detailed'],false],0,['>', ['coalesce',['get','height'],0],0],['max',3,['get','height']],5],'fill-extrusion-base':['case',['boolean',['feature-state','detailed'],false],0,['coalesce',['get','min_height'],0]],'fill-extrusion-opacity':1}},'worldfolk-road-labels');
 // Street-width strokes follow the real road centre lines. Native labels remain above them.
 const width=['interpolate',['exponential',2],['zoom'],15,2.4,18,19.2,21,153.6,24,1228.8];
 const roadFilter=['all',['in',['get','class'],['literal',['motorway','trunk','primary','secondary','tertiary','street','street_limited','service']]],['!=',['get','structure'],'tunnel']];
 const roadGeometry=createRoadGeometry(map);
 map.addLayer({id:'worldfolk-road-markings',type:'line',source:'accralife-streets','source-layer':'road',minzoom:17,filter:['all',roadFilter,['!=',['get','surface'],'unpaved'],['in',['get','class'],['literal',['motorway','trunk','primary','secondary','tertiary','street','street_limited']]]],paint:{'line-color':'#fff8df','line-width':['interpolate',['exponential',2],['zoom'],17,.6,21,3,24,24],'line-dasharray':[4,5],'line-opacity':1}},'worldfolk-road-labels');
 return roadGeometry;
}
// Facade detailing is procedural; footprints and available heights come from the self-hosted OpenStreetMap extract.
export function createArchitecture(map, getPlaces = () => []) {
  let details = [], last = 0, origin = null, dirty = true;
  map.on?.('sourcedata', event => { if (event.sourceId === 'accralife-streets') dirty = true; });
  return {
    get details() { return details; },
    update(position) {
      if (Date.now() - last < 1500 || !dirty && origin && distanceMetres(origin, position) < 25 && details.length) return;
      last = Date.now(); dirty = false; origin = [...position];
      let features;
      try { features = map.querySourceFeatures('accralife-streets', {sourceLayer: 'building'}); }
      catch { return; }
      const found = new Map(), places = getPlaces();
      for (const feature of features) {
        if (Number(feature.properties?.min_height) > 0 || String(feature.properties?.extrude) === 'false') continue;
        const polygons = feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.type === 'MultiPolygon' ? feature.geometry.coordinates : [];
        for (const rings of polygons) {
          const ring = rings[0];
          if (!ring || ring.length < 4 || !rings.some(r => lineMayBeNear(position, r, 650))) continue;
          const distance = buildingDistance(position, {rings});
          if (distance > 650) continue;
          const id = ring.map(p => p.map(v => v.toFixed(6)).join(',')).join(';');
          if (found.has(id)) continue;
          found.set(id, {id, sourceId: feature.id, rings, distance, feature});
        }
      }
      // Match the existing closest-footprint selection before spending time on
      // place matching/material design. Discarded buildings keep their map shell.
      details = [...found.values()].sort((a, b) => a.distance - b.distance)
        .slice(0, matchMedia('(pointer:coarse)').matches ? 100 : 190)
        .map(({id, sourceId, rings, distance, feature}) => {
          const ring = rings[0];
          const center = ring.slice(0, -1).reduce((a, p) => [a[0] + p[0] / (ring.length - 1), a[1] + p[1] / (ring.length - 1)], [0, 0]);
          const design = buildingDesign({id: feature.id, geometry: {type: 'Polygon', coordinates: rings}, properties: feature.properties}, places);
          return {id, sourceId, position: center, rings, height: design.height, seed: design.seed, distance, style: design.style, design};
        });
    },
  };
}
