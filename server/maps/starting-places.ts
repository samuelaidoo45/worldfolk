import {env} from 'cloudflare:workers';
import {startingPlace} from '../../public/game/city-places.js';
type Place={id:string;name:string;lng:number;lat:number};
let mapped:Promise<Map<string,Place>>|undefined;
export async function resolveStartingPlace(id:string):Promise<Place|null>{
 const featured=startingPlace(id);if(featured)return featured;
 if(!/^g_-?\d{1,6}_-?\d{1,6}$/.test(id))return null;
 mapped??=(async()=>{if(!env.MAP_ASSETS)throw Error('Map data unavailable');const response=await env.MAP_ASSETS.fetch('https://maps.internal/maps/accra-v1/places.json');if(!response.ok)throw Error('Place data unavailable');const rows=await response.json() as Array<Omit<Place,'id'>>;return new Map(rows.filter(p=>p.name&&p.lng>=-.36&&p.lng<=.07&&p.lat>=5.43&&p.lat<=5.78).map(p=>{const id=`g_${Math.round(p.lng*10000)}_${Math.round(p.lat*10000)}`;return [id,{...p,id}]}))})().catch(error=>{mapped=undefined;throw error});
 return (await mapped).get(id)||null;
}
