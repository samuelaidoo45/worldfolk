import pc from 'polygon-clipping';
import {readFileSync,writeFileSync} from 'node:fs';import {gunzipSync} from 'node:zlib';import {createHash} from 'node:crypto';
import {COAST_BOUNDS,COAST_SURFACE_SEEDS,COAST_TREE_SEEDS,CLUB_WALL_OUTLINE,CLUB_GATE,coastLineRing} from '../../public/game/coastal-precinct-data.js';
import {CIVIC_ROADS,CIVIC_BUILDINGS} from '../../public/game/independence-neighbourhood-map.js';
import {areaInside} from '../../public/game/mahama-neighbourhood-data.js';
import {roadWidth} from '../../public/game/street-safety.js';import {distanceMetres,projectOnSegment} from '../../public/game/motion.js';
const root=new URL('../../',import.meta.url),origin=[-.1945,5.5463],cos=Math.cos(origin[1]*Math.PI/180),to=p=>[(p[0]-origin[0])*111320*cos,(origin[1]-p[1])*111320],from=p=>[+(origin[0]+p[0]/(111320*cos)).toFixed(10),+(origin[1]-p[1]/111320).toFixed(10)];
const poly=r=>[r.map(to)],geom=rs=>rs.map(r=>r.map(to));
const bounds=poly([[COAST_BOUNDS[0],COAST_BOUNDS[1]],[COAST_BOUNDS[2],COAST_BOUNDS[1]],[COAST_BOUNDS[2],COAST_BOUNDS[3]],[COAST_BOUNDS[0],COAST_BOUNDS[3]],[COAST_BOUNDS[0],COAST_BOUNDS[1]]]);
function strip(a,b,w){const A=to(a),B=to(b),dx=B[0]-A[0],dy=B[1]-A[1],len=Math.hypot(dx,dy),nx=-dy/len*w/2,ny=dx/len*w/2;return [[[A[0]+nx,A[1]+ny],[B[0]+nx,B[1]+ny],[B[0]-nx,B[1]-ny],[A[0]-nx,A[1]-ny],[A[0]+nx,A[1]+ny]]];}
const roadway=CIVIC_ROADS.filter(r=>!['path','pedestrian','steps','cycleway'].includes(r.class)),roadParts=[];
for(const r of roadway)for(let i=1;i<r.coordinates.length;i++)roadParts.push(strip(r.coordinates[i-1],r.coordinates[i],roadWidth(r.class)+.8));
const native=JSON.parse(readFileSync(new URL('tests/fixtures/independence-neighbourhood-context.json',root))),buildings=native.buildings.map(b=>geom(b.geometry.coordinates));
const square=poly(CIVIC_ROADS.find(r=>r.id===11529315).coordinates);
const waterSource='public/maps/accra-v1/source-water-0.geojson.gz',water=JSON.parse(gunzipSync(readFileSync(new URL(waterSource,root)))),ocean=geom(water.features.find(f=>f.properties.class==='ocean').geometry.coordinates);
const obstacles=pc.union(...roadParts,...buildings,square,ocean);
const COAST_OCEAN=pc.intersection(ocean,bounds).map(g=>g.map(r=>r.map(from)));
const boundary=zone=>zone==='shore-west'?pc.intersection(bounds,poly([[-.1976,5.5445],[-.1948,5.5445],[-.1948,5.5479],[-.1976,5.5479],[-.1976,5.5445]])):pc.intersection(bounds,poly([[-.1948,5.5445],[-.1905,5.5445],[-.1905,5.5479],[-.1948,5.5479],[-.1948,5.5445]]));
const roadsForWalk=roadway.filter(r=>[352160511,13787506].includes(r.id)),walkBands=[];
for(const r of roadsForWalk)for(let i=1;i<r.coordinates.length;i++)walkBands.push(strip(r.coordinates[i-1],r.coordinates[i],roadWidth(r.class)+4.2));
const walks=pc.difference(pc.intersection(pc.union(...walkBands),bounds),obstacles);
const cover=COAST_SURFACE_SEEDS.filter(s=>s.kind!=='earth').map(s=>({kind:s.kind,shape:pc.difference(pc.intersection(poly(s.ring),bounds),obstacles,walks)}));
const bare=pc.difference(pc.intersection(pc.union(...COAST_SURFACE_SEEDS.filter(s=>s.kind==='earth').map(s=>poly(s.ring))),bounds),obstacles,walks,...cover.map(s=>s.shape));
const COAST_GROUND=[],COAST_WALKS=[];
const area=ring=>Math.abs(ring.slice(1).reduce((n,b,i)=>n+ring[i][0]*b[1]-b[0]*ring[i][1],0))/2;
for(const zone of ['shore-west','shore-east']){
 for(const s of [{kind:'earth',shape:bare},...cover])for(const g of pc.intersection(s.shape,boundary(zone)))if(area(g[0])>.5)COAST_GROUND.push({zone,kind:s.kind,rings:g.map(r=>r.map(from)),layoutEstimated:true});
 for(const g of pc.intersection(walks,boundary(zone)))if(area(g[0])>.5)COAST_WALKS.push({zone,kind:'compacted-verge',rings:g.map(r=>r.map(from)),layoutEstimated:true});
}
const roadClear=(p,pad)=>!roadway.some(r=>r.coordinates.slice(1).some((b,i)=>projectOnSegment(p,r.coordinates[i],b).distance<roadWidth(r.class)/2+pad));
const buildingClear=(p,pad)=>!CIVIC_BUILDINGS.some(b=>areaInside(p,b.rings)||b.rings.some(r=>r.slice(1).some((q,i)=>projectOnSegment(p,r[i],q).distance<pad)));
const COAST_WALLS=[];
for(const [a,b] of CLUB_WALL_OUTLINE){const n=Math.ceil(distanceMetres(a,b)/2.5);for(let i=0;i<n;i++){const A=a.map((v,k)=>v+(b[k]-v)*i/n),B=a.map((v,k)=>v+(b[k]-v)*(i+1)/n),p=A.map((v,k)=>(v+B[k])/2);if([A,p,B].every(p=>roadClear(p,.35)&&buildingClear(p,.6))&&projectOnSegment(CLUB_GATE.position,A,B).distance>CLUB_GATE.width/2+1)COAST_WALLS.push({zone:'club',a:A,b:B,height:1.6});}}
const COAST_TREES=COAST_TREE_SEEDS.filter(t=>roadClear(t.position,1.2)&&buildingClear(t.position,1.4)).map(t=>({...t,zone:'club'}));
const sources=['public/game/coastal-precinct-data.js','public/game/independence-neighbourhood-map.js','tests/fixtures/independence-neighbourhood-context.json',waterSource,'scripts/realism/build-coastal-precinct.mjs'];
const COAST_LAYOUT_SOURCES=Object.fromEntries(sources.map(p=>[p,createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex')]));
writeFileSync(new URL('public/game/coastal-precinct-map.js',root),'// Offline geometry only. OSM / ODbL; observed cover and compound dimensions are estimates.\n'+Object.entries({COAST_LAYOUT_SOURCES,COAST_GROUND,COAST_WALKS,COAST_WALLS,COAST_TREES,COAST_OCEAN}).map(([k,v])=>'export const '+k+'='+JSON.stringify(v)+';').join('\n')+'\n');
console.log({groundPolygons:COAST_GROUND.length,walkPolygons:COAST_WALKS.length,wallSections:COAST_WALLS.length,trees:COAST_TREES.length});
