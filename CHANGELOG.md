# Changelog

Notable project changes are recorded here. Detailed city implementation evidence remains in [the implementation log](docs/realism/implementation-progress.md). An unreleased entry is not a production deployment claim.

## Unreleased

Changes after the first alpha will be recorded here.

## [0.1.0-alpha.1] - 2026-10-21

First versioned source snapshot of the existing playable prototype. This release establishes a release baseline; it does not imply that every gameplay feature was introduced or deployed on this date.

### Included systems

- Browser 2D/3D Accra exploration, authored landmarks and venue environments using Three.js, MapLibre and self-hosted OpenStreetMap data.
- Registered player profiles and saved lives, fictional game economy, task-based work, vehicles and accelerated transport.
- Multiplayer presence, friends, text chat, private WebRTC calls and in-game notifications.
- Reviewed billboard submissions with a separate manual real-payment workflow.
- Shared AGENTS.md / CLAUDE.md guidance and a curated project-context handoff for contributors using coding agents.
- An explicit alpha version in package metadata, a versioning policy, and the live-site/repository details.

### Known limits

- Place fidelity, interiors, character animation, camera/input stability and rendering frame-time spikes remain active work. Physical-phone acceptance is not complete.
- Six broader feature-suite failures remain tracked as WF-016–WF-021 in the [roadmap](docs/roadmap.md); passing smoke tests does not resolve them.
- Multiplayer is instanced and capacity has not been verified at million-player scale. Calls depend on permissions and network connectivity.
- No database migrations or runtime behavior changes are introduced by the versioning update. This tag does not certify the deployed Worker revision.

### Public repository safeguards · 21 October 2026

- Added redacted secret scans of proposed files and full Git history, a credential/database filename guard, and checksum-pinned CI scanning.
- Reviewed one historical Mapbox client token and obtained owner authorization to remove it from history; provider revocation and old external copies remain separate.


### Contributor foundation · 21 October 2026

- Added a contributor guide, documentation hub, architecture, engineering/testing/asset/place/release guides and reusable brief/proposal templates.
- Added a prioritized engineering backlog connected to the detailed Accra place inventory, including observed broad-suite failures and remaining device/performance work.
- Added bug/task/place issue forms, a pull-request checklist, code of conduct and private security-reporting guidance.
- Added read-only CI smoke/build checks, local diagnostics, guarded fresh database setup and explicit local API-test selection.
- Licensed original source/documentation under Apache 2.0, preserving separate data, dependency and asset notices.
- Improved setup instructions and ignored new local review evidence, Python caches and Worker secret files.

Earlier gameplay/location work is documented in the dated implementation records; this entry does not retroactively assert that all local work has shipped.

[0.1.0-alpha.1]: https://github.com/samuelaidoo45/worldfolk/releases/tag/v0.1.0-alpha.1
