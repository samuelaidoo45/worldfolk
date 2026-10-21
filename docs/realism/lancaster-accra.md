# Lancaster Accra Hotel — ACC-143

Implemented locally **18 October 2026**. **In progress / Partial**. This pass adds a distinct exterior and playable public visit, using operator photographs and the bundled OpenStreetMap geometry.

## References reviewed

The [official hotel website](https://www.lancasteraccra.com/) and [gallery](https://www.lancasteraccra.com/gallery) were reviewed in the browser. [GLAHCO](https://glahco.gov.gh/hotels-3/) corroborates the hotel identity and ownership. Current branding is Lancaster Accra; the older Golden Tulip name remains a geographically bounded search alias.

Visually inspected official assets:

- [Atrium/reception](https://www.lancasteraccra.com/files/content/1782746255155-d4932dc1.jpg): soaring timber ceiling, dark rafters, starburst lamps, tall indoor trees, pale reception counters, turquoise/navy/ivory chairs. The [stair/atrium view](https://www.lancasteraccra.com/files/content/1782746186715-fff7da44.jpg) confirms a tall pitched hall and upper circulation; the stairs/gallery are not implemented in this pass.
- [Branche](https://www.lancasteraccra.com/files/content/1782742433250-3216701d.jpg): pale wood/cream dining room, dark circular lattice ceiling details, round columns with vertical light strips, upholstered chairs and dressed tables.
- [Outdoor pool](https://storage.googleapis.com/hotels-bucket-media/acra/legacy/f48961d41b-slider1.webp) and [night pool view](https://storage.googleapis.com/hotels-bucket-media/acra/legacy/b6ff2cbb9b-slider2.webp): irregular pool, floral floor mosaic, terracotta paving, palms, pale umbrellas and a cream wing with broad greenish windows/dark X trim.
- [Tennis grounds](https://storage.googleapis.com/hotels-bucket-media/acra/legacy/7e06cf3866-slider4.webp) and [chalets](https://storage.googleapis.com/hotels-bucket-media/acra/legacy/3a801377af-slider5.webp): blue/green court with white markings; cream chalet walls, red gables and lawns. The court is rendered at its native polygon. Neighbouring chalet structures are preserved, not replaced with invented whole-property geometry.

Photo capture dates remain **unknown**. Website copyright, upload timestamps and `legacy` asset names are not capture evidence. No current Street View panorama or measured hotel floor plan was obtained. Screenshots are saved under `review-artifacts/lancaster-*-reference.png`. Third-party photographs are research only; runtime materials and geometry are original.

The operator page also contains an “oceanfront/private beach” template claim. Lancaster is inland beside Liberation Road, and the reviewed imagery shows a garden pool. **No beach or ocean is added.** Java Café is named by the operator, but its exact room layout is unverified and interpreted in the game.

## Site and exterior

- Exact native main-building outline **477043780**, pool **501956300** and tennis polygon **477044060**, extracted from the bundled Accra data. No neighbouring building source IDs are removed.
- Cream guest wings, broad framed windows, dark X trim, parapets, current Lancaster signage and a tall interpreted atrium roof. Native footprint is preserved, while approximately 11.5 m wing height, atrium roof height/location and facade spacing remain photo-informed estimates.
- The native service way **250978137** runs beneath the east entrance roof. The eastern canopy starts at 4.3 m, with separate solid supports, leaving walkers and a trotro passage. Main hotel walls remain solid. The entry portal is on the clear east approach, not inside the driveway.
- Pedestrian paving avoids all nearby mapped carriageways. Arrival, guide, bench approaches and local visitor paths are checked against native buildings/roads and authored solids.
- Outdoor pool uses its native outline and has protected water. A terracotta deck, palms, umbrellas and floral mosaic establish the garden setting. The tennis court keeps its mapped location.

## Public visit

Choose **Lancaster Accra Hotel** from the city map/search, explore, then walk to **Enter Lancaster Accra Hotel**. Server entry requires being within 4 m of the authored entrance.

1. **Timber atrium & reception** — host dialogue, directory, indoor trees, starburst lights and lounge seating.
2. **Branche Restaurant, Bar & Lounge** — dining host, dressed tables, light-strip columns, circular ceiling lattice and game meal counter.
3. **Java Café** — interpreted cafe, refreshments, seating and host.
4. **Outdoor pool & gardens** — protected polygon pool, terracotta deck, palms, umbrella seating, garden visitor and refreshments.

Marked doors connect all public areas and return to reception; the lobby exit returns outside. Sitting persists until the player explicitly stands up. The indoor layout is deliberately compressed and is **not a surveyed hotel floor plan**. Upper stairs/gallery, private guest rooms, actual reservations, swimming and tennis gameplay are outside this pass.

The two-item stock uses existing server-owned **Worldfolk** water/meal prices and balance. Branche shows both items; cafe/garden UI filters show water. Server authorization covers the venue stock and outdoor entrance, not trusted per-room player positions. No real hotel prices, transactions or endorsement are implied. Staff/visitors are local NPCs and do not increase real online counts.

## Verification

- **37 unit/regression checks passed**, covering Lancaster plus Airport View, Airport City/business, Galleria and open maps. Lancaster checks exact outlines, bounded aliases, road clearance, arrival-to-door walk, open trotro canopy passage, continuous NPC routes, reachable indoor hotspots, persistent seating/room returns, protected water and finite/batched geometry.
- **2 local API checks passed**: Lancaster and Airport View entry/purchases preserve player identity/balance, reject remote entry and purchases, enforce the 4 m Lancaster doorway, ignore injected prices, reject unrelated furniture and reject purchases while driving.
- Production build and changed-module syntax/whitespace checks passed.
- Exterior static geometry batches **1722 → 17** before browser-only signage. Public scenes are bounded by unit tests. These counts are not physical-device frame-rate measurements.
- All four rooms and the exterior reviewed in the isolated browser preview. Full game walkthrough: menu → map search → Lancaster arrival → joystick walk to the door → custom atrium → Branche door → dining seat. Movement input while seated keeps the player seated; Stand up remains available. The walkthrough also verified returning to reception, using its exit and resuming outdoor gameplay. The local disposable QA player was used. All room return paths are additionally covered by flood-fill/controller tests.

Evidence: `review-artifacts/lancaster-exterior.png`, `lancaster-atrium.png`, `lancaster-branche.png`, `lancaster-cafe.png`, `lancaster-garden.png`, `lancaster-gameplay-atrium.png`, `lancaster-gameplay-branche.png` and `lancaster-gameplay-seated.png`. Review harness: `tests/fixtures/lancaster-review.html`.

Remaining: dated current frontage/room references, measured roof/entrance and circulation, richer garden/weathering details, stairs and accessible upper-gallery routes, accurate Java Café plan, whole-property chalets, shared indoor poses and phone hardware acceptance. **ACC-143 remains Partial.**
