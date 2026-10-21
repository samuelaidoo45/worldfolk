# Castle Drive and Asomdwe Park

**21 October 2026 · In progress / Partial.** The next connected batch after Ghana Club and the Independence coastal road.

## Scope implemented

Three bounded packages add the memorial and the western/eastern Castle Drive roadside. The native park outline is retained, together with nine roadside building plates, the memorial terrace plate and three small garden plates: **13 owned native records**. The earlier 158-record Independence inventory is unchanged. Nine unnamed roadside buildings keep their exact footprints and native 4.5 m wall heights, with restrained pale walls, openings and estimated hipped roofs. Their current hidden facades, occupants and roof forms are not photo-verified.

The memorial is reconstructed from the reviewed July 2026 Presidency view and February 2023 detail photo: white columned pavilion and triangular pediment; dark central tomb; five low walkable steps; twin shaped red–gold–green backdrop panels with black stars and pale upward blades; the lower white wall with simplified lyre motifs; original bronze-coloured bust on a dark plinth to the visitor’s right; rows of pots, edged lawn rectangles, dark dedication panels and blue/gold twin-bird lights. The ceremony’s red carpet is temporary and is not rendered as permanent paving. Portrait likeness, motif detail and exact dimensions remain estimates. No names are invented for the dark dedication panels.

Added low green boundary rails with public game-route gaps, pale-painted tree bases, seventeen bounded roadside/park trees, tiled circulation and two reflection benches. Four ground polygons, eleven compacted roadside verge polygons and 214 short boundary sections are prepared offline, clipped around native road lanes and solid house plates. The native memorial terrace is circulation space, not a solid 4.5 m building. The three southern garden plates receive low garden outlines, not generic houses; their detailed planting/water features remain unverified. Geese Park’s leisure facilities and future proposals are not substituted for the presidential memorial.

Asomdwe Park and Castle Drive now have canonical search/map arrivals and outdoor guides. The memorial photo pose and reflection seating use persistent player-controlled start/stop. The pavilion’s floor/steps and post/tomb obstacles are shared by rendering and pedestrian/server elevation validation. A roughly **118 m** test route goes from the road approach through the boundary gap to the memorial; a return route and approaches around both benches are checked. The owned vehicle spawns at the approach forecourt rather than blocking the memorial walk. Exact real-world visitor access and parking arrangements are not guaranteed by these game routes.

## Reference record

| Reference | Date evidence | What it establishes |
|---|---|---|
| [Presidency, 14th anniversary ceremony](https://presidency.gov.gh/integrity-and-service-should-be-our-greatest-tribute-to-mills-president-mahama/) and its reviewed front-approach photo | Published / ceremony **24 July 2026**; independent EXIF capture date not established | Current published frontal identity, grass/white edges, pots, dark panels, pavilion, national-colour backdrop and twin-bird light poles. Event date is not recorded as independently verified camera metadata. |
| [Matti Blume’s mausoleum photograph](https://commons.wikimedia.org/wiki/File:Atta_Mills_Mausoleum,_Korle-Klottey_(IMG_20230201_133041_1).jpg) | Commons description / EXIF **1 February 2023**, uploaded 5 March 2023 | Pavilion / tomb / white motif wall, broad tiled apron and bust to the visitor’s right. Historical detail, not current landscaping proof. CC BY-SA 4.0 option; reference pixels are not used in the game. |
| [Castle Drive Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=z5dV_tIW2icMIf6BqW16og&heading=243&pitch=0), panned in both directions | **February 2016** capture shown by Google Maps | Tree-lined asphalt, painted trunks/curbs, low green rail, entry apron and pale roadside compound boundary. Does not establish 2026 facade/access details. |
| [Overhead park / road layout](https://www.google.com/maps/@5.5476,-0.18765,19z/data=!3m1!1e3) | Capture date unavailable; inspected 21 October 2026 | Park/court/road relationship and garden outlines. No imagery pixels are copied; dimensions/layout remain estimates. |
| [KoKMA Geese leisure-park commissioning notice](https://kokma.gov.gh/news/2025/GTA_commissions_Geese_Park.html) | Published **8 January 2025** | Distinguishes the neighbouring leisure project from Asomdwe memorial; its listed facilities are not evidence of the memorial’s interior or layout. |

All meshes and the small tiled paving texture are original. Native source contours remain OSM/ODbL-attributed. No private interior, unreferred shrine, fabricated zoo or automatic memorial ceremony is added.

## Efficiency

Offline-only clipping and cached, locally filtered collision bounds keep the prepared layout out of the gameplay loop. Thin fence posts use crossed ribbons; distant detail omits rails, garden outlines, fine lamps and markers. The white pavilion and national-colour silhouette remain in the authored medium model. These static packages add no animation callback, GPU light or shadow pass. There is one small shared procedural paving map, rather than a separate image per surface.

The new packages total **44,202 near vertices**: park **29,319 / 12 batched draws**, west roadside **9,690 / eight draws**, east roadside **5,193 / five draws**, before browser signage. The connected sixteen-package Independence / Castle precinct totals **498,478 vertices**, within its 500,000 gate. The medium park uses **1,152 triangles / 2,092 vertices / nine draws / 12,040 compressed bytes**; exact values are recorded in `review-artifacts/asomdwe-costs.json`. The full 45-static/two-human bundle is **6,496,298 compressed bytes**, below the existing 6.5 MB gate. These are geometry/asset checks, not smooth-FPS or real-phone acceptance. Frame spikes and physical-phone benchmarks remain open.

## Verification

**64 focused tests plus one local API integration passed; final production build passed.** Final focused tests include the material/forecourt revision. Results are recorded in the implementation progress and evidence logs. Tests cover native ownership/contours, prepared-source hashes, ground/road clearance, public gap and hard obstacles, full approach/up/down stair movement, protected tomb and posts, bench routes, safe owned-car placement, canonical search and all eleven precinct arrival/entry operations with profile/balance preserved. Existing LOD/checksum/disposal, stream/viewport/shader-preparation and square platform tests remain in the focused set.

Live local browser verified map search and arrival, walking to the new photo point, starting/stopping the photo pose, walking around the beds, sitting and standing. No captured browser warnings/errors in those checks. Source/model screenshots and logs are in `review-artifacts/`: `asomdwe-presidency-july-2026.png`, `asomdwe-commons-feb-2023.png`, `asomdwe-overhead-context.png`, Castle Drive dated Street View images, `asomdwe-memorial-front-model.png`, `asomdwe-overview-model.png`, `castle-drive-west-model.png`, `asomdwe-gameplay-photo.png`, `asomdwe-gameplay-seated.png`, `asomdwe-all-tests.log`, `asomdwe-api.log`, `asomdwe-build.log`, `asomdwe-costs.json` and `asomdwe-verification.json`.

## Remaining / next

Current roadside compound/facade photography, measured memorial proportions and finer portrait/motif work; precise park access, garden and parking survey; fuller Castle Drive eastern/coastal frontage; physical-phone and multiplayer performance acceptance. **Next: Osu Castle exterior and its verified approach**, then the separate Geese leisure park with current references. ACC-013 and ACC-292 remain In progress / Partial. Deployment is postponed at the user’s request. Changes remain local; no staging, commit, push or deployment. Implementation does not itself mark this inventory complete.
