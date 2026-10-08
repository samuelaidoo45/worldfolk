import {requestDisplayOrientation,mobileCameraScale} from './display-settings.js';
import {mobileViewport} from './mobile-viewport.js';
export function createMobileControls({state,release,toggleCamera}){
 const touch=matchMedia('(any-pointer: coarse)');
 const menu=document.createElement('nav');menu.className='mobile-game-menu hidden';menu.id='mobileGameMenu';menu.setAttribute('aria-label','Game menu');
 const toggle=document.createElement('button');toggle.className='mobile-menu-toggle';toggle.type='button';toggle.textContent='☰';toggle.setAttribute('aria-label','Open game menu');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-controls',menu.id);
 const status=document.createElement('span');status.id='connectionStatus';status.className='connection-status';status.textContent=document.body.dataset.connection||'Connecting';
 document.body.append(menu,toggle,status);
 const summary=document.createElement('div');summary.className='game-menu-summary';menu.prepend(summary);let summaryStamp='';
 const menuClose=document.createElement('button');menuClose.className='game-menu-close';menuClose.type='button';menuClose.textContent='Close menu ×';menuClose.onclick=()=>{close();toggle.focus()};menu.prepend(menuClose);
 let menuOpen=false,wasRoaming=false,wasTouch=false;
 function close(){menuOpen=false;menu.classList.add('hidden');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open game menu');document.body.classList.remove('game-menu-open');updatePause()}
 toggle.onclick=()=>{menuOpen=!menuOpen;menu.classList.toggle('hidden',!menuOpen);toggle.setAttribute('aria-expanded',String(menuOpen));toggle.setAttribute('aria-label',menuOpen?'Close game menu':'Open game menu');document.body.classList.toggle('game-menu-open',menuOpen);release();updatePause();if(menuOpen)menu.querySelector('button')?.focus()};
 async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen?.();else await document.documentElement.requestFullscreen?.()}catch{status.textContent='Fullscreen is unavailable in this browser'}}
 const items=[['◇','My life',()=>state.lifeUI?.show()],['♙','Account',()=>state.accountUI?.show()],['⌖','Destinations',()=>state.navigation?.toggle(true)],['☏','Chat',()=>document.getElementById('roamChatToggle').click()],['☎','Friends & calls',()=>document.querySelector('.voice-launch')?.click()],['▰','Public transport',()=>document.querySelector('.transit-launch')?.click()],['◫','City map',()=>document.getElementById('roamToggle').click()],['▣','Mini-map on / off',()=>state.minimap?.toggle(!document.body.classList.contains('minimap-enabled'))],['▤','Street view',()=>state.setCameraMode?.('street')],['◉','Third-person',()=>state.setCameraMode?.('third')],['◎','First-person',()=>state.setCameraMode?.('first')],['◌','Overview',()=>state.setCameraMode?.('overview')],['▱','Vehicle view',()=>document.getElementById('viewButton').click()],...(window.ACCRALIFE_CONFIG?.imagery?[['▧','Satellite',()=>document.querySelector('.satellite-launch')?.click()]]:[]),['⛶','Fullscreen',fullscreen],['?','Help',()=>document.getElementById('helpBtn').click()]];
 for(const [icon,label,action] of items){const b=document.createElement('button');b.type='button';b.dataset.action=label;const i=document.createElement('span');i.textContent=icon;b.append(i,document.createTextNode(label));b.onclick=()=>{close();release();action()};menu.append(b)}
 document.addEventListener('keydown',event=>{if(!menuOpen)return;event.stopPropagation();if(event.code==='Escape'){event.preventDefault();close();toggle.focus()}if(event.code==='Tab'){const buttons=[...menu.querySelectorAll('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}},true);
 const display=document.createElement('section');display.className='mobile-display-settings';display.setAttribute('aria-label','Display settings');
 const orientationGroup=document.createElement('fieldset');orientationGroup.innerHTML='<legend>Screen orientation</legend>';
 const displayHint=document.createElement('p');displayHint.className='display-hint';displayHint.setAttribute('role','status');
 const orientationButtons=[];let orientationChoice='auto',orientationBusy=false,orientationLocked=false;
 function describeOrientation(){
  const current=document.body.dataset.displayOrientation||'portrait';
  displayHint.textContent=orientationChoice==='auto'?'Rotate your device to change the view.':orientationLocked?`${orientationChoice==='portrait'?'Portrait':'Landscape'} locked. Choose Auto to rotate freely.`:current===orientationChoice?`${orientationChoice==='portrait'?'Portrait':'Landscape'} view. This browser follows your device rotation.`:`Rotate your device to ${orientationChoice}. If it stays fixed, turn off your phone’s rotation lock.`;
 }
 for(const value of ['auto','portrait','landscape']){const b=document.createElement('button');b.type='button';b.textContent=value[0].toUpperCase()+value.slice(1);b.setAttribute('aria-pressed',String(value==='auto'));orientationButtons.push(b);orientationGroup.append(b);b.onclick=async()=>{
  if(orientationBusy)return;orientationBusy=true;release();for(const item of orientationButtons)item.disabled=true;
  displayHint.textContent='Changing screen orientation…';
  try{const result=await requestDisplayOrientation(value);orientationChoice=value;orientationLocked=result.locked;for(const item of orientationButtons)item.setAttribute('aria-pressed',String(item===b));scheduleViewport()}
  finally{orientationBusy=false;for(const item of orientationButtons)item.disabled=false;describeOrientation()}
 }}
 const sizeGroup=document.createElement('fieldset');sizeGroup.innerHTML='<legend>Interface size</legend>';let interfaceSize='compact';try{if(localStorage.getItem('worldfolk_interface_size')==='comfortable')interfaceSize='comfortable'}catch{}
 const sizeButtons=[];
 for(const value of ['compact','comfortable']){const b=document.createElement('button');b.type='button';b.textContent=value[0].toUpperCase()+value.slice(1);b.setAttribute('aria-pressed',String(value===interfaceSize));sizeButtons.push(b);sizeGroup.append(b);b.onclick=()=>{document.body.dataset.interfaceSize=value;for(const item of sizeButtons)item.setAttribute('aria-pressed',String(item===b));try{localStorage.setItem('worldfolk_interface_size',value)}catch{};scheduleViewport()}}
 document.body.dataset.interfaceSize=interfaceSize;display.append(orientationGroup,displayHint,sizeGroup);summary.after(display);
 const extra=document.createElement('div');extra.className='touch-extras';
 const run=document.createElement('button');run.type='button';run.className='touch-run';run.textContent='Run';run.setAttribute('aria-label','Toggle running');run.setAttribute('aria-pressed','false');
 const brake=document.createElement('button');brake.type='button';brake.className='touch-brake';brake.textContent='Brake';brake.setAttribute('aria-label','Hold vehicle brake');extra.append(run,brake);document.querySelector('.touch-right').append(extra);
 function hold(button,key){button.onpointerdown=e=>{if(document.body.classList.contains('mobile-paused'))return;e.preventDefault();button.setPointerCapture(e.pointerId);state.keys.add(key);button.classList.add('pressed')};for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>{state.keys.delete(key);button.classList.remove('pressed')})}
 run.onclick=()=>document.getElementById('runToggle').click();hold(brake,'Space');
 const look=document.createElement('div');look.className='touch-look';look.setAttribute('aria-label','Drag to look around');document.getElementById('roamHud').append(look);let lastX=null;
 look.onpointerdown=e=>{if(document.body.classList.contains('mobile-paused'))return;look.setPointerCapture(e.pointerId);lastX=e.clientX};look.onpointermove=e=>{if(lastX===null||!look.hasPointerCapture(e.pointerId))return;if(state.mode==='drive')state.lookOffset=(state.lookOffset||0)+(e.clientX-lastX)*.22;else if(state.mode==='indoor')state.interior?.look?.((e.clientX-lastX)*.22);else if(state.view!=='2d')state.cameraBearing+=(e.clientX-lastX)*.22;lastX=e.clientX};for(const event of ['pointerup','pointercancel','lostpointercapture'])look.addEventListener(event,()=>lastX=null);

 const panelSelectors=['.life-drawer','.world-panel','.destination-panel','.roam-action-menu','.help-modal'];
 function updatePause(){run.setAttribute('aria-pressed',String(!!state.running));run.textContent=state.running?'Running':'Run';run.disabled=!['walk','indoor'].includes(state.mode);const interact=document.getElementById('touchInteract'),prompt=document.getElementById('roamPromptText')?.textContent||'Interact';interact.textContent=state.mode==='drive'?'Exit car':'Interact';interact.setAttribute('aria-label',state.mode==='drive'?'Exit car':prompt);interact.title=prompt;for(const b of menu.querySelectorAll('button'))if(b.dataset.action==='City map')b.lastChild.textContent=state.view==='2d'?'3D view':'2D map';if(menuOpen&&!state.roam){close();return}if(menuOpen){for(const b of menu.querySelectorAll('button[data-action]'))b.disabled=(state.mode==='indoor'&&['Destinations','Camera','Satellite','Mini-map on / off'].includes(b.dataset.action))||(state.view==='2d'&&b.dataset.action==='Mini-map on / off')||(b.dataset.action==='Vehicle view'&&state.mode!=='drive')||(b.dataset.action==='Fullscreen'&&!document.fullscreenEnabled);const stamp=[state.self?.name||'Your city',`₵ ${state.self?.money?.toLocaleString()||0}`,document.getElementById('clockText')?.textContent,`${document.getElementById('onlineCount')?.textContent||0} online`].join(' · ');if(stamp!==summaryStamp){summaryStamp=stamp;summary.textContent=stamp}}const coarse=touch.matches||navigator.maxTouchPoints>0;document.body.classList.toggle('touch-device',coarse);if(coarse&&state.roam&&(!wasRoaming||!wasTouch)){const credits=document.querySelector('.maplibregl-ctrl-attrib.maplibregl-compact');credits?.classList.remove('maplibregl-compact-show');credits?.removeAttribute('open')}wasRoaming=state.roam;wasTouch=coarse;const panelOpen=panelSelectors.some(s=>[...document.querySelectorAll(s)].some(el=>!el.classList.contains('hidden')))||state.chatOpen||!!document.querySelector('.account-dialog[open]');const paused=coarse&&state.roam&&(menuOpen||panelOpen);if(paused&&!document.body.classList.contains('mobile-paused'))release();document.body.classList.toggle('mobile-paused',paused);document.body.classList.toggle('mobile-panel-open',coarse&&panelOpen);document.getElementById('roamHud').dataset.travel=state.mode}
 const observer=new MutationObserver(updatePause);for(const el of document.querySelectorAll(panelSelectors.join(',')))observer.observe(el,{attributes:true,attributeFilter:['class']});
 const watch=setInterval(updatePause,300);window.addEventListener('pagehide',()=>clearInterval(watch),{once:true});
 let viewportFrame=0,lastWidth=0,lastHeight=0,keyboardBaseHeight=0,keyboardBaseWidth=0;
 function viewport(){
  const view=window.visualViewport,editing=!!document.activeElement?.matches('input,textarea,select,[contenteditable="true"]');
  const width=document.documentElement.clientWidth,height=document.documentElement.clientHeight;
  const layout=mobileViewport({width,height,visibleHeight:view?.height||height,offsetTop:view?.offsetTop||0,editing,previousOrientation:document.body.dataset.displayOrientation,previousHeight:keyboardBaseHeight||height,previousWidth:keyboardBaseWidth||width});
  document.documentElement.style.setProperty('--visible-height',`${layout.height}px`);
  document.documentElement.style.setProperty('--visible-top',`${layout.top}px`);
  document.body.dataset.displayOrientation=layout.orientation;
  state.mobileCameraScale=mobileCameraScale(width,height,touch.matches||navigator.maxTouchPoints>0);
  if(!orientationBusy)describeOrientation();
  document.body.classList.toggle('keyboard-open',layout.keyboard);
  if(!layout.keyboard){keyboardBaseHeight=height;keyboardBaseWidth=width}
  if(lastWidth&&(width!==lastWidth||(!editing&&Math.abs(height-lastHeight)>120)))release();
  if(width!==lastWidth||height!==lastHeight){state.map?.resize();lastWidth=width;lastHeight=height}
 }
 function scheduleViewport(){cancelAnimationFrame(viewportFrame);viewportFrame=requestAnimationFrame(()=>{viewport();updatePause()})}
 window.visualViewport?.addEventListener('resize',scheduleViewport);window.visualViewport?.addEventListener('scroll',scheduleViewport);
 document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){orientationLocked=false;orientationChoice='auto';for(const b of orientationButtons)b.setAttribute('aria-pressed',String(b.textContent==='Auto'))}scheduleViewport()});
 window.addEventListener('resize',scheduleViewport);window.screen.orientation?.addEventListener('change',scheduleViewport);
 document.addEventListener('focusin',scheduleViewport);document.addEventListener('focusout',scheduleViewport);
 touch.addEventListener('change',scheduleViewport);document.addEventListener('visibilitychange',()=>{if(document.hidden){close();release()}else scheduleViewport()});viewport();updatePause();
}
