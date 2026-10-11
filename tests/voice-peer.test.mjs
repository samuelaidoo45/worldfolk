import test from 'node:test';
import assert from 'node:assert/strict';
import {createVoicePeer} from '../public/game/voice-peer.js';
class Peer{
 signalingState='stable';remoteDescription=null;added=[];
 addTrack(){} close(){this.closed=true}
 async createOffer(){return {type:'offer',sdp:'offer'}}
 async createAnswer(){return {type:'answer',sdp:'answer'}}
 async setLocalDescription(d){this.localDescription={...d,toJSON:()=>d};this.signalingState=d.type==='offer'?'have-local-offer':'stable'}
 async setRemoteDescription(d){this.remoteDescription=d;this.signalingState=d.type==='offer'?'have-remote-offer':'stable'}
 async addIceCandidate(c){assert.ok(this.remoteDescription);this.added.push(c)}
}
const make=(offerer=false,send=()=>{})=>createVoicePeer({stream:{getTracks:()=>[{}]},iceServers:[],offerer,send,onTrack(){},onState(){},PeerConnection:Peer});
test('candidate arriving before SDP is buffered and delivered after the offer',async()=>{
 const sent=[],p=make(false,m=>sent.push(m)),c={candidate:'late network path'};
 await p.receive({type:'candidate',candidate:c});assert.equal(p.pc.added.length,0);
 await p.receive({type:'offer',sdp:'offer'});assert.deepEqual(p.pc.added,[c]);assert.equal(sent[0].type,'answer');
 await p.receive({type:'candidate',candidate:{candidate:'relay'}});assert.equal(p.pc.added.length,2);
});
test('only the elected peer sends an offer and applies the answer',async()=>{
 const sent=[],a=make(true,m=>sent.push(m)),b=make(false,m=>sent.push(m));
 await Promise.all([a.start(),b.start()]);assert.equal(sent.length,1);assert.equal(sent[0].type,'offer');
 await a.receive({type:'candidate',candidate:{candidate:'remote candidate'}});
 await a.receive({type:'answer',sdp:'answer'});assert.equal(a.pc.signalingState,'stable');assert.equal(a.pc.added.length,1);
});
test('late ICE candidates are sent even after the SDP, and teardown stops signaling',async()=>{
 const sent=[],p=make(true,m=>sent.push(m));await p.start();
 p.pc.onicecandidate({candidate:{toJSON:()=>({candidate:'relay discovered later'})}});
 await Promise.resolve();assert.equal(sent[1].type,'candidate');
 p.close();await p.receive({type:'offer',sdp:'stale'});assert.equal(p.pc.remoteDescription,null);assert.equal(p.pc.onicecandidate,null);assert.ok(p.pc.closed);
});
