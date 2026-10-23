import test from 'node:test';
import assert from 'node:assert/strict';
import {createAmbientModelPool} from '../public/game/ambient-model-pool.js';
import {selectAmbientDetails} from '../public/game/world-streaming.js';
import {offsetMetres} from '../public/game/motion.js';
const origin=[-.175,5.62];
const actors=()=>Array.from({length:60},(_,i)=>({id:`npc-${i}`,position:offsetMetres(origin,10+i,0),driving:i>=30,vehicle:i>=30?'taxi':null,avatar:'🧑🏾'}));
function fixture(mobile=false){const built=[],released=[];return {built,released,pool:createAmbientModelPool({mobile,create(data){built.push(data.id);return {model:{id:data.id}}},release(item){released.push(item.model.id)}})}}
test('only visible-budget residents build, at most one per pump; simulation input is untouched',()=>{
 for(const mobile of [false,true]){
  const {pool,built}=fixture(mobile),source=actors(),before=structuredClone(source);
  pool.sync(source,origin,0);assert.equal(built.length,0);
  const expected=selectAmbientDetails(source,origin,{mobile});
  for(let n=0;n<100;n++){const count=built.length;pool.pump();assert.ok(built.length-count<=1)}
  assert.deepEqual(new Set(built),expected);assert.equal(built.length,mobile?14:24);
  assert.deepEqual(source,before);assert.equal(pool.snapshot().pending,0);
 }
});
test('movement updates reuse models; removed residents cancel pending work and release exactly once',()=>{
 const {pool,built,released}=fixture(),source=actors();pool.sync(source,origin,0);pool.pump();
 const id=built[0],original=pool.items.get(id),updated=source.map(a=>({...a,heading:90}));
 pool.sync(updated,origin,100);assert.equal(pool.items.get(id),original);assert.equal(original.data.heading,90);
 pool.sync([],origin,110);assert.deepEqual(released,[id]);assert.equal(pool.pump(),null);
 pool.clear();pool.clear();assert.deepEqual(released,[id]);assert.equal(pool.items.size,0);
});
test('visual identity changes replace the model without removing the simulated actor',()=>{
 const {pool,built,released}=fixture(),source=actors().slice(0,1);pool.sync(source,origin,0);pool.pump();
 source[0].driving=true;source[0].vehicle='bus';pool.sync(source,origin,300);
 assert.equal(pool.items.size,0);pool.pump();assert.equal(built.length,2);assert.equal(released.length,1);
 assert.equal(pool.items.get(source[0].id).data.vehicle,'bus');
});
test('rapid travel discards old queued residents before model creation',()=>{
 const {pool,built,released}=fixture(),source=actors();pool.sync(source,origin,0);pool.pump();
 const destination=offsetMetres(origin,2000,0),next=[{...source[0],id:'destination',position:destination}];
 pool.sync(next,destination,10);pool.pump();assert.deepEqual(built,[source[0].id,'destination']);
 assert.deepEqual(released,[source[0].id]);assert.equal(pool.items.size,1);
});
