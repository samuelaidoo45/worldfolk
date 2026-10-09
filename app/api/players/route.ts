import {env} from 'cloudflare:workers';
import {loadRegisteredPlayer} from '../../../server/player-session';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const channel=(a:string,b:string)=>'dm:'+ [a,b].sort().join(':');
type PublicPlayer={id:string;handle:string;name:string;avatar:string;level:number;job:string;online:number};
const select='SELECT p.id,a.username AS handle,p.name,p.avatar,CAST(p.xp/100 AS INTEGER)+1 AS level,p.job,(p.last_seen_at>? AND p.session_token IS NOT NULL AND (p.session_expires_at=0 OR p.session_expires_at>?)) AS online FROM players p JOIN accounts a ON a.player_id=p.id';
async function target(db:D1Database,id:string){return db.prepare(select+' WHERE p.id=? OR a.username=? LIMIT 1').bind(Date.now()-120000,Date.now(),id,id.replace(/^@/,'').toLowerCase()).first<PublicPlayer>()}
export async function GET(request:Request){try{
 const db=env.DB;if(!db)return reply({error:'Profiles unavailable'},503);
 const self=await loadRegisteredPlayer<{id:string}>(db,request);if(!self)return reply({error:'Sign in to see profiles and chat'},401);
 const url=new URL(request.url);
 if(url.searchParams.has('inbox')){
  const rows=await db.prepare(`WITH recent AS (
   SELECT channel,player_id AS senderId,body,created_at AS at FROM messages
   WHERE channel LIKE ? OR channel LIKE ? ORDER BY created_at DESC LIMIT 200
  ), latest AS (SELECT *,ROW_NUMBER() OVER (PARTITION BY channel ORDER BY at DESC) AS rank FROM recent)
  SELECT p.id,a.username AS handle,p.name,p.avatar,m.body AS lastMessage,m.at,m.senderId
  FROM latest m JOIN players p ON p.id=CASE WHEN substr(m.channel,4,36)=? THEN substr(m.channel,41,36) ELSE substr(m.channel,4,36) END
  JOIN accounts a ON a.player_id=p.id WHERE m.rank=1 ORDER BY m.at DESC LIMIT 50`).bind(`dm:${self.id}:%`,`dm:%:${self.id}`,self.id).all();
  return reply({conversations:rows.results});
 }
 const id=url.searchParams.get('id')||'';if(!id||id.length>50)return reply({error:'Choose a player'},400);
 const profile=await target(db,id);if(!profile)return reply({error:'Player profile not found'},404);
 const messages=await db.prepare('SELECT id,player_id AS senderId,body,created_at AS at FROM messages WHERE channel=? ORDER BY created_at DESC LIMIT 60').bind(channel(self.id,profile.id)).all();
 const friendship=await db.prepare('SELECT id,status,requested_by AS requestedBy FROM friendships WHERE (player_a=? AND player_b=?) OR (player_a=? AND player_b=?)').bind(self.id,profile.id,profile.id,self.id).first();
 const extra=await db.prepare('SELECT bio,social_json,photo_key FROM player_profiles WHERE player_id=?').bind(profile.id).first<{bio:string;social_json:string;photo_key:string|null}>();
 return reply({profile:{...profile,bio:extra?.bio||'',socials:JSON.parse(extra?.social_json||'{}'),photoUrl:extra?.photo_key?'/api/profile/photo?key='+extra.photo_key:null},friendship,messages:messages.results.reverse()});
 }catch{return reply({error:'Profiles are temporarily unavailable'},503)}}
export async function POST(request:Request){try{
 const db=env.DB;if(!db)return reply({error:'Chat unavailable'},503);
 if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Origin not allowed'},403);
 if(!request.headers.get('content-type')?.includes('application/json'))return reply({error:'JSON required'},415);
 const self=await loadRegisteredPlayer<{id:string}>(db,request);if(!self)return reply({error:'Sign in to chat'},401);
 const raw=await request.text();if(raw.length>2048)return reply({error:'Message too large'},413);
 let input;try{input=JSON.parse(raw)}catch{return reply({error:'Invalid message'},400)}
 if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'Invalid message'},400);
 const id=typeof input.to==='string'?input.to:'',body=typeof input.body==='string'?input.body.trim().replace(/[\u0000-\u001f\u007f]/g,' '):'';
 if(!id||id.length>50||!body||body.length>220)return reply({error:'Choose a player and write 1–220 characters'},400);
 const peer=await target(db,id);if(!peer||peer.id===self.id)return reply({error:'Choose another registered player'},404);
 const now=Date.now();
 // The insert and its rate-limit update share a transaction. Concurrent sends
 // cannot bypass the cooldown, and clients never choose the private channel.
 const results=await db.batch([
  db.prepare('INSERT INTO messages (id,player_id,channel,body,created_at) SELECT ?,id,?,?,? FROM players WHERE id=? AND last_chat_at<=?').bind(crypto.randomUUID(),channel(self.id,peer.id),body,now,self.id,now-3000),
  db.prepare('UPDATE players SET last_chat_at=?,last_seen_at=?,chats_sent=chats_sent+1 WHERE id=? AND changes()>0').bind(now,now,self.id)
 ]);
 return results[0].meta.changes?reply({ok:true}):reply({error:'Wait a moment before sending another message'},429);
 }catch{return reply({error:'Message could not be sent. Please try again.'},503)}}
