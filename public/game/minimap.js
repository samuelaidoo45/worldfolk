// Reuses loaded street geometry; no second Mapbox instance or tile requests.
export function createMiniMap({state,places}){
 const root=document.createElement('section');root.className='game-minimap';root.setAttribute('aria-label','Mini-map');
 root.innerHTML='<button class="minimap-toggle" aria-controls="minimap-content">Mini-map</button><div id="minimap-content"><canvas width="440" height="300" role="img" aria-label="Nearby roads, places and your selected route"></canvas><div class="minimap-caption"></div><button class="minimap-places">Choose destination</button></div>';
 document.body.append(root);const button=root.querySelector('.minimap-toggle'),content=root.querySelector('#minimap-content'),canvas=root.querySelector('canvas'),ctx=canvas.getContext('2d'),caption=root.querySelector('.minimap-caption');let enabled=true,last=0,roads=[],lastRoads=0;
 try{enabled=localStorage.getItem('worldfolk-minimap')!=='off'}catch{}
 function toggle(value){enabled=value;content.hidden=!value;button.textContent=value?'▾ Hide mini-map':'▸ Show mini-map';button.setAttribute('aria-expanded',String(value));document.body.classList.toggle('minimap-enabled',value);try{localStorage.setItem('worldfolk-minimap',value?'on':'off')}catch{}last=0}
 button.onclick=()=>toggle(!enabled);root.querySelector('.minimap-places').onclick=()=>state.navigation?.toggle(true);toggle(enabled);
 function update(now){
  root.hidden=!state.roam||state.mode==='indoor'||!!state.chatOpen||!!state.navigation?.isOpen||!!state.lifeUI?.isOpen;
  if(root.hidden||!enabled||!state.position||now-last<200)return;last=now;
  if(now-lastRoads>2000){lastRoads=now;try{roads=state.map.querySourceFeatures('accralife-streets',{sourceLayer:'road'}).flatMap(f=>f.geometry.type==='LineString'?[f.geometry.coordinates]:f.geometry.type==='MultiLineString'?f.geometry.coordinates:[])}catch{roads=[]}}
  const w=440,h=300,scale=.55,p=state.position,project=c=>[w/2+(c[0]-p[0])*111320*Math.cos(p[1]*Math.PI/180)*scale,h/2-(c[1]-p[1])*111320*scale];
  ctx.fillStyle='#e1e9de';ctx.fillRect(0,0,w,h);
  function line(coords,color,width){ctx.beginPath();coords.forEach((c,i)=>{const [x,y]=project(c);i?ctx.lineTo(x,y):ctx.moveTo(x,y)});ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
  roads.forEach(r=>line(r,'#8a9697',5));const route=state.navigation?.coordinates;if(route?.length)line(route,'#b66e00',6);
  const nearby=places().map(place=>({...place,xy:project([place.lng,place.lat])})).filter(q=>q.xy[0]>12&&q.xy[0]<w-12&&q.xy[1]>24&&q.xy[1]<h-20).sort((a,b)=>Math.hypot(a.xy[0]-w/2,a.xy[1]-h/2)-Math.hypot(b.xy[0]-w/2,b.xy[1]-h/2)).slice(0,6);
  ctx.font='bold 18px sans-serif';nearby.forEach(q=>{const [x,y]=q.xy;ctx.fillStyle='#276655';ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#f9fcf4';const label=q.name.slice(0,23),tx=Math.max(6,Math.min(w-ctx.measureText(label).width-6,x+9));ctx.strokeText(label,tx,y-8);ctx.fillText(label,tx,y-8)});
  const dest=state.navigation?.destination;if(dest){const [dx,dy]=project([dest.lng,dest.lat]),x=Math.max(14,Math.min(w-14,dx)),y=Math.max(20,Math.min(h-14,dy));ctx.fillStyle='#b66e00';ctx.font='bold 26px sans-serif';ctx.fillText('◆',x-12,y+8)}
  ctx.save();ctx.translate(w/2,h/2);ctx.rotate((state.heading||0)*Math.PI/180);ctx.beginPath();ctx.moveTo(0,-13);ctx.lineTo(9,10);ctx.lineTo(0,5);ctx.lineTo(-9,10);ctx.closePath();ctx.fillStyle='#1475c7';ctx.strokeStyle='white';ctx.lineWidth=3;ctx.fill();ctx.stroke();ctx.restore();
  ctx.fillStyle='#163d36';ctx.font='bold 20px sans-serif';ctx.fillText('N ↑',12,25);caption.textContent=dest?`◆ ${dest.name}`:'Nearby places · blue arrow is you';canvas.setAttribute('aria-label',`Mini-map. ${dest?'Destination: '+dest.name+'. ':''}Nearby: ${nearby.map(q=>q.name).join(', ')||'streets loading'}`);
 }
 return {update,toggle};
}
