import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import * as T from '../public/game/three.module.js';
import {SHANGRI_BLOCK,SHANGRI_RINGS,SHANGRI_ROADS,SHANGRI_AUTHORED_ROADS,SHANGRI_ACTIVITIES,SHANGRI_PLACES,SHANGRI_BOUNDARY,shangriLocal,shangriRoadClear,shangriColliders,shangriPeople} from '../public/game/shangri-la-data.js';
import {createShangriBlock} from '../public/game/shangri-la.js';
import {isCityLandmark,landmarkColliders} from '../public/game/city-landmarks.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {landmarkArrival} from '../public/game/landmark-arrival.js';import {nearPrecinctActivity} from '../public/game/precinct-life.js';
import {profiledRoadWidth} from '../public/game/road-elevation.js';import {roadFeatures} from '../public/game/road-cache.js';
import {disposeScene} from '../public/game/render-utils.js';
const context=JSON.parse(readFileSync(new URL('./fixtures/shangri-la-context.json',import.meta.url)));
const physics=()=>{const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.building,isSourceLoaded:()=>true});p.refresh(SHANGRI_BLOCK.position,true);return p;};
test('identified buildings retain native outlines without claiming their anonymous neighbours',()=>{
 for(const id of SHANGRI_BLOCK.sourceIds){assert.deepEqual(SHANGRI_RINGS[id],context.building.find(f=>f.id===id).geometry.coordinates[0]);assert.ok(isCityLandmark(id));}
 for(const id of [2475835062,2475838892,2475838888]){assert.equal(SHANGRI_BLOCK.sourceIds.includes(id),false);assert.ok(isCityLandmark(id));}
 for(const c of shangriColliders())assert.ok(c.noDoor);
});
test('public arrivals and guides remain outside walls, road lanes and native buildings',()=>{
 const p=physics();for(const a of SHANGRI_ACTIVITIES){assert.equal(p.collision(a.position,.65,0),null,a.id);assert.ok(shangriRoadClear(a.position,.65),a.id);assert.equal(nearPrecinctActivity(a.position)?.id,a.id);}
 for(const place of SHANGRI_PLACES){const a=landmarkArrival(place);assert.ok(a);assert.equal(p.collision(a.position,.65,0),null);}
});
test('public service entrances and Liberation carriageways stay clear of authored solids',()=>{
 const p=physics();for(const id of [974540788,1076825780,1076825781,518607277,510151406,510252769,511790086,515537582]){const r=SHANGRI_ROADS.find(r=>r.id===id);for(let i=1;i<r.coordinates.length;i++){const a=r.coordinates[i-1],b=r.coordinates[i];for(let j=0;j<=12;j++){const q=a.map((v,k)=>v+(b[k]-v)*j/12);if([974540788,1076825780,1076825781].includes(id)&&Math.hypot((q[0]-r.coordinates[0][0])*110787,(q[1]-r.coordinates[0][1])*111320)>20)continue;if(q[1]<5.61665||q[1]>5.61835||q[0]<-.177)continue;assert.equal(p.collision(q,1,0),null,`${id} ${q}`);}}}
});
test('widths and source features agree without replacing unrelated interchange profiles',()=>{
 for(const r of SHANGRI_AUTHORED_ROADS){assert.equal(profiledRoadWidth(r.id,99),r.width);const f=context.road.find(f=>f.id===r.id);const rows=roadFeatures({querySourceFeatures:()=>[f]});assert.deepEqual(rows[0].geometry.coordinates,r.coordinates);}
 assert.ok(!SHANGRI_AUTHORED_ROADS.some(r=>r.id===40651992));
});
test('east boundary stays off the walking strip; local pedestrian stays out of traffic',()=>{
 for(const p of SHANGRI_BOUNDARY)assert.ok(shangriRoadClear(p,2));
 const p=physics();for(let t=0;t<30;t+=.25)for(const actor of shangriPeople(t,SHANGRI_BLOCK.position)){assert.ok(shangriRoadClear(actor.position,.6));assert.equal(p.collision(actor.position,.6,0),null);}
});
test('native roof notches remain open, geometry is finite and static batches are bounded',()=>{
 const {group}=createShangriBlock();group.updateMatrixWorld(true);let draws=0,vertices=0;
 group.traverse(o=>{if(!o.isMesh)return;draws++;const p=o.geometry.attributes.position;vertices+=p.count;for(const n of p.array)assert.ok(Number.isFinite(n));assert.ok(o.geometry.attributes.normal);});
 assert.ok(draws<35,draws);assert.ok(group.userData.surfaceCells>50);const [x,z]=shangriLocal([-.17682,5.61764]);const ray=new T.Raycaster(new T.Vector3(x,20,z),new T.Vector3(0,-1,0));assert.equal(ray.intersectObject(group,true).filter(h=>h.point.y>2).length,0,'native Christman notch must not become a solid bounding box');
 console.log({draws,vertices});assert.ok(landmarkColliders(SHANGRI_BLOCK.position).some(c=>c.id==='shangri:christman'));disposeScene(group);
});

test('bank search preserves other branches while using the public frontage arrival here',()=>{const mapped=[{name:'First National Bank',lng:-.176672,lat:5.616892,type:'bank'},{name:'GHL Bank',lng:-.1765,lat:5.616845,type:'bank'},{name:'First National Bank',lng:-.20,lat:5.55,type:'bank'}],index=indexPlaces(mapped);assert.equal(searchPlaceIndex(index,'First National Bank').total,2);assert.equal(searchPlaceIndex(index,'GHL Bank').total,1);assert.deepEqual(landmarkArrival(mapped[0]).position,SHANGRI_ACTIVITIES[1].position);});
