import transit from '../../../public/game/transit-routes.json';
import {crashDamage} from '../../../public/game/motion.js';
import {GOODS,HOMES,JOBS,TERMINALS,propertyId} from '../../../public/game/life-catalog.js';
export type LifePlayer={id:string;name:string;life_json:string;revision:number;money:number;energy:number;hunger:number;fun:number;social:number;hygiene:number;xp:number;jobs_done:number;job:string;place_id:string;pos_lng:number|null;pos_lat:number|null;driving:number;last_action_at:number};
type Flight={from:string;to:string;startedAt:number;endsAt:number};
type Life={health:number;deaths:number;lastVitalAt:number;lastCrashAt:number;drivingSince:number;transit:{routeId:string;startedAt:number;endsAt:number}|null;home:string;inventory:Record<string,number>;vehicles:string[];vehicle:string;properties:string[];job:string|null;shift:{jobId:string;endsAt:number}|null;flight:Flight|null;outfit:string|null;furnished:string[]};
export function readLife(p:LifePlayer):Life {let saved;try{saved=JSON.parse(p.life_json||'{}')}catch{saved={}}return {health:100,deaths:0,lastVitalAt:0,lastCrashAt:0,drivingSince:0,transit:null,home:'starter',inventory:{},vehicles:['car'],vehicle:'car',properties:['starter'],job:null,shift:null,flight:null,outfit:null,furnished:[],...saved}}
export function lifeView(p:LifePlayer){const life=readLife(p);return {...life,homeId:propertyId(p.id,life.home),homeName:HOMES.find(h=>h.id===life.home)?.name,apartment:p.id.slice(0,6).toUpperCase()}}
export const metres=(a:number[],b:number[])=>Math.hypot((a[0]-b[0])*111320*Math.cos(a[1]*Math.PI/180),(a[1]-b[1])*111320);
const publicCoords:Record<string,number[]>={home:[-.1949,5.5682],makola:[-.2141,5.5485],kaneshie:[-.2346,5.5724],osu:[-.1819,5.5598],mall:[-.1738,5.6224],airport:[-.1787,5.6093],labadi:[-.140846,5.561955],legon:[-.1874,5.651]};
const here=(p:LifePlayer,place:string)=>!p.driving&&!!publicCoords[place]&&metres([p.pos_lng??-.1949,p.pos_lat??5.5682],publicCoords[place])<=85;
const fail=(message:string,status=400)=>Response.json({error:message},{status,headers:{'Cache-Control':'no-store'}});
export async function propertyInfo(db:D1Database,id:string){const match=/^p_([a-f0-9-]{36})_([a-z-]+)$/.exec(id);if(!match)return null;const owner=await db.prepare('SELECT * FROM players WHERE id=?').bind(match[1]).first<LifePlayer>();const home=HOMES.find(h=>h.id===match[2]);if(!owner||!home||!readLife(owner).properties.includes(home.id))return null;return {id,ownerId:owner.id,ownerName:owner.name,home,coords:[home.lng,home.lat] as [number,number]}}
export async function canEnter(db:D1Database,p:LifePlayer,id:string){const property=await propertyInfo(db,id);if(!property)return false;if(property.ownerId===p.id)return true;return !!await db.prepare('SELECT id FROM property_invites WHERE property_id=? AND guest_id=? AND expires_at>? LIMIT 1').bind(id,p.id,Date.now()).first()}
export async function residences(db:D1Database){const rows=await db.prepare('SELECT id,name,life_json FROM players ORDER BY last_seen_at DESC LIMIT 60').all<LifePlayer>();return rows.results.flatMap(p=>readLife(p).properties.map(id=>{const h=HOMES.find(h=>h.id===id);return h?{...h,id:propertyId(p.id,id),ownerId:p.id,ownerName:p.name,name:`${p.name} · ${h.name}`} :null}).filter(Boolean))}
async function hash(code:string){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code)))).map(x=>x.toString(16).padStart(2,'0')).join('')}
export async function handleLife(db:D1Database,p:LifePlayer,input:Record<string,unknown>,view:(p:any)=>unknown):Promise<Response|null>{
 const type=String(input.type),life=readLife(p),now=Date.now();
 const kinds=['buy','consume','equip','furnish','vehicle-select','job-apply','shift-start','shift-complete','shift-cancel','property-buy','home-set','pass-create','pass-redeem','pass-revoke','flight-book','flight-arrive','cook-inventory','vitals','crash','respawn','recover','bus-board','bus-arrive'];
 if(!kinds.includes(type))return null;
 if(life.health<=0&&!['respawn','vitals'].includes(type))return fail('Restart at home to continue');
 if(life.transit&&!['bus-arrive','vitals'].includes(type))return fail('Your bus is travelling');
 if(life.flight&&!['flight-arrive','vitals'].includes(type))return fail('Finish your flight before doing this');
 const next={...p};let event='',extra:Record<string,unknown>={};
 async function homeAccess(){const property=await propertyInfo(db,p.place_id);return !!property&&!p.driving&&metres([p.pos_lng??0,p.pos_lat??0],property.coords)<=85&&await canEnter(db,p,p.place_id)}
 async function save(){const result=await db.prepare('UPDATE players SET money=?,life_json=?,place_id=?,energy=?,hunger=?,fun=?,social=?,xp=?,job=?,jobs_done=?,revision=revision+1,last_action_at=?,last_seen_at=? WHERE id=? AND revision=?').bind(next.money,JSON.stringify(life),next.place_id,next.energy,next.hunger,next.fun,next.social,next.xp,next.job,next.jobs_done,now,now,p.id,p.revision).run();if(!result.meta.changes)return fail('Your state changed. Please try again.',409);const updated=await db.prepare('SELECT * FROM players WHERE id=?').bind(p.id).first();return Response.json({self:view(updated),event,...extra},{headers:{'Cache-Control':'no-store'}})}

 if(type==='vitals'){
  const gap=life.lastVitalAt?Math.max(0,(now-life.lastVitalAt)/1000):0,elapsed=gap>90?0:gap;
  if(gap<15&&life.lastVitalAt)return Response.json({self:view(p)});
  life.lastVitalAt=now;
  // Only active sessions consume needs. Returning after days away cannot kill a player.
  if(life.health>0){next.hunger=Math.max(0,p.hunger-elapsed/45);next.energy=Math.max(0,p.energy-elapsed/90);if(next.hunger===0)life.health=Math.max(0,life.health-elapsed/10);if(!life.health){life.deaths++;life.shift=null}}
  return save();
 }
 if(type==='crash'){
  const speed=Number(input.speed);if(!p.driving||!Number.isFinite(speed)||speed<0||speed>12+Math.max(0,(now-(life.drivingSince||now))/1000)*6)return fail('Invalid collision');
  if(now-life.lastCrashAt<2000)return fail('Collision already recorded',429);life.lastCrashAt=now;life.health=Math.max(0,life.health-crashDamage(speed));if(!life.health){life.deaths++;life.shift=null}event=life.health?'Collision · slow down and recover at home':'Your character died. Restart at home.';return save();
 }
 if(type==='recover'){if(!p.place_id.startsWith(`p_${p.id}_`)||!await homeAccess())return fail('Rest inside your own home to recover');if(life.health>=100)return fail('You are already healthy');life.health=100;event='Rested and recovered at home';return save()}
 if(type==='respawn'){
  if(life.health>0)return fail('You are still alive');const home=HOMES.find(h=>h.id===life.home)!;life.health=100;life.shift=null;life.flight=null;life.transit=null;life.drivingSince=0;life.lastVitalAt=now;
  const result=await db.prepare('UPDATE players SET life_json=?,pos_lng=?,pos_lat=?,place_id=?,driving=0,energy=80,hunger=80,last_move_at=?,last_action_at=?,last_seen_at=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(life),home.lng,home.lat,propertyId(p.id,home.id),now,now,now,p.id,p.revision).run();if(!result.meta.changes)return fail('Please try again',409);const updated=await db.prepare('SELECT * FROM players WHERE id=?').bind(p.id).first();return Response.json({self:view(updated),event:'A new day at home. Your belongings are safe.'});
 }
 if(type==='bus-board'){
  const route=transit.routes.find(r=>r.id===input.routeId);if(!route)return fail('Choose a bus route');const stop=transit.stops.find(s=>s.id===route.from)!;
  if(p.driving||life.shift||metres([p.pos_lng??0,p.pos_lat??0],[stop.lng,stop.lat])>85)return fail('Walk to this bus stop before boarding');if(p.money<route.fare)return fail('A ticket costs ₵10');
  next.money-=route.fare;const departure=Math.ceil((now+2000)/30000)*30000;life.transit={routeId:route.id,startedAt:departure,endsAt:departure+route.seconds*1000};event='Ticket purchased. Boarded the tro-tro; departure within 30 seconds.';return save();
 }
 if(type==='bus-arrive'){
  const trip=life.transit,route=transit.routes.find(r=>r.id===trip?.routeId);if(!trip||!route||now<trip.endsAt)return fail('Your bus has not arrived');const to=transit.stops.find(s=>s.id===route.to)!,point=route.coordinates[route.coordinates.length-1];life.transit=null;
  const result=await db.prepare('UPDATE players SET life_json=?,pos_lng=?,pos_lat=?,place_id=?,driving=0,last_move_at=?,last_action_at=?,last_seen_at=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(life),point[0],point[1],to.id==='ridge'?'home':to.id,now,now,now,p.id,p.revision).run();if(!result.meta.changes)return fail('Please try again',409);const updated=await db.prepare('SELECT * FROM players WHERE id=?').bind(p.id).first();return Response.json({self:view(updated),event:`Arrived at ${to.name}`});
 }
 const item=GOODS.find(g=>g.id===input.itemId);
 if(type==='buy'){
  if(!item)return fail('Choose an item from the shop');if(!item.shops.some(shop=>here(p,shop)))return fail('Walk into a market or shop that sells this item');
  if(life.shift)return fail('Finish or cancel your shift first');if(next.money<item.price)return fail(`You need ₵${item.price} for ${item.name}`);
  if(item.kind==='vehicle'&&life.vehicles.includes(item.id))return fail('You already own this vehicle');if((life.inventory[item.id]||0)>=99)return fail('Your bag already has enough of this item');
  next.money-=item.price;if(item.kind==='vehicle')life.vehicles.push(item.id);else life.inventory[item.id]=(life.inventory[item.id]||0)+1;event=`Bought ${item.name} for ₵${item.price}`;return save();
 }
 if(['consume','equip','furnish'].includes(type)){
  if(!item||!(life.inventory[item.id]>0))return fail('You do not own this item');
  if(type==='consume'){if(item.kind!=='food')return fail('Choose food or a drink');life.inventory[item.id]--;next.hunger=Math.min(100,p.hunger+(item.hunger||0));next.energy=Math.min(100,p.energy+(item.energy||0));event=`Enjoyed ${item.name}`}
  if(type==='equip'){if(!['clothing','device'].includes(item.kind))return fail('This item cannot be equipped');if(life.outfit===item.id)return fail('This item is already equipped');life.outfit=item.id;next.fun=Math.min(100,p.fun+(item.fun||0));next.social=Math.min(100,p.social+(item.social||0));event=`Using ${item.name}`}
  if(type==='furnish'){if(item.kind!=='furniture')return fail('Choose furniture');if(!p.place_id.startsWith(`p_${p.id}_`)||!await homeAccess())return fail('Enter your own home to place furniture');if(life.furnished.includes(item.id))return fail('This furniture is already placed');life.furnished.push(item.id);life.inventory[item.id]--;event=`Placed ${item.name} in your home`}
  return save();
 }
 if(type==='cook-inventory'){if(p.driving)return fail('Leave the vehicle first');if(!await homeAccess())return fail('Use the kitchen inside an accessible home');if(!(life.inventory.groceries>0))return fail('Buy cooking ingredients at the market first');life.inventory.groceries--;life.inventory.jollof=(life.inventory.jollof||0)+2;event='Cooked two portions of jollof. Find them in your bag.';return save()}
 if(type==='vehicle-select'){const vehicle=String(input.vehicle);if(p.driving)return fail('Park before changing vehicles');if(!life.vehicles.includes(vehicle))return fail('You do not own that vehicle');life.vehicle=vehicle;event=`Selected your ${vehicle}`;return save()}
 if(type==='job-apply'){const job=JOBS.find(j=>j.id===input.jobId);if(!job)return fail('Choose a job');if(!here(p,job.place))return fail('Visit the workplace to apply');if(life.shift)return fail('Finish your current shift');life.job=job.id;next.job=job.name;next.place_id=job.place;event=`Hired as ${job.name}. You can start a shift here.`;return save()}
 if(type==='shift-start'){const job=JOBS.find(j=>j.id===life.job);if(!job||!here(p,job.place))return fail('Visit your workplace first');if(life.shift)return fail('A shift is already running');if(p.energy<job.energy+5)return fail('Rest before starting work');next.place_id=job.place;life.shift={jobId:job.id,endsAt:now+job.seconds*1000};event=job.task;return save()}
 if(type==='shift-complete'){const shift=life.shift,job=JOBS.find(j=>j.id===shift?.jobId);if(!shift||!job)return fail('Start a shift first');if(now<shift.endsAt)return fail('Your shift is still in progress');if(!here(p,job.place))return fail('Return to the workplace to collect your pay');life.shift=null;next.money+=job.wage;next.energy=Math.max(0,p.energy-job.energy);next.hunger=Math.max(0,p.hunger-8);next.xp+=20;next.jobs_done++;event=`Shift complete. Earned ₵${job.wage}.`;return save()}
 if(type==='shift-cancel'){life.shift=null;event='Shift cancelled. No wage was earned.';return save()}
 if(type==='property-buy'){const h=HOMES.find(h=>h.id===input.homeId);if(!h||!h.price)return fail('Choose a listed home');if(life.properties.includes(h.id))return fail('You already own this home');if(p.driving||metres([p.pos_lng??0,p.pos_lat??0],[h.lng,h.lat])>85)return fail('Visit the property to purchase it');if(p.money<h.price)return fail(`This home costs ₵${h.price}`);next.money-=h.price;life.properties.push(h.id);event=`You now own ${h.name}`;return save()}
 if(type==='home-set'){const id=String(input.homeId);if(!life.properties.includes(id))return fail('Choose a home you own');life.home=id;event='Your primary home is updated';return save()}
 if(type==='pass-create'||type==='pass-revoke'){
  const id=String(input.propertyId),property=await propertyInfo(db,id);if(!property||property.ownerId!==p.id)return fail('Only the property owner can manage passes',403);
  if(type==='pass-revoke'){await db.prepare('DELETE FROM property_invites WHERE property_id=? AND owner_id=?').bind(id,p.id).run();return Response.json({event:'All guest passes for this property have been revoked.'})}
  const count=await db.prepare('SELECT COUNT(*) AS n FROM property_invites WHERE owner_id=? AND expires_at>?').bind(p.id,now).first<{n:number}>();if((count?.n||0)>=20)return fail('Revoke old passes before creating more');
  const code=crypto.randomUUID().replaceAll('-','').slice(0,16).toUpperCase();await db.prepare('INSERT INTO property_invites (id,property_id,owner_id,code_hash,expires_at) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),id,p.id,await hash(code),now+86400000).run();return Response.json({event:'One guest can redeem this pass. It expires in 24 hours.',pass:code,propertyId:id});
 }
 if(type==='pass-redeem'){const code=String(input.code||'').trim().toUpperCase();if(!/^[A-F0-9]{16}$/.test(code))return fail('Enter a valid invitation pass');const digest=await hash(code);const result=await db.prepare('UPDATE property_invites SET guest_id=? WHERE code_hash=? AND guest_id IS NULL AND expires_at>?').bind(p.id,digest,now).run();if(!result.meta.changes)return fail('That pass is expired or has already been used');const pass=await db.prepare('SELECT property_id FROM property_invites WHERE code_hash=? AND guest_id=?').bind(digest,p.id).first<{property_id:string}>();return Response.json({event:'Guest access granted for 24 hours from issue.',propertyId:pass?.property_id})}
 if(type==='flight-book'){
  if(life.shift)return fail('Finish or cancel your shift before travelling');const from=TERMINALS.find(t=>here(p,t.id)),to=TERMINALS.find(t=>t.id===input.destination);if(!from||!to||from.id===to.id)return fail('Visit a game air terminal and choose another terminal');if(p.money<65)return fail('A shuttle ticket costs ₵65');next.money-=65;life.flight={from:from.id,to:to.id,startedAt:now,endsAt:now+60000};event='Boarded the city air shuttle · 60 seconds to arrival';return save();
 }
 if(type==='flight-arrive'){
  if(!life.flight)return fail('No flight is in progress');if(now<life.flight.endsAt)return fail('The aircraft has not arrived yet');const to=TERMINALS.find(t=>t.id===life.flight!.to)!;life.flight=null;
  // The flight completion and wallet revision are committed in one conditional update.
  const result=await db.prepare('UPDATE players SET life_json=?,pos_lng=?,pos_lat=?,place_id=?,driving=0,last_move_at=?,last_seen_at=?,revision=revision+1 WHERE id=? AND revision=?').bind(JSON.stringify(life),to.lng,to.lat,to.id,now,now,p.id,p.revision).run();if(!result.meta.changes)return fail('Your state changed. Please try again.',409);const updated=await db.prepare('SELECT * FROM players WHERE id=?').bind(p.id).first();return Response.json({self:view(updated),event:`Arrived at ${to.name}`});
 }
 return null;
}
