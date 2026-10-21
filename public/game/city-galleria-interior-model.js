import * as T from './three.module.js';
import {GALLERIA_AREAS,GALLERIA_RETAIL} from './city-galleria-data.js';
import {batchStaticMeshes} from './render-utils.js';import {tagSurface} from './graphics-materials.js';
export function buildCityGalleriaInterior(area='retail'){
 const layout=GALLERIA_AREAS[area]||GALLERIA_AREAS.retail,group=new T.Group(),blockers=[];group.name=layout.name;
 const mat=(color,kind='stone',extra={})=>tagSurface(new T.MeshStandardMaterial({color,roughness:.75,...extra}),kind);
 const cream=mat('#e8e6dc'),tan=mat('#aaa08c','stone',{roughness:.3,metalness:.07}),trim=mat('#626d70','metal',{metalness:.55,roughness:.4}),glass=mat('#92b6bf','glass',{transparent:true,opacity:.28,roughness:.17,depthWrite:false}),blue=mat('#2c6885','metal',{metalness:.2}),dark=mat('#293e47'),wood=mat('#8c7358','wood'),fabric=mat('#7d9193','fabric'),leaf=mat('#4c7049','foliage');
 const glow=new T.MeshStandardMaterial({color:'#fff0d2',emissive:'#fff0d2',emissiveIntensity:.45});
 const mesh=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=y>.1;o.receiveShadow=true;group.add(o);return o;};
 const box=(m,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z);
 const block=(x,z,w,d)=>blockers.push({x,z,w,d});
 const plaque=(text,w,x,y,z,rotation=0)=>{if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d');if(!ctx)return;ctx.fillStyle='#284b5e';ctx.fillRect(0,0,768,128);ctx.fillStyle='#f1ede0';ctx.font='bold 50px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,68,730);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,.5),new T.MeshStandardMaterial({map:tex,roughness:.75,side:T.DoubleSide}),x,y,z);o.rotation.y=rotation;};
 box(tan,36,.08,49,0,-.04,0);for(let x=-17;x<=17;x+=1.4)box(cream,.015,.003,48,x,.003,0);for(let z=-24;z<=24;z+=1.4)box(cream,36,.003,.015,0,.003,z);
 for(const side of [-1,1]){
  box(cream,.18,area==='rooftop'?1.1:3.8,49,side*18,area==='rooftop'?.55:1.9,0);
  if(area!=='rooftop')for(let z=-21;z<=21;z+=4.2){box(glass,.09,2.65,3.75,side*17.88,1.7,z);box(trim,.13,3.4,.07,side*17.8,1.7,z-2);}
 }
 if(area!=='rooftop'){
  box(cream,36,.16,49,0,3.8,0);for(const x of [-5.5,5.5])box(cream,.7,.15,48,x,3.57,0);
  const oval=mesh(new T.TorusGeometry(3.2,.12,6,48),cream,0,3.58,15);oval.rotation.x=Math.PI/2;oval.scale.set(1.45,1,1);
  for(const z of [-18,-10,-2,6,14,22])for(const x of [-5.5,5.5]){const lamp=mesh(new T.CylinderGeometry(.12,.12,.025,12),glow,x,3.48,z);lamp.castShadow=false;}
  box(cream,36,3.8,.2,0,1.9,-24.5);box(glass,36,3.7,.1,0,1.85,24.4);for(let x=-16;x<=16;x+=4)box(trim,.05,3.7,.1,x,1.85,24.3);
 }else{
  for(const z of [-24,24])box(cream,36,1.1,.18,0,.55,z);
  for(const x of [-17.8,17.8]){box(trim,.07,.07,48,x,1.2,0);for(let z=-23;z<24;z+=3)box(trim,.045,1.2,.045,x,.6,z);}
 }
 const plant=(x,z)=>{box(cream,.65,.6,.65,x,.3,z);mesh(new T.SphereGeometry(.55,10,7),leaf,x,1.15,z);block(x,z,.7,.7);};
 const sofa=(x,z)=>{box(fabric,1.1,.42,2.8,x,.3,z);box(fabric,.2,.7,2.8,x+(x<0?-.5:.5),.7,z);block(x,z,1.15,2.9);};
 // Lift is an explicit level transition. Decorative stair treads are not a false
 // walkable flight into an unmodelled floor.
 const liftZ=area==='retail'?-21.5:22.7;
 for(const x of [-3,1]){box(trim,2.1,2.8,.12,x,1.4,liftZ);box(glass,1.7,2.45,.08,x,1.25,liftZ-(area==='retail'?.1:-.1));box(trim,.035,2.4,.12,x,1.25,liftZ);box(glow,.1,.15,.05,x+1.2,1.2,liftZ);}
 if(area==='retail'){
  plaque('OFFICES',2,-3,3,-21.36);plaque('ROOFTOP',2,1,3,-21.36);
  box(stoneMaterial(),3.4,3.6,.22,-8,1.8,-23.5);for(let i=0;i<9;i++)box(tan,2.8,.16*(i+1),.3,-10, .08*(i+1),-20-i*.3);block(-10,-21.3,3,3.3);
  box(trim,2,.85,.7,0,.425,10.6);block(0,10.6,2,.7);plaque('CITY GALLERIA · DIRECTORY',5,0,2.5,10.8);
  sofa(-5,6);plant(-5,11);plant(5,18);
  for(const s of GALLERIA_RETAIL){
   const side=Math.sign(s.x),doorX=side*8;
   for(const offset of [-4,4]){box(glass,.07,2.8,4.5,doorX,1.4,s.z+offset);block(doorX,s.z+offset,.08,4.5);}
   for(const offset of [-6.3,6.3]){box(cream,9,3.4,.13,side*12.5,1.7,s.z+offset);block(side*12.5,s.z+offset,9,.13);}
   box(trim,.09,.2,12.6,doorX,3.2,s.z);plaque(s.name,6,side*12.2,2.8,s.z-5.9);
   // The actual retailer roster is not inferred from old adverts; game stock is
   // plainly labelled and uses the shared server-owned catalogue.
   box(wood,1.1,.95,7,side*15.5,.475,s.z);block(side*15.5,s.z,1.1,7);
   for(let j=0;j<5;j++){const z=s.z-2.6+j*1.3;if(s.id==='tech'){box(dark,.18,.28,.4,side*15.5,1.12,z);box(blue,.02,.18,.3,side*15.38,1.16,z);}else if(s.id==='refresh'){mesh(new T.CylinderGeometry(.06,.06,.25,10),cream,side*15.5,1.1,z);}else{box(fabric,.45,.08,.5,side*15.5,1.02,z);}}
  }
 }else if(area==='offices'){
  plaque('GROUND FLOOR',2.7,-3,3,22.55,Math.PI);plaque('ROOFTOP',2.5,1,3,22.55,Math.PI);
  for(const x of [-13,-8])for(const z of [-12,-5,3]){box(wood,3,.08,1.5,x,.78,z);block(x,z,3,1.5);box(trim,.1,.7,.8,x,.35,z);box(dark,1,.7,.08,x,1.21,z-.35);box(blue,.87,.54,.025,x,1.22,z-.29);box(trim,.9,.03,.3,x,.84,z+.25);}
  sofa(10,8);plant(14,16);plant(-14,17);
  box(wood,3,.8,1.3,-9, .4,-.0);block(-9,0,3,1.3);plaque('OFFICE DESK · GAME WORK',5,-11,2.7,-1.5);
  for(const z of [-15,-8,-1]){
   box(trim,.12,1.8,3.7,16,1.9,z);const art=box(blue,.14,1.55,3.4,15.9,1.9,z);for(let j=0;j<5;j++)box(j%2?cream:fabric,.035,.8,.22,15.81,1.9,z-1.2+j*.6);
  }
  plaque('CREATIVE DISPLAY · ORIGINAL GAME ART',7,10,3,-20);
 }else{
  plaque('GROUND FLOOR',2.7,-3,2.8,22.55,Math.PI);plaque('OFFICES',2.5,1,2.8,22.55,Math.PI);
  sofa(10,8);sofa(-10,8);for(const x of [-11,11])for(const z of [-17,17])plant(x,z);
  for(const x of [-11,11])for(const z of [-9,0]){box(wood,3,.1,2,x,.75,z);block(x,z,3,2);for(const dz of [-1.8,1.8]){box(fabric,2.6,.4,.6,x,.3,z+dz);block(x,z+dz,2.6,.65);}}
  const deck=mat('#928d7c','paving');box(deck,9,.025,10,0,.015,-4);for(let x=-3.5;x<4;x+=1)box(blue,.06,.002,9,x,.03,-4);
  plaque('CITY GALLERIA · ROOFTOP',10,0,2.1,-22);
 }
 const exit=layout.exit;if(exit)box(new T.MeshStandardMaterial({color:'#79b997',emissive:'#397653',emissiveIntensity:.25}),2,.015,.8,exit[0],.015,exit[1]);
 batchStaticMeshes(group);return {group,blockers,layout,hotspots:layout.hotspots};
 function stoneMaterial(){return mat('#a69e8b','stone');}
}
