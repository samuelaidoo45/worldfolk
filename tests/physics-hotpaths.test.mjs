import test from 'node:test';
import assert from 'node:assert/strict';
import {CITY_LANDMARKS,isCityLandmark} from '../public/game/city-landmarks.js';
import {PRECINCT_LANDMARKS,precinctPoint,precinctLocal,precinctNavigation,precinctCollision} from '../public/game/precinct-navigation.js';
import {ASOM_FRAME} from '../public/game/castle-asomdwe-data.js';
import {stripLocal,surfaceOffset} from '../public/game/spanner-data.js';
import {distanceMetres} from '../public/game/motion.js';

test('landmark ownership retains number/string IDs, unknown IDs and missing-ID semantics',()=>{
 const ids=CITY_LANDMARKS.flatMap(l=>l.sourceIds||[l.sourceId]);
 const previous=id=>CITY_LANDMARKS.some(l=>(l.sourceIds||[l.sourceId]).some(source=>source!==undefined&&String(source)===String(id)));
 for(const id of [...ids,...ids.map(String),undefined,null,'',0,-1,'unowned-building',999999999999])assert.equal(isCityLandmark(id),previous(id),String(id));
});
// Independent pre-optimization narrow phase. Keep the old terrace/half-tread
// ordering so the test catches changed aisle, deck or guardrail decisions.
function referenceCollision(position,radius,elevation){
 const contains=(s,x,z,pad=0)=>{const [u,v]=stripLocal(s,x,z);return Math.abs(u)<=s.w/2+pad+1e-6&&Math.abs(v)<=s.d/2+pad+1e-6;};
 for(const d of [...PRECINCT_LANDMARKS,ASOM_FRAME]){
  if(distanceMetres(position,d.position)>65)continue;
  const [x,z]=precinctLocal(d,position),nav=precinctNavigation(d);
  for(const s of nav.solids){const rise=surfaceOffset(s,x,z);if(elevation<s.top+rise-.02&&elevation+1.75>s.base+rise+.05&&contains(s,x,z,radius))return d;}
  for(const s of nav.surfaces){const rise=surfaceOffset(s,x,z);if(s.y+rise<=elevation+.245||s.base+rise>=elevation+1.75)continue;
   if(s.kind==='terrace'&&nav.surfaces.some(h=>h.kind==='step'&&contains(h,x,z)&&h.y<=elevation+.245&&s.y-h.y<.2))continue;
   if(contains(s,x,z,s.kind==='step'?0:radius))return d;
  }
 }
 return null;
}
test('optimized precinct checks preserve pedestrian and vehicle contacts at step edges and rotated surfaces',()=>{
 let checked=0;
 for(const d of [...PRECINCT_LANDMARKS,ASOM_FRAME]){
  const nav=precinctNavigation(d);
  for(const s of nav.surfaces.filter((_,i)=>i%5===0)){
   const angle=s.angle||0;
   for(const edge of [-.00001,0,.00001]){
    const x=s.x+Math.cos(angle)*(s.w/2+edge),z=s.z+Math.sin(angle)*(s.w/2+edge),p=precinctPoint(d,x,z);
    for(const radius of [.28,1.1])for(const elevation of [0,s.y-.245,s.y]){
     assert.equal(precinctCollision(p,radius,elevation)?.id,referenceCollision(p,radius,elevation)?.id,`${d.id} ${x},${z} y${elevation} r${radius}`);checked++;
    }
   }
  }
 }
 assert.ok(checked>1000);
});
