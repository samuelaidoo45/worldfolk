// Readiness is based on completed render frames, never an elapsed loading delay.
// A second frame plus a short quiet period lets late texture/model jobs invalidate
// the candidate before the opaque entry screen is removed.
export function createWorldEntryGate({quietMs=300}={}) {
  let active=false, since=null, firstFrame=null;
  return {
    begin(){active=true;since=null;firstFrame=null;},
    cancel(){active=false;since=null;firstFrame=null;},
    update({mapReady,visual},now){
      if(!active)return true;
      if(!mapReady||!visual?.ready||visual.error||!Number.isFinite(visual.frame)){
        since=null;firstFrame=null;return false;
      }
      if(since===null){since=now;firstFrame=visual.frame;return false;}
      if(now-since<quietMs||visual.frame<=firstFrame)return false;
      active=false;return true;
    },
    get active(){return active;}
  };
}

// Called after renderer.render returns, using only the bounded selected scene.
export function worldEntryReadiness({bootstrap,plan,pendingLandmark,facades,architectureSeen,scenerySeen,ambient,actors,preparation,pbr}) {
  if(preparation.failed)return {ready:false,error:true,message:'Graphics preparation failed. Retry loading the world.'};
  if(actors.some(a=>a.group.userData.assetError||a.group.userData.entryAssetError))return {ready:false,error:true,message:'A character could not load. Retry loading the world.'};
  if(pbr.failed)return {ready:false,error:true,message:'City textures could not load. Retry loading the world.'};
  if(!bootstrap)return {ready:false,message:'Preparing city graphics…'};
  if(!plan||!architectureSeen||!scenerySeen)return {ready:false,message:'Loading streets and buildings…'};
  const missing=plan.selected.filter(item=>!item.model||item.detail!==item.desiredDetail);
  if(missing.length||pendingLandmark)return {ready:false,message:`Preparing landmarks · ${plan.selected.length-missing.length} / ${plan.selected.length}`};
  if(facades)return {ready:false,message:'Finishing nearby buildings…'};
  if(ambient.pending||actors.some(a=>a.group.userData.entryAssetPending||a.group.userData.gpuReady===false))return {ready:false,message:'Preparing people and vehicles…'};
  if(pbr.loaded<pbr.textures||!pbr.skyReady||preparation.queued||preparation.active)return {ready:false,message:'Preparing textures and lighting…'};
  return {ready:true,message:'Entering the world…'};
}
