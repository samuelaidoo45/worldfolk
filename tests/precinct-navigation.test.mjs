import test from 'node:test';import assert from 'node:assert/strict';
import {PRECINCT_LANDMARKS,precinctPoint,precinctNavigation,moveOnPrecinct,precinctCollision,validatedElevation} from '../public/game/precinct-navigation.js';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {distanceMetres} from '../public/game/motion.js';
const arch=PRECINCT_LANDMARKS.find(l=>l.id==='independence-arch');
const map={queryRenderedFeatures:()=>[],project:()=>({x:0,y:0}),getLayer:()=>true,isSourceLoaded:()=>true};
function journey(d,points){const p=createBuildingPhysics(map);p.refresh(d.position,true);let last=precinctPoint(d,...points[0]),height=0;for(const point of points.slice(1)){const to=precinctPoint(d,...point);const result=p.moveWalker(last,to,height);assert.ok(distanceMetres(result.position,to)<.02,`${d.id}: stopped en route to ${point}; height ${result.elevation}`);last=result.position;height=result.elevation;}return {p,last,height}}
test('climb both arch flights, cross decks, descend to ground on either side',()=>{
 for(const side of [-1,1]){const d=journey(arch,[[15*side,26],[15*side,8],[15*side,9.5],[5*side,9.5],[5*side,-8],[0,-8],[5*side,-8],[5*side,9.5],[15*side,9.5],[15*side,26]]);assert.equal(d.height,0)}
});
test('upper deck guards stop a player from walking off the edge',()=>{const {p,last,height}=journey(arch,[[15,26],[15,9.5],[5,9.5],[5,-8],[0,-8]]);assert.equal(height,17.2);const r=p.moveWalker(last,precinctPoint(arch,0,-15),height);assert.equal(r.elevation,17.2);assert.ok(r.blocked)});
test('ground-level passage stays under the viewing decks; cars cannot take stairs',()=>{const p=createBuildingPhysics(map);p.refresh(arch.position,true);const r=p.moveWalker(precinctPoint(arch,0,12),precinctPoint(arch,0,-12),0);assert.equal(r.elevation,0);assert.ok(!r.blocked);assert.ok(p.vehicleCollision(precinctPoint(arch,15,17),0));assert.ok(precinctCollision(precinctPoint(arch,15,17),.3,0))});
test('all grandstand aisles can be climbed and descended',()=>{for(const d of PRECINCT_LANDMARKS.filter(l=>l.id.startsWith('square-stand'))){const x=-d.width/2+d.width/5;const j=journey(d,[[x,d.depth/2+1],[x,-d.depth/2+1.8]]);assert.ok(j.height>4);const r=j.p.moveWalker(j.last,precinctPoint(d,x,d.depth/2+1),j.height);assert.equal(r.elevation,0)}});
test('memorial platform is walkable but plinth and flame bowl are solid',()=>{const d=PRECINCT_LANDMARKS.find(l=>l.id==='unknown-soldier');const j=journey(d,[[7,11],[7,0]]);assert.ok(Math.abs(j.height-.8)<.01);assert.ok(precinctCollision(precinctPoint(d,0,-1.8),.3,.8));assert.ok(precinctCollision(precinctPoint(d,0,4.3),.3,.8))});
test('network height rejects invented platforms and vertical teleportation',()=>{const p=precinctPoint(arch,0,6);assert.equal(validatedElevation(p,p,0,17.2),null);assert.equal(validatedElevation(p,p,17.2,17.2),17.2);assert.equal(validatedElevation([-.2,5.6],[-.2,5.6],0,11),null);assert.equal(validatedElevation(p,p,17.2,17.2,true),null)});

test('stair width remains clear beside the handrails, including upper deck supports',()=>{for(const side of [-1,1])for(const offset of [-1.1,1.1]){const x=side*15+offset,u=side*5+offset;const j=journey(arch,[[x,26],[x,9.5],[u,9.5],[u,-8]]);assert.equal(j.height,17.2)}});
