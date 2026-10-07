import test from 'node:test';
import assert from 'node:assert/strict';
import {roadContinuation,makeRoadPath,advanceRoad,trafficSpeed,vehiclesOverlap} from '../public/game/traffic-routing.js';
import {offsetMetres,distanceMetres} from '../public/game/motion.js';
const origin=[-.19,5.56],p=(x,y)=>offsetMetres(origin,x,y);
test('traffic connects through a T junction and never reverses down its incoming road',()=>{
 const incoming=[p(0,-30),p(0,0)],outgoing=[p(-30,0),p(30,0)],npc={id:'ambient-1',line:incoming,index:1,heading:0,layer:0};
 const next=roadContinuation(npc,[{line:incoming,layer:0},{line:outgoing,layer:0,oneway:1}]);assert.ok(next);assert.equal(next.direction,1);assert.deepEqual(next.line[next.index],p(30,0));assert.equal(roadContinuation(npc,[{line:incoming,layer:0}]),null);
 assert.equal(roadContinuation(npc,[{line:outgoing,layer:1}]),null);
});
test('vehicles brake behind a queue but do not collide with an opposing adjacent lane',()=>{
 const leader={id:'lead',position:p(0,6),heading:0,speed:0,driving:true};assert.ok(trafficSpeed(origin,0,10,14,[leader])<1);
 assert.equal(trafficSpeed(origin,0,10,14,[{...leader,position:p(3.2,6),heading:180}]),14);
 assert.equal(vehiclesOverlap(origin,0,p(3.2,0),180),false);assert.equal(vehiclesOverlap(origin,0,p(0,3),0),true);
});
test('passenger vehicle brakes for traffic and resumes after the queue clears',()=>{
 const path=makeRoadPath([origin,p(0,100)]),leader={position:p(0,14),heading:0,driving:true,speed:0};let value={distance:0,speed:8};
 for(let i=0;i<300;i++)value=advanceRoad(path,value.distance,value.speed,1/60,null,[leader]);assert.ok(value.distance<9.3);assert.ok(value.speed<.1);
 const before=value.distance;for(let i=0;i<120;i++)value=advanceRoad(path,value.distance,value.speed,1/60,null,[]);assert.ok(value.distance>before+3);
});
test('passenger route preserves a sharp road corner and stops at a building',()=>{
 const path=makeRoadPath([origin,p(0,10),p(10,10)]);let checks=0;
 const physics={moveVehicle(a,b){checks++;assert.ok(distanceMetres(a,b)<.26);return {position:b,blocked:b[0]>p(3,0)[0]}}};let value={distance:0,speed:10};
 for(let i=0;i<300;i++)value=advanceRoad(path,value.distance,value.speed,.05,physics,[]);assert.ok(checks>30);assert.ok(value.distance<13.1);assert.ok(value.distance>10);assert.equal(value.speed,0);
});
test('a bus eases inward on a narrow road without crossing its boundary',()=>{
 const path=makeRoadPath([origin,p(0,100)],1.6),physics={moveVehicle(a,b){return {position:b,blocked:b[1]>p(0,5)[1]&&b[0]>p(1,0)[0]}}};let value={distance:0,speed:5};
 for(let i=0;i<400;i++)value=advanceRoad(path,value.distance,value.speed,.05,physics,[]);assert.ok(value.distance>20);assert.ok(path.lane<1.01);assert.ok(path.lane>=0);
});
test('four-times playback covers more road using the same collision-safe steps',()=>{
 const run=rate=>{const path=makeRoadPath([origin,p(0,2000)]);let value={distance:0,speed:0};for(let frame=0;frame<600;frame++)for(let step=0;step<rate;step++)value=advanceRoad(path,value.distance,value.speed,1/60,null,[]);return value};
 const normal=run(1),fast=run(4);assert.ok(normal.speed>20);assert.ok(fast.distance>normal.distance*3.5);assert.ok(fast.speed<=22);
});
