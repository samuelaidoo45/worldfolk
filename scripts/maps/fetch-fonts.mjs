import fs from 'node:fs/promises';
const dir=process.argv[2]||'/tmp/worldfolk-map-extract',layers=JSON.parse(await fs.readFile(dir+'/layers.json','utf8')),ranges=new Set([0]);
for(const features of Object.values(layers))for(const f of features)for(const c of f.properties.name||'')ranges.add(Math.floor(c.codePointAt(0)/256)*256);
await fs.mkdir('public/maps/fonts/Noto Sans Regular',{recursive:true});
for(const start of ranges){const name=`${start}-${start+255}.pbf`,r=await fetch(`https://demotiles.maplibre.org/font/Noto%20Sans%20Regular/${name}`);if(!r.ok)throw Error(`Font ${name}: ${r.status}`);const data=new Uint8Array(await r.arrayBuffer());if(data[0]!==10)throw Error('Expected protobuf glyph data');await fs.writeFile(`public/maps/fonts/Noto Sans Regular/${name}`,data)}
const license=await fetch('https://raw.githubusercontent.com/openmaptiles/fonts/master/noto-sans/LICENSE');if(!license.ok)throw Error('Font licence unavailable');await fs.writeFile('public/maps/fonts/NOTO-LICENSE.txt',await license.text());console.log(`Self-hosted ${ranges.size} glyph ranges`);
