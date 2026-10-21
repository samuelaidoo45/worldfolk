import * as T from './three.module.js';
import {AIRPORT_T2,T2_SEATS,T2_POSTS,T2_SCREENS,T2_CANOPIES,t2Local} from './airport-t2-data.js';
import {T2_RINGS} from './airport-t2-map.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {batchStaticMeshes} from './render-utils.js';
export function createAirportT2(){
 const group=new T.Group(),site=new T.Group();group.name=AIRPORT_T2.name;site.rotation.y=AIRPORT_T2.rotation*Math.PI/180;group.add(site);
 const mat=(color,kind='stone',roughness=.8,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),kind);
 const cream=mat('#cfc9ad'),ivory=mat('#e7e4cd'),copper=mat('#a76e4f','paint',.7,.12),joint=mat('#715342'),glass=mat('#305668','glass',.18,.65),blue=mat('#314d61','paint'),steel=mat('#98a3a4','metal',.4,.6),dark=mat('#20333b'),paving=mat('#95978c','paving'),roof=mat('#8d9695','metal',.65,.3),white=mat('#e5e4d7','paint'),yellow=mat('#ceaf48','paint'),screen=mat('#677c7e','metal');
 glass.emissive.set('#172d37');glass.emissiveIntensity=.22;
 const lamp=new T.MeshStandardMaterial({color:'#ece9d3',emissive:'#f4d5a2',emissiveIntensity:.8,roughness:.45});
 const mesh=(g,m,x=0,y=0,z=0,parent=site)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const box=(m,w,h,d,x,y,z,parent=site)=>mesh(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
 const solid=(ring,h,m,y=0)=>{const shape=new T.Shape(ring.slice(0,-1).map(p=>new T.Vector2(p[0],-p[1]))),g=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);return mesh(g,m,0,y,0);};
 const label=(text,w,h,x,y,z,color='#eee7cf',bg='#253f4a')=>{if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=2048;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,2048,256);ctx.fillStyle=color;ctx.font='600 106px sans-serif';ctx.textAlign='center';ctx.fillText(text,1024,166,1980);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,roughness:.7,side:T.DoubleSide}),x,y,z);o.rotation.y=Math.PI;};
 const tube=(a,b,r=.06,m=steel)=>{const aa=new T.Vector3(...a),bb=new T.Vector3(...b),d=bb.clone().sub(aa),o=mesh(new T.CylinderGeometry(r,r,d.length(),6),m,...aa.clone().add(bb).multiplyScalar(.5).toArray());o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.normalize());};
 const main=T2_RINGS[738854676].map(t2Local),arrival=T2_RINGS[738854674].map(t2Local),east=T2_RINGS[1159898176].map(t2Local);
 solid(main,10.8,cream);solid(main,.28,roof,10.8);solid(arrival,9.7,blue);solid(arrival,.25,ivory,9.7);solid(east,8.4,cream);solid(east,.25,roof,8.4);
 // Every glazed face follows its source edge; no square proxy building.
 function curtain(ring,height){const area=ring.slice(0,-1).reduce((n,a,i)=>n+a[0]*ring[i+1][1]-ring[i+1][0]*a[1],0),sign=area>0?1:-1;for(let i=0;i<ring.length-1;i++){const a=ring[i],b=ring[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<2)continue;const face=new T.Group();face.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);face.rotation.y=Math.atan2((b[1]-a[1])/len*sign,-(b[0]-a[0])/len*sign);site.add(face);const count=Math.ceil(len/2.7),w=len/count;for(let j=0;j<count;j++){const x=(j+.5)*w-len/2;box(glass,w-.08,height-.35,.075,x,height/2,.12,face);box(steel,.065,height,.12,x-w/2,height/2,.2,face);for(let row=1;row<4;row++)box(steel,w,.065,.12,x,height*row/4,.2,face);}box(ivory,len,.3,.3,0,.15,.2,face);box(ivory,len,.4,.4,0,height,.2,face);}}
 curtain(arrival,9.2);
 // Historic upper facade modules are a reconstruction of the established
 // building, not a claim that dismantled panels survived the 2026 works.
 for(const [left,right,z] of [[-81.6,-28,18.25],[-27.7,55.9,24.35]]){
  const count=Math.floor((right-left)/3.4),w=(right-left)/count;
  for(let i=0;i<count;i++){const x=left+(i+.5)*w;
   box(glass,w-.08,3.2,.1,x,1.75,z-.12);box(steel,.07,3.4,.14,x-w/2,1.7,z-.2);box(steel,w,.07,.15,x,2.35,z-.22);
   box(copper,w-.04,1.15,.5,x,4.25,z-.25);box(copper,w-.04,1.15,.5,x,7.85,z-.25);box(copper,w-.04,.7,.5,x,10.1,z-.25);
   for(const y of [6.1,9.1]){box(glass,w-.6,1.55,.1,x,y,z-.08);const fin=box(copper,.45,1.8,.85,x-w/2+.22,y,z-.42);fin.rotation.y=.22;box(steel,w+.05,.08,1.1,x,y+.95,z-.65);}
   for(const y of [3.8,4.4,7.5,8,9.8,10.4])box(joint,w,.022,.53,x,y,z-.27);
  }
 }
 // Modest roof lantern and broad eaves seen in historic road panoramas.
 box(copper,34,1.3,18,-38,11.3,46);for(let z=35;z<58;z+=1){const o=box(roof,42,.14,1.05,-38,12.05+.35*Math.pow((z-46)/12,2),z);o.rotation.x=.05*(z-46)/12;}
 for(const p of T2_CANOPIES){box(ivory,p.w,.25,p.d,p.x,p.y,p.z);for(let x=p.x-p.w/2;x<p.x+p.w/2;x+=5)box(steel,.07,.08,p.d,x,p.y-.2,p.z);}
 for(const p of T2_CANOPIES)for(let x=p.x-p.w/2+5;x<p.x+p.w/2;x+=12)box(lamp,1.8,.06,.3,x,p.y-.18,p.z);
 for(const p of T2_POSTS)box(ivory,p.w,p.height,p.d,p.x,p.height/2,p.z);
 // Narrow paving strips keep native pickup/car-park roads uncovered.
 box(paving,133,.04,9,-15,.02,12.6);box(paving,20,.04,7,12,.02,-19);
 for(const p of T2_SEATS){box(steel,3,.13,.7,p.x,.47,p.z);box(steel,3,.55,.1,p.x,.85,p.z+.3);for(const dx of [-1.15,1.15])box(dark,.09,.45,.5,p.x+dx,.22,p.z);for(const dx of [-1.4,-.45,.45,1.4])box(steel,.06,.25,.6,p.x+dx,.65,p.z);}
 for(const [x,z] of [[-20,17],[17,17]]){box(dark,.5,1,.5,x,.5,z);box(steel,.55,.06,.55,x,1.02,z);}
 // Original, bounded renovation hoarding preserves the public walkway. Its
 // position is an interpretation pending a dated current site survey.
 for(const p of T2_SCREENS){box(screen,p.w,p.height,p.d,p.x,p.height/2,p.z);const n=Math.ceil(p.w/2);for(let i=0;i<n;i++)box(steel,.06,p.height,.45,p.x-p.w/2+i*2,p.height/2,p.z);}
 for(let x=58;x<112;x+=4){box(yellow,1.2,.13,.08,x,.5,5.25);box(white,1.2,.13,.08,x+1.2,.5,5.25);}
 label('TERMINAL 2 · DOMESTIC DEPARTURES',28,1.1,-25,3.1,18.7,'#e9cf70');
 label('DOMESTIC ARRIVALS',17,1.2,29.55,4,-37); // perpendicular face below
 const last=site.children.at(-1);if(typeof document!=='undefined')last.rotation.y=-Math.PI/2;
 label('TERMINAL 2 · PUBLIC WAITING',16,1.1,-15,2.8,16.5);
 label('RENOVATION · PUBLIC ROUTE ←',23,1.2,82,1.7,5.25,'#f5df94');
 for(const x of [-66,-6,35]){box(ivory,.65,.55,1.4,x,.27,7.4);for(let z=7;z<8;z+=.24)box(dark,.67,.1,.12,x,.3,z);}
 // A few luggage carts distinguish the terminal without blocking entrances.
 for(const x of [-73,-71.8,-70.6]){tube([x,.2,16],[x,1,16]);tube([x,1,16],[x,1,16.65]);box(steel,.7,.07,.9,x,.3,16.4);for(const dx of [-.28,.28])for(const z of [16.1,16.7]){const o=mesh(new T.CylinderGeometry(.1,.1,.07,8),dark,x+dx,.12,z);o.rotation.z=Math.PI/2;}}
 group.userData.airportT2={sourceIds:AIRPORT_T2.sourceIds,referenceState:'historic-established-shell-with-interpreted-2026-works-screen',privateInterior:false,liveFlightData:false};
 enhanceMaterials(group);batchStaticMeshes(group);return {group,update(){}};
}
