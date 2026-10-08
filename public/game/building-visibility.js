// Feature state changes the solid shell's height without rebuilding map tiles.
// All selected parts must be ready before replacing a building. Map mode restores it.
export function createBuildingVisibility(map){
 let hidden=new Set();
 return function sync(items,enabled,pending=[]){
  const waiting=new Set(pending.map(item=>item.sourceId));
  const next=new Set(enabled?items.map(item=>item.sourceId).filter(id=>id!==undefined&&id!==null&&!waiting.has(id)):[]);
  const set=(id,detailed)=>map.setFeatureState({source:'accralife-streets',sourceLayer:'building',id},{detailed});
  for(const id of hidden)if(!next.has(id))set(id,false);
  for(const id of next)if(!hidden.has(id))set(id,true);
  hidden=next;
 };
}
