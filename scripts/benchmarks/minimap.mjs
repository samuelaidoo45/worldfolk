// Offline minimap CPU fixture; the canvas recorder does not rasterize pixels.
// Run from any directory: node /path/to/worldfolk/scripts/benchmarks/minimap.mjs
import {readFileSync,readdirSync} from 'node:fs';
import {createMiniMap} from '../../public/game/minimap.js';

const fixtureDirectory=new URL('../../tests/fixtures/',import.meta.url);
const layers={building:[],road:[],landuse:[],water:[]};
const seen=new Map(Object.keys(layers).map(key=>[key,new Set()]));
for(const name of readdirSync(fixtureDirectory).filter(name=>name.endsWith('-context.json')).sort()){
 const data=JSON.parse(readFileSync(new URL(name,fixtureDirectory)));
 for(const layer of Object.keys(layers))for(const feature of data[layer]||[]){
  // Several context extracts contain the same OSM record. Use the first
  // alphabetically named fixture, consistently across benchmark revisions.
  const id=feature.id??JSON.stringify(feature.geometry);
  if(seen.get(layer).has(id))continue;
  seen.get(layer).add(id);layers[layer].push(feature);
 }
}

function recorder(){
 let points=0,draws=0,sourceReads=0,coordinateSum=0;
 const canvasContext={
  clearRect(){},save(){},restore(){},beginPath(){},arc(){},clip(){},fillRect(){},closePath(){},setLineDash(){},translate(){},rotate(){},fillText(){},strokeText(){},
  measureText:text=>({width:text.length*10}),
  // Consume coordinates so the engine cannot eliminate projection arithmetic.
  moveTo(x,y){points++;coordinateSum+=x+y},lineTo(x,y){points++;coordinateSum+=x+y},fill(){draws++},stroke(){draws++},
 };
 const nodes=new Map(),element=()=>({classList:{toggle(){}},setAttribute(){},click(){}}),root=element();
 root.querySelector=selector=>{
  if(!nodes.has(selector))nodes.set(selector,selector==='canvas'?{...element(),getContext:()=>canvasContext}:element());
  return nodes.get(selector);
 };
 globalThis.document={createElement:()=>root,body:{append(){},classList:{toggle(){}}},getElementById:()=>element()};
 globalThis.localStorage={getItem:()=>null,setItem(){}};
 const state={roam:true,view:'3d',position:[-.1749,5.6204],heading:40,map:{querySourceFeatures(_,{sourceLayer}){sourceReads++;return layers[sourceLayer]||[]}}};
 return {state,stats:()=>({submittedPathPoints:points,submittedCoordinateSum:coordinateSum,fillAndStrokeCalls:draws,sourceReads})};
}

function distribution(values){
 const sorted=values.toSorted((a,b)=>a-b),at=p=>+sorted[Math.ceil(sorted.length*p)-1].toFixed(3);
 return {samples:sorted.length,p50Ms:at(.5),p95Ms:at(.95),p99Ms:at(.99),maxMs:at(1)};
}

const originalPerformance=globalThis.performance,clock=originalPerformance.now.bind(originalPerformance);
const originalDocument=globalThis.document,originalStorage=globalThis.localStorage;
const warmupUpdates=300,measuredUpdates=1200,stepMs=200,runs=[];
let simulationNow=0;
// Map source cache expiry follows game time, not host benchmark execution speed.
globalThis.performance={now:()=>simulationNow};
try{
 for(let run=0;run<3;run++){
  const env=recorder(),radar=createMiniMap({state:env.state,places:()=>[]}),all=[],snapshotRefresh=[],cached=[];
  let startStats;
  for(let frame=0;frame<warmupUpdates+measuredUpdates;frame++){
   simulationNow=(frame+1)*stepMs;
   env.state.position=[-.1749+Math.sin(frame*.01)*.0008,5.6204+Math.cos(frame*.01)*.0008];
   const before=env.stats();if(frame===warmupUpdates)startStats=before;
   const start=clock();radar.update(simulationNow);const elapsed=clock()-start;
   if(frame<warmupUpdates)continue;
   all.push(elapsed);(env.stats().sourceReads>before.sourceReads?snapshotRefresh:cached).push(elapsed);
  }
  const endStats=env.stats(),operations=Object.fromEntries(Object.entries(endStats).map(([key,value])=>[key,value-startStats[key]]));
  runs.push({run:run+1,all:distribution(all),snapshotRefresh:distribution(snapshotRefresh),cached:distribution(cached),operations});
 }
 console.log(JSON.stringify({
  schema:1,node:process.version,platform:process.platform,arch:process.arch,
  fixtureDirectory:'tests/fixtures/*-context.json',features:Object.fromEntries(Object.entries(layers).map(([key,value])=>[key,value.length])),
  route:{name:'Mall–Polo moving minimap',centre:[-.1749,5.6204],canvasPixels:[440,440],stepMs,warmupUpdates,measuredUpdates},runs,
  limitations:[
   'CPU minimap update only; no canvas rasterization, GPU, browser frame timing, DOM layout or real tile-query cost.',
   'All recorded map fixture layers stay loaded; this is a fixed geometry workload, not measured browser tile residency.',
   'No place labels or navigation route are included; this targets base-map geometry and the player marker.',
   'Includes geometry snapshot refreshes every 2.2 seconds at this 5 Hz update cadence; cached updates are reported separately.',
   'Warmup is excluded; host/JIT variation remains. No timing pass/fail thresholds or physical-phone performance claim.',
  ],
 },null,2));
}finally{
 globalThis.performance=originalPerformance;
 if(originalDocument===undefined)delete globalThis.document;else globalThis.document=originalDocument;
 if(originalStorage===undefined)delete globalThis.localStorage;else globalThis.localStorage=originalStorage;
}
