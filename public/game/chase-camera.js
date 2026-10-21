import {offsetMetres,damp} from './motion.js';
// Metre-scale follow framing: a low horizon, room ahead and speed-dependent
// pullback. Obstructions pull the camera in immediately; release is damped.
export function chaseCamera({position,heading,physics,driving=false,scenic=false,street=false,cabin=false,speed=0,previousDistance,viewScale=1,dt=1/60}){
 const angle=heading*Math.PI/180,back=[-Math.sin(angle),-Math.cos(angle)];
 const velocity=Math.min(35,Math.abs(speed)),scale=Math.max(1,Math.min(1.35,viewScale));
 // Keep an adult readable in the lower centre of the frame. Overview remains
 // available, but ordinary play should not look like a distant map camera.
 const wanted=(cabin?0:scenic?17:street?(driving?9:4.8):driving?10+velocity*.10:6.8)*scale;
 const targetAltitude=cabin?1.6:scenic?1.5:driving?1.25:1.15;
 const heightAt=d=>cabin?1.65:scenic?3+d*.32:street?1.85+d*.09:driving?2.4+d*.14:2.25+d*.12;
 const blocked=d=>physics?.collision(offsetMetres(position,back[0]*d,back[1]*d),.3,targetAltitude+(heightAt(wanted)-targetAltitude)*d/Math.max(.001,wanted));
 let clearance=wanted,safeLimit=wanted;
 for(let d=.3;d<=wanted+.3;d+=.3){const sample=Math.min(d,wanted);if(blocked(sample)){let lo=Math.max(0,sample-.3),hi=sample;for(let i=0;i<6;i++){const mid=(lo+hi)/2;if(blocked(mid))hi=mid;else lo=mid;}clearance=Math.max(.3,lo-.45);safeLimit=Math.max(.3,lo-.12);break}}
 const distance=previousDistance===undefined?clearance:Math.min(safeLimit,damp(previousDistance,clearance,clearance<previousDistance?16:3.5,dt));
 const ahead=cabin?9:scenic?3:driving?3+velocity*.05:1.2;
 const from=offsetMetres(position,back[0]*distance,back[1]*distance),to=offsetMetres(position,-back[0]*ahead,-back[1]*ahead);
 // Blend close-camera height continuously instead of jumping at 2.5 metres.
 const blend=Math.max(0,Math.min(1,(distance-1.5)/2)),smooth=blend*blend*(3-2*blend);
 const altitude=cabin?1.65:scenic?heightAt(distance):1.9+(heightAt(distance)-1.9)*smooth;
 return {from,to,altitude,targetAltitude,distance};
}
