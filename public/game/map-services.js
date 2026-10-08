import {indexPlaces,searchPlaceIndex} from './place-search.js';
let worker,serial=0;const pending=new Map();let places;
export function routeOnRoads(from,to,mode,signal){
 if(!worker){worker=new Worker(new URL('./map-worker.js',import.meta.url),{type:'module'});worker.onmessage=({data})=>{const p=pending.get(data.id);if(!p)return;pending.delete(data.id);p.cleanup();data.error?p.reject(Error(data.error)):p.resolve({code:'Ok',routes:[data.result]})};worker.onerror=()=>{for(const p of pending.values()){p.cleanup();p.reject(Error('Road routing could not start. Please retry.'))}pending.clear();worker.terminate();worker=null}}
 return new Promise((resolve,reject)=>{const id=++serial,abort=()=>{pending.delete(id);reject(new DOMException('Aborted','AbortError'))};if(signal?.aborted)return abort();signal?.addEventListener('abort',abort,{once:true});pending.set(id,{resolve,reject,cleanup:()=>signal?.removeEventListener('abort',abort)});worker.postMessage({id,from,to,mode,graphUrl:new URL(window.ACCRALIFE_CONFIG.mapData+'/graph.bin',location.href).href})});
}
async function placeIndex(){places??=Promise.all(['places','streets'].map(name=>fetch(window.ACCRALIFE_CONFIG.mapData+'/'+name+'.json').then(r=>{if(!r.ok)throw Error('Places could not load. Please try again.');return r.json()}))).then(rows=>indexPlaces(rows.flat())).catch(e=>{places=null;throw e});return places}
export async function searchCityCatalogue(query,options){return searchPlaceIndex(await placeIndex(),query,options)}
export async function searchMapPlaces(query){return (await searchCityCatalogue(query,{limit:40})).items}
