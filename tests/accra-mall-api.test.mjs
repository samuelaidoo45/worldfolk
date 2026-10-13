import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {MALL_ARRIVAL} from '../public/game/accra-mall-data.js';
import {JOBS} from '../public/game/life-catalog.js';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3001';
// This fixture deliberately changes only its own temporary local player.
function sql(statement,params){
 assert.match(base,/^http:\/\/127\.0\.0\.1:/,'Run against the local preview only');
 const script="import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nr=c.execute(sys.argv[1],json.loads(sys.argv[2])).fetchall()\nc.commit()\nprint(json.dumps(r))";
 const r=spawnSync('python3',['-c',script,statement,JSON.stringify(params)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);
}
test('mall arrival, shopping, cinema and retail wages use the registered server economy',{timeout:60000},async()=>{
 assert.match(base,/^http:\/\/127\.0\.0\.1:/);let cookie;
 async function call(path,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),'Content-Type':'application/json',Origin:base},body:body?JSON.stringify(body):undefined});const value=await r.json();if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,body:value}}
 const reg=await call('/api/auth',{action:'register',username:'mall_'+Date.now().toString(36),name:'Mall QA',password:crypto.randomUUID()+'Aa9!'});assert.equal(reg.status,201,JSON.stringify(reg.body));
 let self=(await call('/api/game')).body.self;const id=self.id;
 const act=async body=>{const r=await call('/api/game',body);assert.equal(r.status,200,JSON.stringify(r.body));self=r.body.self;return r};
 try{
  assert.equal((await call('/api/game',{type:'experience-buy',experienceId:'mall-cinema'})).status,400,'remote tickets denied');
  await act({type:'start-exploring',placeId:'mall'});assert.ok(Math.abs(self.lng-MALL_ARRIVAL[0])<1e-7);assert.ok(Math.abs(self.lat-MALL_ARRIVAL[1])<1e-7);
  await act({type:'enter',placeId:'mall'});assert.equal(self.placeId,'mall');
  let balance=self.money,water=self.life.inventory.water||0;await act({type:'buy',itemId:'water'});assert.equal(self.money,balance-4);assert.equal(self.life.inventory.water,water+1);
  balance=self.money;await act({type:'experience-buy',experienceId:'mall-cinema'});assert.equal(self.money,balance-45);
  assert.equal((await call('/api/game',{type:'experience-buy',experienceId:'mall-cinema'})).status,429,'repeat charge is throttled');
  await act({type:'job-apply',jobId:'retail'});await act({type:'shift-start'});assert.equal(self.life.shift.jobId,'retail');
  assert.equal((await call('/api/game',{type:'shift-complete'})).status,400,'cannot collect wages before work');
  const job=JOBS.find(j=>j.id==='retail');balance=self.money;
  for(let step=0;step<job.steps.length;step++){
   sql("UPDATE players SET life_json=json_set(life_json,'$.shift.nextTaskAt',0,'$.shift.endsAt',0) WHERE id=?",[id]);
   await act({type:'work-task',shiftId:self.life.shift.id,step,choice:job.steps[step].answer});
  }
  await act({type:'shift-complete'});assert.equal(self.money,balance+job.wage);assert.equal(self.life.career.retail.shifts,1);
  assert.equal((await call('/api/game',{type:'shift-complete'})).status,400,'cannot collect twice');
 }finally{await call('/api/auth',{action:'logout'})}
});
