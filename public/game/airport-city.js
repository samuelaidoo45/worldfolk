import * as T from './three.module.js';
import {cityRing,cityLocal,SQUARE_TOWER,SQUARE_RETAIL,SQUARE_ATRIUM,CITY_SEATS,clipCityRing} from './airport-city-data.js';
import {tagSurface,enhanceMaterials} from './graphics-materials.js';
import {batchStaticMeshes} from './render-utils.js';
export function createAirportCitySite(s){
 const group=new T.Group();group.name=s.name;
 const mat=(color,kind='stone',roughness=.8,metalness=0)=>tagSurface(new T.MeshStandardMaterial({color,roughness,metalness}),kind);
 const ivory=mat('#d3cbb7'),white=mat('#e4e3da'),dark=mat('#313c42'),glass=mat('#4e787d','glass',.2,.6),steel=mat('#848f92','metal',.4,.6),paving=mat('#9e9c92','paving'),black=mat('#212c32'),leaf=mat('#42684a','foliage'),wood=mat('#76634b','wood');glass.emissive.set('#172e32');glass.emissiveIntensity=.2;
 const checker=['#d5d7d4','#c0c5c4','#7a8286','#444d55'].map(c=>mat(c,'paint'));
 const add=(g,m,x=0,y=0,z=0,parent=group)=>{const o=new T.Mesh(g,m);o.position.set(x,y,z);o.castShadow=o.receiveShadow=true;parent.add(o);return o;};
 const box=(m,w,h,d,x,y,z,parent=group)=>add(new T.BoxGeometry(w,h,d),m,x,y,z,parent);
 const inset=(ring,scale)=>{const ps=ring.slice(0,-1),x=ps.reduce((n,p)=>n+p[0],0)/ps.length,z=ps.reduce((n,p)=>n+p[1],0)/ps.length;return ring.map(p=>[x+(p[0]-x)*scale,z+(p[1]-z)*scale]);};
 const solid=(ring,h,m,y=0,holes=[])=>{const shape=new T.Shape(ring.slice(0,-1).map(p=>new T.Vector2(p[0],-p[1])));shape.holes=holes.map(r=>new T.Path(r.slice(0,-1).map(p=>new T.Vector2(p[0],-p[1]))));const g=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false});g.rotateX(-Math.PI/2);return add(g,m,0,y,0);};
 const beam=(a,b,w=.55,d=.55,m=ivory,parent=group)=>{const aa=new T.Vector3(...a),bb=new T.Vector3(...b),delta=bb.clone().sub(aa),o=box(m,w,delta.length(),d,...aa.clone().add(bb).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());};
 const label=(text,w,h,x,y,z,rotation=0,color='#f2e9d0',bg='#233e41')=>{if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=2048;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,2048,256);ctx.fillStyle=color;ctx.textAlign='center';ctx.font='bold 130px sans-serif';ctx.fillText(text,1024,170,1970);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const o=add(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map,side:T.DoubleSide,roughness:.7}),x,y,z);o.rotation.y=rotation;};
 function faces(ring,fn){const area=ring.slice(0,-1).reduce((n,a,i)=>n+a[0]*ring[i+1][1]-ring[i+1][0]*a[1],0),sign=area>0?1:-1;for(let i=0;i<ring.length-1;i++){const a=ring[i],b=ring[i+1],len=Math.hypot(b[0]-a[0],b[1]-a[1]);if(len<2)continue;const face=new T.Group();face.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);face.rotation.y=Math.atan2((b[1]-a[1])/len*sign,-(b[0]-a[0])/len*sign);group.add(face);fn(face,len,i);}}
 const curtain=(ring,height,base=0)=>faces(ring,(face,len)=>{const n=Math.ceil(len/2.6),w=len/n;for(let j=0;j<n;j++){const x=(j+.5)*w-len/2;box(glass,w-.07,height,.08,x,base+height/2,.08,face);box(steel,.055,height,.14,x-w/2,base+height/2,.15,face);for(let y=base+2.8;y<base+height;y+=3.4)box(white,w,.12,.15,x,y,.15,face);}});
 if(s.family==='marina'){
  const ring=cityRing(s),tower=clipCityRing(ring,-6,true),podium=clipCityRing(ring,-6,false);solid(ring,8.5,dark);curtain(ring,8.2);solid(podium,2.3,white,8.5);
  faces(podium,(face,len,edge)=>{if(Math.cos(face.rotation.y)>.55||Math.sin(face.rotation.y)<-.55){box(white,len,7.8,.2,0,4,.24,face);for(let x=-len/2;x<len/2;x+=1.8)box(checker[1],.025,7.8,.21,x,4,.26,face);for(let y=1;y<8;y+=1.4)box(checker[1],len,.025,.21,0,y,.26,face);}const n=Math.ceil(len/2.4),w=len/n;for(let j=0;j<n;j++)for(let row=0;row<3;row++)box(checker[(j*3+row+edge)%4],w-.025,.74,.13,(j+.5)*w-len/2,8.9+row*.76,.16,face);});
  solid(tower,30.6,dark,8.5);curtain(tower,30.6,8.5);
  faces(tower,(face,len,edge)=>{const n=Math.ceil(len/3),w=len/n;for(let row=0;row<9;row++)for(let j=0;j<n;j++){const x=(j+.5)*w-len/2,y=8.5+row*3.4;for(let k=0;k<3;k++)box(checker[(j+row*3+k+edge)%4],w-.03,.36,.16,x,y+.2+k*.36,.22,face);box(checker[(row+j)%4],.7,2.25,.18,x-w/2+.35,y+2.1,.23,face);}box(white,len,.4,.45,0,39.3,.2,face);});
  // Entrance at the source's east-side setback; original signs avoid copying ads.
  box(dark,5,.45,8,22,3.8,13);for(const z of [9.8,16.2])box(steel,.17,3.6,.17,24,1.8,z);label('MARINA MALL',10,1,24.6,3.6,13,Math.PI/2,'#d45049','#292e33');label('MARINA MALL',22,1.7,20.5,40,-20,Math.PI/2,'#bc3b35','#e0e1dc');
  box(paving,5,.045,42,21,.025,-5);box(paving,4,.045,6,46,.025,15);
  for(const z of [-20,-12,2]){box(white,1.1,.6,1.1,23,.3,z);const o=add(new T.SphereGeometry(.8,8,6),leaf,23,1,z);o.scale.y=.65;}
 }else{
  // Native low retail arm and an atrium genuinely open through the floor stack.
  solid(SQUARE_RETAIL,5.1,dark);curtain(SQUARE_RETAIL,4.6);solid(SQUARE_RETAIL,.28,ivory,5.1);
  const core=inset(SQUARE_TOWER,.80),hole=SQUARE_ATRIUM;solid(core,36.3,dark,0,[hole]);curtain(core,35.9);curtain(hole,35.9);
  for(let f=0;f<=9;f++){const ring=inset(SQUARE_TOWER,1-f*.009);solid(ring,.26,ivory,f*4.02,[hole]);}
  faces(SQUARE_TOWER,(face,len)=>{const n=Math.max(2,Math.round(len/10)),w=len/n;for(let f=0;f<9;f++)for(let j=0;j<n;j++){const insetTop=f*.08,insetBottom=(f+1)*.08,x1=-len/2+j*w,x2=x1+w,low=f*4.02+.2,high=(f+1)*4.02-.12;beam([x1+(f%2?w/2:0),low,-insetTop],[x1+(f%2?0:w/2),high,-insetBottom],.52,.65,ivory,face);beam([x2-(f%2?w/2:0),low,-insetTop],[x2-(f%2?0:w/2),high,-insetBottom],.52,.65,ivory,face);}});
  solid(hole,.045,paving);box(paving,6,.045,29,20,.025,-27);box(paving,9,.045,25,34,.025,-23);
  for(const [x,z] of [[19,-29],[37,-15]]){box(white,2,.55,2,x,.27,z);const o=add(new T.SphereGeometry(1.1,8,6),leaf,x,1,z);o.scale.y=.55;}
  label('ONE AIRPORT SQUARE',19,1.2,17,4.7,-20,Math.PI/2);
  box(dark,1.4,.9,.24,30,.45,-33.3);label('VISITOR GUIDE',1.25,.2,30,.78,-33.16);
 }
 for(const p of CITY_SEATS[s.family]){box(wood,2.6,.13,.65,p.x,.46,p.z);box(wood,2.6,.5,.1,p.x,.8,p.z+.25);for(const dx of [-1,1])box(steel,.08,.45,.5,p.x+dx,.22,p.z);}
 group.userData.airportCity={sourceIds:s.sourceIds,privateOffices:false,fullSurvey:false};enhanceMaterials(group);batchStaticMeshes(group);return {group,update(){}};
}
