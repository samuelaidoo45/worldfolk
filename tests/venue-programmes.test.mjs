import test from 'node:test';
import assert from 'node:assert/strict';
import {interiorKind} from '../public/game/venue-layouts.js';
import {venueCast,venueProgramme,learningExercise} from '../public/game/venue-programs.js';
import {landmarkProfile} from '../public/game/landmark-profiles.js';
import {buildingDesign,interiorDesign} from '../public/game/building-design.js';
import {junctionSignals} from '../public/game/traffic-signals.js';
import {offsetMetres,distanceMetres} from '../public/game/motion.js';
test('venue programmes rotate without creating overlapping NPC seats and have appropriate activities',()=>{
 for(const kind of ['church','mosque','campus','classroom','nightclub']){
  const cast=venueCast(kind,14).filter(Boolean),programme=venueProgramme(kind,0);
  assert.equal(new Set(cast.map(p=>p.point.join(','))).size,cast.length,kind+' seats');
  assert.ok(cast.some(p=>['speak','mix'].includes(p.pose)),kind+' leader');
  assert.ok(programme.text);assert.equal(venueProgramme(kind,24*programme.lines.length).id,programme.id);
 }
 assert.equal(venueProgramme('mosque').sound,'speech');assert.equal(venueProgramme('nightclub').sound,'music');assert.equal(venueProgramme('beach').sound,'surf');assert.equal(venueProgramme('bank'),null);
 assert.match(learningExercise('classroom').answer,/35/);
});
test('named landmark designs are distinct, keep footprints and respect mapped colours',()=>{
 const origin=[-.18,5.56],ring=[[-.1801,5.5599],[-.1799,5.5599],[-.1799,5.5601],[-.1801,5.5601],[-.1801,5.5599]];
 for(const name of ['Accra Mall','Balme Library','Ghana National Mosque','Holy Trinity Cathedral','University of Ghana']){
  const f={properties:{name,height:9,'building:colour':'#aabbcc'},geometry:{type:'Polygon',coordinates:[ring]}};
  const d=buildingDesign(f);assert.equal(d.landmark.id,landmarkProfile(name).id);assert.equal(d.palette.wall,'#aabbcc');assert.equal(d.height,9);
  assert.ok(interiorDesign({name,lng:origin[0],lat:origin[1]}).landmark);
 }
 assert.equal(landmarkProfile('Random neighbourhood shop'),null);assert.equal(landmarkProfile('Holy Trinity Cathedral Senior High School'),null);assert.equal(interiorKind({name:'Holy Trinity Cathedral Senior High School',type:'school'}),'classroom');assert.equal(landmarkProfile('Cathedral Church of the Most Holy Trinity').id,'holy-trinity');
});
test('traffic lights avoid minor streets, deduplicate tiles and keep junction groups apart',()=>{
 const o=[-.18,5.56],p=(x,y)=>offsetMetres(o,x,y),road=(coordinates,cls)=>({geometry:{type:'LineString',coordinates},properties:{class:cls}});
 const junction=(x,cls)=>[road([p(x,-80),p(x,0),p(x,80)],cls),road([p(x-80,0),p(x,0),p(x+80,0)],cls)];
 assert.equal(junctionSignals(junction(0,'street'),o).length,0);
 const major=junction(0,'primary'),lights=junctionSignals([...major,...major,...junction(15,'secondary')],o);
 assert.equal(lights.length,4);assert.equal(new Set(lights.map(l=>l.id)).size,4);
 assert.ok(lights.every(l=>distanceMetres(o,l.position)>10));
});
