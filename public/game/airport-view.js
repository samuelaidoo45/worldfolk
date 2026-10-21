import {corridorRoadClear,corridorBuildingClear} from './airport-corridor-data.js';
import * as T from './three.module.js';import {AIRPORT_VIEW,HOTEL_WING,hotelLocal,hotelPoint,HOTEL_SOLIDS} from './airport-view-data.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';import {batchStaticMeshes} from './render-utils.js';
export function createAirportView(){
 const group=new T.Group(),building=new T.Group();building.rotation.y=AIRPORT_VIEW.rotation*Math.PI/180;group.add(building);group.name=AIRPORT_VIEW.name;
 const mat=(color,kind='plaster',r=.8,m=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness:r,metalness:m}),kind),white=mat('#e4e4de'),grey=mat('#55575c'),dark=mat('#252f36'),glass=mat('#57717b','glass',.22,.5),steel=mat('#a2aaab','metal',.4,.6),stone=mat('#8c8270','stone'),wood=mat('#76634b','wood'),pave=mat('#a09f95','paving'),leaf=mat('#45673c','foliage'),blue=mat('#284b68','paint'),gold=mat('#c8a347','metal',.4,.3);
 const mesh=(g,m,x,y,z)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;building.add(o);return o},box=(m,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z);
 function label(text,w,h,x,y,z,rot=0){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1536;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle='#e1e1d9';ctx.fillRect(0,0,1536,192);ctx.fillStyle='#254b69';ctx.font='bold 115px serif';ctx.textAlign='center';ctx.fillText(text,768,135,1480);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.65,side:T.DoubleSide}),x,y,z);o.rotation.y=rot;}
 const ring=HOTEL_WING.map(hotelLocal),shape=new T.Shape(ring.slice(0,-1).map(([x,z])=>new T.Vector2(x,-z))),g=new T.ExtrudeGeometry(shape,{depth:8.5,bevelEnabled:false});g.rotateX(-Math.PI/2);mesh(g,white,0,0,0);
 box(white,14,21,30,12,10.5,-9);box(grey,14.1,4.2,30.1,12,17,-9);box(grey,14.1,1.1,30.1,12,.55,-9);
 for(const x of [4.9,19.1]){box(glass,.12,19.3,3,x,10,-21);for(let y=0;y<21;y+=3.4)box(steel,.16,.12,3.1,x,y,-21);}
 // Asymmetric charcoal panels frame paired white-edged windows; no repeated
 // generic house roof is placed on this hotel.
 for(const x of [4.92,19.08])for(let z=-17;z<5;z+=4.2){box(grey,.12,15,1.35,x,8.8,z+1);for(let y=2.8;y<20;y+=3.4){box(white,.18,1.65,1.7,x,y,z);box(glass,.2,1.4,1.45,x+(x<12?-.02:.02),y,z);box(steel,.22,1.4,.04,x+(x<12?-.03:.03),y,z);}}
 for(const z of [-24.1,6.1])for(const x of [8,12,16])for(let y=2.8;y<20;y+=3.4){box(white,1.7,1.65,.16,x,y,z);box(glass,1.45,1.4,.2,x,y,z);box(steel,.04,1.4,.22,x,y,z);}
 box(stone,.65,21,.3,18.8,10.5,6.25);for(let y=.3;y<21;y+=.45)box(white,.66,.025,.31,18.8,y,6.25);
 for(let h=21;h<22;h+=.28)box(white,14.6,.16,30.6,12,h,-9);
 label('AIRPORT VIEW HOTEL',27,1.5,19.36,21.3,-8,Math.PI/2);label('AIRPORT VIEW HOTEL',12,1.15,12,21.3,-24.4,Math.PI);
 // Low south wing follows every native corner; windows follow its real edges.
 for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<3)continue;const n=Math.max(1,Math.floor(len/3.4)),face=new T.Group();face.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);face.rotation.y=Math.atan2(-dz,dx);building.add(face);for(let j=0;j<n;j++)for(const y of [2.7,6.1]){const o=new T.Mesh(new T.BoxGeometry(1.25,1.25,.13),glass);o.position.set((j+.5)*len/n-len/2,y,.12);face.add(o);}}
 box(grey,26,.65,2,-1,8.4,2);for(let x=-9;x<5;x+=1)for(let z=-30;z<0;z+=1){if([[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]].every(([dx,dz])=>corridorRoadClear(hotelPoint(x+dx,z+dz),.15)&&corridorBuildingClear(hotelPoint(x+dx,z+dz),.15)))box(pave,.98,.035,.98,x,.018,z);}
 box(glass,.12,2.8,3.4,4.7,1.4,-18);box(steel,.16,3.2,.1,4.6,1.6,-19.75);box(steel,.16,3.2,.1,4.6,1.6,-16.25);box(white,5,.16,5,2.6,3.3,-18);label('RECEPTION',3,.6,2.1,2.7,-15.45,Math.PI);
 for(const z of [-29,-27,-25]){box(steel,.08,6,.08,3,3,z);for(const [i,col] of [leaf,gold,mat('#913e38')].entries())box(col,1.5,.38,.025,3.75,5.7-i*.38,z);}
 for(const p of HOTEL_SOLIDS.filter(p=>p.id==='seat')){box(wood,p.w,.15,p.d,p.x,.45,p.z);box(wood,p.w,.55,.1,p.x,.8,p.z-.3);for(const dx of [-1,1])box(steel,.08,.4,.5,p.x+dx,.2,p.z);}
 box(steel,.08,1.8,.08,1,.9,-6);label('HOTEL VISITOR GUIDE',2.7,.6,1,1.5,-6.1,Math.PI);
 // Palm and boundary planting kept inside the clear public forecourt.

 group.userData.airportView={nativeWing:2488138302,tallBlock:'photo/aerial interpretation; absent from bundled outline',interior:'reception,cibo,pool,luna',surveyed:false};enhanceMaterials(group);batchStaticMeshes(group);return {group,update(){}};
}
