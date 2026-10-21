# Oak Plaza Hotel East Airport — ACC-147

Implemented locally **18 October 2026**. **In progress / Partial**. This package adds the East Airport branch on Spintex Road, Dede Plaza. The separate East Legon hotel remains a different destination.

## References reviewed

- [Operator overview](https://oakplazahotel.com/accra/overview/) and [restaurant/bar page](https://oakplazahotel.com/accra/restaurant-bars/) confirm Lucida Restaurant, Joe’s Bar & Lounge and the wellness swimming pool. The contact page locates the branch near Palace Mall on Spintex Road.
- [Operator lobby photograph](https://oakplazahotel.com/accra/wp-content/uploads/2024/09/Hero4-scaled.jpg): cream finishes, beige upholstered seats with metal arms, tall woven pots, paired gold-framed mirrors and timber door surrounds.
- [Operator pool/wing photograph](https://oakplazahotel.com/accra/wp-content/uploads/2024/09/Hero3-scaled.jpg): cream/stone facade, blue glazing, navy roof edge, palms, curved main pool and adjoining round pool.
- [Operator pool gallery](https://oakplazahotel.com/accra/wp-content/uploads/2024/10/oak1-2048x1366.jpg): tan tile deck, dark woven loungers, beige cushions/parasol canopies, planted edge and diamond lattice fence.
- [Lucida photograph](https://oakplazahotel.com/accra/wp-content/uploads/2024/10/oak8.jpg): mustard/blue dining chairs, white linen and woven lidded buffet baskets on crossed timber stands.
- [Joe’s lounge photograph](https://oakplazahotel.com/accra/wp-content/uploads/2024/09/IMG_7642-scaled-2.jpg): grey upholstered seating, dark tables, stone columns and broad glazing.
- [Entrance photograph, Tripadvisor](https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2d/b6/89/55/caption.jpg?h=1100&s=1&w=1100): blue curtain wall, dark mullions, gold hotel lettering, suspended navy canopy and glazed Akwaaba entrance. Capture date unknown.
- Google Maps’ listing “Street View” opened an ordinary hotel-authored **November 2020** pool photograph and explicitly reported **No Street View imagery available here**. It is historical context only; this is not a completed Street View survey.

Operator photo capture dates are unknown. The 2024 upload paths do not establish capture dates or current surveyed condition. Research screenshots are retained under `review-artifacts/oak-plaza-*-reference.png`. No third-party photographs are runtime textures; the game geometry is original.

## Site and gameplay

The complete native outline of named building **1043889540** is preserved. Its western end receives the blue-glass facade, canopy, doorway and signage; cream wings have small dark-framed windows and stone strips. Approximate height, facade bay spacing and canopy dimensions are estimates. Native pools **1043889544** and **1344928034** remain in their mapped positions. Other native buildings, including Palace Hypermarket, are retained.

Arrival and doorway points, photo and directory interactions, palms and planters avoid native road corridors. The mapped west driveway loop remains open. The building, pools, raised canopy and physical foreground props have collision shapes. The server requires presence within **4 m** of the doorway.

Search **Oak Plaza Hotel East Airport**, explore there, and walk to the entrance. Four interpreted public areas connect through marked doors:

1. Reception/lounge: host, directory, timber desk, beige seating, tall pots and gilt mirrors.
2. Lucida: host, mustard/blue seating, dressed tables, buffet baskets and Worldfolk meal ordering.
3. Joe’s lounge: visitor seating, stone/glass backdrop and Worldfolk refreshments.
4. Pool terrace: curved water, coping, lattice edge, parasols, seating and loungers. Water is protected; this pass does not implement swimming.

Seating continues until the player stands up. Every area can return to reception and leave to outdoor play. Local staff and visitors do not inflate online-player counts. Purchases use existing server-owned Worldfolk prices and stock, with venue proximity checks; no real hotel menus, bookings or payments are implied.

Room layouts are compressed gameplay interpretations, not measured floor plans. Private rooms, actual gym access, precise levels, surveyed parking bays and shared interior poses remain out of scope. Further facade/detail work and physical-device acceptance remain required; **ACC-147 stays Partial**.

## Verification

- Focused unit checks cover bounded identity, East Legon separation, exact footprint, road/neighbour clearance, continuous outdoor visitor movement, reachable public hotspots/exits, persistent seats, server catalog stock, protected pool and finite batched geometry with unmerged animated ripples.
- A disposable local API account verifies remote entry/purchases are rejected, the doorway distance is enforced, identity/balance survive travel, injected prices are ignored and unrelated/driving purchases fail.
- Browser model review and full-game visit evidence are in `review-artifacts/oak-plaza-*.png`. Review harness: `tests/fixtures/oak-plaza-review.html`.

Final local verification: **31 unit/regression tests plus 1 API test passed**, production build succeeded, changed modules passed syntax and whitespace checks. Full-game browser walkthrough verified distinct East Airport/East Legon search results, arrival, clear straight doorway approach, all four public areas, persistent dining seating under movement input, reception return and outdoor exit. The QA walkthrough uses a disposable local player. Physical-phone frame rates and million-player capacity were not measured.
