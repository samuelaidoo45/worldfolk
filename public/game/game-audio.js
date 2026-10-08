// Original synthesized effects: no downloads, autoplay, microphone or network needed.
export function createGameAudio({host=window,doc=document,storage=localStorage}={}){
 let context,master,engine,engineGain,rainGain,enabled=true,lastStep=0,lastEffect=0,destroyed=false;
 try{enabled=storage.getItem('worldfolk_sound')!=='off'}catch{}
 const param=(p,value)=>p.setTargetAtTime(value,context.currentTime,.08);
 async function unlock(){
  if(!enabled||destroyed||doc.hidden)return false;
  try{if(!context){const Audio=host.AudioContext||host.webkitAudioContext;if(!Audio)return false;context=new Audio();master=context.createGain();master.gain.value=.24;master.connect(context.destination);
   engine=context.createOscillator();engine.type='sawtooth';engine.frequency.value=45;engineGain=context.createGain();engineGain.gain.value=0;const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=350;engine.connect(filter).connect(engineGain).connect(master);engine.start();
   const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
   const noise=context.createBufferSource();noise.buffer=buffer;noise.loop=true;const rainFilter=context.createBiquadFilter();rainFilter.type='lowpass';rainFilter.frequency.value=1700;rainGain=context.createGain();rainGain.gain.value=0;noise.connect(rainFilter).connect(rainGain).connect(master);noise.start();
  }await context.resume();return true}catch{return false}
 }
 function tone(frequency,duration=.12,volume=.15,type='sine',delay=0){if(!enabled||doc.hidden||context?.state!=='running')return;const now=context.currentTime+delay,o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(frequency,now);g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g).connect(master);o.onended=()=>{o.disconnect();g.disconnect()};o.start(now);o.stop(now+duration)}
 function effect(kind){const now=context?.currentTime||0;if(now-lastEffect<.15)return;lastEffect=now;if(kind==='horn'){tone(350,.3,.22,'triangle');tone(440,.3,.12,'triangle')}else if(kind==='impact')tone(65,.18,.28,'triangle');else if(kind==='reward'){tone(523,.12,.12);tone(784,.2,.12,'sine',.12)}else if(kind==='arrive'){tone(660,.14,.12);tone(880,.22,.12,'sine',.14)}}
 function update({active,mode,speed=0,moving=false,running=false,rain=false}){
  if(context?.state!=='running')return;const audible=enabled&&active&&!doc.hidden;
  param(engineGain.gain,audible&&['drive','transit'].includes(mode)?.055+Math.min(Math.abs(speed),25)*.002:0);
  param(engine.frequency,40+Math.min(Math.abs(speed),30)*3);param(rainGain.gain,audible&&rain&&mode!=='indoor'?.1:0);
  if(audible&&moving&&['walk','indoor'].includes(mode)&&context.currentTime-lastStep>(running?.26:.44)){lastStep=context.currentTime;tone(100+Math.random()*25,.055,.15,'triangle')}
 }
 async function toggle(){enabled=!enabled;try{storage.setItem('worldfolk_sound',enabled?'on':'off')}catch{}if(enabled)await unlock();else if(context){master.gain.value=0;await context.suspend()}if(enabled&&master)master.gain.value=.24;return enabled}
 const gesture=()=>{if(context?.state!=='running')void unlock()},visibility=()=>{if(doc.hidden)void context?.suspend();else if(enabled&&context)void context.resume().catch(()=>{})};
 doc.addEventListener('pointerdown',gesture);doc.addEventListener('keydown',gesture);doc.addEventListener('visibilitychange',visibility);
 return {get enabled(){return enabled},unlock,toggle,update,effect,destroy(){destroyed=true;doc.removeEventListener('pointerdown',gesture);doc.removeEventListener('keydown',gesture);doc.removeEventListener('visibilitychange',visibility);void context?.close()}};
}
