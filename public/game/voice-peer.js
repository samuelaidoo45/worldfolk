// Trickle ICE keeps slow TURN/STUN candidates instead of discarding them after a timer.
export function createVoicePeer({stream,iceServers,offerer,send,onTrack,onState,PeerConnection=RTCPeerConnection}){
 const pc=new PeerConnection({iceServers}),candidates=[];let closed=false,operation=Promise.resolve();
 const serial=fn=>{const next=operation.then(()=>{if(!closed)return fn()});operation=next.catch(()=>{});return next};
 pc.onicecandidate=e=>{if(e.candidate&&!closed)Promise.resolve(send({type:'candidate',candidate:e.candidate.toJSON()})).catch(()=>{if(!closed)onState('signaling-error')})};
 pc.ontrack=onTrack;pc.onconnectionstatechange=()=>{if(!closed)onState(pc.connectionState)};
 stream.getTracks().forEach(track=>pc.addTrack(track,stream));
 async function local(description){await pc.setLocalDescription(description);await send(pc.localDescription.toJSON())}
 return {pc,start:()=>serial(async()=>{if(offerer&&pc.signalingState==='stable')await local(await pc.createOffer())}),
  receive:message=>serial(async()=>{
   if(message.type==='candidate'){if(pc.remoteDescription)await pc.addIceCandidate(message.candidate);else candidates.push(message.candidate);return}
   if(message.type==='offer'&&pc.signalingState==='stable'){await pc.setRemoteDescription(message);while(candidates.length)await pc.addIceCandidate(candidates.shift());await local(await pc.createAnswer())}
   else if(message.type==='answer'&&pc.signalingState==='have-local-offer'){await pc.setRemoteDescription(message);while(candidates.length)await pc.addIceCandidate(candidates.shift())}
  }),close(){closed=true;pc.onicecandidate=null;pc.onconnectionstatechange=null;pc.ontrack=null;pc.close();candidates.length=0}};
}
