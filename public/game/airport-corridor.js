import * as T from './three.module.js';
import {CORRIDOR_PATHS,CORRIDOR_PAVEMENTS,CORRIDOR_LAMPS,CORRIDOR_MEDIAN,corridorLocal,corridorRoadClear,inAirportCorridor,corridorDrawLines} from './airport-corridor-data.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {batchStaticMeshes} from './render-utils.js';
export function createAirportCorridor(){
 const group=new T.Group();group.name='Airport City streets';
 const mat=(color,kind)=>tagSurface(new T.MeshStandardMaterial({color,roughness:.95}),kind),asphalt=mat('#35383a','asphalt'),paving=mat('#999b95','paving'),kerb=mat('#c3c1b5','stone'),line=mat('#d9d8c9','paint'),drain=mat('#777d7a','stone'),steel=mat('#4c5558','metal'),earth=mat('#958365','earth'),leaf=mat('#58704a','foliage');
 const box=(m,w,h,d,p,y,angle=0,side=0)=>{const [x,z]=corridorLocal(p),a=angle*Math.PI/180,o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x+Math.cos(a)*side,y,z+Math.sin(a)*side);o.rotation.y=-a;o.castShadow=h>.5;o.receiveShadow=true;group.add(o);return o;};
 function ribbon(r,coordinates){const ps=coordinates.map(corridorLocal),verts=[],uv=[],indices=[];let run=0;for(let i=0;i<ps.length;i++){const p=ps[i],a=ps[Math.max(0,i-1)],b=ps[Math.min(ps.length-1,i+1)],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz)||1;if(i)run+=Math.hypot(p[0]-a[0],p[1]-a[1]);for(const side of [-1,1]){verts.push(p[0]+dz/len*r.width/2*side,.039+CORRIDOR_PATHS.indexOf(r)*.0003,p[1]-dx/len*r.width/2*side);uv.push(side===1?1:0,run/r.width);}if(i<ps.length-1){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();const mesh=new T.Mesh(g,r.class==='path'?paving:asphalt);mesh.receiveShadow=true;group.add(mesh);}
 for(const r of CORRIDOR_PATHS){
  for(const coordinates of corridorDrawLines(r))ribbon(r,coordinates);
  if(r.class==='path'||r.roundabout)continue;
  // Arc-length samples keep markings continuous over native polyline vertices.
  if(r.name==='Airport Bypass')for(let d=1;d<r.path.total-1;d+=2){const p=r.path.at(d);if(inAirportCorridor(p.position)&&corridorRoadClear(p.position,.2,r.id))for(const side of [-.16,.16])box(line,.1,.009,1.99,p.position,.061,p.heading,side);}
  if(r.class==='service'||r.width<6||r.name==='Airport Bypass')continue;
  for(let d=8;d<r.path.total-8;d+=9){const p=r.path.at(d);if(!inAirportCorridor(p.position)||!corridorRoadClear(p.position,.1,r.id))continue;const offsets=r.class==='trunk'?[-1.75,1.75]:r.name==='Airport Bypass'?[-.16,.16]:[0];for(const side of offsets)box(line,.1,.009,3,p.position,.061,p.heading,side);}
 }
 for(const p of CORRIDOR_PAVEMENTS){
  box(p.surface==='earth'?earth:paving,p.width,.07,p.length,p.position,.04,p.heading);
  if(p.surface==='earth')continue;
  // Road-facing kerb and segmented covered channel, with expansion joints.
  const side=-p.side;box(p.kerbPaint?steel:kerb,.16,.14,p.length,p.position,.07,p.heading,side*1.12);box(drain,.44,.085,p.length,p.position,.047,p.heading,side*.75);
  box(steel,.4,.008,.025,p.position,.095,p.heading,side*.75);
 }
 for(const p of CORRIDOR_MEDIAN){box(earth,p.width,.06,p.length,p.position,.04,p.heading);for(const side of [-1,1])box(kerb,.18,.15,p.length,p.position,.08,p.heading,side*p.width/2);}
 // Low shrubs are spaced along the referenced central reservation, not scattered street stalls.
 for(let i=0;i<CORRIDOR_MEDIAN.length;i+=8){const p=CORRIDOR_MEDIAN[i],[x,z]=corridorLocal(p.position),o=new T.Mesh(new T.SphereGeometry(.7,7,5),leaf);o.scale.set(1,.65,1);o.position.set(x,.55,z);group.add(o);}
 for(const p of CORRIDOR_LAMPS){box(steel,.15,7,.15,p.position,3.5);box(steel,1.6,.1,.12,p.position,7,p.heading,-.7);box(kerb,.6,.09,.3,p.position,6.96,p.heading,-1.3);}
 group.userData.corridor={mappedRoads:CORRIDOR_PATHS.length,pavementSections:CORRIDOR_PAVEMENTS.length,estimatedWidths:true,surveyed:false};enhanceMaterials(group);batchStaticMeshes(group);return {group};
}
