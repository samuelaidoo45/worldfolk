import {inAccra} from '../public/game/map-region.js';
import { DurableObject } from 'cloudflare:workers';

export type WorldPlayer = {
  id:string; session_token:string; name:string; handle?:string; avatar:string; place_id:string;
  pos_lng:number; pos_lat:number; heading:number; driving:number; life_json:string;
  revision:number; last_move_at:number; last_action_at:number; session_expires_at?:number;
};
// Escape UTF-16 code units so names and emoji stay valid HTTP header values.
export const playerHeader=(player:WorldPlayer)=>JSON.stringify(player).replace(/[\u007f-\uffff]/g,c=>'\\u'+c.charCodeAt(0).toString(16).padStart(4,'0'));
type Member = { player:WorldPlayer; at:number; savedAt:number; dirty:boolean; lastPacket:number; lastSync?:number; room:string };
export function roomFor(lng:number,lat:number){return `accra:${Math.floor((lng+.36)/.02)}:${Math.floor((lat-5.43)/.02)}`}
function life(p:WorldPlayer){try{return JSON.parse(p.life_json||'{}')}catch{return {}}}
function compact(p:WorldPlayer):WorldPlayer{const l=life(p);return {id:p.id,session_token:p.session_token,session_expires_at:p.session_expires_at,name:p.name,handle:p.handle,avatar:p.avatar,place_id:p.place_id,pos_lng:p.pos_lng,pos_lat:p.pos_lat,heading:p.heading,driving:p.driving,revision:p.revision,last_move_at:p.last_move_at,last_action_at:p.last_action_at,life_json:JSON.stringify({rest:l.rest||null,arrested:!!l.arrested,health:l.health??100,vehicle:l.vehicle,drivingSince:l.drivingSince,autoDriveRate:l.autoDriveRate,shift:l.shift?{jobId:l.shift.jobId,version:l.shift.version}:null,flight:!!l.flight,transit:!!l.transit})}}
function publicPlayer(p:WorldPlayer){const l=life(p);return {id:p.id,revision:p.revision,name:p.name,handle:p.handle,avatar:p.avatar,placeId:p.place_id,lng:p.pos_lng,lat:p.pos_lat,heading:p.heading,driving:!!p.driving,vehicle:l.vehicle,health:l.health??100}}
export function validMove(m:Member,input:Record<string,unknown>,now:number){
  const {lng,lat,heading}=input;
  if(typeof lng!=='number'||typeof lat!=='number'||typeof heading!=='number'||![lng,lat,heading].every(Number.isFinite)||!inAccra(lng,lat))return false;
  const p=m.player,l=life(p);if(l.rest||l.health<=0||l.arrested||(l.shift&&l.shift.version!==2&&l.shift.jobId!=='driver')||l.flight||l.transit)return false;
  const metres=Math.hypot((lng-p.pos_lng)*111320*Math.cos(lat*Math.PI/180),(lat-p.pos_lat)*111320);
  const seconds=Math.min(8,Math.max(0,(now-m.at)/1000));
  const correction=input.spawnCorrection===true&&metres<=35&&(p.last_move_at===p.last_action_at||now-m.at>=8000);
  return correction||metres<=2.5+seconds*(p.driving?Math.max(12+Math.max(0,(now-(l.drivingSince||now))/1000)*6,l.autoDriveRate>1?22*Math.min(8,l.autoDriveRate)+4:0):7);
}

// Each geographic room owns a bounded set of live sockets. Durable progress remains in D1.
export class WorldRoom extends DurableObject<Cloudflare.Env> {
  constructor(ctx:DurableObjectState,env:Cloudflare.Env){super(ctx,env);this.ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping','pong'))}
  members(){return this.ctx.getWebSockets().map(ws=>({ws,m:ws.deserializeAttachment() as Member})).filter(x=>x.m&&x.ws.readyState===1)}
  send(ws:WebSocket,value:unknown){try{ws.send(JSON.stringify(value))}catch{/* close callback removes the member */}}
  broadcast(value:unknown,except?:WebSocket){for(const {ws} of this.members())if(ws!==except)this.send(ws,value)}
  async save(ws:WebSocket,_member:Member){
    return this.ctx.blockConcurrencyWhile(async()=>{
    const m=ws.deserializeAttachment() as Member;
    if(!this.env.DB)return;
    const p=m.player,now=Date.now();
    const result=await this.env.DB.prepare('UPDATE players SET pos_lng=?,pos_lat=?,heading=?,last_move_at=?,last_seen_at=? WHERE id=? AND session_token=? AND revision=? AND last_move_at<=?')
      .bind(p.pos_lng,p.pos_lat,p.heading,m.at,now,p.id,p.session_token,p.revision,m.savedAt).run();
    if(!result.meta.changes){await this.reload(ws,m,true);if(m.dirty){const latest=m.player;const retried=await this.env.DB.prepare('UPDATE players SET pos_lng=?,pos_lat=?,heading=?,last_move_at=?,last_seen_at=? WHERE id=? AND session_token=? AND revision=? AND last_move_at<=?').bind(latest.pos_lng,latest.pos_lat,latest.heading,m.at,now,latest.id,latest.session_token,latest.revision,m.savedAt).run();if(retried.meta.changes){m.savedAt=m.at;m.dirty=false;ws.serializeAttachment(m)}}return}
    m.savedAt=m.at;m.dirty=false;ws.serializeAttachment(m);
    });
  }
  async reload(ws:WebSocket,m:Member,correct=false){
    const p=await this.env.DB!.prepare('SELECT *, (SELECT username FROM accounts WHERE player_id=players.id) AS handle FROM players WHERE id=? AND session_token=?').bind(m.player.id,m.player.session_token).first<WorldPlayer>();
    if(!p){ws.close(4003,'Session ended');return}
    // A life/needs update can finish while newer movement is already in flight.
    // Preserve that movement unless the action actually moved/locked the player.
    const l=life(p),keep=m.dirty&&p.last_move_at===m.savedAt&&p.driving===m.player.driving&&p.place_id===m.player.place_id&&!l.rest&&!l.transit&&!l.flight&&!l.arrested&&(l.health??100)>0&&(!l.shift||l.shift.version===2||l.shift.jobId==='driver');
    const live=m.player,at=m.at;m.player=compact(p);m.savedAt=p.last_move_at;m.dirty=keep;
    if(keep){m.player.pos_lng=live.pos_lng;m.player.pos_lat=live.pos_lat;m.player.heading=live.heading;m.player.last_move_at=at;m.at=at}else m.at=p.last_move_at||Date.now();
    ws.serializeAttachment(m);
    if(correct&&!keep)this.send(ws,{type:'correct',player:publicPlayer(p)});this.broadcast({type:'player',player:publicPlayer(m.player)},ws);
  }
  async fetch(request:Request){
    const url=new URL(request.url);
    if(url.pathname==='/checkpoint'||url.pathname==='/disconnect'){
      const {id,token,persist}=await request.json() as {id:string;token:string;persist:boolean};
      const member=this.members().find(({m})=>m.player.id===id&&m.player.session_token===token);
      if(!member)return Response.json({player:null});
      if(persist||url.pathname==='/disconnect')await this.save(member.ws,member.m);
      if(url.pathname==='/disconnect'){member.ws.close(4000,'Opened in another tab');this.broadcast({type:'leave',id},member.ws);}
      return Response.json({player:member.ws.deserializeAttachment().player});
    }
    if(request.headers.get('Upgrade')!=='websocket')return new Response('WebSocket required',{status:426});
    let player=compact(JSON.parse(request.headers.get('X-World-Player')!) as WorldPlayer);
    for(const {ws,m} of this.members())if(m.player.id===player.id){await this.save(ws,m);player=compact((await this.env.DB!.prepare('SELECT *, (SELECT username FROM accounts WHERE player_id=players.id) AS handle FROM players WHERE id=?').bind(player.id).first<WorldPlayer>())!);ws.close(4000,'Opened in another tab')}
    // Bounded fan-out per simulation instance; allocator opens more as needed.
    if(this.members().filter(({ws})=>ws.readyState===1).length>=128)return new Response('Instance full',{status:409});
    const pair=new WebSocketPair(),client=pair[0],server=pair[1];this.ctx.acceptWebSocket(server);
    const room=request.headers.get('X-World-Room')||roomFor(player.pos_lng,player.pos_lat);
    server.serializeAttachment({player,at:player.last_move_at||Date.now(),savedAt:player.last_move_at,dirty:false,lastPacket:0,room} satisfies Member);
    this.send(server,{type:'welcome',room,players:this.members().map(({m})=>publicPlayer(m.player))});
    this.broadcast({type:'player',player:publicPlayer(player)},server);
    if(!await this.ctx.storage.getAlarm())await this.ctx.storage.setAlarm(Date.now()+60000);
    return new Response(null,{status:101,webSocket:client,headers:{'X-World-Room':room}});
  }
  async webSocketMessage(ws:WebSocket,message:string|ArrayBuffer){
    if(typeof message!=='string'||message.length>1024){ws.close(1009,'Message too large');return}
    let input:Record<string,unknown>;try{input=JSON.parse(message)}catch{ws.close(1003,'Invalid JSON');return}
    if(!input||typeof input!=='object'||Array.isArray(input))return;
    const m=ws.deserializeAttachment() as Member,now=Date.now();
    if(m.player.session_expires_at&&m.player.session_expires_at<=now){ws.close(4003,'Session expired');return}
    if(input.type==='sync'){if(now-(m.lastSync||0)<300){ws.close(1008,'Sync rate exceeded');return}m.lastSync=now;await this.ctx.blockConcurrencyWhile(()=>this.reload(ws,m));this.send(ws,{type:'synced',seq:input.seq});if(roomFor(m.player.pos_lng,m.player.pos_lat)!==m.room.split(':instance:')[0])ws.close(4001,'Entering next district');return}
    if(now-m.lastPacket<150){this.send(ws,{type:'retry',seq:input.seq});return} m.lastPacket=now;ws.serializeAttachment(m);
    if(input.type!=='move')return;
    if(!validMove(m,input,now)){this.send(ws,{type:'correct',seq:input.seq,player:publicPlayer(m.player)});return}
    m.player.pos_lng=Number(input.lng);m.player.pos_lat=Number(input.lat);m.player.heading=((Number(input.heading)%360)+360)%360;m.at=now;m.player.last_move_at=now;m.dirty=true;ws.serializeAttachment(m);
    this.send(ws,{type:'ack',seq:input.seq});
    this.broadcast({type:'player',player:publicPlayer(m.player)},ws);
    if(roomFor(m.player.pos_lng,m.player.pos_lat)!==m.room.split(':instance:')[0]){await this.save(ws,m);ws.close(4001,'Entering next district')}
  }
  async webSocketClose(ws:WebSocket,code:number,reason:string){const m=ws.deserializeAttachment() as Member;if(m?.dirty)await this.save(ws,m);if(code!==1005&&code!==1006){try{ws.close(code,reason)}catch{/* The runtime may already have acknowledged the close. */}}if(m&&!this.members().some(x=>x.ws!==ws&&x.m.player.id===m.player.id))this.broadcast({type:'leave',id:m.player.id},ws)}
  async webSocketError(ws:WebSocket){await this.webSocketClose(ws,1011,'Reconnect')}
  async alarm(){
    const members=this.members();
    for(const {ws,m} of members){try{await this.save(ws,m);if(m.player.session_expires_at&&m.player.session_expires_at<=Date.now())ws.close(4003,'Session expired')}catch{this.send(ws,{type:'notice',message:'Saving delayed; reconnecting if needed.'})}}
    if(this.members().length)await this.ctx.storage.setAlarm(Date.now()+60000);
  }
}
