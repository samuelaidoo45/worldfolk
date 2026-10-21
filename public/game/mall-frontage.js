import * as T from './three.module.js';
import {MALL_FRONTAGE,FRONTAGE_STALLS,FRONTAGE_BARRIERS,FRONTAGE_BOARDS,frontageStructures} from './mall-frontage-data.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface} from './graphics-materials.js';
export function createMallFrontage(){
 const group=new T.Group();group.name=MALL_FRONTAGE.name;
 const mat=(color,kind='stone',extra={})=>tagSurface(new T.MeshStandardMaterial({color,roughness:.88,...extra}),kind);
 const concrete=mat('#96998f'),soil=mat('#8c8779','soil'),pave=mat('#a4a69d','paving'),steel=mat('#4c5555','metal',{metalness:.5,roughness:.55}),roof=mat('#84877d','metal',{metalness:.25}),timber=mat('#8a7151','wood'),dark=mat('#293a39'),white=mat('#d5d4c9'),goods=[mat('#354759','fabric'),mat('#815c50','fabric'),mat('#b7a773','fabric')];
 const light=new T.MeshStandardMaterial({color:0xe5cf89,emissive:0xd9bc6d,emissiveIntensity:.22});
 const cloth=['#5a687c','#917573','#b09d66','#526b62','#796e87'].map(c=>mat(c,'fabric',{side:T.DoubleSide}));
 const mesh=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=y>.1;group.add(o);return o;};
 const box=(m,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z);
 // The photographed trading apron and paved pedestrian strip, not an invented road.
 box(soil,105,.025,16,0,.018,-1);box(pave,104,.025,5.3,0,.039,-4.1);
 for(let x=-51;x<=51;x+=1.1)box(concrete,.014,.002,5.2,x,.055,-4.1);
 box(concrete,104,.1,.18,0,.05,-6.8);
 const solids=frontageStructures();
 for(const s of solids){
  if(s.id.includes('-post-'))box(steel,s.w,s.h,s.d,s.x,s.h/2,s.z);
  else if(s.id.includes('-back'))box(cloth[Number(s.id.split('-')[1])%5],s.w,s.h,s.d,s.x,s.h/2,s.z);
  else if(s.id.includes('-counter')){box(timber,s.w,.07,s.d+.15,s.x,.92,s.z);for(const dx of [-s.w/2+.18,s.w/2-.18])box(timber,.07,.86,.55,s.x+dx,.43,s.z);}
  else if(s.id.includes('-left')||s.id.includes('-right'))box(white,s.w,s.h,s.d,s.x,s.h/2,s.z);
 }
 for(const [i,s] of FRONTAGE_STALLS.entries()){
  if(s.kind==='umbrella'){
   mesh(new T.ConeGeometry(s.w*.54,.65,10,1,true),cloth[s.color],s.x,2.85,-.3);box(steel,.065,2.8,.065,s.x,1.4,.8);
   for(let j=0;j<10;j++){const a=j*Math.PI/5;const rib=mesh(new T.CylinderGeometry(.012,.012,s.w*.54,5),steel,s.x+Math.cos(a)*s.w*.26,2.69,-.3+Math.sin(a)*s.w*.26);rib.rotation.z=Math.PI/2;rib.rotation.y=-a;}
  }else{
   const cover=box(s.kind==='kiosk'?roof:cloth[s.color],s.w+.25,.065,4.2,s.x,2.72,-.25);cover.rotation.x=-.045;
   if(s.kind==='kiosk')for(let x=s.x-s.w/2;x<s.x+s.w/2;x+=.23)box(roof,.025,.025,4.2,x,2.77,-.25);
   box(cloth[s.color],s.w+.28,.24,.08,s.x,2.52,-2.32);
  }
  // Visible merchandise in bounded pitches: backpacks, footwear and a drinks cooler.
  if(s.kind==='rack'){
   const x=s.x+s.w/2-.7;box(steel,.05,1.85,.05,x,.925,-.5);box(steel,1.15,.04,.05,x,1.85,-.5);
   for(let j=0;j<4;j++){const dx=x-.44+j*.29;box(goods[j%3],.22,.32,.12,dx,1.52,-.5);mesh(new T.TorusGeometry(.06,.012,4,10,Math.PI),steel,dx,1.73,-.5);}
   for(let shelf=0;shelf<3;shelf++){box(timber,1.15,.04,.4,x,.25+shelf*.35,-.5);for(let j=0;j<3;j++){const shoe=mesh(new T.CapsuleGeometry(.06,.16,3,6),goods[j%3],x-.34+j*.34,.32+shelf*.35,-.5);shoe.rotation.x=Math.PI/2;}}
  }else if(i===5){box(goods[0],1.1,.6,.7,s.x,.3,-.6);box(white,1.13,.07,.73,s.x,.64,-.6);for(let j=0;j<5;j++){mesh(new T.CylinderGeometry(.045,.045,.2,8),white,s.x-.5+j*.21,1.05,0);}}
  else for(let j=0;j<4;j++)box(goods[j%3],.25,.22,.3,s.x-1+j*.55,1.07,0);
  // Hanging clothes and accessory boards stay inside each photographed pitch.
  if(s.kind==='awning'||s.kind==='rack'){
   const railZ=.55;box(steel,s.w-1.4,.045,.045,s.x,2.18,railZ);
   for(let j=0;j<6;j++){
    const x=s.x-s.w/2+1+j*(s.w-2)/5;
    const shirt=new T.Shape([new T.Vector2(-.17,0),new T.Vector2(-.32,.1),new T.Vector2(-.23,.29),new T.Vector2(-.1,.36),new T.Vector2(.1,.36),new T.Vector2(.23,.29),new T.Vector2(.32,.1),new T.Vector2(.17,0),new T.Vector2(.16,-.3),new T.Vector2(-.16,-.3)]);
    mesh(new T.ShapeGeometry(shirt),cloth[(i+j)%cloth.length],x,1.65,railZ-.08);
    mesh(new T.TorusGeometry(.045,.009,4,8,Math.PI),steel,x,2.1,railZ);
   }
  }
  if(i%3===0){const x=s.x-s.w/2+.65;box(dark,.6,1.4,.09,x,1.05,-.6);for(let row=0;row<5;row++)for(const dx of [-.12,.12]){const lens=mesh(new T.TorusGeometry(.075,.016,4,10),white,x+dx,.55+row*.23,-.66);lens.material=white;}}
  if(s.kind==='kiosk')for(let x=s.x-s.w/2+.12;x<s.x+s.w/2;x+=.18)box(roof,.035,2.3,.035,x,1.25,1.39);
  // A narrow lit strip under the awning, without extra realtime lights.
  box(light,.55,.035,.08,s.x,2.5,-1.2);
 }
 // Jersey barriers use a sloped cross-section and preserve the native access gaps.
 for(const b of FRONTAGE_BARRIERS){const shape=new T.Shape([new T.Vector2(-.31,0),new T.Vector2(.31,0),new T.Vector2(.16,.25),new T.Vector2(.11,.65),new T.Vector2(-.11,.65),new T.Vector2(-.16,.25)]);const o=mesh(new T.ExtrudeGeometry(shape,{depth:2.4,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1}),concrete,b.x-1.2,0,b.z);o.rotation.y=Math.PI/2;mesh(new T.CylinderGeometry(.065,.065,.025,8),dark,b.x,.47,b.z-.13).rotation.x=Math.PI/2;}
 // Original wayfinding occupies physical billboard frames; old campaign art and
 // real advertiser contact numbers are not automatically published in the game.
 const posters=[{bg:'#a38436',lines:['YOUR CITY.','YOUR CHOICE.']},{bg:'#603e59',lines:['MAKE YOUR','NEXT MOVE.']},{bg:'#275665',lines:['WORK. EARN.','EXPLORE.']},{bg:'#24453e',lines:['DISCOVER','ACCRA.']}];
 for(const [i,b] of FRONTAGE_BOARDS.entries()){
  box(steel,b.w+.2,b.h+.2,.16,b.x,b.y,2.5);let material=dark;
  if(typeof document!=='undefined'){
   const c=document.createElement('canvas'),portrait=b.h>b.w;c.width=portrait?384:640;c.height=portrait?576:320;const ctx=c.getContext('2d');if(ctx){const p=posters[i];ctx.fillStyle=p.bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#e6ce91';ctx.fillRect(18,20,5,c.height-40);ctx.textAlign='left';ctx.font='bold '+(portrait?26:30)+'px sans-serif';ctx.fillText('WORLDFOLK',40,60,c.width-65);ctx.fillStyle='#f8f0d9';ctx.font='bold '+(portrait?38:46)+'px sans-serif';p.lines.forEach((line,j)=>ctx.fillText(line,40,(portrait?195:140)+j*(portrait?58:53),c.width-65));ctx.fillStyle='#e6ce91';ctx.font=(portrait?23:20)+'px sans-serif';ctx.fillText('YOUR ACCRA STORY',40,c.height-48,c.width-65);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;material=new T.MeshStandardMaterial({map:texture,roughness:.8});}
  }
  const sign=mesh(new T.PlaneGeometry(b.w,b.h),material,b.x,b.y,2.39);sign.rotation.y=Math.PI;
  for(let x=b.x-b.w/2;x<=b.x+b.w/2;x+=1.2)box(roof,.035,b.h,.04,x,b.y,2.61);
 }
 // Open structural roof frame visible behind the stalls; it stays outside the walk.
 for(let x=-32;x<=24;x+=8){box(roof,.1,.1,5,x,4.6,7.7);}
 for(const z of [5.3,10.1])box(roof,56,.1,.1,-4,4.6,z);
 batchStaticMeshes(group);group.userData.frontage={referenceMonth:'2024-08',photoBasedEstimates:true,stalls:FRONTAGE_STALLS.length,stockIsFictional:true};return {group};
}
