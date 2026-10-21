import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import * as T from '../public/game/three.module.js';
import {AIRPORT_T2,T2_PLACE,T2_ARRIVAL,T2_ACTIVITIES,T2_SEATS,t2Point,airportT2People} from '../public/game/airport-t2-data.js';
import {createAirportT2} from '../public/game/airport-t2.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {isCityLandmark} from '../public/game/city-landmarks.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {nearPrecinctActivity,createPrecinctLife} from '../public/game/precinct-life.js';
import {projectOnSegment,distanceMetres,bearingTo} from '../public/game/motion.js';
import {roadWidth} from '../public/game/street-safety.js';
import {chaseCamera} from '../public/game/chase-camera.js';
import {disposeScene} from '../public/game/render-utils.js';
const context=JSON.parse(readFileSync(new URL('./fixtures/airport-t2-context.json',import.meta.url)));
const physics=()=>{const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.building,isSourceLoaded:()=>true});p.refresh(AIRPORT_T2.position,true);return p;};
function roadClear(position){for(const r of context.road){if(['path','footway','steps'].includes(r.properties.class))continue;const c=r.geometry.coordinates;for(let i=1;i<c.length;i++)assert.ok(projectOnSegment(position,c[i-1],c[i]).distance>roadWidth(r.properties)/2+.3,'road '+r.id+' at '+position);}}
test('Terminal 2 replaces only three verified airport shells and deduplicates nearby source names',()=>{
 for(const id of AIRPORT_T2.sourceIds)assert.ok(isCityLandmark(id));assert.equal(isCityLandmark(738854672),false,'Terminal 1 is untouched');
 const items=searchPlaceIndex(indexPlaces([{name:'Terminal 2Domestic Departures',lng:-.1717,lat:5.607,type:'terminal'},{name:'Domestic Arrivals',lng:-.1719,lat:5.607,type:'terminal'},{name:'Terminal 2',lng:-.2257,lat:5.6214,type:'terminal'}]),'Terminal 2').items;
 assert.equal(items.filter(p=>p.id===T2_PLACE.id).length,1);assert.equal(items.length,2,'distant bus terminal remains searchable');assert.equal(landmarkArrival(items.find(p=>p.id!==T2_PLACE.id)),null,'unrelated bus terminal does not redirect into the airport');assert.equal(searchPlaceIndex(indexPlaces([]),'Kotoka Terminal 2').items[0].id,T2_PLACE.id);assert.ok(isOutdoorLandmark(T2_PLACE));assert.deepEqual(landmarkArrival(T2_PLACE).position,T2_ARRIVAL);
});
test('arrival, activities and overview camera clear native buildings and roads',()=>{
 const p=physics();for(const a of T2_ACTIVITIES){assert.equal(p.collision(a.position,.3),null,a.id);assert.equal(nearPrecinctActivity(a.position)?.id,a.id);roadClear(a.position);}
 const camera=chaseCamera({position:T2_ARRIVAL,heading:bearingTo(T2_ARRIVAL,t2Point(-20,35)),physics:p,scenic:true});assert.ok(camera.distance>14);assert.equal(p.collision(camera.from,.3),null);
});
test('canopy remains open below its roof and seats can be approached and left',()=>{
 const p=physics();for(const x of [-70,-50,-30,-10,10,30])assert.equal(p.collision(t2Point(x,10),.3),null);
 for(const s of T2_SEATS){const a=t2Point(s.x,s.z-3),b=t2Point(s.x,s.z-1.2);assert.ok(distanceMetres(p.moveWalker(a,b).position,b)<.1);assert.ok(distanceMetres(p.moveWalker(b,a).position,a)<.1);assert.ok(p.collision(t2Point(s.x,s.z),.3)?.id.includes('seat'));}
 assert.ok(p.collision(t2Point(55,7),.3)?.id.includes('works-screen'),'work area remains bounded');
});
test('travellers stay clear of roads, obstacles and arrival with continuous movement',()=>{
 const p=physics();let last;for(let t=0;t<75;t+=.2){const people=airportT2People(t,T2_ARRIVAL);assert.equal(people.length,3);for(const a of people){assert.ok(distanceMetres(a.position,T2_ARRIVAL)>2);roadClear(a.position);if(!a.moving)continue;assert.equal(p.collision(a.position,.28),null);if(last)assert.ok(distanceMetres(last,a.position)<.16);last=a.position;}}
 assert.equal(createPrecinctLife().tick(0,T2_ARRIVAL).length,3);
});
test('model is finite, uses matching UVs and bounded static draw batches',()=>{
 const {group}=createAirportT2();assert.equal(group.userData.airportT2.privateInterior,false);assert.ok(group.userData.batching.after<50);group.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.getAttribute('position'),uv=o.geometry.getAttribute('uv');assert.ok(Array.from(p.array).every(Number.isFinite));assert.equal(p.count,uv.count);});const b=new T.Box3().setFromObject(group);assert.ok(b.max.y>12&&b.max.y<14);disposeScene(group);
});
