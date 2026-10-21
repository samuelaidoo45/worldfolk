import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/three.module.js';
import {SPANNER,SPANNER_ROUTES,SPANNER_ARRIVAL,SPANNER_DECK_HEIGHT as H,SPANNER_ACTIVITIES,SPANNER_NAVIGATION,spannerLocal,spannerPoint} from '../public/game/spanner-data.js';
import {createSpanner} from '../public/game/spanner.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {distanceMetres,offsetMetres} from '../public/game/motion.js';
import {floorHeight,validatedElevation,precinctCollision} from '../public/game/precinct-navigation.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {landmarkArrival} from '../public/game/landmark-arrival.js';
import {nearPrecinctActivity,createPrecinctLife} from '../public/game/precinct-life.js';
import {disposeScene} from '../public/game/render-utils.js';
const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};
function physics(){const p=createBuildingPhysics(map);p.refresh(SPANNER.position,true);return p;}
function walk(p,points,height=0){let at=points[0];for(const to of points.slice(1)){const result=p.moveWalker(at,to,height);assert.ok(distanceMetres(result.position,to)<.025,`stopped at ${spannerLocal(result.position)} heading to ${spannerLocal(to)}; y=${result.elevation}`);assert.notEqual(validatedElevation(at,to,height,result.elevation),null);at=result.position;height=result.elevation;}return {at,height};}
test('both mapped stair approaches cross the raised deck and descend without teleporting',()=>{for(const reverse of [false,true]){const p=physics(),a=SPANNER_ROUTES[reverse?'westStairs':'eastStairs'],b=SPANNER_ROUTES[reverse?'eastStairs':'westStairs'];const first=walk(p,a);assert.ok(Math.abs(first.height-H)<.001);const end=walk(p,[first.at,...b.slice().reverse()],H);const outward=spannerLocal(b[0]),next=spannerLocal(b[1]),len=Math.hypot(outward[0]-next[0],outward[1]-next[1]);const ground=spannerPoint(outward[0]+(outward[0]-next[0])/len*2,outward[1]+(outward[1]-next[1])/len*2);assert.equal(walk(p,[end.at,ground],end.height).height,0);}});
test('return ramps are walkable in both directions, including level turns',()=>{for(const name of ['westRamp','eastRamp']){const p=physics(),route=SPANNER_ROUTES[name],up=walk(p,route);assert.ok(Math.abs(up.height-H)<.025);const down=walk(p,route.slice().reverse(),up.height);assert.ok(Math.abs(down.height)<.001);}});
test('bridge deck rails stop falls but the same road position remains open below',()=>{const p=physics();const result=p.moveWalker(SPANNER.position,spannerPoint(0,8),H);assert.ok(result.blocked);assert.equal(result.elevation,H);assert.ok(distanceMetres(result.position,SPANNER.position)<2.3);assert.equal(precinctCollision(SPANNER.position,.3,0),null);assert.equal(floorHeight(SPANNER.position,0),0);assert.equal(floorHeight(SPANNER.position,H),H);assert.equal(validatedElevation(SPANNER.position,SPANNER.position,0,H),null);assert.equal(validatedElevation(SPANNER.position,SPANNER.position,H,H,true),null);for(const x of [-17,-8,7,17]){const a=spannerPoint(x,-12),b=spannerPoint(x,12);for(const kind of ['car','taxi','bus','truck']){const r=p.moveVehicle(a,b,180,kind);assert.equal(r.blocked,false,kind);assert.ok(distanceMetres(r.position,b)<.025);}}});
test('search arrival and lookout use the correct footbridge and elevation',()=>{const results=searchPlaceIndex(indexPlaces([]),'Spanner').items,place=results.find(p=>p.id===SPANNER.id);assert.ok(place,'Footbridge stays searchable alongside the separate bus stop');assert.equal(place.id,SPANNER.id);assert.deepEqual(landmarkArrival(place).position,SPANNER_ARRIVAL);assert.equal(physics().collision(SPANNER_ARRIVAL,.3,0),null);assert.equal(nearPrecinctActivity(SPANNER.position,H)?.id,SPANNER_ACTIVITIES[0].id);assert.equal(nearPrecinctActivity(SPANNER.position,0),null);});
test('rendered stair and ramp centres agree with their walkable elevations',()=>{
 const model=createSpanner();model.group.updateMatrixWorld(true);assert.ok(model.group.userData.batching.after<=8);const ray=new T.Raycaster();
 for(const s of SPANNER_NAVIGATION.surfaces){ray.set(new T.Vector3(s.x,s.y+.08,s.z),new T.Vector3(0,-1,0));const hits=ray.intersectObject(model.group,true);assert.ok(hits.length,`missing surface ${s.x},${s.z}`);assert.ok(Math.abs(hits[0].point.y-s.y)<.025,`mesh/floor mismatch ${hits[0].point.y}/${s.y}`);}
 ray.set(new T.Vector3(0,0,0),new T.Vector3(0,1,0));const underside=ray.intersectObject(model.group,true)[0];assert.ok(underside.distance>5.8);disposeScene(model.group);
});

test('bridge visitors remain on the deck and never become ground traffic',()=>{const life=createPrecinctLife();for(let t=0;t<100;t+=.5){const actors=life.tick(t,SPANNER.position);assert.equal(actors.length,2);for(const a of actors){assert.equal(a.elevation,H);assert.equal(floorHeight(a.position,H),H);assert.equal(precinctCollision(a.position,.28,H),null);}}assert.equal(life.tick(0,SPANNER.position,0).length,1);});
