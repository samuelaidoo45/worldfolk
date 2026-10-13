import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/three.module.js';
import {buildMallInterior} from '../public/game/accra-mall-interior-model.js';
import {createAccraMall} from '../public/game/accra-mall.js';
import {MALL_ARRIVAL,MALL_ENTRANCE,MALL_CAST,MALL_SHOPS,mallActivityState} from '../public/game/accra-mall-data.js';
import {POPULAR_LANDMARKS} from '../public/game/popular-landmarks-data.js';
import {landmarkArrival,isOutdoorLandmark} from '../public/game/landmark-arrival.js';
import {createRoomPhysics} from '../public/game/room-physics.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {disposeScene} from '../public/game/render-utils.js';
import {EXPERIENCES} from '../public/game/work-catalog.js';
import {GOODS,JOBS} from '../public/game/life-catalog.js';
import {startingPlace} from '../public/game/city-places.js';

test('mall arrival stays outside the actual footprint and still opens an interior',()=>{
 const result=landmarkArrival({name:'Accra Mall'});assert.deepEqual(result.position,MALL_ARRIVAL);assert.deepEqual(result.target,MALL_ENTRANCE);assert.equal(isOutdoorLandmark({name:'Accra Mall'}),false);assert.equal(isOutdoorLandmark({name:'Black Star Gate'}),true);
 const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true},physics=createBuildingPhysics(map);physics.refresh(MALL_ARRIVAL,true);assert.equal(physics.collision(MALL_ARRIVAL,.4),null);
 assert.deepEqual([startingPlace('mall').lng,startingPlace('mall').lat],MALL_ARRIVAL);
});
test('exterior preserves open mapped courtyard and recognizable entrance tower at a bounded draw cost',()=>{
 const data=POPULAR_LANDMARKS.find(l=>l.id==='accra-mall'),{group}=createAccraMall(data);group.updateMatrixWorld(true);
 const ring=data.rings[1].slice(0,-1),centre=ring.reduce((a,p)=>[a[0]+p[0]/ring.length,a[1]+p[1]/ring.length],[0,0]),x=(centre[0]-data.position[0])*111320*Math.cos(data.position[1]*Math.PI/180),z=-(centre[1]-data.position[1])*111320;
 const ray=new T.Raycaster(new T.Vector3(x,30,z),new T.Vector3(0,-1,0),0,23);assert.equal(ray.intersectObject(group,true).length,0,'no rectangular roof spans the court');assert.ok(new T.Box3().setFromObject(group).max.y>14);assert.ok(group.userData.batching.after<18);disposeScene(group);
});
for(const cinema of [false,true])test(`${cinema?'cinema':'mall'} activities and exit are reachable through open aisles`,()=>{
 const model=buildMallInterior(cinema),physics=createRoomPhysics(model.blockers,model.layout.bounds),{spawn,exit,bounds}=model.layout;assert.ok(physics.clear(...spawn));assert.ok(physics.clear(...exit));
 const step=.5,queue=[spawn],seen=new Set([spawn.join(',')]);for(let i=0;i<queue.length;i++){const p=queue[i];for(const delta of [[step,0],[-step,0],[0,step],[0,-step]]){const n=[p[0]+delta[0],p[1]+delta[1]],key=n.join(',');if(n[0]<bounds.left||n[0]>bounds.right||n[1]<bounds.back||n[1]>bounds.front||seen.has(key)||!physics.clear(...n))continue;seen.add(key);queue.push(n)}}
 for(const h of [...model.hotspots,{x:exit[0],z:exit[1],label:'exit'}]){assert.ok(physics.clear(h.x,h.z),h.label+' inside obstacle');assert.ok(queue.some(p=>Math.hypot(p[0]-h.x,p[1]-h.z)<.8&&physics.visible(p,[h.x,h.z])),h.label+' unreachable')}
 if(!cinema){for(const p of MALL_CAST)assert.ok(physics.clear(p.x,p.z),p.name);for(const x of [-15,15])for(let z=-28;z<=28;z+=.25)assert.ok(physics.clear(x,z),'shopper route');}
 assert.ok(model.stats.after<60,'static draw budget');disposeScene(model.group);
});
test('shop departments and ticket/job actions use existing authoritative economy catalogues',()=>{
 for(const shop of MALL_SHOPS){assert.ok(shop.goods.length);assert.ok(GOODS.some(g=>shop.goods.includes(g.kind)&&g.shops.includes('mall')),shop.name)}
 const film=EXPERIENCES.find(e=>e.id==='mall-cinema');assert.equal(film.place,'mall');assert.ok(film.price>0);assert.equal(JOBS.find(j=>j.id==='retail').place,'mall');
});
test('seating and watching remain active until an explicit stop',()=>{
 const a=mallActivityState();a.start('sit');assert.equal(a.resting,'sit');a.start('invalid');assert.equal(a.resting,'sit');a.stop();assert.equal(a.resting,null);a.start('watch');assert.equal(a.resting,'watch');a.stop();assert.equal(a.resting,null);
});
