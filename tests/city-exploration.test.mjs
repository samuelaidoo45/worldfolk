import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {indexPlaces,searchPlaceIndex,normalizePlaceText} from '../public/game/place-search.js';
import {inAccra} from '../public/game/map-region.js';
import {logoForPlace,placeLogoExpression} from '../public/game/place-logos.js';
import {PLACE_LOGOS} from '../public/game/place-logo-catalog.js';
const places=JSON.parse(fs.readFileSync('public/maps/accra-v1/places.json')),streets=JSON.parse(fs.readFileSync('public/maps/accra-v1/streets.json')),index=indexPlaces([...places,...streets]);
test('search covers the entire extract including streets and locations beyond the old bounds',()=>{
 assert.ok(index.length>18000);const names=new Set(index.map(p=>normalizePlaceText(p.name)));for(const place of places)assert.ok(names.has(normalizePlaceText(place.name)),'Searchable: '+place.name);
 for(const name of ['Giffard Road','Oxford Street','Absa','University of Ghana','Accra Mall'])assert.ok(searchPlaceIndex(index,name).total>0,name);
 assert.ok(index.some(p=>p.lat>5.78));assert.ok(index.some(p=>p.lng<-.36));assert.ok(index.every(p=>inAccra(p.lng,p.lat)));
});
test('every result is accessible through pagination and has safe gameplay metadata',()=>{
 const all=searchPlaceIndex(index,'',{limit:30000}),seen=new Set();for(const offset of [0,40,80,all.total-40])for(const p of searchPlaceIndex(index,'',{offset}).items){seen.add(p.name+':'+p.lng+':'+p.lat);assert.ok(Array.isArray(p.activities));assert.ok(p.id);assert.ok(p.emoji)}assert.equal(seen.size,160);assert.equal(searchPlaceIndex(index,'',{offset:all.total-5}).items.length,5);
 const sameCell=indexPlaces([{name:'One Shop',type:'shop',lng:-.2,lat:5.55},{name:'Next Shop',type:'shop',lng:-.2,lat:5.55}]);assert.equal(searchPlaceIndex(sameCell,'shop',{limit:20000}).items.filter(p=>p.lng===-.2&&p.lat===5.55).length,2);
});
test('search normalizes accents, supports multiple words and ranks exact names first',()=>{
 const data=indexPlaces([{name:'Café Test',type:'cafe',detail:'Osu',lng:-.2,lat:5.55},{name:'Café Test Annex',type:'cafe',detail:'Osu',lng:-.21,lat:5.55}]);assert.equal(searchPlaceIndex(data,'cafe test').items[0].name,'Café Test');assert.equal(searchPlaceIndex(data,'test osu').total,2);assert.equal(searchPlaceIndex(data,'no-such-real-place-xyz').total,0);
});
test('brand logos are verified local assets with safe category fallback',()=>{
 const sources=JSON.parse(fs.readFileSync('public/game/logos/sources.json'));for(const brand of PLACE_LOGOS){assert.ok(fs.existsSync('public'+brand.path));assert.ok(sources.some(s=>s.id===brand.id&&s.source.startsWith('https://')));for(const name of brand.names)assert.equal(logoForPlace({name:name.toUpperCase()}).id,brand.id)}
 assert.equal(logoForPlace({name:'Absa'}).id,'absa');assert.equal(logoForPlace({name:'Accra Mall'}).id,'accra-mall');assert.equal(logoForPlace({name:'Unknown local shop'}),null);assert.equal(logoForPlace({name:'Shell Court Apartments'}),null);assert.ok(JSON.stringify(placeLogoExpression('place-bank')).includes('place-bank'));
});
