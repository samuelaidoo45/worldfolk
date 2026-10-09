import {env} from 'cloudflare:workers';
import {loadRegisteredPlayer} from '../../../../server/player-session';
import {CommunityInputError,limitedBody,jpegDimensions,rateLimit} from '../../../../server/community-validation';
const reply=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){
 const key=new URL(request.url).searchParams.get('key')||'';if(!/^profiles\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.jpg$/.test(key)||!env.BUCKET)return new Response(null,{status:404});
 const file=await env.BUCKET.get(key);if(!file)return new Response(null,{status:404});
 return new Response(file.body,{headers:{'Content-Type':'image/jpeg','Cache-Control':'public, max-age=86400','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Cross-Origin-Resource-Policy':'same-origin'}});
}
export async function POST(request:Request){
 if(!env.DB||!env.BUCKET)return reply({error:'Photo storage is not available yet'},503);if(request.headers.get('origin')!==new URL(request.url).origin)return reply({error:'Origin not allowed'},403);
 const self=await loadRegisteredPlayer<{id:string}>(env.DB,request);if(!self)return reply({error:'Sign in to upload a photo'},401);
 if(await rateLimit(env.DB,self.id+':photo',5))return reply({error:'Please wait before uploading again'},429);
 const old=await env.DB.prepare('SELECT photo_key FROM player_profiles WHERE player_id=?').bind(self.id).first<{photo_key:string}>();
 let key:string|null=null;
 try{if(request.headers.get('content-type')!=='application/json'){
 if(request.headers.get('content-type')!=='image/jpeg')throw new CommunityInputError('Upload a JPEG photo');const bytes=await limitedBody(request,160000);jpegDimensions(bytes);key=`profiles/${self.id}/${crypto.randomUUID()}.jpg`;await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:'image/jpeg'}});
 }else{const body=JSON.parse(new TextDecoder().decode(await limitedBody(request,100)));if(body.action!=='remove')throw new CommunityInputError('Invalid photo action')}
 await env.DB.prepare('INSERT INTO player_profiles (player_id,photo_key,updated_at) VALUES (?,?,?) ON CONFLICT(player_id) DO UPDATE SET photo_key=excluded.photo_key,updated_at=excluded.updated_at').bind(self.id,key,Date.now()).run();
 }catch(e){if(key)await env.BUCKET.delete(key);return reply({error:e instanceof CommunityInputError?e.message:'Photo could not be saved'},400)}
 if(old?.photo_key)await env.BUCKET.delete(old.photo_key);return reply({photoUrl:key?'/api/profile/photo?key='+key:null});
}
