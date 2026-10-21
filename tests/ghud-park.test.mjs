import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {gunzipSync} from 'node:zlib';
import * as T from '../public/game/three.module.js';
import {GHUD_PARK,GHUD_PLACE,GHUD_ARRIVAL,GHUD_TRAIL,GHUD_ACTIVITIES,GHUD_BENCHES,GHUD_KIOSKS,ghudPoint,ghudLocal,ghudRange,ghudPeople,ghudStructures} from '../public/game/ghud-park-data.js';
import {createGhudPark} from '../public/game/ghud-park.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {nearPrecinctActivity,createPrecinctLife,precinctAmbience} from '../public/game/precinct-life.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {distanceMetres,projectOnSegment,bearingTo} from '../public/game/motion.js';
import {roadWidth} from '../public/game/street-safety.js';import {disposeScene} from '../public/game/render-utils.js';
const roads=[0,1].flatMap(i=>JSON.parse(gunzipSync(readFileSync(`public/maps/accra-v1/source-road-${i}.geojson.gz`))).features).filter(r=>r.geometry.type==='LineString'&&!['path','steps','track','pedestrian'].includes(r.properties.class)&&!r.properties.layer).flatMap(r=>r.geometry.coordinates.slice(1).map((b,i)=>({r,a:r.geometry.coordinates[i],b}))).filter(s=>projectOnSegment(GHUD_PARK.position,s.a,s.b).distance<160);
const clear=p=>Math.min(...roads.map(s=>projectOnSegment(p,s.a,s.b).distance-roadWidth(s.r.properties.class)/2));
const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};
const physics=()=>{const p=createBuildingPhysics(map);p.refresh(GHUD_PARK.position,true);return p;};
test('Ghud Park is a searchable outdoor destination with a clear arrival and activity route',()=>{
 const places=searchPlaceIndex(indexPlaces([]),'Ghud Park').items;assert.equal(places.filter(p=>p.id===GHUD_PLACE.id).length,1);assert.ok(isOutdoorLandmark(GHUD_PLACE));assert.deepEqual(landmarkArrival(GHUD_PLACE).position,GHUD_ARRIVAL);
 const p=physics();assert.equal(p.collision(GHUD_ARRIVAL,.28,0),null);assert.ok(ghudRange(GHUD_ARRIVAL));assert.equal(nearPrecinctActivity(GHUD_ARRIVAL).id,'ghud-welcome');
 for(const a of GHUD_ACTIVITIES){assert.equal(nearPrecinctActivity(a.position).id,a.id);assert.equal(p.collision(a.position,.28,0),null,a.id);assert.ok(clear(a.position)>2,a.id);}
 // Traverse the open gate in both directions, then the entire lawn loop.
 for(const [from,to] of [[[-45,47],[-33,47]],[[-33,47],[-45,47]],...GHUD_TRAIL.slice(1).map((b,i)=>[GHUD_TRAIL[i],b])]){const end=ghudPoint(...to),m=p.moveWalker(ghudPoint(...from),end,0);assert.ok(distanceMetres(m.position,end)<.04,JSON.stringify([from,to,m]));}
});
test('park furniture, gates and visitors leave neighbouring roads and the service lanes open',()=>{
 const p=physics();for(const s of ghudStructures())for(const x of [-s.w/2,s.w/2])for(const z of [-s.d/2,s.d/2])assert.ok(clear(ghudPoint(s.x+x,s.z+z))>.5,s.id);
 for(const s of roads)for(let i=0;i<=10;i++){const pos=s.a.map((v,j)=>v+(s.b[j]-v)*i/10);if(distanceMetres(pos,GHUD_PARK.position)>140)continue;assert.equal(p.vehicleCollision(pos,bearingTo(s.a,s.b),'minibus'),false,'road '+s.r.id);}
 for(let t=0;t<400;t+=3)for(const n of ghudPeople(t)){assert.ok(clear(n.position)>3,n.id);assert.equal(p.collision(n.position,.28,0),null,n.id);assert.ok(ghudRange(n.position));}
});
test('visual geometry and solid furniture agree after geographic rotation',()=>{
 const {group}=createGhudPark();group.updateMatrixWorld(true);
 const origin=GHUD_PARK.position,p=ghudPoint(22,29),expected=new T.Vector3((p[0]-origin[0])*111320*Math.cos(origin[1]*Math.PI/180),1,(origin[1]-p[1])*111320);
 assert.ok(new T.Raycaster(new T.Vector3(expected.x,10,expected.z),new T.Vector3(0,-1,0)).intersectObject(group,true).some(h=>h.point.y>3),'tower disagrees with mapped footprint');
 const p2=physics();for(const k of GHUD_KIOSKS)assert.ok(p2.collision(ghudPoint(k.x,k.z),.28,0));
 for(const b of GHUD_BENCHES)assert.ok(p2.collision(ghudPoint(b.x,b.z),.28,0));
 assert.ok(group.userData.batching.after<=35,JSON.stringify(group.userData.batching));assert.ok(group.userData.batching.before>500);assert.equal(group.userData.ghud.temporaryTents,false);disposeScene(group);
});
test('park crowd is bounded and local; seats remain free for players and night is quiet',()=>{
 const life=createPrecinctLife(),people=life.tick(20,GHUD_ARRIVAL,720);assert.equal(people.length,9);assert.ok(people.every(p=>p.id.startsWith('ghud-')));assert.equal(life.tick(20,GHUD_ARRIVAL,60).length,0);assert.equal(precinctAmbience(GHUD_ARRIVAL,people).surf,0);
 for(const spot of GHUD_ACTIVITIES.filter(a=>a.kind==='sit'))assert.ok(people.every(p=>distanceMetres(spot.seatPosition,p.position)>1));
 for(const [x,z] of [[-20,-50],[10,45],[0,0]]){const roundTrip=ghudLocal(ghudPoint(x,z));assert.ok(Math.hypot(roundTrip[0]-x,roundTrip[1]-z)<.001);}
});
