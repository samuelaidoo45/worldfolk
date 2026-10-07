export function installSatellite(map){
 map.addSource('accralife-satellite',{type:'raster',url:'mapbox://mapbox.satellite',tileSize:256,maxzoom:19});
 map.addLayer({id:'accralife-aerial',type:'raster',source:'accralife-satellite',slot:'middle',paint:{'raster-opacity':.92,'raster-fade-duration':250,'raster-saturation':-.12,'raster-contrast':.12}});
 let enabled=true;const button=document.createElement('button');button.className='world-tool satellite-launch';button.textContent='L · Satellite on';button.title='Recorded aerial imagery streams as you move; imagery is not a live camera feed.';document.body.append(button);
 function toggle(){enabled=!enabled;map.setLayoutProperty('accralife-aerial','visibility',enabled?'visible':'none');button.textContent=enabled?'L · Satellite on':'L · Clear ground';button.setAttribute('aria-pressed',String(enabled))}button.onclick=toggle;button.setAttribute('aria-pressed','true');
 return {toggle};
}
