import * as T from './three.module.js';
import {stopStructures,stopModules,stopTaxiBays} from './mall-bus-stops-data.js';
import {createCar} from './vehicle-models.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface} from './graphics-materials.js';
export function createMallBusStop(stop){
 const group=new T.Group();group.name=stop.name+' · covered waiting row';
 const frame=new T.Group();frame.rotation.y=Math.PI-stop.heading*Math.PI/180;group.add(frame);
 const mat=(color,kind='stone',extra={})=>tagSurface(new T.MeshStandardMaterial({color,roughness:.85,...extra}),kind);
 const paving=mat('#a4a39b'),joint=mat('#777b76'),steel=mat(stop.variant==='opposite'?'#174b72':stop.variant==='mall'?'#bc9b4b':'#536661','metal',{metalness:.5,roughness:.5}),roof=mat('#92958a','metal',{metalness:.35,roughness:.66}),seat=mat('#555f52','metal',{metalness:.3}),board=mat('#234440'),yellow=mat('#d9ba66'),soil=mat('#8a8270','soil'),grass=mat('#748355','foliage'),dark=mat('#293332','metal'),cream=mat('#d7d7c7');
 const box=(material,w,h,d,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),material);m.position.set(x,y,z);m.castShadow=y>.2;m.receiveShadow=true;frame.add(m);return m};
 const multi=stop.variant!=='spanner',w=stop.shelterWidth,apronWidth=w+4;
 // Flush walking surface and a low visual edge; all approaches remain step-free.
 box(paving,apronWidth,.035,5.2,0,.028,1);
 box(soil,apronWidth+1,.018,3.2,0,.017,5.2);
 for(let x=-apronWidth/2+.1;x<apronWidth/2;x+=.6)box(joint,.012,.003,5.1,x,.048,1);
 for(let z=-1.4;z<3.6;z+=.6)box(joint,apronWidth-.1,.003,.012,0,.048,z);
 box(joint,apronWidth,.09,.16,0,.045,3.6);
 // Alternating diagonal ceramic faces visible beneath the bench row in both photos.
 for(let x=-w/2;x<w/2;x+=.34){const tile=box(Math.round((x+w/2)/.34)%2?cream:dark,.31,.15,.035,x,.11,3.69);tile.rotation.z=Math.PI/4;}
 for(const s of stopStructures(stop)){
  if(s.kind==='post'||s.kind==='pole'||s.kind==='billboard-post')box(steel,s.w,s.h,s.d,s.x,s.h/2,s.z);
  if(s.kind==='back'){box(steel,s.w,2.15,.09,s.x,1.27,s.z);box(board,s.w-.16,1.94,.025,s.x,1.28,s.z+.06);}
  if(s.kind==='bench'){
   for(let z=-.35;z<=.051;z+=.1)box(seat,s.w,.055,.075,s.x,.47,z);
   box(seat,s.w,.34,.055,s.x,.77,-.38);
   for(const x of [s.x-s.w/2+.25,s.x+s.w/2-.25])box(steel,.07,.44,.44,x,.22,-.15);
  }
  if(s.kind==='chairs')for(let x=s.x-s.w/2+.3;x<s.x+s.w/2;x+=.62){box(seat,.52,.065,.5,x,.47,s.z);box(seat,.52,.4,.06,x,.73,s.z-.26);for(const dx of [-.2,.2])for(const dz of [-.19,.19])box(steel,.035,.45,.035,x+dx,.225,s.z+dz);}
  if(s.kind==='kiosk'){box(mat('#689b7a','metal'),s.w,s.h,s.d,s.x,s.h/2,s.z);for(const dx of [-.75,.75])box(steel,.055,2.15,.055,s.x+dx,1.075,s.z-.6);box(roof,2.2,.08,2,s.x,2.2,s.z);box(steel,1.8,.06,1.6,s.x,1.22,s.z);}
 }
 function sign(text,width,height,x,y,z,bg='#234440',fg='#eee7cb'){
  if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=1024;c.height=192;const ctx=c.getContext('2d');if(!ctx)return;ctx.fillStyle=bg;ctx.fillRect(0,0,1024,192);ctx.fillStyle=fg;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='bold 70px sans-serif';ctx.fillText(text,512,98,970);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const m=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshStandardMaterial({map:texture,roughness:.8,side:T.DoubleSide}));m.position.set(x,y,z);frame.add(m);
 }
 for(const [i,m] of stopModules(stop).entries()){
  const fasciaHeight=multi?.94:.42,top=multi?3.42:2.83;
  box(roof,m.w+.26,.07,2.3,m.x,top,0);
  for(let x=m.x-m.w/2;x<m.x+m.w/2;x+=.22)box(roof,.025,.025,2.3,x,top+.046,0);
  box(cream,m.w+.3,fasciaHeight,.12,m.x,top-fasciaHeight/2,.99);
  for(const dx of [-m.w/2,m.w/2])box(steel,.07,.12,2.2,m.x+dx,2.62,0);
  sign(multi?(i===1?'WORLDFOLK · ACCRA':'WAIT · MEET · TRAVEL'):stop.name.toUpperCase(),m.w-.14,fasciaHeight-.1,m.x,top-fasciaHeight/2,1.06,i%2?'#445d53':'#234440');
  sign(stop.variant==='opposite'?'ACCRA MALL · OPPOSITE SIDE':'ACCRA MALL · WAITING AREA',m.w-.35,.44,m.x,1.4,-.81);
 }
 if(stop.variant==='opposite'){
  // One verified kiosk and the billboard's open rear truss, not scattered stalls.
  box(grass,w+8,.025,5.2,0,.006,-5.1);
  box(dark,10.8,2.1,.09,0,5.65,-3.25);
  for(let x=-5.4;x<=5.4;x+=.9){box(roof,.035,2.2,.06,x,5.65,-3.16);const brace=box(roof,.035,2.25,.04,x,5.65,-3.1);brace.rotation.z=.35;}
  for(const y of [4.6,5.3,6,6.7])box(roof,10.9,.035,.06,0,y,-3.15);
  // Grille detail at the middle advertising frontage (no invented shop interior).
  for(let x=-3.8;x<-1.4;x+=.2)for(const turn of [-.45,.45]){const grille=box(cream,.018,1.25,.035,x,1.62,-.77);grille.rotation.z=turn;}
 }
 const poleX=w/2+1;box(yellow,.6,.72,.06,poleX,2.72,.82);sign('BUS',.54,.22,poleX,2.82,.86,'#d9ba66','#193d38');sign('STOP',.54,.22,poleX,2.56,.86,'#d9ba66','#193d38');
 // Neutral game information replaces historical ad campaigns; ads require approval.
 batchStaticMeshes(group);
 const taxis=stopTaxiBays(stop).map((bay,i)=>{const model=createCar(i===1?0x404847:0x19201f,'hatchback',{taxiLivery:true});model.group.name=stop.name+' · waiting taxi';model.group.position.set(bay.x,0,bay.z);model.group.rotation.y=-Math.PI/2;frame.add(model.group);return model;});
 group.userData.busStop={osmNode:stop.osmNode,variant:stop.variant,reference:stop.reference,estimatedDimensions:true,modules:stopModules(stop).length,parkedTaxis:taxis.length};
 return {group,update(t,position,context={}){for(const model of taxis)model.animateVehicle?.({distance:0,preset:context.preset||'day'},0);}};
}
