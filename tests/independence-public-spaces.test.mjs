import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {SPACE_LAYOUT_SOURCES} from '../public/game/independence-public-space-map.js';
import {SPACE_FENCES,SPACE_GATES,SPACE_VERGES,SPACE_PATH_PIECES,SPACE_ACTIVITIES,SPACE_COURTS,SPACE_CROSSINGS,SPACE_EGG,SPACE_SERVICE_SOLIDS,SPACE_SERVICE,SPACE_PLAY,SPACE_LIGHTS,PARK_RING,STADIUM_RING,spaceRect,spacePoint,spaceRoadClear,spaceBuildingClear,spaceObstacle} from '../public/game/independence-public-space-data.js';
import {CIVIC_SITES,CIVIC_VISITS,civicColliders,civicInside} from '../public/game/independence-neighbourhood-data.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {offsetMetres,distanceMetres,projectOnSegment} from '../public/game/motion.js';
const context=JSON.parse(readFileSync(new URL('./fixtures/independence-neighbourhood-context.json',import.meta.url)));
test('offline boundary/path survey is pinned to its inputs instead of rebuilt during game startup',()=>{
 for(const [file,digest] of Object.entries(SPACE_LAYOUT_SOURCES))assert.equal(createHash('sha256').update(readFileSync(new URL('../'+file,import.meta.url))).digest('hex'),digest,'Rebuild public-space layout after changing '+file);
 assert.equal(Object.keys(SPACE_LAYOUT_SOURCES).length,3);
});
function physics(origin){const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.buildings,isSourceLoaded:()=>true});p.refresh(origin,true);return p;}
test('boundary detail stays within native parcels, clears roads/buildings and leaves real gate gaps',()=>{
 assert.ok(SPACE_FENCES.length>200&&SPACE_FENCES.length<450);
 for(const f of SPACE_FENCES){for(const p of [f.a,f.b]){assert.ok(civicInside(p,[f.zone==='park'?PARK_RING:STADIUM_RING]));assert.ok(spaceRoadClear(p,.39));assert.ok(spaceBuildingClear(p,.44));}for(const g of SPACE_GATES[f.zone])assert.ok(projectOnSegment(g,f.a,f.b).distance>=(f.zone==='park'?4.5:7)-1e-6);}
 const arrival=CIVIC_VISITS.find(v=>v.site==='stadium').position,p=physics(arrival);assert.equal(p.collision(arrival,.32,0),null,'saved stadium arrival remains outside the fence');
 for(const gate of SPACE_GATES.park)assert.equal(physics(gate).collision(gate,.28,0),null,'park gate remains open');
});
test('service building and playground have bounded footprints with matching hard obstacles',()=>{
 for(const s of SPACE_SERVICE_SOLIDS)for(const p of spaceRect(s.position,s.width,s.depth,SPACE_SERVICE.rotation)){assert.ok(civicInside(p,[PARK_RING]));assert.ok(spaceRoadClear(p,.3));assert.ok(spaceBuildingClear(p,.3));}
 for(const p of spaceRect(SPACE_PLAY.position,SPACE_PLAY.width,SPACE_PLAY.depth,SPACE_PLAY.rotation))assert.ok(civicInside(p,[PARK_RING]));
 const p=physics(SPACE_PLAY.position);assert.ok(p.collision(SPACE_PLAY.position,.28,0));assert.ok(p.collision(spacePoint(SPACE_PLAY,0,2.7),.28,0));assert.equal(p.collision(spacePoint(SPACE_PLAY,0,8.5),.28,0),null,'visible playground entry gap has no invisible fence');
 assert.ok(physics(SPACE_EGG.position).collision(SPACE_EGG.position,.28,0));
});
test('new paths and covered verges clear solids and carriageways; only two mapped approaches get paint',()=>{
 for(const w of SPACE_PATH_PIECES)for(const p of [w.a,w.b]){assert.ok(civicInside(p,[PARK_RING]));assert.ok(spaceRoadClear(p,1.19));assert.ok(!spaceObstacle(p,1.19));}
 for(const v of SPACE_VERGES)for(const p of [v.a,v.b])assert.ok(spaceRoadClear(p,1.49));
 assert.equal(SPACE_CROSSINGS.length,2);for(const c of SPACE_CROSSINGS){const p=context.roads.find(r=>r.id===c.pathId),r=context.roads.find(r=>r.id===c.roadId);assert.ok(p.geometry.coordinates.slice(1).some((b,i)=>projectOnSegment(c.position,p.geometry.coordinates[i],b).distance<.01));assert.ok(r.geometry.coordinates.slice(1).some((b,i)=>projectOnSegment(c.position,r.geometry.coordinates[i],b).distance<.01));}
});
test('all four tennis courts retain their exact mapped contours and do not occupy buildings',()=>{
 assert.equal(SPACE_COURTS.length,4);for(const c of SPACE_COURTS){assert.deepEqual(c,context.landuses.find(f=>f.id===c.id));for(const p of c.geometry.coordinates[0]){assert.ok(spaceRoadClear(p,.1));assert.ok(spaceBuildingClear(p,.1));}}
});
test('new activities are reachable from the park arrival without crossing fence or sculpture solids',()=>{
 const origin=CIVIC_VISITS.find(v=>v.site==='park').position,p=physics(origin),step=1.5,visited=new Set(['0,0']),queue=[[0,0]],targets=SPACE_ACTIVITIES.filter(a=>a.id.startsWith('nationalism-'));
 const point=(x,y)=>offsetMetres(origin,x*step,y*step);for(let n=0;n<queue.length;n++){const [x,y]=queue[n];for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy,key=X+','+Y;if(visited.has(key)||Math.abs(X)>90||Math.abs(Y)>65)continue;const q=point(X,Y);if(!civicInside(q,[PARK_RING])||p.collision(q,.32,0))continue;visited.add(key);queue.push([X,Y]);}}
 for(const a of targets)assert.ok(queue.some(([x,y])=>distanceMetres(point(x,y),a.position)<1.5),a.id);
 for(const a of SPACE_ACTIVITIES)assert.equal(physics(a.position).collision(a.position,.32,0),null,a.id);
});
test('collider refresh reuses cached shapes and bounds cull remote fence sections',()=>{
 for(const site of CIVIC_SITES.filter(s=>['park','stadium'].includes(s.zone))){const all=civicColliders(site);assert.equal(civicColliders(site),all);assert.ok(all.every(c=>c.bounds?.length===4));const nearby=civicColliders(site,SPACE_LIGHTS[0]);assert.ok(nearby.length<all.length);for(const c of nearby)assert.ok(all.includes(c));}
});
