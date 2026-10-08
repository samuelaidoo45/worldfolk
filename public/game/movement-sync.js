// Transport failures keep the local scene in place. Only an explicit server
// rejection may correct coordinates; a stale GET must never act as a respawn.
export function movementFailure(error){
 if(error?.code==='POSITION_CORRECTED'||error?.message==='Position corrected')return 'corrected';
 if(error?.message==='Slow down')return 'retry';
 if(error?.status===400&&error?.message==='Move through the city to get there')return 'rejected';
 return 'offline';
}
export function correctedPosition(state,player){
 if(!player||player.id!==state.self?.id||(player.revision??0)<(state.self.revision??0)||![player.lng,player.lat].every(Number.isFinite))return false;
 state.position=[player.lng,player.lat];state.lastSentPosition=[...state.position];state.heading=player.heading??state.heading;state.spawnCorrectionPending=false;state.moveSyncPaused=false;
 state.carSpeed=0;state.walkVelocity=[0,0];state.carDrift=[0,0];
 if(state.mode==='drive'){state.carPosition=[...state.position];state.carHeading=state.heading;state.world3d?.setCarPosition(...state.position,state.heading)}
 state.world3d?.setPosition(...state.position,state.heading);return true;
}

export function newestPlayer(current,incoming){return current&&incoming&&current.id===incoming.id&&(incoming.revision??0)<(current.revision??0)?current:incoming}
