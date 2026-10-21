import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolve, basename } from 'node:path';
import { lstatSync } from 'node:fs';

export function forbiddenFile(path) {
  const parts = path.replaceAll('\\', '/').split('/');
  const name = basename(path);
  if (parts.some(p => ['.wrangler', '.sites-runtime', '.git', 'node_modules', '.cache'].includes(p))) return 'local runtime/cache';
  if (/^(?:\.env(?:\..*)?|\.dev\.vars(?:\..*)?)$/.test(name) && !name.endsWith('.example')) return 'environment secrets';
  if (/\.(?:sqlite(?:3)?(?:-wal|-shm)?|db|pem|key|p12|pfx|har)$/i.test(name)) return 'database, private key or browser capture';
  if (/^(?:id_rsa|id_ed25519|credentials(?:\.json)?|service-account(?:[-.].*)?\.json)$/i.test(name)) return 'credential file';
  return null;
}
export function repositoryFiles(root) {
  return execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root })
    .toString().split('\0').filter(Boolean);
}
export function checkRepository(root) {
  const files = [...new Set(repositoryFiles(root))];
  const findings = [];
  for (const path of files) {
    const reason = forbiddenFile(path);
    if (reason) findings.push({ path, reason });
    try { if (lstatSync(resolve(root, path)).isSymbolicLink()) findings.push({ path, reason: 'review symlink before copying/scanning external targets' }); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  return { files, findings };
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const result = checkRepository(root);
  for (const f of result.findings) console.error(`${f.path}: ${f.reason}`);
  if (result.findings.length) process.exitCode = 1;
  else console.log(`Repository file guard passed: ${result.files.length} tracked/proposed files; ignored local state excluded.`);
}
