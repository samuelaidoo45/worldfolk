import * as T from './three.module.js';
import {businessRing,BUSINESS_SITES} from './airport-business-data.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {batchStaticMeshes} from './render-utils.js';
// Native ground outlines; heights, facade divisions and roof profiles are photo interpretations.
export function createBusinessSite(s){
 const group=new T.Group();group.name=s.name;
 const mat=(color,kind='stone',roughness=.8,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),kind);
 const cream=mat('#d8d1bb'),stone=mat('#aaa99b'),brown=mat('#635147','paint'),dark=mat('#25333d'),glass=mat('#547b91','glass',.18,.55),steel=mat('#a1afb1','metal',.4,.6),paving=mat('#999c96','paving'),wood=mat('#725b42','wood'),leaf=mat('#496c43','foliage');
 const add=(geometry,material,x=0,y=0,z=0,parent=group)=>{const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const box=(m,w,h,d,x,y,z,parent=group)=>add(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
 const solid=(ring,h,m,y=0)=>{const shape=new T.Shape(ring.slice(0,-1).map(p=>new T.Vector2(p[0],-p[1]))),g=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);return add(g,m,0,y,0);};
 const clip=(r,axis,cut,less)=>{const out=[],ps=r.slice(0,-1),inside=p=>less?p[axis]<=cut:p[axis]>=cut;for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib){const t=(cut-a[axis])/(b[axis]-a[axis]);out.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1])]);}}return out.length?[...out,out[0]]:[];};
 function faces(r,fn){const area=r.slice(0,-1).reduce((v,a,i)=>v+a[0]*r[i+1][1]-r[i+1][0]*a[1],0),sign=area>0?1:-1;for(let i=0;i<r.length-1;i++){const a=r[i],b=r[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<.6)continue;const f=new T.Group();f.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);f.rotation.y=Math.atan2((b[1]-a[1])/len*sign,-(b[0]-a[0])/len*sign);group.add(f);fn(f,len,i);}}
 function windows(r,floors,base,step,kind){faces(r,(f,len)=>{const n=Math.max(1,Math.round(len/(kind==='hotel'?3.6:4.8))),w=len/n;for(let row=0;row<floors;row++){const y=base+row*step;if(kind==='hotel'){box(brown,len,.21,.22,0,y-.4,.12,f);for(let j=0;j<n;j++){const x=(j+.5)*w-len/2;box(brown,.18,step,.2,x-w/2,y+1,.15,f);box(dark,w*.55,2.2,.09,x,y+.9,.13,f);box(glass,w*.5,2.05,.08,x,y+.9,.2,f);box(steel,.04,2.05,.1,x,y+.9,.25,f);}}else{if(kind==='stanbic'){for(let j=0;j<n;j++){const x=(j+.5)*w-len/2;box(dark,w*.72,1.4,.12,x,y,.17,f);box(glass,w*.68,1.25,.1,x,y,.25,f);box(steel,.06,1.3,.15,x,y,.31,f);}}else{box(glass,len-.2,1.25,.08,0,y,.17,f);for(let j=0;j<n;j++)box(steel,.065,1.28,.15,(j+.5)*w-len/2,y,.24,f);}box(kind==='atlantic'?cream:stone,len,step-1.3,.15,0,y+step/2+.05,.15,f);if(kind==='stanbic')box(cream,len,.13,.8,0,y-.72,.48,f);}}});}
 function sign(text,w,h,x,y,z,angle=0){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1536;c.height=192;const ctx=c.getContext('2d');ctx.fillStyle=s.family==='stanbic'?'#164c7c':'#27373e';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#eee9df';ctx.font='bold 102px sans-serif';ctx.textAlign='center';ctx.fillText(text,768,130,1480);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=add(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,side:T.DoubleSide}),x,y,z);o.rotation.y=angle;}
 function beam(a,b,w=.15,m=steel){const va=new T.Vector3(...a),vb=new T.Vector3(...b),v=vb.clone().sub(va),o=box(m,w,v.length(),w,...va.clone().add(vb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());}
 if(s.family==='marriott'){
  const r=businessRing(s,s.sourceIds[0]),guest=clip(r,0,37,true),events=clip(r,0,37,false);solid(r,4.2,cream);const tall=clip(guest,0,0,true),lower=clip(guest,0,0,false);solid(tall,20.8,cream,4.2);windows(tall,5,5.2,3.85,'hotel');solid(tall,.35,brown,25);solid(lower,13.8,cream,4.2);windows(lower,3,5.2,3.85,'hotel');solid(lower,.35,brown,18);solid(events,2.6,cream,4.2);
  // The central dark cylindrical entrance feature is visible in the operator aerial.
  add(new T.CylinderGeometry(3.8,3.8,28,24),brown,-32,14,22);box(glass,5,23,.2,-25,13.5,24.5);for(let y=3;y<26;y+=3.8)box(steel,5,.08,.3,-25,y,24.7);
  box(cream,15,.4,9,-32,3.9,25);for(const x of [-38,-26])box(steel,.25,3.7,.25,x,1.85,28);sign('MARRIOTT',8,.8,-32,4.3,29.6);
  faces(events,(f,len)=>{if(len>7)for(let x=-len/2+2;x<len/2-1;x+=4){box(dark,2.8,2.5,.12,x,2,.12,f);for(let y=1.2;y<3;y+=.45)for(let dx=-1;dx<1.1;dx+=.45)box(cream,.12,.12,.12,x+dx,y,.22,f);}});
  // Only bounded entrance paving: parking roads and unverified pool geometry stay native.
  box(paving,7,.04,5,-5.5,.02,42.3);
 }else if(s.family==='stanbic'){
  for(const id of s.sourceIds){const r=businessRing(s,id),h=id===687362746?32:26;solid(r,h,stone);windows(r,id===687362746?8:6,3,3.7,'stanbic');solid(r,.3,cream,h);}
  // Rounded northeast frontage and the distinctive split, ribbed roof pavilion.
  const cx=10,cz=2,radius=16;for(let j=0;j<20;j++){const a=Math.PI+j*Math.PI/20,b=Math.PI+(j+1)*Math.PI/20,mid=(a+b)/2,f=new T.Group();f.position.set(cx+Math.cos(mid)*radius,0,cz+Math.sin(mid)*radius);f.rotation.y=-mid+Math.PI/2;group.add(f);box(stone,2.8,32,.35,0,16,0,f);for(let y=3;y<32;y+=3.7){box(glass,2.1,1.3,.12,0,y,.22,f);box(cream,2.8,.14,.65,0,y-.75,.45,f);}}
  for(const side of [-1,1]){const verts=[],uv=[],ind=[];for(let j=0;j<=12;j++){const u=j/12,x=cx+side*(3+u*13),y=35+u*6-u*u*1.5;for(const z of [cz-12,cz+10]){verts.push(x,y,z);uv.push(u,z<cz?0:1);}if(j<12){const a=j*2;ind.push(a,a+1,a+2,a+1,a+3,a+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(ind);g.computeVertexNormals();const roofMat=steel.clone();roofMat.side=T.DoubleSide;add(g,roofMat);for(let j=0;j<=10;j++){const z=cz-12+j*2.2;beam([cx+side*3,34.8,z],[cx+side*16,39.3,z],.15);}}
  for(const z of [-9,9]){beam([cx-3,32,z],[cx-16,39.3,z],.22);beam([cx+3,32,z],[cx+16,39.3,z],.22);beam([cx-3,34.8,z],[cx+3,34.8,z],.16);}
  sign('STANBIC HEIGHTS',14,1,13,2.3,-14.5,Math.PI);box(paving,12,.04,4,29,.02,-18);
 }else{
  const r=businessRing(s,s.sourceIds[0]);solid(r,44,dark);windows(r,11,3.7,3.6,'atlantic');
  // Silver-blue full-height glass frame wraps a recessed pale office grid.
  faces(r,(f,len)=>{box(glass,len,6,.15,0,40,.35,f);for(let x=-len/2;x<len/2;x+=1.8)box(steel,.045,6,.2,x,40,.47,f);for(let y=37;y<43;y+=1.5)box(steel,len,.04,.2,0,y,.48,f);box(steel,len,.5,.7,0,44.1,.3,f);for(const side of [-1,1]){box(glass,Math.min(4,len*.18),37,.2,side*(len/2-Math.min(2,len*.09)),22,.35,f);for(let y=5;y<42;y+=1.7)box(steel,Math.min(4,len*.18),.04,.25,side*(len/2-Math.min(2,len*.09)),y,.5,f);}const n=Math.max(2,Math.round(len/5));for(let j=1;j<n;j++)box(cream,.28,32,.45,-len/2+j*len/n,20,.3,f);});
  const podium=clip(r,1,9,false);solid(podium,6.6,cream);windows(podium,2,2.1,3,'atlantic');solid(podium,.3,steel,6.6);sign('ATLANTIC TOWER',20,1.3,-14.4,42.5,0,-Math.PI/2);box(paving,2,.04,9,-25,.02,5);
 }
 const p=s.seat;box(wood,2.6,.13,.65,p.x,.46,p.z);box(wood,2.6,.5,.1,p.x,.8,p.z+.25);for(const dx of [-1,1])box(steel,.08,.45,.5,p.x+dx,.22,p.z);
 const g=s.guide;box(dark,1,.9,.3,g.x+1.4,.45,g.z);sign('VISITOR GUIDE',.9,.16,g.x+1.4,.78,g.z+.16);
 group.userData.business={sourceIds:s.sourceIds,fullSurvey:false,privateInteriors:false};enhanceMaterials(group);batchStaticMeshes(group);return {group,update(){}};
}
