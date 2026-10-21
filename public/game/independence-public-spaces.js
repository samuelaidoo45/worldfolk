import * as T from './three.module.js';
import {SPACE_EGG,SPACE_SERVICE,SPACE_PLAY,SPACE_LIGHTS,SPACE_FENCES,SPACE_VERGES,SPACE_PATH_PIECES,SPACE_COURTS,SPACE_CROSSINGS,SPACE_PLAY_BARRIERS} from './independence-public-space-data.js';
import {offsetMetres} from './motion.js';

// Built and batched once with its parent landmark; no frame callback, new
// textures, GPU lights or reference-image pixels are required by this detail.
export function decorateCivicSpace(site,k,h){
 if(!['park','stadium'].includes(site.zone))return;
 const {material,local}=h,profiles=new Map();
 function geometryMaterial(geo,ma){
  const color=ma.color,values=new Float32Array(geo.getAttribute('position').count*3);for(let i=0;i<values.length;i+=3){values[i]=color.r;values[i+1]=color.g;values[i+2]=color.b;}geo.setAttribute('color',new T.BufferAttribute(values,3));
  const key=[ma.userData.surface,ma.roughness,ma.metalness,ma.emissive.getHex(),ma.emissiveIntensity].join(':');
  if(!profiles.has(key)){const m=ma.clone();m.color.set('#ffffff');m.vertexColors=true;profiles.set(key,m);}return profiles.get(key);
 }
 const mesh=(geo,ma,x=0,y=0,z=0)=>k.mesh(geo,geometryMaterial(geo,ma),x,y,z);
 const box=(ma,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),ma,x,y,z);
 // Crossed ribbons give thin fence wire/netting a volume-like silhouette at
 // 12 vertices per beam, versus capped six-sided cylinders at 72 vertices.
 function beam(ma,a,b,r=.03){const A=new T.Vector3(...a),B=new T.Vector3(...b),direction=B.clone().sub(A).normalize(),axis=Math.abs(direction.y)<.9?new T.Vector3(0,1,0):new T.Vector3(1,0,0),u=new T.Vector3().crossVectors(direction,axis).normalize().multiplyScalar(r),v=new T.Vector3().crossVectors(direction,u).normalize().multiplyScalar(r),ps=[];for(const n of [u,v]){const p=A.clone().sub(n),q=A.clone().add(n),s=B.clone().sub(n),t=B.clone().add(n);ps.push(...p.toArray(),...q.toArray(),...s.toArray(),...q.toArray(),...t.toArray(),...s.toArray());}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(ps,3));g.computeVertexNormals();mesh(g,ma);}
 const metal=material('#394740','metal'),cream=material('#ddd8c8','paint'),yellow=material('#b7a15b','paint'),paving=material('#a69f8d','paving'),stone=material('#7c796a','stone');
 const line=(a,b,width,y,ma)=>{const A=local(a),B=local(b),o=box(ma,width,.035,Math.hypot(B[0]-A[0],B[1]-A[1]),(A[0]+B[0])/2,y,(A[1]+B[1])/2);o.rotation.y=Math.atan2(B[0]-A[0],B[1]-A[1]);return o;};
 for(const f of SPACE_FENCES.filter(f=>f.zone===site.zone)){
  const A=local(f.a),B=local(f.b),at=(p,y)=>[p[0],y,p[1]],length=Math.hypot(B[0]-A[0],B[1]-A[1]),mid=A.map((v,i)=>(v+B[i])/2),yaw=Math.atan2(B[0]-A[0],B[1]-A[1]);
  const wall=box(f.solid?yellow:cream,.24,f.solid?2.8:.42,length,...[mid[0],f.solid?1.4:.21,mid[1]]);wall.rotation.y=yaw;
  if(f.solid){beam(cream,at(A,2.85),at(B,2.85),.12);beam(yellow,at(A,0),at(A,2.9),.32);}
  else {for(const y of [.52,1.15,f.height])beam(metal,at(A,y),at(B,y),.035);for(let j=0;j<=2;j++){const p=A.map((v,i)=>v+(B[i]-v)*j/2);beam(metal,at(p,.42),at(p,f.height),j===0?.075:.018);}}
 }
 if(site.zone==='stadium'){
  for(const v of SPACE_VERGES){line(v.a,v.b,v.width,.045,paving);const A=local(v.a),B=local(v.b);beam(cream,[A[0],.09,A[1]],[B[0],.09,B[1]],.13);
   // Covered drainage channels remain flush and walkable, never open traps.
   const dx=B[0]-A[0],dz=B[1]-A[1],d=Math.hypot(dx,dz)||1,m=[(A[0]+B[0])/2,(A[1]+B[1])/2];for(let j=-1;j<=1;j++){const x=m[0]+dx/d*j,z=m[1]+dz/d*j;const o=box(metal,.45,.015,.035,x,.075,z);o.rotation.y=Math.atan2(dx,dz);}
  }
  for(const court of SPACE_COURTS){
   const p=court.geometry.coordinates[0].map(local),[a,b,c,d]=p;
   k.poly(p,material('#55796e','paint'),0,.045);
   const at=(u,v,y=.075)=>[a[0]+(b[0]-a[0])*u+(d[0]-a[0])*v,y,a[1]+(b[1]-a[1])*u+(d[1]-a[1])*v];
   for(const [u,v,U,V] of [[0,0,1,0],[1,0,1,1],[1,1,0,1],[0,1,0,0],[0,.13,1,.13],[0,.87,1,.87],[.23,.13,.23,.87],[.77,.13,.77,.87],[.23,.5,.77,.5]])beam(cream,at(u,v),at(U,V),.045);
   for(const v of [0,1])beam(metal,at(.5,v,0),at(.5,v,1.04),.055);
   beam(metal,at(.5,0,1),at(.5,1,1),.025);for(let j=0;j<=14;j++)beam(metal,at(.5,j/14,.08),at(.5,j/14,.98),.012);
  }
  return;
 }
 for(const w of SPACE_PATH_PIECES)line(w.a,w.b,w.width,.075,paving);
 for(const c of SPACE_CROSSINGS){const a=c.heading*Math.PI/180;for(let t=-c.width/2+.5;t<c.width/2;t+=.8){const p=local(offsetMetres(c.position,Math.cos(a)*t,-Math.sin(a)*t)),o=box(cream,2.8,.008,.4,p[0],.035,p[1]);o.rotation.y=Math.PI/2-a;}}
 function group(spec,draw){
  const root=new T.Group(),p=local(spec.position);root.position.set(p[0],0,p[1]);root.rotation.y=(spec.rotation||0)*Math.PI/180;
  const add=(geo,ma,x,y,z)=>{const m=new T.Mesh(geo,geometryMaterial(geo,ma));m.position.set(x,y,z);m.castShadow=m.receiveShadow=true;root.add(m);return m;},b=(ma,w,h,d,x,y,z)=>add(new T.BoxGeometry(w,h,d),ma,x,y,z);
  draw(add,b,root);
  const anchor=k.mesh(new T.BufferGeometry(),cream);anchor.parent.add(root);anchor.removeFromParent();anchor.geometry.dispose();
 }
 group(SPACE_SERVICE,(add,b)=>{
  const gray=material('#777e7c','paint'),dark=material('#343b3e','paint'),blue=material('#4a789b','paint'),red=material('#bd5947','paint'),green=material('#547a61','paint');
  b(gray,9,2.65,5.4,-4,1.325,0);b(gray,5,1.1,5,-5.2,3.2,0);b(cream,5.8,.17,6,-5.2,3.83,0);b(cream,9.4,.16,5.9,-4,2.76,0);
  for(const x of [-6.7,-1.7]){b(dark,1.1,2.2,.06,x,1.1,2.73);b(cream,.08,2.3,.14,x-.59,1.15,2.77);b(cream,.08,2.3,.14,x+.59,1.15,2.77);b(cream,1.25,.08,.14,x,2.3,2.77);}
  for(let x=-7.2;x<=-3;x+=.65)b(dark,.4,.23,.05,x,3.3,2.53);
  // Original geometric colour treatment, informed by the photographed block.
  for(let j=0;j<6;j++){
   const x=-8.5+j*1.5,s=new T.Shape([new T.Vector2(x,0),new T.Vector2(x+1.5,0),new T.Vector2(j%2?x:x+1.5,2.6)]);add(new T.ShapeGeometry(s),j%2?cream:dark,0,.05,2.716);
  }
  b(paving,18,.04,5,0,.04,5.3);
  // Roof tanks and their light support frame are visible in the reference.
  for(const x of [-7.4,-.8]){const y=x<-3?4.4:3.32;add(new T.CylinderGeometry(.58,.58,1.0,12),dark,x,y,-1.5);add(new T.CylinderGeometry(.62,.62,.10,12),dark,x,y+.55,-1.5);}
  b(gray,8,2.4,.20,4.5,1.2,2.65);b(cream,8.3,.12,.45,4.5,2.47,2.65);
  for(let j=0;j<8;j++){const ma=[red,yellow,green,blue,cream][j%5],s=new T.Shape([new T.Vector2(.5+j,0),new T.Vector2(1.5+j,0),new T.Vector2(1+j,2.3)]);add(new T.ShapeGeometry(s),ma,0,.04,2.756);}
 });
 group(SPACE_PLAY,(add,b)=>{
  const red=material('#bb5147','paint'),green=material('#507e56','paint'),blue=material('#477d98','paint');
  b(material('#b6ac8d','sand'),21,.025,17,0,.035,0);b(material('#527951','grass'),10,.026,6,4,.05,4.8);
  // Only the photographed permanent tower/slide and spring riders are used.
  // The commissioning-day inflatable bus is not assumed to be permanent.
  for(const x of [-1.15,1.15])for(const z of [-1.2,1.2])b(blue,.12,3.1,.12,x,1.55,z);
  b(yellow,2.6,.15,2.6,0,1.5,0);
  const roof=new T.ConeGeometry(2.05,1.4,4);const o=add(roof,red,0,3.55,0);o.rotation.y=Math.PI/4;
  for(const x of [-1.2,1.2])for(let j=0;j<5;j++)b(j%2?red:green,.07,.9,.09,x,2.02,(j-2)*.47);
  const slide=b(green,1.05,.09,3.4,0,.84,2.7);slide.rotation.x=.45;for(const x of [-.56,.56]){const m=b(yellow,.08,.2,3.4,x,.94,2.7);m.rotation.x=.45;}
  for(let j=0;j<6;j++)b(yellow,1.0,.10,.3,0,.18+j*.23,-3+j*.3);
  for(const x of [-.62,.62]){const m=b(red,.07,1.8,.07,x,.8,-2.1);m.rotation.x=-.5;}
  for(const x of [-5,5]){add(new T.CylinderGeometry(.12,.12,.45,8),metal,x,.25,-4);b(x<0?red:blue,.8,.15,.36,x,.57,-4);b(x<0?red:blue,.20,.65,.25,x+.3,.8,-4);}
 });
 for(const f of SPACE_PLAY_BARRIERS){const A=local(f.a),B=local(f.b);beam(metal,[A[0],1.05,A[1]],[B[0],1.05,B[1]],.018);const n=Math.ceil(Math.hypot(B[0]-A[0],B[1]-A[1])/1.8);for(let j=0;j<=n;j++){const x=A[0]+(B[0]-A[0])*j/n,z=A[1]+(B[1]-A[1])*j/n;beam(metal,[x,0,z],[x,1.1,z],.025);}}
 group(SPACE_EGG,(add,b,root)=>{
  for(let j=0;j<3;j++)add(new T.CylinderGeometry(5.1-j*.6,5.1-j*.6,.17,32),stone,0,.1+j*.17,0);
  const rock=new T.IcosahedronGeometry(1,1),attr=rock.getAttribute('position');for(let i=0;i<attr.count;i++){const x=attr.getX(i),y=attr.getY(i),z=attr.getZ(i),f=1+.16*Math.sin(x*17+y*11+z*23);attr.setXYZ(i,x*f*(1-.18*y),y*f,z*f*(1-.12*y));}rock.computeVertexNormals();const mound=add(rock,material('#89796f','stone'),0,2.2,0);mound.scale.set(2.2,2.1,1.9);
  const egg=add(new T.SphereGeometry(1,20,14),cream,0,5.15,0);egg.scale.set(.85,1.35,.85);
  // Simplified original freestanding motifs; sculpture likeness is provisional.
  for(let j=0;j<6;j++){
   const a=j*Math.PI/3,x=Math.sin(a)*3.6,z=Math.cos(a)*3.6;b(metal,1.3,.15,.65,x,.66,z);
   const symbol=new T.Group();symbol.position.set(x,.75,z);symbol.rotation.y=a;root.add(symbol);
   const part=(geo,X,y)=>{const m=new T.Mesh(geo,geometryMaterial(geo,stone));m.position.set(X,y,0);m.castShadow=m.receiveShadow=true;symbol.add(m);};
   if(j%3===0){const shape=new T.Shape();shape.moveTo(-.62,0);shape.lineTo(.62,0);shape.lineTo(.62,1.5);shape.lineTo(-.62,1.5);shape.closePath();for(const x of [-.32,.32])for(const y of [.4,1.1]){const hole=new T.Path();hole.absellipse(x,y,.20,.22,0,Math.PI*2,true);shape.holes.push(hole);}part(new T.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:false,curveSegments:6}),0,0);}
   else if(j%3===1){const shape=new T.Shape();for(let i=0;i<16;i++){const a=i*Math.PI/8,r=i%2?.38:.74,x=Math.sin(a)*r,y=.75+Math.cos(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y);}shape.closePath();const hole=new T.Path();hole.absellipse(0,.75,.18,.18,0,Math.PI*2,true);shape.holes.push(hole);part(new T.ExtrudeGeometry(shape,{depth:.18,bevelEnabled:false,curveSegments:6}),0,0);}
   else {for(const side of [-1,1]){const geo=new T.TorusGeometry(.38,.10,5,16,Math.PI*1.7);const m=new T.Mesh(geo,geometryMaterial(geo,stone));m.position.set(side*.27,.78,0);m.rotation.z=side*Math.PI/2;m.castShadow=m.receiveShadow=true;symbol.add(m);}part(new T.BoxGeometry(.14,1.45,.16),0,.72);}
  }
 });
 const glow=material('#dddcc6','metal');glow.emissive.set('#e1d8ad');glow.emissiveIntensity=.25;
 for(const [index,p] of SPACE_LIGHTS.entries()){
  const [x,z]=local(p);box(stone,.6,.35,.6,x,.175,z);beam(cream,[x,.35,z],[x+.4,4,z],.10);beam(cream,[x+.4,4,z],[x+.6,5,z],.08);
  for(let j=0;j<14;j++){const a=j*2.399963,y=1-2*(j+.5)/14,r=Math.sqrt(1-y*y),v=[Math.cos(a)*r,y,Math.sin(a)*r],c=[x+.6,5,z],e=c.map((n,k)=>n+v[k]*.85);beam(glow,c,e,.018);mesh(new T.OctahedronGeometry(.08,0),glow,...e);}
  const t=local([p[0]+.00002,p[1]-.00002]);mesh(new T.OctahedronGeometry(.16,0),glow,t[0],.18,t[1]);
 }
}
