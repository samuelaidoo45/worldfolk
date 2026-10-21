import {CIVIC_ACTIVITIES,civicPeople,CIVIC_VISITS} from './independence-neighbourhood-data.js';
import {OSU_ACTIVITIES,osuPeople,nearbyOsu} from './osu-oxford-data.js';
import {SKY_ACTIVITIES} from './senchi-skyline-data.js';
import {BOUND_ACTIVITIES} from './airport-bound-data.js';
import {AREA_ACTIVITIES} from './mahama-neighbourhood-data.js';
import {MAHAMA_ACTIVITIES,mahamaPeople,inMahama} from './mahama-bypass-data.js';
import {POLO_ACTIVITIES,poloPeople,inPoloSenchi} from './polo-senchi-data.js';
import {REGENT_ROADSIDE_ACTIVITIES,regentRoadsidePeople,inRegentRoadside} from './regent-roadside-data.js';
import {SHANGRI_ACTIVITIES,shangriPeople,inShangri} from './shangri-la-data.js';
import {RESIDENTIAL_ACTIVITIES,residentialPeople,nearResidential} from './airport-residential-data.js';
import {OAK_ACTIVITIES,oakPeople,nearOakPlaza} from './oak-plaza-data.js';
import {VILLA_ACTIVITIES,villaPeople,nearVillaMonticello} from './villa-monticello-data.js';
import {LANCASTER_ACTIVITIES,lancasterPeople,nearLancaster} from './lancaster-data.js';
import {HOTEL_ACTIVITIES,hotelPeople,nearAirportView} from './airport-view-data.js';
import {ANNEX_ACTIVITIES,annexPeople,nearAirportAnnex} from './airport-annex-data.js';
import {T3_ACCESS_ACTIVITIES} from './airport-access-data.js';
import {AIRPORT_ISLAND_ACTIVITIES} from './airport-junction-data.js';
import {AIRPORT_STOP_ACTIVITIES,nearbyAirportStop,airportStopPeople} from './airport-stops-data.js';
import {BUSINESS_ACTIVITIES,businessPeople,nearBusiness} from './airport-business-data.js';
import {AIRPORT_CITY_ACTIVITIES,airportCityPeople,nearbyAirportCity} from './airport-city-data.js';
import {T2_ACTIVITIES,airportT2People,nearAirportT2} from './airport-t2-data.js';
import {T3_ACTIVITIES,airportT3People,nearAirportT3} from './airport-t3-data.js';
import {KOFI_ACTIVITIES,kofiPeople,nearbyKofi} from './kofi-annan-data.js';
import {NEIGHBOUR_ACTIVITIES,neighbourPeople,nearbyNeighbour} from './villaggio-neighbours-data.js';
import {INTERCHANGE_ACTIVITIES} from './interchange-data.js';
import {GALLERIA_ACTIVITIES} from './city-galleria-data.js';
import {GHUD_ACTIVITIES,ghudRange,ghudPeople} from './ghud-park-data.js';
import {FRONTAGE_ACTIVITIES,frontageRange,frontagePeople} from './mall-frontage-data.js';
import {BUS_STOP_ACTIVITIES,nearbyBusStop,busStopPeople} from './mall-bus-stops-data.js';
import {MALL_TERMINAL,TERMINAL_ACTIVITIES,insideTerminal,terminalPeople} from './mall-terminal-data.js';
import {MALL_ROUNDABOUT,ROUNDABOUT_ACTIVITY,ROUNDABOUT_WALK} from './mall-roundabout-data.js';
import {SPANNER,SPANNER_ACTIVITIES,SPANNER_DECK,SPANNER_DECK_HEIGHT,spannerPoint} from './spanner-data.js';
import {GALLERY,GALLERY_ACTIVITIES,galleryPoint,galleryLocal} from './gallery-data.js';
import {VILLAGGIO,VILLAGGIO_ACTIVITIES,VILLAGGIO_WALK,villaggioPoint,villaggioLocal} from './villaggio-data.js';
import {NKRUMAH_PARK,PARK_ACTIVITIES,parkPoint,parkLocal} from './nkrumah-park-data.js';
import {PRECINCT_LANDMARKS,precinctPoint,precinctLocal,precinctCollision} from './precinct-navigation.js';
import {distanceMetres,bearingTo} from './motion.js';
import {SIGNATURE,SIGNATURE_ACTIVITIES,signaturePoint,signatureLocal,COURT} from './signature-data.js';
const square=PRECINCT_LANDMARKS.find(p=>p.id==='independence-parade-ground');
const memorial=PRECINCT_LANDMARKS.find(p=>p.id==='unknown-soldier');
const arch=PRECINCT_LANDMARKS.find(p=>p.id==='independence-arch');
const stands=PRECINCT_LANDMARKS.filter(p=>p.id.startsWith('square-stand'));
export const PRECINCT_ACTIVITIES=stands.map((stand,i)=>{
 const run=(stand.depth-3)/12,x=-stand.width/2+stand.width/10,z=stand.depth/2-.9-run*.28;
 return {id:`seat-${i}`,kind:'sit',label:'Sit in the grandstand',position:precinctPoint(stand,x,z),seatPosition:precinctPoint(stand,x,stand.depth/2-.9-run*.77),elevation:.42,heading:(180-stand.rotation+360)%360,offset:-.45};
}).concat([
 {id:'photo-arch',kind:'photo',label:'Photograph Independence Arch',position:precinctPoint(square,0,49),target:arch.position,elevation:0},
 {id:'photo-memorial',kind:'photo',label:'Photograph the Unknown Soldier Memorial',position:precinctPoint(square,-12,-59),target:memorial.position,elevation:0},
 {id:'square-gathering',kind:'watch',label:'Watch the visitors in the square',position:precinctPoint(square,20,-5),target:precinctPoint(square,10,-5),elevation:0},
]).concat(CIVIC_ACTIVITIES,OSU_ACTIVITIES,SKY_ACTIVITIES,BOUND_ACTIVITIES,AREA_ACTIVITIES,MAHAMA_ACTIVITIES,POLO_ACTIVITIES,REGENT_ROADSIDE_ACTIVITIES,SHANGRI_ACTIVITIES,RESIDENTIAL_ACTIVITIES,OAK_ACTIVITIES,VILLA_ACTIVITIES,LANCASTER_ACTIVITIES,HOTEL_ACTIVITIES,ANNEX_ACTIVITIES,T3_ACCESS_ACTIVITIES,AIRPORT_ISLAND_ACTIVITIES,AIRPORT_STOP_ACTIVITIES,BUSINESS_ACTIVITIES,AIRPORT_CITY_ACTIVITIES,T2_ACTIVITIES,T3_ACTIVITIES,KOFI_ACTIVITIES,NEIGHBOUR_ACTIVITIES,INTERCHANGE_ACTIVITIES,GALLERIA_ACTIVITIES,GHUD_ACTIVITIES,FRONTAGE_ACTIVITIES,BUS_STOP_ACTIVITIES,TERMINAL_ACTIVITIES,[ROUNDABOUT_ACTIVITY],SPANNER_ACTIVITIES,PARK_ACTIVITIES,SIGNATURE_ACTIVITIES,VILLAGGIO_ACTIVITIES,GALLERY_ACTIVITIES).map(p=>({...p,heading:p.heading??bearingTo(p.position,p.target)}));
// Only the square's own activities can spawn visitors in its grandstands.
const squareActivityIds=new Set([...stands.map((_,i)=>`seat-${i}`),'photo-arch','photo-memorial','square-gathering']);
export function nearPrecinctActivity(position,elevation=0){return PRECINCT_ACTIVITIES.map(p=>({...p,distance:distanceMetres(position,p.position)})).filter(p=>p.distance<2&&Math.abs(elevation-p.elevation)<.1).sort((a,b)=>a.distance-b.distance)[0]||null}
export function precinctAmbience(position,actors=[],minute=720){
 if(CIVIC_VISITS.some(v=>distanceMetres(position,v.position)<70))return {wind:.015,surf:position[1]<5.547?.025:0,traffic:.012,crowd:.008};
 if(nearbyOsu(position))return {wind:.008,surf:0,traffic:.022,crowd:.012};
 if(inMahama(position))return {wind:.018,surf:0,traffic:.028,crowd:.003};
 if(inPoloSenchi(position))return {wind:.012,surf:0,traffic:.014,crowd:.008};
 if(inRegentRoadside(position))return {wind:.008,surf:0,traffic:.02,crowd:.008};
 if(inShangri(position))return {wind:.009,surf:0,traffic:.02,crowd:.009};
 if(nearResidential(position))return {wind:.006,surf:0,traffic:.01,crowd:.009};
 if(nearOakPlaza(position))return {wind:.005,surf:0,traffic:.01,crowd:.015};
 if(nearVillaMonticello(position))return {wind:.005,surf:0,traffic:.008,crowd:.012};
 if(nearLancaster(position))return {wind:.008,surf:0,traffic:.012,crowd:.015};
 if(nearAirportView(position))return {wind:.008,surf:0,traffic:.015,crowd:.01};
 if(nearAirportAnnex(position))return {wind:.01,surf:0,traffic:.014,crowd:.012};
 if(nearbyAirportStop(position))return {wind:.01,surf:0,traffic:.02,crowd:.012};
 if(nearBusiness(position))return {wind:.01,surf:0,traffic:.014,crowd:.009};
 if(nearbyAirportCity(position))return {wind:.01,surf:0,traffic:.014,crowd:.012};
 if(nearAirportT2(position))return {wind:.01,surf:0,traffic:.018,crowd:.012};
 if(nearAirportT3(position))return {wind:.01,surf:0,traffic:.018,crowd:.012};
 if(nearbyKofi(position))return {wind:.01,surf:0,traffic:.012,crowd:.006};
 if(nearbyNeighbour(position))return {wind:.01,surf:0,traffic:.012,crowd:minute>=360&&minute<1260?.008:.003};
 if(ghudRange(position))return {wind:.016,surf:0,traffic:.006,crowd:minute>=360&&minute<1380?.016:0};
 if(frontageRange(position))return {wind:.01,surf:0,traffic:.025,crowd:minute>=360&&minute<1260?.02:0};
 if(nearbyBusStop(position,18))return {wind:.009,surf:0,traffic:.025,crowd:minute>=300&&minute<1320?.012:.004};
 if(insideTerminal(position))return {wind:.008,surf:0,traffic:.025,crowd:minute>=300&&minute<1320?.025:.008};
 const [gx,gz]=galleryLocal(position);if(gx> -18&&gx<15&&gz> -10&&gz<26)return {wind:.008,surf:0,traffic:.008,crowd:.006};
 const [vx,vz]=villaggioLocal(position);if(vx> -60&&vx<75&&vz> -15&&vz<5)return {wind:.008,surf:0,traffic:.012,crowd:.004};
 const [sx,sz]=signatureLocal(position);if(Math.abs(sx)<45&&Math.abs(sz)<55)return {wind:.009,surf:0,traffic:.01,crowd:.006};
 const [x,z]=precinctLocal(square,position),inside=Math.abs(x)<135&&Math.abs(z)<155;
 if(!inside){const [px,pz]=parkLocal(position);return Math.abs(px)<45&&pz> -55&&pz<95?{wind:.018,surf:.012,traffic:.005,crowd:.012}:null;}
 const day=minute>=360&&minute<1140;
 return {wind:.025,surf:.04*Math.max(0,Math.min(1,(z+60)/170)),traffic:.015*Math.max(0,1-Math.min(Math.abs(x-110),Math.abs(x+110),Math.abs(z+105))/60),crowd:day?Math.min(.035,actors.filter(a=>distanceMetres(a.position,position)<35).length*.004):.006};
}
// A small, local crowd is scenery, not connected players. Paths stay on the plaza.
export function createPrecinctLife(){
 const names=['Ama','Kojo','Esi','Yaw','Abena','Kwesi'];let actors=[];
 function tick(seconds,position,minute=720,transit=null){
  const civic=civicPeople(seconds,position);if(civic){actors=civic;return actors;}
  const osu=osuPeople(seconds,position,minute);if(osu){actors=osu;return actors;}
  const bypass=mahamaPeople(seconds,position);if(bypass){actors=bypass;return actors;}
  const polo=poloPeople(seconds,position);if(polo){actors=polo;return actors;}
  const regentRoadside=regentRoadsidePeople(seconds,position);if(regentRoadside){actors=regentRoadside;return actors;}
  const shangri=shangriPeople(seconds,position);if(shangri){actors=shangri;return actors;}
  const residential=residentialPeople(seconds,position);if(residential){actors=residential;return actors;}
  const oak=oakPeople(seconds,position);if(oak){actors=oak;return actors;}
  const villa=villaPeople(seconds,position);if(villa){actors=villa;return actors;}
  const lancaster=lancasterPeople(seconds,position);if(lancaster){actors=lancaster;return actors;}
  const hotel=hotelPeople(seconds,position);if(hotel){actors=hotel;return actors;}
  const annex=annexPeople(seconds,position);if(annex){actors=annex;return actors;}
  const airportStop=nearbyAirportStop(position);if(airportStop){actors=airportStopPeople(airportStop,seconds);return actors;}
  const business=businessPeople(seconds,position);if(business){actors=business;return actors;}
  const city=airportCityPeople(seconds,position);if(city){actors=city;return actors;}
  const domestic=airportT2People(seconds,position,minute);if(domestic){actors=domestic;return actors;}
  const airport=airportT3People(seconds,position,minute);if(airport){actors=airport;return actors;}
  const kofi=kofiPeople(seconds,position,minute);if(kofi){actors=kofi;return actors;}
  const neighbours=neighbourPeople(seconds,position,minute);if(neighbours){actors=neighbours;return actors;}
  if(ghudRange(position)){actors=ghudPeople(seconds,minute);return actors;}
  if(frontageRange(position)){actors=frontagePeople(seconds,minute);return actors;}
  const stop=nearbyBusStop(position);if(stop){actors=busStopPeople(stop,seconds,minute);return actors;}
  if(distanceMetres(position,MALL_TERMINAL.position)<95){actors=terminalPeople(seconds,minute,transit);return actors;}
  if(distanceMetres(position,SPANNER.position)<90){
   const day=minute>=360&&minute<1140,d=SPANNER_DECK;
   actors=Array.from({length:day?2:1},(_,i)=>{const speed=.95+i*.12,phase=(seconds*speed+i*21)%72,forward=phase<36,x=-18+(forward?phase:72-phase),side=i?-.65:.65,p=spannerPoint(d.x+Math.cos(d.angle)*x-Math.sin(d.angle)*side,d.z+Math.sin(d.angle)*x+Math.cos(d.angle)*side);return {id:`spanner-visitor-${i}`,name:names[i],avatar:i?'👩🏾':'👨🏾',position:p,heading:(90+d.angle*180/Math.PI+(forward?0:180))%360,speed,moving:true,elevation:SPANNER_DECK_HEIGHT};});return actors;
  }
  if(distanceMetres(position,MALL_ROUNDABOUT.position)<120){
   const day=minute>=360&&minute<1140,[a,b]=ROUNDABOUT_WALK,length=distanceMetres(a,b);
   actors=Array.from({length:day?3:1},(_,i)=>{const speed=.9+i*.08,phase=(seconds*speed+i*length*.6)%(length*2),forward=phase<length,u=.1+.8*(forward?phase:length*2-phase)/length,p=a.map((v,j)=>v+(b[j]-v)*u);return {id:`mall-approach-visitor-${i}`,name:names[i],avatar:i%2?'👩🏾':'👨🏾',position:p,heading:bearingTo(forward?a:b,forward?b:a),speed:speed*.8,moving:true,elevation:0};});return actors;
  }
  if(distanceMetres(position,GALLERY.position)<110){
   const day=minute>=360&&minute<1140;actors=Array.from({length:day?3:1},(_,i)=>{const speed=.7+i*.06,phase=(seconds*speed+i*18)%56,forward=phase<28,z=22-(forward?phase:56-phase),p=galleryPoint(-2+(i-1)*.9,z);return {id:`gallery-visitor-${i}`,name:names[i],avatar:i%2?'👩🏾':'👨🏾',position:p,heading:bearingTo(p,galleryPoint(-2+(i-1)*.9,z+(forward?-1:1))),speed,moving:true,elevation:0}});return actors;
  }
  if(distanceMetres(position,VILLAGGIO.position)<170){
   const route=VILLAGGIO_WALK,day=minute>=360&&minute<1140,start=route[0][0],end=route.at(-1)[0],length=start-end;
   actors=Array.from({length:day?3:1},(_,i)=>{const speed=.75+i*.08,phase=(seconds*speed+i*15)%(length*2),forward=phase<length,x=start-(forward?phase:2*length-phase),p=villaggioPoint(x,-5);return {id:`villaggio-visitor-${i}`,name:names[i],avatar:i%2?'👩🏾':'👨🏾',position:p,heading:bearingTo(p,villaggioPoint(x+(forward?-1:1),-5)),speed,moving:true,elevation:0};});return actors;
  }
  if(distanceMetres(position,SIGNATURE.position)<160){
   const route=COURT.walk,lengths=route.slice(1).map((p,i)=>Math.hypot(p[0]-route[i][0],p[1]-route[i][1])),length=lengths.reduce((a,b)=>a+b,0),day=minute>=360&&minute<1140;
   actors=Array.from({length:day?4:1},(_,i)=>{const speed=.7+i*.08,phase=(seconds*speed+i*11)%(length*2),forward=phase<length;let d=forward?phase:2*length-phase,j=0;while(j<lengths.length-1&&d>lengths[j]){d-=lengths[j];j++}const a=route[j],b=route[j+1],u=d/lengths[j],p=signaturePoint(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u);return {id:`signature-visitor-${i}`,name:names[i],avatar:i%2?'👩🏾':'👨🏾',position:p,heading:bearingTo(signaturePoint(...(forward?a:b)),signaturePoint(...(forward?b:a))),speed,moving:true,elevation:0};});return actors;
  }
  if(distanceMetres(position,NKRUMAH_PARK.position)<220){
   const day=minute>=360&&minute<1140;actors=[];
   for(let i=0;i<(day?8:2);i++){const side=i%2?1:-1,phase=(seconds*(.85+i%3*.12)+i*14)%196,forward=phase<98,z=-24+(forward?phase:196-phase);actors.push({id:`park-visitor-${i}`,name:names[i%6],avatar:i%2?'👩🏾':'👨🏾',position:parkPoint(side*23,z),heading:bearingTo(parkPoint(side*23,z),parkPoint(side*23,z+(forward?1:-1))),speed:.85+i%3*.12,moving:true,elevation:0});}
   return actors;
  }
  if(distanceMetres(position,square.position)>350){actors=[];return actors}
  const day=minute>=360&&minute<1140,list=[];
  for(let i=0;i<(day?10:3);i++){
   const route=[[-38+i*3,28],[-38+i*3,-32],[34-i*2,-32],[34-i*2,28]],lengths=route.map((p,j)=>Math.hypot(p[0]-route[(j+1)%4][0],p[1]-route[(j+1)%4][1])),total=lengths.reduce((a,b)=>a+b,0);
   let progress=(seconds*(1.05+i%3*.12)+i*19)%total,j=0;while(progress>lengths[j]&&j<3){progress-=lengths[j];j++}
   const a=route[j],b=route[(j+1)%4],t=progress/lengths[j],p=precinctPoint(square,a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t);
   if(!precinctCollision(p,.3,0))list.push({id:`square-walker-${i}`,name:names[i%6],avatar:i%2?'👩🏾':'👨🏾',position:p,heading:bearingTo(precinctPoint(square,...a),precinctPoint(square,...b)),speed:1.05+i%3*.12,moving:true,elevation:0});
  }
  if(day){
   for(const [i,spot] of PRECINCT_ACTIVITIES.filter(p=>squareActivityIds.has(p.id)).entries()){
    if(spot.kind==='watch')continue;
    list.push({id:`square-visitor-${i}`,name:names[i%6],avatar:i%2?'👩🏾':'👨🏾',position:spot.kind==='sit'?precinctPoint(stands[i],0,stands[i].depth/2-.9-(stands[i].depth-3)/12*.77):precinctPoint(square,i===8?7:-19,i===8?48:-57),heading:spot.heading,speed:0,moving:false,elevation:spot.elevation,action:spot.kind,poseOffset:spot.offset||0});
   }
   for(let i=0;i<4;i++)list.push({id:`square-gathering-${i}`,name:names[i],avatar:i%2?'👩🏾':'👨🏾',position:precinctPoint(square,10+Math.cos(i*Math.PI/2)*2,-5+Math.sin(i*Math.PI/2)*2),heading:bearingTo(precinctPoint(square,10+Math.cos(i*Math.PI/2)*2,-5+Math.sin(i*Math.PI/2)*2),precinctPoint(square,10,-5)),moving:false,speed:0,elevation:0,action:i===0?'speak':'watch'});
  }
  actors=list.filter(a=>distanceMetres(position,a.position)<200);return actors;
 }
 return {tick,get actors(){return actors}};
}
