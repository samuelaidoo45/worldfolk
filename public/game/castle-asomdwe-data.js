import {offsetMetres,distanceMetres,projectOnSegment} from './motion.js';
import {areaInside,areaLocal} from './mahama-neighbourhood-data.js';
import {ASOM_WALLS} from './castle-asomdwe-layout.js';
import {roadWidth} from './street-safety.js';
import {CASTLE_BUILDINGS,CASTLE_ROADS,ASOM_NATIVE_PARK,ASOM_NATIVE_TERRACE,ASOM_NATIVE_GARDENS} from './castle-asomdwe-map.js';
export {CASTLE_BUILDINGS,CASTLE_ROADS,ASOM_NATIVE_PARK,ASOM_NATIVE_TERRACE,ASOM_NATIVE_GARDENS};
// Frame estimated from the native terrace and reviewed overhead; dimensions are
// not a measured survey. +z faces behind the pavilion, -z towards the approach.
export const ASOM_FRAME={id:'asomdwe-platform',position:[-.187125,5.547665],rotation:68,width:70,depth:130,height:9};
export function asomPoint(x,z){const a=ASOM_FRAME.rotation*Math.PI/180;return offsetMetres(ASOM_FRAME.position,x*Math.cos(a)+z*Math.sin(a),x*Math.sin(a)-z*Math.cos(a));}
export function asomRect(x,z,w,d){return [[x-w/2,z-d/2],[x+w/2,z-d/2],[x+w/2,z+d/2],[x-w/2,z+d/2],[x-w/2,z-d/2]].map(p=>asomPoint(...p));}
export const ASOM_NAVIGATION={surfaces:[...Array.from({length:5},(_,i)=>({x:0,z:-6.6+i*.8,w:7,d:.8,y:(i+1)*.16,base:0,kind:'step'})),{x:0,z:0,w:8,d:6.8,y:.8,base:0,kind:'platform'}],solids:[{x:0,z:.5,w:1.65,d:2.6,base:.8,top:1.9},...[-2.8,2.8].flatMap(x=>[-2.4,2.4].map(z=>({x,z,w:.5,d:.5,base:.8,top:4.6})))]};
const siteFor=(zone,name)=>{const bs=CASTLE_BUILDINGS.filter(b=>b.zone===zone),p=bs.flatMap(b=>b.rings.flat()),xs=p.map(p=>p[0]),ys=p.map(p=>p[1]);return {id:zone,name,zone,position:[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2],width:(Math.max(...xs)-Math.min(...xs))*110800+26,depth:(Math.max(...ys)-Math.min(...ys))*111320+24,height:6,rotation:0,sourceIds:bs.map(b=>b.id)};};
export const CASTLE_SITES=[{id:'asomdwe-park',zone:'asomdwe',name:'Asomdwe Park · Atta Mills memorial',position:[-.18757,5.54762],width:235,depth:220,height:12,rotation:0,sourceIds:[ASOM_NATIVE_TERRACE.id,...ASOM_NATIVE_GARDENS.map(f=>f.id)]},siteFor('castle-west','Castle Drive · western roadside'),siteFor('castle-east','Castle Drive · eastern roadside')];
export const ASOM_GATE=[-.187426,5.548267];
export const CASTLE_VISITS=[{id:'asomdwe-park-visit',site:'asomdwe',name:'Asomdwe Park',aliases:['Asomdwee Park','Atta Mills memorial','Atta Mills Mausoleum'],area:'Castle Drive · Osu',position:asomPoint(0,-47),target:ASOM_FRAME.position,emoji:'🕊️',type:'park',text:'Visit the Atta Mills memorial garden, white pavilion and red–gold–green backdrop. The game visit uses the July 2026 ceremony photographs and an estimated ground layout; real-world visitor access should be checked locally.'},{id:'castle-drive-visit',site:'castle-east',name:'Castle Drive · Asomdwe approach',aliases:['Castle Drive memorial approach'],area:'Castle Drive · Osu',position:[-.187505,5.548235],target:ASOM_GATE,emoji:'🌳',type:'attraction',text:'Walk the shaded Castle Drive verge and the memorial approach. Native roadside building contours are retained; hidden facades and the dated boundary details remain provisional.'}];
export const ASOM_SEATS=[{x:-28,z:-35},{x:-28,z:-20}];
export const ASOM_POTS=Array.from({length:4},(_,i)=>[-1,1].map(side=>({x:side*8.7,z:-12-i*10}))).flat();
export const ASOM_MARKERS=Array.from({length:4},(_,i)=>[-1,1].map(side=>({x:side*23,z:-12-i*10}))).flat();
export const ASOM_LAMPS=[[-30,-46],[30,-46],[-30,-24],[30,-24]].map(([x,z])=>({x,z}));
export const ASOM_TREE_SEEDS=[[-.18780,5.54823],[-.18764,5.54816],[-.18745,5.54808],[-.18725,5.54803],[-.18702,5.54799],[-.18688,5.54787],[-.18682,5.54768],[-.18718,5.54725],[-.18743,5.54718],[-.18769,5.54734],[-.18798,5.54762],[-.18813,5.54770],[-.18817,5.54788],[-.18865,5.54860],[-.18908,5.54879],[-.18952,5.54894],[-.19000,5.54913]];
export const castleRoadClear=(p,r=0)=>!CASTLE_ROADS.filter(r=>!['path','pedestrian','steps','cycleway'].includes(r.class)).some(v=>v.coordinates.slice(1).some((b,i)=>projectOnSegment(p,v.coordinates[i],b).distance<roadWidth(v.class)/2+r));
export const castleBuildingClear=(p,r=0)=>!CASTLE_BUILDINGS.some(b=>areaInside(p,b.rings)||b.rings.some(ring=>ring.slice(1).some((b,i)=>projectOnSegment(p,ring[i],b).distance<r)));
const clearTrees=ASOM_TREE_SEEDS.filter(p=>castleRoadClear(p,1)&&castleBuildingClear(p,1.2));
export const ASOM_TREES=clearTrees.filter(p=>distanceMetres(p,CASTLE_SITES[0].position)<130);
export const CASTLE_ROAD_TREES=clearTrees.filter(p=>distanceMetres(p,CASTLE_SITES[0].position)>=130).map(position=>({position,zone:position[0]<-.188?'castle-west':'castle-east'}));
export const CASTLE_ACTIVITIES=[{id:'asomdwe-memorial-photo',kind:'photo',label:'Photograph the Atta Mills memorial',position:asomPoint(0,-17),target:ASOM_FRAME.position,elevation:0,text:'The memorial’s white pavilion stands before twin national-colour panels. This original reconstruction uses the July 2026 Presidency photographs; sculpture likeness and measurements remain estimates.'},...ASOM_SEATS.map((s,i)=>({id:'asomdwe-reflection-seat-'+i,kind:'sit',label:'Sit and reflect in Asomdwe Park',seatPosition:asomPoint(s.x,s.z),position:asomPoint(s.x,s.z-1.2),target:ASOM_FRAME.position,elevation:0,heading:292,offset:-.45}))];
export function castleLineRing(a,b,w){const A=areaLocal({position:a},b),len=Math.hypot(...A),dx=-A[1]/len*w/2,dy=-A[0]/len*w/2;return [offsetMetres(a,dx,dy),offsetMetres(b,dx,dy),offsetMetres(b,-dx,-dy),offsetMetres(a,-dx,-dy),offsetMetres(a,dx,dy)];}
// Bounded original hard objects shared by scenery and pedestrian physics.
const cache=new Map();
export function castleColliders(site,origin=null){if(!cache.has(site.zone)){let out=CASTLE_BUILDINGS.filter(b=>b.zone===site.zone).map(b=>({id:'castle:'+b.id,rings:b.rings,height:b.wallHeight+b.roofRise,noDoor:true}));if(site.zone==='asomdwe'){
 out.push({id:'asomdwe-backdrop',rings:[asomRect(0,5,33,.8)],height:8.5,noDoor:true},{id:'asomdwe-rear-wall',rings:[asomRect(0,3.8,52,.4)],height:2.1,noDoor:true},{id:'asomdwe-bust',rings:[asomRect(-12,-5,2,2)],height:3.5,noDoor:true});
 for(const [kind,list,w,d,h] of [['pot',ASOM_POTS,1.5,1.5,1.4],['marker',ASOM_MARKERS,1.5,1.5,1.3],['lamp',ASOM_LAMPS,.25,.25,8],['bench',ASOM_SEATS,2.6,.65,1.1]])for(const [i,p] of list.entries())out.push({id:'asomdwe-'+kind+i,rings:[asomRect(p.x,p.z,w,d)],height:h,noDoor:true});
 for(const [i,p] of ASOM_TREES.entries())out.push({id:'asomdwe-tree'+i,rings:[castleLineRing(offsetMetres(p,0,-.2),offsetMetres(p,0,.2),.4)],height:9,noDoor:true});
 }
 const trees=site.zone==='asomdwe'?[]:CASTLE_ROAD_TREES.filter(t=>t.zone===site.zone).map(t=>t.position);for(const [i,p] of trees.entries())out.push({id:'castle-road-tree'+i,rings:[castleLineRing(offsetMetres(p,0,-.2),offsetMetres(p,0,.2),.4)],height:9,noDoor:true});
 if(site.zone==='asomdwe')for(const [i,w] of ASOM_WALLS.entries())out.push({id:'asomdwe-rail'+i,rings:[castleLineRing(w.a,w.b,.08)],height:w.height,noDoor:true});
 cache.set(site.zone,out.map(c=>{const ps=c.rings.flat();return {...c,bounds:[Math.min(...ps.map(p=>p[0])),Math.min(...ps.map(p=>p[1])),Math.max(...ps.map(p=>p[0])),Math.max(...ps.map(p=>p[1]))]};}));}
 const shapes=cache.get(site.zone);if(!origin)return shapes;const dy=105/111320,dx=dy/Math.cos(origin[1]*Math.PI/180);return shapes.filter(c=>c.bounds[0]<origin[0]+dx&&c.bounds[2]>origin[0]-dx&&c.bounds[1]<origin[1]+dy&&c.bounds[3]>origin[1]-dy);}
export const ASOM_WALK_ROUTE=[CASTLE_VISITS[1].position,ASOM_GATE,[-.1876439,5.5479174],asomPoint(0,-47),asomPoint(0,-17),asomPoint(0,-8),asomPoint(0,-1.8)];

// Keep the owned vehicle at the approach forecourt, away from the memorial walk.
export const CASTLE_PARKING=[[-.18762,5.54807],[-.18760,5.54811],[-.18766,5.54802]];
export function castleVehicleSpawn(position,physics,kind='car'){if(distanceMetres(position,ASOM_FRAME.position)>110)return null;for(const p of CASTLE_PARKING)if(!physics?.collision(p,2.1,0)&&!physics?.vehicleCollision?.(p,210,kind))return {position:[...p],heading:210};return null;}
