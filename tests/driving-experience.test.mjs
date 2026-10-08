import test from 'node:test';
import assert from 'node:assert/strict';
import {bodyContact,driveWithContacts} from '../public/game/vehicle-contacts.js';
import {autoDriveInput} from '../public/game/auto-drive.js';
import {offsetMetres,distanceMetres,stepCar} from '../public/game/motion.js';
import {buildingStyle} from '../public/game/districts.js';
import {buildingDesign,interiorDesign} from '../public/game/building-design.js';
import {createCityLife} from '../public/game/city-life.js';
const origin=[-.19,5.56],p=(x,y)=>offsetMetres(origin,x,y),free={move:(a,b)=>({position:b,blocked:false}),moveVehicle:(a,b)=>({position:b,blocked:false})};
const car={heading:0,driving:true,vehicle:'car'};
test('near misses remain free and car impact transfers forward momentum',()=>{
 const other={...car,position:p(0,3.9),speed:0};
 const miss=driveWithContacts(origin,p(0,1),car,[0,14],[{...other,position:p(2.6,3.9)}],free,1000);assert.equal(miss.hits,0);assert.equal(miss.blocked,false);
 const hit=driveWithContacts(origin,p(0,.6),car,[0,14],[other],free,1000);assert.ok(hit.hits>0);assert.ok(hit.velocity[1]>3&&hit.velocity[1]<14);assert.ok(other.impactVelocity[1]>3);assert.ok(distanceMetres(origin,hit.position)>.5);assert.equal(bodyContact({...car,position:hit.position},other),null);
});
test('pedestrian impact moves the NPC without freezing the car; walls still stop it',()=>{
 const person={position:p(0,2.3),driving:false,heading:90,speed:0};const hit=driveWithContacts(origin,p(0,.8),car,[0,14],[person],free,1000);assert.ok(hit.hits>0);assert.ok(hit.velocity[1]>11);assert.ok(person.impactUntil>1000);assert.equal(hit.blocked,false);
 const wall={...free,moveVehicle:(a,b)=>b[1]>p(0,.5)[1]?{position:a,blocked:true}:{position:b,blocked:false}};const blocked=driveWithContacts(origin,p(0,2),car,[0,20],[],wall,1000);assert.equal(blocked.blocked,true);assert.ok(distanceMetres(origin,blocked.position)<.51);
});
test('an NPC pinned against a wall cannot be pushed through the building',()=>{
 const other={...car,position:p(0,3.9),speed:0},physics={...free,moveVehicle:(a,b)=>a[1]>p(0,3)[1]?{position:a,blocked:true}:{position:b,blocked:false}};
 const result=driveWithContacts(origin,p(0,1),car,[0,8],[other],physics,1000);assert.equal(result.blocked,true);assert.deepEqual(other.position,p(0,3.9));assert.ok(distanceMetres(origin,result.position)<.3);
});
test('auto-driving steers a road corner and stops at its destination using ordinary car physics',()=>{
 const coords=[origin,p(0,70),p(65,70)];let pos=p(1.25,0),speed=0,steer=0,heading=0,done=false,maxSpeed=0;
 for(let frame=0;frame<6000;frame++){const input=autoDriveInput(coords,pos,heading,speed),next=stepCar(speed,steer,heading,input.throttle,input.turn,input.brake,1/60);({speed,steer,heading}=next);const a=heading*Math.PI/180;pos=offsetMetres(pos,Math.sin(a)*speed/60,Math.cos(a)*speed/60);maxSpeed=Math.max(maxSpeed,speed);if(input.done&&speed<.2){done=true;break}}
 assert.ok(done,JSON.stringify({pos,speed,heading}));assert.ok(distanceMetres(pos,coords.at(-1))<7);assert.ok(maxSpeed>10);assert.equal(autoDriveInput(coords,p(100,0),0,10).offRoute,true);
});
test('mapped building class, height and colours override neighbourhood guesses',()=>{
 const geometry={type:'Polygon',coordinates:[[p(-5,-5),p(5,-5),p(5,5),p(-5,5),p(-5,-5)]]},feature={id:3,geometry,properties:{class:'house',height:3.6,'building:colour':'#b68055','roof:colour':'#8b4e36'}};
 const style=buildingStyle(feature),design=buildingDesign(feature);assert.equal(style.style,'plaster');assert.equal(style.height,3.6);assert.equal(style.roof,'flat');assert.equal(design.palette.wall,'#b68055');assert.equal(design.palette.roof,'#8b4e36');
});
test('retired traffic pulls aside for a priority corridor without teleporting',()=>{
 const line=[p(0,-150),p(0,150)],physics={...free,count:1,collision:()=>null};const city=createCityLife({querySourceFeatures:()=>[{geometry:{type:'LineString',coordinates:line},properties:{class:'motorway'}}]},physics);
 city.tick(.016,p(50,0),3000);const npc=city.actors.find(n=>n.driving);assert.ok(npc);for(const n of city.actors)n.position=p(1000,1000);Object.assign(npc,{position:p(1.6,25),heading:0,side:1.6,width:9,speed:0,retired:true});
 for(let i=0;i<120;i++){city.setPriority(origin,0,3001+i);const before=[...npc.position];city.tick(1/60,origin,3001+i,'transit');assert.ok(distanceMetres(before,npc.position)<.1)}assert.ok(npc.side>4.3);
});

test('an interior loads before nearby building tiles arrive',()=>{const d=interiorDesign({lng:origin[0],lat:origin[1],type:'home'},[]);assert.ok(d.palette.wall);});

test('auto-drive can turn toward a route behind the parked car',()=>{
 const coords=[origin,p(0,120)];let pos=p(1.25,0),speed=0,steer=0,heading=180,done=false;
 for(let i=0;i<7000;i++){const input=autoDriveInput(coords,pos,heading,speed),next=stepCar(speed,steer,heading,input.throttle,input.turn,input.brake,1/60);({speed,steer,heading}=next);const a=heading*Math.PI/180;pos=offsetMetres(pos,Math.sin(a)*speed/60,Math.cos(a)*speed/60);if(input.done&&speed<.2){done=true;break}}
 assert.ok(done,JSON.stringify({pos,speed,heading}));assert.ok(distanceMetres(pos,coords.at(-1))<7);
});
test('stopped traffic allows gentle recovery but red lights never do',async()=>{
 const {autoTrafficControl}=await import('../public/game/auto-drive.js');let waiting=0,result;
 for(let i=0;i<180;i++){result=autoTrafficControl({throttle:1,turn:0,brake:false},0,0,Infinity,waiting,1/60);waiting=result.waiting}
 assert.equal(result.throttle,1);assert.equal(result.brake,false);
 const moving=autoTrafficControl({throttle:1,turn:0,brake:false},.5,0,Infinity,waiting,1/60);assert.equal(moving.throttle,1);assert.equal(moving.brake,false);
 result=autoTrafficControl({throttle:1,turn:0,brake:false},0,0,0,waiting,1/60);assert.equal(result.throttle,0);assert.equal(result.waiting,0);
});
test('4x and 8x advance the same car simulation faster without larger physics steps',()=>{
 const coords=[origin,p(0,200)];
 function simulate(rate){let pos=p(1.25,0),speed=0,steer=0,heading=0;for(let frame=0;frame<120;frame++)for(let sub=0;sub<rate;sub++){const input=autoDriveInput(coords,pos,heading,speed),next=stepCar(speed,steer,heading,input.throttle,input.turn,input.brake,1/60);({speed,steer,heading}=next);const a=heading*Math.PI/180;pos=offsetMetres(pos,Math.sin(a)*speed/60,Math.cos(a)*speed/60)}return distanceMetres(origin,pos)}
 assert.ok(simulate(4)>simulate(1)*4);assert.ok(simulate(8)>simulate(4));
});
