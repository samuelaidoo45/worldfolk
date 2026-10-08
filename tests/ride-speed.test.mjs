import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_RIDE_SPEED,nextRideSpeed,MAX_RIDE_PROGRESS_SPEED} from '../public/game/ride-speed.js';
test('rides default to 4x and can cycle through 8x and normal travel',()=>{
 assert.equal(DEFAULT_RIDE_SPEED,4);let rate=DEFAULT_RIDE_SPEED;
 for(const expected of [8,1,2,4]){rate=nextRideSpeed(rate);assert.equal(rate,expected)}
 assert.ok(MAX_RIDE_PROGRESS_SPEED>=22*8);
});
