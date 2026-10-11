import * as T from './three.module.js';
import {PRECINCT_STREETS} from './precinct-streets-data.js';
import {precinctLocal} from './precinct-navigation.js';
import {roadWidth} from './street-safety.js';
import {batchStaticMeshes} from './render-utils.js';
export const PRECINCT_STREET_SCENE={id:'independence-streets',name:'Independence precinct streets',position:[-.19256,5.548],rotation:0,width:800,depth:650,height:0};
export function createPrecinctStreets(){
 const group=new T.Group(),curb=new T.MeshStandardMaterial({color:'#c3c1b5',roughness:.94}),white=new T.MeshStandardMaterial({color:'#e1dfc9',roughness:.9}),paving=new T.MeshStandardMaterial({color:'#92988e',roughness:.95});
 const box=(mat,w,h,d,x,y,z,a=0)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.rotation.y=a;m.receiveShadow=true;group.add(m)};
 const endpoints=new Map();for(const r of PRECINCT_STREETS)for(const p of [r.coordinates[0],r.coordinates.at(-1)]){const key=p.join(',');endpoints.set(key,(endpoints.get(key)||0)+1)}
 for(const r of PRECINCT_STREETS){const points=r.coordinates.map(p=>precinctLocal(PRECINCT_STREET_SCENE,p)),width=roadWidth(r.kind),path=['path','pedestrian'].includes(r.kind);let along=0;
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<.2)continue;const angle=Math.atan2(dx,dz),nx=dz/len,nz=-dx/len;
   // Leave turning mouths open at connected road endpoints.
   const start=i===1&&(endpoints.get(r.coordinates[0].join(','))||0)>2?9:0,end=i===points.length-1&&(endpoints.get(r.coordinates.at(-1).join(','))||0)>2?9:0,span=len-start-end;
   if(span>0)for(const side of [-1,1]){const t=(start+span/2)/len,x=a[0]+dx*t,z=a[1]+dz*t,edge=(width/2+.55)*side;
    box(curb,.22,.14,span,x+nx*edge,.07,z+nz*edge,angle);
    if(!path)box(white,.10,.008,span,x+nx*(width/2-.3)*side,.018,z+nz*(width/2-.3)*side,angle);
   }
   if(path)box(paving,width,.015,len,(a[0]+b[0])/2,.045,(a[1]+b[1])/2,angle);
   // Sparse arrows follow actual one-way OSM direction around the roundabout.
   if(r.oneway&&!path&&len>8&&along%55<len){const x=(a[0]+b[0])/2,z=(a[1]+b[1])/2;box(white,.16,.012,2.4,x,.03,z,angle);for(const s of [-1,1])box(white,.14,.012,1.1,x+dx/len*.6+nx*s*.33,.03,z+dz/len*.6+nz*s*.33,angle+s*.72);}
   along+=len;
  }
 }
 batchStaticMeshes(group);group.userData.precinct={kind:'streets',mappedSections:PRECINCT_STREETS.length};return {group};
}
