# Testing and verification

## Offline checks

```sh
npm run check
npm run test:unit
```

`check` validates local link targets in the maintained contributor documentation and runs a curated offline smoke suite. It covers session handoff/synchronization, input stability, activity navigation, audio/notifications, gait, voice peer behavior, traffic, render preparation and the latest Castle/Asomdwe package. It is a fast regression signal, not the full product acceptance suite.

`test:unit` discovers `tests/*.test.mjs`, excluding `*-api.test.mjs` and the legacy live `multiplayer-capacity.test.mjs`, and runs them with bounded file concurrency. Some tests read committed generated data or build models in Node. Install dependencies and retain the generated map/model assets first. No live API is started by this command. To run a smaller relevant selection:

```sh
node --test tests/castle-asomdwe.test.mjs tests/precinct-navigation.test.mjs
```

Rebuild generated assets when their source changes:

```sh
npm run assets:lods
node --test tests/render-lod-assets.test.mjs
npm run build
```

Location-specific offline layout builders are listed in the corresponding realism brief. Do not rebake unrelated map data as part of a small code change.

## API checks: disposable local state only

API fixtures create accounts and may write directly to local SQLite. Several need Python 3 and assume `.wrangler/state`. Run them serially against disposable local data after the full schema is initialized. Do not run against a production account or a shared developer's saved world.

With the built preview on port 3001:

```sh
npm run test:api -- tests/auth-api.test.mjs
npm run test:api -- tests/independence-neighbourhood-api.test.mjs
```

The wrapper defaults `GAME_TEST_URL` to `http://127.0.0.1:3001` and refuses non-loopback targets. For a different local preview, set `GAME_TEST_URL` in your shell, for example on macOS/Linux:

```sh
GAME_TEST_URL=http://127.0.0.1:3002 npm run test:api -- tests/independence-neighbourhood-api.test.mjs
```

On PowerShell set `$env:GAME_TEST_URL = 'http://127.0.0.1:3002'` first. The API wrapper accepts only named `*-api.test.mjs` files that already read this variable. Legacy fixtures, including some notification, chat and realtime tests, hard-code port 3000/3001 or older registration behavior. They are not included in default CI; migrate them as scoped tasks before relying on a single all-API command. Never assume that setting an environment variable changes a hard-coded fixture.

## Browser review

Automated unit/build checks cannot verify camera composition, asset appearance, touch responsiveness or GPU context health. For a changed feature record:

- Browser, OS, device, viewport/orientation and quality mode.
- Reproduction steps, route/camera and expected/observed behavior.
- Before/after screenshot or short recording for visual/animation/input changes.
- Console errors without credentials/private data.
- Collision/access result: arrival, approach, interaction start/stop, return/exit and resume.
- Two-player behavior when the feature affects presence, chat, calls or shared activities.

HTML fixtures under `tests/fixtures/` isolate model inspection; their lighting, camera and shadow setup can differ from gameplay. Label fixture captures accurately. Use the running game for full interaction acceptance.

## Performance

Follow the [phone benchmark](../realism/mobile-performance-benchmark.md). Record startup and streaming spikes as well as sustained frame time. Compare p50/p95/p99 frame duration and long frames on the same device/route; include resolution, draw/geometry counts and resident resources where available. Desktop emulation is not a physical-phone result. Existing frame-time spikes remain open work.

## CI scope

The contributor workflow installs locked dependencies, runs documentation/smoke checks and builds on Node 22. It has read-only repository permissions, does not use provider secrets and does not deploy. Broader unit/API/browser/device acceptance remains explicit work; inspect any failed check instead of weakening a test to merge.

## Current broad-suite baseline

On 21 October 2026, the offline suite ran **513 tests: 507 passed, six failed**. The contributor smoke suite passed **75/75**, and the production build passed. The six failures are listed as WF-016 through WF-021 in the [roadmap](../roadmap.md); they remain failing in `test:unit` and are not silently skipped. CI currently gates the narrower smoke suite and build. Local verification is not a completed GitHub Actions run.
