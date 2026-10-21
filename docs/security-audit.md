# Public repository exposure audit

Date: **21 October 2026** · Scope: repository files and reachable Git history, with a focused review of credential/data output boundaries. Repository visibility and deployment are not changed by this audit.

## Findings and remediation

- **Historical Mapbox client token:** one non-demo public client token remained in two older source locations, despite removal from current runtime maps. The owner explicitly authorized rewriting Git history to remove it. No raw token is included in this report. Provider revocation remains recommended; repository cleanup cannot prove that a token was revoked or remove copies already held elsewhere.
- **Current source:** no live provider/server secrets, private keys, tracked environment files, credential stores or local SQLite databases were found by the inspected-file inventory and Gitleaks checks.
- **Reviewed false positives:** `proximity/catalogue` in a research brief and `cafe/gym/parking` in the coverage inventory. The scanner configuration restricts each exception to that exact prose and path; key detection is retained elsewhere.
- **Public metadata:** domains, map coordinates, source-data IDs, provider project IDs, binding names, package metadata and Git author identities remain visible. They are identifiers/attribution, not access grants. Never rely on hiding them for security.

## Preventing recurrence

Added a tracked/proposed filename guard, redacted current-file and full-history Gitleaks commands, and a read-only CI secret-scanning job using a checksum-pinned official binary. Local runtime/tool caches, secret files, database files, private keys and browser captures are ignored. Schema migrations and public map assets remain available to contributors.

Focused code review confirmed that long-lived TURN secrets stay in Worker bindings, authentication uses server-side password hashes and HttpOnly cookies, public player representations omit session tokens/password hashes, private-message queries are scoped to the caller, and advertiser contact/payment details are restricted to owners/admins. This was a focused source review, not a complete penetration test, production-account audit or dependency-vulnerability certification.

## Verification record

The owner-authorized rewrite sanitized **all 87 then-reachable commits** using git-filter-repo 2.47.0. A private recovery bundle was stored outside the repository. The checked-out source tree hash was identical before/after rewriting; only historical occurrences of the old token were replaced. Gitleaks **8.30.1** then scanned the full rewritten history with **zero remaining findings**. The current tracked/proposed snapshot also passed, and a temporary synthetic credential was correctly blocked with its report value redacted. The contributor smoke suite passed **77 tests**; these security/tooling changes do not claim to fix the six previously recorded broader feature-suite failures.

The local audit covers `main` and its reachable history. No tags or additional local branches existed. An authenticated mirror fetch of remote hidden/unadvertised refs was unavailable, so GitHub caches, pull-request refs and prior external clones are not certified erased. The remote update uses an explicit lease against the last known published head, protecting concurrent work. Its result is recorded in the task response after publication.

**Provider revocation is not confirmed.** Revoke the old Mapbox token if still active; history cleanup does not invalidate copies outside this repository. No Cloudflare/server key or local credential store was found by these scans. Repository visibility and deployment remain unchanged.

## After a history rewrite

Re-clone the canonical repository before contributing. Do not merge/re-push an old clone's history, and do not publish the local recovery backup. Use the [security policy](../SECURITY.md) for disclosure and the [contribution guide](../CONTRIBUTING.md) for normal work.

## Audit tools

- [Official Gitleaks project](https://github.com/gitleaks/gitleaks) — offline file/history scanning; downloaded release verified against the published SHA-256 and release API digest.
- [git-filter-repo documentation](https://github.com/newren/git-filter-repo/blob/main/Documentation/git-filter-repo.txt) — targeted history replacement and post-removal coordination.
