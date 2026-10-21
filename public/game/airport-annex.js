import * as T from './three.module.js';
import {AIRPORT_ANNEX,ANNEX_GATES,ANNEX_BAYS,ANNEX_CARS,ANNEX_FURNITURE,annexLocal} from './airport-annex-data.js';
import {createVehicle} from './accra-vehicles.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {batchStaticMeshes} from './render-utils.js';
export function createAirportAnnex(){
 const group=new T.Group();group.name=AIRPORT_ANNEX.name;
 const mat=(c,k='paint',r=.8,m=0)=>tagSurface(new T.MeshStandardMaterial({color:c,roughness:r,metalness:m}),k);
 const asphalt=mat('#45494b','asphalt'),white=mat('#e5e3d8'),black=mat('#242a2c'),red=mat('#a2463c'),green=mat('#4f894a'),paving=mat('#9b9e98','paving'),glass=mat('#43616b','glass',.2,.45),metal=mat('#667478','metal',.45,.5),yellow=mat('#d6b64f'),blue=mat('#24526b');
 function box(m,w,h,d,x,y,z,parent=group){const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
 function strip(a,b,width,m,y=.08){const dx=b[0]-a[0],dz=b[1]-a[1],o=box(m,width,.035,Math.hypot(dx,dz),(a[0]+b[0])/2,y,(a[1]+b[1])/2);o.rotation.y=Math.atan2(dx,dz);return o;}
 function sign(text,w,h,x,y,z,rotation=0,bg='#213d46',color='#f1e9cd'){
  if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,1024,160);ctx.fillStyle=color;ctx.font='bold 80px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,110,990);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.7,side:T.DoubleSide}));o.position.set(x,y,z);o.rotation.y=rotation;group.add(o);
 }
 box(asphalt,36,.06,34,0,.015,0);
 for(const z of [-15.5,15.5])box(paving,36,.09,3,0,.045,z);
 // Open gates join existing native service roads; raised booms never seal the lane.
 for(const g of ANNEX_GATES){const c=annexLocal(g.connection);strip([g.x,g.z],c,6.5,asphalt,.11);const a=g.heading*Math.PI/180,gate=new T.Group();gate.position.set(g.x,0,g.z);gate.rotation.y=-a;group.add(gate);
  for(const side of [-1,1]){box(white,.32,.16,5.2,side*3.3,.08,0,gate);box(metal,.28,3.7,.28,side*3.4,1.85,0,gate);}box(blue,7.4,.7,.15,0,3.5,0,gate);
  box(white,.12,3.1,.12,2.9,1.8,0,gate);for(let y=.5;y<3;y+=.55)box(red,.14,.2,.14,2.9,y+.3,0,gate);
  sign(g.label,6.7,.52,g.x,3.5,g.z,g.heading===90?Math.PI/2:g.heading===270?-Math.PI/2:Math.PI);
  if(g.exits)sign('EXIT ←',2.3,.65,g.x,1.8,g.z+3,Math.PI/2,'#e4e3d6','#202629');
 }
 for(const bay of ANNEX_BAYS){for(const dx of [-bay.width/2,bay.width/2])box(white,.07,.025,bay.depth,bay.x+dx,.065,bay.z);box(white,bay.width,.025,.07,bay.x,.065,bay.z+(bay.z<0?-1:1)*bay.depth/2);box(black,1.65,.13,.18,bay.x,.1,bay.z+(bay.z<0?-1:1)*2.15);}
 // Centre aisle and turn arrows are geometry, visible without texture downloads.
 function arrow(x,z,angle){const p=new T.Group();p.position.set(x,.11,z);p.rotation.y=angle;group.add(p);box(white,.14,.025,1.8,0,0,.2,p);const shape=new T.Shape().moveTo(-.55,0).lineTo(.55,0).lineTo(0,1).closePath(),geo=new T.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);const o=new T.Mesh(geo,white);o.position.z=-.7;p.add(o);}
 arrow(-8,-1,Math.PI/2);arrow(8,1,Math.PI*1.5);arrow(0,11,0);
 for(let x=-17.5;x<18;x+=1){if(Math.abs(x)<3.5)continue;box(Math.floor(x)%2?black:white,.95,.16,.3,x,.12,-17);box(Math.floor(x)%2?black:white,.95,.16,.3,x,.12,17);}
 for(let z=-13.5;z<14;z++){if(Math.abs(z)<3.5)continue;for(const x of [-18,18])box(z%2?red:white,.3,.16,.95,x,.12,z);}
 // Video: pale ticket huts, green/black dispensers and white exit wall with chevrons.
 for(const p of ANNEX_FURNITURE){if(p.id.startsWith('booth')){box(white,p.w,p.h,p.d,p.x,p.h/2,p.z);box(blue,p.w+.3,.16,p.d+.3,p.x,p.h,p.z);for(const side of [-1,1])box(glass,p.w-.3,.9,.04,p.x,1.65,p.z+side*(p.d/2+.025));box(glass,.04,.9,p.d-.3,p.x+p.w/2+.025,1.65,p.z);}
  if(p.id.startsWith('ticket')){box(green,p.w,p.h,p.d,p.x,p.h/2,p.z);box(black,p.w+.03,.54,p.d+.03,p.x,1.08,p.z);box(glass,.28,.16,.03,p.x,1.15,p.z-.3);box(white,.24,.035,.03,p.x,.83,p.z-.3);}
 }
 box(white,27,1.65,.18,0,.825,-17.2);for(const x of [-9,0,9])sign('◀◀ EXIT',7,.8,x,1.05,-17.09,0,'#deded2','#202526');
 const seat=ANNEX_FURNITURE.find(p=>p.id==='seat');box(metal,3,.12,.65,seat.x,.47,seat.z);box(metal,3,.55,.1,seat.x,.85,seat.z+.3);for(const dx of [-1.2,1.2])box(metal,.09,.4,.5,seat.x+dx,.2,seat.z);
 box(metal,.08,2.1,.08,13.5,1.05,16);sign('PARKING ANNEX · VISITOR GUIDE',3.4,.7,13.5,1.75,15.9,Math.PI);
 for(const x of [-4,4]){box(white,1.2,.5,1,x,.25,-14.6);box(green,.8,.3,.7,x,.6,-14.6);}
 for(const p of ANNEX_CARS){const car=createVehicle(p.kind,p.color);car.group.position.set(p.x,.065,p.z);car.group.rotation.y=-p.heading*Math.PI/180;group.add(car.group);}
 group.userData.airportAnnex={reference:'GACL directional video 2026',location:'north/CIP — user confirmed',layout:'bounded interpretation; perimeter/bays/gate offsets estimated',entries:3,exits:2,bays:ANNEX_BAYS.length,privateInterior:false};
 group.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.getAttribute('position'),uv=o.geometry.getAttribute('uv');if(p&&(!uv||p.count!==uv.count)){const g=o.geometry.clone(),a=[];for(let i=0;i<p.count;i++)a.push(p.getX(i),p.getZ(i));g.setAttribute('uv',new T.Float32BufferAttribute(a,2));o.geometry=g;}});enhanceMaterials(group);
 // Cars share trim/glass/tyre materials so parked scenery batches together.
 const shared=new Map();group.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const m=o.material,key=JSON.stringify([m.type,m.color?.getHex(),m.emissive?.getHex(),m.emissiveIntensity,m.roughness,m.metalness,m.opacity,m.transparent,m.side,m.depthWrite,m.map?.uuid,m.normalMap?.uuid,m.roughnessMap?.uuid]);if(shared.has(key))o.material=shared.get(key);else shared.set(key,m);});
 batchStaticMeshes(group);return {group,update(){}};
}
