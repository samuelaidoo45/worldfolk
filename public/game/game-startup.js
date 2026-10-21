// A real task-based boot sequence; never present a timer as download progress.
(()=>{
 const root=document.getElementById('gameBoot');if(!root)return;
 const start=document.getElementById('bootStart'),retry=document.getElementById('bootRetry'),stage=document.getElementById('bootStage'),progress=document.getElementById('bootProgress'),count=document.getElementById('bootCount');
 const tasks=[['art','Loading Accra artwork…'],['interface','Preparing game controls…'],['profile','Connecting to the shared world…'],['world','Preparing streets and the 3D world…']];
 const inertBefore=new Map();let ready=false,closed=false,timedOut=false;
 function shield(){for(const el of document.body.children)if(el!==root&&!inertBefore.has(el)){inertBefore.set(el,el.inert);el.inert=true}}
 const siblings=new MutationObserver(shield);siblings.observe(document.body,{childList:true});shield();
 function update(){if(closed)return;const completed=tasks.filter(([key])=>root.dataset[key]==='ready').length;progress.value=completed;count.textContent=`${completed} / ${tasks.length}`;ready=completed===tasks.length;
  const failed=tasks.some(([key])=>root.dataset[key]==='error');
  root.classList.toggle('ready',ready);root.querySelector('.boot-loading').hidden=ready;start.hidden=!ready;root.querySelector('.boot-input-hint').hidden=!ready;retry.hidden=ready||!timedOut&&!failed;
  stage.textContent=failed?(root.dataset.errorMessage||'A game resource could not load. Check your connection and retry.'):timedOut&&!ready?'Still loading. Check your connection, or retry.':tasks.find(([key])=>root.dataset[key]!=='ready')?.[1]||'Ready to play';
  if(ready){clearTimeout(timeout);start.focus({preventScroll:true})}
 }
 const observer=new MutationObserver(update);observer.observe(root,{attributes:true,attributeFilter:tasks.map(([key])=>'data-'+key)});
 const timeout=setTimeout(()=>{timedOut=true;update()},20000);
 const artwork=new Image();artwork.onload=()=>{root.dataset.art='ready'};artwork.onerror=()=>{root.dataset.art='error'};artwork.src=new URL('./assets/launch/accra-key-art.jpg',document.baseURI).href;
 function begin(){if(!ready||closed)return;closed=true;observer.disconnect();siblings.disconnect();clearTimeout(timeout);document.removeEventListener('keydown',keyboard,true);for(const [el,inert] of inertBefore)el.inert=inert;root.hidden=true;document.body.classList.remove('boot-active');document.querySelector('.launch-enter')?.focus({preventScroll:true});window.dispatchEvent(new Event('worldfolk:start'))}
 function keyboard(event){if(closed)return;if(event.code==='Enter'&&ready){event.preventDefault();event.stopPropagation();begin()}else if(event.key==='Tab'){const buttons=[...root.querySelectorAll('button')].filter(b=>!b.hidden&&!b.disabled);event.preventDefault();buttons[0]?.focus()}}
 document.addEventListener('keydown',keyboard,true);start.onclick=begin;retry.onclick=()=>location.reload();update();
})();
