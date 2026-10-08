import {roadFeatures} from './road-cache.js';
import {distanceMetres,offsetMetres,bearingTo,projectOnSegment} from './motion.js';
// Procedural game road wear, anchored to road geometry (not a real pothole survey).
export function roadPotholes(features,position){
 const holes=new Map();for(const f of features){if(!['street','street_limited','service','tertiary','secondary','primary'].includes(f.properties?.class)||f.properties?.surface==='unpaved'||['tunnel','bridge'].includes(f.properties?.structure))continue;
 const lines=f.geometry?.type==='LineString'?[f.geometry.coordinates]:f.geometry?.type==='MultiLineString'?f.geometry.coordinates:[];
 for(const line of lines)for(let i=1;i<line.length;i++){let a=line[i-1],b=line[i];if(a.join(',')>b.join(','))[a,b]=[b,a];const length=distanceMetres(a,b);if(length<22)continue;const id=[a,b].map(p=>p.map(v=>v.toFixed(6)).join(',')).join(':');let seed=0;for(const c of id)seed=(seed*31+c.charCodeAt(0))>>>0;if(seed%3)continue;
 const t=.3+(seed%37)/100,mid=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],r=bearingTo(a,b)*Math.PI/180,side=seed%2?1.25:-1.25,point=offsetMetres(mid,Math.cos(r)*side,-Math.sin(r)*side);if(distanceMetres(position,point)>180)continue;
 holes.set(id,{id,position:point,radius:.65+(seed%40)/100,seed});}}
 return [...holes.values()].sort((a,b)=>distanceMetres(position,a.position)-distanceMetres(position,b.position)).slice(0,32);
}
export function potholeImpact(holes,from,to,speed){if(Math.abs(speed)<1||distanceMetres(from,to)<.001)return null;return holes.find(h=>projectOnSegment(h.position,from,to).distance<h.radius+.65)||null}
export function createRoadSurface(map){
 let holes=[],last=0,impactAt=-10000,strength=0,lastHole=null;
 const source='worldfolk-potholes';map.addSource(source,{type:'geojson',data:{type:'FeatureCollection',features:[]}});
 map.addLayer({id:source+'-rim',type:'fill',source,slot:'top',minzoom:18,paint:{'fill-color':'#72716b','fill-opacity':1}});
 map.addLayer({id:source+'-edge',type:'line',source,slot:'top',minzoom:18,paint:{'line-color':'#131618','line-width':2}});
 map.addLayer({id:source+'-pit',type:'fill',source,slot:'top',minzoom:18,filter:['==',['get','inner'],true],paint:{'fill-color':'#101517','fill-opacity':1}});
 return {update(position){if(performance.now()-last<1000)return;last=performance.now();let roads;try{roads=roadFeatures(map)}catch{return}holes=roadPotholes(roads,position);const features=[];for(const h of holes)for(const inner of [false,true]){const ring=[];for(let i=0;i<12;i++){const a=i*Math.PI/6,r=h.radius*(inner?.73:1)*(1+Math.sin(i*7+h.seed)*.15);ring.push(offsetMetres(h.position,Math.cos(a)*r,Math.sin(a)*r*.72))}ring.push(ring[0]);features.push({type:'Feature',properties:{inner},geometry:{type:'Polygon',coordinates:[ring]}})}map.getSource(source).setData({type:'FeatureCollection',features})},
 hit(from,to,speed){const h=potholeImpact(holes,from,to,speed);if(!h){lastHole=null;return}if(h.id===lastHole)return;lastHole=h.id;impactAt=performance.now();strength=Math.min(.19,.035+Math.abs(speed)*.004)},
 sample(){const age=(performance.now()-impactAt)/1000;if(age>1)return {bounce:0,roll:0,pitch:0};const decay=Math.exp(-age*5),bounce=Math.sin(age*32)*strength*decay;return {bounce,roll:Math.sin(age*25)*strength*.35*decay,pitch:bounce*5}},get holes(){return holes}};
}
