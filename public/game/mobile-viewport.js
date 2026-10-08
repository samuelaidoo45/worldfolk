// Keep the control layout stable when a phone keyboard reduces the visual viewport.
export function mobileViewport({width,height,visibleHeight=height,offsetTop=0,editing=false,previousOrientation,previousWidth=width,previousHeight=height}){
 const keyboard=editing&&(height-visibleHeight>100||(width===previousWidth&&previousHeight-visibleHeight>100));
 const orientation=keyboard&&previousOrientation?previousOrientation:width>height?'landscape':'portrait';
 return {orientation,keyboard,height:Math.max(1,visibleHeight),top:Math.max(0,offsetTop)};
}
