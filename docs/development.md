# Local development

[Overview](../README.md) · [Contributing](../CONTRIBUTING.md) · [Architecture](architecture.md) · [Tests](contributing/testing.md)

## Requirements

- Node.js **22.13.0 or newer** and npm. `.nvmrc` selects the Node 22 line; `nvm use` is optional.
- A modern browser with WebGL for gameplay. A terminal alone can run most unit checks.
- Python 3 for the API fixtures and city-data generation. Map extraction additionally needs the packages in the [map build guide](../scripts/maps/README.md).
- Git. Cloudflare credentials are **not required** for local gameplay or offline tests.

Clean checkouts use the portable execution profile on macOS, Windows and Linux. No Codex or ChatGPT account is required. Commands below run from the repository root. Existing generated map/game assets are included; do not download a new OSM extract just to start development.

## Fresh checkout: install, build, initialize, play

```sh
git clone https://github.com/samuelaidoo45/worldfolk.git
cd worldfolk
npm run install:ci
npm run doctor
npm run build
npm run db:setup
npm run start -- --port 3001
```

Open **http://127.0.0.1:3001/game/**. Choose a place, register a local test account and enter the world. Use separate accounts for multiplayer testing. Local data is separate from production.

`db:setup` applies **all** SQL files through Wrangler's local migration system to a fresh `.wrangler/state` database. It refuses to touch a directory containing an existing game SQLite database. It never applies remote migrations. The build emits `dist/server/wrangler.json`; no source `wrangler.jsonc` is required. The setup helper writes only an ignored `.sites-runtime/local-db.json` migration configuration and local state.

`npm run start` previews the built Cloudflare Worker; it does not publish. Rebuild after source changes and restart the preview if assets remain stale.

### Existing local databases

**Do not rerun initialization or delete your state to solve a schema error.** Earlier checkouts applied SQL directly without recording a Wrangler migration ledger. Make a backup with the preview stopped; review which migrations are already present before applying only missing SQL. The fresh setup helper intentionally stops on an existing database, even one initialized with a ledger. Ask a maintainer if the schema history is unclear.

For a reviewed, missing migration only:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/REVIEWED_MISSING_MIGRATION.sql
```

Replace the illustrative filename with the actual missing SQL file. Direct `execute` does not update the migrations ledger. Keep this path separate from fresh initialization. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler supplies the version suffix itself. No reset command is provided.

### Hot reload

After the database is initialized:

```sh
npm run dev
```

The portable default is **http://localhost:5173/game/**. Development and built preview use `.wrangler/state`; avoid concurrent mutation-heavy test suites against that same state. Use a consistent hostname/port for browser sessions and origin checks. You can choose a development port with `npm run dev -- --port 3001`.

## Configuration

| Setting | Location | Local requirement |
| --- | --- | --- |
| D1 `DB`, R2 `BUCKET`, room/session/allocator bindings | `vite.config.ts`, generated Worker config | Provided by local emulation. |
| Site identity / D1 binding name | `.openai/hosting.json` | Keep existing identity; do not replace it for ordinary contributions. |
| Map coverage and client presentation | `public/game/config.js` | Existing self-hosted Accra assets work without a Mapbox token. |
| Optional TURN credentials | Worker secrets; local `.dev.vars` | Only for relay testing; see [voice guide](voice-calls.md). |
| Execution profile and provider runtime state | `.sites-runtime/`, `.wrangler/` | Generated/ignored; not shared source. |

Copy `.dev.vars.example` to `.dev.vars` only when adding your own optional TURN credentials. Do not copy production secrets or place server secrets in `public/`. Ordinary local registration, game state and maps need no `.env` file. Local mock Sites authentication does not replace Worldfolk's own player sessions.

The npm package still carries its internal starter name to preserve the Worker/local binding identity. Renaming it requires a separate migration/release review; product documentation and repository metadata use Worldfolk.

## Everyday commands

| Command | What it does |
| --- | --- |
| `npm run doctor` | Check Node, required local assets/tools and build availability; read-only. |
| `npm run check` | Contributor documentation link targets plus the offline smoke suite. |
| `npm run test:unit` | Offline test files, excluding API fixtures and the legacy live capacity suite. |
| `npm run test:api -- tests/auth-api.test.mjs` | One explicitly selected, compatible API suite on a local preview. |
| `npm run assets:lods` | Rebuild versioned distant-model assets/catalog after relevant source changes. |
| `npm run build` | Produce the deployable Worker/static output. |
| `npm run db:generate` | Generate schema migration changes; inspect SQL before applying. |
| `npm run lint` | Existing repository lint command; broad legacy formatting/type debt is tracked separately. |

See the [testing guide](contributing/testing.md) for prerequisites, test isolation and the distinction between smoke checks and full acceptance. Do not run all API fixtures together against your saved player database.

## Troubleshooting

| Symptom | Next step |
| --- | --- |
| Missing package / native dependency | Confirm Node version, then rerun the supported `install:ci` wrapper. Keep the lockfile. |
| Missing `dist/server/wrangler.json` | Run `npm run build` successfully before `start` or `db:setup`. |
| `no such table` | Check all SQL migrations were applied to the same persistence directory. Follow the existing-data guidance above. |
| Port occupied | Pick another port; align `GAME_TEST_URL` for supported API tests. |
| Stale place/model | Rebuild affected generated data and LOD assets, then build and refresh the preview. |
| `EMFILE: too many open files, watch` | The map asset tree can exceed file-watcher limits, particularly with multiple previews. Stop extra previews and report the platform/limits; the API may start despite watcher errors, so do not mistake that for a clean preview. |
| WebGL/context loss | Check hardware acceleration and other GPU-heavy tabs. Capture browser/device details; a passing build does not verify GPU health. |
| Calls connect only on some networks | Use two accounts/devices, grant microphone access, check TURN relay configuration. |
| Login succeeds but no saved session | Keep one origin/port consistent and check cookies; report the request status without sharing the cookie. |

## Deployment

Deployment is a maintainer operation with real infrastructure access. Follow the [release checklist](contributing/releases.md). CI checks do not deploy. The existing preparation script explicitly targets `worldfolk.world`; forks must change their own domain/resource configuration before using it. Build output, source history and live production may differ until a maintainer releases a verified revision.
