// Rest has no timer. Only an explicit end (or a life reset) releases the pose.
export function restPrompt(kind){
 return kind==='sleep'?{kind:'local',actionId:'wake',label:'Wake up'}:kind==='relax'?{kind:'local',actionId:'stand',label:'Stand up'}:null;
}
export function createRoomAction(roomKind,now=()=>performance.now()/1000){
 let kind='',startedAt=0,until=0;
 return {
  start(next,{persistent=['home','hotel'].includes(roomKind)&&!!restPrompt(next)}={}){
   if(until===Infinity)return false;
   kind=next;startedAt=now();until=persistent?Infinity:startedAt+2.3;return true;
  },
  end(){if(until!==Infinity)return false;kind='';until=0;return true},
  get resting(){return until===Infinity?kind:null},
  get active(){return now()<until},
  frame(t){const active=t<until;return {kind,active,blend:active?Math.max(0,Math.min(1,(t-startedAt)*3,(until-t)*3)):0}},
 };
}
export const REST_SPOTS={sleep:[-3,-.4],relax:[3,-.25]};
export function applyRestPose(actor,kind,blend){
 const group=actor.group;
 if(kind==='sleep'){
  // Feet at the foot of the bed, head on the pillow, face upward.
  group.position.x+=(-3-group.position.x)*blend;
  group.position.y+=(1.1-group.position.y)*blend;
  group.position.z+=(-1.35-group.position.z)*blend;
  group.rotation.set(-Math.PI/2*blend,0,0);
 }else if(kind==='relax'){
  // Hips on the sofa cushion; thighs forward and lower legs down.
  group.position.x+=(3-group.position.x)*blend;
  group.position.y+=(-.12-group.position.y)*blend;
  group.position.z+=(-1.8-group.position.z)*blend;
  group.rotation.set(0,Math.PI,0);
  actor.leftLeg.rotation.x=actor.rightLeg.rotation.x=-Math.PI/2*blend;
  actor.knees.forEach(knee=>knee.rotation.x=Math.PI/2*blend);
  actor.leftArm.rotation.x=actor.rightArm.rotation.x=-.45*blend;
 }
}
