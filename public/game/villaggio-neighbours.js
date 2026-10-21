import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {NEIGHBOUR_MASSES,NEIGHBOUR_PROPS,PRIMAVERA_POOL,REGENT_ROOF_DETAILS,neighbourLocal} from './villaggio-neighbours-data.js';

let roofTile;
function roofTexture(){
 if(roofTile)return roofTile;const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const row=Math.floor(y/16),sx=(x+(row%2)*8)%16,sy=y%16,v=sy<2?105:sx<1?155:205+Math.round(Math.sin(sx*.3)*20+Math.cos(sy*.2)*7),i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=v;data[i+3]=255;}
 roofTile=new T.DataTexture(data,size,size,T.RGBAFormat);roofTile.wrapS=roofTile.wrapT=T.RepeatWrapping;roofTile.magFilter=T.LinearFilter;roofTile.minFilter=T.LinearMipmapLinearFilter;roofTile.generateMipmaps=true;roofTile.needsUpdate=true;roofTile.userData.shared=true;return roofTile;
}
// Authored geometry from the reference register. No remote imagery in gameplay.
export function createVillaggioNeighbour(site){
 const group=new T.Group();group.name=site.name;
 const material=(color,kind='plaster',roughness=.8,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),kind);
 const cream=material('#e3d9bb'),brown=material('#725447'),peach=material('#bd896d'),ivory=material('#eee4d1'),roof=material('#655a50','roof'),dark=material('#293437'),glass=material('#536d73','glass',.22,.5),metal=material('#333c3d','metal',.4,.6),wood=material('#725740','wood'),paving=material('#a6a59b','paving'),leaf=material('#49623c','foliage'),soil=material('#83745c','soil');
 roof.map=roofTexture();roof.bumpMap=roof.map;roof.bumpScale=.035;
 const glow=new T.MeshStandardMaterial({color:'#d9b879',emissive:'#d9a453',emissiveIntensity:.24,roughness:.4});
 const add=(geo,mat,x=0,y=0,z=0,parent=group)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;};
 const box=(mat,w,h,d,x,y,z,parent=group)=>add(new T.BoxGeometry(w,h,d),mat,x,y,z,parent);
 const solid=(ring,height,mat,y=0,scale=1)=>{
  const pts=ring.slice(0,-1),cx=pts.reduce((s,p)=>s+p[0],0)/pts.length,cz=pts.reduce((s,p)=>s+p[1],0)/pts.length;
  const shape=new T.Shape(pts.map(([x,z])=>new T.Vector2(cx+(x-cx)*scale,-cz-(z-cz)*scale)));
  const geo=new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false,steps:1});geo.rotateX(-Math.PI/2);return add(geo,mat,0,y,0);
 };
 const hipRoof=(pts,y)=>{
  const unique=pts.slice(0,-1),area=unique.reduce((sum,p,i)=>sum+p[0]*unique[(i+1)%unique.length][1]-unique[(i+1)%unique.length][0]*p[1],0),sign=area>0?1:-1;
  // Inset each roof edge to form real sloping faces without bridging the
  // concave source footprint. The central flat crown is an interpretation.
  const inner=unique.map((p,i)=>{const prev=unique[(i+unique.length-1)%unique.length],next=unique[(i+1)%unique.length],a=new T.Vector2(p[0]-prev[0],p[1]-prev[1]).normalize(),b=new T.Vector2(next[0]-p[0],next[1]-p[1]).normalize(),n1=new T.Vector2(-a.y,a.x).multiplyScalar(sign),n2=new T.Vector2(-b.y,b.x).multiplyScalar(sign),n=n1.clone().add(n2),factor=Math.min(3.5,2/Math.max(.4,n.dot(n1)));return [p[0]+n.x*factor,p[1]+n.y*factor];});
  const contour=inner.map(p=>new T.Vector2(...p)),tri=T.ShapeUtils.triangulateShape(contour,[]),positions=[],uv=[];
  const vertex=(p,h)=>{positions.push(p[0],h,p[1]);uv.push(p[0]/3,p[1]/3);};
  for(let i=0;i<unique.length;i++){const j=(i+1)%unique.length;for(const [p,h] of [[unique[i],y+.1],[inner[j],y+2],[unique[j],y+.1],[unique[i],y+.1],[inner[i],y+2],[inner[j],y+2]])vertex(p,h);}
  for(const t of tri)for(const i of t)vertex(inner[i],y+2);
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();add(geo,roof);
 };
 const arch=(parent,w,h,mat,z=0,thickness=.16)=>{
  const r=w/2,shape=new T.Shape();shape.moveTo(-r,0);shape.lineTo(r,0);shape.lineTo(r,h-r);shape.absarc(0,h-r,r,0,Math.PI,false);shape.lineTo(-r,0);
  const geo=new T.ExtrudeGeometry(shape,{depth:thickness,bevelEnabled:false});return add(geo,mat,0,0,z,parent);
 };
 const hip=(w,d,h,x,y,z)=>{
  const verts=[[-w/2,0,-d/2],[w/2,0,-d/2],[w/2,0,d/2],[-w/2,0,d/2],[0,h,-d/2+Math.min(w,d)*.35],[0,h,d/2-Math.min(w,d)*.35]],faces=[[0,4,1],[1,4,5],[1,5,2],[2,5,3],[3,5,4],[3,4,0]],a=[],uv=[];
  for(const f of faces)for(const i of f){a.push(...verts[i]);uv.push(verts[i][0]/3,verts[i][2]/3);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(a,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();return add(geo,roof,x,y,z);
 };
 let bays=0;
 for(const b of NEIGHBOUR_MASSES.filter(b=>b.siteId===site.id)){
  const pts=b.rings[0].map(p=>neighbourLocal(site,p)),floors=b.family==='santoku'?1:Math.round(b.height/3.2),fh=b.height/floors,skin=b.family==='regent'?cream:b.family==='santoku'?dark:cream;
  solid(pts,b.height,skin,0,b.family==='primavera'?.965:1);
  if(b.family==='primavera')for(let f=0;f<=floors;f++)solid(pts,.15,brown,f*fh);
  else solid(pts,.2,ivory,b.height);
  const area=pts.slice(0,-1).reduce((sum,p,i)=>sum+p[0]*pts[i+1][1]-pts[i+1][0]*p[1],0),outward=area>0?1:-1;
  for(let e=0;e<pts.length-1;e++){
   const a=pts[e],c=pts[e+1],len=Math.hypot(c[0]-a[0],c[1]-a[1]);if(len<3.6)continue;
   const ux=(c[0]-a[0])/len,uz=(c[1]-a[1])/len,nx=uz*outward,nz=-ux*outward,n=Math.max(1,Math.floor(len/(b.family==='santoku'?4:3.6))),cw=len/n;
   const face=new T.Group();face.position.set((a[0]+c[0])/2,0,(a[1]+c[1])/2);face.rotation.y=Math.atan2(nx,nz);group.add(face);
   for(let f=0;f<floors;f++)for(let j=0;j<n;j++){
    const x=(j+.5)*cw-len/2,y=f*fh;
    if(b.family==='regent'){
     box(b.part===1?cream:j%3===0?peach:cream,cw-.08,fh,.08,x,y+fh/2,.06,face);
     const ap=new T.Group();ap.position.set(x,y+.7,.12);face.add(ap);
     if(b.part===1){box(ivory,Math.min(2.5,cw-.3),1.1,.13,x,y+1.95,.18,face);box(glass,Math.min(2.3,cw-.5),.92,.07,x,y+1.95,.28,face);box(cream,.05,.95,.08,x,y+1.95,.33,face);}
     else if(b.height<8){box(peach,cw-.08,.65,.18,x,y+.33,.15,face);box(ivory,cw-.12,2.15,.18,x,y+1.82,.17,face);box(glass,cw-.45,1.9,.05,x,y+1.82,.3,face);box(ivory,.07,1.96,.06,x,y+1.82,.34,face);}
     else if(j%3===0){arch(ap,1.32,2.15,ivory);arch(ap,1.08,1.97,dark,.18);box(glass,.9,1.25,.04,0,.8,.37,ap);}
     else{box(ivory,1.55,1.5,.22,x,y+1.7,.18,face);box(glass,1.34,1.3,.05,x,y+1.7,.31,face);box(ivory,.05,1.35,.05,x,y+1.7,.35,face);}
     if(f===1&&j%2===0)box(ivory,1.35,.35,.55,x,y+.5,.4,face);
    }else if(b.family==='primavera'){
     const balcony=j%3===1&&len>12;
     box(balcony||f===0?brown:cream,cw-.12,fh-.2,.12,x,y+fh/2,-.3,face);
     box(dark,balcony?cw-.55:1.65,2.15,.08,x,y+1.55,-.17,face);
     box(glass,balcony?cw-.7:1.45,1.9,.045,x,y+1.55,-.1,face);
     box(ivory,.065,1.95,.08,x,y+1.55,-.04,face);
     if(balcony){
      box(ivory,cw-.1,.13,.95,x,y+.18,.23,face);
      for(const side of [-1,1])box(cream,.22,fh,.95,x+side*(cw/2-.13),y+fh/2,.23,face);
      box(metal,cw-.35,.065,.08,x,y+1.15,.7,face);
      for(let k=0;k<6;k++)box(metal,.035,.88,.04,x+(k/5-.5)*(cw-.4),y+.69,.7,face);
     }else{box(cream,cw-.08,.5,.2,x,y+.25,.05,face);box(cream,cw-.08,.55,.2,x,y+fh-.35,.05,face);}
    }else{
     box(glass,cw-.2,3.6,.08,x,2.1,.1,face);box(wood,.16,4.6,.2,x-cw/2,2.3,.2,face);
     if(e%2===0)for(let k=0;k<5;k++)box(wood,.06,3.4,.12,x+(k-2)*.25,2.1,.3,face);
    }
    bays++;
   }
  }
  if(b.family==='primavera'){
   hipRoof(pts,b.height);
   const a=pts[0],c=pts[1],length=Math.hypot(c[0]-a[0],c[1]-a[1]),count=Math.max(1,Math.floor(length/17));
   for(let i=0;i<count;i++){const u=(i+.5)/count,x=a[0]+(c[0]-a[0])*u,z=a[1]+(c[1]-a[1])*u,top=new T.Group();top.position.set(x,b.height-.1,z);top.rotation.y=Math.atan2(c[0]-a[0],c[1]-a[1]);group.add(top);box(brown,7,2.1,6,0,.8,0,top);box(glass,4.5,1.3,.1,0,.85,3.05,top);const h=hip(8,7,1.3,0,2,0);group.remove(h);top.add(h);}
  }
 }
 // Explicitly local ground patches avoid repainting roads or a whole district.
 const seat=(x,z)=>{box(wood,2.2,.12,.7,x,.46,z);box(wood,2.2,.55,.12,x,.8,z-.3);for(const dx of [-.85,.85])box(metal,.12,.42,.5,x+dx,.21,z);};
 const palm=(x,z,height=5)=>{
  add(new T.CylinderGeometry(.14,.23,height,7),wood,x,height/2,z);
  for(let i=0;i<7;i++){const g=new T.Group();g.position.set(x,height,z);g.rotation.y=i*Math.PI*2/7;group.add(g);const m=add(new T.SphereGeometry(1,6,4),leaf,0,-.2,1.4,g);m.scale.set(.35,.18,2);m.rotation.x=.23;}
 };
 for(const p of NEIGHBOUR_PROPS[site.id]){if(p.kind==='seat')seat(p.x,p.z);else{box(paving,p.w,.5,p.d,p.x,.25,p.z);box(soil,p.w-.1,.05,p.d-.1,p.x,.52,p.z);palm(p.x,p.z,3.4);}}
 const [ax,az]=neighbourLocal(site,site.arrival);
 box(paving,site.family==='primavera'?22:7,.035,3,ax+(site.family==='primavera'?3:-4),.025,az);
 if(site.family==='santoku'){
  box(paving,6,.045,15,-13,.025,8);
  for(const x of [-16,-10])for(const z of [0,16])box(wood,.14,3,.14,x,1.5,z);
  for(let z=0;z<=16;z+=.65)box(wood,6,.12,.16,-13,3.1,z);
  for(const z of [5,11]){box(wood,1.15,.08,.65,-13,.7,z);box(glow,.12,.2,.12,-13,.85,z);}
 }else if(site.family==='regent'){
  // Recognizable entrance arch from July 2024 Street View; open vehicle clearance.
  const gate=new T.Group();gate.position.set(-31,0,-39);gate.rotation.y=-.55;group.add(gate);
  for(const side of [-1,1])box(peach,.7,4.4,.7,side*4.8,2.2,0,gate);
  const curve=new T.EllipseCurve(0,2.7,4.8,4.6,0,Math.PI,false,0),ps=curve.getPoints(24);
  for(let i=1;i<ps.length;i++){const a=ps[i-1],b=ps[i],m=box(peach,.65,a.distanceTo(b)+.15,.65,(a.x+b.x)/2,(a.y+b.y)/2,0,gate);m.rotation.z=-Math.atan2(b.x-a.x,b.y-a.y);}
  for(let i=0;i<3;i++)box(metal,.07,7,.07,-20+i*2,3.5,-39);
  box(paving,22,.055,35,-38,.03,12.5);const water=new T.MeshPhysicalMaterial({color:'#3b9bba',roughness:.2,metalness:.18,clearcoat:.6});box(ivory,16.8,.12,20.8,-38,.1,7);box(water,15.6,.05,19.6,-38,.18,7);
  add(new T.CylinderGeometry(3.6,3.6,.18,32),ivory,-38,.1,21);add(new T.CylinderGeometry(3.25,3.25,.05,32),water,-38,.2,21);
  for(const z of [-6,0,6,12,18,24]){box(wood,1.7,.18,.65,-48,.4,z);box(ivory,1.7,.08,.65,-48,.53,z);}
  for(const z of [-25,-12,29])palm(-46,z,6);
  box(ivory,.4,2.2,56,-50,1.1,-1);
  for(let z=-27;z<=27;z+=6){box(ivory,.8,2.6,.8,-50,1.3,z);box(ivory,1,.14,1,-50,2.7,z);}
  for(const {x,z,w,d,base,height} of REGENT_ROOF_DETAILS){box(cream,w,height,d,x,base+height/2,z);for(const dx of [-.8,.8])box(dark,.18,1.4,.1,x+dx,base+1.5,z+d/2+.04);}
 }else{
  for(const [x,z] of [[-25,2],[-9,9],[13,5]])palm(x,z,5);
  box(paving,51,.035,30,-7,.025,-2);
  const water=material('#449db0','water',.18,.15),pool=new T.Shape(PRIMAVERA_POOL.map(([x,z])=>new T.Vector2(x,-z)));
  const poolGeometry=new T.ShapeGeometry(pool,32);poolGeometry.rotateX(-Math.PI/2);add(poolGeometry,water,0,.1,0);
  for(const x of [-23,-18,-13]){box(wood,1.5,.22,.65,x,.3,11);box(ivory,1.5,.08,.65,x,.45,11);}
 }
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160;const c=canvas.getContext('2d');c.fillStyle=site.family==='regent'?'#eee4d1':'#293437';c.fillRect(0,0,1024,160);c.fillStyle=site.family==='regent'?'#704a33':'#eee4d1';c.font='bold 60px sans-serif';c.textAlign='center';c.fillText(site.name.toUpperCase(),512,100);const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const sign=add(new T.PlaneGeometry(1.8,.3),new T.MeshStandardMaterial({map:texture,roughness:.8}),ax-3,1.1,az-3);sign.rotation.y=Math.PI;
 }
 group.userData.neighbours={siteId:site.id,sourceIds:site.sourceIds,bays,dimensions:'mapped-footprints-photo-estimated-heights',privateInteriors:false};
 enhanceMaterials(group);batchStaticMeshes(group);return {group,update(){}};
}
