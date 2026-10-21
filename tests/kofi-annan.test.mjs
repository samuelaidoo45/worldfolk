import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as T from '../public/game/three.module.js';
import {KOFI_SITES,KOFI_MASSES,KOFI_ACTIVITIES,kofiPeople,kofiForPlace,kofiPoint} from '../public/game/kofi-annan-data.js';
import {createKofiAnnanSite} from '../public/game/kofi-annan.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {isCityLandmark,createCityLandmark} from '../public/game/city-landmarks.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {nearPrecinctActivity,createPrecinctLife} from '../public/game/precinct-life.js';
import {distanceMetres,projectOnSegment,bearingTo,offsetMetres} from '../public/game/motion.js';
import {roadWidth} from '../public/game/street-safety.js';
import {chaseCamera} from '../public/game/chase-camera.js';
import {disposeScene} from '../public/game/render-utils.js';
const context=JSON.parse(readFileSync(new URL('./fixtures/kofi-annan-context.json',import.meta.url)));
const physics=origin=>{const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.buildings,isSourceLoaded:()=>true});p.refresh(origin,true);return p;};
function roadClear(p){for(const f of context.roads)for(let i=1;i<f.geometry.coordinates.length;i++){const ps=f.geometry.coordinates;assert.ok(projectOnSegment(p,ps[i-1],ps[i]).distance>roadWidth(f.properties.class)/2+.25,f.properties.name+' carriageway at '+p);}}
test('three distinct mapped sites, aliases and canonical search results',()=>{
 const index=indexPlaces([{name:'Octavia',lng:-.18004,lat:5.6193,type:'office'},{name:'Airport Womens Hospital',lng:-.17888,lat:5.61765,type:'doctors'},{name:'Kwarleyz Residence',lng:-.21,lat:5.65,type:'hotel'}]);
 for(const s of KOFI_SITES){assert.ok(isCityLandmark(s.sourceIds[0]));const p=searchPlaceIndex(index,s.name).items.find(p=>p.id===s.id);assert.ok(p);assert.deepEqual(landmarkArrival(p).position,s.arrival);assert.ok(isOutdoorLandmark(p));assert.equal(createCityLandmark(s).group.userData.kofi.siteId,s.id);}
 assert.equal(kofiForPlace({name:'Airport Womens Hospital'}).id,'airport-womens-hospital');assert.equal(searchPlaceIndex(index,'Octavia').items.length,1);assert.equal(searchPlaceIndex(index,'Airport Womens').items.length,1);assert.equal(searchPlaceIndex(index,'Kwarleyz').items.length,2);assert.equal(isCityLandmark(1337567088),false);
});
test('arrivals and default cameras clear neighbouring native buildings and roads',()=>{
 for(const s of KOFI_SITES){const p=physics(s.arrival);assert.equal(p.collision(s.arrival,.45),null,s.id);roadClear(s.arrival);const heading=bearingTo(s.arrival,s.target),camera=chaseCamera({position:s.arrival,heading,physics:p,scenic:true});assert.ok(camera.distance>6,s.id+' camera clearance '+camera.distance);assert.equal(p.collision(camera.from,.3),null,s.id+' camera');}
});
test('waiting and photo interactions have clear walking access and remain discoverable',()=>{
 for(const s of KOFI_SITES){const p=physics(s.arrival);for(const a of KOFI_ACTIVITIES.filter(a=>a.id.includes(s.id))){assert.equal(p.collision(a.position,.3),null,a.id);roadClear(a.position);assert.equal(nearPrecinctActivity(a.position,0)?.id,a.id);if(a.kind==='sit'){const from=offsetMetres(a.position,0,-2);assert.ok(distanceMetres(p.moveWalker(from,a.position).position,a.position)<.1,a.id+' seat access');}}}
});
test('local visitors move continuously in clear forecourts; they never walk through the road',()=>{
 for(const s of KOFI_SITES){const p=physics(s.arrival);let old;
 for(let t=0;t<40;t+=.2){const actors=kofiPeople(t,s.arrival,720);assert.equal(actors.length,2);for(const a of actors){roadClear(a.position);if(a.moving){assert.ok(distanceMetres(a.position,s.arrival)>1.8,'visitor does not push a player off the photo point');assert.equal(p.collision(a.position,.28),null,s.id+' walker');if(old)assert.ok(distanceMetres(old.position,a.position)<.15);old=a;}}}
 assert.equal(createPrecinctLife().tick(0,s.arrival).length,2);}
});
test('stepped native massing blocks contact and allows moving away',()=>{
 assert.equal(KOFI_MASSES.length,8);for(const m of KOFI_MASSES){const s=KOFI_SITES.find(s=>s.id===m.siteId),p=physics(s.position),a=m.ring[0],b=m.ring[1],mid=a.map((v,i)=>(v+b[i])/2);assert.ok(p.collision(mid,.3),m.id);}
 for(const s of KOFI_SITES){const p=physics(s.arrival),hit=p.move(s.arrival,s.position,.4);assert.ok(hit.blocked,s.id);assert.ok(distanceMetres(p.move(hit.position,s.arrival,.4).position,s.arrival)<.1,s.id+' move away');}
});
test('rendered silhouettes differ, all geometry is finite and batching bounds draw calls',()=>{
 const heights=[];for(const s of KOFI_SITES){const {group}=createKofiAnnanSite(s);assert.ok(group.userData.kofi.bays>10);assert.ok(group.userData.batching.after<25,s.id);group.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.getAttribute('position'),uv=o.geometry.getAttribute('uv');assert.ok(Array.from(p.array).every(Number.isFinite));assert.equal(p.count,uv.count);});heights.push(new T.Box3().setFromObject(group).max.y);disposeScene(group);}
 assert.ok(heights[0]>25&&heights[0]<27);assert.ok(heights[1]<10);assert.ok(heights[2]>28&&heights[2]<30);
});
