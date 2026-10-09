import {canUseVehicle} from './work-catalog.js';
import {playerLabel} from './player-labels.js';
import {signalPhase} from './traffic-signals.js';
// A lightweight moving-actor overlay on the same MapLibre map and simulation.
export function createOverheadView({state}){
 const canvas=document.createElement('canvas');canvas.className='overhead-actors';canvas.setAttribute('aria-label','Live overhead view of players, pedestrians and vehicles');canvas.setAttribute('role','img');document.body.append(canvas);const links=document.createElement('div');links.className='overhead-player-links';document.body.append(links);const buttons=new Map();let visibleIds=new Set();const ctx=canvas.getContext('2d');let width=0,height=0;
 function drawActor(person,t,self=false){
  if(!person.position?.every(Number.isFinite))return;const point=state.map.project(person.position),x=point.x,y=point.y;if(x<-40||y<-40||x>width+40||y>height+40)return;
  ctx.save();ctx.translate(x,y);if(self){ctx.beginPath();ctx.arc(0,0,person.driving?18:14,0,Math.PI*2);ctx.fillStyle='#ffffffcf';ctx.fill();ctx.shadowColor='#0f464955';ctx.shadowBlur=10;ctx.strokeStyle='#137a82';ctx.lineWidth=3;ctx.stroke();ctx.shadowBlur=0}
  ctx.rotate(((person.heading||0)-state.map.getBearing())*Math.PI/180);
  if(self){ctx.beginPath();ctx.moveTo(0,-27);ctx.lineTo(-6,-19);ctx.lineTo(6,-19);ctx.closePath();ctx.fillStyle='#137a82';ctx.fill()}
  const scale=self?1.15:Math.max(.65,Math.min(1.15,Math.pow(2,(state.map.getZoom()-17)*.35)));ctx.scale(scale,scale);
  if(person.driving){const bus=person.vehicle==='bus',w=bus?11:person.vehicle==='suv'?10:9,h=bus?23:person.vehicle==='van'?19:person.vehicle==='hatchback'?14:16;ctx.fillStyle=person.vehicle==='taxi'||bus?'#e3ad3e':self?'#147ca6':'#38575c';ctx.strokeStyle='#12282d';ctx.lineWidth=1;ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeRect(-w/2,-h/2,w,h);ctx.fillStyle='#c9e7ee';ctx.fillRect(-w/2+1,-h/2+3,w-2,4);ctx.fillStyle='#f8efc8';ctx.fillRect(-w/2,-h/2,2,2);ctx.fillRect(w/2-2,-h/2,2,2)}
  else{const running=person.running,phase=person.moving?Math.sin(t*(running?15:9))*3:0;ctx.lineWidth=3;ctx.strokeStyle='#243e46';ctx.beginPath();ctx.moveTo(-3,1);ctx.lineTo(-3,5+phase);ctx.moveTo(3,1);ctx.lineTo(3,5-phase);ctx.stroke();ctx.fillStyle=self?'#168ba9':'#bc795d';ctx.beginPath();ctx.ellipse(0,0,5,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#845334';ctx.beginPath();ctx.arc(0,-3,3,0,Math.PI*2);ctx.fill()}
  ctx.restore();if(self||person.identity){const p=person.identity||state.self;visibleIds.add(p.id);let button=buttons.get(p.id);if(!button){button=document.createElement('button');button.type='button';button.onpointerdown=e=>e.stopPropagation();button.onclick=e=>{e.stopPropagation();state.socialUI.show(p.id)};links.append(button);buttons.set(p.id,button)}button.textContent=playerLabel(p);button.style.transform=`translate(${x}px,${y+21}px) translateX(-50%)`;button.setAttribute('aria-label',`Open ${playerLabel(p)} profile`);return;}
 }
 function update(now){links.hidden=!state.roam||state.view!=='2d';visibleIds=new Set();if(!state.roam||state.view!=='2d'||!state.position)return;if(width!==innerWidth||height!==innerHeight){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0)}ctx.clearRect(0,0,width,height);const t=now/1000;
  for(const signal of state.scenery?.items||[]){if(signal.kind!=='signal'||state.map.getZoom()<18)continue;const p=state.map.project(signal.position);ctx.beginPath();ctx.arc(p.x,p.y,3.5,0,Math.PI*2);ctx.fillStyle={red:'#e8493c',amber:'#efb532',green:'#28a86b'}[signalPhase(signal)];ctx.fill();ctx.strokeStyle='#ffffff';ctx.lineWidth=1;ctx.stroke()}
  for(const npc of state.cityLife?.actors||[])if(npc.driving||state.map.getZoom()>=16.7)drawActor(npc,t);
  for(const player of state.players){if(player.id!==state.self?.id)drawActor({position:[player.lng,player.lat],heading:player.heading,driving:player.driving,vehicle:player.vehicle,moving:true,identity:player},t)}
  if(state.carPosition&&state.mode==='walk'&&canUseVehicle(state.self?.life))drawActor({position:state.carPosition,heading:state.carHeading,driving:true,vehicle:state.self.life.vehicle},t);
  drawActor({position:state.position,heading:state.heading,driving:['drive','transit','flight'].includes(state.mode),vehicle:state.mode==='transit'?'bus':state.self?.life?.vehicle,moving:state.movementSpeed>.08,running:state.running||state.keys.has('ShiftLeft')||state.keys.has('ShiftRight')},t,true);
  for(const [id,button] of buttons)if(!visibleIds.has(id)){button.remove();buttons.delete(id)}
 }
 return {update};
}
