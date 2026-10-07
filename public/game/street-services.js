// Fictional game agents at Accra neighbourhood hubs, not real businesses.
export const STREET_SERVICES=[
 {id:'momo-osu',name:'Osu MoMo agent',lng:-.1819,lat:5.5598,kind:'momo'},
 {id:'momo-makola',name:'Makola MoMo agent',lng:-.2141,lat:5.5485,kind:'momo'},
 {id:'momo-kaneshie',name:'Kaneshie MoMo agent',lng:-.2346,lat:5.5724,kind:'momo'},
 {id:'momo-airport',name:'Airport City MoMo agent',lng:-.1787,lat:5.6093,kind:'momo'}
];
export function exchangeMoMo(cash,balance,amount,operation){if(!Number.isSafeInteger(amount)||amount<1||amount>100000||!['deposit','withdraw'].includes(operation))return null;if(operation==='deposit'&&cash>=amount)return {cash:cash-amount,balance:balance+amount};if(operation==='withdraw'&&balance>=amount)return {cash:cash+amount,balance:balance-amount};return null}
