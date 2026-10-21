# Worldfolk: instructions for coding agents

These instructions apply throughout this repository unless a more specific `AGENTS.md` applies to the files being changed. Follow the current user's request and your system/tool policies first. `CLAUDE.md` points to this shared guide; keep project rules here instead of maintaining conflicting copies.

## Start with the recorded context

1. Read [README.md](README.md) for the product and its current limits.
2. Read [docs/project-context.md](docs/project-context.md) for established product decisions, recent work and how to resume a task.
3. Read [CONTRIBUTING.md](CONTRIBUTING.md), [architecture](docs/architecture.md) and the relevant [engineering standards](docs/contributing/standards.md).
4. Inspect `git status --short --branch`, applicable local instructions, and the source/tests for the requested area. Preserve unrelated and uncommitted work.
5. Locate the relevant `WF-*` engineering task or `ACC-*` place record in the [roadmap](docs/roadmap.md) / [coverage inventory](docs/realism/coverage-work-items.csv). Read its evidence and next action before assuming what “next” means.

Repository context is a curated handoff, not access to a previous developer's private chat. Do not claim to remember conversations you cannot read. If a request depends on an unresolved choice, inspect the recorded decisions first and ask a focused question only when necessary.

## Product and stack

Worldfolk is a browser multiplayer life simulation starting with Accra, Ghana. It combines real geography, authored city models, transport, professions, persistent player lives and social play. Recognizable places, playable access and efficient rendering are all requirements. A footprint, themed room or attractive screenshot alone does not finish a location.

- Game client: JavaScript ES modules under `public/game/`; Three.js/WebGL and MapLibre.
- Application/API: TypeScript, React, Vinext/Vite and Cloudflare Workers.
- Persistence: D1/SQLite; uploaded media uses R2.
- Multiplayer: authenticated WebSockets and Durable Objects for sessions, district allocation and bounded rooms.
- Voice: authenticated signaling and WebRTC; optional TURN credentials stay server-side.
- Maps: self-hosted OSM data, search indexes and routing graph. Runtime must not reintroduce Mapbox or public OSM service dependencies.
- Original code/docs: Apache 2.0. OSM, vendored code, models, materials and logos retain separate rights/notices.

Do not replace this stack or rename deployment/package identities as a cosmetic cleanup. Propose a measured, scoped migration if a task actually requires one.

## Useful code boundaries

| Area | Starting points |
| --- | --- |
| Boot, state, controls and menus | `public/game/app.js`, `account.js`, `city-welcome.js` |
| Scene, camera and streaming | `public/game/world3d.js`, `chase-camera.js`, `world-streaming.js`, `render-preparation.js` |
| City packages and access | `public/game/city-landmarks.js`, named `*-data.js` / renderer modules, `precinct-navigation.js` |
| Destinations, map and routes | `public/game/place-search.js`, `city-destinations.js`, `osm-routing.js`, `server/maps/` |
| Jobs, homes, transport and purchases | `public/game/life-catalog.js`, `work-catalog.js`, `transit.js`, `app/api/game/` |
| Accounts, communication and uploads | `app/api/`, `server/player-session.ts`, `passwords.ts`, `community-validation.ts` |
| Live sessions and movement | `server/realtime.ts`, `world-routing.ts`, `world-room.ts` |
| Schema and generated data | `db/schema.ts`, `drizzle/`, `scripts/maps/`, `scripts/realism/`, `scripts/assets/` |

Client filenames in a row are under `public/game/` unless a different directory is specified. See [architecture](docs/architecture.md) for the data flow.

## Local work and verification

Use Node **22.13.0+** and npm. Read [local setup](docs/development.md) before changing an existing environment. Cloudflare/GitHub login is not required for ordinary local development.

| Command | Use |
| --- | --- |
| `npm run doctor` | Check local prerequisites/assets. |
| `npm run install:ci` | Install locked dependencies when needed. |
| `npm run build` | Build Worker/static output after application/config/runtime-asset changes. |
| `npm run db:setup` | Initialize **fresh** local state only; never use it to repair an existing database. |
| `npm run start -- --port 3001` | Preview the built Worker locally. Reuse an existing preview where appropriate. |
| `npm run dev` | Hot-reload development; see the setup guide for its port/state. |
| `npm run check` | File-safety guard, contributor documentation links and offline smoke tests. |
| `npm run test:unit` | Broader offline checks; known failures are tracked in the roadmap. |
| `npm run test:api -- tests/auth-api.test.mjs` | Explicit supported API fixture against disposable loopback state. |
| `npm run security:check` / `npm run security:history` | Redacted file/full-history scans; requires Gitleaks or `GITLEAKS_BIN`. |

Choose checks for the concrete change. Run focused regressions for behavioral changes; do not add implementation-mirroring tests for a prose edit. A documentation-only change needs documentation/safety checks, not a new production build. Report commands, results and verification gaps accurately.

API fixtures may create accounts and write SQLite directly. Read them first; do not run them against production, a saved developer account or concurrently against shared local state. Some legacy fixtures have hard-coded ports/old guest assumptions; the wrapper rejects unsupported ones. Never delete `.wrangler/state` or replay existing migrations to get a test green.

## Editing and compatibility

- Prefer `rg`/`rg --files` for discovery. Read the actual module and adjacent tests before editing.
- Make bounded changes with readable named functions. Match existing interfaces; avoid mass formatting, directory moves or unrelated dependency updates.
- Keep stable IDs and `[longitude, latitude]` conventions. Document model axes, headings and metre units.
- Keep server validation authoritative for sessions, ownership, money, work, travel and movement. Preserve revision/checkpoint rules so stale responses cannot reset newer positions.
- Treat current player-selected cameras, saved rest states and persistent activities as state to preserve, not reset opportunities.
- Add new SQL migrations with reviewed schema changes; do not rewrite released SQL history or silently discard player records.
- Generated maps/layouts/LOD catalogs are rebuilt from their builders and inputs. Never hand-edit generated hashes or relax budgets just to pass checks.

## City realism and performance

Follow the [place workflow](docs/contributing/places.md). For a changed location:

1. Define the native source IDs, geographic bounds and a connected exterior/approach scope.
2. Obtain real references; record exact URLs, credit/rights, capture date separately from publication date, and remaining gaps in the [reference register](docs/realism/reference-images.json).
3. Preserve native contours/holes and suppress generic geometry only for owned records. Keep roads, entrances and public routes clear.
4. Match visible obstacles to collision and walkable stairs/platforms to shared elevation rules. Check arrival → approach → activity → explicit stop → return/exit.
5. Prepare expensive clipping/layout offline, filter/cache local collision candidates, share/dispose GPU resources, and preserve landmark identity in distant models.
6. Rebuild affected outputs/LODs, verify hashes and budgets, and record comparable gameplay/model evidence. Distinguish fixture lighting from the actual game.

Do not invent a hidden facade/interior or claim a private area is publicly accessible. Research imagery is not a texture licence. No extra GPU contexts, lights, shadow passes, unbounded crowds or frame-loop survey work without measured justification. Geometry limits are not proof of smooth FPS. Physical-phone acceptance and frame-time spikes remain separate work; see the [benchmark](docs/realism/mobile-performance-benchmark.md).

## Security and repository operations

- Follow [SECURITY.md](SECURITY.md) and the [publication audit](docs/security-audit.md). Never copy credentials, recovery codes, cookies, private chat, personal uploads or raw private conversation into docs, code, logs or PRs.
- Keep `.env*`, `.dev.vars`, `.wrangler/`, `.sites-runtime/`, `.cache/`, SQLite/HAR/private-key files and new review artifacts out of Git. Placeholder `.example` files are allowed, but real values are not.
- Public project IDs, map coordinates and binding names do not grant access; protect the credentials and authorization boundaries instead of breaking configuration to hide identifiers.
- Git history was sanitized on **21 October 2026**. Do not restore old refs, merge pre-cleanup clones or publish a recovery bundle. Ask the maintainer before any further history rewrite or force push.
- Do not commit, push, deploy, alter repository visibility or change provider/account permissions unless the current task authorizes that action. Prior release requests are not blanket authorization for a new task.
- Deployment is a maintainer operation; release requests and any pauses are recorded in the project context. Do not start login/deploy flows merely to verify local work. Follow [release guidance](docs/contributing/releases.md) when deployment is explicitly requested.

## Finish with a useful handoff

Summarize what changed, why, exact verification results, risks/gaps and the next bounded action. Keep implemented, locally verified, committed, pushed, deployed and complete distinct. Never claim city-wide photorealism, smooth phone performance or million-player capacity without evidence.

Update the relevant task/inventory/brief and [implementation log](docs/realism/implementation-progress.md) for substantive city work. Update [project context](docs/project-context.md) when a durable product decision or active handoff changes. Keep context concise, dated and linked to evidence; do not paste chat transcripts or accumulate stale instructions.
