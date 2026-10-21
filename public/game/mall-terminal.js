import * as T from './three.module.js';
import {createVehicle} from './accra-vehicles.js';
import {TERMINAL_BOUNDARY,TERMINAL_ROADS} from './mall-terminal-map.js';
import {MALL_TERMINAL,TERMINAL_SERVICES,TERMINAL_SHELTER,terminalLocal,terminalStructures} from './mall-terminal-data.js';
import {batchStaticMeshes} from './render-utils.js';
import {tagSurface} from './graphics-materials.js';
export function createMallTerminal(){
 const group=new T.Group();group.name='Accra Mall · open-air trotro terminal';
 const material=(color,surface='stone',extra={})=>tagSurface(new T.MeshStandardMaterial({color,roughness:.9,...extra}),surface);
 const ground=material('#9b978c','soil'),asphalt=material('#454846','asphalt'),paving=material('#a4a59d'),steel=material('#656d6b','metal',{metalness:.45,roughness:.55}),roof=material('#a8aaa1','metal',{metalness:.38,roughness:.7}),wood=material('#867b65','wood'),dark=material('#243f3c'),paint=material('#e1d5a0'),edge=material('#6c6e65');
 for(const [m,bias] of [[ground,-2],[asphalt,-3],[paving,-4],[paint,-6]]){m.polygonOffset=true;m.polygonOffsetFactor=bias;m.polygonOffsetUnits=bias;}
 const mesh=(geo,mat,x,y,z)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.receiveShadow=true;m.castShadow=y>.2;group.add(m);return m};
 const box=(mat,w,h,d,x,y,z,rotation=0)=>{const m=mesh(new T.BoxGeometry(w,h,d),mat,x,y,z);m.rotation.y=rotation;return m};
 const shape=new T.Shape(TERMINAL_BOUNDARY.map(p=>{const [x,z]=terminalLocal(p);return new T.Vector2(x,-z)}));const yard=mesh(new T.ShapeGeometry(shape),ground,0,.024,0);yard.rotation.x=-Math.PI/2;
 // Actual service-road alignment and mixed compacted/asphalt approach, not a new grid.
 for(const r of TERMINAL_ROADS.filter(r=>![5032504,314531067].includes(r.id))){const points=r.coordinates.map(terminalLocal);for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b[0]-a[0],dz=b[1]-a[1];box(r.surface==='compacted'?ground:asphalt,6.2,.018,Math.hypot(dx,dz)+.08,(a[0]+b[0])/2,.036,(a[1]+b[1])/2,Math.atan2(dx,dz));}}
 box(paving,6.4,.025,60,17.8,.04,-25);box(paving,17.5,.025,12,24,.04,-40);
 // Low surface seams and drainage stay outside the boarding and circulation lanes.
 for(let z=-53;z<4;z+=2.5)box(edge,6.2,.003,.025,17.8,.055,z);
 for(let z=-48;z<14;z+=3.5){box(edge,.48,.025,3.3,-25,.05,z);for(let n=0;n<5;n++)box(steel,.48,.012,.035,-25,.07,z-1+n*.43);}
 const s=TERMINAL_SHELTER;
 for(const p of terminalStructures())if(p.id.startsWith('terminal-post'))box(steel,p.w,p.h,p.d,p.x,p.h/2,p.z);
 box(steel,s.w,.13,.12,s.x,s.h,s.z-s.d/2);box(steel,s.w,.13,.12,s.x,s.h-.1,s.z+s.d/2);
 const panel=box(roof,s.w+.7,.065,s.d+.8,s.x,s.h+.12,s.z);panel.rotation.x=.045;
 for(let x=s.x-s.w/2;x<=s.x+s.w/2;x+=.24){const rib=box(roof,.045,.042,s.d+.8,x,s.h+.17,s.z);rib.rotation.x=.045;}
 for(const z of [-44,-40,-36]){box(wood,3.4,.085,.5,23,.46,z);box(wood,3.4,.4,.065,23,.76,z-.27);for(const x of [21.7,24.3])box(steel,.065,.45,.45,x,.225,z);}
 function sign(text,w,h,x,y,z,bg='#203e39',rotation=0){if(typeof document==='undefined')return;const c=document.createElement('canvas');c.width=768;c.height=192;const ctx=c.getContext('2d');if(!ctx)return;ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#f2d493';ctx.font='bold 66px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,384,98,724);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;const m=mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:texture,roughness:.8,side:T.DoubleSide}),x,y,z);m.rotation.y=rotation;}
 sign('ACCRA MALL · TRO-TRO',10,1.05,24,s.h-.5,-35.85);
 sign('WAITING AREA',4.3,.48,24,2.35,-35.82);
 for(const service of TERMINAL_SERVICES){const z=service.z;
  for(const x of [6.1,9.9])box(paint,.09,.007,7.5,x,.065,z);
  box(paint,3.9,.007,.1,8,.065,z+3.75);box(paint,3.9,.007,.1,8,.065,z-3.75);
  box(steel,.08,2.65,.08,12.5,1.325,z-3.6);sign(`BAY ${service.bay}`,1.5,.36,12.5,2.65,z-3.55);sign(service.name.toUpperCase(),2.4,.36,12.5,2.22,z-3.55);
 }
 box(dark,1.7,.8,.6,20,.8,-51);sign('DRIVER DESK',2.7,.55,20,1.65,-50.6);
 box(steel,.12,2.55,.12,29,1.275,-26);sign('WORLDFOLK · GAME SERVICES',5.4,.7,29,2.6,-25.9);sign('AIRPORT · LEGON · OSU',5.4,.7,29,1.87,-25.9);
 batchStaticMeshes(group);
 const fleet=TERMINAL_SERVICES.map(service=>{const model=createVehicle('minibus',service.color),[x,z]=terminalLocal(service.vehiclePosition);model.group.name='Terminal bay '+service.bay+' minibus';model.group.position.set(x,0,z);group.add(model.group);return {service,model};});
 group.userData.terminal={boundarySource:'OSM way 300519834',sourcePhoto:'Spintex entrance · 2024-08',bayLayout:'gameplay interpretation',parkedVehicles:3};
 return {group,update(t,position,context={}){for(const {service,model} of fleet){model.group.visible=!(context.transit?.terminalId===MALL_TERMINAL.id&&context.transit.serviceId===service.id);model.animateVehicle?.({distance:0,preset:context.preset||'day'},0);}}};
}
