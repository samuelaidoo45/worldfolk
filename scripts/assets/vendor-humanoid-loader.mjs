import {build} from 'esbuild';
import {readFile,writeFile} from 'node:fs/promises';
await build({stdin:{contents:"export {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';export {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';",resolveDir:process.cwd()},bundle:true,format:'esm',plugins:[{name:'shared-three',setup(b){b.onResolve({filter:/^three$/},()=>({path:'three',external:true}))}}],outfile:'public/game/humanoid-loader.js',minify:true,legalComments:'inline'});
const path='public/game/humanoid-loader.js';
await writeFile(path,'// Three.js r160 addons, MIT. See assets/humans/THREE-LICENSE.txt.\n'+(await readFile(path,'utf8')).replace(/from\s*"three"/g,'from"./three.module.js"'));
