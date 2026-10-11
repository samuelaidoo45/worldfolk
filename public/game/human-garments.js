import * as THREE from './three.module.js';
// Clip the actual skin-weighted surface at garment seams. Assigning whole
// triangles by their centres produces torn-looking cuffs, collars and hems.
export function civilianGeometry(source){
 const attributes=source.attributes,indices=source.index.array,parts=[[],[],[],[]];
 const vertex=i=>({p:[attributes.position.getX(i),attributes.position.getY(i),attributes.position.getZ(i)],n:[attributes.normal.getX(i),attributes.normal.getY(i),attributes.normal.getZ(i)],uv:[attributes.uv.getX(i),attributes.uv.getY(i)],w:new Map(Array.from({length:4},(_,k)=>[attributes.skinIndex.array[i*4+k],attributes.skinWeight.array[i*4+k]]).filter(v=>v[1]>0))});
 const lerp=(a,b,t)=>{const w=new Map();for(const [i,v]of a.w)w.set(i,v*(1-t));for(const[i,v]of b.w)w.set(i,(w.get(i)||0)+v*t);return {p:a.p.map((v,i)=>v+(b.p[i]-v)*t),n:a.n.map((v,i)=>v+(b.n[i]-v)*t),uv:a.uv.map((v,i)=>v+(b.uv[i]-v)*t),w}};
 function clip(poly,axis,cut,side){const out=[];for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=(a.p[axis]-cut)*side,db=(b.p[axis]-cut)*side;if(da>=0)out.push(a);if((da>0&&db<0)||(da<0&&db>0))out.push(lerp(a,b,da/(da-db)))}return out}
 const seams=[[1,.15],[1,1.015],[1,1.535],[0,-.53],[0,.53]];
 for(let i=0;i<indices.length;i+=3){let polygons=[[vertex(indices[i]),vertex(indices[i+1]),vertex(indices[i+2])]];
  for(const [axis,cut]of seams){const next=[];for(const poly of polygons){const values=poly.map(v=>v.p[axis]-cut);if(Math.min(...values)<0&&Math.max(...values)>0){for(const side of [-1,1]){const p=clip(poly,axis,cut,side);if(p.length>=3)next.push(p)}}else next.push(poly)}polygons=next}
  for(const poly of polygons){const y=poly.reduce((sum,v)=>sum+v.p[1],0)/poly.length,x=poly.reduce((sum,v)=>sum+v.p[0],0)/poly.length;const kind=y<.15?3:y<1.015?2:y<1.535&&Math.abs(x)<.53?1:0;for(let j=1;j<poly.length-1;j++)parts[kind].push(poly[0],poly[j],poly[j+1])}
 }
 const p=[],n=[],uv=[],si=[],sw=[],geometry=new THREE.BufferGeometry();let offset=0;
 for(let kind=0;kind<parts.length;kind++){
  geometry.addGroup(offset,parts[kind].length,kind);offset+=parts[kind].length;
  for(const v of parts[kind]){const normal=new THREE.Vector3(...v.n).normalize(),thickness=kind===1?.016:kind===2?.013:kind===3?.012:0;p.push(...v.p.map((c,i)=>c+normal.getComponent(i)*thickness));n.push(...normal.toArray());uv.push(...v.uv);const weights=[...v.w].sort((a,b)=>b[1]-a[1]).slice(0,4),sum=weights.reduce((s,w)=>s+w[1],0);while(weights.length<4)weights.push([0,0]);si.push(...weights.map(w=>w[0]));sw.push(...weights.map(w=>w[1]/sum))}
 }
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(si,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(sw,4));geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}
