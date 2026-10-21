import test from 'node:test';
import assert from 'node:assert/strict';
import {createPreparationQueue,landmarkDetail,humanDetail} from '../public/game/render-preparation.js';
import {planLandmarkStream} from '../public/game/world-streaming.js';
const flush=()=>new Promise(r=>setImmediate(r));
test('preparation only starts on a frame pump, deduplicates, and permits one active job',async()=>{
 let done,started=0,time=0;const q=createPreparationQueue({now:()=>time});const a=q.enqueue('a',()=>{started++;return new Promise(r=>done=r)});assert.equal(q.enqueue('a',()=>assert.fail()),a);const b=q.enqueue('b',()=>started++);
 assert.equal(started,0);q.pump();q.pump();assert.equal(started,1);time=35;done();assert.equal(await a,true);await flush();q.pump();assert.equal(await b,true);await flush();assert.equal(started,2);assert.equal(q.snapshot().maxMs,35);assert.equal(q.snapshot().completed,2);
});
test('travel/disposal invalidates queued and completing jobs without hanging callers',async()=>{
 const q=createPreparationQueue();let current=true,done;const a=q.enqueue('a',()=>new Promise(r=>done=r),()=>current),b=q.enqueue('b',()=>assert.fail(),()=>current);q.pump();current=false;done();assert.equal(await a,false);await flush();q.pump();assert.equal(await b,false);const c=q.enqueue('c',()=>assert.fail());q.close();assert.equal(await c,false);assert.equal(await q.enqueue('d',()=>{}),false);
});
test('preparation errors leave the queue usable and are reported',async()=>{
 const q=createPreparationQueue(),a=q.enqueue('bad',()=>{throw Error('driver unavailable')});q.pump();assert.equal(await a,false);await flush();const b=q.enqueue('good',()=>{});q.pump();assert.equal(await b,true);await flush();assert.equal(q.snapshot().failed,1);
});
test('building-edge and human LOD thresholds have hysteresis and protect close views',()=>{
 const building={width:80,depth:60};assert.equal(landmarkDetail(building,80,'medium'),'near');assert.equal(landmarkDetail(building,145,'near'),'near');assert.equal(landmarkDetail(building,145,'medium'),'medium');assert.equal(landmarkDetail(building,200),'medium');assert.equal(landmarkDetail(building,140,'near',{mobile:true}),'medium');
 assert.equal(humanDetail(10,'medium'),'near');assert.equal(humanDetail(30,'near'),'near');assert.equal(humanDetail(30,'medium'),'medium');assert.equal(humanDetail(40),'medium');
});
test('stream budget uses requested detail cost and schedules atomic detail replacement',()=>{
 const item={data:{id:'a',position:[0,0]},model:{},detail:'near',desiredDetail:'medium',cost:{vertices:200000,draws:80},costs:{medium:{vertices:30000,draws:12}}},plan=planLandmarkStream([item],[0,0]);assert.equal(plan.next,item);assert.deepEqual(plan.usage,{models:1,vertices:30000,draws:12});item.detail='medium';assert.equal(planLandmarkStream([item],[0,0]).next,undefined);
});
