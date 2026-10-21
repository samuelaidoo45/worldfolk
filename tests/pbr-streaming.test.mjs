import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import * as T from '../public/game/three.module.js';
import {tagSurface,enhanceMaterials} from '../public/game/graphics-materials.js';
import {batchStaticMeshes,disposeScene} from '../public/game/render-utils.js';
import {planLandmarkStream,landmarkRange,createRenderMetrics,actorRenderPolicy,createResolutionGovernor,planFacadeDetails,selectAmbientDetails} from '../public/game/world-streaming.js';
import {offsetMetres} from '../public/game/motion.js';
const origin=[-.177,5.612];
test('local texture pack is licensed, pinned, bounded and unmodified',()=>{
 const base=new URL('../public/game/assets/materials/',import.meta.url),manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',base)));
 assert.equal(manifest.license,'CC0-1.0');let total=0;
 for(const asset of manifest.assets){assert.ok(asset.source.startsWith('https://polyhaven.com/a/'));assert.ok(Object.keys(asset.authors).length);for(const output of asset.outputs){const data=fs.readFileSync(new URL(output.file,base));assert.equal(createHash('sha256').update(data).digest('hex'),output.sha256);assert.equal(data.length,output.bytes);total+=data.length;}}
 assert.equal(total,manifest.totalBytes);assert.ok(total<2000000);
});
test('PBR maps are shared, colour-managed and survive streamed model disposal',()=>{
 const roots=Array.from({length:3},()=>{const g=new T.Group();g.add(new T.Mesh(new T.BoxGeometry(4,4,4),tagSurface(new T.MeshStandardMaterial(),'plaster')));batchStaticMeshes(g);return g;});
 const materials=roots.map(g=>g.children[0].material);assert.equal(materials[0].map,materials[1].map);assert.equal(materials[0].normalMap,materials[2].normalMap);
 assert.equal(materials[0].map.colorSpace,T.SRGBColorSpace);assert.equal(materials[0].normalMap.colorSpace,T.NoColorSpace);assert.equal(materials[0].roughnessMap.colorSpace,T.NoColorSpace);
 let disposed=0;materials[0].map.addEventListener('dispose',()=>disposed++);roots.forEach(disposeScene);assert.equal(disposed,0);
});
test('metre UVs retain texture density after transforms and batching, without touching art',()=>{
 const root=new T.Group(),wall=tagSurface(new T.MeshStandardMaterial(),'plaster'),art=new T.Texture(),sign=tagSurface(new T.MeshStandardMaterial({map:art}),'plaster');
 for(const x of [0,8]){const m=new T.Mesh(new T.BoxGeometry(4,4,1),wall);m.position.x=x;root.add(m);}
 const signMesh=new T.Mesh(new T.PlaneGeometry(4,2),sign);root.add(signMesh);const artUV=Array.from(signMesh.geometry.attributes.uv.array);
 const bounds=new T.Box3().setFromObject(root);batchStaticMeshes(root);assert.equal(root.children.length,2);assert.equal(sign.map,art);assert.deepEqual(Array.from(signMesh.geometry.attributes.uv.array),artUV);
 const mesh=root.children.find(m=>m.material===wall),uv=Array.from(mesh.geometry.attributes.uv.array);assert.ok(Math.max(...uv)>=5);assert.ok([...mesh.geometry.attributes.position.array,...uv].every(Number.isFinite));
 assert.ok(bounds.min.distanceTo(new T.Box3().setFromObject(root).min)<1e-5);assert.ok(bounds.max.distanceTo(new T.Box3().setFromObject(root).max)<1e-5);const saved=Array.from(mesh.geometry.attributes.uv.array);batchStaticMeshes(root);assert.deepEqual(Array.from(mesh.geometry.attributes.uv.array),saved);disposeScene(root);
});
test('nearby models load first and measured costs bound retention during travel',()=>{
 const items=Array.from({length:80},(_,i)=>({data:{id:'block-'+i,position:offsetMetres(origin,i*20,0),width:20,depth:20,height:4},model:{},cost:{vertices:100000,draws:20}}));
 const first=planLandmarkStream(items,origin);assert.equal(first.selected[0],items[0]);assert.ok(first.selected.length<=24);assert.ok(first.usage.vertices<=first.budget.vertices);assert.ok(first.usage.draws<=first.budget.draws);
 const moved=planLandmarkStream(items,offsetMetres(origin,1500,0));assert.ok(moved.evict.includes(items[0]));assert.equal(moved.selected[0],items[75]);assert.ok(moved.selected.length<=24);
 const mobile=planLandmarkStream(items,origin,{mobile:true});assert.ok(mobile.usage.vertices<=650000);assert.ok(mobile.usage.draws<=180);assert.ok(mobile.selected.length<=12);
});
test('stream hysteresis avoids boundary churn and towers/large footprints remain visible',()=>{
 const data={id:'a',position:origin,width:40,depth:40,height:8},range=landmarkRange(data),outside=offsetMetres(origin,range+50,0);
 assert.equal(planLandmarkStream([{data}],outside).selected.length,0);assert.equal(planLandmarkStream([{data,model:{}}],outside).selected.length,1);
 assert.ok(landmarkRange({...data,height:60})>range);assert.ok(landmarkRange({...data,width:600,depth:600})>range);
});
test('costly packages are remembered and not rebuilt in a rejection loop',()=>{
 const near={data:{id:'near',position:origin},model:{},cost:{vertices:800000,draws:100}},far={data:{id:'far',position:offsetMetres(origin,50,0)},cost:{vertices:2000000,draws:400}};
 const p=planLandmarkStream([near,far],origin);assert.deepEqual(p.selected,[near]);assert.equal(p.next,undefined);
});
test('near detail falls back to a complete lighter exterior when the budget is full',()=>{
 const make=(id,metres,near,medium)=>({data:{id,position:offsetMetres(origin,metres,0),height:40},preferredDetail:'near',costs:{near:{vertices:near,draws:20},medium:{vertices:medium,draws:10}}});
 const items=[make('at-player',0,500000,100000),make('other-tower',80,400000,70000)];
 let plan=planLandmarkStream(items,origin,{mobile:true});assert.deepEqual(plan.selected,items);assert.equal(items[0].desiredDetail,'near');assert.equal(items[1].desiredDetail,'medium');assert.equal(plan.usage.vertices,570000);
 // A detail change is queued while the existing exterior remains installed.
 items.forEach(i=>{i.model={};i.detail=i.desiredDetail;});items[1].detail='near';
 plan=planLandmarkStream(items,origin,{mobile:true});assert.equal(plan.next,items[1]);assert.deepEqual(plan.evict,[]);
 items[1].detail='medium';assert.equal(planLandmarkStream(items,origin,{mobile:true}).next,undefined,'no repeated near/medium rebuild');
 plan=planLandmarkStream([items[1]],items[1].data.position,{mobile:true});assert.equal(items[1].desiredDetail,'near');assert.equal(plan.next,items[1],'close detail returns when capacity is available');
});
test('street furniture cannot consume every slot and erase a prominent tower',()=>{
 const streets=Array.from({length:24},(_,i)=>({data:{id:'street-'+i,position:offsetMetres(origin,5+i*4,0),height:4},cost:{vertices:10000,draws:4}}));
 const tower={data:{id:'villaggio',position:offsetMetres(origin,300,0),width:250,depth:160,height:72},preferredDetail:'medium',costs:{medium:{vertices:78000,draws:10},near:{vertices:517000,draws:10}}};
 for(const mobile of [false,true]){const plan=planLandmarkStream([...streets,tower],origin,{mobile});assert.ok(plan.selected.includes(tower));assert.equal(plan.selected[0],streets[0]);assert.ok(plan.usage.models<=plan.budget.models);assert.ok(plan.usage.vertices<=plan.budget.vertices);assert.ok(plan.usage.draws<=plan.budget.draws);}
});
test('performance sampler stays bounded and reports CPU, frame interval and GPU object counts separately',()=>{
 const metrics=createRenderMetrics(120);for(let i=0;i<500;i++)metrics.sample(i*16.7,2+i%3);
 const m=metrics.snapshot({info:{render:{calls:100,triangles:40000},memory:{geometries:80,textures:12}}},8);assert.equal(m.samples,120);assert.equal(m.cpuSubmitP95Ms,4);assert.ok(m.frameIntervalP95Ms<17);assert.equal(m.geometries,80);assert.equal(m.textures,12);assert.equal(m.loadedLandmarks,8);
});

test('distant actors skip rendering and expensive animation while close actors stay fluid',()=>{
 assert.deepEqual(actorRenderPolicy(5),{visible:true,animationMs:0,castShadow:true});
 assert.equal(actorRenderPolicy(70).animationMs,100);assert.equal(actorRenderPolicy(70).castShadow,false);assert.equal(actorRenderPolicy(100).visible,false);
 assert.equal(actorRenderPolicy(60,{mobile:true}).visible,false);assert.equal(actorRenderPolicy(120,{driving:true,mobile:true}).visible,true);
});

test('resolution changes are bounded, hysteretic, and ignore background/loading frames',()=>{
 const g=createResolutionGovernor(1.5),slow={samples:120,frameIntervalP95Ms:55};
 assert.equal(g.update(20000,slow,{visible:false}),1.5);assert.equal(g.update(20000,slow,{settled:false}),1.5);
 assert.equal(g.update(20000,slow),1.27);assert.equal(g.update(21000,slow),1.27);
 for(let t=30000;t<100000;t+=10000)g.update(t,slow);assert.equal(g.ratio,1);
 assert.equal(g.update(120000,{samples:120,frameIntervalP95Ms:16}),1.1);
 const small=createResolutionGovernor(.75,{mobile:true});assert.equal(small.update(20000,slow),.75);
});

test('generic detailed facades stay near the player and leave distant shells to the map',()=>{
 const items=Array.from({length:200},(_,i)=>({id:i,distance:i*2})).reverse();
 assert.equal(planFacadeDetails(items).length,48);assert.equal(planFacadeDetails(items)[0].id,0);assert.equal(planFacadeDetails(items,{mobile:true}).length,24);
 assert.equal(planFacadeDetails([{distance:300}]).length,0);assert.equal(items[0].id,199,'input/source metadata stays intact');
});

test('ambient crowd detail is bounded independently of registered player counts and simulation',()=>{
 const items=Array.from({length:80},(_,i)=>({id:'npc-'+i,position:offsetMetres(origin,i*1.5,0),driving:i%2===0}));
 const desktop=selectAmbientDetails(items,origin),mobile=selectAmbientDetails(items,origin,{mobile:true});
 assert.equal([...desktop].filter(id=>items.find(i=>i.id===id).driving).length,16);assert.equal(desktop.size,24);assert.equal(mobile.size,14);assert.ok(desktop.has('npc-0'));assert.ok(desktop.has('npc-1'));assert.equal(items.length,80);
});
