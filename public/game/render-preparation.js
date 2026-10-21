// Pump only from the MapLibre custom layer: all GPU mutations share its context.
// Parallel completion polling reduces first-use stalls where the driver supports it;
// compilation can still block on drivers without KHR_parallel_shader_compile.
export function createPreparationQueue({now=()=>performance.now(),wake=()=>{}}={}){
 const jobs=[],keys=new Map();let active=null,closed=false,completed=0,failed=0,lastMs=0,maxMs=0,lastSubmitMs=0,maxSubmitMs=0;
 function enqueue(key,run,valid=()=>true){
  if(closed)return Promise.resolve(false);if(keys.has(key))return keys.get(key).promise;
  let resolve;const promise=new Promise(r=>resolve=r),job={key,run,valid,promise,resolve};keys.set(key,job);jobs.push(job);wake();return promise;
 }
 function pump(){
  if(closed||active)return;const job=jobs.shift();if(!job)return;
  if(!job.valid()){keys.delete(job.key);job.resolve(false);wake();return;}
  active=job;const started=now();let result;
  try{result=job.run()}catch{result=Promise.reject(Error('Graphics preparation failed'));}
  lastSubmitMs=now()-started;maxSubmitMs=Math.max(maxSubmitMs,lastSubmitMs);
  Promise.resolve(result).then(()=>{completed++;job.resolve(!closed&&job.valid())},()=>{failed++;job.resolve(false)}).finally(()=>{lastMs=now()-started;maxMs=Math.max(maxMs,lastMs);keys.delete(job.key);active=null;wake()});
 }
 return {enqueue,pump,snapshot(){return {queued:jobs.length,active:!!active,completed,failed,lastMs:+lastMs.toFixed(2),maxMs:+maxMs.toFixed(2),lastSubmitMs:+lastSubmitMs.toFixed(2),maxSubmitMs:+maxSubmitMs.toFixed(2)}},close(){closed=true;for(const job of jobs.splice(0)){keys.delete(job.key);job.resolve(false)}}};
}
export function landmarkDetail(data,distance,previous='near',{mobile=false}={}){
 const edge=Math.max(0,distance-Math.hypot(data.width||0,data.depth||0)/2),enter=mobile?50:70,exit=mobile?80:110;
 return edge<(previous==='medium'?enter:exit)?'near':'medium';
}
export function humanDetail(distance,previous='near',{mobile=false}={}){
 return distance<(previous==='medium'?(mobile?18:25):(mobile?28:35))?'near':'medium';
}
