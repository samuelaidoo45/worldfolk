# Multiplayer admission and starting homes

## Current implementation

New players receive a server-randomized home from the Accra residence catalogue.
Their position, primary home, owned property and starting place all reference that
same home. Each property is identified by the owner's UUID and catalogue home ID:
players may live at the same virtual development but have separate private homes.
Existing players keep their saved homes, wealth and progress. Starting wealth is
still randomized independently. These are game residences, not claims of ownership
of real Accra buildings.

Realtime connections use three Cloudflare Durable Object namespaces:

- `WORLD_SESSIONS`: a persistent per-player pointer to the active simulation room.
  Reconnects checkpoint and close the previous socket, then prefer the same room.
  HTTP actions resolve that pointer using the authenticated player ID, never a
  room name supplied by the browser.
- `WORLD_ALLOCATORS`: one admission allocator per geographic district. When a
  simulation instance fills, the allocator advances to another instance. There is
  no fixed total player count or fixed number of district instances in code.
- `WORLD_ROOMS`: bounded simulation groups of up to 128 live sockets, with existing
  movement validation and checkpointing. That number bounds message fan-out; it
  no longer rejects the 129th player from the district or app.

Players see the players in their current instance. Different instances of the
same district are not one shared crowd; friend/party instance selection is not
implemented. Nearby visibility across district boundaries is also not implemented.
The client reconnects on crossing a district boundary. Old geographic rooms remain
supported for checkpointing existing sessions during this deployment.

## Verification

Run the built local preview on port 3000, then:

```
node --test tests/registration-home.test.mjs
node --test --test-concurrency=1 tests/multiplayer-capacity.test.mjs tests/realtime-api.test.mjs tests/life-api.test.mjs
```

Integration fixtures use only the local D1 database. Capacity tests open 130
connections in one district, verify overflow admission, movement visibility,
session replacement and affinity, private-state isolation and HTTP checkpointing.
They are a functional overflow test, not a production load benchmark.

## Before a million-player launch

This change is not certification for a million concurrent players. Significant
remaining capacity work includes:

- Partition persistent player writes: all gameplay currently uses one D1 database.
- Replace broad 15-second world polling and city-wide chat reads with scoped streams.
- Redesign voice: the current voice circle admits six people globally.
- Measure room broadcast throughput, connection churn, boundary movement, database
  contention, latency, memory, map-service usage and costs under sustained traffic.
- Add operational admission/backpressure, monitoring and account-level quotas with
  Cloudflare, and a recovery-tested rollout plan.

Cloudflare platform limits still apply:
https://developers.cloudflare.com/durable-objects/platform/limits/
