import {CITY_LANDMARKS,createCityLandmark} from './city-landmarks.js';
import {WORKER_STATIC_LANDMARKS} from './static-landmark-catalog.js';
import {packStaticModel} from './static-model-transfer.js';
import {disposeScene} from './render-utils.js';

// Authored sign/roof factories require only a 2D canvas. No DOM or WebGL context
// is created here; all GPU work remains in the owning MapLibre render callback.
globalThis.document={createElement(name){if(name!=='canvas')throw Error('Unsupported worker element');return new OffscreenCanvas(1,1);}};
self.onmessage=event=>{
  const {request,id}=event.data;let model;
  try{
    if(!WORKER_STATIC_LANDMARKS.has(id))throw Error('Landmark is not a static worker package');
    const site=CITY_LANDMARKS.find(site=>site.id===id);if(!site)throw Error('Unknown landmark');
    const start=performance.now();model=createCityLandmark(site);const built=performance.now();
    const {snapshot,transfer}=packStaticModel(model.group);
    self.postMessage({request,snapshot,timings:{buildMs:built-start,packMs:performance.now()-built}},transfer);
  }catch(error){self.postMessage({request,error:error.message});}
  finally{if(model)disposeScene(model.group);}
};
