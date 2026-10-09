import {loadRegisteredPlayer as loadPlayer} from './player-session';
import {playerHeader,type WorldPlayer} from './world-room';
import {sessionName} from './world-routing';
export async function realtime(request:Request,env:Cloudflare.Env){
  if(!env.DB||!env.WORLD_ROOMS||!env.WORLD_SESSIONS)return new Response('Live rooms unavailable',{status:503});
  if(request.headers.get('Origin')!==new URL(request.url).origin)return new Response('Origin not allowed',{status:403});
  if(request.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});
  const token=request.headers.get('cookie')?.match(/(?:^|;\s*)accralife_session=([a-f0-9-]{36})(?:;|$)/)?.[1];
  if(!token)return new Response('Sign in first',{status:401});
  const player=await loadPlayer<WorldPlayer>(env.DB,request);
  if(!player)return new Response('Session ended',{status:401});
  player.pos_lng??=-.1949;player.pos_lat??=5.5682;
  const room=env.WORLD_SESSIONS.get(env.WORLD_SESSIONS.idFromName(sessionName(player.id)));
  return room.fetch('https://session/connect',{headers:{Upgrade:'websocket','X-World-Player':playerHeader(player)}});
}
