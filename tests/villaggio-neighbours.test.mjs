import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from '../public/game/three.module.js';
import {NEIGHBOUR_SITES,NEIGHBOUR_PLACES,NEIGHBOUR_BUILDINGS,NEIGHBOUR_ACTIVITIES,neighbourPeople,neighbourPoint} from '../public/game/villaggio-neighbours-data.js';
import {createVillaggioNeighbour} from '../public/game/villaggio-neighbours.js';
import {isCityLandmark} from '../public/game/city-landmarks.js';
import {landmarkArrival} from '../public/game/landmark-arrival.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {nearPrecinctActivity,createPrecinctLife} from '../public/game/precinct-life.js';
import {distanceMetres,projectOnSegment} from '../public/game/motion.js';
import {disposeScene} from '../public/game/render-utils.js';
const physics=origin=>{const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>[],isSourceLoaded:()=>true});p.refresh(origin,true);return p;};
test('seven mapped buildings replace only their own shells and are searchable as three distinct visits',()=>{
 assert.equal(NEIGHBOUR_BUILDINGS.length,7);assert.equal(new Set(NEIGHBOUR_BUILDINGS.map(b=>b.sourceId)).size,7);
 for(const s of NEIGHBOUR_SITES){for(const id of s.sourceIds)assert.ok(isCityLandmark(id));const found=searchPlaceIndex(indexPlaces([]),s.name).items.find(p=>p.id===s.id);assert.ok(found,s.name);assert.deepEqual(landmarkArrival(found).position,s.arrival);assert.equal(physics(s.arrival).collision(s.arrival,.4),null,s.name+' arrival');}
 assert.equal(isCityLandmark(1337567088),false,'unreviewed neighbouring house remains mapped');
});
test('activities and visitors stay on open approaches; sitting keeps an explicit standing access',()=>{
 for(const site of NEIGHBOUR_SITES){const p=physics(site.arrival);for(const a of NEIGHBOUR_ACTIVITIES.filter(a=>a.id.includes(site.id))){assert.equal(p.collision(a.position,.28),null,a.id);assert.equal(nearPrecinctActivity(a.position,0).id,a.id);if(a.kind==='sit'){const approach=neighbourPoint(site,...(site.family==='primavera'?[38,39.2]:site.family==='regent'?[-34,-35]:[-13,17]));assert.ok(distanceMetres(p.moveWalker(approach,a.position).position,a.position)<.1,a.id+' access');}}
 let old;
 for(let t=0;t<60;t+=.25){const people=neighbourPeople(t,site.arrival,720);assert.equal(people.length,2);for(const a of people.filter(a=>a.moving)){assert.equal(p.collision(a.position,.28),null,site.id+' walker');if(old)assert.ok(distanceMetres(a.position,old.position)<.21);old=a;}}
 assert.equal(createPrecinctLife().tick(0,site.arrival,720).length,2);}
});
test('same-level building contact stops at mapped facade and permits moving away',()=>{
 for(const b of NEIGHBOUR_BUILDINGS){const s=NEIGHBOUR_SITES.find(s=>s.id===b.siteId),p=physics(s.position),ring=b.rings[0],a=ring[0],c=ring[1],mid=[(a[0]+c[0])/2,(a[1]+c[1])/2];assert.ok(p.collision(mid,.3),b.sourceId);}
 const s=NEIGHBOUR_SITES[2],p=physics(s.position),outside=[-.17715,5.61915],inside=[-.17693,5.61915],hit=p.move(outside,inside,.4);assert.ok(hit.blocked);assert.ok(distanceMetres(p.move(hit.position,outside,.4).position,outside)<.1);
});
test('Primavera arrival clears the existing unreviewed approach building',()=>{
 const ring=[[-.1790381,5.620196],[-.1789159,5.6201735],[-.1789311,5.6200915],[-.1790533,5.6201139],[-.1790381,5.620196]],s=NEIGHBOUR_SITES[0],p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>[{id:2617216540,geometry:{type:'Polygon',coordinates:[ring]},properties:{height:4.5}}],isSourceLoaded:()=>true});p.refresh(s.arrival,true);assert.equal(p.collision(s.arrival,2),null);assert.ok(p.nearby.some(b=>b.id.startsWith('2617216540:')),'unreviewed building retains physics');
});
test('search suppresses nearby exact-name source duplicates but keeps a distant branch',()=>{
 const s=NEIGHBOUR_SITES[2],index=indexPlaces([{name:s.name,lng:s.position[0],lat:s.position[1],type:'hotel'},{name:s.name,lng:-.22,lat:5.65,type:'hotel'}]),found=searchPlaceIndex(index,s.name).items;assert.equal(found.length,2);assert.equal(found.filter(p=>p.id===NEIGHBOUR_PLACES[2].id).length,1);
});
test('pool outlines are solid while each visitor approach stays clear',()=>{
 for(const site of [NEIGHBOUR_SITES[0],NEIGHBOUR_SITES[2]]){const p=physics(site.position),point=site.family==='regent'?[-38,7]:[-7,-2];assert.ok(p.collision(neighbourPoint(site,...point),.3)?.id.includes('pool'));assert.equal(p.collision(site.arrival,.3),null);}
});
test('Primavera arrival and visitor path stay north of the mapped service carriageway',()=>{
 const a=[-.1798971,5.6204076],b=[-.1787142,5.620178],site=NEIGHBOUR_SITES[0];assert.ok(projectOnSegment(site.arrival,a,b).distance>3.2,'avoid automatic sidewalk relocation');
 for(let t=0;t<40;t+=.5)for(const actor of neighbourPeople(t,site.arrival,720))assert.ok(projectOnSegment(actor.position,a,b).distance>2.7,'visitor remains off the carriageway');
});
test('authored geometry has valid UVs, bounded draw calls and separate silhouettes',()=>{
 const heights=[];
 for(const site of NEIGHBOUR_SITES){const {group}=createVillaggioNeighbour(site);assert.equal(group.userData.neighbours.sourceIds.length,site.sourceIds.length);assert.ok(group.userData.neighbours.bays>10);assert.ok(group.userData.batching.after<24,site.id+' draw batches');group.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.getAttribute('position'),uv=o.geometry.getAttribute('uv');assert.ok(Array.from(p.array).every(Number.isFinite));assert.equal(p.count,uv.count,'all batch UVs');});const bounds=new T.Box3().setFromObject(group);heights.push(bounds.max.y);assert.ok(bounds.max.y<26);disposeScene(group);}
 assert.ok(heights[0]>20&&heights[1]<6&&heights[2]>19);
});
