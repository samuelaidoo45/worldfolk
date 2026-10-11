import test from 'node:test';
import assert from 'node:assert/strict';
import WebSocket from 'ws';
import {spawnSync} from 'node:child_process';
import {HOMES,propertyId} from '../public/game/life-catalog.js';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3001',tag=Date.now().toString(36);
function sql(statement,params=[]){const r=spawnSync('python3',['-c',`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nr=c.execute(sys.argv[1],json.loads(sys.argv[2])).fetchall()\nc.commit()\nprint(json.dumps(r))`,statement,JSON.stringify(params)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)}
async function call(path,cookie,body,origin=base){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json',Origin:origin}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
async function user(i){const r=await call('/api/auth',null,{action:'register',username:`wardrobe_${i}_${tag}`,password:'A community test passphrase 2026!',name:'Wardrobe Tester'});assert.equal(r.status,201,JSON.stringify(r.body));return {cookie:r.cookie,id:(await call('/api/game',r.cookie)).body.self.id}}

test('home wardrobe enforces ownership and activity checks, saves appearance without charging money',async()=>{
 const a=await user('a'),b=await user('b'),request={type:'outfit-change',outfitId:'coastal'};
 assert.equal((await call('/api/game',null,request)).status,401);
 sql("UPDATE players SET place_id='osu',pos_lng=-.1819,pos_lat=5.5598 WHERE id=?",[a.id]);
 assert.equal((await call('/api/game',a.cookie,request)).status,400,'outside home');
 const self=(await call('/api/game',a.cookie)).body.self,home=HOMES.find(h=>h.id===self.life.home),own=propertyId(a.id,home.id);
 const set=(id,lifePatch={})=>sql("UPDATE players SET place_id=?,pos_lng=?,pos_lat=?,driving=0,life_json=json_patch(life_json,?),revision=revision+1 WHERE id=?",[id,home.lng,home.lat,JSON.stringify({explorationPending:false,...lifePatch}),a.id]);
 set(propertyId(b.id,home.id));assert.equal((await call('/api/game',a.cookie,request)).status,400,'another player home');
 set(own,{rest:{kind:'sleep',placeId:own,startedAt:Date.now()}});assert.equal((await call('/api/game',a.cookie,request)).status,400,'sleeping');
 set(own,{rest:null});assert.equal((await call('/api/game',a.cookie,{...request,outfitId:'arbitrary'})).status,400);
 const worn=await call('/api/game',a.cookie,{...request,playerId:b.id,money:999999});assert.equal(worn.status,200,JSON.stringify(worn.body));
 assert.equal(worn.body.self.life.outfit,'coastal');assert.equal(worn.body.self.money,self.money);
 assert.equal((await call('/api/game',a.cookie)).body.self.life.outfit,'coastal','persists in saved profile');
 assert.equal((await call('/api/game',b.cookie)).body.self.life.outfit,null,'cannot change another player');
 // Back in the city, both polling and WebSocket presence carry the saved outfit.
 for(const id of [a.id,b.id])sql("UPDATE players SET place_id='osu',pos_lng=-.1819,pos_lat=5.5598,last_move_at=?,revision=revision+1 WHERE id=?",[Date.now(),id]);
 const visible=(await call('/api/game',b.cookie)).body.players.find(p=>p.id===a.id);assert.equal(visible.outfit,'coastal');assert.equal(visible.inventory,undefined);
 const sockets=[];
 async function connect(cookie){return new Promise((resolve,reject)=>{const ws=new WebSocket(base.replace('http','ws')+'/api/realtime',{headers:{Cookie:cookie,Origin:base}});sockets.push(ws);const timer=setTimeout(()=>reject(Error('Missing welcome')),5000);ws.on('error',error=>{clearTimeout(timer);reject(error)});ws.on('message',raw=>{const m=JSON.parse(String(raw));if(m.type==='welcome'){clearTimeout(timer);resolve(m)}})})}
 try{await connect(a.cookie);const welcome=await connect(b.cookie);assert.equal(welcome.players.find(p=>p.id===a.id).outfit,'coastal','nearby players receive clothing');assert.ok(!JSON.stringify(welcome).includes('session_token'))}finally{for(const ws of sockets)ws.terminate()}

 // An owned home ID without physical proximity cannot grant wardrobe access.
 set(own);sql('UPDATE players SET pos_lng=pos_lng+.02 WHERE id=?',[a.id]);assert.equal((await call('/api/game',a.cookie,{...request,outfitId:'city'})).status,400);
});
