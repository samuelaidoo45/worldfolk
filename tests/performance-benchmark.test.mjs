import test from 'node:test';
import assert from 'node:assert/strict';
import {createBenchmarkCapture,createBenchmarkPanel} from '../public/game/performance-benchmark.js';
test('benchmark separates startup, frame pacing and CPU submission instead of claiming GPU speed',()=>{
 const b=createBenchmarkCapture({durationMs:20000,startupMs:1000});b.start(0,{deviceClass:'emulated-viewport'});b.sample(0);for(let now=100;now<1000;now+=100)b.sample(now,{cpuSubmitMs:50});for(let now=1000;now<=20000;now+=20)b.sample(now,{cpuSubmitMs:2,draws:80,triangles:1000});const r=b.report();assert.equal(r.valid,true);assert.equal(r.complete,true);assert.equal(r.startupFrameIntervals.p95Ms,100);assert.equal(r.settledFrameIntervals.p95Ms,20);assert.equal(r.settledCpuSubmission.p95Ms,2);assert.equal(r.peak.draws,80);assert.equal(r.metadata.deviceClass,'emulated-viewport');assert.equal(r.firstRenderedFrameMs,0);assert.ok(r.limitations.some(s=>s.includes('not GPU')));assert.equal(b.running,false);
});
test('hidden/rotated runs and sample overflow cannot pass; a new run resets all data',()=>{
 const b=createBenchmarkCapture({durationMs:1000,startupMs:0,limit:30});b.start(0);for(let n=0;n<=1000;n+=10)b.sample(n);assert.equal(b.report().sampleLimitReached,true);assert.equal(b.report().valid,false);b.start(2000);b.interrupt('hidden');b.longTask(2000,90);b.sample(3000);assert.equal(b.report().valid,false);assert.equal(b.report().longTasks.maxMs,90);b.start(4000);assert.deepEqual(b.report().interruptions,[]);assert.equal(b.report().longTasks.count,0);b.finish(4500);assert.equal(b.report().complete,false);assert.equal(createBenchmarkPanel({enabled:true}),null);
});
test('real spikes are retained and no average FPS hides them',()=>{
 const b=createBenchmarkCapture({durationMs:10000,startupMs:0});b.start(0);let t=0;for(let n=0;n<400&&b.running;n++){t+=n%10===0?140:16;b.sample(t,{cpuSubmitMs:1})}b.finish(t);const r=b.report();assert.ok(r.settledFrameIntervals.p95Ms>=140);assert.ok(r.settledFrameIntervals.over100Ms>0);assert.ok(r.assessment.includes('spikes'));
});

test('cold-entry wait is explicit and shader failures invalidate a run',()=>{const b=createBenchmarkCapture({durationMs:3000,startupMs:500});b.start(100);b.sample(1100,{preparation:{failed:1}});b.sample(3100);const r=b.report();assert.equal(r.firstRenderedFrameMs,1000);assert.equal(r.valid,false);assert.ok(r.interruptions.includes('Graphics preparation reported failures'));});
