# Airport First / Second and the Marriott–Airport Road junction

18 October 2026. **Local partial implementation within ACC-197. Not deployed.**

## Resolve the names before modelling

The transit directory places **Airport First (northbound)** at longitude −0.177400, latitude 5.606385, and **Airport Second (southbound)** at −0.178043, 5.604578. These are two directional visits, not a claim to cover every stop carrying those names. Sources:

- [Airport First transit record 2683082450403719627](https://busmaps.com/en/ghana/public_transit-stop-Airport-First-2683082450403719627), visually read in the browser: map and Street View links expose the point, northbound service descriptions and the underlying Accra GTFS feed attribution.
- [Airport Second transit record 11243152980546474348](https://busmaps.com/en/ghana/public_transit-stop-Airport-Second-11243152980546474348): map/Street View point and southbound service descriptions. These directory records do not establish current service frequencies or surveyed boarding positions.
- The similarly named [OSM node 4984741723](https://www.openstreetmap.org/node/4984741723), approximately 5.60983, −0.17659, is farther north. It is **not** reused as the source ID of either authored stop. Other directional stop variants and name/location disagreements remain open.

The game uses the transit coordinates to identify each visit, then places its safe waiting approach on the corresponding native carriageway's outer pavement. The offset and display position are estimates; they are not survey-grade stop pins.

## Visually reviewed street captures

All three overlays identify **August 2024**, checked 18 October 2026. Capture dates remain historical; check dates do not make them 2026 photographs.

1. [Airport First, east boarding side](https://www.google.com/maps/@?api=1&map_action=pano&pano=4kFe8EQilJuyHmynC5J0LQ&heading=110&pitch=-5): open paved edge, roadside advertising/display frames, commercial frontage and tro-tro activity. No covered bus shelter or public bench row is established by this view. Evidence: `review-artifacts/airport-stops-first-street-2024.png`.
2. [Airport Second, western pavement](https://www.google.com/maps/@?api=1&map_action=pano&pano=Ldl0MVXHC80joSZeCwy8Lw&heading=315&pitch=0): open paving, segmented drainage covers, freestanding display frame, planted property edge and public waiting space. The earlier automatically selected February 2016 panorama was replaced with the August 2024 capture using the date selector. Evidence: `review-artifacts/airport-stops-second-street-2024.png`.
3. [Airport Road / Liberation Road junction](https://www.google.com/maps/@?api=1&map_action=pano&pano=s_W_8dtDyu1rzbuEKEanUQ&heading=100&pitch=-8): divided approaches, wide turning mouths, kerbed islands, pale/dark painted kerbs, boundary trees and an open intersection. No new signal array or zebra crossing is inferred. Evidence: `review-artifacts/airport-junction-street-2024.png`.

Imagery is reference-only, not redistributed as game textures. Advertising artwork, business phone numbers and dated tenants are not copied. Display frames carry invented in-game wayfinding text, explicitly an interpretation of the physical frame rather than the real operator's current copy. Nearby shopfronts, walls, trees, temporary canopies and all boundary details are not reconstructed in this pass.

## Implemented visit

- Two canonical map/search icons with directional labels and public outdoor arrivals; a third visit identifies the **Airport Road / Liberation Road junction**. Aliases remain geographically bounded and do not merge remote similarly named stops.
- Open paved waiting areas, finite-size freestanding frames and two local scenery pedestrians at each stop. There are no invented shelter roofs or seat rows. Local NPCs do not count as online players.
- **Wait** persists until the player explicitly ends the activity. The separate **Choose transport** hotspot opens the existing destination/vehicle picker. This is the game's ride system, not a live GTFS timetable or an automatic simulation of the listed bus lines.
- Junction visitor guide and the native pedestrian link **623707814** beside Marriott. Player walking checks cover the whole path. Walking across a vehicle access remains an at-grade crossing; it is not marked as a protected crossing or presented as an accessible surveyed route.
- Extended the public street pass from **21 to 39 native ways**: 38 vehicle roads/accesses plus the pedestrian link. Added the junction's native road splits and turn lanes, photo-estimated widths, and alternating kerb paint locally. Dedicated narrow U-turns keep their narrow width and reject bus continuation. Sparse lighting and guessed-signal suppression extend through the bounded junction area.
- Full native coordinates remain authoritative for traffic, safety and road polygons. Only rendered road surfaces are clipped to the documented precinct bounds (north limit 5.60665), so a long native way does not paint an unreferenced extension. No new navigation edge or route through a building is invented.

New way IDs: **4790615, 172920770, 419694819–821, 340844849, 510791928, 510791931, 514484049, 637899315–316, 96639918, 96639921, 418520464, 448732034, 515063424, 511032948**, and walking way **623707814**. Native coordinates are from the same checked-in Airport City context as the earlier pass. Estimated widths and kerb/display dimensions still need measurement.

## Verification and remaining work

Six new unit/regression tests cover canonical arrivals, name ambiguity, pavement/frame clearance, continuous NPC routes, the complete Marriott pedestrian path, one-way bus continuations and a full bus traversal through the junction, narrow U-turn rejection, clipped rendering bounds, UVs and batching. One new local API test visits all three destinations while preserving registered identity and balance.

Full-game browser checks and saved screenshots are recorded in `implementation-progress.md`. Device frame rates, shared-player waiting poses, current stop furniture, surveyed drainage/ramps and every opposing stop variant remain unverified. The neighbouring properties retain native geometry; the isolated preview intentionally omits those surrounding buildings.

**Next bounded work:** Airport Road / Airport Bypass eastern junction and the connections towards Terminal 2/3, using current reference captures for the crossing points, islands and grade changes before adding street furniture.
