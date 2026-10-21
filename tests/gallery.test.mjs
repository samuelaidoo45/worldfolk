import test from 'node:test';
import assert from 'node:assert/strict';
import {GALLERY,GALLERY_ARRIVAL,GALLERY_ACTIVITIES,GALLERY_RINGS,galleryPoint,galleryLocal,isGallery} from '../public/game/gallery-data.js';
import {createGallery} from '../public/game/gallery.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {createPrecinctLife,nearPrecinctActivity} from '../public/game/precinct-life.js';
import {landmarkArrival} from '../public/game/landmark-arrival.js';
import {isCityLandmark} from '../public/game/city-landmarks.js';
import {indexPlaces,searchPlaceIndex} from '../public/game/place-search.js';
import {APARTMENT_ENTRANCES,apartmentKind} from '../public/game/apartment-data.js';
import {distanceMetres} from '../public/game/motion.js';
import {disposeScene} from '../public/game/render-utils.js';
const physics=()=>{const p=createBuildingPhysics({project:()=>({x:0,y:0}),queryRenderedFeatures:()=>[],isSourceLoaded:()=>true});p.refresh(GALLERY.position,true);return p};
test('Gallery search, arrival and apartment identity preserve neighbouring locations',()=>{
 const place=searchPlaceIndex(indexPlaces([]),'The Gallery').items.find(p=>p.id==='gallery');assert.ok(place);assert.deepEqual(landmarkArrival(place).position,GALLERY_ARRIVAL);assert.equal(apartmentKind(place),'gallery');assert.equal(isGallery({name:'Artists Alliance Gallery'}),false);assert.ok(GALLERY.sourceIds.every(isCityLandmark));assert.equal(isCityLandmark(1482326170),false);assert.equal(Object.keys(GALLERY_RINGS).length,3);
 const p=physics(),door=APARTMENT_ENTRANCES.find(e=>e.kind==='gallery');assert.equal(p.collision(GALLERY_ARRIVAL,.4),null);assert.ok(distanceMetres(p.moveWalker(GALLERY_ARRIVAL,door.position).position,door.position)<.1);
});
test('Gallery courtyard solids, seating and retreat agree with the mapped shell',()=>{
 const p=physics();for(const pos of [[-2,-20],[-27,8],[24,7],[-10,1]])assert.ok(p.collision(galleryPoint(...pos),.3));
 for(const a of GALLERY_ACTIVITIES){assert.equal(p.collision(a.position,.3),null);assert.equal(nearPrecinctActivity(a.position,0).id,a.id);}
 const seat=GALLERY_ACTIVITIES[1].position;assert.ok(distanceMetres(p.moveWalker(GALLERY_ARRIVAL,seat).position,seat)<.1);
 const start=galleryPoint(-2,-9),hit=p.move(start,galleryPoint(-2,-20),.35);assert.ok(hit.blocked);assert.ok(distanceMetres(p.move(hit.position,start,.35).position,start)<.1);
 const {group}=createGallery();assert.ok(group.userData.batching.after<20);assert.equal(group.userData.gallery.rooftopPool,true);assert.equal(group.userData.gallery.roofAccess,false);disposeScene(group);
});
test('Gallery visitors walk continuously through the clear garden corridor',()=>{
 const p=physics(),life=createPrecinctLife();let old;
 for(let t=0;t<240;t+=.25){const actors=life.tick(t,GALLERY.position,720);assert.equal(actors.length,3);assert.equal(life.actors,actors);for(const a of actors){assert.equal(p.collision(a.position,.3),null);assert.ok(Math.abs(galleryLocal(a.position)[0]+2)<1);if(old)assert.ok(distanceMetres(a.position,old.find(b=>b.id===a.id).position)<.25)}old=actors;}
 assert.equal(life.tick(0,GALLERY.position,0).length,1);
});
