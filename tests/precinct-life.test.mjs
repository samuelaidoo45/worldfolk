import test from 'node:test';
import assert from 'node:assert/strict';
import {PRECINCT_ACTIVITIES,nearPrecinctActivity,precinctAmbience,createPrecinctLife} from '../public/game/precinct-life.js';
import {PRECINCT_LANDMARKS,precinctFloors,precinctCollision,precinctLocal} from '../public/game/precinct-navigation.js';
const square=PRECINCT_LANDMARKS.find(p=>p.id==='independence-parade-ground');
test('every visitor activity is on a walkable surface, reachable without entering a wall',()=>{
 for(const spot of PRECINCT_ACTIVITIES){assert.ok(precinctFloors(spot.position).some(y=>Math.abs(y-spot.elevation)<.01),spot.id);assert.equal(precinctCollision(spot.position,.28,spot.elevation),null,spot.id);assert.equal(nearPrecinctActivity(spot.position,spot.elevation).id,spot.id);if(spot.elevation)assert.equal(nearPrecinctActivity(spot.position,0),null)}
});
test('plaza walkers stay inside pedestrian space and off memorial structures throughout their routes',()=>{
 const crowd=createPrecinctLife();for(let t=0;t<400;t+=3){for(const actor of crowd.tick(t,square.position,720)){if(!actor.moving)continue;const [x,z]=precinctLocal(square,actor.position);assert.ok(Math.abs(x)<40&&Math.abs(z)<35);assert.equal(precinctCollision(actor.position,.3,0),null)}}
});
test('crowd is bounded, stable by identity, reduced at night and removed outside the precinct',()=>{
 const life=createPrecinctLife(),day=life.tick(10,square.position,720);assert.ok(day.length>=20&&day.length<=24);assert.equal(new Set(day.map(a=>a.id)).size,day.length);assert.ok(day.some(a=>a.action==='sit'));assert.ok(day.some(a=>a.action==='photo'));assert.deepEqual(life.tick(10,square.position,720),day);assert.equal(life.tick(10,square.position,10).length,3);assert.deepEqual(life.tick(10,[-.1,5.7],720),[]);
});
test('ambience is limited to the square and tracks nearby visitors',()=>{
 assert.equal(precinctAmbience([-.1,5.7]),null);const quiet=precinctAmbience(square.position,[],720),busy=precinctAmbience(square.position,[{position:square.position}],720);assert.ok(busy.crowd>quiet.crowd);for(const v of Object.values(busy))assert.ok(v>=0&&v<.1);
});
