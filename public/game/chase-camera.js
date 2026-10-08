import {offsetMetres,damp} from './motion.js';
// Resolve the physical camera position before asking MapLibre for its projection.
// Fixed zoom/pitch values can put the camera inside a roof beside a doorway.
export function chaseCamera({position,heading,physics,driving=false,scenic=false,cabin=false,speed=0,previousDistance,dt=1/60}){
 const angle=heading*Math.PI/180,back=[-Math.sin(angle),-Math.cos(angle)];
 const wanted=cabin?0:scenic?20:driving?6.5+Math.min(3,Math.abs(speed)*.08):5;
 let clearance=wanted;
 for(let d=.4;d<=wanted+.1;d+=.4){if(physics?.collision(offsetMetres(position,back[0]*d,back[1]*d),.28)){clearance=Math.max(.35,d-.45);break}}
 const distance=previousDistance===undefined||clearance<previousDistance?clearance:damp(previousDistance,clearance,4,dt);
 const from=offsetMetres(position,back[0]*distance,back[1]*distance),ahead=cabin?7:scenic?3:driving?3:1.4,to=offsetMetres(position,-back[0]*ahead,-back[1]*ahead);
 const closeView=!driving&&!scenic&&!cabin&&distance<3;
 const altitude=cabin?1.6:closeView?2.15:scenic?2.4+distance*.34:driving?2+distance*.12:1.85+distance*.14;
 return {from,to,altitude,targetAltitude:cabin?.3:closeView?1.55:1.05,distance};
}
