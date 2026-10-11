const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const mix=(a,b,t)=>a+(b-a)*t;
// One cycle is two steps. Stance moves the foot backwards at the body's speed;
// swing returns it with toe clearance. IK keeps the knee pointing forwards.
export function gaitPose(cycle,speed,upper=.43,lower=.43){
 const run=clamp((speed-2.15)/2.25,0,1),cadence=mix(1.08,1.72,run),stance=mix(.62,.39,run);
 const travel=Math.min(1.1,speed/cadence*stance),lift=mix(.075,.24,run);
 const phase=((cycle%1)+1)%1;
 function target(p){
  p=(p+1)%1;const planted=p<stance,u=planted?p/stance:(p-stance)/(1-stance);
  const forward=planted?travel*(.5-u):travel*(-.5+u*u*(3-2*u));
  const height=planted?0:Math.sin(Math.PI*u)*lift;
  return {planted,forward,height,u};
 }
 const targets=[target(phase),target(phase+.5)];
 const extent=Math.max(...targets.filter(t=>t.planted).map(t=>Math.abs(t.forward)),0);
 const reach=upper+lower-.018,bodyDrop=Math.sqrt(Math.max(.1,reach*reach-extent*extent));
 function leg({planted,forward,height,u}){
  const drop=bodyDrop-height;
  const distance=clamp(Math.hypot(forward,drop),.1,upper+lower-.001);
  const knee=Math.PI-Math.acos(clamp((upper*upper+lower*lower-distance*distance)/(2*upper*lower),-1,1));
  const hip=Math.atan2(-forward,drop)-Math.acos(clamp((upper*upper+distance*distance-lower*lower)/(2*upper*distance),-1,1));
  const toe=planted?Math.max(0,u-.7)*.5:-Math.sin(Math.PI*u)*.14;
  return {hip,knee,ankle:-hip-knee+toe,planted,forward,height};
 }
 return {left:leg(targets[0]),right:leg(targets[1]),bodyOffset:bodyDrop-(upper+lower),run,cadence,stance};
}
