import * as T from './three.module.js';
import {oakKit} from './oak-plaza-model.js';
import {tagSurface,surfaceTexture} from './graphics-materials.js';
import {POLO_MASSES,POLO_RINGS,POLO_GROUNDS,POLO_WALLS,POLO_FIELD,POLO_POSTS,POLO_PLANTING,POLO_ACTIVITIES,ELIZ_PLINTH,poloLocal,poloPoint,poloRoadPoint,poloRoadClear,poloBuildingClear,poloStrip} from './polo-senchi-data.js';

// Reference-informed exterior construction. No remote images or private rooms.
export function createPoloSenchi(site){
 const group=new T.Group();group.name=site.name;
 const k=oakKit(group),{box,mesh,poly,beam,m}=k;
 const material=(color,kind='plaster',roughness=.85,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),kind);
 const cream=material('#e0d6ae'),white=material('#e6e4da'),red=material('#a63832'),brick=material('#8e6559','stone'),glass=material('#436269','glass',.21,.45),shade=material('#23363a'),paving=material('#aaa69a','paving'),grass=material('#667a43','grass'),earth=material('#8c7e62','earth'),stone=material('#9a937f','stone'),metal=material('#c7c6ba','metal',.45,.3);
 grass.map=surfaceTexture('grass');earth.map=surfaceTexture('earth');
 const local=p=>poloLocal(site,p),ring=id=>POLO_RINGS[id].map(local);
 const polygon=(r,ma,h=0,y=0)=>poly(r.map(local),ma,h,y);
 const face=(a,b,normal)=>{const dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,nx=uz*normal,nz=-ux*normal;
  return {len,at:(u,y,out=0)=>[(a[0]+b[0])/2+ux*u+nx*out,y,(a[1]+b[1])/2+uz*u+nz*out],part:(ma,w,h,d,u,y,out=0)=>{const p=[(a[0]+b[0])/2+ux*u+nx*out,y,(a[1]+b[1])/2+uz*u+nz*out],o=box(ma,w,h,d,...p);o.rotation.y=-Math.atan2(uz,ux);return o;},nx,nz};};
 function faces(r,fn){const area=r.slice(1).reduce((s,b,i)=>s+r[i][0]*b[1]-b[0]*r[i][1],0),normal=area>0?1:-1;for(let i=1;i<r.length;i++){if(Math.hypot(r[i][0]-r[i-1][0],r[i][1]-r[i-1][1])>2)fn(face(r[i-1],r[i],normal),i);}}
 function lettering(text,w,x,y,z,yaw,color='#f0e7d0',ink='#973c35'){
  if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1536;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1536,192);ctx.fillStyle=ink;ctx.font='bold 118px sans-serif';ctx.textAlign='center';ctx.fillText(text,768,142,1490);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,w/8),new T.MeshStandardMaterial({map,side:T.DoubleSide,roughness:.8}),x,y,z);o.rotation.y=yaw;
 }
 function windows(f,y,n,width,height,out=.15){for(let j=0;j<n;j++){const u=(j+.5)*f.len/n-f.len/2;f.part(white,width+.12,height+.12,.1,u,y,out);f.part(glass,width,height,.07,u,y,out+.08);f.part(metal,.05,height,.06,u,y,out+.13);}}
 const clip=(r,cut)=>{const pts=r.slice(0,-1),out=[];for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],aa=a[0]<=cut,bb=b[0]<=cut;if(aa)out.push(a);if(aa!==bb){const t=(cut-a[0])/(b[0]-a[0]);out.push([cut,a[1]+(b[1]-a[1])*t]);}}return [...out,out[0]];};
 for(const mass of POLO_MASSES.filter(b=>b.site===site.id)){
  const r=ring(mass.source),pts=r.slice(0,-1),cx=pts.reduce((s,p)=>s+p[0],0)/pts.length,cz=pts.reduce((s,p)=>s+p[1],0)/pts.length;
  if(mass.family==='elizabeth'){
   poly(r,white,9.9,mass.base);
   const rear=clip(r,local([-.17648,5.61521])[0]);poly(rear,white,mass.height-9.9,mass.base+9.9);
   faces(r,f=>{for(let i=0;i<3;i++){const y=mass.base+1.65+i*3.3;f.part(shade,f.len-.22,2.15,.13,0,y,.08);f.part(glass,f.len-.6,1.95,.1,0,y,.17);for(let u=-f.len/2+.6;u<f.len/2;u+=2.6)f.part(metal,.055,2.1,.11,u,y,.24);if(f.nx<.4)f.part(red,f.len+.08,.65,.22,0,y+1.26,.21);}f.part(white,f.len,.4,.3,0,10.92,.12);});
   faces(rear,f=>{for(const y of [12.6,15.8]){f.part(glass,f.len-.45,2.1,.12,0,y,.13);for(let u=-f.len/2+.6;u<f.len/2;u+=2.6)f.part(metal,.055,2.2,.1,u,y,.22);}f.part(white,f.len,.32,.3,0,17.65,.1);});
   // Curved red parapet ribbons on the east frontage; mesh follows its edge.
   const a=r[1],b=r[2],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,nx=uz,nz=-ux;
   for(const y of [4.3,7.6,10.9]){
    const positions=[],uv=[];
    const at=(t,top,back=0)=>{const u=Math.max(0,Math.min(1,(t-.35)/.30)),drop=(u*u*(3-2*u))*1.65,bulge=.3+Math.sin(t*Math.PI)*1.2-back;return [a[0]+dx*t+nx*bulge,y-drop+(top?.325:-.325),a[1]+dz*t+nz*bulge];};
    const quad=(a,b,c,d)=>{for(const p of [a,b,c,a,c,d]){positions.push(...p);uv.push(p[0]/3,p[1]/3);}};
    for(let j=0;j<36;j++){const t=j/36,u=(j+1)/36,A=at(t,false),B=at(u,false),C=at(u,true),D=at(t,true),aa=at(t,false,.24),bb=at(u,false,.24),cc=at(u,true,.24),dd=at(t,true,.24);quad(A,B,C,D);quad(dd,cc,bb,aa);quad(D,C,cc,dd);quad(aa,bb,B,A);if(j===0)quad(aa,A,D,dd);if(j===35)quad(B,bb,cc,C);}
    const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();mesh(geo,red);
   }
   // Text belongs to the real front, not an invented billboard.
   const p=local([-.176474,5.61525]);lettering('The Elizabeth',9,p[0],17.8,p[1],Math.PI/2,'#e6e4da','#9c302e');
   poly(rear,white,.24,17.55);
  }else if(mass.family==='south-block'){
   poly(r,white,mass.height);faces(r,f=>{for(let floor=0;floor<6;floor++)windows(f,1.6+floor*3,Math.max(1,Math.floor(f.len/4.5)),2.2,1.25);if(f.nx>.3)f.part(red,2.0,mass.height,.3,-f.len*.32,mass.height/2,.32);});poly(r,white,.3,mass.height);
  }else{
   // Exact plates retain each source notch. The inset core leaves balcony depth.
   const core=r.map(([x,z])=>[cx+(x-cx)*.87,cz+(z-cz)*.87]);poly(core,cream,mass.height);
   for(let floor=0;floor<=mass.floors;floor++)poly(r,white,.14,floor*3.2);
   faces(r,f=>{
    const bays=Math.max(1,Math.floor(f.len/5.4)),cw=f.len/bays;
    for(let floor=0;floor<mass.floors;floor++){const y=floor*3.2;
     for(let j=0;j<bays;j++){const u=(j+.5)*cw-f.len/2,balcony=f.len>13&&j%3!==0;
      if(balcony){
       f.part(shade,cw-.3,2.6,.12,u,y+1.55,-.8);f.part(glass,cw-.65,2.1,.1,u,y+1.7,-.65);
       f.part(cream,cw-.08,.18,.18,u,y+.50,.11);f.part(cream,cw-.08,.16,.2,u,y+1.04,.12);
       const holes=Math.max(2,Math.floor(cw/.68));for(let h=0;h<=holes;h++)f.part(cream,.13,.38,.18,u+(h/holes-.5)*(cw-.15),y+.77,.12);
       for(const side of [-1,1])f.part(cream,.24,2.75,1.1,u+side*(cw/2-.15),y+1.67,-.35);
       f.part(metal,.06,2.25,.1,u,y+1.75,-.52);
      }else{f.part(j%2===0?brick:cream,cw-.08,3.03,.13,u,y+1.6,.02);f.part(white,Math.min(2.5,cw-.3),1.55,.12,u,y+1.8,.11);f.part(glass,Math.min(2.3,cw-.5),1.36,.07,u,y+1.8,.2);f.part(metal,.05,1.4,.07,u,y+1.8,.26);}
     }
    }
    f.part(brick,f.len,.9,.25,0,mass.height-.4,.15);
   });
   poly(r,cream,.3,mass.height);
   // A low central roof crest sits on the native roof and never floats outside it.
   const roofShape=new T.Shape([new T.Vector2(-2,0),new T.Vector2(2,0),new T.Vector2(2,.8),new T.Vector2(0,1.35),new T.Vector2(-2,.8)]),roofGeo=new T.ExtrudeGeometry(roofShape,{depth:.22,bevelEnabled:false});mesh(roofGeo,cream,cx,mass.height+.15,cz);
  }
 }
 if(site.family==='elizabeth'){
  polygon(ELIZ_PLINTH,paving,1.05);
  // Raised forecourt railing behind the retaining edge; no access through walls.
  for(const w of POLO_WALLS.filter(w=>w.style==='stone')){const a=local(w.a),b=local(w.b);poly(poloStrip(w.a,w.b,w.width).map(local),stone,w.height);for(const y of [1.45,1.8])beam(white,[a[0],y,a[1]],[b[0],y,b[1]],.025);beam(white,[a[0],1.18,a[1]],[a[0],1.85,a[1]],.025);}
  // Native street-side pavement and a restrained lawn/stone planting edge.
  for(let lat=5.61466;lat<=5.61535;lat+=.000018){
   const a=poloRoadPoint(316575722,lat,13),b=poloRoadPoint(316575722,lat+.000018,13),mid=a.map((v,i)=>(v+b[i])/2);
   if(poloRoadClear(mid,2.1)&&poloBuildingClear(mid,2.1))polygon(poloStrip(a,b,3.6),paving,0,.035);
   const g=poloRoadPoint(316575722,lat,17),h=poloRoadPoint(316575722,lat+.000018,17),gm=g.map((v,i)=>(v+h[i])/2);
   if(poloRoadClear(gm,1.5)&&poloBuildingClear(gm,1.5))polygon(poloStrip(g,h,2.5),grass,0,.026);
  }
 }else if(site.family==='heights'){
  for(const w of POLO_WALLS.filter(w=>w.style==='estate')){polygon(poloStrip(w.a,w.b,w.width),cream,w.height);const a=local(w.a),b=local(w.b);beam(white,[a[0],w.height+.08,a[1]],[b[0],w.height+.08,b[1]],.06);}
  polygon(POLO_GROUNDS[981756482],m.water,0,.08);
  for(let lng=-.17517;lng<-.1743;lng+=.000018){const p=[lng,5.614968];if(!poloRoadClear(p,1.6)||!poloBuildingClear(p,1.6))continue;const [x,z]=local(p);box(earth,1.9,.025,3,x,.01,z);}
 }else{
  polygon(POLO_FIELD,grass,0,.018);
  const r=POLO_FIELD.map(local);for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i];beam(white,[a[0],.14,a[1]],[b[0],.14,b[1]],.055);}
  for(const p of POLO_POSTS){const [x,z]=local(p.position);mesh(new T.CylinderGeometry(.07,.10,4.2,8),white,x,2.1,z);for(const y of [.8,1.8,2.8,3.8])mesh(new T.CylinderGeometry(.074,.074,.35,8),red,x,y,z);}
  const [x,z]=local(POLO_ACTIVITIES[2].position);box(earth,2.8,.035,10,x,.015,z);
 }
 function palm(p){
  const [x,z]=local(p.position),h=p.height;
  mesh(new T.CylinderGeometry(.14,.25,h,9),m.wood,x,h/2,z);
  for(let f=0;f<10;f++){
   const a=f*Math.PI/5,positions=[],uv=[];
   const at=t=>[x+Math.cos(a)*t*3,h+1.35*Math.sin(t*Math.PI)-t*t*2.1,z+Math.sin(a)*t*3];
   for(let i=0;i<7;i++)beam(m.leaf,at(i/7),at((i+1)/7),.022);
   for(let i=0;i<14;i++){
    const t=i/13,[px,y,pz]=at(t),width=.12+Math.sin(t*Math.PI)*1.05;
    for(const side of [-1,1]){
     const ex=px+Math.cos(a)*.28-Math.sin(a)*width*side,ez=pz+Math.sin(a)*.28+Math.cos(a)*width*side;
     positions.push(px,y,pz,ex,y-.45-t*.25,ez,px+Math.cos(a)*.42,y-.10,pz+Math.sin(a)*.42);uv.push(t,0,t,.5,t+.1,0);
    }
   }
   const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();m.leaf.side=T.DoubleSide;mesh(geo,m.leaf);
  }
 }

 for(const p of POLO_PLANTING.filter(p=>p.site===site.id)){if(p.kind==='palm')palm(p);else{const [x,z]=local(p.position);mesh(new T.CylinderGeometry(.13,.23,p.height,8),m.wood,x,p.height/2,z);for(let j=0;j<7;j++){const o=mesh(new T.IcosahedronGeometry(1,1),m.leaf,x,2+j*.85,z);o.scale.set(.55,1.1,.55);}}}
 group.userData.poloSenchi={sourceIds:site.sourceIds,site:site.id,referenceDimensions:'estimated',privateInteriors:false};k.finish();return {group,update(){}};
}
