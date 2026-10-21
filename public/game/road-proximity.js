// Conservative broad phase for immutable tile/native coordinate arrays. Weak
// keys release bounds when a streamed tile and its road snapshot are discarded.
const bounds=new WeakMap();
export function lineMayBeNear(position,line,radius){
 let box=bounds.get(line);
 if(!box){
  box=[Infinity,Infinity,-Infinity,-Infinity];
  for(const p of line){box[0]=Math.min(box[0],p[0]);box[1]=Math.min(box[1],p[1]);box[2]=Math.max(box[2],p[0]);box[3]=Math.max(box[3],p[1]);}
  bounds.set(line,box);
 }
 const dy=radius/111320,dx=dy/Math.cos(position[1]*Math.PI/180);
 return box[0]<=position[0]+dx&&box[2]>=position[0]-dx&&box[1]<=position[1]+dy&&box[3]>=position[1]-dy;
}
