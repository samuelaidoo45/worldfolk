import * as T from './three.module.js';
import {createMahamaNeighbourhood} from './mahama-neighbourhood.js';
import {BOUND_MASSES,BOUND_GROUNDS,BOUND_TREES,boundInside} from './airport-bound-data.js';
// Original geometry only. Reference pixels are never loaded as game materials.
export function createAirportBound(site,options={}){
 const result=createMahamaNeighbourhood(site,{masses:options.masses??BOUND_MASSES,baseGround:false,roofSubdivisions:2,minFaceLength:.5,renderMass(b,rings,k,h){
  if(options.renderMass?.(b,rings,k,h))return true;
  const {box,mesh,beam}=k,{material,plate,roof,faces,surface}=h;
  const wallColor=options.wallPalette?options.wallPalette.reduce((a,c)=>{const target=new T.Color(b.wallColor),distance=x=>{const v=new T.Color(x);return(v.r-target.r)**2+(v.g-target.g)**2+(v.b-target.b)**2;};return distance(a)<distance(c)?a:c;}):b.wallColor;
  const wall=material(wallColor,'plaster'),glass=material('#426b7c','glass'),dark=material('#343b3c','paint'),cream=material('#ddd8c5','paint'),brown=material('#77624d','paint'),metal=material('#9fa8a5','metal');
  const pts=rings[0].slice(0,-1),cx=pts.reduce((a,p)=>a+p[0]/pts.length,0),cz=pts.reduce((a,p)=>a+p[1]/pts.length,0);
  const shrink=(sx,sz)=>rings.map(r=>r.map(p=>[cx+(p[0]-cx)*sx,cz+(p[1]-cz)*sz]));
  const flat=(rr,ma,y,height=.18)=>plate(rr,ma,height,y);
  function glazing(rr,floors,step,start=0,balcony=false){faces(rr,f=>{for(let floor=0;floor<floors;floor++){const y=start+floor*step+step*.52,bays=Math.max(1,Math.floor(f.len/(balcony?4.4:3.7)));for(let j=0;j<bays;j++){const u=(j+.5)*f.len/bays-f.len/2,w=Math.min(balcony?2.5:1.55,f.len/bays-.6);f.part(dark,w+.18,step*.6+.18,.09,u,y,.06);f.part(glass,w,step*.6,.07,u,y,.13);f.part(cream,.055,step*.6,.05,u,y,.18);if(balcony&&f.len>13){f.part(dark,w+.6,.16,.7,u,y-step*.35,.3);f.part(metal,w+.6,.055,.04,u,y-step*.06,.65);for(const dx of [-w/2-.25,0,w/2+.25])f.part(metal,.035,step*.3,.04,u+dx,y-step*.20,.65);}}if(balcony)f.part(brown,f.len,.25,.13,0,start+(floor+1)*step-.1,.08);}});}
  if(b.family==='gcaa'){
   // Offset glazing slabs over a cream plinth. Native contour remains the base.
   plate(rings,cream,4);const lo=shrink(.96,.96),hi=shrink(.70,.83);plate(lo,glass,12,4);plate(hi,glass,14.5,16);flat(lo,cream,15.8,.5);flat(hi,cream,30.4,.35);
   faces(lo,f=>{for(let y=4;y<=16;y+=3)f.part(cream,f.len,.24,.22,0,y,.1);for(let u=-f.len/2+1;u<f.len/2;u+=2.1)f.part(metal,.055,11.8,.12,u,10,.15);});faces(hi,f=>{for(let y=16;y<=30;y+=3.4)f.part(cream,f.len,.2,.22,0,y,.1);for(let u=-f.len/2+1;u<f.len/2;u+=2)f.part(metal,.05,14.3,.1,u,23.2,.15);});
   faces(hi,f=>{if(f.len>20){const sign=f.at(0,30.9,.2);k.sign('GHANA CIVIL AVIATION AUTHORITY',Math.min(22,f.len-1),...sign,f.yaw);}for(const u of [-f.len/2+.18,f.len/2-.18])f.part(cream,.36,14.5,.20,u,23.25,.15);});return true;
  }
  if(b.family==='gata'){
   const x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0])),z0=Math.min(...pts.map(p=>p[1])),z1=Math.max(...pts.map(p=>p[1])),rad=6,rr=[[x0,z0],[x1,z0],[x1,z1],[x0+rad,z1]];for(let i=1;i<=9;i++){const a=Math.PI/2+i*Math.PI/18;rr.push([x0+rad+rad*Math.cos(a),z1-rad+rad*Math.sin(a)]);}rr.push([x0,z0]);
   plate([rr],material('#86938f','paint'),b.wallHeight);faces([rr],f=>{for(let floor=0;floor<8;floor++){const y=1.9+floor*3.3;f.part(glass,f.len-.18,2.7,.09,0,y,.11);for(let u=-f.len/2+1;u<f.len/2;u+=2.1)f.part(metal,.045,2.7,.05,u,y,.17);}});
   for(let y=.3;y<b.wallHeight;y+=3.3)flat([rr],cream,y,.25);
   box(material('#697b80','paint'),3,b.wallHeight,.25,x1-5,b.wallHeight/2,z1+.05);for(let floor=0;floor<8;floor++){const y=1.8+floor*3.3;box(dark,3.2,2.7,.12,x1-1.8,y,z1+.21);box(cream,3.5,.18,.9,x1-1.8,y-1.4,z1+.5);box(metal,3.3,.05,.05,x1-1.8,y-.5,z1+.85);}flat([rr],cream,b.wallHeight,.4);k.sign('GCAA · AVIATION TRAINING',18,cx,b.wallHeight+1,z1+.2);return true;
  }
  if(b.family==='four-points'){
   plate(rings,cream,b.wallHeight);glazing(rings,13,3.35,1.5);flat(rings,dark,.1,.35);
   const x0=Math.min(...pts.map(p=>p[0])),x1=Math.max(...pts.map(p=>p[0])),z1=Math.max(...pts.map(p=>p[1]));
   // Orange balcony recess column, metal service stair spine and glazed lobby.
   for(let floor=0;floor<13;floor++){const y=2.7+floor*3.35;box(material('#c97b43','paint'),3.3,2.9,.12,x0+3,y,z1+.13);box(dark,2.7,2.3,.13,x0+3,y,z1+.22);box(metal,3.3,.08,.7,x0+3,y-.85,z1+.5);box(metal,3.25,.05,.05,x0+3,y-.15,z1+.85);box(cream,2,.16,2,x1-1.2,y,cz);}
   for(const z of [cz-1,cz+1])beam(metal,[x1-1.2,0,z],[x1-1.2,b.wallHeight,z],.065);
   for(let floor=0;floor<13;floor++)beam(metal,[x1-1.2,1.5+floor*3.35,cz-1],[x1-1.2,4.85+floor*3.35,cz+1],.065);
   faces(rings,f=>{f.part(glass,f.len-.6,3.8,.1,0,2,.15);for(let u=-f.len/2+1;u<f.len/2;u+=3)f.part(metal,.08,3.8,.15,u,2,.20);});
   // Slotted projecting roof crown, matching the official exterior silhouette.
   box(cream,31,.38,2,cx,b.wallHeight+.3,cz-17);box(cream,31,.38,2,cx,b.wallHeight+.3,cz+17);for(let x=x0-2;x<=x1+2;x+=3.7)box(cream,1.0,.38,32,x,b.wallHeight+.3,cz);
   k.sign('FOUR POINTS',18,cx,b.wallHeight+2,z1+.2);return true;
  }
  plate(rings,wall,b.wallHeight);roof(b,rings,material(b.roofColor,b.roofColor==='#885f4d'?'roof-tile':'roof-metal'));
  if(b.family==='polo-views'){
   glazing(rings,Math.round(b.wallHeight/3.1),3.05,.3,true);
   faces(rings,f=>{f.part(brown,Math.min(3,f.len*.18),b.wallHeight,.14,0,b.wallHeight/2,.12);const a=f.at(-f.len/2,b.wallHeight+.1,.12),c=f.at(0,b.wallHeight-.6,.12),d=f.at(f.len/2,b.wallHeight+.1,.12);beam(dark,a,c,.23);beam(dark,c,d,.23);});return true;
  }
  const floors=b.family==='orange-office'?4:b.wallHeight>8?3:b.wallHeight>5?2:1,step=b.wallHeight/floors;
  if(b.family==='orange-office'){faces(rings,f=>{for(let floor=0;floor<4;floor++)f.part(glass,f.len-.65,2.4,.12,0,1.9+floor*3.2,.12);});}else glazing(rings,floors,step,0,b.family==='residential');
  faces(rings,f=>{f.part(cream,f.len,.16,.16,0,b.wallHeight-.05,.06);if(b.family==='orange-office'){for(let y=step;y<b.wallHeight;y+=step)f.part(material('#bd7950','paint'),f.len,.5,.30,0,y,.15);for(let u=-f.len/2+.4;u<f.len/2;u+=4.5)f.part(material('#bd7950','paint'),.45,b.wallHeight,.3,u,b.wallHeight/2,.13);}});
  if(b.family==='spiral-compound'){
   const fz=Math.max(...pts.map(p=>p[1])),sx=cx+3,sz=fz+1.05,stair=material('#705a45','metal');beam(stair,[sx,0,sz],[sx,6.1,sz],.10);
   for(let i=0;i<30;i++){const a=i*.27,y=.2+i*.19,o=box(stair,1.4,.09,.42,sx+Math.cos(a)*.68,y,sz+Math.sin(a)*.68);o.rotation.y=-a;beam(stair,[sx+Math.cos(a)*1.3,y,sz+Math.sin(a)*1.3],[sx+Math.cos(a)*1.3,y+.9,sz+Math.sin(a)*1.3],.018);if(i)beam(stair,[sx+Math.cos(a-.27)*1.3,y+.71,sz+Math.sin(a-.27)*1.3],[sx+Math.cos(a)*1.3,y+.9,sz+Math.sin(a)*1.3],.025);}
  }return true;
 },decorate(k,h){
  if(options.decorate){options.decorate(k,h);return;}
  const field=BOUND_GROUNDS.find(s=>s.id===site.id);if(!field)return;
  const {plate,material,local}=h,grass=material('#7f8963','grass'),soil=material('#a79a7e','earth'),wood=material('#756b50','wood'),leaf=material('#526343','foliage'),light=material('#6f7b50','foliage');
  plate(field.rings.map(r=>r.map(local)),grass,0,.018);
  // Dry patches remain inside the native grass parcel, away from roads/buildings.
  for(const [i,t] of BOUND_TREES.entries()){if(!boundInside(t.position,field.rings))continue;const [x,z]=local(t.position);k.mesh(new T.CylinderGeometry(.14,.25,t.height,7),wood,x,t.height/2,z);for(let j=0;j<5;j++){const a=i+j*2.4,o=k.mesh(new T.IcosahedronGeometry(1,1),j%2?leaf:light,x+Math.cos(a)*t.radius*.5,t.height-.4+j*.15,z+Math.sin(a)*t.radius*.5);o.scale.set(t.radius*.8,t.radius*.65,t.radius);o.rotation.set(j*.3,i*.7,j*.2);}const patch=k.mesh(new T.CircleGeometry(t.radius*1.5,9),soil,x,.023,z);patch.rotation.x=-Math.PI/2;patch.scale.y=.6;}
 }});
 result.group.userData.airportBound={site:site.id,sourceIds:site.sourceIds,estimatedDimensions:true,privateInteriors:false};return result;
}
