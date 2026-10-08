// One small, cached map sprite per category, shared by all POIs in the tile data.
const categories=[
 ['mosque','🕌',['mosque'],'#e3f1df'],['church','⛪',['church','chapel'],'#eee6f5'],
 ['worship','🛐',['place_of_worship','temple'],'#eee6f5'],
 ['food','🍽️',['restaurant','fast_food','food_court'],'#fff0d6'],
 ['cafe','☕',['cafe','bakery'],'#f7e7d8'],['nightlife','🍸',['bar','pub','nightclub','biergarten'],'#f4e2f5'],
 ['market','🧺',['marketplace','market','greengrocer'],'#f7edcf'],
 ['mall','🛍️',['mall','department_store','supermarket','retail','shop','convenience','clothes'],'#f5e4ef'],
 ['bank','🏦',['bank','atm','bureau_de_change','mobile_money'],'#e2eee9'],
 ['school','🎓',['school','university','college','kindergarten','education'],'#e2eafa'],
 ['hospital','🏥',['hospital','clinic','doctors','dentist'],'#fae5e5'],['pharmacy','💊',['pharmacy'],'#e1f2e8'],
 ['stadium','🏟️',['stadium','sports_centre','pitch','fitness_centre'],'#e3efdf'],
 ['beach','🏖️',['beach'],'#e1f3f6'],['park','🌳',['park','garden','nature_reserve','playground'],'#e4f0dc'],
 ['museum','🏛️',['museum','gallery','monument','memorial','townhall','courthouse'],'#f2ead9'],
 ['hotel','🏨',['hotel','motel','guest_house','hostel'],'#ece4f6'],
 ['office','🏢',['office','commercial'],'#e5ebef'],['home','🏠',['house','residential','apartments'],'#f5eddd'],
 ['airport','✈️',['aerodrome','airport','terminal'],'#dfeef7'],
 ['transport','🚌',['bus_station','bus_stop','station','taxi','ferry_terminal'],'#e0edf6'],
 ['fuel','⛽',['fuel'],'#f9e5db'],['parking','🅿️',['parking'],'#e1eaf5'],
 ['police','👮',['police'],'#e1eaf5'],['cinema','🎬',['cinema','theatre'],'#ede4f5'],
 ['library','📚',['library','books'],'#f3e8d8'],['place','📍',[],'#edf2eb']
];
const byType=new Map(categories.flatMap(([id,,types])=>types.map(type=>[type,id])));
export function placeCategory(props={}){
 const type=String(props.class||props.type||props.amenity||'').toLowerCase().replaceAll(' ','_'),name=String(props.name||'').toLowerCase();
 if(type==='place_of_worship'){if(/mosque|masjid|islam/.test(name))return 'mosque';if(/church|chapel|cathedral|presbyter/.test(name))return 'church'}
 return byType.get(type)||'place';
}
export const placeEmoji=props=>categories.find(([id])=>id===placeCategory(props))[1];
export function placeIconExpression(){
 const name=['downcase',['coalesce',['get','name'],'']],type=['downcase',['coalesce',['get','class'],['get','type'],'']];
 const match=['match',type,...categories.filter(c=>c[2].length).flatMap(([id,,types])=>[[...new Set(types.flatMap(t=>[t,t.replaceAll('_',' ')]))],`place-${id}`]),'place-place'];
 return ['case',['all',['in',type,['literal',['place_of_worship','place of worship']]],['any',...['mosque','masjid','islam'].map(n=>['in',n,name])]],'place-mosque',['all',['in',type,['literal',['place_of_worship','place of worship']]],['any',...['church','chapel','cathedral','presbyter'].map(n=>['in',n,name])]],'place-church',match];
}
export function installPlaceIcons(map){
 function add(id){const category=categories.find(c=>`place-${c[0]}`===id);if(!category||map.hasImage(id))return;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=72;const ctx=canvas.getContext('2d');
  ctx.beginPath();ctx.arc(36,36,32,0,Math.PI*2);ctx.fillStyle=category[3];ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#ffffff';ctx.stroke();
  ctx.font='40px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#21463b';ctx.fillText(category[1],36,38);
  map.addImage(id,ctx.getImageData(0,0,72,72),{pixelRatio:2});
 }
 map.on('styleimagemissing',event=>add(event.id));map.on('style.load',()=>categories.forEach(([id])=>add(`place-${id}`)));
}
