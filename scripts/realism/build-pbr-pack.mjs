// Build-time only: no Poly Haven API or CDN traffic occurs in the game.
// Run with Node 22+, sharp, and network access. Originals are pinned by MD5;
// generated runtime files have SHA-256 entries for release verification.
import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import sharp from 'sharp';
const output=new URL('../../public/game/assets/materials/',import.meta.url);
await fs.mkdir(output,{recursive:true});
const hash=(data,algorithm='sha256')=>createHash(algorithm).update(data).digest('hex');
const families=[['plaster','plastered_wall_05',2],['concrete','concrete_floor_02',2],['asphalt','asphalt_02',3]];
const request=async url=>{const r=await fetch(url,{headers:{'User-Agent':'WorldfolkAssetBuild/1.0'}});if(!r.ok)throw Error(`${r.status}: ${url}`);return Buffer.from(await r.arrayBuffer());};
let saved=null;try{saved=JSON.parse(await fs.readFile(new URL('manifest.json',output),'utf8'))}catch{}
const pinned=id=>process.argv.includes('--refresh-sources')?null:saved?.assets.find(a=>a.id===id);
const manifest={license:'CC0-1.0',licenseUrl:'https://polyhaven.com/license',built:'2026-10-20',resolution:512,notes:'Generic scanned material detail and reflection-only sky; these are not captures of Accra. Authored surface colours and mapped surface masks are retained.',assets:[]};
for(const [family,id,tileMetres] of families){
 const previous=pinned(id),files=previous?null:JSON.parse(await request(`https://api.polyhaven.com/files/${id}`));
 const info=previous||JSON.parse(await request(`https://api.polyhaven.com/info/${id}`));
 const asset={family,id,source:`https://polyhaven.com/a/${id}`,authors:info.authors,tileMetres,inputs:[],outputs:[]};
 const inputs={};
 for(const channel of ['Diffuse','nor_gl','arm']){
  const pin=previous?.inputs.find(p=>p.channel===channel)||files[channel]['1k'].jpg;
  const original=await request(pin.url);if(hash(original,'md5')!==pin.md5)throw Error(`Source checksum mismatch: ${id}/${channel}`);
  asset.inputs.push({channel,...pin});
  inputs[channel]=await sharp(original).resize(512,512).removeAlpha().raw().toBuffer();
 }
 // Neutral albedo preserves each locally authored colour; scanned pores and
 // aggregate supply the detail. Keep normal and packed AO/roughness linear.
 const color=inputs.Diffuse;let sum=0;
 for(let i=0;i<color.length;i+=3)sum+=color[i]*.2126+color[i+1]*.7152+color[i+2]*.0722;
 const average=sum/(512*512);
 for(let i=0;i<color.length;i+=3){const luminance=color[i]*.2126+color[i+1]*.7152+color[i+2]*.0722,value=Math.max(135,Math.min(255,225+(luminance-average)*.9));color[i]=color[i+1]=color[i+2]=value;}
 for(const [suffix,data] of [['color',color],['normal',inputs.nor_gl],['orm',inputs.arm]]){
  const name=`${family}-${suffix}.webp`,bytes=await sharp(data,{raw:{width:512,height:512,channels:3}}).webp({quality:suffix==='color'?83:90,effort:6}).toBuffer();
  await fs.writeFile(new URL(name,output),bytes);asset.outputs.push({file:name,bytes:bytes.length,sha256:hash(bytes),colorSpace:suffix==='color'?'srgb':'linear'});
 }
 manifest.assets.push(asset);
}
const id='kloofendal_48d_partly_cloudy_puresky',previous=pinned(id),files=previous?null:JSON.parse(await request(`https://api.polyhaven.com/files/${id}`)),info=previous||JSON.parse(await request(`https://api.polyhaven.com/info/${id}`)),pin=previous?.inputs[0]||files.hdri['1k'].hdr,bytes=await request(pin.url);
if(hash(bytes,'md5')!==pin.md5)throw Error('Sky checksum mismatch');
await fs.writeFile(new URL('day-sky.hdr',output),bytes);
manifest.assets.push({family:'reflection-sky',id,source:`https://polyhaven.com/a/${id}`,authors:info.authors,usage:'Reflections only, never geographic background',inputs:[pin],outputs:[{file:'day-sky.hdr',bytes:bytes.length,sha256:hash(bytes),colorSpace:'linear-hdr'}]});
manifest.totalBytes=manifest.assets.flatMap(a=>a.outputs).reduce((s,a)=>s+a.bytes,0);
await fs.writeFile(new URL('manifest.json',output),JSON.stringify(manifest,null,2)+'\n');
console.log(`PBR pack: ${manifest.totalBytes} bytes, ${manifest.assets.length} shared assets`);
