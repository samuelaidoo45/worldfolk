import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/three.module.js';
import {packStaticModel,unpackStaticModel} from '../public/game/static-model-transfer.js';
import {createStaticLandmarkLoader} from '../public/game/static-landmark-loader.js';
import {CITY_LANDMARKS,createCityLandmark} from '../public/game/city-landmarks.js';
import {WORKER_STATIC_LANDMARKS} from '../public/game/static-landmark-catalog.js';
import {disposeScene} from '../public/game/render-utils.js';

function checkSame(source,copy){
  for(const key of ['name','visible','castShadow','receiveShadow','renderOrder','frustumCulled'])assert.equal(copy[key],source[key]);
  for(let i=0;i<16;i++)assert.ok(Math.abs(copy.matrix.elements[i]-source.matrix.elements[i])<1e-10);
  assert.equal(copy.children.length,source.children.length);
  if(source.isMesh){
    assert.deepEqual(Object.keys(copy.geometry.attributes),Object.keys(source.geometry.attributes));
    for(const [key,value] of Object.entries(source.geometry.attributes))assert.deepEqual(copy.geometry.attributes[key].array,value.array,key+' retained without simplification');
    assert.deepEqual(copy.geometry.index?.array,source.geometry.index?.array);
    assert.deepEqual(copy.geometry.groups,source.geometry.groups);
    const originals=Array.isArray(source.material)?source.material:[source.material],clones=Array.isArray(copy.material)?copy.material:[copy.material];
    assert.equal(clones.length,originals.length);
    originals.forEach((material,i)=>{
      for(const key of ['type','side','roughness','metalness','opacity','transparent','depthWrite','vertexColors','emissiveIntensity','envMapIntensity','bumpScale','normalMapType','aoMapIntensity','lightMapIntensity','displacementScale','displacementBias','alphaTest','combine'])assert.equal(clones[i][key],material[key],key+' retained');
      for(const key of ['color','emissive','normalScale','clearcoatNormalScale'])assert.deepEqual(clones[i][key]?.toArray(),material[key]?.toArray());
      for(const [key,value] of Object.entries(material))if(value?.isTexture){assert.ok(clones[i][key]?.isTexture,key);assert.equal(clones[i][key].colorSpace,value.colorSpace);assert.deepEqual(clones[i][key].image.data,value.image.data);}
    });
  }
  source.children.forEach((child,i)=>checkSame(child,copy.children[i]));
}

test('every static worker package transfers full near geometry and materials unchanged',()=>{
  const sites=CITY_LANDMARKS.filter(site=>WORKER_STATIC_LANDMARKS.has(site.id));assert.equal(sites.length,34);
  for(const site of sites){
    const original=createCityLandmark(site),packed=packStaticModel(original.group);
    const copy=unpackStaticModel(structuredClone(packed.snapshot,{transfer:packed.transfer}));
    try{
      checkSame(original.group,copy.group);assert.deepEqual(new T.Box3().setFromObject(copy.group),new T.Box3().setFromObject(original.group));
      // Explicitly guard the allowlist: these packages expose no behaviour or
      // only a no-op update. Animated pool/transport packages must stay excluded.
      for(const time of [0,1.1,19,400]){original.update?.(time,site.position,{preset:'night'});original.group.updateMatrixWorld(true);checkSame(original.group,copy.group);}
    }
    finally{disposeScene(copy.group);disposeScene(original.group);}
  }
});

test('all map-dependent material scales and vectors retain authored values',()=>{
  const texture=new T.DataTexture(new Uint8Array([128,128,255,255]),1,1);
  const material=new T.MeshPhysicalMaterial({bumpMap:texture,bumpScale:.018,normalMap:texture,normalMapType:T.ObjectSpaceNormalMap,normalScale:new T.Vector2(.25,.35),clearcoatNormalMap:texture,clearcoatNormalScale:new T.Vector2(.4,.6),lightMap:texture,lightMapIntensity:.22,aoMap:texture,aoMapIntensity:.44,displacementMap:texture,displacementScale:.3,displacementBias:-.12,alphaMap:texture,alphaTest:.23});
  const root=new T.Mesh(new T.BoxGeometry(),material),packed=packStaticModel(root),copy=unpackStaticModel(structuredClone(packed.snapshot)).group;
  try{checkSame(root,copy);}finally{disposeScene(root);disposeScene(copy);}
});

test('authored canvas signs preserve exact pixels, orientation and wrapping',()=>{
  const pixels=new Uint8ClampedArray([255,0,0,255,0,255,0,128,0,0,255,255,80,90,100,255]);
  const canvas={width:2,height:2,getContext:()=>({getImageData:()=>({data:pixels})})};
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;texture.repeat.set(2,3);texture.offset.set(.2,.4);texture.rotation=.3;texture.updateMatrix();
  const root=new T.Mesh(new T.PlaneGeometry(2,1),new T.MeshStandardMaterial({map:texture,transparent:true,side:T.DoubleSide}));
  const packed=packStaticModel(root),copy=unpackStaticModel(structuredClone(packed.snapshot,{transfer:packed.transfer})).group;
  try{const map=copy.material.map;assert.deepEqual(map.image.data,pixels);assert.equal(map.flipY,texture.flipY);assert.deepEqual(map.matrix.elements,texture.matrix.elements);assert.equal(map.colorSpace,texture.colorSpace);assert.equal(pixels.length,16,'transfer leaves source canvas buffers intact');}
  finally{disposeScene(root);disposeScene(copy);}
});

test('transfers do not detach reusable arrays and shared roof textures release at last owner',()=>{
  const texture=new T.DataTexture(new Uint8Array([120,130,140,255]),1,1);texture.userData.shared=true;
  const original=new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({map:texture}));
  const first=packStaticModel(original),copy=unpackStaticModel(structuredClone(first.snapshot,{transfer:first.transfer})).group;
  const second=packStaticModel(original),other=unpackStaticModel(structuredClone(second.snapshot,{transfer:second.transfer})).group;
  assert.ok(original.geometry.attributes.position.array.length>0);assert.equal(texture.image.data.length,4);assert.equal(copy.material.map,other.material.map);
  let disposals=0;copy.material.map.addEventListener('dispose',()=>disposals++);
  disposeScene(copy);assert.equal(disposals,0);disposeScene(other);assert.equal(disposals,1);disposeScene(original);texture.dispose();
});

test('failed reconstruction releases partial resources and balances cached image references',()=>{
  const shared=new T.DataTexture(new Uint8Array([120,130,140,255]),1,1);shared.userData.shared=true;
  const privateMap=new T.DataTexture(new Uint8Array([20,30,40,255]),1,1),root=new T.Group();
  root.add(new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({map:shared})),new T.Mesh(new T.BoxGeometry(),new T.MeshStandardMaterial({map:privateMap})));
  const packed=packStaticModel(root),survivor=unpackStaticModel(structuredClone(packed.snapshot));
  let sharedDisposals=0;survivor.group.children[0].material.map.addEventListener('dispose',()=>sharedDisposals++);
  const broken=structuredClone(packed.snapshot);broken.geometries[1].attributes.position.array=new BigInt64Array(3);
  const events={geometry:0,material:0,texture:0},originals={};
  for(const [key,prototype] of [['geometry',T.BufferGeometry.prototype],['material',T.Material.prototype],['texture',T.Texture.prototype]]){originals[key]=prototype.dispose;prototype.dispose=function(){events[key]++;return originals[key].call(this)};}
  try{assert.throws(()=>unpackStaticModel(broken),/Invalid static geometry array/);assert.equal(events.geometry,2);assert.equal(events.material,2);assert.equal(events.texture,1);assert.equal(sharedDisposals,0,'the successful model retains its shared image');}
  finally{T.BufferGeometry.prototype.dispose=originals.geometry;T.Material.prototype.dispose=originals.material;T.Texture.prototype.dispose=originals.texture;disposeScene(survivor.group);disposeScene(root);shared.dispose();}
  assert.equal(sharedDisposals,1,'failed hydration did not leak a shared image reference');
});

function workerFixture(){
  const workers=[];const loader=createStaticLandmarkLoader({supported:true,workerFactory:()=>{
    const worker={sent:[],terminated:false,postMessage(value){this.sent.push(value)},terminate(){this.terminated=true}};workers.push(worker);return worker;
  }});return {loader,workers};
}
test('worker loader keeps one active job, ignores stale replies and cancels obsolete work',async()=>{
  const {loader,workers}=workerFixture(),abort=new AbortController();
  const cancelled=loader.load('villaggio-vista',{signal:abort.signal});
  await assert.rejects(loader.load('polo-north-stables'),/already active/);
  const pendingAssertion=assert.rejects(cancelled,{name:'AbortError'});abort.abort();await pendingAssertion;assert.equal(workers[0].terminated,true);
  const next=loader.load('polo-north-stables');workers[0].onmessage({data:{request:workers[0].sent[0].request,error:'obsolete'}});workers[0].onerror();assert.equal(loader.snapshot().active,true);assert.equal(loader.snapshot().failed,0);
  const root=new T.Group(),packed=packStaticModel(root);workers[1].onmessage({data:{request:workers[1].sent[0].request,snapshot:packed.snapshot,timings:{buildMs:123,packMs:4}}});
  const model=await next;assert.ok(model.group.isGroup);assert.equal(loader.snapshot().completed,1);assert.equal(loader.snapshot().cancelled,1);loader.close();disposeScene(model.group);
});
test('unavailable/failed worker leaves original model construction available',async()=>{
  const unavailable=createStaticLandmarkLoader({supported:false});assert.equal(unavailable.canLoad('villaggio-vista'),false);assert.equal(await unavailable.load('villaggio-vista'),null);unavailable.close();
  const {loader,workers}=workerFixture(),pending=loader.load('villaggio-vista');workers[0].onerror();await assert.rejects(pending,/worker failed/);assert.equal(loader.canLoad('villaggio-vista'),false);assert.equal(await loader.load('villaggio-vista'),null);assert.equal(loader.canLoad('the-signature'),false);loader.close();
});
