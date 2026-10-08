import { DurableObject } from 'cloudflare:workers';
import {roomFor,playerHeader,type WorldPlayer} from './world-room';

export const sessionName=(id:string)=>`player-session:${id}`;
const stub=(env:Cloudflare.Env,name:string)=>env.WORLD_ROOMS!.get(env.WORLD_ROOMS!.idFromName(name));

// Per-player routing survives reconnects and movement across geographic districts.
// Only authenticated Worker code can call these internal object endpoints.
export class WorldSession extends DurableObject<Cloudflare.Env> {
  async fetch(request:Request):Promise<Response>{
    return this.ctx.blockConcurrencyWhile(async()=>{
      const input=(['/checkpoint','/end'].includes(new URL(request.url).pathname)?await request.json():{player:JSON.parse(request.headers.get('X-World-Player')!)}) as {player:WorldPlayer;persist?:boolean};
      let player=input.player;
      const previous=await this.ctx.storage.get<string>('room');
      const room=previous||roomFor(player.pos_lng,player.pos_lat);
      if(new URL(request.url).pathname==='/checkpoint'){
        return stub(this.env,room).fetch('https://room/checkpoint',{method:'POST',body:JSON.stringify({id:player.id,token:player.session_token,persist:input.persist})});
      }
      // Checkpoint and evict the old socket before assigning another instance.
      // Legacy geographic rooms are checked on the first connection after upgrade.
      await stub(this.env,room).fetch('https://room/disconnect',{method:'POST',body:JSON.stringify({id:player.id,token:player.session_token})});
      if(new URL(request.url).pathname==='/end'){await this.ctx.storage.delete('room');return Response.json({ok:true})}
      const fresh=await this.env.DB!.prepare('SELECT * FROM players WHERE id=? AND session_token=?').bind(player.id,player.session_token).first<WorldPlayer>();
      if(!fresh)return new Response('Session ended',{status:401});
      player=fresh;
      player.pos_lng??=-.1949;player.pos_lat??=5.5682;
      const district=roomFor(player.pos_lng,player.pos_lat);
      // Prefer the same instance on reconnect so friends remain together.
      if(previous?.startsWith(district+':instance:')){
        const response=await stub(this.env,previous).fetch(new Request('https://room/connect',{headers:{Upgrade:'websocket','X-World-Player':playerHeader(player),'X-World-Room':previous}}));
        if(response.status!==409)return response;
      }
      const response=await this.env.WORLD_ALLOCATORS!.get(this.env.WORLD_ALLOCATORS!.idFromName(district)).fetch('https://allocator/allocate',{headers:{Upgrade:'websocket','X-World-Player':playerHeader(player)}});
      if(response.status===101)await this.ctx.storage.put('room',response.headers.get('X-World-Room')!);
      return response;
    });
  }
}

// Each district has its own allocator. No global admission counter or fixed
// number of instances: a full simulation group opens another instance.
export class DistrictAllocator extends DurableObject<Cloudflare.Env> {
  async fetch(request:Request):Promise<Response>{
    const player=JSON.parse(request.headers.get('X-World-Player')!) as WorldPlayer;
    return this.ctx.blockConcurrencyWhile(async()=>{
      const district=roomFor(player.pos_lng,player.pos_lat);
      let index=await this.ctx.storage.get<number>('instance')||0;
      // At most two probes: only this allocator advances the current instance.
      // Reconnects target existing members' original instances separately.
      for(let attempt=0;attempt<2;attempt++){
        const name=`${district}:instance:${index}`;
        const response=await stub(this.env,name).fetch(new Request('https://room/connect',{headers:{Upgrade:'websocket','X-World-Player':playerHeader(player),'X-World-Room':name}}));
        if(response.status!==409)return response;
        index++;
        await this.ctx.storage.put('instance',index);
      }
      return new Response('Allocating another instance. Please reconnect.',{status:503});
    });
  }
}
