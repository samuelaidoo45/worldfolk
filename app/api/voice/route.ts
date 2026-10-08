import {loadPlayer} from '../../../server/player-session';
import {env} from 'cloudflare:workers';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function player(request:Request){return env.DB?loadPlayer<{id:string;name:string}>(env.DB,request):null}
type Session={player_id:string;session_id:string;last_seen:number;last_signal:number;room_id:string};
async function getVoice(request:Request){
 const p=await player(request);if(!p)return reply({error:'Sign in to use voice'},401);const db=env.DB,now=Date.now();if(!db)return reply({error:"Voice storage unavailable"},503);const own=await db.prepare('SELECT * FROM voice_sessions WHERE player_id=? AND last_seen>?').bind(p.id,now-20000).first<Session>();if(!own)return reply({error:'Join voice first'},403);
 if(own.room_id!=='city'&&!await db.prepare("SELECT id FROM friend_calls WHERE id=? AND status='active' AND expires_at>? AND (caller=? OR callee=?)").bind(own.room_id,now,p.id,p.id).first())return reply({error:'This call has ended'},410);
 const cursor=Number(new URL(request.url).searchParams.get('after')||0);if(!Number.isSafeInteger(cursor)||cursor<0)return reply({error:'Invalid cursor'},400);
 await db.prepare('UPDATE voice_sessions SET last_seen=? WHERE player_id=? AND session_id=?').bind(now,p.id,own.session_id).run();
 const peers=await db.prepare('SELECT s.session_id AS id,p.name FROM voice_sessions s JOIN players p ON p.id=s.player_id WHERE s.last_seen>? AND s.player_id<>? AND s.room_id=? LIMIT 6').bind(now-20000,p.id,own.room_id).all();
 if(own.room_id!=='city'&&peers.results.length)await db.prepare("UPDATE friend_calls SET expires_at=? WHERE id=? AND status='active'").bind(now+45000,own.room_id).run();
 const signals=await db.prepare('SELECT id,from_session AS sender,payload FROM voice_signals WHERE to_session=? AND id>? AND created_at>? ORDER BY id LIMIT 30').bind(own.session_id,cursor,now-60000).all();return reply({peers:peers.results,signals:signals.results});
}
async function postVoice(request:Request){
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Origin not allowed'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return reply({error:'JSON required'},415);
 const p=await player(request);if(!p)return reply({error:'Sign in to use voice'},401);const raw=await request.text();if(raw.length>24000)return reply({error:'Signal too large'},413);let input;try{input=JSON.parse(raw)}catch{return reply({error:'Invalid JSON'},400)}
 const db=env.DB,now=Date.now();if(!db)return reply({error:"Voice storage unavailable"},503);
 if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'Invalid request'},400);
 if(input.type==='leave'){await db.prepare('DELETE FROM voice_sessions WHERE player_id=? AND session_id=?').bind(p.id,String(input.sessionId)).run();return reply({ok:true})}
 if(input.type==='join'){
  await db.prepare('DELETE FROM voice_sessions WHERE last_seen<?').bind(now-20000).run();await db.prepare('DELETE FROM voice_signals WHERE created_at<?').bind(now-60000).run();
  const room=typeof input.callId==='string'?input.callId:'city';
  if(room!=='city'&&!await db.prepare("SELECT id FROM friend_calls WHERE id=? AND status='active' AND expires_at>? AND (caller=? OR callee=?)").bind(room,now,p.id,p.id).first())return reply({error:'This private call is not available to you'},403);
  const id=crypto.randomUUID();const result=await db.prepare('INSERT INTO voice_sessions (player_id,session_id,room_id,last_seen,last_signal) SELECT ?,?,?,?,0 WHERE (SELECT COUNT(*) FROM voice_sessions WHERE room_id=? AND player_id<>?)<? ON CONFLICT(player_id) DO UPDATE SET session_id=excluded.session_id,room_id=excluded.room_id,last_seen=excluded.last_seen,last_signal=0').bind(p.id,id,room,now,room,p.id,room==='city'?6:2).run();if(!result.meta.changes)return reply({error:'The voice room is full. Try again shortly.'},409);return reply({id});
 }
 if(input.type!=='signal')return reply({error:'Unknown action'},400);
 const own=await db.prepare('SELECT * FROM voice_sessions WHERE player_id=? AND session_id=? AND last_seen>?').bind(p.id,String(input.sessionId),now-20000).first<Session>();if(!own)return reply({error:'Join voice again'},403);
 if(own.room_id!=='city'&&!await db.prepare("SELECT id FROM friend_calls WHERE id=? AND status='active' AND expires_at>? AND (caller=? OR callee=?)").bind(own.room_id,now,p.id,p.id).first())return reply({error:'This call has ended'},410);
 const target=await db.prepare('SELECT session_id FROM voice_sessions WHERE session_id=? AND player_id<>? AND last_seen>? AND room_id=?').bind(String(input.to),p.id,now-20000,own.room_id).first();if(!target)return reply({error:'Player left voice'},404);
 if(!['offer','answer'].includes(input.payload?.type)||typeof input.payload?.sdp!=='string'||input.payload.sdp.length>20000)return reply({error:'Invalid voice description'},400);
 const limited=await db.prepare('UPDATE voice_sessions SET last_signal=? WHERE player_id=? AND last_signal<=?').bind(now,p.id,now-100).run();if(!limited.meta.changes)return reply({error:'Please wait'},429);
 await db.prepare('INSERT INTO voice_signals (from_session,to_session,payload,created_at) VALUES (?,?,?,?)').bind(own.session_id,String(input.to),JSON.stringify({type:input.payload.type,sdp:input.payload.sdp}),now).run();return reply({ok:true});
}

export async function GET(request:Request){try{return await getVoice(request)}catch(error){console.error("Voice GET",error);return reply({error:"Voice is temporarily unavailable"},503)}}
export async function POST(request:Request){try{return await postVoice(request)}catch(error){console.error("Voice POST",error);return reply({error:"Voice is temporarily unavailable"},503)}}
