# Versioning and source releases

Worldfolk follows [Semantic Versioning](https://semver.org/) for named source releases. The current version is **0.1.0-alpha.1**: an early playable prototype, with incomplete city coverage and open reliability/performance work.

## Version names

- `MAJOR.MINOR.PATCH` identifies the release. Before 1.0, minor versions may include incompatible changes; document them explicitly.
- `-alpha.N` identifies early development snapshots; `-beta.N` and `-rc.N` may be used when the stated release scope reaches broader testing and release-candidate validation.
- After 1.0, major versions signal incompatible supported-interface changes, minor versions add compatible features, and patches fix compatible defects.
- Git tags use a `v` prefix, such as `v0.1.0-alpha.1`. Package metadata uses `0.1.0-alpha.1` without the prefix.

`package.json` is the version source. Keep the root version and root package entry in `package-lock.json` aligned. Keep the internal package name unchanged: renaming it can affect deployment identities. The package stays private to prevent accidental npm publication; this does not determine GitHub repository visibility.

## Recording a release

1. Agree the scope and update [CHANGELOG.md](../../CHANGELOG.md), including known failures, migrations and compatibility changes. Update the README's current-version link.
2. Update package and lockfile versions together (for example, `npm version 0.1.0-alpha.2 --no-git-tag-version`). Review the diff; do not update dependencies incidentally.
3. Run `npm run check` and the credential scan. For runtime changes, follow the additional checks in the [release checklist](releases.md). Record outstanding failures and device/network gaps honestly.
4. With maintainer authorization, commit and push the reviewed revision, then create an annotated tag pointing to that revision: `git tag -a v0.1.0-alpha.2 -m "Worldfolk 0.1.0-alpha.2"`. Push that specific tag.
5. Create a GitHub release from the existing tag. Include the scope, checks, known limits and contributor links. Mark alpha/beta/rc releases as **prereleases**. GitHub provides source archives automatically; do not attach local databases, environment files, review dumps or credential-bearing bundles.

Release tags and published release contents are immutable. Correct code with a new version rather than moving an old tag. No automatic deployment, secret sharing or repository visibility change is part of this process.

## Compatibility and deployment

Call out changes to API contracts, WebSocket messages, saved player state, generated map/model formats and schema migrations. Preserve existing data or provide a reviewed migration; a version number does not make a destructive change safe.

The live service is [worldfolk.world](https://worldfolk.world/), with gameplay at [/game/](https://worldfolk.world/game/). A source release and a Cloudflare deployment are different records. Only record a deployed version after verifying the provider revision and live assets. See the [release checklist](releases.md) for deployment, rollback and database safety.

The first alpha establishes a source baseline for work already present. It does not claim complete Accra reconstruction, verified phone performance or million-player capacity. Open work remains in the [roadmap](../roadmap.md) and [city inventory](../realism/coverage-work-items.csv).
