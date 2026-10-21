// Offline CPU regression fixture, not a renderer/FPS or physical-phone test.
// Run from any directory: node scripts/benchmarks/simulation.mjs
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {createCityLife} from '../../public/game/city-life.js';
import {offsetMetres} from '../../public/game/motion.js';

const fixtures=new URL('../../tests/fixtures/',import.meta.url),roads=[];
for(const file of fs.readdirSync(fixtures).filter(f=>f.endsWith('-context.json')).sort()){
 const data=JSON.parse(fs.readFileSync(new URL(file,fixtures)));roads.push(...(data.road||[]));
}
const features=[...new Map(roads.map(f=>[f.id+':'+JSON.stringify(f.geometry),f])).values()];
const physics={count:1,collision:()=>null,vehicleCollision:()=>null,move:(a,b)=>({position:b,blocked:false}),moveVehicle:(a,b)=>({position:b,blocked:false})};
const originalPerformance=globalThis.performance,clock=originalPerformance.now.bind(originalPerformance);
const routes=[{name:'Polo–Airport',origin:[-.177,5.612]},{name:'Mall interchange',origin:[-.175,5.624]}];
let simulationNow=0,sourceReads=0;
// Stable cache expiry and seeding, independent of how fast the host executes.
globalThis.performance={now:()=>simulationNow};
const distribution=values=>{const sorted=[...values].sort((a,b)=>a-b),at=p=>+sorted[Math.ceil(sorted.length*p)-1].toFixed(3);return {samples:sorted.length,p50Ms:at(.5),p95Ms:at(.95),p99Ms:at(.99),maxMs:at(1),over16Ms:values.filter(t=>t>16).length};};
try{
 const results=[];
 for(const route of routes){
  const samples=[],initial=[],checksums=[];let maxActors=0;
  for(let run=0;run<4;run++){
   simulationNow=4000;
   const city=createCityLife({querySourceFeatures:()=>{sourceReads++;return features;}},physics);
   for(let frame=0;frame<1200;frame++){
    simulationNow=4000+frame*1000/60;
    const position=offsetMetres(route.origin,Math.sin(frame/600)*200,-frame*.12),start=clock();
    city.tick(1/60,position,simulationNow,'walk');
    const elapsed=clock()-start;if(run===0)initial.push(elapsed);else samples.push(elapsed);
    maxActors=Math.max(maxActors,city.actors.length);
   }
   checksums.push(createHash('sha256').update(JSON.stringify(city.actors)).digest('hex'));
  }
  results.push({route:route.name,maxActors,initial:distribution(initial),repeated:distribution(samples),checksums});
 }
 console.log(JSON.stringify({schema:1,node:process.version,platform:process.platform,arch:process.arch,fixtureDirectory:fileURLToPath(fixtures).split('/').slice(-3).join('/'),roadFeatures:features.length,sourceReads,results,limitations:['CPU simulation only; no browser, GPU, shader startup or building collisions.','Fixed 60 Hz simulation steps do not measure rendered frame intervals.','Repeated runs include ordinary host/JIT variability.']},null,2));
}finally{globalThis.performance=originalPerformance;}
