# Worldfolk project context and handoff

**Updated 21 October 2026.** This is a curated, public summary of established project decisions and recent work. It is not a private conversation transcript or a guarantee that every historical implementation claim still matches the current checkout. The current user's instructions, actual source/tests and newer verified records determine the active task.

Read [AGENTS.md](../AGENTS.md) for working rules, [architecture](architecture.md) for code boundaries and the [roadmap](roadmap.md) for acceptance criteria.

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

- Shader startup/streaming frame-time spikes, input/camera stability and physical-phone acceptance remain priorities. A prepared benchmark or passing geometry budget is not a completed phone result.
- Simulation tuning on **21 October 2026** reduced repeated CPU p95 from 1.234 to 0.606 ms (Polo–Airport) and 2.750 to 0.562 ms (mall interchange), with identical final actor states. This is an offline CPU fixture, not rendered FPS; browser control was disabled and phone acceptance remains pending. See [measurement and reproduction](realism/simulation-performance.md). Source commit `f57e876` was pushed to `main`; deployment remains pending as recorded below.
- The latest recorded smoke suite passed **80 tests** after the simulation tuning, with a successful production build. Run it for the current result; do not assume future changes inherit that outcome.
- Six broader feature-suite assertions remain documented as **WF-016 through WF-021**: T3 camera distance, Airport View identity count/search, traffic-wall recovery, stadium height and crowd draw budget. Investigate intended behavior; do not suppress tests or relax thresholds just to report green.
- Legacy live/API fixtures have mixed origin/registration conventions. The offline runner excludes the live capacity fixture; supported API tests require disposable loopback data. See [testing](contributing/testing.md).
- Preview asset watching can emit `EMFILE`; it is tracked as WF-022. Server readiness alone does not prove a clean preview.
- Room capacity is bounded per instance; a large registration target is not verified simultaneous capacity. See [multiplayer limits](multiplayer-capacity.md).

## Publication and release status

The contributor foundation includes setup/architecture/standards, task templates, CI, licensing and secret scanning. On **21 October 2026**, the owner authorized removal of a historical Mapbox client token from Git history. The sanitized history and safeguards were pushed. Existing clones should be replaced with a clean canonical clone; never merge old refs or publish recovery backups. The [security audit](security-audit.md) records the scope, scan evidence and the fact that provider revocation is not confirmed.

**Release handoff, 21 October 2026:** the maintainer confirmed [worldfolk.world](https://worldfolk.world/) as the live site and requested GitHub project details and versioning. The first versioned source snapshot is **v0.1.0-alpha.1**; see the [changelog](../CHANGELOG.md) and [versioning policy](contributing/versioning.md). This records the source release baseline, not a verified production Worker revision. Deployment remains a separate action requiring a current request and provider/live verification. Do not revive old OAuth/device codes or assume credentials remain valid.

**Performance deployment handoff, 21 October 2026:** the maintainer authorized committing, pushing and deploying the simulation tuning. Commit `f57e876` is on GitHub `main`; the production build, 80 smoke tests and redacted credential scan passed. Cloudflare rejected the saved refresh token and the fresh supported Wrangler login timed out before receiving its callback. Browser control still reported disabled. No deployment or database migration was performed; live verification showed the previous assets. Resume with a fresh successful CLI login, retrieve the existing production resource IDs and Worker version, prepare the production configuration, then deploy and compare live asset hashes. Never reuse the expired authorization request.

## How another agent should resume

1. Inspect the working tree and read the current task; identify the affected subsystem and any relevant `WF-*`/`ACC-*` item.
2. Read its current code/tests, brief and latest implementation entry. Treat missing private chat as unavailable, not permission to invent decisions.
3. Write down a bounded outcome, references/data dependencies and checks. Continue independent work while clarifying only genuinely blocking information.
4. Implement and verify locally, preserving existing state and unrelated changes. Use source-controlled records for handoff; keep raw review captures and private information out of Git.
5. Record what changed, exact checks/results, remaining gaps, and whether it is local, committed, pushed or deployed. Update this page only for durable decisions or a changed active handoff.

When facts conflict, fix the relevant source documentation with evidence instead of copying more contradictory notes into agent instruction files.
