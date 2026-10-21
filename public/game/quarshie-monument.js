import * as T from './three.module.js';
import {ROUNDABOUT_FOUNTAIN} from './mall-roundabout-data.js';

// Original mesh study of the installed monument in the 15 December 2025
// @musiq_buz reference. Dimensions and facing are photo estimates, not a survey.
export function createQuarshieMonument(){
 const group=new T.Group();group.name='Tetteh Quarshie · cocoa pod statue and fountain';
 const material=(color,roughness=.8,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const bronze=material('#725540',.64,.55),highlight=material('#96724e',.6,.5),dark=material('#343733'),blue=material('#356e9a',.3),stone=material('#665944'),mortar=material('#a7977c'),leaf=material('#456335');
 const add=(geo,mat,p=[0,0,0],scale=[1,1,1],parent=group)=>{const m=new T.Mesh(geo,mat);m.position.set(...p);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m};
 const box=(mat,w,h,d,p,parent=group)=>add(new T.BoxGeometry(w,h,d),mat,p,[1,1,1],parent);
 const sphere=(mat,p,s,parent=group)=>add(new T.SphereGeometry(1,16,12),mat,p,s,parent);
 function tube(points,r,mat,parent=group){return add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),20,r,6,false),mat,[0,0,0],[1,1,1],parent)}
 function limb(a,b,r1,r2,mat,parent){const va=new T.Vector3(...a),vb=new T.Vector3(...b),m=add(new T.CylinderGeometry(r2,r1,va.distanceTo(vb),14),mat,va.clone().add(vb).multiplyScalar(.5).toArray(),[1,1,1],parent);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),vb.sub(va).normalize());return m}
 const radius=ROUNDABOUT_FOUNTAIN.radius;
 // Thick circular basin with stone facing and a broad blue tiled coping.
 const wall=add(new T.CylinderGeometry(radius,radius,.86,80),dark,[0,.62,0]);wall.name='Stone fountain wall';
 const facing=material('#ffffff');facing.vertexColors=true;
 for(let row=0;row<3;row++)for(let i=0;i<54;i++){
  const a=(i+(row%2)*.5)/54*Math.PI*2,y=.27+row*.25,shape=new T.Shape();
  shape.moveTo(-.28,-.09);shape.lineTo(-.26,.09);shape.lineTo(-.12,.115);shape.lineTo(.23,.095);shape.lineTo(.28,-.075);shape.lineTo(.1,-.112);shape.closePath();
  const geo=new T.ExtrudeGeometry(shape,{depth:.055,bevelEnabled:false});const c=new T.Color().setHSL(.095+(i%4)*.006,.19+(i%3)*.045,.27+((i*7+row*11)%9)*.019).convertSRGBToLinear(),colors=[];
  for(let j=0;j<geo.attributes.position.count;j++)colors.push(c.r,c.g,c.b);geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));
  const m=add(geo,facing,[Math.sin(a)*(radius+.012),y,Math.cos(a)*(radius+.012)]);m.rotation.y=a;m.rotation.z=Math.sin(i*13+row)*.055;
 }
 const ringShape=new T.Shape();ringShape.absarc(0,0,radius+.08,0,Math.PI*2,false);const hole=new T.Path();hole.absarc(0,0,radius-.36,0,Math.PI*2,true);ringShape.holes.push(hole);
 const rim=add(new T.ExtrudeGeometry(ringShape,{depth:.18,steps:1,bevelEnabled:false,curveSegments:64}),blue,[0,1.16,0]);rim.rotation.x=Math.PI/2;
 for(let i=0;i<100;i++){const a=i*Math.PI*2/100,m=box(mortar,.016,.008,.35,[Math.sin(a)*(radius-.14),1.164,Math.cos(a)*(radius-.14)]);m.rotation.y=a;}
 const water=add(new T.CircleGeometry(radius-.36,80),material('#499bab',.18,.25),[0,1.075,0]);water.rotation.x=-Math.PI/2;water.name='Fountain water';
 box(dark,1.32,.5,1.1,[0,1.26,0]);box(dark,1.46,.11,1.2,[0,1.56,0]);
 const statue=new T.Group();statue.name='Quarshie standing with raised cocoa pod';statue.position.y=1.62;statue.scale.setScalar(1.85);statue.rotation.y=.25;group.add(statue);
 // Sculpted clothed silhouette, with a natural offset stance, face and cap.
 for(const side of [-1,1]){const x=side*.105,z=side===1?-.055:.06;limb([x,.12,z],[x*.85,.58,z-.015],.067,.084,bronze,statue);limb([x*.85,.58,z-.015],[x*.9,1.01,0],.084,.11,bronze,statue);sphere(bronze,[x,.065,z+.065],[.081,.065,.155],statue);tube([[x-.025,.2,z+.059],[x+.012,.56,z+.072],[x-.02,.9,.088]],.009,highlight,statue);}
 // Lathed shirt tapers at waist, broadens at shoulders, flattened front/back.
 const shirt=add(new T.LatheGeometry([[.185,.93],[.19,1],[.155,1.08],[.185,1.24],[.23,1.4],[.18,1.44],[.08,1.46]].map(p=>new T.Vector2(...p)),24),bronze,[0,0,0],[1,1,.64],statue);
 shirt.name='Collared shirt';limb([0,1.42,0],[0,1.52,0],.063,.065,bronze,statue);
 sphere(bronze,[0,1.61,.015],[.098,.132,.091],statue);sphere(bronze,[0,1.59,.099],[.026,.035,.032],statue);
 for(const side of [-1,1]){sphere(bronze,[side*.096,1.61,.008],[.018,.032,.022],statue);sphere(dark,[side*.038,1.64,.092],[.013,.006,.005],statue);tube([[side*.016,1.46,.08],[side*.073,1.39,.112],[side*.1,1.43,.055]],.014,highlight,statue);}
 sphere(bronze,[0,1.724,0],[.105,.044,.1],statue);tube([[-.07,1.704,.069],[0,1.7,.105],[.075,1.704,.069]],.012,highlight,statue);
 tube([[0,1.4,.124],[0,1.18,.105],[.007,.96,.12]],.007,highlight,statue);for(let y=1.04;y<1.4;y+=.085)sphere(highlight,[.014,y,.123],[.009,.009,.006],statue);
 for(const x of [-.12,-.07,.075,.13])tube([[x,.95,.106],[x*.82,1.08,.101],[x*1.1,1.29,.109]],.007,highlight,statue);
 // One arm hangs; the bent presenting arm lifts a ridged cocoa pod in front.
 limb([-.2,1.38,0],[-.255,1.17,.02],.093,.079,bronze,statue);limb([-.255,1.17,.02],[-.245,.94,.05],.063,.041,bronze,statue);sphere(bronze,[-.244,.9,.06],[.048,.075,.033],statue);
 limb([.2,1.38,0],[.29,1.18,.17],.093,.075,bronze,statue);sphere(bronze,[.29,1.18,.17],[.071,.07,.07],statue);limb([.29,1.18,.17],[.28,1.46,.42],.068,.037,bronze,statue);sphere(bronze,[.28,1.48,.43],[.053,.067,.055],statue);
 const pod=new T.Group();pod.name='Raised ribbed cocoa pod';pod.position.set(.28,1.61,.47);pod.rotation.x=.14;statue.add(pod);sphere(bronze,[0,0,0],[.071,.18,.068],pod);
 for(let i=0;i<10;i++){const a=i*Math.PI/5;const pts=[];for(let j=0;j<=12;j++){const u=j/12*Math.PI,r=Math.sin(u)*.073;pts.push([Math.cos(a)*r,-.18+u/Math.PI*.36,Math.sin(a)*r]);}tube(pts,.009,highlight,pod);}
 // Curved raised-name treatment is authored from the legible reference fragment.
 if(typeof document!=='undefined'){const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=128;const c=canvas.getContext('2d');if(c){c.fillStyle='#fff4db';c.font='bold 77px Georgia';c.textAlign='center';c.textBaseline='middle';c.fillText('TETTEH QUARSHIE ROUNDABOUT',1024,69);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const label=add(new T.CylinderGeometry(radius+.095,radius+.095,.57,100,1,true,-1.7,3.4),new T.MeshStandardMaterial({map:tex,transparent:true,roughness:.8,depthWrite:false}),[0,.64,0]);label.castShadow=false;label.name='Curved roundabout inscription';}}
 // Modest cycad clusters stay entirely within the grass island.
 for(const [x,z] of [[-7.5,-2],[6.7,-4]]){add(new T.CylinderGeometry(.16,.23,.65,8),stone,[x,.48,z]);for(let i=0;i<10;i++){const a=i*Math.PI/5;for(let j=1;j<9;j++){const t=j/9,px=x+Math.sin(a)*t*1.9,pz=z+Math.cos(a)*t*1.9,y=.7+Math.sin(t*Math.PI)*.8;const m=sphere(leaf,[px,y,pz],[.09,.025,.38]);m.rotation.y=-a+Math.PI/2;m.rotation.z=.25;}}}
 // A fixed-size GPU particle pool, no per-frame geometry allocations.
 const streamMaterial=new T.MeshStandardMaterial({color:'#d4eff2',transparent:true,opacity:.5,roughness:.28,depthWrite:false});
 for(let jet=0;jet<12;jet++){const a=jet*Math.PI/6,pts=[];for(let j=0;j<=20;j++){const u=j/20,r=3.6-u*.95;pts.push([Math.sin(a)*r,1.08+Math.sin(u*Math.PI)*(1.1+(jet%3)*.15),Math.cos(a)*r]);}const stream=tube(pts,.017,streamMaterial);stream.castShadow=false;}
 const count=192,positions=new Float32Array(count*3),geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(positions,3));const spray=new T.Points(geo,new T.PointsMaterial({color:'#e8f6fa',size:.075,transparent:true,opacity:.82,depthWrite:false}));spray.name='Twelve animated fountain jets';spray.frustumCulled=false;group.add(spray);
 function update(t=0){const seconds=typeof t==='number'&&Number.isFinite(t)?t:0;for(let i=0;i<count;i++){const jet=i%12,a=jet*Math.PI/6,u=((i/12+seconds*10)%16)/16,r=3.6-u*.95;positions[i*3]=Math.sin(a)*r;positions[i*3+1]=1.08+Math.sin(u*Math.PI)*(1.1+(jet%3)*.15);positions[i*3+2]=Math.cos(a)*r;}geo.attributes.position.needsUpdate=true;}
 update();group.userData.monument={name:'Tetteh Quarshie',referenceDate:'2025-12-15',radius,estimatedDimensions:true};return {group,update};
}
