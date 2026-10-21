import * as T from './three.module.js';
import {createMahamaNeighbourhood} from './mahama-neighbourhood.js';
import {areaLocal} from './mahama-neighbourhood-data.js';
import {CASTLE_BUILDINGS,ASOM_NATIVE_GARDENS,ASOM_FRAME,ASOM_NAVIGATION,asomPoint,ASOM_POTS,ASOM_MARKERS,ASOM_LAMPS,ASOM_SEATS,ASOM_TREES,CASTLE_ROAD_TREES} from './castle-asomdwe-data.js';
import {ASOM_GROUND,CASTLE_VERGES,ASOM_WALLS} from './castle-asomdwe-layout.js';
let pavingTexture;
function memorialPaving(){if(pavingTexture)return pavingTexture;const n=128,a=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=(y*n+x)*4,v=x<1||y<1?226:240;a[i]=a[i+1]=a[i+2]=v;a[i+3]=255;}const t=new T.DataTexture(a,n,n);t.name='worldfolk-asomdwe-paving';t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=4;t.userData.shared=true;t.colorSpace=T.SRGBColorSpace;t.needsUpdate=true;pavingTexture=t;return t;}
// Original meshes from the 2026/2023 photo brief. No reference pixels/textures.
export function createCastleAsomdwe(site,{detail='near'}={}){
 const medium=detail==='medium';return createMahamaNeighbourhood(site,{masses:CASTLE_BUILDINGS,baseGround:false,roofSubdivisions:1,
 renderMass(b,rings,k,h){const {plate,roof,faces,material,surface}=h;plate(rings,material(b.wallColor),b.wallHeight);roof(b,rings,material(b.roofColor,'roof-metal'));const pale=material('#ded9cb','paint'),dark=material('#536363','glass');faces(rings,f=>{const n=Math.max(1,Math.floor(f.len/4.5));for(let j=0;j<n;j++){const u=(j+.5)*f.len/n-f.len/2,y=2;const quad=(ma,w,ht,out)=>{const p=(x,Y)=>f.at(x,Y,out);surface([[p(u-w/2,y-ht/2),p(u+w/2,y-ht/2),p(u-w/2,y+ht/2)],[p(u+w/2,y-ht/2),p(u+w/2,y+ht/2),p(u-w/2,y+ht/2)]],ma);};quad(pale,1.5,1.6,.06);quad(dark,1.25,1.35,.08);}});return true;},
 decorate(k,h){const {material,plate,surface}=h,local=p=>areaLocal(site,p),yaw=ASOM_FRAME.rotation*Math.PI/180,pt=(x,y,z)=>{const [X,Z]=local(asomPoint(x,z));return [X,y,Z];},box=(ma,w,ht,d,x,y,z)=>{const o=k.box(ma,w,ht,d,...pt(x,y,z));o.rotation.y=yaw;return o;},mesh=(g,ma,x,y,z)=>k.mesh(g,ma,...pt(x,y,z));
 const white=material('#e4dfd2','paint'),dark=material('#353e3e','paint'),green=material('#477452','paint'),red=material('#ac443e','paint'),gold=material('#d0ad4e','paint'),blue=material('#3d7385','paint'),bronze=material('#98724f','metal'),soil=material('#a49b86','earth'),grass=material('#758164','grass'),paving=material('#c5b69b','tile');paving.map=paving.bumpMap=memorialPaving();paving.bumpScale=.004;paving.userData.textureMetres=1.2;
 const line=(ma,a,b,width=.04)=>{const A=new T.Vector3(...a),B=new T.Vector3(...b),dir=B.clone().sub(A),right=new T.Vector3(-dir.z,0,dir.x).normalize().multiplyScalar(width/2);if(right.lengthSq()<.001){right.set(width/2,0,0);}const p=A.clone().sub(right).toArray(),q=A.clone().add(right).toArray(),r=B.clone().sub(right).toArray(),s=B.clone().add(right).toArray();surface([[p,q,r],[q,s,r]],ma);};
 const tree=(p,i=0)=>{const [x,z]=local(p),ht=7.5+(i%3),trunk=material('#7b715c','wood');k.mesh(new T.CylinderGeometry(.17,.3,ht,medium?5:7),trunk,x,ht/2,z);k.mesh(new T.CylinderGeometry(.31,.34,1,6),white,x,.5,z);for(let j=0;j<(medium?1:3);j++){const o=k.mesh(new T.IcosahedronGeometry(1,medium?0:1),grass,x+(j-1)*1.2,ht-.7+j*.5,z+(j%2)*1.1);o.scale.set(4.5,2.3,3.7);}};
 for(const v of CASTLE_VERGES.filter(v=>v.zone===site.zone))plate(v.rings.map(r=>r.map(local)),soil,0,.035);
 if(site.zone!=='asomdwe'){for(const [i,t] of CASTLE_ROAD_TREES.filter(t=>t.zone===site.zone).entries())tree(t.position,i);return;}
 for(const g of ASOM_GROUND)plate(g.rings.map(r=>r.map(local)),g.kind==='grass'?grass:paving,0,g.kind==='grass'?.025:.045);
 // Native garden contours are low rock-bordered garden shapes, not 4.5 m houses.
 if(!medium)for(const f of ASOM_NATIVE_GARDENS){const rs=f.geometry.coordinates.map(r=>r.map(local));plate(rs,soil,.18,.01);for(const r of rs)for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i];line(white,[a[0],.23,a[1]],[b[0],.23,b[1]],.25);}}
 if(!medium)for(const [i,w] of ASOM_WALLS.entries()){
  const a=local(w.a),b=local(w.b);line(white,[a[0],.1,a[1]],[b[0],.1,b[1]],.25);
  if(medium)continue;
  for(const y of [.45,.95])line(green,[a[0],y,a[1]],[b[0],y,b[1]],.035);
  line(green,[a[0],0,a[1]],[a[0],1.05,a[1]],.055);
  surface([[[a[0],0,a[1]-.0275],[a[0],0,a[1]+.0275],[a[0],1.05,a[1]-.0275]],[[a[0],0,a[1]+.0275],[a[0],1.05,a[1]+.0275],[a[0],1.05,a[1]-.0275]]],green);
 }
 if(!medium)for(const [i,p] of ASOM_TREES.entries())tree(p,i);
 // Cream circulation strips and rectangular lawns/white edging seen in July 2026.
 for(let row=0;row<4;row++)for(const side of [-1,1]){const x=side*17,z=-12-row*10;box(grass,22,.035,6.5,x,.075,z);for(const dz of [-3.3,3.3])box(white,22.2,.14,.18,x,.1,z+dz);for(const dx of [-11,11])box(white,.18,.14,6.7,x+dx,.1,z);}
 // The ceremony's red carpet is temporary, so the permanent approach stays tiled.
 box(paving,7,.025,44,0,.075,-29);
 for(const s of ASOM_NAVIGATION.surfaces)box(white,s.w,s.y-s.base,s.d,s.x,(s.y+s.base)/2,s.z);
 box(dark,1.65,.78,2.6,0,1.19,.5);box(gold,1.35,.03,2.15,0,1.595,.5);
 for(const x of [-2.8,2.8])for(const z of [-2.4,2.4]){
  mesh(new T.CylinderGeometry(.23,.27,3.4,medium?6:10),white,x,2.5,z);box(white,.65,.18,.65,x,.92,z);box(white,.65,.18,.65,x,4.16,z);
 }
 box(white,7,.35,6.4,0,4.48,0);
 const profile=(ps,ma,z,depth=.12)=>{const s=new T.Shape(ps.map(([x,y])=>new T.Vector2(x,y))),g=medium&&depth<1?new T.ShapeGeometry(s):new T.ExtrudeGeometry(s,{depth,bevelEnabled:false,steps:1,curveSegments:medium?2:4});const o=k.mesh(g,ma,...pt(0,0,z));o.rotation.y=yaw;return o;};
 profile([[-3.7,4.62],[3.7,4.62],[0,5.7]],white,-3.3,6.6);
 box(white,52,2.1,.4,0,1.05,3.8);
 for(const side of [-1,1]){
  const flip=p=>p.map(([x,y])=>[x*side*.55,y]);
  profile(flip([[2.4,1.9],[5.1,6.7],[20.2,6.7],[21,6.3],[21,5.8],[20.2,5.2],[28,5.2],[25.5,1.9]]),red,4.6,.45);
  profile(flip([[3,1.9],[5.4,5.65],[17.7,5.65],[18.2,5.3],[18.2,4.8],[17.5,4.1],[25.7,4.1],[24.4,1.9]]),gold,4.55,.06);
  profile(flip([[4.1,1.9],[6.2,3.45],[15.5,3.45],[16.3,3.05],[16.3,2.4],[20.5,2.4],[20,1.9]]),green,4.48,.06);
  profile(flip([[.7,1.9],[5.1,8.6],[5.65,8.6],[2.1,1.9]]),white,4.35,.55);
  const star=[],cx=side*7.15,cy=4.95;for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.4:1;star.push([cx+Math.cos(a)*r,cy+Math.sin(a)*r]);}profile(star,dark,4.45,.025);
 }
 if(!medium)for(let i=-4;i<=4;i++)if(Math.abs(i)>0){const x=i*5.25,z=3.57;const ribbon=[[-.65,1.75],[-.8,1.65],[-.65,1.45],[-.42,.4],[-.15,.3],[.15,.3],[.42,.4],[.65,1.45],[.8,1.65],[.65,1.75]];for(let j=1;j<ribbon.length;j++)line(dark,pt(x+ribbon[j-1][0],ribbon[j-1][1],z),pt(x+ribbon[j][0],ribbon[j][1],z),.075);}
 for(const [i,p] of ASOM_POTS.entries()){
  if(medium&&i>=4)continue;
  const pot=material('#aa7955','paint');mesh(new T.CylinderGeometry(.7,.4,1.25,medium?6:10),pot,p.x,.7,p.z);if(!medium)mesh(new T.TorusGeometry(.67,.07,4,12),white,p.x,1.36,p.z).rotation.x=Math.PI/2;
  if(!medium)for(let j=0;j<7;j++){const a=j*Math.PI*2/7,q=pt(p.x,1.5,p.z),r=pt(p.x+Math.cos(a)*.75,1.85,p.z+Math.sin(a)*.75),s=pt(p.x+Math.cos(a+.4)*1.1,1.5,p.z+Math.sin(a+.4)*1.1);surface([[q,r,s]],grass);}
 }
 if(!medium)for(const p of ASOM_MARKERS){box(dark,1.4,1.1,1.4,p.x,.6,p.z);const cap=box(dark,1.4,.22,1.5,p.x,1.22,p.z);cap.rotation.x=-.25;}
 // Original, simplified bust on a dark plinth; exact portrait likeness is provisional.
 box(dark,1.8,1.5,1.7,-12,.8,-5);const torso=mesh(medium?new T.IcosahedronGeometry(1,0):new T.SphereGeometry(1,16,10),bronze,-12,2,-5);torso.scale.set(.72,.75,.38);mesh(new T.CylinderGeometry(.2,.24,.3,8),bronze,-12,2.5,-5);const head=mesh(medium?new T.IcosahedronGeometry(1,0):new T.SphereGeometry(1,16,12),bronze,-12,2.98,-5);head.scale.set(.33,.45,.32);const nose=mesh(new T.SphereGeometry(.09,6,4),bronze,-12,2.97,-5.31);nose.scale.z=1.5;
 if(!medium){for(const side of [-1,1])surface([[pt(-12,2.1,-5.38),pt(-12+side*.46,2.4,-5.27),pt(-12+side*.16,2.6,-5.27)]],gold);k.sign('JOHN EVANS ATTA MILLS',2.2,...pt(-12,1,-5.87),yaw+Math.PI);}
 for(const p of ASOM_LAMPS){if(medium)continue;mesh(new T.CylinderGeometry(.05,.08,7.8,6),blue,p.x,3.9,p.z);for(const side of [-1,1]){line(gold,pt(p.x,7.3,p.z),pt(p.x+side*.65,8,p.z),.045);surface([[pt(p.x+side*.65,8,p.z),pt(p.x+side*1.25,8.35,p.z-.15),pt(p.x+side*.9,8.0,p.z+.15)]],gold);}}
 for(const p of ASOM_SEATS){box(dark,2.6,.15,.65,p.x,.48,p.z);box(dark,2.6,.65,.12,p.x,.88,p.z+.3);for(const dx of [-1,1])box(green,.08,.5,.5,p.x+dx,.25,p.z);}
 // One static flag, without an extra animation/update pass.
 mesh(new T.CylinderGeometry(.035,.055,10,6),blue,0,5,5.6);for(const [i,ma] of [red,gold,green].entries())surface([[pt(0,9.6-i*.5,5.6),pt(3,9.45-i*.5,5.6),pt(0,9.1-i*.5,5.6)],[pt(3,9.45-i*.5,5.6),pt(3,8.95-i*.5,5.6),pt(0,9.1-i*.5,5.6)]],ma);
 }});
}
