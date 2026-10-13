import {MALL_ARRIVAL,MALL_ENTRANCE,isAccraMall} from './accra-mall-data.js';
import {NKRUMAH_PARK,parkPoint} from './nkrumah-park-data.js';
// Public, mapped viewing approaches. Never use these for arbitrary player homes.
import {offsetMetres} from './motion.js';
export function landmarkArrival(place){
 if(isAccraMall(place))return {position:[...MALL_ARRIVAL],target:MALL_ENTRANCE,cameraPitch:8,indoor:true};
 const name=String(place?.name||'');
 if(/^(kwame )?nkrumah (memorial park|mausoleum)( & mausoleum)?$/i.test(name))return {position:parkPoint(0,76),target:NKRUMAH_PARK.position,cameraPitch:8};
 if(/^(unknown soldier memorial|memorial of the unknown soldier|liberation day monument)$/i.test(name))return {position:[-.19267,5.54798],target:[-.1927328,5.54826075],cameraPitch:8};
 if(/^black star gate$/i.test(name))return {position:offsetMetres([-.1928568532,5.54899685],75,14),target:[-.1928568532,5.54899685],cameraPitch:8};
 if(/^(independence square|black star square|independence arch)$/i.test(name))return {position:[-.19256,5.54728],target:[-.1924081,5.54647445],cameraPitch:8};
 return null;
}
export const isOutdoorLandmark=place=>{const arrival=landmarkArrival(place);return !!arrival&&!arrival.indoor};
