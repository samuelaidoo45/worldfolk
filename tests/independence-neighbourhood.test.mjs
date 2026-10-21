import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import * as T from '../public/game/three.module.js';
import {CIVIC_SITES,CIVIC_BUILDINGS,CIVIC_MASTS,CIVIC_SEATS,CIVIC_LAMPS,CIVIC_VISITS,CIVIC_ACTIVITIES,CIVIC_MONUMENTS,CIVIC_WALK_PIECES,CIVIC_LAND,civicRoadClear,civicBuildingClear,civicForPlace,civicColliders,civicInside,civicPeople} from '../public/game/independence-neighbourhood-data.js';
import {CIVIC_RETAINED_IDS} from '../public/game/independence-neighbourhood-map.js';
import {CITY_LANDMARKS,createCityLandmark} from '../public/game/city-landmarks.js';
import {START_PLACES} from '../public/game/city-places.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {modelCost} from '../public/game/world-streaming.js';import {disposeScene} from '../public/game/render-utils.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
const context=JSON.parse(readFileSync(new URL('./fixtures/independence-neighbourhood-context.json',import.meta.url)));
function physics(origin){const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.buildings,isSourceLoaded:()=>true});p.refresh(origin,true);return p;}
test('bounded inventory accounts for every native plate with a single authoring owner',()=>{
 assert.equal(context.buildings.length,158);assert.equal(CIVIC_BUILDINGS.length,148);
 assert.deepEqual(new Set([...CIVIC_BUILDINGS.map(b=>b.id),...CIVIC_RETAINED_IDS]),new Set(context.buildings.map(f=>f.id)));
 for(const f of context.buildings){const owners=CITY_LANDMARKS.filter(s=>(s.sourceIds||[s.sourceId]).some(id=>String(id)===String(f.id)));assert.equal(owners.length,1,`${f.id} owners: ${owners.map(v=>v.id)}`);}
 for(const b of CIVIC_BUILDINGS)assert.deepEqual(b.rings,context.buildings.find(f=>f.id===b.id).geometry.coordinates);
 assert.equal(CITY_LANDMARKS.filter(s=>s.id==='accra-stadium').length,1);
});
test('native stadium crescent leaves the mapped pitch open and retains two separate structures',()=>{
 const s=CIVIC_SITES.find(s=>s.id==='accra-stadium');assert.deepEqual(s.sourceIds,[339732240,339732262]);
 const pitch=CIVIC_LAND.find(f=>f.id===339732280).geometry.coordinates[0];const center=[0,1].map(k=>pitch.slice(0,-1).reduce((sum,p)=>sum+p[k],0)/4);
 assert.ok(!civicColliders(s).some(c=>civicInside(center,c.rings)));
 const finance=CIVIC_BUILDINGS.find(b=>b.family==='finance');assert.equal(finance.rings.length,3);for(const hole of finance.rings.slice(1)){const p=[0,1].map(k=>hole.slice(0,-1).reduce((n,p)=>n+p[k],0)/(hole.length-1));assert.ok(!civicInside(p,finance.rings));}
});
test('new outdoor arrivals and guides clear native buildings, drive lanes and authored solids',()=>{
 for(const a of [...CIVIC_VISITS,...CIVIC_ACTIVITIES]){assert.ok(civicRoadClear(a.position,.32),`${a.id} road`);assert.ok(civicBuildingClear(a.position,.32),`${a.id} building`);assert.ok(!physics(a.position).collision(a.position,.32,0),`${a.id} physics`);}
 for(const a of CIVIC_VISITS){assert.deepEqual(landmarkArrival(START_PLACES.find(p=>p.id===a.id)).position,a.position);assert.equal(isOutdoorLandmark(START_PLACES.find(p=>p.id===a.id)),a.site!=='stadium');}
});
test('park paths stay inside mapped park and clear carriageways and buildings',()=>{
 const park=CIVIC_LAND.find(f=>f.properties.name==='Nationalism Park');assert.ok(CIVIC_WALK_PIECES.length>10);
 for(const w of CIVIC_WALK_PIECES)for(const p of [w.a,w.b]){assert.ok(civicInside(p,park.geometry.coordinates));assert.ok(civicRoadClear(p,w.width/2+.29));assert.ok(civicBuildingClear(p,w.width/2+.29));}
 for(const p of [...CIVIC_MASTS,...CIVIC_LAMPS,...CIVIC_SEATS]){assert.ok(civicRoadClear(p,.8));assert.ok(civicBuildingClear(p,.8));}
 for(const m of CIVIC_MONUMENTS){assert.ok(civicInside(m.position,park.geometry.coordinates));assert.ok(civicRoadClear(m.position,m.width/2));assert.ok(civicBuildingClear(m.position,2));}
});
test('canonical search retains stadium identity and distinguishes other branches',()=>{
 const results=searchPlaceIndex(indexPlaces([{id:'mapped-stadium',name:'Accra Sports Stadium',lng:-.1923,lat:5.5515},{id:'other-water',name:'Ghana Water Company Head Office',lng:-.25,lat:5.6}]),'Accra Sports Stadium').items;assert.equal(results.length,1);assert.equal(results[0].id,'g_-1918_55516');
 assert.equal(civicForPlace({name:'Ghana Club',lng:-.25,lat:5.6}),undefined);
 assert.equal(START_PLACES.filter(p=>p.id==='g_-1918_55516').length,1);
});
test('scenery visitors remain bounded and off the carriageway throughout their path',()=>{
 for(const v of CIVIC_VISITS)for(const t of [0,1,5,10,30,60,90]){for(const p of civicPeople(t,v.position)||[]){assert.ok(civicRoadClear(p.position,.3),p.id+' road');assert.ok(civicBuildingClear(p.position,.3),p.id+' building');assert.ok(!physics(p.position).collision(p.position,.3,0),p.id+' collision');}}
 assert.equal(civicPeople(0,[-.15,5.65]),null);
});
test('all precinct models have finite geometry and bounded static cost',()=>{
 let vertices=0;for(const s of CIVIC_SITES){const m=createCityLandmark(s),cost=modelCost(m.group);vertices+=cost.vertices;assert.ok(!m.update);assert.ok(cost.vertices<120000,s.id+' vertex budget');assert.ok(cost.draws<=18,s.id+' draw budget');m.group.updateMatrixWorld();const box=new T.Box3().setFromObject(m.group);assert.ok(Number.isFinite(box.max.y));m.group.traverse(o=>{if(!o.isMesh)return;for(const a of Object.values(o.geometry.attributes))for(const v of a.array)assert.ok(Number.isFinite(v),s.id+' finite');});disposeScene(m.group);}assert.ok(vertices<500000,'whole precinct cost');
});
