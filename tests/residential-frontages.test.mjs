import test from 'node:test';
import * as T from '../public/game/three.module.js';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {RESIDENTIAL_BLOCK,RESIDENTIAL_MASSES,RESIDENTIAL_RINGS,RESIDENTIAL_ROADS,RESIDENTIAL_GATES,RESIDENTIAL_ACTIVITIES,residentialRoadClear,residentialBuildingClear,residentialColliders,residentialLocal,residentialPoint} from '../public/game/airport-residential-data.js';
import {createResidentialBlock} from '../public/game/airport-residential.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {disposeScene} from '../public/game/render-utils.js';
import {distanceMetres,bearingTo} from '../public/game/motion.js';
const context=JSON.parse(readFileSync(new URL('./fixtures/airport-residential-context.json',import.meta.url)));
function physics(){const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>context.building,isSourceLoaded:()=>true});p.refresh(RESIDENTIAL_BLOCK.position,true);return p;}

test('the four new roadside structures retain their individual mapped outlines and exterior forms',()=>{
 const expected=new Map([[2883827352,'annex'],[2883827354,'gatehouse'],[2883827346,'modern'],[2407935212,'veranda']]);
 for(const [id,form] of expected){const mass=RESIDENTIAL_MASSES.find(m=>m.source===id);assert.equal(mass.frontage,form);assert.ok(RESIDENTIAL_BLOCK.sourceIds.includes(id));assert.deepEqual(RESIDENTIAL_RINGS[id],context.building.find(f=>f.id===id).geometry.coordinates[0]);assert.equal(residentialColliders().find(c=>c.id==='residential:'+mass.id).noDoor,true);}
 assert.ok(!RESIDENTIAL_BLOCK.sourceIds.includes(2475832956),'the obscured eastern building is not replaced by an invented facade');
});

test('closed compound gates block entry but allow retreat to the public street',()=>{
 const p=physics();for(const gate of RESIDENTIAL_GATES){const centre=gate.a.map((v,i)=>(v+gate.b[i])/2),[x,z]=residentialLocal(centre),side=gate.id.startsWith('east')?-1:1,outside=gate.id.startsWith('south-')?residentialPoint(x,z-2):gate.id.startsWith('north-')?residentialPoint(x,z+2):residentialPoint(x+2*side,z),inside=gate.id.startsWith('south-')?residentialPoint(x,z+2):gate.id.startsWith('north-')?residentialPoint(x,z-2):residentialPoint(x-2*side,z);
 assert.match(p.collision(centre,.32)?.id||'',/residential:gate:/,gate.id);
 const hit=p.moveWalker(outside,inside);assert.ok(distanceMetres(hit.position,inside)>1,gate.id+' blocks entry');
 const retreat=p.moveWalker(hit.position,outside);assert.ok(distanceMetres(retreat.position,outside)<.1,gate.id+' permits retreat');}
});

test('a minibus and a walking player can traverse every surveyed public-road segment after the frontage additions',()=>{
 const p=physics();for(const road of RESIDENTIAL_ROADS.filter(r=>r.id!==1351987028))for(let i=1;i<road.coordinates.length;i++){
 const a=road.coordinates[i-1],b=road.coordinates[i],length=distanceMetres(a,b);for(let d=0;d<length;d+=2){const t=d/length,u=Math.min(1,(d+2)/length),start=a.map((v,j)=>v+(b[j]-v)*t),end=a.map((v,j)=>v+(b[j]-v)*u);
 if(start[0]<-.18055||start[0]>-.1778||start[1]<5.6163||start[1]>5.61776)continue;
 assert.equal(p.moveVehicle(start,end,bearingTo(start,end),'minibus').blocked,false,road.name+' '+start);
 assert.ok(distanceMetres(p.moveWalker(start,end).position,end)<.1,road.name+' walker');}}
});

test('roof surfaces survive static batching with complete vertex attributes and a bounded draw budget',()=>{
 const {group}=createResidentialBlock();try{assert.equal(group.userData.frontages.length,12);assert.ok(group.userData.batching.after<46,JSON.stringify(group.userData.batching));let tiles=0;
 group.traverse(o=>{if(!o.isMesh)return;const attrs=o.geometry.attributes,count=attrs.position.count;assert.ok(Array.from(attrs.position.array).every(Number.isFinite));if(attrs.uv)assert.equal(attrs.uv.count,count,'batched '+o.material.userData.surface+' UV count');if(o.material.color?.getHexString()==='784638'){tiles++;assert.ok(count>72);assert.equal(attrs.normal.count,count);assert.equal(attrs.uv.count,count);}});assert.equal(tiles,1,'the authored red roofs and courses share one valid batch');
 }finally{disposeScene(group);}
});


test('the next north-side batch preserves three separate native buildings and keeps other properties untouched',()=>{
 for(const [id,form] of [[2746717488,'arched'],[2407935214,'screened'],[1337567096,'west-cream']]){
  assert.equal(RESIDENTIAL_MASSES.find(m=>m.source===id).frontage,form);
  assert.deepEqual(RESIDENTIAL_RINGS[id],context.building.find(f=>f.id===id).geometry.coordinates[0]);
  assert.ok(RESIDENTIAL_BLOCK.sourceIds.includes(id));
 }
 assert.ok(!RESIDENTIAL_BLOCK.sourceIds.includes(1330242144),'the concealed rear annex is not given an unverified facade');
});

test('the terracotta arch has an open curved portal and solid piers after batching',()=>{
 const {group}=createResidentialBlock();try{
  group.updateMatrixWorld(true);const ring=RESIDENTIAL_RINGS[2746717488].map(residentialLocal),cx=(Math.min(...ring.map(p=>p[0]))+Math.max(...ring.map(p=>p[0])))/2,front=Math.max(...ring.map(p=>p[1]))-.25;
  const ray=(x,y)=>new T.Raycaster(new T.Vector3(x,y,front+1),new T.Vector3(0,0,-1),0,10).intersectObject(group,true).filter(h=>h.object.material.color?.getHexString()==='ac6c51')[0]?.distance;
  assert.ok(ray(cx,4.3)>2.5,'portal opens onto the recessed veranda');
  assert.ok(ray(cx+2.55,3.5)<1.1,'the neighbouring pier remains solid');
  assert.ok(ray(cx,6.5)<1.1,'solid spandrel above the curved opening');
 }finally{disposeScene(group);}
});

test('new street observation points stay on public ground with a clear approach',()=>{
 const p=physics();for(const id of ['kofi-arched-view','kofi-west-buildings-view']){
  const a=RESIDENTIAL_ACTIVITIES.find(a=>a.id===id);assert.ok(a);assert.ok(residentialRoadClear(a.position,.3));assert.ok(residentialBuildingClear(a.position,.3));assert.equal(p.collision(a.position,.32),null);
  const [x,z]=residentialLocal(a.position),approach=residentialPoint(x,z+1);assert.ok(distanceMetres(p.moveWalker(approach,a.position).position,a.position)<.1);
 }
});


test('the south-side batch retains four separate native outlines and reference-specific forms',()=>{
 for(const [id,form] of [[2518360966,'south-grey'],[1330242142,'south-glass'],[1330242146,'south-screen'],[2883827358,'south-tiled']]){
  assert.equal(RESIDENTIAL_MASSES.find(m=>m.source===id).frontage,form);
  assert.deepEqual(RESIDENTIAL_RINGS[id],context.building.find(f=>f.id===id).geometry.coordinates[0]);
  assert.ok(RESIDENTIAL_BLOCK.sourceIds.includes(id));
 }
 assert.ok(!RESIDENTIAL_BLOCK.sourceIds.includes(1330242144));
});

test('the tiled south house leaves its native north-east roof notch open',()=>{
 const {group}=createResidentialBlock();try{group.updateMatrixWorld(true);
  const r=RESIDENTIAL_RINGS[2883827358].map(residentialLocal),x=Math.max(...r.map(p=>p[0]))-2,z=Math.min(...r.map(p=>p[1]))+3;
  const hits=new T.Raycaster(new T.Vector3(x,12,z),new T.Vector3(0,-1,0),0,6).intersectObject(group,true).filter(h=>h.object.material.color?.getHexString()==='784638');
  assert.equal(hits.length,0,'the connected roof must not bridge the native open notch');
 }finally{disposeScene(group);}
});
