import * as T from './three.module.js';import {oakKit} from './oak-plaza-model.js';
import {OAK_PLAZA,OAK_OUTLINE,OAK_POOL,OAK_SMALL_POOL,OAK_SOLIDS,oakLocal,oakPoint,oakRoadClear} from './oak-plaza-data.js';
export function createOakPlaza(){
 const group=new T.Group();group.name=OAK_PLAZA.name;const k=oakKit(group),{m,box,mesh,poly,sign,plant,coping}=k,ring=OAK_OUTLINE.map(oakLocal);
 poly(ring,m.cream,13);poly(ring,m.navy,.28,13);
 const outward=ring.slice(1).reduce((s,b,i)=>s+ring[i][0]*b[1]-b[0]*ring[i][1],0)>0?-1:1;
 for(let i=1;i<ring.length;i++){
  const a=ring[i-1],b=ring[i],dx=b[0]-a[0],dz=b[1]-a[1],len=Math.hypot(dx,dz);if(len<5)continue;
  const wall=new T.Group();wall.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);wall.rotation.y=Math.atan2(-dz,dx);group.add(wall);
  const part=(ma,w,h,d,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),ma);o.position.set(x,y,z*outward);wall.add(o);return o};
  const west=Math.max(a[0],b[0])<-25,n=Math.max(1,Math.floor(len/(west?2.4:4.6)));
  if(west){for(let j=0;j<n;j++){const x=(j+.5)*len/n-len/2,curtain=Math.abs(x-3)<5.5;for(const y of [1.6,4.8,8,11.2]){part(m.navy,curtain?len/n:1.5,curtain?3.15:1.25,.16,x,y,.12);part(m.glass,curtain?len/n-.08:1.35,curtain?3.05:1.1,.18,x,y,.23);}}for(const x of [-3,9])part(m.stone,.8,12.8,.3,x,6.4,.15);}
  else{for(let j=0;j<n;j++){const x=(j+.5)*len/n-len/2;for(const y of [1.6,4.8,8,11.2]){part(m.navy,2.1,1.2,.15,x,y,.12);part(m.glass,1.95,1.07,.17,x,y,.24);}if(j%4===0)part(m.stone,1.4,12.8,.25,x-len/n/2,6.4,.14);}}
  part(m.navy,len,.45,.6,0,13.05,.1);
 }
 // West arrival facade: blue curtain wall, suspended navy canopy and gold lettering.
 box(m.navy,7,.28,13,-36,3.85,4);for(const z of [-.5,8.5])for(const x of [-39,-34])k.beam(m.metal,[x,3.95,z],[x+2.5,7,z],.025);
 sign('OAK PLAZA HOTEL',8,-35.5,10,5,-Math.PI/2);sign('EAST AIRPORT',6,-35.55,8.9,5,-Math.PI/2);sign('AKWAABA · RECEPTION',3,-35.4,2.7,4,-Math.PI/2);
 box(m.gold,.18,2.65,3.1,-35.12,1.325,4);box(m.glass,.2,2.45,2.85,-35.24,1.27,4);box(m.gold,.22,2.5,.06,-35.36,1.25,4);
 for(let x=-40;x<-34;x++)for(let z=-16;z<14;z++)if(oakRoadClear(oakPoint(x,z),.75))box(m.tile,.98,.025,.98,x,.02,z);
 for(const p of OAK_SOLIDS){if(p.id==='directory'){box(m.metal,.08,1.8,.08,p.x,.9,p.z);sign('OAK PLAZA · VISITOR GUIDE',2,p.x,1.55,p.z-.1,Math.PI);}else if(p.id.startsWith('palm-'))k.palm(p.x,p.z,p.h);else plant(p.x,p.z,1.3);}
 for(const r of [OAK_POOL,OAK_SMALL_POOL]){const local=r.map(oakLocal);poly(local,m.water,0,.06);coping(local);}
 // Only a narrow pool border; do not pave over neighbouring plots or service ways.
 for(const r of [OAK_POOL]){const v=r.map(oakLocal),cx=-68,cz=38;const outer=v.map(([x,z])=>[cx+(x-cx)*1.13,cz+(z-cz)*1.1]);poly(outer,m.tile,0,.025);}
 group.userData.oakPlaza={nativeBuilding:1043889540,nativePools:[1043889544,1344928034],surveyed:false,rooms:['lobby','lucida','joes','pool']};k.finish();return {group,update(){}};
}
