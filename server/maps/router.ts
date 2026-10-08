import {env} from 'cloudflare:workers';
import {createRouter,readRoadGraph} from '../../public/game/osm-routing.js';
let router:Promise<ReturnType<typeof createRouter>>|undefined;
export async function accraRoute(from:number[],to:number[],mode='driving'){
 router??=(async()=>{if(!env.MAP_ASSETS)throw Error('Map assets unavailable');const response=await env.MAP_ASSETS.fetch('https://maps.internal/maps/accra-v1/graph.bin');if(!response.ok)throw Error('Road graph unavailable');return createRouter(readRoadGraph(await response.arrayBuffer()))})().catch(error=>{router=undefined;throw error});
 return (await router).route(from,to,mode);
}
