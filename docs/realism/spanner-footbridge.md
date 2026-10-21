# Spanner pedestrian footbridge — ACC-259

Updated 13 October 2026. First playable reconstruction; not a surveyed replica.

## Active references — reviewed 15 October 2026

Use the [current reference register](current-reference-images.md) and its image-specific dates. Previous source lists are retained in [the historical archive](historical-references.md).

- [Google Ghana Street View imagery update](https://blog.google/intl/en-africa/products/explore-get-answers/experience-the-vibrant-beauty-of-ghana-like-never-before-with-updated-street-view/) — **published 2026-06-17; capture date unknown**. Includes Independence Square, National Theatre, National Mosque and Ussher Fort images and a stadium viewing link. Release date does not date each panorama. Other subjects are inspection targets, not individually verified captures.

- [Spanner road-level panorama](https://www.google.com/maps/@5.620193,-0.1763767,3a,90y,90t/data=!3m7!1e1!3m5!1sRDz9mNJISzlPIbkKsBHD9A!2e0!7i16384!8i8192) — **captured September 2024**, visually reviewed with the available date timeline. Replaces the 2016 view for arches, hangers, railings, ramps and roadside surfaces; it does not verify 2026 condition. A nearby deck panorama is from March 2018.

**Current close-up gap:** verify Spanner’s exact deck, stairs, railings, barriers and benches against a dated local image/panorama. Do not substitute Kaneshie, Shiashie or another footbridge. The 2016 bridge photos establish historical structure only. Preserve the bundled OSM placement until a verified correction is available.

## Implemented

- Twin silver arches, overhead X braces, hangers, flange rings, railings, concrete supports and stair nosings.
- Both mapped stair routes and return ramps join the raised deck. Stair tops level out before entering the deck; rail openings stay clear at bends and joins.
- Height-aware floor and guard collision: people cross above the highway while ground-level vehicles pass underneath. Approach supports and stair footprints remain physical obstacles.
- Searchable destination and safe arrival on the mall-side approach, with the camera facing the crossing.
- Bounded deck visitors and a persistent **Watch traffic from Spanner bridge** activity using the existing action system.
- Shared geometry definitions drive rendering and navigation; static geometry is batched into at most eight meshes in the focused test.

## Verification

- Six bridge tests cover ascending/descending both stairs and ramps, guard edges, vehicle clearance, search/arrival, activity height, rendered floor alignment and bounded visitors.
- Combined bridge/navigation/precinct/apartment regression run: **25 passing tests**.
- Browser fixture completes the stair route (8/8 waypoints) and return-ramp route (9/9) at ground level without blocking. Deck and overview views inspected.
- Full local game: selecting Spanner on the city map arrives at the correct stair approach and renders the bridge with Villaggio behind it; no captured console errors during that visit.
- Production build passed. No deployment performed for this bridge pass.

Evidence: [overview](../../review-artifacts/spanner-overview.png), [deck](../../review-artifacts/spanner-deck.png), [full-game arrival](../../review-artifacts/spanner-gameplay.png). The fixture's road/background is schematic; the full game uses the existing map terrain and road network.

## Remaining

- Current photographs/surveyed heights, landing details, drainage, rail joints and material weathering.
- Full interchange grades, roadside surfaces and connected footpaths. Bus-stop seating and terminal activity have separate inventory items.
- Pedestrians currently patrol the deck; complete stair-to-street NPC journeys are not included.
- Multiplayer elevation broadcast and phone frame-time acceptance for this bridge remain unverified. Existing shared elevation validation is used; unit tests are not a multi-device load test.
