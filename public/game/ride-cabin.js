import {mobileFieldOfView} from './display-settings.js';
import * as THREE from './three.module.js';
import {createActor} from './world3d.js';
// Transparent cabin: the live MapLibre scene remains visible through the windows.
export function createRideCabin(parent){
 const canvas=document.createElement('canvas');canvas.className='ride-cabin-scene';canvas.setAttribute('aria-hidden','true');parent.prepend(canvas);
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(72,1,.05,30);scene.add(new THREE.HemisphereLight(0xeaf6ff,0x514233,2.4));
 const trim=new THREE.MeshStandardMaterial({color:0x344645}),seat=new THREE.MeshStandardMaterial({color:0x806447});
 function box(w,h,d,x,y,z,material=trim){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);scene.add(mesh)}
 box(3.1,.22,5,0,-.12,0);box(3.1,.15,5,0,2.65,0);for(const x of [-1.5,1.5]){box(.13,.8,5,x,.4,0);for(const z of [-2,0,2])box(.09,1.9,.09,x,1.65,z)}box(3,.32,.65,0,.75,-2.1);
 const passengers=[];for(const x of [-.8,.8]){box(.85,.7,.16,x,.7,-.85,seat);box(.85,.18,.7,x,.45,-1.12,seat);const actor=createActor(x<0?'👩🏾':'👨🏾');actor.group.position.set(x,-.35,-1.3);actor.group.rotation.y=Math.PI;scene.add(actor.group);passengers.push(actor)}
 let w=0,h=0;
 return {render(t,view){canvas.hidden=view==='outside';if(canvas.hidden)return;if(w!==innerWidth||h!==innerHeight){w=innerWidth;h=innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.fov=mobileFieldOfView(72,w,h,matchMedia('(any-pointer: coarse)').matches||navigator.maxTouchPoints>0);camera.updateProjectionMatrix()}camera.position.set(0,1.7,1.45);const angle=view==='left'?-Math.PI/2:view==='right'?Math.PI/2:0;camera.lookAt(Math.sin(angle)*5,1.55,1.45-Math.cos(angle)*5);for(const p of passengers)p.animate(t,false);renderer.render(scene,camera)},destroy(){scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose()});renderer.dispose();renderer.forceContextLoss();canvas.remove()}};
}
