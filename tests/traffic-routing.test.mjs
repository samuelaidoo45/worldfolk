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
test('a stopped lead vehicle can be passed without overlap or crossing a building',async()=>{
 const {recoverTraffic}=await import('../public/game/traffic-routing.js');const physics={moveVehicle:(a,b)=>({position:b,blocked:false})},leader={id:'leader',position:p(1.6,6),heading:0,driving:true};let npc={id:'follower',position:p(1.6,0),heading:0,roadHeading:0,side:1.6,width:7};
 for(let i=0;i<240;i++){const result=recoverTraffic(npc,1/60,physics,[leader]);if(result)npc={...npc,position:result.position,side:result.side,recoverySide:result.goal};assert.equal(vehiclesOverlap(npc.position,0,leader.position,0),false)}
 assert.ok(npc.side<-2);assert.ok(trafficSpeed(npc.position,0,0,12,[leader])>10);const stopped={moveVehicle:(a,b)=>({position:a,blocked:true})};assert.equal(recoverTraffic({...npc,recoverySide:2},.05,stopped,[]),null);
});
test('a vehicle at an unconnected road end pulls clear of the traffic lane',async()=>{
 const {recoverTraffic}=await import('../public/game/traffic-routing.js');let npc={id:'end',position:p(1.6,0),heading:0,side:1.6,width:7,retired:true};const physics={moveVehicle:(a,b)=>({position:b,blocked:false})};
 for(let i=0;i<240;i++){const result=recoverTraffic(npc,1/60,physics,[]);if(result)npc={...npc,...result,recoverySide:result.goal}}assert.ok(npc.side>4.3);
});
test('city traffic recovers behind a stationary vehicle instead of freezing its queue',async()=>{
 const {createCityLife}=await import('../public/game/city-life.js');const line=[p(0,-150),p(0,150)],physics={count:1,collision:()=>null,move:(a,b)=>({position:b,blocked:false}),moveVehicle:(a,b)=>({position:b,blocked:false})};
 const city=createCityLife({querySourceFeatures:()=>[{geometry:{type:'LineString',coordinates:line},properties:{class:'motorway',oneway:true}}]},physics);city.tick(.016,p(50,0),3000,'walk');const car=city.actors.find(a=>a.driving);assert.ok(car);
 for(const a of city.actors)a.position=p(1000,1000);
 Object.assign(car,{position:p(1.6,0),heading:0,side:1.6,line,index:1,direction:1,speed:0,width:7,maxSpeed:12});const stoppedPlayer=p(1.6,14);
 for(let i=0;i<1800;i++){city.tick(1/60,stoppedPlayer,3001,'drive');assert.equal(vehiclesOverlap(car.position,car.heading,stoppedPlayer,0),false)}
 assert.ok(car.position[1]>p(0,30)[1],'driver must pass the obstruction and continue forward');
});
test('bus footprints need more clearance than cars',()=>{
 assert.equal(vehiclesOverlap(origin,0,p(0,6),0),false);assert.equal(vehiclesOverlap(origin,0,p(0,6),0,'bus','bus'),true);
});
test('unrecoverable traffic is cleared instead of permanently blocking the road',async()=>{
 const {createCityLife}=await import('../public/game/city-life.js');const physics={count:1,collision:()=>null,move:(a,b)=>({position:a,blocked:true}),moveVehicle:(a,b)=>({position:a,blocked:true})},line=[p(0,-150),p(0,150)];const city=createCityLife({querySourceFeatures:()=>[{geometry:{type:'LineString',coordinates:line},properties:{class:'motorway'}}]},physics);city.tick(.02,p(50,0),3000);const ids=city.actors.filter(a=>a.driving).map(a=>a.id);assert.ok(ids.length);
 for(let i=0;i<1100;i++)city.tick(.02,p(50,0),3001);assert.ok(!city.actors.some(a=>ids.includes(a.id)));
});
