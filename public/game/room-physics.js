// Swept circular player movement through room furniture and partitions.
export function createRoomPhysics(blockers,bounds={left:-6.25,right:6.25,back:-5.15,front:4.7}){
 const radius=.34;
 function depth(x,z){let total=Math.max(0,bounds.left-x,x-bounds.right,bounds.back-z,z-bounds.front);for(const b of blockers){const dx=Math.abs(x-b.x)-b.w/2,dz=Math.abs(z-b.z)-b.d/2;if(dx<=0&&dz<=0)total+=radius+Math.min(-dx,-dz);else total+=Math.max(0,radius-Math.hypot(Math.max(0,dx),Math.max(0,dz)))}return total}
 function clear(x,z){return depth(x,z)<1e-7}
 function move(from,delta){let [x,z]=from;const steps=Math.min(2048,Math.max(1,Math.ceil(Math.hypot(...delta)/.15))),factor=Math.min(1,steps*.15/(Math.hypot(...delta)||1)),dx=delta[0]*factor/steps,dz=delta[1]*factor/steps;for(let i=0;i<steps;i++){const before=depth(x,z),allowed=(a,b)=>clear(a,b)||before>0&&depth(a,b)<before-1e-7;if(allowed(x+dx,z+dz)){x+=dx;z+=dz}else{if(allowed(x+dx,z))x+=dx;if(allowed(x,z+dz))z+=dz}}return [x,z]}
 function visible(from,to){const steps=Math.ceil(Math.hypot(from[0]-to[0],from[1]-to[1])/.15);for(let i=1;i<steps;i++){const t=i/steps,x=from[0]+(to[0]-from[0])*t,z=from[1]+(to[1]-from[1])*t;if(blockers.some(b=>Math.abs(x-b.x)<b.w/2&&Math.abs(z-b.z)<b.d/2))return false}return true}
 return {move,clear,visible};
}
