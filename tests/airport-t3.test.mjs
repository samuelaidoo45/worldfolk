import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import * as T from '../public/game/three.module.js';
import {AIRPORT_T3,T3_PLACE,T3_ARRIVAL,T3_ACTIVITIES,T3_SEATS,t3Point,airportT3People} from '../public/game/airport-t3-data.js';
import {T3_ROAD_PROFILES,airportRoadSurface} from '../public/game/airport-t3-roads.js';
import {roadHeight,sameRoadLevel,trackRoadSurface} from '../public/game/road-elevation.js';
import {createAirportT3} from '../public/game/airport-t3.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {isCityLandmark} from '../public/game/city-landmarks.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {nearPrecinctActivity,createPrecinctLife} from '../public/game/precinct-life.js';
import {projectOnSegment,distanceMetres,bearingTo,offsetMetres} from '../public/game/motion.js';
import {roadWidth} from '../public/game/street-safety.js';
import {chaseCamera} from '../public/game/chase-camera.js';
import {bodyContact} from '../public/game/vehicle-contacts.js';
import {makeRoadPath,advanceRoad,roadContinuation} from '../public/game/traffic-routing.js';
import {disposeScene} from '../public/game/render-utils.js';
const context=JSON.parse(readFileSync(new URL('./fixtures/airport-t3-context.json',import.meta.url)));
function physics(){const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.building,isSourceLoaded:()=>true});p.refresh(AIRPORT_T3.position,true);return p;}
function clearGroundRoad(position){for(const r of T3_ROAD_PROFILES)for(const s of r.segments){const q=projectOnSegment(position,s.a,s.b),t=s.start+(s.end-s.start)*q.t;if(r.height(q.position,t)>2.2)continue;assert.ok(q.distance>r.width/2+.28,'ground road '+r.id+' at '+position);}}
test('one canonical airport destination preserves aliases and replaces only its ten spatially verified source ways',()=>{
 const found=searchPlaceIndex(indexPlaces([{name:'Terminal 3',lng:-.173,lat:5.602,type:'terminal'},{name:'Terminal 3',lng:-.225,lat:5.622,type:'terminal'}]),'Terminal 3').items;
 assert.equal(found.filter(p=>p.type==='terminal'||p.id===T3_PLACE.id).length,2);assert.equal(found.filter(p=>p.id===T3_PLACE.id).length,1);for(const id of AIRPORT_T3.sourceIds)assert.ok(isCityLandmark(id));assert.equal(isCityLandmark(604752520),false,'a different Terminal 3 roof elsewhere is untouched');
 assert.deepEqual(landmarkArrival(T3_PLACE).position,T3_ARRIVAL);assert.ok(isOutdoorLandmark(T3_PLACE));assert.equal(searchPlaceIndex(indexPlaces([]),'Kotoka Terminal 3').items.length,1);
});
test('arrival, activities and overview camera clear native context and ground carriageways',()=>{
 const p=physics();assert.equal(p.collision(T3_ARRIVAL,.5),null);clearGroundRoad(T3_ARRIVAL);
 const camera=chaseCamera({position:T3_ARRIVAL,heading:bearingTo(T3_ARRIVAL,t3Point(10,-20)),physics:p,scenic:true});assert.ok(camera.distance>14);assert.equal(p.collision(camera.from,.3),null);
 for(const a of T3_ACTIVITIES){assert.equal(p.collision(a.position,.28),null,a.id);assert.equal(nearPrecinctActivity(a.position)?.id,a.id);clearGroundRoad(a.position);}
});
test('covered arrivals remains walkable with accessible seats and no solid slab at ground level',()=>{
 const p=physics();for(const x of [-20,0,20,35])for(const z of [-60,-50,-32])assert.equal(p.collision(t3Point(x,z),.3),null,x+','+z);
 for(const seat of T3_SEATS){const a=t3Point(seat.x,seat.z-3),b=t3Point(seat.x,seat.z-1.2);assert.ok(distanceMetres(p.moveWalker(a,b).position,b)<.1);assert.ok(p.collision(t3Point(seat.x,seat.z),.3)?.id.includes('seat'));}
 const crossing=t3Point(43,-76.3);assert.equal(p.collision(crossing,.4,0),null,'walking below departure road');
});
test('travellers stay in covered public space with continuous motion and no arrival-point overlap',()=>{
 const p=physics();let last;
 for(let t=0;t<80;t+=.2){const people=airportT3People(t,T3_ARRIVAL);assert.equal(people.length,3);for(const a of people){assert.ok(distanceMetres(a.position,T3_ARRIVAL)>2);if(!a.moving)continue;assert.equal(p.collision(a.position,.28),null);clearGroundRoad(a.position);if(last)assert.ok(distanceMetres(last,a.position)<.18);last=a.position;}}
 assert.equal(createPrecinctLife().tick(0,T3_ARRIVAL).length,3);
});
test('departure ramp joins are continuous, with ground endpoints and a raised central carriageway',()=>{
 const roads=[626883873,626883875,626883872].map(id=>T3_ROAD_PROFILES.find(r=>r.id===id));
 assert.equal(roads[0].height(roads[0].coordinates[0],0),0);assert.equal(roads.at(-1).height(roads.at(-1).coordinates.at(-1),1),0);
 for(let i=1;i<roads.length;i++){assert.ok(distanceMetres(roads[i-1].coordinates.at(-1),roads[i].coordinates[0])<.1);assert.equal(roads[i-1].height(null,1),roads[i].height(null,0));}
 for(const r of roads)for(const s of r.segments)for(let i=0;i<=10;i++){const pos=s.a.map((v,j)=>v+(s.b[j]-v)*i/10),t=s.start+(s.end-s.start)*i/10;assert.ok(Math.abs(roadHeight(pos,bearingTo(s.a,s.b),r.id)-r.height(pos,t))<.01);}
 const mid=roads[1].coordinates[7],h=bearingTo(mid,roads[1].coordinates[8]);assert.equal(roadHeight(mid,h,roads[1].id),6);const held=trackRoadSurface(mid,h);assert.equal(trackRoadSurface(mid,h+75,held).roadId,held.roadId);
});
test('cars on upper and lower levels neither contact nor block each other',()=>{
 const r=T3_ROAD_PROFILES.find(r=>r.id===626883875),pos=r.coordinates[7],heading=bearingTo(pos,r.coordinates[8]),upper={id:'upper',position:pos,heading,driving:true,vehicle:'car',roadId:r.id},lower={id:'lower',position:pos,heading:heading+90,driving:false,elevation:0};assert.equal(sameRoadLevel(upper,lower),false);assert.equal(bodyContact(upper,lower),null);
});
test('a vehicle can traverse the mapped departure road without colliding or deadlocking',()=>{
 const p=physics(),roads=[626883873,626883875,626883872].map(id=>T3_ROAD_PROFILES.find(r=>r.id===id)),coordinates=roads.flatMap((r,i)=>i?r.coordinates.slice(1):r.coordinates),path=makeRoadPath(coordinates,0);let progress=0,speed=0;
 for(let t=0;t<200&&progress<path.total-.1;t+=.1){const next=advanceRoad(path,progress,speed,.1,p,[],'van');assert.equal(next.blocked,false,'blocked at '+progress);progress=next.distance;speed=next.speed;}
 assert.ok(progress>path.total-.1,'reaches end of '+path.total+'m route');
 const r=roads[0],next=roads[1],a={id:'car-7',line:r.coordinates,index:r.coordinates.length-1,layer:1,roadId:r.id,heading:bearingTo(r.coordinates.at(-2),r.coordinates.at(-1)),vehicle:'car',turns:0};assert.ok(roadContinuation(a,[{line:next.coordinates,layer:1,roadId:next.id,oneway:1,width:9}]),'native route continuation');
});
test('roof, glazing, canopies and native gate links produce finite batched geometry',()=>{
 const {group}=createAirportT3();assert.equal(group.userData.airportT3.sourceIds.length,10);assert.ok(group.userData.batching.after<100,JSON.stringify(group.userData.batching));group.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.getAttribute('position'),uv=o.geometry.getAttribute('uv');assert.ok(Array.from(p.array).every(Number.isFinite));assert.equal(p.count,uv.count);});const bounds=new T.Box3().setFromObject(group);assert.ok(bounds.max.y>17&&bounds.max.y<21);disposeScene(group);
});
