// Disposable registered accounts in local SQLite only; never run against production.
import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {MALL_TERMINAL,TERMINAL_PLACE,TERMINAL_SERVICES,terminalDeparture} from '../public/game/mall-terminal-data.js';
import {rideFare,JOBS} from '../public/game/life-catalog.js';
import {distanceMetres} from '../public/game/motion.js';
const base=process.env.GAME_TEST_URL||'http://127.0.0.1:3001';
assert.match(base,/^http:\/\/127\.0\.0\.1:/,'Local preview only');
function sql(statement,params){const script="import sqlite3,json,sys\nfrom pathlib import Path\np=next(x for x in Path('.wrangler/state/v3/d1/miniflare-D1DatabaseObject').glob('*.sqlite') if x.name!='metadata.sqlite')\nc=sqlite3.connect(p)\nr=c.execute(sys.argv[1],json.loads(sys.argv[2])).fetchall()\nc.commit()\nprint(json.dumps(r))";const r=spawnSync('python3',['-c',script,statement,JSON.stringify(params)],{encoding:'utf8'});assert.equal(r.status,0,r.stderr);return JSON.parse(r.stdout)}
function fixture(id,values){sql('UPDATE players SET '+Object.keys(values).map(k=>k+'=?').join(',')+' WHERE id=?',[...Object.values(values),id])}
async function client(label){let cookie;const call=async(path,body)=>{const r=await fetch(base+path,{method:body?'POST':'GET',headers:{...(cookie?{cookie}:{}),'content-type':'application/json',origin:base},body:body?JSON.stringify(body):undefined});const data=await r.json();if(r.headers.get('set-cookie'))cookie=r.headers.get('set-cookie').split(';')[0];return {status:r.status,body:data}};const reg=await call('/api/auth',{action:'register',username:'terminal_'+label+'_'+Date.now().toString(36),name:'Terminal QA '+label,password:crypto.randomUUID()+'Aa9!'});assert.equal(reg.status,201,JSON.stringify(reg.body));const p=(await call('/api/game')).body.self;return {id:p.id,life:p.life,call:body=>call('/api/game',body)}}
function at(p,position,life=p.life){fixture(p.id,{pos_lng:position[0],pos_lat:position[1],place_id:TERMINAL_PLACE.id,driving:0,money:500,energy:100,hunger:100,last_action_at:0,life_json:JSON.stringify({...life,lastVitalAt:Date.now(),health:100,explorationPending:false})})}
test('terminal tickets reject remote/spoofed boarding, charge once, share a service and skip safely',{timeout:60000},async()=>{
 const a=await client('a'),b=await client('b'),s=TERMINAL_SERVICES[0],request={type:'terminal-board',terminalId:MALL_TERMINAL.id,serviceId:s.id,fare:-1000,lng:40};
 at(a,[-.2,5.55]);assert.equal((await a.call(request)).status,400);
 at(a,s.platform);assert.equal((await a.call({...request,serviceId:'fake'})).status,400);
 const booked=await Promise.all([a.call(request),a.call(request)]);assert.equal(booked.filter(r=>r.status===200).length,1,JSON.stringify(booked));const saved=(await a.call()).body.self,trip=saved.life.transit,fare=rideFare(distanceMetres(s.vehiclePosition,s.destination),'trotro');assert.equal(saved.money,500-fare);assert.equal(trip.vehicle,'minibus');assert.equal(trip.vehicleColor,s.color);assert.equal(trip.terminalId,MALL_TERMINAL.id);assert.equal(trip.destinationId,'airport');assert.deepEqual(trip.coordinates.slice(0,terminalDeparture(s).length),terminalDeparture(s));assert.ok(distanceMetres(trip.coordinates.at(-1),s.destination)<100);
 at(b,s.platform);const shared=await b.call(request);assert.equal(shared.status,200,JSON.stringify(shared.body));assert.equal(shared.body.self.life.transit.rideId,trip.rideId);
 assert.equal((await a.call({type:'ride-skip',rideId:'wrong'})).status,400);
 const skipped=await a.call({type:'ride-skip',rideId:trip.rideId});assert.equal(skipped.status,200,JSON.stringify(skipped.body));assert.equal(skipped.body.self.placeId,'airport');assert.equal(skipped.body.self.life.transit,null);assert.equal(skipped.body.self.money,500-fare);assert.equal((await a.call({type:'ride-skip',rideId:trip.rideId})).status,400);
 assert.equal((await b.call({type:'ride-exit'})).status,200);
});
test('terminal work requires the workplace and a driven vehicle before a single wage payout',{timeout:60000},async()=>{
 const p=await client('work'),job=JOBS.find(j=>j.id==='mall-trotro');at(p,[-.2,5.55]);assert.equal((await p.call({type:'job-apply',jobId:job.id})).status,400);at(p,[TERMINAL_PLACE.lng,TERMINAL_PLACE.lat]);assert.equal((await p.call({type:'job-apply',jobId:job.id})).status,200);let r=await p.call({type:'shift-start'});assert.equal(r.status,200,JSON.stringify(r.body));let life=r.body.self.life;assert.equal(life.shift.vehicle,'minibus');
 for(let step=0;step<3;step++){const location=step===0?[TERMINAL_PLACE.lng,TERMINAL_PLACE.lat]:TERMINAL_SERVICES[0].destination;life.shift.nextTaskAt=0;life.shift.endsAt=0;fixture(p.id,{pos_lng:location[0],pos_lat:location[1],driving:0,life_json:JSON.stringify(life)});
  if(step===1){assert.equal((await p.call({type:'work-task',shiftId:life.shift.id,step,choice:0})).status,400);r=await p.call({type:'vehicle',enter:true,lng:location[0],lat:location[1]});assert.equal(r.status,200,JSON.stringify(r.body));life=r.body.self.life;fixture(p.id,{driving:0});}
  r=await p.call({type:'work-task',shiftId:life.shift.id,step,choice:0});assert.equal(r.status,200,JSON.stringify(r.body));life=r.body.self.life;
 }
 const payouts=await Promise.all([p.call({type:'shift-complete'}),p.call({type:'shift-complete'})]);assert.equal(payouts.filter(r=>r.status===200).length,1);const saved=(await p.call()).body.self;assert.equal(saved.money,500+job.wage);assert.equal(saved.jobsDone,1);assert.equal(saved.life.shift,null);
});
