// Shared, server-validated starter wardrobe. Colours never come from a client payload.
export const CASUAL_OUTFITS=[
 {id:'everyday',name:'Everyday green',description:'Forest T-shirt · indigo jeans · cream sneakers',shirt:0x397563,pants:0x283e59,shoes:0xe4dfd1},
 {id:'coastal',name:'Coastal blue',description:'Blue T-shirt · sand chinos · white sneakers',shirt:0x517fa1,pants:0xafa084,shoes:0xe7e5df},
 {id:'weekend',name:'Weekend rust',description:'Terracotta T-shirt · charcoal jeans · canvas sneakers',shirt:0xb75f45,pants:0x34383e,shoes:0xd3c6af},
 {id:'city',name:'City casual',description:'Cream T-shirt · olive trousers · dark sneakers',shirt:0xe2d8bf,pants:0x596447,shoes:0x343639}
];
export function casualOutfit(id,seed=0){
 const preset=CASUAL_OUTFITS.find(o=>o.id===id)||CASUAL_OUTFITS[seed%CASUAL_OUTFITS.length];
 return id==='shirt'?{...preset,shirt:0xb88c41}:id==='trainers'?{...preset,shoes:0xeee8d9}:preset;
}
