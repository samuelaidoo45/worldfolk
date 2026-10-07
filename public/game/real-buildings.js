export const BUILDING_LAYER='accralife-real-buildings';
const SOURCE='accralife-streets';
const ROOF_LAYER='accralife-roofs';
const height=['max',4.5,['to-number',['get','height'],4.5]];
const wallType=['match',['get','type'],
  'office','accralife-facade-office','commercial','accralife-facade-shop',
  'hotel','accralife-facade-office','school','accralife-facade-school',
  'accralife-facade-home'];

function facadeImage(background,frame,pane){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle=background;ctx.fillRect(0,0,128,128);
  // Small, deterministic texture marks stop broad plaster walls looking flat.
  for(let i=0;i<720;i++){const x=(i*73+17)%128,y=(i*127+Math.floor(i/5)*19)%128;ctx.fillStyle=i%3?'rgba(255,255,255,.035)':'rgba(39,32,23,.035)';ctx.fillRect(x,y,2,2)}
  for(const x of [12,76]){
    ctx.fillStyle='rgba(62,50,42,.24)';ctx.fillRect(x-3,16,48,70);
    ctx.fillStyle=frame;ctx.fillRect(x,18,42,64);
    ctx.fillStyle=pane;ctx.fillRect(x+4,22,34,55);
    ctx.fillStyle='rgba(190,230,230,.21)';ctx.fillRect(x+6,24,5,48);
    ctx.fillStyle='rgba(246,244,224,.2)';ctx.fillRect(x+26,23,8,14);
    ctx.fillStyle=frame;ctx.fillRect(x+19,22,4,55);
    ctx.fillStyle='rgba(78,58,42,.36)';ctx.fillRect(x-4,83,51,5);
  }
  ctx.fillStyle='rgba(75,63,51,.16)';ctx.fillRect(0,113,128,3);
  return ctx.getImageData(0,0,128,128);
}

function addFacadeImages(map){
  const variants=[
    ['accralife-facade-home','#cdbda5','#ede5d3','#315468'],
    ['accralife-facade-office','#a9ada8','#343e43','#3a6b7d'],
    ['accralife-facade-shop','#cfb396','#5d453d','#425f6a'],
    ['accralife-facade-school','#d3c5a5','#f0e8d3','#557489'],
  ];
  for(const [name,wall,frame,glass] of variants)if(!map.hasImage(name))map.addImage(name,facadeImage(wall,frame,glass));
}

// Streets v8 supplies Accra's footprints and available height estimates. The
// two extrusions share a footprint: patterned walls and a thin, solid roof cap.
export function installRealBuildings(map){
  if(map.getLayer(BUILDING_LAYER))return;
  if(!map.getSource(SOURCE))map.addSource(SOURCE,{type:'vector',url:'mapbox://mapbox.mapbox-streets-v8'});
  // Metric-width road surfaces remain legible at street level and match the
  // same vector centerlines used by ambient traffic and pedestrian navigation.
  const roadFilter=['all',['!',['in',['get','class'],['literal',['motorway','trunk','rail','ferry','path','steps']]]],['!=',['get','structure'],'tunnel']];
  const metres=['match',['get','class'],'primary',11,'secondary',9,'tertiary',8,'service',5,'pedestrian',4,7];
  const width=extra=>['interpolate',['exponential',2],['zoom'],14,['*',['+',metres,extra],.21],22,['*',['+',metres,extra],53.5]];
  const road={source:SOURCE,'source-layer':'road',slot:'middle',type:'line',minzoom:16,filter:roadFilter,layout:{'line-cap':'round','line-join':'round'}};
  map.addLayer({...road,id:'accralife-pavements',paint:{'line-color':'#b8afa0','line-width':width(3),'line-opacity':.98}});
  map.addLayer({...road,id:'accralife-road-surface',paint:{'line-color':'#50585a','line-width':width(0),'line-opacity':.97}});
  map.addLayer({...road,id:'accralife-road-centre',filter:['all',roadFilter,['in',['get','class'],['literal',['primary','secondary','tertiary']]]],paint:{'line-color':'#e4d6a0','line-width':['interpolate',['exponential',2],['zoom'],16,.12,22,7.7],'line-dasharray':[3,6],'line-opacity':.7}});
  addFacadeImages(map);
  const shared={source:SOURCE,'source-layer':'building',slot:'middle',minzoom:14,filter:['==',['get','extrude'],'true']};
  map.addLayer({
    ...shared,id:BUILDING_LAYER,type:'fill-extrusion',
    paint:{
      'fill-extrusion-height':height,
      'fill-extrusion-base':['to-number',['get','min_height'],0],
      'fill-extrusion-pattern':wallType,
      'fill-extrusion-vertical-gradient':true,
      'fill-extrusion-ambient-occlusion-intensity':.38,
      'fill-extrusion-cast-shadows':true,
      'fill-extrusion-opacity':1,
    },
  });
  map.addLayer({
    ...shared,id:ROOF_LAYER,type:'fill-extrusion',
    paint:{
      'fill-extrusion-height':['+',height,.16],
      'fill-extrusion-base':['-',height,.12],
      'fill-extrusion-color':['match',['get','type'],'office','#777e7e','commercial','#947868','hotel','#84908b','school','#b99f83','#a49379'],
      'fill-extrusion-vertical-gradient':true,
      'fill-extrusion-ambient-occlusion-intensity':.4,
      'fill-extrusion-opacity':1,
    },
  });
}
