import * as T from './three.module.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
// Open waiting pavement and a freestanding display frame, matching the captured
// stop context. No invented bus shelter, seating row or copied advertising art.
export function createAirportStop(s){
 const group=new T.Group();group.name=s.name;const frame=new T.Group();frame.rotation.y=Math.PI/2-s.heading*Math.PI/180;group.add(frame);
 const mat=(color,kind='stone')=>tagSurface(new T.MeshStandardMaterial({color,roughness:.9}),kind),pave=mat('#969994','paving'),metal=mat('#454e50','metal'),rim=mat('#b3b5ad','metal'),dark=mat('#273d3c','paint');
 const box=(m,w,h,d,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=h>.5;o.receiveShadow=true;frame.add(o);return o;};
 box(pave,12,.045,2.2,0,.03,0);for(let x=-5.8;x<6;x+=.58)box(rim,.012,.003,2.15,x,.055,0);
 box(metal,1.3,.28,.32,.8,.14,.85);box(metal,.12,3.2,.14,.8,1.85,.85);box(rim,1.25,2.3,.18,.8,2.12,.85);box(dark,1.08,2.12,.205,.8,2.12,.85);box(metal,1.43,.18,.35,.8,3.4,.85);
 // Legible in-game wayfinding occupies the reference display frame. It is not a
 // claim that this invented copy is the real-world operator's current sign.
 if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=512;c.height=1024;const ctx=c.getContext('2d');ctx.fillStyle='#173d39';ctx.fillRect(0,0,512,1024);ctx.fillStyle='#e2bd69';ctx.fillRect(28,32,456,12);ctx.textAlign='center';ctx.fillStyle='#f4edda';ctx.font='bold 66px sans-serif';ctx.fillText('AIRPORT',256,250);ctx.fillText(s.id==='airport-first-stop'?'FIRST':'SECOND',256,335);ctx.font='32px sans-serif';ctx.fillText('PUBLIC TRANSPORT',256,450);ctx.font='28px sans-serif';ctx.fillText(s.id==='airport-first-stop'?'Towards Madina':'Central Accra',256,545);ctx.fillText('CHOOSE YOUR',256,750);ctx.fillText('DESTINATION',256,795);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const material=new T.MeshStandardMaterial({map,side:T.DoubleSide,roughness:.7});for(const side of [-1,1]){const plane=new T.Mesh(new T.PlaneGeometry(1.06,2.1),material);plane.position.set(.8,2.12,.85+side*.11);plane.rotation.y=side<0?Math.PI:0;frame.add(plane);}}
 enhanceMaterials(group);batchStaticMeshes(group);group.userData.airportStop={shelter:false,feedStop:s.feedStop,estimatedDimensions:true};return {group};
}
