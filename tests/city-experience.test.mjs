import test from 'node:test';
import assert from 'node:assert/strict';
import {makeRoadPath,advanceRoad} from '../public/game/traffic-routing.js';
import {driveWithContacts,bodyContact} from '../public/game/vehicle-contacts.js';
import {offsetMetres,distanceMetres} from '../public/game/motion.js';
import {chaseCamera} from '../public/game/chase-camera.js';
import {CITY_DESTINATIONS} from '../public/game/city-destinations.js';
import {JOBS} from '../public/game/life-catalog.js';
import {hipRoofVertices} from '../public/game/roof-geometry.js';
import {setMapPresentation} from '../public/game/map-style.js';
const origin=[-.19,5.56],p=(x,y)=>offsetMetres(origin,x,y),free={move:(a,b)=>({position:b,blocked:false}),moveVehicle:(a,b)=>({position:b,blocked:false})};
test('transport recovers through a stalled queue of movable cars',()=>{
 const path=makeRoadPath([origin,p(0,200)]),cars=[7,11,15].map((y,i)=>({id:`c${i}`,position:p(0,y),driving:true,vehicle:'car',heading:0,speed:0}));let result={distance:0,speed:0};
 for(let i=0;i<1500;i++)result=advanceRoad(path,result.distance,result.speed,1/60,free,cars,'bus',Infinity,{now:1000+i*16});
 assert.ok(result.distance>20,JSON.stringify(result));assert.ok(distanceMetres(origin,cars[2].position)>25);
 for(let i=1;i<cars.length;i++)assert.equal(bodyContact(cars[i-1],cars[i]),null);
});
test('traffic recovery cannot run a red light or push a queue into a wall',()=>{
 const path=makeRoadPath([origin,p(0,100)]),car={position:p(0,5),driving:true,vehicle:'car',heading:0,speed:0};let result={distance:0,speed:0};
 for(let i=0;i<600;i++)result=advanceRoad(path,result.distance,result.speed,1/60,free,[car],'bus',0,{now:1000});assert.equal(result.distance,0);
 const cars=[3.8,7.6].map(y=>({...car,position:p(0,y)})),before=cars.map(c=>[...c.position]),wall={...free,moveVehicle:(a,b)=>b[1]>p(0,7.65)[1]?{position:a,blocked:true}:{position:b,blocked:false}};
 const hit=driveWithContacts(origin,p(0,1),{driving:true,vehicle:'car',heading:0},[0,12],cars,wall,1000);assert.equal(hit.blocked,true);assert.ok(cars[1].position[1]<=p(0,7.65)[1]);assert.equal(bodyContact(cars[0],cars[1]),null);assert.ok(distanceMetres(before[0],cars[0].position)<.2);
});
test('camera offers wider third person and eye-level first person',()=>{
 const third=chaseCamera({position:origin,heading:0}),first=chaseCamera({position:origin,heading:0,cabin:true});assert.equal(third.distance,13);assert.ok(third.altitude>5);assert.equal(first.distance,0);assert.equal(first.altitude,1.6);assert.equal(first.targetAltitude,1.55);
});
test('new jobs resolve to unique mapped destinations across requested categories',()=>{
 assert.ok(CITY_DESTINATIONS.length>=25);assert.equal(new Set(CITY_DESTINATIONS.map(p=>p.id)).size,CITY_DESTINATIONS.length);
 for(const type of ['restaurant','school','church','mosque','mall','stadium','marketplace','bank'])assert.ok(CITY_DESTINATIONS.some(p=>p.category===type),type);
 const jobs=JOBS.filter(j=>j.place.startsWith('g_'));assert.ok(jobs.length>=6);for(const job of jobs)assert.ok(CITY_DESTINATIONS.some(p=>p.id===job.place));
});
test('2D presentation retains land use and separates roads from ground',()=>{
 const values=new Map(),map={getLayer:()=>true,setPaintProperty:(id,key,v)=>values.set(`${id}:${key}`,v),setLayoutProperty:(id,key,v)=>values.set(`${id}:${key}`,v)};setMapPresentation(map,true);assert.equal(values.get('worldfolk-background:background-color'),'#e7ebe5');assert.equal(values.get('worldfolk-ground-texture:visibility'),'none');setMapPresentation(map,false);assert.equal(values.get('worldfolk-ground-texture:visibility'),'visible');
});
test('hipped roof has a raised ridge while retaining footprint eaves',()=>{const vertices=hipRoofVertices([[-4,-8],[4,-8],[4,8],[-4,8]],2);assert.equal(vertices.length,54);assert.equal(Math.max(...vertices.filter((_,i)=>i%3===1)),2);assert.equal(hipRoofVertices([[0,0],[1,0],[0,1]],2),null)});
