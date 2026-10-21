import * as T from './three.module.js';
import {INTERCHANGE_PROFILES,INTERCHANGE_SUPPORTS,INTERCHANGE_WALLS,INTERCHANGE_BARRIERS,interchangeLocal,INTERCHANGE_ARRIVAL} from './interchange-data.js';
import {INTERCHANGE_GREEN} from './interchange-map.js';
import {distanceMetres,bearingTo,offsetMetres} from './motion.js';
import {tagSurface} from './graphics-materials.js';import {batchStaticMeshes} from './render-utils.js';
export function createInterchange(){
 const group=new T.Group();group.name='Tetteh Quarshie · mapped bridges and ramps';
 const material=(color,kind='stone',extra={})=>tagSurface(new T.MeshStandardMaterial({color,roughness:.9,...extra}),kind);
 const asphalt=material('#343a3d','paint'),concrete=material('#a5a89f'),edge=material('#c3c6bb'),rail=material('#7e8988','metal',{metalness:.55,roughness:.5}),paint=material('#eee6cd'),blue=material('#7b9caa'),soil=material('#958971','earth'),grass=material('#879769','grass'),dark=material('#323e42');
 asphalt.polygonOffset=true;asphalt.polygonOffsetFactor=-1;asphalt.polygonOffsetUnits=-2;paint.polygonOffset=true;paint.polygonOffsetFactor=-2;paint.polygonOffsetUnits=-4;
 const mesh=(geo,mat,x=0,y=0,z=0)=>{const o=new T.Mesh(geo,mat);o.position.set(x,y,z);o.castShadow=y>1;o.receiveShadow=true;group.add(o);return o;};
 const box=(mat,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),mat,x,y,z);
 function strip(a,b,width,ya,yb,mat,side=0,depth=0){const rad=bearingTo(a,b)*Math.PI/180,pa=offsetMetres(a,Math.cos(rad)*side,-Math.sin(rad)*side),pb=offsetMetres(b,Math.cos(rad)*side,-Math.sin(rad)*side),aa=interchangeLocal(pa),bb=interchangeLocal(pb),dx=bb[0]-aa[0],dz=bb[1]-aa[1],length=Math.hypot(dx,dz, yb-ya);if(length<.01)return;const o=box(mat,width,depth||.025,length,(aa[0]+bb[0])/2,(ya+yb)/2,(aa[1]+bb[1])/2);o.rotation.order='YXZ';o.rotation.y=-Math.atan2(dx,-dz);o.rotation.x=Math.atan2(yb-ya,Math.hypot(dx,dz));return o;}
 for(const f of INTERCHANGE_GREEN){const ring=f.geometry.coordinates[0],shape=new T.Shape(ring.map(p=>{const[x,z]=interchangeLocal(p);return new T.Vector2(x,-z)})),o=mesh(new T.ShapeGeometry(shape),grass,0,.07,0);o.rotation.x=-Math.PI/2;o.castShadow=false;}
 let roadPieces=0;
 for(const r of INTERCHANGE_PROFILES)for(const s of r.segments){const count=Math.ceil(s.length/6);for(let i=0;i<count;i++){
  const a=s.a.map((v,j)=>v+(s.b[j]-v)*i/count),b=s.a.map((v,j)=>v+(s.b[j]-v)*(i+1)/count),m=a.map((v,j)=>(v+b[j])/2),[x,z]=interchangeLocal(m);if(Math.abs(x)>520||Math.abs(z)>440||m[1]<5.6219)continue;
  const ya=r.height(a,s.start+(s.end-s.start)*i/count),yb=r.height(b,s.start+(s.end-s.start)*(i+1)/count);roadPieces++;
  strip(a,b,r.width+1,ya-.35,yb-.35,concrete,0,.7);strip(a,b,r.width,ya+.13,yb+.13,asphalt);
  for(const side of [-1,1]){strip(a,b,.14,ya+.16,yb+.16,paint,side*(r.width/2-.5));if(r.class==='motorway'&&i%2===0)strip(a,b,.13,ya+.16,yb+.16,paint,side*r.width/6);}
  if(r.structure==='bridge'){
   for(let side=-6;side<=6;side+=2.4)strip(a,b,.42,ya-.82,yb-.82,concrete,side,1.1);
  }else if(Math.min(ya,yb)>1.3){
   // Solid approach banks close the floating gap beneath the ramp edges.
   const rad=bearingTo(a,b)*Math.PI/180;for(const side of [-1,1]){const points=[offsetMetres(a,Math.cos(rad)*side*(r.width/2+.4),-Math.sin(rad)*side*(r.width/2+.4)),offsetMetres(b,Math.cos(rad)*side*(r.width/2+.4),-Math.sin(rad)*side*(r.width/2+.4)),offsetMetres(b,Math.cos(rad)*side*(r.width/2+3),-Math.sin(rad)*side*(r.width/2+3)),offsetMetres(a,Math.cos(rad)*side*(r.width/2+3),-Math.sin(rad)*side*(r.width/2+3))],heights=[ya-.5,yb-.5,.05,.05],vertices=points.flatMap((p,j)=>{const[x,z]=interchangeLocal(p);return[x,heights[j],z]}),geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute([0,0,1,0,1,1,0,1],2));geo.setIndex([0,1,2,0,2,3]);geo.computeVertexNormals();const mat=side===1?grass:soil;const o=mesh(geo,mat);o.material.side=T.DoubleSide;}
  }
 }}
 for(const s of INTERCHANGE_SUPPORTS){const[x,z]=interchangeLocal(s.position),p=box(blue,s.d,s.top,s.w,x,s.top/2,z);p.rotation.y=-s.heading*Math.PI/180;const cap=box(concrete,s.d+.6,.5,s.w+1.1,x,s.top-.1,z);cap.rotation.y=p.rotation.y;
  for(let side=-6;side<=6;side+=2){const a=s.heading*Math.PI/180,xx=x+Math.cos(a)*side,zz=z-Math.sin(a)*side;const seam=box(concrete,.04,s.top-.5,.08,xx,s.top/2,zz);seam.rotation.y=p.rotation.y;}
 }
 for(const s of INTERCHANGE_WALLS){const[x,z]=interchangeLocal(s.position),o=box(blue,.5,s.height,s.length,x,s.height/2,z);o.rotation.y=-s.heading*Math.PI/180;const cap=box(edge,.62,.16,s.length,x,s.height+.08,z);cap.rotation.y=o.rotation.y;}
 for(const s of INTERCHANGE_BARRIERS){const[x,z]=interchangeLocal(s.position),o=box(edge,.36,.65,s.length,x,s.y+.42,z);o.rotation.y=-s.heading*Math.PI/180;const top=box(rail,.1,.1,s.length,x,s.y+1.05,z);top.rotation.y=o.rotation.y;}
 // Original green route boards. Destinations reflect the mapped connections;
 // typography and exact installed sign locations remain interpreted.
 function sign(text,p,heading){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext('2d');if(!ctx)return;ctx.fillStyle='#246347';ctx.fillRect(0,0,768,256);ctx.strokeStyle='#f4f1df';ctx.lineWidth=8;ctx.strokeRect(9,9,750,238);ctx.fillStyle='#fffbed';ctx.textAlign='center';ctx.font='bold 64px sans-serif';text.split('|').forEach((line,i)=>ctx.fillText(line,384,94+i*80,710));const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const[x,z]=interchangeLocal(p),o=mesh(new T.PlaneGeometry(6,2),new T.MeshStandardMaterial({map:tex,roughness:.8,side:T.DoubleSide}),x,4,z);o.rotation.y=-heading*Math.PI/180;for(const dx of [-2,2])box(rail,.1,4,.1,x+Math.cos(heading*Math.PI/180)*dx,2,z-Math.sin(heading*Math.PI/180)*dx);}
 sign('N4 · MADINA ↑|N1 · TEMA ↗',[-.17613,5.62253],0);sign('N1 · LAPAZ ↑|AIRPORT ↙',[-.17679,5.6241],180);
 // Low roadside verge; no fictional shop fronts or benches on motorway lanes.
 const [vx,vz]=interchangeLocal(INTERCHANGE_ARRIVAL);box(concrete,2.6,.04,8,vx,.035,vz);
 batchStaticMeshes(group);group.userData.interchange={roads:INTERCHANGE_PROFILES.length,roadPieces,deckHeight:6.6,dimensionsEstimated:true};
 return {group};
}
