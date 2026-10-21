import * as T from './three.module.js';
import {oakKit} from './oak-plaza-model.js';
import {tagSurface,surfaceTexture} from './graphics-materials.js';
import {REGENT_ROADSIDE,REGENT_ROADSIDE_RINGS,REGENT_LOW_BUILDINGS,REGENT_BOUNDARY,REGENT_TANK,REGENT_TREES,REGENT_PALMS,REGENT_PLATFORM,regentLocal,regentRoadPoint,regentRoadClear,regentBuildingClear} from './regent-roadside-data.js';

export function createRegentRoadside(){
 const group=new T.Group();group.name=REGENT_ROADSIDE.name;const k=oakKit(group),{m,box,mesh,poly,beam}=k;
 const mat=(c,kind='plaster')=>tagSurface(new T.MeshStandardMaterial({color:c,roughness:.9}),kind);
 const cream=mat('#dbd0b7'),peach=mat('#af826c'),concrete=mat('#969b91'),mortar=mat('#a19e8b'),roof=mat('#774b3b','metal'),dark=mat('#343b35','metal'),paving=mat('#a6a396','paving'),soil=mat('#8f8267','earth'),grass=mat('#6b7d50','grass'),stones=['#b5aa8e','#a79d83','#c4baa2'].map(c=>mat(c,'stone'));
 soil.map=surfaceTexture('earth');grass.map=surfaceTexture('grass');
 function faces(tris,ma){const a=tris.flat(2),uv=[];for(let i=0;i<a.length;i+=3)uv.push(a[i]*.4,(a[i+1]+a[i+2])*.4);const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();ma.side=T.DoubleSide;return mesh(g,ma);}
 const base=1.55;poly(REGENT_PLATFORM.map(regentLocal),soil,base);
 for(const b of REGENT_LOW_BUILDINGS){const r=REGENT_ROADSIDE_RINGS[b.source].slice(0,-1).map(regentLocal),closed=[...r,r[0]],cx=r.reduce((s,p)=>s+p[0]/4,0),cz=r.reduce((s,p)=>s+p[1]/4,0),y=b.base+b.height;
  poly(closed,cream,b.height,b.base);
  const p=r.map(([x,z])=>[cx+(x-cx)*1.06,y,cz+(z-cz)*1.06]),mid=(a,c)=>a.map((v,i)=>(v+c[i])/2);
  if(b.roof==='mono'){const top=p.map((v,i)=>[v[0],y+(i<2?b.rise:0),v[2]]);faces([[top[0],top[1],top[2]],[top[0],top[2],top[3]]],roof);for(let i=0;i<4;i++){const j=(i+1)%4;faces([[p[i],top[i],top[j]],[p[i],top[j],p[j]]],cream);}}
  else{let a=mid(p[0],p[3]),c=mid(p[1],p[2]);if(b.roof==='hip'){a=a.map((v,i)=>v*.7+mid(a,c)[i]*.3);c=c.map((v,i)=>v*.7+mid(a,c)[i]*.3);}a[1]=c[1]=y+b.rise;faces([[p[0],p[1],c],[p[0],c,a],[p[3],a,c],[p[3],c,p[2]]],roof);faces([[p[0],a,p[3]],[p[1],p[2],c]],b.roof==='hip'?roof:cream);beam(roof,a,c,.055);}
  // Only street-visible eastern elevations receive openings; hidden rooms stay unspecified.
  const a=r[0],c=r[1],len=Math.hypot(c[0]-a[0],c[1]-a[1]);for(const t of [.25,.7]){const x=a[0]+(c[0]-a[0])*t+.08,z=a[1]+(c[1]-a[1])*t,o=box(dark,.1,.9,Math.min(1.3,len*.24),x,b.base+1.55,z);o.rotation.y=-Math.atan2(c[0]-a[0],c[1]-a[1]);}
 }
 let stoneCells=0;
 for(let i=1;i<REGENT_BOUNDARY.length;i++){
  const a=REGENT_BOUNDARY[i-1],b=REGENT_BOUNDARY[i],aa=regentLocal(a.position),bb=regentLocal(b.position),dx=bb[0]-aa[0],dz=bb[1]-aa[1],len=Math.hypot(dx,dz),ux=dx/len,uz=dz/len,nx=-uz,nz=ux,x=(aa[0]+bb[0])/2,z=(aa[1]+bb[1])/2,yaw=-Math.atan2(dz,dx);
  if(b.kind==='stone'){
   const point=(u,v,extra=.015)=>[aa[0]+ux*u+nx*(.7-1.4*v+extra),v*base,aa[1]+uz*u+nz*(.7-1.4*v+extra)];
   faces([[point(0,0,0),point(len,0,0),point(len,1,0)],[point(0,0,0),point(len,1,0),point(0,1,0)]],mortar);
   // Original irregular masonry geometry; no copied Street View texture or mural.
   const random=n=>{const v=Math.sin(n*127.1+i*311.7)*43758.5453;return v-Math.floor(v)},cols=Math.ceil(len/.5),seeds=[];
   for(let row=0;row<4;row++)for(let col=0;col<cols;col++)seeds.push([(col+.2+random(row*cols+col)*.6)*len/cols,(row+.2+random(row*cols+col+97)*.6)*base/4]);
   // Voronoi-cut stones have independent, irregular joints rather than repeated tiles.
   for(const [n,seed] of seeds.entries()){let cell=[[0,0],[len,0],[len,base],[0,base]];for(const other of seeds){if(other===seed)continue;const nx=other[0]-seed[0],ny=other[1]-seed[1],limit=(other[0]**2+other[1]**2-seed[0]**2-seed[1]**2)/2,out=[];for(let j=0;j<cell.length;j++){const a=cell[j],b=cell[(j+1)%cell.length],da=a[0]*nx+a[1]*ny-limit,db=b[0]*nx+b[1]*ny-limit;if(da<=0)out.push(a);if((da<=0)!==(db<=0)){const t=da/(da-db);out.push(a.map((v,k)=>v+(b[k]-v)*t));}}cell=out;if(!cell.length)break;}if(cell.length<3)continue;const center=cell.reduce((s,p)=>s.map((v,j)=>v+p[j]/cell.length),[0,0]),pts=cell.map(p=>point(center[0]+(p[0]-center[0])*.94,(center[1]+(p[1]-center[1])*.94)/base)),c=point(center[0],center[1]/base);faces(pts.map((p,j)=>[c,p,pts[(j+1)%pts.length]]),stones[n%3]);stoneCells++;}
   for(const y of [base+.15,base+.7,base+.94])beam(m.metal,[aa[0]-.13,y,aa[1]],[bb[0]-.13,y,bb[1]],.022);
   for(const p of [aa,bb])beam(m.metal,[p[0]-.13,base,p[1]],[p[0]-.13,base+1.02,p[1]],.025);
  }else{
   const wall=box(cream,len,2.75,.3,x,1.375,z);wall.rotation.y=yaw;
   const top=box(peach,len,.13,.42,x,2.81,z);top.rotation.y=yaw;
   const pier=box(peach,.33,2.9,.45,bb[0],1.45,bb[1]);pier.rotation.y=yaw;
   const lamp=box(dark,.1,.15,.4,x+nx*.23,2.05,z+nz*.23);lamp.rotation.y=yaw;
   const verge=box(soil,len,.028,2.2,x+nx*2,.028,z+nz*2);verge.rotation.y=yaw;
   for(const h of [.13,.30])beam(m.metal,[aa[0]+nx*3,h,aa[1]+nz*3],[bb[0]+nx*3,h,bb[1]+nz*3],.012);
  }
 }
 const [tx,tz]=regentLocal(REGENT_TANK.position),tank=REGENT_TANK;mesh(new T.CylinderGeometry(tank.radius,tank.radius,tank.height,24),dark,tx,tank.base+tank.height/2,tz);for(let y=.1;y<tank.height;y+=.19)mesh(new T.TorusGeometry(tank.radius+.015,.035,5,24),dark,tx,tank.base+y,tz).rotation.x=Math.PI/2;mesh(new T.CylinderGeometry(.34,.38,.12,16),dark,tx,tank.base+tank.height+.06,tz);
 for(const [i,p] of REGENT_TREES.entries()){const [x,z]=regentLocal(p);mesh(new T.CylinderGeometry(.12,.21,6.5,8),m.wood,x,base+3.25,z);for(let j=0;j<9;j++){const o=mesh(new T.IcosahedronGeometry(1,1),m.leaf,x+Math.sin(j)*.18,base+2.3+j*.66,z+Math.cos(j)*.15);o.scale.set(.7,1.25,.65);}}
 for(const p of REGENT_PALMS){const [x,z]=regentLocal(p);mesh(new T.CylinderGeometry(.08,.13,3.3,8),m.wood,x,1.65,z);for(let j=0;j<8;j++){const a=j*Math.PI/4,at=t=>[x+Math.cos(a)*t*1.7,3.25+Math.sin(t*Math.PI)*.45-t*.6,z+Math.sin(a)*t*1.7];let prev=at(0);for(let n=1;n<=7;n++){const t=n/7,pt=at(t);beam(m.leaf,prev,pt,.012);const width=Math.sin(t*Math.PI)*.5;for(const side of [-1,1]){const tip=[pt[0]-Math.sin(a)*width*side+Math.cos(a)*.15,pt[1]-.13,pt[2]+Math.cos(a)*width*side+Math.sin(a)*.15];faces([[prev,pt,tip]],m.leaf);}prev=pt;}}}
 for(const p of [[-.17647,5.61859],[-.17655,5.61854],[-.17661,5.61858]]){const [x,z]=regentLocal(p);mesh(new T.CylinderGeometry(.08,.16,2.1,7),m.leaf,x,base+1.05,z);for(let j=0;j<7;j++){const a=j*2.4,h=base+2.0+(j%3)*.15,r=1.7,root=[x,h,z],mid=[x+Math.cos(a)*r*.55,h+.28,z+Math.sin(a)*r*.55],tip=[x+Math.cos(a)*r,h-.35,z+Math.sin(a)*r],left=[mid[0]-Math.sin(a)*.28,mid[1],mid[2]+Math.cos(a)*.28],right=[mid[0]+Math.sin(a)*.28,mid[1],mid[2]-Math.cos(a)*.28];faces([[root,left,mid],[root,mid,right],[mid,left,tip],[mid,tip,right]],m.leaf);}}
 let walkCells=0;
 for(let lat=5.61836;lat<5.61933;lat+=.0000178){const p=regentRoadPoint(lat,8.1),q=regentRoadPoint(lat+.00001,8.1),[x,z]=regentLocal(p),[xx,zz]=regentLocal(q),yaw=-Math.atan2(zz-z,xx-x);if(!regentRoadClear(p,2)||!regentBuildingClear(p,2))continue;const tile=box(paving,1.96,.035,3.9,x,.06,z);tile.rotation.y=yaw;walkCells++;
  const [dx,dz]=regentLocal(regentRoadPoint(lat,5.7)),slab=box(concrete,1.96,.04,.48,dx,.07,dz);slab.rotation.y=yaw;for(let j=0;j<4;j++){const slot=box(dark,.035,.01,.32,dx+(xx-x)/Math.hypot(xx-x,zz-z)*(j-1.5)*.45,.096,dz+(zz-z)/Math.hypot(xx-x,zz-z)*(j-1.5)*.45);slot.rotation.y=yaw;}
 }
 k.finish();group.userData.roadside={sourceIds:REGENT_ROADSIDE.sourceIds,stoneCells,walkCells,referenceDate:'2024-09',privateInteriors:false};return {group};
}
