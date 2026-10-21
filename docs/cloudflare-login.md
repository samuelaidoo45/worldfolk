# Cloudflare login and deployment

## Login recovery (15 October 2026)

The saved OAuth refresh token was rejected. Subsequent attempts failed because callbacks from older browser tabs reached a newer Wrangler session. Wrangler logged `ErrorInvalidReturnedStateParam`; its callback listener has a two minute timeout. A sandboxed attempt also failed with `listen EPERM ::1:8976`, before it could receive any callback.

Recovery succeeded with network permission for the callback listener, write permission for Wrangler's saved configuration, and one fresh OAuth URL opened in a new Chrome tab. Wrangler confirmed `Successfully logged in`, then deployed successfully. No state checks were disabled or credentials added to the repository.

For future deployments:

1. Run the installed Wrangler `whoami` first. Use the existing session when valid.
2. If login is required, allow local network access and writes to `~/Library/Preferences/.wrangler`. Run `node node_modules/wrangler/bin/wrangler.js login --browser=false`.
3. Open only the URL printed by that running process, immediately in a fresh browser tab. Finish within two minutes. Do not reuse an older consent or callback tab.
4. Require the CLI success message, rather than relying only on a browser success page. If the attempt expires, close its tab before starting another attempt.
5. Deploy the prepared build with `node node_modules/wrangler/bin/wrangler.js deploy --config dist/server/wrangler.cloudflare.json`.

The installed Wrangler version was 4.92.0. These failures were resolved without changing its installed code or bypassing OAuth validation.

## Callback isolation recovery (15 October, subsequent deployment)

Repeated retries received stale browser callbacks with a different OAuth state, which closes Wrangler’s current callback server. Slow browser page loading also exceeded its two-minute local listener timeout. A temporary, loopback-only recovery process ran Wrangler’s callback listener on port 8981 and forwarded requests from the fixed port 8976 only when their state matched the active request. Unmatched callbacks received HTTP 409 without terminating the active login. A process-local timeout adjustment extended only the two-minute callback wait to ten minutes. No installed Wrangler source, state validation, PKCE checks, provider expiry, scopes or game files were changed by this recovery.

Wrangler then confirmed `Successfully logged in`, and deployment completed as version `652abc7f-ddc2-47b1-9132-fe9f764316e3`. The temporary listeners exited after login. This was a local recovery workaround; the normal supported login flow remains the first choice. Never reuse an old authorization tab or treat a browser success page as CLI success.
