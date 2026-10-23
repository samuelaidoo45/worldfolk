import {roadFeatures} from './road-cache.js';
import {createMiniMapGeometry,createMiniMapProjection} from './minimap-geometry.js';
// Reuse loaded vector tiles: this radar needs no second map or extra tile requests.
export function createMiniMap({state,places}){
 const root=document.createElement('section');root.className='game-minimap';root.setAttribute('aria-label','Mini-map');
 root.innerHTML='<div id="minimap-content"><button class="minimap-open" type="button" aria-label="Open full city map"><canvas width="440" height="440" role="img" aria-label="Nearby roads, places and your selected route"></canvas></button><button class="minimap-places" type="button" aria-label="Choose destination"><span class="minimap-caption">Choose destination</span></button></div><button class="minimap-toggle" type="button" aria-controls="minimap-content"></button>';
 document.body.append(root);const button=root.querySelector('.minimap-toggle'),content=root.querySelector('#minimap-content'),canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),caption=root.querySelector('.minimap-caption');let enabled=true,last=0,geometry={polygons:[],segments:[]},lastTiles=-Infinity;
 try{enabled=localStorage.getItem('worldfolk-minimap')!=='off'}catch{}
 function toggle(value){enabled=value;content.hidden=!value;button.textContent=value?'−':'⌖';button.setAttribute('aria-label',value?'Hide mini-map':'Show mini-map');button.title=value?'Hide mini-map':'Show mini-map';button.setAttribute('aria-expanded',String(value));root.classList.toggle('collapsed',!value);document.body.classList.toggle('minimap-enabled',value);try{localStorage.setItem('worldfolk-minimap',value?'on':'off')}catch{}last=0}
 button.onclick=()=>toggle(!enabled);root.querySelector('.minimap-places').onclick=()=>state.navigation?.toggle(true);root.querySelector('.minimap-open').onclick=()=>document.getElementById('roamToggle').click();toggle(enabled);
 const read=layer=>{try{return state.map.querySourceFeatures('accralife-streets',{sourceLayer:layer})}catch{return []}};
 function update(now){
  root.hidden=!state.roam||state.view==='2d'||state.mode==='indoor'||!!state.chatOpen||!!state.navigation?.isOpen||!!state.lifeUI?.isOpen;
  if(root.hidden||!enabled||!state.position||now-last<200)return;last=now;
  if(now-lastTiles>2000){lastTiles=now;geometry=createMiniMapGeometry({roads:roadFeatures(state.map),land:read('landuse'),buildings:read('building'),water:read('water')})}
  const size=440,mid=size/2,radius=210,projection=createMiniMapProjection(state.position,size),project=projection.point;
  ctx.clearRect(0,0,size,size);ctx.save();ctx.beginPath();ctx.arc(mid,mid,radius,0,Math.PI*2);ctx.clip();ctx.fillStyle='#dcded3';ctx.fillRect(0,0,size,size);
  for(const {rings,bounds,color,stroke} of geometry.polygons){if(!projection.visible(bounds))continue;ctx.beginPath();for(const ring of rings){ring.forEach((c,i)=>{const [x,y]=project(c);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.closePath()}ctx.fillStyle=color;ctx.fill('evenodd');if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=1.3;ctx.stroke()}}
  function line(coords,color,width,dash=[]){ctx.beginPath();coords.forEach((c,i)=>{const [x,y]=project(c);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([])}
  if(geometry.segments.length){ctx.lineJoin='round';ctx.lineCap='round'}
  for(const {coords,bounds,width,color} of geometry.segments){if(!projection.visible(bounds,(width+3)/2+2))continue;line(coords,'#949d94',width+3);line(coords,color,width)}
  const route=state.navigation?.coordinates;if(route?.length){line(route,'#815619',10);line(route,'#ffd16c',6)}
  const nearby=places().map(place=>({...place,xy:project([place.lng,place.lat])})).filter(q=>Math.hypot(q.xy[0]-mid,q.xy[1]-mid)<radius-36).sort((a,b)=>Math.hypot(a.xy[0]-mid,a.xy[1]-mid)-Math.hypot(b.xy[0]-mid,b.xy[1]-mid)).slice(0,8);
  ctx.font='600 23px sans-serif';const labels=[];nearby.forEach(q=>{const [x,y]=q.xy;ctx.fillStyle='#25665e';ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();if(labels.length>=3||labels.some(v=>Math.hypot(v[0]-x,v[1]-y)<78)||Math.hypot(x-mid,y-mid)<65)return;labels.push([x,y]);ctx.lineWidth=5;ctx.strokeStyle='#f5f6ee';const label=q.name.slice(0,20),tx=Math.max(20,Math.min(size-ctx.measureText(label).width-20,x+9));ctx.strokeText(label,tx,y-13);ctx.fillText(label,tx,y-13)});
  const dest=state.navigation?.destination;if(dest){const [dx,dy]=project([dest.lng,dest.lat]),distance=Math.hypot(dx-mid,dy-mid),factor=Math.min(1,(radius-25)/(distance||1)),x=mid+(dx-mid)*factor,y=mid+(dy-mid)*factor;ctx.fillStyle='#9d6416';ctx.strokeStyle='#fff5d1';ctx.font='bold 34px sans-serif';ctx.lineWidth=4;ctx.strokeText('◆',x-15,y+10);ctx.fillText('◆',x-15,y+10)}
  ctx.beginPath();ctx.arc(mid,mid,29,0,Math.PI*2);ctx.fillStyle='#ffffffdf';ctx.fill();ctx.strokeStyle='#1278bd';ctx.lineWidth=3;ctx.stroke();
  ctx.save();ctx.translate(mid,mid);ctx.rotate((state.heading||0)*Math.PI/180);ctx.beginPath();ctx.moveTo(0,-23);ctx.lineTo(17,18);ctx.lineTo(0,9);ctx.lineTo(-17,18);ctx.closePath();ctx.fillStyle='#1278bd';ctx.strokeStyle='white';ctx.lineWidth=4;ctx.fill();ctx.stroke();ctx.restore();ctx.font='bold 29px sans-serif';ctx.textAlign='center';ctx.lineWidth=6;ctx.strokeStyle='#fff';ctx.fillStyle='#07547f';ctx.strokeText('YOU',mid,mid+58);ctx.fillText('YOU',mid,mid+58);ctx.textAlign='start';ctx.restore();
  ctx.fillStyle='#153e35';ctx.beginPath();ctx.arc(mid,28,20,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText('N',mid,36);ctx.textAlign='start';
  const location=state.currentLocation,where=location?.label||'Your location';caption.textContent=`⌖ ${where}`;caption.title=`${location?.description||'Your current position'}${dest?` · Destination: ${dest.name}`:''}`;root.querySelector('.minimap-places').setAttribute('aria-label',`${where}. Choose destination`);root.querySelector('.minimap-open').title=`${location?.description||'You are at the blue arrow'}. Open full city map`;
  canvas.setAttribute('aria-label',`Mini-map. ${location?.description||'Your position is the blue arrow at the centre'}. Blue arrow marked YOU is your current position and facing direction. ${dest?'Destination: '+dest.name+'. ':''}Nearby: ${nearby.map(q=>q.name).join(', ')||'streets loading'}`);
 }
 return {update,toggle};
}
