import * as THREE from './three.module.js';
export const BILLBOARD_ADS=[
 {brand:'WORLDFOLK MARKET',headline:'Fresh food. Local flavour.',detail:'Visit Makola · groceries & meals',color:'#184f43',accent:'#ffd27c',icon:'🍍'},
 {brand:'COAST & CULTURE',headline:'Your next day out.',detail:'Labadi Beach · music, food & sea air',color:'#174b66',accent:'#ace7e5',icon:'☀'},
 {brand:'WORLDFOLK CAREERS',headline:'Build your next chapter.',detail:'Open Work · find a job & earn cedis',color:'#703d50',accent:'#ffe3ae',icon:'✦'},
 {brand:'CITY MOTORS',headline:'Find your next ride.',detail:'Sedans · SUVs · pickups · city vans',color:'#293843',accent:'#f4c663',icon:'➜'}
];
let campaigns=[],feedStamp='',generation=0,fetching=false;
async function refreshAds(){if(fetching||document.hidden)return;fetching=true;try{const r=await fetch('/api/ads');if(!r.ok)return;const data=await r.json();const next=Array.isArray(data.campaigns)?data.campaigns:[];const stamp=JSON.stringify(next);if(stamp!==feedStamp){feedStamp=stamp;campaigns=next;generation++}}catch{}finally{fetching=false}}
let started=false;function startFeed(){if(started)return;started=true;refreshAds();setInterval(refreshAds,60000);window.addEventListener('worldfolk:ads-changed',refreshAds)}
export function createBillboard(index=0){
 startFeed();
 const group=new THREE.Group(),steel=new THREE.MeshStandardMaterial({color:0x3b484d,metalness:.65,roughness:.4});
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.23,.32,5.4,8),steel);pole.position.y=2.7;group.add(pole);
 const frame=new THREE.Mesh(new THREE.BoxGeometry(6.8,2.8,.22),steel);frame.position.y=5.3;group.add(frame);
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=400;const c=canvas.getContext('2d');
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
 let drawn='';
 function paint(){const cycle=Math.floor(Date.now()/20000),stamp=generation+':'+cycle;if(stamp===drawn)return;drawn=stamp;const active=campaigns.filter(a=>a.expiresAt>Date.now()),ad=active.length?{...active[(index+cycle)%active.length],accent:'#ffd27c'}:BILLBOARD_ADS[index%BILLBOARD_ADS.length];
 c.fillStyle=ad.color;c.fillRect(0,0,1024,400);c.fillStyle=ad.accent;c.fillRect(0,0,14,400);c.fillStyle='#ffffff';c.font='bold 25px sans-serif';c.fillText(ad.brand,52,64,900);
 c.font='bold 52px sans-serif';c.fillText(ad.headline,52,167,920);c.font='28px sans-serif';c.fillText(ad.detail,52,231,920);c.fillStyle=ad.accent;c.fillRect(52,284,420,55);c.fillStyle=ad.color;c.font='bold 22px sans-serif';c.fillText(active.length?'OPEN MENU → CITY AD BOARD':'YOUR AD COULD BE HERE',68,321,385);c.fillStyle='#ffffffaa';c.font='18px sans-serif';c.fillText(active.length?'ADVERTISEMENT · @'+ad.handle:'ADVERTISE IN WORLDFOLK · OPEN AD STUDIO',52,374,910);texture.needsUpdate=true;
 }
 paint();
 const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide,toneMapped:false});
 for(const side of [-1,1]){const face=new THREE.Mesh(new THREE.PlaneGeometry(6.6,2.6),material);face.onBeforeRender=paint;face.position.set(0,5.3,side*.12);if(side<0)face.rotation.y=Math.PI;group.add(face)}
 for(const x of [-2.4,2.4]){const lamp=new THREE.Mesh(new THREE.BoxGeometry(.6,.1,.36),new THREE.MeshBasicMaterial({color:0xffe8b0}));lamp.position.set(x,6.77,.2);group.add(lamp)}
 return {group};
}
