// A lightweight moving-actor overlay on the same Mapbox map and simulation.
export function createOverheadView({state}){
 const canvas=document.createElement('canvas');canvas.className='overhead-actors';canvas.setAttribute('aria-label','Live overhead view of players, pedestrians and vehicles');canvas.setAttribute('role','img');document.body.append(canvas);const ctx=canvas.getContext('2d');let width=0,height=0,lastLabel='';
 function drawActor(person,t,self=false){
  if(!person.position?.every(Number.isFinite))return;const point=state.map.project(person.position),x=point.x,y=point.y;if(x<-40||y<-40||x>width+40||y>height+40)return;
  ctx.save();ctx.translate(x,y);if(self){ctx.beginPath();ctx.arc(0,0,person.driving?18:14,0,Math.PI*2);ctx.fillStyle='#ffffffcf';ctx.fill();ctx.strokeStyle='#168fbe';ctx.lineWidth=2;ctx.stroke()}
  ctx.rotate(((person.heading||0)-state.map.getBearing())*Math.PI/180);
  if(person.driving){const bus=person.vehicle==='bus',w=bus?11:9,h=bus?23:16;ctx.fillStyle=person.vehicle==='taxi'||bus?'#e3ad3e':self?'#147ca6':'#38575c';ctx.strokeStyle='#12282d';ctx.lineWidth=1;ctx.fillRect(-w/2,-h/2,w,h);ctx.strokeRect(-w/2,-h/2,w,h);ctx.fillStyle='#c9e7ee';ctx.fillRect(-w/2+1,-h/2+3,w-2,4);ctx.fillStyle='#f8efc8';ctx.fillRect(-w/2,-h/2,2,2);ctx.fillRect(w/2-2,-h/2,2,2)}
  else{const running=person.running,phase=person.moving?Math.sin(t*(running?15:9))*3:0;ctx.lineWidth=3;ctx.strokeStyle='#243e46';ctx.beginPath();ctx.moveTo(-3,1);ctx.lineTo(-3,5+phase);ctx.moveTo(3,1);ctx.lineTo(3,5-phase);ctx.stroke();ctx.fillStyle=self?'#168ba9':'#bc795d';ctx.beginPath();ctx.ellipse(0,0,5,4,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#845334';ctx.beginPath();ctx.arc(0,-3,3,0,Math.PI*2);ctx.fill()}
  ctx.restore();if(self){const label=person.driving?'You · driving':person.moving?(person.running?'You · running':'You · walking'):'You';ctx.font='700 11px sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#fff';ctx.strokeText(label,x,y+29);ctx.fillStyle='#123945';ctx.fillText(label,x,y+29);if(label!==lastLabel){lastLabel=label;canvas.setAttribute('aria-label',`2D gameplay. ${label}. Pedestrians and traffic are moving in the same city.`)}}
 }
 function update(now){if(!state.roam||state.view!=='2d'||!state.position)return;if(width!==innerWidth||height!==innerHeight){width=innerWidth;height=innerHeight;const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);ctx.setTransform(ratio,0,0,ratio,0,0)}ctx.clearRect(0,0,width,height);const t=now/1000;
  for(const npc of state.cityLife?.actors||[])drawActor(npc,t);
  for(const player of state.players){if(player.id!==state.self?.id)drawActor({position:[player.lng,player.lat],heading:player.heading,driving:player.driving,vehicle:player.vehicle,moving:true},t)}
  if(state.carPosition&&state.mode==='walk'&&state.self?.life?.vehicles?.includes(state.self.life.vehicle))drawActor({position:state.carPosition,heading:state.carHeading,driving:true,vehicle:state.self.life.vehicle},t);
  drawActor({position:state.position,heading:state.heading,driving:['drive','transit','flight'].includes(state.mode),vehicle:state.mode==='transit'?'bus':state.self?.life?.vehicle,moving:state.movementSpeed>.08,running:state.running||state.keys.has('ShiftLeft')||state.keys.has('ShiftRight')},t,true);
 }
 return {update};
}
