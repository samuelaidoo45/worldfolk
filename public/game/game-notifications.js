// A popover must belong to an open dialog to remain interactive above its modal backdrop.
export function presentGameAlert(element,visible){
 if(!visible){if(element.matches(':popover-open'))element.hidePopover();element.hidden=true;return}
 const host=[...document.querySelectorAll('dialog[open]')].at(-1)||document.body;
 if(element.parentElement!==host)host.append(element);
 element.hidden=false;
 if(element.showPopover&&!element.matches(':popover-open'))element.showPopover();
}
// Per-session inbox. Message bodies stay in memory and never enter local storage.
export function createNotificationInbox(){
 let cursor=null;const unread=new Map(),readThrough=new Map();
 return {get cursor(){return cursor},get messages(){return [...unread.values()]},
  receive(feed,{self,muted=()=>false}={}){const fresh=[];for(const m of feed?.messages||[]){if(m.senderId===self||muted(m.senderId)||m.cursor<=cursor||m.at<=(readThrough.get(m.senderId)||0)||unread.has(m.id))continue;unread.set(m.id,m);fresh.push(m)}if(Number.isSafeInteger(feed?.cursor))cursor=Math.max(cursor||0,feed.cursor);return fresh},
  read(peer,at){readThrough.set(peer,Math.max(at,readThrough.get(peer)||0));for(const [id,m] of unread)if(m.senderId===peer&&m.at<=at)unread.delete(id)},
  reset(){cursor=null;unread.clear();readThrough.clear()}
 };
}
export function createGameNotifications({getPlayer,isMuted=()=>false,getOpenPeer,openChat,sound}){
 const inbox=createNotificationInbox();let owner=null,ringing=null,lastRing=0,callPresent=false,collapsed=false,lastStamp='';
 const box=document.createElement('aside');box.className='game-notification';box.setAttribute('popover','manual');box.setAttribute('aria-label','New private messages');box.hidden=true;
 box.innerHTML='<p class="notification-announcement" role="status" aria-live="polite"></p><button class="notification-open"><span class="notification-heading"></span><span class="notification-preview"></span><span class="notification-reply">Open chat & reply →</span></button><button class="notification-dismiss" aria-label="Minimize message notification">×</button>';
 document.body.append(box);const $=s=>box.querySelector(s);
 function hide(){presentGameAlert(box,false)}
 function render(){const callBanner=document.querySelector('.friend-call:not(.hidden)');box.style.top=callPresent&&!ringing&&callBanner?(callBanner.getBoundingClientRect().bottom+8)+'px':'';const messages=inbox.messages.filter(m=>!isMuted(m.senderId)),latest=messages.at(-1),stamp=JSON.stringify([latest?.id,messages.length,collapsed,ringing]);presentGameAlert(box,!!latest&&!ringing);if(stamp===lastStamp)return;lastStamp=stamp;document.body.classList.toggle('has-incoming-call',!!ringing);
  if(!latest||ringing){hide();return}box.hidden=false;box.classList.toggle('is-compact',collapsed);const label=latest.handle?'@'+latest.handle:latest.name;
  $('.notification-heading').textContent=collapsed?`✉ ${messages.length} unread ${messages.length===1?'message':'messages'}`:`${latest.avatar||'✉'} ${label} · ${messages.length} unread`;
  $('.notification-preview').textContent=latest.body;
  $('.notification-announcement').textContent=`${messages.length} unread private ${messages.length===1?'message':'messages'}. Latest from ${label}.`;
  $('.notification-open').setAttribute('aria-label',`Open chat with ${label}. ${messages.length} unread messages`);
  if(box.showPopover&&!box.matches(':popover-open'))box.showPopover();
 }
 function reset(){owner=null;ringing=null;lastRing=0;callPresent=false;inbox.reset();lastStamp='';render();hide()}
 function syncOwner(){const id=getPlayer()?.handle?getPlayer().id:null;if(id!==owner){reset();owner=id}}
 function ring(){if(!ringing||document.hidden||Date.now()-lastRing<6000)return;lastRing=Date.now();sound('ring')}
 $('.notification-open').onclick=()=>{const latest=inbox.messages.filter(m=>!isMuted(m.senderId)).at(-1);if(latest)openChat(latest.senderId)};
 $('.notification-dismiss').onclick=()=>{collapsed=true;render()};
 window.addEventListener('worldfolk:messages-read',e=>{if(e.detail?.peer){inbox.read(e.detail.peer,e.detail.at||0);render()}});
 const timer=setInterval(()=>{syncOwner();ring();render()},1000);
 return {reset,query(){syncOwner();return '?alerts=1'+(inbox.cursor===null?'':'&after='+inbox.cursor)},receive(feed,call){syncOwner();if(!owner)return;callPresent=!!call;const fresh=inbox.receive(feed,{self:owner,muted:isMuted});const next=call?.status==='ringing'&&call.callee===owner?call.id:null;if(next!==ringing){ringing=next;lastRing=0}if(fresh.some(m=>m.senderId!==getOpenPeer())){collapsed=false;if(!ringing)sound('message')}ring();render()},destroy(){clearInterval(timer);box.remove()}};
}
