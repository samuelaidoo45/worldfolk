import * as T from './three.module.js';

// Distinct south-side exteriors observed in July 2024. Native ground outlines
// are retained; heights, hidden elevations and compound dimensions are estimates.
export function addSouthFrontage(site,ring,b,k,h){
 const {box,mesh,poly,beam,m}=k,{mat,cream,white,gateMetal,glass,roof,hip,cut,window}=h;
 const cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,w=b.x1-b.x0,d=b.z1-b.z0;
 const north=b.z0;
 function nameboard(text,width,x,y,z,bg='#34553e',fg='#f1f0e6'){
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.width=1024;c.height=150;
  const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,150);
  ctx.fillStyle=fg;ctx.font='bold 92px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,110,990);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;
  const o=mesh(new T.PlaneGeometry(width,width/6.8),new T.MeshStandardMaterial({map,roughness:.75,side:T.DoubleSide}),x,y,z);o.rotation.y=Math.PI;
 }
 if(site.frontage==='south-grey'){
  const grey=mat('#969e9d'),eave=mat('#667e85','metal');
  // The separate street block has a recessed ground veranda, deep eaves and
  // horizontal upper windows. The existing rear workspace stays accessible.
  poly(cut(ring,1,north+1.8,false),grey,3.2);poly(ring,grey,site.height-3.2,3.2);
  box(white,w,.17,1.9,cx,3.2,north+.85);
  for(const x of [b.x0+.25,cx-w*.24,cx+w*.24,b.x1-.25])box(white,.22,3.2,.24,x,1.6,north+.12);
  for(const x of [cx-w*.30,cx,cx+w*.30]){
   window(b,'north',x,4.95,Math.min(3.2,w*.24),1.18);
   box(glass,Math.min(3.1,w*.23),2.25,.08,x,1.5,north+1.75);
  }
  box(grey,w,.38,.32,cx,3.35,north-.11);box(white,w,.13,.28,cx,6.15,north-.16);
  hip(b,site.height,site.roof,.65,eave);
  nameboard('Regus',3,cx,3.55,north-.30,'#969e9d','#202b2b');
 }else if(site.frontage==='south-glass'){
  const green=mat('#768563'),silver=m.metal;
  poly(ring,cream,site.height);poly(ring,green,.25,site.height);
  const fw=w*.66,fx=b.x1-fw/2,front=north-.08;
  box(green,fw+.35,5.65,.18,fx,3.55,front);
  box(m.glass,fw-.30,4.7,.12,fx,3.5,front-.13);
  // Pale vertical glazing/blind panels and narrow exposed reflective bays.
  for(let j=0;j<5;j++){
   const x=fx-fw*.37+j*fw*.18;
   if(j>0)box(white,fw*.165,4.25,.035,x,3.55,front-.205);
   box(silver,.035,4.7,.06,x-fw*.09,3.5,front-.25);
  }
  for(const y of [1.12,3.3,5.9])box(silver,fw-.25,.055,.07,fx,y,front-.25);
  box(green,fw+.35,.55,.25,fx,6.25,front-.04);
  nameboard('Ghana Life House',fw*.58,fx,6.28,front-.19);
  // The lower glazed entry and louvred stair screen remain behind a closed compound.
  box(glass,2.2,2.4,.10,fx,1.3,front-.23);
  for(let y=.4;y<2.8;y+=.23)box(silver,2.6,.045,.1,fx+fw*.33,y,front-.29);
  const wx=b.x0+w*.15;for(const y of [1.6,4.7])window(b,'north',wx,y,Math.min(2.6,w*.23),1.5);
  box(white,w*.30,.25,.5,wx,6.35,north-.18);
 }else if(site.frontage==='south-screen'){
  poly(ring,cream,3.2);poly(cut(ring,1,north+1.7,false),cream,3.05,3.2);
  poly(ring,cream,.22,site.height);box(cream,w+.25,.45,.35,cx,6.3,north-.08);
  box(cream,w,.18,1.8,cx,3.2,north+.8);
  for(const x of [b.x0+.2,b.x1-.2])box(cream,.25,2.8,.25,x,4.65,north+.1);
  for(const x of [cx-w*.30,cx+w*.30]){
   box(glass,Math.min(2.4,w*.23),1.65,.08,x,4.85,north+1.64);
   for(const y of [3.65,4.0,4.35])beam(gateMetal,[x-w*.12,y,north-.12],[x+w*.12,y,north-.12],.022);
   window(b,'north',x,1.7,Math.min(2.5,w*.23),1.4);
  }
  // Open square breeze-block lattice in the centre of the recessed balcony.
  const sw=Math.min(3,w*.22),sx=cx-sw/2;
  for(let x=sx;x<=cx+sw/2+.01;x+=sw/6)box(white,.065,2.55,.20,x,4.75,north-.02);
  for(let y=3.5;y<6.04;y+=.32)box(white,sw,.065,.20,cx,y,north-.02);
  for(let x=sx;x<cx+sw/2;x+=sw/6)for(let y=3.5;y<5.9;y+=.32){const p=box(white,sw/6,.055,.18,x+sw/12,y+.16,north-.02);p.rotation.z=.28;}
 }else if(site.frontage==='south-tiled'){
  poly(ring,cream,site.height);
  // Connected pitched roofs follow the I-shaped house's narrow stem and east wing,
  // instead of spanning the two open notches with one bounding-box roof.
  const spineEnd=Math.min(...ring.filter(p=>p[1]<north+.6).map(p=>p[0]))+7.8;
  const x0=b.x0-.4,x1=spineEnd+.4,z0=b.z0-.4,z1=b.z1+.4,y=site.height,rx=(x0+x1)/2;
  const a=[x0,y,z0],c=[x1,y,z0],e=[x1,y,z1],f=[x0,y,z1],rn=[rx,y+site.roof,z0],rs=[rx,y+site.roof,z1];
  const faces=(triangles,ma)=>{const v=triangles.flat(2),uv=[];for(let i=0;i<v.length;i+=3)uv.push(v[i]*.4,v[i+2]*.4);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();ma.side=T.DoubleSide;mesh(g,ma);};
  faces([[a,f,rs],[a,rs,rn],[c,rn,rs],[c,rs,e]],roof);faces([[a,rn,c],[f,e,rs]],cream);beam(roof,rn,rs,.075);
  for(let t=.06;t<1;t+=.1)for(const side of [x0,x1]){const x=side+(rx-side)*t,yy=y+site.roof*t;beam(roof,[x,yy,z0],[x,yy,z1],.018);}

  const wing=ring.filter(p=>p[0]>spineEnd+1);
  hip({x0:spineEnd-.4,x1:b.x1,z0:Math.min(...wing.map(p=>p[1])),z1:Math.max(...wing.map(p=>p[1]))},site.height,site.roof*.67,.35);
  for(const x of [b.x0+2.1,spineEnd-1.8])for(const y of [1.7,4.85])window(b,'north',x,y,2.05,1.35);
  for(const z of [cz-d*.20,cz+d*.25])for(const y of [1.7,4.85])window(b,'west',z,y,2.1,1.35);
  const dish=mesh(new T.SphereGeometry(.78,16,8,0,Math.PI*2,0,Math.PI*.42),gateMetal,cx-2,site.height+site.roof-.2,cz);dish.rotation.z=.65;dish.rotation.x=.6;
  beam(gateMetal,[cx-2,site.height-.1,cz],[cx-2,site.height+site.roof-.2,cz],.035);
 }else return false;
 return true;
}
