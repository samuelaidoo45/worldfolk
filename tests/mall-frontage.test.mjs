import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {gunzipSync} from 'node:zlib';
import * as T from '../public/game/three.module.js';
import {MALL_FRONTAGE,FRONTAGE_PLACE,FRONTAGE_ARRIVAL,FRONTAGE_STALLS,FRONTAGE_ACTIVITIES,FRONTAGE_BARRIERS,FRONTAGE_STOCK,frontagePoint,frontageStructures,frontagePeople,atFrontageCounter} from '../public/game/mall-frontage-data.js';
import {createMallFrontage} from '../public/game/mall-frontage.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';import {createBuildingPhysics} from '../public/game/building-physics.js';import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {nearPrecinctActivity,createPrecinctLife} from '../public/game/precinct-life.js';import {roadWidth} from '../public/game/street-safety.js';import {projectOnSegment,distanceMetres,bearingTo,offsetMetres} from '../public/game/motion.js';import {GOODS,JOBS} from '../public/game/life-catalog.js';import {disposeScene} from '../public/game/render-utils.js';
const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};
const roads=[0,1].flatMap(i=>JSON.parse(gunzipSync(readFileSync(`public/maps/accra-v1/source-road-${i}.geojson.gz`))).features).filter(f=>f.geometry.type==='LineString'&&!['path','steps','pedestrian','track'].includes(f.properties.class)&&!f.properties.layer).flatMap(r=>r.geometry.coordinates.slice(1).map((b,i)=>({r,a:r.geometry.coordinates[i],b}))).filter(s=>projectOnSegment(MALL_FRONTAGE.position,s.a,s.b).distance<100);
const clearance=p=>Math.min(...roads.map(s=>projectOnSegment(p,s.a,s.b).distance-roadWidth(s.r.properties.class)/2));
test('frontage is one searchable outdoor destination with safe counter approaches',()=>{
 const found=searchPlaceIndex(indexPlaces([]),FRONTAGE_PLACE.name).items;assert.equal(found.filter(p=>p.id===FRONTAGE_PLACE.id).length,1);assert.ok(isOutdoorLandmark(FRONTAGE_PLACE));assert.deepEqual(landmarkArrival(FRONTAGE_PLACE).position,FRONTAGE_ARRIVAL);
 const physics=createBuildingPhysics(map);physics.refresh(MALL_FRONTAGE.position,true);assert.equal(physics.collision(FRONTAGE_ARRIVAL,.28,0),null);assert.equal(nearPrecinctActivity(FRONTAGE_ARRIVAL).id,'frontage-shop');
 for(const a of FRONTAGE_ACTIVITIES){assert.equal(nearPrecinctActivity(a.position).id,a.id);assert.equal(physics.collision(a.position,.28,0),null,a.id);const moved=physics.moveWalker(frontagePoint((a.position[0]-MALL_FRONTAGE.position[0])*111320*Math.cos(MALL_FRONTAGE.position[1]*Math.PI/180),-6),a.position,0);assert.ok(distanceMetres(moved.position,a.position)<.03);}
});
test('stalls, barrier ends, people and walking corridor leave mapped traffic and terminal access open',()=>{
 const physics=createBuildingPhysics(map);physics.refresh(MALL_FRONTAGE.position,true);
 for(const s of frontageStructures())for(const dx of [-s.w/2,s.w/2])for(const dz of [-s.d/2,s.d/2])assert.ok(clearance(frontagePoint(s.x+dx,s.z+dz))>(s.id.startsWith('barrier-')?.29:.5),s.id);
 for(let x=-49;x<49;x+=.5)assert.equal(physics.collision(frontagePoint(x,-5.3),.28,0),null,'walking corridor '+x);
 for(let t=0;t<120;t+=2)for(const p of frontagePeople(t)){assert.ok(clearance(p.position)>1,p.id);assert.equal(physics.collision(p.position,.28,0),null,p.id);}
 for(const s of roads)for(let i=0;i<=8;i++){const p=s.a.map((v,j)=>v+(s.b[j]-v)*i/8);if(distanceMetres(p,MALL_FRONTAGE.position)>85)continue;assert.equal(physics.vehicleCollision(p,bearingTo(s.a,s.b),'minibus'),false,'blocked '+s.r.properties.name);}
 for(let z=-22;z<=10;z+=1)assert.equal(physics.collision(frontagePoint(68,z),1.2),null,'terminal entrance obstructed');
 assert.ok(FRONTAGE_BARRIERS.length<22,'entry gaps retained');
});
test('counter inventory and vendor role use shared server-owned prices and task locations',()=>{
 const job=JOBS.find(j=>j.id==='mall-roadside-vendor');assert.equal(job.place,FRONTAGE_PLACE.id);assert.equal(job.steps.length,3);assert.ok(job.steps.every(s=>s.place===FRONTAGE_PLACE.id));assert.equal(job.wage,95);
 assert.deepEqual(GOODS.filter(g=>g.shops.includes(FRONTAGE_PLACE.id)).map(g=>g.id).sort(),[...FRONTAGE_STOCK].sort());
 const player={pos_lng:FRONTAGE_PLACE.lng,pos_lat:FRONTAGE_PLACE.lat,driving:0};assert.ok(atFrontageCounter(player));assert.equal(atFrontageCounter({...player,driving:1}),false);const far=offsetMetres([player.pos_lng,player.pos_lat],23,0);assert.equal(atFrontageCounter({...player,pos_lng:far[0],pos_lat:far[1]}),false);
});
test('frontage has walk-in display depth, headroom and a bounded static scene',()=>{
 const {group}=createMallFrontage();group.updateMatrixWorld(true);assert.equal(group.userData.frontage.stalls,10);assert.ok(group.userData.batching.after<=24,JSON.stringify(group.userData.batching));assert.ok(group.userData.batching.before>group.userData.batching.after*5);
 for(const s of FRONTAGE_STALLS){const hits=new T.Raycaster(new T.Vector3(s.x,1.9,-1),new T.Vector3(0,1,0)).intersectObject(group,true);assert.ok(hits.some(h=>h.point.y>2.5),'cover missing '+s.x);}
 const life=createPrecinctLife();assert.equal(life.tick(0,FRONTAGE_ARRIVAL,720).length,7);assert.equal(life.tick(0,FRONTAGE_ARRIVAL,60).length,0);disposeScene(group);
});
