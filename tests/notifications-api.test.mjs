import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const base='http://127.0.0.1:3001';
function sql(query,args=[]){const r=spawnSync('python3',['-c',`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p);c.execute(sys.argv[1],json.loads(sys.argv[2]));c.commit()`,query,JSON.stringify(args)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr)}
async function api(path,cookie,body){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
async function player(){const p=await api('/api/auth',null,{action:'register',username:'notice_'+crypto.randomUUID().replaceAll('-','').slice(0,12),password:'mango trees beside the sea',name:'Notification Test',avatar:'🧑🏾'});assert.equal(p.status,201);p.id=(await api('/api/game',p.cookie)).data.self.id;return p}
test('notification feed is private, incremental, excludes own messages and includes incoming calls',async()=>{
 const a=await player(),b=await player(),c=await player();
 try{
  assert.equal((await api('/api/contacts?alerts=1')).status,401);
  const before=(await api('/api/contacts?alerts=1',b.cookie)).data.alerts;assert.deepEqual(before.messages,[]);
  assert.equal((await api('/api/players',a.cookie,{to:b.id,body:'Meet me by the square'})).status,200);
  const path='/api/contacts?alerts=1&after='+before.cursor;
  const feed=(await api(path,b.cookie)).data.alerts;assert.equal(feed.messages.length,1);assert.equal(feed.messages[0].senderId,a.id);assert.equal(feed.messages[0].body,'Meet me by the square');
  assert.deepEqual((await api('/api/contacts?alerts=1&after='+feed.cursor,b.cookie)).data.alerts.messages,[]);
  assert.deepEqual((await api(path,c.cookie)).data.alerts.messages,[]);assert.deepEqual((await api(path,a.cookie)).data.alerts.messages,[]);
  assert.equal((await api('/api/contacts?alerts=1&after=-1',b.cookie)).status,400);
  await api('/api/contacts',a.cookie,{type:'request',contact:b.id});const f=(await api('/api/contacts',b.cookie)).data.contacts[0];await api('/api/contacts',b.cookie,{type:'accept',id:f.id});
  const call=await api('/api/contacts',a.cookie,{type:'call',id:f.id});assert.equal(call.status,200);
  const alert=(await api(path,b.cookie)).data.call;assert.equal(alert.callee,b.id);assert.equal(alert.status,'ringing');assert.ok(alert.handle);
  assert.equal((await api(path,c.cookie)).data.call,null);assert.equal((await api('/api/contacts',c.cookie,{type:'answer',id:alert.id})).status,404);
  assert.equal((await api('/api/contacts',b.cookie,{type:'answer',id:alert.id})).status,200);assert.equal((await api(path,b.cookie)).data.call.status,'active');
  await api('/api/contacts',a.cookie,{type:'hangup',id:alert.id});assert.equal((await api(path,b.cookie)).data.call,null);
 }finally{for(const p of [a,b,c]){sql('DELETE FROM messages WHERE player_id=?',[p.id]);sql('DELETE FROM friend_calls WHERE caller=? OR callee=?',[p.id,p.id]);sql('DELETE FROM friendships WHERE player_a=? OR player_b=?',[p.id,p.id]);sql('DELETE FROM accounts WHERE player_id=?',[p.id]);sql('DELETE FROM players WHERE id=?',[p.id])}}
});
