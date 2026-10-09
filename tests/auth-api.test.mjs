import {HOMES,propertyId,startingLife} from '../public/game/life-catalog.js';
import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';import WebSocket from 'ws';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3001',tag=Date.now().toString(36),username=`auth_${tag}`,password='A private test passphrase 902!';
async function call(path,cookie,body,origin=base){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json',Origin:origin}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0],setCookie:r.headers.get('set-cookie')}}
function sql(statement,params=[]){const script=`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nr=c.execute(sys.argv[1],json.loads(sys.argv[2])).fetchall()\nc.commit()\nprint(json.dumps(r))`;const r=spawnSync('python3',['-c',script,statement,JSON.stringify(params)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)}
// Legacy fixtures only: the public API no longer creates guests.
async function guest(name){const id=crypto.randomUUID(),token=crypto.randomUUID(),start=startingLife(.5,.5),now=Date.now();sql('INSERT INTO players (id,name,avatar,session_token,place_id,pos_lng,pos_lat,money,life_json,last_seen_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)',[id,name,'🧑🏾',token,propertyId(id,start.life.home),start.lng,start.lat,start.money,JSON.stringify(start.life),now,now]);const cookie=`accralife_session=${token}`;return {cookie,self:(await call('/api/game',cookie)).body.self}}

function socket(cookie){const ws=new WebSocket(base.replace('http','ws')+'/api/realtime',{headers:{Cookie:cookie,Origin:base}});return {ws,welcome:new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Error('No welcome')),5000);ws.once('message',m=>{clearTimeout(timer);resolve(JSON.parse(m))});ws.on('error',reject)})}}
test('guest upgrades, resumes on another session, and can recover without losing their life', {timeout:60000},async()=>{
 sql('DELETE FROM auth_rate_limits');const g=await guest('Auth Guest');const home=HOMES.find(h=>h.id===g.self.life.home);assert.ok(home);assert.equal(g.self.placeId,propertyId(g.self.id,home.id));assert.deepEqual([g.self.lng,g.self.lat],[home.lng,home.lat]);assert.ok(g.self.life.properties.includes(home.id));assert.equal((await call('/api/game',g.cookie,{type:'enter',placeId:g.self.life.homeId})).status,403);sql('UPDATE players SET money=4321,xp=99 WHERE id=?',[g.self.id]);
 assert.equal((await call('/api/auth',g.cookie)).body.mode,'unregistered');assert.equal((await call('/api/auth',null)).body.mode,'none');
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
 assert.deepEqual(Object.keys(profile.body.profile).sort(),['avatar','handle','id','job','level','name','online','bio','socials','photoUrl'].sort(),'only public fields');
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

test('direct registration, persistent friends and city-wide presence', {timeout:60000},async()=>{
 sql('DELETE FROM auth_rate_limits');
 assert.equal((await call('/api/game',null,{type:'join',name:'No Guest',avatar:'🧑🏾'})).status,403);
 assert.equal((await call('/api/game',null,{type:'heartbeat'})).status,401);
 const baseline=(await call('/api/game',null)).body.onlineCount;
 const users=[];
 for(let i=0;i<3;i++){
  const handle=`friends_${i}_${tag}`,r=await call('/api/auth',null,{action:'register',username:handle,password,name:`Friend ${i}`});
  assert.equal(r.status,201,JSON.stringify(r.body));
  const self=(await call('/api/game',r.cookie)).body.self;assert.equal(self.handle,handle);assert.equal(self.money,100000);
  users.push({cookie:r.cookie,self,handle});
 }
 const [a,b,c]=users;
 const roomResponse=await fetch(base+'/api/game',{headers:{Cookie:a.cookie,'X-World-Room':'a-different-room'}});const room=await roomResponse.json();
 assert.deepEqual(room.players,[]);assert.equal(room.onlineCount,baseline+3,'global total independent of room list');
 const before=sql('SELECT COUNT(*) FROM players')[0][0];
 const duplicates=await Promise.all([0,1].map(i=>call('/api/auth',null,{action:'register',username:`race_${tag}`,password,name:`Race ${i}`})));
 assert.deepEqual(duplicates.map(r=>r.status).sort(),[201,409]);assert.equal(sql('SELECT COUNT(*) FROM players')[0][0],before+1,'failed registration creates no orphan character');
 assert.equal((await call('/api/contacts',a.cookie,{type:'request',contact:b.handle})).status,200);
 let contacts=(await call('/api/contacts',b.cookie)).body;assert.equal(contacts.friendCount,0);assert.equal(contacts.requestCount,1);assert.equal(contacts.contacts[0].handle,a.handle);
 const id=contacts.contacts[0].id;
 assert.equal((await call('/api/contacts',c.cookie,{type:'accept',id})).status,404);
 assert.equal((await call('/api/contacts',a.cookie,{type:'accept',id})).status,403);
 assert.equal((await call('/api/contacts',b.cookie,{type:'accept',id})).status,200);
 assert.equal((await call('/api/contacts',a.cookie)).body.friendCount,1);
 assert.equal((await call('/api/players?id='+b.self.id,a.cookie)).body.friendship.status,'accepted');
 assert.equal((await call('/api/contacts',c.cookie,{type:'request',contact:a.handle})).status,200);
 contacts=(await call('/api/contacts',a.cookie)).body;const incoming=contacts.contacts.find(f=>f.requestedBy===c.self.id);
 assert.equal((await call('/api/contacts',a.cookie,{type:'accept',id:incoming.id})).status,200);
 assert.equal((await call('/api/contacts',a.cookie)).body.friendCount,2);
 sql('DELETE FROM auth_rate_limits WHERE bucket=?',[`contacts:request:${a.self.id}`]);
 await call('/api/contacts',a.cookie,{type:'request',contact:b.handle});assert.equal((await call('/api/contacts',a.cookie)).body.friendCount,2,'duplicate friend does not inflate count');
 const count=(await call('/api/game',a.cookie)).body.onlineCount;
 await call('/api/auth',b.cookie,{action:'logout'});
 assert.equal((await call('/api/game',a.cookie)).body.onlineCount,count-1,'logout removes online player immediately');
 contacts=(await call('/api/contacts',a.cookie)).body;assert.equal(contacts.friendCount,2);assert.equal(contacts.contacts.find(f=>f.playerId===b.self.id).online,0);
 assert.equal((await call('/api/players',a.cookie,{to:b.handle,body:'See you when you return'})).status,200,'offline friends can receive messages');
 const login=await call('/api/auth',null,{action:'login',username:b.handle,password});assert.equal(login.status,200);
 assert.equal((await call('/api/players?id='+a.self.id,login.cookie)).body.messages.at(-1).body,'See you when you return');
 assert.equal((await call('/api/game',a.cookie)).body.onlineCount,count);
 sql('UPDATE players SET last_seen_at=? WHERE id=?',[Date.now()-121000,c.self.id]);
 assert.equal((await call('/api/game',a.cookie)).body.onlineCount,count-1,'stale presence expires');
 await call('/api/contacts',a.cookie,{type:'remove',id:incoming.id});assert.equal((await call('/api/contacts',a.cookie)).body.friendCount,1);
 for(const u of users)sql('UPDATE players SET session_token=NULL WHERE id=?',[u.self.id]);
});
