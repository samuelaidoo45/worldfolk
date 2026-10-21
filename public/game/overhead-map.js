import {ANNEX_RING,ANNEX_GATES,annexPoint} from './airport-annex-data.js';
import {T3_WORKS_RING} from './airport-access-data.js';
import {placeLogoExpression} from './place-logos.js';
import {placeCategory} from './place-icons.js';
const knownCategories={home:'home',square:'museum',nkrumah:'park',jamestown:'museum',makola:'market',osu:'food',labadi:'beach',arts:'museum',theatre:'cinema',dubois:'museum',mall:'mall',airport:'office',eastlegon:'park',legon:'school',kaneshie:'market'};
const source='accralife-streets',placeFilters=new WeakMap(),mapModes=new WeakMap();
export function setOverheadPlacesMode(map,enabled){mapModes.set(map,enabled);if(map.getLayer('worldfolk-poi-labels'))map.setFilter?.('worldfolk-poi-labels',enabled?(placeFilters.get(map)||null):null)}
// Mapped roof colour wins; the fallback palette distinguishes building uses.
export const overheadRoofColor=['to-color',['get','roof:colour'],['match',['get','class'],['commercial','office','retail'],'#91a6ab',['church','mosque','school','university'],'#c4aa7b',['industrial','warehouse'],'#a4acb1',['house','residential','apartments'],'#c29981','#b5aaa0']];
export function installOverheadMap(map){
 if(!map.getSource('worldfolk-airport-works'))map.addSource('worldfolk-airport-works',{type:'geojson',data:{type:'FeatureCollection',features:[{type:'Feature',properties:{name:'Former T3 car park · closed'},geometry:{type:'Polygon',coordinates:[T3_WORKS_RING]}}]}});
 if(!map.getLayer('worldfolk-airport-works-fill'))map.addLayer({id:'worldfolk-airport-works-fill',source:'worldfolk-airport-works',type:'fill',paint:{'fill-color':'#b29565','fill-opacity':.8}});
 if(!map.getLayer('worldfolk-airport-works-edge'))map.addLayer({id:'worldfolk-airport-works-edge',source:'worldfolk-airport-works',type:'line',paint:{'line-color':'#614d32','line-width':2,'line-dasharray':[3,2]}});

 if(!map.getSource('worldfolk-airport-annex'))map.addSource('worldfolk-airport-annex',{type:'geojson',data:{type:'FeatureCollection',features:[{type:'Feature',properties:{name:'Terminal 3 parking annex'},geometry:{type:'Polygon',coordinates:[ANNEX_RING]}}]}});
 if(!map.getLayer('worldfolk-airport-annex-fill'))map.addLayer({id:'worldfolk-airport-annex-fill',source:'worldfolk-airport-annex',type:'fill',paint:{'fill-color':'#626d70','fill-opacity':.95}});
 if(!map.getSource('worldfolk-airport-annex-links'))map.addSource('worldfolk-airport-annex-links',{type:'geojson',data:{type:'FeatureCollection',features:ANNEX_GATES.map(g=>({type:'Feature',properties:{},geometry:{type:'LineString',coordinates:[annexPoint(g.x,g.z),g.connection]}}))}});
 if(!map.getLayer('worldfolk-airport-annex-links'))map.addLayer({id:'worldfolk-airport-annex-links',source:'worldfolk-airport-annex-links',type:'line',paint:{'line-color':'#626d70','line-width':5}});
 const add=(layer,before)=>{if(!map.getLayer(layer.id))map.addLayer(layer,before)};
 add({id:'worldfolk-overhead-shadow',type:'fill',source,'source-layer':'building',minzoom:14,layout:{visibility:'none'},paint:{'fill-color':'#5d6867','fill-opacity':.2,'fill-translate':[2,3],'fill-translate-anchor':'viewport'}},'worldfolk-road-casing');
 add({id:'worldfolk-overhead-buildings',type:'fill',source,'source-layer':'building',minzoom:14,layout:{visibility:'none'},paint:{'fill-color':overheadRoofColor,'fill-outline-color':'#968f85','fill-opacity':1}},'worldfolk-road-casing');
 add({id:'worldfolk-overhead-markings',type:'line',source,'source-layer':'road',minzoom:17,layout:{visibility:'none','line-cap':'butt'},filter:['all',['in',['get','class'],['literal',['motorway','trunk','primary','secondary','tertiary']]],['!=',['get','surface'],'unpaved']],paint:{'line-color':'#f8edc9','line-width':.8,'line-dasharray':[3,7],'line-opacity':.65}},'worldfolk-road-labels');
 if(!map.getSource('worldfolk-map-places'))map.addSource('worldfolk-map-places',{type:'geojson',data:{type:'FeatureCollection',features:[]}});
 add({id:'worldfolk-map-places',type:'symbol',source:'worldfolk-map-places',minzoom:13,layout:{visibility:'none','icon-image':placeLogoExpression(['get','icon']),'icon-size':['interpolate',['linear'],['zoom'],13,.75,17,.95],'icon-padding':12,'text-field':['get','name'],'text-font':['Noto Sans Regular'],'text-size':12,'text-offset':[0,1.7],'text-anchor':'top','text-max-width':10,'text-padding':8,'text-optional':true,'symbol-sort-key':['get','priority']},paint:{'text-color':'#203d43','text-halo-color':'#ffffff','text-halo-width':2}},'worldfolk-poi-labels');
}
export function updateOverheadPlaces(map,places,selected){
 if(!map.getSource('worldfolk-map-places'))return;
 const unique=new Map();for(const p of [...places,...(selected?[selected]:[])])if(Number.isFinite(p.lng)&&Number.isFinite(p.lat))unique.set(p.id,p);
 const items=[...unique.values()];map.getSource('worldfolk-map-places').setData({type:'FeatureCollection',features:items.map(p=>({type:'Feature',properties:{placeId:p.id,name:p.name,icon:`place-${knownCategories[p.id]||placeCategory(p)}`,priority:p.id===selected?.id?0:p.id==='home'?1:2},geometry:{type:'Point',coordinates:[p.lng,p.lat]}}))});
 // The curated marker and the OSM marker often refer to the same place.
 const names=[...new Set(items.map(p=>p.name.toLowerCase()))];
 placeFilters.set(map,['!', ['in',['downcase',['coalesce',['get','name'],'']],['literal',names]]]);setOverheadPlacesMode(map,!!mapModes.get(map));
}
