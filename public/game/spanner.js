import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {SPANNER_NAVIGATION,SPANNER_RAILS,SPANNER_SUPPORTS,SPANNER_DECK,SPANNER_DECK_HEIGHT as H} from './spanner-data.js';
// Original geometry informed by the 2016 Commons photographs; no photo textures.
export function createSpanner(){
 const group=new T.Group();group.name='Spanner · silver arch pedestrian crossing';
 const mat=(color,kind,roughness=.7,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),kind);
 const silver=mat('#b6babc','metal',.37,.65),concrete=mat('#aea99c','stone'),edge=mat('#827f75','stone'),dark=mat('#555b5c','metal',.5,.55),nosing=mat('#d0c9b3','stone');
 const mesh=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o};
 const box=(m,w,h,d,x,y,z,angle=0)=>{const o=mesh(new T.BoxGeometry(w,h,d),m,x,y,z);o.rotation.y=-angle;return o};
 const beam=(a,b,r,m=silver)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av),o=mesh(new T.CylinderGeometry(r,r,v.length(),8),m,...av.clone().add(bv).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o};
 const point=(s,u,side=0,y=s.y)=>[s.x+Math.cos(s.angle||0)*s.w*u-Math.sin(s.angle||0)*side,y+(s.rise||0)*u,s.z+Math.sin(s.angle||0)*s.w*u+Math.cos(s.angle||0)*side];
 for(const s of SPANNER_NAVIGATION.surfaces){
  if(s.rise){const geo=new T.BoxGeometry(s.w,.22,s.d),p=geo.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+(p.getX(i)/s.w)*s.rise);geo.computeVertexNormals();const o=mesh(geo,concrete,s.x,s.y-.11,s.z);o.rotation.y=-(s.angle||0);}
  else {box(concrete,s.w,s.y-s.base,s.d,s.x,(s.y+s.base)/2,s.z,s.angle);if(s.kind==='step')box(nosing,.055,.012,s.d-.05,s.x-Math.cos(s.angle)*s.w*.43,s.y+.006,s.z-Math.sin(s.angle)*s.w*.43,s.angle);}
 }
 for(const s of SPANNER_SUPPORTS){box(concrete,s.w,s.top,s.d,s.x,s.top/2,s.z);box(edge,s.w+1,.35,s.d+1,s.x,.175,s.z);}
 for(const r of SPANNER_RAILS){
  for(const h of [.15,.6,1.15])beam(point(r,-.5,0,r.y+h),point(r,.5,0,r.y+h),h===1.15?.055:.027);
  const count=Math.ceil(r.w/.22);for(let i=0;i<=count;i++){const u=i/count-.5;beam(point(r,u,0,r.y+.08),point(r,u,0,r.y+1.12),.019);}
  for(let u=-.5;u<=.501;u+=1/Math.ceil(r.w/2))beam(point(r,u,0,r.y-.12),point(r,u,0,r.y+1.18),.045);
 }
 // Twin tubular bowstring arches, joined by transverse tubes and X bracing.
 const span=SPANNER_DECK,archY=u=>H+.35+8.1*(1-4*u*u),arch=(u,side)=>point(span,u,side*2.55,archY(u));
 for(const side of [-1,1]){
  const pts=Array.from({length:49},(_,i)=>new T.Vector3(...arch(i/48-.5,side)));
  mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),96,.32,10,false),silver,0,0,0);
  for(let i=1;i<16;i++){const u=i/16-.5;beam(arch(u,side),point(span,u,side*2.18,H-.15),.052);}
  beam(point(span,-.5,side*2.15,H-.17),point(span,.5,side*2.15,H-.17),.14,dark);
  // Visible flange rings on the arch tubes.
  for(const u of [-.25,0,.25]){const p=arch(u,side),v=new T.Vector3(...arch(u+.005,side)).sub(new T.Vector3(...arch(u-.005,side))).normalize(),o=mesh(new T.CylinderGeometry(.4,.4,.11,16),dark,...p);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v);}
 }
 for(let i=1;i<8;i++){const u=i/8-.5;beam(arch(u,-1),arch(u,1),.12);if(i<7){const v=(i+1)/8-.5;beam(arch(u,-1),arch(v,1),.045);beam(arch(u,1),arch(v,-1),.045);}}
 // Concrete approach pads stay on the mapped pedestrian side of each kerb.
 for(const [x,z] of [[32,-17],[-34,-3]])box(concrete,5,.06,4,x,.03,z);
 enhanceMaterials(group);batchStaticMeshes(group);
 group.userData.spanner={deckHeight:H,underDeckClearance:H-.32,archRise:8.1,sourceSpan:413842865,walkable:true};
 return {group,update(){}};
}
