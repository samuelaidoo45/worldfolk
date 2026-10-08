// All consumers share one read of the currently loaded road tiles per 1.5 seconds.
const snapshots=new WeakMap();
export function roadFeatures(map,now=performance.now()){
 const cached=snapshots.get(map);if(cached&&now-cached.at<1500)return cached.features;
 let features=[];try{features=map.querySourceFeatures('accralife-streets',{sourceLayer:'road'})}catch{}
 snapshots.set(map,{at:now,features});return features;
}
