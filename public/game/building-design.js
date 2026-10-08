import {buildingStyle,stableHash} from './districts.js';
import {interiorKind} from './venue-layouts.js';
import {distanceMetres,projectOnSegment} from './motion.js';
export const PAINTS=[
 {wall:'#e6c28d',trim:'#faf0d7',accent:'#387c78',roof:'#76544a'},
 {wall:'#b8cdbb',trim:'#f4eedc',accent:'#25584e',roof:'#596d66'},
 {wall:'#d9957b',trim:'#ffe7cb',accent:'#873f35',roof:'#744b3d'},
 {wall:'#c0d6e2',trim:'#f4f3e9',accent:'#315976',roof:'#5e6d79'},
 {wall:'#d4bdd3',trim:'#f9eadb',accent:'#67476b',roof:'#71636e'},
 {wall:'#e4dba9',trim:'#fff6dd',accent:'#8a7041',roof:'#82694f'}
];
export function insideBuilding(point,rings){const inside=ring=>{let yes=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a[1]>point[1])!==(b[1]>point[1])&&point[0]<(b[0]-a[0])*(point[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes}return yes};return !!rings?.length&&inside(rings[0])&&!rings.slice(1).some(inside)}
export function buildingDistance(point,building){if(insideBuilding(point,building.rings))return 0;let d=Infinity;for(const ring of building.rings)for(let i=1;i<ring.length;i++)d=Math.min(d,projectOnSegment(point,ring[i-1],ring[i]).distance);return d}
// One deterministic design record supplies both exterior and interior materials.
export function buildingDesign(feature,places=[]){const base=buildingStyle(feature),rings=feature.geometry.coordinates,seed=stableHash(base.center.map(v=>v.toFixed(6)).join(','));const major=p=>['mall','stadium','church','mosque','terminal','theatre','bank','campus','gallery','civic','restaurant','nightclub'].includes(interiorKind(p));const place=places.filter(p=>Number.isFinite(p.lng)&&(p.buildingId===feature.id||insideBuilding([p.lng,p.lat],rings)||major(p)&&buildingDistance([p.lng,p.lat],{rings})<18)).sort((a,b)=>Number(major(b))-Number(major(a))||distanceMetres([a.lng,a.lat],base.center)-distanceMetres([b.lng,b.lat],base.center)).find(p=>interiorKind(p)!=='generic');
 const residence=places.find(p=>p.buildingId&&p.buildingId===feature.id);
 const mappedKind=residence?'home':interiorKind(place||{name:feature.properties?.name,type:feature.properties?.type||feature.properties?.building||feature.properties?.class});const fallback={glass:'office',office:'office',shop:'shop',market:'market',school:'classroom',church:'church',mosque:'mosque',apartment:'home',veranda:'home',coastal:'home',plaster:'home',pastel:'home',brick:'home',heritage:'home'};
 const kind=mappedKind==='generic'?(fallback[base.style]||'generic'):mappedKind;
 const exterior={bank:'bank',campus:'school',gallery:'heritage',civic:'heritage',restaurant:'restaurant',nightclub:'nightclub',mall:'shop'};
 const style=exterior[kind]||(['church','mosque','market','office','shop'].includes(kind)?kind:base.style);
 return {...base,style,seed,kind,palette:mappedPalette(feature.properties,PAINTS[seed%PAINTS.length]),ceiling:['church','mosque'].includes(kind)?5.2:['office','shop','clinic'].includes(kind)?3.8:3.3,placeName:residence?.name||place?.name||feature.properties?.name||''};
}
export function interiorDesign(place,buildings=[]){const point=[place.lng,place.lat],match=buildings.map(b=>({b,d:buildingDistance(point,b)})).filter(v=>v.d<40).sort((a,b)=>a.d-b.d)[0]?.b;const kind=interiorKind(place);const seed=stableHash(`${place.lng?.toFixed(6)},${place.lat?.toFixed(6)}`);const design=match?.design||{seed,kind,palette:PAINTS[seed%PAINTS.length],ceiling:3.6,style:'plaster'};return {...design,kind:kind==='generic'?design.kind:kind};}

function mappedPalette(properties={},fallback){const color=value=>typeof value==='string'&&/^(#[0-9a-f]{3,8}|[a-z]{3,20})$/i.test(value)?value:null;return {...fallback,wall:color(properties['building:colour'])||fallback.wall,roof:color(properties['roof:colour'])||fallback.roof};}
