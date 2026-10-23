// Deterministic CPU fixture for the two schema-4 gameplay bottlenecks.
// Includes real authored geometry; excludes browser, GPU and network time.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {createBuildingPhysics} from '../../public/game/building-physics.js';
import {offsetMetres,bearingTo} from '../../public/game/motion.js';
const source=[];
for(const name of fs.readdirSync(new URL('../../tests/fixtures/',import.meta.url)).filter(n=>n.endsWith('-context.json')).sort()){
 const data=JSON.parse(fs.readFileSync(new URL('../../tests/fixtures/'+name,import.meta.url)));
 source.push(...(data.building||data.buildings||[]));
}
const buildings=[...new Map(source.map(f=>[f.id+':'+JSON.stringify(f.geometry),f])).values()];
const distribution=values=>{const s=values.sort((a,b)=>a-b),p=q=>+s[Math.ceil(s.length*q)-1].toFixed(3);return {samples:s.length,p50:p(.5),p95:p(.95),max:p(1)}};
const results=[];
for(const [name,origin] of [['Mall',[-.175,5.624]],['Square',[-.19256,5.54742]],['Osu',[-.189,5.549]]]){
 const physics=createBuildingPhysics({queryRenderedFeatures:()=>buildings,querySourceFeatures:()=>buildings,getSource:()=>true,project:()=>({x:0,y:0}),isSourceLoaded:()=>true});
 const refresh=[];for(let n=0;n<10;n++){const start=performance.now();physics.refresh(origin,true);refresh.push(performance.now()-start);}
 const geometryHash=createHash('sha256').update(JSON.stringify(physics.nearby)).digest('hex');
 const poses=[];
 for(const f of physics.nearby){for(const ring of f.rings.slice(0,1)){if(ring.length<2)continue;const a=ring[0],b=ring[1],mid=a.map((v,i)=>(v+b[i])/2);for(const side of [-2,0,2])poses.push({p:offsetMetres(mid,side,side),heading:bearingTo(a,b)+25});}if(poses.length>=180)break;}
 const durations=[],hash=createHash('sha256');let blocked=0;
 for(let repeat=0;repeat<2;repeat++)for(const {p,heading} of poses)for(const kind of ['car','bus','bicycle']){
  const a=heading*Math.PI/180,to=offsetMetres(p,Math.sin(a)*.7,Math.cos(a)*.7),start=performance.now(),result=physics.moveVehicle(p,to,heading,kind);
  durations.push(performance.now()-start);blocked+=+result.blocked;hash.update(JSON.stringify(result));
 }
 results.push({name,colliders:physics.count,geometryHash,refreshMs:distribution(refresh),movementMs:distribution(durations),blocked,resultHash:hash.digest('hex')});
}
console.log(JSON.stringify({fixture:'physics-hotpaths-v1',sourceBuildings:buildings.length,results},null,2));
