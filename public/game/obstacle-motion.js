import {offsetMetres,distanceMetres} from './motion.js';
// Resolve moving people, parked vehicles and props together with the building
// sweep. Existing overlaps may shrink, but movement cannot enter a new obstacle.
export function moveAroundObstacles(from,to,circles,resolve,slide=true){
 const scale=111320,cos=Math.cos(from[1]*Math.PI/180),delta=[(to[0]-from[0])*scale*cos,(to[1]-from[1])*scale];
 const length=Math.hypot(...delta),steps=Math.min(4096,Math.max(1,Math.ceil(length/.12))),fraction=Math.min(1,steps*.12/(length||1));let current=[...from],blocked=false;
 const obstacles=circles.filter(c=>distanceMetres(from,c.position)<length+c.radius+1);
 for(let i=0;i<steps;i++){
  const dx=delta[0]*fraction/steps,dy=delta[1]*fraction/steps;
  const allowed=point=>obstacles.every(c=>{const before=c.gap?c.gap(current):distanceMetres(current,c.position)-c.radius,after=c.gap?c.gap(point):distanceMetres(point,c.position)-c.radius;return after>=-1e-6||before<0&&after>before+1e-7});
  const attempt=(x,y)=>{const desired=offsetMetres(current,x,y),result=resolve(current,desired);if(distanceMetres(current,result.position)<1e-7||!allowed(result.position))return null;return result};
  let next=attempt(dx,dy);
  if(!next&&slide){const hit=obstacles.find(c=>distanceMetres(offsetMetres(current,dx,dy),c.position)<c.radius);if(hit){const nx=(current[0]-hit.position[0])*scale*cos,ny=(current[1]-hit.position[1])*scale,n=Math.hypot(nx,ny)||1,into=(dx*nx+dy*ny)/n;next=attempt(dx-Math.min(0,into)*nx/n,dy-Math.min(0,into)*ny/n)}if(!next)next=attempt(dx,0)||attempt(0,dy)}
  if(!next){blocked=length>1e-7;break}current=next.position;
 }
 return {position:current,blocked};
}

// Signed separation of oriented physical footprints (positive means a gap).
export function footprintGap(a,b){
 const size=o=>o.driving?(o.vehicle==='bus'?[1.3,3.55]:o.vehicle==='motorcycle'?[.38,1.21]:[1.04,1.86]):[o.radius||.3,o.radius||.3];
 const axes=o=>{const r=(o.heading||0)*Math.PI/180;return [[Math.cos(r),-Math.sin(r)],[Math.sin(r),Math.cos(r)]]};
 const aa=axes(a),bb=axes(b),sa=size(a),sb=size(b),d=[(b.position[0]-a.position[0])*111320*Math.cos(a.position[1]*Math.PI/180),(b.position[1]-a.position[1])*111320];
 const dot=(u,v)=>u[0]*v[0]+u[1]*v[1];
 return Math.max(...[...aa,...bb].map(axis=>Math.abs(dot(d,axis))-sa.reduce((n,v,i)=>n+v*Math.abs(dot(aa[i],axis)),0)-sb.reduce((n,v,i)=>n+v*Math.abs(dot(bb[i],axis)),0)));
}
