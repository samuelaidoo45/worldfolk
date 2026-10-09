// Integration tests against the local server only. Fixtures alter local SQLite.
import test from 'node:test';
import {CITY_DESTINATIONS} from '../public/game/city-destinations.js';
import {JOBS,GOODS,HOMES} from '../public/game/life-catalog.js';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3000';
async function call(cookie,body){const r=await fetch(base+'/api/game',{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),...(body?{'content-type':'application/json',origin:base}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json(),cookie:r.headers.get('set-cookie')?.split(';')[0]}}
async function player(name){const r=await call(null,{type:'join',name,avatar:'🧑🏾'});assert.equal(r.status,201);const id=r.body.self.id;fixture(id,{pos_lng:-.1949,pos_lat:5.5682,place_id:`p_${id}_starter`,money:120,life_json:'{}'});const stable=await call(r.cookie);return {id,cookie:r.cookie,self:stable.body.self}}
function fixture(id,values){const script=`import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nv=json.loads(sys.argv[2])\nc.execute('UPDATE players SET '+','.join(k+'=?' for k in v)+' WHERE id=?',list(v.values())+[sys.argv[1]])\nc.commit()`;const r=spawnSync('python3',['-c',script,id,JSON.stringify(values)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr)}
const hubs={airport:[-.1787,5.6093],osu:[-.1819,5.5598],makola:[-.2141,5.5485],kaneshie:[-.2346,5.5724],mall:[-.1738,5.6224],legon:[-.1874,5.651],theatre:[-.2047,5.5516],arts:[-.2033,5.5464],dubois:[-.1698,5.5815],labadi:[-.140846,5.561955]};
function point(id){const p=CITY_DESTINATIONS.find(p=>p.id===id);return p?[p.lng,p.lat]:hubs[id]}
function at(id,place,extra={}){const [pos_lng,pos_lat]=point(place);fixture(id,{pos_lng,pos_lat,place_id:place,driving:0,...extra})}
async function tasks(guest,job,life){
 for(let i=0;i<job.steps.length;i++){
  const task=job.steps[i];life.shift.nextTaskAt=Date.now()-10;life.shift.endsAt=Date.now()-10;
  if(job.vehicle&&i>0)life.shift.drove=true;
  at(guest.id,task.place,{life_json:JSON.stringify(life)});
  const input={type:'work-task',shiftId:life.shift.id,step:i,choice:task.answer};
  const result=await call(guest.cookie,input);assert.equal(result.status,200,job.id+': '+JSON.stringify(result.body));life=result.body.self.life;
  assert.equal((await call(guest.cookie,input)).status,400,'same task cannot be replayed');
 }
 return life;
}
test('every profession requires workplace arrival, task completion and pays once',async()=>{
 const guest=await player('Profession Tester');
 for(const job of JOBS){
  const coords=point(job.place);assert.ok(coords,job.id+' workplace exists');
  fixture(guest.id,{pos_lng:coords[0]+.02,pos_lat:coords[1],driving:0,energy:100,money:0,life_json:'{"vehicles":[],"vehicle":"car"}'});
  assert.equal((await call(guest.cookie,{type:'job-apply',jobId:job.id})).status,400,'no remote hiring');
  at(guest.id,job.place);assert.equal((await call(guest.cookie,{type:'job-apply',jobId:job.id})).status,200,job.id);
  const started=await call(guest.cookie,{type:'shift-start'});assert.equal(started.status,200,job.id);let life=started.body.self.life;assert.equal(life.shift.version,2);
  assert.equal((await call(guest.cookie,{type:'shift-complete'})).status,400);
  assert.equal((await call(guest.cookie,{type:'work-task',shiftId:life.shift.id,step:0,choice:job.steps[0].answer})).status,400,'cannot skip task time');
  life.shift.nextTaskAt=Date.now()-10;fixture(guest.id,{life_json:JSON.stringify(life)});
  assert.equal((await call(guest.cookie,{type:'work-task',shiftId:life.shift.id,step:0,choice:99})).status,400,'invalid answers fail');
  await tasks(guest,job,life);
  const finish=await Promise.all([call(guest.cookie,{type:'shift-complete'}),call(guest.cookie,{type:'shift-complete'})]);assert.equal(finish.filter(r=>r.status===200).length,1,job.id+' paid once');
  const saved=(await call(guest.cookie)).body.self;assert.equal(saved.money,job.wage,job.id);assert.equal(saved.life.career[job.id].shifts,1);assert.equal(saved.life.career[job.id].earned,job.wage);assert.equal(saved.life.shift,null);assert.deepEqual(saved.life.vehicles,[],'work vehicle is not gifted');
 }
});
test('work vehicle is usable without ownership and returned on cancel or restart',async()=>{
 const guest=await player('Company Driver');at(guest.id,'kaneshie',{life_json:'{"vehicles":[],"vehicle":"car"}',energy:100});
 await call(guest.cookie,{type:'job-apply',jobId:'trotro'});let started=await call(guest.cookie,{type:'shift-start'});assert.equal(started.status,200);assert.equal(started.body.self.life.vehicle,'bus');
 const [lng,lat]=point('kaneshie');assert.equal((await call(guest.cookie,{type:'vehicle',enter:true,lng,lat})).status,200);
 assert.equal((await call(guest.cookie,{type:'shift-cancel'})).status,400,'must park before returning vehicle');
 assert.equal((await call(guest.cookie,{type:'vehicle',enter:false,lng,lat})).status,200);
 assert.equal((await call(guest.cookie,{type:'shift-cancel'})).status,200);
 assert.equal((await call(guest.cookie,{type:'vehicle',enter:true,lng,lat})).status,400,'loan is revoked');
 started=await call(guest.cookie,{type:'shift-start'});const life=started.body.self.life;life.health=0;fixture(guest.id,{life_json:JSON.stringify(life)});
 const restart=await call(guest.cookie,{type:'respawn'});assert.equal(restart.status,200);assert.equal(restart.body.self.life.vehicle,'car');assert.equal(restart.body.self.life.shift,null);assert.deepEqual(restart.body.self.life.vehicles,[]);
});
test('earned wages buy goods and experiences with server prices and atomic payment',async()=>{
 const guest=await player('Earn And Spend');at(guest.id,'makola',{money:0,energy:100});await call(guest.cookie,{type:'job-apply',jobId:'market-seller'});
 const start=await call(guest.cookie,{type:'shift-start'});await tasks(guest,JOBS.find(j=>j.id==='market-seller'),start.body.self.life);
 const paid=await call(guest.cookie,{type:'shift-complete'});assert.equal(paid.status,200);assert.equal(paid.body.self.money,110);
 const food=await call(guest.cookie,{type:'buy',itemId:'waakye',price:0});assert.equal(food.status,200);assert.equal(food.body.self.money,98);assert.equal(food.body.self.life.inventory.waakye,1);
 assert.equal((await call(guest.cookie,{type:'experience-buy',experienceId:'restaurant-meal'})).status,400,'must visit venue');
 at(guest.id,'osu',{hunger:10,hygiene:20});const purchases=await Promise.all([call(guest.cookie,{type:'experience-buy',experienceId:'haircut',price:0}),call(guest.cookie,{type:'experience-buy',experienceId:'haircut'})]);assert.equal(purchases.filter(r=>r.status===200).length,1);
 const saved=(await call(guest.cookie)).body.self;assert.equal(saved.money,63);assert.equal(saved.hygiene,50,'service benefit persisted');
 fixture(guest.id,{money:0,life_json:JSON.stringify({...saved.life,lastServiceAt:0})});assert.equal((await call(guest.cookie,{type:'experience-buy',experienceId:'haircut'})).status,400);
});

test('commute to a selected job, arrive, start work and earn after the fare',async()=>{
 const guest=await player('Work Commuter'),job=JOBS.find(j=>j.id==='cafe');
 const [lng,lat]=point(job.place);
 at(guest.id,'airport',{money:200,energy:100});
 assert.equal((await call(guest.cookie,{type:'job-apply',jobId:job.id})).status,400,'work cannot start remotely');
 const booked=await call(guest.cookie,{type:'ride-book',kind:'taxi',lng,lat,name:'Workplace'});
 assert.equal(booked.status,200,JSON.stringify(booked.body));const trip=booked.body.self.life.transit;
 const arrived=await call(guest.cookie,{type:'ride-skip',rideId:trip.rideId});
 assert.equal(arrived.status,200);assert.equal(arrived.body.self.life.transit,null);
 assert.equal((await call(guest.cookie,{type:'job-apply',jobId:job.id})).status,200,'ride drops the player within workplace reach');
 const start=await call(guest.cookie,{type:'shift-start'});assert.equal(start.status,200);
 await tasks(guest,job,start.body.self.life);
 const paid=await call(guest.cookie,{type:'shift-complete'});assert.equal(paid.status,200);
 assert.equal(paid.body.self.money,200-trip.fare+job.wage);
});

test('personal driving supports validated speeds and atomic road arrival without a fare',async()=>{
 const guest=await player('Auto Driver'),[lng,lat]=point('osu');
 assert.equal((await call(null,{type:'drive-skip',lng,lat})).status,401);
 assert.equal((await call(guest.cookie,{type:'drive-skip',lng,lat})).status,400,'on-foot skipping is forbidden');
 at(guest.id,'airport',{driving:1,money:120,life_json:JSON.stringify({vehicles:['car'],vehicle:'car',drivingSince:Date.now()})});
 assert.equal((await call(guest.cookie,{type:'drive-speed',rate:99})).status,400);
 const fast=await call(guest.cookie,{type:'drive-speed',rate:8});assert.equal(fast.status,200);assert.equal(fast.body.self.life.autoDriveRate,8);
 fixture(guest.id,{last_move_at:Date.now()-500});
 assert.equal((await call(guest.cookie,{type:'move',lng:-.17835,lat:5.6093,heading:90})).status,200,'8x movement is accepted by the HTTP fallback');
 assert.equal((await call(guest.cookie,{type:'drive-skip',lng:30,lat})).status,400);
 const arrivals=await Promise.all([call(guest.cookie,{type:'drive-skip',lng,lat}),call(guest.cookie,{type:'drive-skip',lng,lat})]);
 assert.equal(arrivals.filter(r=>r.status===200).length,1,'arrival commits once');
 const result=arrivals.find(r=>r.status===200).body.self;
 assert.equal(result.driving,true);assert.equal(result.money,120);assert.equal(result.life.autoDriveRate,1);
 assert.ok(Math.hypot((result.lng-lng)*111000,(result.lat-lat)*111000)<85,'arrives on the road near the workplace');
 const saved=(await call(guest.cookie)).body.self;assert.equal(saved.lng,result.lng);assert.equal(saved.lat,result.lat);
});

test('new vehicle models can be bought, selected and retain their identity after theft',async()=>{
 const guest=await player('Car Collector');at(guest.id,'mall',{money:30000,life_json:'{"vehicles":[],"vehicle":"car"}'});
 let balance=30000;
 for(const vehicle of ['hatchback','suv','pickup','van','taxi']){
  assert.equal((await call(guest.cookie,{type:'vehicle-select',vehicle})).status,400,'ownership required');
  const bought=await call(guest.cookie,{type:'buy',itemId:vehicle,price:1});assert.equal(bought.status,200,JSON.stringify(bought.body));balance-=GOODS.find(g=>g.id===vehicle).price;assert.equal(bought.body.self.money,balance);
  assert.equal((await call(guest.cookie,{type:'buy',itemId:vehicle})).status,400,'no duplicate purchase');
  const selected=await call(guest.cookie,{type:'vehicle-select',vehicle});assert.equal(selected.status,200);assert.equal(selected.body.self.life.vehicle,vehicle);
 }
 const [lng,lat]=point('mall');fixture(guest.id,{life_json:'{"vehicles":[],"vehicle":"car"}'});
 const stolen=await call(guest.cookie,{type:'vehicle-steal',vehicle:'pickup',npcId:'ambient-42',lng,lat,heading:90});assert.equal(stolen.status,200);assert.equal(stolen.body.self.life.vehicle,'pickup');assert.deepEqual(stolen.body.self.life.vehicles,['pickup']);
});

test('new characters start with 100000 cedis once and keep it when registering',async()=>{
 const joined=await call(null,{type:'join',name:'Starting Balance',avatar:'🧑🏾',money:999999999});assert.equal(joined.status,201);assert.equal(joined.body.self.money,100000);
 const baseHeaders={'Content-Type':'application/json',Origin:base,Cookie:joined.cookie};
 const response=await fetch(base+'/api/auth',{method:'POST',headers:baseHeaders,body:JSON.stringify({action:'register',username:'balance_'+Date.now().toString(36),password:'Local balance test passphrase 407!'})});assert.equal(response.status,201);
 const cookie=response.headers.get('set-cookie').split(';')[0];assert.equal((await call(cookie)).body.self.money,100000);
 fixture(joined.body.self.id,{money:98765});const again=await call(cookie,{type:'join',name:'Another Bonus',avatar:'🧑🏾'});assert.equal(again.body.self.id,joined.body.self.id);assert.equal(again.body.self.money,98765,'joining again never resets the balance');
});

test('map-selected starting places are validated, persisted and cannot reset an existing life',async()=>{
 const bad=await call(null,{type:'join',name:'Map Start Invalid',avatar:'🧑🏾',startPlaceId:'p_somebody_starter'});assert.equal(bad.status,400);
 const joined=await call(null,{type:'join',name:'Map Explorer',avatar:'🧑🏾',startPlaceId:'mall',lng:30,lat:0});assert.equal(joined.status,201,JSON.stringify(joined.body));let saved=joined.body.self;
 assert.equal(saved.life.explorationPending,false);assert.equal(saved.life.startPlaceId,'mall');assert.equal(saved.placeId,'mall');assert.equal(saved.money,100000);assert.ok(Math.hypot((saved.lng+.1738)*111000,(saved.lat-5.6224)*111000)<600);
 const original=[saved.lng,saved.lat];assert.equal((await call(joined.cookie,{type:'start-exploring',placeId:'labadi'})).status,409);saved=(await call(joined.cookie)).body.self;assert.deepEqual([saved.lng,saved.lat],original);
 const pending=await call(null,{type:'join',name:'Choose Later',avatar:'🧑🏾'});assert.equal(pending.body.self.life.explorationPending,true);
 assert.equal((await call(pending.cookie,{type:'start-exploring',placeId:'home'})).status,400);
 const results=await Promise.all([call(pending.cookie,{type:'start-exploring',placeId:'osu'}),call(pending.cookie,{type:'start-exploring',placeId:'labadi'})]);assert.equal(results.filter(r=>r.status===200).length,1,'only one initial location choice commits');
 saved=(await call(pending.cookie)).body.self;assert.equal(saved.life.explorationPending,false);assert.ok(['osu','labadi'].includes(saved.life.startPlaceId));assert.equal(saved.money,100000);
});

test('city exploration jumps to validated places without resetting wealth, home or career',async()=>{
 const joined=await call(null,{type:'join',name:'City Home Traveller',avatar:'🧑🏾',startPlaceId:'mall'});assert.equal(joined.status,201);
 const life={...joined.body.self.life,health:83,inventory:{water:4},career:{coder:{shifts:3,earned:400}},wanted:2};fixture(joined.body.self.id,{money:76543,life_json:JSON.stringify(life),driving:1});
 const destination=await call(joined.cookie,{type:'explore-place',placeId:'labadi',lng:30,lat:0});assert.equal(destination.status,200,JSON.stringify(destination.body));const self=destination.body.self;
 assert.equal(self.money,76543);assert.equal(self.life.home,life.home);assert.deepEqual(self.life.properties,life.properties);assert.deepEqual(self.life.inventory,life.inventory);assert.deepEqual(self.life.career,life.career);assert.equal(self.life.wanted,2);assert.equal(self.life.health,83);assert.equal(self.driving,false);assert.equal(self.placeId,'labadi');assert.ok(Math.hypot((self.lng+.140846)*111000,(self.lat-5.561955)*111000)<1000);
 assert.equal((await call(joined.cookie,{type:'explore-place',placeId:'home'})).status,400);assert.equal((await call(joined.cookie,{type:'explore-place',placeId:'p_somebody_starter'})).status,400);assert.equal((await call(joined.cookie,{type:'explore-place',placeId:'g_0_0'})).status,400);
 fixture(self.id,{life_json:JSON.stringify({...life,arrested:true})});assert.equal((await call(joined.cookie,{type:'explore-place',placeId:'mall'})).status,400);
 fixture(self.id,{life_json:JSON.stringify({...life,health:0})});assert.equal((await call(joined.cookie,{type:'explore-place',placeId:'mall'})).status,400);
 fixture(self.id,{life_json:JSON.stringify({...life,shift:{id:'busy',jobId:'coder'}})});assert.equal((await call(joined.cookie,{type:'explore-place',placeId:'mall'})).status,400);
 fixture(self.id,{life_json:JSON.stringify({...life,transit:{rideId:'old-ride'},flight:{endsAt:Date.now()+100000}})});const left=await call(joined.cookie,{type:'explore-place',placeId:'osu'});assert.equal(left.status,200,JSON.stringify(left.body));assert.equal(left.body.self.life.transit,null);assert.equal(left.body.self.life.flight,null);
 const fs=await import('node:fs'),mapped=JSON.parse(fs.readFileSync('public/maps/accra-v1/places.json')),outer=mapped.find(p=>p.lat>5.78&&p.lat<5.8&&p.type==='school');assert.ok(outer);const id=`g_${Math.round(outer.lng*10000)}_${Math.round(outer.lat*10000)}`;
 const edge=await call(joined.cookie,{type:'explore-place',placeId:id,placeName:outer.name});assert.equal(edge.status,200,JSON.stringify(edge.body));assert.ok(edge.body.self.lat>5.77);assert.equal(edge.body.self.money,76543);
 assert.equal((await call(joined.cookie,{type:'explore-place',placeId:id,placeName:'Invented name'})).status,400);
 const streets=JSON.parse(fs.readFileSync('public/maps/accra-v1/streets.json')),street=streets.find(p=>p.name==='Giffard Road');const streetResult=await call(joined.cookie,{type:'explore-place',placeId:`g_${Math.round(street.lng*10000)}_${Math.round(street.lat*10000)}`,placeName:street.name});assert.equal(streetResult.status,200,JSON.stringify(streetResult.body));
});

test('home sleep and sitting persist until manual wake with one-time benefits and no movement',async()=>{
 const guest=await player('Rest Tester'),home=HOMES.find(h=>h.id==='starter');
 fixture(guest.id,{pos_lng:home.lng,pos_lat:home.lat});
 for(const kind of ['sleep','relax']){
  fixture(guest.id,{last_action_at:0,energy:10,hunger:80,fun:10});
  const started=await call(guest.cookie,{type:'act',actionId:kind});
  assert.equal(started.status,200,JSON.stringify(started.body));
  const saved=started.body.self;assert.equal(saved.life.rest.kind,kind);assert.equal(saved.life.rest.placeId,saved.placeId);
  assert.deepEqual((await call(guest.cookie)).body.self.life.rest,saved.life.rest,'a fresh load preserves the rest');
  assert.equal((await call(guest.cookie,{type:'act',actionId:kind})).status,400,'rest benefits cannot replay while already resting');
  assert.equal((await call(guest.cookie,{type:'move',lng:-.1949,lat:5.5682,heading:0})).status,400);
  assert.equal((await call(guest.cookie,{type:'vehicle',enter:true,lng:-.1949,lat:5.5682})).status,400);
  assert.equal((await call(guest.cookie,{type:'explore-place',placeId:'mall'})).status,400);
  fixture(guest.id,{life_json:JSON.stringify({...saved.life,lastVitalAt:Date.now()-30000,rest:{...saved.life.rest,startedAt:Date.now()-86400000}})});
  const tick=await call(guest.cookie,{type:'vitals'});assert.equal(tick.status,200);assert.equal(tick.body.self.life.rest.kind,kind);
  assert.equal(tick.body.self.energy,saved.energy);assert.equal(tick.body.self.hunger,saved.hunger);assert.equal(tick.body.self.xp,saved.xp);
  const ended=await call(guest.cookie,{type:'rest-end'});assert.equal(ended.status,200);assert.equal(ended.body.self.life.rest,null);
  assert.equal(ended.body.self.energy,saved.energy,'waking does not grant another reward');
  assert.equal((await call(guest.cookie,{type:'rest-end'})).status,400,'already awake');
  fixture(guest.id,{last_action_at:0});assert.equal((await call(guest.cookie,{type:'act',actionId:'shower'})).status,200);
 }
 fixture(guest.id,{life_json:JSON.stringify({...guest.self.life,health:0,rest:{kind:'sleep',placeId:guest.self.placeId,startedAt:1}})});
 const restart=await call(guest.cookie,{type:'respawn'});assert.equal(restart.status,200);assert.equal(restart.body.self.life.rest,null);
});
