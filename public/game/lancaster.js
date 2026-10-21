import * as T from './three.module.js';
import {LANCASTER,LANCASTER_BODY,LANCASTER_CANOPY,LANCASTER_OUTLINE,LANCASTER_POOL,LANCASTER_TENNIS,LANCASTER_SOLIDS,lancasterLocal,lancasterPoint,lancasterRoadClear} from './lancaster-data.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';import {batchStaticMeshes} from './render-utils.js';
export function createLancaster(){
 const group=new T.Group(),root=new T.Group();root.rotation.y=LANCASTER.rotation*Math.PI/180;group.add(root);group.name=LANCASTER.name;
 const mat=(c,k='plaster',r=.8,m=0)=>tagSurface(new T.MeshStandardMaterial({color:c,roughness:r,metalness:m}),k),cream=mat('#e2d6ba'),trim=mat('#b8aa87'),dark=mat('#403930','wood'),glass=mat('#617d73','glass',.22,.35),metal=mat('#9eaaa5','metal',.4,.55),roof=mat('#675f50','roof'),terracotta=mat('#a57960','tile'),paving=mat('#aaa697','paving'),green=mat('#526d3c','foliage'),grass=mat('#738361','grass'),blue=mat('#5c7a81','paint'),white=mat('#eeece0'),water=mat('#359cae','water',.18,.15);
 const mesh=(g,m,x=0,y=0,z=0)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;root.add(o);return o},box=(m,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z);
 function poly(ring,m,height=0,y=0){const shape=new T.Shape(ring.slice(0,-1).map(([x,z])=>new T.Vector2(x,-z)));const g=height?new T.ExtrudeGeometry(shape,{depth:height,bevelEnabled:false}):new T.ShapeGeometry(shape);g.rotateX(-Math.PI/2);return mesh(g,m,0,y,0)}
 poly(LANCASTER_BODY,cream,11.5);poly(LANCASTER_CANOPY,cream,7.2,4.3);poly(LANCASTER_OUTLINE.map(lancasterLocal),roof,.16,11.5);
 // The native east passage stays open under the roof, including to vehicles.
 for(const [x,z] of [[64.1,-5.7],[75.6,-5.5],[64.1,16.1],[75.5,15.8]])box(trim,.5,4.3,.5,x,2.15,z);
 const ring=LANCASTER_OUTLINE.map(lancasterLocal),outward=ring.slice(1).reduce((a,p,i)=>a+ring[i][0]*p[1]-p[0]*ring[i][1],0)>0?-1:1;
 for(let i=1;i<ring.length;i++){
  const a=ring[i-1],b=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<5)continue;
  const wall=new T.Group();wall.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);wall.rotation.y=Math.atan2(-dz,dx);root.add(wall);
  function part(m,w,h,d,x,y,z){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z*outward);wall.add(o);return o}
  const n=Math.floor(len/4.5);for(let j=0;j<n;j++){const x=(j+.5)*len/n-len/2,openPassage=Math.min(a[0],b[0])>63;
   for(const y of [2,5.5,9]){if(openPassage&&y<4.3)continue;part(trim,3.9,2.7,.2,x,y,.05);part(glass,3.55,2.25,.24,x,y,.17);part(cream,.1,2.3,.27,x,y,.2);part(dark,3.5,.06,.28,x,y-1,.23);}
   // Distinctive dark X panels beneath the broad guest-room windows.
   for(const y of [3.7,7.2]){for(const r of [-.32,.32]){const o=part(dark,3.3,.085,.19,x,y,.23);o.rotation.z=r;}}
   part(cream,.32,11.5,.3,x-len/n/2,5.75,.2);
  }part(cream,len,.32,.45,0,11.5,0);
 }
 function gable(x,z,w,d,base,rise){const half=w/2,len=Math.hypot(half,rise),angle=Math.atan2(rise,half);for(const side of [-1,1]){const o=box(roof,len,.22,d,x+side*w/4,base+rise/2,z);o.rotation.z=-side*angle;for(let q=-d/2;q<=d/2;q+=2){const r=box(dark,len,.1,.1,x+side*w/4,base+rise/2+.15,z+q);r.rotation.z=-side*angle;}}const shape=new T.Shape([new T.Vector2(-half,0),new T.Vector2(half,0),new T.Vector2(0,rise)]);for(const zz of [-d/2,d/2]){const face=mesh(new T.ShapeGeometry(shape),new T.MeshStandardMaterial({color:'#6d8076',roughness:.3,metalness:.25,side:T.DoubleSide}),x,base,z+zz);for(let q=-half+2;q<half;q+=2)box(dark,.15,rise*(1-Math.abs(q)/half),.17,x+q,base+rise*(1-Math.abs(q)/half)/2,z+zz);}}
 // Tall timber atrium is photo-informed; its roof placement/height are estimates.
 gable(38,5,28,44,11.7,5);box(cream,28,.25,44,38,11.6,5);
 function sign(text,w,h,x,y,z,yaw=0){if(typeof document==='undefined')return;const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=200;const ctx=canvas.getContext('2d');ctx.fillStyle='#343a30';ctx.fillRect(0,0,1536,200);ctx.fillStyle='#ece2c5';ctx.font='bold 112px serif';ctx.textAlign='center';ctx.fillText(text,768,138,1480);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,roughness:.6,side:T.DoubleSide}),x,y,z);o.rotation.y=yaw;}
 sign('LANCASTER ACCRA',22,1.8,77,8,5,Math.PI/2);sign('RECEPTION →',5,.7,77.1,2.5,5,Math.PI/2);
 // Tight pedestrian paving only; keep the native driveway visible.
 for(let x=77;x<84;x++)for(let z=-1;z<38;z++)if(lancasterRoadClear(lancasterPoint(x,z),.75))box(paving,.98,.025,.98,x,.02,z);
 const pool=LANCASTER_POOL.map(lancasterLocal),cx=-15,cz=-20,deck=pool.map(([x,z])=>[cx+(x-cx)*1.18,cz+(z-cz)*1.1]);poly(deck,terracotta,0,.04);poly(pool,water,0,.07);
 for(let i=1;i<pool.length;i++){const a=pool[i-1],b=pool[i],len=Math.hypot(a[0]-b[0],a[1]-b[1]),o=box(blue,len,.14,.22,(a[0]+b[0])/2,.1,(a[1]+b[1])/2);o.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);}
 for(let i=0;i<10;i++){const a=i*Math.PI/5,o=mesh(new T.SphereGeometry(.75,8,5),blue,-15+1.7*Math.cos(a),.083,-20+1.7*Math.sin(a));o.scale.set(1,.008,.55);o.rotation.y=-a;}mesh(new T.CylinderGeometry(.65,.65,.008,14),green,-15,.087,-20);
 function palm(x,z,h=8){mesh(new T.CylinderGeometry(.18,.32,h,7),dark,x,h/2,z);for(let j=0;j<8;j++){const a=j*Math.PI/4,leaf=mesh(new T.SphereGeometry(1,9,5),green,x+1.2*Math.cos(a),h-.4,z+1.2*Math.sin(a));leaf.scale.set(2.5,.13,.55);leaf.rotation.y=-a;leaf.rotation.z=.14;}}
 for(const [x,z] of [[-30,-9],[-30,-32],[-36,-22],[-17,-40],[-2,-48],[57,-39],[60,34]])palm(x,z,7+(Math.abs(x)%4));
 for(const [x,z] of [[-31,-9],[-31,-31],[-15,-37]]){box(dark,1.1,.25,2.3,x,.25,z);box(white,1,.1,2.2,x,.43,z);mesh(new T.CylinderGeometry(.035,.035,2.6,6),metal,x,1.3,z-1);mesh(new T.ConeGeometry(1.8,.6,12),white,x,2.7,z-1);}
 // Native tennis court remains at the actual mapped position.
 const court=LANCASTER_TENNIS.map(lancasterLocal);poly(court,green,0,.035);const centre=court.slice(0,-1).reduce((v,p)=>v.map((n,i)=>n+p[i]/4),[0,0]);box(blue,24,.016,11,centre[0],.05,centre[1]);for(const dz of [-5.4,5.4])box(white,23.8,.025,.08,centre[0],.07,centre[1]+dz);for(const dx of [-11.8,0,11.8])box(white,.08,.025,10.8,centre[0]+dx,.07,centre[1]);box(metal,.04,.8,11,centre[0],.45,centre[1]);
 for(const p of LANCASTER_SOLIDS){if(p.id==='forecourt-seat'){box(dark,p.w,.16,p.d,p.x,.46,p.z);box(dark,p.w,.55,.12,p.x,.8,p.z+.28);for(const dx of [-1,1])box(metal,.1,.4,.5,p.x+dx,.2,p.z);}else if(p.id==='directory'){box(metal,.08,1.9,.08,p.x,.95,p.z);sign('HOTEL VISITOR GUIDE',2.7,.65,p.x,1.55,p.z-.1,Math.PI);}}
 group.userData.lancaster={nativeBuilding:477043780,nativePool:501956300,nativeCourt:477044060,surveyed:false,roof:'photo-informed estimated height and placement',publicRooms:['lobby','branche','cafe','garden']};enhanceMaterials(group);batchStaticMeshes(group);return {group,update(){}};
}
