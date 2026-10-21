import test from 'node:test';import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';import {createHash} from 'node:crypto';
import {FINANCE_FRONTAGE_IDS,FINANCE_BOUNDARIES,FINANCE_PAVING,FINANCE_GATES,FINANCE_PARKING,FINANCE_ACTIVITIES,financeColliders} from '../public/game/finance-frontage-data.js';
import {FINANCE_LAYOUT_SOURCES} from '../public/game/finance-frontage-map.js';
import {CIVIC_BUILDINGS,CIVIC_SITES,CIVIC_VISITS,civicInside,civicRoadClear,civicBuildingClear,civicColliders,civicForPlace} from '../public/game/independence-neighbourhood-data.js';
import {distanceMetres,offsetMetres,projectOnSegment} from '../public/game/motion.js';
import {createCityLandmark} from '../public/game/city-landmarks.js';import {modelCost} from '../public/game/world-streaming.js';import {disposeScene} from '../public/game/render-utils.js';
test('Finance Drive retains five exact native plates and both mapped courtyard holes',()=>{
 const native=JSON.parse(readFileSync(new URL('./fixtures/independence-neighbourhood-context.json',import.meta.url)));
 for(const id of FINANCE_FRONTAGE_IDS){const b=CIVIC_BUILDINGS.find(b=>b.id===id);assert.deepEqual(b.rings,native.buildings.find(f=>f.id===id).geometry.coordinates);assert.ok(b.family!=='mapped-context');assert.equal(b.dimensionsEstimated,true);}
 assert.equal(CIVIC_BUILDINGS.find(b=>b.id===16546541).rings.length,3);
 assert.equal(CIVIC_SITES.find(s=>s.zone==='commission').sourceIds.length,2);
});
test('offline frontage survey stays pinned to its inputs',()=>{
 for(const [p,hash] of Object.entries(FINANCE_LAYOUT_SOURCES))assert.equal(createHash('sha256').update(readFileSync(new URL('../'+p,import.meta.url))).digest('hex'),hash,p);
 assert.ok(FINANCE_BOUNDARIES.length>40);assert.ok(FINANCE_PAVING.length>30);
});
test('fences and paved drains clear native roads, mapped buildings and entrance gaps',()=>{
 for(const s of FINANCE_BOUNDARIES){for(const p of [s.a,s.b]){assert.ok(civicRoadClear(p,.3));assert.ok(civicBuildingClear(p,.35));}for(const g of FINANCE_GATES.filter(g=>g.zone===s.zone))assert.ok(projectOnSegment(g.position,s.a,s.b).distance>g.width/2);}
 for(const s of FINANCE_PAVING)for(const p of [s.a,s.b]){assert.ok(civicRoadClear(p,s.width/2));assert.ok(civicBuildingClear(p,s.width/2));}
 for(const s of FINANCE_PARKING)for(const p of [s.a,s.b]){assert.ok(civicRoadClear(p,s.width/2));assert.ok(civicBuildingClear(p,s.width/2));}
 for(const g of FINANCE_GATES)for(const dz of [-1,0,1])assert.ok(!financeColliders(g.zone).some(c=>civicInside(offsetMetres(g.position,0,dz),c.rings)),'open gate');
});
test('new photo activity has a clear route from the saved Finance Drive arrival',()=>{
 const a=CIVIC_VISITS.find(v=>v.site==='finance').position,b=FINANCE_ACTIVITIES[0].position,shapes=civicColliders(CIVIC_SITES.find(s=>s.zone==='finance'));
 const count=Math.ceil(distanceMetres(a,b)/.25);for(let i=0;i<=count;i++){const p=a.map((n,k)=>n+(b[k]-n)*i/count);assert.ok(civicRoadClear(p,.32));assert.ok(civicBuildingClear(p,.32));assert.ok(!shapes.some(c=>civicInside(p,c.rings)));}
 assert.match(CIVIC_VISITS.find(v=>v.site==='finance').text,/moved.*Kanda.*2026/);
 assert.ok(CIVIC_VISITS.find(v=>v.site==='commission'));
 assert.equal(civicForPlace({name:'Ministry of Finance',lng:-.19,lat:5.60}),undefined,'Kanda must not resolve to the old Finance Drive visit');
 assert.equal(financeColliders('finance'),financeColliders('finance'),'cached colliders');
});
test('added models fit the previous whole-precinct geometry budget without frame callbacks',()=>{
 let total=0;for(const s of CIVIC_SITES){const m=createCityLandmark(s),cost=modelCost(m.group);total+=cost.vertices;if(['finance','commission'].includes(s.zone)){assert.ok(!m.update);assert.ok(cost.vertices<120000);assert.ok(cost.draws<=18);}disposeScene(m.group);}assert.ok(total<498220,'at most the previous public-spaces pass');
});
