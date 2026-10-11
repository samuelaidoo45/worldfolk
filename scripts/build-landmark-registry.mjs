// Rebuild the authored registry from the bundled OSM tiles, preserving footprints.
import fs from 'node:fs';
import {VectorTile} from '@mapbox/vector-tile';import Pbf from 'pbf';
const specs=[
 ['nkrumah-mausoleum','Kwame Nkrumah Mausoleum','mausoleum',632287728,-.202685,5.544354,22,'museum'],
 ['jamestown-lighthouse','Jamestown Lighthouse','lighthouse',632287718,-.21213,5.53309,28,'attraction'],
 ['national-theatre','National Theatre','theatre',312724318,-.2005931,5.5536671,30,'theatre'],
 ['national-mosque','Ghana National Mosque','mosque',26323211,-.1896,5.590615,35,'place of worship'],
 ['balme-library','The Balme Library','library',14609773,-.187048,5.652029,23,'library'],
 ['accra-mall','Accra Mall','mall',16836193,-.172936,5.622184,9,'mall'],
 ['marina-mall','Marina Mall','glass-mall',626143418,-.176179,5.603099,18,'mall'],
 ['kaneshie-market','Kaneshie Market Complex','market',553963016,-.236208,5.56594,14,'marketplace'],
 ['holy-trinity','Cathedral Church of the Most Holy Trinity','cathedral',1093328092,-.205944,5.541388,20,'place of worship'],
 ['holy-spirit','Holy Spirit Cathedral','modern-church',852316760,-.206858,5.562466,21,'place of worship'],
 ['national-museum','National Museum','museum',374248488,-.206416,5.560745,12,'museum'],
 ['accra-stadium','Accra Sports Stadium','stadium',339732240,-.192335,5.551515,22,'stadium'],
 ['jubilee-house','Jubilee House','stool-palace',15785177,-.188472,5.57975,27,'government'],
 ['osu-castle','Osu Castle','castle',17553027,-.182834,5.546897,14,'castle'],
 ['movenpick','Movenpick Ambassador Hotel','hotel',351993326,-.202623,5.55488,29,'hotel'],
 ['kempinski','Kempinski Hotel Gold Coast City','courtyard-hotel',1347917962,-.196415,5.553588,22,'hotel'],
];
const rows=[];
for(const [id,name,model,sourceId,lng,lat,height,type] of specs){const z=14,x=Math.floor((lng+180)/360*2**z),y=Math.floor((1-Math.asinh(Math.tan(lat*Math.PI/180))/Math.PI)/2*2**z),tile=new VectorTile(new Pbf(fs.readFileSync(`public/maps/accra-v1/14/${x}/${y}.pbf`))),l=tile.layers.building;let feature;
 for(let i=0;i<l.length;i++){const f=l.feature(i);if(f.id===sourceId){feature=f.toGeoJSON(x,y,z);break}}
 if(!feature||feature.geometry.type!=='Polygon')throw Error(`Missing mapped footprint: ${name}`);
 const rings=feature.geometry.coordinates,r=rings[0],xs=r.map(p=>p[0]),ys=r.map(p=>p[1]),position=[(Math.min(...xs)+Math.max(...xs))/2,(Math.min(...ys)+Math.max(...ys))/2];
 const width=(Math.max(...xs)-Math.min(...xs))*111320*Math.cos(lat*Math.PI/180),depth=(Math.max(...ys)-Math.min(...ys))*111320;
 rows.push({id,name,model,sourceId,position,width,depth,height,rotation:0,type,rings});
}
fs.writeFileSync('public/game/popular-landmarks-data.js','// Authored landmarks anchored to bundled OSM footprints. See docs/landmark-references.md.\nexport const POPULAR_LANDMARKS='+JSON.stringify(rows)+';\n');
console.log(rows.map(r=>`${r.name}: ${Math.round(r.width)} × ${Math.round(r.depth)} m`).join('\n'));
