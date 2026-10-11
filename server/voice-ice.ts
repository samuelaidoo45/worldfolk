// Long-lived TURN keys stay in Worker secrets; only expiring credentials reach players.
export async function voiceIceServers(env:{TURN_KEY_ID?:string;TURN_KEY_API_TOKEN?:string}){
 const direct=[{urls:'stun:stun.cloudflare.com:3478'},{urls:'stun:stun.l.google.com:19302'}];
 if(!env.TURN_KEY_ID||!env.TURN_KEY_API_TOKEN)return {iceServers:direct,relayAvailable:false};
 const r=await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(env.TURN_KEY_ID)}/credentials/generate-ice-servers`,{method:'POST',headers:{Authorization:`Bearer ${env.TURN_KEY_API_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify({ttl:86400}),signal:AbortSignal.timeout(8000)});
 if(!r.ok)throw Error('TURN_UNAVAILABLE');
 const data=await r.json() as {iceServers?:Array<{urls:string|string[];username?:string;credential?:string}>};
 if(!Array.isArray(data.iceServers)||!data.iceServers.some(s=>[s.urls].flat().some(url=>/^turns?:/.test(url))))throw Error('TURN_UNAVAILABLE');
 return {iceServers:data.iceServers,relayAvailable:true};
}
