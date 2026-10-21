# Engineering standards

## Scope and readability

Use TypeScript for Worker/API code and ES modules for the current browser game. Match surrounding behavior and export conventions. Prefer small named functions and explicit units over long expressions. New code should be readable with two-space indentation; format only the files/sections you own in the change. Avoid unrelated reformatting, generated-output edits or dependency churn.

Do not introduce an engine/framework migration to solve an unprofiled bottleneck. Explain why a new runtime dependency is necessary; keep build-time geometry tooling out of the browser dependency graph.

## Interfaces and data

- Geographic coordinates use `[longitude, latitude]`; document local model-axis/heading conventions and metre units.
- Keep stable location IDs and native source ownership. Name raw observations separately from inferred geometry.
- Share activity/collision/elevation data where rendering and authoritative movement must agree.
- Prefer additive interface changes. Document changes to save state, room messages and activity definitions; preserve old records or provide a migration.
- Validate untrusted input at API boundaries. Use parameterized SQL, caller sessions, ownership checks, origin checks and bounded payloads/rate limits.
- Keep secrets on the server. Do not log cookies, passwords, recovery codes, private chat or uploaded player data.

## Database changes

Change `db/schema.ts`, generate/review a new numbered SQL migration, and include both in the PR. Do not edit an already-released SQL migration to change history. Check data preservation and any new indexes. Document rollback/recovery limitations before a maintainer applies it. Tests use disposable local data; production is never a fixture.

## Rendering changes

Declare a bounded scene package. Reuse material/texture resources; batch repeated objects where possible. Build static clipping/layout offline. Keep collision bounds cached and nearby. Preserve appropriate medium/far identity, native contour holes and entrances. Dispose geometry/material/texture resources when ownership ends. Avoid per-object animation callbacks, expensive new light/shadow passes and frame-loop allocation without profiling.

Measure before/after using the same route, camera, viewport and quality mode. Include vertices/triangles, draws, compressed asset size and source-hash results for model changes. A low triangle count alone does not prove smooth frame time. Full phone performance is a separate acceptance item.

## Assets and generated files

Generated map/layout/LOD files must be reproducible from their committed builders and declared inputs. Do not hand-edit generated catalogs to make checksum tests pass. Keep attribution/source dates in the [reference register](../realism/reference-images.json), and follow the [asset rights rules](assets-and-licensing.md).

Do not commit `node_modules/`, `dist/`, local tool state, SQLite files, personal credentials or `review-artifacts/`. Historical tracked evidence is retained for now; new review evidence should be attached to the PR or summarized in a brief. Do not delete existing assets just because they look unused without tracing imports/builders.

## Completion record

Use [testing guidance](testing.md), document changed behavior and limits, and update the relevant [backlog](../roadmap.md) or location inventory. Keep “implemented”, “locally verified”, “deployed” and “complete” as distinct statuses. A maintainer review and merge is required before publishing changes as a release.
