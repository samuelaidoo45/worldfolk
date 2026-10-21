import test from 'node:test';import assert from 'node:assert/strict';import pc from 'polygon-clipping';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {COAST_GROUND,COAST_WALKS,COAST_WALLS,COAST_TREES,COAST_WALK_ROUTE,COAST_ACTIVITIES,CLUB_GATE,CLUB_TANK,coastColliders,coastLineRing} from '../public/game/coastal-precinct-data.js';
import {COAST_LAYOUT_SOURCES,COAST_OCEAN} from '../public/game/coastal-precinct-map.js';
import {CIVIC_BUILDINGS,CIVIC_VISITS,CIVIC_SITES,civicBuildingClear,civicRoadClear,civicInside,civicLocal} from '../public/game/independence-neighbourhood-data.js';
import {CIVIC_ROADS} from '../public/game/independence-neighbourhood-map.js';
import {createCityLandmark} from '../public/game/city-landmarks.js';import {modelCost} from '../public/game/world-streaming.js';import {disposeScene} from '../public/game/render-utils.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';import {distanceMetres,projectOnSegment,offsetMetres} from '../public/game/motion.js';import {roadWidth} from '../public/game/street-safety.js';
const context=JSON.parse(readFileSync(new URL('./fixtures/independence-neighbourhood-context.json',import.meta.url))),origin={position:[-.1945,5.5463]},local=rs=>rs.map(r=>r.map(p=>civicLocal(origin,p).map(v=>Math.round(v*10000)/10000)));
const area=polys=>polys.reduce((n,g)=>n+g.reduce((sum,r,i)=>sum+(i?-1:1)*Math.abs(r.slice(1).reduce((a,b,j)=>a+r[j][0]*b[1]-b[0]*r[j][1],0)/2),0),0);
test('coastal geometry is prepared offline and pinned to native source inputs',()=>{
 for(const [p,h] of Object.entries(COAST_LAYOUT_SOURCES))assert.equal(createHash('sha256').update(readFileSync(new URL('../'+p,import.meta.url))).digest('hex'),h,p);
 assert.ok(COAST_GROUND.length>10);assert.ok(COAST_WALKS.length>10);assert.ok(COAST_WALLS.length>20);
});
test('bare ground, sparse vegetation and compacted verges do not cover buildings, roads, ocean or square',()=>{
 const all=[...COAST_GROUND,...COAST_WALKS].map(g=>local(g.rings)),roads=CIVIC_ROADS.filter(r=>!['path','pedestrian','steps','cycleway'].includes(r.class)).flatMap(r=>r.coordinates.slice(1).map((b,i)=>local([coastLineRing(r.coordinates[i],b,roadWidth(r.class)+.2)]))),square=local([CIVIC_ROADS.find(r=>r.id===11529315).coordinates]);
 const obstacles=[...roads,...context.buildings.map(b=>local(b.geometry.coordinates)),...COAST_OCEAN.map(local),square],bounds=g=>{const p=g.flat();return [Math.min(...p.map(p=>p[0])),Math.min(...p.map(p=>p[1])),Math.max(...p.map(p=>p[0])),Math.max(...p.map(p=>p[1]))];},overlap=(a,b)=>{const A=bounds(a),B=bounds(b);return A[0]<B[2]&&A[2]>B[0]&&A[1]<B[3]&&A[3]>B[1];};
 // Check each independent obstacle. Unioning hundreds of nearly coincident
 // far-away native edges first creates irrelevant sweep-line roundoff.
 for(const g of all)for(const o of obstacles)if(overlap(g,o))assert.ok(area(pc.intersection(g,o))<.02,'no surface over a carriageway / building / water / square');
 assert.ok(area(all)>60000,'bounded coastal cover');
 for(const kind of ['earth','grass','sparse'])assert.ok(COAST_GROUND.some(g=>g.kind===kind));
 for(const g of COAST_GROUND)for(const w of COAST_WALKS){const A=local(g.rings),B=local(w.rings);if(overlap(A,B))assert.ok(area(pc.intersection(A,B))<.02,'no coplanar surface overlap');}
});
test('club compound preserves its native plate, clear gate and matching visible hard obstacles',()=>{
 const club=CIVIC_BUILDINGS.find(b=>b.id===312724288);assert.deepEqual(club.rings,context.buildings.find(b=>b.id===club.id).geometry.coordinates);assert.equal(club.wallHeight,7.5);
 assert.equal(coastColliders('club'),coastColliders('club'));
 for(const w of COAST_WALLS){assert.ok(projectOnSegment(CLUB_GATE.position,w.a,w.b).distance>CLUB_GATE.width/2);for(const p of [w.a,w.b]){assert.ok(civicRoadClear(p,.3));assert.ok(civicBuildingClear(p,.5));}}
 for(const t of COAST_TREES){assert.ok(civicRoadClear(t.position,1.1));assert.ok(civicBuildingClear(t.position,1.3));}
 assert.ok(civicRoadClear(CLUB_TANK.position,1.3));assert.ok(civicBuildingClear(CLUB_TANK.position,1.3));
 assert.ok(!coastColliders('club').some(c=>civicInside(CLUB_GATE.position,c.rings)));
});
test('players can walk from Ghana Club through its gap and along the coastal route to the square',()=>{
 const physics=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.buildings,isSourceLoaded:()=>true});
 let current=COAST_WALK_ROUTE[0],travelled=0;
 for(const end of COAST_WALK_ROUTE.slice(1)){const start=current,n=Math.ceil(distanceMetres(start,end)/4);for(let i=1;i<=n;i++){const to=start.map((v,k)=>v+(end[k]-v)*i/n);physics.refresh(current,true);const moved=physics.moveWalker(current,to,0);assert.ok(distanceMetres(to,moved.position)<.03,'blocked near '+JSON.stringify(to));travelled+=distanceMetres(current,moved.position);current=moved.position;assert.equal(moved.elevation,0);}}
 assert.ok(travelled>500);assert.ok(distanceMetres(current,COAST_WALK_ROUTE.at(-1))<.01);
});
test('the new photo point is reachable from the existing club arrival without moving the saved destination',()=>{
 const a=CIVIC_VISITS.find(v=>v.site==='club').position,b=COAST_ACTIVITIES[0].position;assert.deepEqual(a,[-.19712,5.54698]);
 const physics=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.buildings,isSourceLoaded:()=>true});physics.refresh(a,true);assert.ok(!physics.collision(b,.3,0));assert.ok(distanceMetres(physics.moveWalker(a,b,0).position,b)<.02);assert.ok(civicRoadClear(b,.3));
});
test('coastal packages remain finite and static, with soil rather than concrete tiles on bare plots',()=>{
 let total=0;for(const s of CIVIC_SITES){const m=createCityLandmark(s),cost=modelCost(m.group);total+=cost.vertices;if(['club','shore-west','shore-east'].includes(s.zone)){assert.ok(!m.update);assert.ok(cost.vertices<25000);assert.ok(cost.draws<=14);m.group.traverse(o=>{if(!o.isMesh)return;assert.ok(o.geometry.attributes.position.array.every(Number.isFinite));if(s.zone.startsWith('shore-')){assert.equal(o.material.userData.surface,'earth');assert.equal(o.material.map.name,'worldfolk-coastal-soil');assert.equal(o.material.userData.textureMetres,32);}});}disposeScene(m.group);}assert.ok(total<498220);
});
