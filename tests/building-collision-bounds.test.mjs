import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createBuildingPhysics} from '../public/game/building-physics.js';
import {chaseCamera} from '../public/game/chase-camera.js';
import {precinctCollision} from '../public/game/precinct-navigation.js';
import {offsetMetres} from '../public/game/motion.js';
import {vehicleSpec} from '../public/game/vehicle-catalog.js';

const fixtures=new URL('./fixtures/',import.meta.url),source=[];
for(const file of fs.readdirSync(fixtures).filter(f=>f.endsWith('-context.json'))){
  const data=JSON.parse(fs.readFileSync(new URL(file,fixtures)));
  source.push(...(data.building||data.buildings||[]));
}
const buildings=[...new Map(source.map(f=>[f.id+':'+JSON.stringify(f.geometry),f])).values()];
function physicsAt(position){
  const physics=createBuildingPhysics({queryRenderedFeatures:()=>buildings,querySourceFeatures:()=>buildings,getSource:()=>true,project:()=>({x:0,y:0}),isSourceLoaded:()=>true});
  physics.refresh(position,true);return physics;
}

// Independent full polygon reference: no newly derived bounds. Preserve the
// pre-existing native bounds and exact polygon/edge/height rules for comparison.
const local=(p,c)=>[(c[0]-p[0])*111320*Math.cos(p[1]*Math.PI/180),(c[1]-p[1])*111320];
function inRing(p,ring){
  let inside=false;
  for(let i=0,j=ring.length-1;i<ring.length;j=i++){
    const a=ring[i],b=ring[j];
    if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])inside=!inside;
  }
  return inside;
}
const inPolygon=(p,rings)=>rings.length>0&&inRing(p,rings[0])&&!rings.slice(1).some(r=>inRing(p,r));
function edgeDistance(p,a,b){
  const aa=local(p,a),bb=local(p,b),dx=bb[0]-aa[0],dy=bb[1]-aa[1],length=dx*dx+dy*dy;
  const t=length?Math.max(0,Math.min(1,(-aa[0]*dx-aa[1]*dy)/length)):0;
  return Math.hypot(aa[0]+t*dx,aa[1]+t*dy);
}
function applicable(feature,p,radius,elevation){
  if(feature.minHeight!==undefined&&((elevation||0)>=feature.height-.02||(elevation||0)+1.75<=feature.minHeight+.02))return false;
  if(elevation!==null&&feature.precinctWalkable)return false;
  const b=feature.bounds,pad=radius/110000;
  return !(b&&(p[0]<b[0]-pad||p[0]>b[2]+pad||p[1]<b[1]-pad||p[1]>b[3]+pad));
}
function fullCollision(features,p,radius=.6,elevation=null){
  if(elevation!==null&&precinctCollision(p,radius,elevation))return {id:'precinct-surface',rings:[]};
  for(const feature of features){
    if(!applicable(feature,p,radius,elevation))continue;
    if(inPolygon(p,feature.rings))return feature;
    for(const ring of feature.rings)for(let i=1;i<ring.length;i++)if(edgeDistance(p,ring[i-1],ring[i])<radius)return feature;
  }
  return null;
}
function fullDepth(features,p,radius,elevation){
  let total=0;
  for(const f of features){
    if(!applicable(f,p,radius,elevation))continue;
    let nearest=Infinity;
    for(const ring of f.rings)for(let i=1;i<ring.length;i++)nearest=Math.min(nearest,edgeDistance(p,ring[i-1],ring[i]));
    total+=inPolygon(p,f.rings)?nearest+radius:Math.max(0,radius-nearest);
  }
  return total;
}

test('authored collider bounds preserve collision identity at roads, towers and elevated precincts',()=>{
  for(const origin of [[-.177,5.612],[-.175,5.624],[-.19256,5.54742],[-.18129,5.61692]]){
    const physics=physicsAt(origin);
    assert.ok(physics.nearby.some(f=>!f.bounds),'includes authored colliders without native bounds');
    for(const x of [-120,-60,-20,0,20,60,120])for(const z of [-100,-30,0,30,100])for(const radius of [.28,.6,1.8])for(const elevation of [null,0,2.9,12]){
      const p=offsetMetres(origin,x,z);
      assert.equal(physics.collision(p,radius,elevation)?.id,fullCollision(physics.nearby,p,radius,elevation)?.id,`${origin} ${x},${z} r${radius} y${elevation}`);
    }
  }
});

test('derived bounds retain long edges, holes, radius contacts and vehicle penetration',()=>{
  const origin=[0,5.6],physics=physicsAt(origin);
  const ring=(x,z,w,d)=>[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([dx,dz])=>offsetMetres(origin,x+dx,z+dz));
  physics.nearby.push({id:'courtyard',rings:[ring(0,0,80,40),ring(0,0,30,20)],height:20},{id:'long-wall',rings:[ring(100,0,.15,400)],height:4});
  for(const x of [-42,-40.2,-39.8,-15.2,-14.8,0,14.8,15.2,39.8,40.2,99.7,100.3])for(const z of [-20.2,-19.8,0,19.8,20.2]){
    const p=offsetMetres(origin,x,z);
    for(const radius of [.28,.6,2])assert.equal(physics.collision(p,radius)?.id,fullCollision(physics.nearby,p,radius)?.id);
    const spec=vehicleSpec('car'),radius=spec.width*.48,length=Math.max(0,spec.length/2-radius),count=Math.max(2,Math.ceil(2*length/radius));
    let expected=0;
    for(let i=0;i<=count;i++)expected+=fullDepth(physics.nearby,offsetMetres(p,0,-length+2*length*i/count),radius,0);
    assert.ok(Math.abs(physics.vehicleDepth(p,0,'car')-expected)<1e-8,'vehicle penetration is unchanged');
  }
  assert.equal(physics.collision(origin,.6),null,'courtyard remains empty');
  assert.equal(physics.collision(offsetMetres(origin,100.2,0),.3)?.id,'long-wall','long edge within radius is retained');
  physics.refresh(origin,true);
  assert.equal(physics.collision(offsetMetres(origin,100.2,0),.3),null,'removed colliders do not persist after refresh');
});

test('camera clearances and damping match full polygon probes in every camera mode',()=>{
  for(const origin of [[-.175,5.624],[-.19256,5.54742]]){
    const physics=physicsAt(origin),reference={collision:(...args)=>fullCollision(physics.nearby,...args)};
    for(const mode of [{},{street:true},{scenic:true},{driving:true},{driving:true,street:true},{cabin:true}]){
      let oldDistance,newDistance;
      for(let frame=0;frame<100;frame++){
        const options={position:offsetMetres(origin,Math.sin(frame/50)*40,0),heading:frame*3.6,speed:20,dt:1/60,...mode};
        const expected=chaseCamera({...options,physics:reference,previousDistance:oldDistance}),actual=chaseCamera({...options,physics,previousDistance:newDistance});
        assert.deepEqual(actual,expected);
        oldDistance=expected.distance;newDistance=actual.distance;
      }
    }
  }
});
