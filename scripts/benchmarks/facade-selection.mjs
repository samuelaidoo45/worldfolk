// CPU-only source-feature refresh; excludes MapLibre queries, GPU and rendering.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {performance} from 'node:perf_hooks';
import {createArchitecture} from '../../public/game/real-buildings.js';
import {CITY_PLACES} from '../../public/game/city-places.js';
import {HOMES} from '../../public/game/life-catalog.js';

const directory = new URL('../../tests/fixtures/', import.meta.url);
const features = new Map();
for (const file of fs.readdirSync(directory).filter(f => f.endsWith('-context.json')).sort()) {
  const data = JSON.parse(fs.readFileSync(new URL(file, directory)));
  for (const feature of data.building || data.buildings || []) {
    if (feature.geometry?.type === 'Polygon' || feature.geometry?.type === 'MultiPolygon') {
      features.set(JSON.stringify([feature.id, feature.geometry]), feature);
    }
  }
}
const places = [...CITY_PLACES, ...HOMES.map(h => ({...h, type: 'Private home'}))];
const clock = Date.now, media = globalThis.matchMedia;
globalThis.matchMedia = () => ({matches: false});
let now = 2000;
Date.now = () => now;
const results = [];
try {
  for (const [name, position] of [['Mall', [-.1756, 5.622]], ['Airport', [-.177, 5.605]], ['Square', [-.192, 5.549]]]) {
    const times = [], hashes = new Set();
    let dirty;
    const architecture = createArchitecture({
      on(event, callback) { dirty = callback; },
      querySourceFeatures() { return [...features.values()]; },
    }, () => places);
    for (let n = 0; n < 25; n++) {
      now += 2000;
      dirty({sourceId: 'accralife-streets'});
      const start = performance.now();
      architecture.update(position);
      if (n >= 5) times.push(performance.now() - start);
      hashes.add(createHash('sha256').update(JSON.stringify(architecture.details)).digest('hex'));
    }
    times.sort((a, b) => a - b);
    results.push({name, samples: times.length, details: architecture.details.length,
      p50Ms: times[Math.ceil(times.length * .5) - 1], p95Ms: times[Math.ceil(times.length * .95) - 1],
      maxMs: times.at(-1), hashes: [...hashes]});
  }
} finally { Date.now = clock; globalThis.matchMedia = media; }
console.log(JSON.stringify({scope: 'CPU facade refresh only, not rendered FPS', features: features.size, places: places.length, results}, null, 2));
