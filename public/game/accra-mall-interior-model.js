import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface} from './graphics-materials.js';
import {MALL_LAYOUT,MALL_CINEMA,MALL_SHOPS} from './accra-mall-data.js';
// Hand-built, navigable interpretation. See docs/realism/accra-mall.md for
// component references and the distinction between mapped and estimated detail.
export function buildMallInterior(cinema=false){
 const group=new T.Group(),blockers=[],hotspots=[],seats=[],layout=cinema?MALL_CINEMA:MALL_LAYOUT;
 const mat=(color,roughness=.65,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const cream=mat('#e6dbc2'),white=mat('#f1eee3'),tile=mat('#c6bba4',.3),band=mat('#8e8b7a',.38),metal=mat('#70797b',.3,.6),wood=mat('#7d583e'),dark=mat('#24333d'),red=mat('#b93643'),blue=mat('#274970'),green=mat('#477448');
 const glass=new T.MeshStandardMaterial({color:'#91bdc4',roughness:.18,metalness:.15,transparent:true,opacity:.24,depthWrite:false});
 tagSurface(tile,'smooth');tagSurface(band,'smooth');tagSurface(wood,'wood');tagSurface(cream,'plaster');
 const add=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o};
 const box=(m,w,h,d,x,y,z,solid=false)=>{const o=add(new T.BoxGeometry(w,h,d),m,x,y,z);if(solid)blockers.push({x,z,w,d});return o};
 const cylinder=(m,r,h,x,y,z)=>add(new T.CylinderGeometry(r,r,h,12),m,x,y,z);
 const spot=(x,z,label,actionId,extra={})=>hotspots.push({x,z,label,actionId,...extra});
 // All sign planes share a single texture atlas/material.
 let atlas,ctx,signMat,index=0;
 if(typeof document!=='undefined'){atlas=document.createElement('canvas');atlas.width=1024;atlas.height=4096;ctx=atlas.getContext('2d');ctx.fillStyle='#16463d';ctx.fillRect(0,0,1024,4096);const tex=new T.CanvasTexture(atlas);tex.colorSpace=T.SRGBColorSpace;signMat=new T.MeshBasicMaterial({map:tex,side:T.FrontSide})}
 function sign(text,x,y,z,w=6,yaw=0,color='#16463d'){
  if(!ctx)return;
  const row=index++;ctx.fillStyle=color;ctx.fillRect(0,row*128,1024,128);ctx.fillStyle='#fff8e5';ctx.font='600 48px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,row*128+80,970);
  const geo=new T.PlaneGeometry(w,w/8),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-(row+1-uv.getY(i))/32);const o=add(geo,signMat,x,y,z);o.rotation.y=yaw;return o;
 }
 function chair(x,z,m=red,yaw=0){const g=new T.Group();group.add(g);g.position.set(x,0,z);g.rotation.y=yaw;const part=(mat,w,h,d,px,py,pz)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),mat);mesh.position.set(px,py,pz);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh)};part(m,.62,.14,.65,0,.47,0);part(m,.62,.67,.11,0,.86,.29);for(const xx of [-.24,.24])for(const zz of [-.23,.23])part(metal,.045,.45,.045,xx,.225,zz);return {x,z,yaw}}
 function plant(x,z){box(white,1,.65,1,x,.32,z,true);for(let i=0;i<6;i++){const a=i*Math.PI/3,o=add(new T.SphereGeometry(.4,8,6),green,x+Math.sin(a)*.26,1.1+i%2*.35,z+Math.cos(a)*.26);o.scale.set(.65,1.5,.65)}}
 const b=layout.bounds;box(cinema?dark:tile,b.right-b.left+2,.2,b.front-b.back+2,0,-.1,0);
 box(cinema?blue:cream,b.right-b.left+1,6,.3,0,3,b.back-.5,true);
 for(const x of [b.left-.5,b.right+.5])box(cinema?blue:cream,.3,6,b.front-b.back+1,x,3,0,true);
 box(cinema?blue:cream,b.right-b.left+1,6,.3,0,3,b.front+.5,true);
 const lights=new T.MeshBasicMaterial({color:'#fff4d2'});
 let screen=null;
 if(cinema){
  box(dark,28,.2,39,0,6,0);sign('SILVERBIRD · CINEMA',0,4.9,19.25,8,Math.PI,'#403b65');
  box(dark,18,8,.25,0,4,-17);screen=add(new T.PlaneGeometry(16,8),new T.MeshBasicMaterial({color:'#deebdc'}),0,4.4,-16.8);screen.userData.dynamic=true;
  for(let row=0;row<8;row++)for(const side of [-1,1]){for(let n=0;n<7;n++)chair(side*(2.7+n*1.05),-9+row*2.6,row%2?red:dark);blockers.push({x:side*5.85,z:-9+row*2.6,w:7.2,d:.95})}
  for(const x of [-11,11])for(let z=-13;z<16;z+=3)box(lights,.08,.05,.7,x,.08,z);
  spot(0,12,'Take a seat · watch the film','watch');spot(11,10,'Watch from the side aisle','watch');
  spot(0,17.3,'Return downstairs to the mall','downstairs');
  sign('WORLD FOLK · ACCRA IN MOTION',0,1,-16.6,12);sign('DOWNSTAIRS / MALL',0,3.8,19.25,5,Math.PI);
 }else{
  // Cream polished tiles and darker corridor bands, photographed at Accra Mall.
  for(let x=-34;x<=34;x+=2)box(band,.014,.008,84,x,.008,0);
  for(let z=-40;z<43;z+=2)box(band,70,.008,.014,0,.008,z);
  for(const x of [-16,16])box(band,1.2,.012,70,x,.018,0);
  for(const side of [-1,1]){
   box(white,25,.16,70,side*23.5,5.8,0);
   for(let z=-30;z<=30;z+=6){box(lights,.6,.04,.6,side*15,5.69,z);box(metal,.12,.12,5,side*15,5.63,z)}
  }
  // Open-air food court with square stone piers and steel pergola, not a sealed hall.
  box(band,20,.012,47,0,.026,-3);
  for(const x of [-10,10])for(const z of [-27,-9,9,27]){box(cream,.7,5.7,.7,x,2.85,z,true);box(wood,.74,1.5,.74,x,.75,z);box(metal,.16,.18,57,x,5.65,0)}
  for(let z=-27;z<=27;z+=4)box(metal,21,.18,.12,0,5.68,z);
  for(const s of MALL_SHOPS){
   const side=Math.sign(s.x),accent=mat(s.color),front=side*20;
   box(white,15,.08,18,s.x,.06,s.z);
   for(const dz of [-9,9])box(cream,16,5.8,.2,s.x,2.9,s.z+dz,true);
   for(const dz of [-5.5,5.5]){box(glass,.12,3.6,7,front,1.8,s.z+dz,true);for(const edge of [-3.5,3.5])box(metal,.14,3.6,.1,front,1.8,s.z+dz+edge)}
   box(accent,.28,.8,18,front,4.1,s.z);sign(s.name,front-side*.2,4.1,s.z,12,-side*Math.PI/2,'#'+s.color.toString(16));
   box(wood,2.6,1.05,1.1,s.x,.52,s.z-5.5,true);box(dark,.6,.4,.08,s.x,.1+1.05,s.z-5.5);
   spot(s.x-side*3,s.z,'Browse '+s.name.split(' · ')[0],'shop:'+s.id,{goods:s.goods});
   if(s.id==='home'){
    for(const dz of [-2,3]){box(accent,4,.55,1.6,s.x,.4,s.z+dz,true);box(accent,4,.7,.24,s.x,.95,s.z+dz+.7);for(const dx of [-1.5,1.5])box(cream,.6,.5,.5,s.x+dx,.88,s.z+dz)}box(wood,2,.5,1,s.x-side*4,.25,s.z+3,true);
   }else if(s.id==='fashion'){
    for(const dz of [-3,3]){box(metal,.08,1.8,5,s.x+side*2,.9,s.z+dz,true);for(let j=0;j<8;j++){const zz=s.z+dz-2+j*.55;box(j%2?red:blue,.6,.8,.13,s.x+side*2,1.18,zz);box(white,.05,.25,.07,s.x+side*2,1.7,zz)}}
   }else for(const dz of [-3,3]){
    const sx=s.x+side*2;box(white,1.2,1.6,4.5,sx,.8,s.z+dz,true);
    for(let j=0;j<6;j++)for(const y of [.45,1.05,1.55]){
     const zz=s.z+dz-1.85+j*.7;
     if(s.id==='technology'){box(dark,.16,.7,.45,sx-side*.66,1.7,zz);box(blue,.17,.58,.36,sx-side*.67,1.7,zz)}
     else if(s.id==='sport'){const shoe=box(j%2?white:blue,.4,.18,.65,sx-side*.66,y,zz);shoe.rotation.y=.25}
     else box(j%2?red:green,.3,.35,.4,sx-side*.63,y,zz);
    }
   }
  }
  // Paired dining tables leave a continuous 4 m central path to the cinema.
  for(const x of [-5.5,5.5])for(const z of [-18,-8,2,12]){
   cylinder(metal,.1,.85,x,.425,z);box(white,2,.1,1.4,x,.85,z,true);
   for(const dz of [-1.2,1.2]){const seat=chair(x,z+dz,red,dz<0?Math.PI:0);seats.push(seat);spot(x,z+dz*1.75,'Sit in the food court','sit',{seat})}
   cylinder(metal,.07,3.2,x,1.6,z);add(new T.ConeGeometry(2.7,.65,4),cream,x,3.3,z).rotation.y=Math.PI/4;
  }
  for(const x of [-6,6]){box(wood,8,1.1,1.4,x,.55,-34,true);box(dark,8,.12,1.5,x,1.15,-34);sign(x<0?'FOOD COURT':'VIDA E CAFFÈ · 69/70',x,3,-35.2,8,0,x<0?'#973f38':'#b03137');spot(x,-31.8,'Order food and drinks','food')}
  sign('FOOD COURT  ·  CINEMA ↑',0,4.3,27,8);sign('ACCRA MALL',0,4.7,40,12,Math.PI);
  box(wood,3.2,1.1,1.2,-6,.55,34,true);sign('GUEST SERVICES · WORK',-6,2.7,34,5);spot(-6,36,'Find retail work','work');
  // Explicit floor transition: a small stair lobby avoids pretending the
  // compressed interior is a metre-perfect continuous exterior floor plan.
  for(let i=0;i<12;i++)box(band,5,.22,5-i*.32,0,.11+i*.22,-38-i*.16,true);
  for(const x of [-2.6,2.6])box(metal,.08,3.4,.08,x,1.7,-40);
  sign('SILVERBIRD CINEMAS · UPSTAIRS',0,4,-37,14,0,'#403b65');spot(0,-33.8,'Go upstairs · cinema','upstairs');
  for(const p of [[-11,33],[11,33],[-11,-32],[11,-32]])plant(...p);
  spot(0,32,'Read the mall directory','directory');
 }
 if(signMat)signMat.map.needsUpdate=true;
 for(const h of hotspots){const ring=add(new T.RingGeometry(.36,.42,20),new T.MeshBasicMaterial({color:0xd2b977,side:T.DoubleSide}),h.x,.035,h.z);ring.rotation.x=-Math.PI/2}
 const stats=batchStaticMeshes(group);return {group,blockers,hotspots,seats,layout,screen,stats};
}
