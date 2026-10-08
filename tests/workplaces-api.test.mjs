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
test('mapped workplace jobs require arrival and pay a completed shift once',async()=>{
 const guest=await player('City Work Tester');
 for(const job of JOBS.filter(j=>j.place.startsWith('g_'))){
  const place=CITY_DESTINATIONS.find(p=>p.id===job.place);
  fixture(guest.id,{pos_lng:place.lng+.02,pos_lat:place.lat,driving:0,energy:100,money:0,life_json:'{}'});
  assert.equal((await call(guest.cookie,{type:'job-apply',jobId:job.id})).status,400,'cannot apply remotely');
  fixture(guest.id,{pos_lng:place.lng,pos_lat:place.lat,place_id:place.id});
  assert.equal((await call(guest.cookie,{type:'job-apply',jobId:job.id})).status,200,job.name);
  const shift=await call(guest.cookie,{type:'shift-start'});assert.equal(shift.status,200);
  assert.equal((await call(guest.cookie,{type:'shift-complete'})).status,400,'cannot skip the shift timer');
  const life=shift.body.self.life;life.shift.endsAt=Date.now()-100;fixture(guest.id,{life_json:JSON.stringify(life)});
  const finish=await call(guest.cookie,{type:'shift-complete'});assert.equal(finish.status,200);assert.equal(finish.body.self.money,job.wage);
  assert.equal((await call(guest.cookie,{type:'shift-complete'})).status,400,'cannot collect twice');
 }
});
