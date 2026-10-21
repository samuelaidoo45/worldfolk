// Reconnect with backoff. Failed sockets fall back to the existing HTTP API.
export function createRealtime({onPlayers,onCorrection,onStatus}){
 let socket=null,room='',retry=null,attempt=0,enabled=false,stopped=false,stopCode=0,seq=0,ping=null;
 const players=new Map(),pending=new Map();let syncPending=null,syncAgain=false;let paintTimer=null;const publish=()=>{if(!paintTimer)paintTimer=setTimeout(()=>{paintTimer=null;onPlayers([...players.values()])},200)};
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
   if(data.type==='correct'){if(data.seq&&!pending.has(data.seq))return;onCorrection(data.player);const error=Object.assign(new Error('Position corrected'),{code:'POSITION_CORRECTED'});if(data.seq&&pending.has(data.seq)){const item=pending.get(data.seq);clearTimeout(item.timer);pending.delete(data.seq);item.reject(error)}else settle(error);return}
   if(data.seq&&pending.has(data.seq)){const p=pending.get(data.seq);clearTimeout(p.timer);pending.delete(data.seq);data.type==='retry'?p.reject(new Error('Slow down')):p.resolve(data)}
  };
  socket.onclose=event=>{if(socket!==active)return;room='';clearInterval(ping);settle(new Error('Live connection closed'));onStatus('Reconnecting');if(!enabled||stopped)return;if(event.code===4000||event.code===4003){stopped=true;stopCode=event.code;onStatus(event.code===4003?'Session ended':'Active in another tab');return}clearTimeout(retry);retry=setTimeout(connect,Math.min(30000,1000*2**attempt++)+Math.random()*500)};
  socket.onerror=()=>onStatus('Connection interrupted');
 }
 function request(input){return new Promise((resolve,reject)=>{if(!room||socket?.readyState!==1){reject(new Error('Live connection unavailable'));return}const active=socket,id=++seq;const timer=setTimeout(()=>{if(!pending.has(id))return;pending.delete(id);active.close();reject(new Error('Live connection timed out'))},5000);pending.set(id,{resolve,reject,timer});try{active.send(JSON.stringify({...input,seq:id}))}catch(error){clearTimeout(timer);pending.delete(id);reject(error)}})}
 function sync(){
  if(syncPending){syncAgain=true;return syncPending}
  syncPending=(async()=>{let result;do{syncAgain=false;try{result=await request({type:'sync'})}catch(error){if(error.message!=='Slow down')throw error;await new Promise(resolve=>setTimeout(resolve,350));result=await request({type:'sync'})}}while(syncAgain);return result})().finally(()=>{syncPending=null});return syncPending;
 }
 document.addEventListener('visibilitychange',()=>{if(document.hidden){socket?.close(1000,'Background');clearTimeout(retry)}else connect()});
 return {get connected(){return !!room&&socket?.readyState===1},get room(){return room},resume(){if(stopCode!==4000)return false;socket=null;room='';stopped=false;stopCode=0;enabled=true;attempt=0;clearTimeout(retry);connect();return true},start(){enabled=true;connect()},reset(){enabled=false;stopped=false;stopCode=0;const previous=socket;socket=null;room='';clearTimeout(retry);clearInterval(ping);clearTimeout(paintTimer);paintTimer=null;settle(new Error('Session changed'));players.clear();previous?.close(1000,'Session changed');},move:input=>request({type:'move',...input}),sync,close(){enabled=false;clearTimeout(retry);clearInterval(ping);clearTimeout(paintTimer);socket?.close()}};
}
