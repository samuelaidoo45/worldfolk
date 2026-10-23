# Browser main-thread performance — 21 October 2026

Related task: **WF-001, partial**. Deployed on 21 October 2026 at 17:46 UTC as Worker version `2d9b2cb9-e773-429f-9342-cd5c7c90d94c`; source changes remain uncommitted and unpushed. This follows the [simulation CPU work](simulation-performance.md) and addresses both entry/loading stalls and repeated gameplay CPU work. Full-game GPU/frame timing and physical-phone acceptance remain open. See the [release handoff](../project-context.md) for build identity, verification and rollback.

## Changes

- Authored building colliders cache conservative geographic bounds. Camera probes skip distant polygons before exact ring/height/penetration checks. Camera positions and damping are unchanged.
- Facade selection rejects distant footprints, then ranks and caps candidates before calculating their styles. The same closest 100/190 footprints, place matches, materials and contours are retained.
- The minimap prepares bounds/styles with each tile snapshot and skips offscreen geometry before projecting vertices. Holes, crossing roads, stroke margins, paint order, routes and player markers remain intact.
- **34 static authored landmark packages** now construct their full near geometry in one dedicated module worker. Geometry, signs, texture settings and transforms transfer to the existing renderer; PBR/procedural materials rejoin the main-thread shared caches. No extra game WebGL context is introduced.
- Only one construction job runs at a time. Travel cancellation terminates obsolete work; stale messages/errors cannot replace a newer model. Partial failures release resources. Unsupported or failed workers use the original factory through the existing preparation queue. Dynamic landmarks keep their original behavior paths.

This changes where construction runs, not the number of vertices in these near models. Geometry upload, shader compilation, shadows and actual GPU rendering still happen on the main rendering path. Worker startup/packing can increase elapsed time until a model is ready while allowing animation/input to continue.

## Repeatable CPU measurements

Host: macOS arm64, Node **v22.23.2**. Baseline: `3bbabfd`; after: these local changes. Same fixed inputs on the same host, no concurrent build during captures. Timings are milliseconds, not FPS.

| Work | Repeated p95 before | Repeated p95 after | Scope |
| --- | ---: | ---: | --- |
| Camera clearance, Polo | 1.838 | 0.188 | 3,600 repeated poses |
| Camera clearance, mall interchange | 2.495 | 0.333 | 3,600 repeated poses |
| Camera clearance, Independence Square | 0.119 | 0.044 | 3,600 repeated poses |
| Facade refresh, mall | 18.237 | 3.325 | 20 refreshes after 5 warmups |
| Facade refresh, airport | 23.761 | 3.986 | 20 refreshes after 5 warmups |
| Facade refresh, square | 22.351 | 3.783 | 20 refreshes after 5 warmups |
| Minimap update, three runs | 0.745–0.752 | 0.375–0.390 | Each: 1,200 updates after 300 warmups |
| Minimap cached update only | 0.693–0.706 | 0.059–0.093 | Same runs, no geometry refresh |

Camera/facade fixtures use 961 native building features plus authored colliders; facade matching uses 136 places. Every camera-pose checksum and facade-output checksum matched the corresponding baseline. Minimap uses 791 roads, 687 buildings, 69 land-use features and one water feature at a simulated 5 Hz with normal snapshot expiry. Across measured updates per run, projected canvas points fell from **12,474,158 to 1,656,598**; source reads stayed at **436**. The current minimap script includes road-cache expiry work; earlier ad-hoc timings with a wall-clock cache are superseded by this table.

These fixtures exclude actual MapLibre queries, GPU/rendered frame intervals, network and canvas rasterization. They verify lower CPU costs and equivalent decisions, not overall smooth gameplay.

```sh
npm run benchmark:camera
npm run benchmark:facades
npm run benchmark:minimap
```

Use the corresponding `node scripts/benchmarks/*.mjs` commands for raw JSON without npm banners. Save private captures only under ignored `review-artifacts/`.

## Actual browser construction comparison

Native Google Chrome on the same macOS host, clean Incognito test window, local static HTTP server, six alternating valid runs (worker, original, repeated three times). The test tab remained focused; no builds ran during the captures. This is a **model-construction animation fixture**, not the complete game. The observed animation cadence was about 33 ms; it does not establish 60 FPS.

| Path | Longest animation interval in each run | Villaggio construction / hydration |
| --- | --- | --- |
| Original synchronous factories | 399.9 / 433.6 / 400.5 ms | 406.1 / 453.8 / 422.0 ms on main thread |
| Worker factories | 34.2 / 34.3 / 34.3 ms | 6.6 / 0.9 / 1.0 ms main-thread hydration |

Worker Villaggio elapsed completion time was 625.7 / 592.4 / 590.4 ms, including worker startup, construction, packing and transfer. The animation continued for 17–18 frames during each build; the original factory blocked it for the build. Mirage and Polo Heights were also built in every run: worker main-thread hydration was 0.1–2.6 ms, versus 151.4–180.7 ms synchronous construction. These numbers do not include GPU upload or shader preparation.

An earlier ordinary-window run was interrupted by tab switching and is **not comparable**. The harness now marks focus/visibility interruption invalid and retains raw long gaps instead of hiding them.

Reproduce without accounts or API writes:

```sh
python3 -m http.server 3014 --bind 127.0.0.1 --directory public
```

Open <http://127.0.0.1:3014/game/benchmarks/static-landmark-worker.html>. Alternate **Run worker construction** and **Run main thread comparison** three times. Keep the browser focused. The table separates elapsed build, packing, hydration and animation frames; expand the full JSON for interruption reasons. Use the same browser/cache/power/thermal conditions for comparison.

## Appearance and correctness

The optional [one-canvas comparison fixture](../../public/game/benchmarks/static-landmark-visual.html) renders worker and original Villaggio with identical cameras/lights. Native Chrome checks of two viewing angles retained the same silhouettes, window grids, roof colors and materials. Both contained **11 meshes, 516,580 vertices, one sign texture and identical bounds**. Release was verified to dispose both models and the test WebGL context. This is fixture lighting, not a screenshot of gameplay.

Offline round-trip tests cover all 34 static packages, exact arrays/material properties, sign pixels/orientation, shared texture ownership, cancellation, stale errors, failed reconstruction cleanup and fallback. Review caught and corrected map-dependent material values omitted by Three.js JSON serialization (especially roof `bumpScale`); an explicit physical-material regression now covers those values. Dynamic update closures are excluded from the worker allowlist.

New CPU regressions compare camera collision, penetration, facade selection and minimap output with their original calculations. They include long/crossing edges, holes, all camera modes, replacement tile snapshots and explicit place IDs. Timings have no machine-specific pass thresholds.

Final local verification: `npm run check` passed the file-safety guard, maintained documentation links and **99 smoke tests**. **30 additional tests** passed for generated LODs, PBR streaming, graphics quality and the gameplay benchmark recorder. `npm run assets:lods` rebuilt 45 static and two civilian LODs; geometry artifacts stayed unchanged and the PBR source hash was regenerated. `npm run build` and `git diff --check` passed. The six broader-suite issues were not re-run or hidden by these checks.

## Remaining work

1. Run the [full-game benchmark](mobile-performance-benchmark.md) with a registered test profile on the same rendered mall–airport route: cold entry, settled movement, driving and rapid travel. Record p50/p95/p99, long tasks, GPU work, memory and actual input response.
2. Profile dynamic landmark/actor creation, shader/texture startup and MapLibre tile parsing. These can still stall or dominate total loading time. Move another package only after proving its behavior survives transfer; do not silently drop callbacks.
3. Measure worker and main-thread memory across repeated travel. One worker/job is bounded, but total browser memory has not been established by the fixture.
4. Run the deferred physical-phone protocol, including warm-device and portrait/landscape cases. No phone performance claim is supported yet.

The existing six broader-suite issues WF-016–WF-021 remain separate. This patch does not complete WF-001 or WF-002.


## Full-game diagnostic follow-up — 23 October 2026 (local)

The opt-in recorder now exports schema 2 with separate custom-layer CPU phases for preparation, camera, players, streaming, crowd, effects and rendering. Startup/settled distributions preserve spikes and ignore missing timings. Frame snapshots and phase collection run only during an active capture. Live progress uses elapsed time rather than repeatedly sorting all recorded samples; full distributions are calculated at completion/export. Hidden-page captures stop immediately, and empty captures cannot claim validity.

A signed-in native Chrome run reached Accra Mall on the deployed schema-1 build. The saved report was **invalid**: `Page was hidden or phone locked` and `No rendered frame at the end of the capture`; only 79 settled intervals were recorded. Its 117.8 ms p95 / 626.8 ms maximum interval and 3.9 ms CPU-submission p95 are diagnostic observations, **not a comparable benchmark or proof of the cause**. Chrome showed Energy Saver enabled at entry. Native control/snapshot interruptions prevented reliable route/input verification; the apparent stalled screen must not be reported as a proven game deadlock. No valid before/after gameplay, GPU-time or physical-phone result was obtained.

The local capture changes passed 11 focused recorder/preparation tests. The 99-test smoke suite and production build passed during this follow-up; final build/check results are recorded in the handoff. Keep WF-001 open. Next: capture an uninterrupted local schema-2 run and a browser performance trace on the same mall–airport route before selecting another rendering-quality tradeoff. Raw reports remain in ignored review artifacts, not the public repository.


## Bounded ambient model construction — 23 October 2026 (local)

Code inspection found that `setAmbient` eagerly constructed every simulated resident/vehicle before the render loop applied its visibility budget. A population refresh could therefore build many hidden models, start their human asset upgrades and enqueue shader preparation together.

The new `ambient-model-pool.js` applies the existing distance/category/hysteresis selection **before** construction. It keeps at most 8 pedestrians + 16 vehicles on desktop or 4 + 10 on mobile, creates at most one selected model per render, reuses models while actors move, and disposes removed/unselected models. Rapid travel reselects immediately. Model identity changes (including mutation of the same simulation record) replace the visual safely. Vehicle colours are stable by resident ID. Simulation actors, collision, traffic behavior and online players are unchanged. The diagnostic report exposes loaded/pending/built/released visual counts as `ambientConstruction`.

A deterministic 60-resident fixture verifies 24 desktop / 14 mobile visual constructions versus the former eager 60, exactly the same selected IDs as the existing display policy, one construction per pump, stable reuse, cleanup, identity changes and travel cancellation. These are workload/count checks, **not FPS measurements**. An individual model/rig upload can still be expensive, and staged population appearance needs browser/phone review.

Verification: 103 smoke tests, 15 focused pool/recorder/preparation tests, production build and whitespace checks passed. Local HTTP responses for the pool and world renderer match their source SHA-256 hashes. Native Chrome reached signed-in Independence Square, but subsequent control calls timed out or were interrupted by user UI changes; no valid schema-2 timed run was completed. The preview also reports the existing WF-022 `EMFILE` watcher issue; restarting serves the new files, but this is not a clean performance benchmark environment. No deployment or commit was made.

## Full-game verification — 23 October 2026

A subsequent user-operated capture on the latest local build completed **60.014 seconds**, schema 2, with `valid: true`, no interruption and 1,657 settled intervals. Native UI observations placed the player near Independence Square before the capture and Black Star Square afterward; the precise route and input latency were not recorded. The downloaded report is retained privately at `review-artifacts/performance/gameplay-valid-2026-10-23.json`. The server's ambient-pool file matched the source SHA-256; the report includes the new pool counters (22 loaded, zero pending, 118 built and 96 released at completion).

| Measurement | Result |
| --- | --- |
| Settled interval p50 / p95 / p99 | 19.8 / 40.9 / 520.9 ms |
| Worst settled interval | 562.8 ms |
| Settled intervals over 50 / 100 ms | 57 / 34 |
| Custom-layer CPU submission p95 / max | 3.2 / 21.7 ms |
| Main-thread long tasks, entire capture | 68; 19,093 ms total; 571 ms maximum |
| First 10 seconds: p95 / maximum interval | 33.7 / 571.5 ms |

**Smooth-gameplay acceptance fails.** The 40 ms p95 screening budget is exceeded and repeated half-second stalls remain. Short measured custom-layer phases do not explain the stalls; simulation, MapLibre, DOM work, asynchronous callbacks, garbage collection, extensions and GPU scheduling are not attributed by this report. Obtain a browser performance trace to identify the blocking stacks before choosing the next optimization.

Conditions/limits: desktop Chrome 155 on macOS, 1728×958 CSS viewport, device DPR 2 and renderer pixel ratio 1.25. Other tabs/extensions remained open and the local preview retains WF-022 watcher warnings. This is one valid capture, not a controlled before/after comparison, cold-load test, verified driving/control-latency test or physical-phone benchmark. The first ten seconds refer to capture startup after entering the world, not application loading. Native automation was unreliable, so the user performed the capture and export. WF-001 and WF-002 remain open.

## Stall attribution — 23 October 2026 (local)

Schema 3 adds bounded, opt-in Long Animation Frame script attribution to the existing recorder. It separates unsupported attribution from an empty result, rejects entries outside the capture, accepts delayed observer delivery for the final frame, and removes URL credentials/query strings/fragments. It exports ranked script entry points and the worst frames; these are not full call stacks. See the [benchmark protocol](mobile-performance-benchmark.md) for limits. This is diagnostic instrumentation, not a measured gameplay speed improvement.

Eight recorder regressions and the production build passed. A native Chrome Performance recording was started on the signed-in local world, but automation timed out while stopping it; export and analysis remain pending. Energy Saver and other tabs/extensions remained active. No new controlled frame-time comparison or identified blocking stack is claimed.

### Uploaded trace review — 23 October 2026

The supplied DevTools trace starts at 09:35:11 UTC and spans 24.261 seconds (5,621 events). It identifies the local game document but captures no animation-frame callbacks, paint/layout work or world-renderer/gameplay-loop samples. `NeedsBeginFrameChanged` records `needsBeginFrame: 0`; the CPU profile is about 98.3% idle. There are 134 renderer-main tasks totaling 413.682 ms. The only task over 50 ms is a 379.916 ms task containing `CpuProfiler::StartProfiling` (377.929 ms); the next-largest task is 6.937 ms. This is profiler startup overhead, not evidence of the previously observed gameplay stalls.

The trace is unsuitable for active-gameplay acceptance or root-cause attribution. Its precise pause/background cause is not established by this file. Preserve the existing visibility safeguards; do not make hidden tabs render continuously to get a trace. Next: use the local schema-3 in-game recorder while the world visibly animates and the tab remains visible, then resolve its slow entry points with a short focused trace if necessary. The source trace is retained only in ignored review artifacts.

### Local recorder readiness — 23 October 2026

The existing Worker preview returned a zero-byte HTTP-success response for `performance-benchmark.js` after the build. Restarting the owned local preview on port 3002 restored the complete 11,882-byte schema-3 module, with a SHA-256 matching the source and built copy. The stadium, Black Star Gate and Independence Arch LOD JSON responses also parse and match their source files after restart. The preview still emits WF-022 asset-watcher `EMFILE` warnings; this restart is not a permanent watcher fix. Chrome was reloaded to the launcher; native activation remains unreliable and the next active-world capture is pending.


## Active-world attribution — 23 October 2026, 10:00 UTC (local)

The user supplied a valid schema-3 desktop capture lasting 60,458 ms, without
visibility interruptions. Settled frame intervals: p50 **14.5 ms**, p95 **65.9 ms**,
p99 **522.9 ms**, maximum **592.9 ms**, with **43 intervals over 100 ms**.
Custom-layer CPU submission p95 remains **3.2 ms**. There were 146 long tasks
(total 29,002 ms; maximum 589 ms).

Long Animation Frame attribution assigns **27,382.1 ms** across 147 entries to
`gameplay-loop.js`'s callback (maximum 577.3 ms). MapLibre's animation callback
accounts for 844.1 ms and one realtime callback for 505.4 ms. This identifies
`roamFrame` as the principal entry point; it does **not** establish which nested
simulation, camera, map-query or UI operation caused those stalls. Routes and
conditions were not controlled against the previous run, so these numbers are
not a valid before/after comparison. Smoothness acceptance still fails.

The local schema-4 recorder now measures named synchronous operations inside
that loop: camera following, MapLibre queries and camera updates, collision
refresh/probes, architecture, roads, nearby places, minimap, traffic, scenery,
NPC updates and HUD work. Inclusive duration and exclusive `selfMs` distinguish
nested costs without adding the same work twice. It retains aggregate counters
for at most 64 registered labels and the 12 longest calls, with no arguments,
coordinates, identities or return values. Normal URLs retain original function
identities; timers are active only during an explicitly started benchmark.
Async continuations and GPU execution remain outside these timings.

This is diagnostic instrumentation, **not a verified stall fix**. The final `npm run check` passed file safety, documentation links and **116 smoke tests**; `npm run build` passed. Timers add diagnostic overhead during capture; comparisons should use the same recorder version. Next: obtain a schema-4 recording
on the same route, inspect `gameplayCpu.operations` sorted by exclusive cost,
then fix the measured operation and compare a repeat capture. Browser control
currently reports that local browser use is disabled in Work settings.
The supplied raw JSON is stored only under ignored `review-artifacts/performance/`.

Local readiness: restarted the existing preview on port 3002 with its saved
`.wrangler/state` intact. Served `app.js`, `performance-benchmark.js` and
`gameplay-profiler.js` match source bytes. WF-022 watcher `EMFILE` warnings
remain; refresh the page to load this build. No deployment was performed.


## Collision hot-path fixes — 23 October 2026, 10:34 UTC capture (local)

The supplied schema-4 capture is **invalid for frame-rate acceptance** because
it records `Left the 3D world during capture`. Its synchronous operation evidence
is still actionable: `physics.moveVehicle` consumed **27,987.4 ms** across 13,491
calls; `physics.refresh` consumed **12,059.6 ms**, including a **1,560.6 ms** call.
Map source queries nested inside refresh accounted for only 150.1 ms. Camera
following and custom-layer submission were not the leading costs in this run.
Do not compare its frame percentiles to the prior valid run as a regression.

Changes:

- Precompute the immutable landmark source-ID ownership set (495 source entries)
  instead of checking 110 landmarks for every loaded building on every refresh.
  Number/string ID matching, missing IDs and exact collider output are preserved.
- Check whether a terrace contains a collision sample **before** scanning every
  half-tread for an aisle opening. Previously every distant terrace triggered
  that scan. Axis-aligned precinct bounds no longer allocate rotated pairs.
- Reject distant rings before traversing edges for vehicle sliding. Exact
  four-metre edge-distance checks, tangents and overlap escape rules remain.

`npm run benchmark:physics` uses 961 native fixture buildings and authored
geometry at the mall interchange, Independence Square and Osu. On the same host:

| CPU fixture | Refresh median before → after | Vehicle movement p95 before → after |
| --- | --- | --- |
| Mall interchange | 17.915 → 0.716 ms | 1.699 → 1.500 ms |
| Independence Square | 17.282 → 0.359 ms | 11.002 → 0.610 ms |
| Osu | 16.996 → 0.313 ms | 0.455 → 0.497 ms |

Collider hashes and the combined hashes of all **1,692 movement results** match the original
fixture. Osu movement did not improve; small timing differences are noise, not
proof of a gain. A Node CPU profile of the fixture identified precinct containment
and terrace checks as the major remaining movement cost before the final change.
An independent pre-change collision evaluator verifies step-edge and rotated
surface decisions for pedestrian and vehicle radii. Existing arch ascent/descent,
platform, guardrail and camera-clearance tests also pass (12 focused tests total).

This does not reduce visual quality, remove traffic, bypass collisions or change
server movement validation. Generated LODs are rebuilt to update source hashes;
model geometry is unchanged. Full-game before/after, cold-loading and physical
phone acceptance remain open. Next: refresh the local schema-4 build, enter the
3D world **before** starting the test, and stay in it for the full capture. Check
`physics.refresh`, `physics.moveVehicle` and the settled frame intervals together.
Raw JSON, CPU profile and fixture results remain under ignored review artifacts.

Verification: `npm run check` passed file safety, documentation links and **118
smoke tests**; LOD regeneration and production build passed. Only LOD source
hashes changed, not generated model geometry. The restarted local port-3002
preview serves byte-identical changed physics modules and the regenerated
manifest, with existing player state retained. Known WF-022 asset-watcher
`EMFILE` warnings remain. No commit, push or deployment was performed.

## Prepared arrival screen — 23 October 2026 (local)

Entering the world and continuing a saved story now place an opaque, full-screen
loading cover over the running renderer. The previous street-loading indicator
only checked native map tiles and could reveal placeholder building shells while
authored models were still loading. The new entry gate also waits for the current
bounded landmark selection (including its required detail upgrades), nearby
facades/scenery, selected ambient models, player/ambient human preparation, PBR
textures/reflection sky and the graphics preparation queue. Readiness is sampled
**after** a render; at least two completed ready frames and a 300 ms quiet interval
are required. New tile or preparation work resets that interval. It does not load
the entire city or expand the existing GPU/visibility budgets.

Movement, keyboard actions and journey advancement wait behind the cover, while
arrival geometry and rendering continue. Saved home interiors render behind the
same gate and retain their existing rest state. Slow loading exposes Retry and
Back to City without a timeout that reveals an unfinished scene. Retry explicitly
reloads the client; Back to City cancels entry without deleting saved state.
Existing in-session tile-loading behavior remains a smaller indicator.

Verification: 16 focused entry/preparation/gameplay regression tests passed;
`npm run check` passed all 122 smoke tests, and the production build passed.
The local preview on port 3002 serves the changed files byte-for-byte. Native
Chrome can show the loaded scene, but activation of menu controls remains
unreliable and local browser use is disabled in Work settings. A controlled
visual capture of both entry flows and post-change smoothness acceptance remain
unverified. This change prevents exposing incomplete arrivals; it does not claim
to eliminate loading time, distant streaming or frame-time spikes.
