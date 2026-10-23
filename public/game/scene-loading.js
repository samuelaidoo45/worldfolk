import {createWorldEntryGate} from './world-entry.js';
import {distanceMetres} from './motion.js';
// Never let input run ahead of the streamed collision/map data. Keep the last
// complete neighbourhood visible while new tiles arrive, and expose retry.
export function createSceneLoading(map,getMode=()=> 'walk',{getVisualStatus=()=>null,onBegin=()=>{},onComplete=()=>{},onCancel=()=>{}}={}){
 const panel=document.createElement('div');panel.className='scene-loading';panel.setAttribute('role','status');panel.setAttribute('aria-live','polite');
 const gate=createWorldEntryGate(),text=document.createElement('span'),retry=document.createElement('button'),back=document.createElement('button');back.textContent='Back to city';back.hidden=true;back.onclick=()=>onCancel();text.textContent='Loading Accra streets and buildings…';retry.textContent='Retry';retry.hidden=true;panel.append(text,retry,back);document.body.append(panel);
 let heldControls=[];
 function holdControls(){releaseControls();heldControls=[...document.body.children].filter(el=>el!==panel).map(el=>[el,el.inert]);for(const [el] of heldControls)el.inert=true;back.focus?.({preventScroll:true});}
 function releaseControls(){for(const [el,inert] of heldControls)el.inert=inert;heldControls=[];}
 let lastCheck=0,readyCenter=null,failed=false,started=performance.now(),suspended=false,mapFrames=0;
 map.on('error',event=>{if(event.sourceId==='accralife-streets'||/tile|fetch|network/i.test(event.error?.message||'')){failed=true;started=0}});
 map.getCanvas().addEventListener('webglcontextlost',event=>{event.preventDefault();suspended=true;failed=true;readyCenter=null;text.textContent='Graphics paused. Restore the game to continue.';retry.hidden=false;panel.hidden=false});
 map.getCanvas().addEventListener('webglcontextrestored',()=>{suspended=false;failed=false;started=performance.now();map.triggerRepaint()});
 retry.onclick=()=>{if(gate.active&&!suspended){location.reload();return;}if(suspended){text.textContent='Restoring graphics · your location is kept';try{map.getCanvas().getContext('webgl2')?.getExtension('WEBGL_lose_context')?.restoreContext()}catch{}return}const source=map.getSource('accralife-streets');if(source?.setTiles){const root=new URL(window.ACCRALIFE_CONFIG.mapData,location.origin).href;source.setTiles([root+'/{z}/{x}/{y}.pbf?retry='+Date.now()])}else map.triggerRepaint();failed=false;started=performance.now();retry.hidden=true;map.triggerRepaint()};
 const centre=()=>{const c=map.getCenter();return [c.lng,c.lat]};
 const mapReady=()=>!suspended&&!!readyCenter&&distanceMetres(readyCenter,centre())<100;
 function update(){const now=performance.now();if(now-lastCheck<(gate.active?80:400))return;lastCheck=now;
  if(!suspended&&map.isStyleLoaded()&&map.isSourceLoaded('accralife-streets')){readyCenter=centre();failed=false;if(!gate.active)started=now}
  const indoor=getMode()==='indoor';
  if(gate.active){
   const visual=getVisualStatus(mapFrames);
   if(gate.update({mapReady:!suspended&&(indoor||mapReady()&&map.isStyleLoaded()&&map.isSourceLoaded('accralife-streets')),visual},now)){
    panel.classList.remove('world-entry-loading');document.body.classList.remove('world-entering');back.hidden=true;releaseControls();onComplete();
   }else{
    panel.hidden=false;retry.hidden=!visual?.error&&!failed&&now-started<20000;
    text.textContent=suspended?'Graphics paused. Restore the game to continue.':visual?.error?visual.message:now-started>20000?'Your world is taking longer to prepare. You can keep waiting, retry, or return to the city.':!indoor&&!mapReady()?'Loading Accra streets and buildings…':visual?.message||'Preparing your world…';return;
   }
  }
  panel.hidden=indoor||mapReady();if(panel.hidden)return;
  retry.hidden=!failed&&now-started<10000;text.textContent=suspended?'Graphics paused. Restore the game to continue.':failed||now-started>10000?'The city is taking longer to load. Check your connection or retry.':'Loading Accra streets and buildings…';
 }
 map.on('sourcedata',e=>{if(e.sourceId==='accralife-streets'&&e.isSourceLoaded){readyCenter=centre();failed=false;update()}});
 map.on('render',()=>{mapFrames++});
 map.on('load',update);const timer=setInterval(update,1000);map.on('remove',()=>{clearInterval(timer);gate.cancel();releaseControls();document.body.classList.remove('world-entering');panel.remove()});
 return {update,
  begin(){gate.begin();lastCheck=0;started=performance.now();readyCenter=null;failed=false;panel.classList.add('world-entry-loading');document.body.classList.add('world-entering');text.textContent='Preparing your world…';retry.hidden=true;back.hidden=false;panel.hidden=false;holdControls();onBegin();},
  cancel(){gate.cancel();panel.classList.remove('world-entry-loading');document.body.classList.remove('world-entering');back.hidden=true;panel.hidden=true;releaseControls();onComplete();},
  get entering(){return gate.active;},get ready(){return !gate.active&&mapReady();}};
}
