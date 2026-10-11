import {POPULAR_LANDMARKS} from './popular-landmarks-data.js';
import {createPopularLandmark} from './popular-landmarks.js';
import {SQUARE_STANDS} from './square-stands.js';
import {createPrecinctLandmark,precinctSolids} from './independence-precinct.js';
import {offsetMetres,distanceMetres} from './motion.js';
// OSM positions/way IDs from the bundled Accra extract. Models are authored from
// photo references (docs/landmark-references.md), not inferred from POI category.
export const CITY_LANDMARKS=[...POPULAR_LANDMARKS,...SQUARE_STANDS,
 {id:'independence-parade-ground',name:'Independence Square parade ground',position:[-.19256,5.54742],rotation:-11,width:210,depth:160,height:0},
 {id:'black-star-gate',name:'Black Star Gate',sourceId:339732252,position:[-.1928568532,5.54899685],rotation:101,width:25,depth:9,height:27},
 {id:'independence-arch',name:'Independence Arch',sourceId:339732244,position:[-.1924081,5.54647445],rotation:-11,width:50,depth:17,height:30},
];
export const isCityLandmark=id=>CITY_LANDMARKS.some(l=>(l.sourceIds||[l.sourceId]).some(sourceId=>sourceId!==undefined&&String(sourceId)===String(id)));
export function landmarkColliders(origin){
 const out=[];
 for(const l of CITY_LANDMARKS){if(distanceMetres(origin,l.position)>Math.max(200,l.width,l.depth))continue;
  if(l.rings){out.push({id:l.id,rings:l.rings,height:l.height});continue;}
  const boxes=precinctSolids(l);
  const a=l.rotation*Math.PI/180;
  for(const [index,[x,z,w,d]] of boxes.entries()){const ring=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>offsetMetres(l.position,(x+dx)*Math.cos(a)+(z+dz)*Math.sin(a),(x+dx)*Math.sin(a)-(z+dz)*Math.cos(a)));out.push({id:l.id+':'+index,rings:[ring],height:l.height})}
 }return out;
}
export function createCityLandmark(data){
 return data.model?createPopularLandmark(data):createPrecinctLandmark(data);
}
