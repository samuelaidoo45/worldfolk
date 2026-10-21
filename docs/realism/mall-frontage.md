# Accra Mall roadside shops and vendor frontage — ACC-263

First playable pass, 15 October 2026. **In progress, local only.** This is the trading strip south of Spintex Road, opposite the mall and west of the rear terminal access. It is separate from the mall-facing bus shelters and the mall's indoor store directory.

## Street View survey

The user supplied two **August 2024** screenshots: [eastward road view](../../review-artifacts/spintex-frontage-user-reference-1.png) and [western frontage](../../review-artifacts/spintex-frontage-user-reference-2.png). I opened the [Spintex panorama](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=5.6210436,-0.1734425&heading=250&pitch=0&fov=90), panned across the stalls and terminal entrance, then moved along the road to inspect further pitches. All three inspected road panoramas display **August 2024**:

| Panorama | Position (latitude, longitude) | Observed evidence |
|---|---|---|
| `ILtdRwTImkMxWt6H00Lr_Q` | 5.6210436, −0.1734425 | Open terminal access, umbrella-covered pitches, display tables, bare shoulder, secondary road, barrier line and an open rear roof frame. [East-end view](../../review-artifacts/spintex-vendor-east-reference-2024.png). |
| `CulfPDhkOrrf4OdnoTdXsQ` | 5.6209871, −0.1736657 | Mixed-depth awnings, open merchandise racks, small kiosks, large freestanding advertising panels, paved walking strip and jersey barriers. [Centre view](../../review-artifacts/spintex-vendor-centre-reference-2024.png). |
| `IV9UA8ike1g1G1IPCcGZYw` | 5.6209731, −0.173862 | Irregular open and closed pitches, bare gaps, structural frame, corrugated enclosures, tree cover and billboards of different proportions. [Westward view](../../review-artifacts/spintex-vendor-west-reference-2024.png). |

A first location lookup returned an **October 2020 indoor contributor panorama**. It was rejected as evidence of the outdoor frontage. No 2025–2026 capture is claimed for the strip.

The [current mall directory](https://www.accramall.com/accra-mall-stores) establishes indoor tenant identities, not the informal roadside roster. The [Global Media Alliance contact page](https://gmaworld.com/contact-us/) confirms YFM at Accra Mall/Spintex Road, but does not establish the precise roadside building facade. These places remain separately mapped; neither their names nor historical billboard brands are assigned to unidentified pitches.

## Implemented scene

- A bounded approximately 105 m trading apron, with ten interpreted pitches of different widths: open display racks, fabric awnings/umbrellas and metal kiosks. Hanging clothes, footwear/accessory displays, counters, a drinks cooler and low-emission strip lighting stay inside the pitches.
- Grey paved walking space and muted compacted ground, instead of a blanket orange or white floor. Rear roof framing and differently proportioned original Worldfolk panels reflect the surveyed structure type. No Street View pixels or old campaign artwork are used as game textures; no real advertiser contact numbers are republished. These panels are original wayfinding, not a new advertising publication path.
- The main road is OSM way **5032504**. The parallel paved service lane is OSM way **1337970093**. Barrier centres are derived between their mapped edges, and omitted where the widened game lanes leave insufficient clearance. This deliberately produces fewer barriers than the photo rather than obstructing the service lane. The terminal approach remains open. Road widths and pitch geometry are gameplay estimates, not a measured survey.
- `Accra Mall roadside shops` is searchable in the home map, 2D world and destination picker. Arrival places the player within reach of the shop counter on the pavement. Covered pitches are open to walk into; no invented private shop rooms are added.
- Three contextual hotspots: browse the counter, open the vendor work desk and talk to traders. Four local NPC traders and three bounded daytime shoppers use the existing scene system. They are not online players and do not represent the actual vendors.

## Game economy

Bottled water (₵4) and trainers (₵95) use the shared game catalogue and inventory. The counter filters to those items. These are virtual stock and prices, not claims about real traders or current retail prices.

The **Spintex roadside vendor (game role)** pays a base **₵95 per completed shift**, through the existing career system. Players prepare a clear pitch, serve an NPC and reconcile sales. Server checks require a parked player within 22 m of the counter, enforce task timing/order and correct answers, use server-owned prices/wages, and protect saves with revision checks. A duplicate completion cannot pay twice. Work and stock are game activities, not offers of real employment or sales.

## Acceptance and evidence

Geometry tests check counter reach from arrival, search identity, activities, road and minibus clearance, terminal access, corridor movement, NPC bounds, cover headroom and static batching. Local API tests use disposable registered accounts to check remote/driving purchases, unrelated stock, supplied price/wage tampering, wrong/incomplete tasks and concurrent completion.

Full-game browser review and final test/build results are recorded in [implementation progress](implementation-progress.md). [Overview](../../review-artifacts/mall-frontage-overview.png) and [counter view](../../review-artifacts/mall-frontage-counter.png) show the isolated model with native road alignment; wider scenery is omitted.

Remaining: dated current pitch-by-pitch photos, surveyed offsets/widths, individual business identity checks, stock/detail refinement, physical-device frame times, shared NPC/pose acceptance and wider frontage coverage. ACC-263 is **In progress**, not a complete or exact current reconstruction.

Next inventory item: **ACC-264 — Ghud Park**: confirm its built boundary, lawn, paths, seating and recreation facilities from current operator/event photographs; separate temporary tents from permanent facilities.
