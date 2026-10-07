// Original synthesized game soundtrack; starts only after a player's tap.
export function createRideRadio(){let context,timer,step=0,volume=.12;const notes=[220,261.63,293.66,329.63,392,329.63,293.66,261.63];
 function stop(){clearInterval(timer);timer=null;if(context){context.close();context=null}}
 async function start(){if(timer){stop();return false}context=new AudioContext();await context.resume();const ctx=context;timer=setInterval(()=>{if(ctx.state!=='running')return;const time=ctx.currentTime;for(const [freq,duration,gain] of [[notes[step%8],.18,volume],[step%4===0?65.4:130.8,.1,volume*.65]]){const osc=ctx.createOscillator(),amp=ctx.createGain();osc.type='sine';osc.frequency.setValueAtTime(freq,time);amp.gain.setValueAtTime(gain,time);amp.gain.exponentialRampToValueAtTime(.001,time+duration);osc.connect(amp).connect(ctx.destination);osc.start(time);osc.stop(time+duration)}step++},240);return true}
 document.addEventListener('visibilitychange',()=>{if(context){if(document.hidden)context.suspend();else context.resume()}});
 return {start,stop};}
