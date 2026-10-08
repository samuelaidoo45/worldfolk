import {angleDelta,bearingTo,distanceMetres} from './motion.js';
import {routeProgress} from './navigation.js';
import {makeRoadPath,angleDifference} from './traffic-routing.js';

const paths=new WeakMap();
// Pure-pursuit steering uses the same acceleration, tyres and collision path as
// manual driving. It never teleports the car to the route or through a building.
export function autoDriveInput(coordinates,position,heading,speed){
 if(coordinates.length<2)return {throttle:0,turn:0,brake:true,done:false};
 const progress=routeProgress(coordinates,position),path=paths.get(coordinates)||makeRoadPath(coordinates,1.25),remaining=progress.remaining,endDistance=distanceMetres(position,coordinates.at(-1));
 paths.set(coordinates,path);
 const done=remaining<3&&endDistance<7;
 if(done||progress.distance>45)return {throttle:0,turn:0,brake:true,done,offRoute:progress.distance>45};
 const look=Math.max(5,Math.min(16,Math.abs(speed)*.8+5)),target=path.at(progress.along+look),angle=angleDelta(heading,bearingTo(position,target.position)),r=angle*Math.PI/180;
 const wheel=Math.atan2(2*2.6*Math.sin(r),Math.max(3,distanceMetres(position,target.position))),turn=Math.abs(angle)>120?Math.sign(angle):Math.max(-1,Math.min(1,wheel*(1+Math.abs(speed)*.065)/.48));
 const upcoming=angleDifference(path.at(progress.along).heading,path.at(progress.along+Math.max(12,speed*2.2)).heading);
 const targetSpeed=Math.min(19,Math.abs(angle)>60?3:Math.abs(angle)>28||upcoming>30?5:19,Math.max(1,Math.sqrt(3*remaining)));
 return {throttle:speed<targetSpeed-.7?1:0,turn,brake:speed>targetSpeed+1,done:false};
}

// A red light still stops the car. Stationary traffic gets a short opportunity to
// move, then gentle contact recovery uses the normal swept collision solver.
export function autoTrafficControl(input,speed,trafficLimit,signalLimit,waiting,dt){
 waiting=signalLimit<=0||trafficLimit>=.4?0:(speed<.4||waiting>2?waiting+dt:waiting);
 const limit=Math.min(signalLimit,waiting>2?2.4:trafficLimit);
 return {...input,waiting,throttle:speed>=limit-.4?0:input.throttle,brake:input.brake||speed>limit};
}
