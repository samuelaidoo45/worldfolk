// Local only: independent authenticated players and isolated fixture venues.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const base='http://127.0.0.1:3000';
async function call(cookie,body,query=''){const r=await fetch(base+'/api/game'+query,{method:body?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{Origin:base,'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
function place(id,venue){const sql=`import sqlite3,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nc.execute('UPDATE players SET place_id=?,last_chat_at=0 WHERE id=?',(sys.argv[2],sys.argv[1]))\nc.commit()`;assert.equal(spawnSync('python3',['-c',sql,id,venue]).status,0)}
async function player(name,venue){const r=await call(null,{type:'join',name,avatar:'🧑🏾'});assert.equal(r.status,201);place(r.body.self.id,venue);return {...r.body.self,cookie:r.cookie}}
test('two-way city chat, local delivery, channel separation and input checks',async()=>{
 const a=await player('Chat Test Ama','osu'),b=await player('Chat Test Kojo','osu'),c=await player('Chat Test Abena','mall');
 const tag=Date.now(),city=`City hello ${tag}`,reply=`City reply ${tag}`,local=`Osu hello ${tag}`;
 assert.equal((await call(null,{type:'chat',body:city,channel:'city'})).status,401);
 assert.equal((await call(a.cookie,{type:'chat',body:city,channel:'city'})).status,200);
 const cityRead=await call(b.cookie,null,'?messagesOnly=1&channel=city');assert.ok(cityRead.body.messages.some(m=>m.body===city&&m.player_id===a.id));
 assert.equal((await call(b.cookie,{type:'chat',body:reply,channel:'city'})).status,200);
 assert.ok((await call(a.cookie,null,'?messagesOnly=1&channel=city')).body.messages.some(m=>m.body===reply&&m.player_id===b.id));
 assert.equal((await call(a.cookie,{type:'chat',body:'Too soon',channel:'city'})).status,429);
 place(a.id,'osu');
 assert.equal((await call(a.cookie,{type:'chat',body:local,channel:'place'})).status,200);
 assert.ok((await call(b.cookie,null,'?messagesOnly=1&channel=place')).body.messages.some(m=>m.body===local));
 assert.ok(!(await call(c.cookie,null,'?messagesOnly=1&channel=place')).body.messages.some(m=>m.body===local));
 assert.ok(!(await call(b.cookie,null,'?messagesOnly=1&channel=city')).body.messages.some(m=>m.body===local));
 assert.ok(!(await call(c.cookie,null,'?messagesOnly=1&channel=osu')).body.messages.some(m=>m.body===local),'caller cannot select another venue channel');
 place(a.id,'osu');assert.equal((await call(a.cookie,{type:'chat',body:' ',channel:'city'})).status,400);assert.equal((await call(a.cookie,{type:'chat',body:'x'.repeat(221),channel:'city'})).status,400);
 const rendered='Hello Accra Tester — can you see this chat test?';place(b.id,'osu');assert.equal((await call(b.cookie,{type:'chat',body:rendered,channel:'city'})).status,200);
});
