import {CASUAL_OUTFITS} from './outfit-catalog.js';
import {vehicleName} from './vehicle-catalog.js';
import {EXPERIENCES,workStep,workReady,jobPay} from './work-catalog.js';
import {sellsAtVenue} from './venue-shopping.js';
import {STREET_SERVICES} from './street-services.js';
import {HOMES,GOODS,JOBS,TERMINALS,propertyId,rideFare} from './life-catalog.js';
import {distanceMetres} from './motion.js';
export function createLifeUI({state,action,navigate,enterHome,places}){
 let open=false,tab='bag',signature='',busy=false,lastPass='',workCategory='All',selectedJob=null,arrivalPending=false,selectionOwner=null;
 const launch=document.createElement('button');launch.className='life-launch';launch.textContent='I · My life';document.body.append(launch);
 const panel=document.createElement('section');panel.className='life-drawer hidden';panel.setAttribute('aria-label','My virtual life');panel.innerHTML='<header><div><small>YOUR LIFE IN ACCRA</small><h2>Make yourself at home</h2></div><button aria-label="Close my life">×</button></header><div class="life-wallet"></div><nav aria-label="Life sections"></nav><div class="life-content"></div><p class="life-note">All prices and ownership are part of the game. Progress saves automatically.</p>';document.body.append(panel);
 const content=panel.querySelector('.life-content'),wallet=panel.querySelector('.life-wallet');
 for(const [id,label] of [['bag','Bag'],['work','Work'],['shops','Shops'],['homes','Homes'],['wardrobe','Wardrobe'],['transport','Transport'],['leisure','Leisure'],['momo','MoMo']]){const b=document.createElement('button');b.textContent=label;b.onclick=()=>show(id);b.dataset.tab=id;panel.querySelector('nav').append(b)}
 function show(section=tab){if(!state.self)return;tab=section;open=true;state.keys.clear();state.joystick={x:0,y:0};panel.classList.remove('hidden');render()}
 function close(){open=false;panel.classList.add('hidden')}
 launch.onclick=()=>open?close():show();panel.querySelector('header button').onclick=close;
 const near=p=>state.position&&distanceMetres(state.position,[p.lng,p.lat])<85;
 const place=id=>places.find(p=>p.id===id);
 function route(p){close();navigate(p)}
 function saveSelection(){try{sessionStorage.setItem(`worldfolk_work_${state.self.id}`,JSON.stringify({jobId:selectedJob,arrivalPending}))}catch{}}
 function selectJob(job){selectedJob=job.id;arrivalPending=false;saveSelection();render();content.scrollTop=0}
 async function startWork(job){
  if(busy)return;busy=true;render();
  try{
   if(state.self.life.job!==job.id&&!await action({type:'job-apply',jobId:job.id}))return;
   if(await action({type:'shift-start'})){arrivalPending=false;saveSelection();show('work')}
  }finally{busy=false;render()}
 }
 async function travelToWork(job,kind){
  const q=place(job.place);if(!q||busy)return;
  arrivalPending=true;saveSelection();navigate(q);
  if(!kind){close();return}
  busy=true;render();
  try{if(await action({type:'ride-book',kind,lng:q.lng,lat:q.lat,name:q.name}))close();else{arrivalPending=false;saveSelection()}}
  finally{busy=false;render()}
 }

 function heading(text,detail){const h=document.createElement('h3');h.textContent=text;content.append(h);if(detail){const p=document.createElement('p');p.className='life-description';p.textContent=detail;content.append(p)}}
 function row(title,detail){const el=document.createElement('article');el.className='life-item';const h=document.createElement('strong'),p=document.createElement('p'),buttons=document.createElement('div');h.textContent=title;p.textContent=detail;buttons.className='life-actions';el.append(h,p,buttons);content.append(el);return buttons}
 function button(parent,label,fn,disabled=false){const b=document.createElement('button');b.textContent=label;b.disabled=disabled||busy;b.onclick=fn;parent.append(b);return b}
 async function transact(input){if(busy)return null;busy=true;render();try{const result=await action(input);if(result?.pass)lastPass=`${result.pass} · valid for one guest, for 24 hours`;return result}finally{busy=false;render()}}
 function render(){if(!open||!state.self)return;const p=state.self,life=p.life;content.replaceChildren();panel.querySelector('h2').textContent=tab==='work'?'Work & careers':'Make yourself at home';wallet.textContent=`${life.background?life.background+' · ':''}₵${p.money.toLocaleString()} · ${life.homeName} · apartment ${life.apartment}`;panel.querySelectorAll('nav button').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
 if(tab==='momo'){heading('MoMo agents',`Game money only · saved MoMo balance: ₵${life.momo||0}. Deposit cash for safekeeping or withdraw it to spend in the city.`);const agent=STREET_SERVICES.find(s=>near(s)&&distanceMetres(state.position,[s.lng,s.lat])<=45);if(agent){heading(agent.name);const form=document.createElement('form'),amount=document.createElement('input');amount.type='number';amount.min='1';amount.max='100000';amount.step='1';amount.placeholder='Amount in game cedis';amount.setAttribute('aria-label','MoMo amount');form.append(amount);for(const operation of ['deposit','withdraw']){const b=document.createElement('button');b.type='button';b.textContent=operation==='deposit'?'Deposit cash':'Withdraw cash';b.disabled=busy||p.driving;b.onclick=()=>transact({type:'momo',operation,amount:Number(amount.value)});form.append(b)}content.append(form)}else for(const agent of STREET_SERVICES){const b=row(agent.name,'Fictional game agent · no real-money transactions');button(b,'Find agent',()=>route({...agent,emoji:'💛'}))}}
 if(tab==='bag'){const health=row('Health',`${Math.ceil(life.health??100)} / 100 · ${life.deaths||0} restarts`);button(health,'Rest and recover at home',()=>transact({type:'recover'}),state.mode!=='indoor'||!p.placeId.startsWith(`p_${p.id}_`)||(life.health??100)>=100);
  heading('Your bag','Buy groceries and goods in the city. Eat food wherever you are; place furniture inside your own home.');let count=0;
  for(const item of GOODS){const qty=life.inventory[item.id]||0;if(!qty)continue;count++;const buttons=row(`${item.icon} ${item.name} × ${qty}`,item.kind==='food'?`Restores hunger${item.energy?' and energy':''}`:item.kind==='groceries'?'Cook two meals in your kitchen':item.kind==='furniture'?'Use inside your home':(item.kind==='device'?life.device:life.outfit)===item.id?'Currently using':'Owned');
   if(item.kind==='food')button(buttons,'Eat / drink',()=>transact({type:'consume',itemId:item.id}));
   if(['clothing','device'].includes(item.kind))button(buttons,(item.kind==='device'?life.device:life.outfit)===item.id?'Equipped':item.kind==='clothing'?'Wear at home':'Equip',()=>transact({type:'equip',itemId:item.id}),(item.kind==='device'?life.device:life.outfit)===item.id||item.kind==='clothing'&&(state.mode!=='indoor'||!p.placeId.startsWith(`p_${p.id}_`)));
   if(item.kind==='furniture')button(buttons,'Place in home',()=>transact({type:'furnish',itemId:item.id}),!p.placeId.startsWith(`p_${p.id}_`));
   if(item.kind==='groceries')button(buttons,'Cook two meals',()=>transact({type:'cook-inventory'}),state.mode!=='indoor');
  }
  if(!count)heading('Your bag is empty','Visit Makola Market or Accra Mall to buy food, clothing, furniture and more.');
  const b=row('Your household',life.furnished.length?life.furnished.map(id=>GOODS.find(g=>g.id===id)?.name).join(' · '):'Starter furnishings included with your home');button(b,'Find shops',()=>show('shops'));
 }
 if(tab==='wardrobe'){
  const atHome=state.mode==='indoor'&&p.placeId.startsWith(`p_${p.id}_`),resting=!!life.rest||!!state.interior?.resting;
  heading('Your wardrobe','Casual clothes included with your home. Your outfit saves to your profile and other players see what you wear.');
  if(!atHome){const b=row('Change at home','Enter one of your own homes to use its wardrobe.');button(b,'Find my home',()=>show('homes'))}
  if(resting)heading('Finish your activity first','Wake up, stand up or finish your activity before changing clothes.');
  for(const outfit of CASUAL_OUTFITS){const b=row(outfit.name,outfit.description),swatches=document.createElement('div');swatches.style.cssText='display:flex;gap:6px;margin:8px 0';swatches.setAttribute('aria-hidden','true');for(const part of ['shirt','pants','shoes']){const chip=document.createElement('span');chip.style.cssText=`width:24px;height:24px;border-radius:50%;border:1px solid #82948a;background:#${outfit[part].toString(16).padStart(6,'0')}`;swatches.append(chip)}b.before(swatches);button(b,life.outfit===outfit.id?'Wearing':'Wear outfit',()=>transact({type:'outfit-change',outfitId:outfit.id}),!atHome||resting||!!life.shift||life.outfit===outfit.id)}
 }
 if(tab==='shops'){
  heading('City shops','Walk or drive to the shop, park, then purchase with your earned cedis.');
  const indoor=state.mode==='indoor'?state.indoorPlace:null;
  const nearby=places.filter(q=>['makola','kaneshie','osu','mall','airport'].includes(q.id)&&near(q));
  if(indoor)heading(indoor.name,'Purchases use your game money and are saved in your bag.');
  if(!nearby.length&&!indoor){for(const id of ['makola','mall','osu','kaneshie']){const q=place(id),b=row(q.name,q.area);button(b,'Set route',()=>route(q))}}
  for(const item of GOODS.filter(g=>indoor?sellsAtVenue(g,indoor)||g.shops.some(id=>nearby.some(q=>q.id===id)):!nearby.length||g.shops.some(id=>nearby.some(q=>q.id===id)))){const available=!!indoor&&sellsAtVenue(item,indoor)||item.shops.some(id=>nearby.some(q=>q.id===id)),owned=item.kind==='vehicle'&&life.vehicles.includes(item.id);const b=row(`${item.icon} ${item.name}`,`₵${item.price} · ${item.shops.map(id=>place(id)?.name).join(' / ')}`);button(b,owned?'Owned':available?'Buy':'Visit shop to buy',()=>transact({type:'buy',itemId:item.id}),owned||!available||p.driving||p.money<item.price)}
 }
 if(tab==='work'){
  heading('Find work','Select a job below, travel to its workplace and start your shift on arrival. Driving shifts include a work vehicle. Five completed shifts increase your pay; earnings buy goods, homes, services and experiences.');
  if(life.shift){
   const shift=life.shift,job=JOBS.find(j=>j.id===shift.jobId),task=shift.version===2?workStep(job,shift):null,ready=workReady(job,shift),b=row(job.name,`${job.task} · Pay ₵${jobPay(job,life.career)}`),timer=document.createElement('p');timer.className='shift-timer';b.before(timer);
   if(task){const q=place(task.place);heading(`Task ${(shift.step||0)+1} / ${job.steps.length} · ${task.label}`,`${q?.name||task.place} · ${task.prompt}`);
    const choices=document.createElement('div');choices.className='work-choices';content.append(choices);
    if(q&&!near(q))button(choices,'Route to task',()=>route(q));
    const order=task.choices.map((label,choice)=>({label,choice}));if((parseInt(shift.id?.slice(0,2)||'00',16)+(shift.step||0))%2)order.reverse();
    for(const {label,choice} of order)button(choices,label,()=>transact({type:'work-task',shiftId:shift.id,step:shift.step,choice}),!q||!near(q)||p.driving||Date.now()<(shift.nextTaskAt||0));
    if(job.vehicle)heading('Work vehicle',`A ${job.vehicle==='bus'?'tro-tro':job.vehicle} is provided for this shift. Close this panel, complete pickup, drive to the next stop, park and open Work to finish each task.`);
   }
   button(b,'Collect wages',()=>transact({type:'shift-complete'}),!ready||p.driving);button(b,'Cancel shift',()=>transact({type:'shift-cancel'}),p.driving);
   return;
  }
  const chosen=JOBS.find(j=>j.id===selectedJob);
  if(chosen){
   const q=place(chosen.place),distance=q&&state.position?distanceMetres(state.position,[q.lng,q.lat]):0,arrived=q&&near(q)&&!['transit','flight'].includes(state.mode);
   if(q){
    const actions=row(`Selected · ${chosen.name}`,`${q.name} · ${Math.round(distance)} m away · ₵${jobPay(chosen,life.career)} per shift`);actions.parentElement.classList.add('selected-work');
    const detail=document.createElement('p');detail.textContent=chosen.steps.map((step,i)=>`${i+1}. ${step.label}`).join(' → ');actions.before(detail);
    if(arrived){
     const message=p.driving?'Park and leave your vehicle to start work.':p.energy<chosen.energy+5?'Rest or eat to restore energy before this shift.':'You are at the workplace. Start work to enter and receive your tasks.';
     const notice=document.createElement('p');notice.textContent=message;notice.setAttribute('role','status');actions.before(notice);
     button(actions,'Start work',()=>startWork(chosen),p.driving||p.energy<chosen.energy+5);
    }else{
     button(actions,'Walk / drive to workplace',()=>travelToWork(chosen),['transit','flight'].includes(state.mode));
     for(const kind of ['trotro','taxi']){const fare=rideFare(distance,kind);button(actions,`${kind==='trotro'?'Tro-tro':'Taxi'} to work · ₵${fare}`,()=>travelToWork(chosen,kind),!['walk','indoor'].includes(state.mode)||p.money<fare||distance<100)}
     const note=document.createElement('p');note.textContent=state.mode==='transit'?'On your way. Work opens when you arrive. You can use Skip ride.':'Public transport picks you up and takes you to this workplace. You can skip the ride after boarding.';actions.before(note);
    }
    button(actions,'Choose another job',()=>{selectedJob=null;arrivalPending=false;saveSelection();render()});
   }
  }
  const filter=document.createElement('select');filter.setAttribute('aria-label','Filter professions');filter.className='work-category';for(const category of ['All',...new Set(JOBS.map(j=>j.category))]){const o=document.createElement('option');o.value=category;o.textContent=category;filter.append(o)}filter.value=workCategory;filter.onchange=()=>{workCategory=filter.value;render()};content.append(filter);
  for(const job of JOBS.filter(j=>workCategory==='All'||j.category===workCategory)){
   const q=place(job.place);if(!q)continue;const record=life.career?.[job.id],b=row(job.name,`${q.name} · ₵${jobPay(job,life.career)} / shift · ${job.steps.length} tasks · about ${job.seconds}s plus travel${job.vehicle?' · work vehicle included':''}${record?` · ${record.shifts} shifts, ₵${record.earned} earned`:''}`);
   button(b,selectedJob===job.id?'Selected':'Select job',()=>selectJob(job),selectedJob===job.id);
  }
 }
 if(tab==='homes'){
  heading('Your private homes','Your starter apartment is assigned automatically. Owners can issue a one-guest invitation pass or revoke all passes.');
  for(const id of life.properties){const home=HOMES.find(h=>h.id===id),property={...home,id:propertyId(p.id,id),name:`Your ${home.name}`,type:'Private home',emoji:'🏠',activities:['sleep','cook','shower','relax','upgrade']},b=row(home.name,`${home.area} · ${life.home===id?'Primary home':'Owned'} · private`);button(b,'Go home',()=>route(property));button(b,'Enter',()=>{close();enterHome(property)},!near(home)||p.driving);if(life.home!==id)button(b,'Make primary',()=>transact({type:'home-set',homeId:id}));button(b,'Create guest pass',()=>transact({type:'pass-create',propertyId:property.id}));button(b,'Revoke passes',()=>transact({type:'pass-revoke',propertyId:property.id}));}
  if(lastPass){const box=document.createElement('p');box.className='life-pass';box.textContent=lastPass;content.append(box)}
  heading('Use a guest pass');const form=document.createElement('form'),input=document.createElement('input'),submit=document.createElement('button');input.placeholder='16-character invitation pass';input.setAttribute('aria-label','Invitation pass');input.maxLength=16;submit.textContent='Redeem pass';submit.disabled=busy;form.append(input,submit);form.onsubmit=async e=>{e.preventDefault();const code=input.value;const result=await transact({type:'pass-redeem',code});if(result?.propertyId){const h=state.residences.find(h=>h.id===result.propertyId);if(h)route({...h,type:'Private home',emoji:'🏠',activities:['sleep','cook','relax']})}};content.append(form);
  heading('Homes for sale','Visit the address to buy. Each purchase is your own private residence.');for(const h of HOMES.filter(h=>h.price&&!life.properties.includes(h.id))){const b=row(h.name,`₵${h.price.toLocaleString()} · ${h.area}`);button(b,'View address',()=>route({...h,id:`estate_${h.id}`,emoji:'🏠'}));button(b,'Buy home',()=>transact({type:'property-buy',homeId:h.id}),!near(h)||p.money<h.price||p.driving)}
  heading('Visit a neighbour','Private residences require their owner’s pass.');for(const h of state.residences.filter(h=>h.ownerId!==p.id).slice(0,20)){const b=row(h.name,h.area+' · pass required');button(b,'Set route',()=>route({...h,type:'Private home',emoji:'🔐',activities:['sleep','cook','relax']}));button(b,'Enter with pass',()=>{close();enterHome({...h,type:'Private home',emoji:'🔐',activities:['sleep','cook','relax']})},!near(h)||p.driving)}
 }
 if(tab==='leisure'){
  heading('Services & experiences','Spend your earned game cedis at a venue. Benefits apply immediately and progress is saved.');
  for(const experience of EXPERIENCES){const q=place(experience.place);if(!q)continue;const b=row(experience.name,`₵${experience.price} · ${q.name} · ${experience.description}`);if(near(q))button(b,'Buy experience',()=>transact({type:'experience-buy',experienceId:experience.id}),p.driving||!!life.shift||p.money<experience.price);else{button(b,'Set route',()=>route(q));button(b,'Get a ride',()=>{close();navigate(q);state.transit?.show()})}}
 }
 if(tab==='transport'){const bus=row('🚐 Tro-tro or taxi','Pickup at your current location · choose any listed destination');button(bus,'Request pickup',()=>{close();state.transit?.show()});
  heading('Your garage','Vehicles depend on your starting background. Buy a car or motorcycle in the city, or request public transport.');for(const id of life.vehicles){const b=row(`${id==='motorcycle'?'🏍️':'🚙'} ${vehicleName(id)}`,life.vehicle===id?'Selected vehicle':'Owned');button(b,life.vehicle===id?'Selected':'Use vehicle',()=>transact({type:'vehicle-select',vehicle:id}),p.driving||life.vehicle===id||!state.nearCar)}
  heading('✈ City air shuttle','Fictional game terminals connect Airport City, La and Legon. Tickets cost ₵65; flights take 60 seconds and continue after reconnecting.');
  const from=TERMINALS.find(t=>near(t));for(const t of TERMINALS){if(t.id===from?.id)continue;const b=row(t.name,from?`From ${from.name} · ₵65`:'Visit a terminal to board');button(b,from?'Board flight':'Go to terminal',async()=>{if(from){const r=await transact({type:'flight-book',destination:t.id});if(r)close()}else route(place(t.id))},from&&(p.money<65||p.driving||!!life.shift)||!!life.flight)}
 }
 }
 function sync(){if(state.self&&selectionOwner!==state.self.id){selectionOwner=state.self.id;selectedJob=null;arrivalPending=false;try{const saved=JSON.parse(sessionStorage.getItem(`worldfolk_work_${selectionOwner}`)||'null');if(JOBS.some(j=>j.id===saved?.jobId)){selectedJob=saved.jobId;arrivalPending=!!saved.arrivalPending}}catch{}}launch.classList.toggle('hidden',!state.self);const s=JSON.stringify([state.self?.life,state.self?.money,state.self?.driving,state.mode,state.residences?.length]);if(signature!==s){signature=s;render()}}
 let lastReady='';function tick(){
  const chosen=JOBS.find(j=>j.id===selectedJob),workplace=chosen&&place(chosen.place);
  if(arrivalPending&&workplace&&near(workplace)&&['walk','indoor'].includes(state.mode)&&!state.interactionPending&&!state.self?.life?.shift){arrivalPending=false;saveSelection();show('work')}
  if(!open)return;
const shift=state.self?.life?.shift,job=JOBS.find(j=>j.id===shift?.jobId),task=shift?.version===2?workStep(job,shift):null,ready=!!job&&workReady(job,shift),stamp=`${ready}:${!!task&&Date.now()>=(shift.nextTaskAt||0)}:${workplace&&near(workplace)}:${state.mode}`;if(stamp!==lastReady){lastReady=stamp;render()}const timer=panel.querySelector('.shift-timer');if(timer)timer.textContent=ready?'Assignment finished. Park and collect your wages.':task?Date.now()>=(shift.nextTaskAt||0)?'Task ready · choose the correct action at the task location.':`Preparing task · ${Math.max(0,Math.ceil((shift.nextTaskAt-Date.now())/1000))}s remaining`:`${Math.max(0,Math.ceil((shift.endsAt-Date.now())/1000))} seconds remaining`}

 return {show,close,sync,tick,get isOpen(){return open}};
}
