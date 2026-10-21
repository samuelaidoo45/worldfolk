import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {KOFI_MASSES,KOFI_SEATS,kofiLocal} from './kofi-annan-data.js';

// Original geometry and procedural finishes, informed by the reference register.
// No Google/booking imagery is requested or redistributed by the game renderer.
export function createKofiAnnanSite(site){
 const group=new T.Group();group.name=site.name;
 const mat=(color,kind='plaster',roughness=.8,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),kind);
 const white=mat('#e7e4dc'),stone=mat('#b9b3a6','stone'),clinic=mat('#bbcbd0'),roof=mat('#853d32','roof'),dark=mat('#1e292e'),glass=mat('#273d48','glass',.18,.65),railGlass=mat('#768f97','glass',.25,.45),metal=mat('#41494c','metal',.4,.5),paving=mat('#979d99','paving'),wood=mat('#73634e','wood'),leaf=mat('#385b35','foliage'),soil=mat('#676851','soil'),water=mat('#3298b1','smooth',.16,.4);
 roof.side=T.DoubleSide;
 const seamData=new Uint8Array(128*128*4);for(let y=0;y<128;y++)for(let x=0;x<128;x++){const i=(y*128+x)*4,v=x%16<2?133:215;seamData[i]=seamData[i+1]=seamData[i+2]=v;seamData[i+3]=255;}
 const seams=new T.DataTexture(seamData,128,128,T.RGBAFormat);seams.wrapS=seams.wrapT=T.RepeatWrapping;seams.needsUpdate=true;roof.map=roof.bumpMap=seams;roof.bumpScale=.025;
 const lit=new T.MeshStandardMaterial({color:'#c8b386',emissive:'#dab47a',emissiveIntensity:.18,roughness:.5});
 const add=(g,m,x=0,y=0,z=0,parent=group)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const box=(m,w,h,d,x,y,z,parent=group)=>add(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
 const solid=(ring,h,m,y=0)=>{const shape=new T.Shape(ring.slice(0,-1).map(([x,z])=>new T.Vector2(x,-z))),g=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);return add(g,m,0,y,0);};
 const sign=(text,w,h,x,y,z,rotation=0,color='#eee9db',background='#253b3a',parent=group)=>{
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.width=1024;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle=background;ctx.fillRect(0,0,1024,192);ctx.fillStyle=color;ctx.textAlign='center';ctx.font='600 58px sans-serif';ctx.fillText(text,512,118,980);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=add(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.8}),x,y,z,parent);o.rotation.y=rotation;
 };
 const faces=ring=>{
  const area=ring.slice(0,-1).reduce((n,a,i)=>n+a[0]*ring[i+1][1]-ring[i+1][0]*a[1],0),out=area>0?1:-1;
  return ring.slice(0,-1).map((a,i)=>{const b=ring[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/len*out,nz=-(b[0]-a[0])/len*out,face=new T.Group();face.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);face.rotation.y=Math.atan2(nx,nz);group.add(face);return {face,len,nx,nz};});
 };
 const hip=(ring,y)=>{
  const ps=ring.slice(0,-1),cx=ps.reduce((n,p)=>n+p[0],0)/ps.length,cz=ps.reduce((n,p)=>n+p[1],0)/ps.length,inner=ps.map(([x,z])=>[cx+(x-cx)*.6,cz+(z-cz)*.6]),a=[],uv=[];
  const v=(p,h)=>{a.push(p[0],h,p[1]);uv.push(p[0]/2,p[1]/2);};
  for(let i=0;i<ps.length;i++){const j=(i+1)%ps.length;for(const [p,h] of [[ps[i],y],[inner[j],y+1.2],[ps[j],y],[ps[i],y],[inner[i],y+1.2],[inner[j],y+1.2]])v(p,h);}
  for(const t of T.ShapeUtils.triangulateShape(inner.map(p=>new T.Vector2(...p)),[]))for(const i of t)v(inner[i],y+1.2);
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();add(g,roof);
  // Standing seams follow the red metal roof finish seen in Street View.
 };
 const palm=(x,z,h=5)=>{add(new T.CylinderGeometry(.13,.23,h,8),wood,x,h/2,z);for(let i=0;i<8;i++){const p=new T.Group();p.position.set(x,h,z);p.rotation.y=i*Math.PI/4;group.add(p);const m=add(new T.SphereGeometry(1,8,5),leaf,0,-.25,1.35,p);m.scale.set(.28,.13,1.7);m.rotation.x=.25;}};
 const bush=(x,z,w=1.4)=>{const m=add(new T.SphereGeometry(1,8,6),leaf,x,.55,z);m.scale.set(w,.55,.65);};
 let bays=0,portal=null,streetFace=null;
 for(const mass of KOFI_MASSES.filter(m=>m.siteId===site.id)){
  const ring=mass.ring.map(p=>kofiLocal(site,p)),h=mass.height,hospital=site.family==='hospital',hotel=site.family==='kwarleyz';
  const base=mass.minHeight||0;solid(ring,h-base,hospital?clinic:hotel?stone:white,base);solid(ring,.16,hotel?metal:white,h);
  const fs=faces(ring);
  for(const [index,{face,len,nx,nz}] of fs.entries()){
   if(len<3)continue;const floors=hospital?(h>5?2:1):hotel?Math.round(h/3.8):mass.id==='octavia-main'?4:1,fh=(h-base)/floors,columns=Math.max(1,Math.floor(len/(hotel?2.4:hospital?4.2:6.5))),cw=len/columns;
   const curtain=hotel&&(Math.abs(nz)>.7),balconies=!hospital&&!hotel&&(nz>0||nx>.65);
   for(let f=0;f<floors;f++)for(let j=0;j<columns;j++){
    const x=(j+.5)*cw-len/2,y=base+f*fh;
    if(hotel){
     if(curtain){
      box(glass,cw-.045,fh-.04,.1,x,y+fh/2,.07,face);
      box(metal,.055,fh,.08,x-cw/2,y+fh/2,.14,face);box(metal,cw,.065,.08,x,y+fh,.14,face);
      if(f>0&&(j+2*f)%5===0){const panel=box(glass,cw*.7,fh*.6,.08,x,y+fh*.56,.37,face);panel.rotation.x=-.26;box(metal,cw*.73,.06,.65,x,y+fh*.23,.35,face);}
      if((j+f)%4===1)box(lit,cw-.17,.25,.025,x,y+fh*.86,.13,face);
     }else{
      // Stone end walls remain largely solid; do not repeat generic windows.
      for(let k=0;k<Math.ceil(fh/1.15);k++)box(stone,cw-.055,1.08,.06,x,y+k*1.15+.55,.05,face);
      if(j===0){box(glass,.62,fh-.2,.08,x,y+fh/2,.1,face);for(let k=1;k<4;k++)box(metal,.65,.04,.12,x,y+k*fh/4,.17,face);}
     }
    }else if(hospital){
     box(white,cw*.72,1.6,.16,x,y+1.75,.1,face);box(glass,cw*.65,1.38,.06,x,y+1.75,.2,face);box(white,.06,1.42,.08,x,y+1.75,.25,face);
     box(white,cw,.12,.18,x,y+fh-.15,.1,face);
     if(nz>.6&&h<5&&j===Math.floor(columns/2)){box(dark,1.25,2.5,.18,x,1.25,.25,face);box(glass,1.05,2.25,.06,x,1.25,.36,face);}
    }else{
     box(f===0?glass:dark,cw-.2,f===0?3:2.7,.1,x,y+fh/2,.08,face);
     if(f>0||base){
      box(glass,cw-.7,2.4,.05,x,y+fh/2,.16,face);box(metal,.06,2.45,.09,x,y+fh/2,.21,face);
      const projection=balconies?(j%3===1?2.2:1.7):.45;
      box(white,cw,.45,projection+.2,x,y+.15,projection/2,face);box(white,.5,fh,projection+.2,x-cw/2+.25,y+fh/2,projection/2,face);
      box(white,cw,.4,projection+.2,x,y+fh-.13,projection/2,face);
      if(balconies){box(railGlass,cw-.4,.88,.08,x,y+.7,projection+.1,face);box(metal,cw-.35,.05,.09,x,y+1.15,projection+.1,face);}
     }else{box(white,.4,fh,.6,x-cw/2,fh/2,.15,face);}
    }
    bays++;
   }
   if(!hotel&&!hospital&&nz>.65&&len>20){if(mass.id==='octavia-main'&&!portal)portal={face,len};if(mass.id==='octavia-ground'&&!streetFace)streetFace=face;}
   if(hospital&&h>5&&nz>.65)sign("AIRPORT WOMEN’S HOSPITAL",Math.min(len-1,15),.95,0,h-.55,.22,0,'#29545c','#eff1e9',face);
   if(hotel&&curtain&&nz>.6&&h>25)sign('Kwarleyz',6,.9,len/2-4,h-.85,.2,0,'#d3bc76','#243238',face);
  }
  if(hospital){if(h<5)hip(ring,h);else{const pts=ring.slice(0,-1),cx=pts.reduce((n,p)=>n+p[0],0)/pts.length,cz=pts.reduce((n,p)=>n+p[1],0)/pts.length;box(white,5,.9,4,cx,h+.45,cz);}}
 }
 if(site.family==='octavia'&&portal){
  // The completed building's roof portal and blue pool distinguish it from
  // the architect's rejected tall concept and the 2016 construction panorama.
  const {face}=portal;box(white,15,.3,8,0,21.8,-5,face);box(water,12,.08,6,0,22.02,-5,face);box(railGlass,14,.9,.1,0,22.4,-.8,face);
  for(const x of [-7,7])box(stone,.8,8,1.1,x,21.8,-1,face);
  box(stone,14.8,.65,1.1,0,25.8,-1,face);
  for(const z of [-2.5,-5.5,-8.5])box(white,14.8,.25,.5,0,25.35,z,face);
  for(const x of [-8,8]){box(stone,3,.65,3,x,22,-13,face);const plant=add(new T.SphereGeometry(1,8,6),leaf,x,22.7,-13,face);plant.scale.set(1.3,.6,1.2);}
  sign('OCTAVIA 154',7,.65,0,3.1,.25,0,'#ede5d7','#31393d',streetFace||face);
 }else if(site.family==='kwarleyz'){
  // A recessed glazed lobby and separate entrance canopy break the tall wall
  // at pedestrian scale. Keep the space between its columns open to walkers.
  box(dark,13,3.7,.16,8,1.85,31.8);box(glass,11.8,3.2,.1,8,1.65,31.94);
  for(const x of [5,8,11])box(metal,.075,3.2,.1,x,1.65,32.02);
  box(stone,21.5,.35,3.8,6,3.8,32.7);
  for(const x of [-4,16])box(stone,.65,3.65,.65,x,1.825,33.6);
  sign('KWARLEYZ RESIDENCE',8,.55,8,3.85,34.63,0,'#d2bd80','#29373b');
  // Top shade roof, setback pool wing and front palms follow the photo series.
  for(const x of [-16,16])box(stone,.6,1.8,19,x,28.1,15);
  box(metal,33,.22,19,0,28.9,15);
  box(white,12,.25,8,6,18.15,-13);box(water,10.8,.08,6.8,6,18.33,-13);
  const [ax,az]=kofiLocal(site,site.arrival);for(const x of [-17,-8,8,17])palm(x,az-3,5.5);
  box(paving,35,.04,7,0,.025,az-1.5);
  // An original, restrained line interpretation marks the memorial-art end
  // wall. It is not a licensed reproduction of the actual Aunte Kwarley mural.
  if(typeof document!=='undefined'){
   const c=document.createElement('canvas');c.width=256;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#b9b3a6';ctx.fillRect(0,0,256,512);ctx.strokeStyle='#938f83';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(135,190,60,83,-.1,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(76,155);ctx.bezierCurveTo(50,100,80,70,135,80);ctx.bezierCurveTo(180,65,210,110,199,167);ctx.moveTo(95,178);ctx.lineTo(116,175);ctx.moveTo(147,175);ctx.lineTo(168,178);ctx.moveTo(136,185);ctx.lineTo(131,216);ctx.lineTo(144,219);ctx.moveTo(118,243);ctx.quadraticCurveTo(139,255,158,237);ctx.moveTo(103,267);ctx.bezierCurveTo(80,299,50,305,37,410);ctx.moveTo(169,265);ctx.bezierCurveTo(189,300,212,304,225,410);ctx.stroke();
   const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const decal=add(new T.PlaneGeometry(13,24),new T.MeshStandardMaterial({map,roughness:1}),-20.45,14,13);decal.rotation.y=-Math.PI/2;
  }
 }else if(site.family==='hospital'){
  const [ax,az]=kofiLocal(site,site.arrival);box(paving,10,.04,16,ax+2,.025,az-4);
  box(white,1.5,3.4,.25,-17,1.7,22);box(mat('#28754a'),1.35,3.15,.08,-17,1.7,22.15);
  sign('AIRPORT WOMEN’S HOSPITAL',1.3,.7,-17,2.6,22.21,0,'#ffffff','#9c4146');
  // Entrance columns stand beside the clear driveway, not across it.
  for(const x of [-11,7])box(white,.55,2.2,.55,x,1.1,21);
  for(const [x,z] of [[-15,17],[-15,12],[10,17]])bush(x,z,2);
 }
 const [sx,sz]=kofiLocal(site,KOFI_SEATS[site.id]);box(wood,2.2,.12,.65,sx,.46,sz);box(wood,2.2,.52,.12,sx,.8,sz-.27);for(const dx of [-.85,.85])box(metal,.12,.42,.5,sx+dx,.21,sz);
 group.userData.kofi={siteId:site.id,sourceIds:site.sourceIds,bays,dimensions:'mapped-outlines-photo-estimated-heights',privateInteriors:false};enhanceMaterials(group);batchStaticMeshes(group);return {group,update(){}};
}
