import * as THREE from './three.module.js';
import {createActor} from './world3d.js';
import {createRoomPhysics} from './room-physics.js';
import {batchStaticMeshes,disposeScene,interiorRenderer,instanceAnimatedModels} from './render-utils.js';
import {LARGE_VENUES} from './venue-layouts.js';
export function createVenueScene({kind,name,avatar,design={}}){
 const layout=LARGE_VENUES[kind],canvas=document.createElement('canvas');canvas.className='interior-canvas';canvas.setAttribute('aria-label',name);canvas.dataset.paint=design.palette?.wall||'';document.body.append(canvas);
 const renderer=interiorRenderer(canvas),scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(64,1,.1,280);scene.background=new THREE.Color(kind==='stadium'?0x9ec5d7:0x9aa8ac);scene.fog=new THREE.Fog(scene.background,100,260);
 scene.add(new THREE.HemisphereLight(0xd9ecff,0x615642,2));const sun=new THREE.DirectionalLight(0xffe3c2,3);sun.position.set(25,45,18);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.camera.left=-45;sun.shadow.camera.right=45;sun.shadow.camera.top=65;sun.shadow.camera.bottom=-65;sun.shadow.camera.far=160;sun.shadow.normalBias=.08;sun.shadow.bias=-.0003;scene.add(sun);if(kind==='theatre'){scene.background.set(0x171920);scene.fog.color.copy(scene.background);scene.children[0].intensity=.7;sun.intensity=.35;}
 const mat=(color,roughness=.7,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});const stone=mat(design.palette?.wall||0xe1dfd3),dark=mat(design.palette?.accent||0x263e43),wood=mat(0x906b4a),floor=mat(0xb8bcbc,.36),green=mat(0x397b49),gold=mat(0xc9a15d,.4,.4),white=mat(0xf3f5ed),blue=mat(0x387ea4),red=mat(0xc75b48),glass=new THREE.MeshStandardMaterial({color:0xbedee5,roughness:.2,metalness:.15,transparent:true,opacity:.32,depthWrite:false});const blockers=[],hotspots=[],residents=[],animated=[];
 function box(m,w,h,d,x,y,z,collide=false){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);mesh.position.set(x,y,z);mesh.castShadow=h>.4;mesh.receiveShadow=true;scene.add(mesh);if(collide)blockers.push({x,z,w,d});return mesh}
 function sign(text,x,y,z,width=5,color='#163e3c'){const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#ffffff';ctx.font='600 48px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,82,980);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width/8),new THREE.MeshBasicMaterial({map:texture}));mesh.position.set(x,y,z);scene.add(mesh);return mesh}
 function spot(x,z,label,actionId){hotspots.push({x,z,label,actionId})}
 function plant(x,z){box(stone,.9,.8,.9,x,.4,z,true);const leaves=new THREE.Mesh(new THREE.SphereGeometry(.85,10,8),green);leaves.scale.y=1.6;leaves.position.set(x,1.9,z);scene.add(leaves)}
 function seat(x,z,color=blue){box(color,.65,.12,.65,x,.55,z);box(color,.65,.7,.13,x,.88,z+.3);box(dark,.09,.5,.09,x-.23,.25,z);box(dark,.09,.5,.09,x+.23,.25,z)}
 let ball=null,board=null,boardCanvas=null,boardContext=null,lastScore=-1;
 if(kind==='stadium'){
  box(floor,114,.3,156,0,-.18,0);box(mat(0x956951),80,.025,118,0,.005,0);box(green,68,.04,105,0,.04,0);
  const stripe=mat(0x448851);for(let z=-49;z<53;z+=14)box(stripe,68,.012,7,0,.066,z);
  for(const x of [-34,34])box(white,.12,.018,105,x,.08,0);for(const z of [-52.5,0,52.5])box(white,68,.018,.12,0,.08,z);
  const ring=new THREE.Mesh(new THREE.RingGeometry(9.09,9.21,64),white);ring.rotation.x=-Math.PI/2;ring.position.y=.085;scene.add(ring);
  for(const z of [-52.5,52.5]){const direction=z>0?-1:1;for(const x of [-20.15,20.15])box(white,.12,.015,16.5,x,.08,z+direction*8.25);box(white,40.3,.015,.12,0,.08,z+direction*16.5);for(const x of [-3.66,3.66])box(white,.12,2.44,.12,x,1.22,z);box(white,7.44,.12,.12,0,2.44,z);const net=new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.35});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(7.32,2.44,14,5),net);mesh.position.set(0,1.22,z-direction*1.5);scene.add(mesh);}
  blockers.push({x:0,z:0,w:70,d:107});
  for(const side of [-1,1]){for(let tier=0;tier<9;tier++)box(stone,1.3,.5,118,side*(45+tier*1.15),.25+tier*.5,0);box(dark,1,1,119,side*44,.5,0,true);for(let z=-54;z<=54;z+=6){box(dark,.07,1.1,.07,side*35.8,.55,z);box(dark,.06,.06,6,side*35.8,1.1,z+3)}box(white,13,.25,124,side*49,10,0);for(const z of [-56,56])box(dark,.5,10,.5,side*55,5,z);spot(side*39,0,'Watch the match from pitch side','watch-match');spot(side*39,36,'Watch from the corner','watch-match')}
  for(const side of [-1,1])for(let tier=0;tier<7;tier++){box(stone,110,.5,1.2,0,.25+tier*.5,side*(70+tier*1.1));box(tier%2?blue:gold,108,.3,.65,0,.7+tier*.5,side*(70+tier*1.1))}
  const crowdCount=264,crowdBody=new THREE.InstancedMesh(new THREE.CylinderGeometry(.2,.17,.6,6),red,crowdCount),crowdHead=new THREE.InstancedMesh(new THREE.SphereGeometry(.15,8,6),mat(0x8b563b),crowdCount),crowdMatrix=new THREE.Matrix4();for(let i=0;i<crowdCount;i++){const side=i%2?1:-1,row=Math.floor(i/44),xx=side*(46+row*1.15),zz=(i%44)*2.4-52;crowdBody.setMatrixAt(i,crowdMatrix.makeTranslation(xx,1.35+row*.5,zz));crowdHead.setMatrixAt(i,crowdMatrix.makeTranslation(xx,1.85+row*.5,zz));crowdBody.setColorAt(i,new THREE.Color([0xbc674a,0xd5b453,0x395e81,0xe1dace][i%4]))}scene.add(crowdBody,crowdHead);
  const seatGeo=new THREE.BoxGeometry(.65,.28,.65),seats=new THREE.InstancedMesh(seatGeo,blue,2*8*110),m=new THREE.Matrix4();let index=0;for(const side of [-1,1])for(let row=0;row<8;row++)for(let n=0;n<110;n++){m.makeTranslation(side*(45+row*1.15),.8+row*.5,n-54.5);seats.setMatrixAt(index++,m)}scene.add(seats);
  for(const x of [-40,40])for(const z of [-65,65]){box(dark,.35,18,.35,x,9,z);box(white,5,1,.5,x,18,z)}
  boardCanvas=document.createElement('canvas');boardCanvas.width=768;boardCanvas.height=256;boardContext=boardCanvas.getContext('2d');const texture=new THREE.CanvasTexture(boardCanvas);texture.colorSpace=THREE.SRGBColorSpace;board=new THREE.Mesh(new THREE.PlaneGeometry(22,7.33),new THREE.MeshBasicMaterial({map:texture}));board.position.set(0,12,-63);scene.add(board);for(const xx of [-8,8])box(dark,.4,12,.4,xx,6,-63.5);
  sign('PITCH SIDE ←   CONCOURSE   → EXIT',39,2.7,62,12);sign('WORLD FOLK · FOOTBALL',0,5,-62,22);
  ball=new THREE.Mesh(new THREE.SphereGeometry(.22,12,8),white);ball.userData.dynamic=true;scene.add(ball);
 }else{
  const {bounds:b}=layout;box(floor,b.right-b.left+2,.25,b.front-b.back+2,0,-.13,0);
  for(let x=b.left;x<b.right;x+=3)box(stone,.025,.01,b.front-b.back,x,.015,0);for(let z=b.back;z<b.front;z+=3)box(stone,b.right-b.left,.01,.025,0,.015,z);
  box(stone,b.right-b.left,8,.35,0,4,b.back-.4);for(const x of [b.left-.4,b.right+.4])box(stone,.35,8,b.front-b.back,x,4,0);
  sign(name.toUpperCase(),0,4,b.back+.1,14);sign('EXIT / CITY',b.left+5,2.8,b.front-.3,5).rotation.y=Math.PI;
  if(kind==='mall'){
   const ceilingLight=new THREE.MeshBasicMaterial({color:0xfaf0d9});const stores=['FASHION','HOME & LIVING','TECH & GADGETS','SUPERMARKET','BOOKSHOP','SPORT & STYLE'];
   for(const side of [-1,1])for(let i=0;i<3;i++){const x=side*20,z=-20+i*20,n=i+(side>0?3:0);box(i%2?gold:dark,17,.45,17,x,4.8,z);box(stone,17,4.8,.25,x,2.4,z-8.4,true);box(stone,17,4.8,.25,x,2.4,z+8.4,true);
    // Open shop entrance faces the atrium; side glass defines the storefront.
    box(white,16.8,.06,16.8,x,4.54,z);for(const dz of [-4,4])box(ceilingLight,7,.04,.3,x,4.49,z+dz);
    for(const zz of [-5.5,5.5])box(glass,.1,3.3,5.2,side*11.5,1.65,z+zz,true);
    const label=sign(stores[n],side*11.35,4.2,z,7);label.rotation.y=side<0?Math.PI/2:-Math.PI/2;
    if(n===1){for(const dz of [-2,2]){box(blue,5,.6,1.5,x,.4,z+dz,true);box(blue,5,.7,.25,x,.95,z+dz+.6)}box(wood,2,.5,1,x,.25,z,true);box(gold,.12,2.2,.12,x+4,1.1,z);const shade=new THREE.Mesh(new THREE.ConeGeometry(.65,.7,12),stone);shade.position.set(x+4,2.25,z);scene.add(shade)}
    else for(const offset of [-4,0,4]){const sx=x+side*3;box(wood,1.2,n===0?2:1.6,3.6,sx,n===0?1:.8,z+offset,true);
     if(n===0){for(let j=0;j<5;j++){box(j%2?red:blue,.55,.75,.1,sx-side*.75,1.25,z+offset-1.4+j*.65);box(gold,.05,.25,.05,sx-side*.75,1.8,z+offset-1.4+j*.65)}}
     else if(n===2){for(const dz of [-1.1,1.1]){box(dark,.1,1.2,1.65,sx-side*.7,1.35,z+offset+dz);box(glass,.11,1.05,1.5,sx-side*.77,1.35,z+offset+dz);box(gold,.8,.06,1.3,sx-side*.5,.7,z+offset+dz)}}
     else for(let y=.5;y<1.6;y+=.5)for(let a=0;a<5;a++){if(n===3||n===5){const item=new THREE.Mesh(new THREE.SphereGeometry(n===5?.2:.16,10,6),n===5?white:a%2?red:green);item.position.set(sx-side*.5,y+.25,z+offset-1.3+a*.6);scene.add(item)}else box(a%2?blue:red,.5,.38,.16,sx-side*.4,y+.22,z+offset-1.4+a*.6)}
    }
    box(dark,2,1,1.2,x, .5,z-5,true);spot(x-side*5,z-2,'Browse '+stores[n].toLowerCase(),'shopping');
   }
   sign('FOOD COURT',0,3.5,-28,8);for(const x of [-4,4]){box(wood,2,.1,1.5,x,.8,-27,true);for(const dx of [-1.3,1.3])seat(x+dx,-27,gold)}for(const x of [-6,6]){box(wood,5,1.1,1.4,x,.55,-33,true);spot(x,-30.7,'Order food & drinks','shopping')}
   for(const z of [-22,-4,14]){plant(-7,z);plant(7,z);box(wood,3,.5,1,0,.25,z,true);spot(0,z+1.5,'Sit in the atrium','sit')}
   for(const x of [-9,9])for(const z of [-30,-10,10,30])box(stone,.8,8,.8,x,4,z,true);
   for(const x of [-10,10])box(dark,.15,.2,72,x,8,0);for(let z=-34;z<37;z+=8)box(dark,21,.18,.12,0,8,z);
   for(const x of [-5,5])box(glass,9,.04,74,x,8.1,0);
  }else if(kind==='terminal'){
   for(const x of [-15,15])box(white,20,.18,66,x,8,0);box(glass,10,.08,66,0,8.1,0);for(let zz=-30;zz<=30;zz+=10)box(dark,50,.18,.12,0,7.9,zz);
   sign('DEPARTURES   ·   CHECK IN',0,4,-12,15);for(const x of [-18,-9,0,9,18]){box(dark,5,1.2,1.5,x,.6,0,true);box(glass,1.4,.9,.1,x,1.8,-.3);spot(x,2,'Flight information','transport')}
   for(const x of [-18,18])for(let z=-22;z<25;z+=5){for(let a=-2;a<=2;a++)seat(x+a*.85,z);blockers.push({x,z,w:4.8,d:1})}
   for(const x of [-14,0,14]){box(glass,10,5,.1,x,3,-32);sign('GATE '+(x/14+2),x,5,-31.8,5);spot(x,-28,'Browse flights','transport')}
  }else if(kind==='theatre'){
   stone.color.set(0x51494b);floor.color.set(0x42383e);box(dark,33,.2,47,0,8,1);for(const xx of [-8,8]){const stageLight=new THREE.SpotLight(0xffe1b0,130,40,Math.PI/4,.5,1);stageLight.position.set(xx,7,-7);stageLight.target.position.set(xx/2,1,-17);scene.add(stageLight,stageLight.target);box(new THREE.MeshBasicMaterial({color:0xffe4af}),1,.12,.5,xx,6.9,-7)}
   box(wood,24,1.2,10,0,.6,-17,true);box(red,27,8,.3,0,4,-22);for(const x of [-13,13])box(red,2,8,10,x,4,-17);sign('LIVE · CITY STAGE',0,5,-21.7,13);
   for(let row=0;row<9;row++)for(const side of [-1,1]){for(let n=0;n<8;n++)seat(side*(3+n*1.1),-7+row*2.7,red);blockers.push({x:side*6.85,z:-7+row*2.7,w:8.8,d:.9})}
   spot(0,-10,'Watch the stage performance','watch-stage');spot(-14,-10,'Watch from the side aisle','watch-stage');
  }
 }
 // Exit and guide marks stay readable without per-frame geometry rebuilding.
 const exitMat=new THREE.MeshBasicMaterial({color:0x69c5a6});box(exitMat,2,.03,1,...[layout.exit[0],.03,layout.exit[1]]);
 for(const h of hotspots){const marker=new THREE.Mesh(new THREE.RingGeometry(.45,.53,24),new THREE.MeshBasicMaterial({color:0xe7bd67,side:THREE.DoubleSide}));marker.rotation.x=-Math.PI/2;marker.position.set(h.x,.04,h.z);scene.add(marker)}
 const stats=batchStaticMeshes(scene);renderer.shadowMap.needsUpdate=true;
 if(kind==='stadium')for(let i=0;i<22;i++){const actor=createActor(i<11?'👨🏾':'👩🏽');actor.group.traverse(o=>{if(o.material?.color&&o.material.roughness===.86)o.material.color.set(i<11?0xe3b541:0x417da8)});animated.push(actor)}
 if(kind==='theatre')for(let i=0;i<4;i++){const actor=createActor(i%2?'👩🏾':'👨🏽');animated.push(actor)}
 if(['mall','terminal','stadium','theatre'].includes(kind))for(let i=0;i<(kind==='stadium'||kind==='theatre'?4:8);i++){const actor=createActor(i%2?'👩🏾':'👨🏽');residents.push(actor)}
 const actor=createActor(avatar);scene.add(actor.group);const physics=createRoomPhysics(blockers,layout.bounds);let [x,z]=layout.spawn,watching=false,last=0,width=0,height=0,viewYaw=0,viewPitch=0;const cameraTarget=new THREE.Vector3(),lookTarget=new THREE.Vector3();camera.position.set(x,4,z+7);
 let pointerLook=null;
 canvas.addEventListener('contextmenu',e=>e.preventDefault());
 canvas.addEventListener('pointerdown',e=>{if(e.button!==2&&e.pointerType!=='touch')return;pointerLook=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});
 canvas.addEventListener('pointermove',e=>{if(!pointerLook)return;viewYaw-=(e.clientX-pointerLook[0])*.2;viewPitch=Math.max(-.6,Math.min(1,viewPitch+(e.clientY-pointerLook[1])*.0036));pointerLook=[e.clientX,e.clientY]});
 for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,()=>pointerLook=null);
 function nearby(){const person=residents.find(a=>Math.hypot(x-a.group.position.x,z-a.group.position.z)<2.1&&physics.visible([x,z],[a.group.position.x,a.group.position.z]));if(person&&!watching)return {kind:'local',actionId:'talk',label:kind==='mall'?'Talk to a shopper':'Talk to a visitor'};if(watching)return {kind:'local',actionId:'stop-watching',label:'Return to walking'};if(Math.hypot(x-layout.exit[0],z-layout.exit[1])<2.3)return {kind:'exit',label:'Leave '+(kind==='stadium'?'stadium':'building')};return hotspots.filter(h=>Math.hypot(x-h.x,z-h.z)<2.3&&physics.visible([x,z],[h.x,h.z])).map(h=>({kind:['watch-match','watch-stage','sit','transport','shopping'].includes(h.actionId)?'local':'activity',...h}))[0]||null}
 function interact(action){if(action==='talk')return {dialogue:kind==='mall'?'Shopper · Akwaaba! The shops are along both sides of the atrium, and the food court is at the far end.':'Visitor · Enjoy exploring! You can talk to other players using the chat button.'};if(action==='shopping')return 'shops';if(action==='transport')return 'transport';if(action==='stop-watching'){watching=false;return}if(action.startsWith('watch-')||action==='sit')watching=action}
 function move(dx,dz){if(watching)return;[x,z]=physics.move([x,z],[dx,dz]);if(Math.hypot(dx,dz)>.001)actor.group.rotation.y=Math.atan2(-dx,-dz)}
 for(const a of [actor,...animated,...residents])a.group.traverse(o=>o.castShadow=false);
 const crowd=instanceAnimatedModels([...animated,...residents].map(a=>a.group));scene.add(crowd.group);
 function render(t,moving){const dt=last?Math.min(.1,t-last):1/60;last=t;if(width!==innerWidth||height!==innerHeight){width=innerWidth;height=innerHeight;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix()}
  actor.animate(t,moving&&!watching);actor.group.position.set(x,actor.group.position.y,z);
  if(kind==='stadium'){
   const bx=Math.sin(t*.23)*23,bz=Math.sin(t*.16)*42;ball.position.set(bx,.25+Math.abs(Math.sin(t*2))*.4,bz);
   animated.forEach((a,i)=>{const side=i<11?1:-1,n=i%11,px=n===0?0:((n%4)-1.5)*13+Math.sin(t*.4+i)*3,pz=n===0?side*49:side*(Math.floor(n/4)*12-4)+bz*.28+Math.cos(t*.3+i)*4;a.animate(t+i,true);a.group.position.set(px,a.group.position.y,pz);a.group.rotation.y=Math.atan2(px-bx,pz-bz)});
   const minute=Math.floor(t/8)%90;if(minute!==lastScore){lastScore=minute;boardContext.fillStyle='#152f38';boardContext.fillRect(0,0,768,256);boardContext.fillStyle='#f6e7bb';boardContext.textAlign='center';boardContext.font='bold 34px sans-serif';boardContext.fillText('WORLD FOLK · FRIENDLY',384,50);boardContext.font='bold 70px sans-serif';boardContext.fillText(`GOLD ${Math.floor(minute/25)} : ${Math.floor(minute/36)} BLUE`,384,145);boardContext.font='30px sans-serif';boardContext.fillText(`${minute}′  •  Simulated match`,384,211);board.material.map.needsUpdate=true;}
   if(watching){cameraTarget.set(x>0?38:-38,5,z);lookTarget.set(bx,1,bz)}
  }
  if(kind==='theatre')animated.forEach((a,i)=>{a.animate(t+i,true);a.group.position.set((i-1.5)*4+Math.sin(t*.5+i),1.2,-17);a.leftArm.rotation.x=Math.sin(t*2+i)*1.1});
  residents.forEach((a,i)=>{a.animate(t+i,true);a.group.position.set((i%2?-1:1)*(kind==='stadium'?39:kind==='theatre'?14:kind==='mall'?4:7),a.group.position.y,Math.sin(t*.055+i)*(kind==='stadium'?48:kind==='theatre'?15:23));a.group.rotation.y=Math.cos(t*.055+i)>0?Math.PI:0});
  crowd.update();
  if(!watching){const a=viewYaw*Math.PI/180;let distance=7;for(;distance>1.3;distance-=.3){const cx=x-Math.sin(a)*distance,cz=z+Math.cos(a)*distance;if(physics.clear(cx,cz)&&physics.visible([x,z],[cx,cz]))break}cameraTarget.set(x-Math.sin(a)*distance,Math.min(3.7,1.9+distance*.24)+viewPitch,z+Math.cos(a)*distance);lookTarget.set(x+Math.sin(a)*5,1.4,z-Math.cos(a)*5)}else if(kind!=='stadium'){cameraTarget.set(x,2.1,z+1);lookTarget.set(0,2,-17)}camera.position.lerp(cameraTarget,1-Math.exp(-dt*7));camera.lookAt(lookTarget);renderer.render(scene,camera);
 }
 function destroy(){disposeScene(scene);for(const a of [...animated,...residents])disposeScene(a.group);renderer.dispose();renderer.forceContextLoss();canvas.remove()}
 return {move,nearby,render,destroy,interact,look(yaw,pitch=0){viewYaw+=yaw;viewPitch=Math.max(-.6,Math.min(1,viewPitch+pitch*.03))},get bearing(){return viewYaw},playAction(){},get isActing(){return false},get position(){return [x,z]},get name(){return name},description:layout.description,stats};
}
