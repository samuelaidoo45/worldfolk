# Maintainer release checklist

Contributor PRs and CI do not deploy. Production credentials and release authority stay with maintainers. A successful local build is not proof the same revision is live.

## Before a release

- Identify the exact reviewed revision and intended release scope. Exclude unrelated dirty/untracked work.
- Run `npm run check`, relevant unit/API checks and `npm run build`. Rebuild changed generated assets and validate their hashes. Record known failures explicitly.
- Review browser gameplay and affected mobile orientations; use two players for communication/presence changes. Record device/performance limits.
- Review schema changes, existing-data compatibility and migration recovery. Back up persistent data through the approved provider process before risky changes. Never use production for fixtures.
- Review sessions, ownership, input limits, uploads and secrets for affected endpoints. No credentials or private evidence in the release.
- Record existing Worker version and compatible rollback plan. Code rollback does not undo D1 changes.

## Cloudflare configuration

The public deployment is [worldfolk.world](https://worldfolk.world/game/). `scripts/prepare-cloudflare.mjs` reads build output and explicitly targets that domain, Worker, D1 database name and R2 media bucket. For a fork, change to resources/domain you control; do not reuse Worldfolk production resources. Preserve Durable Object migration tags and bindings.

With the correct account and existing resources:

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js whoami
npm run cloudflare:prepare -- <YOUR_D1_DATABASE_ID>
```

Review the generated `dist/server/wrangler.cloudflare.json` and pending migrations. The following are **production mutation steps for the release maintainer**, after that review:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 migrations apply DB --remote --config dist/server/wrangler.cloudflare.json
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js deploy --config dist/server/wrangler.cloudflare.json
```

Check resource existence and migration history first: older direct SQL setups may not have a ledger. Never blindly replay migrations over player data. TURN secrets are separately configured following the [voice guide](../voice-calls.md). Credentials remain outside the repository.

If authentication expires, follow [Cloudflare login troubleshooting](../cloudflare-login.md), using one fresh supported Wrangler login at a time. Do not disable OAuth state/PKCE checks or modify installed provider code.

## After release

Verify the live `/game/` loads, authenticated entry resumes at the intended place, map/model assets resolve, and affected features work. Confirm WebSocket/call behavior if changed. Record Worker version, release revision, migration changes, evidence and known limits. Update release notes only after verified publication. If rollback is needed, use the recorded compatible version and data recovery plan; do not promise that redeploying old code reverses schema/data changes.
