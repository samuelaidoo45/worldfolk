# Ghud Park — ACC-264

First playable pass, **15 October 2026**. In progress; local only. This is the recreation park east of Accra Mall, west of the SMAC sports complex. It is separate from the mall's rear trotro terminal, southern trading frontage and western bus stops.

## References reviewed

| Evidence | Date and what it establishes |
|---|---|
| [Operator facilities and access FAQ](https://www.ghudpark.com/user/FAQs) | Checked 15 October 2026. Lists lawn/concrete trail, skating rink, playground, Beer Garden, washrooms, rentals, seating and mall-car-park access beside the Samsung sign. Facility names and function; not measured geometry. Real admission/rental prices are not implemented as game charges. |
| [Operator walking article](https://www.ghudpark.com/blog-detail/7/ghud-park-expands-community-wellness-with-weekly-evening-walks-and-monthly-walk-talk) and its [image](https://www.ghudpark.com/images/upload/6a70aa9d739ba.jpeg) | Published 3 August 2026; underlying photo capture unknown. The poster shows a paved path, hedge edge, open lawn and group walking with the Signature in the background. [Review capture](../../review-artifacts/ghud-walk-reference-2026.png). The published 5 km programme does not mean one physical lap is 5 km. |
| [Ghud Park owner photos on Maps](https://www.google.com/maps/search/?api=1&query=Ghud%20Park%2C%20Accra%20Mall%2C%20Accra%2C%20Ghana) | The gallery displays **February 2025** for the owner’s plaza photo `CIABIhAA3jU3PSXmXGe8xEEAC8_6` and playground photo `CIABIhADyc5Uvzdb8Ge8xH4ACy7c`. Striped paving, colourful cafe furniture, picnic tables/closed umbrellas, container kiosks, string lights; blue/yellow towers, slides, swing and red seesaw. [Plaza](../../review-artifacts/ghud-plaza-reference-2025.png), [playground](../../review-artifacts/ghud-playground-reference-2025.png). No exact day inferred. |
| Same Maps gallery, Kekeli Buckner | **September 2024**, photo `CIHM0ogKEICAgICni_Gq4QE`: paved trail, open grass and white-framed rink panels. [Review capture](../../review-artifacts/ghud-rink-reference-2024.png). Historical comparison only. |
| [Absa Auto Fair report](https://www.citinewsroom.com/2026/08/day-one-of-absa-auto-fair-in-pictures/) | Published 23 August 2026; capture not independently dated. First image visually reviewed: mixed green/dry grass, light poles and temporary exhibition tents. [Review capture](../../review-artifacts/ghud-auto-fair-reference-2026.png). Event tents, display cars and sponsor campaigns are not permanent park architecture. |
| Maps site context and bundled OSM roads | [Context reviewed](../../review-artifacts/ghud-site-context-2026.png) on 15 October, imagery capture unknown. Establishes northern lawn and southern paved recreation/social areas. The copyright year is not a capture date. OSM ways 659303347 (west service access), 302931449 (east service access), 303442832 (north road) and 314531067/526047349 (Spintex approach) constrain placement. |

The earlier 2024 development illustration remains archived as a **concept**, not as-built evidence. No reference pixels, historical advert artwork or visitor identities are imported into the game.

## Implemented

- Dedicated searchable outdoor Ghud Park destination and western arrival, connected to the home map, 2D world, route picker and 3D exploration. The entry guide and activity rings are reachable on foot.
- Approximately 84 × 150 m interpreted site envelope: worn green lawn, grey loop trail, striped social plaza, gravel/sand surfaces, coloured container facilities, picnic/cafe furniture, bins, low fencing, trees and hedges. The site is not a surveyed OSM park polygon; the extract contains only a wider commercial land-use boundary here. Heights and furniture counts are estimates.
- A white-framed recreation rink with an open west gate; recognisable blue/yellow playground towers and slides, green bridge rails, swing and red seesaw. Equipment is scenery; there is no claimed skate simulation, rideable playground or walkable tower/stair subsystem in this pass. The adjacent SMAC football pitch is not mislabelled as part of Ghud Park.
- Four lawn bench activities and one picnic seat. Sitting lasts until E/Stand up; dance at the plaza lasts until E/Stop activity. Dancing uses existing original procedural game music when sound is enabled. Watch/read/photo hotspots explain the park and frame its lawn/recreation areas.
- Six bounded trail walkers and three social NPCs, daylight/evening only, through the existing local crowd system. These are game characters, do not count as connected players and do not represent named real visitors. Player seats stay unoccupied by scenery NPCs.
- Solid furniture/equipment footprints, clear service roads and entrance; batching shares static materials. String lights use emissive bulbs rather than allocating per-bulb real-time lights. No extra network polling, tickets, real payments or database migration.

## Verification and limits

Focused geometry tests cover search identity, arrival reach, all activity approaches, entrance crossing in both directions, complete trail traversal, source-road/minibus clearance, NPC paths, geographic rotation versus rendered towers, collision furniture and bounded batches. Full-game browser checks and build results are in [implementation progress](implementation-progress.md).

[Overview](../../review-artifacts/ghud-park-overview.png), [plaza](../../review-artifacts/ghud-park-plaza.png), [playground](../../review-artifacts/ghud-park-playground.png) show the isolated model; the wider district is omitted. [In-game seating](../../review-artifacts/ghud-park-gameplay-seated.png) shows the integrated visit.

Remaining: measured boundaries and entrance gradient, current 2026 ground close-ups for every facility, precise kiosk identities/locations, operating equipment and sports mechanics, shared crowd/seat state, and physical-phone frame-time acceptance. This pass is recognisable and playable, not a photorealistic or exact present-day reconstruction.

Next mall-district inventory item: **ACC-175 — Tetteh Quarshie Interchange**, including separate road levels, ramps, pillars, merges and pedestrian links.
