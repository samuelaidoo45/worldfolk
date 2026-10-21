import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lineMayBeNear} from '../public/game/road-proximity.js';
import {roadIntrusion} from '../public/game/pedestrian-paths.js';
import {bodyContact} from '../public/game/vehicle-contacts.js';
import {VEHICLE_MODELS,vehicleFootprint} from '../public/game/vehicle-catalog.js';
import {roadHeight,sameRoadLevel,ROAD_PROFILES} from '../public/game/road-elevation.js';
import {offsetMetres,projectOnSegment} from '../public/game/motion.js';

// Full scans/SAT are the correctness oracle: broad-phase skips must not change
// contact depth, escape from overlaps, or separation of bridges and ground roads.
function fullIntrusion(position,roads,radius=.4){
 let depth=0;
 for(const road of roads){
  if(road.walkOnly||['path','pedestrian','steps','cycleway'].includes(road.roadClass))continue;
  for(let i=1;i<road.line.length;i++){
   const a=road.line[i-1],b=road.line[i],q=projectOnSegment(position,a,b),heading=Math.atan2(b[0]-a[0],b[1]-a[1])*180/Math.PI;
   if(roadHeight(q.position,heading,road.roadId??null)>2.2)continue;
   depth=Math.max(depth,road.width/2+radius-q.distance);
  }
 }
 return depth;
}
function fullContact(a,b){
 if(!sameRoadLevel(a,b))return null;
 const axes=o=>{const r=(o.heading||0)*Math.PI/180;return [[Math.cos(r),-Math.sin(r)],[Math.sin(r),Math.cos(r)]];};
 const dot=(a,b)=>a[0]*b[0]+a[1]*b[1],aa=axes(a),bb=axes(b),sa=a.driving?vehicleFootprint(a.vehicle):[.28,.28],sb=b.driving?vehicleFootprint(b.vehicle):[.28,.28];
 const delta=[(b.position[0]-a.position[0])*111320*Math.cos(a.position[1]*Math.PI/180),(b.position[1]-a.position[1])*111320];let depth=Infinity,normal=null;
 for(const axis of [...aa,...bb]){
  const reach=sa.reduce((n,s,i)=>n+s*Math.abs(dot(aa[i],axis)),0)+sb.reduce((n,s,i)=>n+s*Math.abs(dot(bb[i],axis)),0),overlap=reach-Math.abs(dot(delta,axis));
  if(overlap<=0)return null;if(overlap<depth){depth=overlap;normal=axis.map(v=>v*(dot(delta,axis)<0?-1:1));}
 }
 return {depth,normal};
}
const origin=[-.175,5.624],point=(x,y)=>offsetMetres(origin,x,y);
test('road bounds retain crossing segments, boundary points and replacement tile geometry',()=>{
 const long=[point(-2000,0),point(2000,0)],far=[point(300,300),point(600,600)];
 assert.equal(lineMayBeNear(origin,long,170),true);
 assert.equal(lineMayBeNear(origin,far,170),false);
 assert.equal(lineMayBeNear(point(0,169.999),long,170),true);
 assert.equal(lineMayBeNear(origin,[point(10,10),point(20,20)],170),true,'new coordinates get new bounds');
 const context=JSON.parse(fs.readFileSync(new URL('./fixtures/polo-senchi-context.json',import.meta.url)));
 for(let i=0;i<120;i++){
  const p=point(Math.sin(i)*750,Math.cos(i*.7)*750);
  for(const feature of context.road){
   const lines=feature.geometry.type==='LineString'?[feature.geometry.coordinates]:feature.geometry.coordinates;
   for(const line of lines)if(!lineMayBeNear(p,line,170))for(let j=1;j<line.length;j++)assert.ok(projectOnSegment(p,line[j-1],line[j]).distance>170);
  }
 }
});
test('pedestrian clearance agrees with full scans on crossings, endpoints and elevated roads',()=>{
 const roads=[
  {line:[point(-2000,0),point(2000,0)],width:7,roadClass:'street'},
  {line:[point(0,-2000),point(0,2000)],width:10,roadClass:'street'},
  {line:[point(5,5),point(5,5)],width:4,roadClass:'street'},
  {line:[point(0,-20),point(0,20)],width:50,roadClass:'path'},
  ...ROAD_PROFILES.map(r=>({line:r.coordinates,width:r.width,roadId:r.id,roadClass:r.class})),
 ];
 for(let i=0;i<500;i++){
  const p=point(Math.sin(i*.33)*(i%80),Math.cos(i*.7)*(i%80));
  assert.equal(roadIntrusion(p,roads),fullIntrusion(p,roads));
 }
 for(const road of roads)for(const p of [road.line[0],road.line.at(-1)])assert.equal(roadIntrusion(p,roads),fullIntrusion(p,roads));
});
test('every vehicle size and rotation retains exact contacts and separate elevations',()=>{
 const types=[null,...Object.keys(VEHICLE_MODELS)];let checked=0;
 for(const first of types)for(const second of types)for(let i=0;i<48;i++){
  const a={position:origin,heading:i*29,driving:!!first,vehicle:first},b={position:point(Math.sin(i)*i*.27,Math.cos(i)*i*.27),heading:i*47,driving:!!second,vehicle:second,elevation:i%4?0:8};
  assert.deepEqual(bodyContact(a,b),fullContact(a,b));checked++;
 }
 assert.equal(checked,8112);
});
