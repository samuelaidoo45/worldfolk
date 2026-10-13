// Exterior coordinates use OSM way 16836193. Interior dimensions are a playable
// interpretation of the photographed concourses, not a surveyed floor plan.
export const MALL_ENTRANCE=[-.173122,5.622975];
export const MALL_ARRIVAL=[-.173222,5.623115];
export const isAccraMall=place=>/^accra mall$/i.test(String(place?.name||place||'').trim());
export const MALL_LAYOUT={bounds:{left:-35,right:35,back:-42,front:42},spawn:[0,36],exit:[0,40],description:'Accra Mall · shops around an open food court · upstairs cinema'};
export const MALL_SHOPS=[
 {id:'fashion',name:'WOODIN · 52',x:-27,z:22,color:0x345f54,goods:['clothing']},
 {id:'home',name:'ASHFOAM · 39',x:27,z:0,color:0x9c6545,goods:['furniture']},
 {id:'technology',name:'COMPU-GHANA · 22',x:27,z:-22,color:0x254660,goods:['device']},
 {id:'supermarket',name:'SHOPRITE · G46',x:27,z:22,color:0xad343b,goods:['food','groceries']},
 {id:'sport',name:'DECATHLON · 1B',x:-27,z:-22,color:0x374b69,goods:['clothing']},
 {id:'department',name:'MELCOM · 01A',x:-27,z:0,color:0x896239,goods:['furniture','groceries','device']},
];
export const MALL_CINEMA={bounds:{left:-13,right:13,back:-18,front:19},spawn:[0,16],exit:[0,17.5],description:'Cinema · original Worldfolk short · return downstairs at the rear'};
export const MALL_CAST=[
 {name:'Adwoa · Guest services',x:-6,z:32,dialogue:'Akwaaba! Shops line both concourses. The food court is in the open courtyard. Find the cinema stairs at the far end, and retail work at this desk.'},
 {name:'Kojo · Security',x:6,z:37,dialogue:'Welcome to Accra Mall. Keep the walkways clear. The city exit is behind you; the food court and cinema are straight ahead.'},
 {name:'Esi · Food court',x:6,z:-31.5,dialogue:'The food counter serves jollof, fruit and water using your game cedis. After buying, open your Bag to eat or drink.'},
 {name:'Kofi · Retail assistant',x:27,z:-26,dialogue:'Welcome! Browse the electronics displays, then use the purchase marker. The goods and prices here belong to the game.'},
];
export function mallActivityState(){let resting=null;return {start(kind){if(['sit','watch'].includes(kind))resting=kind},stop(){resting=null},get resting(){return resting}}}
