import * as T from './three.module.js';
import {islandEdge} from './airport-junction-data.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {batchStaticMeshes} from './render-utils.js';
// Aug 2024 landscape reconstruction. The small bust group is interpreted, not
// a facial scan or a claim of verified post-vandalism monument condition.
export function createAirportIsland(s){
 const group=new T.Group();group.name=s.name;
 const mat=(color,kind='stone')=>tagSurface(new T.MeshStandardMaterial({color,roughness:.9}),kind),grass=mat('#64794a','grass'),hedge=mat('#73913f','foliage'),purple=mat('#654158','foliage'),pale=mat('#d1ccba'),dark=mat('#414746'),drain=mat('#929184'),bronze=mat('#6b6049','metal'),steel=mat('#7a8079','metal'),yellow=mat('#d5ae48','paint');
 const box=(m,w,h,d,x,y,z,angle=0)=>{const mesh=new T.Mesh(new T.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.rotation.y=angle;mesh.castShadow=h>.4;mesh.receiveShadow=true;group.add(mesh);return mesh;};
 const oval=(m,x,y,z,rx,ry,rz)=>{const mesh=new T.Mesh(new T.SphereGeometry(1,12,8),m);mesh.position.set(x,y,z);mesh.scale.set(rx,ry,rz);mesh.castShadow=true;group.add(mesh);};
 const edge=islandEdge(s),shape=new T.Shape();edge.forEach(([x,z],i)=>i?shape.lineTo(x,-z):shape.moveTo(x,-z));const ground=new T.Mesh(new T.ShapeGeometry(shape),grass);ground.rotation.x=-Math.PI/2;ground.position.y=.075;ground.receiveShadow=true;group.add(ground);
 for(let i=1;i<edge.length;i++){const a=edge[i-1],b=edge[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),count=Math.ceil(len/1.3),angle=-Math.atan2(dz,dx);for(let j=0;j<count;j++){const t=(j+.5)/count,x=a[0]+dx*t,z=a[1]+dz*t,n=Math.hypot(x,z),outX=x/n,outZ=z/n;box((i+j)%2?dark:pale,len/count-.02,.2,.28,x,.1,z,angle);box(drain,len/count-.025,.06,.95,x+outX*.57,.05,z+outZ*.57,angle);box(dark,.03,.008,.8,x+outX*.57,.085,z+outZ*.57,angle);oval(hedge,x-outX*.75,.5,z-outZ*.75,.85,.43,.65);}}
 for(const radius of s.id==='airport-big-six-roundabout'?[4,6.2]:[4.5,7])for(let i=0;i<48;i++){const a=i/48*Math.PI*2;oval(s.id==='airport-big-six-roundabout'?purple:hedge,Math.cos(a)*radius,.25,Math.sin(a)*radius*.7,.42,.23,.32);}
 if(s.id==='airport-big-six-roundabout'){
  for(let i=0;i<6;i++){const x=-4.5+i%3*1.5,z=-3.2+Math.floor(i/3)*2;box(dark,1.05,1.45,1.05,x,.8,z);box(pale,.7,.24,.025,x,1,z-.54);oval(bronze,x,1.85,z,.44,.45,.27);box(bronze,.18,.3,.2,x,2.15,z);oval(bronze,x,2.48,z,.24,.33,.24);oval(bronze,x,2.4,z-.23,.07,.1,.08);}
  box(steel,.2,10,.2,4,5,1);box(steel,3,.13,.15,4,8.5,1);for(const x of [2.5,5.5])box(dark,.25,.25,.45,x,8.4,1);
 }else{box(pale,1.1,9.2,1.1,2,4.6,1);box(steel,12,.25,3.3,2,9.3,1);box(dark,12,3.3,.15,2,11,2.4);
  if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#193e3d';ctx.fillRect(0,0,1024,256);ctx.textAlign='center';ctx.fillStyle='#edc879';ctx.font='bold 40px sans-serif';ctx.fillText('WORLDFOLK · ACCRA',512,68);ctx.fillStyle='#f5f1df';ctx.font='bold 66px sans-serif';ctx.fillText('TERMINAL APPROACH',512,162);ctx.font='26px sans-serif';ctx.fillText('AIRPORT ROAD',512,216);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const m=new T.MeshStandardMaterial({map:texture,side:T.DoubleSide,roughness:.8});for(const side of [-1,1]){const plane=new T.Mesh(new T.PlaneGeometry(11.8,3.1),m);plane.position.set(2,11,2.4+side*.085);plane.rotation.y=side<0?Math.PI:0;group.add(plane);}}
 }
 // Direction chevrons are road furniture; no invented light-controlled crossing.
 box(yellow,2.1,.8,.08,-7,1.1,-4);for(const x of [-7.7,-7.1,-6.5]){const a=box(dark,.13,.48,.09,x,1.28,-4.05);a.rotation.z=-.65;const b=box(dark,.13,.48,.09,x,.94,-4.05);b.rotation.z=.65;}
 enhanceMaterials(group);batchStaticMeshes(group);group.userData.airportIsland={nativeRing:true,photoCapture:'2024-08',estimatedDimensions:true};return {group};
}
