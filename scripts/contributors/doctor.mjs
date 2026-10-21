import { existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const root = fileURLToPath(new URL('../../', import.meta.url));
const [major, minor] = process.versions.node.split('.').map(Number);
let errors = 0;
function check(ok, message) { console.log(`${ok ? 'OK  ' : 'FAIL'} ${message}`); if (!ok) errors++; }
check(major > 22 || (major === 22 && minor >= 13), `Node ${process.versions.node}; minimum 22.13.0`);
for (const path of ['node_modules/vinext/dist/cli.js', 'node_modules/wrangler/bin/wrangler.js',
  '.openai/hosting.json', 'public/maps/accra-v1/graph.bin', 'public/game/lod-catalog.js']) {
  check(existsSync(resolve(root, path)), path);
}
const migrations = readdirSync(resolve(root, 'drizzle')).filter(f => /^\d+.*\.sql$/.test(f));
check(migrations.length > 0, `${migrations.length} SQL migrations`);
console.log(`${existsSync(resolve(root, 'dist/server/wrangler.json')) ? 'OK  ' : 'INFO'} Build output: run npm run build before database setup or Worker preview.`);
console.log('INFO Database contents, GPU/browser support, optional Python tools and cloud credentials are not tested here.');
process.exitCode = errors ? 1 : 0;
