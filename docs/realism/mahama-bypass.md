# Mahama / Airport Bypass railway link and north Polo

**20 October 2026 · ACC-283 · deployed In progress / Partial**

User priority: implement the bypass bridge leading up to Shangri-La and the buildings north of the Polo field. “Mahama bypass” is retained as the user's local alias. The mapped road here is **Airport Bypass**, with **Spintex Bypass Road** as its OSM alternate name. This is not a renaming of the separate Mahama Road / Major Mahama Roundabout farther east.

## References actually inspected

| Source | Date evidence | Observations / limits |
|---|---|---|
| [Bypass south approach](https://www.google.com/maps/@?api=1&map_action=pano&pano=-wZe0pprvyJ7A-RRVaNPPg&heading=13&pitch=0) | **August 2024** capture label | Panned from the south-facing cutting to the northern bridge: concrete retaining walls, narrow paved edges, separate one-way carriageways, centre island, roadside vegetation and railway overbridge. Historical imagery, not verified current appearance. |
| [Closer underside](https://www.google.com/maps/@?api=1&map_action=pano&pano=Unnno0ua6bEcMUOOaKPcxA&heading=13&pitch=0) | **August 2024** capture label | Advanced along the road: median concrete columns, deck seams, side conduits, metal top railing and **5 m** clearance sign. The train track is above the road; no road flyover is placed on the rails. |
| [Liberation Road crossing beside Shangri-La](https://www.google.com/maps/@?api=1&map_action=pano&pano=BrLlSLTZkt9xMY3B1dcgjA&heading=0&pitch=0) | **September 2024** capture label | Pale concrete span, central support, stone-faced approach banks and paved roadside approach. Banner artwork is not copied or replaced with a fictional advertiser. |
| [North Polo overhead context](https://www.google.com/maps/@5.6178,-0.1745,427m/data=!3m1!1e3) | **Capture unknown**; visually reviewed 20 October 2026 | Seven pale narrow stable roofs (two eastern blocks longer), long northern shed, bare service yard and track alignment. Imagery credits Airbus / CNES-Airbus / Maxar; copyright 2026 is not a capture date. Facades, doors, precise eaves/roof heights and present use require closer references. |
| [Bounded OSM API supplement](https://api.openstreetmap.org/api/0.6/map?bbox=-0.1773,5.6159,-0.1705,5.6195) | Retrieved **20 October 2026** | Exact rail coordinates, bridge/layer tags and 1067 mm gauge. Source fixture preserves the chosen records. These tags do not certify operational train services or surveyed vertical dimensions. |

The bundled map omitted railway features. This pass adds a **bounded static rail supplement**, not live runtime requests or a citywide railway rebuild. Reference imagery is viewed only; game surfaces, masonry, signs and geometry are original. The bridge's 5 m sign is visually supported; deck/column/wall dimensions and relative height to the flat game terrain remain estimated.

Evidence screenshots: `review-artifacts/mahama-bypass-south-cutting-reference-2024.png`, `mahama-bypass-rail-bridge-reference-2024.png`, `mahama-bypass-bridge-underside-reference-2024.png`, `mahama-shangri-rail-reference-2024.png`, `mahama-polo-north-overhead-reference.png`.

## Implementation manifest

| Source ID | Treatment |
|---|---|
| **187792807** | Railway over Airport Bypass. Exact horizontal source endpoints. Estimated 13 m deck depth, concrete span/abutments, three median piers, underside seams, conduits, safety rails and original 5 m sign. Road traffic stays below. |
| **187792809** | Native connecting railway west to Shangri-La: rails, sleepers, ballast and bank. Not a vehicle navigation edge. |
| **187792808** | Native railway over Liberation Road. Estimated 7.5 m deck depth, median supports, concrete ends and stone-faced banks. |
| **187792806** | Native west approach, clipped to longitude −0.17675. The full source coordinates are retained in the evidence fixture; no detached arbitrary bridge endpoint is used. |
| **187792813 / 510192633** | Native one-way Airport Bypass carriageways. Shared geometry in road cache, safety and surface rendering; 7.2 m estimated width per carriageway, concrete retaining walls, narrow pavements, central pier island and restrained lane marks. Reviewed stretch is approximately latitude 5.6172–5.6203. |
| **510151406 / 515537582** | Native Liberation Road approaches; shared 10.5 m width interpretation. Existing neighbouring passes retained. |
| **888975158 / 888975160 / 888975166 / 888975172 / 888975174** | Five separate short native stable blocks north of the field. Pale corrugated pitched roofs follow individual footprints and orientation. |
| **888975162 / 888975168** | Two separately mapped longer eastern stable blocks, retained at their native lengths. |
| **888975164** | Separate long east–west northern service shed. Native ring retained. |

The stable bodies are estimated at 2.8 m plus 1.1 m roof rise; north shed 3.4 m plus 1.3 m. Roof plate outlines and relative arrangement are reference-supported; concealed walls/vents are restrained interpretations. No detailed stable rooms, horse ownership, staff service or invented business identity is supplied. The large western red-roofed structure visible overhead has no confidently identified native ring here and remains a separate alignment gap. The possible clubhouse **2491216764**, Polo Court **81300070** and Polo Views are not replaced by these eight buildings.

## Gameplay and collision

Three searchable exterior visits: **Mahama / Airport Bypass · railway bridge**, **Shangri-La · railway connection**, **Polo Club · northern stable buildings**. Each has an outdoor arrival and persistent E start/stop guide. One local pedestrian follows the eastern bypass path; it is not counted as an online player. Stable rooms remain closed; working-yard and private/public access boundaries still need current operator confirmation.

Bridge deck colliders begin at **5.05 m**; piers, abutments, banks and walls have their own bounds. Railway deck/track elevation is estimated around 6.15 m relative to the game's road base. It is not a measured terrain elevation. Cars remain on ground-level carriageways, not on a road ramp along the railway. No live train movement, timetable or train service is claimed.

Verification caught a Liberation pillar in a lane; its centre was corrected to the median between native carriageways. Full-game review also caught the generic eastward personal-car spawn landing outside a retaining wall. Scoped arrival placement now boards the owned vehicle on the adjacent road side, within 7.5 m and facing native traffic flow. Other city arrivals retain their existing placement.

## Verification and remaining acceptance

- **60 focused tests pass** across this batch, Polo/Senchi, Regent roadside, Shangri-La, interchange, Residential frontages, Kofi Annan, auth handoff and retained map tiles. New checks retain all rail/building IDs, preserve separate road/rail networks and one-way flow, verify arrivals/prompts, road cache/profile agreement, sampled minibus/bus/truck lane clearance under both spans, wall retreat, pedestrian continuity, owned vehicle boarding and finite bounded geometry/UVs/normals. Existing Polo search regression now checks the actual retained club identity and distant branch rather than counting the newly added stable visit as a duplicate.
- Production build, JavaScript/Python syntax, deterministic native/supplement regeneration and whitespace checks passed. The model fixture is `tests/fixtures/mahama-bypass-review.html`.
- Static geometry in Node: bypass **9 draws / 28,296 vertices**; railway/Liberation approach **10 / 79,200**; stable buildings **4 / 105,000**; total **23 / 212,496**, excluding browser canvas sign. These are not measured phone frame times.
- Full-game local review used the existing disposable profile: entered the bridge visit, opened/stopped its guide, found/fixed the car-placement issue, then drove through the underpass and stopped beyond it. The long-running test profile reached the existing death screen during the first attempt; the normal Restart at home button restored it before the completed drive. No reset/death-system changes or production player mutations were made.
- Also entered the northern building and Shangri-La crossing visits, opened/stopped their guides and resumed walking. No captured console errors in the local game or model review. Model/reference screenshots and gameplay evidence are saved under `review-artifacts/mahama-*`.

Current photos, measured walls/decks, hidden stable elevations, public/private access, unmapped neighbouring buildings, precise bank/terrain transitions, full bidirectional route acceptance and phone/shared-player performance remain open. Track detail is currently a 3D reconstruction; a wider railway map-layer/operation system is not included. This is a connected **Partial exterior pass**, not acceptance of the whole northern Polo or corridor district.

## Inventory and release

Global work inventory: **283 packages — 47 In progress / 3 Research / 227 Queued / 6 Expansion**, **144 reference records**. Corridor building links: **33 authored / 310 native only** out of 343; these are ID links, not verified unique properties. The four rail ways are recorded separately in [rail supplement inventory](mahama-bypass-rail-inventory.csv); they were absent from the original 705-object road/building/land-use extraction.

Generator: `python3 scripts/realism/build-mahama-bypass-map.py`. It reads retained static rail evidence and bundled source layers; no runtime OSM/Google dependence is added. Existing surrounding district models remain intact. Available locally at **http://127.0.0.1:3002/game/**. No staging, commit, push or deployment in this pass.


## Release state — 20 October 2026

This exterior pass is now deployed to [Worldfolk](https://worldfolk.world/game/) as **0f71d1b6-bd59-4a10-8ff1-4fd9bafa6544**, with the connected Polo and railway updates. Deployment does not close current-photo, measured-dimension, concealed-facade or physical-device/shared-player gaps. The pass remains **In progress / Partial**. Release evidence is in `review-artifacts/mahama-neighbourhood-deployment-check.json`; no database migration or Git stage/commit/push was performed.
