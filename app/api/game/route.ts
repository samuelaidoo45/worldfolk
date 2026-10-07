import transit from '../../../public/game/transit-routes.json';
import {routePoint} from '../../../public/game/transit.js';
import {readLife,lifeView,handleLife,propertyInfo,canEnter,residences} from './life';
import {HOMES,propertyId} from '../../../public/game/life-catalog.js';
import { env } from "cloudflare:workers";

type Player = {
  life_json:string; revision:number; session_token:string|null;
  id: string; name: string; avatar: string; place_id: string; money: number;
  pos_lng: number|null; pos_lat: number|null; heading: number; driving: number; last_move_at: number;
  energy: number; hunger: number; fun: number; social: number; hygiene: number;
  xp: number; day: number; minute: number; home_tier: number; job: string;
  jobs_done: number; chats_sent: number; visits: number;
  last_action_at: number; last_chat_at: number; last_seen_at: number;
};

const PLACE_COORDS: Record<string, [number, number]> = {
  home: [-0.1949, 5.5682], square: [-0.1935, 5.5448], nkrumah: [-0.2024, 5.5446],
  jamestown: [-0.2161, 5.5352], makola: [-0.2141, 5.5485], osu: [-0.1819, 5.5598],
  labadi: [-0.140846, 5.561955], arts: [-0.2033, 5.5464], theatre: [-0.2047, 5.5516],
  dubois: [-0.1698, 5.5815], mall: [-0.1738, 5.6224], airport: [-0.1787, 5.6093],
  eastlegon: [-0.1572, 5.6357], legon: [-0.1874, 5.6510], kaneshie: [-0.2346, 5.5724],
};
const ACCRA_BOUNDS={west:-0.36,south:5.43,east:0.07,north:5.78};
function placeCoords(id:string): [number,number]|null {
  if(Object.hasOwn(PLACE_COORDS,id))return PLACE_COORDS[id];
  const match=/^g_(-?\d{1,6})_(-?\d{1,6})$/.exec(id);
  if(!match)return null;
  const lng=Number(match[1])/10000,lat=Number(match[2])/10000;
  return lng>=ACCRA_BOUNDS.west&&lng<=ACCRA_BOUNDS.east&&lat>=ACCRA_BOUNDS.south&&lat<=ACCRA_BOUNDS.north?[lng,lat]:null;
}

type Action = { place: string[]; minutes: number; money?: number; energy?: number;
  hunger?: number; fun?: number; social?: number; hygiene?: number; xp?: number;
  job?: string; jobShift?: boolean; label: string; minEnergy?: number; upgrade?: boolean };
const ACTIONS: Record<string, Action> = {
  sleep: {place:["home"],minutes:420,energy:70,hunger:-12,fun:4,label:"Sleep until morning"},
  cook: {place:["home"],minutes:45,money:-8,hunger:48,fun:5,label:"Cook at home"},
  shower: {place:["home"],minutes:25,hygiene:60,label:"Take a shower"},
  relax: {place:["home"],minutes:60,fun:22,energy:9,label:"Relax at home"},
  upgrade: {place:["home"],minutes:90,xp:25,label:"Upgrade your home",upgrade:true},
  office: {place:["airport"],minutes:180,money:78,energy:-24,hunger:-10,fun:-8,xp:28,job:"Office professional",jobShift:true,minEnergy:20,label:"Work an office shift"},
  trade: {place:["makola"],minutes:150,money:48,energy:-20,hunger:-8,social:7,xp:22,job:"Market trader",jobShift:true,minEnergy:18,label:"Trade at the market"},
  cafe: {place:["osu"],minutes:120,money:38,energy:-17,hunger:-7,social:12,xp:19,job:"Hospitality crew",jobShift:true,minEnergy:16,label:"Work a café shift"},
  meal: {place:["osu"],minutes:45,money:-18,hunger:45,fun:9,label:"Eat out in Osu"},
  nightlife: {place:["osu"],minutes:120,money:-32,energy:-17,hunger:-8,fun:35,social:28,label:"Go out for the night"},
  marketfood: {place:["makola","kaneshie"],minutes:35,money:-11,hunger:34,fun:6,label:"Grab market food"},
  beach: {place:["labadi"],minutes:90,money:-5,energy:-9,fun:31,social:12,label:"Enjoy the beach"},
  browse: {place:["arts"],minutes:75,money:-12,fun:25,xp:10,label:"Browse local art"},
  museum: {place:["nkrumah","dubois"],minutes:80,money:-10,fun:18,xp:13,label:"Explore the museum"},
  study: {place:["legon","dubois"],minutes:120,energy:-9,fun:4,xp:24,label:"Study and learn"},
  shopping: {place:["mall","eastlegon"],minutes:70,money:-32,fun:21,hygiene:8,label:"Go shopping"},
  stroll: {place:["square","jamestown","theatre","home","eastlegon"],minutes:50,energy:-5,fun:16,xp:4,label:"Explore the neighbourhood"},
  connect: {place:Object.keys(PLACE_COORDS),minutes:40,energy:-3,social:22,fun:7,label:"Meet people nearby"},
  explore: {place:[],minutes:60,energy:-7,fun:18,xp:8,label:"Explore this place"},
};

const AVATARS = new Set(["🧑🏾","👩🏾","👨🏾","👩🏿","👨🏿","🧑🏽","👩🏽","👨🏽"]);
const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
const json = (data: unknown, status = 200, extra: HeadersInit = {}) => Response.json(data, {status, headers:{"Cache-Control":"no-store",...extra}});
const cookieId = (request: Request) => request.headers.get("cookie")?.match(/(?:^|;\s*)accralife_session=([a-f0-9-]{36})(?:;|$)/)?.[1] ?? null;

function view(p: Player) {
  const [lng,lat]=playerPosition(p);
  return {id:p.id,name:p.name,avatar:p.avatar,placeId:p.place_id,money:p.money,
    lng,lat,heading:p.heading,driving:!!p.driving,life:lifeView(p),
    energy:p.energy,hunger:p.hunger,fun:p.fun,social:p.social,hygiene:p.hygiene,
    xp:p.xp,level:Math.floor(p.xp/100)+1,day:p.day,minute:p.minute,
    homeTier:p.home_tier,job:p.job,jobsDone:p.jobs_done,chatsSent:p.chats_sent,visits:p.visits};
}
function playerPosition(p:Player):[number,number]{return p.pos_lng!==null&&p.pos_lat!==null?[p.pos_lng,p.pos_lat]:placeCoords(p.place_id)??PLACE_COORDS.home}
async function ownPlayer(db: D1Database, request: Request) {
  const id = cookieId(request);
  return id ? await db.prepare("SELECT * FROM players WHERE session_token=? OR (id=? AND session_token IS NULL)").bind(id,id).first<Player>() : null;
}
function elapsed(p: Player, minutes: number) {
  const total = p.minute + minutes;
  return {day:p.day+Math.floor(total/1440),minute:total%1440};
}
function distanceKm(a: [number,number], b: [number,number]) {
  const dx=(a[0]-b[0])*111*Math.cos(a[1]*Math.PI/180),dy=(a[1]-b[1])*111;
  return Math.sqrt(dx*dx+dy*dy);
}

export async function GET(request: Request) {
  const db=env.DB;if(!db)return json({error:"World storage is unavailable"},503);
  try {
    const now=Date.now();const self=await ownPlayer(db,request);let sessionHeaders:HeadersInit={};
    if(self&&!self.session_token){const token=crypto.randomUUID();const result=await db.prepare('UPDATE players SET session_token=? WHERE id=? AND session_token IS NULL').bind(token,self.id).run();if(result.meta.changes)sessionHeaders={"Set-Cookie":`accralife_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${new URL(request.url).protocol==='https:'?'; Secure':''}`}}
    const online=await db.prepare("SELECT id,name,avatar,place_id,pos_lng,pos_lat,heading,driving,life_json FROM players WHERE last_seen_at > ? ORDER BY last_seen_at DESC LIMIT 100").bind(now-120000).all<Pick<Player,"id"|"name"|"avatar"|"place_id"|"pos_lng"|"pos_lat"|"heading"|"driving"|"life_json">>();
    const channel=new URL(request.url).searchParams.get("channel")||"city";
    const safeChannel=channel==="city"?"city":self?.place_id||"city";
    const messages=await db.prepare("SELECT m.id,m.channel,m.body,m.created_at,p.id AS player_id,p.name,p.avatar FROM messages m JOIN players p ON p.id=m.player_id WHERE m.channel=? ORDER BY m.created_at DESC LIMIT 40").bind(safeChannel).all();
    return json({self:self?view(self):null,players:online.results.map((p)=>{const life=readLife(p as Player),trip=life.transit,route=transit.routes.find(r=>r.id===trip?.routeId),ride=trip&&route?routePoint(route.coordinates,(now-trip.startedAt)/(trip.endsAt-trip.startedAt)):null,[lng,lat]=ride?.position||playerPosition(p as Player);return {id:p.id,name:p.name,avatar:p.avatar,placeId:p.place_id,lng,lat,heading:ride?.heading??p.heading,driving:!!p.driving||!!ride,vehicle:ride?'bus':life.vehicle,health:life.health}}),messages:messages.results.reverse(),channel:safeChannel,residences:await residences(db),accessAllowed:!self?.place_id.startsWith("p_")||await canEnter(db,self!,self!.place_id)},200,sessionHeaders);
  } catch(error){console.error("world GET",error);return json({error:"Could not load the city"},500)}
}

export async function POST(request: Request) {
  const db=env.DB;if(!db)return json({error:"World storage is unavailable"},503);
  const origin=request.headers.get("origin");if(origin&&origin!==new URL(request.url).origin)return json({error:"Origin not allowed"},403);
  if(!request.headers.get("content-type")?.includes("application/json"))return json({error:"JSON required"},415);
  try {
    const raw=await request.text();
    if(raw.length>2048)return json({error:"Request too large"},413);
    let input: Record<string,unknown>;
    try{input=JSON.parse(raw) as Record<string,unknown>}catch{return json({error:"Invalid JSON"},400)}
    if(!input||typeof input!=="object"||Array.isArray(input))return json({error:"Invalid request"},400);
    const type=String(input.type||"");const now=Date.now();
    if(type==="join"){
      const existing=await ownPlayer(db,request);if(existing)return json({self:view(existing)});
      const name=String(input.name||"").trim().replace(/\s+/g," ");
      if(name.length<2||name.length>24||!/^[\p{L}\p{N} _'-]+$/u.test(name))return json({error:"Choose a name of 2–24 letters or numbers"},400);
      const avatar=String(input.avatar||"");if(!AVATARS.has(avatar))return json({error:"Choose an avatar"},400);
      const id=crypto.randomUUID(),token=crypto.randomUUID();
      await db.prepare("INSERT INTO players (id,name,avatar,session_token,place_id,pos_lng,pos_lat,last_seen_at,created_at) VALUES (?,?,?,?,?,?,?,?,?)").bind(id,name,avatar,token,propertyId(id,'starter'),-.1949,5.5682,now,now).run();
      const p=await db.prepare("SELECT * FROM players WHERE id=?").bind(id).first<Player>();
      const secure=new URL(request.url).protocol==="https:"?"; Secure":"";
      return json({self:view(p!)},201,{"Set-Cookie":`accralife_session=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000${secure}`});
    }
    let p=await ownPlayer(db,request);if(!p)return json({error:"Create your Sim to play"},401);
    if(p.driving&&!readLife(p).drivingSince){const migrated={...readLife(p),drivingSince:now-30000};await db.prepare("UPDATE players SET life_json=?,revision=revision+1 WHERE id=? AND revision=?").bind(JSON.stringify(migrated),p.id,p.revision).run();const updated=await db.prepare("SELECT * FROM players WHERE id=?").bind(p.id).first<Player>();if(updated)p=updated;}
    const lifeInput=type==='act'&&input.actionId==='cook'?{type:'cook-inventory'}:input;
    const lifeResult=await handleLife(db,p,lifeInput,view);if(lifeResult)return lifeResult;
    const life=readLife(p);
    if(life.health<=0&&!["heartbeat","chat"].includes(type))return json({error:"Restart at home to continue"},400);
    if(life.transit&&!["heartbeat","chat"].includes(type))return json({error:"Your bus journey is in progress"},400);
    if(life.flight&&!["heartbeat","chat"].includes(type))return json({error:"Your flight is in progress"},400);
    if(life.shift&&["vehicle","enter","travel","act"].includes(type))return json({error:"Finish or cancel your shift first"},400);
    if(type==="heartbeat"){
      await db.prepare("UPDATE players SET last_seen_at=? WHERE id=?").bind(now,p.id).run();
      return json({ok:true});
    }
    if(type==="move"){
      if(life.shift)return json({error:"Finish or cancel your shift before leaving work"},400);
      const lng=Number(input.lng),lat=Number(input.lat),heading=Number(input.heading);
      if(!Number.isFinite(lng)||!Number.isFinite(lat)||!Number.isFinite(heading)||lng<ACCRA_BOUNDS.west||lng>ACCRA_BOUNDS.east||lat<ACCRA_BOUNDS.south||lat>ACCRA_BOUNDS.north)return json({error:"Stay inside Accra"},400);
      if(now-p.last_move_at<180)return json({error:"Slow down"},429);
      const seconds=p.last_move_at?Math.min(8,(now-p.last_move_at)/1000):8;
      const distance=distanceKm(playerPosition(p),[lng,lat])*1000;
      const spawnCorrection=input.spawnCorrection===true&&distance<=35&&(p.last_move_at===p.last_action_at||now-p.last_move_at>=8000);
      if(!spawnCorrection&&distance>2.5+seconds*(p.driving?(12+Math.max(0,(now-(life.drivingSince||now))/1000)*6):7))return json({error:"Move through the city to get there"},400);
      await db.prepare("UPDATE players SET pos_lng=?,pos_lat=?,heading=?,last_move_at=?,last_seen_at=? WHERE id=?").bind(lng,lat,((Math.round(heading)%360)+360)%360,now,now,p.id).run();
      return json({ok:true,lng,lat});
    }
    if(type==="vehicle"){
      const entering=input.enter===true;const lng=Number(input.lng),lat=Number(input.lat);
      if(entering&&p.driving||!entering&&!p.driving)return json({error:entering?"You are already driving":"You are already on foot"},400);
      if(!Number.isFinite(lng)||!Number.isFinite(lat)||lng<ACCRA_BOUNDS.west||lng>ACCRA_BOUNDS.east||lat<ACCRA_BOUNDS.south||lat>ACCRA_BOUNDS.north)return json({error:"Choose a spot in Accra"},400);
      if(distanceKm(playerPosition(p),[lng,lat])>(entering?0.008:0.004))return json({error:"Move closer to the vehicle"},400);
      await db.prepare("UPDATE players SET driving=?,pos_lng=?,pos_lat=?,last_move_at=?,last_seen_at=?,life_json=?,revision=revision+1 WHERE id=? AND revision=?").bind(entering?1:0,lng,lat,now,now,JSON.stringify({...life,drivingSince:entering?now:0}),p.id,p.revision).run();
      const updated=await db.prepare("SELECT * FROM players WHERE id=?").bind(p.id).first<Player>();
      return json({self:view(updated!)});
    }
    if(type==="enter"){
      if(p.driving)return json({error:"Park and leave the vehicle first"},400);
      let place=String(input.placeId||"");if(place==='home')place=propertyId(p.id,life.home);
      const property=place.startsWith('p_')?await propertyInfo(db,place):null;
      if(place.startsWith('p_')&&!await canEnter(db,p,place))return json({error:"Private home. Ask its owner for an invitation pass.",requiresPass:true},403);
      const coords=property?.coords||placeCoords(place);
      if(place.startsWith('g_')&&coords&&HOMES.some(h=>Math.hypot((coords[0]-h.lng)*111000*Math.cos(coords[1]*Math.PI/180),(coords[1]-h.lat)*111000)<35))return json({error:'Private residential address. Choose its owner’s home and use a guest pass.',requiresPass:true},403);
      if(!coords||distanceKm(playerPosition(p),coords)>0.085)return json({error:"Move closer to interact here"},400);
      if(place!==p.place_id)await db.prepare("UPDATE players SET place_id=?,visits=visits+1,last_seen_at=? WHERE id=?").bind(place,now,p.id).run();
      const updated=await db.prepare("SELECT * FROM players WHERE id=?").bind(p.id).first<Player>();
      return json({self:view(updated!)});
    }
    if(type==="travel")return json({error:"Choose a route and walk, drive, or board a flight to travel"},400);
    if(type==="act"){
      if(p.driving)return json({error:"Leave the vehicle to do this activity"},400);
      const key=String(input.actionId||"");const action=ACTIONS[key];
      if(["office","trade","cafe"].includes(key))return json({error:"Apply for a job and complete a timed shift through My life"},400);
      const property=p.place_id.startsWith('p_')?await propertyInfo(db,p.place_id):null;
      if(p.place_id.startsWith('p_')&&!await canEnter(db,p,p.place_id))return json({error:"Your guest pass has expired or been revoked"},403);
      if(key==='upgrade'&&property&&property.ownerId!==p.id)return json({error:"Only the owner can upgrade this home"},403);
      const geoPlace=p.place_id.startsWith("g_")&&placeCoords(p.place_id)!==null;
      if(!action||!(action.place.includes(p.place_id)||property&&action.place.includes('home')||geoPlace&&["explore","stroll","connect"].includes(key)))return json({error:"That activity is not available here"},400);
      if(distanceKm(playerPosition(p),property?.coords??placeCoords(p.place_id)??PLACE_COORDS.home)>0.085)return json({error:"Move closer to this place"},400);
      if(now-p.last_action_at<1000)return json({error:"Give your Sim a moment"},429);
      if(p.energy<(action.minEnergy??0))return json({error:"Your Sim needs rest before doing this"},400);
      if(key==="upgrade"&&p.home_tier>=3)return json({error:"Your home is fully upgraded"},400);
      const cost=key==="upgrade"?250*(p.home_tier+1):0;
      if(p.money+(action.money??0)-cost<0)return json({error:"You need more cedis for that activity"},400);
      const clock=elapsed(p,action.minutes);
      const hungerLoss=key==="sleep"?0:Math.floor(action.minutes/60)*3;
      const energyLoss=key==="sleep"?0:Math.floor(action.minutes/90)*2;
      const values={money:p.money+(action.money??0)-cost,energy:clamp(p.energy+(action.energy??0)-energyLoss),
        hunger:clamp(p.hunger+(action.hunger??0)-hungerLoss),fun:clamp(p.fun+(action.fun??0)),
        social:clamp(p.social+(action.social??0)),hygiene:clamp(p.hygiene+(action.hygiene??0)-Math.floor(action.minutes/150)*2),
        xp:p.xp+(action.xp??3),day:clock.day,minute:clock.minute,homeTier:p.home_tier+(action.upgrade?1:0),
        job:action.job??p.job,jobsDone:p.jobs_done+(action.jobShift?1:0)};
      const result=await db.prepare("UPDATE players SET money=?,energy=?,hunger=?,fun=?,social=?,hygiene=?,xp=?,day=?,minute=?,home_tier=?,job=?,jobs_done=?,last_action_at=?,last_seen_at=?,revision=revision+1 WHERE id=? AND revision=?")
        .bind(values.money,values.energy,values.hunger,values.fun,values.social,values.hygiene,values.xp,values.day,values.minute,values.homeTier,values.job,values.jobsDone,now,now,p.id,p.revision).run();
      if(!result.meta.changes)return json({error:"Your state changed. Please try again."},409);
      const updated=await db.prepare("SELECT * FROM players WHERE id=?").bind(p.id).first<Player>();
      return json({self:view(updated!),event:action.upgrade?"Your home has a new upgrade!":`${action.label} complete.`});
    }
    if(type==="chat"){
      if(now-p.last_chat_at<3000)return json({error:"Wait a moment before sending another message"},429);
      const body=String(input.body||"").trim().replace(/[\u0000-\u001f\u007f]/g," ");
      if(!body||body.length>220)return json({error:"Messages must be 1–220 characters"},400);
      const channel=input.channel==="city"?"city":p.place_id;
      await db.batch([
        db.prepare("INSERT INTO messages (id,player_id,channel,body,created_at) VALUES (?,?,?,?,?)").bind(crypto.randomUUID(),p.id,channel,body,now),
        db.prepare("UPDATE players SET chats_sent=chats_sent+1,social=MIN(100,social+3),last_chat_at=?,last_seen_at=? WHERE id=?").bind(now,now,p.id),
      ]);
      return json({ok:true});
    }
    return json({error:"Unknown action"},400);
  } catch(error){console.error("world POST",error);return json({error:"The city could not save that action"},500)}
}
