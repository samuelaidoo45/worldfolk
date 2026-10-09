import {HOMES,propertyId} from '../public/game/life-catalog.js';
import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import WebSocket from 'ws';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3001',tag=Date.now().toString(36),username=`auth_${tag}`,password='A private test passphrase 902!';
async function call(path,cookie,body,origin=base){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json',Origin:origin}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0],setCookie:r.headers.get('set-cookie')}}
function sql(statement,params=[]){const script=`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nr=c.execute(sys.argv[1],json.loads(sys.argv[2])).fetchall()\nc.commit()\nprint(json.dumps(r))`;const r=spawnSync('python3',['-c',script,statement,JSON.stringify(params)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)}
async function guest(name){const r=await call('/api/game',null,{type:'join',name,avatar:'🧑🏾'});assert.equal(r.status,201);return {cookie:r.cookie,self:r.body.self}}
function socket(cookie){const ws=new WebSocket(base.replace('http','ws')+'/api/realtime',{headers:{Cookie:cookie,Origin:base}});return {ws,welcome:new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('No welcome')),5000);ws.once('message',m=>{clearTimeout(timer);resolve(JSON.parse(m))});ws.on('error',reject)})}}
test('guest upgrades, resumes on another session, and can recover without losing their life', {timeout:60000},async()=>{
 sql('DELETE FROM auth_rate_limits');const g=await guest('Auth Guest');const home=HOMES.find(h=>h.id===g.self.life.home);assert.ok(home);assert.equal(g.self.placeId,propertyId(g.self.id,home.id));assert.deepEqual([g.self.lng,g.self.lat],[home.lng,home.lat]);assert.ok(g.self.life.properties.includes(home.id));assert.equal((await call('/api/game',g.cookie,{type:'enter',placeId:g.self.life.homeId})).status,403);sql('UPDATE players SET money=4321,xp=99 WHERE id=?',[g.self.id]);
 assert.equal((await call('/api/auth',g.cookie)).body.mode,'guest');assert.equal((await call('/api/auth',null)).body.mode,'none');
 assert.equal((await call('/api/auth',g.cookie,{action:'register',username,password:'short'})).status,400);
 assert.equal((await call('/api/auth',g.cookie,{action:'register',username,password},'https://attacker.example')).status,403);
 const reg=await call('/api/auth',g.cookie,{action:'register',username,password});assert.equal(reg.status,201,JSON.stringify(reg.body));assert.match(reg.setCookie,/HttpOnly/);assert.match(reg.setCookie,/SameSite=Lax/);assert.notEqual(reg.cookie,g.cookie);assert.match(reg.body.recoveryCode,/^[a-f0-9]{48}$/);

 assert.equal((await call('/api/game',g.cookie)).body.self,null,'upgrading revokes the old guest token');
 let r=await call('/api/game',reg.cookie);assert.equal(r.body.self.id,g.self.id);assert.equal(r.body.self.money,4321);assert.equal(r.body.self.xp,99);assert.equal(r.body.self.life.homeId,g.self.life.homeId);
 assert.equal((await call('/api/auth',reg.cookie)).body.username,username);
 assert.equal(r.body.self.handle,username);assert.ok(!JSON.stringify(r.body).includes('password_hash'));const named=socket(reg.cookie);try{const welcome=await named.welcome;assert.equal(welcome.players.find(p=>p.id===g.self.id).handle,username);assert.ok(!JSON.stringify(welcome).includes('password_hash'))}finally{named.ws.terminate()}
 assert.equal((await call('/api/game',reg.cookie,{type:'vitals'})).body.self.handle,username);
 const stored=sql('SELECT password_hash,recovery_hash FROM accounts WHERE username=?',[username])[0];assert.match(stored[0],/^scrypt-v1\$/);assert.ok(!stored.includes(password));assert.notEqual(stored[1],reg.body.recoveryCode);
 assert.equal((await call('/api/auth',null,{action:'login',username,password:'wrong password'})).status,401);
 const login=await call('/api/auth',null,{action:'login',username:username.toUpperCase(),password});assert.equal(login.status,200);assert.equal((await call('/api/game',login.cookie)).body.self.id,g.self.id);assert.equal((await call('/api/game',reg.cookie)).body.self,null);
 assert.equal((await call('/api/auth',login.cookie,{action:'logout'})).status,200);assert.equal((await call('/api/game',login.cookie)).body.self,null);
 assert.equal((await call('/api/game',`accralife_session=${g.self.id}`)).body.self,null,'a public player ID cannot restore a logged-out session');
 const newPassword='A replacement test passphrase 904!';
 assert.equal((await call('/api/auth',null,{action:'recover',username,password:newPassword,recoveryCode:'0'.repeat(48)})).status,401);
 const recovery=await call('/api/auth',null,{action:'recover',username,password:newPassword,recoveryCode:reg.body.recoveryCode});assert.equal(recovery.status,200);assert.notEqual(recovery.body.recoveryCode,reg.body.recoveryCode);
 assert.equal((await call('/api/auth',null,{action:'recover',username,password:newPassword,recoveryCode:reg.body.recoveryCode})).status,401,'used recovery codes are revoked');
 assert.equal((await call('/api/auth',null,{action:'login',username,password})).status,401);
 const resumed=await call('/api/auth',null,{action:'login',username,password:newPassword});assert.equal(resumed.status,200);assert.equal((await call('/api/game',resumed.cookie)).body.self.money,4321);
 sql('UPDATE players SET session_expires_at=1 WHERE id=?',[g.self.id]);assert.equal((await call('/api/game',resumed.cookie)).body.self,null);assert.equal((await call('/api/voice',resumed.cookie)).status,401);
});
test('duplicate profile claims and repeated login attempts are rejected', {timeout:60000},async()=>{
 sql('DELETE FROM auth_rate_limits');const g=await guest('Another Auth Guest');
 assert.equal((await call('/api/auth',g.cookie,{action:'register',username,password})).status,409);
 const own=`second_${tag}`;const r=await call('/api/auth',g.cookie,{action:'register',username:own,password});assert.equal(r.status,201);
 assert.equal((await call('/api/auth',r.cookie,{action:'register',username:`third_${tag}`,password})).status,409);
 for(let i=0;i<12;i++)assert.equal((await call('/api/auth',null,{action:'recover',username:'missing_user',password,recoveryCode:'0'.repeat(48)})).status,401);
 assert.equal((await call('/api/auth',null,{action:'recover',username:'missing_user',password,recoveryCode:'0'.repeat(48)})).status,429);
});

test('registered handles, mandatory entry and private profile chat', {timeout:60000},async()=>{
 sql('DELETE FROM auth_rate_limits');const a=await guest('Social Tester A');
 assert.equal((await call('/api/game',a.cookie,{type:'move',lng:a.self.lng,lat:a.self.lat,heading:0})).status,403);
 assert.equal((await call('/api/players?id='+a.self.id,a.cookie)).status,401);
 assert.equal((await call('/api/contacts',a.cookie)).status,401);
 await new Promise((resolve,reject)=>{const ws=new WebSocket(base.replace('http','ws')+'/api/realtime',{headers:{Cookie:a.cookie,Origin:base}});ws.once('unexpected-response',(_,r)=>{try{assert.equal(r.statusCode,401);r.resume();resolve()}catch(e){reject(e)}finally{ws.terminate()}});ws.on('error',()=>{});ws.once('open',()=>{ws.terminate();reject(Error('Guest entered multiplayer'))})});
 const users=[];for(const [i,g] of [a,await guest('Social Tester B'),await guest('Social Tester C')].entries()){
  const handle=`social_${i}_${tag}`,r=await call('/api/auth',g.cookie,{action:'register',username:handle,password});assert.equal(r.status,201,JSON.stringify(r.body));users.push({...g,handle,cookie:r.cookie});
 }
 const [one,two,three]=users;
 const profile=await call('/api/players?id='+two.self.id,one.cookie);assert.equal(profile.status,200);assert.equal(profile.body.profile.handle,two.handle);
 assert.deepEqual(Object.keys(profile.body.profile).sort(),['avatar','handle','id','job','level','name','online'].sort(),'only public fields');
 assert.equal((await call('/api/game',one.cookie,{type:'enter',placeId:one.self.life.homeId})).status,200);
 const sends=await Promise.all([call('/api/players',one.cookie,{to:two.handle,body:'Hello from the city'}),call('/api/players',one.cookie,{to:two.handle,body:'Duplicate burst'})]);
 assert.deepEqual(sends.map(r=>r.status).sort(),[200,429]);
 const received=await call('/api/players?id='+one.self.id,two.cookie);assert.equal(received.body.messages.length,1);assert.equal(received.body.messages[0].senderId,one.self.id);
 const stranger=await call('/api/players?id='+one.self.id,three.cookie);assert.deepEqual(stranger.body.messages,[],'another player cannot read their conversation');
 const inbox=await call('/api/players?inbox=1',two.cookie);assert.equal(inbox.body.conversations[0].handle,one.handle);
 assert.deepEqual((await call('/api/players?inbox=1',three.cookie)).body.conversations,[]);
 assert.equal((await call('/api/players',two.cookie,{to:one.self.id,body:'Hello back'},'https://attacker.example')).status,403);
 assert.equal((await call('/api/players',two.cookie,{to:one.self.id,body:'Hello back',senderId:three.self.id})).status,200);
 const reply=await call('/api/players?id='+two.self.id,one.cookie);assert.equal(reply.body.messages.at(-1).senderId,two.self.id,'sender identity comes from session');
 const publicChat=await call('/api/game?channel=dm:'+one.self.id+':'+two.self.id,three.cookie);assert.ok(!publicChat.body.messages.some(m=>m.body==='Hello back'),'DM cannot be read through public chat');
});
