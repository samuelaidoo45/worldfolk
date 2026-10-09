import {env} from 'cloudflare:workers';
import {loadRegisteredPlayer} from '../../../server/player-session';
import {CommunityInputError,limitedBody,publicLink,SOCIAL_HOSTS,rateLimit} from '../../../server/community-validation';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){try{if(!env.DB)return reply({error:'Profiles unavailable'},503);const self=await loadRegisteredPlayer<{id:string}>(env.DB,request);if(!self)return reply({error:'Sign in to edit your profile'},401);const p=await env.DB.prepare('SELECT bio,social_json,photo_key FROM player_profiles WHERE player_id=?').bind(self.id).first<{bio:string;social_json:string;photo_key:string|null}>();return reply({bio:p?.bio||'',socials:JSON.parse(p?.social_json||'{}'),photoUrl:p?.photo_key?'/api/profile/photo?key='+p.photo_key:null,uploadsAvailable:!!env.BUCKET})}catch{return reply({error:'Profile unavailable'},503)}}
export async function POST(request:Request){
 if(!env.DB)return reply({error:'Profiles unavailable'},503);if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Origin not allowed'},403);
 const self=await loadRegisteredPlayer<{id:string}>(env.DB,request);if(!self)return reply({error:'Sign in to edit your profile'},401);
 try{if(await rateLimit(env.DB,self.id+':profile',10))return reply({error:'Please wait before editing again'},429);
 const input=JSON.parse(new TextDecoder().decode(await limitedBody(request,4096)));if(!input||typeof input!=='object'||typeof input.bio!=='string'||input.bio.length>240||!input.socials||typeof input.socials!=='object'||Array.isArray(input.socials))throw new CommunityInputError('Use a bio up to 240 characters and valid social links');
 const socials:Record<string,string>={};for(const [platform,hosts] of Object.entries(SOCIAL_HOSTS)){const link=publicLink(input.socials[platform]??'',hosts);if(link)socials[platform]=link}
 await env.DB.prepare('INSERT INTO player_profiles (player_id,bio,social_json,updated_at) VALUES (?,?,?,?) ON CONFLICT(player_id) DO UPDATE SET bio=excluded.bio,social_json=excluded.social_json,updated_at=excluded.updated_at').bind(self.id,input.bio.trim(),JSON.stringify(socials),Date.now()).run();return reply({ok:true});
 }catch(e){return reply({error:e instanceof CommunityInputError?e.message:'Profile could not be saved'},400)}
}
