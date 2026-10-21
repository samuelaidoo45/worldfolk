import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface} from './graphics-materials.js';
import {GALLERY_ROTATION,GALLERY_RINGS,GALLERY_BLOCKS,GALLERY_PLANTERS,GALLERY_BENCH,galleryLocal} from './gallery-data.js';

// Original meshes based on Clifton Homes' courtyard and roof-pool photographs.
export function createGallery(){
 const group=new T.Group(),root=new T.Group();group.name='The Gallery · courtyard residences';group.add(root);root.rotation.y=GALLERY_ROTATION;
 const mat=(color,surface,roughness=.7,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),surface);
 const white=mat('#efeee8','plaster'),wood=mat('#584034','wood'),glass=mat('#a0b3b2','glass',.19,.35),steel=mat('#798c8e','metal',.3,.6),paving=mat('#ab9990','paving'),tile=mat('#b8b7ae','paving'),leaf=mat('#4a7544','foliage'),soil=mat('#5c5943','soil'),water=mat('#267d9a','glass',.13,.4),linen=mat('#b7b8ac','fabric');
 water.emissive.set('#123c49');water.emissiveIntensity=.15;
 const mesh=(geometry,material,x,y,z,parent=root)=>{const o=new T.Mesh(geometry,material);o.position.set(x,y,z);o.castShadow=material!==water;o.receiveShadow=true;parent.add(o);return o};
 const box=(m,w,h,d,x,y,z,parent=root)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
 // The shells retain every outline vertex; balconies follow each long wall edge.
 for(const b of GALLERY_BLOCKS){
  const points=GALLERY_RINGS[b.id].slice(0,-1).map(galleryLocal),shape=new T.Shape(points.map(([x,z])=>new T.Vector2(x,-z))),geo=new T.ExtrudeGeometry(shape,{depth:30,bevelEnabled:false});geo.rotateX(-Math.PI/2);mesh(geo,white,0,0,0);
  const area=points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p[0]*q[1]-q[0]*p[1]},0);
  for(let i=0;i<points.length;i++){
   const a=points[i],c=points[(i+1)%points.length],dx=c[0]-a[0],dz=c[1]-a[1],length=Math.hypot(dx,dz);if(length<4)continue;
   const face=new T.Group();face.position.set((a[0]+c[0])/2,0,(a[1]+c[1])/2);face.rotation.y=-Math.atan2(dz,dx);root.add(face);
   const out=area>0?-1:1,bays=Math.max(1,Math.floor(length/3.8)),bw=length/bays;
   for(let f=0;f<b.levels;f++){
    const y=f*3;
    box(white,length,.24,.85,0,y+2.92,out*.32,face);
    for(let j=0;j<bays;j++){
     const x=-length/2+bw*(j+.5);
     box(wood,bw-.24,2.72,.09,x,y+1.5,out*.06,face);
     box(glass,bw-.78,2.15,.06,x-.15,y+1.4,out*.13,face);
     box(white,.06,2.18,.08,x-.15,y+1.4,out*.18,face);
     box(white,.2,2.8,.45,x-bw/2+.1,y+1.45,out*.24,face);
     if(f){box(glass,bw-.22,.76,.045,x,y+.65,out*.68,face);box(steel,bw-.12,.045,.055,x,y+1.05,out*.69,face);box(white,.055,1.04,.07,x-bw/2+.14,y+.55,out*.69,face);}
     if(j%3===0)for(let k=0;k<9;k++)box(wood,.38,.07,.08,x+bw/2-.45,y+.4+k*.23,out*.21,face);
    }
   }
  }
  // Parapet and rooftop equipment stay within the mapped footprint.
  box(white,b.w-1,.5,b.d-1,b.x,30.18,b.z);
 }
 // Central white spine and entrance canopy, visible along the garden axis.
 box(white,5,29,.28,-2,15,-10.25);
 for(let f=1;f<9;f++){box(glass,2.8,.8,.06,-2,f*3+1.4,-10.08);for(const x of [-2.8,-2,-1.2])box(white,.08,.82,.09,x,f*3+1.4,-10.02);}
 box(glass,3.8,2.5,.09,-2,1.25,-10.03);box(white,5,.22,2.8,-2,2.8,-10.3);
 box(paving,35,.06,37,-2,.03,7.1);
 for(const [x,z,w,d] of GALLERY_PLANTERS){
  box(white,w,.72,d,x,.36,z);box(soil,w-.35,.04,d-.35,x,.74,z);
  for(let i=0;i<30;i++){const px=x-w/2+.5+(i%6)*(w-1)/5,pz=z-d/2+.5+Math.floor(i/6)*(d-1)/4;for(let j=0;j<3;j++){const blade=box(leaf,.08,.6+j*.12,.04,px+(j-1)*.12,1+j*.05,pz);blade.rotation.z=(j-1)*.22;}}
  mesh(new T.CylinderGeometry(.12,.2,3.6,8),wood,x,2.5,z);
  for(let i=0;i<38;i++){const angle=i*2.4,r=.5+(i%5)*.42,o=mesh(new T.IcosahedronGeometry(.75+(i%3)*.16,1),leaf,x+Math.cos(angle)*r,3.5+(i%7)*.28,z+Math.sin(angle)*r);o.scale.y=.85;}
 }
 const [bx,bz]=GALLERY_BENCH;box(wood,2.4,.12,.65,bx,.47,bz);box(wood,2.4,.5,.1,bx,.77,bz-.3);for(const x of [-.9,.9])box(steel,.1,.43,.5,bx+x,.215,bz);
 // Roof pool: blue basin, pale deck, glass guards, timber pergola and loungers.
 box(tile,38,.12,13,-1,30.5,-20);box(white,23,.18,6,-5,30.65,-21);box(water,22.5,.025,5.5,-5,30.755,-21);
 for(const z of [-26.6,-13.4]){box(glass,39,1.1,.06,-1,31.1,z);box(steel,39,.055,.09,-1,31.68,z);}
 for(const x of [-20.5,18.5])box(glass,.06,1.1,13,x,31.1,-20);
 for(let i=0;i<5;i++){const x=-13+i*4;box(wood,1.6,.3,2.2,x,30.75,-15.5);const back=box(linen,1.6,.12,1.1,x,31.12,-14.9);back.rotation.x=.55;box(linen,1.6,.12,1.4,x,30.96,-16);}
 for(const x of [-17,5])for(const z of [-17.5,-12.9])box(white,.18,3,.18,x,32,z);
 for(let x=-17.2;x<5.5;x+=.65)box(wood,.15,.24,5,x,33.5,-15.2);
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=768;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#eeeee8';ctx.fillRect(0,0,768,256);ctx.fillStyle='#403a34';ctx.textAlign='center';ctx.font='80px serif';ctx.fillText('G',384,103);ctx.font='bold 42px sans-serif';ctx.fillText('THE GALLERY',384,176);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(4.7,1.57),new T.MeshStandardMaterial({map:tex,roughness:.8}),-2,28.4,-10.07);
 }
 group.userData.gallery={footprints:GALLERY_BLOCKS.map(b=>b.id),rooftopPool:true,roofAccess:false,reference:'Clifton Homes official photographs',dimensions:'estimated'};
 batchStaticMeshes(group);
 return {group,update(t){water.emissiveIntensity=.14+Math.sin(t*.6)*.025}};
}
