import {buildingStyle,stableHash} from './districts.js';
import {interiorKind} from './venue-layouts.js';
import {distanceMetres,projectOnSegment} from './motion.js';
export const PAINTS=[
 {wall:'#d1c4a9',trim:'#e9e4d6',accent:'#32695e',roof:'#754536'},
 {wall:'#b9bdae',trim:'#d9ddce',accent:'#38534c',roof:'#626d6a'},
 {wall:'#c49d87',trim:'#e2d2b9',accent:'#774537',roof:'#905343'},
 {wall:'#acbec3',trim:'#dfe2d9',accent:'#3d5d6a',roof:'#778182'},
 {wall:'#d1cec0',trim:'#e8e5d8',accent:'#4f575b',roof:'#484d50'},
 {wall:'#c5b786',trim:'#e1d8b9',accent:'#67543e',roof:'#877467'},
 {wall:'#aaa89d',trim:'#d0cdbb',accent:'#54453c',roof:'#8e553b'},
 {wall:'#ddd5be',trim:'#eeeadf',accent:'#466c72',roof:'#828e8c'},
 {wall:'#b6c4bc',trim:'#d9e1d5',accent:'#456755',roof:'#555c55'},
 {wall:'#bbad97',trim:'#e0d7c5',accent:'#5b4140',roof:'#746c63'},
 {wall:'#cdbaa4',trim:'#e7dbca',accent:'#816d45',roof:'#9a6047'},
 {wall:'#d7d8d0',trim:'#ecece2',accent:'#395263',roof:'#637679'}
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
