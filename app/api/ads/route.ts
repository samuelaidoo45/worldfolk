import {env} from 'cloudflare:workers';
import {loadRegisteredPlayer} from '../../../server/player-session';
import {CommunityInputError,limitedBody,publicLink,rateLimit} from '../../../server/community-validation';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fields='c.id,c.brand,c.headline,c.detail,c.url,c.color,c.audience,c.status,c.created_at AS createdAt,c.expires_at AS expiresAt,a.username AS handle';
export async function GET(request:Request){try{
 if(!env.DB)return reply({error:'Ads unavailable'},503);const db=env.DB,url=new URL(request.url);
 if(url.searchParams.has('mine')){const self=await loadRegisteredPlayer<{id:string}>(db,request);if(!self)return reply({error:'Sign in to manage ads'},401);const rows=await db.prepare(`SELECT ${fields} FROM ad_campaigns c JOIN accounts a ON a.player_id=c.player_id WHERE c.player_id=? ORDER BY c.created_at DESC LIMIT 50`).bind(self.id).all();return reply({campaigns:rows.results,price:500,durationHours:24})}
 const rows=await db.prepare(`SELECT ${fields} FROM ad_campaigns c JOIN accounts a ON a.player_id=c.player_id WHERE c.status='active' AND c.expires_at>? ORDER BY c.created_at DESC LIMIT 100`).bind(Date.now()).all();return Response.json({campaigns:rows.results},{headers:{'Cache-Control':'public, max-age=30'}});
 }catch{return reply({error:'Ads temporarily unavailable'},503)}}
export async function POST(request:Request){
 if(!env.DB)return reply({error:'Ads unavailable'},503);const db=env.DB;if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Origin not allowed'},403);
 const self=await loadRegisteredPlayer<{id:string}>(db,request);if(!self)return reply({error:'Sign in to advertise'},401);
 try{if(await rateLimit(db,self.id+':ads',10))return reply({error:'Please wait before changing ads again'},429);
 const input=JSON.parse(new TextDecoder().decode(await limitedBody(request,3000))),now=Date.now();
 if(input.action==='create'){
 const txt=(key:string,max:number)=>{if(typeof input[key]!=='string'||!input[key].trim()||input[key].length>max)throw new CommunityInputError(`${key}: enter 1–${max} characters`);return input[key].trim()};
 const brand=txt('brand',40),headline=txt('headline',70),detail=txt('detail',110),url=publicLink(input.url||'');
 if(!['player','business'].includes(input.audience)||!['#184f43','#174b66','#703d50','#293843'].includes(input.color))throw new CommunityInputError('Choose a campaign type and colour');
 const id=crypto.randomUUID();
 // Debit and creation are atomic; no client-selected balance, owner or price.
 const result=await db.batch([
 db.prepare("UPDATE players SET money=money-500,revision=revision+1 WHERE id=? AND money>=500 AND (SELECT COUNT(*) FROM ad_campaigns WHERE player_id=? AND expires_at>?)<3 AND NOT EXISTS(SELECT 1 FROM ad_campaigns WHERE player_id=? AND created_at>?)").bind(self.id,self.id,now,self.id,now-60000),
 db.prepare("INSERT INTO ad_campaigns (id,player_id,brand,headline,detail,url,color,audience,status,created_at,expires_at) SELECT ?,?,?,?,?,?,?,?,'active',?,? WHERE changes()>0").bind(id,self.id,brand,headline,detail,url,input.color,input.audience,now,now+86400000)
 ]);if(!result[1].meta.changes)return reply({error:'You need ₵500 game credits, fewer than 3 unexpired ads, and 60 seconds between campaigns'},409);return reply({ok:true,id},201);
 }
 if(!/^[a-f0-9-]{36}$/.test(input.id||''))throw new CommunityInputError('Choose an ad');
 if(['pause','resume'].includes(input.action)){const result=await db.prepare("UPDATE ad_campaigns SET status=? WHERE id=? AND player_id=? AND expires_at>? AND status IN ('active','paused')").bind(input.action==='pause'?'paused':'active',input.id,self.id,now).run();return result.meta.changes?reply({ok:true}):reply({error:'Ad not found, expired or suspended'},404)}
 if(input.action==='report'){
 const reason=typeof input.reason==='string'?input.reason.trim():'';if(reason.length<3||reason.length>240)throw new CommunityInputError('Give a report reason (3–240 characters)');
 await db.batch([db.prepare('INSERT OR IGNORE INTO ad_reports (campaign_id,player_id,reason,created_at) SELECT id,?,?,? FROM ad_campaigns WHERE id=? AND player_id<>?').bind(self.id,reason,now,input.id,self.id),db.prepare("UPDATE ad_campaigns SET status='suspended' WHERE id=? AND (SELECT COUNT(*) FROM ad_reports WHERE campaign_id=?)>=3").bind(input.id,input.id)]);return reply({ok:true});
 }throw new CommunityInputError('Unknown ad action');
 }catch(e){return reply({error:e instanceof CommunityInputError?e.message:'Ad could not be saved'},400)}
}
