import test from 'node:test';
import assert from 'node:assert/strict';
import { forbiddenFile } from '../scripts/security/repository-files.mjs';

test('repository guard rejects nested credentials, local state and captures', () => {
  for (const file of ['.env', 'nested/.env.production', 'nested/.dev.vars', '.wrangler/state/db.sqlite', 'db.sqlite-wal', 'dump.db', 'server.key', 'private.pem', 'traffic.har', 'credentials.json', 'id_ed25519', '.cache/download.bin']) {
    assert.ok(forbiddenFile(file), file);
  }
});
test('repository guard permits examples, schema migrations, research and runtime assets', () => {
  for (const file of ['.env.example', '.dev.vars.example', 'drizzle/0011_dear_master_chief.sql', 'docs/realism/coverage-work-items.csv', '.openai/hosting.json', 'public/game/assets/lods/accra-mall.bin', 'server/player-session.ts']) {
    assert.equal(forbiddenFile(file), null, file);
  }
});
