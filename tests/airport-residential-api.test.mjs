// Disposable accounts and fixtures in the local preview database only.
import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {REGUS_PLACE,REGUS_ENTRY,residentialPoint} from '../public/game/airport-residential-data.js';import {GOODS,JOBS} from '../public/game/life-catalog.js';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3002';assert.match(base,/^http:\/\/127\.0\.0\.1:/);
function sql(query,params){const script="import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nr=c.execute(sys.argv[1],json.loads(sys.argv[2])).fetchall()\nc.commit()\nprint(json.dumps(r))";const r=spawnSync('python3',['-c',script,query,JSON.stringify(params)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
function fixture(id,values){sql('UPDATE players SET '+Object.keys(values).map(k=>k+'=?').join(',')+' WHERE id=?',[...Object.values(values),id]);}
async function client(){let cookie;const call=async(path,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),'content-type':'application/json',origin:base},body:body?JSON.stringify(body):undefined});const data=await r.json();if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,body:data};};const reg=await call('/api/auth',{action:'register',username:'residential_' +Date.now().toString(36),name:'Residential QA',password:crypto.randomUUID()+'Aa9!'});assert.equal(reg.status,201,JSON.stringify(reg.body));const p=(await call('/api/game')).body.self;return {id:p.id,life:p.life,call:body=>call('/api/game',body)};}
function at(p,position,life=p.life,extras={}){fixture(p.id,{pos_lng:position[0],pos_lat:position[1],place_id:REGUS_PLACE.id,driving:0,money:500,energy:100,hunger:100,last_action_at:0,life_json:JSON.stringify({...life,health:100,lastVitalAt:Date.now(),explorationPending:false}),...extras});}
test('Regus kitchen uses game prices, validates proximity and does not sell unrelated stock',{timeout:45000},async()=>{
 const p=await client();at(p,[-.22,5.59]);assert.equal((await p.call({type:'enter',placeId:REGUS_PLACE.id})).status,400);assert.equal((await p.call({type:'buy',itemId:'water',price:-100})).status,400);
 const travel=await p.call({type:'explore-place',placeId:REGUS_PLACE.id});assert.equal(travel.status,200,JSON.stringify(travel.body));assert.equal(travel.body.self.id,p.id);assert.equal(travel.body.self.money,500);
 at(p,residentialPoint(-30,0));assert.equal((await p.call({type:'enter',placeId:REGUS_PLACE.id})).status,400);at(p,REGUS_ENTRY);const entered=await p.call({type:'enter',placeId:REGUS_PLACE.id});assert.equal(entered.status,200,JSON.stringify(entered.body));assert.equal(entered.body.self.placeId,REGUS_PLACE.id);const bought=await p.call({type:'buy',itemId:'water',price:0});assert.equal(bought.status,200,JSON.stringify(bought.body));assert.equal(bought.body.self.money,500-GOODS.find(g=>g.id==='water').price);assert.equal(bought.body.self.life.inventory.water,(p.life.inventory.water||0)+1);
 assert.equal((await p.call({type:'buy',itemId:'sofa'})).status,400);
 at(p,REGUS_ENTRY,p.life,{driving:1});assert.equal((await p.call({type:'buy',itemId:'water'})).status,400);
});
test('Regus coder shifts require onsite correct tasks before one server-owned wage payout',{timeout:45000},async()=>{
 const p=await client(),job=JOBS.find(j=>j.id==='regus-coder');at(p,[-.22,5.59]);assert.equal((await p.call({type:'job-apply',jobId:job.id})).status,400);
 at(p,REGUS_ENTRY);let r=await p.call({type:'job-apply',jobId:job.id});assert.equal(r.status,200,JSON.stringify(r.body));r=await p.call({type:'shift-start',wage:100000});assert.equal(r.status,200,JSON.stringify(r.body));let life=r.body.self.life;
 assert.equal((await p.call({type:'shift-complete'})).status,400);
 for(let step=0;step<job.steps.length;step++){
  life.shift.nextTaskAt=0;life.shift.endsAt=0;at(p,REGUS_ENTRY,life);
  assert.equal((await p.call({type:'work-task',shiftId:life.shift.id,step,choice:1})).status,400);
  r=await p.call({type:'work-task',shiftId:life.shift.id,step,choice:0});assert.equal(r.status,200,JSON.stringify(r.body));life=r.body.self.life;
 }
 const payouts=await Promise.all([p.call({type:'shift-complete',wage:100000}),p.call({type:'shift-complete',wage:100000})]);assert.equal(payouts.filter(r=>r.status===200).length,1,JSON.stringify(payouts));const saved=(await p.call()).body.self;assert.equal(saved.money,500+job.wage);assert.equal(saved.life.shift,null);assert.equal(saved.jobsDone,1);
});
