import * as T from './three.module.js';
import {areaLocal} from './mahama-neighbourhood-data.js';
import {FINANCE_BOUNDARIES,FINANCE_PAVING,FINANCE_TREES,FINANCE_PARKING,FINANCE_GATES,FINANCE_CANOPY} from './finance-frontage-data.js';

export function renderFinanceMass(b,rings,k,h,detail='near'){
 const medium=detail==='medium';
 if(!['finance','finance-annex','finance-link','commission-front','commission-rear'].includes(b.family))return false;
 const {plate,faces,material,surface}=h,{box,beam}=k;
 const white=material('#dad8ca','paint'),recess=material('#435256','glass'),rail=material('#8e9691','metal'),ochre=material('#d89843','paint'),brown=material('#62534d','paint');
 plate(rings,white,b.wallHeight);if(medium)plate(rings,material('#8a8980','roof-metal'),0,b.wallHeight+.1);else h.roof(b,rings,material('#8a8980','roof-metal'));
 // Flat recessed glazing keeps detail below the cost of thousands of box
 // windows. Structural fins, balcony slabs and screens retain actual depth.
 function quad(f,ma,x,y,w,ht,out=.035){const p=(u,v)=>f.at(u,v,out);surface([[p(x-w/2,y-ht/2),p(x+w/2,y-ht/2),p(x-w/2,y+ht/2)],[p(x+w/2,y-ht/2),p(x+w/2,y+ht/2),p(x-w/2,y+ht/2)]],ma);}
 function ribbon(f,ma,a,B,width=.07,out=.18){const dx=B[0]-a[0],dy=B[1]-a[1],len=Math.hypot(dx,dy),nx=-dy/len*width/2,ny=dx/len*width/2,p=(x,y)=>f.at(x,y,out);surface([[p(a[0]+nx,a[1]+ny),p(B[0]+nx,B[1]+ny),p(a[0]-nx,a[1]-ny)],[p(B[0]+nx,B[1]+ny),p(B[0]-nx,B[1]-ny),p(a[0]-nx,a[1]-ny)]],ma);}
 function screen(f,x,width,lo,hi){
  quad(f,recess,x,(lo+hi)/2,width,hi-lo,.045);
  const cols=Math.max(1,Math.round(width/(medium?3:.95))),rows=Math.max(1,Math.round((hi-lo)/(medium?3:1.1))),cw=width/cols,ch=(hi-lo)/rows;
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const u=x-width/2+(i+.5)*cw,y=lo+(j+.5)*ch,points=[[u-cw*.43,y],[u,y-ch*.43],[u+cw*.43,y],[u,y+ch*.43],[u-cw*.43,y]];for(let v=1;v<points.length;v++)ribbon(f,white,points[v-1],points[v],.085);if(!medium)ribbon(f,white,[u-cw*.35,y-ch*.35],[u+cw*.35,y+ch*.35],.045);if(!medium)ribbon(f,white,[u-cw*.35,y+ch*.35],[u+cw*.35,y-ch*.35],.045);}
 }
 faces(rings,f=>{
  const p=f.at(0,0,0),out=f.at(0,0,1),south=out[2]-p[2]>.65,north=out[2]-p[2]<-.65;
  const frontZ=Math.max(...rings[0].map(p=>p[1]))-10,screenPanel=b.family==='finance'&&south&&p[2]>frontZ&&f.len<19&&f.len>6;
  const floors=b.family==='commission-front'||b.family==='commission-rear'?7:b.family==='finance-link'?4:5;
  const step=b.wallHeight/floors,bays=Math.max(1,Math.floor(f.len/(medium?7:3.4)));
  for(let floor=0;!screenPanel&&floor<floors;floor++){
   const y=.9+floor*step;
   if(medium)quad(f,recess,0,y+step*.35,Math.max(.5,f.len-.5),step*.61);else for(let j=0;j<bays;j++){const u=(j+.5)*f.len/bays-f.len/2;quad(f,recess,u,y+step*.35,f.len/bays-.35,step*.61);for(const dx of [-.55,.55])f.part(white,.045,step*.61,.07,u+dx,y+step*.35,.09);}
   if(medium)quad(f,white,0,(floor+1)*step-.18,f.len,.22,.1);else f.part(white,f.len,.22,.45,0,(floor+1)*step-.18,.2);
  }
  if(b.family==='finance'){
   // South facade: official 2021 photograph shows a pale fretwork end and
   // angular ochre / brown cladding replacing the earlier plain end screen.
   if(south&&p[2]>frontZ){
    if(f.len<19&&f.len>6){
     const east=p[0]>(Math.min(...rings[0].map(p=>p[0]))+Math.max(...rings[0].map(p=>p[0])))/2;
     if(east){quad(f,brown,0,11.4,f.len,16.8,.16);const W=f.len/2,lo=3,hi=19.8,P=(x,y)=>f.at(x,y,.19);surface([[P(-W,lo),P(-W*.45,lo),P(W,hi)],[P(-W,lo),P(W,hi),P(W*.45,hi)]],ochre);surface([[P(-W,hi),P(-W*.5,hi),P(W,lo)],[P(-W,hi),P(W,lo),P(W*.5,lo)]],white);}
     else screen(f,0,f.len-.3,3,19.75);
    }else if(f.len>25){
     for(let row=1;row<5;row++){const y=row*step-.35;if(medium)quad(f,rail,0,y,f.len,.65,.15);else f.part(rail,f.len,.65,.12,0,y,.40);for(let j=0;!medium&&j<=bays;j++)f.part(white,.18,step,.42,j*f.len/bays-f.len/2,y+step/2,.25);}
    }
   }
  }else if(b.family==='finance-annex'){
   for(let j=0;j<=bays;j++){const u=j*f.len/bays-f.len/2;if(medium)quad(f,white,u,b.wallHeight/2,.28,b.wallHeight,.15);else f.part(white,.28,b.wallHeight,.65,u,b.wallHeight/2,.30);}
   if(f.len<20)for(let floor=0;floor<5;floor++)quad(f,white,0,(floor+.5)*step,f.len*.25,step*.7,.18);
  }else if(b.family.startsWith('commission')){
   for(let j=0;j<=bays;j++){const u=j*f.len/bays-f.len/2;if(medium)quad(f,white,u,(b.wallHeight+.4)/2,.27,b.wallHeight+.4,.15);else f.part(white,.27,b.wallHeight+.4,.58,u,(b.wallHeight+.4)/2,.26);}
   if(north&&f.len>30&&b.family==='commission-front'){
    // Folded entrance canopies visible from Finance Drive; no fictional room.
    for(const u of [-8,0,8]){const points=[f.at(u-4,3.4,.4),f.at(u,4.65,5),f.at(u+4,3.4,.4)];surface([[points[0],points[1],points[2]]],white);beam(white,f.at(u,0,4.8),f.at(u,4.65,4.8),.2);}
   }
  }
 });
 return true;
}

export function decorateFinanceFrontage(site,k,h,detail='near'){
 const medium=detail==='medium';
 if(medium||!['finance','commission'].includes(site.zone))return;
 const local=p=>areaLocal(site,p),{box,beam,mesh}=k,{material,surface}=h;
 const pale=material('#d0ccba','paint'),metal=material('#7d827b','metal'),ground=material('#aaa596','paving'),grass=material('#777f59','grass'),mark=material('#e0d9bd','paint');
 const line=(a,b,width,height,y,ma)=>{const A=local(a),B=local(b),o=box(ma,width,height,Math.hypot(B[0]-A[0],B[1]-A[1]),(A[0]+B[0])/2,y,(A[1]+B[1])/2);o.rotation.y=Math.atan2(B[0]-A[0],B[1]-A[1]);};
 const wire=(ma,a,b,w)=>{for(const axis of [0,2]){const A=a.slice(),B=b.slice(),C=a.slice(),D=b.slice();A[axis]-=w/2;B[axis]-=w/2;C[axis]+=w/2;D[axis]+=w/2;surface([[A,B,C],[B,D,C]],ma);}};
 for(const s of FINANCE_BOUNDARIES.filter(s=>s.zone===site.zone)){
  line(s.a,s.b,.3,.62,.31,pale);line(s.a,s.b,.34,.09,s.height,pale);
  const A=local(s.a),B=local(s.b),len=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.ceil(len/.45);
  for(let i=0;!medium&&i<=n;i++){const x=A[0]+(B[0]-A[0])*i/n,z=A[1]+(B[1]-A[1])*i/n;wire(s.kind==='screen'?pale:metal,[x,.62,z],[x,s.height,z],s.kind==='screen'?.055:.022);if(s.kind==='screen'&&i<n){const X=A[0]+(B[0]-A[0])*(i+1)/n,Z=A[1]+(B[1]-A[1])*(i+1)/n;wire(pale,[x,.7,z],[X,s.height-.1,Z],.04);}}
 }
 for(const s of FINANCE_PAVING.filter(s=>s.zone===site.zone)){line(s.a,s.b,s.width,.025,.061,ground);line(s.a,s.b,.12,.025,.08,pale);}
 for(const g of FINANCE_GATES.filter(s=>s.zone===site.zone)){const [x,z]=local(g.position);for(const dx of [-g.width/2-.35,g.width/2+.35]){box(pale,.6,2,.6,x+dx,1,z);box(pale,.8,.15,.8,x+dx,2.04,z);}/* Gate leaves are folded alongside the posts; the seven metre gap stays open. */}
 for(const t of FINANCE_TREES.filter(s=>!medium&&s.zone===site.zone)){const [x,z]=local(t.position);box(grass,3,.03,2.8,x,.055,z);if(t.palm)k.palm(x,z,t.height);else{mesh(new T.CylinderGeometry(.12,.22,t.height,6),k.m.wood,x,t.height/2,z);const crown=mesh(new T.IcosahedronGeometry(1,1),material('#63714d','foliage'),x,t.height,z);crown.scale.set(3,2.1,2.8);}}
 for(const s of FINANCE_PARKING.filter(s=>!medium&&s.zone===site.zone)){const A=local(s.a),B=local(s.b),len=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.floor(len/2.8),nx=-(B[1]-A[1])/len,nz=(B[0]-A[0])/len;for(let i=0;i<=n;i++){const x=A[0]+(B[0]-A[0])*i/n,z=A[1]+(B[1]-A[1])*i/n;beam(mark,[x-nx*s.width/2,.075,z-nz*s.width/2],[x+nx*s.width/2,.075,z+nz*s.width/2],.035);}}
 if(site.zone==='finance'){
  // The gated reception canopy from the official 2021 image is on the east
  // end of the south frontage. Its dated use is explained by the visit guide.
  const [x,z]=local(FINANCE_CANOPY.position);box(metal,FINANCE_CANOPY.width,.22,FINANCE_CANOPY.depth,x,FINANCE_CANOPY.height,z);for(const dx of [-3,3])box(metal,.16,3.15,.16,x+dx,1.575,z+1.9);
 }
}
