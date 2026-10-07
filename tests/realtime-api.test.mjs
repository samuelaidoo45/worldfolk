import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
const base='http://127.0.0.1:3000';
async function join(name){const r=await fetch(base+'/api/game',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({type:'join',name,avatar:'🧑🏾'})});assert.equal(r.status,201);return {cookie:r.headers.get('set-cookie').split(';')[0],self:(await r.json()).self}}
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
