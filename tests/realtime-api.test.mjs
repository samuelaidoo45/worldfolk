import {spawnSync} from 'node:child_process';
import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
const base='http://127.0.0.1:3000';
async function join(name){const r=await fetch(base+'/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({type:'join',name,avatar:'🧑🏾'})});assert.equal(r.status,201);const self=(await r.json()).self;const sql="import sqlite3,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nc.execute('UPDATE players SET pos_lng=-0.1949,pos_lat=5.5682 WHERE id=?',(sys.argv[1],))\nc.commit()";const setup=spawnSync('python3',['-c',sql,self.id]);assert.equal(setup.status,0);self.lng=-.1949;self.lat=5.5682;return {cookie:r.headers.get('set-cookie').split(';')[0],self}}
function connect(cookie,origin=base){const ws=new WebSocket(base.replace('http','ws')+'/api/realtime',{headers:{Cookie:cookie,Origin:origin}});const inbox=[];ws.on('message',s=>{try{inbox.push(JSON.parse(String(s)))}catch{}});return {ws,inbox}}
async function wait(c,type){const end=Date.now()+5000;while(Date.now()<end){const i=c.inbox.findIndex(m=>m.type===type);if(i>=0)return c.inbox.splice(i,1)[0];await new Promise(r=>setTimeout(r,20))}throw Error('Missing '+type)}
test('live presence, validated movement, action checkpoint, private isolation and reconnect',async()=>{
 const a=await join('Realtime A'),b=await join('Realtime B'),ca=connect(a.cookie),cb=connect(b.cookie);
 try{
  const hello=await wait(ca,'welcome');await wait(cb,'welcome');assert.match(hello.room,/^accra:/);assert.ok(!JSON.stringify(hello).includes('session_token'),'sessions are never broadcast');
  await wait(ca,'player');await new Promise(r=>setTimeout(r,250));const moved=a.self.lng+.00001;
  ca.ws.send(JSON.stringify({type:'move',lng:moved,lat:a.self.lat,heading:90,seq:1}));assert.equal((await wait(ca,'ack')).seq,1);
  assert.equal((await wait(cb,'player')).player.lng,moved);
  let r=await fetch(base+'/api/game',{headers:{Cookie:a.cookie,'X-World-Room':hello.room}});assert.equal((await r.json()).self.lng,moved,'reads use live position');
  r=await fetch(base+'/api/game',{method:'POST',headers:{Cookie:a.cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({type:'heartbeat'})});assert.equal(r.status,200);
  r=await fetch(base+'/api/game',{headers:{Cookie:a.cookie}});assert.equal((await r.json()).self.lng,moved,'actions checkpoint the position to D1');
  await new Promise(r=>setTimeout(r,180));ca.ws.send(JSON.stringify({type:'move',lng:.06,lat:5.77,heading:0,seq:2}));assert.equal((await wait(ca,'correct')).player.lng,moved,'teleport is rejected');
  ca.ws.close();await new Promise(r=>setTimeout(r,150));const reconnect=connect(a.cookie);assert.equal((await wait(reconnect,'welcome')).players.find(p=>p.id===a.self.id).lng,moved);reconnect.ws.close();
  const bad=connect(a.cookie,'https://other.example');const code=await new Promise(resolve=>{bad.ws.on('unexpected-response',(_req,res)=>{resolve(res.statusCode);res.resume();bad.ws.terminate()});bad.ws.on('error',()=>{})});assert.equal(code,403);
 }finally{ca.ws.close();cb.ws.close()}
});

test('routine revision sync, header-free refresh and reconnect keep the latest live location',async()=>{
 const a=await join('Position Stability'),c=connect(a.cookie);let again;
 try{
  await wait(c,'welcome');await new Promise(r=>setTimeout(r,250));
  const first=a.self.lng+.00001,last=a.self.lng+.00003;
  c.ws.send(JSON.stringify({type:'move',lng:first,lat:a.self.lat,heading:90,seq:1}));await wait(c,'ack');
  const saved=await fetch(base+'/api/game',{method:'POST',headers:{Cookie:a.cookie,Origin:base,'Content-Type':'application/json'},body:JSON.stringify({type:'heartbeat'})});assert.equal(saved.status,200);
  await new Promise(r=>setTimeout(r,250));c.ws.send(JSON.stringify({type:'move',lng:last,lat:a.self.lat,heading:90,seq:2}));await wait(c,'ack');
  // A non-position life write finishes after the checkpoint but before sync.
  const script="import sqlite3,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nc.execute('UPDATE players SET revision=revision+1 WHERE id=?',(sys.argv[1],))\nc.commit()";
  assert.equal(spawnSync('python3',['-c',script,a.self.id]).status,0);
  c.ws.send(JSON.stringify({type:'sync',seq:3}));await wait(c,'synced');
  const current=await fetch(base+'/api/game',{headers:{Cookie:a.cookie}});assert.equal((await current.json()).self.lng,last,'a reload without a room header reads the live location');
  assert.equal(c.inbox.some(x=>x.type==='correct'),false,'normal updates do not send rollback corrections');
  const closed=new Promise(r=>c.ws.once('close',r));c.ws.close();await closed;
  again=connect(a.cookie);const welcome=await wait(again,'welcome');assert.equal(welcome.players.find(p=>p.id===a.self.id).lng,last,'reconnect keeps the newest move');
 }finally{c.ws.terminate();again?.ws.terminate()}
});
