import {trafficSpeed,roadContinuation,angleDifference,vehiclesOverlap} from './traffic-routing.js';
import {roadWidth,isHighway,sweptHit,pedestrianDamage} from './street-safety.js';
import {offsetMetres,distanceMetres,bearingTo,projectOnSegment,turnToward} from './motion.js';
const names=['Ama','Kojo','Abena','Kofi','Adwoa','Yaw','Akosua','Kwame','Efua','Nana','Esi','Kwesi'];
const looks=['👩🏾','👨🏾','👩🏿','👨🏽','👩🏽','🧑🏾'];
// Ambient residents are simulated locally and are never included in live-player counts.
export function createCityLife(map,physics,onHit=()=>{}){
  let people=[],traffic=[],lastSeed=0,serial=0;const junctions=new Map();
  function roads(position){
    let features=[];try{features=map.querySourceFeatures('accralife-streets',{sourceLayer:'road'})}catch{return []}
    const seen=new Set(),out=[];
    for(const f of features){if(/rail|ferry/.test(f.properties?.class||''))continue;const lines=f.geometry?.type==='LineString'?[f.geometry.coordinates]:f.geometry?.type==='MultiLineString'?f.geometry.coordinates:[];
      for(const line of lines){if(line.length<2)continue;let best=null;for(let i=0;i<line.length-1;i++){const p=projectOnSegment(position,line[i],line[i+1]);if(!best||p.distance<best.distance)best={...p,index:i}}
        if(!best||best.distance>170)continue;const key=`${line[0].join(',')}:${line.at(-1).join(',')}`;if(seen.has(key))continue;seen.add(key);out.push({line,best,roadClass:f.properties?.class,highway:isHighway(f.properties?.class),width:roadWidth(f.properties?.class),layer:Number(f.properties?.layer)||0,oneway:f.properties?.oneway==='-1'?-1:[true,1,'true','yes','1'].includes(f.properties?.oneway)?1:0,walkOnly:/path|pedestrian|steps/.test(f.properties?.class||'')});
      }
    }return out.sort((a,b)=>a.best.distance-b.best.distance);
  }
  function spawn(position,isCar,available){
    const options=available.filter(r=>isCar?!r.walkOnly:!r.highway);if(!options.length)return null;
    for(let attempt=0;attempt<18;attempt++){
      const index=serial++,road=options[(index*7+attempt)%options.length],line=road.line,seg=Math.max(0,Math.min(line.length-2,road.best.index+(index%5)-2)),a=line[seg],b=line[seg+1],length=distanceMetres(a,b);if(length<3)continue;
      const direction=isCar&&(road.oneway===-1||!road.oneway&&index%2)?-1:1,t=.2+(index%7)*.1,base=[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t],heading=direction===1?bearingTo(a,b):bearingTo(b,a),angle=heading*Math.PI/180,side=isCar?road.width*.23:(index%2?1:-1)*(road.width/2+1.15),point=offsetMetres(base,Math.cos(angle)*side,-Math.sin(angle)*side);
      const distance=distanceMetres(position,point);if(isCar&&(distanceMetres(base,a)<9||distanceMetres(base,b)<9))continue;
      if(distance<10||distance>150||physics.collision(point,isCar?1.2:.5)||[...people,...traffic].some(n=>distanceMetres(n.position,point)<5))continue;
      return {id:`ambient-${index}`,name:names[index%names.length],avatar:looks[index%looks.length],driving:isCar,vehicle:isCar?(index%5===0?'bus':index%3===0?'taxi':'car'):null,position:point,heading,line,layer:road.layer,index:direction===1?seg+1:seg,direction,side,speed:0,roadClass:road.roadClass,highway:road.highway,maxSpeed:isCar?(road.highway?19+index%7:7+index%5):1.05+(index%4)*.12,pauseUntil:0,blockedFor:0,moving:false};
    }return null;
  }
  function maintain(position,now){if(now-lastSeed<2500||!physics.count)return;lastSeed=now;
    people=people.filter(p=>distanceMetres(position,p.position)<220);traffic=traffic.filter(p=>distanceMetres(position,p.position)<240&&!(p.retired&&distanceMetres(position,p.position)>55));const available=roads(position);
    while(people.length<18){const p=spawn(position,false,available);if(!p)break;people.push(p)}
    while(traffic.length<14){const p=spawn(position,true,available);if(!p)break;traffic.push(p)}
  }
  function tick(dt,position,now,playerMode='walk'){
    maintain(position,now);for(const [key,entry] of junctions){const owner=traffic.find(n=>n.id===entry.id);if(!owner||distanceMetres(owner.position,entry.position)>15||now-entry.at>15000)junctions.delete(key)}
    for(const npc of [...people,...traffic]){
      npc.moving=false;
      // A pedestrian yields instead of pinning the player against a wall/car.
      const clearance=playerMode==='drive'?2.6:.8;
      if(!npc.driving&&distanceMetres(npc.position,position)<clearance){const away=bearingTo(position,npc.position)*Math.PI/180;let best=npc.position;for(const turn of [0,Math.PI/2,-Math.PI/2]){const candidate=offsetMetres(npc.position,Math.sin(away+turn)*dt*1.8,Math.cos(away+turn)*dt*1.8),resolved=physics.move(npc.position,candidate,.42);if(distanceMetres(resolved.position,position)>distanceMetres(best,position))best=resolved.position}npc.moving=distanceMetres(best,npc.position)>.002;npc.position=best;npc.speed=0;continue}
      if(now<npc.pauseUntil||npc.retired)continue;
      const raw=npc.line[npc.index],previous=npc.line[Math.max(0,Math.min(npc.line.length-1,npc.index-npc.direction))],heading=bearingTo(previous,raw),angle=heading*Math.PI/180;
      let target=offsetMetres(raw,Math.cos(angle)*npc.side,-Math.sin(angle)*npc.side);if(physics.collision(target,npc.driving?1.1:.45)){if(npc.driving)target=raw;else{npc.direction*=-1;npc.index=Math.max(0,Math.min(npc.line.length-1,npc.index+npc.direction));npc.pauseUntil=now+500;continue}}
      const d=distanceMetres(npc.position,target);let junctionWait=false;if(npc.driving&&d<18){if(!npc.nextRoad)npc.nextRoad=roadContinuation(npc,roads(npc.position));if(npc.nextRoad?.choices>1){const key=raw.map(v=>v.toFixed(5)).join(','),entry=junctions.get(key);if(entry&&entry.id!==npc.id)junctionWait=true;else if(!entry)junctions.set(key,{id:npc.id,position:raw,at:now})}}
      if(d<.6&&!junctionWait){
       if(npc.driving){const next=npc.nextRoad||roadContinuation(npc,roads(npc.position));npc.nextRoad=null;if(next){npc.line=next.line;npc.index=next.index;npc.direction=next.direction;npc.side=next.width*.23;npc.layer=next.layer;npc.turns=(npc.turns||0)+1;npc.pauseUntil=now+(next.turn>35?450:0)}else{npc.speed=0;npc.retired=true}}
       else{npc.index+=npc.direction;if(npc.index>=npc.line.length||npc.index<0){npc.direction*=-1;npc.index=Math.max(0,Math.min(npc.line.length-1,npc.index+2*npc.direction));npc.pauseUntil=now+800}}continue}
      const desired=bearingTo(npc.position,target),r=desired*Math.PI/180;
      const ahead=offsetMetres(npc.position,Math.sin(r)*(npc.driving?4:1),Math.cos(r)*(npc.driving?4:1));
      const playerClose=distanceMetres(ahead,position)<(npc.driving?5:1.25);
      const occupied=playerClose||[...traffic,...people].some(other=>other!==npc&&distanceMetres(ahead,other.position)<(npc.driving?2.4:.7));
      if(npc.driving){const targetSpeed=junctionWait?Math.max(0,(d-9)/1.5):trafficSpeed(npc.position,desired,npc.speed,angleDifference(npc.heading,desired)>30?3:npc.maxSpeed,[...traffic,...people,{id:'player',position,heading:0,speed:0,driving:playerMode==='drive'||playerMode==='transit'}],npc.id);npc.speed+=Math.max(-7*dt,Math.min(3*dt,targetSpeed-npc.speed))}else npc.speed+=((occupied?0:npc.maxSpeed)-npc.speed)*(1-Math.exp(-dt*5));
      const next=offsetMetres(npc.position,Math.sin(r)*Math.min(d,npc.speed*dt),Math.cos(r)*Math.min(d,npc.speed*dt));
      let result=npc.driving?physics.moveVehicle(npc.position,next,desired):physics.move(npc.position,next,.42);if(npc.driving&&result.blocked&&npc.side>.3){const inward=offsetMetres(npc.position,-Math.cos(r)*Math.min(.12,dt*2),Math.sin(r)*Math.min(.12,dt*2));const adjusted=physics.moveVehicle(npc.position,inward,desired);if(!adjusted.blocked){result=adjusted;npc.side=Math.max(.25,npc.side-dt*2)}}if(npc.driving&&result.blocked)npc.speed=0;if(npc.driving&&[...traffic,{position,driving:playerMode==='drive'||playerMode==='transit'}].some(other=>other!==npc&&other.driving&&vehiclesOverlap(result.position,desired,other.position,other.heading??desired)&&distanceMetres(result.position,other.position)<distanceMetres(npc.position,other.position))){result={position:npc.position,blocked:true};npc.speed=0;}
      if(npc.driving&&playerMode==='walk'&&npc.speed>2&&now-(npc.lastHit||0)>3000&&sweptHit(npc.position,result.position,position)){npc.lastHit=now;onHit({speed:npc.speed,highway:npc.highway,damage:pedestrianDamage(npc.speed,npc.highway)});npc.speed=0;npc.pauseUntil=now+1800;}
      npc.moving=distanceMetres(npc.position,result.position)>.002;npc.position=result.position;npc.heading=turnToward(npc.heading,desired,7,dt);
      npc.blockedFor=result.blocked?npc.blockedFor+dt:0;if(npc.blockedFor>3&&!npc.driving){npc.direction*=-1;npc.index=Math.max(0,Math.min(npc.line.length-1,npc.index+npc.direction));npc.blockedFor=0;npc.pauseUntil=now+1000}
    }
  }
  function nudgePedestrians(from,to,driving=false){
    const clearance=driving?2.55:.72;
    for(const npc of people){if(distanceMetres(to,npc.position)>=clearance)continue;const direction=bearingTo(to,npc.position)*Math.PI/180,step=Math.min(.35,clearance-distanceMetres(to,npc.position)+.03);let best=npc.position;
      for(const turn of [0,Math.PI/3,-Math.PI/3]){const candidate=offsetMetres(npc.position,Math.sin(direction+turn)*step,Math.cos(direction+turn)*step),result=physics.move(npc.position,candidate,.42);if(distanceMetres(result.position,to)>distanceMetres(best,to))best=result.position}
      npc.position=best;npc.pauseUntil=performance.now()+350;npc.moving=true;
    }
  }
  function nearby(position){return people.map(p=>({...p,distance:distanceMetres(position,p.position)})).filter(p=>p.distance<4.2).sort((a,b)=>a.distance-b.distance)[0]||null}
  function greet(id,position){const p=people.find(x=>x.id===id);if(!p)return '';p.pauseUntil=performance.now()+6000;p.heading=bearingTo(p.position,position);return `${p.name} · resident: ${['Akwaaba! Open Destinations to find a place, then follow the gold route.','Looking for a ride? Walk to the red car and press F.','Osu is lively. Set Oxford Street as your destination.','Take your time around the corners. Space is your handbrake.'][names.indexOf(p.name)%4]}`}
  function collides(position,driving=false){return (driving?[...people,...traffic]:people).some(p=>distanceMetres(position,p.position)<(p.driving?(driving?3.4:1.7):(driving?2.5:.65)))}
  return {tick,nudgePedestrians,nearby,greet,collides,roads,get actors(){return [...people,...traffic]},get count(){return people.length}};
}
