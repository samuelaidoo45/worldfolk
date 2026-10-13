import * as T from './three.module.js';
import {createActor} from './world3d.js';
import {cityEnvironment} from './graphics-materials.js';
import {mobileFieldOfView} from './display-settings.js';
import {interiorRenderer,disposeScene} from './render-utils.js';
import {createRoomPhysics} from './room-physics.js';
import {buildMallInterior} from './accra-mall-interior-model.js';
import {MALL_SHOPS,MALL_CAST,mallActivityState} from './accra-mall-data.js';

export function createAccraMallInterior({avatar,identity,outfit}){
 const canvas=document.createElement('canvas');canvas.className='interior-canvas';canvas.setAttribute('aria-label','Accra Mall · concourses and open food court');document.body.append(canvas);
 const renderer=interiorRenderer(canvas),scene=new T.Scene(),camera=new T.PerspectiveCamera(62,1,.1,180);scene.environment=cityEnvironment();
 const hemi=new T.HemisphereLight(0xe3f2ff,0x786b54,1.7),sun=new T.DirectionalLight(0xffead1,2.3);sun.position.set(16,40,28);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-40,right:40,top:45,bottom:-45,far:120});sun.shadow.bias=-.0006;sun.shadow.normalBias=.035;scene.add(hemi,sun);
 const floors=[buildMallInterior(),buildMallInterior(true)];floors.forEach(f=>{f.physics=createRoomPhysics(f.blockers,f.layout.bounds);scene.add(f.group)});
 const actor=createActor(avatar,identity);actor.outfit(outfit);scene.add(actor.group);
 const people=MALL_CAST.map((p,i)=>({...p,floor:0,actor:createActor(i%2?'👨🏾':'👩🏾','mall-staff-'+i)}));
 // Each walker stays in a clear concourse lane; shared room collision tests
 // prevent crowd motion from cutting across shop glass, counters or tables.
 for(let i=0;i<6;i++)people.push({name:'Shopper',floor:0,x:i%2?15:-15,z:-24+i*9,walk:true,direction:i%2?1:-1,actor:createActor(i%2?'👩🏽':'👨🏾','mall-shopper-'+i)});
 for(let i=0;i<4;i++)people.push({name:'Cinema guest',floor:1,x:i%2?4.8:-4.8,z:-3.8+Math.floor(i/2)*5.2,sit:true,actor:createActor(i%2?'👩🏾':'👨🏽','mall-cinema-'+i)});
 people.forEach(p=>{scene.add(p.actor.group);p.actor.group.traverse(o=>o.castShadow=false)});actor.group.traverse(o=>o.castShadow=false);
 let floor=0,[x,z]=floors[0].layout.spawn,yaw=0,pitch=0,last=0,width=0,height=0,moved=0,ticket=false,seat=null,drag=null;
 const activity=mallActivityState(),target=new T.Vector3(),look=new T.Vector3();
 const film=document.createElement('canvas');film.width=768;film.height=384;const ctx=film.getContext('2d'),filmTexture=new T.CanvasTexture(film);filmTexture.colorSpace=T.SRGBColorSpace;floors[1].screen.material.map=filmTexture;let lastFilm=-1;
 function switchFloor(next){floor=next;[x,z]=floors[floor].layout.spawn;activity.stop();seat=null;yaw=0;pitch=0;floors.forEach((f,i)=>f.group.visible=i===floor);scene.background=new T.Color(floor?'#151c2a':'#b5d3de');hemi.intensity=floor?.55:1.7;sun.intensity=floor?.18:2.3;renderer.shadowMap.needsUpdate=true;camera.position.set(x,3,z+5);canvas.setAttribute('aria-label',floor?'Accra Mall · Silverbird cinema interpretation':'Accra Mall · concourses and open food court')}
 switchFloor(0);
 canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('pointerdown',e=>{if(e.button!==2&&e.pointerType!=='touch')return;drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.18;pitch=Math.max(-.6,Math.min(1.1,pitch+(e.clientY-drag[1])*.003));drag=[e.clientX,e.clientY]});for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,()=>drag=null);
 function nearby(){
  if(activity.resting)return {kind:'local',actionId:'stand',label:activity.resting==='watch'?'Leave your seat':'Stand up'};
  const f=floors[floor];if(!floor&&Math.hypot(x-f.layout.exit[0],z-f.layout.exit[1])<2)return {kind:'exit',label:'Leave Accra Mall'};
  const h=f.hotspots.filter(h=>Math.hypot(x-h.x,z-h.z)<2&&f.physics.visible([x,z],[h.x,h.z])).sort((a,b)=>Math.hypot(x-a.x,z-a.z)-Math.hypot(x-b.x,z-b.z))[0];if(h)return {kind:'local',...h};
  const p=people.find(p=>p.floor===floor&&Math.hypot(x-p.x,z-p.z)<2&&f.physics.visible([x,z],[p.x,p.z]));return p?{kind:'local',actionId:'talk',label:'Talk to '+p.name}:null;
 }
 function interact(id){
  // Only expose the action actually in reach; UI shortcuts cannot activate a
  // remote counter or carry a sit pose through a floor change.
  const h=nearby();if(!h||h.actionId!==id)return;
  if(id==='stand'){activity.stop();seat=null;return}
  if(id==='upstairs'){switchFloor(1);return}
  if(id==='downstairs'){switchFloor(0);x=0;z=-32;camera.position.set(x,3,z+5);return}
  if(id==='directory')return {dialogue:'Accra Mall · Ground level: Woodin, Melcom, Compu-Ghana, Ashfoam, Shoprite and Decathlon. Food court in the middle; cinema upstairs at the far end. Guest services offers retail work. This is a compressed game reconstruction of the mall.'};
  if(id==='talk'){const p=people.find(p=>p.floor===floor&&Math.hypot(x-p.x,z-p.z)<2);return {dialogue:p?.dialogue||(floor?'Cinema guest · This is an original Worldfolk short, not a commercial film. Choose a seat and stay as long as you like.':'Shopper · Akwaaba! I’m browsing the shops before meeting friends in the food court.')}}
  if(id==='food')return {panel:'shops',context:{kinds:['food'],title:'Accra Mall · Food court'}};
  if(id.startsWith('shop:')){const shop=MALL_SHOPS.find(s=>s.id===id.slice(5));return {panel:'shops',context:{kinds:shop.goods,title:shop.name}}}
  if(id==='work')return {panel:'work',context:{jobId:'retail'}};
  if(id==='watch'&&!ticket)return {panel:'leisure',context:{experienceId:'mall-cinema'}};
  if(id==='watch'){activity.start('watch');seat={x:2.7,z:9.2,yaw:0};return}
  if(id==='sit'){activity.start('sit');seat=h.seat;return}
 }
 function move(dx,dz){if(activity.resting)return;const p=floors[floor].physics.move([x,z],[dx,dz]);moved+=Math.hypot(p[0]-x,p[1]-z);[x,z]=p;if(Math.hypot(dx,dz)>.001)actor.group.rotation.y=Math.atan2(-dx,-dz)}
 function sitting(a,s){a.group.position.set(s.x,-.3,s.z);a.group.rotation.y=s.yaw||0;a.leftLeg.rotation.x=a.rightLeg.rotation.x=-Math.PI/2;a.knees.forEach(k=>k.rotation.x=Math.PI/2);a.leftArm.rotation.x=a.rightArm.rotation.x=-.35}
 function drawFilm(t){
  if(Math.floor(t*5)===lastFilm)return;lastFilm=Math.floor(t*5);ctx.fillStyle='#87bed0';ctx.fillRect(0,0,768,384);ctx.fillStyle='#f2d694';ctx.beginPath();ctx.arc(630,66,31,0,Math.PI*2);ctx.fill();ctx.fillStyle='#397f89';ctx.fillRect(0,222,768,162);ctx.fillStyle='#d5c2a2';ctx.fillRect(0,214,768,34);
  const pan=(t*12)%900;for(let i=0;i<13;i++){const xx=(i*85-pan+1800)%1100-170,hh=35+(i*31)%92;ctx.fillStyle=i%2?'#dbc59e':'#b8b7a6';ctx.fillRect(xx,214-hh,62,hh);ctx.fillStyle='#425961';for(let yy=224-hh;yy<202;yy+=17)for(let dx=8;dx<57;dx+=16)ctx.fillRect(xx+dx,yy,8,9)}
  ctx.fillStyle='#1a3439';ctx.fillRect(0,310,768,74);ctx.fillStyle='#fff0c7';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText('ACCRA IN MOTION',384,343);ctx.font='16px sans-serif';ctx.fillText('An original Worldfolk animated short · fictional scene',384,370);filmTexture.needsUpdate=true;
 }
 function render(t,moving,mode='third'){
  const dt=last?Math.min(.08,t-last):1/60;last=t;
  if(width!==innerWidth||height!==innerHeight){width=innerWidth;height=innerHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=mobileFieldOfView(62,width,height,matchMedia('(any-pointer: coarse)').matches||navigator.maxTouchPoints>0);camera.updateProjectionMatrix()}
  actor.animate(t,moving&&!activity.resting,{speed:moved/Math.max(.001,dt)});moved=0;actor.group.position.set(x,actor.group.position.y,z);if(seat)sitting(actor,seat);
  for(const [i,p] of people.entries()){
   p.actor.group.visible=p.floor===floor;if(p.floor!==floor)continue;
   if(p.walk){const next=floors[0].physics.move([p.x,p.z],[0,p.direction*dt*.9]);if(next[1]<-28||next[1]>28||Math.abs(next[1]-p.z)<dt*.1)p.direction*=-1;else[p.x,p.z]=next}
   p.actor.animate(t+i,p.walk,{speed:p.walk?.9:0});p.actor.group.position.set(p.x,p.actor.group.position.y,p.z);p.actor.group.rotation.y=p.walk?(p.direction>0?Math.PI:0):Math.PI;if(p.sit)sitting(p.actor,{x:p.x,z:p.z,yaw:0});
  }
  if(floor)drawFilm(t);
  const a=yaw*Math.PI/180,f=floors[floor];let distance=mode==='first'?0:mode==='overview'?9:5;
  for(;distance>1;distance-=.25){const cx=x-Math.sin(a)*distance,cz=z+Math.cos(a)*distance;if(f.physics.clear(cx,cz)&&f.physics.visible([x,z],[cx,cz]))break}
  if(activity.resting==='watch'){target.set(seat.x,1.5,seat.z+.2);look.set(0,4,-16);actor.group.visible=false}
  else {const px=seat?.x??x,pz=seat?.z??z;target.set(px-Math.sin(a)*distance,mode==='first'?1.65:Math.min(4.6,2+distance*.18)+pitch,pz+Math.cos(a)*distance);look.set(px+Math.sin(a)*2,1.25,pz-Math.cos(a)*2);actor.group.visible=mode!=='first'}
  camera.position.lerp(target,1-Math.exp(-dt*9));camera.lookAt(look);renderer.render(scene,camera);
 }
 return {move,nearby,interact,render,look(a,b=0){yaw+=a;pitch=Math.max(-.6,Math.min(1.1,pitch+b*.03))},setOutfit(id){actor.outfit(id)},
  playAction(id){if(id==='cinema'){ticket=true;switchFloor(1);x=0;z=12;activity.start('watch');seat={x:2.7,z:9.2,yaw:0}}},
  get bearing(){return yaw},get position(){return [x,z]},get name(){return floor?'Accra Mall · Cinema':'Accra Mall'},get isActing(){return false},description:'Shops · food court · cinema · retail work',
  debug:{floors},destroy(){disposeScene(scene);renderer.dispose();renderer.forceContextLoss();canvas.remove()}};
}
