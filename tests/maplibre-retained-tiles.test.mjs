import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

// Exercise the shipped method, including the original failing overscale case.
const bundle=readFileSync(new URL('../public/game/vendor/maplibre-gl.js',import.meta.url),'utf8');
const start=bundle.indexOf('_updateRetainedTiles(e,t){');
const end=bundle.indexOf('_updateLoadedParentTileCache(){',start);
assert.ok(start>0&&end>start);
const retained=vm.compileFunction(`return ({${bundle.slice(start,end)}})._updateRetainedTiles`,['xe'])({maxOverzooming:10,maxUnderzooming:3});

function run(childCount,loadedCount){
 const children=Array.from({length:childCount},(_,i)=>({key:`child-${i}`}));
 const ideal={key:'ideal',overscaledZ:3,children:()=>children,scaledTo:()=>({key:'parent'})};
 const cache={
  _source:{minzoom:0,maxzoom:3},
  _tiles:{ideal:{hasData:()=>false,wasRequested:()=>false}},
  _addTile(){return this._tiles.ideal},
  _retainLoadedChildren(_missing,_zoom,_max,keep){for(const c of children.slice(0,loadedCount))keep[c.key]=c},
  getTile(id){if(id.key==='parent')return {hasData:()=>true,wasRequested:()=>true}},
 };
 return Object.keys(retained.call(cache,[ideal],2)).sort();
}

test('an overscaled single child covers an unloaded ideal tile without reading absent children',()=>{
 assert.deepEqual(run(1,1),['child-0','ideal']);
});
test('four loaded children cover an ideal tile and a partial set falls back to its parent',()=>{
 assert.deepEqual(run(4,4),['child-0','child-1','child-2','child-3','ideal']);
 assert.deepEqual(run(4,1),['child-0','ideal','parent']);
 assert.deepEqual(run(1,0),['ideal','parent']);
});
