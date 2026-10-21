import * as T from './three.module.js';import {oakKit} from './oak-plaza-model.js';import {OAK_AREAS,OAK_POOL,oakLocal} from './oak-plaza-data.js';
export function buildOakInterior(area='lobby'){
 const layout=OAK_AREAS[area]||OAK_AREAS.lobby,group=new T.Group(),blockers=[],k=oakKit(group),{m,box,mesh,sign,beam,chair,plant}=k;group.name=layout.name;
 const solid=(ma,w,h,d,x,y,z)=>{box(ma,w,h,d,x,y,z);blockers.push({x,z,w,d});},seat=(x,z,yaw,ma,woven=false)=>{chair(x,z,yaw,ma,woven);blockers.push({x,z,w:1.15,d:1.1});};
 const pool=area==='pool';box(m.tile,24,.1,29,0,-.05,0);for(let x=-12;x<13;x++)box(m.stone,.015,.003,29,x,.004,0);for(let z=-14;z<15;z++)box(m.stone,24,.003,.015,0,.004,z);
 if(!pool){box(m.cream,24,4.1,.2,0,2.05,-14.5);box(m.cream,24,4.1,.2,0,2.05,14.5);for(const x of [-12,12]){box(m.cream,.2,4.1,29,x,2.05,0);for(let z=-12;z<14;z+=4){box(m.glass,.12,2.8,3.4,x*.99,2,z);box(m.navy,.14,.1,3.5,x*.985,.6,z);}}box(m.cream,24,.15,29,0,4.2,0);for(const x of [-8,0,8])for(const z of [-10,-2,6]){const light=new T.MeshStandardMaterial({color:'#fff0cd',emissive:'#fff0cd',emissiveIntensity:.7});mesh(new T.CylinderGeometry(.11,.11,.02,10),light,x,4.09,z);}}
 for(const h of layout.hotspots.filter(h=>h.id.startsWith('door:'))){box(m.wood,2.3,2.7,.12,h.x,1.35,14.3);sign(h.id.slice(5).toUpperCase(),2.3,h.x,3.1,14.15,Math.PI);}
 if(area==='lobby'){
  solid(m.dark,8,1.1,1.3,0,.55,-10);box(m.stone,8.2,.1,1.45,0,1.14,-10);for(let x=-11;x<12;x+=.5)box(m.wood,.34,3.4,.12,x,1.8,-14.3);sign('OAK PLAZA · EAST AIRPORT',9,0,2.6,-14.1);
  for(const x of [-6,6])for(const z of [-3,1])seat(x,z,x<0?-Math.PI/2:Math.PI/2,m.beige);
  for(const x of [-4,4]){solid(m.wood,1.3,.7,.8,x,.35,-1);box(m.glass,1.4,.04,.85,x,.73,-1);}
  // Tall woven pots and paired gilt mirrors from the operator's lobby photograph.
  for(const x of [-9,9]){plant(x,4,2.5);blockers.push({x,z:4,w:.9,d:.9});}
  solid(m.gold,.5,.9,5,10.8,.45,-5);for(const z of [-6.4,-3.6]){box(m.gold,.15,2.4,2.3,11,2,z);box(m.mirror,.16,2.05,1.95,10.89,2,z);}
  sign('LUCIDA · JOE’S · POOL',7,0,3.5,14.1,Math.PI);
 }else if(area==='lucida'){
  for(const x of [-6,6])for(const z of [-5,1,6]){box(m.wood,2.1,.1,1.5,x,.76,z);blockers.push({x,z,w:2.1,d:1.5});for(const dx of [-.85,.85])for(const dz of [-.55,.55])box(m.wood,.07,.72,.07,x+dx,.36,z+dz);box(m.white,2.05,.035,1.45,x,.82,z);seat(x-1.25,z,-Math.PI/2,m.mustard);seat(x+1.25,z,Math.PI/2,m.blue);for(const dx of [-.5,.5]){mesh(new T.CylinderGeometry(.23,.23,.02,16),m.white,x+dx,.86,z);mesh(new T.ConeGeometry(.1,.2,4),m.white,x+dx,.97,z-.35);}}
  solid(m.white,9,1,1.5,0,.5,-9);box(m.dark,9,.06,1.5,0,1.05,-9);
  // Woven lidded buffet baskets on crossed timber stands are distinctive to Lucida.
  for(const x of [-3,0,3]){for(const s of [-1,1])beam(m.wood,[x-s*.55,1.1,-9],[x+s*.5,1.75,-9],.07);mesh(new T.CylinderGeometry(.6,.4,.4,18),m.gold,x,1.85,-9);mesh(new T.ConeGeometry(.62,.32,18),m.gold,x,2.2,-9);for(let y=1.7;y<2.06;y+=.06){const o=mesh(new T.TorusGeometry(.5,.016,4,18),m.wood,x,y,-9);o.rotation.x=Math.PI/2;}}
  sign('LUCIDA RESTAURANT',9,0,3.2,-14.3);
 }else if(area==='joes'){
  solid(m.wood,8,1.1,1.5,0,.55,-9);box(m.dark,8.2,.1,1.65,0,1.15,-9);box(m.stone,9,3.7,.2,0,1.85,-14.2);sign('JOE’S BAR & LOUNGE',8,0,3.2,-14.05);
  for(const x of [-6,6])for(const z of [-4,1,6]){seat(x,z,x<0?-Math.PI/2:Math.PI/2,m.beige);solid(m.wood,1.4,.6,1,x+(x<0?2:-2),.3,z);box(m.glass,1.45,.04,1.05,x+(x<0?2:-2),.63,z);mesh(new T.CylinderGeometry(.06,.05,.2,10),m.glass,x+(x<0?2:-2),.75,z);}
  for(const x of [-9,9]){solid(m.stone,.6,4,.7,x,2,-5);plant(x,8,2.4);blockers.push({x,z:8,w:1,d:1});}
 }else{
  // Preserve the native curved pool proportions in this compact public deck scene.
  const r=OAK_POOL.map(oakLocal).map(([x,z])=>[(x+68)*.65,(z-38)*.65]);k.poly(r,m.water,0,.055);k.coping(r);
  const xs=r.map(p=>p[0]),zs=r.map(p=>p[1]);blockers.push({x:(Math.min(...xs)+Math.max(...xs))/2,z:(Math.min(...zs)+Math.max(...zs))/2,w:Math.max(...xs)-Math.min(...xs),d:Math.max(...zs)-Math.min(...zs)});
  for(const x of [-9,9]){for(const z of [-8,0,7]){plant(x,z,2.4);blockers.push({x,z,w:.9,d:.9});}}
  for(const [x,z] of [[8,1],[-8,-4],[8,6]]){seat(x,z,x<0?-Math.PI/2:Math.PI/2,m.beige,true);k.parasol(x,z-1.8);blockers.push({x,z:z-1.8,w:.15,d:.15});}
  for(const x of [-8,8]){k.lounger(x,-8);blockers.push({x,z:-8,w:1.1,d:2.4});}
  // Dark diamond lattice and planted border follow the current operator pool gallery.
  for(const x of [-11.5,11.5]){box(m.stone,.3,1,28,x,.5,0);for(let z=-13;z<13;z+=1.5){beam(m.dark,[x,1,z],[x,2.2,z+1.5],.035);beam(m.dark,[x,2.2,z],[x,1,z+1.5],.035);}}
  solid(m.wood,5,1,1.2,0,.5,-12);sign('POOL TERRACE',5,0,2.8,-14);box(m.cream,24,12,4,0,6,-19);for(let x=-10;x<12;x+=4)for(const y of [2,5,8,11])box(m.glass,1.8,1.2,.14,x,y,-16.9);
 }
 for(const h of layout.hotspots.filter(h=>!h.id.startsWith('door:')&&!h.id.startsWith('sit:')))box(m.gold,.5,.008,.5,h.x,.012,h.z);
 if(layout.exit)box(m.leaf,2,.01,.5,...[layout.exit[0],.015,layout.exit[1]]);
 const ripples=[];if(pool)for(let j=0;j<5;j++){const o=mesh(new T.TorusGeometry(.4+j*.25,.012,4,24),m.glass,-1,.07,0);o.rotation.x=-Math.PI/2;o.userData.dynamic=true;ripples.push(o);}
 k.finish();return {group,layout,hotspots:layout.hotspots,blockers,update(t){ripples.forEach((o,i)=>{const s=1+.08*Math.sin(t*1.2+i);o.scale.set(s,s,1);});}};
}
