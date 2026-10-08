import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../public/game/three.module.js';
import {PUBLIC_VENUES,publicVenueLayout} from '../public/game/public-venues.js';
import {interiorKind} from '../public/game/venue-layouts.js';
import {furnishPublicVenue} from '../public/game/public-venue-models.js';
import {createRoomPhysics} from '../public/game/room-physics.js';
import {batchStaticMeshes,disposeScene} from '../public/game/render-utils.js';
test('public categories do not become generic homes, shops or classrooms',()=>{
 for(const [name,type,kind] of [['Jubilee House','government','civic'],['Independence Square','landmark','square'],['University of Ghana','university','campus'],['Ecobank','bank','bank'],['Carbon','nightclub','nightclub'],['Community pitch','pitch','field'],['National Museum','museum','gallery'],['Papaye','restaurant','restaurant'],['Labadi Beach','beach','beach'],['Makola Market','market','market'],['National Mosque','place_of_worship','mosque'],['Holy Trinity Cathedral','church','church'],['Enterprise office','office','office']])assert.equal(interiorKind({name,type}),kind,name);
});
for(const kind of Object.keys(PUBLIC_VENUES))test(`${kind}: entrance, staff and every activity can be reached without crossing furniture`,()=>{
 const spec=PUBLIC_VENUES[kind],layout=publicVenueLayout(kind),scene=new THREE.Scene(),blockers=[],hotspots=[],mat=Object.fromEntries(['partition','stone','trim','wood','metal','glass','fabric','green','white','gold','dark','water','grassLight','neonPink','neonBlue','foam'].map(k=>[k,new THREE.MeshStandardMaterial()]));
 const box=(m,w,h,d,x,y,z,collide)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);scene.add(o);if(collide)blockers.push({x,z,w,d});return o};
 furnishPublicVenue({kind,w:spec.room[0],d:spec.room[1],scene,mat,blockers,effects:[],box,cylinder:(m,r,h,x,y,z,collide)=>box(m,r*2,h,r*2,x,y,z,collide),sign:()=>new THREE.Group(),spot:(x,z,label,actionId)=>hotspots.push({x,z,label,actionId}),seat:(x,z)=>blockers.push({x,z,w:.8,d:.8}),plant:(x,z)=>blockers.push({x,z,w:1,d:1})});
 const physics=createRoomPhysics(blockers,layout.bounds);assert.ok(physics.clear(...layout.spawn),'spawn');assert.ok(physics.clear(...layout.exit),'exit');assert.ok(physics.clear(...layout.staff),'staff');
 const seen=new Set(),queue=[layout.spawn],key=(x,z)=>`${x},${z}`;seen.add(key(...layout.spawn));for(let q=0;q<queue.length;q++){const p=queue[q];for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const n=[p[0]+dx,p[1]+dz];if(seen.has(key(...n))||!physics.clear(...n)||!physics.visible(p,n))continue;seen.add(key(...n));queue.push(n)}}
 for(const h of hotspots)assert.ok(queue.some(p=>Math.hypot(p[0]-h.x,p[1]-h.z)<2.1&&physics.visible(p,[h.x,h.z])),`unreachable: ${h.label} (${h.x},${h.z})`);
 const stats=batchStaticMeshes(scene);assert.ok(stats.after<45,`static draw calls ${stats.after}`);disposeScene(scene);
});

import {sellsAtVenue,canBuyAtMappedVenue} from '../public/game/venue-shopping.js';
test('mapped shops sell appropriate goods and require a nearby verified venue',()=>{
 const restaurant={name:'Test Kitchen',type:'restaurant',lng:-.18,lat:5.56},player={place_id:'g_-1800_55600',pos_lng:-.18,pos_lat:5.56,driving:0},food={kind:'food'},car={kind:'vehicle'};
 assert.ok(canBuyAtMappedVenue(food,player,[restaurant]));assert.equal(canBuyAtMappedVenue(car,player,[restaurant]),false);assert.equal(canBuyAtMappedVenue(food,{...player,pos_lng:-.25},[restaurant]),false);assert.equal(canBuyAtMappedVenue(food,{...player,driving:1},[restaurant]),false);assert.equal(canBuyAtMappedVenue(food,player,[]),false);assert.equal(canBuyAtMappedVenue(food,player,[{...restaurant,type:'bank',name:'Bank'}]),false);assert.ok(sellsAtVenue({kind:'furniture'},{name:'Accra Mall'}));
});
