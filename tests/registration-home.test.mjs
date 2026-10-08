import test from 'node:test';
import assert from 'node:assert/strict';
import {START_PLACES,startingPlace} from '../public/game/city-places.js';
import {HOMES,startingLife,propertyId} from '../public/game/life-catalog.js';
test('players choose their starting place independently of their background',()=>{
 for(const wealth of [.1,.7,.99])for(const place of START_PLACES){
  const start=startingLife(wealth,.7,place);
  assert.equal(start.money,100000);assert.equal(start.life.explorationPending,false);assert.equal(start.life.startPlaceId,place.id);
  assert.deepEqual([start.lng,start.lat],[place.lng,place.lat]);assert.ok(start.life.properties.includes(start.life.home));
 }
 const pending=startingLife(.1,.99),other=startingLife(.8,.2);assert.equal(pending.life.explorationPending,true);assert.equal(pending.life.startPlaceId,null);assert.deepEqual([pending.lng,pending.lat],[other.lng,other.lat],'no random starting location before a choice');
 assert.equal(startingPlace('home'),null);assert.equal(startingPlace('p_someone_starter'),null);assert.equal(startingPlace('g_0_0'),null);
 assert.notEqual(propertyId('owner-a','starter'),propertyId('owner-b','starter'));
});

test('assigned homes reference residential footprints with clear exterior entrances',async()=>{
 const {insideBuilding}=await import('../public/game/building-design.js');
 const {buildingDesign}=await import('../public/game/building-design.js');
 for(const home of HOMES){
  assert.ok(home.buildingId);assert.equal(home.mappedType,'house');
  assert.equal(insideBuilding([home.lng,home.lat],[home.footprint]),false);
  const design=buildingDesign({id:home.buildingId,geometry:{type:'Polygon',coordinates:[home.footprint]},properties:{class:'house',height:4.5}},[{...home,type:'Private home'}]);
  assert.equal(design.kind,'home');
 }
});

test('every selectable public place has a nearby walkable arrival point in the actual map',async()=>{
 const {readFile}=await import('node:fs/promises'),{createRouter,readRoadGraph}=await import('../public/game/osm-routing.js'),{distanceMetres}=await import('../public/game/motion.js');
 const bytes=await readFile(new URL('../public/maps/accra-v1/graph.bin',import.meta.url)),router=createRouter(readRoadGraph(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)));
 for(const place of START_PLACES){const point=router.walkingArrival([place.lng,place.lat]);assert.ok(distanceMetres(point,[place.lng,place.lat])<600,place.name)}
});
