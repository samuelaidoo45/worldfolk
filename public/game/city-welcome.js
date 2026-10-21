import {startingPlace} from './city-places.js';
import {searchCityCatalogue} from './map-services.js';
import {setPlaceIcon} from './place-logos.js';
export function createCityWelcome({state,onSelect,onExplore,onResume,onAccount,onFriends,onHelp}){
 let selected=startingPlace('square'),active=true,busy=false,sequence=0,timer,shown=0,mapOpen=false;
 const root=document.createElement('section');root.className='city-welcome';root.setAttribute('aria-label','Worldfolk game launcher');
 root.innerHTML=`
 <div class="launch-art" aria-hidden="true"></div><div class="launch-shade" aria-hidden="true"></div>
 <header class="city-welcome-bar">
  <button class="launch-play" hidden>Back to menu</button>
  <span class="city-welcome-online"><i></i><b>0</b> online</span>
  <button class="city-signup" aria-label="Create your player profile"><span class="launch-avatar" aria-hidden="true">✺</span><span><strong>Create profile</strong><small>YOUR WORLDFOLK ID</small></span></button>
  <button class="city-login">Log in</button>
 </header>
 <main class="launch-content">
  <div class="launch-wordmark"><p class="launch-edition">A SHARED WORLD. AN ACCRA LIFE.</p><h1>WORLDFOLK</h1><p class="launch-subtitle"><span></span> ACCRA <span></span></p></div>
  <nav class="launch-menu" aria-label="Main game menu" aria-describedby="launchMenuHint">
   <button class="launch-enter is-selected" data-hint="Choose a starting place and make your life in Accra.">Enter world</button>
   <button class="city-resume" data-hint="Pick up your saved life, right where you left it." hidden>Continue story</button>
   <button class="launch-map" data-hint="Search the whole city and choose somewhere new to explore.">World map</button>
   <button class="launch-friends" data-hint="Find your friends, read messages and make a call.">Friends & messages</button>
   <button class="launch-help" data-hint="Learn to explore, drive, work and connect with people.">How to play</button>
   <button class="launch-settings" data-hint="Set your sound and screen preferences.">Settings</button>
   <button class="city-advertise" data-hint="Put your business or personal ad into the Worldfolk city.">Advertise</button>
  </nav>
  <p id="launchMenuHint" class="launch-menu-hint">Choose a starting place and make your life in Accra.</p>
  <div class="launch-location"><span class="launch-location-icon" aria-hidden="true">⌖</span><div><small>YOUR NEXT DESTINATION</small><strong>Independence Square</strong></div><button class="launch-browse" aria-label="Change starting destination">Change <span aria-hidden="true">→</span></button></div>
  <footer class="launch-footer"><span><kbd>↑</kbd><kbd>↓</kbd> SELECT <kbd>↵</kbd> CONFIRM</span><span class="launch-art-label">Original key art · gameplay visuals differ</span></footer>
 </main>
 <div class="launch-scene-caption" aria-hidden="true"><span>05°33′N · 00°12′W</span><strong>THIS CITY. YOUR STORY.</strong><small>ACCRA, GHANA</small></div>
 <dialog class="launch-settings-dialog" aria-labelledby="launchSettingsTitle"><button class="launch-settings-close" aria-label="Close settings">×</button><p class="launch-edition">MAKE YOURSELF AT HOME</p><h2 id="launchSettingsTitle">Settings</h2><button class="launch-sound"><span>Game sound</span><strong></strong></button><button class="launch-fullscreen"><span>Fullscreen</span><strong></strong></button><p class="launch-settings-note" role="status">The game adapts to your screen in portrait or landscape.</p><button class="launch-settings-done">Back to menu</button></dialog>
 <section class="city-map-panel" hidden><div class="city-discovery"><label><span aria-hidden="true">⌕</span><input type="search" placeholder="Find a place. Start a story." aria-label="Search all mapped locations in Accra" aria-controls="citySearchResults" aria-expanded="false" autocomplete="off"></label><div id="citySearchResults" class="city-discovery-results" hidden></div><div class="city-district-chips"></div></div>
 <section class="city-start-card" aria-label="Selected destination"><div class="city-start-icon"></div><div class="city-start-copy"><small>YOUR NEXT DESTINATION</small><h2></h2><p></p></div><div class="city-start-actions"><button class="city-explore">Enter world ↗</button><button class="launch-back">Back to menu</button></div></section><p class="city-map-hint">Drag to explore · select a place · enter the world</p></section>
 <p class="launch-status" role="status" aria-live="polite"></p>`;
 document.body.append(root);document.body.classList.add('city-home','city-launch');
 const $=s=>root.querySelector(s),results=$('.city-discovery-results'),input=$('input');
 function closeSearch(){clearTimeout(timer);sequence++;results.hidden=true;input.setAttribute('aria-expanded','false')}
 function setMap(open){if(busy)return;mapOpen=open;closeSearch();root.classList.toggle('map-open',open);document.body.classList.toggle('city-launch',active&&!open);$('.city-map-panel').hidden=!open;$('.launch-content').hidden=open;$('.launch-scene-caption').hidden=open;$('.launch-play').hidden=!open;if(!open)state.world3d?.setEnabled(false);else{state.map?.resize();state.map?.triggerRepaint()}sync()}
 function choose(place){if(busy)return;closeSearch();input.value='';onSelect(place)}
 for(const id of ['square','osu','makola','labadi','mall','legon']){const place=startingPlace(id),b=document.createElement('button');b.textContent=place.name;b.onclick=()=>choose(place);$('.city-district-chips').append(b)}
 async function search(more=false){
  const seq=++sequence,q=input.value.trim();if(!more){shown=0;results.replaceChildren();results.textContent='Searching the full city catalogue…'}results.hidden=false;input.setAttribute('aria-expanded','true');
  try{const page=await searchCityCatalogue(q,{offset:more?shown:0,limit:40});if(seq!==sequence)return;
   if(!more)results.replaceChildren();results.querySelector('.city-more')?.remove();let status=results.querySelector('.city-search-status');if(!status){status=document.createElement('p');status.className='city-search-status';status.setAttribute('role','status');results.prepend(status)}
   shown+=page.items.length;status.textContent=page.total?`${page.total.toLocaleString()} places${q?' found':' across the city'} · showing ${shown}`:'No matching place in the mapped catalogue. Try another name, area or category.';
   for(const place of page.items){const b=document.createElement('button');b.className='place-result';const icon=document.createElement('span');icon.className='place-result-icon';setPlaceIcon(icon,place);const copy=document.createElement('span');copy.className='place-result-copy';const title=document.createElement('strong'),detail=document.createElement('small');title.textContent=place.name;detail.textContent=`${place.type} · ${place.area}`;copy.append(title,detail);b.append(icon,copy);b.onclick=()=>choose(place);results.append(b)}
   if(shown<page.total){const moreButton=document.createElement('button');moreButton.className='city-more';moreButton.textContent=`Show more places (${(page.total-shown).toLocaleString()} remaining)`;moreButton.onclick=()=>search(true);results.append(moreButton)}
  }catch(error){if(seq!==sequence)return;results.replaceChildren();const status=document.createElement('p');status.textContent=error.message;const retry=document.createElement('button');retry.textContent='Retry search';retry.onclick=()=>search();results.append(status,retry)}
 }

 input.oninput=()=>{sequence++;clearTimeout(timer);timer=setTimeout(()=>search(),180)};input.onfocus=()=>search();input.onkeydown=e=>{if(e.key==='Escape'){closeSearch();input.blur()}else if(e.key==='ArrowDown'){e.preventDefault();results.querySelector('button')?.focus()}};
 const menu=$('.launch-menu'),hint=$('.launch-menu-hint'),settings=$('.launch-settings-dialog');
 function highlight(button){if(!button||!menu.contains(button))return;for(const b of menu.querySelectorAll('button'))b.classList.toggle('is-selected',b===button);hint.textContent=button.dataset.hint}
 menu.addEventListener('focusin',e=>highlight(e.target));menu.addEventListener('pointerover',e=>{const b=e.target.closest('button');if(b&&!b.disabled){b.focus({preventScroll:true});highlight(b)}});
 menu.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const buttons=[...menu.querySelectorAll('button')].filter(b=>!b.hidden&&!b.disabled),index=buttons.indexOf(document.activeElement);buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:(index+(e.key==='ArrowDown'?1:-1)+buttons.length)%buttons.length]?.focus()});
 root.addEventListener('keydown',e=>{if(e.key==='Escape'&&mapOpen&&results.hidden){setMap(false);$('.launch-map').focus()}});
 $('.launch-play').onclick=()=>setMap(false);$('.launch-map').onclick=$('.launch-browse').onclick=()=>setMap(true);$('.launch-back').onclick=()=>{setMap(false);$('.launch-map').focus()};
 $('.city-advertise').onclick=()=>window.dispatchEvent(new Event('worldfolk:open-ads'));
 $('.city-signup').onclick=()=>onAccount('register');$('.city-login').onclick=()=>onAccount('login');$('.city-resume').onclick=onResume;
 $('.launch-friends').onclick=()=>state.self?.handle?onFriends?.():onAccount('register');$('.launch-help').onclick=()=>onHelp?.();
 function settingsSync(){$('.launch-sound strong').textContent=state.audio?.enabled?'ON':'OFF';$('.launch-sound').setAttribute('aria-pressed',String(!!state.audio?.enabled));$('.launch-fullscreen strong').textContent=document.fullscreenElement?'ON':'OFF'}
 $('.launch-settings').onclick=()=>{settingsSync();settings.showModal()};
 function closeSettings(){settings.close();$('.launch-settings').focus()}
 $('.launch-settings-close').onclick=$('.launch-settings-done').onclick=closeSettings;settings.addEventListener('cancel',e=>{e.preventDefault();closeSettings()});
 $('.launch-sound').onclick=async()=>{await state.audio?.toggle();settingsSync()};
 $('.launch-fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw new Error();$('.launch-settings-note').textContent='The game adapts to your screen in portrait or landscape.'}catch{$('.launch-settings-note').textContent='Fullscreen is unavailable in this browser. You can still play in this window.'}settingsSync()};
 document.addEventListener('fullscreenchange',settingsSync);
 async function explore(){if(!selected||busy)return;if(!state.self?.handle){onAccount('register',{type:'enter-world',place:{...selected}});return}if(state.self?.life?.health<=0||state.self?.life?.arrested)return await onResume();const place=selected;busy=true;$('.launch-status').textContent='Entering '+place.name+'…';sync();try{if(await onExplore(place)===false)throw new Error('Could not enter the world. Please try again.');return true}catch(error){$('.launch-status').textContent=error?.message||'Could not enter the world. Please try again.';return false}finally{busy=false;sync()}}
 $('.city-explore').onclick=$('.launch-enter').onclick=explore;
 function sync(){root.hidden=!active;$('.city-welcome-online b').textContent=String(state.onlineCount||0);$('.city-resume').hidden=!state.self?.handle||!!state.self.life?.explorationPending;const needsRestart=state.self?.life?.health<=0||state.self?.life?.arrested;if(needsRestart)$('.city-resume').hidden=true;$('.city-resume').textContent='Continue story';$('.city-resume').dataset.hint=needsRestart?'Restart at home with restored health. Your money and belongings are kept.':'Pick up your saved life, right where you left it.';$('.city-signup strong').textContent=state.self?.handle?'@'+state.self.handle:'Create profile';$('.city-signup small').textContent=state.self?.handle?'VIEW YOUR PROFILE':'YOUR WORLDFOLK ID';$('.launch-avatar').textContent=state.self?.avatar||'✺';$('.city-signup').setAttribute('aria-label',state.self?.handle?'View profile for @'+state.self.handle:'Create your player profile');$('.city-login').hidden=!!state.self?.handle;root.setAttribute('aria-busy',String(busy));for(const b of root.querySelectorAll('button'))b.disabled=busy;input.disabled=busy;$('.launch-enter').textContent=busy?'Entering world…':needsRestart?'Restart life':'Enter world';$('.launch-enter').dataset.hint=needsRestart?'Restart at home with restored health. Your money and belongings are kept.':'Choose a starting place and make your life in Accra.';$('.city-explore').textContent=busy?'Entering world…':'Explore here ↗';$('.launch-location strong').textContent=selected?.name||'Choose a place';if(menu.querySelector('.is-selected')?.hidden)highlight($('.launch-enter'));else if(menu.querySelector('.is-selected'))hint.textContent=menu.querySelector('.is-selected').dataset.hint;}
 function select(place){if(busy)return false;const next=startingPlace(place.id)||(/^g_-?\d+_-?\d+$/.test(place.id)&&place.name!=='Map location'?place:null);if(!next)return false;selected=next;setPlaceIcon($('.city-start-icon'),selected);$('.city-start-copy small').textContent=`${selected.area} · ${selected.type}`;$('.city-start-copy h2').textContent=selected.name;$('.city-start-copy p').textContent=selected.description||'Explore this part of Accra and meet people nearby.';closeSearch();$('.launch-status').textContent='Starting location: '+selected.name;sync();return true}
 select(selected);$('.launch-status').textContent='';
 return {select,explore,sync,browse(){setMap(true)},get selected(){return selected},get active(){return active},get mapOpen(){return mapOpen},hide(){active=false;closeSearch();root.hidden=true;document.body.classList.remove('city-home','city-launch')},show(){active=true;busy=false;document.body.classList.add('city-home');setMap(false);$('.launch-status').textContent='';sync();$('.launch-enter').focus({preventScroll:true})}};
}
