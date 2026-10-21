import * as T from './three.module.js';
import {oakKit} from './oak-plaza-model.js';
import {tagSurface} from './graphics-materials.js';
import {MAHAMA_RAILS,MAHAMA_WEST_APPROACH,MAHAMA_BRIDGES,MAHAMA_PILLARS,BYPASS_WALLS,MAHAMA_ROADS,NORTH_POLO_MASSES,RAIL_DECK_TOP,RAIL_UNDERSIDE,RAIL_GAUGE,mahamaLocal,mahamaRoadPoint,mahamaRoadClear} from './mahama-bypass-data.js';
import {bearingTo,distanceMetres,offsetMetres} from './motion.js';
export function createMahamaBypass(site){
 const group=new T.Group();group.name=site.name;const k=oakKit(group),{m,mesh,box,poly,beam}=k,local=p=>mahamaLocal(site,p);
 const mat=(c,kind='stone',roughness=.94,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color:c,roughness,metalness}),kind);
 const concrete=mat('#afa897'),edge=mat('#c0b8a4'),damp=mat('#666c59'),iron=mat('#4c514c','metal',.7,.45),rust=mat('#755443','metal'),ballast=mat('#77766a'),earth=mat('#8c816b','earth'),grass=mat('#68704b','grass'),paving=mat('#9d9988','paving'),paint=mat('#e3dfc7','paint'),cream=mat('#c9c1a8','plaster'),roof=mat('#b8b7a4','metal',.82,.12),wood=mat('#564c3e','wood');
 function triangles(tris,ma){const pos=tris.flat(2),uv=[];for(const tri of tris){const a=new T.Vector3(...tri[0]),u=new T.Vector3(...tri[1]).sub(a).normalize(),normal=new T.Vector3().crossVectors(u,new T.Vector3(...tri[2]).sub(a)).normalize(),v=new T.Vector3().crossVectors(normal,u);for(const p of tri){const q=new T.Vector3(...p).sub(a);uv.push(q.dot(u)/3,q.dot(v)/3);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();ma.side=T.DoubleSide;mesh(geo,ma);}

 function strip(a,b,width,y,ma,depth=.03){const A=local(a),B=local(b),o=box(ma,width,depth,Math.hypot(B[0]-A[0],B[1]-A[1])+.025,(A[0]+B[0])/2,y,(A[1]+B[1])/2);o.rotation.y=-bearingTo(a,b)*Math.PI/180;return o;}
 // Original streak texture. No Street View pixels are embedded in the game.
 const bytes=new Uint8Array(64*128*4);for(let y=0;y<128;y++)for(let x=0;x<64;x++){const stain=(Math.sin(x*13.7)*43758.54)%1,v=210-Math.abs(stain)*30-(y>55&&y<62?14:0)+(Math.sin(x*15+y*23)*8);const i=(y*64+x)*4;bytes[i]=v;bytes[i+1]=v;bytes[i+2]=v-6;bytes[i+3]=255;}
 const texture=new T.DataTexture(bytes,64,128);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.needsUpdate=true;texture.magFilter=T.LinearFilter;concrete.map=texture;
 const masonry=mat('#bcb29a');
 const stones=new Uint8Array(128*128*4),seeds=Array.from({length:55},(_,i)=>[(Math.sin(i*127.1)*43758.54%1+1)%1*128,(Math.sin(i*311.7+3)*9731.1%1+1)%1*128]);
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){let first=Infinity,second=Infinity,cell=0;for(let j=0;j<seeds.length;j++){const [sx,sy]=seeds[j],dx=Math.min(Math.abs(x-sx),128-Math.abs(x-sx)),dy=Math.min(Math.abs(y-sy),128-Math.abs(y-sy)),d=Math.hypot(dx,dy);if(d<first){second=first;first=d;cell=j;}else if(d<second)second=d;}const v=second-first<.9?110:170+(cell%6)*9+Math.sin(x*13+y*7)*6,i=(y*128+x)*4;stones[i]=v;stones[i+1]=v;stones[i+2]=v-9;stones[i+3]=255;}
 const stoneMap=new T.DataTexture(stones,128,128);stoneMap.wrapS=stoneMap.wrapT=T.RepeatWrapping;stoneMap.magFilter=T.LinearFilter;stoneMap.needsUpdate=true;masonry.map=stoneMap;
 if(site.family==='stables'){
  for(const b of NORTH_POLO_MASSES){
   const r=b.rings[0].slice(0,-1).map(local),cx=r.reduce((s,p)=>s+p[0]/r.length,0),cz=r.reduce((s,p)=>s+p[1]/r.length,0),h=b.wallHeight;
   poly([...r,r[0]],cream,h);
   // Long axis is retained from each separate native ring, including its angle.
   let i=0;for(let j=1;j<4;j++)if(Math.hypot(r[(j+1)%4][0]-r[j][0],r[(j+1)%4][1]-r[j][1])>Math.hypot(r[(i+1)%4][0]-r[i][0],r[(i+1)%4][1]-r[i][1]))i=j;
   const a=r[i],b1=r[(i+1)%4],c=r[(i+2)%4],d=r[(i+3)%4],expand=p=>[cx+(p[0]-cx)*1.025,h,cz+(p[1]-cz)*1.025],A=expand(a),B=expand(b1),C=expand(c),D=expand(d),P=[(A[0]+D[0])/2,h+b.roofRise,(A[2]+D[2])/2],Q=[(B[0]+C[0])/2,h+b.roofRise,(B[2]+C[2])/2];
   triangles([[A,B,Q],[A,Q,P],[D,P,Q],[D,Q,C]],roof);triangles([[A,P,D],[B,C,Q]],cream);beam(roof,P,Q,.06);
   const length=Math.hypot(B[0]-A[0],B[2]-A[2]);for(let n=0;n<=Math.ceil(length/.65);n++){const t=n/Math.ceil(length/.65),u=A.map((v,j)=>v+(B[j]-v)*t),v=D.map((v,j)=>v+(C[j]-v)*t),peak=P.map((v,j)=>v+(Q[j]-v)*t);beam(roof,u,peak,.018);beam(roof,peak,v,.018);}
   // Restrained solid walls/vents: concealed doors and room layouts are unverified.
   for(const [u,v] of [[A,B],[D,C]]){const len=Math.hypot(v[0]-u[0],v[2]-u[2]),yaw=-Math.atan2(v[2]-u[2],v[0]-u[0]);for(let n=1;n<len/5;n++){const t=n*5/len,o=box(wood,1.0,.35,.10,u[0]+(v[0]-u[0])*t,h-.45,u[2]+(v[2]-u[2])*t);o.rotation.y=yaw;}}
  }
  // Bare service yard between native blocks; keep the mapped access aisle visible.
  for(let x=-.17372;x<-.17269;x+=.00004)for(let lat=5.61807;lat<5.61828;lat+=.00004){const p=[x,lat];if(mahamaRoadClear(p,2.8)){const [xx,zz]=local(p);box(earth,4.4,.025,4.4,xx,.015,zz);}}
 }else{
  const rails=[...MAHAMA_RAILS,MAHAMA_WEST_APPROACH].filter(r=>site.family==='bypass'?r.id===187792807:r.id!==187792807);
  for(const r of rails)for(let i=1;i<r.coordinates.length;i++){
   const a=r.coordinates[i-1],b=r.coordinates[i],length=distanceMetres(a,b),h=bearingTo(a,b)*Math.PI/180;
   if(r.properties.bridge!=='yes'){
    const at=(p,side,y)=>{const [x,z]=local(offsetMetres(p,Math.cos(h)*side,-Math.sin(h)*side));return[x,y,z]};
    const A=at(a,-3,RAIL_DECK_TOP-.25),B=at(b,-3,RAIL_DECK_TOP-.25),C=at(a,3,RAIL_DECK_TOP-.25),D=at(b,3,RAIL_DECK_TOP-.25),E=at(a,-10,.05),F=at(b,-10,.05),G=at(a,10,.05),H=at(b,10,.05);
    const bridgeWest=[-.17612,5.61847],nearWest=Math.min(distanceMetres(a,bridgeWest),distanceMetres(b,bridgeWest))<85;triangles([[E,F,B],[E,B,A],[C,D,H],[C,H,G]],nearWest?masonry:grass);strip(a,b,6,RAIL_DECK_TOP-.2,earth,.2);
   }
   strip(a,b,3.0,RAIL_DECK_TOP+.08,ballast,.2);
   const n=Math.ceil(length/.9);for(let j=0;j<=n;j++){const p=a.map((v,k)=>v+(b[k]-v)*j/n),[x,z]=local(p),o=box(wood,2.1,.12,.20,x,RAIL_DECK_TOP+.22,z);o.rotation.y=-h;}
   for(const side of [-1,1]){const aa=offsetMetres(a,Math.cos(h)*side*RAIL_GAUGE/2,-Math.sin(h)*side*RAIL_GAUGE/2),bb=offsetMetres(b,Math.cos(h)*side*RAIL_GAUGE/2,-Math.sin(h)*side*RAIL_GAUGE/2);strip(aa,bb,.11,RAIL_DECK_TOP+.35,iron,.12);strip(aa,bb,.16,RAIL_DECK_TOP+.275,rust,.06);}
  }
  for(const r of MAHAMA_BRIDGES.filter(r=>r.site===site.id)){
   const a=r.coordinates[0],b=r.coordinates.at(-1),h=bearingTo(a,b)*Math.PI/180;
   strip(a,b,r.depth,(RAIL_DECK_TOP+RAIL_UNDERSIDE)/2,concrete,RAIL_DECK_TOP-RAIL_UNDERSIDE);
   for(const side of [-1,1]){
    const aa=offsetMetres(a,Math.cos(h)*side*(r.depth/2-.15),-Math.sin(h)*side*(r.depth/2-.15)),bb=offsetMetres(b,Math.cos(h)*side*(r.depth/2-.15),-Math.sin(h)*side*(r.depth/2-.15));strip(aa,bb,.25,RAIL_DECK_TOP+.14,edge,.55);
    const A=local(aa),B=local(bb);beam(iron,[A[0],RAIL_DECK_TOP+1.1,A[1]],[B[0],RAIL_DECK_TOP+1.1,B[1]],.045);
    const n=Math.ceil(distanceMetres(a,b)/4);for(let i=0;i<=n;i++){const p=aa.map((v,j)=>v+(bb[j]-v)*i/n),[x,z]=local(p);beam(iron,[x,RAIL_DECK_TOP+.25,z],[x,RAIL_DECK_TOP+1.1,z],.035);}
    // Visible conduits fixed to the deck face, beneath the safety railing.
    for(const y of [RAIL_DECK_TOP-.16,RAIL_DECK_TOP-.32])beam(rust,[A[0],y,A[1]],[B[0],y,B[1]],.025);
   }
   for(const p of [a,b]){const [x,z]=local(p),o=box(concrete,r.depth,RAIL_DECK_TOP,.85,x,RAIL_DECK_TOP/2,z);o.rotation.y=-h;}
   // Narrow underside panel seams run across the bridge without closing the opening.
   const n=Math.ceil(distanceMetres(a,b)/2);for(let i=0;i<n;i++){const p=a.map((v,j)=>v+(b[j]-v)*(i+.5)/n),aa=offsetMetres(p,Math.cos(h)*r.depth/2,-Math.sin(h)*r.depth/2),bb=offsetMetres(p,-Math.cos(h)*r.depth/2,Math.sin(h)*r.depth/2);strip(aa,bb,.025,RAIL_UNDERSIDE-.012,damp);}
  }
  for(const p of MAHAMA_PILLARS.filter(p=>p.site===site.id)){const [x,z]=local(p.position);mesh(new T.CylinderGeometry(p.radius,p.radius,p.height,12),concrete,x,p.height/2,z);box(concrete,p.radius*2+.5,.4,p.radius*2+.5,x,RAIL_UNDERSIDE-.2,z);}
 }
 if(site.family==='bypass'){
  for(const w of BYPASS_WALLS){strip(w.a,w.b,w.width,w.height/2,concrete,w.height);strip(w.a,w.b,w.width+.15,w.height+.07,edge,.14);}
  for(const [id,east] of [[510192633,-4.5],[187792813,4.5]])for(let lat=5.6172;lat<5.62025;lat+=.00004){const a=mahamaRoadPoint(id,lat,east),b=mahamaRoadPoint(id,lat+.00004,east);strip(a,b,1.05,.10,paving,.14);}
  // Two lanes per one-way carriageway; dashed marks remain low contrast as photographed.
  for(const r of MAHAMA_ROADS.filter(r=>r.name==='Airport Bypass'))for(let i=1;i<r.coordinates.length;i++){const a=r.coordinates[i-1],b=r.coordinates[i],len=distanceMetres(a,b);for(let d=0;d<len;d+=12){const t=d/len,u=Math.min(1,(d+4)/len),aa=a.map((v,j)=>v+(b[j]-v)*t),bb=a.map((v,j)=>v+(b[j]-v)*u);if(aa[1]<5.6172||aa[1]>5.6203)continue;strip(aa,bb,.10,.065,paint);}}
  // Piers share the narrow centre island; no support is placed in a traffic lane.
  const centre=[-.172030925,5.618674],[x,z]=local(centre);box(concrete,1.15,.55,14,x,.275,z);
  const p=local([-.172030925,5.618612]);if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d');ctx.clearRect(0,0,256,256);ctx.fillStyle='#f3eddb';ctx.beginPath();ctx.arc(128,128,115,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#a93830';ctx.lineWidth=18;ctx.stroke();ctx.fillStyle='#26322c';ctx.font='bold 105px sans-serif';ctx.textAlign='center';ctx.fillText('5 m',128,163);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const sign=mesh(new T.PlaneGeometry(.9,.9),new T.MeshStandardMaterial({map,transparent:true,side:T.DoubleSide}),p[0],RAIL_DECK_TOP-.1,p[1]);sign.rotation.y=0;}
 }
 group.userData.mahama={site:site.id,sourceIds:site.sourceIds,railGauge:RAIL_GAUGE,clearance:5,dimensionsEstimated:true,privateInteriors:false};k.finish();return {group};
}
