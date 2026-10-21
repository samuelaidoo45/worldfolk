import { readFileSync, existsSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import '../sites-env.mjs';
const root = fileURLToPath(new URL('../../', import.meta.url));
const args = process.argv.slice(2);
if (args.length && (args.length !== 2 || args[0] !== '--state-dir')) throw new Error('Usage: npm run db:setup [-- --state-dir <empty local directory>]');
const state = resolve(root, args[1] || '.wrangler/state');
function hasDatabase(dir) {
  return existsSync(dir) && readdirSync(dir, { withFileTypes: true }).some(entry =>
    entry.isDirectory() ? hasDatabase(join(dir, entry.name)) : entry.name.endsWith('.sqlite') && entry.name !== 'metadata.sqlite');
}
// Existing databases may have been initialized by direct SQL without a ledger.
// Never replay migrations or delete an existing player's local state.
if (hasDatabase(state)) throw new Error('Existing local SQLite data found. Setup stopped without changing it. See docs/development.md#existing-local-databases.');
const built = resolve(root, 'dist/server/wrangler.json');
if (!existsSync(built)) throw new Error('Run npm run build first.');
const config = JSON.parse(readFileSync(built, 'utf8'));
const db = config.d1_databases?.find(item => item.binding === 'DB');
if (!db) throw new Error('Build configuration does not declare the DB binding.');
const runtime = resolve(root, '.sites-runtime'); mkdirSync(runtime, { recursive: true });
const localConfig = resolve(runtime, 'local-db.json');
writeFileSync(localConfig, JSON.stringify({ name: config.name, compatibility_date: config.compatibility_date,
  d1_databases: [{ ...db, migrations_dir: resolve(root, 'drizzle') }] }, null, 2) + '\n');
const run = spawnSync(process.execPath, [resolve(root, 'node_modules/wrangler/bin/wrangler.js'),
  'd1', 'migrations', 'apply', 'DB', '--local', '--config', localConfig, '--persist-to', state],
  { cwd: root, stdio: 'inherit', env: { ...process.env, CI: 'true' } });
if (run.error) throw run.error;
process.exit(run.status ?? 1);
