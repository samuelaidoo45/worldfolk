import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameplayProfiler} from '../public/game/gameplay-profiler.js';
import {createBenchmarkCapture} from '../public/game/performance-benchmark.js';

test('nested CPU attribution isolates a slow map query without double-counting its caller',()=>{
  let now=0;const p=createGameplayProfiler({enabled:true,now:()=>now});
  const map={value:7,query(){now+=500;return this.value;}};
  p.methods(map,'map',['query']);
  const frame=p.wrap('frame',()=>{now+=3;assert.equal(map.query(),7);now+=2;});
  p.start();frame();p.stop();frame();
  const r=p.report(),query=r.operations.find(e=>e.label==='map.query'),loop=r.operations.find(e=>e.label==='frame');
  assert.equal(query.totalMs,500);assert.equal(query.selfMs,500);assert.equal(loop.totalMs,505);assert.equal(loop.selfMs,5);assert.equal(loop.calls,1);
  assert.equal(r.slowest[0].durationMs,505);
});
test('disabled profiling preserves function identity and never reads the clock',()=>{
  const p=createGameplayProfiler({now:()=>{throw Error('clock');}}),fn=x=>x+1,obj={fn};
  assert.equal(p.wrap('fn',fn),fn);p.methods(obj,'object',['fn']);assert.equal(obj.fn,fn);
  // Starting a disabled profiler is safe, too.
  p.start();assert.equal(obj.fn(2),3);assert.equal(p.report().enabled,false);
});
test('throwing callbacks preserve errors and unwind timing state',()=>{
  let now=0;const p=createGameplayProfiler({enabled:true,now:()=>now}),error=Error('expected');
  const bad=p.wrap('bad',()=>{now+=70;throw error;});const good=p.wrap('good',()=>{now+=4;return 9;});
  p.start();assert.throws(bad,e=>e===error);assert.equal(good(),9);
  assert.equal(p.report().operations.find(e=>e.label==='good').selfMs,4);
  p.start();assert.equal(p.report().operations.length,0);assert.equal(p.report().slowest.length,0);
});
test('bounded reports never retain arguments or return values and keep promise identity',async()=>{
  let now=0;const p=createGameplayProfiler({enabled:true,now:()=>now}),promise=Promise.resolve('private value');
  const fn=p.wrap('dispatch',()=>{now+=50;return promise;});p.start();
  for(let n=0;n<1000;n++)assert.equal(fn({private:'argument'}),promise);
  assert.equal(p.report().slowest.length,12);assert.equal(p.report().operations.length,1);assert.equal(JSON.stringify(p.report()).includes('private'),false);
  await promise;
});
test('benchmark owns the timing session and exports operation evidence',()=>{
  let now=0;const p=createGameplayProfiler({enabled:true,now:()=>now}),fn=p.wrap('frame',()=>{now+=500;});
  const b=createBenchmarkCapture({durationMs:1000,startupMs:0,profiler:p});
  b.start(0);fn();b.sample(500);fn();b.sample(1000);fn();
  assert.equal(b.report().schema,4);assert.equal(b.report().gameplayCpu.operations[0].calls,2);
  b.start(2000);assert.equal(b.report().gameplayCpu.operations.length,0);
});
