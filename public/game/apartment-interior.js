import * as T from './three.module.js';
import {createActor} from './world3d.js';
import {cityEnvironment} from './graphics-materials.js';
import {mobileFieldOfView} from './display-settings.js';
import {interiorRenderer,disposeScene} from './render-utils.js';
import {createRoomPhysics} from './room-physics.js';
import {buildApartment} from './apartment-model.js';
import {createApartmentActivity} from './apartment-data.js';

export function createApartmentInterior({kind,avatar,identity,outfit}){
 const model=buildApartment(kind),{layout}=model,physics=createRoomPhysics(model.blockers,model.bounds);
 const canvas=document.createElement('canvas');canvas.className='interior-canvas';canvas.setAttribute('aria-label',layout.name);document.body.append(canvas);
 const renderer=interiorRenderer(canvas),scene=new T.Scene(),camera=new T.PerspectiveCamera(62,1,.08,160);
 scene.background=new T.Color('#bed8e1');scene.environment=cityEnvironment();scene.add(model.group);
 const hemi=new T.HemisphereLight('#e2f2ff','#a28a66',1.5),sun=new T.DirectionalLight('#fff0d7',2.1);sun.position.set(-4,12,layout.back-9);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);Object.assign(sun.shadow.camera,{left:-16,right:16,top:16,bottom:-16,near:1,far:60});sun.shadow.normalBias=.025;sun.shadow.bias=-.0004;scene.add(hemi,sun);
 for(const [x,z] of [[0,0],[-6,-2],[-6,4],[7,4]]){const light=new T.PointLight('#ffe6c1',12,10,2);light.position.set(x,2.95,z);scene.add(light)}
 const actor=createActor(avatar,identity);actor.outfit(outfit);actor.group.traverse(o=>o.castShadow=false);scene.add(actor.group);
 const activity=createApartmentActivity(layout),dropMatrix=new T.Matrix4(),drops=new T.InstancedMesh(new T.SphereGeometry(.012,4,3),new T.MeshBasicMaterial({color:'#b1d9df',transparent:true,opacity:.6}),48);drops.visible=false;scene.add(drops);
 let [x,z]=layout.spawn,yaw=0,pitch=0,last=0,moved=0,width=0,height=0,drag=null;
 const target=new T.Vector3(),look=new T.Vector3();camera.position.set(x,2.2,z+1);
 canvas.addEventListener('contextmenu',e=>e.preventDefault());canvas.addEventListener('pointerdown',e=>{if(e.button!==2&&e.pointerType!=='touch')return;drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!drag)return;yaw-=(e.clientX-drag[0])*.18;pitch=Math.max(-.5,Math.min(.5,pitch+(e.clientY-drag[1])*.003));drag=[e.clientX,e.clientY]});for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,()=>drag=null);
 function nearby(){
  if(activity.active)return activity.prompt();
  if(Math.hypot(x-layout.exit[0],z-layout.exit[1])<1.2)return {kind:'exit',label:'Return to the courtyard'};
  const h=layout.hotspots.filter(h=>Math.hypot(x-h.at[0],z-h.at[1])<1.25&&physics.visible([x,z],h.at)).sort((a,b)=>Math.hypot(x-a.at[0],z-a.at[1])-Math.hypot(x-b.at[0],z-b.at[1]))[0];
  return h?{kind:'local',actionId:h.id,label:h.label}:null;
 }
 function interact(id){const h=nearby();if(!h||h.actionId!==id)return;if(['wake','stand','stop-activity'].includes(id)){activity.stop();actor.group.rotation.set(0,0,0);return}if(id==='wardrobe')return 'wardrobe';activity.start(id)}
 function move(dx,dz){if(activity.active)return;const next=physics.move([x,z],[dx,dz]);moved+=Math.hypot(next[0]-x,next[1]-z);[x,z]=next;if(Math.hypot(dx,dz)>.001)actor.group.rotation.y=Math.atan2(-dx,-dz)}
 function render(t,moving,mode='third'){
  const dt=last?Math.min(.08,t-last):1/60;last=t;
  if(width!==innerWidth||height!==innerHeight){width=innerWidth;height=innerHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.fov=mobileFieldOfView(62,width,height,matchMedia('(any-pointer: coarse)').matches||navigator.maxTouchPoints>0);camera.updateProjectionMatrix()}
  const f=activity.frame(t),spot=activity.spot;actor.animate(t,moving&&!f.active,{speed:moved/Math.max(dt,.001),action:f.active?f.kind:null,blend:f.blend});moved=0;actor.group.position.set(x,actor.group.position.y,z);actor.group.rotation.x=actor.group.rotation.z=0;
  if(f.active&&spot){
   actor.group.position.lerp(new T.Vector3(...spot.pose),f.blend);actor.group.rotation.y=spot.yaw??Math.PI;
   if(f.kind==='sleep')actor.group.rotation.x=-Math.PI/2*f.blend;
   else if(f.kind==='relax'){actor.leftLeg.rotation.x=actor.rightLeg.rotation.x=-Math.PI/2*f.blend;actor.knees.forEach(k=>k.rotation.x=Math.PI/2*f.blend);actor.leftArm.rotation.x=actor.rightArm.rotation.x=-.35*f.blend;}
   else if(!actor.rigged){actor.leftArm.rotation.x=-1.1+Math.sin(t*5)*.2;actor.rightArm.rotation.x=-1.1-Math.sin(t*5)*.2;}
  }
  drops.visible=f.active&&f.kind==='shower';if(drops.visible){const [sx,,sz]=spot.pose;for(let i=0;i<48;i++){dropMatrix.makeTranslation(sx+Math.sin(i*39)*.25,2.1-((t*1.5+i*.11)%2),sz-.4+Math.cos(i*47)*.22);drops.setMatrixAt(i,dropMatrix)}drops.instanceMatrix.needsUpdate=true}
  // Check the entire camera segment, never interpolate a camera through a
  // partition into the adjacent bedroom. Height stays below the ceiling.
  const angle=yaw*Math.PI/180;let distance=mode==='first'?0:mode==='overview'?5.5:3.5;
  for(;distance>.15;distance-=.1){const cx=x-Math.sin(angle)*distance,cz=z+Math.cos(angle)*distance;if(physics.clear(cx,cz)&&physics.visible([x,z],[cx,cz]))break}
  target.set(x-Math.sin(angle)*distance,mode==='first'?1.65:Math.min(2.8,2.05+distance*.1+pitch),z+Math.cos(angle)*distance);
  const next=camera.position.clone().lerp(target,1-Math.exp(-dt*10));if(physics.clear(next.x,next.z)&&physics.visible([x,z],[next.x,next.z]))camera.position.copy(next);else camera.position.copy(target);
  look.set(x+Math.sin(angle)*2,1.35,z-Math.cos(angle)*2);camera.lookAt(look);actor.group.visible=mode!=='first'&&distance>.8;renderer.render(scene,camera);
 }
 renderer.shadowMap.needsUpdate=true;
 return {move,nearby,interact,render,look(a,b=0){yaw+=a;pitch=Math.max(-.5,Math.min(.5,pitch+b*.03))},setOutfit(id){actor.outfit(id)},playAction(){},
  get bearing(){return yaw},get position(){return [x,z]},get name(){return layout.name},get isActing(){return activity.active},get resting(){return activity.resting},
  get description(){return activity.active?activity.resting==='sleep'?'Sleeping · choose Wake up when ready':activity.resting==='relax'?'Seated · choose Stand up when ready':activity.resting==='shower'?'Showering · choose Finish shower when ready':'Cooking · choose Finish cooking when ready':'Bedroom · bathroom · kitchen · lounge · garden terrace'},
  debug:{model,physics},destroy(){disposeScene(scene);renderer.dispose();renderer.forceContextLoss();canvas.remove()}};
}
