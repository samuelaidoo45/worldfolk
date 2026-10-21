import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import {createRouter,readRoadGraph} from '../public/game/osm-routing.js';
const graph={bounds:[-1,5,1,6],nodes:[[0,5.5],[.001,5.5],[.002,5.5],[.001,5.501],[0,5.501]],names:['One way','Road','Footpath','Detour'],edges:[[0,1,110,10,5,0],[1,2,110,10,7,1],[2,3,155,10,4,2],[3,4,110,10,7,3],[4,0,110,10,7,3],[1,3,110,10,7,3]],restrictions:[]};
test('routing respects one-way driving, walking-only roads and node turn restrictions',()=>{
 const r=createRouter(graph);const backwards=r.route(graph.nodes[1],graph.nodes[0],'driving');assert.equal(backwards.geometry.coordinates.length,4);assert.equal(r.route(graph.nodes[1],graph.nodes[0],'walking').geometry.coordinates.length,2);
 assert.ok(r.route(graph.nodes[2],graph.nodes[3],'driving').geometry.coordinates.length>2);assert.equal(r.route(graph.nodes[2],graph.nodes[3],'walking').geometry.coordinates.length,2);
 const restricted=createRouter({...graph,restrictions:[[0,1,1,'no_right_turn']]});assert.ok(restricted.route(graph.nodes[0],graph.nodes[2],'driving').geometry.coordinates.length>3);
 assert.throws(()=>r.route([3,4],graph.nodes[0]),/Accra/);
 const disconnected=createRouter({...graph,edges:[graph.edges[0],graph.edges[2]]});assert.throws(()=>disconnected.route(graph.nodes[0],graph.nodes[2],'walking'),/No connected/);
});
test('published OSM dataset routes Accra destinations along connected roads',()=>{
 const g=JSON.parse(fs.readFileSync('public/maps/accra-v1/graph.json'));const bytes=fs.readFileSync('public/maps/accra-v1/graph.bin'),r=createRouter(readRoadGraph(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength))),home=[-.1949,5.5682],mall=[-.1738,5.6224];
 for(const mode of ['driving','walking']){const result=r.route(home,mall,mode);assert.ok(result.distance>5000&&result.distance<20000);assert.ok(result.geometry.coordinates.length>20);assert.ok(result.duration>100);}
 const data=JSON.parse(fs.readFileSync('public/maps/accra-v1/places.json'));assert.ok(data.some(p=>/Accra Mall/i.test(p.name)));assert.ok(data.length>100);
 const m=JSON.parse(fs.readFileSync('public/maps/accra-v1/manifest.json'));assert.ok(m.layers.building>1000);assert.ok(m.layers.road>1000);assert.ok(m.tiles<20000);
});
test('runtime application has no Mapbox or public OSM service dependency',()=>{
 for(const dir of ['public/game','app/api/game','server/maps'])for(const f of fs.readdirSync(dir)){if(!/\.(js|ts|html)$/.test(f)||f==='three.module.js')continue;const s=fs.readFileSync(`${dir}/${f}`,'utf8');assert.doesNotMatch(s,/api\.mapbox\.com|mapbox:\/\/|mapboxToken|tile\.openstreetmap\.org|nominatim\.openstreetmap\.org|router\.project-osrm\.org/,`${dir}/${f}`)}
});
test('self-hosted style is valid and preserves tile/glyph URL placeholders',async()=>{
 const {validateStyleMin}=await import('@maplibre/maplibre-gl-style-spec');const {cityMapStyle}=await import('../public/game/map-style.js');
 globalThis.window={ACCRALIFE_CONFIG:{mapData:'/maps/accra-v1'}};globalThis.location={origin:'https://worldfolk.example'};
 const style=cityMapStyle();assert.deepEqual(validateStyleMin(style).map(e=>e.message),[]);assert.match(style.glyphs,/\{fontstack\}\/\{range\}/);assert.match(style.sources['accralife-streets'].tiles[0],/\{z\}\/\{x\}\/\{y\}/);delete globalThis.window;delete globalThis.location;
});

test('2D map layers validate with collision-aware places and buildings below roads',async()=>{
 const {validateStyleMin}=await import('@maplibre/maplibre-gl-style-spec');
 const {cityMapStyle,setMapPresentation}=await import('../public/game/map-style.js');
 const {installOverheadMap,updateOverheadPlaces}=await import('../public/game/overhead-map.js');
 globalThis.window={ACCRALIFE_CONFIG:{mapData:'/maps/accra-v1'}};globalThis.location={origin:'https://worldfolk.example'};
 try{
  const style=cityMapStyle(),map={getLayer:id=>style.layers.find(l=>l.id===id),getSource:id=>style.sources[id],addLayer(layer,before){style.layers.splice(style.layers.findIndex(l=>l.id===before),0,layer)},addSource(id,value){style.sources[id]={...value,setData(data){this.data=data}}},setLayoutProperty(id,key,value){const l=this.getLayer(id);(l.layout??={})[key]=value},setPaintProperty(id,key,value){this.getLayer(id).paint[key]=value},setFilter(id,value){if(value)this.getLayer(id).filter=value;else delete this.getLayer(id).filter}};
  installOverheadMap(map);setMapPresentation(map,true);updateOverheadPlaces(map,[{id:'mall',name:'Accra Mall',type:'mall',lng:-.1738,lat:5.6224}],null);
  assert.equal(map.getLayer('worldfolk-road-labels').layout['symbol-placement'],'line');
  assert.ok(style.layers.findIndex(l=>l.id==='worldfolk-overhead-buildings')<style.layers.findIndex(l=>l.id==='worldfolk-roads'));
  assert.equal(map.getSource('worldfolk-map-places').data.features[0].properties.placeId,'mall');
  for(const [id,value] of Object.entries(style.sources)){const {setData,...source}=value;style.sources[id]=source;}
  assert.deepEqual(validateStyleMin(style).map(e=>e.message),[]);
  setMapPresentation(map,false);assert.equal(map.getLayer('worldfolk-overhead-buildings').layout.visibility,'none');assert.deepEqual(validateStyleMin(style).map(e=>e.message),[]);
 }finally{delete globalThis.window;delete globalThis.location}
});
