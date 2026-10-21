import {offsetMetres,distanceMetres} from './motion.js';
// Rounded OSM points and photo-located frontage centres are kept separately.
// August 2024 references establish appearance, not surveyed 2026 dimensions.
export const MALL_BUS_STOPS=[
 {id:'spanner-bus-stop',name:'Spanner bus stop',aliases:['Spanner bus shelter'],osmNode:5116037041,mappedPosition:[-.17645,5.6197],position:offsetMetres([-.17645,5.6197],-8.5,0),heading:70,width:14,depth:12,height:3.5,variant:'spanner',shelterWidth:4.6,reference:'Estimated cover and seating; current close-up required'},
 {id:'mall-front-bus-stop',name:'Accra Mall bus stop',aliases:['Accra Mall shelter'],osmNode:3045917876,mappedPosition:[-.17405,5.62277],position:offsetMetres([-.17405,5.62277],3,0),heading:302,width:25,depth:14,height:3.5,variant:'mall',shelterWidth:19.6,reference:'Direct mall-front Street View · August 2024 · three covered seating modules'},
 {id:'mall-opposite-bus-stop',name:'Accra Mall opposite-side bus stop',aliases:['Accra Mall taxi waiting area','Mall-facing bus shelter'],mappedPosition:[-.17481,5.62227],position:[-.17481,5.62227],heading:124,width:36,depth:22,height:6.8,variant:'opposite',shelterWidth:26.2,reference:'User screenshots and matched Street View · August 2024 · Ghana Link advertising frontage',locationSource:'Photo-located estimate; no formal station name inferred'}
];
// Local x follows the bench, local z points toward the road.
export function stopPoint(stop,x,z){const a=stop.heading*Math.PI/180;return offsetMetres(stop.position,-x*Math.cos(a)+z*Math.sin(a),x*Math.sin(a)+z*Math.cos(a));}
export function stopLocal(stop,p){const east=(p[0]-stop.position[0])*111320*Math.cos(stop.position[1]*Math.PI/180),north=(p[1]-stop.position[1])*111320,a=stop.heading*Math.PI/180;return [-east*Math.cos(a)+north*Math.sin(a),east*Math.sin(a)+north*Math.cos(a)];}
export function stopModules(stop){return stop.variant==='spanner'?[{x:0,w:4.6}]:stop.variant==='mall'?[-7,0,7].map(x=>({x,w:5.6})):[-9,0,9].map(x=>({x,w:8.2}));}
export function stopTaxiBays(stop){return stop.variant==='opposite'?[-8,0,8].map((x,i)=>({id:'taxi-'+i,x,z:5.7,w:3.8,d:2.05,h:1.5,heading:(stop.heading+270)%360})):[];}
export const BUS_STOP_PLACES=MALL_BUS_STOPS.map(s=>({id:s.id,name:s.name,lng:s.mappedPosition[0],lat:s.mappedPosition[1],type:'bus stop',category:'bus stop',emoji:'🚏',area:s.variant==='spanner'?'Spanner · Liberation Road':'Accra Mall · Tetteh Quarshie Road',description:'Wait under cover, meet people and request transport. Sit until you choose to stand, then continue exploring Accra.',activities:['stroll','connect']}));
export const busStopForPlace=p=>MALL_BUS_STOPS.find(s=>p?.id===s.id||[s.name,...s.aliases].some(n=>n.toLowerCase()===(p?.name||'').toLowerCase()));
export const busStopArrival=stop=>({position:stopPoint(stop,stopModules(stop)[0].x-1.25,1.1),target:stop.position,cameraPitch:22,hint:stop.name+' · sit under the cover or use the ride point. Use the footbridge to cross the main road.'});
export function stopStructures(stop){return [
 ...stopModules(stop).flatMap((m,i)=>[
  ...[-m.w/2+.12,m.w/2-.12].flatMap(dx=>[-.85,.85].map(z=>({id:`module-${i}-post-${dx}-${z}`,kind:'post',x:m.x+dx,z,w:.1,d:.1,h:2.65}))),
  {id:`module-${i}-back`,kind:'back',x:m.x,z:-.9,w:m.w,d:.09,h:2.25},
  {id:`module-${i}-bench`,kind:'bench',x:m.x-.45,z:-.15,w:3.25,d:.5,h:.47},
  ...(stop.variant!=='spanner'?[{id:`module-${i}-chairs`,kind:'chairs',x:m.x+2.3,z:-.15,w:stop.variant==='opposite'?1.65:.6,d:.55,h:.47}]:[])
 ]),
 {id:'stop-pole',kind:'pole',x:stop.shelterWidth/2+1,z:.8,w:.08,d:.08,h:2.9},
 ...(stop.variant==='opposite'?[
  {id:'billboard-left-post',kind:'billboard-post',x:-4,z:-3.1,w:.2,d:.2,h:5.5},
  {id:'billboard-right-post',kind:'billboard-post',x:4,z:-3.1,w:.2,d:.2,h:5.5},
  {id:'kiosk',kind:'kiosk',x:stop.shelterWidth/2+2,z:-.2,w:1.6,d:1.4,h:1.2},
  ...stopTaxiBays(stop).map(t=>({...t,kind:'taxi'}))
 ]:[])
];}
export function busStopColliders(stop){return stopStructures(stop).map(s=>({id:stop.id+':'+s.id,height:s.h,noDoor:true,rings:[[[-s.w/2,-s.d/2],[s.w/2,-s.d/2],[s.w/2,s.d/2],[-s.w/2,s.d/2],[-s.w/2,-s.d/2]].map(([x,z])=>stopPoint(stop,s.x+x,s.z+z))]}));}
export const BUS_STOP_SEATS=MALL_BUS_STOPS.flatMap(stop=>stopModules(stop).flatMap((m,j)=>[-1.25,.35].map((x,i)=>({id:stop.id+'-seat-'+j+'-'+i,stopId:stop.id,kind:'sit',label:'Sit at '+stop.name,position:stopPoint(stop,m.x+x,.65),seatPosition:stopPoint(stop,m.x+x,-.15),elevation:0,heading:stop.heading,cameraHeading:(stop.heading+180)%360,offset:-.43}))));
export const BUS_STOP_ACTIVITIES=[...BUS_STOP_SEATS,...MALL_BUS_STOPS.map(stop=>({id:stop.id+'-ride',stopId:stop.id,kind:'bus-stop-ride',label:'Request transport from '+stop.name,position:stopPoint(stop,stop.shelterWidth/2+1,2.2),elevation:0,heading:stop.heading}))];
export function nearbyBusStop(position,radius=35){return MALL_BUS_STOPS.map(s=>({s,d:distanceMetres(s.position,position)})).filter(v=>v.d<radius).sort((a,b)=>a.d-b.d)[0]?.s||null;}
export function busStopPeople(stop,seconds,minute=720){const day=minute>=300&&minute<1320,modules=stopModules(stop);const people=[{id:stop.id+'-waiting',name:'Esi',avatar:'👩🏾',position:stopPoint(stop,-stop.shelterWidth/2-1.1,.3),heading:stop.heading,moving:false,speed:0,elevation:0,action:'watch'}];
 if(stop.variant!=='spanner')for(const [i,m] of modules.entries())people.push({id:stop.id+'-seated-'+i,name:['Ama','Yaw','Abena'][i],avatar:i%2?'👨🏾':'👩🏾',position:stopPoint(stop,m.x+2.3,-.15),heading:stop.heading,moving:false,speed:0,elevation:0,poseOffset:-.43,action:'sit'});
 if(day){const length=stop.shelterWidth-2,phase=seconds*.65%(length*2),forward=phase<length;people.push({id:stop.id+'-walker',name:'Kojo',avatar:'👨🏾',position:stopPoint(stop,-length/2+(forward?phase:length*2-phase),2.6),heading:(stop.heading+(forward?270:90))%360,moving:true,speed:.65,elevation:0});}return people;}
