import * as T from './three.module.js';
import {addSouthFrontage} from './residential-south-frontages.js';
import {tagSurface} from './graphics-materials.js';
import {RESIDENTIAL_MASSES,RESIDENTIAL_RINGS,RESIDENTIAL_GATES,residentialLocal} from './airport-residential-data.js';

// July 2024 Street View forms on native outlines. Dimensions and concealed sides
// are estimates; no private owner, tenant, room or access rights are inferred.
export function addResidentialFrontages(group,k){
 const {box,mesh,poly,beam,m}=k;
 const mat=(color,kind='plaster')=>tagSurface(new T.MeshStandardMaterial({color,roughness:.84}),kind);
 const cream=mat('#e0d8bc'),white=mat('#eeebe0'),stone=mat('#bcb493','stone'),roof=mat('#784638','roof'),brick=mat('#a9725c','stone'),gateMetal=mat('#4b504b','metal'),glass=mat('#263b3d','glass'),shade=mat('#323c34','smooth');
 function hip(b,y,rise,overhang=.4,tile=roof){
  const x0=b.x0-overhang,x1=b.x1+overhang,z0=b.z0-overhang,z1=b.z1+overhang,cx=(x0+x1)/2,cz=(z0+z1)/2,w=x1-x0,d=z1-z0;
  const a=[x0,y,z0],c=[x1,y,z0],e=[x1,y,z1],f=[x0,y,z1];
  const r0=w>d?[x0+d*.36,y+rise,cz]:[cx,y+rise,z0+w*.36],r1=w>d?[x1-d*.36,y+rise,cz]:[cx,y+rise,z1-w*.36];
  const triangles=w>d?[[a,c,r1],[a,r1,r0],[c,e,r1],[e,f,r0],[e,r0,r1],[f,a,r0]]:[[a,c,r0],[c,e,r1],[c,r1,r0],[e,f,r1],[f,a,r0],[f,r0,r1]];
  const vertices=triangles.flat(2),uv=[];for(let i=0;i<vertices.length;i+=3)uv.push(vertices[i]*.4,vertices[i+2]*.4);const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeVertexNormals();tile.side=T.DoubleSide;mesh(geo,tile);
  beam(tile,r0,r1,.10);for(const [p,q] of [[a,r0],[c,w>d?r1:r0],[e,r1],[f,w>d?r0:r1]])beam(tile,p,q,.065);
  for(const [p,q] of [[a,c],[c,e],[e,f],[f,a]])beam(gateMetal,p,q,.055);
  // Tile courses follow the actual hip slopes instead of flat corrugations.
  for(let t=.08;t<1;t+=.095)for(const face of triangles){const apex=face[2],p=face[0].map((v,i)=>v+(apex[i]-v)*t),q=face[1].map((v,i)=>v+(apex[i]-v)*t);beam(tile,p,q,.018);}
 }
 function bounds(r){return {x0:Math.min(...r.map(p=>p[0])),x1:Math.max(...r.map(p=>p[0])),z0:Math.min(...r.map(p=>p[1])),z1:Math.max(...r.map(p=>p[1]))};}
 function cut(r,axis,value,less){const out=[],inside=p=>less?p[axis]<=value:p[axis]>=value;for(let i=1;i<r.length;i++){const a=r[i-1],b=r[i],ia=inside(a),ib=inside(b);if(ia)out.push(a);if(ia!==ib){const t=(value-a[axis])/(b[axis]-a[axis]);out.push(a.map((v,j)=>v+(b[j]-v)*t));}}return [...out,out[0]];}
 function panel(b,side,u,y,w,h,ma,offset=.035,depth=.08){return side==='east'||side==='west'?box(ma,depth,h,w,(side==='east'?b.x1+offset:b.x0-offset),y,u):box(ma,w,h,depth,u,y,(side==='south'?b.z1+offset:b.z0-offset));}
 function window(b,side,u,y,w=2.2,h=1.35){panel(b,side,u,y,w+.15,h+.15,white,.025);panel(b,side,u,y,w,h,glass,.08);panel(b,side,u,y,.045,h,gateMetal,.13);panel(b,side,u,y-h/2-.12,w+.25,.10,stone,.15,.3);}
 const records=[];
 for(const site of RESIDENTIAL_MASSES.filter(s=>s.frontage)){
  const ring=RESIDENTIAL_RINGS[site.source].map(residentialLocal),b=bounds(ring),cx=(b.x0+b.x1)/2,cz=(b.z0+b.z1)/2,w=b.x1-b.x0,d=b.z1-b.z0;
  records.push({source:site.source,form:site.frontage,referenceMonth:'2024-07',private:true});
  if(addSouthFrontage(site,ring,b,k,{mat,cream,white,stone,roof,gateMetal,glass,shade,hip,cut,window}))continue;
  if(site.frontage==='hip-home'){
   poly(ring,cream,3.3);poly(cut(ring,0,b.x1-2.2,true),cream,3.3,3.3);
   // A shaded east-facing upper veranda below a broad tiled roof.
   box(white,2.4,.18,d,b.x1-1.1,3.3,cz);box(cream,.18,.95,d,b.x1-.12,3.85,cz);
   for(const z of [b.z0+.2,cz,b.z1-.2])box(cream,.25,2.9,.25,b.x1-.18,4.8,z);
   for(const z of [cz-d*.28,cz+d*.25]){box(glass,.08,1.5,3.4,b.x1-2.13,5.05,z);box(white,.035,1.5,.05,b.x1-2.06,5.05,z);}
   for(const x of [cx-w*.25,cx+w*.22]){panel(b,'south',x,4.1,3,1.6,stone);window(b,'south',x,5.5,2.8,1.2);window(b,'north',x,5.2,3,1.3);}
   hip(b,site.height,site.roof,.8);
  }else if(site.frontage==='annex'||site.frontage==='gatehouse'){
   poly(ring,cream,site.height);hip(b,site.height,site.roof,.35);
   window(b,'east',cz,1.7,Math.min(1.4,d*.35),.85);
   if(site.frontage==='gatehouse'){
    // The visible small satellite dish belongs to the roof, not a roadside prop.
    const dish=mesh(new T.SphereGeometry(.68,14,8,0,Math.PI*2,0,Math.PI*.42),gateMetal,cx,site.height+site.roof+.35,cz);dish.rotation.z=.65;dish.rotation.x=.5;
    beam(gateMetal,[cx,site.height+.4,cz],[cx,site.height+site.roof+.45,cz],.035);
   }
  }else if(site.frontage==='modern'){
   poly(ring,white,site.height);poly(ring,white,.18,site.height);
   const towerW=Math.min(w*.37,3.8),towerD=Math.min(d*.29,3.6),tx=b.x1-towerW/2-.1,tz=b.z1-towerD/2-.1;
   box(brick,towerW,site.height+site.roof,towerD,tx,(site.height+site.roof)/2,tz);
   for(let y=.25;y<site.height+site.roof;y+=.26){box(stone,towerW+.015,.012,.025,tx,y,b.z1-.08);box(stone,.025,.012,towerD+.01,b.x1-.08,y,tz);for(let j=0;j<3;j++){const z=b.z1-.2-j*.85-(Math.round(y/.26)%2)*.4;if(z>b.z1-towerD)box(stone,.025,.24,.012,b.x1-.08,y-.13,z);}}
   for(const z of [b.z0+d*.20,b.z0+d*.56])window(b,'east',z,4.9,Math.min(2.9,d*.22),1.7);
   const z0=b.z0+.2,z1=b.z1-towerD-.2,x=b.x1+1.1;
   box(white,1.25,.20,z1-z0,b.x1+.53,3.35,(z0+z1)/2);box(white,1.5,.45,z1-z0,b.x1+.5,6.25,(z0+z1)/2);
   for(let z=z0;z<=z1;z+=1.3)beam(gateMetal,[x,3.5,z],[x,4.55,z],.022);
   for(const y of [3.7,4.1,4.5])beam(gateMetal,[x,y,z0],[x,y,z1],.024);
   box(white,w,.22,.25,cx,6.48,b.z0);box(white,.22,.4,d,b.x0,6.5,cz);
  }else if(site.frontage==='arched'){
   const clay=mat('#ac6c51'),rail=gateMetal,floor=1.05,openingW=Math.min(4.5,w*.37),outerW=openingW+1.05,front=b.z1-.25;
   // Raised veranda: recessed solid rear, real open side bays and central arch.
   poly(cut(ring,1,b.z1-2.5,true),clay,site.height-.45);poly(ring,clay,.20,floor);
   box(clay,w,.28,d,cx,site.height-.35,cz);box(clay,w,.35,.30,cx,site.height-.10,b.z0);
   for(const x of [b.x0+.2,b.x1-.2]){box(clay,.35,4.65,.35,x,3.5,front);box(clay,.28,.55,d,x,6.05,cz);}
   // Extruded spandrel has an actual arch opening, not a painted dark rectangle.
   const x0=cx-outerW/2,x1=cx+outerW/2,bottom=floor,top=6.65,spring=4.0,r=openingW/2;
   const shape=new T.Shape();shape.moveTo(x0,bottom);shape.lineTo(x0,top);shape.lineTo(x1,top);shape.lineTo(x1,bottom);shape.lineTo(cx+r,bottom);shape.lineTo(cx+r,spring);shape.absarc(cx,spring,r,0,Math.PI,false);shape.lineTo(cx-r,bottom);shape.closePath();
   const arch=mesh(new T.ExtrudeGeometry(shape,{depth:.32,bevelEnabled:false}),clay,0,0,front);
   arch.userData.frontageArch={source:site.source,openingWidth:openingW,spring,open:true};
   for(const side of [-1,1]){const start=side<0?b.x0+.25:cx+outerW/2,end=side<0?cx-outerW/2:b.x1-.25;for(const y of [floor+.4,floor+.8,floor+1.1])beam(rail,[start,y,front+.25],[end,y,front+.25],.025);for(let x=start;x<=end;x+=.8)beam(rail,[x,floor,front+.25],[x,floor+1.15,front+.25],.023);box(clay,end-start,.30,.35,(start+end)/2,5.9,front);}
   for(const x of [cx-w*.30,cx+w*.30]){box(glass,Math.min(2.6,w*.23),2,.07,x,3.5,b.z1-2.44);box(shade,.07,2,.10,x,3.5,b.z1-2.38);}
   box(glass,1.7,2.4,.08,cx,2.5,b.z1-2.43);box(gateMetal,.055,2.4,.10,cx,2.5,b.z1-2.36);
   for(const y of [1.55,1.95,2.2])beam(rail,[cx-r+.2,y,front+.25],[cx+r-.2,y,front+.25],.025);
   for(let x=cx-r+.2;x<cx+r-.2;x+=.8)beam(rail,[x,floor,front+.25],[x,2.25,front+.25],.022);
  }else if(site.frontage==='screened'){
   const fascia=mat('#667e85','metal');poly(ring,white,site.height);poly(ring,fascia,.30,site.height);const front=b.z1+.1;
   // Central patterned screen: open diamond bars in front of shaded backing.
   box(shade,Math.min(5.7,w*.40),4.8,.08,cx,3.25,front);const sw=Math.min(5.7,w*.40);
   for(let x=cx-sw/2+.2;x<cx+sw/2-.2;x+=.48)for(let y=1.15;y<5.4;y+=.60){const a=[x,y,front+.09],q=[x+.20,y+.27,front+.09],c=[x,y+.54,front+.09],e=[x-.20,y+.27,front+.09];for(const [p,q2] of [[a,q],[q,c],[c,e],[e,a]])beam(white,p,q2,.030);}
   for(const x of [b.x0+w*.16,b.x1-w*.16])for(const y of [1.6,4.8]){window(b,'south',x,y,Math.min(2.2,w*.15),1.35);for(let dx=-.7;dx<=.7;dx+=.35)box(gateMetal,.025,1.35,.045,x+dx,y,front+.2);}
   // White geometric cornice and the low red entrance canopy visible from the street.
   box(fascia,w+.65,.45,.55,cx,6.25,b.z1+.16);const canopy={x0:b.x0+.7,x1:b.x1-.6,z0:b.z1+.1,z1:b.z1+2.8};hip(canopy,2.65,.65,.12);
   for(const x of [canopy.x0+.2,canopy.x1-.2])box(white,.15,2.65,.15,x,1.325,canopy.z1-.2);
  }else if(site.frontage==='west-cream'){
   const warm=cream,brown=mat('#716052','roof');poly(ring,warm,site.height);hip(b,site.height,site.roof,.5,brown);
   // Window bays and floor courses follow native edges, including the entrance notch.
   const winding=ring.slice(1).reduce((a,p,i)=>a+ring[i][0]*p[1]-p[0]*ring[i][1],0)>0?-1:1;
   for(let i=1;i<ring.length;i++){const a=ring[i-1],p=ring[i],dx=p[0]-a[0],dz=p[1]-a[1],len=Math.hypot(dx,dz);if(len<4)continue;const wall=new T.Group();wall.position.set((a[0]+p[0])/2,0,(a[1]+p[1])/2);wall.rotation.y=-Math.atan2(dz,dx);group.add(wall);
    const part=(ma,ww,h,depth,x,y,z)=>{const o=new T.Mesh(new T.BoxGeometry(ww,h,depth),ma);o.position.set(x,y,z*winding);wall.add(o);};const n=Math.max(1,Math.floor(len/4.5));
    for(let j=0;j<n;j++)for(const y of [1.6,4.75,7.9]){const x=(j+.5)*len/n-len/2;part(white,2.8,1.55,.10,x,y,.04);part(glass,2.6,1.35,.12,x,y,.11);part(gateMetal,.055,1.35,.14,x,y,.18);part(warm,3,.13,.45,x,y+.84,.15);}
    for(const y of [3.15,6.3])part(white,len,.20,.3,0,y,.1);
   }
   // Downpipes run beside the broad facade rather than across window bays.
   for(const x of [b.x0+.35,b.x1-.35])beam(white,[x,.2,b.z1+.2],[x,site.height,b.z1+.2],.045);
  }else if(site.frontage==='veranda'){
   poly(ring,cream,3.1);poly(cut(ring,1,b.z1-1.8,true),cream,3.3,3.1);
   box(cream,w,.18,1.9,cx,3.15,b.z1-.85);box(cream,w,.7,.18,cx,3.6,b.z1-.05);
   for(const x of [b.x0+.2,cx,b.x1-.2])box(cream,.24,2.75,.24,x,4.8,b.z1-.2);
   for(const x of [cx-w*.30,cx+w*.28]){box(glass,2.8,1.45,.08,x,4.85,b.z1-1.73);box(white,.06,1.45,.10,x,4.85,b.z1-1.67);}box(m.dark,.85,2.25,.09,cx-w*.40,4.25,b.z1-1.70);
   const stairX=b.x1-2.5;for(let i=0;i<12;i++){const h=3.1*(1-i/12);box(cream,1.45,h,.40,stairX,h/2,b.z1+.2+i*.4);}for(const dx of [-.8,.8])beam(cream,[stairX+dx,3.9,b.z1],[stairX+dx,.8,b.z1+4.8],.085);
   for(const side of ['east','west'])for(const z of [b.z0+d*.28,b.z0+d*.7])window(b,side,z,4.9,1.8,1.3);
   hip(b,site.height,site.roof,.6);
  }
 }
 for(const g of RESIDENTIAL_GATES){const a=residentialLocal(g.a),b=residentialLocal(g.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]),yaw=-Math.atan2(b[1]-a[1],b[0]-a[0]),ma=mat(g.color,'metal');
  const gate=new T.Group();gate.position.set((a[0]+b[0])/2,0,(a[1]+b[1])/2);gate.rotation.y=yaw;group.add(gate);
  const part=(ma,w,h,d,x,y)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),ma);o.position.set(x,y,0);gate.add(o);};
  if(!g.slatted)part(ma,len-.3,g.height,.12,0,g.height/2);else for(let y=.1;y<g.height;y+=.12)part(ma,len-.3,.065,.10,0,y);
  if(g.panels)for(let x=-len/2+.3;x<len/2-.3;x+=.9)for(let y=.2;y<g.height-.1;y+=.6)part(gateMetal,.84,.055,.16,x,y);
  for(const x of [-len/2,len/2]){part(cream,.38,g.height+.25,.45,x,(g.height+.25)/2);part(white,.43,.08,.5,x,g.height+.25);}
  part(gateMetal,.06,g.height,.18,0,g.height/2);for(const y of [.25,g.height-.2])part(gateMetal,len-.3,.07,.14,0,y);
 }
 group.userData.frontages=records;
}
