import * as T from './three.module.js';import {VILLA_MONTICELLO,VILLA_OUTLINE,VILLA_SOLIDS,villaLocal,villaPoint,villaRoadClear} from './villa-monticello-data.js';import {villaKit} from './villa-monticello-model.js';import {enhanceMaterials} from './graphics-materials.js';import {batchStaticMeshes} from './render-utils.js';
export function createVillaMonticello(){
 const group=new T.Group();group.name=VILLA_MONTICELLO.name;const {m,mesh,box,sign,plant,pergola,fountain,wovenSeat}=villaKit(group),ring=VILLA_OUTLINE.map(villaLocal);
 const shape=new T.Shape(ring.slice(0,-1).map(([x,z])=>new T.Vector2(x,-z))),geo=new T.ExtrudeGeometry(shape,{depth:10.5,bevelEnabled:false});geo.rotateX(-Math.PI/2);mesh(geo,m.grey,0,0,0);const roof=new T.ShapeGeometry(shape);roof.rotateX(-Math.PI/2);mesh(roof,m.grey,0,10.55,0);
 // Hotel-authored August 2026 frontage: grey three-storey villa, black frames,
 // groups of opening casements and a central projecting name canopy.
 for(const z of [-5,2,9])for(const y of [5.1,8.3]){const width=z===2?5.2:3.2;box(m.black,.16,2.1,width,-10.78,y,z);box(m.white,.18,1.9,width-.18,-10.88,y,z);for(let zz=z-width/2+.2;zz<z+width/2;zz+=width/3)box(m.black,.22,2.05,.055,-10.99,y,zz);box(m.black,.22,.055,width,-10.99,y+.28,z);if(y>7&&z!==2)for(const zz of [z-.8,z+.8]){const win=box(m.white,.06,1.18,1.1,-11.1,y-.35,zz);win.rotation.z=-.18;}}
 for(const z of [-5.8,8.7]){box(m.black,.16,2.7,4.7,-10.8,1.55,z);box(m.glass,.18,2.5,4.5,-10.9,1.55,z);for(const dz of [-1.45,0,1.45])box(m.black,.23,2.6,.045,-11.02,1.55,z+dz);}
 box(m.black,.18,2.9,3.1,-10.85,1.45,2);box(m.glass,.2,2.7,2.9,-10.98,1.45,2);box(m.black,.24,2.8,.07,-11.1,1.45,2);box(m.grey,2.2,.25,4.8,-11.3,3.3,2);box(m.grey,.3,1.05,4.7,-12.2,3.75,2);sign('VILLA MONTICELLO',4.5,.7,-12.37,3.7,2,-Math.PI/2,'#c3c4bc','#252b26');sign('VM',1,.7,-12.4,4.35,2,-Math.PI/2,'#c3c4bc','#252b26');
 // Follow every native edge for the remaining facades; avoid burying glazing.
 const out=ring.slice(1).reduce((a,p,i)=>a+ring[i][0]*p[1]-p[0]*ring[i][1],0)>0?-1:1;
 for(let i=1;i<ring.length;i++){const a=ring[i-1],b=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<4||a[0]<-10&&b[0]<-10)continue;const wall=new T.Group();wall.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);wall.rotation.y=Math.atan2(-dz,dx);group.add(wall);const n=Math.max(1,Math.floor(len/4));for(let j=0;j<n;j++)for(const y of [2,5.2,8.3]){const x=(j+.5)*len/n-len/2;box(m.black,2.8,2,.15,x,y,.09*out,wall);box(m.glass,2.55,1.8,.17,x,y,.2*out,wall);box(m.black,.055,1.9,.21,x,y,.23*out,wall);}}
 for(const z of [-8.6,12.6])box(m.grey,18.5,.2,.5,-1.6,10.65,z);box(m.grey,.5,.2,21.6,-10.7,10.65,2);
 for(let x=-28;x<-11;x++)for(let z=-15;z<18;z++)if(villaRoadClear(villaPoint(x,z),.8))box(m.pave,.98,.025,.98,x,.015,z);
 for(const p of VILLA_SOLIDS.filter(p=>p.id.startsWith('entry-planter')))plant(p.x,p.z,1.7);
 for(const p of VILLA_SOLIDS){if(p.id==='bench'){box(m.wood,p.w,.15,p.d,p.x,.46,p.z);box(m.wood,p.w,.55,.1,p.x,.8,p.z-.3);for(const dx of [-.9,.9])box(m.black,.07,.4,.5,p.x+dx,.2,p.z);}if(p.id==='guide'){box(m.black,.07,1.8,.07,p.x,.9,p.z);sign('VILLA VISITOR GUIDE',2.7,.6,p.x,1.5,p.z+.08);}}
 // Courtyard is in the native C-shaped recess. No invented swimming pool.
 box(m.green,17,.035,12,16.4,.04,3.8);pergola(22,4,4,11);const feature=fountain(15,4,3);for(const z of [0,7])wovenSeat(22,z,Math.PI/2);plant(9.2,-1.8,1.2);plant(23.8,9.8,1.2);
 group.userData.villaMonticello={nativeFootprint:373795368,facadeReference:'operator photograph, capture Aug 2026',height:'photo-informed estimate',publicAreas:['reception','Brasserie courtyard'],surveyed:false};enhanceMaterials(group);batchStaticMeshes(group);return {group,update:feature.update};
}
