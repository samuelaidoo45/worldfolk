import * as T from './three.module.js';
import {GHUD_PARK,GHUD_TRAIL,GHUD_KIOSKS,GHUD_TABLES,GHUD_BENCHES,GHUD_TREES,ghudStructures} from './ghud-park-data.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface} from './graphics-materials.js';
export function createGhudPark(){
 const group=new T.Group();group.name=GHUD_PARK.name;const frame=new T.Group();frame.rotation.y=GHUD_PARK.rotation*Math.PI/180;group.add(frame);
 const mat=(color,kind='stone',extra={})=>tagSurface(new T.MeshStandardMaterial({color,roughness:.86,...extra}),kind);
 const pave=mat('#99998f','paving'),stripe=mat('#656b65','paving'),gravel=mat('#918e7d','soil'),edge=mat('#b2b1a3'),steel=mat('#3c4945','metal',{metalness:.6,roughness:.5}),white=mat('#dcded5','metal'),wood=mat('#967b55','wood'),sand=mat('#b2a58a','soil'),court=mat('#747a75'),red=mat('#a84e4a','paint'),blue=mat('#397eaa','paint'),yellow=mat('#d4ad42','paint'),green=mat('#3d714d','paint'),pink=mat('#b7838e','paint'),navy=mat('#344c66','fabric');
 const clearPanel=mat('#cadbd9','glass',{transparent:true,opacity:.16,depthWrite:false,roughness:.3}),castle=mat('#b7ac8c','paint');
 const containerMats=[red,blue,yellow,pink],leaf=mat('#526e38','foliage'),trunk=mat('#685747','wood'),dark=mat('#223735');
 const glow=new T.MeshStandardMaterial({color:'#f1d5a0',emissive:'#efc87d',emissiveIntensity:.7});
 const mesh=(geo,m,x,y,z)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.receiveShadow=true;o.castShadow=y>.15;frame.add(o);return o;};
 const box=(m,w,h,d,x,y,z)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z);
 const rod=(a,b,r,m=steel)=>{const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start);const o=mesh(new T.CylinderGeometry(r,r,delta.length(),6),m,...start.add(end).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;};
 const disk=(m,r,x,y,z)=>{const o=mesh(new T.CircleGeometry(r,24),m,x,y,z);o.rotation.x=-Math.PI/2;return o;};
 function panel(text,w,h,x,y,z,bg='#264b40',facing=0){
  if(typeof document==='undefined')return;const canvas=document.createElement('canvas');canvas.width=768;canvas.height=192;const c=canvas.getContext('2d');if(!c)return;c.fillStyle=bg;c.fillRect(0,0,768,192);c.fillStyle='#f0e6c9';c.font='bold 66px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(text,384,100,730);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,roughness:.8,side:T.DoubleSide}),x,y,z).rotation.y=facing;
 }
 // Small shared vertex-colour patches give the lawn worn, dry and greener areas.
 const lawn=new T.PlaneGeometry(60,80,30,40);lawn.rotateX(-Math.PI/2);const colors=[],p=lawn.attributes.position;const palette=['#697a45','#76834c','#7c8550','#887f52','#6b7847'].map(c=>new T.Color(c));
 for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),patch=Math.sin(x*.26+Math.cos(z*.13))*Math.sin(z*.16);const c=palette[Math.min(4,Math.floor((patch+1)*2.49))];colors.push(c.r,c.g,c.b);}lawn.setAttribute('color',new T.Float32BufferAttribute(colors,3));
 box(gravel,82,.02,146,0,.005,0);mesh(lawn,mat('#ffffff','foliage',{vertexColors:true}),0,.035,-24);
 // An open lawn ring and the south recreation plaza, with no event tents fixed to it.
 for(let i=1;i<GHUD_TRAIL.length;i++){const a=GHUD_TRAIL[i-1],b=GHUD_TRAIL[i],dx=b[0]-a[0],dz=b[1]-a[1],o=box(pave,3.4,.035,Math.hypot(dx,dz)+.08,(a[0]+b[0])/2,.04,(a[1]+b[1])/2);o.rotation.y=Math.atan2(dx,dz);}
 box(pave,76,.035,49,0,.04,46);box(pave,7,.035,12,-38,.04,47);
 for(let x=-36;x<=36;x+=1.4)box(edge,.018,.002,48,x,.06,46);
 for(let z=23;z<70;z+=1.4)box(edge,75,.002,.018,0,.06,z);
 for(const x of [-30,-18,-6,6,18,30])box(stripe,.65,.004,49,x,.061,46);
 // Tall lights and removable strings appear in the photographed plaza. No extra
 // realtime point lights or scene-wide shadow maps are allocated for this site.
 for(const s of ghudStructures().filter(s=>s.id.startsWith('light-'))){box(steel,.1,6,.1,s.x,3,s.z);const o=box(steel,.7,.08,.4,s.x,6,s.z);o.rotation.z=.12;box(glow,.55,.025,.3,s.x,5.95,s.z);}
 for(const z of [41,60]){
  for(const x of [-35,35])box(steel,.06,5,.06,x,2.5,z);
  for(let x=-35;x<35;x+=2.5){const y=5-.65*(1-(x/35)**2),ny=5-.65*(1-((x+2.5)/35)**2);rod([x,y,z],[x+2.5,ny,z],.014);mesh(new T.SphereGeometry(.045,6,4),glow,x,y-.12,z);}
 }
 // Container-lined Beer Garden / games desk: original signs, not a copied ad.
 for(const [i,k] of GHUD_KIOSKS.entries()){
  const m=containerMats[k.color];box(m,k.w,2.8,k.d,k.x,1.4,k.z);box(steel,k.w+.15,.12,k.d+.15,k.x,2.84,k.z);
  for(let x=k.x-k.w/2+.12;x<k.x+k.w/2;x+=.21)box(m,.035,2.6,.045,x,1.4,k.z-k.d/2-.03);
  box(dark,k.w-1.1,1,.07,k.x,1.7,k.z-k.d/2-.08);box(wood,k.w-.7,.09,.65,k.x,1.13,k.z-k.d/2-.29);
  box(m,k.w+.5,.06,1.4,k.x,2.6,k.z-k.d/2-.5);panel(k.label,k.w-.8,.5,k.x,2.43,k.z-k.d/2-.81,'#354d49',Math.PI);
  // Closed side doors and industrial corner castings keep the containers legible.
  for(const dx of [-k.w/2+.1,k.w/2-.1])for(const y of [.13,2.65])box(steel,.13,.2,.12,k.x+dx,y,k.z-k.d/2-.05);
 }
 // Long bench-and-table frames, folded blue umbrellas and colourful cafe seats.
 for(const [i,[x,z]] of GHUD_TABLES.entries()){
  box(wood,1.35,.07,2.4,x,.77,z);for(const side of [-1,1]){box(wood,.36,.065,2.4,x+side*1.05,.47,z);for(const dz of [-.85,.85])rod([x+side*1.15,.05,z+dz],[x+side*.42,.74,z+dz],.025);}
  for(const dz of [-.85,.85])rod([x-1.2,.08,z+dz],[x+1.2,.08,z+dz],.025);
  if(i<5){rod([x,0,z],[x,2.7,z],.025);mesh(new T.ConeGeometry(.25,1.5,10),navy,x,2.05,z);}
 }
 for(let i=0;i<6;i++){const x=-30+i*10,z=40,m=i%2?blue:red;disk(m,.55,x,.73,z);rod([x,0,z],[x,.73,z],.025,m);for(const dz of [-1.1,1.1]){const seat=box(m,.42,.04,.42,x,.46,z+dz);box(m,.42,.3,.035,x,.7,z+dz+Math.sign(dz)*.2);for(const dx of [-.17,.17])rod([x+dx,0,z+dz-.2],[x-dx,.46,z+dz+.2],.016,m);}}
 for(const b of GHUD_BENCHES){for(let dx=-.24;dx<=.24;dx+=.12)box(wood,.09,.055,2.6,b.x+dx,.47,b.z);box(wood,.07,.31,2.6,b.x+(b.x<0?-.29:.29),.73,b.z);for(const dz of [-.9,.9])box(steel,.5,.44,.07,b.x,.22,b.z+dz);}
 // Multi-use rink, with an actual open gate on the west side.
 box(court,26,.025,18,-14,.075,30);
 for(const s of ghudStructures().filter(s=>s.id.startsWith('rink-'))){box(clearPanel,s.w,1.05,s.d,s.x,.6,s.z);for(const y of [.12,1.15])box(white,s.w,.06,s.d,s.x,y,s.z);}
 for(let x=-27;x<=-1;x+=2)for(const z of [21,39]){box(white,.05,1.1,.05,x,.6,z);}
 for(const x of [-26,-2]){box(white,.08,.006,16,x,.095,30);}
 for(const z of [22,38])box(white,24,.006,.08,-14,.095,z);
 const circle=mesh(new T.RingGeometry(2.9,2.96,48),white,-14,.097,30);circle.rotation.x=-Math.PI/2;
 // Playground follows the owner photo: yellow/blue conical towers, tube slide,
 // green bridge rails, blue open slide, swing and red seesaw on a sand bed.
 box(sand,27,.025,17,20,.077,29);
 for(const [x,h] of [[16,2],[22,3.2]]){
  for(const dx of [-1,1])for(const dz of [-1,1])box(green,.09,h+1,.09,x+dx,(h+1)/2,29+dz);
  box(yellow,2.5,.12,2.5,x,h,29);mesh(new T.ConeGeometry(1.75,1.8,12),blue,x,h+2.1,29);mesh(new T.TorusGeometry(.55,.085,8,24),yellow,x,h+.75,27.67);
  const wall=new T.Shape();wall.moveTo(-1,-.55);wall.lineTo(1,-.55);wall.lineTo(1,.55);wall.lineTo(-1,.55);wall.closePath();const hole=new T.Path();hole.absarc(0,0,.46,0,Math.PI*2,true);wall.holes.push(hole);mesh(new T.ShapeGeometry(wall),castle,x,h+.75,27.72).material.side=T.DoubleSide;
  mesh(new T.CylinderGeometry(1.52,1.52,.18,12),yellow,x,h+1.3,29);
  for(const side of [-1,1])for(let dz=-.8;dz<1;dz+=.4)box(castle,.24,.28,.24,x+side*1.12,h+1.08,29+dz);
  for(let dz=-1;dz<=1;dz+=.35)box(green,.05,1,.05,x-1,h+.5,29+dz);
 }
 box(yellow,4,.09,1.5,19,2.1,29);for(const z of [28.2,29.8]){rod([17,3,z],[21,3.9,z],.05,green);for(let x=17;x<=21;x+=.4)box(green,.045,1.05,.045,x,2.6+(x-17)*.225,z);}
 // Tubular serpentine slide; collision is the enclosing play-equipment footprint.
 const slideCurve=new T.CatmullRomCurve3([new T.Vector3(23,3.3,29),new T.Vector3(25,3.1,28.2),new T.Vector3(26.2,2.4,29),new T.Vector3(25.8,1.6,30.2),new T.Vector3(27.2,.4,29.6)]);
 mesh(new T.TubeGeometry(slideCurve,36,.48,10,false),yellow,0,0,0);
 for(const u of [.18,.42,.66]){const q=slideCurve.getPoint(u),o=mesh(new T.TorusGeometry(.49,.045,6,14),blue,...q.toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),slideCurve.getTangent(u));}
 const openSlide=box(blue,1,.12,3.7,16,1,25.9);openSlide.rotation.x=-.53;
 for(const side of [-1,1])rod([16+side*.5,2.2,27.6],[16+side*.5,.25,24.3],.07,blue);
 for(const dx of [-1.5,1.5]){rod([10+dx,0,26],[10+dx*.7,2.5,27],.065,yellow);rod([10+dx,0,28],[10+dx*.7,2.5,27],.065,yellow);}rod([8.9,2.5,27],[11.1,2.5,27],.07,yellow);
 for(const dx of [-.45,.45])rod([10+dx,2.5,27],[10+dx,.5,27],.014,steel);box(blue,1.1,.08,.45,10,.5,27);
 box(red,3.5,.14,.32,16,.65,35);rod([16,0,35],[16,.7,35],.08,red);for(const side of [-1,1]){mesh(new T.TorusGeometry(.23,.04,6,14),yellow,16+side*1.3,.9,35);box(yellow,.45,.06,.45,16+side*1.4,.73,35);}
 // A low perimeter protects the park while leaving a wide west-side entrance.
 for(const s of ghudStructures().filter(s=>s.id.startsWith('fence-'))){box(steel,s.w,.08,s.d,s.x,1.2,s.z);box(steel,s.w,.08,s.d,s.x,.35,s.z);const length=Math.max(s.w,s.d),alongX=s.w>s.d;for(let p=-length/2;p<=length/2;p+=2)box(steel,.045,1.3,.045,s.x+(alongX?p:0),.65,s.z+(alongX?0:p));}
 for(const [i,[x,z]] of GHUD_TREES.entries()){box(trunk,.35,4,.35,x,2,z);for(let j=0;j<3;j++){const canopy=mesh(new T.SphereGeometry(1.65,10,7),leaf,x+Math.sin(j*2.1)*.65,4.4+j*.35,z+Math.cos(j*2.1)*.65);canopy.scale.y=.8;}}
 for(const z of [-52,-28,-4])for(const x of [-38,38])box(leaf,.7,.65,16,x,.35,z);
 panel('GHUD PARK',5.5,.9,-35,2.2,41,'#345849');panel('LAWN · RINK · PLAY · MEET',7,.5,-27,1.9,62.6,'#264b40',Math.PI);
 for(const [x,z] of [[-30,42],[28,62]])for(const [j,m] of [green,dark].entries()){box(m,.5,.85,.5,x+j*.7,.425,z);box(steel,.52,.05,.52,x+j*.7,.88,z);}
 batchStaticMeshes(group);
 group.userData.ghud={estimatedLayout:true,ownerPhotoMonth:'2025-02',eventPublication:'2026-08-23',temporaryTents:false};
 return {group};
}
