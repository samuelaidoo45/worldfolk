# Airport-bound bypass: railway bridge to Big Six

20 October 2026 · ACC-285 · **Implemented locally / In progress / Partial**

## Coverage

This connected exterior batch follows the Airport Bypass south from the Mahama railway overbridge to the Big Six airport junction. It includes the visible Polo/Senchi frontages and eastern aviation-campus spur. The [repeatable per-building inventory](airport-bound-buildings.csv) accounts for **137 selected native building records: 11 existing exteriors retained and 126 newly authored**. Three newer tower envelopes are separately identified viewing estimates, not OSM polygons or surveyed footprints.

Selection uses building bounding-box centres within 160 m of the named bypass ways between latitude 5.60565 and 5.61855, with explicit Senchi-hotel and aviation-campus spurs. The generator retains the full selected native rings, including notches. This is a bounded map-record closure, not evidence that the extract includes every present-day building or that concealed facades have been surveyed.

| Group | New native records | Treatment |
|---|---:|---|
| Southern Polo frontages | 4 | Native long residential roof, service building and separate western compounds; earlier Heights towers remain unchanged |
| Senchi / hotel frontage | 18 | Older native podium/service plates, orange-framed office and residential roofs; separate Four Points tower estimate |
| Upper western bypass | 14 | Cream compounds, hip roofs and openings; external spiral stair on 2904703374 |
| Upper eastern bypass | 34 | Polo Views Block A, older service/compound roofs and Hajj-side frontage; separate eastern Polo Views tower estimate |
| Middle western compounds | 17 | Individual native footprints and mixed low hipped/gabled roofs |
| Aviation campus | 15 | GCAA headquarters on native plate 1197118814; low support blocks; separate GATA tower estimate |
| Northern quarters | 8 | Long low cream residential/service blocks and pale sheet roofs |
| Southern quarters | 16 | Native low quarters and separate road-facing compounds; no invented police station interior |

**Four Points:** white tower, orange balcony column, glazed base, metal service-stair spine and slotted roof canopy, using the official hotel gallery. The tower estimate supplements the older 2158196648 podium plate. The present hotel is not mistaken for the older neighbouring office.

**Polo Views:** the August 2024 public-road panorama shows completed beige/brown towers, horizontal balconies and dark projecting roof parapets. Block A retains native polygon 2174158622; the eastern tower is an explicit estimate above/beside older mapped service plates. The February 2016 construction view is retained only as historical context.

**GCAA / GATA:** distinct stepped blue-glass/cream headquarters slabs and rounded-corner training tower with horizontal white bands and grey spine. The headquarters native contour anchors its mass; its height and slab subdivisions are estimates. GATA's newer tower envelope is a viewing estimate. Concealed elevations and sign placements remain estimates.

**Grounds:** native grass parcel 2673930316 is clipped into three streaming bands without changing its outline. Sixty-two estimated broadleaf trees and dry ground patches avoid native roads and building plates. No buildings fill the open field. Roadside roof colours, heights and hidden openings are restrained interpretations; unidentified ordinary compounds are not given invented tenants.

## Visually inspected references

All checked **20 October 2026**. Check dates and copyright dates are not capture dates.

- [Public-road completed Polo Views panorama](https://www.google.com/maps/@5.6148269,-0.1740084,41a,90y,90h,95t/data=!3m7!1e1!3m5!1ss_Url26tX5TFXeRGDEO8Fw!2e0) — selector displays **August 2024**; panned/zoomed east. Beige/brown completed towers, dark balcony/roof lines, bare approach and overgrown verges.
- [Upper bypass compound panorama](https://www.google.com/maps/@5.614187,-0.1743765,3a,90y,190h,90t/data=!3m7!1e1!3m5!1smM1Xvg_PvZu6dlHDqcoTnQ!2e0) — **August 2024**; cream two-storey compound, external metal spiral stair, pale roof and brown fascia/railing.
- [Southern quarters public panorama](https://www.google.com/maps/@5.607399,-0.1753714,3a,90y,270h,90t/data=!3m7!1e1!3m5!1sXVgPetS-4awqck3Nypghyg!2e0) — **August 2024**; weathered low cream wall/buildings, bare shoulder and broadleaf planting.
- [Airport-bypass overhead context](https://www.google.com/maps/@5.6132,-0.1734,600m/data=!3m1!1e3) and [aviation-campus overhead](https://www.google.com/maps/@5.6100,-0.1725,427m/data=!3m1!1e3) — capture dates **unknown**. Roof envelopes, individual compound gaps and native-field context. Coordinates/scale were checked visually; manual tower envelopes remain estimates.
- [Four Points official gallery](https://www.marriott.com/en-us/hotels/accfp-four-points-accra-kotoka-airport/photos/) — current operator gallery, **photo capture dates unknown**. Official map link identifies Plot 75A, First Senchi Street; roof location was compared with overhead context.
- [GCAA headquarters creator photograph](https://commons.wikimedia.org/wiki/File:GCAA_HQ_Building.jpg) — **16 September 2024**, Bernard Asante, own work, CC BY-SA 4.0. Viewed for stepped glass/cream elevations; no pixels are embedded in the game.
- [GATA official site](https://www.gcaa.com.gh/gata/) — current official hero/gallery, **photo capture dates unknown**; rounded corner, white horizontal bands, grey spine, blue glazing and recessed side galleries.

Screenshots are in `review-artifacts/airport-bound-*-reference*.png` and dated street-review files. Geometry/materials are original. Google/Marriott/GATA imagery is viewing evidence only, not a runtime texture. The native OSM pipeline retains its existing attribution.

## Playable integration

Eight building groups and three field groups stream separately. Six searchable public-side exterior visits have persistent start/stop guides: cream compounds, Polo Views, Four Points, GCAA, GATA and the southern quarters. Private residences, hotel rooms, police compounds and aviation operations remain closed; no private access is inferred from a map label.

The nine relevant native bypass ways now reach rendering, safety and traffic from one shared geometry record. Existing Senchi junction widths are retained; the new narrower two-way southern section and divided carriageway widths are visual estimates. No invented traffic signals, road grid or operational railway is added. At these six specific arrival points, the initial heading faces the subject and the player's car is parked to the side of the viewing axis; arbitrary resumed positions are unaffected.

## Verification and remaining work

Focused checks cover native census/unique source ownership, ring equality, honest manual provenance, road-free tower estimates, public guide/arrival clearance, native road direction/width agreement, minibus lane clearance along the full southern bypass, field/tree placement, finite mesh positions/UVs/normals, bounded streaming groups and arrival framing/parking. The prior Polo/Mahama/corridor/auth/retained-map regressions are also run.

Measured dimensions, present-day parcel/facade changes, hidden facades, private entries, detailed compound boundaries and physical-device/shared-player acceptance remain open. The older extract may contain structures removed or altered since mapping; its exact polygons are not a current photographic survey. This pass remains **Partial**, with no new interiors or claim of photorealistic survey accuracy.

**Release:** local implementation only. The latest production release remains `0f71d1b6-bd59-4a10-8ff1-4fd9bafa6544`; this pass has not been deployed or committed.

## Local verification — 20 October 2026

**75 focused checks passed; production build passed.** The eleven new streaming groups total **73 static draws / 600,672 vertices** in the Node mesh check (browser text signs add a few draws). This is a geometry budget check, not a physical-device FPS guarantee. All six public arrivals and car/minibus parking placements are tested; mapped minibus lanes remain clear from the bridge toward Big Six. The generator reproduces the context, map module and CSV byte-for-byte.

The browser model review covers compounds/spiral stair, Polo Views, Four Points, GCAA, GATA, quarters and the route overview. Full-game guide start/stop was reviewed at the cream compound, hotel and academy; walking resumes at the academy, with no captured console errors. The hotel viewpoint moved after its first review to avoid a low intervening compound and the Kwabena Duffuor Road crossing. Six final arrival positions remain unit-checked; the review is not a new claim of exact private entrance locations.

Evidence: `review-artifacts/airport-bound-*-model.png`, `airport-bound-*-gameplay-guide.png` and `airport-bound-verification.json`. No production account, database, Git index or deployment was changed.
