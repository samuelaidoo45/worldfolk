import * as T from './three.module.js';
import {oakKit} from './oak-plaza-model.js';
import {tagSurface,surfaceTexture} from './graphics-materials.js';
import {AREA_MASSES,AREA_LAND,AREA_TREES,COURT_POOL,areaLocal} from './mahama-neighbourhood-data.js';
const roofTextures=new Map();
function roofTexture(kind){
 if(roofTextures.has(kind))return roofTextures.get(kind);const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const row=Math.floor(y/21),u=(x+(row%2)*12)%25,v=y%21,noise=(Math.sin(x*127.1+y*311.7)*43758.5453)%1;const tone=kind==='roof-tile'?(v<2||u<1?145:222+Math.sin(u/25*Math.PI)*18+noise*9):(218+Math.cos(x/128*Math.PI*16)*12+(y%43<2?-8:0)+noise*6);const i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=Math.max(0,Math.min(255,tone));data[i+3]=255;}
 const t=new T.DataTexture(data,size,size);t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=4;t.needsUpdate=true;t.userData.shared=true;roofTextures.set(kind,t);return t;
}
// Original meshes/textures, authored from native plates and reviewed roof context.
// Reference screenshots remain documentation only. No downloaded map pixels.
export function createMahamaNeighbourhood(site,options={}){
 const masses=options.masses??AREA_MASSES;
 const group=new T.Group();group.name=site.name;const k=oakKit(group),{mesh,box,beam,poly}=k,local=p=>areaLocal(site,p),cache=new Map();
 const wallPalette=['#c4b798','#d4c7b4','#b9b09a','#aaa18d','#c7c2af'],roofPalette=['#795b49','#885a4c','#8d6e5b','#967364','#9d9180','#a9aaa0','#898d84'];
 function material(c,kind='plaster'){const palette=kind==='plaster'?wallPalette:kind.startsWith('roof')?roofPalette:null;if(palette){const color=new T.Color(c);c=palette.reduce((a,b)=>{const d=x=>{const v=new T.Color(x);return (v.r-color.r)**2+(v.g-color.g)**2+(v.b-color.b)**2;};return d(a)<d(b)?a:b;});}const key=kind+c;if(cache.has(key))return cache.get(key);const m=tagSurface(new T.MeshStandardMaterial({color:c,roughness:kind==='glass'?.3:.92,metalness:kind==='glass'?.22:kind==='metal'?.15:0,side:T.DoubleSide}),kind.startsWith('roof')?'stone':kind);if(kind.startsWith('roof')){m.map=m.bumpMap=roofTexture(kind);m.bumpScale=kind==='roof-tile'?.035:.018;}cache.set(key,m);return m;}
 const concrete=material('#9d9786','stone'),shade=material('#30362f','paint'),trim=material('#c5bfab'),iron=material('#555c57','metal'),glass=material('#506a6b','glass'),ground=material('#7d8260','grass'),paving=material('#a8a396','paving'),leaf=material('#556540','foliage'),leafLight=material('#6b7648','foliage'),wood=material('#75614b','wood'),water=material('#427a83','water');ground.map=surfaceTexture('grass');
 function shape(rings){const s=new T.Shape(rings[0].slice(0,-1).map(([x,z])=>new T.Vector2(x,-z)));for(const ring of rings.slice(1))s.holes.push(new T.Path(ring.slice(0,-1).map(([x,z])=>new T.Vector2(x,-z))));return s;}
 function plate(rings,ma,h=0,y=0){const s=shape(rings),geo=h?new T.ExtrudeGeometry(s,{depth:h,bevelEnabled:false,steps:1}):new T.ShapeGeometry(s);geo.rotateX(-Math.PI/2);return mesh(geo,ma,0,y,0);}
 function surface(tris,ma){const pos=[],uv=[];for(const tri of tris){const a=new T.Vector3(...tri[0]),u=new T.Vector3(...tri[1]).sub(a).normalize(),v=new T.Vector3().crossVectors(new T.Vector3().crossVectors(u,new T.Vector3(...tri[2]).sub(a)).normalize(),u);for(const p of tri){const q=new T.Vector3(...p).sub(a);pos.push(...p);uv.push(p[0]/2.5,p[2]/2.5);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();return mesh(geo,ma);}
 const segDist=(p,a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dz)/(dx*dx+dz*dz||1)));return Math.hypot(p[0]-a[0]-dx*t,p[1]-a[1]-dz*t);};
 function roof(b,rings,ma){
  const pts=rings.flatMap(r=>r.slice(0,-1)),geo=new T.ShapeGeometry(shape(rings)),p=geo.attributes.position,index=geo.index.array;let triangles=[];for(let i=0;i<index.length;i+=3)triangles.push(Array.from(index.slice(i,i+3),j=>[p.getX(j),-p.getY(j)]));geo.dispose();
  for(let depth=0;depth<(options.roofSubdivisions??3);depth++){const refined=[],mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];for(const [a,b,c] of triangles){const ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);refined.push([a,ab,ca],[ab,b,bc],[ca,bc,c],[ab,bc,ca]);}triangles=refined;}
  const minX=Math.min(...pts.map(p=>p[0])),maxX=Math.max(...pts.map(p=>p[0])),minZ=Math.min(...pts.map(p=>p[1])),maxZ=Math.max(...pts.map(p=>p[1]));
  const height=p=>b.roof==='mono'?(p[0]-minX)/(maxX-minX||1):b.roof==='gable'?Math.max(0,1-Math.abs((maxX-minX<maxZ-minZ?(p[0]-minX)/(maxX-minX):(p[1]-minZ)/(maxZ-minZ))*2-1)):Math.min(...rings.flatMap(r=>r.slice(1).map((q,i)=>segDist(p,r[i],q))));
  const max=Math.max(.001,...triangles.flat().map(height));surface(triangles.map(t=>t.map(p=>[p[0],b.wallHeight+.10+b.roofRise*height(p)/max,p[1]])),ma);
  // An eave fascia follows each contour, including the courtyard's inner edge.
  for(const r of rings)for(let i=1;i<r.length;i++){const a=r[i-1],q=r[i];beam(ma,[a[0],b.wallHeight+.09,a[1]],[q[0],b.wallHeight+.09,q[1]],.07);}
 }
 function faces(rings,fn){for(let ri=0;ri<rings.length;ri++){const r=rings[ri],area=r.slice(1).reduce((s,b,i)=>s+r[i][0]*b[1]-b[0]*r[i][1],0),normal=(area>0?1:-1)*(ri? -1:1);for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<(options.minFaceLength??2.5))continue;const ux=dx/len,uz=dz/len,nx=uz*normal,nz=-ux*normal,yaw=-Math.atan2(uz,ux);fn({len,yaw,at:(u,y,out=.10)=>[(a[0]+b[0])/2+ux*u+nx*out,y,(a[1]+b[1])/2+uz*u+nz*out],part:(ma,w,h,d,u,y,out=.1)=>{const o=box(ma,w,h,d,...[(a[0]+b[0])/2+ux*u+nx*out,y,(a[1]+b[1])/2+uz*u+nz*out]);o.rotation.y=yaw;return o;}});}}}
 const arch=(f,u,y,w=1.6,h=2.35)=>{const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.closePath();const o=mesh(new T.ShapeGeometry(s,12),shade,...f.at(u,y,.09));o.rotation.y=f.yaw;};
 const helpers={material,plate,roof,faces,surface,arch,local,shade,trim,iron,glass,concrete};
 for(const b of masses.filter(b=>b.zone===site.zone)){
  const rings=b.rings.map(r=>r.map(local));
  if(options.renderMass?.(b,rings,k,helpers))continue;
  const wall=material(b.wallColor),roofMat=material(b.roofColor,b.zone==='court'||b.roof==='courtyard'||b.id===2266652078?'roof-tile':'roof-metal');
  if(b.roof==='frame'){
   const r=rings[0],a=r[0],B=r[1],D=r[3],at=(u,v,y)=>[a[0]+(B[0]-a[0])*u+(D[0]-a[0])*v,y,a[1]+(B[1]-a[1])*u+(D[1]-a[1])*v];
   for(let i=0;i<=5;i++)for(let j=0;j<=4;j++)box(concrete,.38,b.wallHeight,.38,...at(i/5,j/4,b.wallHeight/2));
   for(const y of [3.6,7.2]){for(let i=0;i<=5;i++)beam(concrete,at(i/5,0,y),at(i/5,1,y),.15);for(let j=0;j<=4;j++)beam(concrete,at(0,j/4,y),at(1,j/4,y),.15);}
   // Closed construction boundary matches the non-enterable collider.
   for(let i=1;i<r.length;i++){const a=r[i-1],q=r[i];beam(iron,[a[0],1.5,a[1]],[q[0],1.5,q[1]],.025);const n=Math.ceil(Math.hypot(q[0]-a[0],q[1]-a[1])/2);for(let j=0;j<=n;j++){const x=a[0]+(q[0]-a[0])*j/n,z=a[1]+(q[1]-a[1])*j/n;beam(iron,[x,0,z],[x,1.65,z],.025);}}
   continue;
  }
  plate(rings,wall,b.wallHeight);roof(b,rings,roofMat);
  faces(rings,f=>{
   f.part(concrete,f.len,.22,.1,0,.13,.025);
   if(b.roof==='courtyard'){
    // Repeated cream arches below the brown hipped roof are visible in 2024.
    const bays=Math.max(1,Math.floor(f.len/4.4));for(let floor=0;floor<2;floor++){for(let j=0;j<bays;j++)arch(f,(j+.5)*f.len/bays-f.len/2,.55+floor*3.2);f.part(trim,f.len,.17,.24,0,3.25+floor*3.2,.12);}
   }else if(b.zone==='court'){
    const bays=Math.max(1,Math.floor(f.len/5.5));for(let floor=0;floor<2;floor++)for(let j=0;j<bays;j++){const u=(j+.5)*f.len/bays-f.len/2,y=1.7+floor*3.1;f.part(trim,1.5,1.65,.14,u,y,.1);f.part(glass,1.32,1.45,.08,u,y,.20);f.part(trim,.05,1.45,.1,u,y,.26);if(f.len>20){f.part(concrete,2.2,.16,.6,u,y-.8,.27);f.part(iron,2.05,.06,.06,u,y-.25,.54);for(const dx of [-.98,.98])f.part(iron,.04,.6,.05,u+dx,y-.52,.54);}}
   }else{
    // Restrained service-room openings; concealed room plans are unverified.
    const bays=Math.floor(f.len/5.8);for(let j=0;j<bays;j++){const u=(j+.5)*f.len/bays-f.len/2;f.part(shade,Math.min(1.3,f.len*.28),.50,.08,u,b.wallHeight-.65,.07);f.part(trim,.055,.50,.07,u,b.wallHeight-.65,.12);}
   }
  });
 }
 if(options.baseGround!==false&&site.zone==='north'){
  for(const f of AREA_LAND.filter(f=>f.properties.class==='wood'))plate(f.geometry.coordinates.map(r=>r.map(local)),ground,0,.016);
  for(const [i,t] of AREA_TREES.entries()){const [x,z]=local(t.position);mesh(new T.CylinderGeometry(.12,.2,t.height,6),wood,x,t.height/2,z);for(let j=0;j<4;j++){const a=j*2.1+i*.7,o=mesh(new T.IcosahedronGeometry(1,1),j===1?leafLight:leaf,x+Math.cos(a)*t.radius*.42,t.height-.5+j*.24,z+Math.sin(a)*t.radius*.42);o.scale.set(t.radius*(.8+j*.06),t.radius*.64,t.radius*.85);o.rotation.set(i*.31,j*.83,i*.12);}const shrub=mesh(new T.IcosahedronGeometry(1,1),leafLight,x+1.5,.6,z-2);shrub.scale.set(t.radius*.8,.9,t.radius*.65);}
  // Central courtyard planting remains beneath the OPEN roof hole.
  const courtyard=AREA_MASSES.find(b=>b.id===20332079),hole=courtyard.rings[1];plate([hole.map(local)],ground,0,.025);const ps=hole.slice(0,-1),cx=ps.reduce((s,p)=>s+p[0],0)/ps.length,cy=ps.reduce((s,p)=>s+p[1],0)/ps.length;for(const dx of [-5,5]){const [x,z]=local([cx+dx/110785,cy]);k.palm(x,z,7.5);}
 }else if(options.baseGround!==false&&site.zone==='court'){
  const parcel=AREA_LAND.find(f=>f.id===555584954);plate(parcel.geometry.coordinates.map(r=>r.map(local)),paving,0,.018);
  const [x,z]=local(COURT_POOL.position);const surround=mesh(new T.CylinderGeometry(4.4,4.4,.12,24),trim,x,.09,z);surround.scale.z=.85;const pool=mesh(new T.CircleGeometry(COURT_POOL.radius,24),water,x,.16,z);pool.rotation.x=-Math.PI/2;pool.scale.y=.85;
  // Painted tennis court beside the observed pool; dimensions are estimates.
  box(material('#647a6d','paint'),13,.025,25,...(()=>{const [x,z]=local([-.174525,5.61662]);return[x,.04,z];})());
  const [tx,tz]=local([-.174525,5.61662]);for(const dx of [-5.4,5.4])box(trim,.06,.025,23,tx+dx,.06,tz);for(const dz of [-11.5,0,11.5])box(trim,10.8,.025,.06,tx,.06,tz+dz);
 }
 group.userData.mahamaArea={site:site.id,sourceIds:site.sourceIds,referenceOnly:masses.filter(b=>b.zone===site.zone&&typeof b.id==='string').map(b=>b.id),estimatedDimensions:true,privateInteriors:false};options.decorate?.(k,helpers);k.finish();return {group};
}
