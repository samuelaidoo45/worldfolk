// Explicit local integration test: walk through a full periodic-save cycle.
import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3001';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('This fixture is local-only');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
test('movement survives concurrent life sync, polling and the sixty-second checkpoint',{timeout:85000},async()=>{
 let cookie,ws,seq=0,corrections=0,acknowledged=0;
 const call=async(path,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json',Origin:base}:{})},body:body?JSON.stringify(body):undefined});const data=await r.json();assert.ok(r.ok,JSON.stringify(data));cookie=r.headers.get('set-cookie')?.split(';')[0]||cookie;return data};
 await call('/api/auth',{action:'register',username:'sync_'+Date.now().toString(36),password:'A local movement regression 2026!',name:'Sync regression',avatar:'🧑🏾'});
 try{
  await call('/api/game',{type:'start-exploring',placeId:'osu'});
  const self=(await call('/api/game')).self;
  const welcome=new Promise((resolve,reject)=>{ws=new WebSocket(base.replace('http','ws')+'/api/realtime',{headers:{Cookie:cookie,Origin:base}});ws.on('message',raw=>{const m=JSON.parse(raw);if(m.type==='welcome')resolve(m);if(m.type==='correct')corrections++;if(m.type==='ack')acknowledged++});ws.on('error',reject)});
  await welcome;let lng=self.lng;
  for(let i=0;i<125;i++){
   await delay(510);lng+=.000005;assert.equal(ws.readyState,WebSocket.OPEN,'socket stays connected');ws.send(JSON.stringify({type:'move',seq:++seq,lng,lat:self.lat,heading:90}));
   if(i%20===10){await call('/api/game',{type:'vitals'});ws.send(JSON.stringify({type:'sync',seq:++seq}));const poll=await call('/api/game');assert.ok(poll.self.lng>=self.lng,'poll never returns to an earlier start');}
  }
  await delay(250);assert.equal(corrections,0,'no unsolicited position reset');assert.ok(acknowledged>=120);
  await call('/api/game',{type:'vitals'});const saved=(await call('/api/game')).self;assert.ok(Math.abs(saved.lng-lng)<.000006,'latest movement is persisted');
 }finally{ws?.close();if(cookie)await call('/api/auth',{action:'logout'})}
});
