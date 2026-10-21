import {isGallery,galleryPoint,GALLERY_PLACE} from './gallery-data.js';
import {isSignature,signaturePoint,SIGNATURE_PLACE} from './signature-data.js';
import {isVillaggio,villaggioPoint,VILLAGGIO_PLACE} from './villaggio-data.js';
import {createRoomAction,restPrompt} from './resting.js';

// Original playable plans informed by the developer/architect references in
// docs/realism/apartment-interiors.md, not surveys of occupied private homes.
export function apartmentKind(place){const p=typeof place==='string'?{name:place}:place;return isGallery(p)?'gallery':isSignature(p)?'signature':isVillaggio(p)?'villaggio':null}
export const APARTMENT_ENTRANCES=[
 {kind:'gallery',position:galleryPoint(-2,-8.5),facade:galleryPoint(-2,-10.0),heading:180+ .366*180/Math.PI,place:GALLERY_PLACE},
 {kind:'signature',position:signaturePoint(-22.5,25.8),facade:signaturePoint(-24,24.3),heading:135,place:SIGNATURE_PLACE},
 {kind:'villaggio',position:villaggioPoint(5,-14.7),facade:villaggioPoint(5,-16.65),heading:147.455,place:VILLAGGIO_PLACE},
];
export const APARTMENTS={
 gallery:{name:'The Gallery · furnished one-bedroom apartment',w:16,back:-8,front:7,terrace:-5,spawn:[0,3.8],exit:[0,6],
  palette:{wall:'#f2f1eb',wood:'#796953',fabric:'#85807c',accent:'#648f98',floor:'#deddd2'},
  walls:[[-2.5,-3.9,.18,2.2],[-2.5,1.5,.18,4.8],[-2.5,6.35,.18,1.3],[-5.25,1,5.5,.18]],
  beds:[[-5.5,-3.5]],bath:[-5.5,4.3],wardrobe:[-7.3,-.1],kitchen:[4.5,5.9],sofa:[1.3,-3.3],table:[4.6,1],terraceSeat:[2.5,-6.7],
  hotspots:[{id:'sleep',label:'Sleep in the bedroom',at:[-3.8,-2.6],pose:[-5.5,.87,-2.6]},
   {id:'relax',label:'Sit in the Gallery lounge',at:[1.3,-1.5],pose:[1.3,-.25,-3.05]},
   {id:'shower',label:'Take a shower',at:[-5.5,4.3],pose:[-5.5,0,4.3]},
   {id:'wardrobe',label:'Change clothes',at:[-6,-.1]},
   {id:'cook',label:'Prepare food in the kitchen',at:[4.5,4.5],pose:[4.5,0,4.5]},
   {id:'terrace',label:'Sit on the Gallery balcony',at:[2.5,-5.7],pose:[2.5,-.25,-6.7],yaw:0}]},
 signature:{name:'The Signature · furnished apartment',w:18,back:-9,front:7,terrace:-5.5,spawn:[0,3.8],exit:[0,6],
  palette:{wall:'#eee8db',wood:'#87654c',fabric:'#b5a38a',accent:'#bc905f',floor:'#ddd6c6'},
  walls:[[-2,-4,.18,3],[-2,1.5,.18,4.8],[-2,6.35,.18,1.3],[-5.5,1,7,.18]],
  beds:[[-5.7,-3.6]],bath:[-6,4.3],wardrobe:[-8.3,-.1],kitchen:[6.4,5.9],sofa:[2,-3.5],table:[6,1.2],terraceSeat:[3.5,-7.3],
  hotspots:[{id:'sleep',label:'Sleep in the bedroom',at:[-4,-2.7],pose:[-5.7,.87,-2.7]},
   {id:'relax',label:'Sit on the sofa',at:[2,-1.7],pose:[2,-.25,-3.25]},
   {id:'shower',label:'Take a shower',at:[-6,4.3],pose:[-6,0,4.3]},
   {id:'wardrobe',label:'Change clothes',at:[-7,-.1]},
   {id:'cook',label:'Prepare food in the kitchen',at:[6.4,4.5],pose:[6.4,0,4.5]},
   {id:'terrace',label:'Sit on the garden terrace',at:[3.5,-6.2],pose:[3.5,-.25,-7.3],yaw:0}]},
 villaggio:{name:'Villaggio Vista · garden apartment',w:22,back:-11,front:7,terrace:-6,spawn:[0,3.8],exit:[0,6],
  palette:{wall:'#e4e0d5',wood:'#604c3c',fabric:'#779084',accent:'#ccad45',floor:'#c5bda9'},
  walls:[[-3,-4.4,.24,3.2],[-3,1.2,.24,4.8],[-3,6.5,.24,1],[-7,0,8,.24],[6,2,10,.24],[6,2.5,.24,1],[6,6.5,.24,1]],
  beds:[[-7.5,-3.9],[-8,3.2]],bath:[9,4.7],wardrobe:[-10.3,-.9],kitchen:[9.4,-2.6],sofa:[1,-3.7],table:[2.5,.5],terraceSeat:[3.5,-9],
  hotspots:[{id:'sleep',label:'Sleep in the main bedroom',at:[-5.8,-3],pose:[-7.5,.87,-3]},
   {id:'sleep-guest',label:'Sleep in the second bedroom',at:[-6.3,4.1],pose:[-8,.87,4.1]},
   {id:'relax',label:'Sit on the sofa',at:[1,-1.9],pose:[1,-.25,-3.45]},
   {id:'shower',label:'Take a shower',at:[9,4.7],pose:[9,0,4.7]},
   {id:'wardrobe',label:'Change clothes',at:[-8.9,-.9]},
   {id:'cook',label:'Prepare food in the kitchen',at:[8,-2.6],pose:[8,0,-2.6],yaw:-Math.PI/2},
   {id:'terrace',label:'Sit in the sky garden',at:[3.5,-7.8],pose:[3.5,-.25,-9],yaw:0}]},
};

// Keep the activity anchored to its own furnishing, rather than the old
// generic-home bed/sofa coordinates. The exit remains locked until Stop.
export function createApartmentActivity(layout,now){
 const action=createRoomAction('home',now);let spot=null;
 return {start(id){const h=layout.hotspots.find(h=>h.id===id);if(!h?.pose||action.active)return false;spot=h;return action.start(id.startsWith('sleep')?'sleep':id==='terrace'?'relax':id,{persistent:true})},
  stop(){action.end();spot=null},get spot(){return spot},get active(){return action.active},get resting(){return action.resting},frame(t){return action.frame(t)},
  prompt(){return restPrompt(action.resting)|| (action.active?{kind:'local',actionId:'stop-activity',label:'Finish cooking'}:null)}};
}
