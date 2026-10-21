import * as T from './three.module.js';import {VILLA_AREAS} from './villa-monticello-data.js';import {villaKit} from './villa-monticello-model.js';import {enhanceMaterials} from './graphics-materials.js';import {batchStaticMeshes} from './render-utils.js';
export function buildVillaInterior(area='lobby'){
 const layout=VILLA_AREAS[area]||VILLA_AREAS.lobby,group=new T.Group(),blockers=[];group.name=layout.name;const k=villaKit(group),{m,mesh,box,sign,armchair,wovenSeat,plant,pergola}=k;let update=()=>{};
 const solid=(mat,w,h,d,x,y,z)=>{blockers.push({x,z,w,d});return box(mat,w,h,d,x,y,z)};
 function art(x,y,z,yaw){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=yaw;group.add(g);box(m.gold,1.4,1.8,.12,0,0,0,g);box(m.cream,1.22,1.62,.14,0,0,.02,g);for(let i=0;i<5;i++){const line=box(i%2?m.wood:m.gold,.065,1.1,.02,(i-2)*.17,0,.1,g);line.rotation.z=(i-2)*.12;}}
 if(area==='lobby'){
  box(m.pave,18,.1,23,0,-.05,0);for(const side of [-1,1]){box(m.stone,.2,4,23,side*9,2,0);for(let z=-11;z<12;z+=.6)for(let y=.3;y<4;y+=.35)box(m.cream,.025,.02,.55,side*8.88,y,z);art(side*8.7,2,-3,side<0?Math.PI/2:-Math.PI/2);box(m.grey,.15,2.9,4.8,side*8.85,1.6,4);box(m.white,.17,2.65,4.6,side*8.75,1.6,4);}
  box(m.cream,18,4,.2,0,2,-11.5);box(m.cream,18,4,.2,0,2,11.5);box(m.cream,18,.16,23,0,4.1,0);for(const x of [-8.7,8.7])box(m.white,.25,.2,23,x,3.9,0);
  // Deep wood panels, mirrored inserts, medallion and pendant globes from the
  // current reception photo; no reception borrowed from the larger hotels.
  solid(m.wood,10,1.12,1.2,0,.56,-8);box(m.wood,10.3,.12,1.4,0,1.17,-8);for(const x of [-3.6,3.6]){box(m.gold,2.15,.8,.08,x,.56,-7.36);box(m.glass,1.95,.65,.09,x,.56,-7.3);}const medallion=mesh(new T.CylinderGeometry(.4,.4,.05,24),m.wood,0,.6,-7.3);medallion.rotation.x=Math.PI/2;sign('VM',.7,.5,0,.6,-7.25);
  for(let x=-4.8;x<5;x+=.14)box(m.gold,.025,.13,.05,x,1.02,-7.34);solid(m.wood,1,3.9,1.1,5.4,1.95,-9);for(const x of [-2,2])box(m.black,.75,.42,.06,x,1.45,-8);sign('VILLA MONTICELLO',8,.75,0,2.6,-11.3,0);plant(5.4,-7.5,1.2);for(const x of [-3,3])for(const y of [2,2.7,3.4]){box(m.gold,1,.48,.04,x,y,-11.3);box(m.cream,.85,.33,.05,x,y,-11.26);}
  box(m.rug,14,.02,10,0,.018,1);for(const x of [-5,5])for(const z of [-3,1]){armchair(x,z,x<0?-Math.PI/2:Math.PI/2);blockers.push({x,z,w:1.15,d:1.15});}for(const x of [-2.8,2.8])solid(m.wood,1.3,.6,1,x,.3,-1);
  for(const z of [-7,1,7])for(const x of [-3,3]){mesh(new T.CylinderGeometry(.018,.018,.75,6),m.gold,x,3.65,z);mesh(new T.SphereGeometry(.21,12,8),m.glow,x,3.2,z);}
  sign('BRASSERIE COURTYARD',3,.5,4,2.7,11.28,Math.PI);box(m.black,2.3,2.5,.1,4,1.25,11.3);box(m.glass,2.1,2.3,.13,4,1.25,11.18);sign('HOTEL DIRECTORY',2,.5,3,1.6,1);
 }else{
  box(m.green,24,.1,29,0,-.05,0);for(const x of [-9,9])box(m.pave,5,.02,29,x,.02,0);
  // Central square four-jet fountain, pergola with tied green curtains and
  // woven chairs with mauve cushions are specific courtyard photo cues.
  const f=k.fountain(0,0,3.2);update=f.update;blockers.push({x:0,z:0,w:3.2,d:3.2});pergola(8.5,0,5,22);for(const x of [6,11])for(const z of [-11,11])blockers.push({x,z,w:.18,d:.18});
  for(const [x,z] of [[8.5,4],[8.5,-2],[-9,1],[-9,5]]){wovenSeat(x,z,x>0?Math.PI/2:-Math.PI/2);blockers.push({x,z,w:1.25,d:1.25});}for(const z of [1,7])solid(m.wicker,1.1,.55,1.1,8.5,.275,z);
  solid(m.wood,3.5,1.05,1.3,8.5,.525,-12.5);box(m.stone,3.7,.1,1.5,8.5,1.1,-12.5);sign('COURTYARD DINING',3.6,.5,8.5,2,-14.15);plant(-10,-11,1.6);plant(10,12,1.6);
  for(const x of [-12,12]){box(m.grey,.25,10.5,29,x,5.25,0);for(let z=-11;z<14;z+=4)for(const y of [5.1,8.3]){box(m.black,.1,2.05,2.7,x+(x<0?.2:-.2),y,z);box(m.white,.12,1.85,2.5,x+(x<0?.28:-.28),y,z);}box(m.black,.2,3.3,29,x+(x<0?.22:-.22),1.65,0);for(let z=-11;z<14;z+=4){box(m.glass,.1,2.7,3.2,x+(x<0?.36:-.36),1.6,z);for(const dz of [-1.55,0,1.55])box(m.black,.13,2.8,.05,x+(x<0?.43:-.43),1.6,z+dz);}}
  box(m.grey,24,7,.2,0,7,-14.55);for(let x=-10;x<12;x+=4)for(const y of [5.1,8.3]){box(m.black,2.8,2,.1,x,y,-14.4);box(m.white,2.6,1.8,.12,x,y,-14.32);}
  // Guest/member dining is visible through glazing. The public walking bounds
  // stop at the glass, matching the operator's courtyard-only public access.
  box(m.pave,24,.1,9,0,-.05,-19);box(m.stone,24,3.6,.2,0,1.8,-23.5);box(m.cream,24,.2,9,0,3.7,-19);const glazing=new T.MeshStandardMaterial({color:'#9cafa8',roughness:.15,transparent:true,opacity:.18,depthWrite:false});box(glazing,24,3.3,.05,0,1.65,-14.6);for(let x=-12;x<=12;x+=3)box(m.black,.075,3.5,.1,x,1.75,-14.5);
  for(const x of [-6,2]){const rack=mesh(new T.TorusGeometry(1,.025,6,36),m.black,x,2,-23.3);for(let y=1.3;y<=2.8;y+=.35)box(m.black,1.75,.04,.16,x,y,-23.15);solid(m.wood,3,.1,1.1,x,.95,-20);for(const dx of [-.9,.9]){armchair(x+dx,-19,0,m.ochre);}}
  for(const x of [-6,2]){box(m.black,3,.18,1.2,x,3.35,-20);for(let j=0;j<6;j++){const l=mesh(new T.SphereGeometry(.2,7,5),m.leaf,x-1.2+j*.45,3,-20);l.scale.y=1.8;}mesh(new T.SphereGeometry(.13,10,8),m.glow,x,2.75,-20);}
  sign('THE BRASSERIE',5,.55,0,3.05,-14.45);sign('RECEPTION',3,.55,-7,2.6,14.3,Math.PI);box(m.black,2.5,2.4,.1,-7,1.2,14.4);for(const z of [-9,-3,3,9]){box(m.black,19,.025,.025,0,3.3,z);for(let x=-9;x<=9;x+=2)mesh(new T.SphereGeometry(.06,7,5),m.glow,x,3.25,z);}
 }
 for(const h of layout.hotspots.filter(h=>!h.id.startsWith('sit:')))box(m.gold,.5,.006,.5,h.x,.016,h.z);if(layout.exit)box(m.green,2,.01,.5,...[layout.exit[0],.015,layout.exit[1]]);
 enhanceMaterials(group);batchStaticMeshes(group);return {group,blockers,layout,hotspots:layout.hotspots,update};
}
