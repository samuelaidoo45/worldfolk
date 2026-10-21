import {roadHeight} from './road-elevation.js';
import {projectOnSegment,distanceMetres} from './motion.js';
// Keep the whole pedestrian footprint outside every nearby vehicle carriageway,
// including cross streets. Existing road overlaps may move toward safety.
export function roadIntrusion(position,roads,radius=.4){
 let depth=0;
 for(const road of roads){if(road.walkOnly||['path','pedestrian','steps','cycleway'].includes(road.roadClass))continue;
  for(let i=1;i<road.line.length;i++){const a=road.line[i-1],b=road.line[i],q=projectOnSegment(position,a,b),heading=Math.atan2(b[0]-a[0],b[1]-a[1])*180/Math.PI;if(roadHeight(q.position,heading,road.roadId??null)>2.2)continue;depth=Math.max(depth,road.width/2+radius-q.distance);}
 }return depth;
}
export function sidewalkMove(from,to,physics,roads){
 const result=physics.move(from,to,.42),length=distanceMetres(from,result.position),steps=Math.max(1,Math.ceil(length/.25));let previous=roadIntrusion(from,roads);
 for(let i=1;i<=steps;i++){const t=i/steps,p=from.map((v,j)=>v+(result.position[j]-v)*t),next=roadIntrusion(p,roads);
  if(next>1e-5&&(previous<=1e-5||next>=previous-1e-7))return {position:from,blocked:true};previous=next;
 }return result;
}
export function reversePedestrian(npc){npc.direction*=-1;npc.side*=-1;npc.index=Math.max(0,Math.min(npc.line.length-1,npc.index+npc.direction));}
