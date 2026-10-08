import fs from 'node:fs';
import {readRoadGraph} from '../../public/game/osm-routing.js';
const root='public/maps/accra-v1',bytes=fs.readFileSync(root+'/graph.bin'),graph=readRoadGraph(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)),streets=new Map();
for(let i=0;i<graph.edgeData.length;i+=6){const name=graph.names[graph.edgeData[i+5]];if(!name)continue;const node=graph.edgeData[i],lng=graph.nodeData[node*2],lat=graph.nodeData[node*2+1],key=name+':'+Math.floor(lng*25)+':'+Math.floor(lat*25);if(!streets.has(key))streets.set(key,{name,points:[]});streets.get(key).points.push({lng,lat,walk:!!(graph.edgeData[i+4]&4)})}
const rows=[...streets.values()].map(({name,points})=>{const centre=points.reduce((p,c)=>[p[0]+c.lng/points.length,p[1]+c.lat/points.length],[0,0]);points.sort((a,b)=>Number(b.walk)-Number(a.walk)||Math.hypot(a.lng-centre[0],a.lat-centre[1])-Math.hypot(b.lng-centre[0],b.lat-centre[1]));return {name,type:'street',detail:'Accra',lng:points[0].lng,lat:points[0].lat}});
fs.writeFileSync(root+'/streets.json',JSON.stringify(rows)+'\n');console.log('Indexed',rows.length,'named streets from the existing OSM road graph');
