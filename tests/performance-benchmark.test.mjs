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

test('phase timings retain spikes, split startup and settled work and ignore missing values',()=>{
 const b=createBenchmarkCapture({durationMs:1000,startupMs:500});b.start(0);
 b.sample(0);b.sample(100,{phaseCpuMs:{preparation:80,streaming:NaN}});
 b.sample(500,{phaseCpuMs:{preparation:2,streaming:35,crowd:-1}});
 b.sample(1000,{phaseCpuMs:{preparation:3,streaming:1}});
 const r=b.report();assert.equal(r.schema,4);
 assert.equal(r.phaseCpuMs.preparation.startup.maxMs,80);
 assert.equal(r.phaseCpuMs.preparation.settled.samples,2);
 assert.equal(r.phaseCpuMs.streaming.settled.maxMs,35);
 assert.equal(r.phaseCpuMs.streaming.startup.samples,0);
 assert.equal(r.phaseCpuMs.crowd.settled.samples,0);
 b.start(2000);assert.equal(b.report().phaseCpuMs.preparation.settled.samples,0);
});


test('progress is available without building a report and empty runs are not valid',()=>{
 const b=createBenchmarkCapture({durationMs:1000,startupMs:500});
 assert.equal(b.progress(0),null);b.start(100);
 assert.deepEqual(b.progress(350),{durationMs:250,requestedDurationMs:1000,running:true});
 b.finish(1100);assert.equal(b.report().valid,false);
 assert.deepEqual(b.progress(1500),{durationMs:1000,requestedDurationMs:1000,running:false});
});


test('slow-frame attribution preserves spikes, strips URL secrets and accepts final observer delivery',()=>{
 const b=createBenchmarkCapture({durationMs:1000,startupMs:0});
 b.setLongFrameSupport(true);b.longFrame({startTime:1,duration:999});b.start(100);
 b.longFrame({startTime:99,duration:900});
 const script={sourceURL:'https://user:secret@example.com/game/app.js?token=secret#private',sourceFunctionName:'roamFrame',sourceCharPosition:12,invokerType:'user-callback',duration:500,forcedStyleAndLayoutDuration:8,window:{private:true}};
 b.longFrame({startTime:200,duration:540,blockingDuration:490,scripts:[script]});
 b.finish(1100);b.longFrame({startTime:1050,duration:70,scripts:[{...script,duration:60}]});b.longFrame({startTime:1101,duration:900});
 const r=b.report().longAnimationFrames;
 assert.equal(r.supported,true);assert.equal(r.captured,2);assert.equal(r.topScripts[0].totalMs,560);assert.equal(r.topScripts[0].count,2);assert.equal(r.worstFrames[0].durationMs,540);
 assert.equal(r.topScripts[0].source,'https://example.com/game/app.js');assert.equal(JSON.stringify(r).includes('secret'),false);assert.equal(JSON.stringify(r).includes('private'),false);
 b.start(2000);assert.equal(b.report().longAnimationFrames.captured,0);assert.equal(b.report().longAnimationFrames.supported,true);
});
test('slow-frame capture stays bounded and distinguishes unsupported attribution',()=>{
 const b=createBenchmarkCapture({durationMs:10000});b.start(0);
 for(let n=0;n<300;n++)b.longFrame({startTime:n,duration:100,scripts:Array(40).fill({sourceURL:'data:secret',duration:90})});
 const r=b.report().longAnimationFrames;assert.equal(r.supported,false);assert.equal(r.captured,240);assert.equal(r.dropped,60);assert.equal(r.worstFrames.length,12);assert.equal(r.worstFrames[0].scripts.length,32);assert.equal(r.topScripts[0].source,'');
});
