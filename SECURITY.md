# Security policy

Worldfolk is an actively developed prototype. Security fixes target the current maintained default branch; older builds are not separately supported releases.

## Reporting a vulnerability

Do not post exploit details, credentials or player data in a public issue. Use the repository's **Security → Report a vulnerability** feature if it is enabled. If private reporting is unavailable, open a minimal issue asking the maintainer for a private reporting channel, without reproduction/exploit details or sensitive records. There is currently no separately published security email or guaranteed response SLA.

Include affected version/revision, impact, safe reproduction against your own local instance, and a suggested fix if possible. Use test accounts/data. Do not attack the live game, access another player's records, stress shared infrastructure or publish a working exploit while coordinating a fix.

## Sensitive areas

Sessions and account recovery, player ownership, movement authority, game balances, private chat/calls, profile uploads, ad approval and payment confirmation require review. Server-side validation must remain authoritative. See [engineering standards](docs/contributing/standards.md) and [release checks](docs/contributing/releases.md).

Never commit or attach passwords, recovery codes, cookies, Cloudflare tokens, TURN keys, database dumps or private player content. If a credential is exposed, revoke/rotate it through the owning service; removing it in a later Git commit does not erase the exposure.

## Before public release and before contributing

```sh
npm run security:files
npm run security:check
npm run security:history
```

The first command checks tracked/proposed filenames without reading ignored local secrets. The other commands require the [official Gitleaks CLI](https://github.com/gitleaks/gitleaks); install it for your OS or set `GITLEAKS_BIN` to its absolute path. File scanning copies only tracked/proposed files into a temporary snapshot; history scanning checks every reachable local ref. Reports/logs redact detected values. CI downloads a fixed official release, verifies its SHA-256 and runs both scans without deployment credentials.

The two allowlist entries in `.gitleaks.toml` match exact reviewed research prose at specific paths. They do not exempt whole documentation/test directories or provider keys. Never add a broad allowlist or baseline to hide a real credential.

Keep environment files, Wrangler state, local databases, browser HAR captures, private keys and review captures out of Git. Only placeholder `.example` configurations belong in source. Public project/database identifiers, domains, place coordinates and provider binding names are not authentication credentials. Commit author names/emails are visible in Git history; configure your preferred Git identity before contributing.

Deleting a key from the latest file does not remove older commits. A history rewrite also does not revoke the key or erase forks, prior clones, cached commit pages or provider-side records. Revoke any exposed credential with its issuing provider. Coordinate with maintainers before rewriting shared history; contributors should re-clone after an authorized cleanup so old commits are not merged back. GitHub may require a separate support request for cached objects or pull-request refs.

The [publication audit](docs/security-audit.md) records the inspected revision, actual findings and outstanding provider-side work. A clean secret scan is not a guarantee that every application vulnerability or third-party dependency is safe.
