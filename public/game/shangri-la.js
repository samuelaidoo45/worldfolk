import * as T from './three.module.js';
import {oakKit} from './oak-plaza-model.js';
import {tagSurface,surfaceTexture} from './graphics-materials.js';
import {projectOnSegment} from './motion.js';
import {SHANGRI_BLOCK,SHANGRI_RINGS,SHANGRI_ROADS,SHANGRI_MASSES,SHANGRI_WALLS,SHANGRI_LODGE,SHANGRI_STELE,SHANGRI_LAMP,SHANGRI_TREES,SHANGRI_PALMS,SHANGRI_BOUNDARY,shangriLocal,shangriPoint,inShangri,shangriRoadClear,shangriBuildingClear} from './shangri-la-data.js';

export function createShangriBlock(){
 const group=new T.Group();group.name=SHANGRI_BLOCK.name;const k=oakKit(group),{box,poly,mesh,beam,m}=k;
 const mat=(c,kind='plaster')=>tagSurface(new T.MeshStandardMaterial({color:c,roughness:.85}),kind);
 const turquoise=mat('#348b9f','metal'),brown=mat('#635044'),tan=mat('#b7ac8d'),pale=mat('#d6d8c8'),roof=mat('#666b65','metal'),silver=mat('#a1a8a3','metal'),grass=mat('#73805b','grass'),soil=mat('#998569','earth'),paving=mat('#aaa99a','paving'),glass=mat('#637f87','glass');
 grass.map=surfaceTexture('grass');soil.map=surfaceTexture('earth');glass.roughness=.25;glass.metalness=.4;silver.metalness=.45;
 function sign(text,w,x,y,z,yaw=0,color='#e1e1ce',ink='#65784d',aspect=8){
  if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,1024,128);ctx.fillStyle=ink;ctx.font='bold 82px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,94,990);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,w/aspect),new T.MeshStandardMaterial({map,side:T.DoubleSide,roughness:.8}),x,y,z);o.rotation.y=yaw;
 }
 function window(x,y,z,w,h,yaw=0){const f=box(silver,w+.16,h+.16,.13,x,y,z);f.rotation.y=yaw;const g=box(glass,w,h,.07,x+Math.sin(yaw)*.1,y,z+Math.cos(yaw)*.1);g.rotation.y=yaw;const b=box(pale,.045,h,.09,x+Math.sin(yaw)*.15,y,z+Math.cos(yaw)*.15);b.rotation.y=yaw;}
 for(const mass of SHANGRI_MASSES){const r=SHANGRI_RINGS[mass.source].map(shangriLocal),xs=r.map(p=>p[0]),zs=r.map(p=>p[1]),b={x0:Math.min(...xs),x1:Math.max(...xs),z0:Math.min(...zs),z1:Math.max(...zs)},cx=(b.x0+b.x1)/2,w=b.x1-b.x0;
  if(mass.id==='christman'){
   poly(r,tan,mass.height);poly(r,brown,.35,mass.height);
   // Align every front detail to the actual angled south edge, not its bounding box.
   const a=r[11],e=r[10],slope=(e[1]-a[1])/(e[0]-a[0]),yaw=-Math.atan(slope),frontZ=x=>a[1]+(x-a[0])*slope+.12;
   for(const y of [.35,3.5,6.65,9.85]){const o=box(brown,w+.7,.45,.55,cx,y,frontZ(cx));o.rotation.y=yaw;}
   for(const x of [b.x0+.4,cx-w*.30,cx+w*.30,b.x1-.4]){const o=box(brown,.65,10,.5,x,5,frontZ(x));o.rotation.y=yaw;}
   for(const y of [1.9,5.05,8.2])for(let j=0;j<5;j++){const x=cx+(j-2)*(w*.16);window(x,y,frontZ(x),w*.125,1.35,yaw);const sill=box(pale,w*.13,.1,.32,x,y-.78,frontZ(x)+.12);sill.rotation.y=yaw;}
   const cornice=box(brown,w+2.2,.4,2,cx,10.2,frontZ(cx)-.6);cornice.rotation.y=yaw;
   const s=new T.Shape([new T.Vector2(-w*.29,0),new T.Vector2(w*.29,0),new T.Vector2(w*.17,1.65),new T.Vector2(-w*.12,1.65)]),g=new T.ExtrudeGeometry(s,{depth:.25,bevelEnabled:false}),pediment=mesh(g,tan,cx,10.35,frontZ(cx)+.03);pediment.rotation.y=yaw;
   sign('CHRISTMAN HOUSE',w*.43,cx,6.25,frontZ(cx)+.35,yaw,'#e1e1ce','#65784d',24);
   // Each side opening is attached to its own native wall edge, including setbacks.
   for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(Math.abs(dx)>Math.abs(dz)||len<5)continue;const mx=(a[0]+b[0])/2,normal=mx>cx?1:-1,n=Math.max(1,Math.floor(len/5));for(let j=0;j<n;j++){const t=(j+.5)/n,x=a[0]+dx*t+normal*.12,z=a[1]+dz*t;for(const y of [1.9,5.05,8.2]){window(x,y,z,2.4,1.35,normal*Math.PI/2);box(pale,.35,.5,.85,x+normal*.2,y-.9,z+.7);}}}
  }else{
   poly(r,pale,mass.height);poly(r,turquoise,.48,mass.height);
   const front=b.z0-.12;
   // Two-storey turquoise frontage with cream piers, central reflective bay.
   box(turquoise,w,.75,.18,cx,3.2,front);box(turquoise,w,.65,.24,cx,6.15,front);
   for(const x of [b.x0+.25,cx-w*.20,cx+w*.16,b.x1-.25])box(turquoise,.4,6.4,.2,x,3.2,front-.04);
   const gx=cx-w*.06;box(glass,w*.23,5.25,.16,gx,3.08,front-.1);
   for(const x of [gx-w*.115,gx,gx+w*.115])box(silver,.055,5.3,.1,x,3.08,front-.21);
   for(const y of [.55,3.12,5.72])box(silver,w*.23,.06,.1,gx,y,front-.22);
   for(const y of [1.65,4.7])for(const t of [-.37,.28,.43])window(cx+w*t,y,front,Math.min(3.7,w*.12),1.45,Math.PI);
   // Open rooftop shade, not a solid extra floor or a flat replacement roof.
   for(const x of [b.x0+.3,cx,b.x1-.3])for(const z of [b.z0+1,b.z0+6])box(brown,.16,1.15,.16,x,6.95,z);
   const canopy=box(roof,w+1,.16,7,cx,7.6,b.z0+3);canopy.rotation.z=-.016;
   box(turquoise,w+1,.55,.18,cx,7.5,b.z0-.5);
   sign('First National Bank',7,gx,6.5,front-.24,Math.PI,'#348b9f','#f0ddb4');
  }
 }
 const paint=mat('#ccd1bc');for(const w of SHANGRI_WALLS){const a=shangriLocal(w.a),b=shangriLocal(w.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]),o=box(paint,len,w.height,.22,(a[0]+b[0])/2,w.height/2,(a[1]+b[1])/2);o.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);const cap=box(pale,len,.12,.32,o.position.x,w.height+.06,o.position.z);cap.rotation.y=o.rotation.y;}
 // Reference-supported security lodge and bank gateposts; mapped lanes stay open.
 const lodge=SHANGRI_LODGE,[lx,lz]=shangriLocal(lodge.position);box(pale,lodge.width,lodge.height,lodge.depth,lx,lodge.height/2,lz);box(roof,lodge.width+.5,.25,lodge.depth+.5,lx,2.85,lz);
 for(const x of [lx-1.25,lx+1.25])window(x,1.65,lz-1.64,.7,.95,Math.PI);
 const stele=shangriLocal(SHANGRI_STELE.position);box(turquoise,SHANGRI_STELE.width,SHANGRI_STELE.height,SHANGRI_STELE.depth,stele[0],1.45,stele[1]);sign('FNB',.85,stele[0],2.1,stele[1]-.14,Math.PI,'#348b9f','#f0ddb4');
 const [px,pz]=shangriLocal(SHANGRI_LAMP);mesh(new T.CylinderGeometry(.065,.09,6.8,8),silver,px,3.4,pz);beam(roof,[px,6.6,pz],[px+.8,6.8,pz],.045);const solar=box(m.navy,.8,.06,.6,px,7,pz);solar.rotation.z=.20;box(pale,.65,.07,.2,px+.65,6.75,pz);
 function tree(x,z,h=8,i=0){mesh(new T.CylinderGeometry(.22,.35,h,9),m.wood,x,h/2,z);for(let j=0;j<13;j++){const a=j*2.4+i,r=1+(j%3)*.8,o=mesh(new T.IcosahedronGeometry(1,1),m.leaf,x+Math.cos(a)*r,h-.8+(j%4)*.45,z+Math.sin(a)*r);o.scale.set(1.8,1.1,1.65);}}
 SHANGRI_TREES.forEach((p,i)=>{const [x,z]=shangriLocal(p);if(i<3){mesh(new T.CylinderGeometry(.1,.2,6,8),m.wood,x,3,z);for(let j=0;j<7;j++){const o=mesh(new T.IcosahedronGeometry(1,1),m.leaf,x+Math.sin(j)*.15,2.3+j*.75,z+Math.cos(j)*.14);o.scale.set(.55,1.15,.5);}}else tree(x,z,7+(i%3),i);});for(const p of SHANGRI_PALMS)k.palm(...shangriLocal(p),7.5);
 // Limited planting/soil behind the photographed east boundary, never across roads.
 const corrugated=mat('#92978c','metal'),rust=mat('#886b59','metal');
 for(let i=1;i<SHANGRI_BOUNDARY.length;i++){const a=shangriLocal(SHANGRI_BOUNDARY[i-1]),b=shangriLocal(SHANGRI_BOUNDARY[i]),len=Math.hypot(b[0]-a[0],b[1]-a[1]),yaw=-Math.atan2(b[1]-a[1],b[0]-a[0]),x=(a[0]+b[0])/2,z=(a[1]+b[1])/2,north=SHANGRI_BOUNDARY[i][1]>5.6178;
  const f=box(north?pale:i%7===0?rust:corrugated,len,2.1,.15,x,1.05,z);f.rotation.y=yaw;
  if(!north)for(let d=.1;d<len;d+=.22){const t=d/len;beam(silver,[a[0]+(b[0]-a[0])*t,.08,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,2.08,a[1]+(b[1]-a[1])*t],.012);}
  else{const cap=box(pale,len,.12,.3,x,2.16,z);cap.rotation.y=yaw;}
  box(i%3?grass:soil,21,.025,len+.03,x+10.6,.025,z).rotation.y=yaw;
  if(i%2===0)tree(x+4+(i%3),z,7+(i%4),i);
 }
 // Paving and drains sampled along the actual street edges, cut at every driveway.
 let cells=0;
 for(const road of SHANGRI_ROADS.filter(r=>[518607277,34571980,98552049,98552052,510151406,510252769,511790086,515537582].includes(r.id)))for(let i=1;i<road.coordinates.length;i++){
  const a=shangriLocal(road.coordinates[i-1]),b=shangriLocal(road.coordinates[i]),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx);
  for(let d=1;d<len;d+=2){const x=a[0]+dx*d/len,z=a[1]+dz*d/len;if(!inShangri(shangriPoint(x,z)))continue;
   for(const side of [-1,1]){const at=(s)=>[x-dz/len*s*side,z+dx/len*s*side],p=at(road.width/2+1.7),gp=shangriPoint(...p);if(!shangriRoadClear(gp,1.45)||!shangriBuildingClear(gp,1.5))continue;
    // The central reservation is earth/grass in the reference, not two overlapping sidewalks.
    const opposite=SHANGRI_ROADS.filter(r=>road.id===515537582?[510151406,510252769,511790086].includes(r.id):r.id===515537582);
    if(road.class==='trunk'&&opposite.some(r=>r.coordinates.slice(1).some((b,i)=>projectOnSegment(gp,r.coordinates[i],b).distance<12)))continue;
    const tile=box(paving,1.97,.025,3,p[0],.045,p[1]);tile.rotation.y=yaw;cells++;
    const drain=at(road.width/2+.25),dp=shangriPoint(...drain);if(shangriRoadClear(dp,.1)){const slab=box(road.class==='trunk'?paving:roof,1.96,.025,.43,drain[0],.065,drain[1]);slab.rotation.y=yaw;for(let j=0;j<4;j++){const t=(j-1.5)*.46,o=box(m.dark,.035,.008,.3,drain[0]+dx/len*t,.083,drain[1]+dz/len*t);o.rotation.y=yaw;}}
   }
  }
 }
 const redSoil=mat('#8d6950','earth');redSoil.map=surfaceTexture('earth');poly([[-.17670,5.61734],[-.17649,5.61733],[-.17650,5.61747],[-.17672,5.61748],[-.17670,5.61734]].map(shangriLocal),redSoil,0,.031);
 // Bounded turf forecourt and driveway aprons, with no invented shop stalls.
 poly([[-.17671,5.61714],[-.1764,5.617125],[-.1764,5.61707],[-.17671,5.617085],[-.17671,5.61714]].map(shangriLocal),grass,0,.028);
 for(const r of SHANGRI_ROADS.filter(r=>[974540788,1076825780,1076825781].includes(r.id))){const a=shangriLocal(r.coordinates[0]),b=shangriLocal(r.coordinates[1]),len=Math.min(12,Math.hypot(b[0]-a[0],b[1]-a[1])),yaw=-Math.atan2(b[1]-a[1],b[0]-a[0]);const o=box(paving,len,.02,r.width+.6,a[0]+(b[0]-a[0])/Math.hypot(b[0]-a[0],b[1]-a[1])*len/2,.07,a[1]+(b[1]-a[1])/Math.hypot(b[0]-a[0],b[1]-a[1])*len/2);o.rotation.y=yaw;}
 k.finish();group.userData.surfaceCells=cells;group.userData.referenceDate='2024-09';return {group};
}
