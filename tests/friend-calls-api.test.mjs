import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const base='http://127.0.0.1:3000';
async function api(path,cookie,body,origin=base){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,data:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
const contacts=(p,body)=>api('/api/contacts',p?.cookie,body),voice=(p,body)=>api('/api/voice',p.cookie,body);
function sql(query,args=[]){const r=spawnSync('python3',['-c',`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nc.execute(sys.argv[1],json.loads(sys.argv[2]))\nc.commit()`,query,JSON.stringify(args)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr)}
async function player(name){const p=await api('/api/game',null,{type:'join',name,avatar:'🧑🏾'});assert.equal(p.status,201);return {...p,id:p.data.self.id}}
test('friend invitations and calls require acceptance and isolate private voice from the city',async()=>{
 const a=await player('Caller Test'),b=await player('Recipient Test'),c=await player('Other Test');
 try{
  assert.equal((await contacts(null)).status,401);
  assert.equal((await api('/api/contacts',a.cookie,{type:'request',contact:b.id},'https://other.test')).status,403);
  assert.equal((await contacts(a,{type:'request',contact:b.id})).status,200);
  const list=(await contacts(b)).data;assert.equal(list.contacts.length,1);const friend=list.contacts[0];assert.equal(friend.requestedBy,a.id);assert.equal((await contacts(c)).data.contacts.length,0);
  assert.equal((await contacts(a,{type:'call',id:friend.id})).status,403);
  assert.equal((await contacts(a,{type:'accept',id:friend.id})).status,403);
  assert.equal((await contacts(c,{type:'accept',id:friend.id})).status,404);
  assert.equal((await contacts(b,{type:'accept',id:friend.id})).status,200);
  sql('DELETE FROM auth_rate_limits WHERE bucket=?',[`contacts:call:${a.id}`]);
  const ring=await contacts(a,{type:'call',id:friend.id});assert.equal(ring.status,200,JSON.stringify(ring.data));const id=ring.data.callId;
  assert.equal((await contacts(b)).data.call.id,id);assert.equal((await contacts(c)).data.call,null);
  assert.equal((await voice(a,{type:'join',callId:id})).status,403,'cannot connect audio before answer');
  assert.equal((await contacts(b,{type:'call',id:friend.id})).status,409,'busy participants cannot open a competing call');
  assert.equal((await contacts(a,{type:'answer',id})).status,403);assert.equal((await contacts(c,{type:'answer',id})).status,404);
  assert.equal((await contacts(b,{type:'answer',id})).status,200);
  assert.equal((await voice(c,{type:'join',callId:id})).status,403);
  const va=await voice(a,{type:'join',callId:id}),vb=await voice(b,{type:'join',callId:id}),vc=await voice(c,{type:'join'});assert.equal(va.status,200);assert.equal(vb.status,200);assert.equal(vc.status,200);
  assert.deepEqual((await voice(a)).data.peers.map(p=>p.id),[vb.data.id]);assert.ok(!(await voice(c)).data.peers.some(p=>[va.data.id,vb.data.id].includes(p.id)));
  const signal={type:'signal',sessionId:va.data.id,to:vb.data.id,payload:{type:'offer',sdp:'v=0\r\ntest private offer'}};
  assert.equal((await voice(c,{...signal,sessionId:vc.data.id})).status,404,'public voice cannot inject signals into private calls');
  assert.equal((await voice(a,signal)).status,200);const messages=(await voice(b)).data.signals;assert.equal(messages.length,1);assert.equal(messages[0].sender,va.data.id);
  assert.equal((await contacts(c,{type:'hangup',id})).status,404);
  assert.equal((await contacts(a,{type:'hangup',id})).status,200);assert.equal((await contacts(b)).data.call,null);assert.equal((await voice(b)).status,403);
  sql('DELETE FROM auth_rate_limits WHERE bucket=?',[`contacts:call:${a.id}`]);const next=(await contacts(a,{type:'call',id:friend.id})).data.callId;assert.ok(next);
  sql('UPDATE friend_calls SET expires_at=0 WHERE id=?',[next]);assert.equal((await contacts(b)).data.call,null);assert.equal((await contacts(b,{type:'answer',id:next})).status,409);
  sql('DELETE FROM auth_rate_limits WHERE bucket=?',[`contacts:call:${a.id}`]);const final=(await contacts(a,{type:'call',id:friend.id})).data.callId;assert.ok(final);
  assert.equal((await contacts(b,{type:'answer',id:final})).status,200);assert.equal((await voice(a,{type:'join',callId:final})).status,200);
  assert.equal((await contacts(b,{type:'remove',id:friend.id})).status,200);assert.equal((await contacts(a)).data.call,null);assert.equal((await voice(a)).status,403,'removing a friend revokes the active voice room');
 }finally{for(const p of [a,b,c]){sql('DELETE FROM voice_sessions WHERE player_id=?',[p.id]);sql('DELETE FROM friend_calls WHERE caller=? OR callee=?',[p.id,p.id]);sql('DELETE FROM friendships WHERE player_a=? OR player_b=?',[p.id,p.id]);sql('DELETE FROM auth_rate_limits WHERE bucket LIKE ?',[`contacts:%:${p.id}`]);sql('DELETE FROM players WHERE id=?',[p.id])}}
});
