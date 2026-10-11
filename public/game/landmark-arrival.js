// Public, mapped viewing approaches. Never use these for arbitrary player homes.
import {offsetMetres} from './motion.js';
export function landmarkArrival(place){
 const name=String(place?.name||'');
 if(/^black star gate$/i.test(name))return {position:offsetMetres([-.1928568532,5.54899685],75,14),target:[-.1928568532,5.54899685],cameraPitch:8};
 if(/^(independence square|black star square|independence arch)$/i.test(name))return {position:[-.19256,5.54728],target:[-.1924081,5.54647445],cameraPitch:8};
 return null;
}
export const isOutdoorLandmark=place=>!!landmarkArrival(place);
