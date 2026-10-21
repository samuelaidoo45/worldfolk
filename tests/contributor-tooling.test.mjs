import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const run = (script, args = [], env = {}) => spawnSync(process.execPath, [script, ...args], {
  encoding: 'utf8', env: { ...process.env, ...env },
});

test('API wrapper rejects public targets before launching mutation fixtures', () => {
  for (const target of ['https://worldfolk.world', 'http://localhost:3001', 'http://127.0.0.1:3001/path', 'http://127.0.0.1:3001?x=1']) {
    const result = run('scripts/contributors/test.mjs', ['api', 'tests/auth-api.test.mjs'], { GAME_TEST_URL: target });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /loopback HTTP preview/);
  }
});
test('API wrapper requires named supported fixtures and rejects old hard-coded ones', () => {
  for (const args of [['api'], ['api', '../outside.mjs'], ['api', 'tests/notifications-api.test.mjs']]) {
    const result = run('scripts/contributors/test.mjs', args, { GAME_TEST_URL: 'http://127.0.0.1:3001' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Choose API tests|Not a known API test|legacy test/);
  }
});
test('database setup refuses existing state without altering the file', () => {
  const state = mkdtempSync(join(tmpdir(), 'worldfolk-existing-state-'));
  try {
    mkdirSync(join(state, 'v3', 'd1'), { recursive: true });
    writeFileSync(join(state, 'v3', 'd1', 'existing.sqlite'), 'fixture');
    const result = run('scripts/contributors/init-local-db.mjs', ['--state-dir', state]);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Existing local SQLite data found/);
    assert.equal(readFileSync(join(state, 'v3', 'd1', 'existing.sqlite'), 'utf8'), 'fixture');
  } finally { rmSync(state, { recursive: true, force: true }); }
});

test('offline selection excludes every API fixture and the legacy live capacity suite', () => {
  const result = run('scripts/contributors/test.mjs', ['unit', '--list']);
  assert.equal(result.status, 0);
  assert.match(result.stdout, /tests\/registration-home\.test\.mjs/);
  assert.doesNotMatch(result.stdout, /tests\/multiplayer-capacity\.test\.mjs|tests\/[^\n]+-api\.test\.mjs/);
});
