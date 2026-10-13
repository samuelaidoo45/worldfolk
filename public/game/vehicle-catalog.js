// Metres, excluding mirrors. Shared by the renderer, contact solver and traffic.
export const VEHICLE_MODELS={
 car:{name:'City sedan',price:1500,width:1.78,length:4.35,height:1.5,mass:1300},
 hatchback:{name:'Compact hatchback',price:1200,width:1.68,length:3.6,height:1.5,mass:1050},
 suv:{name:'Family SUV',price:2800,width:1.92,length:4.65,height:1.83,mass:1900},
 pickup:{name:'Double-cab pickup',price:2400,width:1.92,length:5.05,height:1.8,mass:2100},
 van:{name:'Delivery van',price:2200,width:1.85,length:4.8,height:2.04,mass:2200},
 taxi:{name:'Accra taxi',price:1900,width:1.78,length:4.35,height:1.64,mass:1300},
 minibus:{name:'Commuter tro-tro',price:3200,width:2,length:5.25,height:2.22,mass:2800},
 bus:{name:'City midi-bus',price:0,width:2.32,length:6.96,height:3.06,mass:6500},
 truck:{name:'Delivery truck',price:4200,width:2.28,length:6.2,height:3.12,mass:5200},
 motorcycle:{name:'Commuter motorcycle',price:550,width:.76,length:2.12,height:1.35,mass:220},
 bicycle:{name:'City bicycle',price:120,width:.64,length:1.85,height:1.1,mass:100},
 tricycle:{name:'Aboboyaa cargo tricycle',price:950,width:1.42,length:3.05,height:1.5,mass:580}
};
export const TRAFFIC_MODELS=['car','hatchback','suv','taxi','pickup','van','minibus','truck','motorcycle','bicycle','tricycle'];
export const vehicleSpec=id=>VEHICLE_MODELS[id]||VEHICLE_MODELS.car;
export const vehicleFootprint=id=>{const v=vehicleSpec(id);return [v.width/2,v.length/2]};
export function trafficModelsForRoad(width,highway=false){return TRAFFIC_MODELS.filter(id=>!(highway&&['bicycle','tricycle'].includes(id))&&!(width<8&&['truck','minibus'].includes(id)))}
export const vehicleName=id=>VEHICLE_MODELS[id]?.name||'City vehicle';
