# Mahama Bypass / Shangri-La / north Polo neighbouring buildings

20 October 2026 · ACC-284 · **Deployed / In progress / Partial**

## Bounded exterior closure

This pass covers all **52 native building records** whose bounding-box centres fall within longitude **−0.17725 to −0.1705**, latitude **5.6158 to 5.6206**. Fourteen already had authored exteriors; **38 are added here**, with their full native polygons, notches and courtyard holes intact. This is a bounded map-record count, not a claim that the map contains every present-day structure or property.

The accompanying [per-building inventory](mahama-neighbourhood-buildings.csv) lists every source record and the separate **eight additional reference-only structure estimates**. Keeping this manifest and a repeatable generator lets the next corridor pass cover many connected buildings without losing individual geometry or source gaps.

- **Northern courtyard complex — 20332079:** low, cream arched wings, brown weathered hipped roofs and open planted centre. It is not a tower. The separately visible concrete frame to its east is not part of its footprint.
- **Northern yard — 2175558972 / 974 / 976 / 978:** four small mapped structures with different roof forms. The large red/brown-roofed shed west of the seven earlier stable blocks is an additional manual estimate; it was absent from the bundled extract.
- **Western compounds — 32 native records:** separate small hipped, gabled and lean-to service/compound roofs, plus the larger north-west roofed block. Mixed grey/brown/rust roof families follow overhead context; concealed openings, heights and exact paint are estimates. The old “VILLAGIO HOTEL” map label on 2266652078 does not establish its current business identity or associate it with Villaggio Vista.
- **Polo Court:** native eastern roof **2491216764**, five additional residential roof plates and one central service roof estimated from overhead views. Cream walls, repeated windows, modest balcony details, brown hip roofs, paved central court, estimated pool and tennis court. This does not certify an operating clubhouse, apartment tenancy or private entry.
- **Grounds:** the two native wood polygons, including the courtyard exclusion, retain overgrown green ground and irregular estimated tree/shrub clusters; trees avoid roads, roofs and the rail bank. Existing bridges, stables, hotel, bank, Christman House and Regent roadside are retained.

## References and dates

Visually inspected in Google Maps on **20 October 2026**:

1. [Northern complex overhead](https://www.google.com/maps/@5.6204,-0.17454,214m/data=!3m1!1e3): brown courtyard roof, palms in the open centre, separate eastern unfinished frame, vegetation and access lines. **Capture date unknown**; 2026 copyright is not a capture date.
2. [Western compound overhead](https://www.google.com/maps/@5.6178,-0.17705,300m/data=!3m1!1e3): compact service roofs and remaining gaps around the existing hotel/Christman/bank models. Capture unknown.
3. [Polo Court roof cluster](https://www.google.com/maps/@5.6171,-0.1743,214m/data=!3m1!1e3): separate roof rows, shared paved court, small pool/tennis court. Capture unknown. Two visible map-coordinate anchors were checked to locate the manual roof estimates; this is not a survey.
4. [Northern stable yard](https://www.google.com/maps/@5.61795,-0.1738,214m/data=!3m1!1e3): west red-roof shed, seven pale stable roofs and long northern shed. Capture unknown.
5. [Liberation Road panorama](https://www.google.com/maps/@5.6197309,-0.1763426,37a,90y,90h,100t/data=!3m7!1e1!3m5!1si6RP6UizqYYCk6Y6xcRw1g!2e0): selector displays **September 2024**. Panned east and zoomed to inspect the low roof and cream arched elevations through the vegetation. Does not establish current occupancy or hidden elevations.

Screenshots are retained under `review-artifacts/mahama-*-reference*.png` for visual review only. The game contains original geometry/materials, not Google imagery or screenshot textures. Native OSM building geometry remains licensed/attributed by the existing map pipeline.

## Access and integration

Four render groups replace only their **38 declared source IDs**. Manual additions have separate string IDs and documented estimated rings. Fourteen earlier native-building renderers remain the sole owners of their source IDs. Three searchable public-side visits have persistent start/stop exterior guides. Private buildings and the construction frame are closed; no new private interiors, jobs or business services are invented.

The existing northern stable arrival moved a few metres south-east into the clear access aisle because its earlier point intersected the newly modelled west shed. The two bridge-owned-vehicle spawn corrections remain intact. Shared native roads and bridge heights are unchanged.

## Verification and limits

`python3 scripts/realism/build-mahama-neighbourhood.py` regenerates the bounded context, 38 native mass records, eight estimated manual records and per-building CSV. Tests check census/ownership, native ring equality, honest manual provenance, unblocked guide arrivals, courtyard roof/collision void, road-lane clearance, tree placement, wall retreat, finite geometry and batching. Existing corridor/auth/map regressions are retained.

Measured heights, roof slopes/materials, compound boundaries, current photos, concealed elevations, exact private approaches and physical-device/shared-player acceptance remain open. This completes the selected native-building exterior pass, not the whole Accra district or a photorealistic surveyed reconstruction.


Final local verification: **67 tests passed; production build passed**. New groups total **42 static draws / 222,485 vertices** in Node. Three full-game visits were opened and their guides stopped successfully; walking resumed and no console errors were captured. This is not physical-device FPS or multiplayer acceptance.


## Release state — 20 October 2026

This exterior pass is now deployed to [Worldfolk](https://worldfolk.world/game/) as **0f71d1b6-bd59-4a10-8ff1-4fd9bafa6544**, with the connected Polo and railway updates. Deployment does not close current-photo, measured-dimension, concealed-facade or physical-device/shared-player gaps. The pass remains **In progress / Partial**. Release evidence is in `review-artifacts/mahama-neighbourhood-deployment-check.json`; no database migration or Git stage/commit/push was performed.
