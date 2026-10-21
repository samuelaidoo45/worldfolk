# Accra vehicle reference and implementation pass

Updated 13 October 2026.

The fleet now has twelve distinguishable ground-vehicle families. These are original, lightweight procedural models informed by photographs and manufacturer material; they are **not licensed replicas, scans or a complete inventory of every make on Accra's roads**. Source photographs are reference links, not game textures. Vehicle names, prices and number plates in the game are fictional.

## Active references — reviewed 15 October 2026

Use the [current reference register](current-reference-images.md) and its image-specific dates. Previous source lists are retained in [the historical archive](historical-references.md).

- [Toyota Ghana current official vehicle range](https://gh.toyotacfao.com/) — **capture date unknown**. Use current Ghana catalogue as a body/specification reference, not evidence that all Accra vehicles are new models.
- [Toyota Ghana Coaster](https://gh.toyotacfao.com/en/range/toyota-ghana/coaster) — **capture date unknown**. Undated official product imagery; confirm exact generation and local livery separately.
- [Toyota Ghana Hilux](https://gh.toyotacfao.com/en/range/toyota-ghana/hilux) — **capture date unknown**. Undated official product imagery; confirm exact generation and local livery separately.
- [Toyota Ghana Hiace GD](https://gh.toyotacfao.com/en/range/toyota-ghana/Hiace-GD) — **capture date unknown**. Undated official product imagery; confirm exact generation and local livery separately.
- [Toyota Ghana Corolla Sedan](https://gh.toyotacfao.com/en/range/toyota-ghana/corolla-Sedan) — **capture date unknown**. Undated official product imagery; confirm exact generation and local livery separately.
- [Toyota Ghana RAV4](https://gh.toyotacfao.com/en/range/toyota-ghana/rav4) — **capture date unknown**. Undated official product imagery; confirm exact generation and local livery separately.
- [CFAO Ghana Toyota and Hino distribution update](https://www.cfaogroup.com/en/cfao-mobility-strengthens-its-commitment-to-ghana-with-the-official-launch-of-toyota-tsusho-manufacturing-ghana-ttmg-2/) — **published 2026-02-16; capture date unknown**. Replaces the erroneous Hilux link previously labelled Hino. Establishes Ghana distribution only; a truck close-up is still needed.
- [Ghud Park Absa Auto Fair photographic report](https://www.citinewsroom.com/2026/08/day-one-of-absa-auto-fair-in-pictures/) — **published 2026-08-23; capture date unknown**. As-built lawn, temporary exhibition tents, light poles, people and vehicles. Temporary tents are not permanent park architecture. Full park layout and bench details remain unverified.
- [Accra aboboyaa reporting and image source](https://www.citinewsroom.com/2026/07/dvla-over-90-of-aboboyaa-in-accra-operate-without-side-mirrors/) — **published 2026-07-22; capture date unknown**. Article date alone cannot establish when the photograph was taken; require a dated Accra vehicle photograph before accepting livery/wear.

Current manufacturer galleries establish a selected body generation, not Accra’s complete fleet or local taxi/trotro livery. The 2026 Ghud Park photograph shows an event-display SUV, not a typical taxi. Dated street close-ups are still needed for taxis, older tro-tros, delivery trucks, commuter motorcycles, bicycles and cargo tricycles. The Hino-labelled Hilux URL is rejected; the 2019 motorcycle essay and older transport images are historical context only.

## What is integrated

- One factory supplies local/player-owned, ambient and remote-player 3D vehicles.
- Tro-tros, trucks, bicycles and cargo tricycles appear in the existing shop with virtual prices. Existing server purchase/ownership validation still applies.
- Ambient selection avoids heavy vehicles on narrow roads and bicycles/cargo tricycles on highways, including at subsequent junctions.
- Shared dimensions feed both movable-object collision solvers and wall sampling; long vehicles test their whole length. Truck following clearance accounts for length. Bicycles have a sensible pedal-speed cap and no engine audio.
- Independently rolling and steering wheels use two instanced draws per vehicle. Wheel geometry and sign textures are cached. Lamps react to night and braking.
- 2D vehicle footprints reflect each family's size. No map data, API credentials or external image services were added.

## Acceptance and remaining work

Use `tests/fixtures/vehicle-review.html` through a local static review server. It contains commuter, private, commercial and cycle groups, steering, rolling, braking and night controls. This fixture is not part of the published app.

Focused tests cover all twelve factories, finite geometry, wheel counts, render budgets, purchase catalogue entries, road eligibility, matching collision dimensions, long-vehicle wall stopping/reversing, minibus windows, and silent bicycle audio.

These assets remain stylized browser-game models. Further realism needs higher-detail authored body panels, varied real fleet liveries, suspension travel, articulated door operation, accurately fitted rider/driver IK, projected headlight beams and wider mobile performance testing. Aircraft, articulated lorries, tankers, refuse trucks, ambulances and dirt-bike variants remain outside this ground-fleet pass. The reference list is not a claim to have surveyed every vehicle in Accra.
