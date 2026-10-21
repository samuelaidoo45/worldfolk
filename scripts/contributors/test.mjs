import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

process.chdir(fileURLToPath(new URL('../../', import.meta.url)));
const [suite = 'smoke', ...files] = process.argv.slice(2);
const listOnly = files.length === 1 && files[0] === '--list' && suite !== 'api';
const legacyIntegration = new Set(['multiplayer-capacity.test.mjs']);
const smoke = [
  'auth-session-handoff', 'game-notifications', 'game-audio', 'human-gait',
  'precinct-life', 'precinct-navigation', 'session-stability', 'gameplay-stability',
  'shared-viewport', 'render-preparation', 'voice-peer', 'traffic-routing',
  'castle-asomdwe', 'contributor-tooling',
].map(name => `tests/${name}.test.mjs`);
const available = readdirSync('tests').filter(name => name.endsWith('.test.mjs'));
let selected;
if (suite === 'smoke') selected = smoke;
else if (suite === 'unit') selected = available.filter(name => !name.endsWith('-api.test.mjs') && !legacyIntegration.has(name)).sort().map(name => `tests/${name}`);
else if (suite === 'api') {
  if (!files.length) throw new Error('Choose API tests explicitly: npm run test:api -- tests/auth-api.test.mjs');
  const target = new URL(process.env.GAME_TEST_URL || 'http://127.0.0.1:3001');
  if (target.protocol !== 'http:' || target.hostname !== '127.0.0.1' || !target.port || target.username || target.password || target.pathname !== '/' || target.search || target.hash) {
    throw new Error('API tests require an explicit loopback HTTP preview, for example GAME_TEST_URL=http://127.0.0.1:3001.');
  }
  // Some older tests hard-code port 3000. Keep those out of this entry point.
  const supported = new Set(available.filter(name => name.endsWith('-api.test.mjs')));
  const { readFileSync } = await import('node:fs');
  for (const file of files) {
    if (!file.startsWith('tests/') || !supported.has(file.slice(6))) throw new Error(`Not a known API test: ${file}`);
    if (!readFileSync(file, 'utf8').includes('process.env.GAME_TEST_URL')) throw new Error(`${file} is a legacy test without GAME_TEST_URL support; see docs/contributing/testing.md.`);
  }
  selected = files;
  process.env.GAME_TEST_URL = target.origin;
} else throw new Error('Expected smoke, unit or api.');
if (suite !== 'api' && files.length && !listOnly) throw new Error('Use node --test for a custom offline selection.');
console.log(`Worldfolk ${suite}: ${selected.length} files${suite === 'api' ? ` against ${process.env.GAME_TEST_URL}` : ' (no running API required)'}`);
if (listOnly) { console.log(selected.join('\n')); process.exit(0); }
const result = spawnSync(process.execPath, ['--test', `--test-concurrency=${suite === 'api' ? 1 : 2}`, ...selected], { stdio: 'inherit' });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
