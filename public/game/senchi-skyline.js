import * as T from './three.module.js';
import {createAirportBound} from './airport-bound.js';
import {SKY_BUILDINGS,SKY_WALKS,SKY_WALK_PIECES,SKY_WALLS,SKY_TREES,SKY_CANOPY,skyLocal,skyRoadClear} from './senchi-skyline-data.js';
import {mahamaStrip} from './mahama-bypass-data.js';
import {offsetMetres} from './motion.js';
// Original meshes/materials. Photographs and map screenshots are viewing evidence,
// never runtime textures. Native ground plates remain distinct from upper details.
export function createSenchiSkyline(site){
 const result=createAirportBound(site,{masses:SKY_BUILDINGS.map(b=>({...b,rings:b.renderRings??b.rings})),wallPalette:['#d1c5ad','#c4bba5','#bdb39b','#d2d0bf'],renderMass(b,rings,k,h){
  if(!['mirage','kass','sunshine-clinic','sunshine-lodge'].includes(b.family))return false;
  const {mesh,box,beam}=k,{material,plate,surface,faces}=h;
  const ps=rings[0].slice(0,-1),xs=ps.map(p=>p[0]),zs=ps.map(p=>p[1]),x0=Math.min(...xs),x1=Math.max(...xs),z0=Math.min(...zs),z1=Math.max(...zs),cx=(x0+x1)/2,cz=(z0+z1)/2;
  const cream=material('#deddd0','stone'),white=material('#e4e4d9','plaster'),grey=material('#797b76','plaster'),dark=material('#353b3a','paint'),iron=material('#8b9692','metal'),glass=material('#557986','glass'),timber=material('#89694e','wood'),leaf=material('#516c42','foliage');
  const shrink=(sx,sz)=>rings.map(r=>r.map(p=>[cx+(p[0]-cx)*sx,cz+(p[1]-cz)*sz]));
  const rect=(a,c,d,e)=>[[[a,d],[c,d],[c,e],[a,e],[a,d]]];
  if(b.family.startsWith('sunshine')){const color=material(b.wallColor,'plaster');plate(rings,color,b.wallHeight);h.roof(b,rings,material(b.roofColor,'roof-metal'));faces(rings,f=>{for(let u=-f.len/2+1.5;u<f.len/2;u+=3.5){f.part(dark,1.25,1.3,.1,u,1.65,.1);f.part(glass,1.05,1.1,.1,u,1.65,.18);}if(b.family==='sunshine-clinic')f.part(material('#b55647','paint'),f.len,.25,.16,0,b.wallHeight-.15,.1);});return true;}
  if(b.family==='mirage'){
   plate(shrink(.80,.98),grey,b.wallHeight);plate(rings,dark,3.1);const n=60,span=z1-z0;
   // The three rounded balcony lobes visible from Liberation Road are the tower's
   // defining silhouette. Each pale ribbon, rail and recessed opening follows it.
   const front=(t,inset=0)=>[x1+.9+1.55*Math.sin(t*Math.PI*6-Math.PI/2)-inset,z0+span*t];
   const band=()=>{const r=Array.from({length:n+1},(_,i)=>front(i/n));r.push(...Array.from({length:n+1},(_,i)=>front(1-i/n,3.7)));r.push(r[0]);return [r];};
   const curveRail=(y,out=0)=>{const positions=[],uv=[],width=.035;for(let i=1;i<=n;i++){const a=front((i-1)/n,out),c=front(i/n,out);positions.push(a[0],y,a[1],c[0],y,c[1],c[0],y+width,c[1],a[0],y,a[1],c[0],y+width,c[1],a[0],y+width,a[1]);uv.push(0,0,1,0,1,1,0,0,1,1,0,1);}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.computeVertexNormals();mesh(g,iron);};
   for(let floor=0;floor<18;floor++){
    const y=.35+floor*3.1;plate(band(),white,.21,y);curveRail(y+1.1,.1);curveRail(y+.25,.1);
    for(let j=0;j<=30;j++){const p=front(j/30,.1);beam(iron,[p[0],y+.22,p[1]],[p[0],y+1.1,p[1]],.014);}
    for(let j=0;j<15;j++){const a=front(j/15,2.35),c=front((j+1)/15,2.35),ma=j%5===2?grey:j%5===3?timber:glass;surface([[[a[0],y+.25,a[1]],[c[0],y+.25,c[1]],[c[0],y+2.9,c[1]]],[[a[0],y+.25,a[1]],[c[0],y+2.9,c[1]],[a[0],y+2.9,a[1]]]],ma);if(ma===timber){for(let dy=.5;dy<2.9;dy+=.23)beam(timber,[a[0]+.08,y+dy,a[1]],[c[0]+.08,y+dy,c[1]],.025);}else {beam(white,[a[0]+.04,y+.25,a[1]],[a[0]+.04,y+2.9,a[1]],.035);for(const dy of [.3,2.8])beam(white,[a[0]+.04,y+dy,a[1]],[c[0]+.04,y+dy,c[1]],.035);}}
   }
   plate(band(),white,.28,b.wallHeight);curveRail(b.wallHeight+1.0,.1);
   // North/west elevations are less documented; restrained recessed openings.
   faces(shrink(.80,.98),f=>{if(f.at(0,0)[0]>x1-2)return;for(let floor=0;floor<18;floor++)for(let u=-f.len/2+2;u<f.len/2;u+=4){f.part(dark,1.65,2.05,.08,u,1.6+floor*3.1,.08);f.part(glass,1.45,1.85,.06,u,1.6+floor*3.1,.15);}});
   k.sign('MIRAGE RESIDENCE',13,x1+.2,3.0,cz,Math.PI/2);return true;
  }
  // KASS: the older extract is a single compound plate. The tall glass spines,
  // recessed centre and two deep pale balcony wings are authored inside it.
  const front=x1-.7,body=shrink(.88,.96),upper=6.0,levels=14,step=3.15;
  plate(rings,glass,6);plate(body,grey,b.wallHeight-upper,upper);
  const terrace=()=>{const a=[[x0+.5,z0+1],[front,z0+1]];for(let i=1;i<=6;i++)a.push([front+(i%2?3.0:.5),z0+1+(z1-z0-2)*i/6]);a.push([x0+.5,z1-1],[x0+.5,z0+1]);return [a];};
  for(const y of [2.9,6.0]){const rr=terrace();plate(rr,cream,.38,y);faces(rr,f=>{if(f.at(0,0)[0]<front-2)return;f.part(cream,f.len,.65,.18,0,y+.52,.06);f.part(dark,f.len,.08,.12,0,y+.87,.13);});for(let j=0;j<9;j++){const z=z0+3+(z1-z0-6)*j/8;if(j%3===1)continue;const o=mesh(new T.IcosahedronGeometry(1,1),leaf,front+.8,y+1.0,z);o.scale.set(.65,.5,1.35);}}
  for(let floor=0;floor<levels;floor++){
   const y=upper+floor*step;
   for(const [lo,hi] of [[z0+1,cz-8],[cz+8,z1-1]]){
    const rr=rect(front-3,front+1.9,lo,hi);plate(rr,cream,.22,y);box(cream,.18,.52,hi-lo,front+1.85,y+.43,(lo+hi)/2);box(dark,.10,.065,hi-lo,front+1.94,y+.76,(lo+hi)/2);
    for(let z=lo+1.5;z<hi;z+=3.9){box(glass,.12,2.5,2.8,front-2.5,y+1.65,z);box(iron,.18,2.5,.045,front-2.38,y+1.65,z);}
   }
  }
  for(const z of [cz-5.5,cz+5.5]){box(material('#92a7ac','glass'),.15,b.wallHeight-6.0,5.0,front+1.2,(b.wallHeight+6)/2,z);for(let j=-2;j<=2;j++)box(iron,.08,b.wallHeight-6,.045,front+1.3,(b.wallHeight+6)/2,z+j);for(let y=6.1;y<b.wallHeight;y+=1.55)box(iron,.07,.035,5.0,front+1.3,y,z);}
  box(glass,.10,b.wallHeight-6,5.2,front-1.7,(b.wallHeight+6)/2,cz);for(let y=6;y<b.wallHeight;y+=step)box(dark,.20,.22,5.3,front-1.5,y,cz);
  faces(body,f=>{if(f.at(0,0)[0]>front-2)return;for(let floor=0;floor<levels;floor++){f.part(cream,f.len,.22,.25,0,upper+floor*step,.1);for(let u=-f.len/2+1.6;u<f.len/2;u+=3.6)f.part(glass,2.7,2.45,.1,u,upper+floor*step+1.7,.16);}});
  plate(shrink(.97,.98),cream,.28,b.wallHeight);box(dark,3,1.15,5,cx,b.wallHeight+.75,cz);
  // Entry steps/rail are exterior details of a closed private podium. The public
  // pavement remains at ground level; the stairs do not grant apartment access.
  for(let j=0;j<6;j++)box(cream,.7,.18*(j+1),6,front+5.0-j*.65,.09*(j+1),cz);
  for(const dz of [-3.1,3.1]){beam(dark,[front+5.4,.95,cz+dz],[front+1.4,2.0,cz+dz],.025);for(let j=0;j<=4;j++)beam(dark,[front+5.1-j*.8,.15+j*.22,cz+dz],[front+5.1-j*.8,.9+j*.22,cz+dz],.02);}
  for(const z of [z0+7,z1-7]){k.palm(front+3,z,4.3);box(cream,2.8,.28,4.8,front+3,.14,z);}
  k.sign('KASS TOWERS',16,front+1.4,2.1,cz,Math.PI/2);return true;
 },decorate(k,h){
  const {plate,material,local}=h,{box,mesh,beam}=k,paving=material('#a7a59a','paving'),kerb=material('#c5c4b7','stone'),soil=material('#a19379','earth'),grass=material('#818966','grass'),wood=material('#756a50','wood'),leaf=material('#526b43','foliage'),light=material('#74845b','foliage'),metal=material('#686d68','metal');
  for(const walk of SKY_WALK_PIECES.filter(w=>w.zone===site.zone)){const a=walk.a,b=walk.b;plate([mahamaStrip(a,b,walk.width).map(local)],paving,0,.045);for(const side of [-1,1]){const rr=mahamaStrip(offsetMetres(a,side*(walk.width/2+.10),0),offsetMetres(b,side*(walk.width/2+.10),0),.12);plate([rr.map(local)],kerb,.10,0);}}
  for(const w of SKY_WALLS.filter(w=>w.zone===site.zone)){const a=local(w.a),b=local(w.b),len=Math.hypot(b[0]-a[0],b[1]-a[1]),o=box(material(w.wallColor||'#d2cbb5','paint'),len,w.height,w.width,(a[0]+b[0])/2,w.height/2,(a[1]+b[1])/2);o.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);for(let j=0;j<=Math.ceil(len/6);j++){const t=j/Math.ceil(len/6);box(w.pillarColor?material(w.pillarColor,'paint'):kerb,.38,w.height+(w.railHeight||0)+.12,.38,a[0]+(b[0]-a[0])*t,(w.height+(w.railHeight||0)+.12)/2,a[1]+(b[1]-a[1])*t);}if(w.railHeight){for(const dy of [.1,w.railHeight])beam(metal,[a[0],w.height+dy,a[1]],[b[0],w.height+dy,b[1]],.022);for(let d=0;d<len;d+=.25){const t=d/len;beam(metal,[a[0]+(b[0]-a[0])*t,w.height,a[1]+(b[1]-a[1])*t],[a[0]+(b[0]-a[0])*t,w.height+w.railHeight,a[1]+(b[1]-a[1])*t],.014);}}}
  for(const [i,t] of SKY_TREES.entries()){if(t.zone!==site.zone)continue;const [x,z]=local(t.position);const patch=mesh(new T.CircleGeometry(t.radius*.9,12),soil,x,.027,z);patch.rotation.x=-Math.PI/2;patch.scale.y=.65;mesh(new T.CylinderGeometry(.22,.36,t.height*.8,8),wood,x,t.height*.4,z);for(let j=0;j<5;j++){const a=i+j*2.4,o=mesh(new T.IcosahedronGeometry(1,1),j%2?leaf:light,x+Math.cos(a)*t.radius*.5,t.height-.5+(j%3)*.8,z+Math.sin(a)*t.radius*.5);o.scale.set(t.radius*.8,t.radius*.6,t.radius);o.rotation.set(j*.2,i*.7,j*.4);}}
  if(site.zone===SKY_CANOPY.zone){
   const rr=SKY_CANOPY.rings[0].map(local),x0=rr[0][0],x1=rr[1][0],z0=rr[0][1],z1=rr[2][1],roof=material('#929487','metal');
   const at=(x,t)=>[x,2.95+.45*Math.sin(t*Math.PI),z0+(z1-z0)*t];const tris=[];for(let j=0;j<16;j++){const a=at(x0,j/16),b=at(x1,j/16),c=at(x1,(j+1)/16),d=at(x0,(j+1)/16);tris.push([a,b,c],[a,c,d]);beam(metal,a,b,.025);}h.surface(tris,roof);
   for(const x of [x0,x1])for(let j=0;j<=4;j++){const p=at(x,j/4);beam(metal,[p[0],0,p[2]],p,.065);if(j)beam(metal,at(x,(j-1)/4),p,.035);}
   for(const lat of [5.61097,5.61112]){const [x,z]=local([-.17730,lat]);k.palm(x,z,2.8);}
   if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=1280;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle='#e9e7da';ctx.fillRect(0,0,1280,256);ctx.fillStyle='#8e3b35';ctx.font='bold 74px sans-serif';ctx.textAlign='center';ctx.fillText('SUNSHINE HEALTHCARE',640,108,1240);ctx.fillStyle='#454e48';ctx.font='34px sans-serif';ctx.fillText('SENCHI STREET',640,188);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;const p=local([-.177342,5.61097]),o=mesh(new T.PlaneGeometry(8.5,1.7),new T.MeshStandardMaterial({map,roughness:.8,side:T.DoubleSide}),p[0],2.75,p[1]);o.rotation.y=-Math.PI/2;}
  }
  if(site.zone==='mirage'){
   // Observed verge between the native footpath and cream boundary. Manual edge
   // estimates stay off the road and are not new native land-use claims.
   const r=[[-.17652,5.61214],[-.17638,5.61214],[-.17635,5.61248],[-.17652,5.61248],[-.17652,5.61214]];plate([r.map(local)],grass,0,.019);
  }
  // Short covered drainage slabs at the Senchi kerb; these are estimates, with
  // no open collision pits or barriers across a mapped driveway.
  if(site.zone==='kass'){for(const lat of [5.61073,5.61092,5.61118]){const p=SKY_WALKS.find(w=>w.zone==='kass'&&w.id.endsWith('--1'))?.line.reduce((a,b)=>Math.abs(b[1]-lat)<Math.abs(a[1]-lat)?b:a);if(!p||!skyRoadClear(p,.2))continue;const [x,z]=local(p);box(metal,.4,.04,1.0,x,.065,z);for(let j=0;j<6;j++)box(kerb,.40,.012,.025,x,.09,z-.45+j*.18);}}
 }});
 result.group.userData.senchiSkyline={site:site.id,sourceIds:site.sourceIds,estimatedDimensions:true,privateInteriors:false};return result;
}
