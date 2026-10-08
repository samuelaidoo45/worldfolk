// Aerial imagery is a separate licensed resource, never silently billed to Mapbox.
export function installSatellite(map){
 const imagery=window.ACCRALIFE_CONFIG?.imagery;if(!imagery?.tiles?.length)return null;
 if(!imagery.attribution)throw Error('Imagery attribution is required.');
 map.addSource('accralife-satellite',{type:'raster',tiles:imagery.tiles,tileSize:256,maxzoom:imagery.maxzoom||19,attribution:imagery.attribution});
 map.addLayer({id:'accralife-aerial',type:'raster',source:'accralife-satellite',layout:{visibility:'none'},paint:{'raster-opacity':.92,'raster-fade-duration':250}},'worldfolk-road-casing');
 let enabled=false;const button=document.createElement('button');button.className='world-tool satellite-launch';button.textContent='L · Satellite off';button.title='Recorded licensed aerial imagery; not a live camera feed.';document.body.append(button);
 function toggle(){enabled=!enabled;map.setLayoutProperty('accralife-aerial','visibility',enabled?'visible':'none');button.textContent=enabled?'L · Satellite on':'L · Satellite off';button.setAttribute('aria-pressed',String(enabled))}button.onclick=toggle;button.setAttribute('aria-pressed','false');return {toggle};
}
