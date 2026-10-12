# Friend calls

Private calls require accepted friends, an authenticated account, microphone permission,
and an online recipient. Call/Answer obtains consent for the microphone; accepted calls
start unmuted. City voice remains push-to-talk. Closing the panel or switching tabs does
not silently mute a private call; Hang up stops all tracks. The call banner exposes
connection state, mute, reconnect and an Enable audio button when autoplay is blocked.

Audio uses peer-to-peer WebRTC. Trickle ICE forwards late-discovered candidates and queues
candidates received before SDP. One elected peer offers; messages are serialized and
transient signaling failures retry. Session IDs prevent stale polls joining another room.
Room membership and friendship are checked on the server for SDP and ICE signals.

## Relay for mobile/restricted networks

STUN alone cannot connect all networks. Configure Worker secrets `TURN_KEY_ID` and
`TURN_KEY_API_TOKEN` from Cloudflare Realtime TURN. `server/voice-ice.ts` mints expiring
24-hour credentials only after authenticated voice-room authorization. The long-lived
key is never sent to the browser. Join requests are limited per player. Reconnect refreshes
credentials; calls longer than 24 hours need reconnecting. TURN is a metered service.

Official setup: https://developers.cloudflare.com/realtime/turn/generate-credentials/
If no keys are configured, direct connections remain available. A failed relay provider
fails the join rather than misleadingly reporting a successful relayed connection.

## Checks

- `node --test tests/voice-peer.test.mjs`: candidate ordering, elected offerer, teardown.
- `node --test tests/friend-calls-api.test.mjs`: accepted-friend permissions, third-player
  isolation, SDP/ICE forwarding, expiry and hangup. Run against local port 3001 only.
- Serve `tests/fixtures/voice-loopback.html` temporarily as `/voice-loopback.html` on the
  local preview: real two-peer WebRTC with synthetic audio and received-byte assertions.
  This is a transport check, not proof of two devices connecting through different NATs.

## In-game notifications

The existing contacts poll also fetches an authenticated, incremental private-message
feed every 2–3 seconds while the game is open. Incoming calls display the caller's
handle with Answer/Decline; a synthesized ringtone repeats while ringing. Chat
alerts show a preview, unread count and a shortcut to the sender's private chat.
Minimizing keeps a compact unread button. Reading a conversation clears its alerts.
Message sounds and ringing respect the game's sound switch and browser audio rules.

Alerts stay at the screen edge, with 44px touch targets in portrait and landscape.
They are hosted inside an open modal when needed so its backdrop cannot block the
Answer, Decline or reply buttons. Incoming calls take priority over message previews.
They do not request microphone access until the player chooses Answer.

Unread notification state is per browser session, with no message bodies saved to
local storage. Existing conversation history remains in the database. Opening or
reloading the game starts watching new messages; this is not an offline/push service.
A recipient gets only their private channels; outgoing, muted and repeated feed
messages do not trigger alerts. No extra notification polling loop is added.

Checks: `node --test tests/game-notifications.test.mjs tests/game-audio.test.mjs
 tests/notifications-api.test.mjs` (API test needs the local preview on port 3001).
Browser verified: receipt during gameplay, open/reply, minimize, call above an open
profile, Decline reaching the server, portrait/landscape layout, and no console errors.
Microphone audio across two physical devices was not retested for this UI change.
