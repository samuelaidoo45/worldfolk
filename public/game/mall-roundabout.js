import * as T from './three.module.js';
import {createQuarshieMonument} from './quarshie-monument.js';
import {MALL_APPROACH_ROADS,MALL_APPROACH_GRASS} from './mall-roundabout-map.js';
import {MALL_ISLAND,ROUNDABOUT_CROSSING,roundaboutLocal} from './mall-roundabout-data.js';
import {roadWidth} from './street-safety.js';
import {batchStaticMeshes} from './render-utils.js';
import {enhanceMaterials,tagSurface} from './graphics-materials.js';
export function createMallRoundabout(){
 const group=new T.Group();group.name='Accra Mall · roundabout and mapped approaches';
 const mat=(color,kind)=>tagSurface(new T.MeshStandardMaterial({color,roughness:.94}),kind);
 const asphalt=mat('#33383a','asphalt'),paving=mat('#9c9e96','stone'),grass=mat('#748352','grass'),kerb=mat('#c2beb0','stone'),paint=mat('#e5dfc9','stone'),soil=mat('#93826a','soil');
 // Map ground and custom meshes share a depth buffer. Explicit layer bias
 // keeps the authored surface and its paint stable at street-camera angles.
 for(const [material,bias] of [[grass,-1],[soil,-2],[asphalt,-3],[paving,-3],[paint,-5]]){material.polygonOffset=true;material.polygonOffsetFactor=bias;material.polygonOffsetUnits=bias;}
 const mesh=(geometry,material,x=0,y=0,z=0)=>{const m=new T.Mesh(geometry,material);m.position.set(x,y,z);m.receiveShadow=true;group.add(m);return m};
 const box=(material,w,h,d,x,y,z,angle=0)=>{const m=mesh(new T.BoxGeometry(w,h,d),material,x,y,z);m.rotation.y=angle;return m};
 function polygon(ring,material,y){const points=ring.map(roundaboutLocal),shape=new T.Shape(points.map(([x,z])=>new T.Vector2(x,-z))),m=mesh(new T.ShapeGeometry(shape),material,0,y,0);m.rotation.x=-Math.PI/2;return points;}
 // Continuous mitered ribbons avoid overlapping slabs and cracks at curved vertices.
 function ribbon(coords,width,material,y){const points=coords.map(roundaboutLocal),closed=coords[0].join()===coords.at(-1).join(),vertices=[],indices=[];
  const normal=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1;return [dz/l,-dx/l]};
  for(let i=0;i<points.length;i++){const p=points[i],prev=points[i?i-1:closed?points.length-2:0],next=points[i<points.length-1?i+1:closed?1:i],a=normal(prev,p),b=normal(p,next),nx=a[0]+b[0],nz=a[1]+b[1],l=Math.hypot(nx,nz)||1,n=[nx/l,nz/l],dot=Math.max(.55,Math.abs(n[0]*(i? a[0]:b[0])+n[1]*(i?a[1]:b[1]))),w=width/2/dot;
   for(const side of [-1,1])vertices.push(p[0]+n[0]*w*side,y,p[1]+n[1]*w*side);
   if(i){const k=i*2;indices.push(k-2,k,k-1,k,k+1,k-1);}
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();return mesh(geo,material);
 }
 const crossing=ROUNDABOUT_CROSSING,[cx,cz]=roundaboutLocal(crossing.position),ca=crossing.heading*Math.PI/180;
 for(let offset=-crossing.width/2+.5;offset<crossing.width/2;offset+=1.2)box(paint,.6,.008,3.3,cx+Math.cos(ca)*offset,.048,cz+Math.sin(ca)*offset,-ca);
 polygon(MALL_APPROACH_GRASS,grass,.012);
 // Roads keep their OSM alignment and one-way order; no idealized road grid.
 for(const road of MALL_APPROACH_ROADS){const path=['path','steps','pedestrian'].includes(road.kind),width=path?2.8:roadWidth(road.kind);ribbon(road.coordinates,width,path?paving:asphalt,path?.065:.032);
  const points=road.coordinates.map(roundaboutLocal);let along=0;
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz),angle=Math.atan2(dx,dz),nx=dz/len,nz=-dx/len;if(len<.15)continue;
   if(path){for(let d=1.3;d<len;d+=2.6)box(kerb,2.7,.004,.025,a[0]+dx*d/len,.069,a[1]+dz*d/len,angle);}
   // Short dash spacing around the circle; service-road entries retain open mouths.
   else if(road.oneway&&len>7){for(let d=3;d<len-2;d+=7)box(paint,.12,.006,Math.min(2.5,len-d),a[0]+dx*d/len,.042,a[1]+dz*d/len,angle);}
   if(!path&&len>24&&along>10){const d=len*.55,x=a[0]+dx*d/len,z=a[1]+dz*d/len;box(paint,.16,.006,2.8,x,.044,z,angle);for(const side of [-1,1])box(paint,.16,.006,1.1,x+dx/len*.9+nx*side*.3,.044,z+dz/len*.9+nz*side*.3,angle+side*.65);}
   along+=len;
  }
 }
 // Low central kerb, with the same polygon used for vehicle collision.
 const island=polygon(MALL_ISLAND,grass,.165);
 for(let i=1;i<island.length;i++){const a=island[i-1],b=island[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);box(kerb,.28,.17,len,(a[0]+b[0])/2,.085,(a[1]+b[1])/2,Math.atan2(dx,dz));}
 // Small dry patches within the grass verge, not orange ground across the district.
 for(const [x,z,w,d] of [[-61,17,4,2],[-48,27,3,1.7],[-72,-12,2.8,1.4]]){const m=mesh(new T.CircleGeometry(1,8),soil,x,.016,z);m.rotation.x=-Math.PI/2;m.scale.set(w,d,1);}
 const monument=createQuarshieMonument();group.add(monument.group);
 enhanceMaterials(group);batchStaticMeshes(group);group.userData.roundabout={mappedSections:MALL_APPROACH_ROADS.length,centralIsland:true,photoYear:2025,monumentReferenceDate:'2025-12-15',markings:'interpreted',pedestrianPaths:true};
 return {group,update:monument.update};
}
