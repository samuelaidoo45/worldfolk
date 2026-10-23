import {WORKER_STATIC_LANDMARKS} from './static-landmark-catalog.js';
import {unpackStaticModel} from './static-model-transfer.js';

// At most one construction job and one worker. Abort terminates obsolete work
// immediately; an old reply can never replace a newer location's model.
export function createStaticLandmarkLoader({workerFactory,supported=typeof Worker!=='undefined'&&typeof OffscreenCanvas!=='undefined',now=()=>performance.now()}={}){
  let worker=null,pending=null,serial=0,closed=false,failed=false;
  const metrics={completed:0,cancelled:0,failed:0,lastBuildMs:0,lastPackMs:0,lastHydrateMs:0,maxHydrateMs:0};
  const factory=workerFactory??(()=>new Worker(new URL('./static-landmark-worker.js',import.meta.url),{type:'module',name:'worldfolk-static-landmarks'}));
  function stop(){worker?.terminate();worker=null;}
  function finish(error,value){const job=pending;if(!job)return;pending=null;clearTimeout(job.timer);job.signal?.removeEventListener('abort',job.abort);if(error)job.reject(error);else job.resolve(value);}
  function ensureWorker(){
    if(worker)return;
    const active=worker=factory();
    active.onmessage=event=>{
      if(worker!==active||!pending||event.data.request!==pending.request)return;
      if(event.data.error){metrics.failed++;failed=true;stop();finish(Error(event.data.error));return;}
      try{const start=now(),model=unpackStaticModel(event.data.snapshot);metrics.lastHydrateMs=now()-start;metrics.maxHydrateMs=Math.max(metrics.maxHydrateMs,metrics.lastHydrateMs);metrics.lastBuildMs=event.data.timings?.buildMs||0;metrics.lastPackMs=event.data.timings?.packMs||0;metrics.completed++;finish(null,model);}catch(error){metrics.failed++;failed=true;stop();finish(error);}
    };
    active.onerror=()=>{if(worker!==active)return;metrics.failed++;failed=true;stop();finish(Error('Static landmark worker failed'));};
  }
  return {
    canLoad(id){return supported&&!closed&&!failed&&WORKER_STATIC_LANDMARKS.has(id);},
    load(id,{signal}={}){
      if(!this.canLoad(id))return Promise.resolve(null);
      if(signal?.aborted)return Promise.reject(new DOMException('Aborted','AbortError'));
      if(pending)return Promise.reject(Error('A static landmark build is already active'));
      return new Promise((resolve,reject)=>{
        const request=++serial,abort=()=>{if(pending?.request!==request)return;metrics.cancelled++;stop();finish(new DOMException('Aborted','AbortError'));};
        pending={request,resolve,reject,signal,abort,timer:setTimeout(()=>{metrics.failed++;failed=true;stop();finish(Error('Static landmark worker timed out'));},30000)};
        signal?.addEventListener('abort',abort,{once:true});
        try{ensureWorker();worker.postMessage({request,id});}catch(error){metrics.failed++;failed=true;stop();finish(error);}
      });
    },
    snapshot(){return {...metrics,active:!!pending,available:supported&&!failed&&!closed};},
    close(){closed=true;stop();finish(new DOMException('Closed','AbortError'));}
  };
}
