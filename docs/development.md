# Development and deployment

For the project overview and getting-started guide, see the [README](../README.md).

## Local setup

Requirements: Node.js >=22.13.0 and npm. Clean checkouts default to the portable
execution profile on macOS, Windows and Linux. No Codex or ChatGPT login is required
to play Worldfolk or run its own account system.

```sh
npm run install:ci
npm run build
```

The build generates `dist/server/wrangler.json`. The project's Vite configuration
provides local D1, R2 and Durable Object bindings. There is no source
`wrangler.jsonc` to edit. Generated local runtime state is ignored by Git.

### Initialize the local database

On a **fresh local database**, apply every SQL migration in `drizzle/` in ascending
filename order, starting with `0000_clear_nomad.sql` and continuing through the
latest numbered file. For each file, run the command below with its filename:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_clear_nomad.sql
```

This example applies only the first migration. The account, voice, social and other
systems require the later migrations too. Do not replay already-applied SQL against
an existing local database; these direct `execute` commands do not maintain a
Wrangler migration history. Keep local state in `.wrangler/state`, not
`.wrangler/state/v3` (Wrangler adds that suffix).

### Run the game

```sh
npm run start -- --port 3001
```

Open `http://127.0.0.1:3001/game/`. Register local test accounts; local data is
separate from production. `npm run start` previews the built Worker and does not
deploy it. Rebuild after changes; restart the preview if rebuilt static assets are
not picked up correctly.

For development with hot reload, use `npm run dev` (default port 5173) after database
setup. Preview and development share `.wrangler/state`.

## Checks

A focused set that does not need a running API server:

```sh
node --test tests/game-notifications.test.mjs tests/game-audio.test.mjs tests/precinct-life.test.mjs tests/precinct-navigation.test.mjs tests/human-gait.test.mjs
```

With the built preview running on port 3001:

```sh
node --test tests/notifications-api.test.mjs
```

API/integration tests create or modify local fixtures. Read individual test files
before running a broader suite: some assume port 3000, some port 3001, and some use
Python/SQLite to manage fixture state. Never point them at production.

`npm run build` checks that the deployment can be produced. Browser reviews of
movement, rendering, responsive controls and multiple-player interaction complement
the automated checks; a passing build alone is not a gameplay or capacity test.

## Deploy to Cloudflare

The maintained public deployment is [worldfolk.world](https://worldfolk.world/game/).
Standalone deployment uses `scripts/prepare-cloudflare.mjs`, which reads the built
Worker configuration and emits `dist/server/wrangler.cloudflare.json`.

**For a different account or domain**, first adapt that script's Worker name, domain
routes, database name and R2 bucket name. The checked-in script targets the existing
Worldfolk domain. Create your own D1 database and R2 bucket, keep them in the same
account as the Worker, and preserve the Durable Object bindings/migrations generated
by the build. Do not reuse someone else's production resources.

For an account with the matching resources configured:

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js login
npm run cloudflare:prepare -- <YOUR_D1_DATABASE_ID>
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 migrations apply DB --remote --config dist/server/wrangler.cloudflare.json
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js deploy --config dist/server/wrangler.cloudflare.json
```

Review pending migrations before applying them. Updates reuse the existing database;
creating a new database does not carry over player progress. The R2 bucket must exist
before deployment. Credentials and provider secrets stay outside tracked source.

Private calls can work directly over WebRTC; configure the TURN secrets described
in [voice-calls.md](voice-calls.md) for relay support across restrictive networks.
Map assets are already included for Accra. See the [map build guide](../scripts/maps/README.md)
when changing coverage or updating the OSM extract. No Mapbox token is needed.
