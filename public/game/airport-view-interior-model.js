import * as T from './three.module.js';import {HOTEL_AREAS} from './airport-view-data.js';import {tagSurface,enhanceMaterials} from './graphics-materials.js';import {batchStaticMeshes} from './render-utils.js';
export function buildHotelInterior(area='lobby'){
 const layout=HOTEL_AREAS[area]||HOTEL_AREAS.lobby,group=new T.Group(),blockers=[];group.name=layout.name;
 const mat=(c,k='plaster',r=.8,m=0)=>tagSurface(new T.MeshStandardMaterial({color:c,roughness:r,metalness:m}),k),cream=mat('#e1dfd3'),tile=mat('#b7aa92','tile',.4),wood=mat('#795c40','wood'),dark=mat('#353a38'),steel=mat('#9b9f9e','metal',.35,.6),glass=mat('#72919c','glass',.22,.3),ochre=mat('#a77c37','fabric'),fabric=mat('#b8b3a3','fabric'),red=mat('#7f3039','fabric'),green=mat('#536f3d','foliage'),stone=mat('#aa9875','stone'),water=new T.MeshStandardMaterial({color:'#318fb3',roughness:.18,metalness:.25,emissive:'#204d81',emissiveIntensity:.3}),glow=new T.MeshStandardMaterial({color:'#f7ebce',emissive:'#f1dba8',emissiveIntensity:.6});
 const mesh=(g,m,x,y,z)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o},box=(m,w,h,d,x,y,z,block=false)=>{const o=mesh(new T.BoxGeometry(w,h,d),m,x,y,z);if(block)blockers.push({x,z,w,d});return o};
 const sign=(text,w,x,y,z,rot=0)=>{if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#344444';ctx.fillRect(0,0,1024,160);ctx.fillStyle='#f4dfb7';ctx.font='bold 75px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,108,980);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,.55),new T.MeshStandardMaterial({map,roughness:.7,side:T.DoubleSide}),x,y,z);o.rotation.y=rot;};
 box(area==='luna'?green:tile,24,.1,33,0,-.05,0);
 for(const side of [-1,1]){box(cream,.2,area==='luna'?1:3.8,33,side*12,area==='luna'?.5:1.9,0);if(area!=='luna')for(let z=-13;z<15;z+=3.5){box(glass,.08,2.5,3,side*11.85,1.8,z);box(dark,.1,3.2,.08,side*11.75,1.6,z-1.6);}}
 box(cream,24,area==='luna'?1:3.8,.2,0,area==='luna'?.5:1.9,-16.5);box(cream,24,area==='luna'?1:3.8,.2,0,area==='luna'?.5:1.9,16.5);
 if(area!=='luna'){
  for(let x=-11;x<12;x+=1.2)box(cream,.012,.005,33,x,.005,0);for(let z=-16;z<17;z+=1.2)box(cream,24,.005,.012,0,.005,z);
  box(cream,24,.15,33,0,3.9,0);for(const x of [-9,0,9])for(let z=-12;z<15;z+=6)mesh(new T.CylinderGeometry(.11,.11,.025,12),glow,x,3.78,z);
 }
 const plant=(x,z)=>{box(cream,.65,.55,.65,x,.275,z,true);mesh(new T.SphereGeometry(.55,9,6),green,x,1.05,z);};
 function chair(x,z,yaw=0,m=fabric){const seat=new T.Group();seat.position.set(x,0,z);seat.rotation.y=yaw;group.add(seat);for(const [w,h,d,dx,y,dz] of [[.8,.13,.8,0,.47,0],[.8,.65,.12,0,.83,.38],...[[-.3,-.3],[.3,-.3],[-.3,.3],[.3,.3]].map(([a,b])=>[.06,.4,.06,a,.2,b])]){const o=new T.Mesh(new T.BoxGeometry(w,h,d),h<.2||area==='cibo'?wood:m);o.position.set(dx,y,dz);seat.add(o);}blockers.push({x,z,w:.85,d:.85});}
 function sofa(x,z){box(dark,1.2,.45,2.8,x,.3,z,true);box(fabric,1.1,.17,2.65,x,.6,z);box(dark,.18,.9,2.8,x+(x<0?-.55:.55),.7,z);box(fabric,.16,.6,2.55,x+(x<0?-.45:.45),.95,z);for(const dz of [-1.35,1.35])box(dark,1.2,.8,.14,x,.5,z+dz);}
 // Compact navigation wall is consistent at every area; every room returns to reception.
 for(const h of layout.hotspots.filter(h=>h.id.startsWith('lift:'))){box(steel,1.7,2.7,.12,h.x,1.35,15.9);box(dark,.035,2.6,.15,h.x,1.35,15.8);sign(h.id.slice(5).toUpperCase(),1.65,h.x,3.05,15.7,Math.PI);}
 if(area==='lobby'){
  box(cream,10,1.05,1.3,0,.525,-10,true);box(wood,8,.9,.08,0,.5,-9.3);for(let y=.15;y<1;y+=.13)box(cream,8,.035,.1,0,y,-9.22);
  box(cream,10.2,.08,1.5,0,1.09,-10);for(const x of [-2.5,2.5]){box(dark,.8,.5,.07,x,1.4,-10.1);box(steel,.12,.28,.2,x,1.2,-10);}
  for(const x of [-3,-1,1,3]){const clock=mesh(new T.CylinderGeometry(.33,.33,.07,24),dark,x,2.8,-16.3);clock.rotation.x=Math.PI/2;box(cream,.025,.21,.02,x,2.86,-16.24);const hand=box(cream,.18,.025,.02,x+.08,2.8,-16.24);}
  for(let x=-6;x<7;x+=.5)box(wood,.18,.13,9,x,3.68,-9);sign('AIRPORT VIEW · RECEPTION',8,0,1.95,-16.3);
  sofa(-7,1);sofa(-7,6);box(wood,2,.15,1.2,-4,.55,3,true);plant(-9,10);plant(9,-13);
  box(wood,1.2,1,4,8,.5,-1,true);box(cream,1.4,.08,4.2,8,1.04,-1);for(const z of [-2,0]){mesh(new T.CylinderGeometry(.14,.12,.24,12),cream,8,1.2,z);}sign('CAFÉ DE VIE',4.8,11.7,2.4,-1,-Math.PI/2);sign('CIBO · POOL · LUNA → LIFTS',5.5,-8,2.9,-15.9);
 }else if(area==='cibo'){
  const floorWood=mat('#a4967d','wood',.65);box(floorWood,24,.012,33,0,.016,0);for(let x=-12;x<12;x+=.35)box(cream,.009,.004,33,x,.025,0);
  for(const x of [-3.5,3.5]){box(stone,.55,3.75,.55,x,1.875,-5,true);for(let y=.2;y<3.7;y+=.2)box(cream,.57,.018,.57,x,y,-5);}
  box(wood,10,.12,22,-6,3.72,0);const oval=mesh(new T.TorusGeometry(2.5,.22,8,40),cream,-6,3.55,0);oval.rotation.x=Math.PI/2;oval.scale.set(1.35,1,1);
  for(const x of [-8,8])for(const z of [-6,0,6]){box(wood,2,.08,1.6,x,.77,z,true);box(cream,2.05,.025,1.65,x,.83,z);box(steel,.1,.7,.1,x,.35,z);for(const side of [-1,1]){chair(x+side*1.5,z,side>0?Math.PI/2:-Math.PI/2);const napkin=mesh(new T.ConeGeometry(.16,.36,4),red,x+side*.6,1.02,z);mesh(new T.CylinderGeometry(.25,.25,.018,16),cream,x+side*.6,.86,z+.35);}}
  for(const z of [-8,0,8]){box(ochre,1,.6,2.4,10,.4,z,true);box(ochre,.15,.8,2.4,10.5,.7,z);}
  box(wood,8,1,1.2,0,.5,-12,true);for(const x of [-2,0,2])box(steel,1.4,.12,.7,x,1.1,-12);box(cream,10,3.3,.18,0,1.65,-13.2,true);sign('CIBO · WORLD FOLK MEALS',9,0,2.5,-13.09);plant(-10,-13);
 }else if(area==='pool'){
  box(stone,9,.04,18,0,.02,-1,true);box(water,8.5,.03,17.5,0,.055,-1);for(const x of [-4.5,4.5])box(red,.2,.14,18.2,x,.1,-1);for(const z of [-10,8])box(red,9,.14,.2,0,.1,z);
  for(const x of [-7,7])for(const z of [-8,-1,6]){box(stone,.65,3.7,.65,x,1.85,z,true);box(stone,14.5,.3,.45,0,3.45,z);const curve=new T.Shape();curve.moveTo(-7,0).quadraticCurveTo(0,1.5,7,0).lineTo(7,.35).quadraticCurveTo(0,1.85,-7,.35).closePath();const g=new T.ExtrudeGeometry(curve,{depth:.3,bevelEnabled:false});mesh(g,stone,0,2.7,z);}
  for(const x of [-9,9])box(green,4,.015,18,x,.01,-1);sofa(8.5,2);sofa(-9,-3);
  box(wood,7,1,1,0,.5,-13,true);for(let x=-3;x<=3;x+=1.5)chair(x,-14);for(const y of [1.6,2.3])box(wood,6,.1,.4,0,y,-16);for(let x=-2.5;x<=2.5;x+=.5)mesh(new T.CylinderGeometry(.07,.07,.3,8),green,x,1.8,-15.9);sign('POOL BAR',5,0,3,-16.1);
 }else{
  box(cream,9,3.2,2,1.5,1.6,16.9);
  for(const x of [-11.8,11.8]){box(steel,.08,.08,33,x,1.25,0);for(let z=-15;z<17;z+=3)box(steel,.06,1.3,.06,x,.65,z);}
  sofa(-7,1);sofa(-7,7);sofa(8,6);box(glass,2,.06,1.2,-4,.6,4,true);box(glass,2,.06,1.2,5,.6,6,true);
  box(wood,8,1,1.2,0,.5,-12,true);for(const x of [-4,4])box(steel,.1,2.7,.1,x,1.35,-14,true);box(wood,8.2,.75,.12,0,2.2,-14);sign('LUNA ROOFTOP LOUNGE',8,0,2.2,-13.92);plant(-10,-12);plant(10,12);
  for(let z=-15;z<15;z+=7){box(whiteMaterial(),.07,1.5,.07,11,.75,z);}
  // Distant airport silhouette, explicitly a scenic approximation.
  box(glass,40,6,14,50,3,-45);box(cream,42,.5,17,50,6.3,-45);for(let z=-52;z<-36;z+=4)box(steel,44,.15,.1,50,6.6,z);
 }
 function whiteMaterial(){return cream;}
 for(const h of layout.hotspots.filter(h=>!h.id.startsWith('sit:')&&!h.id.startsWith('lift:'))){if(h.id==='dance')continue;box(new T.MeshStandardMaterial({color:'#bca367',emissive:'#6f6134',emissiveIntensity:.1}),.6,.007,.6,h.x,.012,h.z);}
 if(layout.exit)box(green,2,.01,.6,layout.exit[0],.015,layout.exit[1]);
 enhanceMaterials(group);batchStaticMeshes(group);return {group,blockers,layout,hotspots:layout.hotspots};
}
