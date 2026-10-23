import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildingDesign, buildingDistance} from '../public/game/building-design.js';
import {createArchitecture} from '../public/game/real-buildings.js';
import {offsetMetres} from '../public/game/motion.js';
import {CITY_PLACES} from '../public/game/city-places.js';

const origin = [-.1756, 5.622];
const box = (x, y, w, h) => [[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]].map(p => offsetMetres(origin, ...p));
const feature = (id, rings, properties = {}) => ({id, geometry: {type: 'Polygon', coordinates: rings}, properties});

// Original full-scan ranking: the optimized refresh must select the same
// footprints and derive the same materials even with duplicate/clipped tiles.
function fullScan(features, position, places, limit) {
  const found = new Map();
  for (const f of features) {
    if (Number(f.properties?.min_height) > 0 || String(f.properties?.extrude) === 'false') continue;
    const polygons = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [];
    for (const rings of polygons) {
      const ring = rings[0];
      if (!ring || ring.length < 4) continue;
      const distance = buildingDistance(position, {rings});
      if (distance > 650) continue;
      const id = ring.map(p => p.map(v => v.toFixed(6)).join(',')).join(';');
      if (found.has(id)) continue;
      const center = ring.slice(0, -1).reduce((a, p) => [a[0] + p[0] / (ring.length - 1), a[1] + p[1] / (ring.length - 1)], [0, 0]);
      const design = buildingDesign({...f, geometry: {type: 'Polygon', coordinates: rings}}, places);
      found.set(id, {id, sourceId:f.id, position:center, rings, height:design.height, seed:design.seed, distance, style:design.style, design});
    }
  }
  return [...found.values()].sort((a,b) => a.distance - b.distance).slice(0,limit);
}

test('facade selection preserves full-scan results, stable ordering and native contours', () => {
  const native = JSON.parse(fs.readFileSync(new URL('./fixtures/airport-city-context.json', import.meta.url))).building;
  const synthetic = Array.from({length:230}, (_,i) => feature('block-'+i, [box(i%23*12, Math.floor(i/23)*15, 9, 11)]));
  const features = [...synthetic, ...native, ...native, feature('long', [box(-1000,-10,2000,20)]), feature('courtyard', [box(-80,-80,160,160),box(-60,-60,120,120)]), feature('raised', [box(0,0,5,5)], {min_height:3})];
  const oldClock = Date.now, oldMedia = globalThis.matchMedia;
  let now = 2000;
  Date.now = () => now;
  try {
    for (const mobile of [false,true]) {
      globalThis.matchMedia = () => ({matches:mobile});
      let changed;
      const model = createArchitecture({on(_event, callback) {changed=callback;},querySourceFeatures:()=>features}, () => CITY_PLACES);
      for (const p of [origin, offsetMetres(origin,700,0), offsetMetres(origin,0,-1600)]) {
        now += 2000; changed({sourceId:'accralife-streets'}); model.update(p);
        assert.deepEqual(model.details, fullScan(features,p,CITY_PLACES,mobile?100:190));
      }
    }
  } finally {Date.now=oldClock;globalThis.matchMedia=oldMedia;}
});

test('place matching keeps long edges, interior holes, adjacent venues and explicit IDs', () => {
  const f = feature('native', [box(-1000,-20,2000,40),box(-100,-10,200,20)]);
  const place = (name,type,x,y,extras={}) => ({name,type,lng:offsetMetres(origin,x,y)[0],lat:offsetMetres(origin,x,y)[1],...extras});
  assert.equal(buildingDesign(f,[place('Edge cafe','restaurant',980,30)]).placeName,'Edge cafe');
  assert.equal(buildingDesign(f,[place('Inside shop','shop',500,0)]).placeName,'Inside shop');
  assert.equal(buildingDesign(f,[place('Courtyard shop','shop',0,0)]).placeName,'');
  assert.equal(buildingDesign(f,[place('Far restaurant','restaurant',1200,0)]).placeName,'');
  assert.equal(buildingDesign(f,[place('Named residence','Private home',2000,0,{buildingId:'native'})]).placeName,'Named residence');
});

test('new tile coordinates and place changes refresh facade design without stale cached identity', () => {
  const oldClock = Date.now, oldMedia = globalThis.matchMedia;
  let now=2000, changed, features=[feature('house',[box(0,0,10,10)])], places=[];
  Date.now=()=>now;globalThis.matchMedia=()=>({matches:false});
  try {
    const model=createArchitecture({on(_event,callback){changed=callback;},querySourceFeatures:()=>features},()=>places);
    model.update(origin);assert.equal(model.details.length,1);
    features=[feature('house',[box(2000,0,10,10)])];now+=2000;changed({sourceId:'accralife-streets'});model.update(origin);assert.equal(model.details.length,0);
    features=[feature('house',[box(0,0,10,10)])];places=[{name:'Local bank',type:'bank',lng:origin[0],lat:origin[1],buildingId:'house'}];now+=2000;changed({sourceId:'accralife-streets'});model.update(origin);assert.equal(model.details[0].design.placeName,'Local bank');
  } finally {Date.now=oldClock;globalThis.matchMedia=oldMedia;}
});
