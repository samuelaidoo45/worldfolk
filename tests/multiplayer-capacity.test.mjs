// Local integration only. More than 128 connections in one geographic district.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import WebSocket from 'ws';
import {HOMES} from '../public/game/life-catalog.js';
const base='http://127.0.0.1:3000';
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function fixture(rows){const script=`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nfor r in json.loads(sys.argv[1]):\n c.execute("INSERT INTO players (id,name,avatar,session_token,place_id,pos_lng,pos_lat,last_seen_at,created_at) VALUES (?,?,?,?,'home',?,?,?,?)",(r['id'],'Capacity Test','🧑🏾',r['token'],r.get('lng',-0.285),r.get('lat',5.705),r['now'],r['now']))\nc.commit()`;const p=spawnSync('python3',['-c',script,JSON.stringify(rows)],{encoding:'utf8'});assert.equal(p.status,0,p.stderr)}
function connect(p){const ws=new WebSocket(base.replace('http','ws')+'/api/realtime',{headers:{Cookie:'accralife_session='+p.token,Origin:base}}),inbox=[];ws.on('message',s=>inbox.push(JSON.parse(s)));ws.on('error',()=>{});return {ws,inbox,p}}
async function wait(c,type,predicate=()=>true){for(let i=0;i<400;i++){const n=c.inbox.findIndex(m=>m.type===type&&predicate(m));if(n>=0)return c.inbox.splice(n,1)[0];await pause(25)}throw Error('Missing '+type)}
async function api(p,body,headers={}){return fetch(base+'/api/game',{method:body?'POST':'GET',headers:{Cookie:'accralife_session='+p.token,Origin:base,'Content-Type':'application/json',...headers},body:body?JSON.stringify(body):undefined})}
test('registration persists a private assigned home across reconnects',async()=>{
 const r=await fetch(base+'/api/game',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({type:'join',name:'Home Assignment Test',avatar:'🧑🏾'})});
 assert.equal(r.status,201);const p=(await r.json()).self,home=HOMES.find(h=>h.id===p.life.home);
 assert.deepEqual([p.lng,p.lat],[home.lng,home.lat]);assert.equal(p.placeId,p.life.homeId);assert.ok(p.life.properties.includes(home.id));
 const again=await fetch(base+'/api/game',{method:'POST',headers:{Origin:base,'Content-Type':'application/json',Cookie:r.headers.get('set-cookie').split(';')[0]},body:JSON.stringify({type:'join',name:'Changed Name',avatar:'🧑🏾'})});
 assert.equal(again.status,200);assert.equal((await again.json()).self.life.homeId,p.life.homeId);
});
test('130 players join one district with overflow, checkpointing and reconnect isolation', {timeout:120000},async()=>{
 const rows=Array.from({length:130},()=>({id:randomUUID(),token:randomUUID(),now:Date.now()}));fixture(rows);const connections=[];
 try{
  for(let offset=0;offset<rows.length;offset+=20)await Promise.all(rows.slice(offset,offset+20).map(async row=>{const c=connect(row);connections.push(c);c.hello=await wait(c,'welcome');assert.ok(!JSON.stringify(c.hello).includes('session_token'))}));
  const grouped=Map.groupBy(connections,c=>c.hello.room);assert.ok(grouped.size>=2,'district opens additional instances');assert.equal(connections.length,130);
  const group=[...grouped.values()].find(g=>g.length>=2&&g.length<128),a=group[0],b=group[1];
  a.inbox.length=0;b.inbox.length=0;
  // Use fresh reconnect sockets for both overflow players to verify instance affinity.
  const aa=connect(a.p);connections.push(aa);const hello=await wait(aa,'welcome');assert.equal(hello.room,a.hello.room);
  await pause(250);assert.notEqual(a.ws.readyState,WebSocket.OPEN,'old same-player connection is replaced');
  b.inbox.length=0;aa.ws.send(JSON.stringify({type:'move',lng:-.28499,lat:5.705,heading:90,seq:1}));await wait(aa,'ack');
  assert.equal((await wait(b,'player',m=>m.player.id===a.p.id&&m.player.lng===-.28499)).player.lng,-.28499);
  const r=await api(a.p,null,{'X-World-Room':'accra:forged:instance:999'});assert.equal((await r.json()).self.lng,-.28499,'server uses authenticated player routing, not caller-provided room');
  assert.equal((await api(a.p,{type:'heartbeat'})).status,200);const read=await api(a.p);assert.equal((await read.json()).self.lng,-.28499,'HTTP actions checkpoint overflow positions');
  const before=await api(b.p,null,{'X-World-Room':hello.room});assert.equal((await before.json()).self.lng,-.285,'another player cannot read the owner live state');
 }finally{for(const c of connections)c.ws.close();await pause(300);for(const c of connections)c.ws.terminate()}
});

test('district boundary reconnect preserves movement and changes instance', {timeout:20000},async()=>{
 const p={id:randomUUID(),token:randomUUID(),now:Date.now(),lng:-.28001,lat:5.705};fixture([p]);const a=connect(p);let b;
 try{
  const hello=await wait(a,'welcome');
  const closed=new Promise(resolve=>a.ws.once('close',resolve));
  await pause(400);
  a.ws.send(JSON.stringify({type:'move',lng:-.27999,lat:p.lat,heading:90,seq:1}));await wait(a,'ack');
  assert.equal(await Promise.race([closed,pause(5000).then(()=>0)]),4001);
  b=connect(p);const next=await wait(b,'welcome');assert.notEqual(next.room.split(':instance:')[0],hello.room.split(':instance:')[0]);
  assert.equal(next.players.find(x=>x.id===p.id).lng,-.27999);
  const response=await api(p,null,{'X-World-Room':next.room});assert.equal((await response.json()).self.lng,-.27999);
 }finally{a.ws.terminate();b?.ws.terminate()}
});
