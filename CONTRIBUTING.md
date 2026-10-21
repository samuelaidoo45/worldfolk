# Contributing to Worldfolk

Worldfolk is a browser multiplayer life simulation set in Accra. Contributions should improve a recognizable, playable city while keeping it usable on ordinary devices.

**Start here:** [local setup](docs/development.md) · [architecture](docs/architecture.md) · [open work](docs/roadmap.md) · [documentation hub](docs/README.md).

## Using a coding agent

Have the agent read [AGENTS.md](AGENTS.md) and the [project context](docs/project-context.md) before editing. [CLAUDE.md](CLAUDE.md) is the Claude entry point. Review the agent's changes and evidence as you would any contribution; keep private prompts, credentials and player data out of the repository.

## Your first contribution

1. Read the [project overview](README.md), [conduct policy](CODE_OF_CONDUCT.md) and [licensing status](docs/contributing/assets-and-licensing.md).
2. Choose one bounded task from the [roadmap](docs/roadmap.md). Open an issue describing your scope, or comment on an existing issue to avoid duplicate work. Backlog IDs are planning references, not already-created GitHub issues.
3. Fork the repository, clone your fork, and follow the setup guide. Branch from the current default branch, for example `feat/osu-castle-approach` or `fix/mobile-controls`.
4. Make a small, reviewable change. Include a regression test for a bug when useful, and update the relevant documentation or place inventory. Preserve unrelated work in your checkout.
5. Run `npm run check`, `npm run security:check` (requires Gitleaks), and the relevant focused tests. Run `npm run build` when changing application code, configuration or generated runtime assets. Follow the [testing guide](docs/contributing/testing.md).
6. Open a pull request using the provided template. For a larger design decision, use the [engineering proposal](docs/templates/engineering-proposal.md); new place briefs can use the [place template](docs/templates/place-brief.md). Describe the problem, scope, verification, visible result, performance cost and remaining limitations. For visual changes include before/after screenshots at comparable cameras and viewport sizes.

No deployment access is needed to contribute. CI does not deploy; maintainers control releases.

## Choose a contribution lane

| Lane | Read first | Good starting work |
| --- | --- | --- |
| Gameplay / controls | [Architecture](docs/architecture.md), [standards](docs/contributing/standards.md) | A reproducible input, collision or camera issue with a focused regression. |
| Places / buildings / surroundings | [Place workflow](docs/contributing/places.md) | One street frontage with dated references, native footprint and safe public approach. |
| Art / animation / audio | [Asset rules](docs/contributing/assets-and-licensing.md) | An original, attributed, optimized asset with LOD and disposal evidence. |
| Backend / multiplayer | [Architecture](docs/architecture.md), [accounts](docs/accounts.md), [capacity](docs/multiplayer-capacity.md) | A scoped validation, race-condition or presence regression. |
| QA / performance | [Testing](docs/contributing/testing.md), [phone benchmark](docs/realism/mobile-performance-benchmark.md) | Reproduction steps, a device report, a measured frame-time comparison. |
| Documentation / research | [Documentation hub](docs/README.md), [roadmap](docs/roadmap.md) | Verify setup, improve a guide or date/credit a missing reference. |

## Review and acceptance

A maintainer reviews correctness, scope, evidence, asset rights and device cost. Another contributor may review too; review is not an automatic promise to merge. Address feedback in the same PR. Link follow-up work explicitly instead of claiming an unfinished place or system is complete.

A change is ready when:

- Its stated behavior works, relevant checks pass, and failures/untested cases are disclosed.
- API mutations validate sessions, ownership, input and origin; the server controls money, progression and authoritative travel.
- Scene objects have matching access/collision rules, bounded detail, LOD where appropriate, and resource cleanup.
- Source/reference credits and current capture gaps are recorded. Generated files are rebuilt from their sources.
- Secrets, personal test records, local database files and raw research dumps are absent from the diff.
- Documentation and backlog/inventory status match the delivered behavior.

Do not mass-format the game client or move large module trees in a feature PR. Existing compact modules can be modernized in separate, bounded refactors with behavior preserved.

## Communication

Use repository issues for bugs, proposals and task coordination; use PRs for reviewable changes. Search for an existing report first. Never attach passwords, recovery codes, session cookies or player-private messages. Security concerns follow [SECURITY.md](SECURITY.md).

Original Worldfolk source and documentation use [Apache 2.0](LICENSE). By intentionally submitting a contribution for inclusion, you offer it under that licence unless you explicitly state otherwise. Do not import assets without compatible redistribution rights; third-party terms remain separate.
