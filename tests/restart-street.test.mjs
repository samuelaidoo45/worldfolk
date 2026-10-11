import test from 'node:test';
import assert from 'node:assert/strict';
import {offsetMetres,distanceMetres} from '../public/game/motion.js';
import {roadIntrusion,sidewalkMove,reversePedestrian} from '../public/game/pedestrian-paths.js';
import {createCityLife} from '../public/game/city-life.js';
import {createBuildingVisibility} from '../public/game/building-visibility.js';
import {chaseCamera} from '../public/game/chase-camera.js';
const origin=[-.18,5.56],p=(x,y)=>offsetMetres(origin,x,y);
const physics={count:1,collision:()=>null,move:(a,b)=>({position:b,blocked:false}),moveVehicle:(a,b)=>({position:b,blocked:false})};
const road={line:[p(0,-150),p(0,150)],width:7,roadClass:'street'};
test('sidewalk movement never crosses the carriageway, including at intersections',()=>{
 assert.equal(sidewalkMove(p(5,0),p(-5,0),physics,[road]).blocked,true);
 assert.equal(sidewalkMove(p(5,0),p(5,10),physics,[road]).blocked,false);
 assert.equal(sidewalkMove(p(1,0),p(5,0),physics,[road]).blocked,false,'an existing overlap can escape toward the pavement');
 const cross={...road,line:[p(-100,0),p(100,0)]};
 assert.equal(sidewalkMove(p(5,-5),p(5,5),physics,[road,cross]).blocked,true);
});
test('pedestrians turn around on the same pavement over multiple patrol laps',()=>{
 const localPhysics={...physics},line=[p(0,-25),p(0,25)],city=createCityLife({querySourceFeatures:()=>[{geometry:{type:'LineString',coordinates:line},properties:{class:'street'}}]},localPhysics);
 city.tick(.02,p(35,0),3000);const person=city.actors.find(a=>!a.driving);assert.ok(person);localPhysics.count=0;
 for(const a of city.actors)if(a!==person)a.position=p(1000,1000);
 Object.assign(person,{position:p(4.65,24),line,index:1,direction:1,side:4.65,speed:1,heading:0,pauseUntil:0});
 let south=false,north=false;
 for(let i=0;i<6000;i++){city.tick(.02,p(35,0),3001+i*20);assert.ok(roadIntrusion(person.position,[road])<.0001);if(person.direction===-1)south=true;if(south&&person.direction===1)north=true}
 assert.ok(south&&north);assert.ok(distanceMetres(person.position,p(4.65,0))<27);
 const n={line,index:1,direction:1,side:4.65};reversePedestrian(n);assert.equal(n.side,-4.65);
});
test('drivers ahead of public transport continue forward rather than repeatedly pulling over',()=>{
 const line=[p(0,-150),p(0,150)],city=createCityLife({querySourceFeatures:()=>[{geometry:{type:'LineString',coordinates:line},properties:{class:'motorway',oneway:true}}]},physics);
 city.tick(.02,p(40,0),3000);const car=city.actors.find(a=>a.driving);assert.ok(car);
 for(const a of city.actors)if(a!==car)a.position=p(1000,1000);
 Object.assign(car,{position:p(1.61,16),heading:0,side:1.61,line,index:1,direction:1,speed:0,width:7,maxSpeed:16});
 for(let i=0;i<300;i++){city.setPriority(p(1.61,0),0,3001);city.tick(.02,p(1.61,0),3001,'transit')}
 assert.ok(car.position[1]>p(0,55)[1],'lead driver clears the lane by driving ahead');assert.equal(car.priorityYield,undefined);
});
test('detailed shells replace native extrusion only when ready, without rebuilding tiles',()=>{
 const calls=[],sync=createBuildingVisibility({setFeatureState:(feature,state)=>calls.push([feature.id,state.detailed])});
 const items=[{sourceId:5},{sourceId:5},{sourceId:9},{sourceId:undefined}];
 sync(items,true,[{sourceId:5}]);assert.deepEqual(calls,[[9,true]]);
 sync(items,true,[]);assert.deepEqual(calls,[[9,true],[5,true]]);
 sync(items,true,[]);assert.equal(calls.length,2,'unchanged frames do not change map state');
 sync(items,false);assert.deepEqual(calls.slice(2).sort((a,b)=>a[0]-b[0]),[[5,false],[9,false]]);
 sync(items,true);sync([],true);assert.deepEqual(calls.slice(-2).sort((a,b)=>a[0]-b[0]),[[5,false],[9,false]]);
});
test('street camera gives a low, stable road view and keeps the player in third person',()=>{
 const street=chaseCamera({position:origin,heading:0,street:true,physics}),third=chaseCamera({position:origin,heading:0,physics});
 assert.ok(street.altitude<third.altitude);assert.ok(street.distance>=4&&street.distance<third.distance);assert.ok(street.targetAltitude<street.altitude);
 const car=chaseCamera({position:origin,heading:0,street:true,driving:true,physics});assert.ok(car.distance>street.distance&&car.distance<=12);assert.ok(car.altitude<3.3);
});
