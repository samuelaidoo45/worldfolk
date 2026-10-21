import * as T from './three.module.js';
import {addResidentialFrontages} from './residential-frontages.js';
import {tagSurface,surfaceTexture} from './graphics-materials.js';
import {oakKit} from './oak-plaza-model.js';
import {RESIDENTIAL_BLOCK,RESIDENTIAL_RINGS,RESIDENTIAL_ROADS,RESIDENTIAL_MASSES,RESIDENTIAL_WALLS,RESIDENTIAL_GATES,RESIDENTIAL_TREES,RESIDENTIAL_FRONTAGE_TREES,RESIDENTIAL_FRONTAGE_PALMS,RESIDENTIAL_FRONTAGE_BOARD,RESIDENTIAL_SOUTH_TREES,RESIDENTIAL_SOUTH_PALMS,REGUS_ENTRY,residentialLocal,residentialPoint,inResidentialBlock,residentialRoadClear,residentialBuildingClear} from './airport-residential-data.js';
export function createResidentialBlock(){
 const group=new T.Group();group.name=RESIDENTIAL_BLOCK.name;const k=oakKit(group),{m,box,mesh,poly,beam,sign}=k;
 m.white=tagSurface(new T.MeshStandardMaterial({color:'#eeeee8',roughness:.85}),'plaster');m.cream.color.set('#eee9d8');m.glass.color.set('#627578');m.navy.color.set('#252e30');m.stone.color.set('#b4b3a8');m.tile.color.set('#b1afa3');m.white.color.set('#eeeee8');m.leaf.color.set('#66804b');m.dark.color.set('#393b37');
 const earth=tagSurface(new T.MeshStandardMaterial({color:'#9f967e',roughness:1,map:surfaceTexture('earth')}),'earth'),grass=tagSurface(new T.MeshStandardMaterial({color:'#74815b',roughness:1,map:surfaceTexture('grass')}),'grass');
 const roof=(ring,height,rise,ma)=>{const points=ring.slice(0,-1),cx=points.reduce((s,p)=>s+p[0],0)/points.length,cz=points.reduce((s,p)=>s+p[1],0)/points.length,vertices=[];
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];vertices.push(...[a[0],height,a[1],b[0],height,b[1],cx,height+rise,cz]);}
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.computeVertexNormals();ma.side=T.DoubleSide;mesh(geo,ma);for(let i=1;i<ring.length;i++)beam(m.dark,[ring[i-1][0],height,ring[i-1][1]],[ring[i][0],height,ring[i][1]],.055);
 };
 for(const mass of RESIDENTIAL_MASSES.filter(m=>!m.frontage)){const ring=RESIDENTIAL_RINGS[mass.source].map(residentialLocal);poly(ring,mass.cream?m.cream:m.white,mass.height);const material=tagSurface(new T.MeshStandardMaterial({color:mass.cream?'#85573f':'#40494b',roughness:.8}),'roof');roof(ring,mass.height,mass.roof,material);
  const outward=ring.slice(1).reduce((s,b,i)=>s+ring[i][0]*b[1]-b[0]*ring[i][1],0)>0?-1:1;
  for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<5)continue;
   const wall=new T.Group();wall.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);wall.rotation.y=Math.atan2(-dz,dx);group.add(wall);
   const part=(ma,w,h,d,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),ma);o.position.set(x,y,z*outward);wall.add(o);};
   const n=Math.floor(len/5);for(let j=0;j<n;j++){const x=(j+.5)*len/n-len/2;for(const y of [1.7,5.1]){part(m.navy,2.8,1.25,.08,x,y,.06);part(m.glass,2.65,1.1,.09,x,y,.12);part(m.navy,.04,1.1,.12,x,y,.18);part(m.cream,2.9,.09,.32,x,y-.68,.16);}}
   part(m.cream,len,.3,.35,0,3.5,.1);part(m.cream,len,.25,.5,0,mass.height-.1,.12);
  }
 }
 addResidentialFrontages(group,k);
 // The mapped parking roof stays open below: no solid generic shed across the yard.
 const canopy=RESIDENTIAL_RINGS[1330242138].map(residentialLocal);poly(canopy,m.navy,.15,3.25);
 for(const [x,z] of canopy.slice(0,-1)){box(m.metal,.18,3.25,.18,x,1.625,z);beam(m.metal,[x,2.55,z],[x+.6,3.2,z],.05);}
 const cx=(Math.min(...canopy.map(p=>p[0]))+Math.max(...canopy.map(p=>p[0])))/2,cz=(Math.min(...canopy.map(p=>p[1]))+Math.max(...canopy.map(p=>p[1])))/2;
 for(let x=cx-12;x<cx+12;x+=2)for(let z=cz-3;z<cz+4;z+=2){box(m.glass,1.85,.04,1.8,x,3.43,z);for(const dx of [-.93,.93])box(m.metal,.035,.05,1.8,x+dx,3.45,z);}
 // Attached, cantilevered white canopy visible in the 2026 owner photograph.
 const [ex,ez]=residentialLocal(REGUS_ENTRY),west=residentialLocal([-.180154,5.61701]);box(m.white,3.2,.22,11,west[0]-.9,3.4,west[1]);for(const z of [-4,4])beam(m.white,[west[0]+.6,4.3,west[1]+z],[west[0]-2.45,3.5,west[1]+z],.045);
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=768;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#eeeee8';ctx.fillRect(0,0,768,160);ctx.fillStyle='#222a2c';ctx.font='bold 112px sans-serif';ctx.textAlign='center';ctx.fillText('Regus',384,120);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const logo=mesh(new T.PlaneGeometry(4.5,.94),new T.MeshStandardMaterial({map,side:T.DoubleSide}),west[0]-.12,3.95,west[1]);logo.rotation.y=-Math.PI/2;}box(m.navy,1.8,2.65,.12,ex,1.325,ez+2.2);box(m.glass,1.65,2.45,.14,ex,1.325,ez+2.1);sign('WORKSPACE',2,ex,3.05,ez+2,Math.PI);
 // Concrete forecourt is bounded by the actual carport and private approach.
 poly([[-.18051,5.61713],[-.18019,5.61713],[-.18019,5.61694],[-.18051,5.61694],[-.18051,5.61713]].map(residentialLocal),m.tile,0,.035);
 const wallColors=new Map();
 for(const w of RESIDENTIAL_WALLS){if(w.wire){const a=residentialLocal(w.a),b=residentialLocal(w.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]);for(let d=0;d<=len;d+=1.2){const t=d/len;beam(m.dark,[a[0]+(b[0]-a[0])*t,0,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,w.height,a[1]+(b[1]-a[1])*t],.025);}for(const y of [.1,.3,.5,.7,.85])beam(m.dark,[a[0],y,a[1]],[b[0],y,b[1]],.012);continue;}const a=residentialLocal(w.a),b=residentialLocal(w.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]),yaw=-Math.atan2(b[1]-a[1],b[0]-a[0]);let wallMaterial=w.cream?m.cream:m.white;if(w.color){if(!wallColors.has(w.color))wallColors.set(w.color,tagSurface(new T.MeshStandardMaterial({color:w.color,roughness:.9}),'plaster'));wallMaterial=wallColors.get(w.color);}const o=box(wallMaterial,len,w.perforated ? .20 : w.height,.25,(a[0]+b[0])/2,w.height/2,(a[1]+b[1])/2);o.rotation.y=yaw;
  if(w.perforated){o.position.y=.10;const bottom=box(m.white,len,.12,.25,o.position.x,.36,o.position.z);bottom.rotation.y=yaw;for(let d=.3;d<len;d+=.55){const t=d/len,v=box(m.white,.13,.48,.20,a[0]+(b[0]-a[0])*t,.66,a[1]+(b[1]-a[1])*t);v.rotation.y=yaw;}}
  if(w.infill)for(let d=1.7;d<len;d+=3.5){const f=d/len,panel=box(m.wood,Math.min(3,len-d+.5),.65,.28,a[0]+(b[0]-a[0])*f,w.height-.60,a[1]+(b[1]-a[1])*f);panel.rotation.y=yaw;}
  const cap=box(m.stone,len,.1,.34,o.position.x,w.height+.05,o.position.z);cap.rotation.y=yaw;for(let d=0;d<=len;d+=3.5){const f=d/len,x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f;box(wallMaterial,.35,w.height+.1,.35,x,(w.height+.1)/2,z);}
  if(w.cream&&!w.perforated&&!w.plain)for(let d=1;d<len;d+=1.5){const f=d/len,x=a[0]+(b[0]-a[0])*f,z=a[1]+(b[1]-a[1])*f;const vent=box(m.dark,.08,.4,.27,x,w.height-.55,z);vent.rotation.y=yaw;}
 }
 for(const [i,p] of RESIDENTIAL_TREES.entries()){const [x,z]=residentialLocal(p);if(i>=4)k.palm(x,z,7);else{box(m.wood,.3,6,.3,x,3,z);for(let j=0;j<18;j++){const a=j*2.399,r=.55+(j%4)*.19,crown=mesh(new T.SphereGeometry(1,9,7),m.leaf,x+Math.cos(a)*r,3.4+(j%6)*.92,z+Math.sin(a)*r);crown.scale.set(.58+(j%3)*.10,1.65,.6);crown.rotation.z=Math.cos(a)*.13;}}}
 // Native roads control every surface strip, including drive/junction gaps.
 let surfaceCells=0;for(const road of RESIDENTIAL_ROADS)for(let i=1;i<road.coordinates.length;i++){const a=residentialLocal(road.coordinates[i-1]),b=residentialLocal(road.coordinates[i]),dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),yaw=-Math.atan2(dz,dx);for(let d=1;d<len;d+=2){const x=a[0]+dx*d/len,z=a[1]+dz*d/len;if(!inResidentialBlock(residentialPoint(x,z)))continue;for(const side of [-1,1]){
   const along=(offset)=>[x-dz/len*offset*side,z+dx/len*offset*side],walk=along(road.width/2+.9),gp=residentialPoint(...walk);
   if(!residentialRoadClear(gp,.65)||!residentialBuildingClear(gp,1.1))continue;
   const tile=box(m.tile,1.96,.035,1.65,walk[0],.065,walk[1]);tile.rotation.y=yaw;surfaceCells++;
   if(road.class==='service')continue;
   const drain=along(road.width/2+.25),dp=residentialPoint(...drain);if(residentialRoadClear(dp,.1)){const grate=box(m.navy,1.94,.025,.42,drain[0],.055,drain[1]);grate.rotation.y=yaw;for(let j=0;j<6;j++){const t=(j-2.5)*.28,g=box(m.metal,.045,.015,.4,drain[0]+dx/len*t,.075,drain[1]+dz/len*t);g.rotation.y=yaw;}}
  }}
 }
 // Photo-supported continuous west grass strip; do not tile it like paving.
 poly([[-.17894,5.61662],[-.17884,5.61662],[-.17884,5.61714],[-.17894,5.61714],[-.17894,5.61662]].map(residentialLocal),grass,0,.04);
 // East-side gravel margin, white base wall and sparse black drain rail.
 for(let lat=5.61652;lat<5.61711;lat+=.000018){if(lat>5.61674&&lat<5.61682)continue;const gp=[-.17869,lat];if(!residentialBuildingClear(gp,.5)||!residentialRoadClear(gp,1.4))continue;const [x,z]=residentialLocal(gp);box(earth,2.8,.02,1.98,x,.035,z);box(m.navy,.04,.8,.04,x-1.4,.4,z);box(m.navy,.035,.04,2,x-1.4,.8,z);}
 // The north house's grass forecourt and clipped hedge stay behind the road edge.
 poly([[-.17938,5.61737],[-.17908,5.61737],[-.17908,5.61744],[-.17938,5.61744],[-.17938,5.61737]].map(residentialLocal),grass,0,.04);
 const h0=residentialLocal([-.17936,5.61748]),h1=residentialLocal([-.17910,5.61748]);for(let x=h0[0];x<h1[0];x+=.8){const hedge=mesh(new T.SphereGeometry(.6,8,6),m.leaf,x,.78,h0[1]);hedge.scale.set(.9,1.25,.75);}
 // Bounded concrete gate aprons meet the road edge without covering the street.
 for(const lat of [5.61687,5.61658])poly([[-.17894,lat-.000029],[-.17883,lat-.000029],[-.17883,lat+.000029],[-.17894,lat+.000029],[-.17894,lat-.000029]].map(residentialLocal),m.tile,0,.055);
 // Bounded lawn and clipped hedges follow the photographed northern compound frontage.
 poly([[-.18038,5.617402],[-.17964,5.617386],[-.17964,5.61747],[-.18038,5.61747],[-.18038,5.617402]].map(residentialLocal),grass,0,.028);
 poly([[-.17963,5.61738],[-.17910,5.61736],[-.17910,5.617455],[-.17963,5.617455],[-.17963,5.61738]].map(residentialLocal),grass,0,.033);
 for(const [i,p] of [...RESIDENTIAL_FRONTAGE_TREES,...RESIDENTIAL_SOUTH_TREES].entries()){const [x,z]=residentialLocal(p),h=6.6+(i%2)*.4;mesh(new T.CylinderGeometry(.20,.27,h,9),m.wood,x,h/2,z);if(RESIDENTIAL_FRONTAGE_TREES.includes(p))mesh(new T.CylinderGeometry(.23,.28,1.1,9),m.white,x,.55,z);for(let j=0;j<14;j++){const a=j*2.399,r=.45+(j%3)*.35,leaf=mesh(new T.IcosahedronGeometry(1,1),m.leaf,x+Math.cos(a)*r,3.4+(j%5)*.66,z+Math.sin(a)*r);leaf.scale.set(.95,1.65,.85);leaf.rotation.y=a;}}
 // Three north-side driveways cross the lawn without a fence or planter blocking them.
 for(const gate of RESIDENTIAL_GATES.filter(g=>g.id.startsWith('north-'))){const [x0,z0]=residentialLocal(gate.a),[x1]=residentialLocal(gate.b),front=residentialLocal([gate.a[0],5.617398])[1];box(m.tile,Math.abs(x1-x0),.025,front-z0,(x0+x1)/2,.075,(front+z0)/2);}
 for(const seg of [[-.17963,-.17943],[-.17936,-.17910]]){const a=residentialLocal([seg[0],5.61750]),b=residentialLocal([seg[1],5.61750]);box(m.leaf,b[0]-a[0],2.25,1.45,(a[0]+b[0])/2,1.4,a[1]);}
 // Freestanding name board visible in the July 2024 panorama; no invented job or interior.
 const [gx,gz]=residentialLocal(RESIDENTIAL_FRONTAGE_BOARD.position);box(m.white,RESIDENTIAL_FRONTAGE_BOARD.width,1.6,.08,gx,.85,gz);sign('GEODRILL',.8,gx,.72,gz+.055);box(m.navy,.045,.25,.06,gx-.25,1.3,gz+.055);
 for(const p of [...RESIDENTIAL_FRONTAGE_PALMS,...RESIDENTIAL_SOUTH_PALMS]){const [x,z]=residentialLocal(p);k.palm(x,z,8.5);if(RESIDENTIAL_FRONTAGE_PALMS.includes(p))mesh(new T.CylinderGeometry(.25,.29,1.15,10),m.white,x,.575,z);}
 // South-side grass and the two compound aprons, bounded by the street and walls.
 for(const r of [[[ -.17986,5.617285],[-.179505,5.61727],[-.179505,5.61715],[-.17986,5.61717],[-.17986,5.617285]],[[-.17944,5.617267],[-.17927,5.61726],[-.17927,5.617145],[-.17944,5.61715],[-.17944,5.617267]]])poly(r.map(residentialLocal),grass,0,.043);
 for(const gate of RESIDENTIAL_GATES.filter(g=>g.id.startsWith('south-'))){const a=residentialLocal(gate.a),b=residentialLocal(gate.b),edge=residentialLocal([gate.a[0],5.61728])[1];box(m.tile,b[0]-a[0],.025,a[1]-edge,(a[0]+b[0])/2,.07,(a[1]+edge)/2);}
 // Clipped low borders and planted shrubs match the compound frontage, leaving the aprons open.
 for(const seg of [[-.17986,-.17961],[-.17944,-.17927]]){const a=residentialLocal([seg[0],5.617265]),b=residentialLocal([seg[1],5.617265]);box(m.leaf,b[0]-a[0],.42,.65,(a[0]+b[0])/2,.27,a[1]);}
 for(const lng of [-.17982,-.17976,-.17969]){const [x,z]=residentialLocal([lng,5.617175]);const shrub=mesh(new T.SphereGeometry(.65,10,7),m.leaf,x,.75,z);shrub.scale.set(.8,1.15,.8);}
 // Small up/down sconces are fixed to the photographed white compound wall.
 for(let lat=5.61685;lat<5.61713;lat+=.000042){const [x,z]=residentialLocal([-.17865,lat]);box(m.navy,.14,.13,.32,x-.17,1.45,z);}
 // Yellow flowering beds beside the residence gate; these are planted borders.
 const flower=new T.MeshStandardMaterial({color:'#d4b63f',roughness:.9});for(let lat=5.61663;lat<5.61698;lat+=.000025){if(lat>5.61683&&lat<5.61691)continue;const [x,z]=residentialLocal([-.178935,lat]);for(let j=0;j<3;j++){const leaf=mesh(new T.SphereGeometry(.35,8,6),m.leaf,x+.5, .42,z+(j-1)*.34);leaf.scale.set(1.5,.7,1);const f=mesh(new T.SphereGeometry(.10,6,5),flower,x+.65,.62,z+(j-1)*.34);f.scale.set(1,.45,1);}}
 const corner=residentialLocal([-.17864,5.61720]);box(m.metal,.08,2.3,.08,corner[0],1.15,corner[1]);sign('KOFI ANNAN ST',2.6,corner[0],2.15,corner[1]);sign('MARY DEI AMOAH RD',2.6,corner[0],1.8,corner[1]);
 // No invented shops, food stalls or traffic lights in this unsignalised reference block.
 group.userData.residential={nativeBuildings:RESIDENTIAL_BLOCK.sourceIds,surfaceCells,surveyed:false,referenceMonths:['2024-07','2026-03']};k.finish();return {group,update(){}};
}
