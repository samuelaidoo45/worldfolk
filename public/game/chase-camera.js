import {offsetMetres,damp} from './motion.js';
// Resolve the physical camera position before asking MapLibre for its projection.
// Fixed zoom/pitch values can put the camera inside a roof beside a doorway.
export function chaseCamera({position,heading,physics,driving=false,scenic=false,street=false,cabin=false,speed=0,previousDistance,viewScale=1,dt=1/60}){
 const angle=heading*Math.PI/180,back=[-Math.sin(angle),-Math.cos(angle)];
 const wanted=(cabin?0:scenic?34:street?(driving?11:8):driving?16+Math.min(5,Math.abs(speed)*.1):13)*Math.max(1,Math.min(1.55,viewScale));
 let clearance=wanted;
 for(let d=.4;d<=wanted+.1;d+=.4){if(physics?.collision(offsetMetres(position,back[0]*d,back[1]*d),.28)){clearance=Math.max(.35,d-.45);break}}
 const distance=previousDistance===undefined||clearance<previousDistance?clearance:damp(previousDistance,clearance,4,dt);
 const from=offsetMetres(position,back[0]*distance,back[1]*distance),ahead=cabin?7:scenic?3:driving?3:1.4,to=offsetMetres(position,-back[0]*ahead,-back[1]*ahead);
 const closeView=!driving&&!scenic&&!cabin&&distance<3;
 const altitude=cabin?1.6:closeView?2.15:scenic?4+distance*.38:street?2.3+distance*.08:driving?3+distance*.22:2.6+distance*.24;
 return {from,to,altitude,targetAltitude:cabin?1.55:closeView?1.55:1.05,distance};
}
