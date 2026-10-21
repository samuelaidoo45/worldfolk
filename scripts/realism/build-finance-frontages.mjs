import {writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {FINANCE_OUTLINES,FINANCE_GATES,FINANCE_TREE_SEEDS} from '../../public/game/finance-frontage-data.js';
import {CIVIC_BUILDINGS,CIVIC_ROADS} from '../../public/game/independence-neighbourhood-map.js';
import {offsetMetres,distanceMetres,projectOnSegment} from '../../public/game/motion.js';
import {areaInside} from '../../public/game/mahama-neighbourhood-data.js';
import {roadWidth} from '../../public/game/street-safety.js';
const root=new URL('../../',import.meta.url);
const roadClear=(p,r=0)=>!CIVIC_ROADS.filter(r=>!['path','pedestrian','steps','cycleway'].includes(r.class)).some(road=>road.coordinates.slice(1).some((b,i)=>projectOnSegment(p,road.coordinates[i],b).distance<roadWidth(road.class)/2+r));
const buildingClear=(p,r=0)=>!CIVIC_BUILDINGS.some(b=>areaInside(p,b.rings)||b.rings.some(ring=>ring.slice(1).some((b,i)=>projectOnSegment(p,ring[i],b).distance<r)));
const FINANCE_BOUNDARIES=[],FINANCE_PAVING=[];
for(const line of FINANCE_OUTLINES){const count=Math.ceil(distanceMetres(line.a,line.b)/2.8);for(let i=0;i<count;i++){
 const a=line.a.map((n,k)=>n+(line.b[k]-n)*i/count),b=line.a.map((n,k)=>n+(line.b[k]-n)*(i+1)/count),mid=a.map((n,k)=>(n+b[k])/2);
 if(![a,mid,b].every(p=>roadClear(p,.35)&&buildingClear(p,.4)))continue;
 if(!FINANCE_GATES.some(g=>g.zone===line.zone&&projectOnSegment(g.position,a,b).distance<g.width/2+1))FINANCE_BOUNDARIES.push({...line,a,b});
 const shift=line.zone==='commission'?1.6:-1.6,pa=offsetMetres(a,0,shift),pb=offsetMetres(b,0,shift);
 if([pa,pb].every(p=>roadClear(p,1.0)&&buildingClear(p,1)))FINANCE_PAVING.push({zone:line.zone,a:pa,b:pb,width:1.7});
}}
const FINANCE_TREES=FINANCE_TREE_SEEDS.filter(t=>roadClear(t.position,1)&&buildingClear(t.position,1));
const FINANCE_LAYOUT_SOURCES=Object.fromEntries(['scripts/realism/build-finance-frontages.mjs','public/game/finance-frontage-data.js','public/game/independence-neighbourhood-map.js'].map(p=>[p,createHash('sha256').update(readFileSync(new URL(p,root))).digest('hex')]));
writeFileSync(new URL('public/game/finance-frontage-map.js',root),'// Generated offline; estimated frontages clipped against native roads and buildings.\n'+Object.entries({FINANCE_LAYOUT_SOURCES,FINANCE_BOUNDARIES,FINANCE_PAVING,FINANCE_TREES}).map(([k,v])=>'export const '+k+'='+JSON.stringify(v)+';').join('\n')+'\n');
console.log('Baked',FINANCE_BOUNDARIES.length,'boundary sections,',FINANCE_PAVING.length,'paved sections and',FINANCE_TREES.length,'trees');
