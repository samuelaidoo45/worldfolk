// One owner for gameplay time. Re-entering before an old RAF fires must not
// create two simulations/camera writers for the same frame.
export function createGameplayLoop(step,{request=callback=>requestAnimationFrame(callback),cancel=id=>cancelAnimationFrame(id)}={}){
 let running=false,pending=null,generation=0;
 function schedule(){if(running&&pending===null){const token=generation;pending=request(now=>{if(token!==generation)return;pending=null;if(!running)return;try{step(now)}finally{schedule()}})}}
 return {start(){if(running)return;running=true;generation++;schedule()},stop(){running=false;generation++;if(pending!==null)cancel(pending);pending=null},get running(){return running}};
}
export function isEditingTarget(element){
 return !!element&&!element.disabled&&(/^(INPUT|TEXTAREA|SELECT)$/.test(element.tagName)||!!element.isContentEditable)&&element.getClientRects().length>0;
}
