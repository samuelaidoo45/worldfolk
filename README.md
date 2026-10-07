# worldfolk

Worldfolk is a multiplayer 3D life simulation beginning in Accra, Ghana. Explore the city, meet players, work, shop, travel, and build a home. The app runs on [vinext](https://github.com/cloudflare/vinext) with Cloudflare D1.

## Deploy to your Cloudflare account

Build the app, create a D1 database in your Cloudflare account, and prepare a separate Worker configuration. The generated configuration leaves the Sites configuration intact.

The production Worker is live at [worldfolk.christianoronald567-039.workers.dev/game/](https://worldfolk.christianoronald567-039.workers.dev/game/). Its D1 database is `worldfolk-prod` (`46af10c4-77da-4be3-aae6-48b4d89ae86b`) in Cloudflare account `039c5077db7abd6f879e6f863c5e087e`. The initial three player records were copied on 7 October 2026. Browser sessions are bound to the old domain, so those players are not automatically signed in on the new address.

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js login
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 create worldfolk-prod
npm run cloudflare:prepare -- <database_id_from_create>
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 migrations apply DB --remote --config dist/server/wrangler.cloudflare.json
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js deploy --config dist/server/wrangler.cloudflare.json
```

Cloudflare returns the public `workers.dev` URL after deployment. Keep the D1 database and Worker in the same account. A fresh D1 database has no existing player records; migrate player data before directing existing players to the new host. Future deployments reuse the database ID above and apply only pending migrations before deploying. Do not run `d1 create` again for updates.

## Prerequisites

- Node.js `>=22.13.0`
- Portable: Windows, macOS, or Linux; no Bash required
- Managed Linux: managed Linux runtime with Bash, `flock`, `curl`, `sha256sum`, and GNU `timeout`
- Git is required only for publishing

## Sites Lifecycle

The Sites initializer copies the shared starter and selects managed-linux only when `SITES_MANAGED_LINUX_CONTAINER=1`; otherwise it selects portable. It saves the selection only in ignored `.sites-runtime/execution-profile.json`. Both profiles copy/configure first, then use the plugin's separate `install-dependencies.mjs` step to measure installation independently. Edit source under `app/` and follow the Sites skill for installation, preview, builds, and publishing.

Run `node <plugin-root>/scripts/configure-execution-profile.mjs` only when the profile is unknown for the current checkout and environment. Profile changes do not alter tracked source or require reinstalling otherwise-valid dependencies; restart an existing preview to use the new selection. Do not commit or upload `.sites-runtime/`.

This starter does not use `wrangler.jsonc`.

`install:ci` runs `npm ci` once against the shared lockfile, disables parent-workspace discovery, and includes required dev/optional dependencies despite production/omit settings. Sharp defaults to prebuilt binaries unless explicitly configured otherwise. Do not overlap installers.

- **Portable:** Preserve host HOME, npm cache, registry, proxy, temporary paths, retry/concurrency settings, and lifecycle-script policy. Use `--prefer-offline --no-audit --no-fund`.
- **Managed Linux:** Use the existing project-local HOME/cache/tmp setup and Linux install lock, tarball preflight, and timeout. Restore the image-seeded npm cache only when its lockfile hash matches; retain network fallback. Builds keep their existing timeout. These helpers are not invoked by the portable profile.

`scripts/sites-env.mjs` preserves the caller's HOME, npm cache, proxy, XDG, and temporary-directory configuration while defaulting Wrangler and Miniflare state to the checkout. If npm reports an unwritable cache, select a writable path with `npm_config_cache` for that install. The `dev` and `start` scripts also keep Wrangler logs inside the checkout. Generated `.sites-runtime/` and `.wrangler/` directories are disposable and ignored by Git.

On portable, `npm run dev` uses `vinext dev` with HMR, starting at port 5173. Vinext records the running server in ignored `.vinext/` state, rejects an ordinary duplicate launch, and recovers stale state after a stopped process; exactly simultaneous starts can race. Pass `--port <port>` or `--hostname <host>` after `npm run dev --` when needed; keep portable previews on loopback.

For browser QA on managed Linux, use `sites-preview start`. The project's dev script runs Vite and accepts the supervisor's `--host 0.0.0.0 --port 4173 --strictPort` arguments. The internal browser uses `http://terminal.local:4173/`; it is not a user-facing URL. The supervisor owns the preview lifecycle. The ignored local profile survives the supervisor's cleared process environment.

The portable profile simulates ChatGPT sign-in only for loopback development requests. Visit `/signin-with-chatgpt?return_to=/` to sign in as `local_seedy` (`seedy@sites.test`, display name `Seedy`) and `/signout-with-chatgpt?return_to=/` to sign out. The development cookie preserves that identity across server restarts. Mock auth is disabled in the managed-linux profile and is not included in production builds; hosted authentication remains dispatch-owned.

The Worker uses `vinext/server/fetch-handler`, including Vinext's config-aware image handling. After building, `npm start` runs that Worker locally through Wrangler on `127.0.0.1`, sharing `.wrangler/state` with dev preview and local D1 migrations; it does not deploy the site or simulate sign-in. Use the URL printed by the server. Pass `npm start -- --port <port>` to select a different built-preview port.

Local previews use Miniflare's placeholder `Request.cf` metadata without a network lookup. Set `CLOUDFLARE_CF_FETCH_ENABLED=true` to opt into fetching preview metadata; this setting does not change hosted request metadata.

Local tool usage metrics are disabled by default. Set `WRANGLER_SEND_METRICS=true` to opt in.

## Included Shape

- edit site code under `app/`
- `app/chatgpt-auth.ts` provides optional dispatch-owned ChatGPT sign-in helpers
- `.openai/hosting.json` declares optional Sites D1 and R2 bindings
- `vite.config.ts` simulates declared bindings for local development
- `db/index.ts` reads the D1 binding from the Cloudflare Worker environment
- `db/schema.ts` starts intentionally empty
- `@cloudflare/workers-types` provides Worker types; `cloudflare-env.d.ts` declares optional `DB`/`BUCKET` bindings—update these declarations if binding names change
- `examples/d1/` contains an optional D1 example surface
- `drizzle.config.ts` supports local migration generation when needed

## Workspace Auth Headers

Signed-in visitors receive both `oai-authenticated-user-id` and `oai-authenticated-user-email`. Private Sites require every visitor to sign in; public Sites may also have anonymous visitors, for whom neither header is present.

The user ID is stable for the same user on the same Site and different across Sites. Use it as the durable user key; use email and name for display or contact purposes.

SIWC-authenticated workspace sites may also receive `oai-authenticated-user-full-name` when the user's SIWC profile has a non-empty `name` claim. The full-name value is percent-encoded UTF-8 and is accompanied by `oai-authenticated-user-full-name-encoding: percent-encoded-utf-8`.

Treat the full name as optional and fall back to email when it is absent:

```tsx
import { headers } from "next/headers";

export default async function Home() {
  const requestHeaders = await headers();
  const userId = requestHeaders.get("oai-authenticated-user-id");
  const email = requestHeaders.get("oai-authenticated-user-email");
  const encodedFullName = requestHeaders.get("oai-authenticated-user-full-name");
  const fullName =
    encodedFullName &&
    requestHeaders.get("oai-authenticated-user-full-name-encoding") ===
      "percent-encoded-utf-8"
      ? decodeURIComponent(encodedFullName)
      : null;

  const displayName = fullName ?? email;
  // ...
}
```

## Optional Dispatch-Owned ChatGPT Sign-In

Import the ready-to-use helpers from `app/chatgpt-auth.ts` when the site needs optional or required ChatGPT sign-in:

- Use `getChatGPTUser()` for optional signed-in UI.
- Use the returned `userId` as the stable user key for user-owned records; do not use email as a durable identifier.
- Use `requireChatGPTUser(returnTo)` for server-rendered pages that should send anonymous visitors through Sign in with ChatGPT.
- In a Server Component, start sign-in with `<a href={chatGPTSignInPath(returnTo)} target="_top">`. The auth helper module is server-only; do not import it into a Client Component.
- Do not use `fetch`, XHR, a client-side router, or a framework link that can prefetch the sign-in route. SIWC must start as a top-level navigation.
- Never request the AuthAPI authorization endpoint directly. The dispatch-owned `/signin-with-chatgpt` route must start the SIWC flow.
- Use `chatGPTSignOutPath(returnTo)` for browser sign-out links or actions.
- Pass a same-origin relative `returnTo` path for the destination after sign-in or sign-out. The helper validates and safely encodes it.
- Mark protected pages with `export const dynamic = "force-dynamic"` because they depend on per-request identity headers.

Dispatch owns `/signin-with-chatgpt`, `/signout-with-chatgpt`, `/callback`, the OAuth cookies, and identity header injection. Do not implement app routes for those reserved paths. Routes that do not import and call the helper remain anonymous-compatible.

SIWC establishes identity only; it does not prove workspace membership. Use the Sites hosting platform's access policy controls for workspace-wide restrictions, or enforce explicit server-side membership or allowlist checks.

Use SIWC for account pages, user-specific dashboards, saved records, and write actions tied to the current ChatGPT user. Leave public content anonymous.

## Local D1 migrations

For a D1-backed local preview, generate SQL with `npm run db:generate`. Build once through the Sites skill's build entrypoint (or `npm run build` for standalone use) to generate `dist/server/wrangler.json`, rebuilding if bindings change. From the project root, apply each pending migration in order:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_example.sql
```

Replace the filename with the pending migration and `DB` with your D1 binding name if different. Use `.wrangler/state`, not `.wrangler/state/v3`; Wrangler adds the versioned directories. Do not replay migrations already applied locally. This updates only the preview database; publishing applies production migrations separately.

## Diagnostic Commands

- `npm run install:ci`: perform the one locked dependency install
- `npm run dev`: start the Vite/Vinext development server
- `npm run build`: build the deployable Sites artifact
- `npm run start`: preview the built Worker locally with D1/R2 support
- `npm run db:generate`: generate Drizzle migrations after schema changes

When using the Sites plugin, follow its skill instructions for installation, builds, and publishing. These npm commands remain available for standalone use.

The portable build runs Vinext directly without a host `timeout` command. The managed-linux build uses `scripts/build-verified.sh` and its existing `SITES_BUILD_TIMEOUT` setting.

## Learn More

- [vinext Documentation](https://github.com/cloudflare/vinext)
- [Drizzle D1 Guide](https://orm.drizzle.team/docs/get-started/d1-new)

## AccraLife world systems

- Street/scenic cameras: K; right mouse drag looks around. Shared fictional 48-minute day, weather every four minutes, crisp vector roads and building façades.
- Forward driving has acceleration and braking without a fixed speed cap. Impacts above 8 m/s cause health damage; fatal impacts and starvation allow a home restart that keeps possessions. Recover inside your own home from My life → Bag. Needs pause after more than 90 seconds without a vital update.
- T requests taxi or tro-tro pickup near your current location. Fares use direct distance; the server obtains the road route from Mapbox and saves the journey. Nearby matching tro-tro bookings can share a ride chat. These are game services, not real transit schedules.
- Passenger controls offer a transparent 3D cabin, left/front/right/exterior views, NPC conversation and an original synthesized radio soundtrack. Radio starts only on tap.
- New registrations receive a random saved background, starting location, wallet, household and garage. Existing characters retain their progress.
- Taxi jobs require driving from Airport City to Oxford Street and parking before payment. Teaching, coding, retail and food-service jobs are timed shifts. My life → Leisure lists recreational destinations.
- Opt-in WebRTC voice circle supports six people, starts muted, B is push-to-talk, with individual mute and Leave controls. Signaling uses authenticated, recipient-scoped D1 records with a 60-second delivery window. No voice recording. STUN is configured; restrictive networks need a TURN relay before universal connectivity can be promised.

Run local integration tests **sequentially** because fixture helpers share the preview SQLite database with the running dev server:

```sh
node --test --test-concurrency=1 tests/game-motion.test.mjs tests/life-api.test.mjs tests/world-api.test.mjs
```

The tests cover collision sweeps, frame-rate independence, no forward speed clamp, home permissions, purchase/wage atomicity, death/restart, timed fares/journeys, and voice-session isolation. Browser verification covers day/night/rain, a full tro-tro journey including reconnect, restart at home, and two WebRTC participants using synthetic silent tracks (no microphone access).

## District architecture and street safety

- Real Mapbox/OSM footprints receive stable, procedural façades: plaster, painted houses, brick, verandas, apartments, shopfronts, offices, coastal and heritage styles. Nearby roofs gain pitched forms, water tanks, rooftop equipment or venue details. These are game interpretations, not surveyed textures or authentic interiors.
- Makola/Kaneshie, Osu, La coast, Jamestown, Airport City and Legon have distinct palettes and street props. Markets, beaches, churches and mosques open different explorable scenes. Holy Trinity Cathedral and Ghana National Mosque are included as destinations; venue coordinates are approximate.
- Recorded Mapbox Satellite imagery streams through the map tile renderer as the camera moves. Press L to switch aerial imagery off/on. This is not a live camera feed; detail depends on available source imagery and network conditions.
- Pedestrians follow road edges and avoid motorway/trunk routes. Walking navigation uses Mapbox walking directions and automatically recalculates for driving after entering a vehicle. Road warnings identify carriageways. Ambient traffic can injure pedestrians; fast highway impacts can be fatal. Health and restart state persist with duplicate impact protection. Ambient traffic is a local simulation.
- Verification: 13 sequential automated tests, TypeScript check, source diff check; local browser inspection of varied façades, streamed satellite tiles, all four venue scenes and route UI.

Map sources: [Mapbox Satellite](https://docs.mapbox.com/data/tilesets/reference/mapbox-satellite/). Venue references: [Holy Trinity Cathedral](https://www.wikidata.org/wiki/Q9710080), [Ghana National Mosque Complex](https://www.arc.gov.gh/portfolios/ghana-national-mosque-complex/).

## Live rooms and mobile controls

Movement uses authenticated Cloudflare Durable Object WebSockets at `/api/realtime`.
Players join their geographic district (roughly 2 km cells, at most 128 live sockets).
Rooms validate movement, broadcast nearby player updates, checkpoint to D1 every
60 seconds and on clean disconnect, and flush live position before game actions.
Optimistic revision checks prevent a delayed movement save overwriting newer progress.
Economy, inventory, property access, chat history and voice signaling remain D1 backed.
The client reconnects with backoff, suspends its socket in the background, and uses
HTTP movement when live rooms are unavailable. World polling is every 15 seconds;
a lean chat request runs every 3 seconds while chat is visible. This is a bounded
realtime foundation, not a million-concurrent-player capacity certification. D1
sharding, global chat/voice scaling, overflow admission and load tests remain needed
before that scale. No monetary billing ceiling is enforced by this update.

The Worker exports `WorldRoom`; Vite includes the `WORLD_ROOMS` binding and the
`world-rooms-v1` SQLite Durable Object migration. `cloudflare:prepare` preserves
these bindings when producing the standalone Cloudflare deployment configuration.
Reuse the existing production D1 database when deploying.

Touch devices use landscape thumb controls, safe-area insets, run/brake buttons,
drag-to-look, and a compact menu. Portrait gameplay shows a rotation prompt.
Fullscreen/orientation locking is requested only from a user gesture and is best
effort; unsupported browsers still work after physically rotating the device.

With the built local server running on port 3000, run:

```sh
node --test --test-concurrency=1 tests/game-motion.test.mjs tests/life-api.test.mjs tests/world-api.test.mjs tests/realtime-api.test.mjs
```

Pickup verification: `node --test --test-concurrency=1 tests/*.test.mjs` against the local Wrangler server checks random starting lives, vehicle ownership, persisted pickup routes, shared tro-tros, duplicate arrival protection, affordability, and the new jobs. Integration fixtures modify local SQLite only.
