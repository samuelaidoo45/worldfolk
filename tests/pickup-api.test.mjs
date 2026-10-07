import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {startingLife,rideFare} from '../public/game/life-catalog.js';
const base='http://127.0.0.1:3000';
async function call(cookie,body){const r=await fetch(base+'/api/game',{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
function fixture(id,values){const script=`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nv=json.loads(sys.argv[2])\nc.execute('UPDATE players SET '+','.join(k+'=?' for k in v)+' WHERE id=?',list(v.values())+[sys.argv[1]])\nc.commit()`;const r=spawnSync('python3',['-c',script,id,JSON.stringify(values)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr)}
test('starting backgrounds have distinct wealth, owned goods and independent random locations',()=>{const poor=startingLife(.1,.9),rich=startingLife(.99,0);assert.ok(rich.money>poor.money);assert.equal(poor.life.vehicles.length,0);assert.ok(rich.life.vehicles.includes('car'));assert.notEqual(poor.lng,rich.lng);poor.life.inventory.water=90;assert.equal(startingLife(.1,.9).life.inventory.water,2);assert.ok(rideFare(2000,'taxi')>rideFare(2000,'trotro'))});
test('pickup is persisted, charged once, shares tro-tros, gates arrival and protects ownership',async()=>{
 const joined=await call(null,{type:'join',name:'Pickup Tester',avatar:'🧑🏾'});assert.equal(joined.status,201);const {cookie}=joined,p=joined.body.self;
 assert.ok(p.life.background);const again=await call(cookie,{type:'join',name:'New Life',avatar:'🧑🏾'});assert.equal(again.body.self.money,p.money);assert.equal(again.body.self.id,p.id);
 fixture(p.id,{pos_lng:-.1949,pos_lat:5.5682,money:200,life_json:JSON.stringify({...p.life,vehicles:[]}),last_action_at:0});
 assert.equal((await call(cookie,{type:'vehicle',enter:true,lng:-.1949,lat:5.5682})).status,400);
 assert.equal((await call(cookie,{type:'ride-book',kind:'taxi',lng:30,lat:5,name:'Outside city'})).status,400);
 const request={type:'ride-book',kind:'trotro',lng:-.1819,lat:5.5598,name:'Oxford Street'};
 let r=await call(cookie,request);assert.equal(r.status,200,JSON.stringify(r.body));const trip=r.body.self.life.transit;assert.ok(trip.coordinates.length>20);assert.equal(r.body.self.money,200-trip.fare);assert.match(r.body.self.placeId,/^ride_/);
 assert.equal((await call(cookie,request)).status,400);assert.equal((await call(cookie,{type:'bus-arrive'})).status,400);
 const saved=await call(cookie);assert.equal(saved.body.self.life.transit.rideId,trip.rideId);
 const b=await call(null,{type:'join',name:'Fellow Rider',avatar:'🧑🏾'});fixture(b.body.self.id,{pos_lng:-.1949,pos_lat:5.5682,money:200,last_action_at:0});
 const shared=await call(b.cookie,request);assert.equal(shared.status,200,JSON.stringify(shared.body));assert.equal(shared.body.self.life.transit.rideId,trip.rideId);
 const exited=await call(b.cookie,{type:'ride-exit'});assert.equal(exited.status,200);assert.equal(exited.body.self.life.transit,null);assert.equal(exited.body.self.lng,trip.coordinates[0][0]);
 fixture(p.id,{last_action_at:0});assert.equal((await call(cookie,{type:'ride-social'})).status,200);assert.equal((await call(cookie,{type:'ride-social'})).status,429);
 const life=(await call(cookie)).body.self.life;life.transit.endsAt=Date.now()-10;fixture(p.id,{life_json:JSON.stringify(life)});
 assert.equal((await call(cookie,{type:'bus-arrive'})).status,400,'elapsed time alone cannot teleport the passenger');
 assert.equal((await call(cookie,{type:'ride-progress',progress:1})).status,400,'cannot jump to the end at pickup');life.transit.progressAt=Date.now()-3600000;fixture(p.id,{life_json:JSON.stringify(life)});assert.equal((await call(cookie,{type:'ride-progress',progress:1})).status,200);
 const arrivals=await Promise.all([call(cookie,{type:'bus-arrive'}),call(cookie,{type:'bus-arrive'})]);assert.equal(arrivals.filter(r=>r.status===200).length,1);r=await call(cookie);assert.equal(r.body.self.life.transit,null);assert.equal(r.body.self.money,200-trip.fare);assert.equal(r.body.self.lng,trip.coordinates.at(-1)[0]);
 fixture(p.id,{pos_lng:-.1787,pos_lat:5.6093,money:0,last_action_at:0});assert.equal((await call(cookie,{...request,kind:'taxi'})).status,400);
 for(const [jobId,lng,lat] of [['coder',-.1787,5.6093],['teacher',-.1874,5.651]]){fixture(p.id,{pos_lng:lng,pos_lat:lat,energy:100});assert.equal((await call(cookie,{type:'job-apply',jobId})).status,200);r=await call(cookie,{type:'shift-start'});assert.equal(r.status,200);assert.equal((await call(cookie,{type:'shift-complete'})).status,400);r.body.self.life.shift.endsAt=Date.now()-1;fixture(p.id,{life_json:JSON.stringify(r.body.self.life)});assert.equal((await call(cookie,{type:'shift-complete'})).status,200)}
 fixture(p.id,{pos_lng:-.1787,pos_lat:5.6093,energy:100,last_move_at:0});await call(cookie,{type:'job-apply',jobId:'driver'});assert.equal((await call(cookie,{type:'shift-start'})).status,400,'taxi work requires a car');
 const driverLife=(await call(cookie)).body.self.life;driverLife.vehicles=['car'];driverLife.vehicle='car';fixture(p.id,{life_json:JSON.stringify(driverLife)});
 assert.equal((await call(cookie,{type:'shift-start'})).status,200);assert.equal((await call(cookie,{type:'vehicle',enter:true,lng:-.1787,lat:5.6093})).status,200);
 const driving=(await call(cookie)).body.self.life;assert.equal(driving.shift.drove,true);driving.shift.endsAt=Date.now()-1;fixture(p.id,{pos_lng:-.1819,pos_lat:5.5598,driving:0,life_json:JSON.stringify(driving)});assert.equal((await call(cookie,{type:'shift-complete'})).status,200);

});

test('MoMo requires an agent and commits cash transfers atomically',async()=>{
 const p=await call(null,{type:'join',name:'Agent Tester',avatar:'🧑🏾'}),id=p.body.self.id,cookie=p.cookie;
 fixture(id,{money:100,pos_lng:-.1949,pos_lat:5.5682});assert.equal((await call(cookie,{type:'momo',amount:50,operation:'deposit'})).status,400);
 fixture(id,{pos_lng:-.1819,pos_lat:5.5598});const deposits=await Promise.all([call(cookie,{type:'momo',amount:80,operation:'deposit'}),call(cookie,{type:'momo',amount:80,operation:'deposit'})]);assert.equal(deposits.filter(r=>r.status===200).length,1);
 let r=await call(cookie);assert.equal(r.body.self.money,20);assert.equal(r.body.self.life.momo,80);
 assert.equal((await call(cookie,{type:'momo',amount:81,operation:'withdraw'})).status,400);
 r=await call(cookie,{type:'momo',amount:80,operation:'withdraw'});assert.equal(r.status,200);assert.equal(r.body.self.money,100);assert.equal(r.body.self.life.momo,0);
});
