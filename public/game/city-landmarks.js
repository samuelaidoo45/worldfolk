import {NKRUMAH_PARK,PARK_SOLIDS} from './nkrumah-park-data.js';
import {createNkrumahPark} from './nkrumah-park.js';
import {PRECINCT_STREET_SCENE,createPrecinctStreets} from './precinct-streets.js';
import {POPULAR_LANDMARKS} from './popular-landmarks-data.js';
import {createPopularLandmark} from './popular-landmarks.js';
import {PRECINCT_LANDMARKS} from './precinct-navigation.js';
import {createPrecinctLandmark,precinctSolids} from './independence-precinct.js';
import {offsetMetres,distanceMetres} from './motion.js';
// OSM positions/way IDs from the bundled Accra extract. Models are authored from
// photo references (docs/landmark-references.md), not inferred from POI category.
export const CITY_LANDMARKS=[...POPULAR_LANDMARKS.filter(p=>p.id!==NKRUMAH_PARK.id),NKRUMAH_PARK,...PRECINCT_LANDMARKS,PRECINCT_STREET_SCENE];
export const isCityLandmark=id=>CITY_LANDMARKS.some(l=>(l.sourceIds||[l.sourceId]).some(sourceId=>sourceId!==undefined&&String(sourceId)===String(id)));
export function landmarkColliders(origin){
 const out=[];
 for(const l of CITY_LANDMARKS){if(distanceMetres(origin,l.position)>Math.max(200,l.width,l.depth))continue;
  if(l.rings){out.push({id:l.id,rings:l.rings,height:l.height,precinctWalkable:l.id==='independence-arch'||l.id==='unknown-soldier'||l.id.startsWith('square-stand')});continue;}
  const boxes=l.id===NKRUMAH_PARK.id?PARK_SOLIDS:precinctSolids(l);
  const a=l.rotation*Math.PI/180;
  for(const [index,[x,z,w,d,height=l.height]] of boxes.entries()){const ring=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>offsetMetres(l.position,(x+dx)*Math.cos(a)+(z+dz)*Math.sin(a),(x+dx)*Math.sin(a)-(z+dz)*Math.cos(a)));out.push({id:l.id+':'+index,rings:[ring],height,noDoor:l.id===NKRUMAH_PARK.id,precinctWalkable:l.id==='independence-arch'||l.id==='unknown-soldier'||l.id.startsWith('square-stand')})}
 }return out;
}
export function createCityLandmark(data){
 if(data.id===NKRUMAH_PARK.id)return createNkrumahPark();
 if(data.id===PRECINCT_STREET_SCENE.id)return createPrecinctStreets();
 return data.model?createPopularLandmark(data):createPrecinctLandmark(data);
}
