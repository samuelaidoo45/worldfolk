import * as THREE from './three.module.js';
// All geometry is in metres. Shared materials are batched by the scene runner.
export function furnishPublicVenue(c){
 const {kind,w,d,box,cylinder,sign,spot,plant,seat,mat,scene,blockers}=c;
 const {stone,trim,wood,metal,glass,fabric,green,white,gold,dark,water}=mat;
 const art=(x,z,angle=0)=>{const g=new THREE.Group();for(let i=0;i<5;i++){const o=new THREE.Mesh(new THREE.TorusGeometry(.7-i*.08,.065,8,32),i%2?gold:wood);o.position.set(0,1.5,i*.1);g.add(o)}g.position.set(x,0,z);g.rotation.y=angle;scene.add(g);box(stone,1.8,.7,1.8,x,.35,z,true)};
 const table=(x,z)=>{box(wood,2,.12,1.3,x,.85,z,true);for(const dx of [-.8,.8])box(metal,.1,.8,.8,x+dx,.4,z);seat(x,z+1.5);seat(x,z-1.5,Math.PI)};
 const monitor=(x,z)=>{box(metal,.7,.48,.05,x,1.2,z);box(glass,.64,.4,.06,x,1.2,z+.02);box(metal,.12,.3,.12,x,.94,z);box(metal,.65,.035,.23,x,.94,z+.3)};
 const pavilion=(x,z,width,depth,label)=>{box(stone,width,.3,depth,x,.1,z);for(const sx of [-1,1])for(const sz of [-1,1])cylinder(trim,.18,4.6,x+sx*(width/2-.4),2.3,z+sz*(depth/2-.4),true);box(wood,width+1,.25,depth+1,x,4.7,z);box(stone,width,3.7,.2,x,1.85,z-depth/2,true);sign(label,x,3.7,z+depth/2+.1,width*.8)};
 const exhibit=(label,x,z)=>{box(stone,2,.8,2,x,.4,z,true);const vessel=new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(.3,0),new THREE.Vector2(.65,.4),new THREE.Vector2(.7,.8),new THREE.Vector2(.3,1.3),new THREE.Vector2(.35,1.5)],20),wood);vessel.position.set(x,.8,z);scene.add(vessel);sign(label,x,1.1,z+1.1,1.7);spot(x,z+2.4,'Read '+label,'info',`${label} · A fictional exhibition inspired by local craft and culture.`)};
 if(kind==='bank'){
  sign('CUSTOMER SERVICES',0,3.5,-d/2+.5,10);for(const x of [-7,0,7]){box(stone,5,1.15,1.5,x,.575,-7,true);box(mat.partition,5,1.6,.08,x,2,-7);box(trim,5,.12,.12,x,2.9,-7);monitor(x,-7.2);spot(x,-5,'Speak at the service counter','info','Banking hall · Use My life to view your cash and belongings. MoMo services are available at street agents.')}
  for(const x of [-7,7]){box(metal,1.5,2.3,.6,x,1.15,6,true);box(glass,.85,.6,.07,x,1.6,6.34);sign('ATM',x,2.6,6.35,1.4)}for(const x of [-4,4])for(const z of [0,3])seat(x,z);
  for(const x of [-3,3])for(const z of [-3,-1,1]){cylinder(metal,.07,.85,x,.425,z);box(fabric,.06,.05,2,x,.85,z+1)}
 }else if(kind==='office'){
  sign('RECEPTION  ·  WORKSPACE',0,3.3,-d/2+.3,12);box(stone,7,1.1,1.6,0,.55,6,true);monitor(1,6);spot(0,8,'Find work & careers','panel','work');
  for(const x of [-8,8])for(const z of [-10,-5,0]){box(wood,3,.13,1.5,x,.85,z,true);box(metal,.12,.8,1.4,x-1,.4,z);box(metal,.12,.8,1.4,x+1,.4,z);monitor(x,z);seat(x,z+1.3);spot(x-2,z+1.3,'Use workspace','panel','work')}
  box(mat.partition,.1,3.5,10,4,1.75,-10,true);box(wood,5,.15,2.5,0,.85,-11,true);for(const x of [-1.5,1.5]){seat(x,-8.8);seat(x,-13.2,Math.PI)}sign('MEETING ROOM',0,3,-15,5);
 }else if(kind==='restaurant'||kind==='cafe'){
  box(stone,16,1.15,1.6,0,.575,-10,true);box(wood,16,.08,1.8,0,1.2,-10);sign('MENU  ·  JOLLOF  ·  GRILLED FISH  ·  FRESH JUICE',0,3,-14,17);spot(0,-7.6,'Order food & drinks','panel','shops');
  for(const x of [-8,0,8])for(const z of [-3,4]){table(x,z);for(const dx of [-.5,.5]){cylinder(white,.24,.025,x+dx,.94,z);cylinder(glass,.09,.24,x+dx,.99,z+.4)}}
  for(const x of [-8,0,8]){cylinder(metal,.025,1,x,3.5,-3);const shade=new THREE.Mesh(new THREE.ConeGeometry(.55,.5,16),gold);shade.position.set(x,3,-3);scene.add(shade)}
 }else if(kind==='nightclub'){
  box(dark,16,.3,5,0,.15,-11,true);box(metal,7,1.1,1.3,0,.85,-10);for(const x of [-2,2])cylinder(dark,.55,.08,x,1.45,-10);sign('ACCRA AFTER DARK',0,3.3,-15,15,'#8b336e');
  for(const x of [-9,9])for(const z of [-12,0]){box(dark,1.4,2.7,1.2,x,1.35,z,true);for(const y of [.7,1.8]){const speaker=new THREE.Mesh(new THREE.CircleGeometry(.45,20),metal);speaker.position.set(x,y,z+.61);scene.add(speaker)}}
  for(let x=-5;x<=5;x+=2)for(let z=-6;z<=4;z+=2)box(((x+5)/2+(z+6)/2)%2?mat.neonPink:mat.neonBlue,1.94,.035,1.94,x,.025,z);
  for(const side of [-1,1]){box(fabric,2,.6,7,side*9,.3,6,true);box(fabric,.25,1,7,side*10,.7,6);box(wood,1,.6,5,side*6.8,.3,6,true)}spot(0,6,'Dance to the rhythm','dance');spot(-5,8,'Relax in the lounge','sit');
  for(const [x,color] of [[-5,0xb34d91],[5,0x4c85d5]]){const light=new THREE.PointLight(color,50,24,1.3);light.position.set(x,3,0);scene.add(light)}
  const disco=new THREE.Mesh(new THREE.SphereGeometry(.7,16,12),new THREE.MeshStandardMaterial({color:0xeeeeff,metalness:.85,roughness:.12}));disco.position.set(0,4,0);scene.add(disco);c.effects.push({kind:'spin',mesh:disco});
 }else if(kind==='gallery'){
  sign('ART  ·  CRAFT  ·  CITY STORIES',0,3.4,-d/2+.4,16);
  for(const x of [-10,10])for(const z of [-10,0,10]){const group=new THREE.Group();for(let i=0;i<6;i++){const panel=new THREE.Mesh(new THREE.BoxGeometry(.9,2,.06),[wood,gold,fabric,trim][i%4]);panel.position.set(i*.9-2.2,2.2,0);panel.rotation.z=Math.sin(i)*.13;group.add(panel)}group.position.set(x,0,z);group.rotation.y=x<0?Math.PI/2:-Math.PI/2;scene.add(group);spot(x+(x<0?2:-2),z,'View painted gallery','info','Colour & form · Original game artwork inspired by woven textiles and everyday city life.')}
  for(const x of [-5,5])for(const z of [-8,3])exhibit('Craft collection',x,z);art(0,-12);seat(0,7);spot(0,9,'Sit in the sculpture court','sit');
 }else if(kind==='church'){
  for(const x of [-6,6])for(let z=-8;z<=9;z+=3){box(wood,7,.16,.65,x,.52,z,true);box(wood,7,.8,.13,x,.94,z+.3);for(const dx of [-2.8,2.8])box(wood,.2,.5,.6,x+dx,.25,z)}
  box(stone,15,.3,5,0,.15,-14);box(trim,3,1,1,0,.8,-14,true);box(gold,.16,2.8,.16,0,3,-17);box(gold,1.4,.16,.16,0,3.5,-17);spot(0,-10,'Sit for quiet reflection','sit');
  for(const x of [-11,11])for(const z of [-12,-3,6]){cylinder(stone,.3,6.5,x,3.25,z,true);for(let i=0;i<5;i++)box([mat.neonBlue,gold,fabric][i%3],.07,2.5,.35,x,3.3,z+i*.35);const arch=new THREE.Mesh(new THREE.TorusGeometry(1.1,.1,8,24,Math.PI),gold);arch.rotation.y=Math.PI/2;arch.position.set(x,4.7,z+.7);scene.add(arch)}
 }else if(kind==='mosque'){
  for(const z of [-12,-9,-6,-3,0])for(let x=-10;x<=10;x+=2.5){box(gold,2.2,.025,2,x,.02,z);box(fabric,2.05,.025,1.85,x,.04,z)}
  for(const x of [-11,11])for(const z of [-12,-5,2]){cylinder(trim,.3,6,x,3,z,true);const arch=new THREE.Mesh(new THREE.TorusGeometry(3.5,.2,8,32,Math.PI),stone);arch.rotation.y=Math.PI/2;arch.position.set(x,3,z+3.5);scene.add(arch)}
  const niche=new THREE.Mesh(new THREE.TorusGeometry(1.4,.18,10,32,Math.PI),gold);niche.position.set(0,3,-d/2+.4);scene.add(niche);box(fabric,2.8,3,.08,0,1.5,-d/2+.4);spot(0,-14,'Quiet reflection in the prayer hall','sit');
  for(const x of [-8,8]){box(wood,4,.7,.7,x,.35,10,true);for(let i=0;i<6;i++)box(dark,.4,.18,.5,x-1.5+i*.6,.8,10)}sign('COURTYARD  ·  PRAYER HALL',0,3.8,3,12);
 }else if(kind==='market'){
  const labels=['FRESH PRODUCE','WOVEN FABRICS','HOUSEHOLD GOODS','FRUIT & JUICE','LOCAL CRAFT','FOOD STALL'];
  for(const side of [-1,1])for(let row=0;row<3;row++){const x=side*11,z=-14+row*11,n=row+(side>0?3:0);box(wood,7,1,3,x,.5,z,true);for(const dx of [-3.6,3.6])cylinder(metal,.06,3.2,x+dx,1.6,z);box(n%2?fabric:gold,8,.12,4.5,x,3.2,z);sign(labels[n],x,2.7,z+2.3,7);spot(x,z+3.8,'Browse '+labels[n].toLowerCase(),'panel','shops');
   for(let i=0;i<18;i++){if(n%3===0){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.2,8,6),i%2?green:gold);fruit.position.set(x+(i%6)-2.5,1.15,z+Math.floor(i/6)*.6-.6);scene.add(fruit)}else box(i%2?fabric:trim,.7,n%3===1?.15:.6,.5,x+(i%6)-2.5,1.1+Math.floor(i/6)*.2,z+Math.floor(i/6)*.7-.7)}}
  for(const x of [-17,17]){plant(x,17,2);plant(x,-18,2)}
 }else if(kind==='campus'){
  pavilion(-14,-8,16,20,'LECTURE PAVILION');pavilion(14,-8,16,20,'LIBRARY & STUDY');
  for(const x of [-18,-11])for(const z of [-14,-8,-2]){box(wood,2,.12,1,x,.8,z,true);seat(x,z+1.3)}sign('LEARN  ·  CREATE  ·  SHARE',-14,2.7,-17.8,12);spot(-14,4,'Study at the lecture pavilion','study');
  for(const x of [10,18])for(const z of [-14,-8,-2]){box(wood,2,2.5,.6,x,1.25,z,true);for(let i=0;i<9;i++)box(i%2?fabric:gold,.13,1.8,.65,x-.8+i*.2,1.4,z)}spot(14,4,'Browse the campus library','study');
  for(const x of [-17,17]){plant(x,14,2.5);seat(x,19)}box(stone,5,.5,5,0,.25,-19,true);art(0,-19);spot(0,8,'Meet the campus community','info','Students, lecturers and staff share this campus. Talk to the student guide near the entrance.');
 }else if(kind==='square'||kind==='civic'){
  const civic=kind==='civic';box(stone,civic?26:23,.7,8,0,.35,-d/2+11,true);
  if(!civic){for(const x of [-8,8])box(trim,3,12,5,x,6,-d/2+11,true);box(trim,19,2.5,5,0,11,-d/2+11);const shape=new THREE.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?1.1:2.5;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?shape.lineTo(x,y):shape.moveTo(x,y)}shape.closePath();const star=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:.5,bevelEnabled:false}),dark);star.position.set(0,15,-d/2+11);scene.add(star);sign('FREEDOM  ·  JUSTICE',0,10.6,-d/2+13.55,12)}
  else{for(const x of [-10,-5,0,5,10])cylinder(trim,.4,6,x,3,-d/2+11,true);const roof=new THREE.Mesh(new THREE.ConeGeometry(18,5,4),wood);roof.rotation.y=Math.PI/4;roof.position.set(0,8,-d/2+11);scene.add(roof);sign('CIVIC VISITOR CENTRE',0,4,-d/2+15,17);spot(0,-3,'View the civic exhibition','info','A fictional visitor courtyard inspired by civic architecture. Restricted offices and residential areas are outside this playable space.')}
  for(const x of [-w*.35,w*.35])for(const z of [-10,8,22]){plant(x,z,2);seat(x+2,z)}
  for(const x of [-12,0,12]){cylinder(metal,.06,8,x,4,-2);box(x===0?gold:green,1.7,.9,.04,x+.8,7.4,-2)}spot(0,5,'Take in the landmark view','view');
 }else if(kind==='beach'){
  box(water,w+80,.04,90,0,-.07,-d/2-35);for(let i=0;i<9;i++){const wave=box(mat.foam,w+65,.015,.25,0,.02,-d/2+7-i*3);wave.userData.dynamic=true;c.effects.push({kind:'wave',mesh:wave,z:wave.position.z,phase:i})}
  box(stone,w,.07,5,0,.02,d/2-10);for(const x of [-20,-10,10,20]){plant(x,12,2.5);cylinder(wood,.06,3,x,1.5,1);const canopy=new THREE.Mesh(new THREE.ConeGeometry(2.5,.8,20),x<0?fabric:gold);canopy.position.set(x,3.3,1);scene.add(canopy);seat(x,3);spot(x,5,'Relax under the parasol','sit')}
  spot(0,-d/2+8,'Watch the waves','view');sign('COASTAL PROMENADE',0,3,d/2-15,13);
 }else if(kind==='field'){
  box(green,40,.04,56,0,.02,-2);for(let z=-27;z<27;z+=8)box(mat.grassLight,40,.012,4,0,.05,z);
  for(const x of [-20,20])box(white,.12,.02,56,x,.07,-2);for(const z of [-30,-2,26])box(white,40,.02,.12,0,.07,z);
  const ring=new THREE.Mesh(new THREE.RingGeometry(5.9,6,48),white);ring.rotation.x=-Math.PI/2;ring.position.set(0,.08,-2);scene.add(ring);
  for(const z of [-30,26]){for(const x of [-3.6,3.6])box(white,.13,2.44,.13,x,1.22,z);box(white,7.3,.13,.13,0,2.44,z);const net=new THREE.Mesh(new THREE.PlaneGeometry(7.2,2.44,18,6),new THREE.MeshBasicMaterial({color:0xeeeeee,wireframe:true,transparent:true,opacity:.4}));net.position.set(0,1.22,z+(z>0?1:-1));scene.add(net)}
  const ball=new THREE.Mesh(new THREE.IcosahedronGeometry(.28,1),white);ball.position.set(0,.3,6);ball.userData.dynamic=true;scene.add(ball);c.effects.push({kind:'ball',mesh:ball});spot(0,7,'Kick the football','kick');for(const x of [-24,24])for(const z of [-18,0,18])seat(x,z);
 }
}
