// Integration tests against the local server only. Fixtures alter local SQLite.
import test from 'node:test';
import {CITY_DESTINATIONS} from '../public/game/city-destinations.js';
import {JOBS} from '../public/game/life-catalog.js';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const base='http://127.0.0.1:3000';
async function call(cookie,body){const r=await fetch(base+'/api/game',{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
async function player(name){const r=await call(null,{type:'join',name,avatar:'🧑🏾'});assert.equal(r.status,201);const id=r.body.self.id;fixture(id,{pos_lng:-.1949,pos_lat:5.5682,place_id:`p_${id}_starter`,money:120,life_json:'{}'});const stable=await call(r.cookie);return {id,cookie:r.cookie,self:stable.body.self}}
function fixture(id,values){const script=`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nv=json.loads(sys.argv[2])\nc.execute('UPDATE players SET '+','.join(k+'=?' for k in v)+' WHERE id=?',list(v.values())+[sys.argv[1]])\nc.commit()`;const r=spawnSync('python3',['-c',script,id,JSON.stringify(values)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr)}
const hubs={airport:[-.1787,5.6093],osu:[-.1819,5.5598],makola:[-.2141,5.5485],kaneshie:[-.2346,5.5724],mall:[-.1738,5.6224],legon:[-.1874,5.651],theatre:[-.2047,5.5516],arts:[-.2033,5.5464],dubois:[-.1698,5.5815],labadi:[-.140846,5.561955]};
function point(id){const p=CITY_DESTINATIONS.find(p=>p.id===id);return p?[p.lng,p.lat]:hubs[id]}
function at(id,place,extra={}){const [pos_lng,pos_lat]=point(place);fixture(id,{pos_lng,pos_lat,place_id:place,driving:0,...extra})}
async function tasks(guest,job,life){
 for(let i=0;i<job.steps.length;i++){
  const task=job.steps[i];life.shift.nextTaskAt=Date.now()-10;life.shift.endsAt=Date.now()-10;
  if(job.vehicle&&i>0)life.shift.drove=true;
  at(guest.id,task.place,{life_json:JSON.stringify(life)});
  const input={type:'work-task',shiftId:life.shift.id,step:i,choice:task.answer};
  const result=await call(guest.cookie,input);assert.equal(result.status,200,job.id+': '+JSON.stringify(result.body));life=result.body.self.life;
  assert.equal((await call(guest.cookie,input)).status,400,'same task cannot be replayed');
 }
 return life;
}
test('every profession requires workplace arrival, task completion and pays once',async()=>{
 const guest=await player('Profession Tester');
 for(const job of JOBS){
  const coords=point(job.place);assert.ok(coords,job.id+' workplace exists');
  fixture(guest.id,{pos_lng:coords[0]+.02,pos_lat:coords[1],driving:0,energy:100,money:0,life_json:'{"vehicles":[],"vehicle":"car"}'});
  assert.equal((await call(guest.cookie,{type:'job-apply',jobId:job.id})).status,400,'no remote hiring');
  at(guest.id,job.place);assert.equal((await call(guest.cookie,{type:'job-apply',jobId:job.id})).status,200,job.id);
  const started=await call(guest.cookie,{type:'shift-start'});assert.equal(started.status,200,job.id);let life=started.body.self.life;assert.equal(life.shift.version,2);
  assert.equal((await call(guest.cookie,{type:'shift-complete'})).status,400);
  assert.equal((await call(guest.cookie,{type:'work-task',shiftId:life.shift.id,step:0,choice:job.steps[0].answer})).status,400,'cannot skip task time');
  life.shift.nextTaskAt=Date.now()-10;fixture(guest.id,{life_json:JSON.stringify(life)});
  assert.equal((await call(guest.cookie,{type:'work-task',shiftId:life.shift.id,step:0,choice:99})).status,400,'invalid answers fail');
  await tasks(guest,job,life);
  const finish=await Promise.all([call(guest.cookie,{type:'shift-complete'}),call(guest.cookie,{type:'shift-complete'})]);assert.equal(finish.filter(r=>r.status===200).length,1,job.id+' paid once');
  const saved=(await call(guest.cookie)).body.self;assert.equal(saved.money,job.wage,job.id);assert.equal(saved.life.career[job.id].shifts,1);assert.equal(saved.life.career[job.id].earned,job.wage);assert.equal(saved.life.shift,null);assert.deepEqual(saved.life.vehicles,[],'work vehicle is not gifted');
 }
});
test('work vehicle is usable without ownership and returned on cancel or restart',async()=>{
 const guest=await player('Company Driver');at(guest.id,'kaneshie',{life_json:'{"vehicles":[],"vehicle":"car"}',energy:100});
 await call(guest.cookie,{type:'job-apply',jobId:'trotro'});let started=await call(guest.cookie,{type:'shift-start'});assert.equal(started.status,200);assert.equal(started.body.self.life.vehicle,'bus');
 const [lng,lat]=point('kaneshie');assert.equal((await call(guest.cookie,{type:'vehicle',enter:true,lng,lat})).status,200);
 assert.equal((await call(guest.cookie,{type:'shift-cancel'})).status,400,'must park before returning vehicle');
 assert.equal((await call(guest.cookie,{type:'vehicle',enter:false,lng,lat})).status,200);
 assert.equal((await call(guest.cookie,{type:'shift-cancel'})).status,200);
 assert.equal((await call(guest.cookie,{type:'vehicle',enter:true,lng,lat})).status,400,'loan is revoked');
 started=await call(guest.cookie,{type:'shift-start'});const life=started.body.self.life;life.health=0;fixture(guest.id,{life_json:JSON.stringify(life)});
 const restart=await call(guest.cookie,{type:'respawn'});assert.equal(restart.status,200);assert.equal(restart.body.self.life.vehicle,'car');assert.equal(restart.body.self.life.shift,null);assert.deepEqual(restart.body.self.life.vehicles,[]);
});
test('earned wages buy goods and experiences with server prices and atomic payment',async()=>{
 const guest=await player('Earn And Spend');at(guest.id,'makola',{money:0,energy:100});await call(guest.cookie,{type:'job-apply',jobId:'market-seller'});
 const start=await call(guest.cookie,{type:'shift-start'});await tasks(guest,JOBS.find(j=>j.id==='market-seller'),start.body.self.life);
 const paid=await call(guest.cookie,{type:'shift-complete'});assert.equal(paid.status,200);assert.equal(paid.body.self.money,110);
 const food=await call(guest.cookie,{type:'buy',itemId:'waakye',price:0});assert.equal(food.status,200);assert.equal(food.body.self.money,98);assert.equal(food.body.self.life.inventory.waakye,1);
 assert.equal((await call(guest.cookie,{type:'experience-buy',experienceId:'restaurant-meal'})).status,400,'must visit venue');
 at(guest.id,'osu',{hunger:10,hygiene:20});const purchases=await Promise.all([call(guest.cookie,{type:'experience-buy',experienceId:'haircut',price:0}),call(guest.cookie,{type:'experience-buy',experienceId:'haircut'})]);assert.equal(purchases.filter(r=>r.status===200).length,1);
 const saved=(await call(guest.cookie)).body.self;assert.equal(saved.money,63);assert.equal(saved.hygiene,50,'service benefit persisted');
 fixture(guest.id,{money:0,life_json:JSON.stringify({...saved.life,lastServiceAt:0})});assert.equal((await call(guest.cookie,{type:'experience-buy',experienceId:'haircut'})).status,400);
});
