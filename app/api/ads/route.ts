import {env} from 'cloudflare:workers';
import {loadRegisteredPlayer} from '../../../server/player-session';
import {isAdAdmin} from '../../../server/ad-admin';
import {CommunityInputError,limitedBody,publicLink,rateLimit} from '../../../server/community-validation';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
const fields='c.id,c.brand,c.headline,c.detail,c.url,c.color,c.audience,c.status,c.created_at AS createdAt,c.expires_at AS expiresAt,a.username AS handle';
const privateFields=',c.contact,c.amount_minor AS amountMinor,c.duration_hours AS durationHours,c.payment_reference AS paymentReference,c.review_note AS reviewNote,c.approved_at AS approvedAt,c.payment_confirmed_at AS paymentConfirmedAt,c.published_at AS publishedAt';
export async function GET(request:Request){try{
 if(!env.DB)return reply({error:'Ads unavailable'},503);const db=env.DB,url=new URL(request.url);
 if(url.searchParams.has('mine')||url.searchParams.has('admin')){
 const self=await loadRegisteredPlayer<{id:string}>(db,request);if(!self)return reply({error:'Sign in to manage ads'},401);const admin=await isAdAdmin(db,self.id),review=url.searchParams.has('admin');if(review&&!admin)return reply({error:'Administrator access required'},403);
 const offset=Math.max(0,Math.min(1000000,Number(url.searchParams.get('offset'))||0));
 const rows=await db.prepare(`SELECT ${fields}${privateFields},(SELECT COUNT(*) FROM ad_reports WHERE campaign_id=c.id) AS reportCount FROM ad_campaigns c JOIN accounts a ON a.player_id=c.player_id ${review?'':'WHERE c.player_id=?'} ORDER BY c.created_at DESC LIMIT 51 OFFSET ?`).bind(...(review?[]:[self.id]),offset).all();
 return reply({campaigns:rows.results.slice(0,50),nextOffset:rows.results.length>50?offset+50:null,isAdmin:admin,prices:{player:50,business:100,currency:'GHS'},durationHours:24});
 }
 const rows=await db.prepare(`SELECT ${fields} FROM ad_campaigns c JOIN accounts a ON a.player_id=c.player_id WHERE c.status='active' AND c.approved_at>0 AND c.payment_confirmed_at>0 AND c.published_at>0 AND c.expires_at>? ORDER BY c.created_at DESC LIMIT 100`).bind(Date.now()).all();return reply({campaigns:rows.results});
 }catch{return reply({error:'Ads temporarily unavailable'},503)}}
export async function POST(request:Request){
 if(!env.DB)return reply({error:'Ads unavailable'},503);const db=env.DB;if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Origin not allowed'},403);
 const self=await loadRegisteredPlayer<{id:string}>(db,request);if(!self)return reply({error:'Sign in to advertise'},401);const actorId=self.id;
 try{if(await rateLimit(db,self.id+':ads',20))return reply({error:'Please wait before changing ads again'},429);
 const input=JSON.parse(new TextDecoder().decode(await limitedBody(request,4000))),now=Date.now();if(!input||typeof input!=='object')throw new CommunityInputError('Invalid request');
 if(input.action==='create'){
 const txt=(key:string,max:number)=>{if(typeof input[key]!=='string'||!input[key].trim()||input[key].length>max)throw new CommunityInputError(`${key}: enter 1–${max} characters`);return input[key].trim()};
 const brand=txt('brand',40),headline=txt('headline',70),detail=txt('detail',110),url=publicLink(input.url||'');
 if(!['player','business'].includes(input.audience)||!['#184f43','#174b66','#703d50','#293843'].includes(input.color))throw new CommunityInputError('Choose a campaign type and colour');
 const contact=txt('contact',160);
 const id=crypto.randomUUID();
 const result=await db.prepare("INSERT INTO ad_campaigns (id,player_id,brand,headline,detail,url,color,audience,status,created_at,expires_at,amount_minor,duration_hours,contact) SELECT ?,?,?,?,?,?,?,?,'pending_review',?,0,?,24,? WHERE (SELECT COUNT(*) FROM ad_campaigns WHERE player_id=? AND (status IN ('pending_review','awaiting_payment') OR expires_at>?))<3 AND NOT EXISTS(SELECT 1 FROM ad_campaigns WHERE player_id=? AND created_at>?)").bind(id,self.id,brand,headline,detail,url,input.color,input.audience,now,input.audience==='business'?10000:5000,contact,self.id,now,self.id,now-60000).run();
 if(!result.meta.changes)return reply({error:'You can have 3 open campaigns. Wait 60 seconds between submissions.'},409);return reply({ok:true,id,status:'pending_review'},201);
 }
 const adminActions=['approve','reject','confirm-payment','suspend'];
 if(adminActions.includes(input.action)&&!await isAdAdmin(db,self.id))return reply({error:'Administrator access required'},403);
 if(!/^[a-f0-9-]{36}$/.test(input.id||''))throw new CommunityInputError('Choose an ad');
 async function transition(statement:D1PreparedStatement,action:string){const results=await db.batch([statement,db.prepare('INSERT INTO ad_events (id,campaign_id,actor_id,action,created_at) SELECT ?,?,?,?,? WHERE changes()>0').bind(crypto.randomUUID(),input.id,actorId,action,now)]);return results[0].meta.changes?reply({ok:true}):reply({error:'Campaign changed or this action is not available. Refresh and try again.'},409)}
 if(input.action==='approve'){
 return transition(db.prepare("UPDATE ad_campaigns SET status='awaiting_payment',approved_at=?,approved_by=?,review_note='' WHERE id=? AND status='pending_review' AND payment_confirmed_at=0").bind(now,self.id,input.id),'approved');
 }
 if(input.action==='confirm-payment'){
 // Payment submission alone cannot publish. Only a platform admin can verify receipt.
 if(typeof input.reference!=='string'||input.reference.trim().length<3||input.reference.length>140)throw new CommunityInputError('Record the verified payment reference (3–140 characters)');
 if(input.received!==true)return reply({error:'Confirm that the real payment was received'},400);
 return transition(db.prepare("UPDATE ad_campaigns SET status='active',payment_reference=?,payment_confirmed_at=?,payment_confirmed_by=?,published_at=?,expires_at=?+duration_hours*3600000,review_note='' WHERE id=? AND status='awaiting_payment' AND approved_at>0 AND payment_confirmed_at=0 AND amount_minor=?").bind(input.reference.trim(),now,self.id,now,now,input.id,input.amountMinor),'payment-confirmed-and-published');
 }
 if(['reject','suspend'].includes(input.action)){
 if(typeof input.note!=='string'||input.note.trim().length<3||input.note.length>500)throw new CommunityInputError('Give the advertiser a reason (3–500 characters)');
 const states=input.action==='reject'?['pending_review','awaiting_payment']:['active','paused'];
 const next=input.action==='reject'?'rejected':'suspended';
 return transition(db.prepare(`UPDATE ad_campaigns SET status=?,review_note=? WHERE id=? AND status IN (${states.map(()=>'?').join(',')})`).bind(next,input.note.trim(),input.id,...states),input.action);
 }
 if(['pause','resume'].includes(input.action))return transition(db.prepare("UPDATE ad_campaigns SET status=? WHERE id=? AND player_id=? AND expires_at>? AND approved_at>0 AND payment_confirmed_at>0 AND status IN ('active','paused')").bind(input.action==='pause'?'paused':'active',input.id,self.id,now),input.action);
 if(input.action==='report'){
 const reason=typeof input.reason==='string'?input.reason.trim():'';if(reason.length<3||reason.length>240)throw new CommunityInputError('Give a report reason (3–240 characters)');
 await db.batch([db.prepare("INSERT OR IGNORE INTO ad_reports (campaign_id,player_id,reason,created_at) SELECT id,?,?,? FROM ad_campaigns WHERE id=? AND player_id<>? AND status IN ('active','paused')").bind(self.id,reason,now,input.id,self.id),db.prepare("UPDATE ad_campaigns SET status='suspended',review_note='Campaign suspended following player reports.' WHERE id=? AND (SELECT COUNT(*) FROM ad_reports WHERE campaign_id=?)>=3").bind(input.id,input.id)]);return reply({ok:true});
 }throw new CommunityInputError('Unknown ad action');
 }catch(e){return reply({error:e instanceof CommunityInputError?e.message:'Ad could not be saved'},400)}
}
