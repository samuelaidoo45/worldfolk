# Osu — first Oxford Street exterior block

Implemented locally on **20 October 2026**. Status: **Partial**. This starts the user's new Osu focus with three connected roadside destinations, spanning roughly 180 metres from Frankie’s to Papaye. It does not represent completion of Osu, surveyed dimensions or photorealistic acceptance.

## Buildings and source geometry

| Place | Inventory | Geometry | Exterior treatment |
|---|---|---|---|
| Frankie’s | ACC-121 | Native building polygons 1179058850 and 1179058852 | Blue corners and restaurant side wall, silver hotel panels, horizontal glazing, sheltered side terrace, louvred base, flat roof and dated CalBank frontage |
| Oxford Street Mall | ACC-056 | Photo-estimated street wing inside mapped mall property 259080346 | Silver cladding, offset glass entrance tower, open crown, shop glazing, north balcony, railings and dated shop signs |
| Papaye Osu | ACC-126, Osu branch only | Native building polygon 1179058864 | Three glazed tiers, red mullions, pale horizontal bands, narrow stair tower, entrance canopy and forecourt parking lines |

**Mall parcel distinction:** OSM way 259080346 is tagged `shop=mall`, not `building=yes`. Extruding that whole parcel would cover the service lane and rear buildings. The front wing is a separately documented estimate. Rear native building 1775975828 remains intact. Heights and facade dimensions for all three are estimates from photographs; roof/rear detail and current tenancy need further evidence.

`ACC-194` owns the connecting Oxford Street block. Native roads remain authoritative. Paving and grated drains are bounded to the three forecourts; this pass does not invent a replacement street network or fill unverified neighbouring plots.

## References actually inspected

Street View was panned and inspected in the browser on **20 October 2026**. All four captures below display **August 2024**. At Papaye, “See more dates” exposed August 2024 and February 2016; August 2024 was the newest view available in that panorama. These are historical context, not verified 2026 site conditions.

| View | Evidence | Source |
|---|---|---|
| Frankie’s front, 29 Oxford Street | Silver facade, blue edges, hotel lettering, yellow bank fascia and paved approach | [Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=zm1q96_PuACBkX6Fm4K-zA&heading=260&pitch=5) |
| Frankie’s north side, Walakataka Street | Blue wall, grey louvres, raised terrace, plants and angled shades | [Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=ACn0My-4Vb7RXqXZ9p38gw&heading=90&pitch=0) |
| Oxford Street Mall, 30 Oxford Street | Glazed tower/crown, silver wing, railing, north balcony, Shoprite/Electromart/Golden Dragon signs | [Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=C9qRmPKOz3Qoczk5opK1Rw&heading=260&pitch=5) |
| Papaye Osu | Red-framed three-level glazing, pale fascias, narrow left tower and parking apron | [Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=1YDfz8J2FF9q04A6c7s6WA&heading=80&pitch=4) |

Current operator pages support place identity: [Frankie’s](https://www.frankies.com.gh/) and [Papaye branches](https://www.papayegroup.com/branches). Their current availability does not establish the capture date of their photographs. [OSM mall way](https://www.openstreetmap.org/way/259080346) supports the parcel distinction above. No Google imagery or other reference photograph is downloaded or embedded as a game texture. Geometry, small sign atlases and materials are authored locally.

## Playable scope

- Search/visit each place individually; Oxford Street district entry uses the mall's safe outdoor approach.
- Preserve the existing Frankie’s destination ID. Name/alias matching is bounded by coordinates so another Papaye branch is not redirected to Osu.
- Safe exterior arrival, footprint collision, a photo pose and a frontage guide at each place. Photo poses stop when the player presses E again.
- Up to six nearby scenery visitors, with walking/waiting paths confined to checked forecourts. These are local NPCs, not additional online players.
- Generic interiors are not presented as reconstructed interiors. These authored volumes have no fake door; restaurant/mall interior work remains queued.

## Cost and validation

Static meshes are batched by material; each site has one 1024×1024 sign atlas. The factory has no per-frame building callback. No global stream or pixel-ratio budget was raised. The existing 39-package offline LOD source manifest was regenerated after the factory integration; these small, low-rise models do not add medium-asset downloads.

| Exterior | Vertices in Node geometry check | Batched draws excluding browser sign atlas |
|---|---:|---:|
| Frankie’s | 15,300 | 12 |
| Oxford Street Mall | 14,946 | 7 |
| Papaye Osu | 8,748 | 8 |
| Total | 38,994 | 27 |

Each browser sign atlas adds a small number of vertices and one draw. These geometry counts are not a frame-rate benchmark.

- **31 focused tests passed:** Osu geometry/search/access/NPC paths and existing PBR streaming, shader preparation, LOD source hashes and shared viewport regression checks.
- **1 local API integration test passed:** all three destinations preserve the player profile and balance and use the expected outdoor arrival.
- **Production build passed.**
- Browser: visually reviewed all three exteriors in the isolated context fixture. Entered Oxford Street Mall through the live city map, switched to Overview, started and stopped its photo activity. Captured game console warnings/errors were empty. Two browser-control timeouts occurred while selecting the camera; a subsequent click completed normally. This is not a latency or smooth-performance acceptance result.
- Existing frame-time spikes and physical-phone benchmarking remain open. No deployment was performed.

Evidence: `review-artifacts/osu-tests.log`, `osu-api-tests.log`, `osu-build.log`, `osu-gameplay-mall.png`, `osu-frankies-review.png`, `osu-oxford-mall-review.png`, `osu-papaye-review.png`. The isolated fixture uses plain neighbouring massings for context; those are not newly authored neighbours. Open `tests/fixtures/osu-oxford-review.html` through a local static server to reproduce that view.

## Remaining work and next connected batch

Obtain current dated front/side/roof images, verify facade dimensions, current signs and tenants, then review the mall rear/service geometry. Expand adjacent Oxford Street storefronts and side-street junctions after identifying their exact map records and references. Interior rooms, staff/services, purchase/work flows and multiplayer/device acceptance follow the exterior pass. Other Papaye branches remain queued.
