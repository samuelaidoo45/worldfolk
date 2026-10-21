import {env} from 'cloudflare:workers';
import {startingPlace} from '../../public/game/city-places.js';
import {inAccra} from '../../public/game/map-region.js';
type Place={id:string;name:string;lng:number;lat:number};
let mapped:Promise<Map<string,Place[]>>|undefined;
export async function resolveStartingPlace(id:string,name?:string):Promise<Place|null>{
 const featured=startingPlace(id);if(featured)return featured;
 if(!/^g_-?\d{1,6}_-?\d{1,6}$/.test(id))return null;
 mapped??=(async()=>{const assets=env.MAP_ASSETS;if(!assets)throw Error('Map data unavailable');const sets=await Promise.all(['places','streets'].map(async name=>{const response=await assets.fetch(`https://localhost/maps/accra-v1/${name}.json`);if(!response.ok)throw Error('Place data unavailable');return response.json() as Promise<Array<Omit<Place,'id'>>>}));const rows=sets.flat();const map=new Map<string,Place[]>();for(const p of rows){if(!p.name||!inAccra(p.lng,p.lat))continue;const id=`g_${Math.round(p.lng*10000)}_${Math.round(p.lat*10000)}`;const bucket=map.get(id)||[];bucket.push({...p,id});map.set(id,bucket)}return map;})().catch(error=>{mapped=undefined;throw error});
 const matches=(await mapped).get(id)||[];return (name?matches.find(p=>p.name===name):matches[0])||null;
}
