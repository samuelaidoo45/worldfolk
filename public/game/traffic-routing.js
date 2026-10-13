import {vehicleSpec} from './vehicle-catalog.js';
import {driveWithContacts,bodyContact} from './vehicle-contacts.js';
import {distanceMetres,bearingTo,offsetMetres,projectOnSegment} from './motion.js';
export const angleDifference=(a,b)=>Math.abs(((a-b+540)%360)-180);
// Forward corridor plus braking distance: cars in the opposite lane do not stop us.
export function trafficSpeed(position,heading,speed,maximum,actors,id=''){
 let allowed=maximum;
 for(const other of actors){if(other.id===id)continue;const d=distanceMetres(position,other.position),a=(bearingTo(position,other.position)-heading)*Math.PI/180,forward=d*Math.cos(a),side=Math.abs(d*Math.sin(a));
  const clearance=other.driving?(Math.max(6,vehicleSpec(other.vehicle).length/2+4)):3;
  if(forward<=0||side>(other.driving?2.15:1.5)||forward>Math.max(16,speed*2+12))continue;
  const gap=Math.max(0,forward-clearance),following=other.driving&&angleDifference(heading,other.heading)<45?Math.max(0,other.speed||0):0;
  allowed=Math.min(allowed,Math.sqrt(following*following+2*3*gap),gap<.4?0:gap/1.1);
 }
 return Math.max(0,allowed);
}
// Connect to real road vertices, including a T junction that meets another line mid-segment.
export function roadContinuation(npc,roads){
 const endpoint=npc.line[npc.index],candidates=[];
 for(const road of roads){if(road.walkOnly||road.layer!==(npc.layer||0)||(['bicycle','tricycle'].includes(npc.vehicle)&&road.highway)||(['truck','minibus','bus'].includes(npc.vehicle)&&road.width<8))continue;
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
export function vehiclesOverlap(a,heading,b,otherHeading=heading,kind='car',otherKind='car'){
 return !!bodyContact({position:a,heading,driving:true,vehicle:kind},{position:b,heading:otherHeading,driving:true,vehicle:otherKind});
}
export function makeRoadPath(coordinates,lane=0){
 const normals=coordinates.map((p,i)=>{const before=bearingTo(coordinates[Math.max(0,i-1)],p),after=bearingTo(p,coordinates[Math.min(coordinates.length-1,i+1)]),a=(i===0?after:before)*Math.PI/180,b=(i===coordinates.length-1?before:after)*Math.PI/180,x=Math.cos(a)+Math.cos(b),y=-Math.sin(a)-Math.sin(b),length=Math.hypot(x,y)||1;return [x/length,y/length]});
 const lengths=coordinates.slice(1).map((p,i)=>distanceMetres(coordinates[i],p)),total=lengths.reduce((a,b)=>a+b,0);
 function at(distance,offset=lane){let left=Math.max(0,Math.min(total,distance));for(let i=0;i<lengths.length;i++){if(left<=lengths[i]||i===lengths.length-1){const t=lengths[i]?left/lengths[i]:0,a=coordinates[i],b=coordinates[i+1],base=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],normal=[normals[i][0]*(1-t)+normals[i+1][0]*t,normals[i][1]*(1-t)+normals[i+1][1]*t];return {position:offsetMetres(base,normal[0]*offset,normal[1]*offset),heading:bearingTo(a,b),segment:i,remaining:lengths[i]-left}}left-=lengths[i]}return {position:coordinates[0],heading:0,segment:0,remaining:0}}
 return {total,at,get lane(){return lane},set lane(value){lane=value}};
}
// Never sweep a diagonal across a corner, even after a slow frame.
export function advanceRoad(path,distance,speed,dt,physics,actors=[],kind='bus',speedLimit=Infinity,recovery=null){
 let current=path.at(distance),allowed=Math.min(speedLimit,trafficSpeed(current.position,current.heading,speed,22,actors)),ahead=path.at(distance+Math.max(8,speed*2));
 path.waiting=recovery&&speed<.4&&allowed<.4&&speedLimit>0?(path.waiting||0)+dt:(speedLimit<=0?0:Math.max(0,(path.waiting||0)-dt*.05));
 if(recovery&&path.waiting>2)allowed=Math.min(speedLimit,2.4);
 if(angleDifference(current.heading,ahead.heading)>25)allowed=Math.min(allowed,4);
 let nextSpeed=Math.max(0,speed+Math.max(-6*dt,Math.min(3.2*dt,allowed-speed))),left=nextSpeed*dt,blocked=false;
 while(left>1e-7&&distance<path.total){current=path.at(distance);const step=Math.min(left,.25,current.remaining>1e-6?current.remaining+.000001:.25,path.total-distance),next=path.at(distance+step);
  if(physics&&physics.moveVehicle(current.position,next.position,next.heading,kind).blocked){
   // Narrow streets sometimes have a footprint close to the lane edge. Ease inward,
   // checking the complete lateral movement; never jump through the obstruction.
   const lane=Math.max(0,path.lane-.08),inward=path.at(distance,lane);
   if(lane<path.lane&&!physics.moveVehicle(current.position,inward.position,current.heading,kind).blocked&&!actors.some(a=>a.driving&&vehiclesOverlap(inward.position,current.heading,a.position,a.heading,kind,a.vehicle)))path.lane=lane;
   blocked=true;nextSpeed=0;break;
  }
  if(recovery){const r=next.heading*Math.PI/180,contact=driveWithContacts(current.position,next.position,{driving:true,vehicle:kind,heading:next.heading},[Math.sin(r)*nextSpeed,Math.cos(r)*nextSpeed],actors,physics,recovery.now||performance.now());if(contact.blocked){blocked=true;nextSpeed=0;break}}
  else if(actors.some(a=>a.driving&&vehiclesOverlap(next.position,next.heading,a.position,a.heading,kind,a.vehicle)&&distanceMetres(next.position,a.position)<distanceMetres(current.position,a.position))){blocked=true;nextSpeed=0;break}
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
  const resolved=physics.moveVehicle(npc.position,target,heading,npc.vehicle);
  if(resolved.blocked||distanceMetres(npc.position,resolved.position)<.001)continue;
  if(actors.some(a=>a.id!==npc.id&&(a.driving?vehiclesOverlap(resolved.position,heading,a.position,a.heading,npc.vehicle,a.vehicle):distanceMetres(resolved.position,a.position)<1.7)))continue;
  return {position:resolved.position,side:side+step,goal};
 }
 return null;
}

// Remove existing penetration with small, checked steps, including vehicles that
// were pushed into a queue. This never relocates a car through a wall or another car.
export function separateTraffic(actors,physics,dt,player=null){
 let moved=0;const travelled=new Map(),budget=Math.max(0,Math.min(dt,.1))*1.4;
 for(let i=0;i<actors.length;i++)for(let j=i+1;j<actors.length;j++){
  const a=actors[i],b=actors[j];if(a.cleared||b.cleared||distanceMetres(a.position,b.position)>9)continue;
  const contact=bodyContact(a,b);if(!contact)continue;
  for(const [car,sign] of [[a,-1],[b,1]]){
   const step=Math.min(contact.depth/2+.01,budget-(travelled.get(car)||0));if(step<=0)continue;
   const target=offsetMetres(car.position,contact.normal[0]*step*sign,contact.normal[1]*step*sign);
   const result=physics.moveVehicle(car.position,target,car.heading,car.vehicle);if(result.blocked)continue;
   const next={...car,position:result.position};
   if([...actors,...(player?[player]:[])].some(other=>{if(other===car||other===a||other===b||other.cleared)return false;const after=bodyContact(next,other);if(!after)return false;const before=bodyContact(car,other);return !before||after.depth>before.depth+1e-7}))continue;
   const before=bodyContact(car,car===a?b:a),after=bodyContact(next,car===a?b:a);if(after&&before&&after.depth>=before.depth)continue;
   travelled.set(car,(travelled.get(car)||0)+distanceMetres(car.position,result.position));car.position=result.position;car.speed=0;car.moving=true;moved++;
  }
 }
 return moved;
}
