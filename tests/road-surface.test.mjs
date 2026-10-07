import test from 'node:test';
import assert from 'node:assert/strict';
import {roadPotholes,potholeImpact} from '../public/game/road-surface.js';
import {offsetMetres} from '../public/game/motion.js';
const origin=[-.19,5.56],p=(x,y)=>offsetMetres(origin,x,y);
const roads=Array.from({length:12},(_,i)=>({properties:{class:'street'},geometry:{type:'LineString',coordinates:[p(i*8,-70),p(i*8,70)]}}));
test('potholes have stable road positions and exclude dirt, bridges and footpaths',()=>{
 const holes=roadPotholes(roads,origin);assert.ok(holes.length>0);assert.deepEqual(holes,roadPotholes([...roads,...roads],origin));
 assert.equal(roadPotholes(roads.map(r=>({...r,properties:{class:'street',surface:'unpaved'}})),origin).length,0);
 assert.equal(roadPotholes(roads.map(r=>({...r,properties:{class:'street',structure:'bridge'}})),origin).length,0);
 assert.equal(roadPotholes(roads.map(r=>({...r,properties:{class:'path'}})),origin).length,0);
});
test('a fast vehicle crossing a pothole triggers a jolt; parked and distant vehicles do not',()=>{
 const hole={id:'test',position:origin,radius:.8};assert.equal(potholeImpact([hole],p(0,-30),p(0,30),60),hole);assert.equal(potholeImpact([hole],p(5,-30),p(5,30),60),null);assert.equal(potholeImpact([hole],origin,origin,0),null);
});
test('pothole suspension jolts decay and do not repeat while stopped in the hole',async t=>{
 const {createRoadSurface}=await import('../public/game/road-surface.js');let now=2000;t.mock.method(performance,'now',()=>now);const map={addSource(){},addLayer(){},querySourceFeatures:()=>roads,getSource:()=>({setData(){}})},surface=createRoadSurface(map);surface.update(origin);const hole=surface.holes[0];assert.ok(hole);
 surface.hit(offsetMetres(hole.position,0,-4),offsetMetres(hole.position,0,4),15);now+=40;assert.ok(Math.abs(surface.sample().bounce)>.01);now+=1500;assert.equal(surface.sample().bounce,0);surface.hit(hole.position,hole.position,0);assert.equal(surface.sample().bounce,0);
});
