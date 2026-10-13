import test from 'node:test';
import assert from 'node:assert/strict';
import {createGameAudio} from '../public/game/game-audio.js';
test('audio waits for a gesture, changes with movement, mutes persistently and suspends in background',async()=>{
 const events=new Map(),saved=new Map(),nodes=[],spoken=[];let cancelled=0;let created=0,ctx;
 const param=()=>({value:0,setValueAtTime(v){this.value=v},setTargetAtTime(v){this.value=v},exponentialRampToValueAtTime(v){this.value=v}});
 const node=()=>{const n={gain:param(),frequency:param(),connect(){return this},disconnect(){},start(){this.started=true},stop(){this.stopped=true}};nodes.push(n);return n};
 class Context{constructor(){created++;ctx=this;this.currentTime=1;this.sampleRate=100;this.state='suspended'}createGain(){return node()}createOscillator(){return node()}createBiquadFilter(){return node()}createBufferSource(){return node()}createBuffer(c,n){return {getChannelData:()=>new Float32Array(n)}}async resume(){this.state='running'}async suspend(){this.state='suspended'}async close(){this.state='closed'}}
 const doc={hidden:false,addEventListener(k,f){events.set(k,f)},removeEventListener(k){events.delete(k)}},storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
 const audio=createGameAudio({host:{AudioContext:Context,SpeechSynthesisUtterance:class{constructor(text){this.text=text}},speechSynthesis:{speak:u=>spoken.push(u.text),cancel:()=>cancelled++}},doc,storage});assert.equal(created,0);
 await events.get('pointerdown')();assert.equal(created,1);assert.equal(ctx.state,'running');
 audio.update({active:true,mode:'drive',speed:20,rain:true});assert.ok(nodes[2].gain.value>0);assert.ok(nodes[6].gain.value>0);
 audio.update({active:true,mode:'drive',speed:5,vehicle:'bicycle'});assert.equal(nodes[2].gain.value,0,'bicycles have no engine sound');
 audio.update({active:true,mode:'walk',ambience:{wind:.025,surf:.03,traffic:.01,crowd:.02}});const beds=[nodes[8],nodes[10],nodes[12],nodes[14]];assert.ok(beds.every(n=>n.gain.value>0),'precinct sound beds become audible');audio.update({active:true,mode:'walk'});assert.ok(beds.every(n=>n.gain.value===0),'leaving precinct silences sound beds');audio.update({active:false,mode:'walk',ambience:{wind:.02,crowd:.02}});assert.ok(beds.every(n=>n.gain.value===0),'paused gameplay is quiet');
 let alerts=nodes.length;audio.effect('message');assert.equal(nodes.length,alerts+4);ctx.currentTime+=1;alerts=nodes.length;audio.effect('ring');assert.equal(nodes.length,alerts+4);ctx.currentTime+=1;const count=nodes.length;audio.effect('horn');assert.equal(nodes.length,count+4);
 await audio.toggle();assert.equal(saved.get('worldfolk_sound'),'off');assert.equal(ctx.state,'suspended');audio.effect('horn');assert.equal(nodes.length,count+4);
 await events.get('pointerdown')();assert.equal(ctx.state,'suspended');await audio.toggle();assert.equal(ctx.state,'running');
 doc.hidden=true;events.get('visibilitychange')();assert.equal(ctx.state,'suspended');doc.hidden=false;events.get('visibilitychange')();assert.equal(ctx.state,'running');
 const sermon={kind:'church',id:'church:0',sound:'speech',text:'Welcome to the service'};
 audio.update({active:true,mode:'indoor',venue:sermon});audio.update({active:true,mode:'indoor',venue:sermon});assert.equal(spoken.length,1,'one utterance per programme segment');
 audio.update({active:true,mode:'indoor',venue:{kind:'nightclub',id:'nightclub:0',sound:'music'}});assert.equal(cancelled,1,'leaving a service cancels its speech');
 audio.update({active:true,mode:'indoor',venue:sermon});await audio.toggle();assert.equal(cancelled,2,'mute stops speech');await audio.toggle();
 audio.update({active:false,mode:'drive',speed:25});assert.equal(nodes[2].gain.value,0);audio.destroy();assert.equal(events.size,0);assert.equal(ctx.state,'closed');
});
test('unsupported audio never prevents gameplay',async()=>{const doc={addEventListener(){},removeEventListener(){}};const audio=createGameAudio({host:{},doc,storage:{getItem(){throw Error()}}});assert.equal(await audio.unlock(),false);audio.update({active:true});audio.effect('horn');audio.destroy()});
