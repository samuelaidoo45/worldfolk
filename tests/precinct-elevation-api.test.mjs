import {PRECINCT_LANDMARKS,precinctPoint} from '../public/game/precinct-navigation.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import {spawnSync} from 'node:child_process';
import {HOMES,propertyId} from '../public/game/life-catalog.js';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3001',tag=Date.now().toString(36);
function sql(statement,params=[]){const r=spawnSync('python3',['-c',`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nr=c.execute(sys.argv[1],json.loads(sys.argv[2])).fetchall()\nc.commit()\nprint(json.dumps(r))`,statement,JSON.stringify(params)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)}
async function call(path,cookie,body,origin=base){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json',Origin:origin}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
async function user(i){const r=await call('/api/auth',null,{action:'register',username:`stairs_${i}_${tag}`,password:'A community test passphrase 2026!',name:'Stairs Tester'});assert.equal(r.status,201,JSON.stringify(r.body));return {cookie:r.cookie,id:(await call('/api/game',r.cookie)).body.self.id}}

test('platform height persists through HTTP, WebSocket broadcast and checkpoint',async()=>{
 if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw Error('Local-only fixture');
 const a=await user('a'),b=await user('b'),arch=PRECINCT_LANDMARKS.find(l=>l.id==='independence-arch');
 const start=precinctPoint(arch,15,26),deck=precinctPoint(arch,15,8);
 for(const u of [a,b])sql("UPDATE players SET place_id='square',pos_lng=?,pos_lat=?,driving=0,last_move_at=?,life_json=json_patch(life_json,?),revision=revision+1 WHERE id=?",[...start,Date.now()-8000,JSON.stringify({explorationPending:false,elevation:0}),u.id]);
 const moved=await call('/api/game',a.cookie,{type:'move',lng:deck[0],lat:deck[1],heading:0,elevation:11});assert.equal(moved.status,200,JSON.stringify(moved.body));
 assert.equal((await call('/api/game',a.cookie)).body.self.life.elevation,11);
 assert.equal((await call('/api/game',b.cookie)).body.players.find(p=>p.id===a.id).elevation,11);
 const sockets=[];async function connect(cookie){return new Promise((resolve,reject)=>{const ws=new WebSocket(base.replace('http','ws')+'/api/realtime',{headers:{Cookie:cookie,Origin:base}});sockets.push(ws);const timer=setTimeout(()=>reject(Error('Missing welcome')),5000);ws.on('error',reject);ws.on('message',raw=>{const m=JSON.parse(String(raw));if(m.type==='welcome'){clearTimeout(timer);resolve({ws,data:m})}})})}
 try{
  const first=await connect(a.cookie),second=await connect(b.cookie);assert.equal(second.data.players.find(p=>p.id===a.id).elevation,11);
  const ack=new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('Missing ack')),5000);first.ws.on('message',raw=>{const m=JSON.parse(String(raw));if(m.type==='ack'&&m.seq===1){clearTimeout(timer);resolve(m)}})});
  await new Promise(r=>setTimeout(r,220));const next=precinctPoint(arch,14.7,8);first.ws.send(JSON.stringify({type:'move',seq:1,lng:next[0],lat:next[1],heading:90,elevation:11}));await ack;
  await call('/api/game',a.cookie,{type:'vitals'});const saved=(await call('/api/game',a.cookie)).body.self;assert.equal(saved.life.elevation,11);assert.ok(Math.abs(saved.lng-next[0])<.000001);
 }finally{for(const ws of sockets)ws.terminate()}
 await new Promise(r=>setTimeout(r,250));const rejected=await call('/api/game',a.cookie,{type:'move',lng:deck[0],lat:deck[1],heading:0,elevation:17.2});assert.equal(rejected.status,400);
});
