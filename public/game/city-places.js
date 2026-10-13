import {POPULAR_LANDMARKS} from './popular-landmarks-data.js';
import {CITY_DESTINATIONS} from './city-destinations.js';
import {VENUES} from './districts.js';
export const CITY_PLACES = [
 ...CITY_DESTINATIONS,
 {id:'unknown-soldier',name:'Unknown Soldier Memorial',area:'Independence Square',type:'Landmark',emoji:'🏛️',lng:-.1927328,lat:5.54826075,description:'The bronze sentry, ceremonial bowl and flag-lined memorial facing Independence Arch.',activities:['stroll']},
  {id:'home',name:'Your home',area:'North Ridge',type:'Home',emoji:'🏡',lng:-0.1949,lat:5.5682,description:'Your own corner of Accra. Rest, cook, recharge and grow your space.',activities:['sleep','cook','shower','relax','upgrade']},
  {id:'square',name:'Independence Square',area:'Osu',type:'Landmark',emoji:'🇬🇭',lng:-0.19256,lat:5.54742,description:'Walk the wide civic square and take in the sea breeze.',activities:['stroll']},
  {id:'nkrumah',name:'Nkrumah Memorial Park',area:'Accra Central',type:'Culture',emoji:'🏛️',lng:-0.2024,lat:5.5446,description:'A place for history, gardens and Ghanaian stories.',activities:['museum']},
  {id:'jamestown',name:'Jamestown',area:'Coastal Accra',type:'Culture',emoji:'🗼',lng:-0.21213,lat:5.53309,description:'Explore the lighthouse, street art and coastal community.',activities:['stroll']},
  {id:'makola',name:'Makola Market',area:'Accra Central',type:'Work & food',emoji:'🧺',lng:-0.2069324,lat:5.548074,description:'Trade, bargain, eat and feel the pulse of the market.',activities:['trade','marketfood']},
  {id:'osu',name:'Oxford Street',area:'Osu',type:'Food & nightlife',emoji:'🥘',lng:-0.1819,lat:5.5598,description:'A city hotspot for food, cafés and late nights.',activities:['cafe','meal','nightlife']},
  {id:'labadi',name:'Labadi Beach',area:'La',type:'Outdoors',emoji:'🌊',lng:-0.140846,lat:5.561955,description:'Leave the day behind at the beach.',activities:['beach']},
  {id:'arts',name:'Arts Centre',area:'Accra Central',type:'Culture',emoji:'🎨',lng:-0.2033,lat:5.5464,description:'Find craft, colour and creativity by the coast.',activities:['browse']},
  {id:'theatre',name:'National Theatre',area:'Victoriaborg',type:'Culture',emoji:'🎭',lng:-0.2005931,lat:5.5536671,description:'Take a stroll past one of Accra’s cultural landmarks.',activities:['stroll']},
  {id:'dubois',name:'W. E. B. Du Bois Centre',area:'Cantonments',type:'Learning',emoji:'📚',lng:-0.1698,lat:5.5815,description:'Reflect, learn and discover ideas that travelled the world.',activities:['museum','study']},
  {id:'mall',name:'Accra Mall',area:'Tetteh Quarshie',type:'Shopping',emoji:'🛍️',lng:-.173222,lat:5.623115,description:'A lively place to shop and meet up.',activities:['shopping']},
  {id:'airport',name:'Airport City',area:'Airport Residential',type:'Work',emoji:'🏢',lng:-0.1787,lat:5.6093,description:'Offices, hotels and a chance to make career moves.',activities:['office']},
  {id:'eastlegon',name:'East Legon',area:'East Legon',type:'Neighbourhood',emoji:'🌳',lng:-0.1572,lat:5.6357,description:'Explore cafés, shops and residential streets.',activities:['shopping','stroll']},
  {id:'legon',name:'University of Ghana',area:'Legon',type:'Learning',emoji:'🎓',lng:-0.1874,lat:5.6510,description:'Spend some time learning on the green campus.',activities:['study']},
  {id:'kaneshie',name:'Kaneshie Market',area:'Kaneshie',type:'Food',emoji:'🥭',lng:-0.236208,lat:5.56594,description:'Follow the market energy and grab a bite.',activities:['marketfood']},
];
CITY_PLACES.push(...VENUES);
for(const l of POPULAR_LANDMARKS){if(CITY_PLACES.some(p=>p.name.toLowerCase()===l.name.toLowerCase()))continue;
 CITY_PLACES.push({id:`g_${Math.round(l.position[0]*10000)}_${Math.round(l.position[1]*10000)}`,name:l.name,lng:l.position[0],lat:l.position[1],area:'Accra',type:l.type,category:l.type,emoji:({museum:'🏛️',theatre:'🎭',mall:'🛍️',library:'📚',stadium:'⚽',marketplace:'🧺',hotel:'🏨','place of worship':l.model==='mosque'?'🕌':'⛪',castle:'🏰',government:'🏛️'})[l.type]||'📍',description:'Explore this landmark in Accra.',activities:['stroll','connect']});
}

export const START_PLACES=CITY_PLACES.filter(p=>p.id!=='home');
export const startingPlace=id=>START_PLACES.find(p=>p.id===id)||null;
