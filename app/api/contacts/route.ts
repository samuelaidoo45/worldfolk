import {env} from 'cloudflare:workers';
import {loadRegisteredPlayer as loadPlayer} from '../../../server/player-session';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
type Friend={id:string;player_a:string;player_b:string;requested_by:string;status:string};
type Call={id:string;caller:string;callee:string;status:string;expires_at:number};
export async function GET(request:Request){try{
 const db=env.DB;if(!db)return reply({error:'Contacts storage unavailable'},503);const p=await loadPlayer<{id:string}>(db,request);if(!p)return reply({error:'Enter the game to use contacts'},401);
 const now=Date.now();
 const contacts=await db.prepare(`SELECT f.id,f.status,f.requested_by AS requestedBy,p.id AS playerId,p.name,p.avatar,(p.last_seen_at>?) AS online FROM friendships f JOIN players p ON p.id=CASE WHEN f.player_a=? THEN f.player_b ELSE f.player_a END WHERE f.player_a=? OR f.player_b=? ORDER BY f.created_at DESC LIMIT 200`).bind(now-120000,p.id,p.id,p.id).all();
 const call=await db.prepare(`SELECT c.id,c.caller,c.callee,c.status,c.expires_at AS expiresAt,p.name,p.avatar FROM friend_calls c JOIN players p ON p.id=CASE WHEN c.caller=? THEN c.callee ELSE c.caller END WHERE (c.caller=? OR c.callee=?) AND c.status IN ('ringing','active') AND c.expires_at>? ORDER BY c.created_at DESC LIMIT 1`).bind(p.id,p.id,p.id,now).first();
 return reply({contactCode:p.id,contacts:contacts.results,call});
 }catch(e){console.error('Contacts GET',e);return reply({error:'Contacts are temporarily unavailable'},503)}}
export async function POST(request:Request){try{
 if(request.headers.get('origin')&&request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Origin not allowed'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return reply({error:'JSON required'},415);
 const db=env.DB;if(!db)return reply({error:'Contacts storage unavailable'},503);const p=await loadPlayer<{id:string}>(db,request);if(!p)return reply({error:'Enter the game to use contacts'},401);
 const raw=await request.text();if(raw.length>1024)return reply({error:'Request too large'},413);let input;try{input=JSON.parse(raw)}catch{return reply({error:'Invalid request'},400)}if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'Invalid request'},400);
 const now=Date.now(),type=String(input.type),id=String(input.id||'');
 async function rate(kind:string,seconds:number){const r=await db!.prepare(`INSERT INTO auth_rate_limits (bucket,count,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=1,expires_at=excluded.expires_at WHERE auth_rate_limits.expires_at<=?`).bind(`contacts:${kind}:${p!.id}`,now+seconds*1000,now).run();return !!r.meta.changes}
 if(type==='request'){
  if(!await rate('request',5))return reply({error:'Wait a few seconds before sending another request'},429);
  const query=String(input.contact||'').trim().replace(/^@/,'').toLowerCase();if(!query||query.length>50)return reply({error:'Enter a username or contact code'},400);
  const target=await db.prepare('SELECT p.id FROM players p JOIN accounts a ON a.player_id=p.id WHERE p.id=? OR a.username=? LIMIT 1').bind(query,query).first<{id:string}>();
  if(!target||target.id===p.id)return reply({error:'No other player matches that contact'},404);
  const [a,b]=[p.id,target.id].sort();const r=await db.prepare('INSERT OR IGNORE INTO friendships (id,player_a,player_b,requested_by,status,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),a,b,p.id,'pending',now).run();return reply({ok:true,event:r.meta.changes?'Friend request sent':'This contact or request already exists'});
 }
 if(['accept','remove'].includes(type)){
  const f=await db.prepare('SELECT * FROM friendships WHERE id=? AND (player_a=? OR player_b=?)').bind(id,p.id,p.id).first<Friend>();if(!f)return reply({error:'Contact not found'},404);
  if(type==='accept'){if(f.requested_by===p.id||f.status!=='pending')return reply({error:'Only the invited player can accept'},403);await db.prepare("UPDATE friendships SET status='accepted' WHERE id=? AND status='pending'").bind(id).run()}
  else{await db.batch([db.prepare('DELETE FROM friendships WHERE id=?').bind(id),db.prepare("UPDATE friend_calls SET status='ended' WHERE ((caller=? AND callee=?) OR (caller=? AND callee=?)) AND status IN ('ringing','active')").bind(f.player_a,f.player_b,f.player_b,f.player_a),db.prepare('DELETE FROM voice_sessions WHERE room_id IN (SELECT id FROM friend_calls WHERE (caller=? AND callee=?) OR (caller=? AND callee=?))').bind(f.player_a,f.player_b,f.player_b,f.player_a)])}
  return reply({ok:true});
 }
 if(type==='call'){
  if(!await rate('call',5))return reply({error:'Wait a few seconds before calling again'},429);
  const f=await db.prepare("SELECT * FROM friendships WHERE id=? AND status='accepted' AND (player_a=? OR player_b=?)").bind(id,p.id,p.id).first<Friend>();if(!f)return reply({error:'Add and accept this friend before calling'},403);
  const other=f.player_a===p.id?f.player_b:f.player_a;
  const online=await db.prepare('SELECT id FROM players WHERE id=? AND last_seen_at>?').bind(other,now-120000).first();if(!online)return reply({error:'Your friend is offline'},409);
  const callId=crypto.randomUUID();const r=await db.prepare(`INSERT INTO friend_calls (id,caller,callee,status,created_at,expires_at) SELECT ?,?,?,'ringing',?,? WHERE EXISTS (SELECT 1 FROM friendships WHERE id=? AND status='accepted') AND NOT EXISTS (SELECT 1 FROM friend_calls WHERE status IN ('ringing','active') AND expires_at>? AND (caller IN (?,?) OR callee IN (?,?)))`).bind(callId,p.id,other,now,now+45000,f.id,now,p.id,other,p.id,other).run();
  return r.meta.changes?reply({ok:true,callId}):reply({error:'You or your friend already has a call'},409);
 }
 if(['answer','decline','hangup'].includes(type)){
  const call=await db.prepare('SELECT * FROM friend_calls WHERE id=? AND (caller=? OR callee=?)').bind(id,p.id,p.id).first<Call>();if(!call)return reply({error:'Call not found'},404);
  if(type==='answer'){
   if(call.callee!==p.id)return reply({error:'Only the recipient can answer'},403);
   const r=await db.prepare("UPDATE friend_calls SET status='active',expires_at=? WHERE id=? AND status='ringing' AND expires_at>?").bind(now+45000,id,now).run();if(!r.meta.changes)return reply({error:'This call has ended'},409);
  }else{await db.batch([db.prepare("UPDATE friend_calls SET status='ended',expires_at=? WHERE id=?").bind(now,id),db.prepare('DELETE FROM voice_sessions WHERE room_id=?').bind(id)])}
  return reply({ok:true});
 }
 return reply({error:'Unknown action'},400);
 }catch(e){console.error('Contacts POST',e);return reply({error:'Contacts are temporarily unavailable'},503)}}
