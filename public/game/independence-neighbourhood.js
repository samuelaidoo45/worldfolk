import * as T from './three.module.js';
import {createMahamaNeighbourhood} from './mahama-neighbourhood.js';
import {CIVIC_BUILDINGS,CIVIC_LAND,CIVIC_MASTS,CIVIC_SEATS,CIVIC_LAMPS,CIVIC_MONUMENTS,CIVIC_TREES,CIVIC_WALK_PIECES,civicLocal} from './independence-neighbourhood-data.js';
import {decorateCivicSpace} from './independence-public-spaces.js';
import {renderClubMass,decorateCoast} from './coastal-precinct.js';
import {renderFinanceMass,decorateFinanceFrontage} from './finance-frontages.js';

// Original geometry from the dated reference brief. No downloaded photo/map
// pixels. Native contours and courtyard holes stay authoritative.
export function createCivicNeighbourhood(site,options={}){
 const result=createMahamaNeighbourhood(site,{masses:CIVIC_BUILDINGS,baseGround:false,roofSubdivisions:1,
  renderMass(b,rings,k,h){
   if(renderFinanceMass(b,rings,k,h,options.detail)||renderClubMass(b,rings,k,h,options.detail))return true;
   const {box,mesh,beam}=k,{plate,faces,material,glass,trim,concrete,surface}=h;
   const white=material('#dbd7c9','paint'),dark=material('#303e40','glass'),ochre=material('#bb9a53','paint'),red=material('#9c4e42','paint');
   if(b.family==='stadium-bowl'){
    // Native crescent: match the open west ends and sample the inner/outer
    // contours independently instead of placing a generic oval over the plot.
    const r=rings[0],outer=r.slice(0,27),inner=r.slice(27,48).reverse();
    const sample=(ps,t)=>{let lens=[0];for(let i=1;i<ps.length;i++)lens.push(lens.at(-1)+Math.hypot(ps[i][0]-ps[i-1][0],ps[i][1]-ps[i-1][1]));const d=t*lens.at(-1);for(let i=1;i<ps.length;i++)if(d<=lens[i]){const u=(d-lens[i-1])/(lens[i]-lens[i-1]||1);return ps[i-1].map((v,k)=>v+(ps[i][k]-v)*u);}return ps.at(-1);};
    const blend=(t,u,y)=>{const a=sample(inner,t),b=sample(outer,t);return [a[0]+(b[0]-a[0])*u,y,a[1]+(b[1]-a[1])*u];};
    const rows=24,segments=64;
    for(let row=0;row<rows;row++)for(let j=0;j<segments;j++){
     const a=j/segments,B=(j+1)/segments,y=1+(row+1)*.70,u=row/rows,v=(row+1)/rows;
     const p=blend(a,u,y),q=blend(B,u,y),r=blend(a,v,y),s=blend(B,v,y);surface([[p,q,r],[q,s,r]],concrete);
     const low=blend(a,u,y-.70),lowB=blend(B,u,y-.70);surface([[low,p,q],[low,q,lowB]],white);
     if(j%8!==0){const seat=[red,ochre,white][Math.floor(j/8)%3],a0=blend(a+.001,u+.014,y+.13),b0=blend(B-.001,u+.014,y+.13),a1=blend(a+.001,v-.012,y+.13),b1=blend(B-.001,v-.012,y+.13);surface([[a0,b0,a1],[b0,b1,a1]],seat);}
    }
    // A continuous raked structural deck closes the underside of the seating;
    // isolated horizontal treads otherwise look suspended from street height.
    for(let j=0;j<segments;j++){
     const a=j/segments,B=(j+1)/segments,p=blend(a,0,.65),q=blend(B,0,.65),r=blend(a,1,17.25),s=blend(B,1,17.25);
     surface([[p,r,q],[q,r,s]],concrete);
     if(j%8!==0){const u=sample(outer,a),v=sample(outer,B);surface([[[u[0],0,u[1]],[v[0],0,v[1]],[u[0],4.2,u[1]]],[[v[0],0,v[1]],[v[0],4.2,v[1]],[u[0],4.2,u[1]]]],white);}
    }
    for(let i=0;i<outer.length-1;i++){
     const a=outer[i],B=outer[i+1];beam(white,[a[0],.2,a[1]],[a[0],18.6,a[1]],.21);beam(white,[a[0],18.8,a[1]],[B[0],18.8,B[1]],.20);
     for(const y of [4,9,14])beam(concrete,[a[0],y,a[1]],[B[0],y,B[1]],.25);
     if(i%2===0){const inside=sample(inner,i/(outer.length-1));beam(white,[a[0],2,a[1]],[inside[0],1,inside[1]],.22);}
    }
    return true;
   }
   if(b.family==='stadium-west'){
    const [a,B,C,D]=rings[0],at=(u,v,y)=>[a[0]+(D[0]-a[0])*u+(B[0]-a[0])*v,y,a[1]+(D[1]-a[1])*u+(B[1]-a[1])*v];
    for(let row=0;row<25;row++){const y=1+row*.73,u=row/25,v=(row+1)/25;surface([[at(u,0,y),at(u,1,y),at(v,0,y)],[at(u,1,y),at(v,1,y),at(v,0,y)]],concrete);surface([[at(u,0,y-.7),at(u,0,y),at(u,1,y)],[at(u,0,y-.7),at(u,1,y),at(u,1,y-.7)]],white);for(let bay=0;bay<8;bay++)surface([[at(u+.012,bay/8+.01,y+.16),at(u+.012,(bay+1)/8-.01,y+.16),at(v-.007,bay/8+.01,y+.16)],[at(u+.012,(bay+1)/8-.01,y+.16),at(v-.007,(bay+1)/8-.01,y+.16),at(v-.007,bay/8+.01,y+.16)]],[red,ochre,white][bay%3]);}
    const roofA=at(.08,0,22),roofB=at(.08,1,22),roofC=at(1,0,23.2),roofD=at(1,1,23.2);surface([[roofA,roofB,roofC],[roofB,roofD,roofC]],white);
    for(let j=0;j<=9;j++){const v=j/9,p=at(1,v,0);beam(white,p,at(1,v,23.2),.30);beam(concrete,at(1,v,20.5),at(.08,v,22),.15);}
    // Warm vertical service blades and blue media glazing on the west face.
    for(let j=0;j<7;j++){const v=(j+.5)/7,p=at(1,v,8.5),len=Math.hypot(B[0]-a[0],B[1]-a[1])/7-.7,yaw=Math.atan2(-(B[1]-a[1]),B[0]-a[0]);const panel=box(j%2?ochre:red,len,15,.20,...p);panel.rotation.y=yaw;const g=at(1.005,v,11.8),pane=box(glass,len*.65,3.7,.22,...g);pane.rotation.y=yaw;}
    return true;
   }
   if(b.family==='volta'){
    plate(rings.map(r=>r.map(([x,z])=>[x*.98,z*.98])),dark,b.wallHeight);const ps=rings[0].slice(0,-1),xs=ps.map(p=>p[0]),zs=ps.map(p=>p[1]),x=(Math.min(...xs)+Math.max(...xs))/2,z=(Math.min(...zs)+Math.max(...zs))/2,w=Math.max(...xs)-Math.min(...xs),d=Math.max(...zs)-Math.min(...zs),radius=1;
    const s=new T.Shape();s.moveTo(-w/2+radius,-d/2);s.lineTo(w/2-radius,-d/2);s.quadraticCurveTo(w/2,-d/2,w/2,-d/2+radius);s.lineTo(w/2,d/2-radius);s.quadraticCurveTo(w/2,d/2,w/2-radius,d/2);s.lineTo(-w/2+radius,d/2);s.quadraticCurveTo(-w/2,d/2,-w/2,d/2-radius);s.lineTo(-w/2,-d/2+radius);s.quadraticCurveTo(-w/2,-d/2,-w/2+radius,-d/2);
    for(let floor=0;floor<13;floor++){const geo=new T.ExtrudeGeometry(s,{depth:1.75,bevelEnabled:false,curveSegments:3});geo.rotateX(-Math.PI/2);mesh(geo,white,x,3.2+floor*3.15,z);}
    faces(rings,f=>{const n=Math.floor(f.len/2.3);for(let j=0;j<n;j++)f.part(concrete,.055,b.wallHeight-3.4,.055,(j+.5)*f.len/n-f.len/2,(b.wallHeight+3.4)/2,.035);f.part(trim,f.len,2.8,.18,0,1.4,.08);});
    box(white,7,.35,2.3,x,3,z+d/2+.9);k.sign('ELECTRO VOLTA HOUSE',16,x,3.6,z+d/2+.13);box(concrete,7,1.2,4,x,b.wallHeight+.6,z-1);
    return true;
   }
   plate(rings,b.family==='water'?material('#aca99b','paint'):material(b.wallColor),b.wallHeight);
   h.roof(b,rings,material(b.roofColor,'roof-metal'));
   const floors=b.family==='water'?4:Math.max(1,Math.floor(b.wallHeight/3.6));
   faces(rings,f=>{
    const n=Math.max(1,Math.floor(f.len/(b.family==='water'?2.8:4.2)));
    for(let row=0;row<floors;row++)for(let j=0;j<n;j++){const u=(j+.5)*f.len/n-f.len/2,y=1.9+row*(b.wallHeight/floors);if(b.family==='mapped-context'){const pane=(ma,w,ht,out)=>{const p=(x,Y)=>f.at(x,Y,out);surface([[p(u-w/2,y-ht/2),p(u+w/2,y-ht/2),p(u-w/2,y+ht/2)],[p(u+w/2,y-ht/2),p(u+w/2,y+ht/2),p(u-w/2,y+ht/2)]],ma);};pane(trim,1.45,1.55,.07);pane(glass,1.2,1.32,.08);}else{f.part(trim,1.65,1.55,.10,u,y,.07);f.part(glass,1.40,1.32,.05,u,y,.14);}if(b.family==='water')f.part(trim,.055,1.4,.08,u,y,.18);}
    if(b.family==='water'||b.family==='finance')for(let row=1;row<=floors;row++)f.part(trim,f.len,.2,.22,0,row*b.wallHeight/floors-.15,.1);
    if(b.family==='water')for(let j=0;j<=n;j++)f.part(white,.20,b.wallHeight,.22,j*f.len/n-f.len/2,b.wallHeight/2,.1);
   });
   return true;
  },
  decorate(k,h){
   decorateCivicSpace(site,k,h);
   decorateFinanceFrontage(site,k,h,options.detail);
   decorateCoast(site,k,h,options.detail);
   const {mesh,box,beam}=k,{material,surface}=h;
   const local=p=>civicLocal(site,p),white=material('#d9d3bf','stone'),paving=material('#b7aa94','paving'),bronze=material('#8d6849','metal'),dark=material('#42423c','stone');
   const ellipse=(ma,x,y,z,sx,sy,sz)=>{const o=mesh(new T.SphereGeometry(1,12,8),ma,x,y,z);o.scale.set(sx,sy,sz);return o;};
   if(site.zone==='stadium'){
    const pitch=CIVIC_LAND.find(f=>f.id===339732280).geometry.coordinates[0].map(local),grass=material('#54734a','grass');k.poly(pitch,grass,0,.06);
    const [a,B,C,D]=pitch,at=(u,v)=>[a[0]+(B[0]-a[0])*u+(D[0]-a[0])*v,.075,a[1]+(B[1]-a[1])*u+(D[1]-a[1])*v];
    for(const [u,v,U,V] of [[.02,.03,.98,.03],[.02,.97,.98,.97],[.02,.03,.02,.97],[.98,.03,.98,.97],[.5,.03,.5,.97]])beam(white,at(u,v),at(U,V),.045);
    const c=at(.5,.5),circle=mesh(new T.TorusGeometry(9.15,.045,4,48),white,...c);circle.rotation.x=Math.PI/2;
    for(const u of [.02,.98]){const p=at(u,.5),angle=-Math.atan2(D[1]-a[1],D[0]-a[0]),goal=new T.Group();goal.position.set(...p);goal.rotation.y=angle;const add=(ma,w,h,d,x,y,z)=>{const m=new T.Mesh(new T.BoxGeometry(w,h,d),ma);m.position.set(x,y,z);goal.add(m);};for(const x of [-3.66,3.66])add(white,.09,2.44,.09,x,1.22,0);add(white,7.4,.09,.09,0,2.44,0);for(let x=-3.5;x<=3.6;x+=.25)add(white,.012,2.44,.012,x,1.22,u<.5?1.5:-1.5);resultGroupAdd(goal);}
    // Four luminous floodlight banks without four extra shadow-map passes.
    for(const p of CIVIC_MASTS){const [x,z]=local(p);beam(k.m.metal,[x,0,z],[x,34,z],.26);for(let j=0;j<5;j++)for(let i=0;i<3;i++)box(k.m.white,.68,.5,.20,x+(j-2)*.86,33.5+i*.7,z);for(let y=2;y<33;y+=3){beam(k.m.metal,[x-.8,y,z],[x+.8,y+3,z],.04);beam(k.m.metal,[x+.8,y,z],[x-.8,y+3,z],.04);}}
   }
   if(site.zone==='park'){
    for(const p of CIVIC_SEATS){const [x,z]=local(p);for(let j=0;j<4;j++){box(k.m.wood,2.5,.07,.13,x,.47,z+(j-1.5)*.15);box(k.m.wood,2.5,.11,.08,x,.68+j*.13,z+.32);}for(const dx of [-1,1]){box(k.m.metal,.07,.45,.55,x+dx,.225,z);box(k.m.metal,.07,.62,.07,x+dx,.7,z+.28);}}
    const glow=material('#c5bd98','paint');glow.emissive.set('#f0d69c');glow.emissiveIntensity=.4;
    for(const p of CIVIC_LAMPS){const [x,z]=local(p);beam(k.m.metal,[x,0,z],[x,3.5,z],.055);mesh(new T.SphereGeometry(.23,10,6),glow,x,3.55,z);box(k.m.metal,.6,.07,.6,x,3.82,z);}
    for(const w of CIVIC_WALK_PIECES){const a=local(w.a),b=local(w.b),len=Math.hypot(a[0]-b[0],a[1]-b[1]),m=box(paving,w.width,.025,len,(a[0]+b[0])/2,.065,(a[1]+b[1])/2);m.rotation.y=Math.atan2(b[0]-a[0],b[1]-a[1]);}
    // This reconstructed layout is estimated within the native park polygon.
    for(const monument of CIVIC_MONUMENTS){const [x,z]=local(monument.position),origin=new T.Group();origin.position.set(x,0,z);origin.rotation.y=monument.rotation*Math.PI/180;const add=(geo,ma,X,y,Z)=>{const o=new T.Mesh(geo,ma);o.position.set(X,y,Z);o.castShadow=o.receiveShadow=true;origin.add(o);return o;},b=(ma,w,hh,d,X,y,Z)=>add(new T.BoxGeometry(w,hh,d),ma,X,y,Z),bust=(X,y,Z)=>{b(dark,1.15,1.9,1.1,X,y+.95,Z);const shoulders=add(new T.SphereGeometry(1,12,8),bronze,X,y+2.25,Z);shoulders.scale.set(.57,.44,.28);const head=add(new T.SphereGeometry(1,16,10),bronze,X,y+2.93,Z);head.scale.set(.26,.34,.25);b(bronze,.16,.26,.18,X,y+2.62,Z);b(bronze,.11,.10,.13,X,y+2.92,Z+.24);for(const side of [-1,1]){const ear=add(new T.SphereGeometry(.08,8,6),bronze,X+side*.26,y+2.9,Z);ear.scale.y=1.3;}};
     if(monument.id==='crossroads-memorial'){
      for(let j=0;j<3;j++)b(j%2?dark:white,14-j*.8,.18,12-j*.8,0,.09+j*.18,0);
      b(paving,14,.025,12,0,.02,0);
      const shape=new T.Shape([new T.Vector2(-1.8,0),new T.Vector2(-1.1,18),new T.Vector2(.05,18),new T.Vector2(-.12,0)]),s2=new T.Shape([new T.Vector2(.12,0),new T.Vector2(.05,15.8),new T.Vector2(1.55,16.3),new T.Vector2(1.7,0)]);
      for(const s of [shape,s2])add(new T.ExtrudeGeometry(s,{depth:.8,bevelEnabled:false}),white,0,.54,-2.6);
      for(const X of [-5,0,5]){b(white,2.4,.45,2.4,X,.78,1);bust(X,1,1);}
     }else{
      b(white,12,.2,5,0,.10,0);bust(0,.2,.3);
      for(const side of [-1,1]){const w=4,hgt=3.5,s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,2.4);s.quadraticCurveTo(0,4.7,-w/2,2.4);s.closePath();add(new T.ExtrudeGeometry(s,{depth:.3,bevelEnabled:false,curveSegments:12}),dark,side*3.7,.2,-.3);const medallion=add(new T.CircleGeometry(.28,16),k.m.gold,side*3.7,2.9,.02);medallion.castShadow=false;}
      for(const X of [-5.9,-1.4,1.4,5.9]){b(dark,.3,3.2,.5,X,1.8,-.2);b(white,.5,.2,.7,X,3.5,-.2);}
     }
     resultGroupAdd(origin);
    }
    for(const p of CIVIC_TREES){const [x,z]=local(p);if(x*x+z*z>220**2)continue;const trunk=mesh(new T.CylinderGeometry(.18,.28,6.5,7),k.m.wood,x,3.25,z);for(let j=0;j<3;j++){const crown=ellipse(material(j%2?'#526547':'#66744c','foliage'),x+(j-1)*1.6,7+j*.3,z+(j%2)*1.2,3.4,2.3,3);crown.castShadow=true;}}
   }
   function resultGroupAdd(o){ // Use a temporary mesh parent supplied by the kit.
    const anchor=mesh(new T.BufferGeometry(),white);anchor.parent.add(o);anchor.removeFromParent();anchor.geometry.dispose();
   }
  }
 });
 result.group.userData.civic={zone:site.zone,sourceIds:site.sourceIds,dimensionsEstimated:true,contextOnly:CIVIC_BUILDINGS.filter(b=>b.zone===site.zone&&b.family==='mapped-context').map(b=>b.id)};
 return result;
}
