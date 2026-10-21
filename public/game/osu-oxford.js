import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {OSU_MASSES,osuLocal,osuFrame} from './osu-oxford-data.js';

// Original, bounded street exteriors from the dated reference register. All
// windows/signs are generated locally; no reference photos are runtime textures.
export function createOsuSite(site){
 const group=new T.Group();group.name=site.name;
 const material=(color,surface='smooth',roughness=.8,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),surface);
 const silver=material('#b7b9b4','metal',.57,.18),cream=material('#d0c8b5','plaster'),blue=material('#234f8c','metal',.55,.15),red=material('#8d302c','metal',.5,.2),dark=material('#343d3e'),glass=material('#344a50','glass',.21,.38),frame=material('#828b88','metal',.4,.5),stone=material('#b8b2a5','stone'),paving=material('#a29b87','paving'),yellow=material('#d8ae39'),leaf=material('#385943','foliage');
 const warm=material('#c8bc97');warm.emissive.set('#d8bb79');warm.emissiveIntensity=.25;
 const boxGeo=new T.BoxGeometry(1,1,1),planeGeo=new T.PlaneGeometry(1,1);
 const add=(geo,mat,x,y,z,parent=group)=>{const mesh=new T.Mesh(geo,mat);mesh.position.set(x,y,z);mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);return mesh;};
 const box=(mat,w,h,d,x,y,z,parent=group)=>{const mesh=add(boxGeo,mat,x,y,z,parent);mesh.scale.set(w,h,d);return mesh;};
 const plane=(mat,w,h,x,y,z,parent)=>{const mesh=add(planeGeo,mat,x,y,z,parent);mesh.scale.set(w,h,1);return mesh;};
 const solid=(ring,h,mat,y=0)=>{const shape=new T.Shape(ring.slice(0,-1).map(([x,z])=>new T.Vector2(x,-z))),geo=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:1});geo.rotateX(-Math.PI/2);return add(geo,mat,0,y,0);};
 const frontInfo=osuFrame(site),front=new T.Group();front.position.set(frontInfo.x,0,frontInfo.z);front.rotation.y=frontInfo.angle;group.add(front);const w=frontInfo.width;
 // One small sign atlas per site bounds texture count and signage draw calls.
 let atlas,atlasContext,atlasMaterial,labels=0;
 const sign=(text,width,height,x,y,z,parent=front,{color='#ffffff',background='#203b68',italic=false}={})=>{
  if(typeof document==='undefined')return;
  if(!atlas){const c=document.createElement('canvas');c.width=1024;c.height=1024;atlasContext=c.getContext('2d');atlas=new T.CanvasTexture(c);atlas.colorSpace=T.SRGBColorSpace;atlasMaterial=new T.MeshStandardMaterial({map:atlas,roughness:.65,emissive:'#ffffff',emissiveMap:atlas,emissiveIntensity:.08});}
  if(labels>=8)throw new Error('Osu sign atlas exceeded');
  const row=labels++,ctx=atlasContext;ctx.fillStyle=background;ctx.fillRect(0,row*128,1024,128);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=(italic?'italic ':'')+'bold 65px sans-serif';ctx.fillText(text,512,row*128+66,990);atlas.needsUpdate=true;
  const geo=new T.PlaneGeometry(width,height),uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setY(i,1-(row+1-uv.getY(i))/8);add(geo,atlasMaterial,x,y,z,parent);
 };
 const window=(parent,x,y,width,height,z=.09)=>{box(frame,width+.14,height+.14,.12,x,y,z,parent);plane(glass,width,height,x,y,z+.075,parent);box(frame,.05,height,.045,x,y,z+.1,parent);};
 let windowBays=0;
 for(const mass of OSU_MASSES.filter(m=>m.siteId===site.id)){
  const ring=mass.ring.map(p=>osuLocal(site,p));solid(ring,mass.height,site.family==='papaye'?cream:site.family==='frankies'?blue:silver);solid(ring,.15,dark,mass.height);
  // Model the other elevations too; public street faces receive the detailed
  // treatment below and never a second stack of generic facade windows.
  const area=ring.slice(0,-1).reduce((n,a,i)=>n+a[0]*ring[i+1][1]-ring[i+1][0]*a[1],0),out=area>0?1:-1;
  for(let i=0;i<ring.length-1;i++){
   const a=ring[i],b=ring[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<3)continue;
   const nx=(b[1]-a[1])/len*out,nz=-(b[0]-a[0])/len*out,angle=Math.atan2(nx,nz),f=new T.Group();f.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);f.rotation.y=angle;group.add(f);
   const isMainFront=Math.abs(Math.atan2(Math.sin(angle-frontInfo.angle),Math.cos(angle-frontInfo.angle)))<.1&&mass.id!=='1179058850';if(isMainFront)continue;
   const cols=Math.floor(len/3.1),floors=site.family==='frankies'?3:2;
   for(let j=0;j<cols;j++)for(let k=0;k<floors;k++){const x=(j+.5)*len/cols-len/2,y=2.1+k*3.35;window(f,x,y,1.6,1.65);windowBays++;}
   if(site.family==='frankies'&&nz<-.7){
    // Blue restaurant side, ventilated base, raised terrace, angled shade sails.
    const slats=new Uint8Array(4*64*4);for(let y=0;y<64;y++)for(let x=0;x<4;x++){const i=(y*4+x)*4;slats[i]=slats[i+1]=slats[i+2]=y%4?145:64;slats[i+3]=255;}
    const texture=new T.DataTexture(slats,4,64);texture.needsUpdate=true;const louver=material('#929b9b','metal');louver.map=texture;
    for(let j=0;j<cols;j++)box(louver,len/cols-.15,2.5,.16,(j+.5)*len/cols-len/2,1.4,.12,f);
    box(stone,len,.18,1.4,0,3.35,.6,f);box(glass,len,1,.1,0,4,.95,f);box(frame,len,.05,.1,0,4.5,1,f);
    for(let j=0;j<cols;j++){const x=(j+.5)*len/cols-len/2;box(leaf,2,.28,.4,x,4.6,.8,f);const shade=box(cream,2.5,.08,2,x,6.1,1,f);shade.rotation.x=.22;}
   }
  }
 }
 if(site.family==='frankies'){
  box(silver,w-.12,14.8,.09,0,7.4,.06,front);
  for(const x of [-w/2+.7,w/2-.7])box(blue,1.4,15.1,.22,x,7.55,.15,front);
  for(let y=.7;y<14.8;y+=.9)box(frame,w-2.8,.025,.06,0,y,.13,front);
  for(let x=-w/2+3;x<w/2-1.4;x+=2.1)box(frame,.025,14.7,.06,x,7.35,.13,front);
  for(let floor=0;floor<3;floor++)for(let col=0;col<4;col++){window(front,(col-1.5)*(w-3)/4,5.15+floor*3.25,(w-3)/4-.4,floor?1:1.75,.15);windowBays++;}
  // Bank frontage beneath the hotel, as seen in the dated street reference.
  for(let col=0;col<4;col++){window(front,(col-1.5)*(w-3)/4,1.65,(w-3)/4-.25,2.8,.14);}
  box(yellow,w-2.8,.78,.25,0,3.48,.25,front);
  sign('CalBank',6,.72,0,3.48,.39,front,{color:'#f0f0df',background:'#c8952c'});
  sign('Frankie’s HOTEL',w-3,1.05,0,13.55,.2,front,{color:'#3c5990',background:'#b7b9b4',italic:true});
  box(blue,2.1,.14,1.5,w/2-1.1,2.95,.7,front);sign('Frankie’s',2,.4,w/2-1.1,3.3,.22,front,{italic:true});
  // Setback roof service boxes retain the flat skyline, without new towers.
  box(dark,3,.9,2,-1,15.6,-6,front);
 }else if(site.family==='papaye'){
  // Three glazed tiers and a narrower, slightly taller stair tower to the left.
  plane(glass,w-.1,10.4,0,5.25,.06,front);
  for(let y=.9;y<11;y+=3.6){for(let x=-w/2+.3;x<w/2;x+=1.45){box(red,.085,3.4,.16,x,y+1.1,.16,front);windowBays++;}}
  for(const y of [3.5,7.1,10.85]){box(cream,w+.2,.78,.32,0,y,.22,front);for(let x=-w/2;x<w/2;x+=2.3)box(red,.035,.76,.03,x,y,.4,front);}
  box(cream,w+.5,.18,1,0,6.66,.5,front);
  const sx=-w/2+1.8;box(glass,3.4,11.6,.18,sx,5.8,.28,front);for(let y=1;y<12;y+=1.6)box(frame,3.5,.045,.08,sx,y,.4,front);for(const x of [sx-1.75,sx+1.75])box(cream,.25,12.1,.55,x,6.05,.2,front);box(cream,3.9,.65,.6,sx,12,.3,front);
  sign('Papaye',3.5,.55,sx,11.98,.62,front,{color:'#ba2e2f',background:'#d0c8b5',italic:true});
  sign('PAPAYE · OSU',8,.65,1,3.5,.43,front,{background:'#d0c8b5',color:'#a42b30'});
  box(red,1.8,.12,1.4,1,2.95,.7,front);window(front,1,1.4,1.6,2.6,.2);
  // Parking lines remain on the forecourt, never across Oxford Street.
  for(let x=-w/2+3;x<w/2-1;x+=3)box(yellow,.07,.025,3.5,x,.07,3.6,front);
 }else{
  // Silver horizontal cladding with a tall glass portal, offset south of centre.
  box(silver,w,11.5,.12,0,5.75,.08,front);
  for(let y=.7;y<11.5;y+=.7)box(frame,w,.022,.03,0,y,.15,front);
  for(let x=-w/2+3;x<w/2;x+=3.3)box(frame,.025,11.5,.03,x,5.75,.15,front);
  const cols=8,cw=w/cols;
  for(let col=0;col<cols;col++){const x=(col+.5)*cw-w/2;window(front,x,1.95,cw-.55,3.6,.2);window(front,x,8.5,cw-.6,2.8,.2);windowBays+=2;box(cream,.4,4,.5,x-cw/2,2,.24,front);}
  box(silver,w,.22,1.4,0,4.1,.7,front);
  const tx=-5.5,tw=6.2;
  box(silver,tw,21.6,4,tx,10.8,-1.8,front);plane(glass,tw-1,20.4,tx,10.6,.27,front);
  for(const x of [tx-tw/2+.2,tx+tw/2-.2])box(cream,.4,21.8,.55,x,10.9,.3,front);
  for(let y=1;y<21;y+=1.8)box(frame,tw-.9,.055,.1,tx,y,.34,front);
  for(const x of [tx-1.5,tx,tx+1.5])box(frame,.05,20.4,.1,x,10.6,.35,front);
  // Open rectangular roof crown and louvres, not a solid over-height box.
  for(const x of [tx-tw/2+.2,tx+tw/2-.2])box(cream,.4,1.1,3.8,x,22.1,-1.6,front);
  box(cream,tw,.35,.6,tx,22.4,.2,front);for(const z of [-.8,-2,-3.2])box(frame,tw,.12,.28,tx,22.3,z,front);
  sign('OXFORD STREET',5.4,.55,tx,15,.4,front,{color:'#e2d8ac',background:'#415658'});sign('MALL',2.5,.55,tx,14.2,.4,front,{color:'#e2d8ac',background:'#415658'});
  sign('SHOPRITE',9,1.1,-w/2+5.5,5.2,.21,front,{color:'#a82b30',background:'#b7b9b4'});sign('ELECTROMART',7,.8,tx+5.1,5.2,.21,front,{background:'#a83932'});sign('GOLDEN DRAGON',7,.75,w/2-4.5,6,.21,front,{color:'#beac6f',background:'#b7b9b4'});
  // The open roof balcony at the northern corner.
  for(const x of [w/2-8,w/2-.3])box(cream,.4,3.6,1,x,10.8,-.5,front);box(cream,8,.4,1,w/2-4,12.5,-.5,front);box(glass,7.7,.9,.1,w/2-4,10.1,.2,front);
  box(frame,w-1,.07,.08,0,.86,1.8,front);for(let x=-w/2+1;x<w/2;x+=3)box(frame,.05,.85,.05,x,.44,1.8,front);
 }
 // Shallow, traversable paving and grated drainage. None of this rewrites roads.
 box(paving,w,.035,5.6,0,.028,2.9,front);box(stone,w,.04,.25,0,.043,5.66,front);
 box(dark,w,.015,.4,0,.056,5.38,front);for(let x=-w/2+.12;x<w/2;x+=.23)box(frame,.065,.018,.4,x,.065,5.38,front);
 group.userData.osu={siteId:site.id,family:site.family,sourceIds:site.sourceIds,windowBays,photoDate:'2024-08',heightsEstimated:true,interior:false};
 enhanceMaterials(group);batchStaticMeshes(group);return {group};
}
