import {offsetMetres,bearingTo} from './motion.js';
// Operator photographs establish the facilities. Setbacks, dimensions and the
// western entrance are interpreted within the neighbouring mapped service roads.
export const GHUD_PARK={id:'ghud-park',name:'Ghud Park',position:[-.17178,5.62331],rotation:11,width:84,depth:150,height:7};
const angle=GHUD_PARK.rotation*Math.PI/180;
export const ghudPoint=(x,z)=>offsetMetres(GHUD_PARK.position,x*Math.cos(angle)+z*Math.sin(angle),x*Math.sin(angle)-z*Math.cos(angle));
export function ghudLocal(p){const e=(p[0]-GHUD_PARK.position[0])*111320*Math.cos(GHUD_PARK.position[1]*Math.PI/180),n=(p[1]-GHUD_PARK.position[1])*111320;return [e*Math.cos(angle)+n*Math.sin(angle),e*Math.sin(angle)-n*Math.cos(angle)];}
export const ghudRange=p=>{const [x,z]=ghudLocal(p);return Math.abs(x)<43&&z> -76&&z<76;};
export const GHUD_ARRIVAL=ghudPoint(-34,47);
export const GHUD_PLACE={id:GHUD_PARK.id,name:'Ghud Park',lng:GHUD_ARRIVAL[0],lat:GHUD_ARRIVAL[1],type:'park',category:'park',emoji:'🌳',area:'Accra Mall',description:'Explore Ghud Park’s lawn trail, rink, colourful playground and container-lined social plaza. Sit, dance or meet friends.',activities:['stroll','explore']};
export const isGhudPark=p=>p?.id===GHUD_PARK.id||/^(ghud|gud) park$/i.test(p?.name||'');
export const GHUD_TRAIL=[[-32,15],[-32,-62],[-28,-67],[28,-67],[32,-62],[32,15],[28,20],[-28,20],[-32,15]];
export const GHUD_KIOSKS=[{x:-25,z:66,w:12,d:5,color:0,label:'BEER GARDEN'},{x:-11,z:66,w:12,d:5,color:1,label:'GAMES & RENTALS'},{x:3,z:66,w:12,d:5,color:2,label:'PARK SERVICES'},{x:30,z:56,w:7,d:5,color:3,label:'WASHROOMS'}];
export const GHUD_TABLES=[[-23,47],[-12,47],[-1,47],[10,47],[21,47],[-23,57],[-12,57],[-1,57],[10,57],[21,57]];
export const GHUD_BENCHES=[{x:-36,z:-45,heading:90},{x:-36,z:-14,heading:90},{x:36,z:-45,heading:270},{x:36,z:-14,heading:270}];
export const GHUD_TREES=[[-38,-62],[-38,-30],[-38,8],[38,-62],[38,-30],[38,8]];
export const GHUD_ACTIVITIES=[
 {id:'ghud-welcome',kind:'watch',label:'Read the Ghud Park guide',x:-33,z:47,heading:0,text:'Akwaaba to Ghud Park. Follow the lawn trail, visit the rink and playground, or relax at the social plaza. These are Worldfolk activities, separate from real venue tickets and bookings.'},
 {id:'ghud-lawn-photo',kind:'photo',label:'Photograph the park lawn',x:0,z:18,target:ghudPoint(0,-35)},
 {id:'ghud-rink-view',kind:'watch',label:'Watch the recreation court',x:-27,z:29,target:ghudPoint(-14,30),text:'This paved recreation area is inspired by the park’s skating rink and pick-up sports. The real venue offers equipment rentals and classes; this game viewing area does not book a session.'},
 {id:'ghud-dance',kind:'dance',label:'Dance at the social plaza',x:16,z:42,heading:169},
 {id:'ghud-playground',kind:'watch',label:'Explore the playground',x:18,z:20,target:ghudPoint(20,29),text:'The blue-and-yellow slides, towers, swings and seesaw follow the photographed playground. Equipment is scenery in this pass; the surrounding paths are walkable.'},
 ...GHUD_BENCHES.map((b,i)=>({id:'ghud-bench-'+i,kind:'sit',label:'Sit beside the picnic lawn',x:b.x+(b.x<0?.8:-.8),z:b.z,seatPosition:ghudPoint(b.x,b.z),heading:(b.heading-GHUD_PARK.rotation+360)%360,offset:-.45,cameraHeading:(b.heading-GHUD_PARK.rotation+360)%360,parkSeat:true})),
 {id:'ghud-picnic-seat',kind:'sit',label:'Sit at a picnic table',x:-24.4,z:47,seatPosition:ghudPoint(-24.05,47),heading:(90-GHUD_PARK.rotation+360)%360,offset:-.45,cameraHeading:(90-GHUD_PARK.rotation+360)%360,parkSeat:true},
].map(a=>({...a,position:ghudPoint(a.x,a.z),elevation:0,heading:a.heading??bearingTo(ghudPoint(a.x,a.z),a.target)}));
// Only structures at walking height are solid; canopy roofs do not become walls.
export function ghudStructures(){return [
 ...GHUD_KIOSKS.map((k,i)=>({id:'kiosk-'+i,x:k.x,z:k.z,w:k.w,d:k.d,h:2.8})),
 ...GHUD_TABLES.map(([x,z],i)=>({id:'table-'+i,x,z,w:1.4,d:2.4,h:.77})),
 ...Array.from({length:6},(_,i)=>({id:'cafe-table-'+i,x:-30+i*10,z:40,w:1.1,d:1.1,h:.73})),
 ...GHUD_BENCHES.map((b,i)=>({id:'bench-'+i,x:b.x,z:b.z,w:.6,d:2.6,h:.8})),
 ...GHUD_TREES.map(([x,z],i)=>({id:'tree-'+i,x,z,w:.4,d:.4,h:5})),
 {id:'play-tower-a',x:16,z:29,w:2.5,d:2.5,h:4.4},{id:'play-tower-b',x:22,z:29,w:2.5,d:2.5,h:5.5},
 {id:'play-slide',x:26,z:29,w:5,d:3.4,h:3.5},{id:'play-swing',x:10,z:27,w:3,d:2.3,h:2.6},
 {id:'play-seesaw',x:16,z:35,w:3.5,d:1,h:.85},
 ...[-1,1].map(s=>({id:'rink-edge-'+s,x:-14,z:30+s*9,w:26,d:.1,h:1.1})),
 {id:'rink-back',x:-1,z:30,w:.1,d:18,h:1.1},
 ...[24,36].map(z=>({id:'rink-entry-'+z,x:-27,z,w:.1,d:6,h:1.1})),
 ...[-1,1].map(s=>({id:'fence-'+s,x:s*41,z:0,w:.12,d:146,h:1.25})).filter(s=>s.x>0),
 {id:'fence-west-north',x:-41,z:-16,w:.12,d:114,h:1.25},{id:'fence-west-south',x:-41,z:65,w:.12,d:16,h:1.25},
 {id:'fence-north',x:0,z:-73,w:82,d:.12,h:1.25},{id:'fence-south',x:0,z:73,w:82,d:.12,h:1.25},
 ...[-35,0,35].flatMap(x=>[-55,55].map(z=>({id:`light-${x}-${z}`,x,z,w:.12,d:.12,h:6}))),
];}
export const ghudColliders=()=>ghudStructures().map(s=>({id:GHUD_PARK.id+':'+s.id,noDoor:true,height:s.h,rings:[[[-s.w/2,-s.d/2],[s.w/2,-s.d/2],[s.w/2,s.d/2],[-s.w/2,s.d/2],[-s.w/2,-s.d/2]].map(([x,z])=>ghudPoint(s.x+x,s.z+z))]}));
export function ghudPeople(seconds,minute=720){
 if(minute<360||minute>=1380)return [];
 const lengths=GHUD_TRAIL.slice(1).map((b,i)=>Math.hypot(b[0]-GHUD_TRAIL[i][0],b[1]-GHUD_TRAIL[i][1])),length=lengths.reduce((a,b)=>a+b,0);
 const actors=Array.from({length:6},(_,i)=>{let d=(seconds*(.9+i%3*.16)+i*length/6)%length,j=0;while(j<lengths.length-1&&d>lengths[j])d-=lengths[j++];const a=GHUD_TRAIL[j],b=GHUD_TRAIL[j+1],u=d/lengths[j];return {id:'ghud-walker-'+i,name:['Ama','Kojo','Esi','Yaw','Abena','Kwesi'][i],avatar:i%2?'👩🏾':'👨🏾',position:ghudPoint(a[0]+(b[0]-a[0])*u,a[1]+(b[1]-a[1])*u),heading:bearingTo(ghudPoint(...a),ghudPoint(...b)),moving:true,speed:.9+i%3*.16,elevation:0};});
 for(const [i,[x,z]] of [[-10,36],[22,42],[-8,58]].entries())actors.push({id:'ghud-social-'+i,name:['Akua','Kofi','Adjoa'][i],avatar:i%2?'👨🏾':'👩🏾',position:ghudPoint(x,z),heading:0,moving:false,speed:0,elevation:0,action:i===1?'dance':'watch'});
 return actors;
}
