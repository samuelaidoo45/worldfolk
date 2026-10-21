import * as T from './three.module.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';import {batchStaticMeshes} from './render-utils.js';
import {MARINA_BOUNDS} from './marina-visit.js';
export function buildMarinaInterior(level){
 const group=new T.Group(),blockers=[],mat=(color,kind='plaster',r=.75,m=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness:r,metalness:m}),kind);
 const white=mat('#e5e3d9'),tile=mat('#b8b8b0','tile',.42),dark=mat('#3a4042'),steel=mat('#858e90','metal',.35,.6),red=mat('#a94236','paint'),wood=mat('#77634d','wood'),glass=mat('#8dabb0','glass',.2,.5),leaf=mat('#4c6a42','foliage'),light=new T.MeshStandardMaterial({color:'#fbf2dc',emissive:'#f0dfbb',emissiveIntensity:.7});
 function box(m,w,h,d,x,y,z,block=false){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);if(block)blockers.push({x,z,w,d});return o;}
 function sign(text,w,x,y,z){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#272e34';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#f5f0df';ctx.font='bold 62px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,84,990);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,.7),new T.MeshStandardMaterial({map,side:T.DoubleSide}));o.position.set(x,y,z);group.add(o);}
 box(tile,28,.18,40,0,-.09,0);for(let x=-14;x<=14;x+=2)box(white,.015,.01,40,x,.01,0);for(let z=-20;z<=20;z+=2)box(white,28,.01,.015,0,.01,z);
 box(white,.3,4.4,40,-14,2.2,0);box(white,.3,4.4,40,14,2.2,0);box(white,28,4.4,.3,0,2.2,-20);box(white,10,4.4,.3,-9,2.2,20);box(white,10,4.4,.3,9,2.2,20);
 for(const x of [-11,11])for(const z of [-12,0,12])box(white,.65,4.3,.65,x,2.15,z,true);
 // Ceiling strips, warm downlights and a longitudinal central light well.
 for(const x of [-10,10]){box(white,8,.2,40,x,4.4,0);for(let z=-15;z<20;z+=7)box(light,2,.04,.4,x,4.27,z);}
 box(glass,12,.08,40,0,5.5,0);for(let z=-18;z<20;z+=4)box(steel,12,.08,.09,0,5.45,z);
 // Visible circulation landmarks: side-by-side escalator forms. Accessible
 // lift hotspots provide level changes; these meshes do not claim walkable treads.
 for(const x of [-2,2]){box(dark,1.6,1.2,4.3,x,.6,-10,true);for(let i=0;i<13;i++){box(steel,1.3,.12,.32,x,.1+i*.18,-8-i*.32);for(const dx of [-.8,.8])box(glass,.07,.9,.32,x+dx,.65+i*.18,-8-i*.32);}}
 for(const x of [-3,3]){box(steel,2.5,3.2,.3,x,1.6,-17);box(dark,.06,3.2,.32,x,1.6,-17);sign(x<0?'↓ LIFT':'↑ LIFT',2.3,x,3.5,-16.8);}
 if(level==='supermarket'){
  for(const side of [-1,1])for(const z of [-6,0,6]){const x=side*8.7;blockers.push({x,z,w:3.2,d:1.1});box(white,3.1,.18,1,x,.09,z);for(const dx of [-1.5,1.5])box(steel,.07,1.85,1,x+dx,.93,z);for(let y=.4;y<1.8;y+=.5){box(steel,3.2,.07,1.1,x,y,z);for(let i=0;i<8;i++)box([red,wood,leaf,white][(i+Math.round(y*10))%4],.25,.32,.6,x-1.3+i*.36,y+.2,z);}}
  for(const x of [-7,7])box(dark,4,.85,.8,x,.42,11,true);box(wood,1.2,.9,.65,1.4,.45,4,true);box(dark,.4,.3,.06,1.4,1.1,3.9);sign('STOCK ASSISTANT · E AT DESK',5,0,2.8,1);sign('MARINA SUPERMARKET',12,0,3.7,17);sign('GROCERIES',4,-8,2.8,-4);sign('EVERYDAY ESSENTIALS',6,8,2.8,-4);
 }else if(level==='retail'){
  for(const side of [-1,1]){const x=side*10;box(dark,5,.9,1,x,.45,2,true);box(glass,.09,2.9,8,side*12,1.45,-4);for(let i=0;i<5;i++){const px=x-1.5+i*.7;if(side<0){box(wood,.06,1.7,.06,px,1.35,-3);const fabric=[red,white,dark][i%3];box(fabric,.42,.7,.16,px,1.65,-3);box(fabric,.7,.24,.16,px,1.92,-3);}else{box(white,.55,.95,.55,px,.475,-3);box(dark,.25,.45,.035,px,1.18,-3);box(glass,.2,.35,.04,px,1.2,-2.975);box(dark,.32,.025,.3,px,.94,2);}}sign(side<0?'STYLE · GAME SHOP':'TECH · GAME SHOP',7,x,3.2,1.4);}
  box(wood,2.6,.15,.7,2,.46,7,true);box(wood,.12,.55,.7,3.25,.8,7);
  for(const side of [-1,1]){box(glass,.08,1,8,side*3.4,.7,-2,true);box(steel,.1,.08,8,side*3.4,1.25,-2);} // atrium balustrades
 }else{
  box(wood,9,1,1,0,.5,-6.8,true);for(const x of [-3,-1,1,3]){box(steel,.7,.035,.5,x,1.03,-6.8);box(red,.35,.12,.3,x,1.1,-6.8);}sign('FOOD COURT · GAME COUNTER',12,0,2.8,-7.4);
  for(const x of [-8,8])for(const z of [3,9]){box(wood,2,.12,1.4,x,.76,z,true);box(steel,.1,.7,.1,x,.35,z);for(const dx of [-2,2]){box(dark,.8,.12,.8,x+dx,.45,z,true);box(dark,.1,.6,.8,x+dx,.8,z);for(const lx of [-.3,.3])for(const lz of [-.3,.3])box(steel,.06,.4,.06,x+dx+lx,.2,z+lz);}}
  // Terrace-side glass, city skyline silhouette and patio umbrellas.
  box(glass,.09,2.9,15,12.8,1.5,6);for(let z=0;z<15;z+=3)box(steel,.06,3.2,.14,12.9,1.6,z);
  for(const z of [2,10]){box(wood,3,.1,1.5,17,.8,z);const roof=new T.Mesh(new T.ConeGeometry(2.6,.6,8),white);roof.position.set(17,3.2,z);group.add(roof);box(steel,.08,2.9,.08,17,1.5,z);}
  for(let z=-16;z<18;z+=6)box(dark,3,6+(z+18)%8,3,28,2,z);
 }
 sign('MARINA MALL',6,0,3.7,-19.7);enhanceMaterials(group);batchStaticMeshes(group);return {group,blockers,bounds:MARINA_BOUNDS};
}
