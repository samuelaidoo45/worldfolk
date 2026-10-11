import test from 'node:test';
import assert from 'node:assert/strict';
import {gaitPose} from '../public/game/human-gait.js';

test('walking keeps a supporting foot; running has a short flight phase',()=>{
 let flight=0;
 for(let i=0;i<200;i++){
  const walk=gaitPose(i/200,1.65),run=gaitPose(i/200,5.2);
  assert.ok(walk.left.planted||walk.right.planted);
  if(!run.left.planted&&!run.right.planted)flight++;
  for(const g of [walk,run])for(const leg of [g.left,g.right]){
   assert.ok(leg.knee>=0&&leg.knee<2.5,'knees only bend anatomically');
   assert.ok(Number.isFinite(leg.hip+leg.ankle));
   if(leg.planted)assert.equal(leg.height,0);else assert.ok(leg.height>=0);
  }
 }
 assert.ok(flight>0&&flight<60,'running flight is brief');
});
test('stance velocity matches travel speed and foot targets are continuous at contact',()=>{
 for(const speed of [1.4,1.65,4.2]){
  const a=gaitPose(.1,speed),dt=.00001,b=gaitPose(.1+dt*a.cadence,speed);
  assert.ok(Math.abs((b.left.forward-a.left.forward)/dt+speed)<.001);
  const before=gaitPose(a.stance-1e-6,speed).left,after=gaitPose(a.stance+1e-6,speed).left;
  assert.ok(Math.abs(before.forward-after.forward)<.0001);
  assert.ok(Math.abs(before.height-after.height)<.0001);
 }
});
