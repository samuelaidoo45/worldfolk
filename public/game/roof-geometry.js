// Hipped metal-sheet roofs for simple four-sided footprints. Complex footprints
// retain their mapped flat outline and courtyard holes.
export function hipRoofVertices(points,rise){
 if(points.length!==4)return null;
 const turns=points.map((a,i)=>{const b=points[(i+1)%4],c=points[(i+2)%4];return (b[0]-a[0])*(c[1]-b[1])-(b[1]-a[1])*(c[0]-b[0])});
 if(!turns.every(v=>v>1e-6)&&!turns.every(v=>v< -1e-6))return null;
 let p=points.map(v=>[...v]);const length=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
 if(length(p[0],p[1])>length(p[1],p[2]))p=[p[1],p[2],p[3],p[0]];
 const a=p[0].map((v,i)=>(v+p[1][i])/2),b=p[2].map((v,i)=>(v+p[3][i])/2),mix=t=>[a[0]+(b[0]-a[0])*t,rise,a[1]+(b[1]-a[1])*t],r1=mix(.24),r2=mix(.76),v=p.map(q=>[q[0],0,q[1]]);
 return [[v[0],v[1],r1],[v[1],v[2],r2],[v[1],r2,r1],[v[2],v[3],r2],[v[3],v[0],r1],[v[3],r1,r2]].flat(2);
}
