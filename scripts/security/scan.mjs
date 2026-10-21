import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, copyFileSync, existsSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { checkRepository } from './repository-files.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const mode = process.argv[2] || 'files';
if (!['files', 'history'].includes(mode) || process.argv.length > 3) throw new Error('Expected files or history.');
const checked = checkRepository(root);
if (checked.findings.length) { for (const f of checked.findings) console.error(`${f.path}: ${f.reason}`); process.exit(1); }
const binary = process.env.GITLEAKS_BIN || 'gitleaks';
const args = ['--config', join(root, '.gitleaks.toml'), '--redact=100', '--no-banner', '--no-color'];
let snapshot;
try {
  if (mode === 'history') args.unshift('git', '--log-opts=--all --full-history', root);
  else {
    snapshot = mkdtempSync(join(tmpdir(), 'worldfolk-secret-scan-'));
    for (const file of checked.files) {
      if (!existsSync(join(root, file))) continue;
      const target = join(snapshot, file); mkdirSync(dirname(target), { recursive: true }); copyFileSync(join(root, file), target);
    }
    args.unshift('dir', snapshot);
  }
  const result = spawnSync(binary, args, { cwd: root, stdio: 'inherit' });
  if (result.error?.code === 'ENOENT') {
    console.error('Install the official Gitleaks CLI, or set GITLEAKS_BIN to its absolute path. See SECURITY.md.'); process.exitCode = 2;
  } else if (result.error) throw result.error;
  else process.exitCode = result.status ?? 2;
} finally { if (snapshot) rmSync(snapshot, { recursive: true, force: true }); }
