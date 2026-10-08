import {createRouter,readRoadGraph} from './osm-routing.js';
let routing;
self.onmessage=async({data:{id,from,to,mode,graphUrl}})=>{try{routing??=fetch(graphUrl,{signal:AbortSignal.timeout(20000)}).then(r=>{if(!r.ok)throw Error('Road data could not load.');return r.arrayBuffer()}).then(readRoadGraph).then(createRouter).catch(e=>{routing=null;throw e});const result=(await routing).route(from,to,mode);self.postMessage({id,result})}catch(e){self.postMessage({id,error:e.message})}};
