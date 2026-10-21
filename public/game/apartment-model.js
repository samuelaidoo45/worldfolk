import * as T from './three.module.js';
import {APARTMENTS} from './apartment-data.js';
import {tagSurface} from './graphics-materials.js';
import {batchStaticMeshes} from './render-utils.js';

export function buildApartment(kind){
 const layout=APARTMENTS[kind];if(!layout)throw new Error('Unknown apartment');
 const group=new T.Group(),blockers=[],ceiling=3.25,W=layout.w/2,p=layout.palette;
 group.name=layout.name;
 const mat=(color,surface='plaster',roughness=.8,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),surface);
 const m={wall:mat(p.wall),floor:mat(p.floor,'paving'),wood:mat(p.wood,'wood'),fabric:mat(p.fabric,'fabric'),accent:mat(p.accent,'fabric'),white:mat('#f4f0e5'),black:mat('#283237','metal',.32,.5),metal:mat('#ae9b75','metal',.28,.6),leaf:mat('#4c7251','foliage'),soil:mat('#4d4937'),tile:mat('#aaa99f','paving'),glass:mat('#9ac0c2','glass',.12,.15),screen:mat('#28464e','glass',.2,.1)};
 m.glass.transparent=true;m.glass.opacity=.22;m.glass.depthWrite=false;
 const glow=new T.MeshStandardMaterial({color:'#ffedc5',emissive:'#ffdf98',emissiveIntensity:.6});
 const box=(material,w,h,d,x,y,z)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=material!==m.glass;mesh.receiveShadow=true;group.add(mesh);return mesh};
 const cyl=(material,r,h,x,y,z)=>{const mesh=new T.Mesh(new T.CylinderGeometry(r,r,h,20),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);return mesh};
 const block=(x,z,w,d)=>blockers.push({x,z,w,d});
 const solid=(material,w,h,d,x,y,z)=>{box(material,w,h,d,x,y,z);block(x,z,w,d)};
 function wall(x,z,w,d){solid(m.wall,w,ceiling,d,x,ceiling/2,z);box(m.white,w+.02,.13,d+.02,x,.065,z)}
 function label(text,x,y,z,w=1.2){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e8e4d7';ctx.fillRect(0,0,512,128);ctx.fillStyle='#34483f';ctx.font='500 32px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,76);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const plane=new T.Mesh(new T.PlaneGeometry(w,w/4),new T.MeshBasicMaterial({map:tex}));plane.position.set(x,y,z);group.add(plane);return plane}
 function plant(x,z,h=1.5){solid(m.tile,.55,.45,.55,x,.225,z);cyl(m.wood,.035,h,x,h/2,z);for(let i=0;i<9;i++){const a=i*2.4,r=.2+(i%3)*.09,o=new T.Mesh(new T.SphereGeometry(.25,8,6),m.leaf);o.position.set(x+Math.sin(a)*r,.7+i*.09*h,z+Math.cos(a)*r);o.scale.set(.6,.35,1.6);o.rotation.set(.3,a,.3);o.castShadow=true;group.add(o)}}
 function chair(x,z){for(const dx of [-.28,.28])for(const dz of [-.26,.26])box(m.wood,.055,.43,.055,x+dx,.215,z+dz);box(m.fabric,.72,.17,.65,x,.49,z);box(m.fabric,.72,.65,.12,x,.86,z+.3);block(x,z,.76,.75)}
 // A real enclosing shell, with a 1.8 m entrance and room door openings.
 box(m.floor,layout.w,.16,layout.front-layout.back,0,-.08,(layout.front+layout.back)/2);
 wall(-W, (layout.front+layout.terrace)/2,.22,layout.front-layout.terrace);
 wall(W, (layout.front+layout.terrace)/2,.22,layout.front-layout.terrace);
 for(const side of [-1,1])wall(side*(W+.9)/2,layout.front,W-.9,.22);
 box(m.wood,1.75,2.5,.1,0,1.25,layout.front+.05);box(m.metal,.06,.24,.07,.63,1.1,layout.front-.04);label('COURTYARD / EXIT',0,2.7,layout.front-.13,1.7)?.rotateY(Math.PI);
 for(const [x,z,w,d] of layout.walls)wall(x,z,w,d);
 // Full-height glazing and open sliding doors onto the garden terrace.
 for(const [x,w] of [[-W/2-1,W-2],[W/2+1,W-2]]){
  box(m.black,w,.06,.12,x,.04,layout.terrace);box(m.black,w,.06,.12,x,3.08,layout.terrace);
  box(m.glass,w,2.95,.035,x,1.56,layout.terrace);block(x,layout.terrace,w,.08);
  for(const edge of [-1,1])box(m.black,.045,3.1,.1,x+edge*w/2,1.55,layout.terrace);
 }
 // Ceiling, recessed perimeter lighting, pendant fittings, AC and curtain folds.
 box(m.white,layout.w,.12,layout.front-layout.terrace,0,ceiling,(layout.front+layout.terrace)/2);
 for(let x=-W+1;x<W;x+=3)for(const z of [4,-3]){cyl(m.metal,.095,.04,x,ceiling-.085,z);cyl(glow,.065,.045,x,ceiling-.11,z)}
 for(const side of [-1,1])for(let i=0;i<7;i++)cyl(m.fabric,.045,2.92,side*(W-.45)-i*.06,1.6,layout.terrace+.16);
 box(m.white,1.2,.32,.24,W-1.4,2.85,layout.terrace+.28);for(let i=0;i<5;i++)box(m.tile,1.06,.013,.025,W-1.4,2.73+i*.025,layout.terrace+.41);
 // Bedroom suites: upholstered headboards, layered linen, pillows, nightstands.
 for(const [bx,bz] of layout.beds){
  solid(m.wood,2.4,.36,2.75,bx,.24,bz);box(m.fabric,2.65,1.2,.17,bx,.8,bz-1.42);
  box(m.white,2.3,.27,2.6,bx,.55,bz);box(m.fabric,2.32,.13,1.65,bx,.73,bz+.45);
  for(const dx of [-.56,.56]){const pillow=box(m.white,.94,.17,.52,bx+dx,.79,bz-.88);pillow.rotation.x=-.14;}
  for(const side of [-1,1]){solid(m.wood,.52,.52,.56,bx+side*1.64,.26,bz-.91);cyl(m.metal,.035,.45,bx+side*1.64,.8,bz-.91);cyl(glow,.16,.18,bx+side*1.64,1.05,bz-.91)}
  box(m.accent,2.7,.013,1.2,bx,.012,bz+2);
 }
 const [wx,wz]=layout.wardrobe;solid(m.wood,.64,2.65,1.5,wx,1.325,wz);for(const dz of [-.36,.36]){box(m.white,.03,2.48,.7,wx+.34,1.3,wz+dz);box(m.metal,.07,.35,.025,wx+.39,1.2,wz+dz)}
 // Lounge and woven rug, cushions, low table, media wall, original geometric art.
 const [sx,sz]=layout.sofa;
 box(m.accent,4.7,.014,3.7,sx,.013,sz+.8);
 for(let i=0;i<18;i++)box(m.fabric,4.6,.006,.025,sx,.026,sz-.95+i*.2);
 solid(m.wood,3.4,.35,1.05,sx,.23,sz);box(m.fabric,3.4,.46,.25,sx,.77,sz-.45);
 for(const dx of [-1.06,0,1.06]){box(m.fabric,1.02,.19,.88,sx+dx,.48,sz);box(m.fabric,1,.58,.22,sx+dx,.88,sz-.36)}
 for(const side of [-1,1]){box(m.fabric,.18,.64,1.07,sx+side*1.64,.55,sz);const cushion=box(m.accent,.52,.5,.19,sx+side*1.1,.82,sz-.17);cushion.rotation.z=side*.17;}
 solid(m.wood,1.1,.35,.65,sx+1.8,.2,sz+1.9);box(m.white,.48,.03,.32,sx+2,.4,sz+1.9);cyl(m.metal,.09,.16,sx+1.5,.47,sz+1.9);
 // Gallery reference: grey paired sofas, teal accents and pale framed prints.
 if(kind==='gallery'){
  solid(m.wood,1.05,.35,2.2,4.05,.23,-3.75);box(m.fabric,.24,.7,2.2,4.46,.78,-3.75);
  for(const z of [-4.28,-3.22]){box(m.fabric,.88,.2,1,4.05,.49,z);box(m.accent,.18,.48,.55,4.28,.8,z);}
  for(let i=0;i<3;i++){box(m.white,.06,.72,.65,7.83,2.13,-3.9+i*.85);box(m.fabric,.065,.53,.46,7.78,2.13,-3.9+i*.85);box(m.accent,.07,.18,.25,7.73,2.13,-3.9+i*.85);}
 }
 // Media console is at the right-hand living wall, facing the seating.
 const mediaX=kind==='villaggio'?5.4:W-.45;
 solid(m.wood,.55,.48,2.5,mediaX,.24,-3.2);box(m.black,.07,1.18,2.15,mediaX-.34,1.35,-3.2);box(m.screen,.015,1.06,2.03,mediaX-.39,1.35,-3.2);
 for(let i=0;i<5;i++){const art=box(i%2?m.accent:m.fabric,.05,.3+i*.15,.16,mediaX-.41,1.3,-4+i*.35);art.rotation.x=.4;}
 // Kitchen cabinet bank with stone worktop, oven, hob, sink, tap and fridge.
 const [kx,kz]=layout.kitchen,turn=kind==='villaggio',kw=turn?.7:3.8,kd=turn?3.8:.7;
 solid(m.wood,kw,.92,kd,kx,.46,kz);box(m.white,kw+.06,.06,kd+.06,kx,.95,kz);
 for(let i=-1;i<=1;i++){const x=kx+(turn?0:i*1.2),z=kz+(turn?i*1.2:0);box(m.white,turn?.025:1.12,.66,turn?1.12:.025,x+(turn?-.365:0),.52,z+(turn?0:-.365));box(m.metal,turn?.04:.4,.025,turn?.4:.04,x+(turn?-.395:0),.78,z+(turn?0:-.395))}
 const hx=kx+(turn?0:.9),hz=kz+(turn?.9:0);box(m.black,.57,.025,.54,hx,1,hz);for(const dx of [-.16,.16])for(const dz of [-.15,.15])cyl(m.metal,.1,.018,hx+dx,1.02,hz+dz);
 box(m.metal,.62,.025,.44,kx-(turn?0:1),.99,kz-(turn?1:0));cyl(m.metal,.025,.28,kx-(turn?0:1),1.14,kz-(turn?.8:-.22));
 solid(m.white,turn?.72:.8,2.15,turn?.8:.72,kx+(turn?0:2.45),1.075,kz+(turn?-2.45:0));
 // Dining table stays out of the hall and all activity approaches.
 const [tx,tz]=layout.table;solid(m.wood,1.5,.08,1.2,tx,.76,tz);for(const dx of [-.6,.6])for(const dz of [-.45,.45])box(m.wood,.065,.7,.065,tx+dx,.35,tz+dz);chair(tx,tz+1);chair(tx,tz-1);cyl(m.white,.17,.2,tx,.9,tz);
 // Bathroom: a walk-in shower, glass screen, stone tray, vanity and mirror.
 const [bx,bz]=layout.bath;box(m.tile,2.2,.028,2.1,bx,.017,bz);
 solid(m.glass,.045,2.15,2.1,bx+1.05,1.1,bz);box(m.metal,.035,2.2,.035,bx,1.1,bz-.94);box(m.metal,.34,.04,.34,bx,2.18,bz-.6);
 const vx=bx-1.45,vz=bz+.9;solid(m.wood,.7,.83,.6,vx,.415,vz);box(m.white,.75,.12,.64,vx,.89,vz);box(m.glass,.7,.9,.04,vx,1.65,vz+.3);cyl(m.metal,.02,.19,vx,1.06,vz+.2);
 const tz2=bz-1.15;block(vx,tz2,.75,1.1);cyl(m.white,.3,.38,vx,.21,tz2);box(m.white,.65,.65,.22,vx,.55,tz2-.38);cyl(m.tile,.22,.018,vx,.413,tz2);const seat=new T.Mesh(new T.TorusGeometry(.25,.04,8,24),m.white);seat.rotation.x=Math.PI/2;seat.position.set(vx,.43,tz2);group.add(seat);
 // Terrace identity: Signature's bronze glass railing; Villaggio's sheltered
 // garden with tall narrow openings and deep white reveals.
 const [cx,cz]=layout.terraceSeat;
 box(m.wood,layout.w-.25,.025,layout.terrace-layout.back,0,.014,(layout.terrace+layout.back)/2);
 for(let z=layout.back+.1;z<layout.terrace;z+=.2)box(m.black,layout.w-.3,.006,.009,0,.03,z);
 wall(-W,(layout.back+layout.terrace)/2,.22,layout.terrace-layout.back);wall(W,(layout.back+layout.terrace)/2,.22,layout.terrace-layout.back);
 solid(m.white,layout.w,kind==='villaggio'?1.05:.24,.28,0,kind==='villaggio'?.525:.12,layout.back);
 if(kind==='villaggio'){
  for(let x=-W+.5;x<W;x+=2.5)solid(m.white,1.25,ceiling,.55,x,ceiling/2,layout.back+.15);
  box(m.white,layout.w,.35,1.6,0,3.1,layout.back+.65);for(const x of [-8,-4,7])plant(x,layout.back+1,2.3);
 }else{solid(m.glass,layout.w,1.05,.05,0,.8,layout.back+.1);box(m.metal,layout.w,.065,.08,0,1.34,layout.back+.1);for(let x=-W+.1;x<W;x+=1.8)box(m.metal,.035,1.28,.07,x,.67,layout.back+.1);plant(-7,layout.back+.9);plant(7,layout.back+.9)}
 chair(cx,cz);cyl(m.wood,.4,.55,cx+1.5,.275,cz);block(cx+1.5,cz,.8,.8);plant(-W+1,layout.terrace+1,1.6);
 const stats=batchStaticMeshes(group);
 return {group,layout,blockers,hotspots:layout.hotspots,bounds:{left:-W+.5,right:W-.5,back:layout.back+.5,front:layout.front-.5},stats};
}
