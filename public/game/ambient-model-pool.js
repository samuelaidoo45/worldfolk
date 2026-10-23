import {distanceMetres} from './motion.js';
import {selectAmbientDetails} from './world-streaming.js';

// Simulation owns every resident. This pool owns only their bounded visual models.
// Reconcile data without building meshes; the shared render loop pumps one model.
export function createAmbientModelPool({create,release,mobile=false,intervalMs=250}){
 const items=new Map(),identities=new Map();
 const identity=data=>JSON.stringify([!!data.driving,data.vehicle,data.avatar]);
 let selectedPosition=null,sources=new Map(),selected=new Set(),selectedAt=-Infinity,built=0,released=0;
 function remove(id,item){release(item);items.delete(id);identities.delete(id);released++;}
 return {
  items,
  sync(actors,position,now){
   sources=new Map(actors.map(data=>[data.id,data]));
   if(!selectedPosition||distanceMetres(position,selectedPosition)>30||now-selectedAt>=intervalMs){selected=selectAmbientDetails(actors,position,{mobile,previous:selected});selectedAt=now;selectedPosition=[...position];}
   for(const [id,item] of items){
    const data=sources.get(id);
    if(!data||!selected.has(id)||identities.get(id)!==identity(data))remove(id,item);
    else item.data=data;
   }
  },
  pump(){
   for(const id of selected){
    const data=sources.get(id);if(!data||items.has(id))continue;
    const item=create(data);item.data=data;items.set(id,item);identities.set(id,identity(data));built++;return item;
   }
   return null;
  },
  snapshot(){return {loaded:items.size,pending:[...selected].filter(id=>sources.has(id)&&!items.has(id)).length,built,released};},
  clear(){for(const [id,item] of items)remove(id,item);sources.clear();selected.clear();selectedAt=-Infinity;selectedPosition=null;}
 };
}
