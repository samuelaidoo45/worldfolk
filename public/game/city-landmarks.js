import {SQUARE_STANDS} from './square-stands.js';
import * as THREE from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {surfaceTexture,contactShadow} from './graphics-materials.js';
import {offsetMetres,distanceMetres} from './motion.js';
// OSM positions/way IDs from the bundled Accra extract. Models are authored from
// photo references (docs/landmark-references.md), not inferred from POI category.
export const CITY_LANDMARKS=[...SQUARE_STANDS,
 {id:'independence-parade-ground',name:'Independence Square parade ground',position:[-.19256,5.54742],rotation:-11,width:210,depth:160,height:0},
 {id:'black-star-gate',name:'Black Star Gate',sourceId:339732252,position:[-.1928568532,5.54899685],rotation:101,width:25,depth:9,height:27},
 {id:'independence-arch',name:'Independence Arch',sourceId:339732244,position:[-.1924081,5.54647445],rotation:-11,width:50,depth:17,height:30},
];
export const isCityLandmark=id=>CITY_LANDMARKS.some(l=>l.sourceId!==undefined&&String(l.sourceId)===String(id));
export function landmarkColliders(origin){
 const out=[];
 for(const l of CITY_LANDMARKS){if(distanceMetres(origin,l.position)>200)continue;
  if(l.id.startsWith('square-stand')||l.id==='independence-parade-ground')continue;
  const boxes=l.id==='black-star-gate'?[[-9,0,5.5,8],[9,0,5.5,8],[-4,0,.8,8],[4,0,.8,8]]:[[-19,0,7,14],[19,0,7,14]];
  const a=l.rotation*Math.PI/180;
  for(const [x,z,w,d] of boxes){const ring=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>offsetMetres(l.position,(x+dx)*Math.cos(a)+(z+dz)*Math.sin(a),(x+dx)*Math.sin(a)-(z+dz)*Math.cos(a)));out.push({id:l.id+':'+x,rings:[ring],height:l.height})}
 }return out;
}
export function createCityLandmark(data){
 const group=new THREE.Group();group.name=data.name;
 const mat=(color,roughness=.83)=>new THREE.MeshStandardMaterial({color,roughness});
 const stone=mat('#e6ddc8'),trim=mat('#f0e9d8'),dark=mat('#171c20'),water=mat('#548f8f',.22),grass=mat('#65764b');
 stone.bumpMap=surfaceTexture('stone');stone.bumpScale=.025;
 const add=(geo,m,x,y,z)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;group.add(o);return o};
 const box=(m,w,h,d,x,y,z)=>add(new THREE.BoxGeometry(w,h,d),m,x,y,z);
 function sign(text,w,y,z,back=false){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=2048;c.height=256;const ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);ctx.fillStyle='#343831';ctx.font='500 108px serif';ctx.textAlign='center';ctx.fillText(text,1024,168,2000);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const o=add(new THREE.PlaneGeometry(w,w/8),new THREE.MeshStandardMaterial({map:tex,transparent:true,depthWrite:false,roughness:1}),0,y,z);if(back)o.rotation.y=Math.PI}
 if(data.id==='independence-parade-ground'){
  const paving=mat('#a8aaa2');paving.map=surfaceTexture('paving').clone();paving.map.userData={};paving.map.repeat.set(data.width/4,data.depth/4);paving.bumpMap=paving.map;paving.bumpScale=.018;const floor=add(new THREE.PlaneGeometry(data.width,data.depth),paving,0,.018,0);floor.rotation.x=-Math.PI/2;floor.castShadow=false;
 }else if(data.id.startsWith('square-stand')){
  const w=data.width,d=data.depth;box(stone,w,.3,d,0,.15,0);
  for(let row=0;row<9;row++){const z=d/2-2-row*(d-3)/9,y=.4+row*.5;box(stone,w,.5,(d-3)/9,0,y,z);const color=mat(['#527747','#d9b849','#a84234'][Math.floor(row/3)]);box(color,w-.5,.12,.55,0,y+.3,z);}
  box(trim,w+2,.45,d+1,0,8,0);
  for(let x=-w/2+1;x<w/2;x+=5){box(stone,.45,8,.5,x,4,-d/2);const column=box(trim,.4,8.3,.4,x,4,d/2-.5);column.rotation.x=.1;}
 }else if(data.id==='black-star-gate'){
  for(const x of [-9,9]){box(stone,5.5,15,8,x,7.7,0);box(trim,6.2,.4,8.5,x,.4,0);box(trim,6,.25,8.3,x,14.8,0)}
  for(const x of [-4,4])box(stone,.8,13,7.8,x,6.7,0);
  box(stone,25,3.6,9,0,16.2,0);box(trim,26,.5,10,0,14.35,0);box(trim,25.8,.5,9.8,0,18.2,0);
  for(const x of [-12,12])box(trim,.3,1.2,9,x,19,0);for(const z of [-4.2,4.2])box(trim,24,1.2,.3,0,19,z);
  box(stone,6.3,3.4,5,0,20.4,0);box(trim,7,.3,5.7,0,18.9,0);
  const star=new THREE.Shape();for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?1.55:3.6,x=Math.sin(a)*r,y=Math.cos(a)*r;i?star.lineTo(x,y):star.moveTo(x,y)}star.closePath();
  add(new THREE.ExtrudeGeometry(star,{depth:.75,bevelEnabled:true,bevelSize:.08,bevelThickness:.08,bevelSegments:1,steps:1}),dark,0,24,-.375);
  for(const back of [false,true]){const s=back?-1:1;sign('F R E E D O M   A N D   J U S T I C E',23,15.35,s*4.52,back);sign('A D   1 9 5 7',12,17.35,s*4.52,back)}
  // Paired fountains and a paved approach within the landscaped roundabout.
  for(const x of [-22,22]){add(new THREE.CylinderGeometry(5.5,5.7,.45,40),stone,x,.25,0);add(new THREE.CylinderGeometry(4.8,4.8,.03,40),water,x,.5,0);add(new THREE.CylinderGeometry(.75,1,2.3,16),stone,x,1.5,0);add(new THREE.CylinderGeometry(1.8,1.25,.3,24),trim,x,2.7,0)}
  box(grass,58,.025,27,0,.012,0);box(mat('#999c94'),8,.04,40,0,.04,0);
 }else{
  // The seaward Independence Arch is a broad curved A-frame, NOT the star gate.
  const shape=new THREE.Shape();shape.moveTo(-24,0);shape.quadraticCurveTo(-8,31,0,30);shape.quadraticCurveTo(8,31,24,0);shape.lineTo(19,0);shape.quadraticCurveTo(6,26,0,26);shape.quadraticCurveTo(-6,26,-19,0);shape.closePath();
  add(new THREE.ExtrudeGeometry(shape,{depth:8,bevelEnabled:false,steps:1}),stone,0,0,-4);
  for(const x of [-19,19])box(trim,8,.4,17,x,.2,0);
  box(stone,47,2.4,16,0,16,0);box(trim,49,.5,17,0,17.4,0);box(stone,35,1.5,14,0,8,0);
  for(const x of [-12,-6,0,6,12])box(stone,.7,6.6,.7,x,11.4,-5);
  sign('F R E E D O M   A N D   J U S T I C E',37,16,8.02);
  sign('A D   1 9 6 1',14,9,7.03);
 }
 // Contact shading stays attached to the monument at every zoom / tile boundary.
 const shadow=add(new THREE.PlaneGeometry(data.width*1.65,data.depth*2.2),new THREE.MeshBasicMaterial({map:contactShadow(),color:'#17201b',transparent:true,opacity:.5,depthWrite:false}),3,.07,4);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;shadow.visible=data.id!=='independence-parade-ground';
 batchStaticMeshes(group);group.rotation.y=data.rotation*Math.PI/180;return {group};
}
