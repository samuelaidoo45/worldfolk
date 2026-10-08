import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {spawnSync} from 'node:child_process';
const base='http://127.0.0.1:3000';
async function call(cookie,body){const r=await fetch(base+'/api/game',{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
function fixture(id,values){const script=`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nv=json.loads(sys.argv[2])\nc.execute('UPDATE players SET '+','.join(k+'=?' for k in v)+' WHERE id=?',list(v.values())+[sys.argv[1]])\nc.commit()`;const r=spawnSync('python3',['-c',script,id,JSON.stringify(values)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr)}
test('mapped restaurant purchases persist, charge once and reject remote or unsuitable purchases',async()=>{
 const venue=JSON.parse(readFileSync('public/maps/accra-v1/places.json')).find(p=>p.type==='restaurant'&&p.name==='Home Touch');assert.ok(venue);
 const joined=await call(null,{type:'join',name:'Venue Shop Tester',avatar:'🧑🏾'});assert.equal(joined.status,201);const p=joined.body.self;
 const place=`g_${Math.round(venue.lng*10000)}_${Math.round(venue.lat*10000)}`;
 fixture(p.id,{place_id:place,pos_lng:venue.lng,pos_lat:venue.lat,money:100,driving:0,life_json:JSON.stringify({...p.life,inventory:{}})});
 const result=await call(joined.cookie,{type:'buy',itemId:'jollof'});assert.equal(result.status,200,JSON.stringify(result.body));assert.equal(result.body.self.money,78);assert.equal(result.body.self.life.inventory.jollof,1);
 const saved=await call(joined.cookie);assert.equal(saved.body.self.life.inventory.jollof,1);assert.equal((await call(joined.cookie,{type:'buy',itemId:'car'})).status,400);
 fixture(p.id,{pos_lng:-.3,pos_lat:5.7});assert.equal((await call(joined.cookie,{type:'buy',itemId:'jollof'})).status,400);assert.equal((await call(joined.cookie)).body.self.money,78);
});
