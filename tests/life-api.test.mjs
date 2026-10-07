// Integration tests against the local server only. Fixtures alter local SQLite.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const base='http://127.0.0.1:3000';
async function call(cookie,body){const r=await fetch(base+'/api/game',{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
async function player(name){const r=await call(null,{type:'join',name,avatar:'🧑🏾'});assert.equal(r.status,201);const id=r.body.self.id;fixture(id,{pos_lng:-.1949,pos_lat:5.5682,place_id:`p_${id}_starter`,money:120,life_json:'{}'});const stable=await call(r.cookie);return {id,cookie:r.cookie,self:stable.body.self}}
function fixture(id,values){const script=`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nv=json.loads(sys.argv[2])\nc.execute('UPDATE players SET '+','.join(k+'=?' for k in v)+' WHERE id=?',list(v.values())+[sys.argv[1]])\nc.commit()`;const r=spawnSync('python3',['-c',script,id,JSON.stringify(values)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr)}
test('saved home, private passes, purchases, wages, motorcycle and flights',async()=>{
 const owner=await player('Life Owner'),guest=await player('Life Guest');
 assert.match(owner.self.placeId,/^p_/);assert.ok(owner.self.life.properties.includes('starter'));assert.notEqual(owner.cookie.split('=')[1],owner.id);
 assert.equal((await call('accralife_session='+owner.id)).body.self,null,'public player ID is not a session');
 assert.equal((await call(guest.cookie,{type:'enter',placeId:'g_-1949_55682'})).status,403,'generic map points cannot bypass private homes');
 let r=await call(guest.cookie,{type:'enter',placeId:owner.self.life.homeId});assert.equal(r.status,403);
 r=await call(guest.cookie,{type:'pass-create',propertyId:owner.self.life.homeId});assert.equal(r.status,403);
 r=await call(owner.cookie,{type:'pass-create',propertyId:owner.self.life.homeId});assert.equal(r.status,200);const code=r.body.pass;
 assert.equal((await call(guest.cookie,{type:'pass-redeem',code})).status,200);
 assert.equal((await call(guest.cookie,{type:'enter',placeId:owner.self.life.homeId})).status,200);
 assert.equal((await call(guest.cookie,{type:'pass-redeem',code})).status,400);
 assert.equal((await call(owner.cookie,{type:'pass-revoke',propertyId:owner.self.life.homeId})).status,200);
 assert.equal((await call(guest.cookie,{type:'enter',placeId:owner.self.life.homeId})).status,403);
 assert.equal((await call(owner.cookie,{type:'buy',itemId:'waakye'})).status,400,'must visit shop');
 fixture(owner.id,{pos_lng:-.2141,pos_lat:5.5485,place_id:'makola',money:12});
 const purchases=await Promise.all([call(owner.cookie,{type:'buy',itemId:'waakye'}),call(owner.cookie,{type:'buy',itemId:'waakye'})]);assert.equal(purchases.filter(r=>r.status===200).length,1,'concurrent purchases cannot overspend');
 r=await call(owner.cookie);assert.equal(r.body.self.money,0);assert.equal(r.body.self.life.inventory.waakye,1);
 assert.equal((await call(owner.cookie,{type:'consume',itemId:'waakye'})).status,200);assert.equal((await call(owner.cookie,{type:'consume',itemId:'waakye'})).status,400);
 assert.equal((await call(owner.cookie,{type:'job-apply',jobId:'trader'})).status,200);
 r=await call(owner.cookie,{type:'shift-start'});assert.equal(r.status,200);assert.equal((await call(owner.cookie,{type:'shift-complete'})).status,400);
 const life=r.body.self.life;life.shift.endsAt=Date.now()-100;fixture(owner.id,{life_json:JSON.stringify(life)});
 const shifts=await Promise.all([call(owner.cookie,{type:'shift-complete'}),call(owner.cookie,{type:'shift-complete'})]);assert.equal(shifts.filter(r=>r.status===200).length,1);
 r=await call(owner.cookie);assert.equal(r.body.self.money,75);assert.equal(r.body.self.jobsDone,1);
 fixture(owner.id,{pos_lng:-.1738,pos_lat:5.6224,place_id:'mall',money:3000});
 for(const itemId of ['motorcycle','groceries','sofa'])assert.equal((await call(owner.cookie,{type:'buy',itemId})).status,200);
 r=await call(owner.cookie,{type:'vehicle-select',vehicle:'motorcycle'});assert.equal(r.body.self.life.vehicle,'motorcycle');
 fixture(owner.id,{pos_lng:-.1949,pos_lat:5.5682,place_id:owner.self.life.homeId});
 assert.equal((await call(owner.cookie,{type:'cook-inventory'})).status,200);assert.equal((await call(owner.cookie,{type:'furnish',itemId:'sofa'})).status,200);
 r=await call(owner.cookie);assert.equal(r.body.self.life.inventory.jollof,2);assert.ok(r.body.self.life.furnished.includes('sofa'));
 fixture(owner.id,{pos_lng:-.1778,pos_lat:5.5632,money:2000});assert.equal((await call(owner.cookie,{type:'property-buy',homeId:'osu-flat'})).status,200);
 fixture(owner.id,{pos_lng:-.1787,pos_lat:5.6093,place_id:'airport'});
 r=await call(owner.cookie,{type:'flight-book',destination:'labadi'});assert.equal(r.status,200);assert.equal((await call(owner.cookie,{type:'flight-arrive'})).status,400);
 const flightLife=r.body.self.life;flightLife.flight.endsAt=Date.now()-10;fixture(owner.id,{life_json:JSON.stringify(flightLife)});
 r=await call(owner.cookie,{type:'flight-arrive'});assert.equal(r.status,200);assert.equal(r.body.self.placeId,'labadi');assert.equal(r.body.self.life.flight,null);
 assert.equal((await call(owner.cookie,{type:'flight-arrive'})).status,400);
 assert.equal((await call(owner.cookie,{type:'travel',placeId:'home'})).status,400);
});
