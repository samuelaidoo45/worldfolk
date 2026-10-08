// Reconnect with backoff. Failed sockets fall back to the existing HTTP API.
export function createRealtime({onPlayers,onCorrection,onStatus}){
 let socket=null,room='',retry=null,attempt=0,enabled=false,stopped=false,seq=0,ping=null;
 const players=new Map(),pending=new Map();let paintTimer=null;const publish=()=>{if(!paintTimer)paintTimer=setTimeout(()=>{paintTimer=null;onPlayers([...players.values()])},200)};
 function settle(error){for(const item of pending.values()){clearTimeout(item.timer);item.reject(error)}pending.clear()}
 function connect(){
  if(!enabled||stopped||document.hidden||socket&&socket.readyState<2)return;
  const url=new URL('/api/realtime',location.href);url.protocol=location.protocol==='https:'?'wss:':'ws:';
  socket=new WebSocket(url);const active=socket;onStatus('Connecting');
  socket.onmessage=event=>{if(socket!==active)return;
   if(event.data==='pong')return;
   let data;try{data=JSON.parse(event.data)}catch{return}
   if(data.type==='welcome'){room=data.room;attempt=0;players.clear();for(const p of data.players)players.set(p.id,p);onPlayers([...players.values()]);onStatus('Live district');clearInterval(ping);ping=setInterval(()=>{if(socket?.readyState===1)socket.send('ping')},25000)}
   if(data.type==='player'){players.set(data.player.id,data.player);publish()}
   if(data.type==='leave'){players.delete(data.id);publish()}
   if(data.type==='correct'){onCorrection(data.player);const error=Object.assign(new Error('Position corrected'),{code:'POSITION_CORRECTED'});if(data.seq&&pending.has(data.seq)){const item=pending.get(data.seq);clearTimeout(item.timer);pending.delete(data.seq);item.reject(error)}else settle(error);return}
   if(data.seq&&pending.has(data.seq)){const p=pending.get(data.seq);clearTimeout(p.timer);pending.delete(data.seq);data.type==='retry'?p.reject(new Error('Slow down')):p.resolve(data)}
  };
  socket.onclose=event=>{if(socket!==active)return;room='';clearInterval(ping);settle(new Error('Live connection closed'));onStatus('Reconnecting');if(!enabled||stopped)return;if(event.code===4000||event.code===4003){stopped=true;onStatus(event.code===4003?'Session ended':'Active in another tab');return}clearTimeout(retry);retry=setTimeout(connect,Math.min(30000,1000*2**attempt++)+Math.random()*500)};
  socket.onerror=()=>onStatus('Connection interrupted');
 }
 function request(input){return new Promise((resolve,reject)=>{if(!room||socket?.readyState!==1){reject(new Error('Live connection unavailable'));return}const id=++seq;const timer=setTimeout(()=>{pending.delete(id);socket?.close();reject(new Error('Live connection timed out'))},5000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({...input,seq:id}))})}
 document.addEventListener('visibilitychange',()=>{if(document.hidden){socket?.close(1000,'Background');clearTimeout(retry)}else connect()});
 return {get connected(){return !!room&&socket?.readyState===1},get room(){return room},start(){enabled=true;connect()},move:input=>request({type:'move',...input}),sync:()=>request({type:'sync'}),close(){enabled=false;clearTimeout(retry);socket?.close()}};
}
