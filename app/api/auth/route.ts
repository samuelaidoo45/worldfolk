import {startingLife,propertyId} from '../../../public/game/life-catalog.js';
import {resolveStartingPlace} from '../../../server/maps/starting-places';
import {walkingArrival} from '../../../server/maps/router';
import {env} from 'cloudflare:workers';
import {loadPlayer,sessionCookie} from '../../../server/player-session';
import {digest,hashPassword,verifyPassword,randomSecret,DUMMY_HASH} from '../../../server/passwords';
import {sessionName} from '../../../server/world-routing';
import type {WorldPlayer} from '../../../server/world-room';
type Account={id:string;player_id:string;username:string;password_hash:string;recovery_hash:string};
const reply=(data:unknown,status=200,headers:HeadersInit={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store',...headers}});
async function endSession(p:WorldPlayer){
 if(env.WORLD_SESSIONS)await env.WORLD_SESSIONS.get(env.WORLD_SESSIONS.idFromName(sessionName(p.id))).fetch('https://session/end',{method:'POST',body:JSON.stringify({player:p})});
 await env.DB!.prepare('DELETE FROM voice_sessions WHERE player_id=?').bind(p.id).run();
}
async function limited(request:Request,username:string){
 const now=Date.now(),window=Math.floor(now/900000);
 const ip=request.headers.get('CF-Connecting-IP')||'local';
 for(const [key,limit] of [[`ip:${ip}`,30],[`username:${username}`,12]] as const){
  const bucket=`${window}:${await digest(key)}`;
  const row=await env.DB!.prepare('INSERT INTO auth_rate_limits (bucket,count,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket,(window+1)*900000).first<{count:number}>();
  if(row&&row.count>limit)return true;
 }
 await env.DB!.prepare('DELETE FROM auth_rate_limits WHERE expires_at<?').bind(now).run();return false;
}
export async function GET(request:Request){
 if(!env.DB)return reply({error:'Account storage unavailable'},503);
 const player=await loadPlayer<WorldPlayer>(env.DB,request);if(!player)return reply({mode:'none'});
 const account=await env.DB.prepare('SELECT username FROM accounts WHERE player_id=?').bind(player.id).first<{username:string}>();
 return reply({mode:account?'account':'unregistered',username:account?.username,playerName:player.name});
}
export async function POST(request:Request){
 if(!env.DB)return reply({error:'Account storage unavailable'},503);const db=env.DB;
 if(request.headers.get('Origin')!==new URL(request.url).origin)return reply({error:'Origin not allowed'},403);
 if(!request.headers.get('Content-Type')?.includes('application/json'))return reply({error:'JSON required'},415);
 try{
  const raw=await request.text();if(raw.length>4096)return reply({error:'Request too large'},413);
  let input;try{input=JSON.parse(raw)}catch{return reply({error:'Invalid request'},400)}
  if(!input||typeof input!=='object'||Array.isArray(input))return reply({error:'Invalid request'},400);
  const action=input.action,player=await loadPlayer<WorldPlayer>(db,request);
  if(action==='logout'){
   if(player){await endSession(player);await db.prepare('UPDATE players SET session_token=NULL,session_expires_at=0 WHERE id=? AND session_token=?').bind(player.id,player.session_token).run()}
   return reply({ok:true},200,{'Set-Cookie':sessionCookie(request,'',0)});
  }
  if(!['register','login','recover','change-password'].includes(action))return reply({error:'Unknown account action'},400);
  const changing=action==='change-password';
  const ownAccount=changing&&player?await db.prepare('SELECT username FROM accounts WHERE player_id=?').bind(player.id).first<{username:string}>():null;
  if(changing&&!ownAccount)return reply({error:'Sign in before changing your password.'},401);
  const username=changing?ownAccount!.username:String(input.username||'').trim().toLowerCase(),password=input.password;
  if(!/^[a-z0-9_]{3,24}$/.test(username))return reply({error:'Use 3–24 letters, numbers or underscores for your username.'},400);
  if(typeof password!=='string'||password.length<(action==='login'?1:8)||password.length>128)return reply({error:'Use a password of 8–128 characters.'},400);
  if(await limited(request,username))return reply({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':'900'});
  const account=await db.prepare('SELECT * FROM accounts WHERE username=?').bind(username).first<Account>();
  const remembered=input.rememberMe===true, maxAge=remembered?2592000:null;
  const token=crypto.randomUUID(),expires=Date.now()+(remembered?2592000000:86400000);
  if(action==='register'){
   if(player&&await db.prepare('SELECT id FROM accounts WHERE player_id=?').bind(player.id).first())return reply({error:'This life already belongs to an account.'},409);
   if(account)return reply({error:'That username is unavailable.'},409);
   const passwordHash=await hashPassword(password),recoveryCode=randomSecret(),recoveryHash=await digest(recoveryCode);
   if(!player){
    const name=String(input.name||'').trim().replace(/\s+/g,' '),avatar=String(input.avatar||'🧑🏾');
    if(name.length<2||name.length>24||!/^[\p{L}\p{N} _'-]+$/u.test(name))return reply({error:'Choose a character name of 2–24 letters or numbers'},400);
    if(!['🧑🏾','👩🏾','👨🏾','👩🏿','👨🏿','🧑🏽','👩🏽','👨🏽'].includes(avatar))return reply({error:'Choose an avatar'},400);
    const selected=input.startPlaceId?await resolveStartingPlace(String(input.startPlaceId),typeof input.startPlaceName==='string'?input.startPlaceName:undefined):null;
    if(input.startPlaceId&&!selected)return reply({error:'Choose a public place on the city map'},400);
    const rolls=crypto.getRandomValues(new Uint32Array(2)),start=startingLife(rolls[0]/4294967296,rolls[1]/4294967296,selected),id=crypto.randomUUID(),now=Date.now();
    if(selected){try{[start.lng,start.lat]=await walkingArrival([selected.lng,selected.lat])}catch{return reply({error:'This entrance is unavailable. Choose another place.'},503)}}
    // Account and character commit together: failed registration never creates a guest.
    await db.batch([
     db.prepare('INSERT INTO players (id,name,avatar,session_token,session_expires_at,place_id,pos_lng,pos_lat,money,life_json,last_seen_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,name,avatar,token,expires,selected?.id||propertyId(id,start.life.home),start.lng,start.lat,start.money,JSON.stringify(start.life),now,now),
     db.prepare('INSERT INTO accounts (id,player_id,username,password_hash,recovery_hash,created_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),id,username,passwordHash,recoveryHash,now),
    ]);
    return reply({ok:true,username,recoveryCode},201,{'Set-Cookie':sessionCookie(request,token,maxAge)});
   }
   await endSession(player);
   const result=await db.batch([
    db.prepare('INSERT INTO accounts (id,player_id,username,password_hash,recovery_hash,created_at) SELECT ?,id,?,?,?,? FROM players WHERE id=? AND session_token=?').bind(crypto.randomUUID(),username,passwordHash,recoveryHash,Date.now(),player.id,player.session_token),
    db.prepare('UPDATE players SET session_token=?,session_expires_at=?,last_seen_at=? WHERE id=? AND session_token=? AND EXISTS (SELECT 1 FROM accounts WHERE player_id=? AND username=?)').bind(token,expires,Date.now(),player.id,player.session_token,player.id,username),
   ]);
   if(!result[0].meta.changes||!result[1].meta.changes)return reply({error:'Your session changed. Reload and try again.'},409);
   return reply({ok:true,username,recoveryCode},201,{'Set-Cookie':sessionCookie(request,token,maxAge)});
  }
  let valid=false;
  if(action==='login')valid=await verifyPassword(password,account?.password_hash||DUMMY_HASH);
  else if(changing){valid=typeof input.currentPassword==='string'&&input.currentPassword.length<=128&&await verifyPassword(input.currentPassword,account?.password_hash||DUMMY_HASH)}
  else {const code=typeof input.recoveryCode==='string'?input.recoveryCode.trim().toLowerCase():'';valid=!!account&&/^[a-f0-9]{48}$/.test(code)&&await digest(code)===account.recovery_hash}
  if(!account||!valid)return reply({error:(action==='login'||changing)?'Username or password is incorrect.':'Username or recovery code is incorrect.'},401);
  const target=await db.prepare('SELECT * FROM players WHERE id=?').bind(account.player_id).first<WorldPlayer>();if(!target)return reply({error:'Profile unavailable'},404);
  const passwordHash=(action==='recover'||changing)?await hashPassword(password):account.password_hash,recoveryCode=action==='recover'?randomSecret():undefined;
  if(player&&player.id!==target.id)await endSession(player);
  await endSession(target);
  const proof=action==='recover'?account.recovery_hash:account.password_hash;
  const proofColumn=action==='recover'?'recovery_hash':'password_hash';
  const result=await db.batch([
   db.prepare(`UPDATE players SET session_token=?,session_expires_at=?,last_seen_at=? WHERE id=? AND EXISTS (SELECT 1 FROM accounts WHERE id=? AND ${proofColumn}=?)`).bind(token,expires,Date.now(),target.id,account.id,proof),
   db.prepare(`UPDATE accounts SET password_hash=?,recovery_hash=? WHERE id=? AND ${proofColumn}=?`).bind(passwordHash,recoveryCode?await digest(recoveryCode):account.recovery_hash,account.id,proof),
  ]);
  if(!result[0].meta.changes||!result[1].meta.changes)return reply({error:'Your account changed. Try signing in again.'},409);
  return reply({ok:true,username:account.username,...(recoveryCode?{recoveryCode}:{})},200,{'Set-Cookie':sessionCookie(request,token,maxAge)});
 }catch(error){
  if(error instanceof Error&&error.message==='AUTH_BUSY')return reply({error:'Sign-in is busy. Please try again in a moment.'},503,{'Retry-After':'2'});
  if(error instanceof Error&&error.message.includes('UNIQUE constraint'))return reply({error:'That username or life already belongs to an account.'},409);
  console.error('Account operation failed');return reply({error:'Could not complete the account request. Please try again.'},500);
 }
}
