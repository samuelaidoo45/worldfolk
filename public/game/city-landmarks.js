import {CASTLE_SITES,castleColliders} from './castle-asomdwe-data.js';
import {createCastleAsomdwe} from './castle-asomdwe.js';
import {CIVIC_SITES,civicColliders} from './independence-neighbourhood-data.js';
import {createCivicNeighbourhood} from './independence-neighbourhood.js';
import {OSU_SITES,osuColliders} from './osu-oxford-data.js';
import {createOsuSite} from './osu-oxford.js';
import {SKY_SITES,skyColliders} from './senchi-skyline-data.js';
import {createSenchiSkyline} from './senchi-skyline.js';
import {BOUND_SITES,BOUND_GROUNDS,boundColliders} from './airport-bound-data.js';
import {createAirportBound} from './airport-bound.js';
import {AREA_SITES,areaColliders} from './mahama-neighbourhood-data.js';
import {createMahamaNeighbourhood} from './mahama-neighbourhood.js';
import {MAHAMA_SITES,mahamaColliders} from './mahama-bypass-data.js';
import {createMahamaBypass} from './mahama-bypass.js';
import {POLO_SITES,poloColliders} from './polo-senchi-data.js';
import {createPoloSenchi} from './polo-senchi.js';
import {REGENT_ROADSIDE,regentRoadsideColliders} from './regent-roadside-data.js';
import {createRegentRoadside} from './regent-roadside.js';
import {SHANGRI_BLOCK,shangriColliders} from './shangri-la-data.js';
import {createShangriBlock} from './shangri-la.js';
import {RESIDENTIAL_BLOCK,residentialColliders} from './airport-residential-data.js';
import {createResidentialBlock} from './airport-residential.js';
import {OAK_PLAZA,oakColliders} from './oak-plaza-data.js';
import {createOakPlaza} from './oak-plaza.js';
import {VILLA_MONTICELLO,villaColliders} from './villa-monticello-data.js';
import {createVillaMonticello} from './villa-monticello.js';
import {LANCASTER,lancasterColliders} from './lancaster-data.js';
import {createLancaster} from './lancaster.js';
import {AIRPORT_VIEW,hotelColliders} from './airport-view-data.js';
import {createAirportView} from './airport-view.js';
import {AIRPORT_ANNEX,annexColliders} from './airport-annex-data.js';
import {createAirportAnnex} from './airport-annex.js';
import {AIRPORT_ISLANDS,airportIslandColliders} from './airport-junction-data.js';
import {createAirportIsland} from './airport-junction.js';
import {AIRPORT_STOPS,airportStopColliders} from './airport-stops-data.js';
import {createAirportStop} from './airport-stops.js';
import {AIRPORT_CORRIDOR,corridorColliders} from './airport-corridor-data.js';
import {createAirportCorridor} from './airport-corridor.js';
import {BUSINESS_SITES,businessColliders} from './airport-business-data.js';
import {createBusinessSite} from './airport-business.js';
import {AIRPORT_CITY_SITES,airportCityColliders} from './airport-city-data.js';
import {createAirportCitySite} from './airport-city.js';
import {AIRPORT_T2,airportT2Colliders} from './airport-t2-data.js';
import {createAirportT2} from './airport-t2.js';
import {AIRPORT_T3,airportT3Colliders} from './airport-t3-data.js';
import {createAirportT3} from './airport-t3.js';
import {KOFI_SITES,kofiColliders} from './kofi-annan-data.js';
import {createKofiAnnanSite} from './kofi-annan.js';
import {NEIGHBOUR_SITES,neighbourColliders} from './villaggio-neighbours-data.js';
import {createVillaggioNeighbour} from './villaggio-neighbours.js';
import {INTERCHANGE,interchangeColliders,interchangeBarrierColliders,interchangeWallColliders} from './interchange-data.js';
import {createInterchange} from './interchange.js';
import {CITY_GALLERIA,galleriaColliders} from './city-galleria-data.js';
import {createCityGalleria} from './city-galleria.js';
import {GHUD_PARK,ghudColliders} from './ghud-park-data.js';
import {createGhudPark} from './ghud-park.js';
import {MALL_FRONTAGE,frontageColliders} from './mall-frontage-data.js';
import {createMallFrontage} from './mall-frontage.js';
import {MALL_BUS_STOPS,busStopColliders} from './mall-bus-stops-data.js';
import {createMallBusStop} from './mall-bus-stops.js';
import {MALL_TERMINAL,terminalColliders} from './mall-terminal-data.js';
import {createMallTerminal} from './mall-terminal.js';
import {MALL_ROUNDABOUT,mallRoundaboutColliders} from './mall-roundabout-data.js';
import {createMallRoundabout} from './mall-roundabout.js';
import {SPANNER,spannerColliders} from './spanner-data.js';
import {createSpanner} from './spanner.js';
import {GALLERY,galleryColliders} from './gallery-data.js';
import {createGallery} from './gallery.js';
import {VILLAGGIO,villaggioColliders} from './villaggio-data.js';
import {createVillaggio} from './villaggio.js';
import {NKRUMAH_PARK,PARK_SOLIDS} from './nkrumah-park-data.js';
import {createNkrumahPark} from './nkrumah-park.js';
import {PRECINCT_STREET_SCENE,createPrecinctStreets} from './precinct-streets.js';
import {POPULAR_LANDMARKS} from './popular-landmarks-data.js';
import {createPopularLandmark} from './popular-landmarks.js';
import {PRECINCT_LANDMARKS} from './precinct-navigation.js';
import {createPrecinctLandmark,precinctSolids} from './independence-precinct.js';
import {offsetMetres,distanceMetres} from './motion.js';
import {SIGNATURE,signatureColliders} from './signature-data.js';
import {createSignature} from './signature.js';
// OSM positions/way IDs from the bundled Accra extract. Models are authored from
// photo references (docs/landmark-references.md), not inferred from POI category.
export const CITY_LANDMARKS=[...CASTLE_SITES,...CIVIC_SITES,...OSU_SITES,...SKY_SITES,...BOUND_SITES,...BOUND_GROUNDS,...AREA_SITES,...MAHAMA_SITES,...POLO_SITES,REGENT_ROADSIDE,SHANGRI_BLOCK,RESIDENTIAL_BLOCK,OAK_PLAZA,VILLA_MONTICELLO,LANCASTER,AIRPORT_VIEW,AIRPORT_ANNEX,...AIRPORT_ISLANDS,...AIRPORT_STOPS,AIRPORT_CORRIDOR,...BUSINESS_SITES,...AIRPORT_CITY_SITES,AIRPORT_T2,AIRPORT_T3,...KOFI_SITES,...NEIGHBOUR_SITES,INTERCHANGE,CITY_GALLERIA,GHUD_PARK,MALL_FRONTAGE,...MALL_BUS_STOPS,MALL_TERMINAL,MALL_ROUNDABOUT,...POPULAR_LANDMARKS.filter(p=>p.id!==NKRUMAH_PARK.id&&!CIVIC_SITES.some(s=>s.id===p.id)&&!AIRPORT_CITY_SITES.some(s=>s.id===p.id)),NKRUMAH_PARK,SIGNATURE,VILLAGGIO,GALLERY,...PRECINCT_LANDMARKS,PRECINCT_STREET_SCENE];
// Source ownership is immutable at runtime. Collision refresh visits every
// loaded footprint; do not rescan every landmark/source ID for each one.
const landmarkSourceIds=new Set(CITY_LANDMARKS.flatMap(l=>l.sourceIds||[l.sourceId]).filter(id=>id!==undefined).map(String));
export const isCityLandmark=id=>landmarkSourceIds.has(String(id));
export function landmarkColliders(origin,context={}){
 const out=[];
 for(const l of CITY_LANDMARKS){if(distanceMetres(origin,l.position)>Math.max(200,l.width,l.depth))continue;
  if(CASTLE_SITES.some(s=>s.id===l.id)){out.push(...castleColliders(l,origin));continue;}
  if(CIVIC_SITES.some(s=>s.id===l.id)){out.push(...civicColliders(l,origin));continue;}
  if(OSU_SITES.some(s=>s.id===l.id)){out.push(...osuColliders(l));continue;}
  if(AIRPORT_ISLANDS.some(s=>s.id===l.id)){out.push(...airportIslandColliders(l));continue;}
  if(AIRPORT_STOPS.some(s=>s.id===l.id)){out.push(...airportStopColliders(l));continue;}
  if(l.id===AIRPORT_CORRIDOR.id){out.push(...corridorColliders());continue;}
  if(BUSINESS_SITES.some(s=>s.id===l.id)){out.push(...businessColliders(l));continue;}
  if(AIRPORT_CITY_SITES.some(s=>s.id===l.id)){out.push(...airportCityColliders(l));continue;}
  if(l.id===AIRPORT_T2.id){out.push(...airportT2Colliders());continue;}
  if(l.id===AIRPORT_ANNEX.id){out.push(...annexColliders());continue;}
  if(SKY_SITES.some(s=>s.id===l.id)){out.push(...skyColliders(l));continue;}
  if([...BOUND_SITES,...BOUND_GROUNDS].some(s=>s.id===l.id)){out.push(...boundColliders(l));continue;}
  if(AREA_SITES.some(s=>s.id===l.id)){out.push(...areaColliders(l));continue;}
  if(MAHAMA_SITES.some(s=>s.id===l.id)){out.push(...mahamaColliders(l));continue;}
  if(POLO_SITES.some(s=>s.id===l.id)){out.push(...poloColliders(l));continue;}
  if(l.id===REGENT_ROADSIDE.id){out.push(...regentRoadsideColliders());continue;}
  if(l.id===SHANGRI_BLOCK.id){out.push(...shangriColliders());continue;}
  if(l.id===RESIDENTIAL_BLOCK.id){out.push(...residentialColliders());continue;}
  if(l.id===OAK_PLAZA.id){out.push(...oakColliders());continue;}
  if(l.id===VILLA_MONTICELLO.id){out.push(...villaColliders());continue;}
  if(l.id===LANCASTER.id){out.push(...lancasterColliders());continue;}
  if(l.id===AIRPORT_VIEW.id){out.push(...hotelColliders());continue;}
  if(l.id===AIRPORT_T3.id){out.push(...airportT3Colliders());continue;}
  if(KOFI_SITES.some(s=>s.id===l.id)){out.push(...kofiColliders(l));continue;}
  if(NEIGHBOUR_SITES.some(s=>s.id===l.id)){out.push(...neighbourColliders(l));continue;}
  if(l.id===INTERCHANGE.id){out.push(...interchangeColliders(origin),...interchangeBarrierColliders(origin),...interchangeWallColliders(origin));continue;}
  if(l.id===CITY_GALLERIA.id){out.push(...galleriaColliders());continue;}
  if(l.id===GHUD_PARK.id){out.push(...ghudColliders());continue;}
  if(l.id===MALL_FRONTAGE.id){out.push(...frontageColliders());continue;}
  if(MALL_BUS_STOPS.some(s=>s.id===l.id)){out.push(...busStopColliders(l));continue;}
  if(l.id===MALL_TERMINAL.id){out.push(...terminalColliders(context));continue;}
  if(l.id===MALL_ROUNDABOUT.id){out.push(...mallRoundaboutColliders());continue;}
  if(l.id===SPANNER.id){out.push(...spannerColliders());continue;}
  if(l.id===GALLERY.id){out.push(...galleryColliders());continue;}
  if(l.id===VILLAGGIO.id){out.push(...villaggioColliders());continue;}
  if(l.id===SIGNATURE.id){out.push(...signatureColliders());continue;}
  if(l.rings){out.push({id:l.id,rings:l.rings,height:l.height,precinctWalkable:l.id==='independence-arch'||l.id==='unknown-soldier'||l.id.startsWith('square-stand')});continue;}
  const boxes=l.id===NKRUMAH_PARK.id?PARK_SOLIDS:precinctSolids(l);
  const a=l.rotation*Math.PI/180;
  for(const [index,[x,z,w,d,height=l.height]] of boxes.entries()){const ring=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>offsetMetres(l.position,(x+dx)*Math.cos(a)+(z+dz)*Math.sin(a),(x+dx)*Math.sin(a)-(z+dz)*Math.cos(a)));out.push({id:l.id+':'+index,rings:[ring],height,noDoor:l.id===NKRUMAH_PARK.id,precinctWalkable:l.id==='independence-arch'||l.id==='unknown-soldier'||l.id.startsWith('square-stand')})}
 }return out;
}
export function createCityLandmark(data){
 if(CASTLE_SITES.some(s=>s.id===data.id))return createCastleAsomdwe(data);
 if(CIVIC_SITES.some(s=>s.id===data.id))return createCivicNeighbourhood(data);
 if(OSU_SITES.some(s=>s.id===data.id))return createOsuSite(data);
 if(AIRPORT_ISLANDS.some(s=>s.id===data.id))return createAirportIsland(data);
 if(AIRPORT_STOPS.some(s=>s.id===data.id))return createAirportStop(data);
 if(data.id===AIRPORT_CORRIDOR.id)return createAirportCorridor();
 if(BUSINESS_SITES.some(s=>s.id===data.id))return createBusinessSite(data);
 if(AIRPORT_CITY_SITES.some(s=>s.id===data.id))return createAirportCitySite(data);
 if(data.id===AIRPORT_T2.id)return createAirportT2();
 if(data.id===AIRPORT_ANNEX.id)return createAirportAnnex();
 if(SKY_SITES.some(s=>s.id===data.id))return createSenchiSkyline(data);
 if([...BOUND_SITES,...BOUND_GROUNDS].some(s=>s.id===data.id))return createAirportBound(data);
 if(AREA_SITES.some(s=>s.id===data.id))return createMahamaNeighbourhood(data);
 if(MAHAMA_SITES.some(s=>s.id===data.id))return createMahamaBypass(data);
 if(POLO_SITES.some(s=>s.id===data.id))return createPoloSenchi(data);
 if(data.id===REGENT_ROADSIDE.id)return createRegentRoadside();
 if(data.id===SHANGRI_BLOCK.id)return createShangriBlock();
 if(data.id===RESIDENTIAL_BLOCK.id)return createResidentialBlock();if(data.id===OAK_PLAZA.id)return createOakPlaza();
 if(data.id===VILLA_MONTICELLO.id)return createVillaMonticello();
 if(data.id===LANCASTER.id)return createLancaster();
 if(data.id===AIRPORT_VIEW.id)return createAirportView();
 if(data.id===AIRPORT_T3.id)return createAirportT3();
 if(KOFI_SITES.some(s=>s.id===data.id))return createKofiAnnanSite(data);
 if(NEIGHBOUR_SITES.some(s=>s.id===data.id))return createVillaggioNeighbour(data);
 if(data.id===INTERCHANGE.id)return createInterchange();
 if(data.id===CITY_GALLERIA.id)return createCityGalleria();
 if(data.id===GHUD_PARK.id)return createGhudPark();
 if(data.id===MALL_FRONTAGE.id)return createMallFrontage();
 if(MALL_BUS_STOPS.some(s=>s.id===data.id))return createMallBusStop(data);
 if(data.id===MALL_TERMINAL.id)return createMallTerminal();
 if(data.id===MALL_ROUNDABOUT.id)return createMallRoundabout();
 if(data.id===SPANNER.id)return createSpanner();
 if(data.id===GALLERY.id)return createGallery();
 if(data.id===VILLAGGIO.id)return createVillaggio();
 if(data.id===SIGNATURE.id)return createSignature();
 if(data.id===NKRUMAH_PARK.id)return createNkrumahPark();
 if(data.id===PRECINCT_STREET_SCENE.id)return createPrecinctStreets();
 return data.model?createPopularLandmark(data):createPrecinctLandmark(data);
}
