# Player accounts

Registration is required to enter the world. Players choose their own username and
password. Existing unregistered lives may be claimed by their authenticated owner.
Public profiles expose handles, never credentials.

## Credentials and recovery

- Case-insensitive usernames: 3–24 ASCII letters, digits or underscores.
- Passwords are chosen by the player: 15–128 characters, spaces and memorable words
  accepted with no special-character requirement. Existing users can choose Change
  password in their profile; the current password is required and old sessions are revoked.
- Password storage: salted scrypt (N=32768, r=8, p=3, 32-byte output).
- A random 192-bit recovery code is shown once at account creation. Only its
  SHA-256 digest is stored. Recovery rotates the password, session and recovery
  code. Users must save the code; there is no email recovery or email verification.
- No credentials are placed in localStorage, logs, URLs or public player views.
- Registration, sign-in and recovery have atomic per-IP and per-username attempt
  counters (30/IP and 12/username per 15 minutes). One scrypt operation at a time
  per Worker isolate limits memory pressure; busy callers retry.

## Sessions

One active game session per player. Login checkpoints/disconnects an old live
socket before rotating its token. Logout revokes the token, closes live presence
and removes voice participation. Account cookies are HttpOnly, SameSite=Lax and
Secure on HTTPS, with a 30-day server-enforced expiration only when Remember me is selected. Otherwise
the cookie lasts for the browser session, with a 24-hour server expiry. Browser session
restore can retain session cookies; sign out on shared devices. Native username/current-password/
new-password autocomplete supports browser password managers. No plaintext password is
stored by the application. HTTP game, realtime and
voice endpoints share the session lookup. Public player UUIDs cannot sign in.
Legacy unregistered cookies can claim their own existing life, but cannot enter multiplayer.
Guest rows remain on the server; this feature does not promise anonymous or
zero-retention play. Existing guest progress is not reset by the migration.

Migration: `drizzle/0006_past_nightshade.sql` adds accounts, login-attempt counters
and a default-zero session expiry column. Apply it before deploying this version.
It only adds tables/columns; it does not rewrite existing lives.

Tests: `node --test tests/auth-api.test.mjs` against the local preview on port 3001.
Covers guest upgrade, password rejection, origin checks, session rotation,
checkpoint/disconnection, cross-session resume, password/recovery storage,
one-time recovery, expiry, player-ID spoofing, duplicate ownership and throttling.
