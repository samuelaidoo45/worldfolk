import * as THREE from './three.module.js';
export const playerLabel=player=>player?.handle?`@${player.handle}`:`${player?.name||'Player'}`;
// Project head positions using the same matrix as the 3D renderer. Names are
// compact profile buttons that move with the players.
export function createPlayerLabels(map){
 const root=document.createElement('div');root.className='player-handles';root.setAttribute('aria-label','Nearby players');map.getContainer().append(root);const labels=new Map(),point=new THREE.Vector4();let last=0;
 map.on('remove',()=>root.remove());
 return {hide(){root.hidden=true},update(entries,matrix,now){root.hidden=false;if(now-last<32)return;last=now;const visible=new Set(),width=map.getCanvas().clientWidth,height=map.getCanvas().clientHeight;
  for(const e of entries.filter(e=>e.visible).sort((a,b)=>a.distance-b.distance).slice(0,16)){
   if(e.distance>90)continue;point.set(e.x,e.y,e.z,1).applyMatrix4(matrix);if(point.w<=0)continue;const x=point.x/point.w,y=point.y/point.w,z=point.z/point.w;if(x<-1||x>1||y<-1||y>1||z<-1||z>1)continue;
   visible.add(e.player.id);let label=labels.get(e.player.id);if(!label){label=document.createElement('button');label.type='button';label.onpointerdown=event=>event.stopPropagation();label.onclick=event=>{event.stopPropagation();window.dispatchEvent(new CustomEvent('worldfolk:player-profile',{detail:{id:e.player.id}}))};root.append(label);labels.set(e.player.id,label)}label.textContent=playerLabel(e.player);label.setAttribute('aria-label',`Open ${playerLabel(e.player)} profile`);label.className=e.self?'player-handle self':'player-handle';label.style.transform=`translate(${(x+1)*width/2}px,${(1-y)*height/2}px) translate(-50%,-100%)`;
  }
  for(const [id,label] of labels)if(!visible.has(id)){label.remove();labels.delete(id)}
 }};
}
