import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));
const maintained = ['AGENTS.md', 'CLAUDE.md', 'README.md', 'CONTRIBUTING.md', 'SECURITY.md', 'CODE_OF_CONDUCT.md', 'CHANGELOG.md',
  'docs/README.md', 'docs/project-context.md', 'docs/security-audit.md', 'docs/development.md', 'docs/architecture.md', 'docs/roadmap.md',
  ...['contributing', 'templates'].flatMap(dir => readdirSync(resolve(root, `docs/${dir}`)).filter(f => f.endsWith('.md')).map(f => `docs/${dir}/${f}`))];
let failures = 0;
for (const file of maintained) {
  const source = readFileSync(resolve(root, file), 'utf8').replace(/```[\s\S]*?```/g, '');
  for (const [, raw] of source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
    const href = raw.trim().replace(/^<|>$/g, '').split(/\s+"/)[0];
    if (/^(?:https?:|mailto:|#)/i.test(href)) continue;
    const path = resolve(dirname(resolve(root, file)), decodeURIComponent(href.split('#')[0]));
    if (relative(root, path).startsWith('..') || !existsSync(path) || (!statSync(path).isFile() && !statSync(path).isDirectory())) {
      console.error(`${file}: missing or out-of-repository link ${href}`); failures++;
    }
  }
}
if (failures) process.exitCode = 1;
else console.log(`Checked local link targets in ${maintained.length} maintained contributor documents. External URLs and heading anchors are not checked.`);
