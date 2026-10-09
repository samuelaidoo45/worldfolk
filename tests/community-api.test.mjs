import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3001',tag=Date.now().toString(36);
function sql(statement,params=[]){const r=spawnSync('python3',['-c',`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nr=c.execute(sys.argv[1],json.loads(sys.argv[2])).fetchall()\nc.commit()\nprint(json.dumps(r))`,statement,JSON.stringify(params)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)}
async function call(path,cookie,body,origin=base){const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{Cookie:cookie}:{}),...(body?{'Content-Type':'application/json',Origin:origin}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
async function user(i){const r=await call('/api/auth',null,{action:'register',username:`community_${i}_${tag}`,password:'A community test passphrase 2026!',name:'Community Tester'});assert.equal(r.status,201,JSON.stringify(r.body));return {cookie:r.cookie,id:(await call('/api/game',r.cookie)).body.self.id}}
test('public profile links, photo upload validation and account ownership',async()=>{
 sql('DELETE FROM auth_rate_limits');const a=await user('a'),b=await user('b');
 assert.equal((await call('/api/profile',null)).status,401);
 assert.equal((await call('/api/profile',a.cookie,{bio:'Hi',socials:{instagram:'javascript:alert(1)'}})).status,400);
 assert.equal((await call('/api/profile',a.cookie,{bio:'Hi',socials:{instagram:'https://instagram.com.evil.example/me'}})).status,400);
 assert.equal((await call('/api/profile',a.cookie,{bio:'Hi',socials:{}},'https://attacker.example')).status,403);
 assert.equal((await call('/api/profile',a.cookie,{bio:'Artist in Accra',socials:{instagram:'https://www.instagram.com/artist',x:'https://x.com/artist'},playerId:b.id})).status,200);
 const p=(await call('/api/players?id='+a.id,b.cookie)).body.profile;assert.equal(p.bio,'Artist in Accra');assert.equal(p.socials.x,'https://x.com/artist');assert.equal((await call('/api/profile',b.cookie)).body.bio,'');
 const bad=await fetch(base+'/api/profile/photo',{method:'POST',headers:{Cookie:a.cookie,Origin:base,'Content-Type':'image/jpeg'},body:'<svg onload=alert(1)></svg>'});assert.equal(bad.status,400);
 const fixture=await sharp({create:{width:32,height:32,channels:3,background:'#16864a'}}).jpeg().toBuffer();
 const upload=await fetch(base+'/api/profile/photo',{method:'POST',headers:{Cookie:a.cookie,Origin:base,'Content-Type':'image/jpeg'},body:fixture});assert.equal(upload.status,200,await upload.clone().text());const image=(await upload.json()).photoUrl;
 const served=await fetch(base+image);assert.equal(served.status,200);assert.equal(served.headers.get('content-type'),'image/jpeg');assert.equal(served.headers.get('x-content-type-options'),'nosniff');assert.ok(served.headers.get('content-security-policy').includes('sandbox'));
 assert.equal((await call('/api/players?id='+a.id,b.cookie)).body.profile.photoUrl,image);
 assert.equal((await call('/api/profile/photo',b.cookie,{action:'remove',playerId:a.id})).status,200);assert.equal((await fetch(base+image)).status,200,'another player cannot remove this photo');
 assert.equal((await call('/api/profile/photo',a.cookie,{action:'remove'})).status,200);assert.equal((await fetch(base+image)).status,404);
});
test('ads require admin approval and verified manual payment; advertiser contact stays private',async()=>{
 sql('DELETE FROM auth_rate_limits');const a=await user('c'),b=await user('d'),admin=await user('admin');
 sql('INSERT INTO platform_admins (player_id,created_at) VALUES (?,?)',[admin.id,Date.now()]);
 const ad={action:'create',brand:'Accra Studio',headline:'Meet your next creative team',detail:'Local design for everyone',url:'https://example.com',color:'#184f43',audience:'business',contact:'test-advertiser@example.com'};
 assert.equal((await call('/api/ads',null,ad)).status,401);assert.equal((await call('/api/ads',a.cookie,{...ad,url:'javascript:alert(1)'})).status,400);
 assert.equal((await call('/api/ads',a.cookie,{...ad,contact:''})).status,400);
 const both=await Promise.all([call('/api/ads',a.cookie,{...ad,amountMinor:1,status:'active',paymentConfirmedAt:Date.now()}),call('/api/ads',a.cookie,ad)]);assert.deepEqual(both.map(r=>r.status).sort(),[201,409]);const id=both.find(r=>r.status===201).body.id;
 assert.equal((await call('/api/game',a.cookie)).body.self.money,100000,'no in-game currency charged');
 let own=(await call('/api/ads?mine=1',a.cookie)).body;assert.equal(own.campaigns[0].amountMinor,10000);assert.equal(own.campaigns[0].contact,ad.contact);assert.equal(own.campaigns[0].status,'pending_review');assert.equal(own.isAdmin,false);
 assert.equal((await call('/api/ads?admin=1',b.cookie)).status,403);assert.equal((await call('/api/ads',a.cookie,{action:'approve',id})).status,403);
 assert.equal((await call('/api/ads',a.cookie,{action:'resume',id})).status,409);
 assert.ok(!(await call('/api/ads',null)).body.campaigns.some(x=>x.id===id));
 const payment={action:'confirm-payment',id,received:true,reference:'MANUAL-TEST-RECEIPT-01',amountMinor:10000};
 assert.equal((await call('/api/ads',admin.cookie,payment)).status,409,'payment cannot publish an unapproved ad');
 assert.equal((await call('/api/ads',admin.cookie,{action:'approve',id})).status,200);
 assert.ok(!(await call('/api/ads',null)).body.campaigns.some(x=>x.id===id),'approval alone does not publish');
 assert.equal((await call('/api/ads',a.cookie,payment)).status,403,'advertisers cannot confirm their own payment');
 assert.equal((await call('/api/ads',admin.cookie,{...payment,received:false})).status,400);
 assert.equal((await call('/api/ads',admin.cookie,{...payment,amountMinor:5000})).status,409);
 assert.equal((await call('/api/ads',admin.cookie,payment)).status,200);
 own=(await call('/api/ads?mine=1',a.cookie)).body.campaigns[0];assert.equal(own.status,'active');assert.equal(own.expiresAt-own.publishedAt,86400000);
 assert.equal((await call('/api/ads',admin.cookie,payment)).status,409,'duplicate confirmation cannot extend a paid campaign');
 const live=(await call('/api/ads',null)).body.campaigns.find(x=>x.id===id);assert.ok(live);assert.equal(live.contact,undefined);assert.equal(live.paymentReference,undefined);
 const queue=(await call('/api/ads?admin=1',admin.cookie)).body;assert.equal(queue.isAdmin,true);assert.equal(queue.campaigns.find(x=>x.id===id).contact,ad.contact);
 assert.equal((await call('/api/ads',b.cookie,{action:'pause',id})).status,409);assert.equal((await call('/api/ads',a.cookie,{action:'pause',id})).status,200);assert.equal((await call('/api/ads',a.cookie,{action:'resume',id})).status,200);
 assert.equal((await call('/api/ads',admin.cookie,{action:'suspend',id,note:'Misleading content reported'})).status,200);assert.equal((await call('/api/ads',a.cookie,{action:'resume',id})).status,409);assert.ok(!(await call('/api/ads',null)).body.campaigns.some(x=>x.id===id));
 const individual=await call('/api/ads',b.cookie,{...ad,audience:'player'});assert.equal(individual.status,201);assert.equal((await call('/api/ads?mine=1',b.cookie)).body.campaigns[0].amountMinor,5000);
 assert.equal((await call('/api/ads',admin.cookie,{action:'reject',id:individual.body.id,note:'Please supply a clearer headline'})).status,200);assert.equal((await call('/api/ads',admin.cookie,{action:'approve',id:individual.body.id})).status,409);
 assert.equal(sql('SELECT COUNT(*) FROM ad_events WHERE campaign_id=?',[id])[0][0],5,'successful admin and owner transitions are audited');
});
