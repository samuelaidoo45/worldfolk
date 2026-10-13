import * as T from './three.module.js';
import {vehicleKit,createCar,createBus} from './vehicle-models.js';
import {createActor} from './human-character.js';

// Reference-led, unbranded body families. Dimensions are in metres, facing -Z.
// The fleet uses the same factory for owned vehicles, residents and multiplayer.
export function createVehicle(kind='car',color=0x245d81){
 if(kind==='bus')return createBus();
 if(kind==='minibus')return createMinibus(color);
 if(kind==='truck')return createTruck(color);
 if(['bicycle','motorcycle','tricycle'].includes(kind))return createCycle(kind,color);
 return createCar(kind==='taxi'?0xbac0bd:color,kind);
}

export function createMinibus(color=0xc3c9c7){
 const k=vehicleKit(color),{paint,glass,rubber,chrome,headlight,tail,cabin,box,rounded,profile,wheel,seat,plate,label,steeringWheel,tube}=k;
 // Hiace / Urvan family: cab-forward nose, continuous side glazing, sliding door.
 profile([[-2.58,.56],[-2.59,1.01],[-2.32,1.33],[-2.04,1.34],[2.48,1.34],[2.53,.56]],1.78,paint,.07);
 rounded(paint,1.79,.17,4.72,0,2.11,.12,.07);
 box(cabin,1.72,.12,4.7,0,.52,.08);
 const orange=new T.MeshStandardMaterial({color:0xe5a527,roughness:.43});
 for(const s of [-1,1]){
  box(paint,.1,.55,4.85,s*.88,1.25,.04);
  box(orange,.019,.095,4.83,s*.953,1.08,.06);
  box(rubber,.025,.07,4.8,s*.957,.72,.08);
  for(const z of [-2.02,-.92,.5,1.86,2.45])box(paint,.1,.72,.09,s*.88,1.71,z);
  for(const [z,d] of [[-1.48,.91],[-.22,1.27],[1.18,1.18],[2.16,.43]]){
   rounded(rubber,.035,.66,d+.065,s*.95,1.72,z,.01);
   rounded(glass,.036,.57,d,s*.978,1.74,z,.01);
   box(chrome,.02,.015,d,s*.999,1.85,z);
  }
  for(const z of [-1.58,1.57])wheel(s*.8,z,.35);
  rounded(paint,.16,.2,.25,s*1.01,1.51,-1.94,.03);box(glass,.018,.12,.18,s*1.101,1.53,-1.93);
  rounded(headlight,.39,.2,.055,s*.64,1.03,-2.626,.022);
  rounded(tail,.14,.45,.06,s*.79,1.09,2.6,.02);
  box(chrome,.04,.034,.18,s*.977,1.24,-1.19);
  // Black arc outlines emphasize tyre openings and pressed wheel arches.
  for(const z of [-1.58,1.57]){const a=k.add(new T.TorusGeometry(.39,.035,6,20,Math.PI),rubber,s*.929,.35,z);a.rotation.set(0,Math.PI/2,0)}
 }
 const screen=rounded(glass,1.68,.69,.036,0,1.7,-2.205,.01);screen.rotation.x=.29;
 for(const s of [-1,1])tube(paint,[s*.84,1.34,-2.32],[s*.84,2.07,-2.06],.052);
 rounded(glass,1.53,.59,.04,0,1.73,2.547,.012);
 rounded(rubber,1.86,.15,.12,0,.57,-2.59,.045);rounded(rubber,1.86,.15,.12,0,.57,2.54,.045);
 box(rubber,.76,.23,.05,0,.94,-2.639);for(const y of [.86,.94,1.02])box(chrome,.73,.018,.03,0,y,-2.672);
 for(const s of [-1,1]){const w=box(rubber,.48,.015,.025,s*.38,1.405,-2.32);w.rotation.z=s*.12}
 // Passenger-side sliding seam, rail and step, plus rear split-door seam.
 for(const z of [-.86,.59])box(rubber,.019,.74,.017,.96,.98,z);
 box(chrome,.018,.028,2.5,.974,1.43,1.15);box(chrome,.1,.08,1.38,.98,.46,-.13);box(rubber,.025,.72,.017,0,1,2.614);
 for(let row=0;row<3;row++)for(const x of [-.53,.5])seat(x,.75,-.35+row*.94,.56);
 seat(-.48,.75,-1.55,.56);seat(.46,.75,-1.55,.56);box(cabin,1.67,.18,.32,0,1.28,-1.96);steeringWheel(-.48,1.39,-1.72);
 plate(0,.72,-2.66);plate(0,.81,2.62,true);label('ACCRA · CIRCLE',1.08,.14,0,2.02,-2.241,Math.PI);label('TRO-TRO',.78,.13,0,1.34,2.614);
 k.group.userData.vehicleKind='minibus';return k.finish(2.18,5.55,{steel:true});
}

export function createTruck(color=0xe6e5dd){
 const k=vehicleKit(color),{paint,glass,rubber,chrome,headlight,tail,cabin,box,rounded,profile,wheel,seat,plate,label,tube,steeringWheel}=k;
 // Short cab-over delivery truck: separate chassis, cargo box and dual rear tyres.
 box(rubber,1.45,.18,5.65,0,.63,0);for(const x of [-.61,.61])box(chrome,.12,.16,5.6,x,.67,0);
 profile([[-3.03,.65],[-3.03,1.42],[-2.85,1.65],[-1.24,1.65],[-1.18,.65]],1.96,paint,.07);
 box(paint,1.97,.83,.09,0,2.08,-1.25);for(const side of [-1,1]){tube(paint,[side*.98,1.58,-3],[side*.98,2.48,-2.82],.055);tube(paint,[side*.98,1.6,-1.29],[side*.98,2.48,-1.29],.055)}
 const screen=rounded(glass,1.74,.67,.038,0,2.03,-2.91,.015);screen.rotation.x=.17;
 rounded(paint,1.99,.17,1.73,0,2.53,-2.1,.06);
 const cargo=new T.MeshStandardMaterial({color:0xe0e1d9,roughness:.68,metalness:.18});
 rounded(cargo,2.13,2.12,4.06,0,2.02,.97,.035);
 for(const s of [-1,1]){
  rounded(glass,.026,.67,1.15,s*1.049,2.04,-2.04,.008);
  box(rubber,.025,.02,1.4,s*1.052,1.64,-2.01);box(chrome,.039,.055,.2,s*1.06,1.45,-1.56);
  tube(chrome,[s*.94,2.28,-2.68],[s*1.25,2.13,-2.87],.025);rounded(rubber,.13,.35,.16,s*1.27,2,-2.86,.03);
  wheel(s*.88,-2.14,.43);wheel(s*.79,1.87,.43);wheel(s*1.005,1.87,.43);
  box(rubber,.12,.14,1.08,s*.91,.78,1.88);box(rubber,.38,.37,.025,s*.9,.38,2.37);
  for(let n=0;n<16;n++)box(chrome,.012,1.98,.015,s*1.073,2.02,-.96+n*.25);
  box(chrome,.018,.045,4.07,s*1.08,1.01,.97);box(chrome,.018,.045,4.07,s*1.08,3.08,.97);
  box(chrome,.18,.11,.77,s*1.03,.6,-1.34);
  rounded(headlight,.36,.19,.06,s*.68,1.06,-3.1,.025);rounded(tail,.31,.13,.05,s*.78,.88,3.071,.015);
  for(const z of [-.65,.85,2.43])box(new T.MeshStandardMaterial({color:0xe8ae30}),.02,.07,.1,s*1.09,1.03,z);
  seat(s*.48,1.18,-1.72,.59);
 }
 box(cabin,1.72,.14,.24,0,1.7,-2.63);steeringWheel(-.5,1.76,-2.38);
 box(rubber,1.09,.36,.03,0,1.27,-3.116);for(let n=0;n<4;n++)box(chrome,1.06,.022,.028,0,1.15+n*.085,-3.14);
 rounded(paint,2.06,.18,.12,0,.71,-3.06,.035);
 for(const x of [-.46,.46]){const w=box(rubber,.61,.022,.022,x,1.76,-2.995);w.rotation.z=x*.3;box(chrome,.025,1.74,.025,x,2.05,3.025);for(const y of [1.22,2.84])box(chrome,.21,.04,.05,x,y,3.04)}
 box(rubber,.015,2.03,.024,0,2.04,3.03);box(chrome,1.91,.09,.11,0,.59,2.93);plate(0,.89,-3.148);plate(0,.86,3.074,true);label('ACCRA LOGISTICS',1.38,.19,0,2.64,3.05);
 k.group.userData.vehicleKind='truck';return k.finish(2.4,6.55,{steel:true});
}

export function createCycle(kind='motorcycle',color=0x2266a1){
 const bike=kind==='bicycle',cargo=kind==='tricycle',k=vehicleKit(color),{paint,rubber,chrome,headlight,tail,box,rounded,tube,wheel,plate}=k;
 const front=bike?-.61:cargo?-1.12:-.72,rear=bike?.61:cargo?.97:.72,r=bike?.315:.34;
 wheel(0,front,r);if(cargo){wheel(-.59,rear,r);wheel(.59,rear,r)}else wheel(0,rear,r);
 const crank=[0,bike?.34:.46,0],saddle=[0,bike?.9:.85,.22],head=[0,bike?.93:1.09,front+.19];
 // Real triangulated frame and paired fork legs leave the wheel centres open.
 for(const side of [-1,1]){tube(paint,[side*.07,r,rear],crank,bike?.02:.034);tube(paint,[side*.07,r,rear],saddle,bike?.018:.03);tube(chrome,[side*.07,r,front],[side*.07,head[1],head[2]],bike?.018:.032)}
 tube(paint,crank,saddle,bike?.025:.04);tube(paint,saddle,head,bike?.023:.042);tube(paint,crank,head,bike?.027:.043);
 tube(chrome,head,[0,1.23,front+.35],.025);tube(chrome,[-.3,1.23,front+.35],[.3,1.23,front+.35],.02);
 for(const s of [-1,1]){tube(rubber,[s*.22,1.23,front+.35],[s*.32,1.23,front+.35],.029);box(rubber,.08,.035,.19,s*.2,.34,.05)}
 rounded(rubber,bike?.2:.36,.095,bike?.3:.71,0,saddle[1]+.05,bike?.22:.27,.028);
 if(!bike){
  const tank=k.add(new T.SphereGeometry(1,16,10),paint,0,.91,-.22);tank.scale.set(.22,.21,.33);
  rounded(chrome,.37,.32,.36,0,.53,-.09,.045);for(let n=0;n<6;n++)box(rubber,.4,.012,.34,0,.41+n*.044,-.09);
  tube(chrome,[.19,.48,-.12],[.21,.27,.25],.035);tube(chrome,[.21,.27,.25],[.22,.29,.82],.06);
  for(const z of [front,rear]){const f=k.add(new T.TorusGeometry(r+.06,.047,6,20,Math.PI),paint,0,r,z);f.rotation.y=Math.PI/2;}
  for(const s of [-1,1]){tube(chrome,[s*.27,1.23,front+.35],[s*.34,1.32,front+.05],.012);rounded(rubber,.11,.074,.032,s*.34,1.33,front+.05,.01);for(let n=0;n<6;n++)tube(chrome,[s*.13,.41+n*.038,.51],[s*.13,.435+n*.038,.59],.017)}
  const lamp=k.add(new T.CylinderGeometry(.108,.108,.11,20),headlight,0,1.03,front-.03);lamp.rotation.x=Math.PI/2;rounded(tail,.16,.06,.045,0,.89,.73,.015);
  plate(0,.68,cargo?1.54:1.05,true);
 }else{tube(chrome,[.07,.34,0],[.07,r,rear],.018);tube(rubber,[.085,.4,0],[.085,r+.045,rear],.006);tube(rubber,[.085,.28,0],[.085,r-.045,rear],.006);box(tail,.047,.04,.02,0,.85,.37);box(headlight,.05,.04,.025,0,1.045,front+.055)}
 if(cargo){
  // Blue pressed-steel drop-side cargo bed, open top and rails.
  box(paint,1.36,.1,1.52,0,.64,.74);
  for(const s of [-1,1]){box(paint,.045,.42,1.54,s*.69,.91,.74);for(let n=0;n<3;n++)box(chrome,.009,.018,1.5,s*.718,.76+n*.13,.74);tube(paint,[s*.69,1.14,-.03],[s*.69,1.48,-.03],.026);tube(paint,[s*.69,1.48,-.03],[s*.69,1.48,1.49],.026);for(const z of [.74,1.49])tube(paint,[s*.69,1.1,z],[s*.69,1.48,z],.025)}
  box(paint,1.4,.42,.045,0,.91,1.51);box(paint,1.4,.4,.04,0,.91,-.03);tube(paint,[-.69,1.48,-.03],[.69,1.48,-.03],.026);k.label('ACCRA · CARGO',.92,.14,0,.93,1.538);
 }
 k.group.userData.vehicleKind=kind;const model=k.finish(cargo?1.65:.85,cargo?3.35:2.2,{spokes:bike});
 // Cranks are kept dynamic; tyres and spokes still use just two instanced draws.
 const pedals=new T.Group();pedals.userData.dynamic=true;pedals.position.set(0,.34,0);
 for(const s of [-1,1]){const arm=new T.Mesh(new T.BoxGeometry(.018,.17,.02),chrome);arm.position.set(s*.09,s*.085,0);pedals.add(arm);const foot=new T.Mesh(new T.BoxGeometry(.12,.026,.07),rubber);foot.position.set(s*.15,s*.17,0);pedals.add(foot)}
 if(bike)model.group.add(pedals);
 const rider=createActor('🧑🏾','rider-'+kind);rider.group.scale.setScalar(.87);model.group.add(rider.group);model.rider=rider.group;
 const hideFootShadow=()=>rider.group.traverse(o=>{if(o.material?.isMeshBasicMaterial&&o.material.transparent&&o.material.map)o.visible=false});hideFootShadow();rider.ready?.then(hideFootShadow);
 const animate=model.animateVehicle;
 model.animateVehicle=(input={},dt)=>{animate(input,dt);const p= bike?-model.wheelPhase*.42:0;if(bike)pedals.rotation.x=p;rider.group.position.set(0,bike?.2:.22,cargo?-.38:.12);rider.leftArm.rotation.x=-.85;rider.rightArm.rotation.x=-.85;rider.leftLeg.rotation.x=-1.16+(bike?Math.sin(p)*.32:0);rider.rightLeg.rotation.x=-1.16+(bike?Math.sin(p+Math.PI)*.32:0);rider.knees?.forEach((joint,i)=>joint.rotation.x=1.3+(bike?Math.sin(p+i*Math.PI)*.35:0));rider.elbows?.forEach(joint=>joint.rotation.x=-.32)};
 model.animateVehicle();return model;
}
