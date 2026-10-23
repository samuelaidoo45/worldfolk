import {SKY_SITES} from './senchi-skyline-data.js';
import {BOUND_SITES,BOUND_GROUNDS} from './airport-bound-data.js';
import {AREA_SITES} from './mahama-neighbourhood-data.js';
import {POLO_SITES} from './polo-senchi-data.js';
import {MAHAMA_SITES} from './mahama-bypass-data.js';
import {BUSINESS_SITES} from './airport-business-data.js';
import {AIRPORT_CITY_SITES} from './airport-city-data.js';
import {KOFI_SITES} from './kofi-annan-data.js';

// Only packages with no animation/behaviour closure. Signature/Gallery pool
// effects and transport/venue actors stay on their existing authored paths.
export const WORKER_STATIC_LANDMARKS=new Set(['villaggio-vista',...[SKY_SITES,BOUND_SITES,BOUND_GROUNDS,AREA_SITES,POLO_SITES,MAHAMA_SITES,BUSINESS_SITES,AIRPORT_CITY_SITES,KOFI_SITES].flat().map(site=>site.id)]);
