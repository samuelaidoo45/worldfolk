import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {surfaceTexture} from './graphics-materials.js';
import {MALL_ENTRANCE} from './accra-mall-data.js';
// Reference: Nkansahrexford's 2015 entrance panorama. Original geometry;
// mapped outer ring/courtyard retained, entrance tower deliberately distinct.
export function createAccraMall(data){
 const group=new T.Group();group.name='Accra Mall';
 const mat=(color,roughness=.75,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const cream=mat('#ceb884'),brick=mat('#735345'),metal=mat('#6e7779',.37,.55),trim=mat('#e5e2d2'),glass=mat('#304a50',.2,.4),pave=mat('#9c9c91'),dark=mat('#333f40'),green=mat('#427557');
 cream.bumpMap=surfaceTexture('plaster');cream.bumpScale=.04;brick.bumpMap=surfaceTexture('stone');brick.bumpScale=.07;
 const add=(geo,m,x=0,y=0,z=0,parent=group)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
 const box=(m,w,h,d,x,y,z,parent)=>add(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
 const local=p=>[(p[0]-data.position[0])*111320*Math.cos(data.position[1]*Math.PI/180),-(p[1]-data.position[1])*111320];
 const rings=data.rings.map(r=>r.map(local)),shape=new T.Shape(rings[0].map(([x,z])=>new T.Vector2(x,-z)));
 for(const r of rings.slice(1))shape.holes.push(new T.Path(r.map(([x,z])=>new T.Vector2(x,-z))));
 add(new T.ExtrudeGeometry(shape,{depth:6.5,bevelEnabled:false}),cream).rotation.x=-Math.PI/2;
 add(new T.ShapeGeometry(shape),metal,0,6.53,0).rotation.x=-Math.PI/2;
 // Retail glazing and segmented cornices follow the real outline, including
 // the internal court; no giant rectangular roof crosses the courtyard/road.
 for(const ring of rings)for(let i=1;i<ring.length;i++){
  const [a,b]=[ring[i-1],ring[i]],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz),angle=Math.atan2(dx,dz);
  if(length<4)continue;
  const edge=new T.Group();edge.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);edge.rotation.y=angle;group.add(edge);
  box(trim,.4,.35,length,0,6.25,0,edge);box(brick,.28,.75,length,0,.375,0,edge);
  const n=Math.floor(length/8);for(let k=0;k<n;k++){const z=(k+.5)*length/n-length/2;box(glass,.3,3.8,Math.min(6,length/n-1),0,2.6,z,edge);box(trim,.36,.1,Math.min(6,length/n-1),0,2.4,z,edge);box(trim,.38,3.8,.12,0,2.6,z,edge)}
 }
 const [ex,ez]=local(MALL_ENTRANCE),entry=new T.Group();entry.position.set(ex,0,ez);entry.rotation.y=-2.56;group.add(entry);
 box(pave,24,.12,14,0,.06,5.5,entry);
 for(const x of [-5.4,5.4])box(brick,1.3,8,2.5,x,4,0,entry);
 box(cream,9.5,2,2,0,5.4,0,entry);box(glass,8.5,4.4,.15,0,2.2,1.1,entry);
 for(const x of [-3.8,0,3.8])box(trim,.15,4.5,.22,x,2.25,1.15,entry);
 // Exposed steel legs, horizontal louvres, flared curved canopy.
 for(const x of [-4.3,4.3])for(const z of [-1.2,1.2])box(metal,.25,9,.25,x,10.5,z,entry);
 for(const y of [8,8.6,9.2])box(metal,9,.14,.2,0,y,1.3,entry);
 const profile=new T.Shape();profile.moveTo(-7,0);profile.quadraticCurveTo(0,2,7,0);profile.lineTo(7,.2);profile.quadraticCurveTo(0,2.2,-7,.2);profile.closePath();
 add(new T.ExtrudeGeometry(profile,{depth:7,bevelEnabled:false}),metal,0,14,-3.5,entry);
 for(const x of [-4.3,4.3]){const strut=box(metal,.18,5,.18,x/2,12.4,1.3,entry);strut.rotation.z=x>0?-.65:.65}
 for(const x of [-7.5,-5,-2.5,2.5,5,7.5]){box(dark,.2,1,.2,x,.5,5,entry);box(cream,.22,.25,.22,x,.75,5,entry)}
 // Signs share one atlas, keeping the landmark under the normal draw budget.
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=1024;c.height=512;const ctx=c.getContext('2d');ctx.fillStyle='#f3f0df';ctx.fillRect(0,0,1024,512);ctx.textAlign='center';ctx.fillStyle='#ac8134';ctx.font='bold 55px sans-serif';ctx.fillText('◆ ◆ ◆',512,95);ctx.fillStyle='#244941';ctx.font='bold 112px sans-serif';ctx.fillText('ACCRA',512,225);ctx.font='italic 95px sans-serif';ctx.fillText('Mall',512,330);ctx.font='38px sans-serif';ctx.fillText('ENTRANCE 1',512,440);
  const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;const signMat=new T.MeshStandardMaterial({map:t,roughness:.8,side:T.DoubleSide});add(new T.PlaneGeometry(7,3.5),signMat,0,11.2,1.4,entry);
 }
 // The mapped courtyard remains open to sky, with shade and planted islands.
 const court=rings[1];if(court){let x=0,z=0;for(const p of court.slice(0,-1)){x+=p[0];z+=p[1]}x/=court.length-1;z/=court.length-1;for(const dx of [-4,4]){box(pave,2,.55,2,x+dx,.28,z);const canopy=add(new T.ConeGeometry(2.2,.7,12),trim,x+dx,3,z);box(metal,.1,2.8,.1,x+dx,1.4,z);add(new T.SphereGeometry(.8,12,8),green,x+dx,.9,z+3)}}
 group.userData.mall={mappedFootprint:true,openCourtyard:true,entrance:MALL_ENTRANCE,reference:'entrance-panorama-2015'};
 batchStaticMeshes(group);return {group};
}
