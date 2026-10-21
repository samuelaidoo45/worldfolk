# Villa Monticello — ACC-142

Implemented locally **18 October 2026**. **In progress / Partial**, not deployed. This pass adds an original exterior and public reception/courtyard visit, based on current operator photographs and the bundled native footprint.

## References actually reviewed

- [Official hotel site](https://villamonticello.com/), [gallery](https://villamonticello.com/gallery/), [dining](https://villamonticello.com/dine/), [events](https://villamonticello.com/meeting-and-events/) and [FAQ](https://villamonticello.com/faq/). The FAQ explicitly distinguishes public courtyard dining from indoor guest/member dining. Opening hours differ between FAQ and dining pages; this implementation does not impose an unverified schedule.
- [Google Maps listing](https://www.google.com/maps/search/?api=1&query=Villa+Monticello+Accra) → “Street View” opened an **ordinary hotel-authored photograph**, not a navigable Street View panorama. The viewer identifies **Villa Monticello Boutique Hotel** and states **Image capture: Aug 2026**. Photo ID `CIABIhA2sVa5RPQ5oEGSymMl19wh`. The exact viewed URL is retained in `review-artifacts/villa-monticello-reference-source.json`. This is a dated facade reference, not a site survey.
- That facade shows a grey three-storey villa, shallow flat eaves, grouped black-framed windows with opening casements, a central projecting name canopy, glazed entrance/ground floor, square planters and a paved forecourt.
- [Reception desk](https://villamonticello.com/wp-content/uploads/2026/03/gallery28-scaled.jpg): dark panelled joinery, mirrored lower inserts, a central medallion, awards, globe pendants and pale finishes.
- [Lounge](https://villamonticello.com/wp-content/uploads/2026/03/villamonticello-slider7.jpg): blue wingback chairs, gold cushions, dark tables, a muted rug, stone wall and curtains.
- [Brasserie](https://villamonticello.com/wp-content/uploads/2026/03/gallery25.jpg): stone walls, black circular wine racks, high tables, pale/ochre chairs and hanging greenery/lights.
- [Courtyard](https://villamonticello.com/wp-content/uploads/2025/11/courtyard1.jpg): central square four-jet fountain, green floor, dark pergola, tied green curtains, string lights, woven seats with mauve cushions and glazed surrounding facades.

Official interior/courtyard photo capture dates are unknown. Upload directory years are not capture evidence. No third-party image is used as a runtime texture; screenshots are visual research only. See `review-artifacts/villa-monticello-*-reference.png` and the dated facade screenshot.

## Native site and authored exterior

The bundled POI **Villa Monticello (-0.1821382, 5.6089504)** lies inside native building **373795368**. Its full irregular outline is retained corner for corner; neighbouring building **2361407144** and all other source IDs are preserved. The map listing is approximately 7 m south of the bundled POI, within the same western main block. The native building is unnamed, so its hotel attribution is based on the enclosed POI and corroborating mapped location, not a named surveyed building record.

The west-facing main facade follows the dated photograph: grouped windows/casements, grey walls, flat roof edge, central entrance canopy/sign and planters. Approximately 10.5 m height, window dimensions and courtyard roof/pergola offsets are estimated. The C-shaped recess holds the interpreted fountain/pergola courtyard. No swimming pool or generic pitched house roof is added.

The clear western forecourt supports arrival, photo, bench and guide interactions. Paving and all outdoor activity points avoid mapped carriageways. Source roads retain their routes. The doorway uses a **4 m server entry check**. Native body, planters, fountain, chairs, pergola posts, bench and guide have corresponding collision shapes.

## Playable public visit

Search **Villa Monticello**, explore from the city map, then walk to **Enter Villa Monticello**.

- **Reception & lounge:** reception dialogue, hotel directory, dark wood/mirror desk, blue wingback seating, art, awards and pendant lights.
- **The Brasserie courtyard:** animated square fountain, green floor, pergola/string lights/curtains, woven seating, host/visitors and a meal/refreshment counter.
- **Guest/member dining:** a distinct Brasserie scene is visible through glazing. The public walking bounds stop at the glass, reflecting the operator’s access statement. No invented hotel membership, real booking or paid access is required to enjoy the game courtyard.
- Sitting and fountain watching continue until explicitly stopped. The courtyard door returns to reception; the lobby exit resumes outdoor gameplay. Local NPCs do not count as online players.

Both public rooms use compressed, interpreted layouts. They are not measured hotel floor plans. Private suites, member access, stairs, actual hotel reservations, real menus and real payments are outside this pass. Meals/water use the existing server-owned **Worldfolk** stock, prices and balances. The server checks venue proximity, not trusted per-room player coordinates.

## Verification

- **38 unit/regression checks passed**, covering this hotel, Lancaster, Airport View, Airport City/business and open maps. New checks verify exact outline and bounded alias merging, nearby road/neighbour clearance, entrance walk, continuous visitors, flood-fill reachability to every public hotspot/exit, persistent seating/watching, room returns, protected fountain, private dining boundary and fountain animation after batching.
- **2 serial local API checks passed** for Villa Monticello and Lancaster: identity/balance preserved, remote entry/purchases rejected, 4 m doorway enforced, injected prices ignored, unrelated furniture/driving purchases rejected.
- Production build and changed JavaScript syntax/whitespace checks passed.
- Isolated browser review covers exterior, reception and courtyard; full-game walkthrough verified map search → arrival → joystick walk to the doorway → custom reception → courtyard → persistent fountain watching and seating → return to reception → exit to outdoor play. Movement input does not cancel either activity. Starting the fountain interaction also turns the camera toward the water. A local disposable QA profile was used.
- Exterior geometry is bounded to 15 static batches before browser-only signage, with four dynamic water domes excluded from merging. The reference audit now accepts explicitly recorded capture months for recent photos, conservatively compared at month start without inventing a capture day. These are not physical-device frame-rate measurements.

Review harness: `tests/fixtures/villa-monticello-review.html`. Evidence: `review-artifacts/villa-monticello-exterior.png`, `villa-monticello-reception.png`, `villa-monticello-courtyard.png` `villa-monticello-gameplay-arrival.png`, `villa-monticello-gameplay-reception.png`, `villa-monticello-gameplay-seated.png` `villa-monticello-gameplay-fountain.png`.

Remaining: measured dimensions, named parcel/entry ground confirmation, precise room/courtyard circulation and levels, richer facade/weathering/landscape/furniture detail, private guest areas if later scoped, shared poses and physical-phone acceptance. **ACC-142 remains Partial.**
