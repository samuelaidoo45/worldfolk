# Worldfolk project context and handoff

**Updated 23 October 2026.** This is a curated, public summary of established project decisions and recent work. It is not a private conversation transcript or a guarantee that every historical implementation claim still matches the current checkout. The current user's instructions, actual source/tests and newer verified records determine the active task.

Read [AGENTS.md](../AGENTS.md) for working rules, [architecture](architecture.md) for code boundaries and the [roadmap](roadmap.md) for acceptance criteria.

## Current local follow-up — prepared world entry (23 October 2026)

Enter World and Continue Story now render behind an opaque loading screen until
map tiles, the selected nearby models, characters, textures and graphics jobs
are ready and completed frames have been observed. Movement and travel wait;
slow loads offer Retry / Back to City. Saved-home rest survives cancellation.
See the [entry verification record](realism/browser-main-thread-performance.md#prepared-arrival-screen--23-october-2026-local).
122 smoke tests and production build passed. Native browser activation remains
unreliable; neither full entry-flow visual acceptance nor smooth gameplay is
claimed. Latest changes are local only, uncommitted and undeployed.

## Product direction established so far

Worldfolk is a social open-world life simulation starting with **Accra**, intended to make local places and everyday life recognizable and enjoyable in a browser. High visual fidelity is a goal alongside efficient rendering and reliable controls. It is a prototype, not a completed photographic city scan or verified million-player deployment.

| Area | Established direction |
| --- | --- |
| Accounts and identity | Registration/sign-in is required to enter gameplay; guest play was removed. Player-selected handles, profiles and social interactions identify people in the world. Passwords have an 8-character minimum; preserve the existing secure hashing/session implementation. |
| Entry and persistence | Players choose a place to explore rather than being randomly dropped into the city. Successful authentication should continue the intended entry flow. Background saves/reconnects must not restart the game, undo newer movement or reset travel. Homes must refer to residential properties. |
| Economy | New registered players start with ₵100,000 **fictional game money**. Professions, wages, goods, services and property belong to the authoritative game economy. |
| Maps | Keep self-hosted OpenStreetMap/MapLibre. Do not restore runtime Mapbox dependencies or use public OSM services as unlimited infrastructure. A map footprint does not establish facade appearance or interior accuracy. |
| Travel and camera | Support walking/running, driving, public transport and 2D/3D exploration. Transport has accelerated travel and skip options; public-transport presentation uses an outside view. Preserve chosen camera modes and improve framing/clearance without shake, resets or blocked controls. |
| UI and devices | A game-style launch/menu, readable place icons, unobtrusive HUD/minimap and touch controls that adapt to portrait/landscape. City-selection browsing should not display the player's world avatar; in-world 2D/3D should. |
| Activities | Sitting, sleeping, dancing and similar persistent activities continue until the player explicitly stops them. Venue activities/ambience should fit the place, with clearly identified authored interiors. |
| Social play | Visible handles/profiles, friendships/contacts, private chat and friend calls. Incoming messages/calls need in-game notifications. Two-player/network behavior must be tested; NPCs are not online players. |
| Advertising | Public billboard campaigns require admin review and manual confirmation of real payment. Current prices are GH₵50 for individuals and GH₵100 for businesses; advertiser contact/payment details stay owner/admin scoped. Do not conflate real ad payments with fictional game money or embed an admin account/password in source. |
| World building | Build connected streets and roadside buildings/surroundings systematically, then deepen interiors. Preserve real footprints, road clearance, public approaches and distinctive identities. Remove unsupported generic clutter rather than inventing it everywhere. |
| References and rights | Use real photographs/street/overhead references with dates and credits. Separate observed features, estimates and missing evidence. No automatic right to redistribute source imagery. Original source/docs use Apache 2.0; third-party terms remain separate. |

These decisions summarize intent. Read the current feature code and system guides before changing its behavior; preferences and implementation may evolve in a new task.

## Current city focus and next bounded work

The latest connected work surrounds **Independence Square and the Castle Drive coast**: Nationalism Park/stadium perimeter, Finance Drive civic frontages, Ghana Club/coastal ground, then **Castle Drive and Asomdwe Park**. The Asomdwe batch has an authored memorial/gardens, native roadside ownership, walkable steps, canonical arrivals, persistent photo/reflection activities and prepared collision/layout data. Proportions, hidden facades, access and device acceptance still have gaps; its status remains Partial.

The recorded next city scope is **Osu Castle exterior and a verified approach (ACC-009)**, followed by independently researched neighbouring facilities. This is planning context, not an instruction to start it when the user asks for unrelated work.

Existing **Accra Mall → Airport / Airport Residential / Shangri-La / Opeibea** work remains another priority corridor. It includes named buildings, stations, shops, bridges, roadside surroundings and selected authored interiors. Close reference/access/performance gaps before treating the corridor as complete or expanding unrelated districts.

Use these sources instead of guessing a sequence from conversation fragments:

- [City coverage tracker](realism/accra-coverage-tracker.md) and [detailed inventory](realism/coverage-work-items.csv).
- [Castle Drive / Asomdwe brief](realism/castle-drive-asomdwe.md), [Independence surroundings](realism/independence-neighbourhood.md) and [public spaces](realism/independence-public-spaces.md).
- [Mall–Airport plan](realism/mall-airport-corridor-plan.md) and [area focus](realism/airport-mall-focus.md).
- [Dated implementation evidence](realism/implementation-progress.md) and [current reference register](realism/current-reference-images.md).

## Engineering status and known limits

- **23 October collision hot-path fixes (local):** schema-4 evidence identifies vehicle movement (~28 s) and collision refresh (~12 s) as the dominant synchronous costs. That capture left the 3D world and is invalid for FPS acceptance. Indexed landmark ownership and bounded terrace/vehicle checks preserve all 1,692 fixture movement results and collider hashes. Refresh medians fell ~17 ms → 0.3–0.7 ms; Square movement p95 11.0 → 0.61 ms. Full gameplay verification is still needed. See [collision evidence and repeat protocol](realism/browser-main-thread-performance.md#collision-hot-path-fixes--23-october-2026-1034-utc-capture-local). No commit/push/deployment.

- **23 October active-world attribution (local):** the new valid schema-3 recording fails smoothness acceptance (settled p95 **65.9 ms**, p99 **522.9 ms**, maximum **592.9 ms**). LoAF assigns **27.38 seconds** of blocking callback work to the gameplay loop, but cannot identify its nested culprit. Schema-4 diagnostics now measure named simulation, camera, map-query and HUD operations with exclusive/inclusive CPU totals. This is instrumentation, not a verified speed fix. Capture schema 4 on a comparable route and target its measured bottleneck; physical-phone acceptance remains pending. See [active-world evidence](realism/browser-main-thread-performance.md#active-world-attribution--23-october-2026-1000-utc-local). No new commit or deployment.
- Shader startup/streaming frame-time spikes, input/camera stability and physical-phone acceptance remain priorities. A prepared benchmark or passing geometry budget is not a completed phone result.
- Simulation tuning on **21 October 2026** reduced repeated CPU p95 from 1.234 to 0.606 ms (Polo–Airport) and 2.750 to 0.562 ms (mall interchange), with identical final actor states. This is an offline CPU fixture, not rendered FPS; full gameplay and phone acceptance remain pending. See [measurement and reproduction](realism/simulation-performance.md). Source commit `f57e876` was pushed to `main` and deployed as recorded below.
- Subsequent **main-thread performance work**, deployed on 21 October 2026 as recorded below, caches collider/minimap bounds, ranks facades before design work, and constructs 34 full-detail static packages in one cancellable worker. Source changes remain uncommitted and unpushed. On the same host, mall camera CPU p95 fell 2.495 → 0.333 ms and facade refreshes 18–24 → 3–4 ms. Three valid native Chrome construction comparisons reduced the longest animation interval from 400–434 ms to 34.2–34.3 ms; this is an isolated model fixture, not full-game FPS. Villaggio's worker/original geometry and appearance were compared in one WebGL canvas. See [scope, reproduction and remaining acceptance](realism/browser-main-thread-performance.md).
- **23 October local follow-up:** schema-2 diagnostics add per-stage custom-layer timings, eliminate inactive-capture snapshot work and repeated live report sorting, and stop hidden-page captures immediately. The signed-in mall test was invalidated by page hiding/missing frames; no comparable gameplay or physical-phone acceptance was obtained. See the [diagnostic follow-up](realism/browser-main-thread-performance.md#full-game-diagnostic-follow-up--23-october-2026-local). These changes are not committed or deployed.
- **23 October ambient loading follow-up (local):** select NPC visuals before building them and construct at most one per rendered frame, retaining the existing 24 desktop / 14 mobile display caps. Full simulation remains intact. Deterministic lifecycle tests, 103 smoke tests and build pass; no comparable gameplay FPS result. Native browser-control interruptions and preview watcher errors remain verification limits. See [bounded ambient construction](realism/browser-main-thread-performance.md#bounded-ambient-model-construction--23-october-2026-local).
- **23 October gameplay verification (local):** a subsequent valid, user-operated 60-second capture near Independence Square fails smoothness acceptance: settled p95 40.9 ms, p99 520.9 ms, maximum 562.8 ms, 34 intervals over 100 ms and 68 main-thread long tasks. Custom-layer CPU submission p95 is 3.2 ms; the blocking work needs a browser trace. This is not a before/after or physical-phone result. See [full-game verification](realism/browser-main-thread-performance.md#full-game-verification--23-october-2026).
- The released simulation tuning passed **80 smoke tests** and a production build. Subsequent local worker/camera/facade/minimap work passed **99 smoke tests**, **30 additional rendering/benchmark tests**, regenerated LOD validation and a production build. Run `npm run check` for the current result; do not assume future changes inherit earlier outcomes.
- Six broader feature-suite assertions remain documented as **WF-016 through WF-021**: T3 camera distance, Airport View identity count/search, traffic-wall recovery, stadium height and crowd draw budget. Investigate intended behavior; do not suppress tests or relax thresholds just to report green.
- Legacy live/API fixtures have mixed origin/registration conventions. The offline runner excludes the live capacity fixture; supported API tests require disposable loopback data. See [testing](contributing/testing.md).
- Preview asset watching can emit `EMFILE`; it is tracked as WF-022. Server readiness alone does not prove a clean preview.
- Room capacity is bounded per instance; a large registration target is not verified simultaneous capacity. See [multiplayer limits](multiplayer-capacity.md).

## Publication and release status

The contributor foundation includes setup/architecture/standards, task templates, CI, licensing and secret scanning. On **21 October 2026**, the owner authorized removal of a historical Mapbox client token from Git history. The sanitized history and safeguards were pushed. Existing clones should be replaced with a clean canonical clone; never merge old refs or publish recovery backups. The [security audit](security-audit.md) records the scope, scan evidence and the fact that provider revocation is not confirmed.

**Release handoff, 21 October 2026:** the maintainer confirmed [worldfolk.world](https://worldfolk.world/) as the live site and requested GitHub project details and versioning. The first versioned source snapshot is **v0.1.0-alpha.1**; see the [changelog](../CHANGELOG.md) and [versioning policy](contributing/versioning.md). This records the source release baseline, not a verified production Worker revision. Deployment remains a separate action requiring a current request and provider/live verification. Do not revive old OAuth/device codes or assume credentials remain valid.

**Performance deployment, 21 October 2026 at 15:32 UTC:** the maintainer authorized committing, pushing and deploying the simulation tuning. Runtime commit `f57e876` and handoff commit `afb5e11` are on GitHub `main`; the production build, 80 smoke tests and redacted credential scan passed. After login recovery, deployment completed as Worker version `7f454d72-2387-4884-bbf2-c9c11af03d18`, serving 100% of traffic on both configured Worldfolk hostnames. HTTPS checks returned 200 for `/`, `/game/` and all six changed JavaScript modules; every changed module's SHA-256 matched the built source. Native Chrome control verified launch → main menu. Full gameplay/frame timing and physical-phone acceptance remain unverified. The production DB/R2/Durable Object bindings and migration tag were retained; no database migration was applied. Previous compatible rollback version: `aa872f8a-911d-418b-8d34-158c248ae07b`. See [login recovery](cloudflare-login.md) before attempting another authorization; never reuse an expired request.

**Main-thread performance deployment, 21 October 2026 at 17:46 UTC:** the maintainer explicitly requested deployment of the tested working tree based on `3bbabfd`. Worker version `2d9b2cb9-e773-429f-9342-cd5c7c90d94c` serves 100% of production traffic. This request did not include committing or pushing; those source changes remain local. The 14 changed public files have combined SHA-256 fingerprint `2b4ac0718c63c9e9b272c6e5e19f75f1592dbe809f72aaf0fdcea7738c40e44f` (SHA-256 of the JSON array of repository path/source-SHA-256 pairs in the release manifest). All 14 live files matched the built sources; apex `/`, `/game/` and `www` game entry returned HTTP 200, and native Chrome verified launch → main menu. The production build, 99 smoke tests, 30 focused rendering tests, file guard and redacted credential scan passed. Full-game GPU/frame timing, physical-phone acceptance and unrelated known integration failures remain open; isolated construction timings are not a gameplay FPS claim. Existing DB/R2/Durable Object bindings and `world-routing-v2` migration tag were preserved, with no database migrations applied. Compatible rollback version: `7f454d72-2387-4884-bbf2-c9c11af03d18`. Ignored evidence is under `review-artifacts/performance/`, including `release-manifest.json`, `release-live-verification.json`, `release-deploy.log` and `release-live-menu.png`.

## How another agent should resume

1. Inspect the working tree and read the current task; identify the affected subsystem and any relevant `WF-*`/`ACC-*` item.
2. Read its current code/tests, brief and latest implementation entry. Treat missing private chat as unavailable, not permission to invent decisions.
3. Write down a bounded outcome, references/data dependencies and checks. Continue independent work while clarifying only genuinely blocking information.
4. Implement and verify locally, preserving existing state and unrelated changes. Use source-controlled records for handoff; keep raw review captures and private information out of Git.
5. Record what changed, exact checks/results, remaining gaps, and whether it is local, committed, pushed or deployed. Update this page only for durable decisions or a changed active handoff.

When facts conflict, fix the relevant source documentation with evidence instead of copying more contradictory notes into agent instruction files.
