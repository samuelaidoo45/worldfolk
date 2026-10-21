# Roadmap and contributor task backlog

**Updated 21 October 2026.** This is a source-controlled planning backlog. IDs below are not GitHub issue numbers. Claim a task by opening/linking an issue and identifying its scope; acceptance is verified in a PR. No task is assigned automatically.

Worldfolk remains a playable prototype. The immediate goals are stable controls and scene streaming, recognizable connected Accra locations, reliable social play, and a contributor workflow that others can reproduce. Million-player operation and city-wide photorealism are not verified capabilities.

## Priorities

1. **Stability and measurement:** fix reproducible resets/input loss; measure shader/streaming spikes and physical-phone behavior.
2. **Connected city coverage:** complete the Independence–Castle edge and improve the existing Accra Mall / Airport / Shangri-La / Opeibea corridor before opening unrelated districts.
3. **Social and life systems:** verify two-player calls/messages, persistence, jobs and authoritative progression.
4. **Engineering maturity:** reproducible setup, consistent test fixtures, module boundaries, rights records and release discipline.

## Open engineering tasks

| ID | Priority / lane | Scope | Acceptance criteria |
| --- | --- | --- | --- |
| WF-001 | P1 · performance · partial | Profile simulation, startup/shader and streaming spikes on a fixed route | [Simulation CPU tuning](realism/simulation-performance.md) records exact-state-preserving CPU gains. Browser startup/streaming p50/p95/p99 and long-frame evidence on the same device/settings remain required. |
| WF-002 | P1 · QA | Run physical-phone portrait/landscape benchmark | Complete the [benchmark protocol](realism/mobile-performance-benchmark.md) on a named real device; record thermals/resolution/input/route and failures. Prepared protocol is not a completed phone test. |
| WF-003 | P1 · controls | Reproduce remaining shaking, control loss or position reset reports | Capture a current reproduction, network/camera state and regression; verify reconnect, resume and explicit travel stay distinct. |
| WF-004 | P1 · tests | Migrate legacy API fixtures | Convert hard-coded origins/old guest joins to registered accounts and `GAME_TEST_URL`; use isolated fixtures and demonstrate cleanup. Add them to the wrapper only after review. |
| WF-005 | P1 · multiplayer | Two-player voice/message acceptance | Incoming notification, answer/decline/hangup/reconnect, friendship checks and restrictive-network TURN evidence; no private content in logs. |
| WF-006 | P1 · maintainer | Publish private reporting channels | Apache 2.0 is now selected for original source; enable private security reporting or publish an approved private contact while preserving third-party terms. |
| WF-007 | P2 · refactor | Extract one bounded responsibility from `app.js` | Document module contract, preserve behavior/session lifecycle and focused tests; no mass formatting or broad state rewrite. |
| WF-008 | P2 · tests | Establish repository-wide lint/typecheck baseline | Inventory existing findings, separate vendored/generated files appropriately, fix scoped errors, then add a reliable gate without blanket rule disablement. |
| WF-009 | P2 · data | Support incremental local schema migration safely | Detect direct-SQL versus ledger setups; test fresh and existing player state, partial failure/retry and backups; never delete state silently. Fresh `db:setup` is intentionally not this migration tool. |
| WF-010 | P2 · assets | Audit model/material/logo redistribution records | Trace each asset family to its rights/source and optimization notes; flag unclear rights instead of substituting unverifiable claims. |
| WF-011 | P2 · rendering | Measure distant-model quality and residency | Preserve landmark silhouettes/native ownership; compare geometry, compressed bytes, resident resources and frame time; verify disposal and camera transitions. |
| WF-012 | P2 · scale | Load-test scoped presence/rooms and storage | Controlled staging-only workload, cost/error/latency/room-allocation evidence; define a capacity boundary before raising public claims. |
| WF-013 | P2 · documentation · first task | Verify setup on a clean second operating system | Follow the guide without existing runtime state, report exact versions/commands, correct documentation and retain local-only operation. |
| WF-014 | P2 · research · first task | Date and credit one missing place reference | Link exact source, separate capture/publication dates, describe what is visible/unverified, update register and derived audit. |
| WF-022 | P2 · tooling | Bound preview file watching | Reproduce asset-tree `EMFILE` on a named platform, reduce unnecessary watchers without breaking rebuilds, and verify one fresh Worker preview without watcher errors. |
| WF-015 | P2 · QA · first task | File one reproducible mobile UI issue | Device/orientation/viewport, steps, expected result and privacy-safe capture; fix a bounded overlap or input defect if feasible. |

## Broad test baseline (21 October 2026)

The contributor smoke suite passes 75 tests and the build passes, but the broader offline suite passes 507 of 513 tests, with six failing assertions in existing feature tests. These remain visible failures, not quarantined successes. They need investigation before making the entire suite a required CI gate:

| Task | Test file | Failing expectation to investigate |
| --- | --- | --- |
| WF-016 | `tests/airport-t3.test.mjs` | Overview camera distance threshold. |
| WF-017 | `tests/airport-view.test.mjs` | Canonical search/visit count (three versus two). |
| WF-018 | `tests/city-experience.test.mjs` | Traffic recovery queue intersects a blocking wall. |
| WF-019 | `tests/city-exploration.test.mjs` | Searchable Airport View expectation. |
| WF-020 | `tests/city-landmarks.test.mjs` | Accra Sports Stadium height assertion. |
| WF-021 | `tests/venue-scenes.test.mjs` | Animated crowd draw budget (`<20`). |

Compare intended behavior/current models with each assertion; do not simply relax thresholds or remove tests. The legacy live capacity test was also discovered outside the API naming convention and is now explicitly excluded from offline discovery; its fixture migration belongs to WF-004.

## City implementation queue

The authoritative detailed location list is [coverage-work-items.csv](realism/coverage-work-items.csv), navigated through the [coverage tracker](realism/accra-coverage-tracker.md). It currently distinguishes reference, exterior, interior, ground/access, activities/people, physics and performance acceptance. These dimensions must not collapse into a single “done” checkbox.

| Next scope | Inventory / evidence | Next action |
| --- | --- | --- |
| Osu Castle exterior and verified approach | ACC-009; [Castle Drive / Asomdwe](realism/castle-drive-asomdwe.md) | Current public references, native bounds and permitted game arrival; then recognizable exterior and collision-clear approach. |
| Asomdwe / Castle Drive refinement | ACC-013 / ACC-292 | Verify current roadside facades, measured memorial proportions, access/gardens and device/multiplayer behavior. Local implementation remains Partial. |
| Separate Geese leisure park | [Asomdwe distinction](realism/castle-drive-asomdwe.md) | Confirm current parcel and facilities independently; do not reuse memorial geometry as proof. |
| Independence surroundings completion | [Neighbourhood](realism/independence-neighbourhood.md), [public spaces](realism/independence-public-spaces.md) | Current facade/access gaps, restaurant location only if verified, connected routes and device acceptance. |
| Mall–Airport / Residential / Shangri-La / Opeibea | [Corridor plan](realism/mall-airport-corridor-plan.md), [focus record](realism/airport-mall-focus.md) | Close existing roadside/environment/reference gaps before expanding deep interiors or new districts. |

The [implementation log](realism/implementation-progress.md) records local verification separately from deployment. A source entry or generated mesh is not proof the feature is live.

## How to turn a row into a task

Use the feature or place issue template. State a bounded outcome, relevant `WF-*`/`ACC-*` ID, likely modules, reference requirements, test/device plan and explicit exclusions. Split research, exterior, access/physics, activities and optimization into reviewable PRs where necessary. Update status/evidence after verification; do not rewrite old implementation records to imply they were tested more broadly.
