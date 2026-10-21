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

The final history rewrite, scanned commit count, clean-tree scan and remote update are recorded after verification. Earlier audit findings are not waived merely to obtain a passing check. Provider revocation, old clones/forks and GitHub cached/unadvertised refs require separate attention.

## After a history rewrite

Re-clone the canonical repository before contributing. Do not merge/re-push an old clone's history, and do not publish the local recovery backup. Use the [security policy](../SECURITY.md) for disclosure and the [contribution guide](../CONTRIBUTING.md) for normal work.
