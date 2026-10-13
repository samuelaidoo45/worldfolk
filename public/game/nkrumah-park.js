import * as T from './three.module.js';
import {NKRUMAH_PARK,PARK_BOUNDARY,PARK_EXHIBITS,parkLocal} from './nkrumah-park-data.js';
import {batchStaticMeshes} from './render-utils.js';
import {surfaceTexture} from './graphics-materials.js';
// Original geometry from the references listed in docs/realism/nkrumah-park.md.
export function createNkrumahPark(){
 const group=new T.Group();group.name='Kwame Nkrumah Memorial Park';
 const material=(color,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const marble=material('#bfc8c8',.48),paving=material('#aaa9a1'),edge=material('#d3d4cb'),dark=material('#252d2c',.4),bronze=material('#a0783d',.38,.72),water=material('#317a79',.18,.2),grass=material('#547144'),leaf=material('#365b35'),bark=material('#71604a'),wall=material('#dfdfd0'),glass=material('#34565b',.2,.3),paper=material('#e6dac1');
 marble.side=T.DoubleSide;
 // Small repeating mineral mottling; no downloaded photography is redistributed.
 const size=256,pixels=new Uint8Array(size*size*4);
 const hash=(x,y)=>{const v=Math.sin(x*127.1+y*311.7)*43758.5453;return v-Math.floor(v)};
 const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return (hash(ix,iy)*(1-u)+hash(ix+1,iy)*u)*(1-v)+(hash(ix,iy+1)*(1-u)+hash(ix+1,iy+1)*u)*v};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){const n=noise(x/24,y/30)*.55+noise(x/9,y/11)*.3+noise(x/3,y/4)*.15,v=133+n*105,i=(y*size+x)*4;pixels[i]=v;pixels[i+1]=v+5;pixels[i+2]=v+7;pixels[i+3]=255}
 const tex=new T.DataTexture(pixels,size,size);tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(.18,.18);tex.magFilter=T.LinearFilter;tex.minFilter=T.LinearMipmapLinearFilter;tex.generateMipmaps=true;tex.needsUpdate=true;tex.colorSpace=T.SRGBColorSpace;marble.map=tex;marble.bumpMap=tex;marble.bumpScale=.014;paving.bumpMap=surfaceTexture('paving');paving.bumpScale=.025;
 const add=(geo,m,x=0,y=0,z=0,parent=group)=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
 const box=(m,w,h,d,x=0,y=h/2,z=0,parent=group)=>add(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
 const sphere=(m,r,x,y,z,sx=1,sy=1,sz=1,parent=group)=>{const o=add(new T.SphereGeometry(r,12,10),m,x,y,z,parent);o.scale.set(sx,sy,sz);return o};
 const rod=(m,a,b,r=.06,parent=group)=>{const v=new T.Vector3(...b).sub(new T.Vector3(...a)),o=add(new T.CylinderGeometry(r,r,v.length(),8),m,...a,parent);o.position.addScaledVector(v,.5);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v.normalize());return o};
 const sign=(text,w,x,y,z,parent=group)=>{if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e9e3d6';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#263b34';ctx.font='600 48px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,80,980);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;add(new T.PlaneGeometry(w,w/8),new T.MeshStandardMaterial({map:t,roughness:1}),x,y,z,parent)};
 const ground=new T.Shape(PARK_BOUNDARY.map(p=>{const [x,z]=parkLocal(p);return new T.Vector2(x,-z)}));const lawn=add(new T.ShapeGeometry(ground),grass,0,.035,0);lawn.rotation.x=-Math.PI/2;
 // Main axial promenade, parallel walks and cross paths leave real lawns visible.
 const path=(w,d,x,z)=>box(paving,w,.1,d,x,.05,z);
 path(7,47.75,0,51.375);path(7,12.25,0,84.875);path(7,4.5,0,16.25);path(42,9,0,23);
 for(const x of [-23,23]){path(3.5,102.5,x,24);path(3.5,22.25,x,-41.875)}
 for(const z of [-29,77])path(49.5,3.5,0,z);
 path(10,13.25,0,-20.625);path(10,2.25,0,-31.875);
 function pool(x,z,w,d){box(edge,w,.35,d,x,.04,z);box(water,w-.6,.06,d-.6,x,.23,z)}
 for(const side of [-1,1]){pool(side*14.5,0,8,30);pool(side*9,49,11,40)}
 path(20,28,0,0);
 // Four paired curved blades and their high arched windows, with an open core.
 const fin=new T.Shape();fin.moveTo(3,0);fin.lineTo(12,0);fin.bezierCurveTo(7,5,6,13,5,21.6);fin.lineTo(3,21.6);fin.closePath();
 const wingGeo=new T.ExtrudeGeometry(fin,{depth:1.1,steps:1,bevelEnabled:true,bevelSize:.08,bevelThickness:.08,bevelSegments:2,curveSegments:24});wingGeo.translate(0,0,-.55);
 for(let side=0;side<4;side++){
  const facade=new T.Group();group.add(facade);facade.rotation.y=side*Math.PI/2;facade.position.set(Math.sin(side*Math.PI/2)*6,0,Math.cos(side*Math.PI/2)*6);
  for(const s of [-1,1]){const mesh=add(wingGeo,marble,0,0,0,facade);mesh.scale.x=s;box(marble,1.05,22,.9,s*1.25,11,0,facade);box(marble,1.75,.65,1,s*2.8,18.4,0,facade);box(marble,1.75,.65,1,s*2.8,10.3,0,facade);
   // Rounded upper window arch around the open vertical slot.
   const arch=add(new T.TorusGeometry(.92,.22,6,20,Math.PI),marble,s*2.8,17.4,0,facade);arch.rotation.z=0;
   for(let n=0;n<11;n++)box(dark,1.5,.14,.3,s*2.8,3.8+n*.36,.08,facade);
  }
  box(marble,1.5,1.4,1,0,20.3,0,facade);
 }
 const star=new T.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?.36:.86,x=Math.sin(a)*r,y=Math.cos(a)*r;i?star.lineTo(x,y):star.moveTo(x,y)}star.closePath();
 for(const z of [-6.58,6.58])add(new T.ExtrudeGeometry(star,{depth:.08,bevelEnabled:false}),dark,0,20.3,z);
 // Low marble tombs, clear aisles and a roof opening rather than a solid cylinder.
 box(dark,2.4,.18,3.4,0,.13,0);box(marble,1.6,.75,2.5,0,.6,0);box(marble,1.8,.13,2.7,0,1.02,0);
 // Bronze draped figure with raised pointing arm and tailored facial silhouette.
 function figure(x,y,z,scale=1,kneeling=false){const g=new T.Group();group.add(g);g.position.set(x,y,z);g.scale.setScalar(scale);
  if(!kneeling){
   const robe=add(new T.CylinderGeometry(.34,.43,1.65,24),bronze,-.03,1.12,0,g);robe.scale.z=.7;
   sphere(bronze,.35,0,1.85,0,1.05,.8,.6,g);
   for(let i=0;i<9;i++)rod(bronze,[Math.sin(i*.7)*.35,.3,.24],[Math.sin(i*.7)*.28,1.92,.2],.018,g);
   for(let i=0;i<5;i++)rod(bronze,[-.31,1.96-i*.04,.2],[.28,1.63-i*.08,.23],.019,g);
   rod(bronze,[0,2.04,0],[0,2.27,0],.11,g);
   rod(bronze,[-.19,.38,0],[-.19,.12,.02],.12,g);rod(bronze,[.19,.4,0],[.19,.12,.02],.12,g);
  }
  else {box(bronze,.7,.3,.65,0,.23,0,g);sphere(bronze,.3,0,.85,0,.85,1.7,.6,g);}
  const shoulder=kneeling?1.2:2.05,head=shoulder+.45;sphere(bronze,.235,0,head,0,.8,1.15,.84,g);sphere(bronze,.075,0,head-.01,.195,.64,.8,1.25,g);for(const s of [-1,1]){sphere(bronze,.055,s*.185,head-.02,0,.6,1.1,.7,g);rod(bronze,[s*.025,head+.055,.19],[s*.12,head+.05,.17],.018,g);}rod(bronze,[-.064,head-.1,.175],[.064,head-.1,.175],.013,g);
  rod(bronze,[-.26,shoulder,0],[-.39,shoulder-.36,.08],.11,g);rod(bronze,[-.39,shoulder-.36,.08],[-.3,shoulder-.66,.19],.085,g);sphere(bronze,.105,-.3,shoulder-.68,.19,.7,1.2,.7,g);
  const end=kneeling?[.08,1.5,.7]:[.55,2.75,.55];const elbow=kneeling?[.25,1.3,.4]:[.53,2.35,.16];rod(bronze,[.27,shoulder,0],elbow,.11,g);rod(bronze,elbow,end,.082,g);sphere(bronze,.12,...end,1,1,1,g);
  if(kneeling)rod(bronze,[0,head,.2],[0,head+.2,1.0],.08,g);else rod(bronze,end,[.57,2.93,.65],.036,g);
  for(const s of [-1,1])sphere(bronze,.18,s*.2,.15,.15,1,.6,1.6,g);
 }
 box(dark,3.4,.3,3.4,0,.15,23);box(dark,2.4,2.25,2.4,0,1.4,23);box(dark,2.75,.2,2.75,0,2.6,23);figure(0,2.7,23,1.24);sign('KWAME NKRUMAH',2.2,0,1.5,24.22);
 const jets=[];
 for(const side of [-1,1])for(let i=0;i<5;i++){const x=side*9,z=34+i*7;box(edge,1.15,.6,1.15,x,.55,z);figure(x,.85,z,.66,true);
  const curve=new T.QuadraticBezierCurve3(new T.Vector3(x,1.95,z+.66),new T.Vector3(x-side*3,4,z+1),new T.Vector3(x-side*3,.3,z+3));const jet=add(new T.TubeGeometry(curve,20,.032,5,false),water);jet.userData.dynamic=true;jets.push(jet);
 }
 // Low museum mass with a planted roof and open entrance. Gallery furnishings
 // interpret documented collection categories; they are not copied artefacts.
 path(20,20,0,-43);for(const x of [-10,10])box(wall,.35,3.6,20,x,1.8,-43);box(wall,20,3.6,.35,0,1.8,-53);
 for(const x of [-6.1,6.1])box(wall,7.8,3.6,.35,x,1.8,-33);
 box(wall,4.4,.65,.35,0,3.275,-33);sign('MEMORIAL MUSEUM',8,0,2.85,-32.78);
 const roof=new T.Group();roof.name='Museum roof';group.add(roof);box(wall,21,.28,21,0,3.68,-43,roof);box(grass,18,.12,18,0,3.88,-43,roof);roof.traverse(o=>{if(o.isMesh)o.userData.dynamic=true});
 for(const [index,p] of PARK_EXHIBITS.entries()){
  box(dark,3,.8,.65,p.x,.4,p.z-2.5);box(glass,2.8,.18,.6,p.x,.92,p.z-2.5);
  if(index===0){for(let i=0;i<4;i++){box(bark,.43,.09,.34,p.x-.8+i*.5,1.06,p.z-2.5);box(paper,.38,.07,.3,p.x-.8+i*.5,1.12,p.z-2.5)}}
  if(index===1){box(bark,1.1,.72,.34,p.x,1.35,p.z-2.5);for(const dx of [-.35,.35])box(bronze,.06,.72,.36,p.x+dx,1.35,p.z-2.5);rod(bronze,[p.x-.15,1.75,p.z-2.5],[p.x+.15,1.75,p.z-2.5],.04)}
  if(index===2){box(marble,.8,.25,.48,p.x,1.15,p.z-2.5);box(dark,.9,.08,.55,p.x,1.015,p.z-2.5)}
  sign(index===0?'1957 · INDEPENDENCE':index===1?'LIFE & AFRICAN UNITY':'THE MEMORIAL',3,p.x,2.15,p.z-2.8);
 }
 // A clearly labelled timeline and draped-garment display give the gallery
 // its own subject. These original props illustrate documented categories.
 for(const [i,label] of ['1909 · NKROFUL','1957 · INDEPENDENCE','1960 · REPUBLIC'].entries()){
  box(dark,4.2,2.5,.12,-6+i*6,1.7,-52.7);sign(label,3.9,-6+i*6,2.55,-52.62);
  box(paper,3.2,.025,.13,-6+i*6,1.5,-52.6);box(paper,2.6,.025,.13,-6+i*6,1.1,-52.6);
 }
 const cloth=material('#ac723e');box(dark,2,.22,2,-7,.11,-48);rod(dark,[-7,.2,-48],[-7,2,-48],.045);rod(dark,[-7.55,1.85,-48],[-6.45,1.85,-48],.04);
 const garment=add(new T.CylinderGeometry(.45,.6,1.5,18,1,true),cloth,-7,1,-48);garment.scale.z=.3;for(let i=0;i<7;i++)box(bronze,.035,1.35,.018,-7.45+i*.15,1,-47.8);
 sign('INTERPRETIVE GALLERY',5,0,2.4,-35.5);
 // Canopy trees and benches are placed beside the axial paths, not in them.
 for(const side of [-1,1])for(let i=0;i<7;i++){const x=side*(31+i%2*3),z=-20+i*16;rod(bark,[x,0,z],[x,5,z],.23);sphere(leaf,3.6,x,6.5,z,1.3,.8,1.1);sphere(leaf,2.7,x+2,6,z-1,1,.8,1);}
 for(const z of [25,62])for(const x of [-25,25]){box(bark,.65,.12,2.4,x,.49,z);box(bark,.12,.62,2.4,x+Math.sign(x)*.36,.79,z);for(const dz of [-.8,.8])box(dark,.45,.43,.1,x,.215,z+dz)}
 batchStaticMeshes(group);group.rotation.y=NKRUMAH_PARK.rotation*Math.PI/180;
 group.userData.park={marbleFins:8,statue:true,fountainFigures:10,gardens:true,walkInMuseum:true,estimatedDimensions:true};
 return {group,update(seconds,position){const [x,z]=parkLocal(position);roof.visible=!(Math.abs(x)<10&&z< -31&&z> -54);for(let i=0;i<jets.length;i++)jets[i].scale.y=.97+Math.sin(seconds*2+i*.5)*.03}};
}
