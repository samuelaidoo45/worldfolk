import {PLACE_LOGOS} from './place-logo-catalog.js';
const logosByName=new Map(PLACE_LOGOS.flatMap(brand=>brand.names.map(name=>[name,brand])));
export const logoForPlace=place=>logosByName.get(String(place?.name||'').trim().toLocaleLowerCase())||null;
export function setPlaceIcon(element,place){
 element.replaceChildren();const logo=logoForPlace(place),fallback=place.emoji||'📍';
 if(!logo){element.textContent=fallback;element.title='Place category';return}
 const image=document.createElement('img');image.className='place-logo';image.src=logo.path;image.alt=place.name+' logo';image.decoding='async';image.onerror=()=>{if(image.parentNode===element){element.textContent=fallback;element.title='Place category'}};element.title=place.name;element.append(image);
}
export function placeLogoExpression(fallback){
 const names=['match',['downcase',['coalesce',['get','name'],'']],...PLACE_LOGOS.filter(b=>b.names.length).flatMap(b=>[b.names,`brand-${b.id}`]),''];
 return ['coalesce',['image',names],['image',fallback]];
}
export function installPlaceLogos(map){
 const pending=new Set();
 function load(brand){const id=`brand-${brand.id}`;if(map.hasImage(id)||pending.has(id))return;pending.add(id);const image=new Image();image.onload=()=>{pending.delete(id);try{if(map.hasImage(id))return;const canvas=document.createElement('canvas');canvas.width=canvas.height=96;const c=canvas.getContext('2d');c.beginPath();c.arc(48,48,44,0,Math.PI*2);c.fillStyle='#ffffff';c.fill();c.lineWidth=3;c.strokeStyle='#d9e5dc';c.stroke();const ratio=Math.min(72/image.naturalWidth,72/image.naturalHeight),w=image.naturalWidth*ratio,h=image.naturalHeight*ratio;c.drawImage(image,(96-w)/2,(96-h)/2,w,h);map.addImage(id,c.getImageData(0,0,96,96),{pixelRatio:2})}catch{ /* Category icon remains visible if a logo cannot be decoded. */ }};image.onerror=()=>pending.delete(id);image.src=brand.path;}
 map.on('style.load',()=>PLACE_LOGOS.forEach(load));map.on('styleimagemissing',event=>{const brand=PLACE_LOGOS.find(b=>`brand-${b.id}`===event.id);if(brand)load(brand)});
}
