import * as T from '../../public/game/three.module.js';
import {MeshoptSimplifier as S} from 'meshoptimizer';

// Offline only. Weld complete attribute tuples, not just positions: UV/normal,
// clothing-material and skinning seams must survive simplification.
export async function simplifyGeometry(source,{ratio=.25,error=.06,skinned=false}={}){
 await S.ready;
 const attrs=source.attributes,groups=source.groups.length?source.groups:[{start:0,count:source.index?source.index.count:attrs.position.count,materialIndex:0}],output={},indices=[],outGroups=[];
 for(const [name,a] of Object.entries(attrs))output[name]={array:[],itemSize:a.itemSize,type:name==='skinIndex'?'Uint16Array':'Float32Array',normalized:a.normalized};
 for(const group of groups){
  if(!group.count)continue;
  const map=new Map(),unique=[],index=[];
  for(let n=group.start;n<group.start+group.count;n++){
   const at=source.index?source.index.getX(n):n;
   const key=Object.entries(attrs).filter(([name])=>skinned||name!=='uv').flatMap(([,a])=>Array.from({length:a.itemSize},(_,k)=>Number(a.array[at*a.itemSize+k]).toFixed(6))).join(',');
   let v=map.get(key);if(v===undefined){v=unique.length;map.set(key,v);unique.push(at);}index.push(v);
  }
  const positions=new Float32Array(unique.flatMap(i=>[attrs.position.getX(i),attrs.position.getY(i),attrs.position.getZ(i)]));
  // Bone IDs are categorical, not continuous floats. Supply one influence
  // field per major bone; lock vertices whose remaining influences are rare.
  const totals=new Map();if(skinned)for(const i of unique)for(let k=0;k<4;k++){const b=attrs.skinIndex.array[i*4+k],w=attrs.skinWeight.array[i*4+k];totals.set(b,(totals.get(b)||0)+w);}
  const bones=[...totals].sort((a,b)=>b[1]-a[1]||a[0]-b[0]).slice(0,27).map(v=>v[0]),fields=[],locks=new Uint8Array(unique.length);
  for(const [v,i] of unique.entries()){
   fields.push(attrs.normal.getX(i),attrs.normal.getY(i),attrs.normal.getZ(i),attrs.uv?.getX(i)||0,attrs.uv?.getY(i)||0);
   if(skinned){const influence=new Map();for(let k=0;k<4;k++){const b=attrs.skinIndex.array[i*4+k],w=attrs.skinWeight.array[i*4+k];influence.set(b,(influence.get(b)||0)+w);if(w>.05&&!bones.includes(b))locks[v]=1;}fields.push(...bones.map(b=>influence.get(b)||0));}
  }
  let reduced=Uint32Array.from(index),measuredError=0;
  if(index.length>120)[reduced,measuredError]=S.simplifyWithAttributes(reduced,positions,3,Float32Array.from(fields),5+bones.length,[.15,.15,.15,skinned?.05:0,skinned?.05:0,...bones.map(()=>1.5)],skinned?locks:null,Math.max(12,Math.floor(index.length*ratio/3)*3),error,skinned?['ErrorAbsolute','LockBorder']:['ErrorAbsolute','Permissive']);
  const compact=new Map(),base=output.position.array.length/3,start=indices.length;
  for(const v of reduced){let remap=compact.get(v);if(remap===undefined){remap=compact.size;compact.set(v,remap);const sourceIndex=unique[v];for(const [name,a] of Object.entries(attrs))for(let k=0;k<a.itemSize;k++)output[name].array.push(a.array[sourceIndex*a.itemSize+k]);}indices.push(base+remap);}
  outGroups.push({start,count:indices.length-start,materialIndex:group.materialIndex,error:measuredError});
 }
 const geometry=new T.BufferGeometry();for(const [name,a] of Object.entries(output)){const C=a.type==='Uint16Array'?Uint16Array:Float32Array;geometry.setAttribute(name,new T.BufferAttribute(new C(a.array),a.itemSize,a.normalized));}geometry.setIndex(indices);for(const group of outGroups)geometry.addGroup(group.start,group.count,group.materialIndex);if(geometry.attributes.position.count){geometry.computeBoundingBox();geometry.computeBoundingSphere();}return {geometry,errors:outGroups.map(g=>g.error)};
}

// Fine rails/mullions are subpixel at the medium-LOD switch distance. Remove
// disconnected components thinner than 12 cm in two axes; keep walls, window
// panels, slabs, canopies and mapped ground surfaces. Collision is separate.
export function removeSubpixelComponents(source,threshold=.12){
 const p=source.attributes.position,index=source.index?.array||Array.from({length:p.count},(_,i)=>i),parent=Array.from({length:p.count},(_,i)=>i),positions=new Map();
 const find=i=>{while(parent[i]!==i){parent[i]=parent[parent[i]];i=parent[i];}return i;},union=(a,b)=>{a=find(a);b=find(b);if(a!==b)parent[b]=a;};
 for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(5)).join(',');if(positions.has(key))union(i,positions.get(key));else positions.set(key,i);}
 for(let i=0;i<index.length;i+=3){union(index[i],index[i+1]);union(index[i],index[i+2]);}
 const bounds=new Map();for(const i of index){const root=find(i);if(!bounds.has(root))bounds.set(root,new T.Box3());bounds.get(root).expandByPoint(new T.Vector3(p.getX(i),p.getY(i),p.getZ(i)));}
 const keep=new Set([...bounds].filter(([,box])=>box.getSize(new T.Vector3()).toArray().sort((a,b)=>a-b)[1]>=threshold).map(([root])=>root)),kept=[];
 for(let i=0;i<index.length;i+=3)if(keep.has(find(index[i])))kept.push(index[i],index[i+1],index[i+2]);
 const g=source.clone();g.setIndex(kept);g.clearGroups();return g;
}

export function packGeometry(geometry,chunks){
 const attributes={};
 for(const [name,attribute] of Object.entries(geometry.attributes)){
  const bytes=Buffer.from(attribute.array.buffer,attribute.array.byteOffset,attribute.array.byteLength),offset=chunks.reduce((n,b)=>n+b.length,0);chunks.push(bytes);if(bytes.length%4)chunks.push(Buffer.alloc(4-bytes.length%4));attributes[name]={offset,length:attribute.array.length,itemSize:attribute.itemSize,type:attribute.array.constructor.name,normalized:attribute.normalized};
 }
 const array=Uint32Array.from(geometry.index?.array||Array.from({length:geometry.attributes.position.count},(_,i)=>i)),offset=chunks.reduce((n,b)=>n+b.length,0);chunks.push(Buffer.from(array.buffer));
 return {attributes,index:{offset,length:array.length,type:'Uint32Array'},groups:geometry.groups};
}
