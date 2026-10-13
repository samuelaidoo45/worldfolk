import {createAccraMall} from './accra-mall.js';
import * as THREE from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {surfaceTexture} from './graphics-materials.js';
// Reference-led geometry; geographic rings keep large complexes on their real plots.
export function createPopularLandmark(data){
 if(data.id==='accra-mall')return createAccraMall(data);
 const group=new THREE.Group();group.name=data.name;
 const mat=(color,roughness=.78,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
 const cream=mat('#e5dcc4'),white=mat('#f2efe5'),stone=mat('#b5ac96'),red=mat('#984b35'),ochre=mat('#d0a94e'),dark=mat('#343937'),glass=mat('#244752',.18,.35),metal=mat('#6f7a7c',.36,.55),green=mat('#477551'),water=mat('#357e83',.2,.25);
 cream.bumpMap=surfaceTexture('stone');cream.bumpScale=.018;
 const add=(geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o};
 const box=(m,w,h,d,x=0,y=h/2,z=0)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 const cyl=(m,r,h,x=0,y=h/2,z=0,rt=r)=>add(new THREE.CylinderGeometry(rt,r,h,40),m,x,y,z);
 const dome=(m,r,x,y,z,sy=1)=>{const o=add(new THREE.SphereGeometry(r,40,20,0,Math.PI*2,0,Math.PI/2),m,x,y,z);o.scale.y=sy;return o};
 const sign=(text,w,x,y,z,color='#f7eaca')=>{if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.clearRect(0,0,1024,128);ctx.fillStyle=color;ctx.font='600 70px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,88,1000);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;add(new THREE.PlaneGeometry(w,w/8),new THREE.MeshStandardMaterial({map:t,transparent:true,depthWrite:false,roughness:1}),x,y,z)};
 const local=p=>[(p[0]-data.position[0])*111320*Math.cos(data.position[1]*Math.PI/180),-(p[1]-data.position[1])*111320];
 const rings=data.rings.map(r=>r.map(local));
 function footprint(height,material=cream){
  const shape=new THREE.Shape(rings[0].map(([x,z])=>new THREE.Vector2(x,-z)));
  for(const hole of rings.slice(1))shape.holes.push(new THREE.Path(hole.map(([x,z])=>new THREE.Vector2(x,-z))));
  const mesh=add(new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false}),material);mesh.rotation.x=-Math.PI/2;
  const roof=add(new THREE.ShapeGeometry(shape),stone,0,height+.025,0);roof.rotation.x=-Math.PI/2;
  return rings;
 }
 function facade(height,{material=cream,spacing=3.6,windowW=1.7,windowH=1.7,floors=Math.max(1,Math.floor(height/3.4)),balcony=false,arched=false}={}){
  footprint(height,material);
  for(const ring of rings)for(let i=1;i<ring.length;i++){
   const [a,b]=[ring[i-1],ring[i]],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<2)continue;
   const angle=Math.atan2(dx,dz),n=Math.max(1,Math.floor(len/spacing));
   for(let f=0;f<floors;f++)for(let j=0;j<n;j++){
    const t=(j+.5)/n,x=a[0]+dx*t,z=a[1]+dz*t,y=1.8+f*(height/floors);
    if(arched){
     const aw=Math.min(windowW,len/n*.75),ah=windowH,shape=new THREE.Shape();shape.moveTo(-aw/2,0);shape.lineTo(aw/2,0);shape.lineTo(aw/2,ah-aw/2);shape.absarc(0,ah-aw/2,aw/2,0,Math.PI,false);shape.closePath();
     const pane=add(new THREE.ExtrudeGeometry(shape,{depth:.2,bevelEnabled:true,bevelSize:.06,bevelThickness:.04,bevelSegments:2}),glass,x,y-ah/2,z);pane.rotation.y=angle+Math.PI/2;continue;
    }
    const frame=box(white,.15,windowH+.26,Math.min(windowW+.22,len/n*.85),x,y,z);frame.rotation.y=angle;
    const pane=box(glass,.18,windowH,Math.min(windowW,len/n*.75),x,y,z);pane.rotation.y=angle;
   }
   for(let f=1;f<=floors;f++){const ledge=box(white,balcony?1.4:.26,.2,len,a[0]+dx/2,f*height/floors-.15,a[1]+dz/2);ledge.rotation.y=angle;}
  }
 }
 function roof(w,d,x,y,z){const s=new THREE.Shape([new THREE.Vector2(-w/2,0),new THREE.Vector2(0,Math.min(3,w*.18)),new THREE.Vector2(w/2,0)]);const o=add(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}),red,x,y,z-d/2);return o}
 const w=data.width,d=data.depth,h=data.height;
 switch(data.model){
 case 'lighthouse':
  cyl(white,3.3,20,0,10,0,2.65);cyl(red,3.13,5,0,9,0,2.97);cyl(red,2.86,4.5,0,18,0,2.68);
  cyl(white,3.6,.45,0,21,0);cyl(dark,2.2,3.5,0,23,0);cyl(glass,2.3,2.3,0,23.1,0);cyl(red,3,.7,0,25,0,2.1);cyl(dark,.08,3,0,26.5,0);
  for(let i=0;i<16;i++){const a=i*Math.PI/8;box(dark,.08,1,.08,Math.sin(a)*3.4,21.6,Math.cos(a)*3.4)}
  add(new THREE.TorusGeometry(3.4,.065,6,48),dark,0,22.1,0).rotation.x=Math.PI/2;
  for(let y=4;y<20;y+=5)box(dark,.65,1.25,.08,0,y,3.2-y*.027);
  box(dark,1.15,2.3,.12,0,1.15,3.3);break;
 case 'mausoleum':{
  box(stone,22,.7,22);const shape=new THREE.Shape();shape.moveTo(8,0);shape.bezierCurveTo(4,8,1.5,13,1.5,21);shape.lineTo(5,21);shape.bezierCurveTo(4,12,7,5,10,0);shape.closePath();
  for(let i=0;i<4;i++){const o=add(new THREE.ExtrudeGeometry(shape,{depth:5,bevelEnabled:true,bevelSize:.15,bevelThickness:.1,bevelSegments:2}),white);o.rotation.y=i*Math.PI/2;o.translateZ(-2.5)}
  cyl(dark,2.1,5,0,2.9,0);box(white,6.3,.6,6.3,0,21.7,0);break;}
 case 'theatre':{
  // Three sculptural, canted shell volumes and the tall stage tower.
  box(glass,w*.8,7,d*.7,0,3.5,0);box(stone,w*.9,1,d*.85,0,.5,0);
  const shell=(rx,rz,x,z,turn,height)=>{const g=new THREE.Group();group.add(g);g.position.set(x,0,z);g.rotation.y=turn;
   const pts=[];for(let i=0;i<=20;i++){const t=i/20;pts.push(new THREE.Vector2(rx*(.68+.32*Math.sin(t*Math.PI/2)),4+t*height))}
   const shellGeo=new THREE.LatheGeometry(pts,48),vertices=shellGeo.attributes.position;for(let i=0;i<vertices.count;i++)vertices.setY(i,vertices.getY(i)+vertices.getX(i)*.08*Math.max(0,(vertices.getY(i)-4)/height));shellGeo.computeVertexNormals();const o=new THREE.Mesh(shellGeo,white);o.scale.z=rz/rx;o.material.side=THREE.DoubleSide;g.add(o);
   const cap=new THREE.Mesh(new THREE.CylinderGeometry(rx,rx,.65,48),white);cap.scale.z=rz/rx;cap.position.y=4+height;cap.rotation.z=.08;g.add(cap);
   const band=new THREE.Mesh(new THREE.CylinderGeometry(rx*.68,rx*.68,3,48),glass);band.scale.z=rz/rx;band.position.y=4.2;g.add(band);
  };
  shell(w*.25,d*.31,-w*.2,d*.08,-.3,18);shell(w*.22,d*.29,w*.24,d*.03,.55,22);shell(w*.23,d*.28,-w*.02,-d*.24,.9,25);
  box(white,w*.19,30,d*.25,w*.14,15,-d*.25);for(let n=0;n<5;n++)box(stone,w*.38,.3,2,0,.3+n*.3,d*.44+n*1.5);
  sign('NATIONAL THEATRE',27,0,7,d*.4);break;}
 case 'mosque':{
  facade(13,{spacing:5,windowW:2,windowH:4,floors:2,arched:true});
  metal.roughness=.62;metal.metalness=.25;const r=Math.min(w,d)*.19;dome(metal,r,0,16,0,.85);cyl(cream,r*1.05,4,0,14,0);
  for(const [x,z] of [[-r*1.3,0],[r*1.3,0],[0,-r*1.3],[0,r*1.3]])dome(metal,r*.65,x,13,z,.8);
  for(const x of [-w*.41,w*.41])for(const z of [-d*.4,d*.4]){cyl(cream,1.65,28,x,14,z,1.05);for(const y of [18,24])cyl(white,2.1,.65,x,y,z);cyl(metal,1.2,6,x,31,z,.06);cyl(ochre,.08,1,x,34.5,z)}
  sign('GHANA NATIONAL MOSQUE',30,0,10,d*.5+.1);break;}
 case 'library':
  facade(9,{spacing:4,windowW:1.6,windowH:2.5,floors:2});roof(w*.92,d*.25,0,9,-d*.28);roof(w*.92,d*.25,0,9,d*.28);
  box(cream,12,20,15,0,10,d*.26);roof(14,17,0,20,d*.26);cyl(dark,2.2,.18,0,16,d*.26+7.6).rotation.x=Math.PI/2;cyl(white,1.92,.19,0,16,d*.26+7.62).rotation.x=Math.PI/2;
  box(dark,.11,1.3,.04,0,16.5,d*.26+7.74);box(dark,1.1,.1,.04,.5,16,d*.26+7.74);sign('BALME LIBRARY',10,0,6,d*.5+.1);break;
 case 'mall':
  facade(7,{spacing:12,windowW:5,windowH:3,floors:1});
  for(let z=-d*.35;z<d*.4;z+=22)box(metal,w*.78,.6,13,0,7.5,z);
  {const awning=add(new THREE.CylinderGeometry(17,17,54,40,1,true,0,Math.PI),metal,0,7,d*.43);awning.rotation.z=Math.PI/2;awning.scale.x=.25;}
  for(const x of [-24,24])box(white,.7,9,.7,x,4.5,d*.45);sign('ACCRA MALL',35,0,6,d*.5+.2,'#153e54');break;
 case 'glass-mall':
  facade(18,{material:white,spacing:3,windowW:2.4,windowH:2.7,floors:4});for(let f=1;f<5;f++)box(red,w*.7,.6,.6,0,f*3.5,d*.5+.2);sign('MARINA MALL',28,0,15,d*.5+.4,'#bb322d');break;
 case 'market':
  facade(13,{material:ochre,spacing:3.5,windowW:2.6,windowH:2.4,floors:3,balcony:true});
  for(let x=-w/2+2;x<w/2;x+=5)box(red,.4,13,.4,x,6.5,d/2+.7);box(red,w,1.4,1,0,13.3,d/2);sign('KANESHIE MARKET',40,0,11,d/2+1.3);break;
 case 'cathedral':
  facade(9,{material:mat('#93583f'),spacing:4,windowW:1.2,windowH:3.8,floors:1,arched:true});roof(w*.7,d*.85,0,9,0);box(mat('#a1674b'),8,18,8,0,9,d*.36);
  for(const x of [-3.6,3.6])for(const z of [d*.36-3.6,d*.36+3.6])box(cream,.7,20,.7,x,10,z);
  box(dark,2,5,.15,0,13,d*.36+4.05);box(white,.3,3,.3,0,20.5,d*.36);box(white,1.8,.3,.3,0,21,d*.36);break;
 case 'modern-church':
  facade(10,{material:white,spacing:4.5,windowW:1,windowH:6,floors:1});roof(w*.78,d*.9,0,10,0);box(white,4,21,5,w*.35,10.5,d*.35);box(dark,2,6,5.1,w*.35,16,d*.35);box(white,.35,4,.35,w*.35,23,d*.35);box(white,2,.35,.35,w*.35,24,d*.35);break;
 case 'museum':
  footprint(4,white);cyl(white,Math.min(w,d)*.35,3);cyl(glass,Math.min(w,d)*.35,1.5,0,4.25,0);dome(stone,Math.min(w,d)*.36,0,5,0,.32);
  for(let i=0;i<32;i++){const a=i*Math.PI/16;box(white,.6,5,.6,Math.sin(a)*25,2.5,Math.cos(a)*25)}sign('NATIONAL MUSEUM',24,0,4,d*.49);break;
 case 'stadium':
  // Mapped west grandstand: stepped coloured seating faces the pitch to the east.
  footprint(3,stone);
  for(let row=0;row<18;row++){const x=w*.44-row*w*.044,y=1+row*.9;box(stone,w*.045,.95,d*.94,x,y,0);box([green,ochre,red][Math.floor(row/6)],w*.027,.24,d*.91,x,y+.57,0)}
  box(white,w*.6,.8,d, -w*.15,21.7,0);
  for(let z=-d*.43;z<d*.48;z+=12)box(cream,.6,21,.6,-w*.43,10.5,z);
  break;
 case 'stool-palace':{
  footprint(5,stone);box(glass,w*.68,18,d*.68,0,14,0);
  for(let x=-w*.34;x<w*.35;x+=3.2)for(const z of [-d*.34,d*.34])box(cream,.7,18,.5,x,14,z);
  for(let y=7;y<24;y+=3)box(cream,w*.7,.5,d*.7,0,y,0);
  const s=new THREE.Shape();s.moveTo(-w*.48,5);s.quadraticCurveTo(0,-8,w*.48,5);s.lineTo(w*.48,7);s.quadraticCurveTo(0,-5,-w*.48,7);s.closePath();add(new THREE.ExtrudeGeometry(s,{depth:d*.72,bevelEnabled:false}),ochre,0,24,-d*.36);break;}
 case 'castle':
  facade(10,{material:white,spacing:7,windowW:1,windowH:1.7,floors:2});roof(w*.7,d*.2,0,10,-d*.28);roof(w*.7,d*.2,0,10,d*.28);
  for(const x of [-w*.4,w*.4])for(const z of [-d*.38,d*.38]){box(white,10,14,10,x,7,z);box(stone,10.5,.5,10.5,x,14,z)}break;
 case 'hotel':
  facade(28,{material:cream,spacing:3.6,windowW:2.6,windowH:2.1,floors:7,balcony:true});box(white,w*.86,1,d*.86,0,28.7,0);sign('MÖVENPICK',26,0,26,d*.5+.9);break;
 case 'courtyard-hotel':
  facade(21,{material:mat('#c8bca0'),spacing:3.5,windowW:2.2,windowH:2.6,floors:5,balcony:true});box(stone,w+1,1,d+1,0,21.5,0);sign('KEMPINSKI',Math.min(20,w),0,19,d*.5+.8);break;
 default:facade(h);
 }
 group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});batchStaticMeshes(group);return {group};
}
