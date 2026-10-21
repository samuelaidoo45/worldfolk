import * as T from './three.module.js';import {createActor} from './human-character.js';
import {cityEnvironment} from './graphics-materials.js';import {mobileFieldOfView} from './display-settings.js';
import {interiorRenderer,disposeScene} from './render-utils.js';import {createRoomPhysics} from './room-physics.js';
import {buildVillaInterior} from './villa-monticello-interior-model.js';
import {VILLA_AREAS,createVillaVisit} from './villa-monticello-data.js';
export function createVillaMonticelloInterior({avatar,identity,outfit,initialArea='lobby'}){
 const canvas=document.createElement('canvas');canvas.className='interior-canvas';document.body.append(canvas);
 const renderer=interiorRenderer(canvas),scene=new T.Scene(),camera=new T.PerspectiveCamera(60,1,.1,200);scene.environment=cityEnvironment();
 const hemi=new T.HemisphereLight('#e3f1fa','#81715b',1.7),sun=new T.DirectionalLight('#ffecd2',2);sun.position.set(-12,28,26);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-25,right:25,top:30,bottom:-30,far:100});sun.shadow.bias=-.0005;scene.add(hemi,sun);
 const areas=Object.fromEntries(Object.keys(VILLA_AREAS).map(id=>{const m=buildVillaInterior(id);m.physics=createRoomPhysics(m.blockers,m.layout.bounds);scene.add(m.group);return [id,m];}));
 const visit=createVillaVisit(initialArea),actor=createActor(avatar,identity);actor.outfit(outfit);scene.add(actor.group);
 const crowd=[{id:'lobby',x:0,z:-9.3,name:'Reception host'},{id:'lobby',x:5,z:1,name:'Lounge guest',sit:true},{id:'courtyard',x:5,z:10,name:'Courtyard host'},{id:'courtyard',x:8.5,z:-2,name:'Courtyard visitor',sit:true},{id:'courtyard',x:-6,z:-19,name:'Dining guest',sit:true}].map((p,i)=>({...p,actor:createActor(i%2?'👩🏾':'👨🏾','villa-monticello-visitor-'+i)}));crowd.forEach(p=>scene.add(p.actor.group));
 let yaw=0,pitch=0,drag=null,last=0,width=0,height=0,moved=0,poseUntil=0;
 const target=new T.Vector3(),lookAt=new T.Vector3();
 function syncArea(){for(const [id,m] of Object.entries(areas))m.group.visible=id===visit.area;const roof=visit.area==='courtyard';scene.background=new T.Color(roof?'#a7c8d6':'#b8c3c5');hemi.intensity=roof?1.7:1.5;sun.intensity=roof?2.3:1.2;renderer.shadowMap.needsUpdate=true;yaw=0;pitch=0;const [x,z]=visit.position;camera.position.set(x,2.7,z+4);canvas.setAttribute('aria-label',VILLA_AREAS[visit.area].name);}
 syncArea();
 canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('pointerdown',e=>{if(e.button!==2&&e.pointerType!=='touch')return;drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.18;pitch=Math.max(-.45,Math.min(.6,pitch+(e.clientY-drag[1])*.003));drag=[e.clientX,e.clientY];});for(const e of ['pointerup','pointercancel'])canvas.addEventListener(e,()=>drag=null);
 function nearby(){const h=visit.nearby();if(h){if(visit.active||h.kind==='exit'||areas[visit.area].physics.visible(visit.position,[h.x,h.z]))return h;}const [x,z]=visit.position,p=crowd.find(p=>p.id===visit.area&&Math.hypot(x-p.x,z-p.z)<1.8&&areas[visit.area].physics.visible([x,z],[p.x,p.z]));return p?{kind:'local',actionId:'talk',label:'Talk to '+p.name}:null;}
 function interact(id){const h=nearby();if(!h||h.actionId!==id)return;if(id==='talk')return {dialogue:visit.area==='lobby'?'Akwaaba! Talk to reception and follow the courtyard door for dining beside the fountain.':'Welcome! Find a seat or visit the counter for Worldfolk refreshments.'};const result=visit.interact(id);if(result?.area)syncArea();if(result?.active?.target){const [x,z]=visit.position,[tx,tz]=result.active.target,a=Math.atan2(tx-x,z-tz);yaw=a*180/Math.PI;actor.group.rotation.y=-a;}return result;}
 function move(dx,dz){if(visit.active)return;const [x,z]=visit.position,p=areas[visit.area].physics.move([x,z],[dx,dz]);moved+=Math.hypot(p[0]-x,p[1]-z);visit.move(p);if(Math.hypot(dx,dz)>.001)actor.group.rotation.y=Math.atan2(-dx,-dz);}
 function render(t,moving,mode='third'){
  const dt=last?Math.min(.08,t-last):1/60;last=t;if(width!==innerWidth||height!==innerHeight){width=innerWidth;height=innerHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=mobileFieldOfView(60,width,height,matchMedia('(any-pointer: coarse)').matches||navigator.maxTouchPoints>0);camera.updateProjectionMatrix();}
  areas[visit.area].update(t);
  const [x,z]=visit.position,active=visit.active;actor.animate(t,moving&&!active,{speed:moved/Math.max(.001,dt),action:active?.kind||(t<poseUntil?'office':null)});moved=0;
  const seat=active?.seat;actor.group.position.set(seat?.x??x,actor.group.position.y+(active?.kind==='sit'?-.45:0),seat?.z??z);if(seat)actor.group.rotation.y=seat.yaw;
  for(const [i,p] of crowd.entries()){
   p.actor.group.visible=p.id===visit.area;if(!p.actor.group.visible)continue;if(p.walk){const next=areas[p.id].physics.move([p.x,p.z],[0,p.direction*dt*.8]);if(next[1]<-13||next[1]>15||Math.abs(next[1]-p.z)<dt*.1)p.direction*=-1;else[p.x,p.z]=next;}
   p.actor.animate(t+i,!!p.walk,{speed:p.walk?.8:0,action:p.sit?'sit':p.dance?'dance':null});p.actor.group.position.set(p.x,p.actor.group.position.y+(p.sit?-.45:0),p.z);p.actor.group.rotation.y=p.walk?(p.direction>0?Math.PI:0):Math.PI;
  }
  const a=yaw*Math.PI/180,physics=areas[visit.area].physics;let distance=mode==='first'?0:mode==='overview'?6.5:4;
  for(;distance>1;distance-=.2){const cx=x-Math.sin(a)*distance,cz=z+Math.cos(a)*distance;if(physics.clear(cx,cz)&&physics.visible([x,z],[cx,cz]))break;}
  const px=seat?.x??x,pz=seat?.z??z;target.set(px-Math.sin(a)*distance,mode==='first'?1.65:Math.min(visit.area==='courtyard'?4:2.9,2.1+distance*.12+pitch),pz+Math.cos(a)*distance);lookAt.set(px+Math.sin(a)*2,1.25,pz-Math.cos(a)*2);actor.group.visible=mode!=='first';camera.position.lerp(target,1-Math.exp(-dt*10));camera.lookAt(lookAt);renderer.render(scene,camera);
 }
 return {move,nearby,interact,render,look(a,b=0){yaw+=a;pitch=Math.max(-.45,Math.min(.6,pitch+b*.03));},setOutfit(id){actor.outfit(id);},playAction(){poseUntil=last+2;},get bearing(){return yaw;},get position(){return visit.position;},get name(){return VILLA_AREAS[visit.area].name;},get isActing(){return !!visit.active;},get description(){return VILLA_AREAS[visit.area].name+' · E interact · marked doors connect the public areas';},get programme(){return null;},destroy(){disposeScene(scene);renderer.dispose();renderer.forceContextLoss();canvas.remove();}};
}
