import fs from 'node:fs/promises';
const dir=process.argv[2]||'public/maps/accra-v1',g=JSON.parse(await fs.readFile(dir+'/graph.json','utf8'));
const meta=Buffer.from(JSON.stringify({bounds:g.bounds,names:g.names,restrictions:g.restrictions})),shapes=g.edges.map(e=>Buffer.from(e[6]||'')),shapeSize=shapes.reduce((a,b)=>a+b.length,0),n=g.nodes.length,e=g.edges.length;
const header=32,nodeOffset=header,edgeOffset=nodeOffset+n*16,offsetsOffset=edgeOffset+e*24,shapeOffset=offsetsOffset+(e+1)*4,metaOffset=shapeOffset+shapeSize,b=Buffer.alloc(metaOffset+meta.length);
b.write('WFR1');b.writeUInt32LE(n,4);b.writeUInt32LE(e,8);b.writeUInt32LE(shapeOffset,12);b.writeUInt32LE(metaOffset,16);b.writeUInt32LE(meta.length,20);
g.nodes.forEach((p,i)=>{b.writeDoubleLE(p[0],nodeOffset+i*16);b.writeDoubleLE(p[1],nodeOffset+i*16+8)});
let offset=0;g.edges.forEach((row,i)=>{for(let c=0;c<6;c++)b.writeUInt32LE(Math.round(row[c]*(c===2||c===3?100:1)),edgeOffset+i*24+c*4);b.writeUInt32LE(offset,offsetsOffset+i*4);shapes[i].copy(b,shapeOffset+offset);offset+=shapes[i].length});b.writeUInt32LE(offset,offsetsOffset+e*4);meta.copy(b,metaOffset);await fs.writeFile(dir+'/graph.bin',b);console.log(`Packed road graph: ${(b.length/1e6).toFixed(1)} MB`);
