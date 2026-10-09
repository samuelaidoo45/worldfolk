import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import {movementFailure,correctedPosition,newestPlayer} from '../public/game/movement-sync.js';
import {facadeLayout} from '../public/game/facade-layout.js';
import {buildingDesign} from '../public/game/building-design.js';
const compiled=ts.transpileModule(fs.readFileSync('server/world-room.ts','utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ESNext}}).outputText.replaceAll("'../public/game/map-region.js'",JSON.stringify(new URL('../public/game/map-region.js',import.meta.url).href)).replace("import { DurableObject } from 'cloudflare:workers';",'class DurableObject {constructor(ctx,env){this.ctx=ctx;this.env=env}}');
globalThis.WebSocketRequestResponsePair=class {};
const {WorldRoom,validMove}=await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
function fixture(){
 const row={id:'p',session_token:'token',name:'Test',life_json:'{"health":100}',revision:2,pos_lng:-.18,pos_lat:5.56,heading:0,driving:0,last_move_at:1000,place_id:'home'};
 const live={...row,revision:1,pos_lng:-.17995,last_move_at:2000},m={player:live,at:2000,savedAt:1000,dirty:true};
 let attachment=structuredClone(m);
 const sent=[],ws={deserializeAttachment:()=>structuredClone(attachment),serializeAttachment:v=>attachment=structuredClone(v),send:v=>sent.push(JSON.parse(v)),close(){}};
 const ctx={setWebSocketAutoResponse(){},getWebSockets:()=>[],blockConcurrencyWhile:fn=>fn()};
 const db={prepare(){return {bind(...args){return {
  first:async()=>structuredClone(row),
  run:async()=>{const ok=args[7]===row.revision&&row.last_move_at<=args[8];if(ok)Object.assign(row,{pos_lng:args[0],pos_lat:args[1],heading:args[2],last_move_at:args[3]});return {meta:{changes:ok?1:0}}}
 }}}}};
 return {row,m,ws,sent,room:new WorldRoom(ctx,{DB:db})};
}
test('routine life revisions preserve and save newer live movement without a correction',async()=>{const f=fixture();await f.room.save(f.ws,f.m);assert.equal(f.row.pos_lng,-.17995);assert.equal(f.row.last_move_at,2000);assert.equal(f.ws.deserializeAttachment().dirty,false);assert.equal(f.sent.filter(v=>v.type==='correct').length,0)});
test('explicit travel and arrests remain authoritative',async()=>{for(const arrested of [false,true]){const f=fixture();if(arrested)f.row.life_json='{"health":100,"arrested":true}';else {f.row.last_move_at=2100;f.row.pos_lng=-.21}await f.room.reload(f.ws,f.m,true);assert.equal(f.ws.deserializeAttachment().player.pos_lng,f.row.pos_lng);assert.equal(f.sent[0].type,'correct')}});
test('minor packet jitter is accepted but teleporting is still rejected',()=>{const f=fixture(),now=2300;assert.equal(validMove(f.m,{lng:-.17993,lat:5.56,heading:0},now),true);assert.equal(validMove(f.m,{lng:-.1,lat:5.56,heading:0},now),false)});
test('connection failure is not a location reset; explicit corrections align the car too',()=>{assert.equal(movementFailure(new Error('Live connection closed')),'offline');assert.equal(movementFailure({status:503,message:'Unavailable'}),'offline');assert.equal(movementFailure({code:'POSITION_CORRECTED'}),'corrected');assert.equal(movementFailure({status:400,message:'Move through the city to get there'}),'rejected');const s={self:{id:'p'},mode:'drive',carSpeed:30,carDrift:[5,1]};assert.equal(correctedPosition(s,{id:'other',lng:0,lat:0}),false);correctedPosition(s,{id:'p',lng:-.18,lat:5.56,heading:90});assert.deepEqual(s.position,s.carPosition);assert.equal(s.carSpeed,0);assert.deepEqual(s.carDrift,[0,0])});
test('facades vary deterministically while mapped roof shapes and colours take priority',()=>{const designs=Array.from({length:64},(_,seed)=>facadeLayout({seed,kind:'home',style:'plaster'}));assert.equal(new Set(designs.map(d=>d.window)).size,4);assert.ok(designs.some(d=>d.balcony));assert.ok(designs.some(d=>d.roof==='flat')&&designs.some(d=>d.roof==='pitched'));assert.equal(facadeLayout({seed:5,kind:'home',roofMapped:true,roof:'flat'}).roof,'flat');const f={geometry:{type:'Polygon',coordinates:[[[-.18,5.56],[-.1799,5.56],[-.1799,5.5601],[-.18,5.5601],[-.18,5.56]]]},properties:{'building:material':'brick','building:colour':'#c0c0c0','roof:colour':'#884433',height:9}};const d=buildingDesign(f);assert.equal(d.style,'brick');assert.equal(d.palette.wall,'#c0c0c0');assert.equal(d.palette.roof,'#884433');assert.equal(d.height,9);assert.deepEqual(facadeLayout(d),facadeLayout(buildingDesign(f)))});

test('late poll responses cannot resurrect a finished trip or undo a restart',()=>{const current={id:'p',revision:12,life:{transit:null}},old={id:'p',revision:11,life:{transit:{rideId:'old-trip'}}};assert.equal(newestPlayer(current,old),current);assert.equal(newestPlayer(current,{...old,revision:13}).revision,13);assert.equal(correctedPosition({self:current},{id:'p',revision:11,lng:-.18,lat:5.56}),false)});
test('WebSocket correction settles only its request and never triggers a second fetch',async t=>{
 const sockets=[];class Socket {constructor(){this.readyState=1;sockets.push(this)}send(data){this.last=JSON.parse(data)}close(code=1000){this.readyState=3;this.onclose?.({code})}}
 t.mock.timers.enable({apis:['setInterval','setTimeout']});
 t.mock.method(globalThis,'setTimeout',globalThis.setTimeout);
 const previous={document:globalThis.document,location:globalThis.location,WebSocket:globalThis.WebSocket};
 Object.assign(globalThis,{document:{hidden:false,addEventListener(){}},location:{href:'http://game.test',protocol:'http:'},WebSocket:Socket});
 const {createRealtime}=await import('../public/game/realtime.js');let corrections=0;const rt=createRealtime({onPlayers(){},onCorrection(){corrections++},onStatus(){}});
 try{rt.start();const s=sockets[0];s.onmessage({data:JSON.stringify({type:'welcome',room:'a',players:[]})});const move=rt.move({lng:-.18,lat:5.56,heading:0});const failed=assert.rejects(move,e=>e.code==='POSITION_CORRECTED');s.onmessage({data:JSON.stringify({type:'correct',seq:1,player:{id:'p',lng:-.18,lat:5.56}})});await failed;assert.equal(corrections,1);const next=rt.move({lng:-.18,lat:5.56,heading:0});s.onmessage({data:JSON.stringify({type:'ack',seq:2})});assert.equal((await next).type,'ack');
 const retry=rt.move({lng:-.18,lat:5.56,heading:0});const rejected=assert.rejects(retry,/Slow down/);s.onmessage({data:JSON.stringify({type:'retry',seq:3})});await rejected;
 }finally{rt.close();Object.assign(globalThis,previous)}
});
test('facade textures are shared only while buildings are resident and released after streaming out',async()=>{
 const old=globalThis.document,ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 globalThis.document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};
 try{const {createBuildingFacade}=await import('../public/game/building-facades.js'),{disposeScene}=await import('../public/game/render-utils.js');const position=[-.18,5.56],rings=[[position,[-.1799,5.56],[-.1799,5.5601],[-.18,5.5601],position]],design=buildingDesign({properties:{height:6,type:'house'},geometry:{type:'Polygon',coordinates:rings}}),data={position,rings,height:6,seed:design.seed,style:design.style,design,distance:30};
 const a=createBuildingFacade(data),b=createBuildingFacade(data);const material=a.group.children.find(m=>m.material?.userData.refs)?.material;assert.ok(material);assert.equal(material.userData.refs,2);let freed=0;material.map.addEventListener('dispose',()=>freed++);disposeScene(a.group);assert.equal(freed,0);disposeScene(b.group);assert.equal(freed,1);const c=createBuildingFacade(data);assert.notEqual(c.group.children.find(m=>m.material?.userData.refs)?.material,material);disposeScene(c.group);
 }finally{globalThis.document=old}
});
test('task-based workers can move between assignments and still cannot teleport',()=>{
 const f=fixture();f.m.player.life_json=JSON.stringify({health:100,shift:{version:2,jobId:'police'}});
 assert.equal(validMove(f.m,{lng:-.17993,lat:5.56,heading:0},2300),true);
 assert.equal(validMove(f.m,{lng:-.1,lat:5.56,heading:0},2300),false);
});

test('validated auto-drive speeds allow fast-forward without allowing walking teleports',async()=>{
 const f=fixture(),now=2300;f.m.player.driving=1;
 for(const rate of [4,8]){f.m.player.life_json=JSON.stringify({health:100,drivingSince:2000,autoDriveRate:rate});assert.equal(validMove(f.m,{lng:f.m.player.pos_lng+rate*.000045,lat:5.56,heading:90},now),true)}
 f.m.player.driving=0;assert.equal(validMove(f.m,{lng:f.m.player.pos_lng+.00036,lat:5.56,heading:90},now),false);
 f.m.player.driving=1;assert.equal(validMove(f.m,{lng:-.1,lat:5.56,heading:90},now),false);
 f.row.driving=1;f.row.life_json=JSON.stringify({health:100,autoDriveRate:8});await f.room.reload(f.ws,f.m);assert.equal(JSON.parse(f.ws.deserializeAttachment().player.life_json).autoDriveRate,8);
});

test('saved resting state stops WebSocket movement and discards pending steps',async()=>{
 for(const kind of ['sleep','relax']){
  const f=fixture();f.row.life_json=JSON.stringify({health:100,rest:{kind,placeId:'home',startedAt:1}});
  await f.room.reload(f.ws,f.m,true);const m=f.ws.deserializeAttachment();
  assert.equal(m.dirty,false);assert.equal(JSON.parse(m.player.life_json).rest.kind,kind);
  assert.equal(validMove(m,{lng:-.179999,lat:5.56,heading:0},3000),false);
 }
});
