import * as T from './three.module.js';import {LANCASTER_AREAS,LANCASTER_POOL,lancasterLocal} from './lancaster-data.js';import {tagSurface,enhanceMaterials} from './graphics-materials.js';import {batchStaticMeshes} from './render-utils.js';
export function buildLancasterInterior(area='lobby'){
 const layout=LANCASTER_AREAS[area]||LANCASTER_AREAS.lobby,group=new T.Group(),blockers=[];group.name=layout.name;
 const mat=(c,k='plaster',r=.8,m=0)=>tagSurface(new T.MeshStandardMaterial({color:c,roughness:r,metalness:m}),k),cream=mat('#e5ddcb'),wood=mat('#ae8b59','wood'),dark=mat('#443b32','wood'),tile=mat('#bfb8a7','tile',.5),gold=mat('#b19a69','metal',.4,.5),aqua=mat('#60a9ad','fabric'),navy=mat('#3f4e60','fabric'),ivory=mat('#d4cbbb','fabric'),stone=mat('#bcae8c','stone'),leaf=mat('#4c6b37','foliage'),grass=mat('#748762','grass'),terra=mat('#a4775d','tile'),water=mat('#359aac','water',.18,.2),glass=mat('#68827b','glass',.2,.35),white=mat('#f1e8d4'),glow=new T.MeshStandardMaterial({color:'#fff2cd',emissive:'#ffdd99',emissiveIntensity:1});
 const mesh=(g,m,x,y,z)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;group.add(o);return o},box=(m,w,h,d,x,y,z,block=false)=>{const o=mesh(new T.BoxGeometry(w,h,d),m,x,y,z);if(block)blockers.push({x,z,w,d});return o};
 function beam(m,a,b,r=.06){const va=new T.Vector3(...a),vb=new T.Vector3(...b),delta=vb.clone().sub(va),o=mesh(new T.CylinderGeometry(r,r,delta.length(),6),m,...va.clone().add(vb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());return o;}
 function sign(text,w,x,y,z,yaw=0){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1400;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#3e4536';ctx.fillRect(0,0,1400,160);ctx.fillStyle='#f4e5bb';ctx.font='bold 76px serif';ctx.textAlign='center';ctx.fillText(text,700,108,1360);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,.65),new T.MeshStandardMaterial({map,side:T.DoubleSide,roughness:.7}),x,y,z);o.rotation.y=yaw;}
 const garden=area==='garden';box(garden?terra:tile,28,.1,37,0,-.05,0);
 if(!garden){for(let x=-14;x<=14;x+=1)box(white,.012,.003,37,x,.008,0);for(let z=-18;z<19;z+=1)box(white,28,.003,.012,0,.008,z);for(const side of [-1,1]){box(cream,.2,4.5,37,side*14,2.25,0);for(let z=-15;z<17;z+=4){box(glass,.1,2.7,3.1,side*13.85,2,z);box(dark,.16,3.1,.1,side*13.75,1.8,z-1.6);}}box(cream,28,4.5,.2,0,2.25,-18.5);box(cream,28,4.5,.2,0,2.25,18.5);}
 const tree=(x,z,h=5)=>{box(gold,1.5,.8,1.5,x,.4,z,true);mesh(new T.CylinderGeometry(.12,.22,h,7),dark,x,h/2+.5,z);for(const [dx,dy,dz] of [[0,0,0],[.7,-.7,.2],[-.5,-.6,-.3]]){const l=mesh(new T.SphereGeometry(1.2,9,7),leaf,x+dx,h+dy,z+dz);l.scale.y=1.4;}};
 function cushion(w,h,d){const r=Math.min(.07,h/3),shape=new T.Shape([new T.Vector2(-w/2+r,-h/2+r),new T.Vector2(w/2-r,-h/2+r),new T.Vector2(w/2-r,h/2-r),new T.Vector2(-w/2+r,h/2-r)]),g=new T.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:3,steps:1});g.translate(0,0,-d/2+r);return g;}
 function chair(x,z,yaw=0,m=aqua){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=yaw;group.add(g);const add=(geo,m,dx,y,dz)=>{const o=new T.Mesh(geo,m);o.position.set(dx,y,dz);g.add(o)};add(cushion(1.05,.24,1),m,0,.48,0);add(cushion(1.05,.9,.17),m,0,.95,.43);for(const dx of [-.5,.5]){add(cushion(.15,.45,.95),m,dx,.75,0);for(const dz of [-.37,.37])add(new T.CylinderGeometry(.035,.025,.42,6),gold,dx,.21,dz);}blockers.push({x,z,w:1.2,d:1.1});}
 function table(x,z){box(wood,2.2,.1,1.6,x,.8,z,true);box(gold,.15,.75,.15,x,.38,z);for(const dx of [-.6,.6]){mesh(new T.CylinderGeometry(.28,.28,.018,18),white,x+dx,.87,z);const napkin=mesh(new T.ConeGeometry(.11,.23,4),ivory,x+dx,.99,z-.4);mesh(new T.CylinderGeometry(.07,.07,.22,10),glass,x+dx,.99,z+.4);}}
 for(const h of layout.hotspots.filter(h=>h.id.startsWith('door:'))){box(dark,2.2,2.9,.1,h.x,1.45,18.3);box(gold,.05,2.7,.13,h.x-1,1.4,18.2);sign(h.id.slice(5).toUpperCase(),2.1,h.x,3.3,18.1,Math.PI);}
 if(area==='lobby'){
  // Soaring timber gable, dark rafters, slatted gallery and starburst lights
  // follow the operator's atrium photos. Circulation is an interpreted game plan.
  for(const side of [-1,1]){const slope=box(wood,16.5,.16,37,side*6.9,8.2,0);slope.rotation.z=-side*.58;for(let z=-17;z<19;z+=4)beam(dark,[side*13.8,3.8,z],[0,12.5,z],.13);box(wood,.15,2,37,side*13.7,5.1,0);for(let z=-18;z<19;z+=.25)box(dark,.08,1.8,.05,side*13.6,5,z);}
  const end=new T.Shape([new T.Vector2(-14,0),new T.Vector2(14,0),new T.Vector2(0,8.3)]);for(const z of [-18.4,18.4]){const o=mesh(new T.ShapeGeometry(end),new T.MeshStandardMaterial({color:'#b89b73',side:T.DoubleSide,roughness:.85}),0,4.4,z);for(let x=-13;x<14;x+=.4){const h=8.3*(1-Math.abs(x)/14);box(wood,.06,h,.08,x,4.4+h/2,z+(z<0?.1:-.1));}}
  for(const z of [-10,2,11]){beam(gold,[0,12.3,z],[0,8.7,z],.025);for(let j=0;j<12;j++){const a=j*Math.PI/6,b=[Math.cos(a)*1.5,8.6+Math.sin(a)*1.5,z+Math.sin(a*.5)*.4];beam(gold,[0,8.6,z],b,.025);mesh(new T.SphereGeometry(.12,8,6),glow,...b);}}
  for(const [x,z] of [[-10,-7],[10,-7],[-10,6],[10,6]])tree(x,z,5.5);
  box(cream,10,1.1,1.4,0,.55,-13,true);box(gold,10,.1,1.55,0,1.14,-13);for(let x=-5;x<5;x+=.2)box(wood,.045,.9,.08,x,.55,-12.24);for(const x of [-2.8,2.8])box(dark,.7,.45,.08,x,1.42,-13);sign('LANCASTER ACCRA · RECEPTION',10,0,2.6,-18.3);
  for(const [x,z,m] of [[-7.8,3,aqua],[-7.8,-1,aqua],[7.5,2,navy],[7.5,-2,navy],[-5.5,-7,ivory],[5.5,-7,ivory]])chair(x,z,x<0?-Math.PI/2:Math.PI/2,m);
  for(const x of [-5,5]){box(gold,1,.65,.7,x,.35,-2,true);box(white,1.2,.05,.9,x,.7,-2);}
  sign('BRANCHE · JAVA · GARDEN →',8,0,3,18.1,Math.PI);sign('HOTEL DIRECTORY',3,3,1.5,5.5);
 }else if(area==='branche'){
  box(wood,28,.2,37,0,4.8,0);
  for(const [x,z,r] of [[-7,-5,4],[6,2,4.5],[0,-12,3.5]]){mesh(new T.CylinderGeometry(r,r,.08,40),dark,x,4.65,z);for(let q=-r;q<=r;q+=.65){const len=2*Math.sqrt(Math.max(0,r*r-q*q));box(gold,len,.05,.035,x,4.59,z+q);box(gold,.035,.05,len,x+q,4.59,z);}for(let j=0;j<8;j++){const a=j*Math.PI/4;mesh(new T.CylinderGeometry(.065,.065,.03,8),glow,x+Math.cos(a)*r*.72,4.55,z+Math.sin(a)*r*.72);}}
  for(const x of [-3,3])for(const z of [-7,5]){mesh(new T.CylinderGeometry(.45,.45,4.7,20),wood,x,2.35,z);blockers.push({x,z,w:1,d:1});for(const dx of [-.2,.2])box(glow,.05,2.8,.05,x+dx,2.3,z+.46);}
  for(const x of [-8,8])for(const z of [-7,1,8]){table(x,z);chair(x-1.5,z,-Math.PI/2,ivory);chair(x+1.5,z,Math.PI/2,ivory);}
  box(dark,9,1.05,1.3,0,.525,-14,true);box(white,9.2,.1,1.5,0,1.1,-14);for(const x of [-3,0,3])box(gold,2,.15,.8,x,1.25,-14);box(stone,13,2.4,.2,0,2.6,-17.5);sign('BRANCHE · RESTAURANT, BAR & LOUNGE',12,0,3.7,-17.35);
 }else if(area==='cafe'){
  box(cream,28,.2,37,0,4.7,0);for(let x=-13;x<14;x+=.6)box(wood,.18,.14,37,x,4.52,0);
  box(wood,10,1.1,1.4,0,.55,-12,true);box(white,10.2,.08,1.6,0,1.14,-12);box(metalMaterial(),1.5,.65,.7,-2,1.5,-12);for(const x of [0,1,2])mesh(new T.CylinderGeometry(.11,.09,.2,12),white,x,1.28,-12);sign('JAVA CAFÉ',8,0,2.7,-18.3);
  for(const x of [-7,7])for(const z of [-5,2,8]){chair(x,z,x<0?-Math.PI/2:Math.PI/2,area==='cafe'?ivory:aqua);box(wood,1.4,.1,1,x+(x<0?2:-2),.65,z,true);box(gold,.07,.6,.07,x+(x<0?2:-2),.3,z);}tree(-11,-13,3);tree(11,10,3);
  sign('PUBLIC CAFÉ · WORLDFOLK REFRESHMENTS',10,0,3.6,-18.3);
 }else{
  // The actual mapped pool outline, scaled to the compact public garden scene.
  const ring=LANCASTER_POOL.map(lancasterLocal).map(([x,z])=>[(x+15)*.7,(z+20)*.7]),shape=new T.Shape(ring.slice(0,-1).map(([x,z])=>new T.Vector2(x,-z))),geo=new T.ShapeGeometry(shape);geo.rotateX(-Math.PI/2);mesh(geo,water,0,.05,0);blockers.push({x:-.14,z:.04,w:13,d:18.1});
  for(let i=1;i<ring.length;i++){const p=ring[i-1],q=ring[i],o=box(white,Math.hypot(q[0]-p[0],q[1]-p[1]),.14,.2,(p[0]+q[0])/2,.08,(p[1]+q[1])/2);o.rotation.y=-Math.atan2(q[1]-p[1],q[0]-p[0]);}
  for(let j=0;j<10;j++){const a=j*Math.PI/5,o=mesh(new T.SphereGeometry(.55,8,5),glass,-1+1.3*Math.cos(a),.058,-1+1.3*Math.sin(a));o.scale.set(1,.008,.55);o.rotation.y=-a;}
  for(const x of [-12,12]){box(grass,3,.02,30,x,.02,-1);for(const z of [-13,-3,7]){mesh(new T.CylinderGeometry(.16,.25,7,7),dark,x,3.5,z);for(let j=0;j<8;j++){const a=j*Math.PI/4,o=mesh(new T.SphereGeometry(1,8,5),leaf,x+Math.cos(a),6.7,z+Math.sin(a));o.scale.set(2,.12,.5);o.rotation.y=-a;}}}
  for(const [x,z] of [[9.7,2],[-9,1],[10,-8]]){chair(x,z,x<0?-Math.PI/2:Math.PI/2,ivory);mesh(new T.CylinderGeometry(.04,.04,2.6,7),gold,x,1.3,z-1.7);mesh(new T.ConeGeometry(1.7,.6,14),white,x,2.8,z-1.7);}
  box(dark,3,1,2,-10,.5,-14,true);sign('GARDEN TERRACE',4,-10,2.6,-16.5);for(const x of [-12,-8])box(dark,.12,2.7,.12,x,1.35,-14);mesh(new T.ConeGeometry(3.5,2,6),wood,-10,3.5,-14);
  // Cream guest wing gives the pool its recognisable garden-facing backdrop.
  box(cream,28,11,4,0,5.5,-23);for(let x=-12;x<14;x+=4)for(const y of [2,5.5,9]){box(stone,3.7,2.6,.12,x,y,-20.9);box(glass,3.3,2.2,.14,x,y,-20.8);box(cream,.12,2.2,.16,x,y,-20.7);}
 }
 function metalMaterial(){return gold;}
 for(const h of layout.hotspots.filter(h=>!h.id.startsWith('sit:')&&!h.id.startsWith('door:')))box(gold,.55,.008,.55,h.x,.015,h.z);
 if(layout.exit)box(leaf,2,.01,.55,layout.exit[0],.015,layout.exit[1]);
 enhanceMaterials(group);batchStaticMeshes(group);return {group,blockers,layout,hotspots:layout.hotspots};
}
