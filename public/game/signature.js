import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface} from './graphics-materials.js';
import {SIGNATURE_TOWERS,SIGNATURE_BOUNDARY,signatureLocal,COURT} from './signature-data.js';

// Original geometry reconstructed from the official courtyard and twin-tower
// photographs. No third-party photography is distributed as a game texture.
export function createSignature(){
 const group=new T.Group();group.name='The Signature · stepped twin towers';
 const material=(color,kind,roughness=.75,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),kind);
 const white=material('#eeeae0','plaster'),bronze=material('#9b613e','metal',.45,.45),dark=material('#323d3f','metal',.38,.6),glass=material('#61838b','glass',.19,.48),paving=material('#a5a49b','paving'),stone=material('#807c70','stone'),green=material('#4c7140','foliage'),wood=material('#76553c','wood');
 const water=material('#34878e','glass',.17,.3);water.emissive.set('#123435');water.emissiveIntensity=.15;
 const glow=material('#efd6a0','smooth');glow.emissive.set('#ffcc7b');glow.emissiveIntensity=.2;
 const mesh=(geo,m,x=0,y=0,z=0,parent=group)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
 const box=(m,w,h,d,x,y,z,p=group)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,p);
 const beam=(a,b,r,m,p)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),v=bv.clone().sub(av),o=mesh(new T.CylinderGeometry(r,r,v.length(),5),m,...av.clone().add(bv).multiplyScalar(.5).toArray(),p);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o};
 const floorSpecs=[];
 for(const [index,t] of SIGNATURE_TOWERS.entries()){
  const tower=new T.Group();tower.position.set(t.centre[0],0,t.centre[1]);tower.rotation.y=t.rotation;group.add(tower);
  for(let f=0;f<t.levels;f++){
   const h=f===0?4.4:3.2,y=f===0?0:4.4+(f-1)*3.2;
   const setback=Math.max(0,f-1)*(t.length-15)/(t.levels-2),length=t.length-setback,cx=setback/2;
   floorSpecs.push({tower:index,level:f,start:cx-length/2,end:cx+length/2,height:y+h});
   // Deep open balconies: the glass facade sits behind the slab and rail.
   box(white,length,h-.24,t.width-3.2,cx,y+h/2,0,tower);
   box(white,length,.22,t.width,cx,y+h-.11,0,tower);
   for(const side of [-1,1]){
    const face=side*(t.width/2-1.57),edge=side*(t.width/2-.12);
    const bays=Math.max(1,Math.floor((length-2)/4.5)),bay=(length-2)/bays;
    for(let j=0;j<bays;j++){
     const x=cx-length/2+1+bay*(j+.5);
     box(glass,bay-1.1,h-1.05,.08,x,y+h/2,face,tower);
     box(dark,.045,h-1.05,.11,x,y+h/2,face+side*.07,tower);
     box(white,.46,h-.2,.8,x-bay/2+.2,y+h/2,face+side*.38,tower);
     // Vertical louvred privacy panels break up the long horizontal bands.
     if(j%2===0&&f>0){box(bronze,.68,h-.35,.18,x+bay/2-.55,y+h/2,face+side*.2,tower);for(let k=0;k<7;k++)box(dark,.6,.028,.2,x+bay/2-.55,y+.38+k*.36,face+side*.31,tower);}
    }
    if(f>0){
     box(bronze,length,.38,.18,cx,y+.19,edge,tower);
     box(glass,length-.3,.63,.055,cx,y+.72,edge,tower);
     box(dark,length,.04,.065,cx,y+1.08,edge,tower);
     for(let x=cx-length/2+.2;x<cx+length/2;x+=3.5)box(dark,.035,1,.06,x,y+.57,edge,tower);
    }
   }
   // Low end windows and balustrades on the successive roof terraces.
   for(const end of [-1,1]){const x=cx+end*(length/2+.035);for(let z=-t.width/2+3;z<t.width/2-2;z+=3)box(glass,.09,h-1.25,1.55,x,y+h/2,z,tower);}
   if(f>1){const x=cx-length/2;box(dark,.06,1.05,t.width-1.2,x,y+.54,0,tower);}
  }
  // White diagonal roof spine is the recognizable cut through each tower.
  const low=[-t.length/2,7.6,-t.width/2+.9],high=[t.length/2-15,46,-t.width/2+.9];
  const v=new T.Vector3(high[0]-low[0],high[1]-low[1],0),spine=box(white,v.length(),.5,2.1,(low[0]+high[0])/2,(low[1]+high[1])/2,low[2],tower);spine.rotation.z=Math.atan2(v.y,v.x);
  box(white,9,3,t.width-4,t.length/2-6,47.5,0,tower);
  for(const side of [-1,1])box(glass,6,1.55,.08,t.length/2-6,47.25,side*(t.width/2-1.95),tower);
  for(let j=0;j<6;j++)box(dark,.06,.95,.06,t.length/2-10+j*1.6,49.45,-t.width/2+2,tower);
 }
 // Paving follows the residential parcel, rather than covering nearby roads.
 const outline=SIGNATURE_BOUNDARY.map(signatureLocal),shape=new T.Shape(outline.map(([x,z])=>new T.Vector2(x,-z)));
 const ground=mesh(new T.ShapeGeometry(shape),paving,0,.035,0);ground.rotation.x=-Math.PI/2;
 const pool=new T.Group();pool.position.set(...[COURT.centre[0],0,COURT.centre[1]]);pool.rotation.y=COURT.rotation;group.add(pool);
 box(stone,4.8,.18,18.4,0,.09,0,pool);box(water,4.4,.04,18,0,.195,0,pool);
 for(const side of [-1,1]){box(white,.16,.08,18.4,side*2.32,.21,0,pool);box(white,4.8,.08,.16,0,.21,side*9.12,pool);}
 for(const z of [-6,6])for(const dx of [-.22,.22]){beam([1.7+dx,.21,z],[1.7+dx,.9,z],.035,dark,pool);beam([1.7+dx,.9,z],[2.35+dx,.21,z],.035,dark,pool);}
 const [bx,bz]=COURT.bench;
 // Bench faces the pool, and uses the same seat anchor as the persistent pose.
 box(wood,.65,.12,2.2,bx,.46,bz);box(wood,.12,.55,2.2,bx-.3,.8,bz);
 for(const z of [-.8,.8])box(dark,.45,.4,.1,bx,.2,bz+z);
 for(const [x,z] of [[-18,22],[-15,17],[-7,14],[-25,35]]){box(stone,1.2,.48,1.2,x,.24,z);mesh(new T.SphereGeometry(.6,8,6),green,x,.8,z);}
 for(const [x,z] of [[-30,32],[-19,22],[-8,12]]){box(dark,.1,.9,.1,x,.45,z);box(glow,.16,.13,.16,x,.9,z);}
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#263d3d';c.fillRect(0,0,1024,256);c.fillStyle='#ecdbbb';c.textAlign='center';c.font='32px sans-serif';c.fillText('THE',512,73);c.font='72px serif';c.fillText('SIGNATURE',512,158);c.font='23px sans-serif';c.fillText('APARTMENTS',512,209);
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const m=new T.MeshStandardMaterial({map:tex,roughness:.6,side:T.DoubleSide});const sign=mesh(new T.PlaneGeometry(5,1.25),m,-36,1.75,25.16);box(stone,5.2,2.4,.3,-36,1.2,25);
 }
 group.userData.signature={floorSpecs,towers:2,footprints:SIGNATURE_TOWERS.map(t=>t.sourceId),reference:'official-courtyard-and-twin-tower-photos',dimensions:'estimated',privateApartments:false};
 batchStaticMeshes(group);
 return {group,update(t){water.emissiveIntensity=.12+Math.sin(t*.7)*.025;}};
}
