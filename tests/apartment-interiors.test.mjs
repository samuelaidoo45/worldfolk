import test from 'node:test';
import assert from 'node:assert/strict';
import {APARTMENTS,APARTMENT_ENTRANCES,apartmentKind,createApartmentActivity} from '../public/game/apartment-data.js';
import {buildApartment} from '../public/game/apartment-model.js';
import {createRoomPhysics} from '../public/game/room-physics.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {disposeScene} from '../public/game/render-utils.js';

test('named apartments keep distinct plans and safe exterior entrances',()=>{
 assert.equal(apartmentKind('The Signature Apartments'),'signature');assert.equal(apartmentKind('Villaggio Vista'),'villaggio');assert.equal(apartmentKind('Villagio Hotel'),null);
 assert.notDeepEqual(APARTMENTS.signature.walls,APARTMENTS.villaggio.walls);
 const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};
 const p=createBuildingPhysics(map);for(const e of APARTMENT_ENTRANCES){p.refresh(e.position,true);assert.equal(p.collision(e.position,.4),null,e.kind+' entrance obstructed')}
});
for(const kind of Object.keys(APARTMENTS))test(kind+' rooms, furniture activities and exit are connected without wall clipping',()=>{
 const model=buildApartment(kind),physics=createRoomPhysics(model.blockers,model.bounds),{layout}=model;
 assert.ok(physics.clear(...layout.spawn),'spawn');
 const step=.2,queue=[layout.spawn],seen=new Set([layout.spawn.map(v=>v.toFixed(2)).join(',')]);
 for(let i=0;i<queue.length;i++){const p=queue[i];for(const delta of [[step,0],[-step,0],[0,step],[0,-step]]){const n=[p[0]+delta[0],p[1]+delta[1]],key=n.map(v=>v.toFixed(2)).join(',');if(seen.has(key)||!physics.clear(...n)||!physics.visible(p,n))continue;seen.add(key);queue.push(n)}}
 for(const h of [...layout.hotspots,{id:'exit',at:layout.exit}]){assert.ok(physics.clear(...h.at),h.id+' approach blocked');assert.ok(queue.some(p=>Math.hypot(p[0]-h.at[0],p[1]-h.at[1])<.4&&physics.visible(p,h.at)),h.id+' unreachable')}
 // A long movement cannot tunnel across the bedroom partition or the balcony rail.
 const x=kind==='signature'?-2:kind==='gallery'?-2.5:-3;assert.ok(physics.move([x+1,-4],[-3,0])[0]>x);assert.ok(physics.move([0,layout.terrace-1],[0,-20])[1]>layout.back);
 assert.ok(model.stats.after<50,'draw budget');disposeScene(model.group);
});
test('sleep, seating, shower and cooking persist until the player stops and cannot replace one another',()=>{
 let time=1;for(const layout of Object.values(APARTMENTS))for(const h of layout.hotspots.filter(h=>h.pose)){
  const a=createApartmentActivity(layout,()=>time);assert.equal(a.start(h.id),true);time+=36000;assert.equal(a.active,true);assert.equal(a.frame(time).active,true);assert.equal(a.spot,h);assert.equal(a.start('relax'),false);assert.ok(a.prompt());a.stop();assert.equal(a.active,false);assert.equal(a.spot,null);
 }
});
