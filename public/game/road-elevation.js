import {skyWidth} from './senchi-skyline-data.js';
import {boundWidth} from './airport-bound-data.js';
import {mahamaWidth} from './mahama-bypass-data.js';
import {poloRoadWidth} from './polo-senchi-data.js';
import {shangriWidth} from './shangri-la-data.js';
import {residentialWidth} from './airport-residential-data.js';
import {corridorWidth} from './airport-corridor-data.js';
import {INTERCHANGE_PROFILES,interchangeSurface} from './interchange-data.js';
import {T3_ROAD_PROFILES,airportRoadSurface} from './airport-t3-roads.js';
import {distanceMetres} from './motion.js';
export const ROAD_PROFILES=[...INTERCHANGE_PROFILES,...T3_ROAD_PROFILES];
const roadWidths=new Map(ROAD_PROFILES.map(r=>[String(r.id),r.width]));
export const profiledRoadWidth=(id,fallback)=>skyWidth(id,boundWidth(id,mahamaWidth(id,poloRoadWidth(id,shangriWidth(id,residentialWidth(id,corridorWidth(id,roadWidths.get(String(id))??fallback)))))));
export const roadSurface=(p,heading=0,roadId=null)=>airportRoadSurface(p,heading,roadId)||interchangeSurface(p,heading,roadId);
export const roadHeight=(p,heading=0,roadId=null)=>roadSurface(p,heading,roadId)?.height||0;
export const bodyRoadHeight=b=>b.driving?roadHeight(b.position,b.heading||0,b.roadId??null):Number(b.elevation)||0;
export const sameRoadLevel=(a,b)=>Math.abs(bodyRoadHeight(a)-bodyRoadHeight(b))<3;
export function trackRoadSurface(position,heading,previous=null){
 const held=previous&&distanceMetres(position,previous.position)<20?roadSurface(position,heading,previous.roadId):null,sample=held||roadSurface(position,heading);
 return sample?{...sample,position:[...position]}:null;
}
