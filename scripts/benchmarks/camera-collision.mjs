// CPU camera-clearance fixture; excludes browser rendering, GPU and streaming.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createBuildingPhysics} from '../../public/game/building-physics.js';
import {chaseCamera} from '../../public/game/chase-camera.js';
import {offsetMetres} from '../../public/game/motion.js';

const fixtureDirectory=new URL('../../tests/fixtures/',import.meta.url),source=[];
for(const file of fs.readdirSync(fixtureDirectory).filter(f=>f.endsWith('-context.json')).sort()){
  const data=JSON.parse(fs.readFileSync(new URL(file,fixtureDirectory)));
  source.push(...(data.building||data.buildings||[]));
}
const buildings=[...new Map(source.map(f=>[f.id+':'+JSON.stringify(f.geometry),f])).values()];
const distribution=values=>{
  const sorted=[...values].sort((a,b)=>a-b),at=p=>+sorted[Math.ceil(sorted.length*p)-1].toFixed(3);
  return {samples:sorted.length,p50Ms:at(.5),p95Ms:at(.95),p99Ms:at(.99),maxMs:at(1)};
};
const results=[];
for(const [name,origin] of [['Polo',[-.177,5.612]],['Mall interchange',[-.175,5.624]],['Independence Square',[-.19256,5.54742]]]){
  const physics=createBuildingPhysics({queryRenderedFeatures:()=>buildings,querySourceFeatures:()=>buildings,getSource:()=>true,project:()=>({x:0,y:0}),isSourceLoaded:()=>true});
  physics.refresh(origin,true);
  const initial=[],repeated=[],checksums=[];let probes=0;
  for(let run=0;run<4;run++){
    const hash=createHash('sha256');let previousDistance;
    for(let frame=0;frame<1200;frame++){
      const position=offsetMetres(origin,Math.sin(frame/600)*40,0),start=performance.now();
      const pose=chaseCamera({position,heading:frame/6,physics:{collision:(...args)=>{probes++;return physics.collision(...args);}},previousDistance,dt:1/60,driving:true,speed:20});
      (run===0?initial:repeated).push(performance.now()-start);
      previousDistance=pose.distance;hash.update(JSON.stringify(pose));
    }
    checksums.push(hash.digest('hex'));
  }
  results.push({name,colliders:physics.count,probesPerFrame:probes/4800,initial:distribution(initial),repeated:distribution(repeated),checksums});
}
console.log(JSON.stringify({node:process.version,platform:process.platform,arch:process.arch,sourceBuildings:buildings.length,results,limitations:['CPU camera collision only; excludes browser, GPU, frame intervals and streaming.','Fixed fixture neighbourhood per route; no claim of physical-phone performance.']},null,2));
