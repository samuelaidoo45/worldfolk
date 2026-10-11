import {offsetMetres,damp} from './motion.js';
// Metre-scale follow framing: a low horizon, room ahead and speed-dependent
// pullback. Obstructions pull the camera in immediately; release is damped.
export function chaseCamera({position,heading,physics,driving=false,scenic=false,street=false,cabin=false,speed=0,previousDistance,viewScale=1,dt=1/60}){
 const angle=heading*Math.PI/180,back=[-Math.sin(angle),-Math.cos(angle)];
 const velocity=Math.min(35,Math.abs(speed)),scale=Math.max(1,Math.min(1.35,viewScale));
 const wanted=(cabin?0:scenic?30:street?(driving?9:5.5):driving?13+velocity*.12:9)*scale;
 let clearance=wanted;
 for(let d=.3;d<=wanted+.3;d+=.3){if(physics?.collision(offsetMetres(position,back[0]*Math.min(d,wanted),back[1]*Math.min(d,wanted)),.3)){clearance=Math.max(.3,d-.45);break}}
 const distance=previousDistance===undefined||clearance<previousDistance?clearance:damp(previousDistance,clearance,3.5,dt);
 const ahead=cabin?9:scenic?4:driving?3.5+velocity*.07:1.25;
 const from=offsetMetres(position,back[0]*distance,back[1]*distance),to=offsetMetres(position,-back[0]*ahead,-back[1]*ahead);
 const close=distance<2.5&&!scenic;
 const altitude=cabin?1.65:close?2:scenic?5+distance*.48:street?2.1+distance*.08:driving?3.2+distance*.16:2.7+distance*.15;
 return {from,to,altitude,targetAltitude:cabin?1.6:scenic?1:driving?1.2:1.35,distance};
}
