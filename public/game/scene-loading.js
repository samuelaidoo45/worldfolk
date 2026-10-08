import {distanceMetres} from './motion.js';
// Never let input run ahead of the streamed collision/map data. Keep the last
// complete neighbourhood visible while new tiles arrive, and expose retry.
export function createSceneLoading(map,getMode=()=> 'walk'){
 const panel=document.createElement('div');panel.className='scene-loading';panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');
 const text=document.createElement('span'),retry=document.createElement('button');text.textContent='Loading Accra streets and buildings…';retry.textContent='Retry';retry.hidden=true;panel.append(text,retry);document.body.append(panel);
 let lastCheck=0,readyCenter=null,failed=false,started=performance.now(),suspended=false;
 map.on('error',event=>{if(event.sourceId==='accralife-streets'||/tile|fetch|network/i.test(event.error?.message||'')){failed=true;started=0}});
 map.getCanvas().addEventListener('webglcontextlost',event=>{event.preventDefault();suspended=true;failed=true;readyCenter=null;text.textContent='Graphics paused. Restore the game to continue.';retry.hidden=false;panel.hidden=false});
 map.getCanvas().addEventListener('webglcontextrestored',()=>{suspended=false;failed=false;started=performance.now();map.triggerRepaint()});
 retry.onclick=()=>{if(suspended){text.textContent='Restoring graphics · your location is kept';try{map.getCanvas().getContext('webgl2')?.getExtension('WEBGL_lose_context')?.restoreContext()}catch{}return}const source=map.getSource('accralife-streets');if(source?.setTiles){const root=new URL(window.ACCRALIFE_CONFIG.mapData,location.origin).href;source.setTiles([root+'/{z}/{x}/{y}.pbf?retry='+Date.now()])}else map.triggerRepaint();failed=false;started=performance.now();retry.hidden=true;map.triggerRepaint()};
 const centre=()=>{const c=map.getCenter();return [c.lng,c.lat]};
 const ready=()=>!suspended&&!!readyCenter&&distanceMetres(readyCenter,centre())<100;
 function update(){const now=performance.now();if(now-lastCheck<400)return;lastCheck=now;
  if(!suspended&&map.isStyleLoaded()&&map.isSourceLoaded('accralife-streets')){readyCenter=centre();failed=false;started=now}
  const indoor=getMode()==='indoor';panel.hidden=indoor||ready();if(panel.hidden)return;
  retry.hidden=!failed&&now-started<10000;text.textContent=suspended?'Graphics paused. Restore the game to continue.':failed||now-started>10000?'The city is taking longer to load. Check your connection or retry.':'Loading Accra streets and buildings…';
 }
 map.on('sourcedata',e=>{if(e.sourceId==='accralife-streets'&&e.isSourceLoaded){readyCenter=centre();failed=false;update()}});
 map.on('load',update);const timer=setInterval(update,1000);map.on('remove',()=>{clearInterval(timer);panel.remove()});
 return {update,get ready(){return ready()}};
}
