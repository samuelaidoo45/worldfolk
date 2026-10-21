# Worldfolk documentation

Worldfolk combines real Accra geography, authored game spaces and persistent multiplayer life simulation. This index separates contributor guidance from detailed historical implementation records.

## Start building

| Document | Purpose |
| --- | --- |
| [Project overview](../README.md) | What the game is, how to play, stack and current limits. |
| [Contribution guide](../CONTRIBUTING.md) | Choose work, open an issue and submit a reviewable PR. |
| [Local setup](development.md) | Install, initialize local data, run and troubleshoot. |
| [Architecture](architecture.md) | Runtime boundaries, important files and data flow. |
| [Engineering standards](contributing/standards.md) | Code, API, migrations, rendering and generated assets. |
| [Testing](contributing/testing.md) | Smoke/unit/API checks, browser evidence and performance limits. |
| [Places workflow](contributing/places.md) | Research and implement a recognizable, playable city block. |
| [Assets and licensing](contributing/assets-and-licensing.md) | Attribution, redistribution and source licence status. |
| [Roadmap and task backlog](roadmap.md) | Priorities, acceptance criteria and good first tasks. |
| [Versioning policy](contributing/versioning.md) | Source versions, alpha releases, tags and release notes. |
| [Release checklist](contributing/releases.md) | Maintainer verification, database safety and rollback preparation. |

## Agent-assisted contributions

[AGENTS.md](../AGENTS.md) is the shared agent instruction guide; [CLAUDE.md](../CLAUDE.md) directs Claude users to the same rules. The [project context and handoff](project-context.md) summarizes established decisions, recent work and outstanding limits without publishing private chat.

## Reusable templates

Copy the [place implementation brief](templates/place-brief.md) for a new location, or the [engineering proposal](templates/engineering-proposal.md) for a substantial architecture change. GitHub issue and PR forms cover ordinary bounded tasks. See [CHANGELOG](../CHANGELOG.md) for release notes and unreleased changes.

## Publication safety

Read the [repository exposure audit](security-audit.md) and [security policy](../SECURITY.md). Run the file/history scans before sharing a fork or publishing new source.

## Systems

- [Accounts and recovery](accounts.md)
- [Calls and notifications](voice-calls.md)
- [Multiplayer rooms, capacity and scaling limits](multiplayer-capacity.md)
- [Map generation and attribution](../scripts/maps/README.md)
- [Rendering architecture](realism/browser-graphics-architecture.md)
- [Physical-phone benchmark](realism/mobile-performance-benchmark.md)
- [Launch-screen design](design/worldfolk-launch-screen.md)
- [Cloudflare login troubleshooting](cloudflare-login.md)

## Building Accra

Use the [coverage tracker](realism/accra-coverage-tracker.md) to navigate the city work. The [work-item CSV](realism/coverage-work-items.csv) is the detailed location backlog; the [implementation log](realism/implementation-progress.md) is dated evidence of what changed. A mapped place is not necessarily a completed reconstruction.

- [Current reference register](realism/current-reference-images.md) and [machine-readable sources](realism/reference-images.json)
- [Realism checklist](realism/accra-realism-master-checklist.md)
- [Independence surroundings](realism/independence-neighbourhood.md), [Nationalism Park](realism/independence-public-spaces.md), [Castle Drive / Asomdwe](realism/castle-drive-asomdwe.md)
- [Accra Mall](realism/accra-mall.md) and [Mall–Airport corridor](realism/mall-airport-corridor-plan.md)

## Documentation conventions

Keep user-facing product claims in the README, setup commands in the development guide, engineering decisions in the architecture/standards guides, and location evidence in its realism brief. Link to the source rather than copying long records into multiple pages. Use relative repository links. Record publication date separately from image capture date. Mark estimates, missing access information and unverified performance plainly.

Run `npm run docs:check` for local link targets in the maintained contributor guides. It does not validate external websites, heading anchors or every historical research note.
