import test from 'node:test';
import assert from 'node:assert/strict';
import {stepWalker,stepCar,offsetMetres,distanceMetres,turnToward} from '../public/game/motion.js';
import {routeProgress} from '../public/game/navigation.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
const origin=[-.19,5.56];
const point=(x,y)=>offsetMetres(origin,x,y);
function physics(){const rings=[[point(0,-10),point(.3,-10),point(.3,10),point(0,10),point(0,-10)]];const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>[{id:1,geometry:{type:'Polygon',coordinates:rings},properties:{height:8}}]});p.refresh(point(-2,0),true);return p}
test('walking converges equally at 30 and 120 fps, and releases smoothly',()=>{const sample=fps=>{let v=[0,0];for(let i=0;i<fps;i++)v=stepWalker(v,0,1,0,false,1/fps);return v};assert.ok(Math.abs(sample(30)[1]-sample(120)[1])<.001);let v=sample(60);const next=stepWalker(v,0,0,0,false,1/60);assert.ok(next[1]>0&&next[1]<v[1]);assert.ok(Math.abs(stepWalker([0,0],1,1,0,false,1)[0]*Math.SQRT2-2.6)<.001)});
test('car brakes to rest, steering requires motion, reverse turns correctly',()=>{let car={speed:10,steer:0,heading:0};for(let i=0;i<90;i++)car=stepCar(car.speed,car.steer,car.heading,0,0,true,1/60);assert.equal(car.speed,0);assert.equal(stepCar(0,0,0,0,1,false,.1).heading,0);assert.ok(stepCar(5,1,0,0,1,false,.1).heading>0);assert.ok(stepCar(-2,1,0,0,1,false,.1).heading>300)});
test('swept walking and vehicle collision cannot tunnel across a thin wall',()=>{const p=physics();assert.ok(p.move(point(-5,0),point(5,0)).blocked);assert.ok(p.move(point(-5,0),point(5,0)).position[0]<origin[0]);assert.ok(p.moveVehicle(point(-5,0),point(5,0),90).blocked)});
test('walking slides along a wall and doorway stays at its midpoint',()=>{const p=physics(),result=p.move(point(-.7,-3),point(.7,3));assert.ok(result.blocked);assert.ok(distanceMetres(point(-.7,-3),result.position)>3);const a=p.nearestDoor(point(-3,-1)),b=p.nearestDoor(point(-3,1));assert.ok(distanceMetres(a.position,b.position)<.01)});
test('route progress reports road distance and off-route distance',()=>{const route=[point(0,0),point(0,100),point(100,100)],p=routeProgress(route,point(5,40));assert.ok(Math.abs(p.remaining-160)<.1);assert.ok(Math.abs(p.distance-5)<.1);assert.ok(Math.abs(turnToward(359,1,10,.1)-359)<2)});

test('forward acceleration has no fixed cap and impact damage scales with speed',async()=>{
 const {crashDamage}=await import('../public/game/motion.js');let car={speed:0,steer:0,heading:0};
 for(let i=0;i<60*60;i++)car=stepCar(car.speed,car.steer,car.heading,1,0,false,1/60);
 assert.ok(car.speed>200);assert.equal(crashDamage(5),0);assert.ok(crashDamage(20)>crashDamage(12));assert.equal(crashDamage(40),25);assert.equal(crashDamage(200),25);assert.equal(crashDamage(-40),25);
});
test('public transport follows each road segment, with bounded endpoints',async()=>{
 const {routePoint}=await import('../public/game/transit.js');const line=[[0,0],[.001,0],[.001,.001]];
 assert.deepEqual(routePoint(line,-1).position,line[0]);assert.deepEqual(routePoint(line,2).position,line[2]);const mid=routePoint(line,.75).position;assert.equal(mid[0],.001);assert.ok(mid[1]>0&&mid[1]<.001);
});

test('roadside clearance and traffic impact scale with road speed',async()=>{
 const {roadWidth,isHighway,sweptHit,pedestrianDamage}=await import('../public/game/street-safety.js');
 assert.ok(roadWidth('primary')/2+1.15>roadWidth('primary')/2);assert.equal(isHighway('motorway'),true);assert.equal(isHighway('street'),false);
 assert.equal(sweptHit([0,0],[.001,0],[.0005,0]),true);assert.equal(sweptHit([0,0],[.001,0],[.0005,.0001]),false);assert.ok(pedestrianDamage(12)>pedestrianDamage(4));assert.equal(pedestrianDamage(22,true),100);
});
test('building styles are stable and varied by building and district',async()=>{
 const {buildingStyle,districtAt}=await import('../public/game/districts.js');const feature=(x,y,id)=>({id,properties:{height:7},geometry:{type:'Polygon',coordinates:[[[x,y],[x+.0001,y],[x+.0001,y+.0001],[x,y+.0001],[x,y]]]}});
 const styles=new Set(Array.from({length:20},(_,i)=>buildingStyle(feature(-.1949+i*.0002,5.57,i)).style));assert.ok(styles.size>=4);const a=buildingStyle(feature(-.2141,5.5485,20));assert.equal(a.district,'market');assert.equal(a.height,7);assert.deepEqual(a,buildingStyle(feature(-.2141,5.5485,20)));assert.equal(districtAt([-.140846,5.561955]).kind,'beach');assert.equal(districtAt([-.1896,5.5907]).kind,'mosque');
});

test('a player and vehicle can retreat out of a newly loaded overlapping wall',()=>{
 const p=physics();const start=point(-.2,0),away=point(-3,0);
 assert.ok(p.collision(start,.62));const walk=p.move(start,away,.62);assert.ok(distanceMetres(walk.position,away)<.02);assert.equal(p.collision(walk.position,.62),null);
 assert.equal(p.vehicleCollision(start,0),true);const drive=p.moveVehicle(start,away,0);assert.equal(drive.blocked,false);assert.equal(p.vehicleCollision(drive.position,0),false);
});
test('courtyard boundaries collide on both sides and vehicle exits are clear',()=>{
 const outer=[point(-20,-20),point(20,-20),point(20,20),point(-20,20),point(-20,-20)],hole=[point(-3,-3),point(3,-3),point(3,3),point(-3,3),point(-3,-3)];
 const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>[{geometry:{type:'Polygon',coordinates:[outer,hole]},properties:{}}]});p.refresh(origin,true);
 assert.equal(p.collision(origin),null);assert.ok(p.collision(point(2.8,0),.6));assert.equal(p.vehicleExit(point(7,7),0),null,'no exit may be placed inside the building');
 const exit=p.vehicleExit(origin,0);assert.ok(exit);assert.equal(p.collision(exit,.7),null);assert.ok(distanceMetres(exit,origin)>2);
});
test('room movement sweeps furniture, slides and allows recovery from overlap',async()=>{
 const {createRoomPhysics}=await import('../public/game/room-physics.js');const p=createRoomPhysics([{x:0,z:0,w:1,d:3}]);
 const blocked=p.move([-2,0],[5,0]);assert.ok(blocked[0]<-.83);assert.ok(p.clear(...blocked));
 const slide=p.move([-.9,-1],[.4,3]);assert.ok(slide[1]>1.5);assert.ok(p.clear(...slide));
 const recovered=p.move([-.4,0],[-2,0]);assert.ok(p.clear(...recovered));assert.equal(p.visible([-2,0],[2,0]),false);
});

test('NPC, car and prop overlaps permit escape without entering a new obstacle',async()=>{
 const {moveAroundObstacles}=await import('../public/game/obstacle-motion.js');
 const base=[-.19,5.56],east=m=>offsetMetres(base,m,0),free=(a,b)=>({position:b,blocked:false});
 for(const radius of [.65,1.25,2.5,3.4]){
  const from=east(radius-.1),to=offsetMetres(from,.05,0),r=moveAroundObstacles(from,to,[{position:base,radius}],free,false);
  assert.ok(distanceMetres(base,r.position)>radius-.06,'overlapping actor can back away');assert.equal(r.blocked,false);
  const inward=moveAroundObstacles(from,offsetMetres(from,-.05,0),[{position:base,radius}],free,false);assert.ok(distanceMetres(from,inward.position)<.001,'cannot move deeper');
 }
 const crossed=moveAroundObstacles(east(-5),east(5),[{position:base,radius:1.25}],free,false);assert.ok(distanceMetres(base,crossed.position)>=1.249,'fast movement cannot tunnel through a parked car');
 const stuck=east(.6),wall=(a,b)=>({position:a,blocked:true});assert.deepEqual(moveAroundObstacles(stuck,east(2),[{position:base,radius:.65}],wall).position,stuck,'escape never bypasses building walls');
 const center=moveAroundObstacles(base,east(.1),[{position:base,radius:1}],free);assert.ok(distanceMetres(base,center.position)>.09,'exactly overlapping centres can separate');
});

test('MoMo conserves game money and rejects invalid or unfunded transfers',async()=>{
 const {exchangeMoMo}=await import('../public/game/street-services.js');
 const deposit=exchangeMoMo(120,0,80,'deposit');assert.deepEqual(deposit,{cash:40,balance:80});assert.deepEqual(exchangeMoMo(deposit.cash,deposit.balance,80,'withdraw'),{cash:120,balance:0});
 for(const amount of [-1,0,.5,NaN,Infinity,100001])assert.equal(exchangeMoMo(120,100,amount,'deposit'),null);
 assert.equal(exchangeMoMo(10,0,11,'deposit'),null);assert.equal(exchangeMoMo(10,0,1,'withdraw'),null);assert.equal(exchangeMoMo(10,10,1,'anything'),null);
});

test('a bumped pedestrian yields, while a wall still prevents displacement',async()=>{
 const {createCityLife}=await import('../public/game/city-life.js');let blocked=false;
 const physics={count:1,collision:()=>false,move:(a,b)=>({position:blocked?a:b,blocked}),moveVehicle:(a,b)=>({position:b,blocked:false})};
 const map={querySourceFeatures:()=>[{properties:{class:'street'},geometry:{type:'LineString',coordinates:[point(-100,0),point(100,0)]}}]};
 const city=createCityLife(map,physics);city.tick(.016,point(0,10),4000);const npc=city.actors.find(p=>!p.driving);assert.ok(npc);const initial=[...npc.position];city.nudgePedestrians(point(0,10),initial);assert.ok(distanceMetres(initial,npc.position)>.1);blocked=true;const next=[...npc.position];city.nudgePedestrians(initial,next);assert.deepEqual(npc.position,next);
});

test('physical car footprints permit close parallel passing but stop actual contact',async()=>{
 const {footprintGap,moveAroundObstacles}=await import('../public/game/obstacle-motion.js');
 const car={position:origin,heading:0,driving:true,vehicle:'car'},other={...car,position:point(2.2,0)};
 assert.ok(footprintGap(car,other)>0);assert.ok(footprintGap(car,{...other,position:point(2,0)})<0);
 assert.ok(footprintGap(car,{...other,position:point(0,3.8)})>0);assert.ok(footprintGap(car,{...other,position:point(0,3.6)})<0);
 const obstacle={position:other.position,radius:9,gap:position=>footprintGap({...car,position},other)};
 const pass=moveAroundObstacles(point(0,-5),point(0,5),[obstacle],(a,b)=>({position:b,blocked:false}),false);assert.equal(pass.blocked,false);
 const hit=moveAroundObstacles(point(2.2,-5),point(2.2,5),[obstacle],(a,b)=>({position:b,blocked:false}),false);assert.equal(hit.blocked,true);
 const escape=moveAroundObstacles(point(2.2,-3.5),point(2.2,-5),[obstacle],(a,b)=>({position:b,blocked:false}),false);assert.equal(escape.blocked,false);
});

test('a vehicle glances along a wall and can reverse after head-on contact',()=>{
 const p=physics(),from=point(-1.3,-5),to=point(.2,3),slide=p.moveVehicle(from,to,0);
 assert.ok(distanceMetres(from,slide.position)>5,'glancing contact retains forward travel');
 assert.equal(p.vehicleCollision(slide.position,0),false);
 const stopped=p.moveVehicle(point(-4,0),point(2,0),90);
 const reverse=p.moveVehicle(stopped.position,point(-5,0),90);
 assert.ok(distanceMetres(reverse.position,point(-5,0))<.02,'reverse must free the car');
});
test('tangent escape works from a slightly overlapping vehicle footprint',async()=>{
 const {moveAroundObstacles,footprintGap}=await import('../public/game/obstacle-motion.js');
 const obstacle={position:origin,driving:true,heading:0,vehicle:'bus'};
 const from=point(1.5,0),to=point(1.5,8);
 const box={position:origin,radius:9,gap:position=>footprintGap({position,heading:0,radius:.3},obstacle)};
 const r=moveAroundObstacles(from,to,[box],(a,b)=>({position:b,blocked:false}));
 assert.ok(distanceMetres(r.position,to)<.01,'parallel motion can escape an existing overlap');
});

test('chase camera contracts before a wall and extends smoothly after clearing it',async()=>{
 const {chaseCamera}=await import('../public/game/chase-camera.js');
 const wall={collision:p=>distanceMetres(origin,p)>1.8?{height:8}:null};
 const close=chaseCamera({position:origin,heading:0,physics:wall,previousDistance:7});
 assert.ok(close.distance<1.8);assert.equal(wall.collision(close.from),null);
 const clear=chaseCamera({position:origin,heading:0,physics:{collision:()=>null},previousDistance:close.distance});
 assert.ok(clear.distance>close.distance&&clear.distance<7);
 const scenic=chaseCamera({position:origin,heading:90,physics:{collision:()=>null},scenic:true});
 assert.equal(scenic.distance,20);assert.ok(scenic.altitude>7);
});
