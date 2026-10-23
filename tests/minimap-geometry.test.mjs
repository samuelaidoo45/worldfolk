import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {createMiniMapGeometry,createMiniMapProjection} from '../public/game/minimap-geometry.js';

const origin=[-.176,5.62],size=440;
const fromPixel=([x,y],p=origin)=>[p[0]+(x-220)/(111320*Math.cos(p[1]*Math.PI/180)*1.4),p[1]-(y-220)/(111320*1.4)];
const ring=points=>points.map(p=>fromPixel(p));
const feature=(type,coordinates,kind='')=>({geometry:{type,coordinates},properties:{class:kind}});
const box=(x,y,w,h)=>ring([[x,y],[x+w,y],[x+w,y+h],[x,y+h],[x,y]]);
function legacyProject(p){return c=>[220+(c[0]-p[0])*111320*Math.cos(p[1]*Math.PI/180)*1.4,220-(c[1]-p[1])*111320*1.4]}
function legacyPolygons(features,p){
 const project=legacyProject(p),result=[];
 for(const f of features){
  const g=f.geometry,polys=g.type==='Polygon'?[g.coordinates]:g.type==='MultiPolygon'?g.coordinates:[];
  for(const rings of polys){
   const projected=rings.map(r=>r.map(project)),outer=projected[0];
   if(!outer?.length||outer.every(v=>v[0]<0)||outer.every(v=>v[0]>size)||outer.every(v=>v[1]<0)||outer.every(v=>v[1]>size))continue;
   result.push(projected);
  }
 }
 return result;
}
function currentPolygons(features,p){
 const geometry=createMiniMapGeometry({buildings:features}),projection=createMiniMapProjection(p);
 return geometry.polygons.filter(poly=>projection.visible(poly.bounds)).map(poly=>poly.rings.map(r=>r.map(projection.point)));
}

test('visible polygon paths match full projection exactly, including enclosing polygons and holes',()=>{
 const features=[
  feature('Polygon',[box(50,70,50,60)]),
  // No outer vertex is visible, but this area covers the entire radar.
  feature('Polygon',[box(-300,-300,1100,1100),box(180,180,80,80)]),
  feature('MultiPolygon',[[box(-100,-100,20,20)],[box(400,400,80,80),box(420,420,10,10)]]),
  feature('Polygon',[box(-500,-500,20,20)]),
  feature('Polygon',[box(500,500,20,20)]),
  feature('Polygon',[box(-10,200,20,30)]),
  feature('Polygon',[box(440,200,30,30)]),
  feature('Polygon',[]),
 ];
 for(let dx=-60;dx<=60;dx+=20)for(let dy=-60;dy<=60;dy+=20){
  const position=fromPixel([220+dx,220+dy]);
  assert.deepEqual(currentPolygons(features,position),legacyPolygons(features,position));
 }
 const projected=currentPolygons(features,origin);
 assert.ok(projected.some(p=>p.length===2&&p[0][0][0]<0),'enclosing polygon and its hole must survive');
});

test('road culling retains crossing segments, bends, cap edges and separate multiline parts',()=>{
 const roads=[
  feature('LineString',ring([[-100,220],[600,220]]),'motorway'),
  feature('LineString',ring([[-100,-100],[220,220],[600,-100]]),'secondary'),
  feature('LineString',ring([[-8,20],[-8,400]]),'primary'),
  feature('LineString',ring([[448,20],[448,400]]),'primary'),
  feature('LineString',ring([[-100,20],[-100,400]]),'primary'),
  feature('MultiLineString',[ring([[50,100],[350,100]]),ring([[600,100],[900,100]])],'path'),
  feature('LineString',ring([[0,0],[400,400]]),'rail'),
  feature('LineString',ring([[0,0],[400,400]]),'ferry'),
 ];
 const prepared=createMiniMapGeometry({roads}),projection=createMiniMapProjection(origin);
 assert.equal(prepared.segments.length,7);
 const visible=prepared.segments.filter(s=>projection.visible(s.bounds,(s.width+3)/2+2));
 assert.equal(visible.length,5);
 assert.strictEqual(visible[0].coords,roads[0].geometry.coordinates,'do not truncate the crossing line');
 assert.strictEqual(visible[1].coords,roads[1].geometry.coordinates,'do not remove offscreen bend vertices');
 for(const s of visible)assert.deepEqual(s.coords.map(projection.point),s.coords.map(legacyProject(origin)));
 assert.ok(visible.some(s=>s.coords===roads[2].geometry.coordinates),'thick road with centreline offscreen survives');
 assert.ok(visible.some(s=>s.coords===roads[3].geometry.coordinates),'opposite cap edge survives');
});

test('snapshot preparation preserves paint order, water and park styles',()=>{
 const land=[feature('Polygon',[box(30,30,40,40)],'park'),feature('Polygon',[box(30,30,40,40)],'residential')];
 const water=[feature('Polygon',[box(30,30,40,40)])],buildings=[feature('Polygon',[box(30,30,40,40)])];
 const geometry=createMiniMapGeometry({land,water,buildings});
 assert.deepEqual(geometry.polygons.map(p=>[p.color,p.stroke]),[
  ['#9db891',undefined],['#d2d4c7',undefined],['#8cbcc9',undefined],['#b6b9ad','#9ba499'],
 ]);
 assert.strictEqual(geometry.polygons[3].rings,buildings[0].geometry.coordinates);
});

test('real Accra polygons match legacy projected rings throughout the corridor',()=>{
 const context=JSON.parse(readFileSync(new URL('./fixtures/mall-airport-corridor-context.json',import.meta.url)));
 const features=[...context.landuse,...context.building,...context.water];
 let visible=0;
 for(const road of context.road.slice(0,100)){
  const position=road.geometry.coordinates[0];if(typeof position[0]!=='number')continue;
  const expected=legacyPolygons(features,position);visible+=expected.length;
  assert.deepEqual(currentPolygons(features,position),expected);
 }
 assert.ok(visible>100,'exercise nearby polygons across real road positions');
});

// Clip a segment parametrically, independently of the geographic bounds test.
function segmentEntersRect(a,b,min,max){
 let enter=0,leave=1;
 for(let axis=0;axis<2;axis++){
  const delta=b[axis]-a[axis];
  if(delta===0){if(a[axis]<min||a[axis]>max)return false;continue}
  const first=(min-a[axis])/delta,last=(max-a[axis])/delta;
  enter=Math.max(enter,Math.min(first,last));leave=Math.min(leave,Math.max(first,last));
  if(enter>leave)return false;
 }
 return true;
}

test('no real corridor road stroke that reaches the viewport is culled',()=>{
 const context=JSON.parse(readFileSync(new URL('./fixtures/mall-airport-corridor-context.json',import.meta.url)));
 const {segments}=createMiniMapGeometry({roads:context.road});let checked=0;
 for(const road of context.road.slice(0,100)){
  const position=road.geometry.coordinates[0];if(typeof position[0]!=='number')continue;
  const projection=createMiniMapProjection(position),project=legacyProject(position);
  for(const s of segments){
   const points=s.coords.map(project),margin=(s.width+3)/2+2;
   if(!points.some((p,i)=>i>0&&segmentEntersRect(points[i-1],p,-margin,size+margin)))continue;
   checked++;
   assert.ok(projection.visible(s.bounds,margin),'a visible segment or its stroke must remain');
   assert.deepEqual(s.coords.map(projection.point),points,'retained path uses original coordinates without clipping or simplification');
  }
 }
 assert.ok(checked>100,'cover varied real bends and crossings');
});

test('a refreshed tile snapshot recomputes bounds for newly visible geometry',()=>{
 const f=feature('Polygon',[box(-1000,-1000,10,10)]),projection=createMiniMapProjection(origin);
 const old=createMiniMapGeometry({buildings:[f]});
 assert.equal(projection.visible(old.polygons[0].bounds),false);
 f.geometry.coordinates=[box(100,100,10,10)];
 const updated=createMiniMapGeometry({buildings:[f]});
 assert.equal(projection.visible(updated.polygons[0].bounds),true);
 assert.deepEqual(updated.polygons[0].rings.map(r=>r.map(projection.point)),legacyPolygons([f],origin)[0]);
});
