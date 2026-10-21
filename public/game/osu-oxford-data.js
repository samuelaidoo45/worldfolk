import {offsetMetres,distanceMetres,bearingTo} from './motion.js';
import {OSU_RINGS,OSU_MALL_WING} from './osu-oxford-map.js';

// Heights and facade dimensions are photo estimates, not surveyed measurements.
export const OSU_SITES=[
 {id:'g_-1821_55612',name:"Frankie's",aliases:["Frankie's Hotel","Frankies Foods and Rooms","Frankies Osu"],family:'frankies',position:[-.18220,5.56119],width:37,depth:34,height:15.2,sourceIds:[1179058850,1179058852],front:[OSU_RINGS[1179058852][1],OSU_RINGS[1179058852][2]],arrival:[-.182001,5.561155],target:[-.18212,5.56119],type:'restaurant',emoji:'🍽️',description:'Frankie’s on Oxford Street: silver hotel panels, blue corner strips and the sheltered restaurant frontage.'},
 {id:'osu-oxford-mall',name:'Oxford Street Mall',aliases:['Osu Mall','Oxford Mall'],family:'mall',position:[-.182286,5.560496],width:59,depth:59,height:22.4,sourceIds:[],front:[OSU_MALL_WING[0],OSU_MALL_WING[1]],arrival:[-.182123,5.56049],target:[-.18229,5.56050],type:'mall',emoji:'🛍️',description:'Explore Oxford Street Mall’s silver frontage, glazed entrance tower and shop windows.'},
 {id:'osu-papaye',name:'Papaye Osu',aliases:['Papaye','Papaye Fast Food Osu'],family:'papaye',position:[-.181989,5.559616],width:29,depth:33,height:12.3,sourceIds:[1179058864],front:[OSU_RINGS[1179058864][3],OSU_RINGS[1179058864][0]],arrival:[-.182107,5.559615],target:[-.18199,5.559616],type:'restaurant',emoji:'🍗',description:'Papaye’s Osu branch: three glazed levels, red window frames, pale fascia bands and a recessed entrance.'},
];
export const osuLocal=(s,p)=>[(p[0]-s.position[0])*111320*Math.cos(s.position[1]*Math.PI/180),(s.position[1]-p[1])*111320];
export const osuPoint=(s,x,z)=>offsetMetres(s.position,x,-z);
export function osuFrame(s){const [a,b]=s.front.map(p=>osuLocal(s,p)),width=Math.hypot(b[0]-a[0],b[1]-a[1]),nx=(b[1]-a[1])/width,nz=-(b[0]-a[0])/width;return {x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,width,angle:Math.atan2(nx,nz)};}
export function osuFrontPoint(s,x,z){const f=osuFrame(s),c=Math.cos(f.angle),n=Math.sin(f.angle);return osuPoint(s,f.x+c*x+n*z,f.z-n*x+c*z);}
export function osuFrontRing(s,x,z,w,d){return [[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(([a,b])=>osuFrontPoint(s,x+a,z+b));}
const normal=v=>String(v||'').toLowerCase().replace(/[’']/g,'').replace(/\s+/g,' ').trim();
export function osuForPlace(p){
 if(p?.id==='osu')return OSU_SITES[1];
 return OSU_SITES.find(s=>s.id===p?.id||[s.name,...s.aliases].some(n=>normal(n)===normal(p?.name))&&
  (Number.isFinite(p?.lng)&&Number.isFinite(p?.lat)?distanceMetres([p.lng,p.lat],s.position)<200:normal(p?.name)!=='papaye'));
}
export const OSU_PLACES=OSU_SITES.map(s=>({id:s.id,name:s.name,aliases:s.aliases,lng:s.arrival[0],lat:s.arrival[1],area:'Osu · Oxford Street',type:s.type,category:s.type,emoji:s.emoji,description:s.description,activities:s.type==='restaurant'?['meal','connect','explore']:['browse','connect','explore']}));
export const OSU_MASSES=OSU_SITES.flatMap(s=>s.family==='mall'?[{siteId:s.id,id:'mall-street-wing',ring:OSU_MALL_WING,height:11.5,geometrySource:'photo-estimated-within-mapped-property'}]:s.sourceIds.map(id=>({siteId:s.id,id:String(id),ring:OSU_RINGS[id],height:s.family==='papaye'?11.3:id===1179058850?12:15,geometrySource:'native-building-polygon'})));
export const osuColliders=s=>OSU_MASSES.filter(m=>m.siteId===s.id).map(m=>({id:'osu:'+m.id,rings:[m.ring],height:m.height,noDoor:true}));
export const OSU_ACTIVITIES=OSU_SITES.flatMap(s=>[
 {id:`osu:${s.family}:photo`,kind:'photo',label:`Photograph ${s.name}`,position:s.arrival,target:s.target,elevation:0},
 {id:`osu:${s.family}:guide`,kind:'watch',label:`Explore ${s.name} frontage`,position:osuFrontPoint(s,s.family==='mall'?-10:4,3),target:s.target,elevation:0,text:s.description+' Follow Oxford Street to the other shops in this block. This first Osu release covers the outdoor approaches.'},
]);
export const nearbyOsu=p=>OSU_SITES.some(s=>distanceMetres(p,s.position)<130);
export function osuPeople(seconds,position,minute=720){
 if(!nearbyOsu(position))return null;
 const day=minute>=360&&minute<1380,actors=[];
 for(const s of OSU_SITES){if(distanceMetres(position,s.position)>140)continue;
  const f=osuFrame(s),length=Math.min(8,f.width-6),speed=.66,phase=(seconds*speed)%(2*length),forward=phase<length,x=-length/2+(forward?phase:2*length-phase),p=osuFrontPoint(s,x,2.1);
  actors.push({id:`osu:${s.family}:visitor`,name:s.family==='papaye'?'Esi':'Kojo',avatar:s.family==='papaye'?'👩🏾':'👨🏾',position:p,elevation:0,heading:bearingTo(p,osuFrontPoint(s,x+(forward?1:-1),2.1)),speed,moving:true});
  if(day)actors.push({id:`osu:${s.family}:waiting`,name:'Ama',avatar:'👩🏾',position:osuFrontPoint(s,-f.width*.3,1.3),elevation:0,heading:bearingTo(osuFrontPoint(s,0,1),osuFrontPoint(s,0,10)),speed:0,moving:false});
 }
 return actors;
}
