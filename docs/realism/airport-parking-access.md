# Terminal 3 parking annex and public access

Updated **18 October 2026**. Local implementation, not deployed. Covers ACC-172 and the airport part of ACC-197; both remain **In progress / Partial**.

## Evidence and placement

- [GACL's official directional video](https://www.linkedin.com/posts/ghanaairports_gacl-aia-directionalvideo-ugcPost-7489251754136711168-xt-S/) was played in the user's existing signed-in session. The post is headed “Directional Video: Terminal 3 Car Park Annex”. LinkedIn showed “2mo”; no exact publication day or footage capture date was verified. Do not label it an October 2026 capture.
- Reviewed the three approaches: beneath the departure-road structure; the onscreen **Entry 2 — From Aviation Social Center or Silver Star Towers**; **CIP Entry — From Airport Shell Roundabout**. The video shows two exit routes, one via CIP. Do not infer a full survey from a driving video.
- Visible details: green/black ticket dispensers, pale booths, raised barrier arms, white bay lines and directional arrows, black/white outer kerbs, red/white inner edges, a pale wall with repeated black EXIT lettering and contrasting chevrons. Original procedural geometry/materials reproduce these cues; reference pixels are not game textures.
- The user explicitly confirmed the parcel **north of T3 beside CIP**, after the video proved insufficient to geolocate every gate. Google Maps aerial context was inspected around `5.6041,-0.1726`; the ©2026 imagery attribution does not establish capture date. The native CIP loop and adjacent buildings constrain the playable sample.
- [GNA's 19 July 2026 report of GACL's notice](https://gna.org.gh/2026/07/gacl-to-close-terminal-three-car-park-for-redevelopment/) establishes the **20 July closure** of the former car park. The reported 600+ annex capacity is **not** a count of game bays or evidence of an exact parcel boundary.
- [GACL parking guidance](https://www.gacl.com.gh/parkings/) establishes signed terminal access and designated drop-offs; it is undated. Announced future hotel/car-park/concourse buildings remain unbuilt in this reconstruction.

Clean public video-frame captures: `review-artifacts/airport-annex-entry-reference-gacl-2026.png` and `airport-annex-exit-reference-gacl-2026.png`. No signed-in sidebar/profile information is retained in those files.

## Local implementation

- New **Terminal 3 parking annex · CIP approach** destination, centered at `[-0.17235,5.60472]`, with a safe waiting-pavement arrival. The **36 × 34 m sample and 16 bays are estimates**, not a model of all real parking capacity. Three gate offsets and their short connectors are interpreted. No neighbouring native buildings are removed.
- Three visible, physically clear entry connections and two exit options. Existing native ground circulation is retained. Added native ways **4845628, 1343473211 and 1343473212** to the authored corridor, bringing it from 72 to **75 ways**. Exact extracted coordinates and one-way flags remain unchanged; these are not new invented public roads. Short sample-lot connectors are original game geometry, distinct from the native routing graph. Auto-route endpoints snap to the existing public approach.
- Booths, ticket terminals, raised booms, parking paint/wheel stops, exit wall/chevrons, bench and guide board. Parked cars occupy marked bays; central aisles remain clear. A small attendant/waiting/visitor group stays off the native carriageways and does not count as online players.
- Explicit start/stop sitting and a persistent visitor guide. Both 2D and 3D retain the destination, player marker and movement. The 2D map distinguishes the annex from the amber closed former lot.
- Removed the old T3 parked cars, active bay markings and open-parking sign. Added an **inset 165 × 29 m game cordon**, closed-parking signage and a parking update board. Its contractor perimeter is estimated. Outer native circulation and the raised departure loop remain open. Existing canopy outlines are retained; demolition was not established by the evidence.
- Repositioned T3's default arrival into the covered public arrivals area. Clicking the old “Terminal 3 Car Park” POI resolves outside the screened work zone instead of spawning within it.
- Closure shared by physical collision, tile-derived traffic roads and browser/server routing. Full native graph edge shapes are checked against the closed rectangle; endpoints on opposite sides do not create a shortcut through the cordon. Ground-level closure does not flatten the raised ramp.
- Current T2 bounded works scene remains in place. A complete October T2 contractor perimeter, revised frontage and pedestrian diversions are **not** established by this pass.

## Verification

- **31 focused checks** passed: annex/closure arrivals, exact segment intersection, native-road/building clearance, all three drive aisles/connectors, visitors and persistent activity selection, finite batched geometry, real graph driving/walking detours, both terminal approaches and earlier corridor/2D style regressions.
- **5 local API checks** passed serially, including annex/parking-update visits and persisted snapshots preserving identity/balance; T2/T3 and junction regressions, upper/lower vehicle exit. An earlier concurrent fixture run hit a local D1 error; the serial suite passed without changing production error handling.
- Production build passed. Browser checked map selection → annex arrival → sitting → stand up → walk to guide → start/stop guide → 2D view. Isolated preview checked north/CIP links and the former-lot barrier with the departure road retained. An old cached preview was discarded and reloaded without cached modules before final screenshots.
- Annex static geometry batches **355 → 23** before browser-only text planes (verify model metadata if changing vehicles/materials). This is a draw-call reduction, not a physical-phone frame-rate benchmark.

Evidence: `airport-annex-overview.png`, `airport-annex-gameplay-seated.png`, `airport-annex-gameplay-guide.png`, `airport-annex-gameplay-2d.png`, `airport-t3-closed-parking.png` under `review-artifacts/`.

## Remaining acceptance

Obtain a dated aerial/marked plan and measured gate positions, full bay layout, pedestrian link/kerb survey and current T2/T3 contractor boundaries. The user-confirmed north/CIP placement and video details support this bounded pass, **not exact whole-site reconstruction**. Full payment/ticket operation, airport security/private interiors, complete walking diversions, shared-vehicle acceptance and physical-device performance remain open.
