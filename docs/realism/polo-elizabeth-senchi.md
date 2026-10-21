# Polo / Elizabeth / Senchi — first exterior batch

**20 October 2026 · deployed Partial · ACC-168 / ACC-280 / ACC-281 / ACC-282**

This is the first rendered batch within corridor section C03, not completion of its 51 native building records. Five building outlines and the Polo Club field receive distinct exterior geometry. Other mapped buildings remain native. No new private interior, horse simulation, live match or job is supplied by this batch.

## Evidence inspected

| Reference | Capture evidence | What it supports / limits |
|---|---|---|
| [Elizabeth Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=O_c_KIE7ZDhffl2X_7s4Gw&heading=270&pitch=10) | September 2024, visible capture label; reviewed 20 October 2026 | Pale rear office block, horizontal glass, curved red bands on lower frontage, raised forecourt/rail, retaining edge, lawn/pavers and separate white/red building south. Historical imagery, not a verified current view. |
| [The Elizabeth developer](https://goldkeygroupgh.com/portfolio/the-elizabeth/) | Undated | Senchi identity/address context; text says five storeys while a metric lists six levels. A direct recheck presented an interstitial, which was not bypassed. No current capture date inferred. |
| [Polo Heights Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=uF_wW8r5iq17MoQ3VevD5g&heading=0&pitch=30) | August 2024, visible capture label; panned upward for roof, reviewed 20 October 2026 | Cream/yellow massing, reddish strips, white frames, stacked recessed balconies with square openings, low roof crest, boundary wall and feather palms. Concealed elevations and exact floor/height measurements remain estimates. |
| [Accra Polo Club gallery](https://accrapoloclub.com/gallery/) and [displayed field photograph](https://accrapoloclub.com/static/d099a2d08d4cc3a1634d4e94d6eeda70/e233a/gallery.jpg) | Operator gallery inspected; photograph capture unknown | Grass grounds, riders/mallets, palms and low white perimeter board. Event/page dates do not date the image. The game adds field and polo posts, not the photographed riders. |
| [Accra Polo Club contact](https://accrapoloclub.com/contact/) | Operator text, reviewed 20 October 2026 | Airport Bypass approach; distinguishes private club from public restaurant. Outdoor viewing does not authorize entry to private clubhouse/estate rooms. |
| [Nearby photosphere](https://www.google.com/maps/@?api=1&map_action=pano&pano=CIHM0ogKEICAgIDqvcbK7gE) | Ruben Ahiakpote, September 2019 | Low cream/red-roof buildings, dark timber entrance and parking/grass visible, but bearing/parcel correspondence was not established. Rejected as evidence for assigning a clubhouse model to native 2491216764. |

No newer dated images of these exact frontages were verified. Street View and operator images are inspection references; no third-party photo or advertising artwork is distributed as a game texture. Saved browser evidence is in `review-artifacts/polo-*-reference-*.png` and `polo-club-official-field-reference.png`.

## Native identities and authored interpretation

| Source ID | Identity | Local implementation |
|---|---|---|
| 451713890 | The Elizabeth | Exact native outer ring; pale lower glazed block with continuous curved red ribbon meshes, taller rear cladding/glass block, roof name sign, raised forecourt and retaining rail. Lower block 9.9 m; main body 16.5 m plus 1.05 m base; five subdivisions. These are visual estimates. |
| 2904703356 | Separate south white/red block, operator/name unverified | Exact native outline, pale facade, regular glazing and red vertical strip. Six subdivisions / 18 m estimated. Relative photograph/parcel match is provisional; do not label it as Elizabeth offices or an identified business. |
| 981756484 | Chukka Block | Exact native plate and notches; inset core, stacked balcony slabs, recessed glass, square-open balustrades, cream/reddish finishes and roof crest. |
| 981756486 | Mallet Block | Separate exact native plate; same observed estate vocabulary, not a duplicate relocated outline. |
| 981756490 | Saddle Block | Separate exact native plate; same observed estate vocabulary. |
| 890787154 | Native horse-riding / Polo field | Exact native land-use boundary, grass, low white board and four estimated polo posts (7.3 m between goalposts, 4.2 m high), palms at western edge. No football markings or invented stadium. |
| 981756488 / 981756482 | Heights boundary / pool | Retained native ground rings; low boundary wall with native-road cuts, pool surface kept inaccessible. Boundary heights/details are estimated. |

The three Heights towers use 11 subdivisions at 3.2 m, a 35.2 m body and a low roof crest. This is an initial silhouette interpretation, not a surveyed height or certified floor count. Hidden sides, bay counts, dimensions, roof detail and property boundaries need stronger evidence. **Polo Court 81300070, Polo Views Block A 2174158622, possible clubhouse 2491216764 and pool-side building 981756492 are not replaced by this batch.** Do not conflate the club and residential estates.

## Connected streets and access

- Render sites are centred at The Elizabeth `[-0.17654, 5.61521]`, Heights `[-0.17491, 5.61549]` and grounds `[-0.17350, 5.61625]`. Geometry uses exact bundled rings; roadside construction positions are estimates. Bounded context is `tests/fixtures/polo-senchi-context.json`.
- Native road coordinates are shared through the road cache and elevation profile. Fifteen authored road IDs: 111557768, 277792478, 277792479, 121772677, 316575722, 419694822, 758665997, 172920773, 96638771, 637682768, 637698454, 1076825772, 1076825773, 1076825774, 1076825775. Widths (10.5 m trunk, 9 m secondary, 5 m service, 6 m street, 2 m path) are estimates, not survey values.
- Public paving/lawn follows the native Senchi-side alignment; strips and walls are clipped at native roads/buildings. Trees and walls share collision geometry. Generic scenery/signals are suppressed in this bounded area rather than adding guessed stalls or signals.
- Three searchable outdoor visits have safe arrival positions and persistent E start/stop observation prompts. Existing Polo Club ID `g_-1735_56163` is retained for profiles/jobs. Search merges matching nearby names, preserving distant branches and separate Polo Court identity.
- Two local pedestrians follow continuous short routes clear of roads/walls and stationary guide positions. They do not count as online players. Private buildings, raised plinth, pool, walls, trunks and posts have closed colliders; collision permits retreat. No new private room opens through a generic door.
- The existing personal taxi spawns near the player on arrival and can obscure part of the observation view; its general parking/camera placement is a remaining gameplay issue. This batch does not claim to solve corridor traffic or all vehicle parking.

## Verification

**51 focused Node tests pass** across Polo/Senchi, Regent roadside, Shangri-La, Kofi Annan, Residential frontages, Villaggio neighbours, auth handoff and retained MapLibre tiles. Checks cover exact rings, identity/search preservation, arrival/guide matching, shared road geometry/widths, sampled minibus-centre clearance, wall contact/retreat, continuous pedestrian routes, valid finite geometry/UVs/normals, roof bounds and static draw budgets. JavaScript syntax, whitespace and production build pass.

Final static geometry in Node (excludes browser canvas sign and the rest of the city):

| Site | Batched static draws | Vertices |
|---|---:|---:|
| Elizabeth / south block | 8 | 23,892 |
| Three Heights towers / environment | 10 | 227,302 |
| Field / environment | 6 | 44,152 |
| **Total** | **24** | **295,346** |

These counts are not physical-device frame-time results. Browser visual review replaced stepped Elizabeth bands with continuous curved meshes, removed unsupported floating estate/club signs and connected/enriched palm fronds. Review fixture: `tests/fixtures/polo-senchi-review.html`; final daylight screenshots: `polo-elizabeth-model.png`, `polo-heights-model.png`, `polo-grounds-model.png`.

Full-game local walkthrough used the existing disposable local account: searched/selected the three destinations, entered directly, opened/stopped each exterior guide, walked along the frontages and returned through the city menu. Final grounds re-entry loaded the updated palms, started/stopped the guide and resumed walking. No captured console errors in the review or game tabs. Gameplay evidence: `polo-elizabeth-gameplay-guide.png`, `polo-heights-gameplay-guide.png`, `polo-grounds-gameplay-guide.png`, `polo-grounds-gameplay-walk.png`. No production player record was changed.

The repeatable generator `python3 scripts/realism/build-polo-senchi-map.py` regenerates native source rings/context without drift. The corridor inventory now links **25 of 343** building records to authored geometry, with **318 native only**. This is an ID-link count, not accepted coverage. ACC-168 / 280 / 281 / 282 remain **In progress / Partial**.

## Remaining acceptance and next batch

- Current photographs, accurate dimensions/floor counts, hidden sides, south-block identity and native parcel correspondence.
- Polo Court/Views, clubhouse/stables, operating access arrangements, spectators/horses/matches and the rest of C03 remain separate work; no invented detailed interior.
- Full connected walking/driving route, precise boundary/driveway alignment, arrival taxi parking, mobile frame times and shared-player camera acceptance remain pending.
- Next prepared larger exterior batch: **Mirage / KASS and their verified roadside neighbours (C04)**, then **Association International School / Opeibea (C05)**. Carry C03 gaps forward explicitly.

Available locally at **http://127.0.0.1:3002/game/**. No staging, commit, push or deployment in this implementation pass. Last live release remains `ebe7f7be-0083-4d56-b719-6be29c9fd66c`.


## Release state — 20 October 2026

This exterior pass is now deployed to [Worldfolk](https://worldfolk.world/game/) as **0f71d1b6-bd59-4a10-8ff1-4fd9bafa6544**, with the connected Polo and railway updates. Deployment does not close current-photo, measured-dimension, concealed-facade or physical-device/shared-player gaps. The pass remains **In progress / Partial**. Release evidence is in `review-artifacts/mahama-neighbourhood-deployment-check.json`; no database migration or Git stage/commit/push was performed.
