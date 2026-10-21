# Villaggio surroundings — ACC-266–268

Implementation pass: **16 October 2026**. Deployed on the same day as Cloudflare version **9327d9cc-7fb1-4e36-a6c4-03ae913d3ac2** at https://worldfolk.world/game/. Seven native building ways are authored as three connected outdoor visits. This is a partial, photo-referenced reconstruction, not a measured replica or completed neighbourhood survey.

## Buildings in this pass

| Work item | Site | Bundled OSM building ways | Recognizable features |
|---|---|---|---|
| ACC-266 | Villaggio Primavera | 1216282304, 1216282306, 1216282308, 1216282310, 1216282318 | Five earlier residential blocks, cream/brown finishes, recessed balconies and railings, sloping roof bands, roof pavilions and courtyard pool |
| ACC-267 | African Regent Hotel | 1025799036 | Peach/cream room wings, arched windows, lower pool wing, entrance arch, boundary wall, pool terrace and palms |
| ACC-268 | Santoku | 1216282314 | Mapped restaurant shell, timber screens, glazing, shaded pergola and outdoor seating |

The existing Alto, Aqua and Azure tower models are retained. Unverified surrounding buildings retain their map geometry. A subsequent [Kofi Annan Street pass](kofi-annan-street.md) authors Octavia 154, Airport Women’s Hospital and Kwarleyz Residence; it was deployed separately as version 08169025-2327-4975-b03d-c74b152fa902. The mapped hotel polygon and restaurant identity are supported by nearby POI records; the individual Primavera block assignment follows the developer photographs and adjacency and needs block-by-block current confirmation.

## References actually inspected

Reviewed **2026-10-16**. Website access dates do not establish image capture dates.

- **Primavera developer gallery:** [Trasacco — Villaggio Primavera](https://www.trasaccogroup.com/highrise). Its [courtyard photograph](https://www.trasaccogroup.com/images/sectors/primavera/TG-IMG_0004_1%20(1).jpg) was visually inspected: cream walls, brown roof/floor bands, small windows, recessed balconies, pitched roof pavilions, landscaped courtyard and irregular pool. Capture date unknown. Evidence: `review-artifacts/villaggio-primavera-developer-reference.png`.
- **African Regent official gallery:** [hotel gallery](https://www.theafricanregenthotel.com/gallery), [pool-side building photograph](https://cdn.blastness.biz/media/1639/gallery/thumbs/full/1024-Building_CRLX3719-HDR-Edit-Edit.jpg). Visually inspected: peach and cream finishes, arched openings in tall room wings, lower glazed leisure wing, terraces and pools. Capture date unknown. Evidence: `review-artifacts/villaggio-regent-gallery-reference.png`.
- **Google Street View:** [Augustus Akiwumi Street, hotel approach](https://www.google.com/maps/@?api=1&map_action=pano&pano=witI1bGg9iFSwmJgdYOe1w&heading=95&pitch=0&fov=90), position 5.6193825, −0.1773699, capture **July 2024** displayed in the panorama. Panned to inspect the entrance arch, cream boundary wall, palms, hedge, pavement/drain edge, red/white kerbs and hotel facade. These views are historical context, not proof of October 2026 conditions. Evidence: `review-artifacts/villaggio-regent-street-reference-2024.png`, `villaggio-regent-wall-reference-2024.png`.
- **Santoku maintained photo listing:** [The 50 — Santoku](https://www.the50.com/discovery/Establishments/Ghana/Accra/Santoku.html), [terrace image](https://www.the50.com/discovery/filestore/jpg/Santoku-Accra-Ghana-1.jpg). Visually inspected timber pergola, hanging lamps, neutral cushioned seating and planted screening. Low-resolution image; capture date unknown. Evidence: `review-artifacts/villaggio-santoku-terrace-reference.png`.
- **Santoku operator:** [Yolo Experiences](https://www.yoloxperiences.com/santoku.aspx), read for identity/design context. Its feed mentions reopening and a new look without establishing a dated as-built survey; the current frontage, furniture and operating status need confirmation. The game visit does not certify that the real venue is currently open.
- **Older aerial context:** Google-hosted One Media Group photosphere at 5.620175, −0.1777195 displayed **October 2020**, initially reached while seeking nearby Street View. Visually inspected for the broad hotel/road relationship only. It is not a current street-level reference. No imagery was available for the attempted interior-western-street position. No 2026 Street View or current view of every Primavera facade was obtained.

All models are original geometry. Third-party images are reference evidence, not game textures. No external photo or map service is requested by these models at runtime.

## Game integration

- Search and city-home icons expose three destinations, each with a clear outdoor arrival. Nearby exact-name mapped duplicates resolve to the authored entry; other branches elsewhere are preserved.
- Replace only the seven source building IDs, preventing generic extrusions beneath authored models. No blanket district deletion.
- Native building rings are shared with collision data. The hotel's estimated height subdivisions preserve the native outer footprint. Pools, seating, planters and the hotel wall have colliders.
- Six photo/sitting activities use the existing persistent activity system: the player explicitly starts/stops the pose. Small local visitor paths remain on the tested approaches; visitors are NPC scenery, not connected-player counts.
- This pass covers exteriors, grounds and outdoor interaction. It does not open generic interiors behind the hotel, restaurant or apartment facades, grant real room ownership or add new wages/purchases.
- Static geometry is merged by material. Render verification includes matching position/UV counts and finite bounds; physical-phone performance and shared-room acceptance are pending.

## Checks and remaining accuracy work

Automated checks cover destination lookup/API arrivals, profile/balance preservation, exact source replacement IDs, all activity approaches, collision escape, visitor continuity, geometry/UV validity and draw-batch limits. Existing Villaggio/interchange/mall tests are also run. Browser evidence and final test totals are recorded in `implementation-progress.md`.

Heights, floor divisions, facade bay counts, roof subdivisions, the hotel's internal massing split, furniture and some ground features remain estimates. Obtain dated current front/side/rear images, measured gate/footpath widths and each block's identity before visual acceptance. The street-reference kerb/drain details have not been fully reconstructed. Current tenants, signage, pool access, complete interiors, multiplayer poses and phone frame times remain open. This batch must not be marked Accepted.


## 19 October 2026 local roadside correction

The [ACC-276 Liberation Road extension](regent-roadside.md) rechecks the operator pool-side photo and July 2024 northern approach, then adds September 2024 east-side Street View. The east-facing return now has an estimated two-storey (6.4 m) cream elevation and horizontal windows; the northern room block remains 19.2 m. Two previously floating roof details are moved wholly onto the retained tall roof. Native outer geometry, hotel arrival and pool activities remain unchanged. These internal divisions, roof-detail positions and dimensions are estimates requiring current photos and measured alignment, not a surveyed reconstruction. These corrections are local and were not included in the 16 October deployment.
