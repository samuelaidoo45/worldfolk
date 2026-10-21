# Simulation CPU tuning — 21 October 2026

Related task: **WF-001, partial**. This measures local simulation work, not browser frame rate. Shader startup, model streaming and physical-phone acceptance remain open.

## Changes

- Pedestrian pavement checks reject distant road segments before projection/elevation queries. Crossing segments, endpoints, overlap escape and elevated roads retain exact checks.
- Vehicle contacts reject non-overlapping bounding circles before calculating rotated footprints. Actual overlaps still test road height, so bridge traffic does not collide with traffic underneath.
- Traffic following/yield checks test proximity before road elevation; actor lists are reused within each simulation step.
- Nearby-road discovery caches conservative line bounds using weak keys. Native/tile coordinates and exact closest-segment selection are retained.
- The renderer skips rebuilding its building-visibility lists when the architecture source and build queue are unchanged. Model swaps, pending parts, removals and 2D/3D toggles still synchronize map shells.

No geometry quality, crowd count, physics step size or camera settings were reduced.

## Reproduce

```sh
npm run benchmark:simulation
node --test --test-concurrency=2 tests/simulation-proximity.test.mjs tests/traffic-routing.test.mjs tests/restart-street.test.mjs tests/game-motion.test.mjs tests/driving-experience.test.mjs tests/interchange.test.mjs
```

The CPU fixture uses the repository's public road context fixtures (791 unique features at measurement), a deterministic clock, up to 32 ambient actors and two fixed 20-second routes. Each route has one initial run and three repeated runs, with 1,200 steps per run. The repeated distribution contains 3,600 samples. The output includes complete final actor-state checksums to detect behavioral drift. Wall/vehicle movement uses an unobstructed fixture; building collision, rendering, GPU work and networking are excluded. Simulation steps are 1/60 s, but elapsed measurements use the real host clock.

For raw JSON without npm's command banner, use `node scripts/benchmarks/simulation.mjs > review-artifacts/simulation.json` after creating the ignored `review-artifacts/` directory. An optional Node CPU profile can be saved there with `node --cpu-prof --cpu-prof-dir=review-artifacts scripts/benchmarks/simulation.mjs`. Do not commit private browser traces.

## Local evidence

Host: macOS arm64, Node v22.23.2. Baseline: source commit `839988e`; after: local changes described above. Same fixtures, step counts, routes and host. No concurrent build was run during these measurements.

Repeated-run elapsed CPU milliseconds per simulation step:

| Route | p50 before → after | p95 before → after | p99 before → after | Maximum before → after |
| --- | --- | --- | --- | --- |
| Polo–Airport | 0.704 → 0.283 | 1.234 → 0.606 | 3.755 → 1.441 | 6.116 → 11.351 |
| Mall interchange | 2.208 → 0.298 | 2.750 → 0.562 | 4.911 → 1.327 | 8.746 → 2.746 |

The p95 reduction was approximately **51% / 80%** respectively. The isolated Polo maximum increased; these measurements do not establish that every spike improved. Initial-run p95 changed from 1.411 → 0.671 ms and 2.823 → 0.601 ms. All four final actor-state hashes matched the corresponding baseline for each route:

- Polo–Airport: `044555c3805d29e0c8ba6a10f413282354895007c621e13c9b2bce5f46028707`.
- Mall interchange: `c2ebc86f5ba343def0a57f0192664b977acd2efa18e70ceb7ae68fc88600b9fa`.

Focused regressions: **57 passed**, including all vehicle sizes/rotations compared with full SAT (8,112 pairs), exact pedestrian-clearance comparisons, bridge separation, collision-safe 4×/8× transport, and wall/sidewalk behavior. These tests have no timing thresholds tied to one machine.

`npm run check` passed the repository file guard, documentation links and **80 smoke tests** (including the new proximity regressions). `npm run build` completed successfully. Verification is local; this change has not been committed or deployed.

## Remaining acceptance

Local browser control was disabled in Work settings for this run, so no live-browser frame capture or visual check was possible. No physical-phone result has been collected. Use the [graphics benchmark](mobile-performance-benchmark.md) on the same rendered route before claiming smoother gameplay or changing graphics budgets. Next profiling should include full frame intervals, shader/texture startup, near-model creation and warm-device input responsiveness. The six existing broad-suite failures remain tracked in the roadmap; this work does not close them.
