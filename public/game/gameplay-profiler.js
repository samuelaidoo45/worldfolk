// Local opt-in CPU attribution. Fixed labels only: never record arguments,
// coordinates, player identities, messages or returned values.
export function createGameplayProfiler({enabled=false,now=()=>performance.now()}={}) {
  let active=false,started=0,generation=0,stack=[];
  const entries=new Map();
  let slowest=[];
  function wrap(label,fn) {
    if(!enabled||typeof fn!=='function')return fn;
    if(!entries.has(label)) {
      if(entries.size>=64)throw new Error('Gameplay profiler label limit');
      entries.set(label,{label,calls:0,totalMs:0,selfMs:0,maxMs:0,over50:0});
    }
    return function(...args) {
      if(!active)return fn.apply(this,args);
      const frame={entry:entries.get(label),start:now(),children:0,generation};
      stack.push(frame);
      try{return fn.apply(this,args)}finally{
        if(frame.generation===generation) {
          stack.pop();const duration=Math.max(0,now()-frame.start),entry=frame.entry;
          entry.calls++;entry.totalMs+=duration;entry.selfMs+=Math.max(0,duration-frame.children);
          entry.maxMs=Math.max(entry.maxMs,duration);if(duration>50)entry.over50++;
          if(stack.length)stack.at(-1).children+=duration;
          if(duration>20) {
            slowest.push({label,atMs:frame.start-started,durationMs:duration});
            slowest.sort((a,b)=>b.durationMs-a.durationMs);slowest.length=Math.min(12,slowest.length);
          }
        }
      }
    };
  }
  return {
    wrap,
    methods(object,prefix,names) {
      if(enabled&&object)for(const name of names)if(typeof object[name]==='function')object[name]=wrap(prefix+'.'+name,object[name]);
      return object;
    },
    start() {if(!enabled)return;generation++;stack=[];slowest=[];started=now();for(const entry of entries.values())Object.assign(entry,{calls:0,totalMs:0,selfMs:0,maxMs:0,over50:0});active=enabled;},
    stop(){active=false;},
    report() {
      const round=n=>+n.toFixed(2);
      return {enabled,operations:[...entries.values()].filter(e=>e.calls).sort((a,b)=>b.selfMs-a.selfMs).map(e=>({...e,totalMs:round(e.totalMs),selfMs:round(e.selfMs),maxMs:round(e.maxMs)})),slowest:slowest.map(e=>({...e,atMs:round(e.atMs),durationMs:round(e.durationMs)})),limitations:['Synchronous CPU time only; asynchronous continuations and GPU execution are excluded.','totalMs includes nested measured operations; selfMs excludes them. Do not add inclusive totals together.']};
    }
  };
}
export const gameplayProfiler=createGameplayProfiler({enabled:typeof location!=='undefined'&&new URLSearchParams(location.search).has('benchmark')});
