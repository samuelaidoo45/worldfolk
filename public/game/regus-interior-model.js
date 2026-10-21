import * as T from './three.module.js';import {tagSurface} from './graphics-materials.js';import {oakKit} from './oak-plaza-model.js';import {REGUS_AREAS} from './airport-residential-data.js';
export function buildRegusInterior(area='workspace'){
 const layout=REGUS_AREAS[area]||REGUS_AREAS.workspace,group=new T.Group(),blockers=[],k=oakKit(group),{m,box,mesh,sign,beam}=k;group.name=layout.name;
 m.white=tagSurface(new T.MeshStandardMaterial({color:'#eeeeea',roughness:.7}),'paint');m.cream.color.set('#eeece4');m.white.color.set('#eeeeea');m.navy.color.set('#262e31');m.glass.color.set('#7f9a9b');m.blue.color.set('#506d97');m.wood.color.set('#b99a73');m.dark.color.set('#34383a');m.leaf.color.set('#577a46');
 const solid=(ma,w,h,d,x,y,z)=>{box(ma,w,h,d,x,y,z);blockers.push({x,z,w,d});};
 const white=m.cream,open=area==='courtyard',w=layout.width,d=layout.depth;box(area==='workspace'?m.blue:area==='kitchen'?m.wood:m.leaf,w,.1,d,0,-.05,0);
 if(area==='kitchen')for(let x=-w/2;x<w/2;x+=.25)box(m.dark,.007,.002,d,x,.002,0);
 for(const x of [-w/2,w/2])box(white,.18,open?4.1:3.3,d,x,open?2.05:1.65,0);for(const z of [-d/2,d/2])box(white,w,open?4.1:3.3,.18,0,open?2.05:1.65,z);
 if(!open){box(white,w,.12,d,0,3.36,0);for(let x=-w/2;x<=w/2;x+=.6)box(m.stone,.012,.018,d,x,3.285,0);for(let z=-d/2;z<=d/2;z+=.6)box(m.stone,w,.018,.012,0,3.285,z);const light=new T.MeshStandardMaterial({color:'#f8f8ef',emissive:'#fffbe9',emissiveIntensity:.7});for(const x of [-w/4,w/4])for(const z of [-d/4,d/4])box(light,1.12,.025,.55,x,3.28,z);}
 const window=(x,y,z,w,h,side=false)=>{const g=new T.Group();g.position.set(x,y,z);if(side)g.rotation.y=x>0?-Math.PI/2:Math.PI/2;group.add(g);const part=(ma,w,h,d,x=0)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),ma);o.position.set(x,0,0);g.add(o);};part(m.navy,w+.16,h+.16,.12);const o=new T.Mesh(new T.BoxGeometry(w,h,.13),m.glass);o.position.z=.07;g.add(o);part(m.navy,.045,h,.19);for(const dx of [-w*.25,w*.25]){const handle=new T.Mesh(new T.BoxGeometry(.025,.2,.03),m.metal);handle.position.set(dx,0,.16);g.add(handle);}};
 function officePlant(x,z,h=2.2){
  box(m.white,.75,.65,.75,x,.325,z);const vertices=[];
  for(let j=0;j<9;j++){const a=j*Math.PI*2/9,base=[x,.55,z],tip=[x+Math.cos(a)*.65,h-.25+(j%3)*.13,z+Math.sin(a)*.65];beam(m.leaf,base,tip,.012);
   for(let i=2;i<9;i++){const t=i/10,px=x+Math.cos(a)*.65*t,pz=z+Math.sin(a)*.65*t,py=.6+(h-.65)*t,len=.3*Math.sin(t*Math.PI)+.08;for(const side of [-1,1]){const bx=px+Math.cos(a+side*1.1)*len,bz=pz+Math.sin(a+side*1.1)*len;vertices.push(px,py,pz,bx,py-.12,bz,px+Math.cos(a)*.1,py+.02,pz+Math.sin(a)*.1);}}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.computeVertexNormals();m.leaf.side=T.DoubleSide;mesh(g,m.leaf);
 }
 const chair=(x,z,office=false,yaw=0)=>{if(!office){k.chair(x,z,yaw,m.wood,true);blockers.push({x,z,w:1.05,d:1.05});return;}
  const g=new T.Group();g.position.set(x,0,z);g.rotation.y=yaw;group.add(g);const b=(ma,w,h,d,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),ma);o.position.set(x,y,z);g.add(o);};b(m.dark,.65,.14,.62,0,.48,0);b(m.navy,.65,.7,.07,0,.9,.27);for(let y=.64;y<1.22;y+=.08)b(m.metal,.58,.009,.01,0,y,.22);for(const dx of [-.36,.36]){b(m.dark,.045,.3,.045,dx,.67,.1);b(m.dark,.065,.05,.58,dx,.82,0);}b(m.metal,.07,.4,.07,0,.22,0);for(let j=0;j<5;j++){const a=j*Math.PI*2/5;beam(m.dark,[x,.12,z],[x+Math.sin(a)*.33,.12,z+Math.cos(a)*.33],.03);const caster=new T.Mesh(new T.CylinderGeometry(.065,.065,.05,8),m.dark);caster.rotation.z=Math.PI/2;caster.position.set(Math.sin(a)*.33,.06,Math.cos(a)*.33);g.add(caster);}blockers.push({x,z,w:.8,d:.8});
 };
 for(const h of layout.hotspots.filter(h=>h.id.startsWith('door:'))){box(m.wood,1.8,2.35,.12,h.x,1.175,d/2-.12);sign(h.id.slice(5).toUpperCase(),1.9,h.x,2.65,d/2-.23,Math.PI);}
 if(area==='workspace'){
  box(tagSurface(new T.MeshStandardMaterial({color:'#9fc9de',roughness:.9}),'plaster'),w,3.2,.08,0,1.6,-d/2+.11);window(0,1.75,-d/2+.17,3.9,1.55);window(-w/2+.13,1.75,-1.5,3.8,1.55,true);
  for(const x of [-2.2,2.2]){solid(m.white,2.5,.075,1.2,x,.76,-3.7);for(const dx of [-1.15,1.15])for(const dz of [-.45,.45])box(m.white,.05,.73,.05,x+dx,.37,-3.7+dz);chair(x,-2.2,true);box(m.navy,.8,.5,.045,x,1.13,-3.9);box(m.dark,.75,.025,.25,x,.82,-3.45);box(m.metal,.05,.25,.05,x,.9,-3.9);}
  solid(m.white,1.1,.75,1.5,-3.15,.375,.15);chair(-2,.15,true,-Math.PI/2);for(const dz of [-.55,.55])box(m.metal,.04,.75,.04,-3.4,.375,.15+dz);officePlant(3.45,1.7,1.65);blockers.push({x:3.45,z:1.7,w:.8,d:.8});
 }else if(area==='courtyard'){
  window(0,1.5,-d/2+.13,2.4,2.6);window(w/2-.13,1.7,-2,2.8,1.8,true);
  solid(m.wood,1.2,.12,2.5,-.4,.8,-1);for(const x of [-.85,.05])for(const z of [-2,.05])box(m.wood,.08,.75,.08,x,.375,z);for(let x=-.9;x<.2;x+=.18)box(m.dark,.01,.005,2.5,x,.863,-1);
  for(const [x,z,yaw] of [[-1.7,-1,-Math.PI/2],[.9,0,Math.PI/2],[-.4,-2.9,Math.PI]])chair(x,z,false,yaw);
  // Beige cantilever parasol, with the support outside the walking route.
  solid(m.metal,.1,2.7,.1,-1.95,1.35,-3.5);beam(m.metal,[-1.95,2.7,-3.5],[-.4,3,-1.6],.035);const parasol=mesh(new T.ConeGeometry(2,.45,4),m.beige,-.4,2.9,-1.6);parasol.rotation.y=Math.PI/4;
  for(const [x,z] of [[-1.6,-4.6],[-1.7,1],[1.6,-4.6]]){officePlant(x,z,2.2);blockers.push({x,z,w:1,d:1});}
 }else{
  solid(m.white,5.5,.9,.7,0,.45,-2.55);solid(m.white,.75,.9,2.8,2.5,.45,-1.5);box(m.tile,5.6,.08,.82,0,.94,-2.55);box(m.tile,.86,.08,2.9,2.5,.94,-1.5);
  for(let x=-2.5;x<2.5;x+=.85){box(m.stone,.012,.75,.02,x,.49,-2.19);box(m.metal,.24,.025,.035,x+.35,.68,-2.16);}
  for(let z=-2.6;z<-.2;z+=.6)box(m.metal,.03,.025,.24,2.09,.68,z);
  window(-.5,1.9,-2.86,3.8,1.15);window(2.87,1.9,-1.5,2.4,1.15,true);box(m.metal,1.1,.025,.5,.3,.99,-2.5);box(m.dark,.9,.02,.37,.3,1.01,-2.5);beam(m.metal,[.3,1,-2.7],[.3,1.35,-2.7],.025);beam(m.metal,[.3,1.35,-2.7],[.3,1.35,-2.42],.025);
  sign('SHARED KITCHEN',3.2,0,2.8,-2.84);
 }
 for(const h of layout.hotspots.filter(h=>!h.id.startsWith('door:')&&!h.id.startsWith('sit:')))box(m.gold,.4,.006,.4,h.x,.012,h.z);
 if(layout.exit){box(m.leaf,1.6,.01,.3,layout.exit[0],.012,layout.exit[1]);sign('EXIT',1.4,layout.exit[0],2.65,d/2-.23,Math.PI);}
 k.finish();return {group,layout,hotspots:layout.hotspots,blockers,update(){}};
}
