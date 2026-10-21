# Airport View Hotel — ACC-146

Implemented locally **18 October 2026**. **In progress / Partial**, not deployed. This pass replaces the generic hotel visit with an authored exterior and four distinct public areas.

## References actually reviewed

The hotel's [official website](https://www.airportviewhotels.com/), [restaurants page](https://www.airportviewhotels.com/restaurants.html) and [facilities page](https://www.airportviewhotels.com/facilities.html) loaded in the browser. Its exact photo assets were inspected:

- [Facade](https://www.airportviewhotels.com/images/bg_1.jpg): white and charcoal panels, paired windows, glazing at the end of the block, stone accent, layered parapet and blue rooftop name. Lower wing, entrance planting and flags provide context. Capture date unknown.
- [Reception](https://www.airportviewhotels.com/images/image_66.jpg): pale counter with horizontal wood slats, four wall clocks, wood ceiling slats, pale finishes and glazed doors. Capture date unknown.
- [CIBO restaurant](https://www.airportviewhotels.com/images/food/restaurant.jpg): wood finishes, a circular ceiling feature, dressed tables with dark chairs/red napkins, stone columns, window lounge seating. Capture date unknown. The operator describes four seating settings; the game does not claim to reproduce the entire restaurant floor plan.
- [Covered pool](https://www.airportviewhotels.com/images/pool.jpg): long rectangular pool, red coping, stone columns and arch beams, green deck edges, seating and a bar beyond. Capture date unknown. Swimming is not implemented; collision keeps visitors on the deck.
- [Luna terrace](https://www.airportviewhotels.com/images/food/terrace.jpg): dark woven-style sofas with pale cushions, glass tables, green floor and pale metal railing. The operator places Luna on the third floor and describes terminal/city views. The game skyline is an approximation.

[Google Maps hotel listing](https://www.google.com/maps/search/?api=1&query=Airport+View+Hotel+Accra) verifies the location at Airport Junction. Its “Street View 1” opened an ordinary Gerard Nartey facade photograph, **capture April 2023 / Photo June 2023**, not a navigable current Google Street View panorama. That historical photo and the aerial were checked for contextual massing/access; ©2026 imagery attribution is not evidence of capture date. No current panorama was obtained. The unrelated `timemacro.com` search result was not accepted as the operator site.

Saved browser reference views are in `review-artifacts/airport-view-*-reference.png`; dated map photo is `airport-view-map-photo-reference-2023.png`. Images are visual research only. No third-party photo or Google imagery is imported into runtime textures.

## Geometry and location

- Canonical visit **Airport View Hotel**, aliases **Airport View** and **Airport View Hotel Accra**. Nearby mapped aliases merge in search; a same-named hotel outside the spatial check is preserved.
- Exact native lower-wing outline **2488138302** (OSM area ID) is retained corner for corner. It is the only replaced source way. Native neighbours **2477426404, 2488142354** and others remain untouched.
- The taller north block is **absent from the bundled building extract**. Its 14 × 30 m mass, approximately 21 m height, 10° alignment, facade spacing, parapet, glazing and entry offsets are photo/aerial interpretations. This is not a surveyed outline or exact whole-property model.
- Layered white/charcoal facade, white window frames, end glazing, stone strip, rooftop lettering, low wing windows, a canopy, flags, bench and guide. Safe arrival/entrance sit outside the vehicle lanes. Generated small pavement pieces are tested against all native driveways/buildings instead of putting a single slab across the forecourt road.
- Public walking and vehicle clearance use the same authored solids. Exterior visitors stay off native carriageways; NPCs do not increase the online player count.

## Playable public visit

Use the highlighted entrance from 2D or 3D gameplay. Server entry requires proximity to the actual authored door. The custom interior is selected before generic hotel rooms:

1. **Reception & Café de Vie:** host dialogue, directory, cafe refreshments, sofa seating and the building exit.
2. **CIBO restaurant:** dressed dining tables, wood floor/ceiling, circular ceiling detail, window seating, host and meal counter.
3. **Covered pool & bar:** protected pool water, arch/column forms, deck seating and refreshments.
4. **Luna rooftop lounge:** terrace sofas, green floor, rails, counter, seating, persistent dancing and interpreted distant airport silhouette.

Lift hotspots connect all four areas and provide an explicit return to reception. The layout is compressed and interpreted from photos; private guest rooms, live hotel reservations, real menus and payment are not represented. Sitting/dancing continue until the player explicitly stops. Local hosts/guests are scenery.

Counters offer only **Worldfolk water and meal stock** using the existing server-owned catalogue and balance. Café/pool/rooftop UI filters show water; CIBO shows both items. Server authorization permits the two-item hotel food catalogue, not a separate trusted per-room position (room movement is local). Prices are fictional game prices. No real hotel price, booking or endorsement is implied.

## Verification and remaining acceptance

- **30 unit/regression checks** pass: canonical identity, native outline, arrival/entrance/activities, approach walking, furniture vs native roads, continuous visitors, flood-fill reachability to every interior hotspot, persistent activities and lift return paths, protected pool, finite/batched geometry, neighbouring venues and 2D map style.
- **6 serial local API checks** pass: hotel entry/purchases/profile preservation plus Galleria and Marina regression cases. Remote entry/purchases, injected prices, unrelated furniture and purchases while driving are rejected or correctly priced by the existing server rules.
- Full game browser: city map → hotel visit → walk to highlighted doorway → custom reception → CIBO lift → restaurant seat. Continued movement does not cancel the seat. All four areas were visually reviewed in the isolated model preview. Exact phone hardware performance, shared interior visitors and multiplayer poses remain unverified.
- Exterior static geometry: **725 → 13** material batches before browser-only text. Room batch counts are bounded by tests. Production build and syntax/whitespace checks pass. These are not physical-device frame-rate measurements.

Evidence: `airport-view-exterior.png`, `airport-view-reception.png`, `airport-view-cibo.png`, `airport-view-pool.png`, `airport-view-luna.png`, `airport-view-gameplay-arrival.png`, `airport-view-gameplay-reception.png`, `airport-view-gameplay-seated.png` in `review-artifacts/`.

Still needed: dated current exterior/interior references, measured tower/perimeter/entry positions, full lobby/restaurant layouts, precise pool and roof dimensions, detailed greenery/facade/weathering, private-room activities, accessibility continuity and shared/device acceptance. **ACC-146 remains Partial.**
