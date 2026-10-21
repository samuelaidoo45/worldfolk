import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {gunzipSync} from 'node:zlib';
import * as T from '../public/game/three.module.js';import {CITY_GALLERIA,GALLERIA_PLACE,GALLERIA_RING,GALLERIA_OUTLINE,GALLERIA_ARRIVAL,GALLERIA_ENTRY,GALLERIA_AREAS,GALLERIA_STOCK,galleriaPoint,createGalleriaVisit,isCityGalleria} from '../public/game/city-galleria-data.js';
import {createCityGalleria} from '../public/game/city-galleria.js';import {buildCityGalleriaInterior} from '../public/game/city-galleria-interior-model.js';import {createBuildingPhysics} from '../public/game/building-physics.js';import {createRoomPhysics} from '../public/game/room-physics.js';import {isCityLandmark} from '../public/game/city-landmarks.js';import {landmarkArrival} from '../public/game/landmark-arrival.js';import {nearPrecinctActivity} from '../public/game/precinct-life.js';import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';import {distanceMetres,projectOnSegment,bearingTo} from '../public/game/motion.js';import {roadWidth} from '../public/game/street-safety.js';import {GOODS,JOBS} from '../public/game/life-catalog.js';import {disposeScene} from '../public/game/render-utils.js';
const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};
test('City Galleria has one canonical search identity and a clear forecourt-to-entrance visit',()=>{
 const index=indexPlaces([{...GALLERIA_PLACE,id:'mapped-galleria'}]);assert.equal(searchPlaceIndex(index,'City Galleria').total,1);assert.equal(isCityGalleria('The Galleria Accra'),false);assert.equal(isCityGalleria('The Gallery Apartments'),false);assert.ok(isCityGalleria('City Galleria Mall'));assert.ok(isCityLandmark(2274907674));assert.deepEqual(landmarkArrival(GALLERIA_PLACE).position,GALLERIA_ARRIVAL);
 const p=createBuildingPhysics(map);p.refresh(CITY_GALLERIA.position,true);assert.equal(p.collision(GALLERIA_ARRIVAL,.28,0),null);assert.equal(p.collision(GALLERIA_ENTRY,.28,0),null);assert.equal(nearPrecinctActivity(GALLERIA_ENTRY).id,'city-galleria-enter');assert.ok(distanceMetres(p.moveWalker(GALLERIA_ARRIVAL,GALLERIA_ENTRY,0).position,GALLERIA_ENTRY)<.02);
});
test('mapped building, parked vehicles and entrance leave the Spintex and service roads clear',()=>{
 const p=createBuildingPhysics(map);p.refresh(CITY_GALLERIA.position,true);
 const roads=[0,1].flatMap(i=>JSON.parse(gunzipSync(readFileSync(`public/maps/accra-v1/source-road-${i}.geojson.gz`))).features).filter(f=>f.geometry.type==='LineString'&&!f.properties.layer&&!['path','steps','pedestrian','track'].includes(f.properties.class)).flatMap(r=>r.geometry.coordinates.slice(1).map((b,i)=>({r,a:r.geometry.coordinates[i],b}))).filter(s=>projectOnSegment(CITY_GALLERIA.position,s.a,s.b).distance<100);
 for(const s of roads)for(let i=0;i<=12;i++){const pos=s.a.map((v,j)=>v+(s.b[j]-v)*i/12);if(distanceMetres(pos,CITY_GALLERIA.position)>95)continue;assert.equal(p.vehicleCollision(pos,bearingTo(s.a,s.b),'minibus'),false,'blocked '+s.r.properties.name);}
 for(const point of [GALLERIA_ENTRY,GALLERIA_ARRIVAL])assert.ok(Math.min(...roads.map(s=>projectOnSegment(point,s.a,s.b).distance-roadWidth(s.r.properties.class)/2))>2);
 assert.equal(GALLERIA_RING.length,9);assert.ok(GALLERIA_OUTLINE.length>GALLERIA_RING.length);
});
test('every interior area has reachable lift, counter, seat and exit approaches',()=>{
 for(const area of Object.keys(GALLERIA_AREAS)){
  const m=buildCityGalleriaInterior(area),p=createRoomPhysics(m.blockers,m.layout.bounds),start=m.layout.spawn;assert.ok(p.clear(...start),area+' spawn');
  const queue=[start],seen=new Set([start.join(',')]);for(let i=0;i<queue.length;i++){const a=queue[i];for(const d of [[0,1],[0,-1],[1,0],[-1,0]]){const b=[a[0]+d[0],a[1]+d[1]],key=b.join(',');if(!seen.has(key)&&p.clear(...b)&&p.visible(a,b)){seen.add(key);queue.push(b);}}}
  for(const h of m.hotspots){assert.ok(p.clear(h.x,h.z),area+' '+h.id);assert.ok(queue.some(a=>Math.hypot(a[0]-h.x,a[1]-h.z)<.8),area+' cannot reach '+h.id);}
  if(m.layout.exit)assert.ok(p.clear(...m.layout.exit));assert.ok(m.group.userData.batching.after<40,area+JSON.stringify(m.group.userData.batching));disposeScene(m.group);
 }
});
test('lift transitions, persistent seats and dance require the local hotspot and explicit stop',()=>{
 const v=createGalleriaVisit();assert.equal(v.interact('lift:rooftop'),null);v.move([-3,-19]);assert.equal(v.interact('lift:offices').area,'offices');assert.deepEqual(v.position,GALLERIA_AREAS.offices.spawn);
 v.move([8,8]);v.interact('sit:office');assert.equal(v.active.kind,'sit');const old=v.position;v.move([0,20]);assert.deepEqual(v.position,old);assert.equal(v.interact('lift:retail'),null);assert.equal(v.nearby().actionId,'stop-activity');v.interact('stop-activity');assert.equal(v.active,null);
 v.move([1,20]);v.interact('lift:rooftop');v.move([0,-4]);v.interact('dance');assert.equal(v.active.kind,'dance');assert.equal(v.interact('lift:retail'),null);v.interact('stop-activity');v.move([-3,20]);v.interact('lift:retail');v.move([0,22]);assert.equal(v.nearby().kind,'exit');
});
test('catalogue stock, office work and exterior geometry are bounded and independent of real tenants',()=>{
 assert.deepEqual(GOODS.filter(g=>g.shops.includes(GALLERIA_PLACE.id)).map(g=>g.id).sort(),[...GALLERIA_STOCK].sort());const job=JOBS.find(j=>j.id==='galleria-office');assert.equal(job.wage,145);assert.equal(job.steps.length,3);assert.ok(job.steps.every(s=>s.place===GALLERIA_PLACE.id));
 const {group}=createCityGalleria();group.updateMatrixWorld(true);assert.equal(group.userData.cityGalleria.floors,5);assert.ok(group.userData.batching.after<30);const bounds=new T.Box3().setFromObject(group);assert.ok(bounds.max.y>=21&&bounds.max.y<23);group.traverse(o=>{if(o.geometry){const a=o.geometry.attributes.position;for(let i=0;i<a.count;i++)assert.ok(Number.isFinite(a.getX(i))&&Number.isFinite(a.getY(i))&&Number.isFinite(a.getZ(i)));}});disposeScene(group);
});
