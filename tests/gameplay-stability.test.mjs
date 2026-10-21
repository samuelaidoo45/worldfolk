import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameplayLoop,isEditingTarget} from '../public/game/gameplay-loop.js';
import {chaseCamera} from '../public/game/chase-camera.js';
import {distanceMetres} from '../public/game/motion.js';
const origin=[-.18,5.56];
test('quick exit/re-entry and duplicate starts leave exactly one simulation/camera callback',()=>{
 const callbacks=new Map();let id=0,steps=0;const loop=createGameplayLoop(()=>steps++,{request:fn=>{callbacks.set(++id,fn);return id},cancel:i=>callbacks.delete(i)});
 loop.start();loop.start();assert.equal(callbacks.size,1);const stale=callbacks.get(id);loop.stop();loop.start();stale(10);assert.equal(steps,0);assert.equal(callbacks.size,1);let [key,fn]=[...callbacks][0];callbacks.delete(key);fn(16);assert.equal(steps,1);assert.equal(callbacks.size,1);loop.stop();assert.equal(callbacks.size,0);
});
test('stopping inside a frame or while backgrounded cannot resurrect the old loop',()=>{
 let callback,cancelled=0,count=0;const loop=createGameplayLoop(()=>{count++;loop.stop()},{request:fn=>{callback=fn;return 1},cancel:()=>cancelled++});loop.start();callback(16);assert.equal(count,1);assert.equal(loop.running,false);loop.start();loop.stop();callback(40);assert.equal(count,1);assert.equal(cancelled,1);
});
test('typing locks apply to visible editors, not hidden fields left behind by closed panels',()=>{
 const input={tagName:'INPUT',getClientRects:()=>[{}]};assert.equal(isEditingTarget(input),true);assert.equal(isEditingTarget({...input,getClientRects:()=>[]}),false);assert.equal(isEditingTarget({...input,tagName:'SELECT'}),true);assert.equal(isEditingTarget({...input,tagName:'DIV',isContentEditable:true}),true);assert.equal(isEditingTarget({...input,tagName:'BUTTON'}),false);assert.equal(isEditingTarget(null),false);
});
test('camera height remains continuous across the former 2.5-metre snap',()=>{
 const heights=[];for(const limit of [2.42,2.46,2.50,2.54,2.58]){const pose=chaseCamera({position:origin,heading:0,physics:{collision:p=>distanceMetres(origin,p)>limit+.45}});heights.push(pose.altitude)}
 for(let i=1;i<heights.length;i++)assert.ok(Math.abs(heights[i]-heights[i-1])<.08,`height delta ${heights[i]-heights[i-1]}`);
});
test('collision probes follow camera height and contraction retains safe clearance',()=>{
 let heights=[];const pose=chaseCamera({position:origin,heading:0,previousDistance:6.8,physics:{collision(p,r,height){heights.push(height);return distanceMetres(origin,p)>2;}}});assert.ok(pose.distance<2);assert.ok(heights.every(h=>h>1.15&&h<3.1));assert.ok(heights.at(-1)>heights[0]);
 let d=6.8,lastAltitude;for(let i=0;i<120;i++){const p=chaseCamera({position:origin,heading:0,previousDistance:d,physics:{collision:pos=>distanceMetres(origin,pos)>3+(i%2?.01:0)}});if(i>20)assert.ok(Math.abs(p.altitude-lastAltitude)<.025);d=p.distance;lastAltitude=p.altitude;}
});

test('duplicate-tab pause needs an explicit takeover, restores without reload, and cannot bypass expiry',async()=>{
 const old={document:globalThis.document,location:globalThis.location,WebSocket:globalThis.WebSocket},sockets=[],statuses=[],members=[];let visibility;
 class Socket{constructor(){this.readyState=1;sockets.push(this)}send(){}close(){this.readyState=3;this.onclose?.({code:1000})}}
 Object.assign(globalThis,{document:{hidden:false,addEventListener(_,fn){visibility=fn}},location:{href:'http://test.local',protocol:'http:'},WebSocket:Socket});
 const {createRealtime}=await import('../public/game/realtime.js');const rt=createRealtime({onPlayers:p=>members.push(p),onCorrection(){},onStatus:s=>statuses.push(s)});
 try{rt.start();sockets[0].readyState=3;sockets[0].onclose({code:4000});rt.start();visibility();assert.equal(sockets.length,1,'background/refresh must not steal the session back');assert.equal(statuses.at(-1),'Active in another tab');assert.equal(rt.resume(),true);assert.equal(sockets.length,2);
  sockets[1].onmessage({data:JSON.stringify({type:'welcome',room:'r',players:[{id:'player',lng:-.18,lat:5.56}]})});assert.equal(rt.connected,true);assert.equal(statuses.at(-1),'Live district');assert.equal(members.at(-1)[0].id,'player');
  sockets[1].readyState=3;sockets[1].onclose({code:4003});assert.equal(rt.resume(),false);assert.equal(sockets.length,2);assert.equal(statuses.at(-1),'Session ended');
 }finally{rt.close();Object.assign(globalThis,old)}
});
test('a stalled old movement request never closes a replacement socket; send failures clean up',async()=>{
 const old={document:globalThis.document,location:globalThis.location,WebSocket:globalThis.WebSocket,setTimeout:globalThis.setTimeout,clearTimeout:globalThis.clearTimeout};let id=0;const timers=new Map(),sockets=[];
 class Socket{constructor(){this.readyState=1;this.closed=0;sockets.push(this)}send(data){if(this.fail)throw Error('send failed');this.sent=JSON.parse(data)}close(){this.closed++;this.readyState=3}}
 Object.assign(globalThis,{document:{hidden:false,addEventListener(){}},location:{href:'http://test.local',protocol:'http:'},WebSocket:Socket,setTimeout:fn=>{timers.set(++id,fn);return id},clearTimeout:i=>timers.delete(i)});
 const {createRealtime}=await import('../public/game/realtime.js');const rt=createRealtime({onPlayers(){},onCorrection(){},onStatus(){}});const welcome=s=>s.onmessage({data:JSON.stringify({type:'welcome',room:'r',players:[]})});
 try{rt.start();welcome(sockets[0]);const first=rt.move({lng:0,lat:0}),rejected=assert.rejects(first,/timed out/);const timeout=[...timers.values()][0];sockets[0].readyState=2;rt.start();welcome(sockets[1]);timeout();await rejected;assert.equal(sockets[0].closed,1);assert.equal(sockets[1].closed,0);
  sockets[1].fail=true;await assert.rejects(rt.move({}),/send failed/);sockets[1].fail=false;const next=rt.move({});sockets[1].onmessage({data:JSON.stringify({type:'ack',seq:sockets[1].sent.seq})});await next;assert.equal(sockets[1].closed,0);
 }finally{rt.close();Object.assign(globalThis,old)}
});
