import {civicForPlace} from './independence-neighbourhood-data.js';
import {osuForPlace} from './osu-oxford-data.js';
import {poloForPlace} from './polo-senchi-data.js';
import {shangriForPlace} from './shangri-la-data.js';
import {isRegus,REGUS_PLACE} from './airport-residential-data.js';
import {isOakPlaza,OAK_PLAZA} from './oak-plaza-data.js';
import {isVillaMonticello,VILLA_MONTICELLO} from './villa-monticello-data.js';
import {isLancaster,LANCASTER} from './lancaster-data.js';
import {isAirportView,AIRPORT_VIEW} from './airport-view-data.js';
import {airportStopForPlace} from './airport-stops-data.js';
import {businessForPlace} from './airport-business-data.js';
import {airportCityForPlace} from './airport-city-data.js';
import {AIRPORT_T2,isAirportT2} from './airport-t2-data.js';
import {AIRPORT_T3,isAirportT3} from './airport-t3-data.js';
import {kofiForPlace} from './kofi-annan-data.js';
import {NEIGHBOUR_SITES} from './villaggio-neighbours-data.js';
import {distanceMetres} from './motion.js';
import {START_PLACES} from './city-places.js';
import {inAccra} from './map-region.js';
import {placeEmoji} from './place-icons.js';
export const normalizePlaceText=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function indexPlaces(mapped){
 const unique=new Map(),interchanges=new Set(START_PLACES.filter(p=>p.type==='interchange').map(p=>normalizePlaceText(p.name)));
 for(const p of [...START_PLACES,...mapped]){
  if(!p.name||!inAccra(p.lng,p.lat))continue;
  const civic=civicForPlace(p);if(civic&&p.id!==civic.id)continue;
  const osu=osuForPlace(p);if(osu&&p.id!==osu.id&&p.id!=='osu')continue;
  const polo=poloForPlace(p);if(polo&&p.id!==polo.id)continue;
  const shangri=shangriForPlace(p);if(shangri&&p.id!==shangri.id)continue;
  if(isRegus(p)&&p.id!==REGUS_PLACE.id)continue;
  if(isOakPlaza(p)&&p.id!==OAK_PLAZA.id)continue;
  if(isVillaMonticello(p)&&p.id!==VILLA_MONTICELLO.id)continue;
  if(isLancaster(p)&&p.id!==LANCASTER.id)continue;
  if(isAirportView(p)&&p.id!==AIRPORT_VIEW.id)continue;
  const stop=airportStopForPlace(p);if(stop&&p.id!==stop.id)continue;
  const business=businessForPlace(p);if(business&&p.id!==business.id)continue;
  const citySite=airportCityForPlace(p);if(citySite&&p.id!==citySite.id)continue;
  if(isAirportT2(p)&&p.id!==AIRPORT_T2.id&&distanceMetres([p.lng,p.lat],AIRPORT_T2.position)<350)continue;
  if(isAirportT3(p)&&p.id!==AIRPORT_T3.id&&distanceMetres([p.lng,p.lat],AIRPORT_T3.position)<500)continue;
  const name=normalizePlaceText(p.name);const authoredKofi=kofiForPlace(p);if(authoredKofi&&p.id!==authoredKofi.id&&distanceMetres([p.lng,p.lat],authoredKofi.position)<180)continue;if(NEIGHBOUR_SITES.some(s=>p.id!==s.id&&name===normalizePlaceText(s.name)&&distanceMetres([p.lng,p.lat],s.position)<180))continue;if(p.type==='street'&&interchanges.has(name))continue;const key=`${name}:${Math.round(p.lng*10000)}:${Math.round(p.lat*10000)}`;
  if(unique.has(key))continue;
  unique.set(key,{...p,id:p.id||`g_${Math.round(p.lng*10000)}_${Math.round(p.lat*10000)}`,area:p.area||p.detail||'Accra',emoji:p.emoji||placeEmoji(p),description:p.description||'Explore this place in Accra and meet people nearby.',activities:p.activities||['explore','stroll'],searchText:normalizePlaceText(`${p.name} ${(p.aliases||[]).join(' ')} ${p.type} ${p.area||p.detail||''}`),searchName:name});
 }
 return [...unique.values()];
}
export function searchPlaceIndex(index,query,{offset=0,limit=40}={}){
 const q=normalizePlaceText(query),terms=q.split(' ').filter(Boolean);
 const matches=index.filter(p=>terms.every(t=>p.searchText.includes(t))).sort((a,b)=>Number(b.searchName===q)-Number(a.searchName===q)||Number(b.searchName.startsWith(q))-Number(a.searchName.startsWith(q))||a.name.localeCompare(b.name)||a.lng-b.lng||a.lat-b.lat);
 return {items:matches.slice(offset,offset+limit),total:matches.length};
}
