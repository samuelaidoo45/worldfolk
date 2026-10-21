# Security policy

Worldfolk is an actively developed prototype. Security fixes target the current maintained default branch; older builds are not separately supported releases.

## Reporting a vulnerability

Do not post exploit details, credentials or player data in a public issue. Use the repository's **Security → Report a vulnerability** feature if it is enabled. If private reporting is unavailable, open a minimal issue asking the maintainer for a private reporting channel, without reproduction/exploit details or sensitive records. There is currently no separately published security email or guaranteed response SLA.

Include affected version/revision, impact, safe reproduction against your own local instance, and a suggested fix if possible. Use test accounts/data. Do not attack the live game, access another player's records, stress shared infrastructure or publish a working exploit while coordinating a fix.

## Sensitive areas

Sessions and account recovery, player ownership, movement authority, game balances, private chat/calls, profile uploads, ad approval and payment confirmation require review. Server-side validation must remain authoritative. See [engineering standards](docs/contributing/standards.md) and [release checks](docs/contributing/releases.md).

Never commit or attach passwords, recovery codes, cookies, Cloudflare tokens, TURN keys, database dumps or private player content. If a credential is exposed, revoke/rotate it through the owning service; removing it in a later Git commit does not erase the exposure.
