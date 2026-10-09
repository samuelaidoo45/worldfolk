export class CommunityInputError extends Error {}
export const SOCIAL_HOSTS:Record<string,string[]>={instagram:['instagram.com'],tiktok:['tiktok.com'],x:['x.com','twitter.com'],facebook:['facebook.com'],youtube:['youtube.com','youtu.be'],linkedin:['linkedin.com']};
export function publicLink(value:unknown,hosts?:string[]){
 if(typeof value!=='string'||value.length>300)throw new CommunityInputError('Use an HTTPS link up to 300 characters');
 if(!value.trim())return '';
 let url:URL;try{url=new URL(value.trim())}catch{throw new CommunityInputError('Enter a full HTTPS link')}
 const host=url.hostname.toLowerCase();
 if(url.protocol!=='https:'||url.username||url.password||url.port||!host.includes('.')||/^[\d.]+$/.test(host)||host.includes(':')||/\.(local|internal|localhost)$/.test(host)|| (hosts&&!hosts.some(h=>host===h||host==='www.'+h)))throw new CommunityInputError('Use a valid public HTTPS link for this platform');
 return url.href;
}
export async function limitedBody(request:Request,max:number){
 const reader=request.body?.getReader();if(!reader)throw new CommunityInputError('Request body required');const chunks:Uint8Array[]=[];let size=0;
 while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>max){await reader.cancel();throw new CommunityInputError('Upload or request is too large')}chunks.push(value)}
 const all=new Uint8Array(size);let i=0;for(const c of chunks){all.set(c,i);i+=c.length}return all;
}
export function jpegDimensions(bytes:Uint8Array){
 if(bytes[0]!==255||bytes[1]!==216||bytes.at(-2)!==255||bytes.at(-1)!==217)throw new CommunityInputError('Upload a JPEG image');
 let i=2;while(i+8<bytes.length){if(bytes[i++]!==255)break;const marker=bytes[i++];if(marker===218||marker===217)break;const size=(bytes[i]<<8)|bytes[i+1];if(size<2||i+size>bytes.length)break;if([192,193,194].includes(marker)){const h=(bytes[i+3]<<8)|bytes[i+4],w=(bytes[i+5]<<8)|bytes[i+6];if(!w||!h||w>512||h>512)throw new CommunityInputError('Photo must be at most 512 × 512 pixels');return {w,h}}i+=size}
 throw new CommunityInputError('Invalid JPEG image');
}
export async function rateLimit(db:D1Database,key:string,limit:number,seconds=60){const now=Date.now(),bucket=`community:${Math.floor(now/(seconds*1000))}:${key}`;const row=await db.prepare('INSERT INTO auth_rate_limits (bucket,count,expires_at) VALUES (?,1,?) ON CONFLICT(bucket) DO UPDATE SET count=count+1 RETURNING count').bind(bucket,now+seconds*1000).first<{count:number}>();return (row?.count||0)>limit}
