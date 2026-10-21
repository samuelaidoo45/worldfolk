// Disposable accounts and fixtures in the local preview database only.
import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {OSU_SITES,OSU_PLACES} from '../public/game/osu-oxford-data.js';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3001';assert.match(base,/^http:\/\/127\.0\.0\.1:/);
function sql(query,params){const script="import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nr=c.execute(sys.argv[1],json.loads(sys.argv[2])).fetchall()\nc.commit()\nprint(json.dumps(r))";const r=spawnSync('python3',['-c',script,query,JSON.stringify(params)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout);}
function fixture(id,values){sql('UPDATE players SET '+Object.keys(values).map(k=>k+'=?').join(',')+' WHERE id=?',[...Object.values(values),id]);}
async function client(){let cookie;const call=async(path,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),'content-type':'application/json',origin:base},body:body?JSON.stringify(body):undefined});const data=await r.json();if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,body:data};};const reg=await call('/api/auth',{action:'register',username:'osu_'+Date.now().toString(36),name:'Osu Street QA',password:crypto.randomUUID()+'Aa9!'});assert.equal(reg.status,201,JSON.stringify(reg.body));const p=(await call('/api/game')).body.self;return {id:p.id,life:p.life,call:body=>call('/api/game',body)};}
function at(p,position,life=p.life,extras={}){fixture(p.id,{pos_lng:position[0],pos_lat:position[1],place_id:OSU_PLACES[0].id,driving:0,money:500,energy:100,hunger:100,last_action_at:0,life_json:JSON.stringify({...life,health:100,lastVitalAt:Date.now(),explorationPending:false}),...extras});}


test('Oxford Street destinations preserve the profile and use their safe outdoor arrival',{timeout:45000},async()=>{
 const p=await client();
 for(const site of OSU_SITES){at(p,[-.19,5.56]);const r=await p.call({type:'explore-place',placeId:site.id});assert.equal(r.status,200,JSON.stringify(r.body));assert.equal(r.body.self.id,p.id);assert.equal(r.body.self.money,500);assert.equal(r.body.self.placeId,site.id);assert.ok(Math.hypot(r.body.self.lng-site.arrival[0],r.body.self.lat-site.arrival[1])<1e-8);}
});
