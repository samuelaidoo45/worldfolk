// Browser orientation changes require a user gesture, and often fullscreen.
export async function requestDisplayOrientation(mode,doc=globalThis.document,orientation=globalThis.screen?.orientation){
 if(!['auto','portrait','landscape'].includes(mode))throw new TypeError('Invalid orientation');
 try{orientation?.unlock?.()}catch{}
 if(mode==='auto')return {locked:false,mode};
 if(typeof orientation?.lock!=='function')return {locked:false,mode};
 if(!doc.fullscreenElement&&doc.fullscreenEnabled&&doc.documentElement.requestFullscreen){
  try{await doc.documentElement.requestFullscreen()}catch{} // Standalone browsers may still allow locking.
 }
 try{await orientation.lock(mode);return {locked:true,mode}}catch{return {locked:false,mode}}
}
export function mobileCameraScale(width,height,touch){
 if(!touch)return 1;
 const aspect=Math.max(.3,width/Math.max(1,height));
 return Math.min(1.55,Math.max(1.12,1.12/Math.sqrt(aspect)));
}
export function mobileFieldOfView(base,width,height,touch){
 if(!touch||width>=height)return base;
 return Math.min(95,2*Math.atan(Math.tan(base*Math.PI/360)*Math.min(1.65,height/Math.max(1,width)))*180/Math.PI);
}
