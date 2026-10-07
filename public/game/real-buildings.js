import {buildingStyle} from './districts.js';
import {distanceMetres} from './motion.js';
export const BUILDING_LAYER='accralife-real-buildings';
const SOURCE='accralife-streets';
const ROOF_LAYER='accralife-roofs';
const palettes={plaster:['#d5c6ab','#f4eddd','#315b6e'],pastel:['#b1c8c8','#f9e7cf','#375e5b'],brick:['#a65e43','#d0af81','#374d54'],veranda:['#e0b97c','#fcf0cb','#416b67'],apartment:['#abb8be','#e9ece7','#395e79'],market:['#d59344','#4b5350','#394542'],shop:['#b8544a','#f4d49b','#173f4c'],coastal:['#dfebdf','#ffffff','#40a3b6'],heritage:['#d78f6c','#f8dac0','#3f7977'],glass:['#397e97','#a7c4c9','#245169'],office:['#bdc6c7','#3d535e','#3b7e99'],school:['#d2b086','#f3ddaf','#56775f'],church:['#a19080','#ead3af','#65445f'],mosque:['#e7ddcb','#fff5de','#447e76']};
function facadeImage(kind,variant){const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256;const c=canvas.getContext('2d'),[wall,frame,glass]=palettes[kind];c.fillStyle=wall;c.fillRect(0,0,256,256);c.fillStyle=variant%2?'#ffffff0e':'#00000010';c.fillRect(0,0,256,256);
 for(let n=0;n<1400;n++){c.fillStyle=n%2?'#ffffff0b':'#0000000b';c.fillRect(n*73%256,(n*131+Math.floor(n/8)*17)%256,2,2)}
 if(kind==='brick'){c.strokeStyle='#d4ae8d';c.lineWidth=2;for(let y=0;y<256;y+=18){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke();for(let x=(y/18%2)*24;x<256;x+=48)c.strokeRect(x,y,48,18)}}
 if(kind==='glass'||kind==='office'){c.fillStyle=glass;c.fillRect(4,8,248,231);c.strokeStyle=frame;c.lineWidth=4;for(let x=0;x<=256;x+=kind==='glass'?32:64){c.beginPath();c.moveTo(x,0);c.lineTo(x,256);c.stroke()}for(let y=0;y<=256;y+=64){c.beginPath();c.moveTo(0,y);c.lineTo(256,y);c.stroke()}c.fillStyle='#c6e7ee35';c.beginPath();c.moveTo(28,0);c.lineTo(118,0);c.lineTo(58,256);c.lineTo(4,256);c.fill()}
 else if(kind==='market'||kind==='shop'){c.fillStyle=frame;c.fillRect(8,90,240,145);c.fillStyle=glass;c.fillRect(16,100,104,125);c.fillRect(132,100,106,125);for(let x=0;x<256;x+=32){c.fillStyle=x%64?'#f0d783':kind==='market'?'#387872':'#a84038';c.fillRect(x,53,32,40)}c.fillStyle='#f0d7a3';c.fillRect(13,12,230,29);c.fillStyle='#514733';c.font='bold 17px sans-serif';c.textAlign='center';c.fillText(kind==='market'?'LOCAL MARKET':'ACCRA STORES',128,33)}
 else {for(const x of [24,150]){const arch=['church','mosque'].includes(kind);c.fillStyle=frame;if(arch){c.beginPath();c.roundRect(x,28,80,169,[40,40,0,0]);c.fill()}else c.fillRect(x,42,80,135);c.fillStyle=glass;if(arch){c.beginPath();c.roundRect(x+8,38,64,146,[32,32,0,0]);c.fill()}else c.fillRect(x+8,50,64,119);c.fillStyle='#a0d4df55';c.fillRect(x+13,56,12,99);c.fillStyle=frame;c.fillRect(x+37,50,6,120);if(['heritage','coastal','pastel'].includes(kind)){c.fillStyle=kind==='heritage'?'#456f65':'#698c9b';c.fillRect(x-15,46,12,126);c.fillRect(x+83,46,12,126)}if(['veranda','apartment'].includes(kind)){c.fillStyle='#6b6657';c.fillRect(x-12,177,108,10);for(let n=x-10;n<x+95;n+=14)c.fillRect(n,146,4,36);c.fillRect(x-12,143,108,5)}}c.fillStyle=frame;c.fillRect(0,232,256,10)}
 return c.getImageData(0,0,256,256)}
function addFacadeImages(map){for(const kind of Object.keys(palettes))for(let n=0;n<3;n++){const id=`facade-${kind}-${n}`;if(!map.hasImage(id))map.addImage(id,facadeImage(kind,n))}}

// Streets v8 supplies Accra's footprints and available height estimates. The
// two extrusions share a footprint: patterned walls and a thin, solid roof cap.
export function installRealBuildings(map){
  if(map.getLayer(BUILDING_LAYER))return;
  if(!map.getSource(SOURCE))map.addSource(SOURCE,{type:'vector',url:'mapbox://mapbox.mapbox-streets-v8'});
  // Metric-width road surfaces remain legible at street level and match the
  // same vector centerlines used by ambient traffic and pedestrian navigation.
  const roadFilter=['all',['!',['in',['get','class'],['literal',['rail','ferry','path','steps']]]],['!=',['get','structure'],'tunnel']];
  const metres=['match',['get','class'],'motorway',16,'trunk',14,'primary',11,'secondary',9,'tertiary',8,'service',5,'pedestrian',4,7];
  const width=extra=>['interpolate',['exponential',2],['zoom'],14,['*',['+',metres,extra],.21],22,['*',['+',metres,extra],53.5]];
  const road={source:SOURCE,'source-layer':'road',slot:'middle',type:'line',minzoom:16,filter:roadFilter,layout:{'line-cap':'round','line-join':'round'}};
  map.addLayer({...road,id:'accralife-pavements',paint:{'line-color':'#b8afa0','line-width':width(3),'line-opacity':.98}});
  map.addLayer({...road,id:'accralife-road-surface',paint:{'line-color':'#50585a','line-width':width(0),'line-opacity':.97}});
  map.addLayer({...road,id:'accralife-road-centre',filter:['all',roadFilter,['in',['get','class'],['literal',['primary','secondary','tertiary']]]],paint:{'line-color':'#e4d6a0','line-width':['interpolate',['exponential',2],['zoom'],16,.12,22,7.7],'line-dasharray':[3,6],'line-opacity':.7}});
  addFacadeImages(map);
  map.addSource('accralife-architecture',{type:'geojson',data:{type:'FeatureCollection',features:[]},maxzoom:18});
  const shared={source:'accralife-architecture',slot:'middle',minzoom:15};
  map.addLayer({
    ...shared,id:BUILDING_LAYER,type:'fill-extrusion',
    paint:{
      'fill-extrusion-height':['get','renderHeight'],
      'fill-extrusion-base':['to-number',['get','min_height'],0],
      'fill-extrusion-pattern':['get','facade'],
      'fill-extrusion-vertical-gradient':true,
      'fill-extrusion-ambient-occlusion-intensity':.38,
      'fill-extrusion-cast-shadows':true,
      'fill-extrusion-opacity':1,
    },
  });
  map.addLayer({
    ...shared,id:ROOF_LAYER,type:'fill-extrusion',
    paint:{
      'fill-extrusion-height':['+',['get','renderHeight'],.16],
      'fill-extrusion-base':['-',['get','renderHeight'],.12],
      'fill-extrusion-color':['get','roofColor'],
      'fill-extrusion-vertical-gradient':true,
      'fill-extrusion-ambient-occlusion-intensity':.4,
      'fill-extrusion-opacity':1,
    },
  });
}

export function createArchitecture(map){let last=0,previous='',details=[];return {get details(){return details},update(position){if(performance.now()-last<1200)return;last=performance.now();const raw=map.querySourceFeatures(SOURCE,{sourceLayer:'building'}),seen=new Set(),features=[],near=[];for(const f of raw){if(!['Polygon','MultiPolygon'].includes(f.geometry?.type)||String(f.properties?.extrude)==='false')continue;const a=buildingStyle(f);if(!Number.isFinite(a.center[0])||distanceMetres(a.center,position)>1500)continue;const key=`${a.seed}`;if(seen.has(key))continue;seen.add(key);features.push({type:'Feature',id:a.seed,geometry:f.geometry,properties:{...f.properties,renderHeight:a.height,facade:`facade-${a.style}-${a.seed%3}`,roofColor:['#92513b','#637b81','#a1a895','#71726d'][a.seed%4]}});if(distanceMetres(a.center,position)<130&&near.length<65){const ring=f.geometry.type==='Polygon'?f.geometry.coordinates[0]:f.geometry.coordinates[0][0],xs=ring.map(p=>p[0]),ys=ring.map(p=>p[1]);near.push({...a,id:key,position:a.center,width:(Math.max(...xs)-Math.min(...xs))*110800,depth:(Math.max(...ys)-Math.min(...ys))*111320})}if(features.length>2200)break}const signature=features.map(f=>f.id).sort().join(',');if(features.length&&signature!==previous){map.getSource('accralife-architecture').setData({type:'FeatureCollection',features});previous=signature}details=near;}}}
