import {offsetMetres} from './motion.js';
export const AIRPORT_T3={id:'accra-airport-terminal-3',name:'Accra International Airport · Terminal 3',position:[-.1729,5.6019],rotation:67.4,width:620,depth:460,height:20,sourceIds:[1197119150,2420073752,2676037408,2676037410,2676037412,2676037414,2676037416,2676037418,2420018458,2420018460]};
const angle=AIRPORT_T3.rotation*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
// X follows the terminal's long facade. Negative Z faces the public forecourt.
export const t3Point=(x,z)=>offsetMetres(AIRPORT_T3.position,x*c+z*s,x*s-z*c);
export const t3Local=p=>{const e=(p[0]-AIRPORT_T3.position[0])*111320*Math.cos(AIRPORT_T3.position[1]*Math.PI/180),n=(p[1]-AIRPORT_T3.position[1])*111320;return [e*c+n*s,e*s-n*c];};
export const t3World=p=>[(p[0]-AIRPORT_T3.position[0])*111320*Math.cos(AIRPORT_T3.position[1]*Math.PI/180),(AIRPORT_T3.position[1]-p[1])*111320];
export const t3Rect=(x,z,w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>t3Point(x+dx,z+dz));
