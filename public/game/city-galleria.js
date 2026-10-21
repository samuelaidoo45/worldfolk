import * as T from './three.module.js';
import {CITY_GALLERIA,GALLERIA_OUTLINE,GALLERIA_PARKING} from './city-galleria-data.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface} from './graphics-materials.js';
import {createVehicle} from './accra-vehicles.js';
export function createCityGalleria(){
 const group=new T.Group();group.name='City Galleria · blue and white commercial wings';
 const mat=(color,kind='metal',extra={})=>tagSurface(new T.MeshStandardMaterial({color,roughness:.63,...extra}),kind);
 const white=mat('#d0d3d0'),blues=['#32718c','#275b77','#416d81','#3a7c8e'].map(c=>mat(c,'metal',{metalness:.35})),glass=mat('#294651','glass',{roughness:.17,metalness:.35,envMapIntensity:1.2}),steel=mat('#455356','metal',{metalness:.6,roughness:.4}),stone=mat('#b3ac98','stone'),pave=mat('#93948b','paving'),dark=mat('#27343a'),wood=mat('#896e51','wood'),green=mat('#507043','foliage');
 const mesh=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=y>.2;o.receiveShadow=true;group.add(o);return o;};
 const box=(m,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z);
 const body=new T.Shape(GALLERIA_OUTLINE.map(([x,z])=>new T.Vector2(x,-z)));const shell=mesh(new T.ExtrudeGeometry(body,{depth:20,bevelEnabled:false}),white,0,0,0);shell.rotation.x=-Math.PI/2;
 // Paneled facade strips follow the actual L footprint and a rounded inner bay.
 for(let i=0;i<GALLERIA_OUTLINE.length;i++){
  const a=GALLERIA_OUTLINE[i],b=GALLERIA_OUTLINE[(i+1)%GALLERIA_OUTLINE.length],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2,angle=-Math.atan2(dz,dx);
  const curved=i<9,blueWing=i===GALLERIA_OUTLINE.length-1||i===GALLERIA_OUTLINE.length-2||curved;
  const wall=new T.Group();wall.position.set(cx,0,cz);wall.rotation.y=angle+Math.PI;group.add(wall);
  const panel=(m,w,h,x,y,depth=.12,z=.09)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,depth),m);o.position.set(x,y,z);o.castShadow=false;o.receiveShadow=true;wall.add(o);return o;};
  const bays=Math.max(1,Math.ceil(len/(curved?1.8:4.5))),bay=len/bays;
  for(let floor=0;floor<5;floor++){
   const y=floor*3.8+1.9;
   for(let j=0;j<bays;j++){
    const x=-len/2+(j+.5)*bay,color=blueWing?blues[(j+floor)%4]:((j+floor*2)%5===0?blues[0]:white);
    panel(color,bay-.035,3.77,x,y);panel(glass,Math.max(.3,bay-.35),floor===0?2.55:1.35,x,y+(floor===0?0:.27),.06,.17);
    if(!curved){panel(steel,.045,floor===0?2.6:1.4,x,y+(floor===0?0:.27),.035,.21);panel(steel,bay-.26,.035,x,y+(floor===0?0:.27),.035,.21);}
    // White pinstripes, slim aluminium panel seams and alternating blue bands.
    if(blueWing&&!curved)for(const offset of [-1.6,1.6])panel(floor%2?blues[1]:white,bay-.04,.2,x,y+offset,.025,.18);
   }
   panel(steel,len,.05,0,floor*3.8+.04,.08,.2);
  }
  panel(white,len,.4,0,19.4,.24,.17);
  // Forecourt-side ground-floor columns under the glazed commercial wings.
  if(blueWing&&!curved)for(let j=0;j<=bays;j++)panel(white,.32,3.7,-len/2+j*bay,1.85,.55,.32);
 }
 // Grey forecourt stays within the photographed open side, clear of road lanes.
 const apron=new T.Shape([[-56,-17],[-18,-20],[-16,5],[-56,24]].map(([x,z])=>new T.Vector2(x,-z)));const ground=mesh(new T.ShapeGeometry(apron),pave,0,.035,0);ground.rotation.x=-Math.PI/2;
 for(let x=-54;x<-20;x+=1.5){const length=20;box(stone,.018,.003,length,x,.04,-4);}
 // Entrance canopy and tall mullions at the rounded lobby bay.
 const canopy=box(steel,1.9,.12,7,-15.5,3.45,-3);canopy.rotation.z=.025;
 for(const z of [-6.2,.2])box(white,.32,3.4,.32,-16,1.7,z);
 const glow=new T.MeshStandardMaterial({color:'#e9d9b0',emissive:'#e9d9b0',emissiveIntensity:.25});for(const z of [-5,-3,-1])box(glow,.25,.025,.6,-16,3.35,z);
 function sign(text,w,h,x,y,z,rotation=0){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');if(!ctx)return;ctx.fillStyle='#e5e7df';ctx.font='bold 70px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,68,1000);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,transparent:true,roughness:.7,side:T.DoubleSide}),x,y,z);o.rotation.y=rotation;}
 sign('CITY GALLERIA MALL',24,1.1,-40.56,18.5,19.47,-2.69);
 sign('CITY GALLERIA',8,.7,-16.6,3.02,-3,-Math.PI/2);
 // Rooftop furniture reflects the documented terrace use, not a specific event.
 for(const x of [-5,6])for(const z of [-24,-11]){box(wood,2,.1,1.2,x,20.8,z);for(const dx of [-1.65,1.65]){box(dark,.65,.45,1.3,x+dx,20.25,z);box(dark,.15,.7,1.3,x+dx+(dx<0?-.3:.3),20.7,z);}}
 for(const z of [-32,7])box(steel,22,.07,.06,1,21.1,z);
 for(const x of [-9,11]){box(steel,.07,.07,38,x,21.1,-12);for(const z of [-30,-20,-10,0])box(steel,.045,1.1,.045,x,20.55,z);}
 for(const [x,z] of [[-9,-30],[9,-30],[-9,4],[9,4]]){box(stone,1.2,.6,1.2,x,20.3,z);mesh(new T.SphereGeometry(.7,10,8),green,x,21,z);}
 batchStaticMeshes(group);
 const cars=GALLERIA_PARKING.map(b=>{const m=createVehicle(b.kind,b.color);m.group.position.set(b.x,0,b.z);m.group.rotation.y=-b.heading*Math.PI/180;group.add(m.group);return m;});
 group.userData.cityGalleria={sourceArea:2274907674,referenceMonth:'2024-08',floors:5,estimatedDimensions:true};
 return {group,update(t,p,context={}){for(const car of cars)car.animateVehicle?.({distance:0,preset:context.preset||'day'},0);}};
}
