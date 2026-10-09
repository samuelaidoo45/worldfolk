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
test('campaign charge is atomic, owner-only controls and reports suspend an ad',async()=>{
 sql('DELETE FROM auth_rate_limits');const a=await user('c'),b=await user('d'),c=await user('e'),d=await user('f');
 const ad={action:'create',brand:'Accra Studio',headline:'Meet your next creative team',detail:'Local design for everyone',url:'https://example.com',color:'#184f43',audience:'business'};
 assert.equal((await call('/api/ads',null,ad)).status,401);assert.equal((await call('/api/ads',a.cookie,{...ad,url:'javascript:alert(1)'})).status,400);
 const both=await Promise.all([call('/api/ads',a.cookie,ad),call('/api/ads',a.cookie,ad)]);assert.deepEqual(both.map(r=>r.status).sort(),[201,409]);const id=both.find(r=>r.status===201).body.id;
 assert.equal((await call('/api/game',a.cookie)).body.self.money,99500);
 assert.ok((await call('/api/ads',null)).body.campaigns.some(x=>x.id===id));assert.equal((await call('/api/ads',b.cookie,{action:'pause',id})).status,404);
 assert.equal((await call('/api/ads',a.cookie,{action:'pause',id})).status,200);assert.ok(!(await call('/api/ads',null)).body.campaigns.some(x=>x.id===id));
 assert.equal((await call('/api/ads',a.cookie,{action:'resume',id})).status,200);
 for(const peer of [b,b,c,d])assert.equal((await call('/api/ads',peer.cookie,{action:'report',id,reason:'Misleading advertisement'})).status,200);
 assert.equal(sql('SELECT COUNT(*) FROM ad_reports WHERE campaign_id=?',[id])[0][0],3);assert.ok(!(await call('/api/ads',null)).body.campaigns.some(x=>x.id===id));assert.equal((await call('/api/ads',a.cookie,{action:'resume',id})).status,404);
 sql('UPDATE ad_campaigns SET expires_at=1,status=? WHERE id=?',['active',id]);assert.ok(!(await call('/api/ads',null)).body.campaigns.some(x=>x.id===id));
 sql('UPDATE players SET money=100 WHERE id=?',[b.id]);assert.equal((await call('/api/ads',b.cookie,ad)).status,409);assert.equal((await call('/api/game',b.cookie)).body.self.money,100);
});
