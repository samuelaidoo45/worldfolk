// Everyone shares a 48-minute day and the same changing fictional weather.
export function worldAtmosphere(now=Date.now()){
 const minute=Math.floor(now/2000)%1440,weather=['clear','clear','overcast','clear','rain','clear'][Math.floor(now/240000)%6];
 const preset=minute<300||minute>=1200?'night':minute<420?'dawn':minute>=1050?'dusk':'day';
 return {minute,weather,preset,label:`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')} · ${weather==='rain'?'Rain showers':weather==='overcast'?'Cloudy':preset==='night'?'Starry night':preset==='dusk'?'Golden hour':preset==='dawn'?'Sunrise':'Clear skies'}`};
}
export function createAtmosphere(map,world){
 let previous='';
 return {update(override){const sky=override||worldAtmosphere(),key=sky.weather+sky.preset;if(key===previous)return sky;previous=key;
 const night=sky.preset==='night',warm=['dawn','dusk'].includes(sky.preset),cloud=sky.weather!=='clear';
 map.setConfigProperty?.('basemap','lightPreset',sky.preset);world.setTimeOfDay(sky.preset);
 map.setFog?.({range:cloud?[3,18]:[8,20],color:night?'#222d48':warm?'#edc798':cloud?'#a8b8c4':'#c3deee','high-color':night?'#091226':warm?'#698db6':cloud?'#6c8197':'#4e9cdb','space-color':night?'#020711':'#b8dcf3','horizon-blend':.08,'star-intensity':night&&!cloud?.7:0});
 map.setRain?.({density:sky.weather==='rain'?.22:0,intensity:.55,color:'#c1d7e6',opacity:.45,vignette:0,direction:[0,80],'droplet-size':[1.2,12],'distortion-strength':0,'center-thinning':.2});
 document.body.dataset.weather=sky.weather;document.body.dataset.daylight=sky.preset;return sky;}};
}
