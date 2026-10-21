# Spanner and Accra Mall bus-stop seating — ACC-262

Updated 15 October 2026. **In progress; local only.** The mall-front row and the opposite mall-facing seating/taxi frontage now have separate authored models and searchable destinations. Spanner retains its estimated first pass.

## Reference evidence

| Location | Evidence | Limits |
|---|---|---|
| Mall-front seating | [Direct front panorama](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=5.62277,-0.17405&heading=122&pitch=0&fov=90), visually inspected; capture **August 2024**, timeline also offers February 2016. Mall canopy and LC Waikiki behind. [Reviewed image](../../review-artifacts/accra-mall-front-reference-2024.png). Rounded POI: OSM node 3045917876. | Several roof/bench modules, gold posts, tall fascia/back panels and patterned low platform. Three authored modules reproduce the visible character; dimensions, kerbs and exact total row extent remain estimates. The old single short shelter did not represent this row. |
| Opposite mall-facing seating and taxi waiting area | User screenshots supplied 15 October 2026: [view 1](../../review-artifacts/mall-opposite-user-reference-1.png), [view 2](../../review-artifacts/mall-opposite-user-reference-2.png). Both display **August 2024**. Matched independently in [Street View](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=5.6223,-0.1748&heading=300&pitch=0&fov=90), resolved panorama `OUtBkZyVJiehHaJanZPB1A` at 5.6221723, −0.1746136. | Blue posts, connected covered seating sections, central Ghana Link advertising/grille frontage, patterned platform, taxi queue, open billboard rear truss, grass and one small green kiosk. Model centre −0.17481, 5.62227 and heading 124° are photo-based estimates, checked against bundled roads; no formal station name or boundary is inferred. |
| Spanner | [OSM node 5116037041](https://www.openstreetmap.org/node/5116037041); rounded point from [OSM-derived record](https://mapcarta.com/N5116037041). | The [operator photograph](https://vendosca.com/billboard/spanner-junction-bus-shelter/) is marked **PLACEHOLDER AWAITING EXACT IMAGE**, so it is rejected as proof of Spanner's appearance. Shelter remains estimated. |

The attached images resolve the requested physical frontage. This is separate from the blue-post **motorway** row near node 4999589687, the opposite motorway platform 4971250982, Spanner platform 4150793106, Shiashi Taxi Station north of the motorway and the rear [mall terminal](accra-mall-terminal.md). Earlier motorway images did not show the requested frontage and remain district context only.

The [MLGRD January 2022 trotro inventory](https://www.mlgrd.gov.gh/images/Ghana_Urban_Forum/trotro.pdf) separates Shiashie Station and Tetteh Quarshie Station (Accra Mall–Spintex). That historical inventory does not establish the formal name of this roadside taxi waiting area. The Vendo interchange listing's Adabraka pin is inconsistent with its image and must not be used for placement.

## Implemented correction

- Mall front: three gold-post covered modules, corrugated roofs, taller fascia/back panels, slatted benches, extra chairs, grey paving, patterned platform edge and rough shoulder.
- Opposite side: three broader blue-post modules, central grille detail, rear billboard truss, grass verge, the photographed single green kiosk and three compact dark taxis with orange wing paint parked off the carriageway. These taxis are static scenery; the stop marker opens the existing game ride picker. They are not a new shared taxi fleet or formal scheduled service.
- Both mall rows have six player seat positions and three seated local NPCs, plus a waiting person and daytime walker. Spanner has two player seats. Player seating lasts until **Stand up / E**, with collision-aware camera clearance before the parked taxis. Activity poses and seat ownership are not synchronized between clients or saved across reloads.
- Search names: **Accra Mall bus stop**, **Accra Mall opposite-side bus stop**, **Spanner bus stop**. The opposite stop also resolves `Accra Mall taxi waiting area` without merging it into Spanner or the front stop.
- Colliders cover posts, backs, benches/chairs, kiosk, billboard supports and parked taxis. The pedestrian corridor, seat approaches, pickup hotspot and mapped driving lanes remain clear. Geometry and materials are batched, with no new polling or backend schema.
- Tall panels use original neutral Worldfolk information. Historical Ghana Link, Geisha, rice and beverage campaigns identify the reference scene but are not republished as in-game ads. The existing administrator-approved advertising flow remains separate. No Google imagery is imported as a texture and no unverified food stalls are scattered around the district.

## Verification

The bus-stop tests check all three search identities, outdoor arrivals, 14 seat approaches/exits, NPC seating, daytime paths, taxi solids, open pedestrian corridor, camera clearance, roof headroom and road/minibus clearance using bundled road geometry. The focused bridge/terminal/roundabout/exploration/fleet suite passes **38 tests**, and the production build passes; details are recorded in [implementation progress](implementation-progress.md).

Review images: [mall-front row](../../review-artifacts/mall-front-shelter-row.png), [opposite row and taxis](../../review-artifacts/mall-opposite-shelters.png). These isolated previews use schematic surroundings and show the model changes, not a full district survey. Full-game review confirms map selection, safe opposite-stop arrival and seated interaction.

## Remaining acceptance work

Obtain newer dated photography and surveyed kerbs, total row extent, setbacks and dimensions. Confirm the local station name independently; review physical-phone performance, shared poses and the actual transport purchase from the stop marker. ACC-262 remains **In progress**, not complete or deployed.

Next inventory item: **ACC-263 — Accra Mall outside shop and vendor frontage**, surveying each current business rather than treating historical ads as shop identities.
