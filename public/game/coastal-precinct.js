import * as T from './three.module.js';
import {areaLocal} from './mahama-neighbourhood-data.js';
import {COAST_GROUND,COAST_WALKS,COAST_WALLS,COAST_TREES,CLUB_TANK} from './coastal-precinct-data.js';
let soilTexture;
function coastalSoil(){
 if(soilTexture)return soilTexture;
 const n=256,bytes=new Uint8Array(n*n*4),hash=(x,y)=>{let a=Math.imul(x+37,374761393)^Math.imul(y+79,668265263);a=Math.imul(a^(a>>>13),1274126177);return ((a^(a>>>16))>>>0)/4294967295;};
 const noise=(x,y,grid)=>{const X=x/n*grid,Y=y/n*grid,i=Math.floor(X),j=Math.floor(Y),u=X-i,v=Y-j,s=u*u*(3-2*u),t=v*v*(3-2*v),a=hash(i%grid,j%grid),b=hash((i+1)%grid,j%grid),c=hash(i%grid,(j+1)%grid),d=hash((i+1)%grid,(j+1)%grid);return (a+(b-a)*s)*(1-t)+(c+(d-c)*s)*t;};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=Math.round(236+(noise(x,y,4)-.5)*5+(noise(x,y,32)-.5)*5+(noise(x,y,128)-.5)*4+(hash(x,y)-.5)*4),i=(y*n+x)*4;bytes[i]=bytes[i+1]=bytes[i+2]=v;bytes[i+3]=255;}
 soilTexture=new T.DataTexture(bytes,n,n);soilTexture.name='worldfolk-coastal-soil';soilTexture.wrapS=soilTexture.wrapT=T.RepeatWrapping;soilTexture.magFilter=T.LinearFilter;soilTexture.minFilter=T.LinearMipmapLinearFilter;soilTexture.generateMipmaps=true;soilTexture.anisotropy=4;soilTexture.colorSpace=T.SRGBColorSpace;soilTexture.userData.shared=true;soilTexture.needsUpdate=true;return soilTexture;
}
// Original meshes; reference imagery is never a game texture.
export function renderClubMass(b,rings,k,h,detail='near'){
 if(b.family!=='club')return false;
 const medium=detail==='medium',{plate,faces,material,surface}=h;
 const green=material('#53665c','wood'),white=material('#d9d4bf','paint'),window=material('#7e8b82','glass'),shade=material('#4b5049','paint');
 const inset=rings.map(r=>r.map(([x,z])=>[x*.88,z*.88]));plate(inset,shade,3.15);plate(rings,green,4.2,3.3);
 h.roof(b,rings,material('#938e7e','roof-metal'));
 const quad=(f,ma,u,y,w,ht,out)=>{const p=(x,Y)=>f.at(x,Y,out);surface([[p(u-w/2,y-ht/2),p(u+w/2,y-ht/2),p(u-w/2,y+ht/2)],[p(u+w/2,y-ht/2),p(u+w/2,y+ht/2),p(u-w/2,y+ht/2)]],ma);};
 faces(rings,f=>{
  const n=Math.max(1,Math.floor(f.len/2.8)),bay=f.len/n;
  f.part(white,f.len,.24,.38,0,3.2,.12);f.part(white,f.len,.15,.24,0,7.48,.1);
  for(let j=0;j<=n;j++)f.part(white,.22,3.25,.32,j*bay-f.len/2,1.625,.04);
  if(!medium){
   // The open-looking concrete lattice is backed by the inset private lower
   // enclosure, consistent with the non-enterable native building collider.
   for(let j=0;j<n;j++){const u=(j+.5)*bay-f.len/2,p=(x,y)=>f.at(x,y,.08),w=bay*.42;surface([[p(u-w,.4),p(u-w+.15,.4),p(u+w,2.75)],[p(u-w+.15,.4),p(u+w+.15,2.75),p(u+w,2.75)]],white);}
   for(let y=3.4;y<7.4;y+=.18)quad(f,shade,0,y,f.len,.022,.03);
  }
  for(let j=0;j<n;j++){
   const u=(j+.5)*bay-f.len/2;
   f.part(white,1.5,2.45,.12,u,5.65,.07);quad(f,window,u,5.65,1.27,2.21,.145);
   if(!medium)for(let y=4.65;y<=6.65;y+=.18)quad(f,white,u,y,1.27,.035,.16);
   f.part(white,.055,2.2,.08,u,5.65,.17);
  }
 });
 return true;
}

export function decorateCoast(site,k,h,detail='near'){
 const medium=detail==='medium',local=p=>areaLocal(site,p),{plate,material,surface}=h,{box,mesh}=k;
 if(site.zone.startsWith('shore-')){
  const soil=(color)=>{const m=material(color,'earth');m.map=m.bumpMap=coastalSoil();m.bumpScale=.014;m.userData.textureMetres=32;return m;};
  const mats={earth:soil('#aa9c84'),grass:soil('#7e8663'),sparse:soil('#99957b')};
  for(const g of COAST_GROUND.filter(g=>g.zone===site.zone))plate(g.rings.map(r=>r.map(local)),mats[g.kind],0,.035);
  const compacted=soil('#a9a395');for(const w of COAST_WALKS.filter(w=>w.zone===site.zone))plate(w.rings.map(r=>r.map(local)),compacted,0,.042);
  return;
 }
 if(site.zone!=='club')return;
 const concrete=material('#aaa58f','stone'),cap=material('#c3bfaa','paint'),steel=material('#718079','metal'),tank=material('#313a37','paint');
 for(const w of COAST_WALLS){const a=local(w.a),b=local(w.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]),yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);const wall=box(concrete,.26,w.height,len,(a[0]+b[0])/2,w.height/2,(a[1]+b[1])/2);wall.rotation.y=yaw;const top=box(cap,.33,.09,len,(a[0]+b[0])/2,w.height+.035,(a[1]+b[1])/2);top.rotation.y=yaw;}
 for(const [i,t] of COAST_TREES.entries()){
  const [x,z]=local(t.position),wood=material('#6f6754','wood'),leaf=material(i%2?'#63704c':'#596849','foliage');
  mesh(new T.CylinderGeometry(.14,.26,t.height,medium?6:8),wood,x,t.height/2,z);
  if(t.palm){for(let j=0;j<7;j++){const a=j*Math.PI*2/7,X=x+Math.cos(a)*1.8,Z=z+Math.sin(a)*1.8,p=[x,t.height,z],q=[X,t.height+.2,Z],r=[X+Math.cos(a+.35)*1.8,t.height-.8,Z+Math.sin(a+.35)*1.8],s=[X+Math.cos(a-.35)*1.8,t.height-.8,Z+Math.sin(a-.35)*1.8];surface([[p,q,r],[p,s,q]],leaf);}}
  else for(let j=0;j<(medium?1:3);j++){const crown=mesh(new T.IcosahedronGeometry(1,medium?0:1),leaf,x+(j-1)*t.radius*.4,t.height-.3+j*.3,z+(j%2)*t.radius*.3);crown.scale.set(t.radius*.85,t.radius*.52,t.radius*.72);}
 }
 if(!medium){
  const [x,z]=local(CLUB_TANK.position);const line=(a,b,w=.06)=>{const A=new T.Vector3(...a),B=new T.Vector3(...b),d=B.clone().sub(A),o=mesh(new T.CylinderGeometry(w,w,d.length(),5),steel,...A.clone().add(B).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());};
  for(const dx of [-.8,.8])for(const dz of [-.8,.8])line([x+dx,0,z+dz],[x+dx,5.5,z+dz]);
  for(const dz of [-.8,.8])for(const dx of [-1,1])line([x+dx*.8,.3,z+dz],[x-dx*.8,5.4,z+dz],.035);
  mesh(new T.CylinderGeometry(.95,.95,1.45,12),tank,x,6.05,z);const dome=mesh(new T.SphereGeometry(.95,12,6),tank,x,6.68,z);dome.scale.y=.32;
 }
}
