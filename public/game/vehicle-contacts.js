import {vehicleSpec,vehicleFootprint} from './vehicle-catalog.js';
import {offsetMetres,distanceMetres} from './motion.js';

const dot=(a,b)=>a[0]*b[0]+a[1]*b[1];
const mass=o=>o.driving?vehicleSpec(o.vehicle).mass:80;
const axes=o=>{const a=(o.heading||0)*Math.PI/180;return [[Math.cos(a),-Math.sin(a)],[Math.sin(a),Math.cos(a)]]};
const size=o=>o.driving?vehicleFootprint(o.vehicle):[.28,.28];
export function bodyContact(a,b){
 const aa=axes(a),bb=axes(b),sa=size(a),sb=size(b),delta=[(b.position[0]-a.position[0])*111320*Math.cos(a.position[1]*Math.PI/180),(b.position[1]-a.position[1])*111320];
 let depth=Infinity,normal=null;
 for(const axis of [...aa,...bb]){const reach=sa.reduce((n,s,i)=>n+s*Math.abs(dot(aa[i],axis)),0)+sb.reduce((n,s,i)=>n+s*Math.abs(dot(bb[i],axis)),0),overlap=reach-Math.abs(dot(delta,axis));if(overlap<=0)return null;if(overlap<depth){depth=overlap;normal=axis.map(v=>v*(dot(delta,axis)<0?-1:1))}}
 return {depth,normal};
}
export function bodyVelocity(body){const a=(body.heading||0)*Math.PI/180;return body.impactVelocity||[Math.sin(a)*(body.speed||0),Math.cos(a)*(body.speed||0)]}
// Resolve a short chain of movable bodies transactionally. A wall or closed
// gap rolls back the whole push instead of leaving cars interpenetrating.
function pushChain(other,target,actors,physics,changed,visiting=new Set()){
 if(visiting.has(other)||visiting.size>=12)return false;
 visiting.add(other);if(!changed.has(other))changed.set(other,[...other.position]);
 const result=(other.driving?physics?.moveVehicle(other.position,target,other.heading,other.vehicle):physics?.move(other.position,target,.28))||{position:target,blocked:false};
 if(result.blocked)return false;
 for(const next of actors){if(next===other||visiting.has(next)||distanceMetres(result.position,next.position)>10)continue;const contact=bodyContact({...other,position:result.position},next);if(!contact)continue;
  const before=bodyContact(other,next);if(before&&contact.depth<=before.depth)continue;
  const to=offsetMetres(next.position,contact.normal[0]*(contact.depth+.02),contact.normal[1]*(contact.depth+.02));
  if(!pushChain(next,to,actors,physics,changed,visiting))return false;
 }
 other.position=result.position;visiting.delete(other);return true;
}
// Small swept steps prevent tunnelling. Movable bodies receive momentum; walls
// remain immovable. This applies to local ambient actors, not remote players.
export function driveWithContacts(from,to,body,velocity,actors,physics,now){
 let position=[...from],v=[...velocity],blocked=false,hits=0;
 const length=distanceMetres(from,to),steps=Math.max(1,Math.ceil(length/.18)),dx=(to[0]-from[0])/steps,dy=(to[1]-from[1])/steps;
 for(let i=0;i<steps;i++){
  const next=[position[0]+dx,position[1]+dy],wall=physics?.moveVehicle(position,next,body.heading,body.vehicle)||{position:next,blocked:false};
  if(wall.blocked){blocked=true;position=wall.position;break}
  let stop=false;
  for(const other of actors){if(distanceMetres(next,other.position)>10)continue;const contact=bodyContact({...body,position:next},other);if(!contact)continue;
   const {normal,depth}=contact,old=bodyContact({...body,position},other);
   if(old&&depth<=old.depth+1e-7)continue; // Reverse or slide out of an existing overlap.
   const target=offsetMetres(other.position,normal[0]*(depth+.015),normal[1]*(depth+.015));
   const changed=new Map();
   if(!pushChain(other,target,actors,physics,changed)){for(const [actor,position] of changed)actor.position=position;stop=true;blocked=true;break}
   for(const [actor] of changed){actor.pauseUntil=now+600;actor.stalled=0;actor.progressAnchor=[...actor.position];actor.moving=true;}
   const ov=bodyVelocity(other),closing=dot([v[0]-ov[0],v[1]-ov[1]],normal);
   if(closing>0){const impulse=closing*1.12/(1/mass(body)+1/mass(other));v=v.map((n,k)=>n-impulse/mass(body)*normal[k]);other.impactVelocity=ov.map((n,k)=>n+impulse/mass(other)*normal[k]);other.impactUntil=now+900;other.pauseUntil=now+450;other.moving=true;other.stalled=0;other.progressAnchor=[...other.position];hits++;}
  }
  if(stop)break;position=next;
 }
 return {position,velocity:v,blocked,hits};
}
