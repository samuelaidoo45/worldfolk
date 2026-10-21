import test from 'node:test';import assert from 'node:assert/strict';
import {createRealtime} from '../public/game/realtime.js';
function harness(){
 const original={document:globalThis.document,location:globalThis.location,WebSocket:globalThis.WebSocket},sockets=[],status=[],corrections=[];
 globalThis.document={hidden:false,addEventListener(){}};globalThis.location={href:'http://localhost:3002/game/',protocol:'http:'};
 class Socket {readyState=0;sent=[];constructor(){sockets.push(this)}send(body){this.sent.push(body)}close(code=1000){this.readyState=3;this.onclose?.({code})}welcome(room='old'){this.readyState=1;this.onmessage({data:JSON.stringify({type:'welcome',room,players:[]})})}}
 globalThis.WebSocket=Socket;const client=createRealtime({onPlayers(){},onCorrection:p=>corrections.push(p),onStatus:s=>status.push(s)});
 return {client,sockets,status,corrections,cleanup(){client.close();for(const socket of sockets)socket.close();Object.assign(globalThis,original)}};
}
test('signing in again can restart a socket stopped by the old expired session',()=>{const h=harness();try{h.client.start();h.sockets[0].close(4003);assert.equal(h.status.at(-1),'Session ended');h.client.reset();h.client.start();assert.equal(h.sockets.length,2);h.sockets[1].welcome('new-session');assert.equal(h.client.connected,true);assert.equal(h.client.room,'new-session');}finally{h.cleanup()}});
test('session reset discards the old room and rejects pending movement rather than sending it as the newly signed-in player',async()=>{const h=harness();try{h.client.start();h.sockets[0].welcome();const oldMove=h.client.move({lng:-.18,lat:5.61});h.client.reset();await assert.rejects(oldMove,/Session changed/);assert.equal(h.client.room,'');assert.equal(h.client.connected,false);h.client.start();h.sockets[1].welcome('new');assert.equal(h.sockets[1].sent.length,0);}finally{h.cleanup()}});
test('late correction and session-ended events from the previous account cannot pause or move the new session',()=>{const h=harness();try{h.client.start();const old=h.sockets[0];old.welcome();h.client.reset();h.client.start();h.sockets[1].welcome('new');old.onmessage({data:JSON.stringify({type:'correct',player:{lng:0,lat:0}})});old.onclose({code:4003});assert.deepEqual(h.corrections,[]);assert.equal(h.status.at(-1),'Live district');assert.equal(h.client.room,'new');}finally{h.cleanup()}});
