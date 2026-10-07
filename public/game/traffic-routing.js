import {distanceMetres,bearingTo,offsetMetres,projectOnSegment} from './motion.js';
export const angleDifference=(a,b)=>Math.abs(((a-b+540)%360)-180);
// Forward corridor plus braking distance: cars in the opposite lane do not stop us.
export function trafficSpeed(position,heading,speed,maximum,actors,id=''){
 let allowed=maximum;
 for(const other of actors){if(other.id===id)continue;const d=distanceMetres(position,other.position),a=(bearingTo(position,other.position)-heading)*Math.PI/180,forward=d*Math.cos(a),side=Math.abs(d*Math.sin(a));
  const clearance=other.driving?5.5:3;
  if(forward<=0||side>(other.driving?2.15:1.5)||forward>Math.max(16,speed*2+12))continue;
  const gap=Math.max(0,forward-clearance),following=other.driving&&angleDifference(heading,other.heading)<45?Math.max(0,other.speed||0):0;
  allowed=Math.min(allowed,Math.sqrt(following*following+2*3*gap),gap<.4?0:gap/1.1);
 }
 return Math.max(0,allowed);
}
// Connect to real road vertices, including a T junction that meets another line mid-segment.
export function roadContinuation(npc,roads){
 const endpoint=npc.line[npc.index],candidates=[];
 for(const road of roads){if(road.walkOnly||road.layer!==(npc.layer||0))continue;
  for(let i=0;i<road.line.length-1;i++){
   const projection=projectOnSegment(endpoint,road.line[i],road.line[i+1]);if(projection.distance>2)continue;
   for(const direction of [1,-1]){if(road.oneway===1&&direction<0||road.oneway===-1&&direction>0)continue;
    const index=direction===1?i+1:i,target=road.line[index];if(distanceMetres(endpoint,target)<2)continue;
    const heading=bearingTo(endpoint,target),turn=angleDifference(npc.heading,heading);if(turn>130)continue;
    const key=`${target.join(',')}:${direction}`;if(candidates.some(c=>c.key===key))continue;
    candidates.push({key,...road,index,direction,turn});
   }
  }
 }
 candidates.sort((a,b)=>a.turn-b.turn);
 // Stable variation at intersections without reversing or changing lanes at random.
 return candidates.length?{...candidates[(Number(npc.id.replace(/\D/g,''))+ (npc.turns||0))%candidates.length],choices:candidates.length}:null;
}
export function vehiclesOverlap(a,heading,b,otherHeading=heading){
 const delta=distanceMetres(a,b),angle=bearingTo(a,b)*Math.PI/180,x=delta*Math.sin(angle),y=delta*Math.cos(angle);
 // Separating axes for two car-sized footprints. Adjacent lanes stay independent.
 for(const axis of [heading,heading+90,otherHeading,otherHeading+90]){const r=axis*Math.PI/180,project=Math.abs(x*Math.sin(r)+y*Math.cos(r)),extent=h=>2.35*Math.abs(Math.cos((h-axis)*Math.PI/180))+1.05*Math.abs(Math.sin((h-axis)*Math.PI/180));if(project>=extent(heading)+extent(otherHeading))return false}
 return true;
}
export function makeRoadPath(coordinates,lane=0){
 const normals=coordinates.map((p,i)=>{const before=bearingTo(coordinates[Math.max(0,i-1)],p),after=bearingTo(p,coordinates[Math.min(coordinates.length-1,i+1)]),a=(i===0?after:before)*Math.PI/180,b=(i===coordinates.length-1?before:after)*Math.PI/180,x=Math.cos(a)+Math.cos(b),y=-Math.sin(a)-Math.sin(b),length=Math.hypot(x,y)||1;return [x/length,y/length]});
 const lengths=coordinates.slice(1).map((p,i)=>distanceMetres(coordinates[i],p)),total=lengths.reduce((a,b)=>a+b,0);
 function at(distance,offset=lane){let left=Math.max(0,Math.min(total,distance));for(let i=0;i<lengths.length;i++){if(left<=lengths[i]||i===lengths.length-1){const t=lengths[i]?left/lengths[i]:0,a=coordinates[i],b=coordinates[i+1],base=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],normal=[normals[i][0]*(1-t)+normals[i+1][0]*t,normals[i][1]*(1-t)+normals[i+1][1]*t];return {position:offsetMetres(base,normal[0]*offset,normal[1]*offset),heading:bearingTo(a,b),segment:i,remaining:lengths[i]-left}}left-=lengths[i]}return {position:coordinates[0],heading:0,segment:0,remaining:0}}
 return {total,at,get lane(){return lane},set lane(value){lane=value}};
}
// Never sweep a diagonal across a corner, even after a slow frame.
export function advanceRoad(path,distance,speed,dt,physics,actors=[],kind='bus'){
 let current=path.at(distance),allowed=trafficSpeed(current.position,current.heading,speed,22,actors),ahead=path.at(distance+Math.max(8,speed*2));
 if(angleDifference(current.heading,ahead.heading)>25)allowed=Math.min(allowed,4);
 let nextSpeed=Math.max(0,speed+Math.max(-6*dt,Math.min(3.2*dt,allowed-speed))),left=nextSpeed*dt,blocked=false;
 while(left>1e-7&&distance<path.total){current=path.at(distance);const step=Math.min(left,.25,current.remaining>1e-6?current.remaining+.000001:.25,path.total-distance),next=path.at(distance+step);
  if(physics&&physics.moveVehicle(current.position,next.position,next.heading,kind).blocked){
   // Narrow streets sometimes have a footprint close to the lane edge. Ease inward,
   // checking the complete lateral movement; never jump through the obstruction.
   const lane=Math.max(0,path.lane-.08),inward=path.at(distance,lane);
   if(lane<path.lane&&!physics.moveVehicle(current.position,inward.position,current.heading,kind).blocked&&!actors.some(a=>a.driving&&vehiclesOverlap(inward.position,current.heading,a.position,a.heading)))path.lane=lane;
   blocked=true;nextSpeed=0;break;
  }
  if(actors.some(a=>a.driving&&vehiclesOverlap(next.position,next.heading,a.position,a.heading)&&distanceMetres(next.position,a.position)<distanceMetres(current.position,a.position))){blocked=true;nextSpeed=0;break}
  distance+=step;left-=step;
 }
 return {distance,speed:nextSpeed,blocked, ...path.at(distance)};
}

// A stopped driver searches for a clear lane beside the obstruction. Every small
// movement is swept against buildings and cars, so recovery cannot tunnel through them.
export function recoverTraffic(npc,dt,physics,actors){
 const heading=npc.roadHeading??npc.heading,r=heading*Math.PI/180,side=npc.side||0;
 const limit=Math.max(1.2,(npc.width||7)/2-1.05);
 const offsets=[npc.recoverySide??(npc.retired?limit+2.4:side>=0?-limit:limit)];
 for(const goal of offsets){
  const change=goal-side;if(Math.abs(change)<.12)continue;
  const step=Math.sign(change)*Math.min(Math.abs(change),dt*1.2);
  const target=offsetMetres(npc.position,Math.cos(r)*step,-Math.sin(r)*step);
  const resolved=physics.moveVehicle(npc.position,target,heading);
  if(resolved.blocked||distanceMetres(npc.position,resolved.position)<.001)continue;
  if(actors.some(a=>a.id!==npc.id&&(a.driving?vehiclesOverlap(resolved.position,heading,a.position,a.heading):distanceMetres(resolved.position,a.position)<1.7)))continue;
  return {position:resolved.position,side:side+step,goal};
 }
 return null;
}
