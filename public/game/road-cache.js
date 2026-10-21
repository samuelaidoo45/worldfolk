import {SKY_ROADS} from './senchi-skyline-data.js';
import {BOUND_ROADS} from './airport-bound-data.js';
import {MAHAMA_ROADS} from './mahama-bypass-data.js';
import {POLO_AUTHORED_ROADS} from './polo-senchi-data.js';
import {SHANGRI_AUTHORED_ROADS} from './shangri-la-data.js';
import {RESIDENTIAL_ROADS} from './airport-residential-map.js';
import {T3_CLOSED_ROAD_IDS} from './airport-access-data.js';
import {CORRIDOR_CONTEXT} from './airport-corridor-map.js';
import {inAirportCorridor} from './airport-corridor-data.js';
// Road tiles simplify vertices. Traffic, safety and surface polygons must use the
// same native geometry as the authored streets when one of these ways is loaded.
const airportWays=new Map([...CORRIDOR_CONTEXT.filter(r=>r.coordinates.some(inAirportCorridor)),...RESIDENTIAL_ROADS,...SHANGRI_AUTHORED_ROADS,...POLO_AUTHORED_ROADS,...MAHAMA_ROADS,...BOUND_ROADS,...SKY_ROADS].map(r=>[String(r.id),r]));
// All consumers share one read of the currently loaded road tiles per 1.5 seconds.
const snapshots=new WeakMap();
export function roadFeatures(map,now=performance.now()){
 const cached=snapshots.get(map);if(cached&&now-cached.at<1500)return cached.features;
 let features=[];try{features=map.querySourceFeatures('accralife-streets',{sourceLayer:'road'})}catch{}
 const seen=new Set();features=features.flatMap(f=>{if(T3_CLOSED_ROAD_IDS.has(Number(f.id)))return [];const r=airportWays.get(String(f.id));if(!r)return [f];if(seen.has(r.id))return [];seen.add(r.id);const {coordinates,id,...properties}=r;return [{...f,properties:{...f.properties,...properties},geometry:{type:'LineString',coordinates}}];});
 snapshots.set(map,{at:now,features});return features;
}
