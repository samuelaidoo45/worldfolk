import * as THREE from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface,contactShadow} from './graphics-materials.js';
export const VEHICLE_PALETTE=[0x174c89,0x9c172a,0x12624f,0xf0eee5,0x202631,0x7b8189,0xe7ad20,0x51326a];
function kit(color){
 const group=new THREE.Group(),paint=tagSurface(new THREE.MeshPhysicalMaterial({color,metalness:.27,roughness:.27,clearcoat:1,clearcoatRoughness:.16}),'paint'),glass=tagSurface(new THREE.MeshPhysicalMaterial({color:0x163749,metalness:.3,roughness:.12,clearcoat:1}),'glass'),rubber=tagSurface(new THREE.MeshStandardMaterial({color:0x141719,roughness:.88}),'rubber'),chrome=tagSurface(new THREE.MeshStandardMaterial({color:0xb8c2c9,metalness:.88,roughness:.22}),'metal'),headlight=new THREE.MeshStandardMaterial({color:0xe8f3ff,emissive:0xa6c5e0,emissiveIntensity:.4,roughness:.15}),tail=new THREE.MeshStandardMaterial({color:0xa40c15,emissive:0x8e0010,emissiveIntensity:.35,roughness:.2});
 const add=(geo,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o};
 const box=(m,w,h,d,x=0,y=h/2,z=0)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 function profile(points,width,m,bevel=.035){const shape=new THREE.Shape(points.map(([z,y])=>new THREE.Vector2(z,y)));const o=add(new THREE.ExtrudeGeometry(shape,{depth:width,bevelEnabled:true,bevelSize:bevel,bevelThickness:bevel,bevelSegments:3,steps:1}),m,width/2,0,0);o.rotation.y=-Math.PI/2;return o}
 function wheel(x,z,r=.34){
  const tire=add(new THREE.TorusGeometry(r*.77,r*.23,10,28),rubber,x,r,z);tire.rotation.y=Math.PI/2;
  const well=add(new THREE.CylinderGeometry(r*.82,r*.82,.18,24),rubber,x,r,z);well.rotation.z=Math.PI/2;
  const disc=add(new THREE.CylinderGeometry(r*.59,r*.59,.2,24),rubber,x,r,z);disc.rotation.z=Math.PI/2;
  const rim=add(new THREE.TorusGeometry(r*.63,r*.055,6,28),chrome,x+Math.sign(x)*.115,r,z);rim.rotation.y=Math.PI/2;for(let n=0;n<5;n++){const a=n*Math.PI*2/5,spoke=box(chrome,.027,r*.5,.055,x+Math.sign(x)*.12,r+Math.cos(a)*r*.34,z+Math.sin(a)*r*.34);spoke.rotation.x=a;}
  const hub=add(new THREE.CylinderGeometry(r*.18,r*.18,.23,16),rubber,x,r,z);hub.rotation.z=Math.PI/2;
 }
 function plate(x,y,z,rear=false){box(new THREE.MeshStandardMaterial({color:0xecebdc}),.39,.115,.035,x,y,z);if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=256;c.height=80;const ctx=c.getContext('2d');ctx.fillStyle='#e8e7d3';ctx.fillRect(0,0,256,80);ctx.fillStyle='#17252b';ctx.font='bold 44px sans-serif';ctx.textAlign='center';ctx.fillText('GR 2026',128,56);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;const o=add(new THREE.PlaneGeometry(.38,.11),new THREE.MeshStandardMaterial({map:t}),x,y,z+(rear?.022:-.022));if(!rear)o.rotation.y=Math.PI;}
 function finish(w,l){const o=add(new THREE.PlaneGeometry(w,l),new THREE.MeshBasicMaterial({map:contactShadow(),color:0x091211,transparent:true,opacity:.58,depthWrite:false}),0,.018,0);o.rotation.x=-Math.PI/2;o.castShadow=false;batchStaticMeshes(group);return {group}}
 return {group,paint,glass,rubber,chrome,headlight,tail,add,box,profile,wheel,plate,finish};
}
export function createCar(color=0x174c89,kind='car'){
 const k=kit(color),{paint,glass,rubber,chrome,headlight,tail,box,profile,add,wheel,plate}=k;
 const tall=kind==='suv'||kind==='van',van=kind==='van',pickup=kind==='pickup',hatch=kind==='hatchback',roofY=van?1.85:tall?1.7:1.46;
 // Side panels follow a continuous contour, with open wheel arches cut into the lower edge.
 const side=new THREE.Shape();side.moveTo(-1.78,.47);side.lineTo(-1.83,.69);side.quadraticCurveTo(-1.6,.85,-.9,.94);side.lineTo(.88,.94);side.quadraticCurveTo(1.65,.9,1.82,.7);side.lineTo(1.82,.47);side.lineTo(1.57,.47);side.absarc(1.17,.39,.43,.18,Math.PI-.18,false);side.lineTo(-.76,.47);side.absarc(-1.17,.39,.43,.18,Math.PI-.18,false);side.closePath();
 for(const x of [-.79,.79]){const o=add(new THREE.ExtrudeGeometry(side,{depth:.1,bevelEnabled:true,bevelSize:.025,bevelThickness:.02,bevelSegments:3}),paint,x+.05,0,0);o.rotation.y=-Math.PI/2;}
 box(rubber,1.37,.13,2.9,0,.4,0);profile([[-1.73,.78],[-1.35,.91],[-.78,.95],[.97,.95],[1.73,.78]],1.46,paint,.045);
 const a=van?-1.32:-1.01,b=van?-.98:-.55,c=pickup?-.08:van?1.31:hatch?.82:tall?.95:.5,e=pickup?.31:van?1.51:hatch?1.42:tall?1.4:1.08;
 profile([[a,.94],[b,roofY-.05],[c,roofY-.05],[e,.94]],1.29,glass,.026);
 profile([[b-.05,roofY-.07],[b+.08,roofY+.02],[c-.06,roofY+.02],[c+.08,roofY-.07]],1.36,paint,.035);
 for(const s of [-1,1]){
  const pillar=(z1,y1,z2,y2,width=.055)=>{const o=box(paint,width,Math.hypot(z2-z1,y2-y1),.07,s*.67,(y1+y2)/2,(z1+z2)/2);o.rotation.x=Math.atan2(z2-z1,y2-y1)};
  pillar(a,.94,b,roofY);pillar(e,.94,c,roofY);pillar(.08,.94,.08,roofY,.085);
  box(chrome,.035,.027,e-a,s*.704,.96,(e+a)/2);
  box(rubber,.026,.31,.012,s*.858,.75,.12);box(chrome,.05,.027,.17,s*.867,.87,.3);
  box(paint,.17,.12,.22,s*.93,1.02,a+.1);box(glass,.014,.075,.14,s*1.02,1.035,a+.12);
  for(const z of [-1.17,1.17])wheel(s*.86,z);
  box(headlight,.42,.14,.07,s*.57,.74,-1.79);box(tail,.36,.14,.07,s*.63,.77,1.79);
  box(headlight,.22,.045,.08,s*.59,.66,-1.81);box(rubber,.27,.075,.07,s*.6,.51,-1.78);
  const wiper=box(rubber,.49,.013,.017,s*.31,1.025,-.96);wiper.rotation.y=s*.13;
 }
 box(rubber,.8,.18,.075,0,.59,-1.83);for(const y of [.55,.6,.65])box(chrome,.77,.012,.09,0,y,-1.837);
 box(paint,1.6,.08,.12,0,.47,-1.77);box(paint,1.6,.08,.12,0,.47,1.77);plate(0,.55,1.85,true);plate(0,.49,-1.865);
 if(pickup){box(rubber,1.3,.07,1.3,0,.96,1.05);for(const s of [-1,1])box(paint,.13,.29,1.42,s*.76,1.07,1.01);box(paint,1.6,.29,.12,0,1.07,1.68)}
 if(tall)for(const s of [-1,1])box(chrome,.04,.06,1.76,s*.55,roofY+.12,.22);
 if(van){box(paint,1.38,.61,1.48,0,1.38,.74);for(const s of [-1,1])box(rubber,.02,.55,.015,s*.83,1.17,.22)}
 if(kind==='taxi'){const orange=new THREE.MeshPhysicalMaterial({color:0xee7c14,roughness:.3,clearcoat:1});for(const s of [-1,1])for(const z of [-1.4,1.4])box(orange,.02,.19,.45,s*.861,.8,z);box(orange,.43,.13,.2,0,roofY+.13,0);}
 k.group.userData.vehicleKind=kind;return k.finish(2.1,3.9);
}
export function createBus(){
 const k=kit(0xedece3),{paint,glass,rubber,chrome,headlight,tail,box,profile,wheel,plate}=k;
 profile([[-3.3,.55],[-3.37,1.2],[-3.05,2.7],[-2.87,2.84],[3.09,2.84],[3.32,2.62],[3.34,.55]],2.18,paint,.06);
 const stripe=new THREE.MeshPhysicalMaterial({color:0x1c6187,roughness:.33,clearcoat:.8});
 for(const s of [-1,1]){
  box(stripe,.018,.31,6.48,s*1.16,1.15,0);box(rubber,.025,.11,6.45,s*1.16,.68,0);
  for(let i=0;i<5;i++){const z=-2.4+i*1.18;box(rubber,.026,.99,1.07,s*1.16,2.15,z);box(glass,.029,.88,.94,s*1.178,2.15,z);box(chrome,.032,.017,.91,s*1.19,2.29,z)}
  for(const z of [-2.1,2.1])wheel(s*1.08,z,.48);
  box(headlight,.37,.22,.08,s*.76,.96,-3.38);box(tail,.19,.42,.08,s*.92,1.07,3.4);box(rubber,.09,.6,.11,s*1.245,2.02,-2.97);box(chrome,.22,.3,.08,s*1.19,2.14,-3.02);
 }
 const screen=box(glass,1.99,.94,.045,0,2.12,-3.24);screen.rotation.x=.2;box(rubber,.04,1,.05,0,2.1,-3.27);
 box(rubber,1.22,.32,.08,0,1.12,-3.4);for(const y of [1.03,1.11,1.19])box(chrome,1.12,.018,.09,0,y,-3.42);
 box(rubber,2.26,.19,.11,0,.62,-3.4);box(rubber,2.26,.19,.11,0,.62,3.4);box(glass,1.9,.76,.035,0,2.13,3.4);
 for(const x of [-.47,.47]){const w=box(rubber,.65,.025,.03,x,1.78,-3.36);w.rotation.z=x*.3;}
 box(rubber,.024,1.88,.88,1.196,1.57,-1.61);for(const z of [-1.82,-1.4])box(glass,.03,1.61,.36,1.213,1.68,z);box(chrome,.12,.08,.86,1.22,.69,-1.61);
 box(chrome,1.2,.16,1,0,2.97,.9);plate(0,.77,-3.46);plate(0,.9,3.48,true);k.group.userData.vehicleKind='bus';return k.finish(2.6,7.1);
}
