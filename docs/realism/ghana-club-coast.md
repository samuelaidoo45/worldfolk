# Ghana Club and Independence coastal road

**21 October 2026 · Partial, local implementation.** Continues the bounded Independence Square precinct before Castle Drive / Asomdwe Park / Osu Castle.

## Built

- Ghana Club retains native plate **312724288**, its contour, 7.5 m wall height and hipped roof. The exterior now has a raised concrete frame/lattice, inset private lower enclosure, green timber siding, pale louvres and fascia. Fine siding and slats are omitted from the authored medium model. Hidden elevations and dimensions are extrapolated, not surveyed.
- Bounded compound work includes low capped walls, a pedestrian gap, five trees/palms and the black tank on a steel frame seen in the dated exterior view. Walls/trunks/tank have matching cached colliders. Exact gate, wall, planting and tank placement remain provisional.
- Two static coastal ground packages distinguish bare soil, sparse cover, grass and compacted verges along native Riveria / Marine Drive alignments. Nineteen cover polygons, 25 verge polygons and 35 short wall sections are baked offline. Roads, all 158 native building records, the ceremonial square and native ocean are subtracted before triangulation. No future resort/masterplan buildings or invented paved boardwalk are added.
- The saved Ghana Club arrival is unchanged. Added a persistent facade photo pose and a searchable **Ghana Club to Independence coastal road** outdoor guide. A roughly 698 m ground-level test route runs from the club through its gap to the existing square coastal approach. Minor service connections still require crossing; this is game navigation evidence, not a guarantee of present public access or a continuous protected footway.

## References and limits

| Source inspected | Date evidence | Use and limit |
|---|---|---|
| [Ghana Club Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=Vez5wczGBFvOXcmeErqjNg&heading=75&pitch=5), panned frontage | **February 2016** capture shown by Google Maps | Raised timber room, pale shutters, hip roof, concrete support, tank and bare compound. The foreground temporary kiosk and historical advertisements are not copied. Does not prove October 2026 appearance. |
| [Architect Alice Asafu-Adjaye’s Accra guide](https://www.wallpaper.com/travel/local-architect-alice-asafu-adjaye-guide-to-accra) | Published **18 June 2025**; exterior photo capture not established | Architect’s description corroborates the club’s raised concrete lattice and coastal setting. Its linked club image shows an interior presidents board, not an updated exterior photograph. No interior is reconstructed from it. |
| [Beach Crescent Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=CbMbcvJhBDNMae6IP1XHuQ&heading=146&pitch=0) | **February 2016** capture shown by Google Maps | Roadside context only: weathered asphalt, bare/grass verge, palms and low structures. Temporary blue hoarding and potentially cleared historical structures are not promoted to current scenery. |
| [Overhead coastal context](https://www.google.com/maps/@5.5468,-0.1951,18z/data=!3m1!1e3) | Capture date unavailable; inspected 21 October 2026 | Broad plot cover/road relationship, club compound and cleared parcels. Website copyright/check date is not imagery date. A resort label on a cleared plot is not building evidence. |
| [Tourism Ministry Marine Drive site visit](https://www.motac.gov.gh/2025/04/15/) | Published **15 April 2025** | Project/work context; does not establish a completed 2026 promenade. |

All meshes and the shared 256×256 soil texture are original. Reference pixels are not redistributed or used as textures. Native OSM contours remain ODbL-attributed. No unverified club, resort or government interior is provided. ACC-291 / ACC-287 remain **In progress / Partial**. The wider inventory remains 158 records, including 138 provisional ordinary context plates.

## Efficiency and verification

Polygon Boolean clipping runs in `scripts/realism/build-coastal-precinct.mjs`, using a development-only dependency. Runtime reads hashed prepared polygons; colliders are cached. These packages add no animation callback, GPU light or shadow pass. The shared soil map has mipmaps and repeats in metre-scaled UVs.

Thirteen near packages total **454,276 vertices** before browser signage. Ghana Club: **13,266 vertices / 12 batched draws**; west/east ground packages: **663 / four draws** and **708 / three draws**. The authored medium club retains coarse facade/roof identity: **1,941 triangles, 3,407 vertices, ten draws, 17,939 compressed bytes**. The full 44-static/two-human LOD bundle is **6,484,258 compressed bytes**, within the existing 6.5 MB gate. These are geometry/asset measurements, not frame-rate acceptance. Frame-time spikes and real-phone benchmarks remain open.

**58 focused tests plus one local API integration test passed; production build passed.** Checks cover fresh source hashes, ground clearance against native buildings/roads/square/ocean, surface separation, safe gates and colliders, full walking route, reachable photo point, finite static geometry, LOD asset/checksum/disposal limits and existing streaming/viewport/platform regressions. Nine canonical precinct arrivals preserve profile/balance through arrival/entry. Live local browser verified club arrival, walking to the photo point, starting/stopping its persistent pose and selecting overview; no captured warnings/errors. The disposable review profile first needed its existing death-state restart before visiting the club.

Evidence: `review-artifacts/coastal-all-tests.log`, `coastal-api.log`, `coastal-build.log`, `coastal-costs.json`, `coastal-verification.json`, `ghana-club-model.png`, `ghana-club-gameplay-photo.png`, and the dated Street View screenshots. Local changes only; no stage, commit, push or deployment performed.

## Still needed

Current dated exterior/compound photos, measured proportions and exact gate/tank/land-cover survey; confirmation of any newly completed Marine Drive works and public coastal access; distant-view and real-phone performance acceptance. Next connected batch: **Castle Drive, Asomdwe Park and Osu Castle’s verified exterior/public approach**.
