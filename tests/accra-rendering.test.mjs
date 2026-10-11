import test from 'node:test';
import assert from 'node:assert/strict';
import {chaseCamera} from '../public/game/chase-camera.js';
import {distanceMetres} from '../public/game/motion.js';
import {roofOutline,hipRoofVertices} from '../public/game/roof-geometry.js';
import {createScenery} from '../public/game/scenery.js';
import {roadPolygons} from '../public/game/road-geometry.js';
import {cityMapStyle} from '../public/game/map-style.js';
import {installGroundDetail} from '../public/game/ground-detail.js';
import {validateStyleMin} from '@maplibre/maplibre-gl-style-spec';
const position=[-.1819,5.5598];
test('follow camera frames walking and driving, pulls in at walls and releases gradually',()=>{
 const open={position,heading:0};const walk=chaseCamera(open),drive=chaseCamera({...open,driving:true,speed:30});
 assert.ok(walk.distance>=6&&walk.distance<10);assert.ok(drive.distance>walk.distance);assert.ok(drive.altitude<6);
 const blocked=chaseCamera({...open,previousDistance:walk.distance,physics:{collision:p=>distanceMetres(position,p)>3}});
 assert.ok(blocked.distance<3);assert.ok(chaseCamera({...open,previousDistance:blocked.distance}).distance<walk.distance);
 const cabin=chaseCamera({...open,cabin:true});assert.equal(cabin.distance,0);assert.ok(cabin.altitude>1.5&&cabin.altitude<1.8);
});
test('roof simplification preserves footprint corners and concave outlines',()=>{
 const rectangle=[[0,0],[5,0],[10,0],[10,8],[0,8],[0,0]],outline=roofOutline(rectangle);
 assert.equal(outline.length,4);assert.equal(hipRoofVertices(outline,2).length,54);
 const concave=[[0,0],[10,0],[10,4],[4,4],[4,10],[0,10],[0,0]];
 assert.equal(roofOutline(concave).length,6);assert.equal(hipRoofVertices(roofOutline(concave),2),null);
});
test('roadside decoration cannot generate waakye or fruit stalls in any district',()=>{
 for(const center of [position,[-.2141,5.5485],[-.2346,5.5724]]){
  const feature={properties:{class:'street'},geometry:{type:'LineString',coordinates:[center,[center[0],center[1]+.001]]}};
  const scenery=createScenery({querySourceFeatures:()=>[feature]},{collision:()=>false,findOpen:p=>p});scenery.update(center);
  assert.ok(scenery.items.length);const lights=scenery.items.filter(i=>i.kind==='lamp');for(let i=0;i<lights.length;i++)for(let j=i+1;j<lights.length;j++)assert.ok(distanceMetres(lights[i].position,lights[j].position)>=45);assert.ok(scenery.items.every(i=>!['vendor','stall','palm','umbrella','bench'].includes(i.kind)));
 }
});
test('mapped earth and grass roads retain their surface instead of turning into asphalt',()=>{
 for(const [surface,color] of [['gravel','#b09b7c'],['grass','#8c9b70'],['asphalt','#343638']]){
 const features=roadPolygons([{properties:{class:'street',surface},geometry:{type:'LineString',coordinates:[position,[position[0],position[1]+.001]]}}],position);
 assert.equal(features.find(f=>!f.properties.pavement).properties.color,color);
 }
});
test('surface-aware textures form a valid MapLibre style',()=>{
 globalThis.window={ACCRALIFE_CONFIG:{mapData:'/maps/accra-v1'}};globalThis.location={origin:'https://worldfolk.world'};
 try{const style=cityMapStyle(),map={hasImage:()=>false,addImage(){},getStyle:()=>style,addLayer(layer,before){style.layers.splice(style.layers.findIndex(l=>l.id===before),0,layer)}};
 installGroundDetail(map);assert.deepEqual(validateStyleMin(style).map(e=>e.message),[]);
 }finally{delete globalThis.window;delete globalThis.location}
});
