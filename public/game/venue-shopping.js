import {interiorKind} from './venue-layouts.js';
import {distanceMetres} from './motion.js';
export function sellsAtVenue(item,place){const kind=interiorKind(place);return ['restaurant','cafe','nightclub'].includes(kind)?item.kind==='food':['market','mall','shop'].includes(kind)&&['food','groceries','clothing','device','furniture'].includes(item.kind)}
// Match the entered place to our published map index. Never trust a client-supplied shop type.
export function canBuyAtMappedVenue(item,player,places){const m=/^g_(-?\d{1,6})_(-?\d{1,6})$/.exec(player.place_id||'');if(!m||player.driving||!Number.isFinite(player.pos_lng)||!Number.isFinite(player.pos_lat))return false;const at=[Number(m[1])/10000,Number(m[2])/10000];if(distanceMetres(at,[player.pos_lng,player.pos_lat])>120)return false;return places.some(p=>Math.abs(p.lng-at[0])<.00015&&Math.abs(p.lat-at[1])<.00015&&distanceMetres(at,[p.lng,p.lat])<18&&sellsAtVenue(item,p))}
