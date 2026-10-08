import {env} from 'cloudflare:workers';
import {canBuyAtMappedVenue} from '../../public/game/venue-shopping.js';
let venues:Promise<Array<{name:string;type:string;lng:number;lat:number}>>|undefined;
export async function canShopHere(item:unknown,player:unknown){
 venues??=(async()=>{if(!env.MAP_ASSETS)throw Error('Map assets unavailable');const response=await env.MAP_ASSETS.fetch('https://maps.internal/maps/accra-v1/places.json');if(!response.ok)throw Error('Places unavailable');return response.json() as Promise<Array<{name:string;type:string;lng:number;lat:number}>>})().catch(error=>{venues=undefined;throw error});
 return canBuyAtMappedVenue(item,player,await venues);
}
