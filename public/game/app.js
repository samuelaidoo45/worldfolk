import {landmarkArrival,isOutdoorLandmark} from './landmark-arrival.js';
import {createAdsStudio} from './ads-studio.js';
import {playerLabel} from './player-labels.js';
import {createPlayerProfiles} from './player-profiles.js';
import {setPlaceIcon} from './place-logos.js';
import {ACCRA_BOUNDS,inAccra} from './map-region.js';
import {CITY_PLACES,startingPlace} from './city-places.js';
import {createCityWelcome} from './city-welcome.js';
import {createGameAudio} from './game-audio.js';
import {EXPERIENCES,shiftCanMove,canUseVehicle,workStep,workReady} from './work-catalog.js';
import {installPlaceIcons,placeEmoji} from './place-icons.js';
import {movementFailure,correctedPosition,newestPlayer} from './movement-sync.js';
import {trafficSpeed} from './traffic-routing.js';
import {signalSpeedLimit} from './traffic-signals.js';
import {driveWithContacts} from './vehicle-contacts.js';
import {autoDriveInput,autoTrafficControl} from './auto-drive.js';
import {chaseCamera} from './chase-camera.js';
import {installGroundDetail} from './ground-detail.js';
import {createSceneLoading} from './scene-loading.js';
import {PUBLIC_VENUES} from './public-venues.js';
import {installOverheadMap,updateOverheadPlaces} from './overhead-map.js';
import {cityMapStyle,setMapPresentation} from './map-style.js';
import {searchMapPlaces} from './map-services.js';
import {createAccountUI} from './account.js';
import {resolvePlayerLocation} from './player-location.js';
import {roadFeatures} from './road-cache.js';
import {interiorDesign} from './building-design.js';
import {createOverheadView} from './overhead.js';
import {interiorKind} from './venue-layouts.js';
import {createMiniMap} from './minimap.js';
import {createRoadSurface} from './road-surface.js';
import {STREET_SERVICES} from './street-services.js';
import {moveAroundObstacles,footprintGap} from './obstacle-motion.js';
function workLocked(){return !shiftCanMove(state.self?.life?.shift)}
import {createRealtime} from './realtime.js';
import {createMobileControls} from './mobile-controls.js';
import {VENUES,districtAt,venueKind} from './districts.js';
import {createStreetSafety} from './street-safety.js';
import {installSatellite} from './satellite.js';
import {createScenery} from './scenery.js';
import {worldAtmosphere,createAtmosphere} from './atmosphere.js';
import {createTransit} from './transit.js';
import {createVoice} from './voice.js';
import {createLifeUI} from './life-ui.js';
import {HOMES,JOBS,GOODS,TERMINALS,propertyId} from './life-catalog.js';
import {damp,turnToward,stepWalker,stepCar,offsetMetres,bearingTo} from './motion.js';
import {createCityLife} from './city-life.js';
import {createNavigation} from './navigation.js';
import {createWorld3D} from './world3d.js';
import {createBuildingPhysics} from './building-physics.js';
import {createInterior3D} from './interior3d.js';
import {installRealBuildings,createArchitecture} from './real-buildings.js';
const $ = id => document.getElementById(id);
const PLACES=CITY_PLACES.map(p=>({...p}));
const placeById = Object.fromEntries(PLACES.map(p=>[p.id,p]));
function geoPlace(lng,lat,name='Map location',type='Accra place',emoji='📍'){
  if(!inAccra(lng,lat))return null;
  const id=`g_${Math.round(lng*10000)}_${Math.round(lat*10000)}`;
  if(!placeById[id]||placeById[id].name==='Map location'||(name!=='Map location'&&placeById[id].name!==name))placeById[id]={id,name,area:'Accra',type,emoji,lng:Math.round(lng*10000)/10000,lat:Math.round(lat*10000)/10000,description:'Explore this part of Accra, enjoy the city and meet people nearby.',activities:['explore','stroll']};
  return placeById[id];
}
function placeForId(id){
  if(id?.startsWith('p_')){const match=/^p_([a-f0-9-]{36})_([a-z-]+)$/.exec(id),home=match&&HOMES.find(h=>h.id===match[2]);if(home){const owner=state.residences.find(h=>h.id===id);return {...home,id,name:owner?.name||(match[1]===state.self?.id?'Your '+home.name:'Private '+home.name),type:'Private home',emoji:'🏠',description:'A private residence. The owner and guests with a valid pass can enter.',activities:['sleep','cook','shower','relax','upgrade']}}}
  if(placeById[id])return placeById[id];
  const match=/^g_(-?\d{1,6})_(-?\d{1,6})$/.exec(id||'');
  if(!match)return null;
  let detail=null;try{detail=JSON.parse(sessionStorage.getItem(`accralife_place_${id}`)||'null')}catch{}
  return geoPlace(Number(match[1])/10000,Number(match[2])/10000,detail?.name||'Map location',detail?.type||'Accra place',detail?.emoji||'📍');
}
const ACTIVITIES = {
  sleep:{emoji:'🌙',name:'Sleep in bed',detail:'+70 energy · stay asleep until you wake up'},cook:{emoji:'🍳',name:'Cook at home',detail:'Use groceries · cook two meals'},shower:{emoji:'🚿',name:'Take a shower',detail:'+60 hygiene · 25 min'},relax:{emoji:'📺',name:'Sit and relax',detail:'+22 fun · +9 energy · stand up when ready'},upgrade:{emoji:'🔨',name:'Upgrade your home',detail:'New space · +25 XP'},
  office:{emoji:'💼',name:'Office jobs',detail:'₵130 per completed 75s shift'},trade:{emoji:'🧺',name:'Market jobs',detail:'₵75 per completed 45s shift'},cafe:{emoji:'☕',name:'Café jobs',detail:'₵90 per completed 55s shift'},meal:{emoji:'🥘',name:'Eat out in Osu',detail:'₵18 · +45 hunger'},nightlife:{emoji:'🪩',name:'Go out for the night',detail:'₵32 · +35 fun · +28 social'},marketfood:{emoji:'🍲',name:'Grab market food',detail:'₵11 · +34 hunger'},beach:{emoji:'🏖️',name:'Enjoy the beach',detail:'₵5 · +31 fun'},browse:{emoji:'🎨',name:'Browse local art',detail:'₵12 · +25 fun'},museum:{emoji:'🏛️',name:'Explore the museum',detail:'₵10 · +13 XP'},study:{emoji:'📖',name:'Study and learn',detail:'+24 XP · 2 hours'},shopping:{emoji:'🛍️',name:'Browse city shops',detail:'Food, clothing, furniture and vehicles'},stroll:{emoji:'🚶🏾',name:'Explore the neighbourhood',detail:'+16 fun · 50 min'},connect:{emoji:'💬',name:'Meet people nearby',detail:'+22 social · +7 fun'},explore:{emoji:'✨',name:'Explore this place',detail:'+18 fun · +8 XP · 1 hour'}
};

const NEEDS=[['hunger','Hunger','🍲'],['energy','Energy','⚡'],['fun','Fun','🎉'],['social','Social','💬'],['hygiene','Hygiene','🫧']];
const state={audio:createGameAudio(),view:'3d',cameraMode:'third',scenicCamera:false,running:true,overheadFollowing:true,movementSpeed:0,lifeUI:null,residences:[],flightCompleting:false,walkVelocity:[0,0],steer:0,cameraPosition:null,cameraHeading:0,cityLife:null,navigation:null,nearResident:null,interactionPending:false,lastHud:0,map:null,engine:null,world3d:null,physics:null,interior:null,mode:'walk',cabinView:false,roam:false,mapModeRequested:false,position:null,carPosition:null,carHeading:0,carSpeed:0,heading:0,cameraBearing:0,keys:new Set(),joystick:{x:0,y:0},nearestPlace:null,nearDoor:null,nearCar:false,indoorPlace:null,blockedHint:false,spawnCorrectionPending:false,actionMenuOpen:false,chatOpen:false,lastFrame:0,lastCamera:0,lastMoveSend:0,lastNearbyCheck:0,lastSentPosition:null,moveInFlight:false,poiMarkers:new Map(),selectedMarker:null,playerMarkers:[],self:null,onlineCount:0,players:[],messages:[],selectedPlace:'home',panelTab:'life',placeQuery:'',searchResults:[],searchSeq:0,chatChannel:'city',avatar:'🧑🏾',loaded:false,tilted:false,chatCollapsed:false,busy:false,muted:new Set(JSON.parse(localStorage.getItem('accralife_muted')||'[]'))};
let toastTimer, pollTimer, heartbeatTimer, searchTimer, finalMoveTimer;
const realtime=createRealtime({onPlayers(players){state.players=players;state.world3d?.setPlayers(players,state.self?.id);renderTop();if(state.chatOpen)renderChat();if(!state.roam)renderMapMarkers()},onCorrection(p){if(correctedPosition(state,p))followCamera(true)},onStatus(text){state.sessionPaused=['Active in another tab','Session ended'].includes(text);document.body.dataset.connection=text;const el=document.getElementById('connectionStatus');if(el)el.textContent=state.sessionPaused?text+' · Reload this tab to continue here':text}});

function toast(message){const el=$('toast');el.textContent=message;el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hidden'),3400)}
function clockText(){return worldAtmosphere().label}
function updateCityLight(){state.atmosphere?.update((state.view==='2d'||state.cityWelcome?.active)?{...worldAtmosphere(),preset:'day',weather:'clear'}:undefined)}
function safeText(el,value){el.textContent=String(value??'')}
async function api(method,body,query=''){
  if(method==='POST'&&state.sessionPaused)throw new Error('This session is paused. Continue in your active game tab.');
  const response=await fetch(`/api/game${query}`,{method,credentials:'same-origin',cache:'no-store',headers:{...(body?{'Content-Type':'application/json'}:{}),...(realtime.connected?{'X-World-Room':realtime.room}:{})},body:body?JSON.stringify(body):undefined});
  const data=await response.json().catch(()=>({error:'The city is unavailable'}));
  if(!response.ok){const error=new Error(data.error||'The city is unavailable');error.status=response.status;throw error}
  if(method==='POST'&&data.self&&realtime.connected)await realtime.sync().catch(()=>{});
  if(data.self)data.self=newestPlayer(state.self,data.self);
  return data;
}
async function refreshWorld(){
  if(state.refreshing)return;state.refreshing=true;
  try{const data=await api('GET',null,`?channel=${state.chatChannel==='city'?'city':'place'}`);
    const previousSelf=JSON.stringify(state.self);
    state.self=data.self;state.onlineCount=data.onlineCount??0;syncHomeMarker();state.residences=data.residences||[];if(!realtime.connected)state.players=data.players||[];state.messages=data.messages||[];
    if(state.self?.handle)realtime.start();
    updateCityLight();state.lifeUI?.sync();if(data.accessAllowed===false&&state.mode==='indoor'){if(state.self?.life?.rest)await lifeAction({type:'rest-end'});exitInterior();toast('Your guest access has ended')}syncLife();
    if(!state.loaded&&state.self){state.selectedPlace=state.self.placeId;state.loaded=true;state.position=[state.self.lng,state.self.lat];state.heading=state.self.heading||0;if(!state.cityWelcome?.active)flyTo(state.selectedPlace,14.6)}
    state.world3d?.setIdentity(state.self);state.world3d?.setPlayers(state.players,state.self?.id);
    if(state.world3d&&state.self&&!state.self.life?.explorationPending&&!state.cityWelcome?.active&&!state.roam&&!state.mapModeRequested)enterRoam();
    state.cityWelcome?.sync();if(state.self){$('welcomeModal').classList.add('hidden');if($('helpModal').classList.contains('hidden'))$('modalScrim').classList.add('hidden')}
    if(previousSelf!==JSON.stringify(state.self))renderAll();
    else{renderTop();renderChat();renderMapMarkers()}
  }catch(error){if(!state.loaded)toast(error.message)}finally{state.refreshing=false}
}
async function postAction(input){if((state.self?.life?.health<=0||state.self?.life?.arrested)){toast('Restart at home to continue');return null}if(input.type==='act'&&input.actionId==='cook')return lifeAction({type:'cook-inventory'});if(input.type==='act'&&['office','trade','cafe'].includes(input.actionId)){state.lifeUI?.show('work');return null}if(input.type==='act'&&input.actionId==='shopping'){state.lifeUI?.show('shops');return null}
  if(state.busy)return;state.busy=true;
  try{const data=await api('POST',input);if(data.self){state.self=data.self;if(input.type==='travel'||input.type==='start-exploring'||input.type==='explore-place'){state.position=[data.self.lng,data.self.lat];state.lastSentPosition=[...state.position];state.heading=data.self.heading||0;state.spawnChecked=false;state.spawnCorrectionPending=false;if(state.mode==='drive'){state.mode='walk';state.carSpeed=0;state.cabinView=false;document.body.classList.remove('cabin-mode');state.world3d?.setCabinView(false);state.world3d?.setDriving(false)}state.world3d?.setPosition(...state.position,state.heading);if(state.roam){updateNearby();followCamera(true)}}}if(data.event)toast(data.event);await refreshWorld();updateRoamHud();return data}
  catch(error){toast(error.message);return null}finally{state.busy=false;renderPlace()}
}

function initMap(){
  const Engine=window.maplibregl;
  if(!Engine){toast('Could not load the map library. Check your connection.');return}
  state.engine=Engine;
  const options={container:'map',center:[-0.1935,5.5515],zoom:14.7,minZoom:10,pitch:54,bearing:0,maxZoom:26,maxPitch:85,canvasContextAttributes:{antialias:true},maxBounds:[[ACCRA_BOUNDS.west,ACCRA_BOUNDS.south],[ACCRA_BOUNDS.east,ACCRA_BOUNDS.north]],style:cityMapStyle()};
  state.map=new Engine.Map(options);
  installPlaceIcons(state.map);
  state.sceneLoading=createSceneLoading(state.map,()=>state.mode);
  const canvas=state.map.getCanvas();let looking=false,lastLook=null;canvas.addEventListener('contextmenu',e=>{if(state.roam)e.preventDefault()});canvas.addEventListener('pointerdown',e=>{if(e.button!==2||!state.roam||state.view==='2d')return;looking=true;lastLook=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});canvas.addEventListener('pointermove',e=>{if(!looking)return;const dx=e.clientX-lastLook[0],dy=e.clientY-lastLook[1];lastLook=[e.clientX,e.clientY];if(state.mode==='indoor'){state.interior?.look?.(-dx*.2,dy*.12);return}if(state.mode==='walk')state.cameraBearing-=dx*.2;else state.lookOffset=(state.lookOffset||0)-dx*.2;state.lookPitch=Math.max(-18,Math.min(3,(state.lookPitch||0)+dy*.12))});for(const event of ['pointerup','pointercancel'])canvas.addEventListener(event,()=>{looking=false});

  state.map.on('load',()=>{PLACES.forEach(place=>{const el=document.createElement('button');el.className='poi-marker';el.type='button';el.setAttribute('aria-label',`Visit ${place.name}`);el.innerHTML=`<span class="poi-icon">${place.emoji}</span><span class="poi-label"></span>`;setPlaceIcon(el.querySelector('.poi-icon'),place);el.querySelector('.poi-label').textContent=place.name;el.addEventListener('click',e=>{e.stopPropagation();selectPlace(place.id)});const marker=new Engine.Marker({element:el,anchor:'bottom'}).setLngLat([place.lng,place.lat]).addTo(state.map);state.poiMarkers.set(place.id,marker)});try{installGroundDetail(state.map);state.satellite=installSatellite(state.map);state.roadGeometry=installRealBuildings(state.map);installOverheadMap(state.map);state.roadSurface=createRoadSurface(state.map);state.architecture=createArchitecture(state.map,()=>[...PLACES,...HOMES.map(h=>({...h,type:'Private home'})),...visibleMapPlaces()]);state.physics=createBuildingPhysics(state.map);state.safety=createStreetSafety(state.map,state.physics);state.world3d=createWorld3D(state.map,Engine);state.atmosphere=createAtmosphere(state.map,state.world3d);createTransit({state,action:lifeAction,navigate:p=>state.navigation?.to(p),arrive:resetJourney,places:PLACES,chat:()=>{state.chatChannel='place';if(!state.chatOpen)toggleRoamChat();refreshWorld()}}).then(t=>state.transit=t).catch(e=>toast(e.message));state.lifeUI=createLifeUI({state,action:lifeAction,navigate:p=>{if(state.mode==='indoor')exitInterior();state.navigation?.to(p)},enterHome:openHome,places:PLACES});state.lifeUI.sync();state.cityLife=createCityLife(state.map,state.physics,trafficHit,()=>state.scenery?.items.filter(i=>i.kind==='signal')||[]);state.scenery=createScenery(state.map,state.physics);state.navigation=createNavigation({map:state.map,places:PLACES,getPosition:()=>state.position,getMode:()=>state.mode,onAutoStart:rate=>{state.autoTrafficWait=0;state.autoBlockedFor=0;state.keys.clear();state.joystick={x:0,y:0};return lifeAction({type:'drive-speed',rate})},onSkip:place=>lifeAction({type:'drive-skip',lng:place.lng,lat:place.lat}),onSelect:()=>{state.keys.clear();if(!state.roam)enterRoam()}});state.overhead=createOverheadView({state});state.minimap=createMiniMap({state,places:()=>[...PLACES,...HOMES.map(h=>({...h,type:'Private home'})),...visibleMapPlaces()]});state.world3d.setPlayers(state.players,state.self?.id);updateCityLight();if(state.self&&!state.cityWelcome?.active&&!state.self.life?.explorationPending)enterRoam();else previewCity()}catch(error){console.error('3D world',error);toast('3D characters could not load on this device. The city map is still available.')}renderMapMarkers()});
  state.map.on('dragstart',()=>{if(state.view==='2d')state.overheadFollowing=false});
  state.map.on('click',e=>{if(state.roam&&state.view!=='2d')return;let place=null;if(e.point){const feature=state.map.queryRenderedFeatures(e.point,{layers:['worldfolk-map-places','worldfolk-poi-labels','worldfolk-poi-dots','worldfolk-place-labels'].filter(id=>state.map.getLayer(id))}).find(f=>f.properties?.name&&f.geometry?.type==='Point');if(feature?.properties?.placeId)place=placeForId(feature.properties.placeId);else if(feature){const coords=feature.geometry.coordinates;place=geoPlace(coords[0],coords[1],String(feature.properties.name),String(feature.properties?.type||feature.properties?.class||'Local place'),emojiForFeature(feature.properties))}}if(!state.roam)place??=geoPlace(e.lngLat.lng,e.lngLat.lat);if(place)selectPlace(place.id);else if(!state.roam)toast('Choose a spot within Accra')});
  state.map.on('moveend',()=>{if(state.panelTab==='places'&&!state.placeQuery)renderPlaces()});
  state.map.on('error',e=>console.warn('Map error',e.error?.message||String(e.error)));
}
function emojiForFeature(props){return placeEmoji(props)}
let cachedMapPlaces=[],lastMapPlaces=0;
function visibleMapPlaces(){if(performance.now()-lastMapPlaces<1000)return cachedMapPlaces;lastMapPlaces=performance.now();if(!state.map?.isStyleLoaded())return [];const found=new Map();try{for(const feature of state.map.querySourceFeatures('accralife-streets',{sourceLayer:'poi'})){const coords=feature.geometry?.coordinates,name=feature.properties?.name;if(feature.geometry?.type!=='Point'||!name||state.position&&metersBetween(state.position,coords)>500)continue;const place=geoPlace(coords[0],coords[1],String(name),String(feature.properties?.type||feature.properties?.class||'Local place'),emojiForFeature(feature.properties));if(place&&!found.has(place.id))found.set(place.id,place);if(found.size>=70)break}}catch(error){console.warn('Could not read map places',error)}cachedMapPlaces=[...found.values()];return cachedMapPlaces}

function flyTo(id,zoom=15.5){const p=placeForId(id);if(p&&state.map)state.map.flyTo({center:[p.lng,p.lat],zoom,pitch:state.tilted?58:42,duration:1050,essential:true})}
function selectPlace(id){const place=placeForId(id);if(!place)return;if(id.startsWith('g_')&&place.name!=='Map location'){try{sessionStorage.setItem(`accralife_place_${id}`,JSON.stringify({name:place.name,type:place.type,emoji:place.emoji}))}catch{}}if(state.cityWelcome?.active){if(!state.cityWelcome.select(place)){toast('Choose a highlighted public place or use the place search');return}state.selectedPlace=id;renderMapMarkers();if(state.self&&!state.self.life?.explorationPending){state.cityWelcome.explore();return}state.map?.flyTo({center:[place.lng,place.lat],zoom:16.1,pitch:55,duration:1200,essential:true});return}if(id.startsWith('g_')&&place.name!=='Map location'){try{sessionStorage.setItem(`accralife_place_${id}`,JSON.stringify({name:place.name,type:place.type,emoji:place.emoji}))}catch{}}state.selectedPlace=id;if(state.roam&&state.view==='2d'){visitFromMap(place);return}renderPlace();renderMapMarkers();flyTo(id);if(window.innerWidth<=760)openMobile('place')}
function renderMapMarkers(){
  state.poiMarkers.forEach((marker,id)=>{marker.getElement().classList.toggle('selected',id===state.selectedPlace);marker.getElement().hidden=id==='home'&&!!state.cityWelcome?.active});
  state.selectedMarker?.remove();state.selectedMarker=null;
  const selected=placeForId(state.selectedPlace);if(state.map?.getSource('worldfolk-map-places'))updateOverheadPlaces(state.map,PLACES,selected);if(selected?.id.startsWith('g_')&&state.map){const el=document.createElement('button');el.type='button';el.className='poi-marker selected';el.setAttribute('aria-label',`Selected: ${selected.name}`);el.innerHTML=`<span class="poi-icon">${selected.emoji}</span><span class="poi-label"></span>`;setPlaceIcon(el.querySelector('.poi-icon'),selected);el.querySelector('.poi-label').textContent=selected.name;state.selectedMarker=new state.engine.Marker({element:el,anchor:'bottom'}).setLngLat([selected.lng,selected.lat]).addTo(state.map)}
  state.playerMarkers.forEach(m=>m.remove());state.playerMarkers=[];
  if(!state.map||state.roam)return;
  const visible=state.players.slice(0,80);const counts={};
  visible.forEach(p=>{const place=placeForId(p.placeId);if(!place)return;const n=counts[p.placeId]||0;counts[p.placeId]=n+1;
    const angle=n*2.4;const radius=.00038+Math.sqrt(n)*.00016;
    const lng=place.lng+Math.cos(angle)*radius,lat=place.lat+Math.sin(angle)*radius;
    const el=document.createElement('button');el.type='button';el.className='player-marker'+(state.self?.id===p.id?' mine':'');el.setAttribute('aria-label',`${p.name} at ${place.name}`);
    const diamond=document.createElement('span');diamond.className='plumbob-mini';diamond.textContent='◆';
    const face=document.createElement('span');face.className='player-face';face.textContent=p.avatar;
    const name=document.createElement('span');name.className='player-name';name.textContent=playerLabel(p);
    el.append(diamond,face,name);el.addEventListener('click',e=>{e.stopPropagation();state.socialUI.show(p.id)});
    state.playerMarkers.push(new state.engine.Marker({element:el,anchor:'bottom'}).setLngLat([lng,lat]).addTo(state.map));
  });
}
function renderTop(){state.lifeUI?.sync();const p=state.self;$('clockText').textContent=p?clockText(p):'Day 1 · 08:00';$('onlineCount').textContent=state.onlineCount;$('moneyText').textContent=p?p.money.toLocaleString():'—';$('topAvatar').textContent=p?p.avatar:'◇';$('topName').textContent=p?.handle?playerLabel(p):'Sign in';$('simAvatar').textContent=p?p.avatar:'◇';$('simName').textContent=p?p.name:'Your story starts here';$('simSub').textContent=p?`${p.job} · Level ${p.level}`:'Create a Sim to enter the city';$('levelFill').style.width=p?`${p.xp%100}%`:'0%';$('levelLabel').textContent=p?`Level ${p.level} · ${p.xp%100} / 100 XP`:'Level 1 · 0 / 100 XP'}
function renderLife(){const p=state.self;const wrap=document.createElement('div');wrap.innerHTML='<h2 class="section-title">Your needs <small>Keep your Sim thriving</small></h2><div class="needs-grid"></div><div class="story-card"><span class="eyebrow">YOUR NEXT CHAPTER</span><h3>Build a life in Accra</h3><p>Go places, try new things and meet your neighbours.</p><div class="goals"></div></div><p class="tip">Tip: Search Accra, tap a place label or choose any spot on the map. Activities move time forward.</p>';
  const grid=wrap.querySelector('.needs-grid');NEEDS.forEach(([key,label,icon])=>{const value=Math.round(p?.[key]??0);const card=document.createElement('div');card.className='need-card';card.innerHTML=`<div class="need-card-head"><span>${icon}</span><strong>${label}</strong><span>${value}%</span></div><div class="need-bar ${value<25?'danger':value<45?'warning':''}"><i style="width:${value}%"></i></div>`;grid.appendChild(card)});
  const goals=[['Travel to a place',(p?.visits||0)>0],['Earn your first cedis',(p?.jobsDone||0)>0],['Say hello in chat',(p?.chatsSent||0)>0],['Upgrade your home',(p?.homeTier||0)>0]];
  const g=wrap.querySelector('.goals');goals.forEach(([name,done])=>{const row=document.createElement('div');row.className='goal'+(done?' done':'');row.innerHTML=`<span class="goal-check">${done?'✓':''}</span><span></span>`;row.lastElementChild.textContent=name;g.appendChild(row)});
  $('panelContent').replaceChildren(wrap);
}
function renderPlaces(){
  const wrap=document.createElement('div');wrap.innerHTML='<h2 class="section-title">Explore Accra <small>Every street is open</small></h2><p class="place-tip">Search neighbourhoods and streets, choose a map label, or tap anywhere in Accra.</p><input class="place-search" type="search" placeholder="Search Accra..." aria-label="Search Accra places" /><div class="place-list"></div>';
  const input=wrap.querySelector('input'),list=wrap.querySelector('.place-list');input.value=state.placeQuery;
  const addHeading=label=>{const h=document.createElement('h3');h.className='place-list-heading';h.textContent=label;list.appendChild(h)};
  const addPlace=(place,detail)=>{const b=document.createElement('button');b.type='button';b.className='place-item'+(state.selectedPlace===place.id?' active':'');b.innerHTML=`<span class="place-mini">${place.emoji}</span><span><strong></strong><small></small></span><span class="arrow">›</span>`;b.querySelector('strong').textContent=place.name;b.querySelector('small').textContent=detail||place.area;b.addEventListener('click',()=>selectPlace(place.id));list.appendChild(b)};
  const draw=()=>{const q=state.placeQuery.trim().toLocaleLowerCase();list.replaceChildren();const featured=PLACES.filter(p=>`${p.name} ${p.area} ${p.type}`.toLocaleLowerCase().includes(q));const visible=visibleMapPlaces().filter(p=>`${p.name} ${p.type}`.toLocaleLowerCase().includes(q)&&!featured.some(x=>x.id===p.id));
    if(featured.length){addHeading('Featured destinations');featured.forEach(p=>addPlace(p,p.area))}
    if(visible.length){addHeading('Places on this map');visible.slice(0,45).forEach(p=>addPlace(p,p.type))}
    if(state.searchResults.length){addHeading('More Accra locations');state.searchResults.forEach(result=>{const place=geoPlace(result.lng,result.lat,result.name,result.type,'📍');if(place)addPlace(place,result.detail)})}
    if(!featured.length&&!visible.length&&!state.searchResults.length){const empty=document.createElement('p');empty.className='place-empty';empty.textContent=q.length>=3?'No matching place yet. Try another name or tap its spot on the map.':'Zoom in to discover more map places.';list.appendChild(empty)}
  };
  input.addEventListener('input',()=>{state.placeQuery=input.value;state.searchResults=[];clearTimeout(searchTimer);const seq=++state.searchSeq;draw();if(input.value.trim().length<3)return;searchTimer=setTimeout(async()=>{try{const results=await searchMapPlaces(input.value.trim());if(seq!==state.searchSeq)return;state.searchResults=results.filter(x=>inAccra(x.lng,x.lat));draw()}catch(error){console.warn('Accra place search',error)}},450)});
  draw();$('panelContent').replaceChildren(wrap);
}
function renderCareer(){const p=state.self;const wrap=document.createElement('div');wrap.innerHTML=`<h2 class="section-title">Your career</h2><div class="career-feature"><div class="big-icon">💼</div><h3></h3><p>Work shifts around the city to earn cedis and experience.</p></div><div class="stat-line"><span>Shifts worked</span><strong>${p?.jobsDone||0}</strong></div><div class="stat-line"><span>Total experience</span><strong>${p?.xp||0} XP</strong></div><div class="stat-line"><span>Current balance</span><strong>₵${p?.money||0}</strong></div><p class="tip">Try an office shift in Airport City, trading at Makola Market, or a café shift in Osu.</p>`;wrap.querySelector('h3').textContent=p?.job||'Find your first job';const b=document.createElement('button');b.className='career-button';b.textContent='Browse jobs and shifts →';b.addEventListener('click',()=>state.lifeUI?.show('work'));wrap.appendChild(b);$('panelContent').replaceChildren(wrap)}
function renderHome(){const p=state.self,wrap=document.createElement('div');wrap.innerHTML='<h2 class="section-title">Your private home</h2><div class="home-feature"><div class="big-icon">🏡</div><h3></h3><p>Your apartment is assigned automatically. Buy homes, place furniture, and manage guest passes from My life.</p></div>';wrap.querySelector('h3').textContent=p?.life?.homeName||'Your starter apartment';const b=document.createElement('button');b.className='home-btn';b.textContent='Homes and guest passes →';b.disabled=!p;b.onclick=()=>state.lifeUI?.show('homes');wrap.append(b);$('panelContent').replaceChildren(wrap)}
function renderPanel(){document.querySelectorAll('.panel-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===state.panelTab));if(state.panelTab==='life')renderLife();else if(state.panelTab==='places')renderPlaces();else if(state.panelTab==='career')renderCareer();else renderHome()}
function renderPlace(){const p=placeForId(state.selectedPlace)||placeById.home;const here=state.self?.placeId===p.id;$('placeCategory').textContent=p.type.toUpperCase();$('placeEmoji').textContent=p.emoji;$('placeName').textContent=p.name;$('placeArea').textContent=p.area;$('placeDesc').textContent=p.description;
  const status=$('placeStatus');status.replaceChildren();if(here){status.textContent='◆ Your Sim is here'}else{const b=document.createElement('button');b.type='button';b.className='travel-button';b.textContent=state.self?'Set route →':'Create a Sim to explore';b.disabled=!state.self||state.busy;b.addEventListener('click',()=>state.navigation?.to(p));status.appendChild(b)}
  const ids=[...p.activities,'connect'];$('activitiesHeading').textContent=here?'Things to do here':'Things to do';$('activityCount').textContent=`${ids.length} activities`;
  const list=$('activities');list.replaceChildren();ids.forEach(id=>{const a=ACTIVITIES[id];const b=document.createElement('button');b.className='activity';b.type='button';b.disabled=!here||state.busy||id==='upgrade'&&(state.self.homeTier>=3||state.self.money<250*(state.self.homeTier+1));const detail=id==='upgrade'&&state.self?`₵${250*(state.self.homeTier+1)} · +25 XP`:a.detail;b.innerHTML=`<span class="activity-icon">${a.emoji}</span><span><strong></strong><small></small></span><span class="activity-arrow">›</span>`;b.querySelector('strong').textContent=a.name;b.querySelector('small').textContent=detail;b.addEventListener('click',()=>postAction({type:'act',actionId:id}));list.appendChild(b)});
}
function renderChat(){const p=state.self;const here=state.players.filter(x=>x.placeId===p?.placeId);$('chatCount').textContent=`· ${state.onlineCount} online`;$('peopleRow').replaceChildren();here.slice(0,7).forEach(x=>{const s=document.createElement('span');s.className='person-avatar';s.title=x.name;s.textContent=x.avatar;$('peopleRow').appendChild(s)});const caption=document.createElement('span');caption.className='people-caption';caption.textContent=here.length?`${here.length} here now`:'No one here yet';$('peopleRow').appendChild(caption);
  document.querySelectorAll('.chat-channels button[data-channel]').forEach(b=>b.classList.toggle('active',b.dataset.channel===state.chatChannel));
  $('unmuteAll').classList.toggle('hidden',state.muted.size===0);
  const box=$('chatMessages');const nearBottom=box.scrollHeight-box.scrollTop-box.clientHeight<40;box.replaceChildren();if(!state.messages.some(m=>!state.muted.has(m.player_id))){const empty=document.createElement('p');empty.className='chat-empty';empty.textContent=state.chatChannel==='city'?'The city is quiet. Say the first hello!':'No local messages yet. Start a conversation.';box.appendChild(empty)}
  state.messages.filter(m=>!state.muted.has(m.player_id)).forEach(m=>{const row=document.createElement('div');row.className='chat-message'+(m.player_id===p?.id?' mine':'');const avatar=document.createElement('div');avatar.className='message-avatar';avatar.textContent=m.avatar;const bubble=document.createElement('div');bubble.className='message-bubble';const meta=document.createElement('div');meta.className='message-meta';const name=document.createElement('button');name.className='chat-profile-link';name.textContent=playerLabel(m);name.onclick=()=>state.socialUI.show(m.player_id);const time=document.createElement('time');time.textContent=new Date(m.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});const body=document.createElement('p');body.textContent=m.body;meta.append(name,time);if(m.player_id!==p?.id){const mute=document.createElement('button');mute.type='button';mute.className='mute-player';mute.textContent='Mute';mute.title=`Hide messages from ${m.name}`;mute.addEventListener('click',()=>{state.muted.add(m.player_id);localStorage.setItem('accralife_muted',JSON.stringify([...state.muted]));renderChat();toast(`${m.name} muted in this browser`)});meta.appendChild(mute)}bubble.append(meta,body);row.append(avatar,bubble);box.appendChild(row)});if(nearBottom)box.scrollTop=box.scrollHeight;
  $('chatInput').disabled=!p?.handle;$('chatInput').placeholder=p?.handle?'Say hello to Accra...':'Sign in to chat';$('chatForm').querySelector('button').disabled=!p?.handle;
}
function renderAll(){renderTop();renderPanel();renderPlace();renderChat();renderMapMarkers()}
function openMobile(kind){if(window.innerWidth>760&&!document.body.classList.contains('touch-device'))return;const left=$('leftPanel'),right=document.querySelector('.right-stack');left.classList.remove('mobile-open');right.classList.remove('place-mobile','chat-mobile');document.querySelectorAll('.mobile-dock button').forEach(b=>b.classList.toggle('active',b.dataset.mobile===kind));if(kind==='sim'||kind==='places'){left.classList.add('mobile-open');state.panelTab=kind==='places'?'places':'life';renderPanel()}else if(kind==='chat')right.classList.add('chat-mobile');else if(kind==='place')right.classList.add('place-mobile')}

function metersBetween(a,b){const dx=(a[0]-b[0])*111320*Math.cos(a[1]*Math.PI/180),dy=(a[1]-b[1])*111320;return Math.hypot(dx,dy)}
function nearbyPlace(){if(!state.position)return null;let closest=null,distance=Infinity;for(const place of [...PLACES,...visibleMapPlaces()]){const d=metersBetween(state.position,[place.lng,place.lat]);if(d<distance){closest=place;distance=d}}return distance<=80?closest:geoPlace(...state.position,'Explore this street','Street','✨')}
function updatePlayerLocation(now=performance.now()){
 if(!state.position)return;const modeChanged=state.locationMode!==state.mode;if(!modeChanged&&now-(state.locationUpdated||0)<500)return;state.locationUpdated=now;state.locationMode=state.mode;
 const home=state.self&&placeForId(state.self.life.homeId);
 state.currentLocation=home&&state.mode==='walk'&&metersBetween(state.position,[home.lng,home.lat])<10?{label:home.name,area:home.area,prefix:'AT HOME',description:`At your home in ${home.area}`} : resolvePlayerLocation({position:state.position,mode:state.mode,indoorPlace:state.indoorPlace,roads:roadFeatures(state.map),places:[...PLACES,...visibleMapPlaces()],district:districtAt(state.position)});
 const location=state.currentLocation;$('roamLocation').textContent=location.label;$('roamLocation').title=location.description;$('roamLocation').setAttribute('aria-label',location.description);$('roamKicker').textContent=`${location.prefix} · ${location.area}`;
}
function updateRoamHud(){
  if(!state.roam||!state.self)return;
  updatePlayerLocation();
  $('runToggle').setAttribute('aria-pressed',String(state.running));$('runToggle').disabled=!!state.self?.life?.rest||!['walk','indoor'].includes(state.mode);
  const p=state.self,near=state.nearestPlace,door=state.nearDoor,mode=state.mode;if(mode==='flight')return;
  $('roamHud').dataset.position=state.position?.join(',')||'';$('roamHud').dataset.mode=mode;
  $('roamEnergy').style.width=`${p.energy}%`;$('roamHunger').style.width=`${p.hunger}%`;

  $('vehicleButton').classList.toggle('hidden',mode==='indoor'||mode==='walk'&&!state.nearCar&&!state.nearTrafficCar);$('vehicleButton').textContent=mode==='drive'?'F · Park and exit':state.nearTrafficCar?'F · Steal NPC car':`F · Ride ${state.self?.life?.vehicle||'car'}`;
  $('viewButton').classList.toggle('hidden',mode!=='drive');$('viewButton').textContent=state.cabinView?'V · Exterior view':'V · Driver view';$('vehicleCabin').querySelector('.cabin-gauge').firstChild.textContent=Math.round(Math.abs(state.carSpeed)*3.6);
  if(mode==='indoor'){
    const hotspot=state.interior?.nearby();$('roamNearby').textContent=state.interior?.description||(venueKind(state.indoorPlace)==='market'?'Explore the stalls · buy fresh produce':venueKind(state.indoorPlace)==='beach'?'Enjoy the coast and ocean views':'Explore the room and its furnishings');$('roamPromptText').textContent=p.life.shift?.version===2&&hotspot?.kind!=='exit'?'Open work assignment':hotspot?.label||'Move toward something to interact';$('roamInstructions').textContent=p.life.rest?`E · ${hotspot?.label||'Stand up'} · Q / R look · C chat`:'WASD move · Shift run · Q/R look · E use / exit · C chat';$('roamSpeed').textContent='';$('roamPrompt').classList.toggle('available',!!hotspot||p.life.shift?.version===2);return;
  }
  if(mode==='drive'){
    $('roamNearby').textContent=state.blockedHint?'Obstacle ahead · brake or reverse':'W accelerate · S brake · A / D steer';$('roamPromptText').textContent=Math.abs(state.carSpeed)<1?'Leave vehicle':'Slow down to leave vehicle';$('roamInstructions').textContent='W / S drive · A / D steer · Space brake · F exit · N destination · V view';$('roamSpeed').textContent=`${Math.round(Math.abs(state.carSpeed)*3.6)} km/h`;$('roamPrompt').classList.toggle('available',Math.abs(state.carSpeed)<1);return;
  }
  $('roamSpeed').textContent='';$('roamInstructions').textContent='WASD / arrows move · Shift run · Q / R camera · E interact · F car · N route · K view · Right-drag look';
  $('roamNearby').textContent=state.blockedHint?'Obstacle ahead · move around it':door&&door.distance<8?`Entrance ${Math.round(door.distance)} m away`:state.nearCar?`Car ${Math.round(metersBetween(state.position,state.carPosition))} m away`:near?`${Math.round(metersBetween(state.position,[near.lng,near.lat]))} m away · ${near.type}`:'Explore the streets';
  const agent=state.position&&STREET_SERVICES.find(p=>metersBetween(state.position,[p.lng,p.lat])<45);const prompt=near?.id===state.self.life.homeId?'Enter your home':agent?`Visit ${agent.name}`:state.nearResident?`Talk to ${state.nearResident.name} · resident`:door&&door.distance<4?'Enter building':near?`Interact with ${near.name}`:'Walk toward a glowing marker';$('roamPromptText').textContent=prompt;$('roamPrompt').classList.toggle('available',!!(agent||state.nearResident||door&&door.distance<4||near));
}
function updateNearby(){
  if(!state.position||state.mode==='indoor')return;
  state.physics?.refresh(state.position);updateDistrict();
  if(!state.sidewalkChecked&&state.mode==='walk'&&state.safety?.at(state.position).kind!=='off-road'){state.sidewalkChecked=true;const safe=state.safety.sidewalk(state.position);if(metersBetween(safe,state.position)>.5&&metersBetween(safe,state.position)<35){state.position=safe;state.spawnCorrectionPending=true;state.world3d?.setPosition(...safe,state.heading);sendMove();}}
  if(!state.spawnChecked&&state.physics?.count){state.spawnChecked=true;const radius=state.mode==='drive'?1.15:.7;if(state.physics.collision(state.position,radius)){const open=state.physics.findOpen(state.position,radius);if(metersBetween(open,state.position)<35){state.position=open;state.spawnCorrectionPending=true;if(state.mode==='drive')state.carPosition=[...open];state.world3d?.setPosition(...open,state.heading);if(state.mode==='drive')state.world3d?.setCarPosition(...open,state.heading);sendMove();followCamera(true)}}}
  state.nearResident=state.cityLife?.nearby(state.position)||null;const ownedHome=placeForId(state.self.life.homeId);state.nearestPlace=ownedHome&&metersBetween(state.position,[ownedHome.lng,ownedHome.lat])<10?ownedHome:nearbyPlace();state.nearDoor=state.physics?.nearestDoor(state.position,24)||null;
  state.nearTrafficCar=state.mode==='walk'&&!state.self?.life?.shift?state.cityLife?.nearVehicle(state.position):null;state.nearCar=canUseVehicle(state.self?.life)&&state.mode==='walk'&&!!state.carPosition&&metersBetween(state.position,state.carPosition)<7.5;
  if(state.nearDoor){const names=[...PLACES,...visibleMapPlaces()].filter(p=>metersBetween([p.lng,p.lat],state.nearDoor.position)<55).sort((a,b)=>metersBetween([a.lng,a.lat],state.nearDoor.position)-metersBetween([b.lng,b.lat],state.nearDoor.position));state.nearDoor.place=names[0]||null}
  // Facade windows are textured directly on the MapLibre walls.

  state.world3d?.setDoors(state.nearDoor?[{lng:state.nearDoor.facade[0],lat:state.nearDoor.facade[1],heading:state.nearDoor.heading}]:[]);
  const nearby=PLACES.filter(p=>metersBetween(state.position,[p.lng,p.lat])<180).sort((a,b)=>metersBetween(state.position,[a.lng,a.lat])-metersBetween(state.position,[b.lng,b.lat]));if(state.nearestPlace&&!nearby.some(p=>p.id===state.nearestPlace.id))nearby.unshift(state.nearestPlace);state.world3d?.setBeacons(nearby);updateRoamHud();
}
function followCamera(force=false,dt=1/60){
  if(state.cityWelcome?.active||!state.map||!state.position||state.mode==='indoor')return;
  if(state.view==='2d'){const moving=state.movementSpeed>.08||state.mode==='transit'||state.mode==='flight';if(moving)state.overheadFollowing=true;if(force||state.overheadFollowing)state.map.jumpTo({center:state.position,pitch:0,bearing:0});return}
  if(force||!state.cameraPosition){state.cameraPosition=[...state.position];state.cameraHeading=state.cameraBearing}
  state.cameraPosition=state.cameraPosition.map((v,i)=>damp(v,state.position[i],12,dt));
  const cameraLag=metersBetween(state.cameraPosition,state.position);if(cameraLag>1.5)state.cameraPosition=state.position.map((v,i)=>v+(state.cameraPosition[i]-v)*1.5/cameraLag);
  state.cameraHeading=turnToward(state.cameraHeading,state.cameraBearing+(state.lookOffset||0),6,dt);
  const pose=chaseCamera({position:state.cameraPosition,heading:state.cameraHeading,physics:state.physics,driving:['drive','transit'].includes(state.mode),scenic:state.scenicCamera,street:state.cameraMode==='street',cabin:state.mode==='transit'?state.cabinView:state.cabinView||state.cameraMode==='first',speed:state.carSpeed,viewScale:state.mobileCameraScale||1,previousDistance:force?undefined:state.cameraDistance,dt});
  const fov=state.cameraMode==='first'?64:58;if(state.cameraFov!==fov){state.map.setVerticalFieldOfView(fov);state.cameraFov=fov}
  state.cameraDistance=pose.distance;state.world3d?.setCameraDistance(pose.distance);
  const bump=['drive','transit'].includes(state.mode)?state.roadSurface?.sample():null;state.world3d?.setRoadJolt(bump?.bounce||0,bump?.roll||0);
  const camera=state.map.calculateCameraOptionsFromTo(pose.from,pose.altitude+(bump?.bounce||0)*.16,pose.to,pose.targetAltitude);
  state.map.jumpTo({...camera,pitch:Math.max(45,Math.min(85,camera.pitch+(bump?.pitch||0)+(state.lookPitch||0))),bearing:state.cameraHeading});
}
function openDrivingHeading(position){if(!state.physics?.count)return state.heading;let best=state.heading,bestDistance=-1;for(let heading=0;heading<360;heading+=30){const angle=heading*Math.PI/180;let distance=0;for(let metres=2;metres<=16;metres+=2){const point=[position[0]+Math.sin(angle)*metres/(111320*Math.cos(position[1]*Math.PI/180)),position[1]+Math.cos(angle)*metres/111320];if(state.physics.collision(point,1.15))break;distance=metres}if(distance>bestDistance){best=heading;bestDistance=distance}}return best}
function enterRoam(){
  if(!state.self?.handle){state.accountUI?.show('register');return}
  if(!state.self||state.self.life?.explorationPending){state.cityWelcome?.show();toast('Choose your starting place on the map');return}if(!state.world3d){toast('The 3D city is still loading');return}if(state.roam)return;
  state.cityWelcome?.hide();state.world3d?.setPreview(false);state.roam=true;state.mapModeRequested=false;state.mode=state.self.driving?'drive':'walk';state.cabinView=state.mode==='drive'&&state.cameraMode==='first';document.body.classList.toggle('cabin-mode',state.cabinView);state.world3d?.setCabinView(state.cabinView);state.position??=[state.self.lng,state.self.lat];state.lastSentPosition=[...state.position];state.heading=state.self.heading||0;state.cameraBearing=state.heading;state.spawnChecked=false;
  state.physics?.refresh(state.position,true);
  if(state.physics?.count&&state.physics.collision(state.position,state.mode==='drive'?1.15:.7)){const open=state.physics.findOpen(state.position,state.mode==='drive'?1.15:.7);if(metersBetween(open,state.position)<35){state.position=open;state.spawnCorrectionPending=true}}
  if(state.mode==='drive')state.carPosition=[...state.position];else if(!state.carPosition){const lat=state.position[1],near=[state.position[0]+3/(111320*Math.cos(lat*Math.PI/180)),lat];state.carPosition=state.physics?.findOpen(near,2.1)||near;state.carHeading=openDrivingHeading(state.carPosition)}
  state.world3d.setIdentity(state.self);state.world3d.setSelf(state.self.avatar);state.world3d.setVehicleOwned(canUseVehicle(state.self.life));state.world3d.setVehicleKind(state.self.life?.vehicle||'car');state.world3d.setOutfit(state.self.life?.outfit);state.world3d.setPosition(...state.position,state.heading);state.world3d.setCarPosition(...state.carPosition,state.carHeading);state.world3d.setDriving(state.mode==='drive');state.world3d.setCabinView(false);state.world3d.setEnabled(state.view!=='2d');
  state.map.dragPan.disable();state.map.dragRotate.disable();state.map.touchZoomRotate.disable();state.map.doubleClickZoom.disable();document.body.classList.add('roam-mode');$('roamHud').classList.remove('hidden');$('roamToggle').textContent='◫ City map';state.keys.clear();state.lastFrame=performance.now();updateNearby();renderMapMarkers();followCamera(true);if(state.spawnCorrectionPending)sendMove();syncLife();restoreHomeInterior();requestAnimationFrame(roamFrame)
}
// Camera selection never stops or resets the shared gameplay simulation.
function setPlayView(view){
 if(!state.roam){enterRoam();if(!state.roam)return}
 if(view==='2d'&&state.mode==='indoor'){exitInterior();if(state.mode==='indoor')return}
 state.view=view;if(view==='2d'){state.map.setVerticalFieldOfView(36.87);state.cameraFov=36.87}setMapPresentation(state.map,view==='2d');state.overheadFollowing=true;state.mapModeRequested=false;updateCityLight();
 document.body.classList.toggle('map-play',view==='2d');state.cabinView=state.mode==='drive'&&view==='3d'&&state.cameraMode==='first';document.body.classList.toggle('cabin-mode',state.cabinView);state.world3d?.setCabinView(state.cabinView);state.world3d?.setEnabled(view!=='2d');
 for(const key of ['show3dBuildings','show3dFacades','show3dLandmarks','show3dTrees'])try{state.map.setConfigProperty?.('basemap',key,key==='show3dTrees'?view!=='2d':false)}catch{}
 for(const id of ['accralife-real-buildings','worldfolk-pavement','worldfolk-asphalt','worldfolk-road-edges','worldfolk-footpaths','worldfolk-road-markings'])if(state.map.getLayer(id))state.map.setLayoutProperty(id,'visibility',view==='2d'?'none':'visible');
 if(view==='2d'){state.map.dragPan.enable();state.map.touchZoomRotate.enable();state.map.touchZoomRotate.disableRotation();state.map.jumpTo({center:state.position,pitch:0,bearing:0,zoom:16.8-Math.log2(state.mobileCameraScale||1)})}else{state.map.dragPan.disable();state.map.touchZoomRotate.disable();state.cameraBearing=state.heading;followCamera(true)}
 $('roamToggle').textContent=view==='2d'?'▶ 3D view':'◫ 2D map';$('viewModeToggle').textContent=view==='2d'?'3D':'2D';$('viewModeToggle').setAttribute('aria-label',view==='2d'?'Switch to 3D view':'Switch to 2D map');renderMapMarkers();updateRoamHud();
}
function exitRoam(){setPlayView(state.view==='2d'?'3d':'2d')}
async function visitFromMap(place){
 if(state.interactionPending)return;state.selectedPlace=place.id;setPlayView('3d');
 if(state.mode==='walk'&&metersBetween(state.position,[place.lng,place.lat])<65){if(place.id==='home'||place.id.startsWith('p_')){await openHome(place.id==='home'?placeForId(state.self.life.homeId):place);return}state.interactionPending=true;state.keys.clear();state.walkVelocity=[0,0];try{await flushMove();const result=await postAction({type:'enter',placeId:place.id});if(result){openVenueScene(place);return}}finally{state.interactionPending=false}}
 state.navigation?.to(place);toast(`3D view · follow the route to ${place.name}`);
}

function movementObstacles(driving){
 const self={heading:state.heading,driving,vehicle:state.self.life.vehicle,radius:.3};
 const shape=p=>({position:p.position,radius:9,gap:position=>footprintGap({...self,position},p)});
 const circles=driving?[]:(state.cityLife?.actors||[]).map(shape);
 for(const item of state.scenery?.items||[])circles.push(shape({position:item.position,radius:['stall','momo','vendor'].includes(item.kind)?1.1:item.kind==='bench'?.7:.2}));
 if(!driving&&state.carPosition&&canUseVehicle(state.self?.life))circles.push(shape({position:state.carPosition,heading:state.carHeading,driving:true,vehicle:state.self.life.vehicle}));
 return circles;
}
function roamFrame(now){
  updatePlayerLocation(now);state.minimap?.update(now);
  if(!state.roam){state.audio.update({active:false});return;}
  requestAnimationFrame(roamFrame);
  state.sceneLoading?.update();
  const dt=Math.min(.05,(now-state.lastFrame)/1000||0);state.lastFrame=now;
  const locked=state.returningHome||state.sessionPaused||state.moveSyncPaused||(state.mode!=='indoor'&&!state.sceneLoading?.ready)||document.body.classList.contains('game-menu-open')||document.body.classList.contains('mobile-paused')||(state.self?.life?.health<=0||state.self?.life?.arrested)||state.transit?.isOpen||state.actionMenuOpen||state.chatOpen||state.navigation?.isOpen||state.interactionPending||state.lifeUI?.isOpen||state.accountUI?.isOpen||state.adsUI?.isOpen||state.socialUI?.isOpen||workLocked()||/INPUT|TEXTAREA/.test(document.activeElement?.tagName||'');
  state.audio.update({active:!locked,mode:state.mode,speed:state.mode==='transit'?state.transit?.speed:state.carSpeed,moving:Math.hypot(...state.walkVelocity)>.1,running:state.running||state.keys.has('ShiftLeft')||state.keys.has('ShiftRight'),rain:worldAtmosphere().weather==='rain',venue:state.mode==='indoor'?state.interior?.programme:null});
  if(now-(state.lastLifeHud||0)>250){state.lastLifeHud=now;state.lifeUI?.tick();updateLifeStatus();updateSurvival()}
  if(state.mode!=='indoor'){state.roadGeometry?.update(state.position);state.roadSurface?.update(state.position);state.world3d.setPotholes(state.roadSurface?.holes||[]);if(state.view!=='2d'){state.architecture?.update(state.position);state.world3d.setArchitecture(state.architecture?.details||[]);}}
  if((state.self?.life?.health<=0||state.self?.life?.arrested)){state.overhead?.update(now);return}if(state.self?.life?.transit&&state.transit){for(let step=0;step<state.transit.rate;step++){state.transit.tick(dt);state.cityLife?.tick(dt,state.position,now,state.mode)}updateDistrict();state.scenery?.update(state.position);state.world3d.setScenery(state.scenery?.items||[]);state.world3d.setAmbient(state.cityLife?.actors||[]);followCamera(false,dt);state.overhead?.update(now);return}if(state.mode==='flight'){flightFrame(now);state.overhead?.update(now);return}
  const held=(a,b)=>state.keys.has(a)||state.keys.has(b);
  let x=locked?0:state.joystick.x+(held('KeyD','ArrowRight')?1:0)-(held('KeyA','ArrowLeft')?1:0),y=locked?0:state.joystick.y+(held('KeyW','ArrowUp')?1:0)-(held('KeyS','ArrowDown')?1:0);
  x=Math.max(-1,Math.min(1,x));y=Math.max(-1,Math.min(1,y));
  if(state.mode==='indoor'){
    if(!locked){if(state.keys.has('KeyQ'))state.interior?.look?.(-75*dt);if(state.keys.has('KeyR'))state.interior?.look?.(75*dt)}
    state.walkVelocity=state.interior?.isActing?[0,0]:stepWalker(state.walkVelocity,x,y,state.interior?.bearing||0,state.running||state.keys.has('ShiftLeft')||state.keys.has('ShiftRight'),dt);const moving=Math.hypot(...state.walkVelocity)>.08;
    if(moving)state.interior?.move(state.walkVelocity[0]*dt,-state.walkVelocity[1]*dt);
    if(state.self?.life?.shift&&now-(state.lastWorkAnimation||0)>2300){state.interior?.playAction('office');state.lastWorkAnimation=now}state.interior?.render(now/1000,moving,state.cameraMode);if(now-state.lastHud>150){state.lastHud=now;updateRoamHud()}state.overhead?.update(now);return;
  }
  const before=[...state.position];
  if(state.mode==='drive'){
    if(state.navigation?.autoDriving&&(Math.abs(x)>.1||Math.abs(y)>.1||state.keys.has('Space')))state.navigation.stopAuto('Manual driving');
    const simulationSteps=state.navigation?.autoDriving&&!locked?state.navigation.autoRate:1;
    for(let simulation=0;simulation<simulationSteps;simulation++){
    const stepBefore=[...state.position];
    let auto=null;if(state.navigation?.autoDriving&&!locked){
      state.cityLife?.setPriority(state.position,state.heading,now);
      auto=autoDriveInput(state.navigation.coordinates,state.position,state.heading,state.carSpeed);
      auto=autoTrafficControl(auto,state.carSpeed,trafficSpeed(state.position,state.heading,state.carSpeed,22,state.cityLife?.actors||[]),signalSpeedLimit(state.position,state.heading,state.scenery?.items.filter(i=>i.kind==='signal')||[]),state.autoTrafficWait||0,dt);
      state.autoTrafficWait=auto.waiting;x=auto.turn;y=auto.throttle;
      if(auto.offRoute)state.navigation.stopAuto('Off route · recalculate or skip arrival');
      if(auto.done&&Math.abs(state.carSpeed)<.2){state.carSpeed=0;state.navigation.stopAuto('Arrived · press F to park');break}
    }
    const next=stepCar(state.carSpeed,state.steer,state.heading,y,x,locked||state.keys.has('Space')||!!auto?.brake,dt,state.self.life?.vehicle==='motorcycle');
    state.carSpeed=next.speed;state.steer=next.steer;
    if(!state.physics?.vehicleCollision(state.position,next.heading,state.self.life?.vehicle)||state.physics.vehicleDepth(state.position,next.heading,state.self.life?.vehicle)<state.physics.vehicleDepth(state.position,state.heading,state.self.life?.vehicle))state.heading=next.heading;
    state.cameraBearing=state.heading;$('vehicleCabin').style.setProperty('--steer',`${Math.round(state.steer*42)}deg`);
    const angle=state.heading*Math.PI/180,drift=(state.carDrift||[0,0]).map(v=>v*Math.exp(-dt*3)),velocity=[Math.sin(angle)*state.carSpeed+drift[0],Math.cos(angle)*state.carSpeed+drift[1]],candidate=offsetMetres(state.position,velocity[0]*dt,velocity[1]*dt);
    const surface=inAccra(...candidate)?moveAroundObstacles(state.position,candidate,movementObstacles(true),(a,b)=>state.physics?.moveVehicle(a,b,state.heading,state.self.life?.vehicle)||{position:b,blocked:false},true):{position:state.position,blocked:true};
    const resolved=driveWithContacts(state.position,surface.position,{heading:state.heading,driving:true,vehicle:state.self.life?.vehicle},velocity,state.cityLife?.actors||[],state.physics,now);
    resolved.blocked ||= surface.blocked;if(resolved.hits||resolved.blocked&&Math.abs(state.carSpeed)>3)state.audio.effect('impact');
    const forward=resolved.velocity[0]*Math.sin(angle)+resolved.velocity[1]*Math.cos(angle);state.carSpeed=forward;state.carDrift=resolved.velocity.map((v,i)=>v-forward*(i?Math.cos(angle):Math.sin(angle)));
    if(state.navigation?.autoDriving){state.autoBlockedFor=resolved.blocked?(state.autoBlockedFor||0)+dt:0;if(state.autoBlockedFor>5)state.navigation.stopAuto('Road blocked · recalculate or skip arrival');}
    state.blockedHint=Math.abs(state.carSpeed)>.05&&resolved.blocked;if(resolved.blocked)state.carSpeed=metersBetween(stepBefore,resolved.position)>Math.abs(state.carSpeed)*dt*.2?state.carSpeed*.8:0;
    state.roadSurface?.hit(state.position,resolved.position,state.carSpeed);state.position=resolved.position;state.carPosition=[...state.position];state.carHeading=state.heading;state.world3d.setCarPosition(...state.carPosition,state.carHeading);
    if(simulationSteps>1)state.cityLife?.tick(dt,state.position,now,state.mode);
    if(!state.navigation?.autoDriving)break;
    }
  }else{
    state.walkVelocity=stepWalker(state.walkVelocity,x,y,state.view==='2d'?0:state.cameraBearing,state.running||state.keys.has('ShiftLeft')||state.keys.has('ShiftRight'),dt);
    const [east,north]=state.walkVelocity,candidate=offsetMetres(state.position,east*dt,north*dt);
    state.cityLife?.nudgePedestrians(state.position,candidate,state.mode==='drive');
    const resolved=inAccra(...candidate)?moveAroundObstacles(state.position,candidate,movementObstacles(false),(a,b)=>state.physics?.move(a,b,.3)||{position:b,blocked:false}):{position:state.position,blocked:true};
    state.blockedHint=Math.hypot(east,north)>.1&&resolved.blocked;state.position=resolved.position;
    if(Math.hypot(east,north)>.1)state.heading=turnToward(state.heading,(Math.atan2(east,north)*180/Math.PI+360)%360,14,dt);
    if(!locked&&state.view!=='2d'){if(state.keys.has('KeyQ'))state.cameraBearing-=75*dt;if(state.keys.has('KeyR'))state.cameraBearing+=75*dt}
  }
  const speed=dt?metersBetween(before,state.position)/dt:0;state.movementSpeed=speed;state.world3d.setPosition(...state.position,state.heading);state.world3d.setMoving(speed>.08,speed);
  state.scenery?.update(state.position);state.world3d.setScenery(state.scenery?.items||[]);state.cityLife?.tick(dt,state.position,now,state.mode);state.world3d.setAmbient(state.cityLife?.actors||[]);
  followCamera(false,dt);state.navigation?.update(now);
  if(now-state.lastMoveSend>450&&!state.moveInFlight)sendMove();
  if(now-state.lastNearbyCheck>500){state.lastNearbyCheck=now;updateNearby()}
  if(now-state.lastHud>120){state.lastHud=now;updateRoamHud()}
  state.overhead?.update(now);
}
async function flushMove(){while(state.moveInFlight)await new Promise(resolve=>setTimeout(resolve,40));if(performance.now()-state.lastMoveSend<200)await new Promise(resolve=>setTimeout(resolve,200));await sendMove()}
async function sendMove(){
 if(state.sessionPaused||!state.position||['indoor','flight','transit'].includes(state.mode)||(state.self?.life?.health<=0||state.self?.life?.arrested)||workLocked()||state.moveInFlight||state.lastSentPosition&&metersBetween(state.position,state.lastSentPosition)<.04)return;
 state.lastMoveSend=performance.now();state.moveInFlight=true;const position=[...state.position];
 try{
  const move={lng:position[0],lat:position[1],heading:state.heading,spawnCorrection:state.spawnCorrectionPending};
  if(realtime.connected)await realtime.move(move);else await api('POST',{type:'move',...move});
  state.lastSentPosition=position;state.spawnCorrectionPending=false;state.moveSyncPaused=false;
 }catch(error){
  const reason=movementFailure(error);
  if(reason==='corrected')return;
  if(reason==='rejected'&&!state.spawnCorrectionPending){const fresh=await api('GET').catch(()=>null);if(fresh?.self&&correctedPosition(state,fresh.self))followCamera(true)}
  else{
   if(reason==='offline'&&!state.moveSyncPaused)toast('Connection interrupted · keeping your place while reconnecting');
   state.moveSyncPaused=reason!=='retry';if(state.moveSyncPaused){state.carSpeed=0;state.walkVelocity=[0,0];state.carDrift=[0,0]}
   clearTimeout(finalMoveTimer);finalMoveTimer=setTimeout(sendMove,reason==='retry'?300:reason==='rejected'?8000:1000);
  }
 }finally{state.moveInFlight=false}
}
function showActions(place,onlyIds=null){state.actionMenuOpen=true;state.keys.clear();$('roamActionMenu').classList.remove('hidden');$('roamActionTitle').textContent=place.name;const list=$('roamActionList');list.replaceChildren();(onlyIds||[...place.activities,'connect']).forEach((id,index)=>{const activity=ACTIVITIES[id];if(!activity)return;const button=document.createElement('button');button.type='button';button.className='roam-action';button.innerHTML=`<span class="roam-action-key">${index+1}</span><span class="roam-action-icon">${activity.emoji}</span><span><strong></strong><small></small></span>`;button.querySelector('strong').textContent=activity.name;button.querySelector('small').textContent=activity.detail;button.addEventListener('click',async()=>{button.disabled=true;const result=await postAction({type:'act',actionId:id});if(result){state.world3d?.playAction();closeActions()}else button.disabled=false});list.appendChild(button)})}
function closeActions(){state.actionMenuOpen=false;$('roamActionMenu').classList.add('hidden')}

async function enterInterior(){if(state.view==='2d')setPlayView('3d');if(state.interactionPending)return;const target=state.navigation?.destination;if(target?.id?.startsWith('p_')&&metersBetween(state.position,[target.lng,target.lat])<85){await openHome(placeForId(target.id));return}const door=state.nearDoor;if(!door||door.distance>=4)return;const raw=door.place||geoPlace(...door.position,'Accra building','Building','🏢');if(!raw)return;const estate=HOMES.find(h=>metersBetween([raw.lng,raw.lat],[h.lng,h.lat])<35);if(estate&&raw.id!=='home'){if(state.self.life.properties.includes(estate.id)){await openHome(placeForId(propertyId(state.self.id,estate.id)));return}toast('Private residence · an owner’s guest pass is required');state.lifeUI?.show('homes');return}if(raw.id==='home'){await openHome(placeForId(state.self.life.homeId));return}const place=/^(Map location|Explore this street)$/.test(raw.name)?{...raw,name:'Accra building',type:'Building',emoji:'🏢'}:raw;state.interactionPending=true;state.keys.clear();state.walkVelocity=[0,0];await flushMove();const result=await postAction({type:'enter',placeId:place.id});state.interactionPending=false;if(!result)return;state.selectedPlace=place.id;state.indoorPlace=place;state.interior=createInterior3D({design:interiorDesign(place,state.architecture?.details),avatar:state.self.avatar,identity:state.self.id,outfit:state.self.life?.outfit,kind:interiorDesign(place,state.architecture?.details).kind,name:place.name,activities:place.activities});state.mode='indoor';state.keys.clear();state.world3d?.setEnabled(false);document.body.classList.add('indoor-mode');$('roamToggle').textContent='◫ City map';updateRoamHud();renderPlace();toast(`Entered ${place.name}`)}
function exitInterior(){if(state.self?.life?.rest){toast(state.self.life.rest.kind==='sleep'?'Choose Wake up before leaving':'Choose Stand up before leaving');return}if(workLocked()){state.lifeUI?.show('work');return}if(state.mode!=='indoor')return;state.interior?.destroy();state.interior=null;state.indoorPlace=null;state.mode='walk';document.body.classList.remove('indoor-mode');state.world3d?.setEnabled(state.view!=='2d');state.keys.clear();state.spawnChecked=false;state.physics?.refresh(state.position,true);updateNearby();followCamera(true)}
async function stealVehicle(){
 if(state.interactionPending||state.mode!=='walk'||workLocked())return;const npc=state.cityLife?.nearVehicle(state.position);if(!npc)return;state.interactionPending=true;state.keys.clear();npc.pauseUntil=performance.now()+3000;
 try{await flushMove();const data=await api('POST',{type:'vehicle-steal',vehicle:npc.vehicle,npcId:npc.id,lng:npc.position[0],lat:npc.position[1],heading:npc.heading});state.cityLife.takeVehicle(npc.id);state.self=data.self;if(data.self.life.arrested){state.carSpeed=0;state.keys.clear();updateSurvival();return}state.position=[data.self.lng,data.self.lat];state.lastSentPosition=[...state.position];state.carPosition=[...state.position];state.heading=npc.heading;state.carHeading=npc.heading;state.cameraBearing=npc.heading;state.mode='drive';state.carSpeed=0;state.carDrift=[0,0];state.cabinView=state.cameraMode==='first';document.body.classList.toggle('cabin-mode',state.cabinView);state.world3d.setCabinView(state.cabinView);state.world3d.setVehicleOwned(true);state.world3d.setVehicleKind(state.self.life.vehicle);state.world3d.setDriving(true);state.world3d.setCarPosition(...state.position,state.heading);state.world3d.setPosition(...state.position,state.heading);state.nearTrafficCar=null;updateRoamHud();followCamera(true);toast('NPC car taken · WASD drive · Space brake · F park and exit')}catch(error){toast(error.message)}finally{state.interactionPending=false}
}
async function enterVehicle(){if(state.nearTrafficCar&&!state.self?.life?.shift){await stealVehicle();return}if(!canUseVehicle(state.self?.life)){toast('Your garage is empty. Request a ride or buy a vehicle.');state.transit?.show();return}if(workLocked()||state.self?.life?.flight||state.self?.life?.transit||(state.self?.life?.health<=0||state.self?.life?.arrested)){toast('Finish your current activity first');return}if(state.interactionPending)return;if(state.mode!=='walk'||!state.carPosition||metersBetween(state.position,state.carPosition)>=7.5)return;state.interactionPending=true;state.keys.clear();state.walkVelocity=[0,0];try{await flushMove();const data=await api('POST',{type:'vehicle',enter:true,lng:state.carPosition[0],lat:state.carPosition[1]});state.self=data.self;state.position=[data.self.lng,data.self.lat];state.lastSentPosition=[...state.position];state.mode='drive';state.carSpeed=0;state.carDrift=[0,0];state.cabinView=state.cameraMode==='first';document.body.classList.toggle('cabin-mode',state.cabinView);state.world3d?.setCabinView(state.cabinView);state.blockedHint=false;state.heading=state.carHeading;state.cameraBearing=state.heading;state.world3d?.setDriving(true);state.world3d?.setPosition(...state.position,state.heading);updateRoamHud();followCamera(true);toast('Vehicle entered · N destinations · Space to brake')}catch(error){toast(error.message)}finally{state.interactionPending=false}}
async function exitVehicle(){if(state.interactionPending)return;if(Math.abs(state.carSpeed)>=1){toast('Slow down before leaving the vehicle');return}const next=state.physics?.vehicleExit(state.position,state.heading);if(!next){toast('The doors are blocked. Move the vehicle to an open spot.');return}state.interactionPending=true;state.keys.clear();try{await flushMove();const data=await api('POST',{type:'vehicle',enter:false,lng:next[0],lat:next[1]});state.self=data.self;state.carPosition=[...state.position];state.carHeading=state.heading;state.position=[data.self.lng,data.self.lat];state.lastSentPosition=[...state.position];state.mode='walk';state.cabinView=false;document.body.classList.remove('cabin-mode');state.world3d?.setCabinView(false);state.world3d?.setDriving(false);state.world3d?.setCarPosition(...state.carPosition,state.carHeading);state.world3d?.setPosition(...state.position,state.heading);updateNearby();followCamera(true);state.walkVelocity=[0,0];state.steer=0;toast('Vehicle parked')}catch(error){toast(error.message)}finally{state.interactionPending=false}}
function toggleCabin(){if(state.mode!=='drive')return;setCameraMode(state.cameraMode==='first'?'third':'first')}
async function interact(){if((state.self?.life?.health<=0||state.self?.life?.arrested)||state.mode==='transit')return;if(!state.roam||state.interactionPending||state.mode==='flight')return;if(state.self?.life?.rest){await lifeAction({type:'rest-end'});state.joystick={x:0,y:0};updateRoamHud();return}if(workLocked()){state.lifeUI?.show('work');return;}if(state.self.life.shift?.version===2&&state.mode==='walk'){const job=JOBS.find(j=>j.id===state.self.life.shift.jobId),task=workStep(job,state.self.life.shift),place=placeForId(task?.place||job.steps.at(-1).place);if(place&&metersBetween(state.position,[place.lng,place.lat])<85){state.lifeUI?.show('work');return}}if(state.actionMenuOpen){closeActions();return}if(state.self.life.shift?.version===2&&state.mode==='indoor'&&state.interior?.nearby()?.kind!=='exit'){state.lifeUI?.show('work');return}if(state.mode==='indoor'){const target=state.interior?.nearby();if(state.interior?.isActing&&!['wake','stand','stop-activity'].includes(target?.actionId))return;if(target?.kind==='exit')exitInterior();else if(target?.kind==='local'){const panel=state.interior.interact(target.actionId);if(panel?.dialogue)showResidentDialogue(panel.dialogue);else if(typeof panel==='string')state.lifeUI?.show(panel)}else if(target?.kind==='activity'){const place=state.indoorPlace,id=place.activities.includes(target.actionId)?target.actionId:place.activities[0]||'explore';if(['office','cafe','trade'].includes(id)){state.lifeUI?.show('work');return}if(['shopping','marketfood','meal'].includes(id)){state.lifeUI?.show('shops');return}if(id==='cook'){const result=await lifeAction({type:'cook-inventory'});if(result)state.interior?.playAction('cook');return}const result=await postAction({type:'act',actionId:id});if(result)state.interior?.playAction(id)}else toast('Move close to a furnishing or the exit');return}if(state.mode==='drive'){await exitVehicle();return}const ownHome=placeForId(state.self.life.homeId);if(ownHome&&metersBetween(state.position,[ownHome.lng,ownHome.lat])<6){await openHome(ownHome);return}const agent=STREET_SERVICES.find(p=>metersBetween(state.position,[p.lng,p.lat])<45);if(agent){state.lifeUI?.show('momo');return}const resident=state.cityLife?.nearby(state.position);if(resident){showResidentDialogue(state.cityLife.greet(resident.id,state.position));return}if(state.nearDoor?.distance<4&&!PUBLIC_VENUES[interiorKind(state.nearestPlace)]&&!['stadium','mall','terminal','theatre'].includes(interiorKind(state.nearestPlace))){await enterInterior();return}const targetHome=state.navigation?.destination;if(targetHome?.id?.startsWith('p_')&&metersBetween(state.position,[targetHome.lng,targetHome.lat])<85){await openHome(placeForId(targetHome.id));return}const place=state.nearestPlace;if(place?.id==='home'||place?.id===state.self.life.homeId){await openHome(placeForId(state.self.life.homeId));return}if(!place){toast('Walk toward a glowing place marker');return}const result=await postAction({type:'enter',placeId:place.id});if(result){state.selectedPlace=place.id;openVenueScene(place);renderPlace()}}
function toggleRoamChat(){state.chatOpen=!state.chatOpen;document.querySelector('.right-stack').classList.toggle('roam-chat-open',state.chatOpen);if(state.chatOpen){$('chatPanel').classList.remove('collapsed');$('chatInput').focus()}else $('chatInput').blur()}

let movementPointer=null;
function setJoystick(event){const pad=$('joystickPad'),rect=pad.getBoundingClientRect(),radius=rect.width*.36,dx=event.clientX-(rect.left+rect.width/2),dy=event.clientY-(rect.top+rect.height/2),length=Math.max(1,Math.hypot(dx,dy)),factor=Math.min(1,radius/length);state.joystick={x:dx*factor/radius,y:-dy*factor/radius};$('joystickKnob').style.transform=`translate(calc(-50% + ${dx*factor}px),calc(-50% + ${dy*factor}px))`}
$('joystickPad').addEventListener('pointerdown',event=>{if(movementPointer!==null||document.body.classList.contains('mobile-paused'))return;event.preventDefault();movementPointer=event.pointerId;$('joystickPad').setPointerCapture(event.pointerId);setJoystick(event)});
$('joystickPad').addEventListener('pointermove',event=>{if(movementPointer===event.pointerId&&$('joystickPad').hasPointerCapture(event.pointerId))setJoystick(event)});
for(const eventName of ['pointerup','pointercancel','lostpointercapture'])$('joystickPad').addEventListener(eventName,event=>{if(movementPointer!==event.pointerId)return;movementPointer=null;state.joystick={x:0,y:0};$('joystickKnob').style.transform='translate(-50%,-50%)';clearTimeout(finalMoveTimer);finalMoveTimer=setTimeout(sendMove,250)});
$('turnLeft').addEventListener('click',()=>{if(state.mode==='drive')state.lookOffset=(state.lookOffset||0)-20;else if(state.mode==='indoor')state.interior?.look?.(-20);else state.cameraBearing-=20});$('turnRight').addEventListener('click',()=>{if(state.mode==='drive')state.lookOffset=(state.lookOffset||0)+20;else if(state.mode==='indoor')state.interior?.look?.(20);else state.cameraBearing+=20});
$('touchInteract').addEventListener('click',interact);$('roamActionClose').addEventListener('click',closeActions);$('roamChatToggle').addEventListener('click',toggleRoamChat);
$('vehicleButton').addEventListener('click',()=>state.mode==='drive'?exitVehicle():enterVehicle());
$('viewButton').addEventListener('click',toggleCabin);
$('roamToggle').addEventListener('click',()=>state.roam?exitRoam():enterRoam());
$('viewModeToggle').onclick=()=>exitRoam();
$('runToggle').onclick=()=>{state.running=!state.running;updateRoamHud()};
$('overheadCenter').onclick=()=>{state.overheadFollowing=true;followCamera(true)};
$('overheadZoomIn').onclick=()=>state.map.zoomTo(Math.min(21,state.map.getZoom()+.7),{duration:0});
$('overheadZoomOut').onclick=()=>state.map.zoomTo(Math.max(12,state.map.getZoom()-.7),{duration:0});
document.addEventListener('keydown',event=>{if(state.accountUI?.isOpen||state.adsUI?.isOpen||state.socialUI?.isOpen)return;if(event.code==='Escape'&&state.lifeUI?.isOpen){state.lifeUI.close();event.preventDefault();return}if(event.code==='Escape'&&state.navigation?.isOpen){state.navigation.toggle(false);event.preventDefault();return}if(!state.roam||/INPUT|TEXTAREA/.test(document.activeElement?.tagName||''))return;const code=event.code;if((state.self?.life?.health<=0||state.self?.life?.arrested))return;if(code==='KeyH'&&state.mode==='drive'){event.preventDefault();if(!event.repeat)state.audio.effect('horn');return}if(code==='KeyL'){event.preventDefault();state.satellite?.toggle();return}if(code==='KeyK'){event.preventDefault();toggleScenic();return}if(code==='KeyT'){event.preventDefault();state.transit?.show();return}if(state.mode==='transit'&&!['KeyC','KeyB'].includes(code))return;if(['KeyW','KeyA','KeyS','KeyD','KeyQ','KeyR','ShiftLeft','ShiftRight','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(code)){event.preventDefault();state.keys.add(code)}if(event.repeat)return;if(code==='KeyE'){event.preventDefault();interact()}else if(code==='KeyF'){event.preventDefault();if(state.mode==='drive')exitVehicle();else if(state.nearCar||state.nearTrafficCar)enterVehicle()}else if(code==='KeyV'){event.preventDefault();toggleCabin()}else if(code==='KeyC'){event.preventDefault();toggleRoamChat()}else if(code==='KeyI'){event.preventDefault();state.lifeUI?.isOpen?state.lifeUI.close():state.lifeUI?.show()}else if(code==='KeyN'){event.preventDefault();if(state.mode!=='indoor')state.navigation?.toggle()}else if(code==='KeyM'){event.preventDefault();exitRoam()}else if(code==='Escape'){state.navigation?.toggle(false);closeActions();state.chatOpen=false;document.querySelector('.right-stack').classList.remove('roam-chat-open')}else if(state.actionMenuOpen&&/^Digit[1-9]$/.test(code))$('roamActionList').children[Number(code.slice(5))-1]?.click()});
document.addEventListener('keyup',event=>{state.keys.delete(event.code);if(state.roam&&['KeyW','KeyA','KeyS','KeyD'].includes(event.code)){clearTimeout(finalMoveTimer);finalMoveTimer=setTimeout(sendMove,250)}});

document.querySelectorAll('.panel-tabs button').forEach(b=>b.addEventListener('click',()=>{state.panelTab=b.dataset.tab;renderPanel()}));
document.querySelectorAll('.mobile-dock button').forEach(b=>b.addEventListener('click',()=>openMobile(b.dataset.mobile)));
document.querySelectorAll('.chat-channels button[data-channel]').forEach(b=>b.addEventListener('click',async()=>{state.chatChannel=b.dataset.channel;await refreshWorld()}));
$('unmuteAll').addEventListener('click',()=>{state.muted.clear();localStorage.removeItem('accralife_muted');renderChat();toast('All players unmuted')});
$('chatCollapse').addEventListener('click',()=>{if(state.roam&&document.body.classList.contains('touch-device')){toggleRoamChat();return}$('chatPanel').classList.toggle('collapsed');state.chatCollapsed=!state.chatCollapsed;$('chatCollapse').textContent=state.chatCollapsed?'⌃':'⌄'});
$('chatForm').addEventListener('submit',async e=>{e.preventDefault();const input=$('chatInput');const body=input.value.trim();if(!body)return;const result=await postAction({type:'chat',body,channel:state.chatChannel});if(result){input.value='';await refreshWorld()}});
$('brandBtn').addEventListener('click',()=>state.map?.flyTo({center:[-0.1905,5.5704],zoom:12.7,pitch:28,bearing:0,essential:true}));
state.socialUI=createPlayerProfiles({state,toast});
$('playersMessages').onclick=()=>state.socialUI.show();
state.accountUI=createAccountUI({getPlayer:()=>state.self,getStartPlace:()=>state.cityWelcome?.selected,pause:async()=>{state.keys.clear();state.walkVelocity=[0,0];state.carSpeed=0;await flushMove()}});
state.adsUI=createAdsStudio({state});
$('profileBtn').addEventListener('click',()=>state.accountUI.show());
$('createAccountWelcome').onclick=()=>state.accountUI.show('register');
$('signInWelcome').onclick=()=>state.accountUI.show('login');
$('zoomIn').addEventListener('click',()=>state.map?.zoomIn());$('zoomOut').addEventListener('click',()=>state.map?.zoomOut());
$('toggle3d').addEventListener('click',()=>{state.tilted=!state.tilted;$('toggle3d').classList.toggle('active',state.tilted);state.map?.easeTo({pitch:state.tilted?65:0,zoom:Math.max(state.map.getZoom(),state.tilted?16:12),duration:750})});
$('findMe').addEventListener('click',()=>{if(state.self){state.selectedPlace=state.self.placeId;flyTo(state.self.placeId,16);renderPlace();renderMapMarkers()}else toast('Create your Sim to enter the city')});
$('helpBtn').addEventListener('click',()=>{$('helpModal').classList.remove('hidden');$('modalScrim').classList.remove('hidden')});
$('helpClose').addEventListener('click',()=>{$('helpModal').classList.add('hidden');if($('welcomeModal').classList.contains('hidden'))$('modalScrim').classList.add('hidden')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('helpModal').classList.contains('hidden'))$('helpClose').click()});
state.cityWelcome=createCityWelcome({state,onSelect:p=>{placeById[p.id]=p;selectPlace(p.id)},onExplore:beginExploring,onResume:()=>enterRoam(),onGuest:()=>state.accountUI.show('register'),onAccount:mode=>state.accountUI.show(mode)});
$('welcomeClose').onclick=()=>{$('welcomeModal').classList.add('hidden');$('modalScrim').classList.add('hidden')};
initMap();refreshWorld();pollTimer=setInterval(()=>{if(!document.hidden)refreshWorld()},15000);heartbeatTimer=setInterval(()=>{if(state.self?.handle&&!document.hidden&&!realtime.connected)api('POST',{type:'heartbeat'}).catch(()=>{})},60000);
createMobileControls({state,release:releaseControls,interact,toggleCamera:toggleScenic});
let chatRefreshPending=false;setInterval(async()=>{if(document.hidden||!state.self||state.roam&&!state.chatOpen||chatRefreshPending)return;chatRefreshPending=true;try{const data=await api('GET',null,`?messagesOnly=1&channel=${state.chatChannel==='city'?'city':'place'}`);state.messages=data.messages;renderChat()}catch{}finally{chatRefreshPending=false}},3000);

let residentTimer;function showResidentDialogue(text){let box=document.querySelector('.resident-dialogue');if(!box){box=document.createElement('div');box.className='resident-dialogue';box.setAttribute('role','status');document.getElementById('roamHud').appendChild(box)}box.textContent=text;box.classList.remove('hidden');clearTimeout(residentTimer);residentTimer=setTimeout(()=>box.classList.add('hidden'),6000)}
function releaseControls(){const pad=$('joystickPad');if(movementPointer!==null&&pad.hasPointerCapture(movementPointer))pad.releasePointerCapture(movementPointer);movementPointer=null;state.keys.clear();state.joystick={x:0,y:0};state.walkVelocity=[0,0];state.carSpeed=0;$('joystickKnob').style.transform='translate(-50%,-50%)';sendMove()}
window.addEventListener('blur',releaseControls);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseControls()});

async function lifeAction(input){
  if(state.interactionPending)return null;state.interactionPending=true;state.keys.clear();state.walkVelocity=[0,0];
  const previousMoney=state.self.money;
  try{if(input.type!=='rest-end'&&input.type!=='respawn'&&!workLocked()&&!state.self?.life?.flight&&!state.self?.life?.transit&&state.self?.life?.health>0)await flushMove();const data=await api('POST',input);if(data.self)state.self=data.self;if(data.self?.money>previousMoney)state.audio.effect('reward');if(['drive-skip','ride-skip','bus-arrive'].includes(input.type))state.audio.effect('arrive');
    if(input.type==='drive-skip'){
      state.navigation?.stopAuto();state.position=[data.self.lng,data.self.lat];state.lastSentPosition=[...state.position];state.heading=data.self.heading||0;state.carSpeed=0;state.carDrift=[0,0];state.steer=0;state.walkVelocity=[0,0];state.carPosition=[...state.position];state.carHeading=state.heading;state.cameraBearing=state.heading;state.cameraPosition=null;state.moveSyncPaused=false;state.spawnCorrectionPending=false;state.physics?.refresh(state.position,true);state.world3d?.setPosition(...state.position,state.heading);state.world3d?.setCarPosition(...state.position,state.heading);followCamera(true);
    }
    if(input.type==='shift-start'){
      const job=JOBS.find(j=>j.id===state.self.life.job),place=placeForId(job.place);
      if(job.mobile||job.vehicle){if(state.mode==='indoor')exitInterior();state.world3d?.setVehicleKind(state.self.life.vehicle);state.world3d?.setVehicleOwned(canUseVehicle(state.self.life));state.carPosition=state.physics?.findOpen(offsetMetres(state.position,3,0),2.1)||offsetMetres(state.position,3,0);state.world3d?.setCarPosition(...state.carPosition,state.heading);state.navigation?.to(place)}
      else{if(state.view==='2d')setPlayView('3d');state.interior?.destroy();state.selectedPlace=place.id;state.walkVelocity=[0,0];state.indoorPlace=place;state.interior=createInterior3D({design:interiorDesign(place,state.architecture?.details),avatar:state.self.avatar,identity:state.self.id,outfit:state.self.life?.outfit,kind:job.id==='teacher'?'classroom':job.id==='nurse'?'clinic':['coder','office','bank-clerk'].includes(job.id)?'office':interiorKind(place),name:place.name,activities:place.activities});state.mode='indoor';state.world3d.setEnabled(false);document.body.classList.add('indoor-mode')}
    }
    if(input.type==='work-task'){const job=JOBS.find(j=>j.id===state.self.life.shift?.jobId),task=workStep(job,state.self.life.shift);state.interior?.playAction(job?.id==='teacher'?'study':'office');if(task&&(job.mobile||job.vehicle))state.navigation?.to(placeForId(task.place))}
    if(['shift-complete','shift-cancel'].includes(input.type)){state.navigation?.cancel();state.world3d?.setVehicleOwned(canUseVehicle(state.self.life));state.world3d?.setVehicleKind(state.self.life.vehicle)}
    if(input.type==='experience-buy'){const experience=EXPERIENCES.find(e=>e.id===input.experienceId),place=placeForId(experience?.place);state.lifeUI?.close();if(place&&state.mode==='walk')openVenueScene(place);state.interior?.playAction('relax',{persistent:false})}
    if(['equip','outfit-change'].includes(input.type)){state.world3d?.setOutfit(state.self.life.outfit);state.interior?.setOutfit?.(state.self.life.outfit);}
    if(input.type==='buy'||input.type==='vehicle-select')state.world3d?.setVehicleOwned(canUseVehicle(state.self.life));
    if(input.type==='vehicle-select'){state.world3d?.setVehicleKind(state.self.life.vehicle)}
    if(input.type==='furnish'&&state.mode==='indoor'){state.interior?.destroy();state.interior=createInterior3D({design:interiorDesign(state.indoorPlace,state.architecture?.details),avatar:state.self.avatar,identity:state.self.id,outfit:state.self.life?.outfit,kind:'home',name:state.indoorPlace.name,activities:state.indoorPlace.activities,furniture:state.self.life.furnished})}
    if(input.type==='ride-book'){state.navigation?.toggle(false);state.keys.clear();state.joystick={x:0,y:0}}
    if(input.type==='respawn'){if(state.mode==='indoor')exitInterior();state.navigation?.cancel();state.transit?.tick(0);resetJourney(true);state.world3d?.setDriving(false);state.world3d?.setEnabled(state.view!=='2d');state.lifeUI?.close();updateSurvival();restoreHomeInterior()}
    if(input.type==='flight-arrive'){state.position=[data.self.lng,data.self.lat];state.lastSentPosition=[...state.position];state.mode='walk';state.physics?.refresh(state.position,true);state.carPosition=state.physics?.findOpen(offsetMetres(state.position,3,0),2.1)||offsetMetres(state.position,3,0);state.carHeading=state.heading;state.world3d?.setCarPosition(...state.carPosition,state.carHeading);state.world3d?.setAircraft(false);state.world3d?.setVehicleKind(state.self.life.vehicle);document.body.classList.remove('flight-mode');state.world3d?.setPosition(...state.position,state.heading);state.spawnChecked=false;state.sidewalkChecked=false;updateNearby();followCamera(true)}
    if(data.event)toast(data.event);syncLife();updateSurvival();renderAll();state.lifeUI?.sync();return data;
  }catch(error){toast(error.message);return null}finally{state.interactionPending=false}
}
function syncLife(){if(!state.self?.life||!state.world3d)return;syncHomeRest();updateSurvival();if(state.self.life.transit&&state.mode!=='transit'){if(state.mode==='indoor')exitInterior();if(!state.roam)enterRoam();state.mode='transit';state.keys.clear();state.navigation?.cancel();state.lifeUI?.close();state.world3d.setEnabled(state.view!=='2d');state.world3d.setCabinView(false);document.body.classList.remove('cabin-mode')}const flight=state.self.life.flight;if(flight&&state.mode!=='flight'){if(state.mode==='indoor')exitInterior();if(!state.roam)enterRoam();state.mode='flight';state.keys.clear();state.navigation?.cancel();state.world3d.setAircraft(true);state.world3d.setEnabled(state.view!=='2d');state.lifeUI?.close();document.body.classList.add('flight-mode')}updateLifeStatus()}
async function openHome(place){if(state.view==='2d')setPlayView('3d');if(!place||state.interactionPending||state.mode==='drive'||state.mode==='flight'||state.mode==='transit'||(state.self?.life?.health<=0||state.self?.life?.arrested))return;const result=await lifeAction({type:'enter',placeId:place.id});if(!result){state.lifeUI?.show('homes');return}state.selectedPlace=place.id;state.indoorPlace=place;state.interior?.destroy();state.interior=createInterior3D({design:interiorDesign(state.indoorPlace,state.architecture?.details),avatar:state.self.avatar,identity:state.self.id,outfit:state.self.life?.outfit,kind:'home',name:place.name,activities:place.activities,furniture:place.id.startsWith(`p_${state.self.id}_`)?state.self.life.furnished:[]});state.mode='indoor';state.walkVelocity=[0,0];state.world3d.setEnabled(false);document.body.classList.add('indoor-mode');state.lifeUI?.close();updateRoamHud()}
function updateLifeStatus(){let bar=document.getElementById('lifeStatus');if(!bar){bar=document.createElement('div');bar.id='lifeStatus';bar.className='life-shift hidden';document.body.append(bar)}const life=state.self?.life;if(!life)return;const stamp=JSON.stringify([life.shift?.id,life.shift?.jobId,life.shift?.step,Math.max(0,Math.ceil(((life.shift?.endsAt||life.flight?.endsAt||0)-Date.now())/1000)),life.flight?.to]);if(bar.dataset.stamp===stamp)return;bar.dataset.stamp=stamp;bar.classList.toggle('hidden',!life.shift&&!life.flight);bar.classList.toggle('work-assignment',!!life.shift);if(life.shift){const job=JOBS.find(j=>j.id===life.shift.jobId),task=workStep(job,life.shift),ready=workReady(job,life.shift);bar.replaceChildren();const b=document.createElement('button');b.textContent=ready?'Collect wages':`Work · ${Math.min((life.shift.step||0)+1,job.steps.length)}/${job.steps.length}`;b.title=task?.label||job.name;b.onclick=()=>state.lifeUI.show('work');bar.append(b)}else if(life.flight){const to=TERMINALS.find(t=>t.id===life.flight.to);bar.textContent=`✈ ${to.name} · ${Math.max(0,Math.ceil((life.flight.endsAt-Date.now())/1000))}s to arrival`}}

function flightFrame(now){const flight=state.self.life.flight;if(!flight)return;const from=TERMINALS.find(t=>t.id===flight.from),to=TERMINALS.find(t=>t.id===flight.to),t=Math.max(0,Math.min(1,(Date.now()-flight.startedAt)/(flight.endsAt-flight.startedAt))),smooth=t*t*(3-2*t);state.position=[from.lng+(to.lng-from.lng)*smooth,from.lat+(to.lat-from.lat)*smooth];state.heading=bearingTo([from.lng,from.lat],[to.lng,to.lat]);const altitude=Math.sin(Math.PI*t)*50;state.world3d.setPosition(...state.position,state.heading);state.world3d.setAircraft(true,altitude);state.map.jumpTo({center:state.position,zoom:state.view==='2d'?16:18.5,pitch:state.view==='2d'?0:50,bearing:state.view==='2d'?0:state.heading});$('roamNearby').textContent='Your flight continues when you reconnect';$('roamInstructions').textContent='Enjoy the flight · arrival is automatic · I opens your life';$('roamSpeed').textContent=`${Math.round(altitude)} m altitude`;if(t>=1&&!state.flightCompleting){state.flightCompleting=true;lifeAction({type:'flight-arrive'}).finally(()=>{setTimeout(()=>state.flightCompleting=false,1500)})}}

function resetJourney(atHome=false){state.keys.clear();state.joystick={x:0,y:0};state.carDrift=[0,0];state.running=true;state.moveSyncPaused=false;state.heading=state.self.heading||0;state.cameraBearing=state.heading;state.cameraPosition=null;state.cameraDistance=undefined;state.mode='walk';state.position=[state.self.lng,state.self.lat];state.lastSentPosition=[...state.position];state.carSpeed=0;state.walkVelocity=[0,0];state.cabinView=false;state.world3d?.setDriving(false);state.world3d?.setAircraft(false);state.world3d?.setCabinView(false);state.world3d?.setVehicleKind(state.self.life.vehicle);state.world3d?.setVehicleOwned(canUseVehicle(state.self.life));document.body.classList.remove('cabin-mode','flight-mode','transit-mode');state.physics?.refresh(state.position,true);state.carPosition=state.physics?.findOpen(offsetMetres(state.position,3,0),2.1)||offsetMetres(state.position,3,0);state.world3d?.setPosition(...state.position,state.heading);state.world3d?.setCarPosition(...state.carPosition,state.heading);state.spawnChecked=false;state.sidewalkChecked=false;if(!atHome)updateNearby();followCamera(true)}
function updateSurvival(){const life=state.self?.life;if(!life)return;let health=$('roamHealth');if(!health){const row=document.createElement('div');row.className='roam-meter health-line';row.innerHTML='<span>Health</span><i><b id="roamHealth"></b></i>';document.querySelector('.roam-status').append(row);health=$('roamHealth')}health.style.width=`${life.health??100}%`;health.title=`Health ${Math.ceil(life.health??100)}`;let death=$('deathScreen');if(!death){death=document.createElement('section');death.id='deathScreen';death.className='death-screen hidden';death.setAttribute('role','dialog');death.setAttribute('aria-label','Restart your life');death.innerHTML='<h2>A NEW BEGINNING</h2><p>Your character has died. Restart at your home with restored health. Your money, belongings and homes are kept.</p><button>Restart at home</button>';death.querySelector('button').onclick=async()=>{const b=death.querySelector('button');b.disabled=true;b.textContent='Restarting…';try{await lifeAction({type:'respawn'})}finally{b.disabled=false;b.textContent='Restart at home'}};document.body.append(death)}const arrested=!!life.arrested;death.querySelector('h2').textContent=arrested?'BUSTED · POLICE':'A NEW BEGINNING';death.querySelector('p').textContent=arrested?'Police caught you after three car thefts. Restart at home to clear your wanted level. Your money and homes are kept.':'Your character has died. Restart at home with restored health.';let wanted=$('wantedLevel');if(!wanted){wanted=document.createElement('div');wanted.id='wantedLevel';document.querySelector('.roam-status').append(wanted)}wanted.textContent=life.wanted?`Wanted ${'★'.repeat(life.wanted)}${'☆'.repeat(3-life.wanted)}`:'';wanted.setAttribute('aria-label',`Police wanted level: ${life.wanted||'clear'}`);const dead=life.health<=0||arrested;death.classList.toggle('hidden',!dead);if(dead){state.keys.clear();state.carSpeed=0;state.walkVelocity=[0,0];state.world3d?.setMoving(false);if(!state.wasDead)state.voice?.leave()}state.wasDead=dead;}
function setCameraMode(mode){if(state.view==='2d')setPlayView('3d');state.cameraMode=mode;state.scenicCamera=mode==='overview';state.cabinView=state.mode==='drive'&&mode==='first';document.body.classList.toggle('cabin-mode',state.cabinView);state.world3d?.setCabinView(state.cabinView);cameraButton.textContent='K · '+({street:'Street view',third:'Third-person',first:'First-person',overview:'Overview'}[mode]);updateRoamHud();if(state.roam)followCamera(true)}
state.setCameraMode=setCameraMode;
function toggleScenic(){const modes=['street','third','first','overview'];setCameraMode(modes[(modes.indexOf(state.cameraMode)+1)%modes.length])}
const cameraButton=document.createElement('button');cameraButton.className='world-tool camera-launch';cameraButton.textContent='K · Third-person';cameraButton.onclick=toggleScenic;document.body.append(cameraButton);
state.voice=createVoice({getPlayer:()=>state.self,toast});
setInterval(async()=>{if(!state.self?.handle||document.hidden||state.vitalPending||state.interactionPending)return;state.vitalPending=true;try{const data=await api('POST',{type:'vitals'});if(data.self)state.self=newestPlayer(state.self,data.self);syncLife()}catch{}finally{state.vitalPending=false}},30000);

function openVenueScene(place){if(isOutdoorLandmark(place)){toast('Explore the real square on foot · walk through the arch and visit the grandstands');return}if(state.view==='2d')setPlayView('3d');state.interior?.destroy();state.indoorPlace=place;state.interior=createInterior3D({design:interiorDesign(place,state.architecture?.details),avatar:state.self.avatar,identity:state.self.id,outfit:state.self.life?.outfit,kind:interiorDesign(place,state.architecture?.details).kind,name:place.name,activities:place.activities});state.mode='indoor';state.keys.clear();state.walkVelocity=[0,0];state.world3d.setEnabled(false);document.body.classList.add('indoor-mode');updateRoamHud()}
function updateDistrict(){if(!state.position)return;const district=districtAt(state.position);let badge=$('districtBadge');if(!badge){badge=document.createElement('div');badge.id='districtBadge';badge.className='district-badge';document.body.append(badge)}badge.textContent=district.name;badge.title=district.detail;badge.style.setProperty('--district-accent',district.color);document.body.dataset.district=district.kind;let road=$('roadWarning');if(!road){road=document.createElement('div');road.id='roadWarning';road.className='road-warning';document.querySelector('.roam-status').append(road)}const location=state.safety?.at(state.position);road.classList.toggle('danger',state.mode==='walk'&&location?.onRoad);road.textContent=state.mode!=='walk'?'':location?.onRoad?(location.highway?'HIGHWAY · use the pavement':'ROAD · watch for traffic · use the pavement'):location?.kind==='off-road'?'On foot · explore nearby':'Pavement · safer walking';}
function trafficHit(){}

function syncHomeRest(){
 const rest=state.self?.life?.rest;
 if(!rest){state.interior?.setRest?.(null);return}
 if(!state.roam||state.self.life.health<=0||state.self.life.arrested)return;
 const place=placeForId(rest.placeId);if(!place)return;
 if(state.mode!=='indoor'||state.indoorPlace?.id!==place.id){
  state.interior?.destroy();state.indoorPlace=place;state.selectedPlace=place.id;
  state.interior=createInterior3D({design:interiorDesign(place,state.architecture?.details),avatar:state.self.avatar,identity:state.self.id,outfit:state.self.life?.outfit,kind:'home',name:place.name,activities:place.activities,furniture:place.id===state.self.life.homeId?state.self.life.furnished:[]});
  state.mode='indoor';state.world3d?.setEnabled(false);document.body.classList.add('indoor-mode');
 }
 if(state.interior.resting!==rest.kind){state.keys.clear();state.joystick={x:0,y:0};state.walkVelocity=[0,0];state.interior.setRest(rest.kind);updateRoamHud()}
}

function restoreHomeInterior(){
 const p=state.self,home=p&&placeForId(p.life?.homeId);
 if(!state.roam||!home||state.mode!=='walk'||p.life.health<=0||p.life.arrested||p.placeId!==home.id||metersBetween(state.position,[home.lng,home.lat])>8)return;
 state.indoorPlace=home;state.selectedPlace=home.id;state.interior?.destroy();
 state.interior=createInterior3D({design:interiorDesign(home,state.architecture?.details),avatar:p.avatar,identity:p.id,outfit:p.life?.outfit,kind:'home',name:home.name,activities:home.activities,furniture:p.life.furnished});
 state.mode='indoor';state.walkVelocity=[0,0];state.world3d.setEnabled(false);document.body.classList.add('indoor-mode');updateRoamHud();
}

function syncHomeMarker(){
 if(!state.self?.life)return;const home=HOMES.find(h=>h.id===state.self.life.home),place=placeById.home;if(!home||!place)return;
 Object.assign(place,{lng:home.lng,lat:home.lat,area:home.area,name:'Your home',description:`Your private ${home.name}. Rest, cook and keep your belongings here.`});
 state.poiMarkers.get('home')?.setLngLat([home.lng,home.lat]);
}

// Keep the last validated journey when the browser suspends or reloads this tab.
window.addEventListener('pagehide',()=>{if(state.sessionPaused||!state.self||!state.position||!['walk','drive'].includes(state.mode)||state.moveSyncPaused)return;fetch('/api/game',{method:'POST',credentials:'same-origin',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'move',lng:state.position[0],lat:state.position[1],heading:state.heading,spawnCorrection:state.spawnCorrectionPending})}).catch(()=>{})});

async function beginExploring(place){
 if(!state.self?.handle){state.accountUI?.show('register');return}
 if(!state.self)return;if(!state.world3d){toast('The city is still loading. Please try again.');return}
 state.keys.clear();state.walkVelocity=[0,0];state.carSpeed=0;
 await flushMove();
 const type=state.self.life?.explorationPending?'start-exploring':'explore-place';
 const result=await postAction({type,placeId:place.id,placeName:place.name});if(!result)return;
 state.navigation?.cancel();state.transit?.suspend();state.selectedPlace=place.id;state.view='3d';resetJourney();
 state.map.flyTo({center:[state.self.lng,state.self.lat],zoom:18,pitch:58,duration:900,essential:true});
 await new Promise(resolve=>setTimeout(resolve,950));
 enterRoam();
 // Arrivals face the chosen place instead of always facing geographic north.
 const arrival=landmarkArrival(place);state.heading=state.cameraBearing=bearingTo(state.position,arrival?.target||[place.lng,place.lat]);state.cameraPosition=null;state.lookOffset=0;state.lookPitch=arrival?.cameraPitch||0;state.world3d?.setPosition(...state.position,state.heading);followCamera(true);
}
async function returnToCity(){
 if(state.self?.life?.rest){toast(state.self.life.rest.kind==='sleep'?'Choose Wake up before leaving':'Choose Stand up before leaving');return}
 if(state.returningHome||state.interactionPending)return;state.returningHome=true;
 state.keys.clear();state.joystick={x:0,y:0};state.walkVelocity=[0,0];state.carSpeed=0;
 try{
  await flushMove();state.cityWelcome.show();state.roam=false;state.mapModeRequested=true;
  state.interior?.destroy();state.interior=null;state.indoorPlace=null;
  state.navigation?.cancel();state.navigation?.toggle(false);state.transit?.suspend();state.lifeUI?.close();
  if(state.chatOpen)toggleRoamChat();closeActions();state.audio.update({active:false});
  state.mode=state.self?.driving?'drive':'walk';state.view='3d';state.cabinView=false;state.cameraPosition=null;state.map.setVerticalFieldOfView(36.87);state.cameraFov=36.87;
  document.body.classList.remove('roam-mode','map-play','indoor-mode','cabin-mode','transit-mode','flight-mode');$('roamHud').classList.add('hidden');
  state.world3d?.setAircraft(false);state.world3d?.setCabinView(false);state.world3d?.setDriving(false);state.world3d?.setPreview(true);
  setMapPresentation(state.map,false);for(const id of ['accralife-real-buildings','worldfolk-pavement','worldfolk-asphalt','worldfolk-road-edges','worldfolk-footpaths','worldfolk-road-markings'])if(state.map.getLayer(id))state.map.setLayoutProperty(id,'visibility','visible');
  state.map.dragPan.enable();state.map.dragRotate.enable();state.map.touchZoomRotate.enable();state.map.doubleClickZoom.enable();
  state.map.flyTo({center:state.position||[-.1935,5.5515],zoom:14.7,pitch:54,bearing:0,duration:900});renderMapMarkers();previewCity();
 }finally{state.returningHome=false}
}
state.returnToCity=returnToCity;
$('returnCity').onclick=returnToCity;
function previewCity(){
 if(!state.cityWelcome?.active||state.roam||!state.world3d)return;
 const center=state.map.getCenter(),position=[center.lng,center.lat];state.world3d.setPreview(true);state.world3d.setEnabled(true);state.world3d.setPosition(...position,0);state.world3d.setVehicleOwned(false);
 state.physics?.refresh(position);state.roadGeometry?.update(position);state.architecture?.update(position);state.world3d.setArchitecture(state.architecture?.details||[]);state.scenery?.update(position);state.world3d.setScenery(state.scenery?.items||[]);
 state.atmosphere?.update({...worldAtmosphere(),preset:'day',weather:'clear'});
}
setInterval(previewCity,300);
