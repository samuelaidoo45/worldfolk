import {scryptAsync} from '@noble/hashes/scrypt.js';
const hex=(b:Uint8Array)=>Array.from(b,n=>n.toString(16).padStart(2,'0')).join('');
const bytes=(s:string)=>Uint8Array.from(s.match(/../g)||[],v=>parseInt(v,16));
export const randomSecret=()=>hex(crypto.getRandomValues(new Uint8Array(24)));
export async function digest(value:string){return hex(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))))}
let hashing=false;
async function derive(password:string,salt:string){
 // One memory-hard hash at a time per isolate; reject busy requests for retry.
 if(hashing)throw new Error('AUTH_BUSY');hashing=true;
 try{return hex(await scryptAsync(password,bytes(salt),{N:32768,r:8,p:3,dkLen:32,maxmem:48*1024*1024}))}finally{hashing=false}
}
export async function hashPassword(password:string){const salt=randomSecret();return `scrypt-v1$${salt}$${await derive(password,salt)}`}
export async function verifyPassword(password:string,stored:string){
 const [version,salt,expected]=stored.split('$');if(version!=='scrypt-v1'||!/^[a-f0-9]{48}$/.test(salt)||!/^[a-f0-9]{64}$/.test(expected))return false;
 const actual=await derive(password,salt);let different=0;for(let i=0;i<64;i++)different|=actual.charCodeAt(i)^expected.charCodeAt(i);return different===0;
}
export const DUMMY_HASH=`scrypt-v1$${'0'.repeat(48)}$${'0'.repeat(64)}`;
