import {T3_WORKS} from './airport-access-data.js';
import * as T from './three.module.js';
import {AIRPORT_T3,T3_SEATS,T3_SUPPORTS,T3_CARS} from './airport-t3-data.js';
import {t3Local,t3World} from './airport-t3-space.js';
import {T3_RINGS} from './airport-t3-map.js';
import {T3_DECK_SEGMENTS,T3_RAILS} from './airport-t3-roads.js';
import {createVehicle} from './accra-vehicles.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {batchStaticMeshes} from './render-utils.js';

export function createAirportT3(){
 const group=new T.Group(),building=new T.Group();group.name='Accra International Airport · Terminal 3';building.rotation.y=AIRPORT_T3.rotation*Math.PI/180;group.add(building);
 const mat=(color,kind='stone',roughness=.85,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),kind);
 const ivory=mat('#d5d7cf'),white=mat('#ecece4'),glass=mat('#365a6b','glass',.2,.65),cyan=mat('#7297ab','paint',.45,.25),blue=mat('#285479','paint',.5,.2),steel=mat('#8e9da2','metal',.45,.5),dark=mat('#23353f'),roof=mat('#b8c0c0','metal',.65,.3),asphalt=mat('#41494b','paint'),paving=mat('#a4a7a1','paving'),paint=mat('#f2efdc'),yellow=mat('#d7b342','paint'),wood=mat('#746653','wood'),leaf=mat('#4b6942','foliage');
 const light=new T.MeshStandardMaterial({color:'#efe4c8',emissive:'#e5c88c',emissiveIntensity:.35,roughness:.45});
 const mesh=(geo,m,x=0,y=0,z=0,parent=building)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const box=(m,w,h,d,x,y,z,parent=building)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
 const solid=(ring,h,m,y=0)=>{const g=new T.ExtrudeGeometry(new T.Shape(ring.slice(0,-1).map(([x,z])=>new T.Vector2(x,-z))),{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);return mesh(g,m,0,y,0);};
 const label=(text,w,h,x,y,z,{color='#f0e9d5',background='#213d4f',size=90,facing=Math.PI}={})=>{
  if(typeof document==='undefined')return;
  const c=document.createElement('canvas');c.width=2048;c.height=256;const ctx=c.getContext('2d');if(background){ctx.fillStyle=background;ctx.fillRect(0,0,c.width,c.height);}ctx.fillStyle=color;ctx.font=`600 ${size}px sans-serif`;ctx.textAlign='center';ctx.fillText(text,1024,160,1980);
  const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,transparent:!background,roughness:.7,side:T.DoubleSide}),x,y,z);o.rotation.y=facing;
 };
 const tube=(a,b,r=.12,m=steel,parent=building)=>{const aa=new T.Vector3(...a),bb=new T.Vector3(...b),d=bb.clone().sub(aa),o=mesh(new T.CylinderGeometry(r,r,d.length(),7),m,...aa.clone().add(bb).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());return o;};
 const clip=(ring,z,less)=>{const ps=ring.slice(0,-1),out=[],inside=p=>less?p[1]<=z:p[1]>=z;for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib){const t=(z-a[1])/(b[1]-a[1]);out.push([a[0]+(b[0]-a[0])*t,z]);}}return out.length?[...out,out[0]]:[];};
 const top=(ring,height,m)=>{if(ring.length<4)return;const g=new T.ShapeGeometry(new T.Shape(ring.slice(0,-1).map(([x,z])=>new T.Vector2(x,-z))));g.rotateX(-Math.PI/2);const p=g.getAttribute('position');for(let i=0;i<p.count;i++)p.setY(i,height(p.getZ(i)));g.computeVertexNormals();mesh(g,m);};
 const roofHeight=z=>14.8+3.4*Math.max(0,Math.cos((z+12)/58*Math.PI/2));
 const main=T3_RINGS[1197119150].map(t3Local),arrivals=T3_RINGS[2420073752].map(t3Local),core=clip(main,34.1,true),spine=clip(main,34.1,false);
 solid(core,14,ivory);solid(spine,8.9,white);
 // The central covered arrival space is open at ground level. The upper
 // volume is an interpreted departure level, rather than an invisible wall.
 solid(arrivals,7.9,ivory,6.1);top(arrivals,()=>6.1,ivory);
 const curtain=(ring,base,height)=>{
  const area=ring.slice(0,-1).reduce((n,a,i)=>n+a[0]*ring[i+1][1]-ring[i+1][0]*a[1],0),sign=area>0?1:-1;
  for(let i=0;i<ring.length-1;i++){
   const a=ring[i],b=ring[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<3)continue;const face=new T.Group();face.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);face.rotation.y=Math.atan2((b[1]-a[1])/len*sign,-(b[0]-a[0])/len*sign);building.add(face);
   const count=Math.max(1,Math.floor(len/3.1)),w=len/count;
   for(let j=0;j<count;j++){const x=(j+.5)*w-len/2;box(glass,w-.055,height-.5,.08,x,base+height/2,.07,face);box(steel,.07,height,.12,x-w/2,base+height/2,.14,face);for(let row=1;row<4;row++)box(steel,w,.07,.12,x,base+height*row/4,.14,face);}
   box(ivory,len,.65,.3,0,base+.32,.16,face);box(white,len,.4,.4,0,base+height-.2,.16,face);
  }
 };
 curtain(core,0,12.6);curtain(arrivals,6.1,6.5);curtain(spine,0,7.8);
 // Several short roof strips approximate the broad barrel profile. Geometry
 // follows the native outline, including the long airside gate pier.
 for(const ring of [core,arrivals])for(let z=-60;z<35;z+=5){const band=clip(clip(ring,z+5,true),z,false);top(band,roofHeight,roof);}
 top(spine,()=>9.35,roof);
 for(const x of [-28,12,52]){
  for(let z=-20;z<26;z+=4){const y=roofHeight(z)+.04,o=box(glass,4.8,.05,4.1,x,y,z);o.rotation.x=-Math.atan((roofHeight(z+1)-roofHeight(z-1))/2);for(const dx of [-2.5,2.5])box(steel,.08,.09,4.15,x+dx,y+.06,z);}
 }
 // Blue end cladding, broad cornice, and the white terminal identification.
 for(const x of [-46.9,85.5]){box(cyan,.28,10,15,x,8,-11);for(let z=-18;z< -3;z+=2.5)box(white,.35,10,.1,x,8,z);}
 box(blue,14,7,.2,70,10.2,-56.4);label('3',5,5,70,10.2,-56.56,{size:190});
 label('ACCRA INTERNATIONAL AIRPORT',70,2.4,8,17.1,-56.6,{background:null,size:104});
 label('TERMINAL 3 · DEPARTURES',33,1.5,8,8.7,-56.65);
 label('AKWAABA · ARRIVALS',25,1.5,8,4.4,-26.45,{color:'#dfb951',background:'#243b4a'});
 // Landside covered waiting area, with open pedestrian clearance below 6 m.
 top(arrivals,()=>.045,paving);
 for(const x of [-29,42])for(const z of [-54,-28])box(ivory,.7,5.7,.7,x,2.85,z);
 for(const x of [-26,-9,8,25,40]){box(steel,.12,.12,28,x,5.7,-41);for(const z of [-52,-39,-28])box(light,.8,.07,.8,x,5.5,z);}
 // Departure sidewalk and curved canopy arms sit above the covered arrivals.
 box(ivory,89,.4,12,13.5,5.8,-62.2);
 for(const x of [-30,-8,14,36,58]){
  tube([x,6,-67],[x,12,-63],.18);tube([x,10,-64.5],[x,13.8,-57],.13);
  const points=Array.from({length:13},(_,i)=>[x,13.1+.9*Math.sin(i/12*Math.PI),-69+i]);for(let i=1;i<points.length;i++)tube(points[i-1],points[i],.095);
 }
 for(let z=-69;z<=-57;z+=2)box(steel,91,.12,.12,13.5,13.6,z);
 box(railMaterial(),91,.12,12,13.5,13.75,-63);
 function railMaterial(){return new T.MeshStandardMaterial({color:'#a0bdc5',roughness:.25,metalness:.35,transparent:true,opacity:.5,side:T.DoubleSide});}
 // Mapped road profiles carry both this geometry and every vehicle's height.
 function roadStrip(s,width,ya,yb,m,side=0,depth=.04){const a=t3World(s.a),b=t3World(s.b),dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),nx=dz/length,nz=-dx/length,o=box(m,width,depth,Math.hypot(length,yb-ya),(a[0]+b[0])/2+nx*side,(ya+yb)/2,(a[1]+b[1])/2+nz*side,group);o.rotation.order='YXZ';o.rotation.y=-Math.atan2(dx,-dz);o.rotation.x=Math.atan2(yb-ya,length);}
 for(const s of T3_DECK_SEGMENTS){roadStrip(s,s.width+1,s.ya-.3,s.yb-.3,ivory,0,.6);roadStrip(s,s.width,s.ya+.025,s.yb+.025,asphalt);for(const side of [-1,1])roadStrip(s,.12,s.ya+.055,s.yb+.055,paint,side*(s.width/2-.4));}
 for(const r of T3_RAILS){const [x,z]=t3World(r.position),o=box(ivory,.25,.8,r.length,x,r.y+.42,z,group);o.rotation.y=-r.heading*Math.PI/180;}
 for(const p of T3_SUPPORTS)box(ivory,p.w,p.h,p.d,p.x,p.h/2,p.z);
 // The former car park is closed for redevelopment. This inset game cordon
 // leaves mapped outer circulation open; contractor perimeter is not surveyed.
 box(asphalt,215,.035,47,10,.015,-122.5);
 box(paving,8,.035,8,-94,.02,-149);
 box(paving,T3_WORKS.width,.05,T3_WORKS.depth,T3_WORKS.x,.045,T3_WORKS.z);
 const screen=mat('#6d7c7a','metal'),screenCap=mat('#a1aaa2','metal');
 for(const z of [T3_WORKS.z-T3_WORKS.depth/2,T3_WORKS.z+T3_WORKS.depth/2])for(let x=T3_WORKS.x-T3_WORKS.width/2+1.5;x<T3_WORKS.x+T3_WORKS.width/2;x+=3){box(screen,2.94,2.1,.13,x,1.05,z);box(screenCap,.08,2.2,.22,x-1.5,1.1,z);}
 for(const x of [T3_WORKS.x-T3_WORKS.width/2,T3_WORKS.x+T3_WORKS.width/2])for(let z=T3_WORKS.z-T3_WORKS.depth/2+1.45;z<T3_WORKS.z+T3_WORKS.depth/2;z+=2.9){box(screen,.13,2.1,2.85,x,1.05,z);box(screenCap,.22,2.2,.08,x,1.1,z-1.45);}
 label('FORMER CAR PARK · CLOSED',29,1.4,4,1.5,-111.9,{color:'#f3ca77',background:'#273a3d',facing:0});
 label('REDEVELOPMENT · USE PUBLIC APPROACH',30,.9,4,.55,-111.9,{color:'#fff5dc',background:'#273a3d',facing:0});
 for(const id of [2420018458,2420018460]){const ring=T3_RINGS[id].map(t3Local);top(ring,()=>3.6,blue);for(const p of [ring[0],ring[4]]){box(steel,.12,3.4,.12,p[0],1.7,p[1]+.4);}}
 // Crosswalk follows the mapped path, below the departure bridge.
 for(let z=-91;z<=-85;z+=.9)box(paint,3,.04,.38,43,.06,z);
 for(const p of T3_SEATS){box(steel,3,.15,.7,p.x,.47,p.z);box(steel,3,.55,.1,p.x,.85,p.z+.3);for(const dx of [-1.2,0,1.2])box(steel,.09,.4,.5,p.x+dx,.2,p.z);}
 for(const [x,z] of [[-80,-96],[92,-95]]){box(white,3,.45,2,x,.22,z);const bush=mesh(new T.SphereGeometry(1,8,6),leaf,x,.9,z);bush.scale.set(1.5,.7,1);}
 label('TERMINAL 3 · VISITOR GUIDE',5,.8,36,1.8,-95.5);
 label('PARKING UPDATE · FOLLOW ATTENDANTS',13,1.2,5,2,-99.5,{background:'#274c60'});
 for(const p of T3_CARS){const car=createVehicle(p.kind,p.color);car.group.position.set(p.x,.06,p.z);building.add(car.group);}
 // Six enclosed native gate links retain their own L-shaped outlines.
 for(const id of [2676037408,2676037410,2676037412,2676037414,2676037416,2676037418]){const ring=T3_RINGS[id].map(t3Local);solid(ring,3.6,white,4.8);curtain(ring,5.4,2.4);top(ring,()=>8.5,roof);}
 group.userData.airportT3={sourceIds:AIRPORT_T3.sourceIds,roof:'native-outline-estimated-barrel-profile',publicArea:'covered-arrivals-forecourt',privateInterior:false,liveFlightData:false,oldParking:'closed-2026-07-20',annexGeometry:'north-CIP-bounded-reference-model'};
 // Vehicle body profiles include untextured custom geometry. Supply planar
 // UVs before merging so a material batch never has partially missing UVs.
 group.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.getAttribute('position'),uv=o.geometry.getAttribute('uv');if(p&&(!uv||uv.count!==p.count)){const g=o.geometry.clone(),a=[];for(let i=0;i<p.count;i++)a.push(p.getX(i),p.getZ(i));g.setAttribute('uv',new T.Float32BufferAttribute(a,2));o.geometry=g;}});
 enhanceMaterials(group);batchStaticMeshes(group);return {group,update(){}};
}
