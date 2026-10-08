import {START_PLACES} from './city-places.js';
import {inAccra} from './map-region.js';
import {placeEmoji} from './place-icons.js';
export const normalizePlaceText=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export function indexPlaces(mapped){
 const unique=new Map();
 for(const p of [...START_PLACES,...mapped]){
  if(!p.name||!inAccra(p.lng,p.lat))continue;
  const name=normalizePlaceText(p.name),key=`${name}:${Math.round(p.lng*10000)}:${Math.round(p.lat*10000)}`;
  if(unique.has(key))continue;
  unique.set(key,{...p,id:p.id||`g_${Math.round(p.lng*10000)}_${Math.round(p.lat*10000)}`,area:p.area||p.detail||'Accra',emoji:p.emoji||placeEmoji(p),description:p.description||'Explore this place in Accra and meet people nearby.',activities:p.activities||['explore','stroll'],searchText:normalizePlaceText(`${p.name} ${p.type} ${p.area||p.detail||''}`),searchName:name});
 }
 return [...unique.values()];
}
export function searchPlaceIndex(index,query,{offset=0,limit=40}={}){
 const q=normalizePlaceText(query),terms=q.split(' ').filter(Boolean);
 const matches=index.filter(p=>terms.every(t=>p.searchText.includes(t))).sort((a,b)=>Number(b.searchName===q)-Number(a.searchName===q)||Number(b.searchName.startsWith(q))-Number(a.searchName.startsWith(q))||a.name.localeCompare(b.name)||a.lng-b.lng||a.lat-b.lat);
 return {items:matches.slice(offset,offset+limit),total:matches.length};
}
