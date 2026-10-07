// Integration tests against the local server only. Fixtures alter local SQLite.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const base='http://127.0.0.1:3000';
async function call(cookie,body){const r=await fetch(base+'/api/game',{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
async function player(name){const r=await call(null,{type:'join',name,avatar:'🧑🏾'});assert.equal(r.status,201);const id=r.body.self.id;fixture(id,{pos_lng:-.1949,pos_lat:5.5682,place_id:`p_${id}_starter`,money:120,life_json:'{}'});const stable=await call(r.cookie);return {id,cookie:r.cookie,self:stable.body.self}}
function fixture(id,values){const script=`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nv=json.loads(sys.argv[2])\nc.execute('UPDATE players SET '+','.join(k+'=?' for k in v)+' WHERE id=?',list(v.values())+[sys.argv[1]])\nc.commit()`;const r=spawnSync('python3',['-c',script,id,JSON.stringify(values)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr)}

test('health, unlimited-speed movement validation, death and bus journey persistence',async()=>{
 const p=await player('World Test');let r=await call(p.cookie);let life=r.body.self.life;
 assert.equal(life.health,100);assert.equal((await call(p.cookie,{type:'respawn'})).status,400);
 fixture(p.id,{driving:1,life_json:JSON.stringify({...life,drivingSince:Date.now()-30000}),last_move_at:Date.now()-1000});
 r=await call(p.cookie,{type:'move',lng:p.self.lng+.0005,lat:p.self.lat,heading:90});assert.equal(r.status,200,'driving faster than the old cap is accepted');
 r=await call(p.cookie,{type:'crash',speed:38});assert.equal(r.status,200);assert.equal(r.body.self.life.health,75);assert.equal(r.body.self.life.deaths,0);
 assert.equal((await call(p.cookie,{type:'crash',speed:38})).status,429,'one impact cannot be charged twice');assert.equal((await call(p.cookie)).body.self.life.health,75);
 for(const health of [50,25,0]){life=(await call(p.cookie)).body.self.life;life.lastCrashAt=0;fixture(p.id,{life_json:JSON.stringify(life)});r=await call(p.cookie,{type:'crash',speed:38});assert.equal(r.status,200);assert.equal(r.body.self.life.health,health)}assert.equal(r.body.self.life.deaths,1);
 assert.equal((await call(p.cookie,{type:'buy',itemId:'water'})).status,400);assert.equal((await call(p.cookie,{type:'move',lng:p.self.lng,lat:p.self.lat,heading:0})).status,400);
 r=await call(p.cookie,{type:'respawn'});assert.equal(r.status,200);assert.equal(r.body.self.life.health,100);assert.equal(r.body.self.driving,false);assert.equal(r.body.self.money,120);assert.equal(r.body.self.lng,p.self.lng);
 assert.equal((await call(p.cookie,{type:'bus-board',routeId:'airport-mall'})).status,400,'must be at the origin stop');
 r=await call(p.cookie,{type:'bus-board',routeId:'ridge-osu'});assert.equal(r.status,200);assert.equal(r.body.self.money,110);assert.ok(r.body.self.life.transit);
 assert.equal((await call(p.cookie,{type:'bus-arrive'})).status,400);assert.equal((await call(p.cookie,{type:'vehicle',enter:true,lng:p.self.lng,lat:p.self.lat})).status,400);
 life=r.body.self.life;life.transit.endsAt=Date.now()-10;life.transit.progress=1;fixture(p.id,{life_json:JSON.stringify(life)});
 const arrivals=await Promise.all([call(p.cookie,{type:'bus-arrive'}),call(p.cookie,{type:'bus-arrive'})]);assert.equal(arrivals.filter(x=>x.status===200).length,1);r=await call(p.cookie);assert.equal(r.body.self.placeId,'osu');assert.equal(r.body.self.life.transit,null);assert.equal(r.body.self.money,110);
 life=r.body.self.life;life.lastVitalAt=Date.now()-86400000;fixture(p.id,{hunger:50,life_json:JSON.stringify(life)});r=await call(p.cookie,{type:'vitals'});assert.equal(r.body.self.life.health,100);assert.ok(r.body.self.hunger>=48,'offline time does not starve a player');
});
async function voice(cookie,body,query=''){const r=await fetch(base+'/api/voice'+query,{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json()}}
test('voice opt-in, session ownership, recipient-only signaling and leaving',async()=>{
 const a=await player('Voice A'),b=await player('Voice B'),c=await player('Voice C');
 assert.equal((await voice(null,{type:'join'})).status,401);assert.equal((await voice(a.cookie)).status,403);
 const sa=(await voice(a.cookie,{type:'join'})).body.id,sb=(await voice(b.cookie,{type:'join'})).body.id,sc=(await voice(c.cookie,{type:'join'})).body.id;
 assert.ok(sa&&sb&&sc);assert.equal((await voice(a.cookie)).body.peers.length,2);
 assert.equal((await voice(c.cookie,{type:'signal',sessionId:sa,to:sb,payload:{type:'offer',sdp:'v=0'}})).status,403);
 assert.equal((await voice(a.cookie,{type:'signal',sessionId:sa,to:sb,payload:{type:'offer',sdp:'v=0'}})).status,200);
 const received=await voice(b.cookie);assert.equal(received.body.signals.length,1);assert.equal(received.body.signals[0].sender,sa);assert.equal((await voice(c.cookie)).body.signals.length,0);
 assert.equal((await voice(b.cookie,null,'?after='+received.body.signals[0].id)).body.signals.length,0);
 await voice(a.cookie,{type:'leave',sessionId:sa});assert.equal((await voice(a.cookie)).status,403);assert.equal((await voice(b.cookie)).body.peers.length,1);
 await voice(b.cookie,{type:'leave',sessionId:sb});await voice(c.cookie,{type:'leave',sessionId:sc});
});

test('pedestrian impacts persist, reject rapid duplicates and can be fatal',async()=>{
 const p=await player('Traffic Test');let r=await call(p.cookie,{type:'traffic-hit',speed:8,highway:false});assert.equal(r.status,200);assert.ok(r.body.self.life.health<100&&r.body.self.life.health>0);
 assert.equal((await call(p.cookie,{type:'traffic-hit',speed:8})).status,429);
 let life=r.body.self.life;life.lastTrafficHitAt=Date.now()-4000;fixture(p.id,{life_json:JSON.stringify(life)});r=await call(p.cookie,{type:'traffic-hit',speed:22,highway:true});assert.equal(r.body.self.life.health,0);assert.equal(r.body.self.life.deaths,1);r=await call(p.cookie,{type:'respawn'});assert.equal(r.body.self.life.health,100);
 assert.equal((await call(p.cookie,{type:'traffic-hit',speed:999})).status,400);
});
