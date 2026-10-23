import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorldEntryGate,worldEntryReadiness} from '../public/game/world-entry.js';
import {createSceneLoading} from '../public/game/scene-loading.js';

const readyScene=()=>({bootstrap:true,plan:{selected:[{model:{},detail:'near',desiredDetail:'near'}]},pendingLandmark:null,facades:0,architectureSeen:true,scenerySeen:true,ambient:{pending:0},actors:[{group:{userData:{}}}],preparation:{queued:0,active:false,failed:0},pbr:{textures:3,loaded:3,failed:0,skyReady:true}});

test('map readiness alone never reveals an arrival, even after a long wait',()=>{
 const gate=createWorldEntryGate();gate.begin();
 for(const time of [0,1000,30000,120000])assert.equal(gate.update({mapReady:true,visual:{ready:false,frame:time}},time),false);
 assert.equal(gate.active,true);
});
test('reveal needs ready tiles and multiple completed frames after late jobs settle',()=>{
 const gate=createWorldEntryGate();gate.begin();
 const sample=(time,frame,ready=true,mapReady=true)=>gate.update({mapReady,visual:{ready,frame}},time);
 assert.equal(sample(0,1),false);
 assert.equal(sample(500,1),false,'elapsed time without a new rendered frame is insufficient');
 assert.equal(sample(510,2,false),false,'late work resets the quiet interval');
 assert.equal(sample(600,3),false);
 assert.equal(sample(950,4,true,false),false,'new map tiles reset it too');
 assert.equal(sample(1000,5),false);
 assert.equal(sample(1350,6),true);
 assert.equal(gate.active,false);
 gate.begin();assert.equal(sample(1400,7),false,'continue story starts a new gate');
 gate.cancel();assert.equal(gate.active,false);
});
test('arrival waits for selected landmark upgrades, facades, characters, materials and preparation',()=>{
 assert.equal(worldEntryReadiness(readyScene()).ready,true);
 const cases=[{bootstrap:false},{plan:null},{architectureSeen:false},{scenerySeen:false},{facades:1},{pendingLandmark:{}},{ambient:{pending:1}},
  {plan:{selected:[{model:null,detail:'near',desiredDetail:'near'}]}},
  {plan:{selected:[{model:{},detail:'medium',desiredDetail:'near'}]}},
  {actors:[{group:{userData:{entryAssetPending:true}}}]},
  {actors:[{group:{userData:{gpuReady:false}}}]},
  {preparation:{queued:1}},{preparation:{active:true}},{pbr:{textures:3,loaded:2,skyReady:true}},{pbr:{textures:3,loaded:3,skyReady:false}}];
 for(const change of cases)assert.equal(worldEntryReadiness({...readyScene(),...change}).ready,false,JSON.stringify(change));
 assert.equal(worldEntryReadiness({...readyScene(),plan:{selected:[]}}).ready,true,'an area without authored landmarks can enter');
 for(const change of [{preparation:{failed:1}},{pbr:{failed:1}},{actors:[{group:{userData:{assetError:'failed'}}}]}]){
  const result=worldEntryReadiness({...readyScene(),...change});assert.equal(result.ready,false);assert.equal(result.error,true);
 }
});

test('loading controller keeps an opaque entry cover on source events, timeout and graphics loss',()=>{
 const saved={document:globalThis.document,performance:globalThis.performance,setInterval:globalThis.setInterval,clearInterval:globalThis.clearInterval};
 let now=0,tiles=false,visual={ready:false,frame:0},began=0,completed=0,removed=false;
 const classes=()=>({values:new Set(),add(...x){x.forEach(v=>this.values.add(v))},remove(...x){x.forEach(v=>this.values.delete(v))},contains(x){return this.values.has(x)}});
 const element=()=>({classList:classes(),children:[],hidden:false,setAttribute(){},append(...x){this.children.push(...x)},remove(){removed=true}});
 const body=element(),controls=element(),events={},canvasEvents={};controls.inert=false;body.append(controls);
 const map={on(type,fn){events[type]=fn},getCenter:()=>({lng:-.18,lat:5.55}),getCanvas:()=>({addEventListener(type,fn){canvasEvents[type]=fn}}),isStyleLoaded:()=>true,isSourceLoaded:()=>tiles,triggerRepaint(){}};
 Object.assign(globalThis,{document:{body,createElement:element},performance:{now:()=>now},setInterval:()=>1,clearInterval(){}});
 try{
  const loading=createSceneLoading(map,()=> 'walk',{getVisualStatus:()=>visual,onBegin:()=>began++,onComplete:()=>completed++});
  const panel=body.children[1];loading.begin();assert.equal(controls.inert,true);assert.equal(began,1);assert.equal(panel.hidden,false);assert.equal(loading.ready,false);
  tiles=true;now=100;events.sourcedata({sourceId:'accralife-streets',isSourceLoaded:true});assert.equal(panel.hidden,false);
  now=21000;loading.update();assert.equal(loading.entering,true);assert.equal(panel.children[1].hidden,false,'retry appears without revealing the scene');
  visual={ready:true,frame:1};now=22000;loading.update();
  canvasEvents.webglcontextlost({preventDefault(){}});now=22500;visual.frame=2;loading.update();assert.equal(loading.entering,true);
  canvasEvents.webglcontextrestored();now=23000;loading.update();now=23500;visual.frame=3;loading.update();
  assert.equal(loading.entering,false);assert.equal(panel.hidden,true);assert.equal(completed,1);assert.equal(controls.inert,false);
  loading.begin();assert.equal(panel.hidden,false);loading.cancel();assert.equal(panel.hidden,true);assert.equal(body.classList.contains('world-entering'),false);
  events.remove();assert.equal(removed,true);
 }finally{Object.assign(globalThis,saved)}
});
