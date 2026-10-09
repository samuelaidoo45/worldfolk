export function createContacts({panel,getPlayer,prepare,join,leave,setMuted,isMuted,toast}){
 const section=document.createElement('section');section.className='friend-contacts';
 section.innerHTML='<h2>Friends & calls <span class="friend-count"></span></h2><p>Add a friend by username or contact code. They must accept before you can call.</p><label>Your contact code<input class="contact-code" readonly aria-label="Your contact code"></label><button class="contact-copy">Copy code</button><form class="contact-form"><label>Friend’s username or code<input name="contact" required maxlength="50" autocomplete="off" placeholder="Username or contact code"></label><button>Add friend</button></form><p class="contacts-status" role="status"></p><div class="contacts-list"></div>';
 panel.insertBefore(section,panel.querySelector('h2'));
 const banner=document.createElement('aside');banner.className='friend-call hidden';banner.setAttribute('aria-label','Private call');banner.innerHTML='<strong class="call-title"></strong><p class="call-status" role="status" aria-live="polite"></p><div class="call-buttons"></div>';document.body.append(banner);
 const $=s=>section.querySelector(s),status=message=>$('.contacts-status').textContent=message;
 let call=null,joined=null,loading=false,pending=false,lastList='',lastCall='',muted=true,lastRequests=0;
 async function api(body){const r=await fetch('/api/contacts',{method:body?'POST':'GET',signal:AbortSignal.timeout(10000),cache:'no-store',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined});const data=await r.json();if(!r.ok)throw Error(data.error||'Contacts unavailable');return data}
 function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>run(fn);return b}
 async function run(fn){if(pending)return;pending=true;try{await fn();status('');lastList='';lastCall='';await poll()}catch(e){status(e.message);toast(e.message)}finally{pending=false}}
 async function hangup(){const id=call?.id,stopping=leave();joined=null;muted=true;try{if(id)await api({type:'hangup',id})}finally{await stopping}}
 function renderCall(){
  const key=JSON.stringify([call?.id,call?.status,call?.caller,isMuted()]);if(key===lastCall)return;lastCall=key;banner.classList.toggle('hidden',!call);if(!call)return;
  const incoming=call.callee===getPlayer()?.id,active=call.status==='active',buttons=banner.querySelector('.call-buttons');
  banner.querySelector('.call-title').textContent=`${call.avatar||'☎'} ${call.name}`;
  banner.querySelector('.call-status').textContent=active?'Private call · '+(isMuted()?'microphone muted':'microphone on'):incoming?'Incoming call from your friend':'Calling… waiting for an answer';buttons.replaceChildren();
  if(!active&&incoming){buttons.append(button('Answer',async()=>{try{await prepare();await api({type:'answer',id:call.id})}catch(e){await leave();throw e}}),button('Decline',hangup))}
  else if(!active)buttons.append(button('Cancel call',hangup));
  else buttons.append(button(isMuted()?'Unmute':'Mute',async()=>{muted=!isMuted();setMuted(muted)}),button('Hang up',hangup));
 }
 async function poll(){if(loading||!getPlayer()?.handle)return;if(document.hidden&&!call)return;loading=true;try{
  const data=await api();$('.contact-code').value=data.contactCode;$('.friend-count').textContent=`(${data.friendCount})`;const directoryButton=document.getElementById('playersMessages');if(directoryButton)directoryButton.textContent=`Friends (${data.friendCount})${data.requestCount?' · '+data.requestCount+' requests':''}`;if(data.requestCount>lastRequests)toast('You have a new friend request. Open Friends & messages to accept.');lastRequests=data.requestCount;
  const previous=call;call=data.call;
  if(!call&&(previous||joined)){await leave();joined=null;muted=true;toast(previous?.status==='ringing'?'Call declined, cancelled or unanswered':'Call ended')}
  if(call?.status==='active'&&joined!==call.id){joined=call.id;try{await join(call.id);muted=true}catch(e){await hangup();call=null;throw e}}
  renderCall();
  const stamp=JSON.stringify([data.contacts,call?.id]);if(stamp!==lastList){lastList=stamp;const list=$('.contacts-list');list.replaceChildren();if(!data.contacts.length){const empty=document.createElement('p');empty.textContent='No contacts yet. Share your code or add someone you meet.';list.append(empty)}
   for(const c of data.contacts){const row=document.createElement('article'),name=document.createElement('strong'),detail=document.createElement('small'),actions=document.createElement('div');name.textContent=`${c.avatar} @${c.handle}`;detail.textContent=c.status==='accepted'?(c.online?'Online':'Offline'):c.requestedBy===getPlayer().id?'Request sent':'Wants to be your friend';
    if(c.status==='accepted'){actions.append(button('Chat',()=>{window.dispatchEvent(new CustomEvent('worldfolk:player-profile',{detail:{id:c.playerId}}))}));const dial=button('Call',async()=>{try{await prepare();await api({type:'call',id:c.id})}catch(e){await leave();throw e}});dial.disabled=!c.online||!!call;actions.append(dial)}
    else if(c.requestedBy!==getPlayer().id)actions.append(button('Accept',()=>api({type:'accept',id:c.id})));
    actions.append(button(c.status==='accepted'?'Remove':c.requestedBy===getPlayer().id?'Cancel':'Decline',()=>api({type:'remove',id:c.id})));row.append(name,detail,actions);list.append(row);
   }
  }
 }catch(e){status(e.message)}finally{loading=false}}
 $('.contact-form').onsubmit=e=>{e.preventDefault();run(async()=>{const result=await api({type:'request',contact:e.target.elements.contact.value});e.target.reset();toast(result.event)})};
 $('.contact-copy').onclick=()=>navigator.clipboard.writeText($('.contact-code').value).then(()=>toast('Contact code copied')).catch(()=>{$('.contact-code').select();status('Select and copy your contact code')});
 setInterval(()=>{if(!panel.classList.contains('hidden')||call)poll();renderCall()},2000);
 // Incoming calls are checked while playing, even when the contacts panel is closed.
 setInterval(()=>{if(panel.classList.contains('hidden')&&!call)poll()},8000);
 window.addEventListener('pagehide',()=>{if(call)fetch('/api/contacts',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json'},body:JSON.stringify({type:'hangup',id:call.id})}).catch(()=>{})});
 return {refresh:poll,get active(){return !!call},hangup};
}
