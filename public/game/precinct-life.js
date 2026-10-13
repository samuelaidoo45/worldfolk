import {NKRUMAH_PARK,PARK_ACTIVITIES,parkPoint,parkLocal} from './nkrumah-park-data.js';
import {PRECINCT_LANDMARKS,precinctPoint,precinctLocal,precinctCollision} from './precinct-navigation.js';
import {distanceMetres,bearingTo} from './motion.js';
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
]).concat(PARK_ACTIVITIES).map(p=>({...p,heading:p.heading??bearingTo(p.position,p.target)}));
export function nearPrecinctActivity(position,elevation=0){return PRECINCT_ACTIVITIES.map(p=>({...p,distance:distanceMetres(position,p.position)})).filter(p=>p.distance<2&&Math.abs(elevation-p.elevation)<.1).sort((a,b)=>a.distance-b.distance)[0]||null}
export function precinctAmbience(position,actors=[],minute=720){
 const [x,z]=precinctLocal(square,position),inside=Math.abs(x)<135&&Math.abs(z)<155;
 if(!inside){const [px,pz]=parkLocal(position);return Math.abs(px)<45&&pz> -55&&pz<95?{wind:.018,surf:.012,traffic:.005,crowd:.012}:null;}
 const day=minute>=360&&minute<1140;
 return {wind:.025,surf:.04*Math.max(0,Math.min(1,(z+60)/170)),traffic:.015*Math.max(0,1-Math.min(Math.abs(x-110),Math.abs(x+110),Math.abs(z+105))/60),crowd:day?Math.min(.035,actors.filter(a=>distanceMetres(a.position,position)<35).length*.004):.006};
}
// A small, local crowd is scenery, not connected players. Paths stay on the plaza.
export function createPrecinctLife(){
 const names=['Ama','Kojo','Esi','Yaw','Abena','Kwesi'];let actors=[];
 function tick(seconds,position,minute=720){
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
   for(const [i,spot] of PRECINCT_ACTIVITIES.filter(p=>!p.id.startsWith('park-')).entries()){
    if(spot.kind==='watch')continue;
    list.push({id:`square-visitor-${i}`,name:names[i%6],avatar:i%2?'👩🏾':'👨🏾',position:spot.kind==='sit'?precinctPoint(stands[i],0,stands[i].depth/2-.9-(stands[i].depth-3)/12*.77):precinctPoint(square,i===8?7:-19,i===8?48:-57),heading:spot.heading,speed:0,moving:false,elevation:spot.elevation,action:spot.kind,poseOffset:spot.offset||0});
   }
   for(let i=0;i<4;i++)list.push({id:`square-gathering-${i}`,name:names[i],avatar:i%2?'👩🏾':'👨🏾',position:precinctPoint(square,10+Math.cos(i*Math.PI/2)*2,-5+Math.sin(i*Math.PI/2)*2),heading:bearingTo(precinctPoint(square,10+Math.cos(i*Math.PI/2)*2,-5+Math.sin(i*Math.PI/2)*2),precinctPoint(square,10,-5)),moving:false,speed:0,elevation:0,action:i===0?'speak':'watch'});
  }
  actors=list.filter(a=>distanceMetres(position,a.position)<200);return actors;
 }
 return {tick,get actors(){return actors}};
}
