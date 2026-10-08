export const VEHICLE_MODELS={car:{name:'City sedan',price:1500},hatchback:{name:'Compact hatchback',price:1200},suv:{name:'Family SUV',price:2800},pickup:{name:'Utility pickup',price:2400},van:{name:'Delivery van',price:2200},taxi:{name:'City taxi',price:1900},motorcycle:{name:'City motorcycle',price:550},bus:{name:'Tro-tro',price:0}};
export const TRAFFIC_MODELS=['car','hatchback','suv','taxi','pickup','van'];
export const vehicleName=id=>VEHICLE_MODELS[id]?.name||'City vehicle';
