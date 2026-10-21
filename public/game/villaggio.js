import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface} from './graphics-materials.js';
import {VILLAGGIO_BLOCKS,VILLAGGIO_ROTATION,VILLAGGIO_PROPS,VILLAGGIO_BENCH} from './villaggio-data.js';

// Original, photo-referenced geometry; no external photo textures.
export function createVillaggio({detail='near'}={}){
 const group=new T.Group(),site=new T.Group();site.rotation.y=VILLAGGIO_ROTATION;group.add(site);group.name='Villaggio Vista · Alto / Aqua / Azure';
 const mat=(color,kind='plaster',roughness=.8,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),kind);
 const ivory=mat('#e3ded0'),recess=mat('#343b39'),glass=mat('#526b6d','glass',.22,.4),frame=mat('#343c3c','metal',.42,.4),stone=mat('#a6a599','paving'),grass=mat('#718452','grass'),leaf=mat('#456e3c','foliage'),bark=mat('#6b5944','wood'),wood=mat('#7c573e','wood');
 const palette={yellow:['#d1b932','#f0dd76','#b4a044','#e9e2b5','#9a8b54'],green:['#91b23e','#bfd967','#659044','#d6df9a','#819942'],red:['#a73537','#d16438','#e39342','#7b303e','#bf5262']};
 for(const k in palette)palette[k]=palette[k].map(c=>new T.Color(c));
 const panelMaterial=mat('#ffffff');panelMaterial.vertexColors=true;
 const box=(m,w,h,d,x,y,z,parent=site)=>{// Distant facade panels retain the same colours and window layout but only
 // need their outward face. Keep structural slabs, loggias and supports solid.
 const flat=detail==='medium'&&(m.isColor||m===glass)&&Math.min(w,d)<.5;
 const side=flat&&w<d,geometry=flat?new T.PlaneGeometry(side?d:w,h):new T.BoxGeometry(w,h,d);if(m.isColor){const colors=new Float32Array(geometry.attributes.position.count*3);for(let i=0;i<colors.length;i+=3){colors[i]=m.r;colors[i+1]=m.g;colors[i+2]=m.b;}geometry.setAttribute('color',new T.BufferAttribute(colors,3));m=panelMaterial;}const mesh=new T.Mesh(geometry,m);mesh.position.set(x,y,z);if(flat){mesh.rotation.y=side?Math.sign(x)*Math.PI/2:z<0?Math.PI:0;mesh.position[side?'x':'z']+=Math.sign(side?x:z)*(side?w:d)/2;}mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const skyVoids=[];
 for(const b of VILLAGGIO_BLOCKS){
  const p=new T.Group();p.position.set(b.x,0,b.z);site.add(p);const colors=palette[b.family],floors=Math.round((b.top-b.bottom)/3),fh=(b.top-b.bottom)/floors;
  for(let f=0;f<floors;f++){
   const y=b.bottom+f*fh,open=b.sky&&f===floors-2;
   // Two-metre-deep end loggias give the white ends real depth, not painted windows.
   box(recess,b.w-.9,fh-.18,b.d-4,0,y+fh/2,0,p);
   box(ivory,b.w,.2,b.d,0,y+.1,0,p);
   for(const side of [-1,1]){
    const cols=Math.max(4,Math.round(b.w/1.7)),cw=b.w/cols;
    for(let j=0;j<cols;j++){
     const x=-b.w/2+cw*(j+.5),hash=(j*7+f*11+(f%3)*j)%19,color=colors[hash%colors.length],isWhite=b.end===(side<0?'north':'south');
     if(isWhite){
      // Alternating white parapets, deep slots and open sky courts.
      if(!open)box(ivory,cw-.03,hash%4===0?.65:1.55,.42,x,y+(hash%4===0?.4:1),side*b.d/2,p);
      if(j%6===0)box(ivory,.36,fh,.7,x,y+fh/2,side*(b.d/2-.15),p);
      if(!open&&hash%3===0)box(glass,cw-.16,1.15,.06,x,y+2,side*(b.d/2-1.8),p);
     }else{
      // Staggered vertical Kente-inspired panels, with genuinely recessed narrow glazing.
      const window=hash%4!==0;
      if(window){
       box(color,cw*.27,fh-.035,.32,x-cw*.36,y+fh/2,side*b.d/2,p);
       box(color,cw*.27,fh-.035,.32,x+cw*.36,y+fh/2,side*b.d/2,p);
       box(color,cw*.5,.6,.32,x,y+.3,side*b.d/2,p);
       box(color,cw*.5,.42,.32,x,y+fh-.21,side*b.d/2,p);
       box(glass,cw*.46,fh-1.05,.06,x,y+(fh+.18)/2,side*(b.d/2-.38),p);
      }else box(color,cw-.025,fh-.035,.32,x,y+fh/2,side*b.d/2,p);
     }
    }
    // Long sides have patterned narrow panels, regardless of tower height.
    const colsZ=Math.max(3,Math.round(b.d/1.8)),dz=b.d/colsZ;
    for(let j=0;j<colsZ;j++){
     const z=-b.d/2+dz*(j+.5),hash=(f*13+j*5+f*j)%23,color=colors[hash%colors.length];
     if(b.end==='west'&&side<0){box(ivory,.4,1.2,dz-.04,-b.w/2,y+.6,z,p);if(j%3===0)box(ivory,.8,fh,.3,-b.w/2+.1,y+fh/2,z,p);}
     else{
      box(color,.32,fh-.03,dz*.48,side*b.w/2,y+fh/2,z-dz*.26,p);
      box(color,.32,.8,dz*.5,side*b.w/2,y+.4,z+dz*.24,p);
      box(color,.32,.4,dz*.5,side*b.w/2,y+fh-.2,z+dz*.24,p);
      box(glass,.06,fh-1.2,dz*.46,side*(b.w/2-.38),y+(fh+.4)/2,z+dz*.24,p);
     }
    }
   }
   if(open){skyVoids.push({block:b.id,y:y+1.5});for(const x of [-b.w/2+2,b.w/2-2])box(ivory,1.5,.5,1,x,y+.25,-b.d/2+1,p);}
  }
  box(ivory,b.w,.25,b.d,0,b.top,0,p);
  // Roof parapets and recessed roof service volume preserve the silhouette.
  for(const side of [-1,1])box(colors[1],b.w,.6,.22,0,b.top+.4,side*b.d/2,p);
  if(b.id!=='aqua-wing')box(ivory,b.w*.28,1.7,b.d*.22,0,b.top+.95,0,p);
 }
 // A narrow interpreted garden walk between mapped building footprints.
 box(stone,70,.045,7,-20,.028,-5);box(grass,68,.035,3,-20,.025,-11);
 const [bx,bz]=VILLAGGIO_BENCH;box(wood,2.3,.12,.7,bx,.46,bz);box(wood,2.3,.55,.12,bx,.8,bz-.3);
 for(const dx of [-.85,.85])box(frame,.12,.42,.5,bx+dx,.21,bz);
 for(const [x,z,w,d] of VILLAGGIO_PROPS.slice(1)){
  box(stone,w,.5,d,x,.25,z);box(bark,.2,2.3,.2,x,1.5,z);
  const crown=new T.Mesh(new T.IcosahedronGeometry(1.5,1),leaf);crown.position.set(x,3,z);crown.scale.y=.85;crown.castShadow=true;site.add(crown);
 }
 if(typeof document!=='undefined'){
  const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e3ded0';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#343c3c';ctx.textAlign='center';ctx.font='60px sans-serif';ctx.fillText('VILLAGGIO VISTA',512,85);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;
  const m=new T.MeshStandardMaterial({map:t,roughness:.8}),sign=new T.Mesh(new T.PlaneGeometry(8,1),m);sign.position.set(57,2,-32.65);sign.rotation.y=Math.PI;site.add(sign);
 }
 group.userData.villaggio={blocks:VILLAGGIO_BLOCKS.map(b=>b.id),skyVoids,dimensions:'map-and-photo-estimates',privateInteriors:false};
 batchStaticMeshes(group);return {group,update(){}};
}
