export function cityMapStyle(){
 const root=window.ACCRALIFE_CONFIG.mapData,source='accralife-streets',layer=(id,type,name,paint,extra={})=>({id,type,source,'source-layer':name,paint,...extra}),font=['Noto Sans Regular'];
 const roadWidth=['match',['get','class'],'motorway',16,'trunk',14,'primary',11,'secondary',9,'tertiary',8,'service',5,7],width=extra=>['interpolate',['exponential',2],['zoom'],12,['*',['+',roadWidth,extra],.0263],16,['*',['+',roadWidth,extra],.42],20,['*',['+',roadWidth,extra],6.72],24,['*',['+',roadWidth,extra],107.52]];
 const landColor=['match',['get','class'],['park','grass','garden'],'#849869','wood','#526e44','scrub','#929061','agriculture','#9e9763','sand','#c5a36f','cemetery','#899078','pitch','#738962','parking','#777b7b',['residential','commercial'],'#a3a397','industrial','#958771','#a8a698'];
 return {version:8,name:'Worldfolk · Accra OpenStreetMap',glyphs:location.origin+'/maps/fonts/{fontstack}/{range}.pbf',light:{anchor:'viewport',color:'#fff0d6',intensity:.4,position:[1.5,180,40]},sources:{[source]:{type:'vector',tiles:[new URL(root,location.origin).href+'/{z}/{x}/{y}.pbf'],minzoom:10,maxzoom:15,bounds:[-.40,5.40,.12,5.83],attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> · <a href="/maps/README.html">Map data & licence</a>'}},layers:[
 {id:'worldfolk-background',type:'background',paint:{'background-color':'#aaa494'}},
 layer('worldfolk-ground-cover','fill','landuse',{'fill-color':landColor,'fill-opacity':1}),
 layer('worldfolk-water','fill','water',{'fill-color':'#57a7b9'}),layer('worldfolk-waterways','line','waterway',{'line-color':'#57a7b9','line-width':['interpolate',['linear'],['zoom'],10,1,16,4]}),
 layer('worldfolk-road-casing','line','road',{'line-color':['case',['==',['get','surface'],'unpaved'],'#aaa494','#828786'],'line-width':width(2)},{layout:{'line-cap':'round','line-join':'round'},filter:['!', ['in',['get','class'],['literal',['path','steps','pedestrian']]]]}),
 layer('worldfolk-roads','line','road',{'line-color':['case',['==',['get','surface'],'unpaved'],'#a99982','#292e32'],'line-width':width(0)},{layout:{'line-cap':'round','line-join':'round'},filter:['!', ['in',['get','class'],['literal',['path','steps','pedestrian']]]]}),
 layer('worldfolk-paths','line','road',{'line-color':'#8d918b','line-width':['interpolate',['exponential',2],['zoom'],14,.21,18,3.36,22,53.76]},{filter:['in',['get','class'],['literal',['path','steps','pedestrian']]]}),
 layer('worldfolk-road-labels','symbol','road',{'text-color':'#f8f3e8','text-halo-color':'#333b3c','text-halo-width':1.2},{minzoom:14,maxzoom:20,layout:{'symbol-placement':'point','text-pitch-alignment':'viewport','text-rotation-alignment':'viewport','text-field':['get','name'],'text-font':font,'text-size':12,'text-max-angle':30}}),
 layer('worldfolk-poi-dots','circle','poi',{'circle-radius':3,'circle-color':'#248361','circle-stroke-color':'#fff6df','circle-stroke-width':1},{minzoom:15}),
 layer('worldfolk-poi-labels','symbol','poi',{'text-color':'#163f39','text-halo-color':'#f6f3e8','text-halo-width':1.5},{minzoom:15,layout:{'text-field':['get','name'],'text-font':font,'text-size':12,'text-offset':[0,1],'text-max-width':12}}),
 layer('worldfolk-place-labels','symbol','place',{'text-color':'#354947','text-halo-color':'#f6f3e8','text-halo-width':2},{layout:{'text-field':['get','name'],'text-font':font,'text-size':['interpolate',['linear'],['zoom'],10,12,15,18]}})
 ]};
}

export function setMapPresentation(map,overhead){
 const paint=(id,key,value)=>{if(map.getLayer(id))map.setPaintProperty(id,key,value)};
 paint('worldfolk-background','background-color',overhead?'#e7ebe5':'#aaa494');
 paint('worldfolk-ground-cover','fill-color',overhead?['match',['get','class'],['park','grass','garden','pitch'],'#c5d9b9','wood','#a9c8a0','water','#8bc6d1','sand','#e2d9be','parking','#d2d6d3','#e0e5dd']:['match',['get','class'],['park','grass','garden'],'#849869','wood','#526e44','scrub','#929061','agriculture','#9e9763','sand','#c5b58f','pitch','#738962','parking','#777b7b',['residential','commercial'],'#a3a397','#a8a698']);
 paint('worldfolk-roads','line-color',overhead?['case',['==',['get','surface'],'unpaved'],'#d6caba','#fcfcf6']:['case',['==',['get','surface'],'unpaved'],'#a99982','#292e32']);
 paint('worldfolk-road-casing','line-color',overhead?'#b3bfb6':'#828786');
 paint('worldfolk-road-labels','text-color',overhead?'#4b6058':'#f8f3e8');paint('worldfolk-road-labels','text-halo-color',overhead?'#ffffff':'#333b3c');
 paint('worldfolk-water','fill-color',overhead?'#8dcbd7':'#57a7b9');
 if(map.getLayer('worldfolk-ground-texture'))map.setLayoutProperty('worldfolk-ground-texture','visibility',overhead?'none':'visible');
}
