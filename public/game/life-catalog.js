import {HOME_LOCATIONS} from './home-locations.js';
// Shared game catalogue: virtual prices and facilities, not real-world offers.
export const HOMES=[
 {id:'starter',name:'Ridge starter apartment',area:'North Ridge',lng:-.1949,lat:5.5682,price:0},
 {id:'osu-flat',name:'Osu courtyard apartment',area:'Osu',lng:-.1778,lat:5.5632,price:1800},
 {id:'legon-house',name:'East Legon family house',area:'East Legon',lng:-.1535,lat:5.6372,price:6500},
 {id:'coastal-villa',name:'La coastal villa',area:'La',lng:-.1345,lat:5.5637,price:14000}
];
HOMES.forEach((home,index)=>Object.assign(home,HOME_LOCATIONS[index]));
export const GOODS=[
 {id:'waakye',name:'Waakye takeaway',icon:'🍲',price:12,shops:['makola','kaneshie','osu'],kind:'food',hunger:35},
 {id:'jollof',name:'Jollof and chicken',icon:'🥘',price:22,shops:['osu','mall'],kind:'food',hunger:55},
 {id:'fruit',name:'Fresh fruit',icon:'🥭',price:8,shops:['makola','kaneshie','mall'],kind:'food',hunger:20},
 {id:'water',name:'Bottled water',icon:'💧',price:4,shops:['makola','kaneshie','mall','osu','airport'],kind:'food',energy:8,hunger:6},
 {id:'groceries',name:'Cooking ingredients',icon:'🧺',price:18,shops:['makola','kaneshie','mall'],kind:'groceries'},
 {id:'shirt',name:'Kente shirt',icon:'👕',price:65,shops:['makola','mall'],kind:'clothing',fun:12},
 {id:'trainers',name:'Trainers',icon:'👟',price:95,shops:['mall','kaneshie'],kind:'clothing',fun:10},
 {id:'phone',name:'Smartphone',icon:'📱',price:260,shops:['mall','osu'],kind:'device',social:15},
 {id:'sofa',name:'Living room sofa',icon:'🛋️',price:220,shops:['mall','kaneshie'],kind:'furniture',fun:18},
 {id:'television',name:'Television',icon:'📺',price:380,shops:['mall'],kind:'furniture',fun:25},
 {id:'bed',name:'Comfortable bed',icon:'🛏️',price:300,shops:['mall','kaneshie'],kind:'furniture',energy:20},
 {id:'motorcycle',name:'City motorcycle',icon:'🏍️',price:550,shops:['mall','airport'],kind:'vehicle'},
 {id:'car',name:'City compact car',icon:'🚗',price:1500,shops:['mall','airport'],kind:'vehicle'}
];
export const JOBS=[
{"id": "restaurant-crew", "name": "Restaurant crew", "place": "g_-1679_55876", "wage": 95, "seconds": 55, "energy": 12, "task": "Serve visitors and complete your shift at Home Touch"},{"id": "school-assistant", "name": "School assistant", "place": "g_-1596_55885", "wage": 135, "seconds": 70, "energy": 12, "task": "Serve visitors and complete your shift at Garrison Basic School"},{"id": "mall-stock", "name": "Mall stock assistant", "place": "g_-1762_56031", "wage": 110, "seconds": 60, "energy": 12, "task": "Serve visitors and complete your shift at Marina Mall"},{"id": "bank-clerk", "name": "Bank service assistant", "place": "g_-1812_55643", "wage": 155, "seconds": 80, "energy": 12, "task": "Serve visitors and complete your shift at Absa"},{"id": "stadium-steward", "name": "Stadium steward", "place": "g_-1735_56163", "wage": 100, "seconds": 55, "energy": 12, "task": "Serve visitors and complete your shift at Polo Club"},{"id": "market-vendor", "name": "Market vendor", "place": "g_-2564_56081", "wage": 85, "seconds": 50, "energy": 12, "task": "Serve visitors and complete your shift at Chantan New Market"},
 {id:'trader',name:'Market assistant',place:'makola',wage:75,seconds:45,energy:10,task:'Sort produce and serve customers'},
 {id:'cafe',name:'Café crew',place:'osu',wage:90,seconds:55,energy:12,task:'Prepare orders and serve the counter'},
 {id:'retail',name:'Retail assistant',place:'mall',wage:105,seconds:60,energy:12,task:'Restock shelves and assist shoppers'},
 {id:'driver',name:'Taxi driver',place:'airport',wage:115,seconds:65,energy:11,task:'Drive a passenger from Airport City to Oxford Street, then park to collect pay (car required)'},
 {id:'teacher',name:'Teaching assistant',place:'legon',wage:145,seconds:75,energy:13,task:'Prepare a lesson and help students learn'},
 {id:'coder',name:'Software developer',place:'airport',wage:185,seconds:90,energy:16,task:'Build and test a client website'},
 {id:'office',name:'Office assistant',place:'airport',wage:130,seconds:75,energy:15,task:'Complete the office service desk shift'}
];
export const TERMINALS=[
 {id:'airport',name:'Airport City game terminal',lng:-.178656,lat:5.60951},
 {id:'labadi',name:'La game air terminal',lng:-.140846,lat:5.561955},
 {id:'legon',name:'Legon game air terminal',lng:-.187211,lat:5.651}
];
export const propertyId=(owner,home)=>`p_${owner}_${home}`;

// Persisted once at registration; existing lives are never rerolled.
export const STARTING_LIVES=[
 {id:'humble',name:'Fresh start',money:80,home:'starter',inventory:{water:2,waakye:1},vehicles:[],furnished:[]},
 {id:'comfortable',name:'Comfortable start',money:1200,home:'osu-flat',inventory:{water:4,groceries:3,phone:1},vehicles:['motorcycle'],furnished:['sofa']},
 {id:'wealthy',name:'Wealthy start',money:18000,home:'coastal-villa',inventory:{water:8,groceries:8,phone:1,shirt:1},vehicles:['car','motorcycle'],furnished:['sofa','television','bed']}
];
export function startingLife(roll,spawnRoll){const start=STARTING_LIVES[roll<.5?0:roll<.85?1:2],spawn=HOMES[Math.min(HOMES.length-1,Math.floor(spawnRoll*HOMES.length))];return {money:start.money,lng:spawn.lng,lat:spawn.lat,life:{background:start.name,home:spawn.id,properties:[spawn.id],inventory:{...start.inventory},vehicles:[...start.vehicles],vehicle:start.vehicles[0]||'car',furnished:[...start.furnished]}}}
export function rideFare(metres,kind){return Math.max(0,Math.ceil(kind==='taxi'?15+metres/1000*5:5+metres/1000*1.5))}
