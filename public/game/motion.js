// Frame-rate independent motion, in metres and degrees.
export const damp=(value,target,rate,dt)=>value+(target-value)*(1-Math.exp(-rate*dt));
export const angleDelta=(from,to)=>(((to-from+180)%360)+360)%360-180;
export const turnToward=(from,to,rate,dt)=>from+angleDelta(from,to)*(1-Math.exp(-rate*dt));
export function stepWalker(velocity,x,y,bearing,running,dt){
  const length=Math.max(1,Math.hypot(x,y)),speed=running?5.2:2.6,a=bearing*Math.PI/180;
  const east=(Math.sin(a)*y+Math.cos(a)*x)/length*speed,north=(Math.cos(a)*y-Math.sin(a)*x)/length*speed;
  const rate=Math.hypot(x,y)>.05?10:15;
  return [damp(velocity[0],east,rate,dt),damp(velocity[1],north,rate,dt)];
}
export function stepCar(speed,steer,heading,throttle,turn,brake,dt,motorcycle=false){
  steer=damp(steer,turn,7,dt);
  const acceleration=throttle>0?(speed<-.1?9:motorcycle?5.5:4.4)*throttle:throttle<0?(speed>.1?10:2.8)*throttle:0;
  speed+=acceleration*dt;
  const drag=brake?13:Math.abs(throttle)<.05?.75:.16;
  speed=Math.sign(speed)*Math.max(0,Math.abs(speed)-drag*dt);
  speed=Math.max(-3,speed); // Forward speed grows with acceleration; there is no fixed top-speed clamp.
  // Bicycle steering: slower, wider turns at road speed; steering also works in reverse.
  const wheelAngle=steer*.48/(1+Math.abs(speed)*.065);
  heading=(heading+speed/2.6*Math.tan(wheelAngle)*180/Math.PI*dt+360)%360;
  return {speed:Math.abs(speed)<.025?0:speed,steer,heading};
}
export function offsetMetres(origin,east,north){return [origin[0]+east/(111320*Math.cos(origin[1]*Math.PI/180)),origin[1]+north/111320]}
export function distanceMetres(a,b){return Math.hypot((a[0]-b[0])*111320*Math.cos(a[1]*Math.PI/180),(a[1]-b[1])*111320)}
export function bearingTo(a,b){return (Math.atan2((b[0]-a[0])*Math.cos(a[1]*Math.PI/180),b[1]-a[1])*180/Math.PI+360)%360}
export function projectOnSegment(point,a,b){
  const scale=111320*Math.cos(point[1]*Math.PI/180),ax=(a[0]-point[0])*scale,ay=(a[1]-point[1])*111320,bx=(b[0]-point[0])*scale,by=(b[1]-point[1])*111320,dx=bx-ax,dy=by-ay;
  const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/(dx*dx+dy*dy||1)));
  return {position:[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],distance:Math.hypot(ax+dx*t,ay+dy*t),t};
}

export const crashDamage=speed=>Math.min(100,Math.max(0,Math.round((Math.abs(speed)-8)*3.5)));
