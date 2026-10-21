# Repeatable graphics benchmark

Status: harness prepared. **No physical-phone results yet.** Browser viewport emulation and the Codex desktop browser do not establish mobile performance.

## Open and record

1. Open the updated game with `?benchmark=1&graphicsStats=1`. Locally: <http://127.0.0.1:3002/game/?benchmark=1&graphicsStats=1>. Use the deployed HTTPS build on a phone after this update is released; this work has not been deployed.
2. Sign in to a test profile and enter the world. Expand **Performance benchmark**. Select the actual test device class and enter its model/browser. Default is **Unverified browser / desktop**, never an inferred physical phone.
3. Start the 60-second test. The first ten seconds and remaining fifty seconds are reported separately. For a cold-entry test, start on the launcher, then immediately enter the world; for a settled comparison, wait for models to finish loading before starting. Name the scenario in the model/browser field.
4. Follow the same route and camera path on every build. Run Independence Square (geometry/characters), then Accra Mall toward Villaggio/Senchi (buildings and distant models), then drive the same airport-bound route. Record time of day, graphics pixel ratio, network/cache state, device refresh rate and battery/charging state alongside the JSON.
5. Select **Save JSON**, or expand **View report JSON**. Files stay on the device; the harness sends no benchmark data to a server. They contain device/browser/viewport data and aggregate rendering observations, not account details, chats or game coordinates.

For comparison, run each scenario three times on the same physical device, browser, viewport, refresh rate and thermal state. Keep production/development mode consistent. Do not compare a cold run to a settled run or a desktop capture to a physical phone. Close other GPU-heavy tabs and avoid host builds during captures.

## What is measured

- Raw rendered-frame intervals: p50, p95, p99, maximum, counts above 50/100 ms. Spikes are retained, not capped away or hidden by average FPS.
- Startup (first 10 seconds) and settled intervals separately.
- Three.js CPU render submission, separately from frame intervals. **This is not GPU execution time or the complete game loop.**
- Peak draw calls, triangles and GPU geometry/texture object counts; final loaded/medium-detail model counts, pixel ratio, preparation queue timings and `KHR_parallel_shader_compile` availability. Object counts are not driver memory bytes.
- Browser Long Tasks where supported. Safari may not expose this API; absence is not proof of zero long tasks.

A complete, uninterrupted run with at least 300 settled samples compares its p95 to 20 ms and 40 ms frame-interval budgets. This is a screening result, not a guarantee of smooth 60/30 fps or broad device support. Backgrounding, viewport/orientation/DPR changes, leaving 3D, a missing final rendered frame, or the 7,200-sample cap invalidates a run for comparison. Repeat orientation tests as separate runs.

The queue exposes asynchronous completion wall time (`lastMs/maxMs`) and synchronous job submission (`lastSubmitMs/maxSubmitMs`). Polling and driver waits contribute to completion wall time. Neither is a GPU timer.

## Physical-device checklist for later

Use at least one midrange Android phone and one supported iPhone, plus a lower-end Android if available. Record actual models, OS/browser versions and physical-device class.

- Cold launch after clearing the site cache; capture time to visible world and first movement.
- Settled 60-second walk/run around a dense frontage, look around, enter and leave a vehicle.
- Drive past distant towers; approach them and back away to test detail transitions and landmark identity.
- Rapidly change destinations before loads finish; check there are no ghosts, duplicated façades or disappearing map shells.
- Separate portrait and landscape captures; confirm controls and diagnostic panel remain usable.
- Background/restore and lock/unlock outside a timed run; confirm recovery without a reset. A timed run that includes either is expected to be marked interrupted.
- Ten-minute walk/drive session, then repeat the same 60-second route while the device is warm. Note heat, battery/charging and memory pressure. Check shared assets remain bounded after repeated travel.
- Record a browser performance trace if p95 remains above budget; distinguish shader/texture preparation, authored near-model generation, map tile parsing, simulation, main-thread work and GPU fill/shadow cost before changing quality again.

## Rebuild reduced geometry

```sh
npm ci
node scripts/assets/build-render-lods.mjs
node --test tests/render-lod-assets.test.mjs tests/render-preparation.test.mjs tests/performance-benchmark.test.mjs
```

`meshoptimizer@1.1.1` is a pinned build-only dependency. Its Wasm simplifier runs offline. The game loads ordinary indexed geometry; no new runtime Wasm engine is introduced. Keep the generated catalog, JSON, raw binary, gzip binary and MIT license together. SHA-256 and gzip round-trip tests verify them. Regenerate whenever the corresponding authored buildings or human garments change.
