import test from 'node:test';
import assert from 'node:assert/strict';
import {HOMES,startingLife,propertyId} from '../public/game/life-catalog.js';
test('every background starts at its randomly assigned, owned home',()=>{
 for(const wealth of [.1,.7,.99])for(let i=0;i<HOMES.length;i++){
  const start=startingLife(wealth,(i+.5)/HOMES.length),home=HOMES[i];
  assert.equal(start.life.home,home.id);
  assert.deepEqual(start.life.properties,[home.id]);
  assert.deepEqual([start.lng,start.lat],[home.lng,home.lat]);
 }
 assert.notEqual(propertyId('owner-a','starter'),propertyId('owner-b','starter'));
});
