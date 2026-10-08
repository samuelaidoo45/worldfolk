import {projectOnSegment,distanceMetres} from './motion.js';
// Resolve the player's position, never the camera centre or selected destination.
export function resolvePlayerLocation({position,mode,indoorPlace,roads=[],places=[],district}){
 const area=district?.name?.split(' · ')[0]||'Accra';
 if(mode==='indoor')return {label:indoorPlace?.name||'Inside building',area,prefix:'INSIDE',description:`Inside ${indoorPlace?.name||'building'}, ${area}`};
 if(!position)return {label:'Locating…',area:'Accra',prefix:'YOU ARE HERE',description:'Finding your position'};
 let nearest=null;
 for(const feature of roads){const p=feature.properties||{},name=p.name||p.name_en;if(!name||/rail|ferry/.test(p.class||'')||p.structure==='tunnel')continue;const g=feature.geometry,lines=g?.type==='LineString'?[g.coordinates]:g?.type==='MultiLineString'?g.coordinates:[];for(const line of lines)for(let i=1;i<line.length;i++){const distance=projectOnSegment(position,line[i-1],line[i]).distance;if(distance<=30&&(!nearest||distance<nearest.distance))nearest={name:String(name),distance}}}
 const place=places.filter(p=>Number.isFinite(p.lng)&&Number.isFinite(p.lat)&&!['Street','Neighbourhood'].includes(p.type)&&p.id!=='home').map(p=>({...p,distance:distanceMetres(position,[p.lng,p.lat])})).filter(p=>p.distance<=55).sort((a,b)=>a.distance-b.distance)[0];
 const label=mode==='flight'?`Above ${area}`:nearest?.name|| (place?`Near ${place.name}`:area);
 return {label,area,prefix:mode==='drive'?'DRIVING':mode==='transit'?'RIDING':mode==='flight'?'FLYING':'YOU ARE HERE',description:`You are ${mode==='flight'?'flying above':nearest?'on':place?'near':'in'} ${mode==='flight'?area:nearest?.name||place?.name||area}${label!==area&&mode!=='flight'?`, ${area}`:''}`};
}
