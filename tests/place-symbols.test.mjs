import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {validateStyleMin,createExpression} from '@maplibre/maplibre-gl-style-spec';
import {cityMapStyle} from '../public/game/map-style.js';
import {placeCategory,placeEmoji,placeIconExpression} from '../public/game/place-icons.js';

test('neighbourhoods and all mapped place categories have icons',()=>{
 for(const type of ['suburb','neighbourhood','city','town','village','locality'])assert.equal(placeCategory({type}),'district');
 const places=JSON.parse(readFileSync('public/maps/accra-v1/places.json'));
 const expression=createExpression(placeIconExpression()).value;
 for(const p of places){const icon='place-'+placeCategory(p);assert.ok(placeEmoji(p));const resolved=expression.evaluate({zoom:15},{properties:p},null,null,[icon]);assert.equal(resolved?.name,icon,p.name)}
 assert.equal(placeCategory({class:'place_of_worship',name:'Central Mosque'}),'mosque');
 assert.equal(placeCategory({class:'place_of_worship',name:'Methodist Church'}),'church');
 assert.equal(placeCategory({class:'unknown kind'}),'place');
 assert.equal(createExpression(placeIconExpression()).result,'success');
});
test('both place label layers require icons and the map style is valid',()=>{
 globalThis.window={ACCRALIFE_CONFIG:{mapData:'/maps/accra-v1'}};globalThis.location={origin:'http://localhost'};
 const style=cityMapStyle();assert.deepEqual(validateStyleMin(style),[]);
 for(const id of ['worldfolk-poi-labels','worldfolk-place-labels']){const layer=style.layers.find(l=>l.id===id);assert.ok(layer.layout['icon-image']);assert.equal(layer.layout['icon-optional'],false);assert.equal(layer.layout['text-optional'],true)}
 assert.equal(style.layers.find(l=>l.id==='worldfolk-poi-labels').minzoom,14);
});
