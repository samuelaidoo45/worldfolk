# Accra International Airport — Terminal 2 (ACC-173)

Implementation: **17 October 2026. Local only; not deployed.** A partial public approach, using native building outlines and an interpretation of the established terminal shell. The exact October 2026 facade/construction boundary remains unverified.

## Reference evidence

- [Google Street View panorama on Airport Road](https://www.google.com/maps/@?api=1&map_action=pano&pano=uelFpHTsrSbOJyEh5pS_0A&heading=67&pitch=0), visually reviewed and panned. Capture overlay: **February 2016**. Shows the low terminal, roof lantern/eaves, long covered approach, separate glazed arrivals block and parking/service roads. This is historical context, not current construction evidence. Screenshot: `review-artifacts/airport-t2-street-reference-2016.png`.
- [September 2024 article with Terminal 2 frontage photograph](https://www.modernghana.com/news/1344166/ghana-airports-to-relocate-asky-air-peace-and.html), [image](https://cdn.modernghana.com/images/content/925202453501-l5gsj7u3i1-kotoka-international-airport-terminal-2-640x479.jpg). Visually reviewed copper/brown panel bands, recessed windows and sunshades, cream entrance canopy and glazed ground floor. Capture date unknown. The design is used as an established historic shell, not proof those facade panels survived the 2026 dismantling. Screenshot: `review-artifacts/airport-t2-historic-facade-reference.png`.
- [GACL repurposing report, 20 March 2025](https://www.gacl.com.gh/publications/repurposing-of-terminal-2-for-domestic-and-international-flights-underway/) and [Repurpose 4](https://www.gacl.com.gh/wp-content/uploads/2025/03/Repurpose-4.jpg), visually reviewed: baggage carousel, metal column cladding, pale ceiling grid and floor. Publication does not establish capture date. Held for future interior work; **a baggage hall is not implemented here**. Screenshot: `review-artifacts/airport-t2-works-reference-2025.png`.
- [Ministry inspection report, 11 March 2026](https://www.mot.gov.gh/10/16/1/332/transport-minister-inspects-ongoing-works-at-terminal-2-of-accra-international-airport) describes remodelling floors, walls, ceilings and leaks, and a then-planned July completion. Its image timed out in browser review; it is not counted as a visually inspected photo.
- [PassionAir's GACL frontage-closure notice](https://www.linkedin.com/posts/passionair_public-notice-notification-of-works-partial-activity-7458664806179360768-HfG8) says facade dismantling and partial road closure would start 11 May 2026, for an estimated month. That temporary May closure is **not assumed still active in October**.
- [Graphic's GACL oversight report, 5 August 2026](https://www.graphic.com.gh/news/general-news/accra-airport-terminal-2-renovation-to-be-completed-by-december-2026---gacl.html) gives the later December completion target and describes partitioned domestic operations while international-section works continue. Its generic airport header image was visually reviewed but does not identify Terminal 2 reliably; it is not used as Terminal 2 facade evidence.

No dated current external construction photo was verified. A modest screened side section signals ongoing work in the game, with its dimensions and position explicitly interpreted. No proposed connecting concourse or final new facade is presented as completed. Original procedural geometry/materials and authored signs are used; reference imagery and advertising are not runtime textures.

## Geometry and playable scope

Three exact source ways: **738854676** (Terminal 2 Domestic Departures), **738854674** (Domestic Arrivals), **1159898176** (front/east wing). Terminal 1 and similarly named bus-station roofs elsewhere in Accra remain unchanged. The native terminal road and parking centrelines remain available to the traffic/router; no invented road crosses a building.

The main native outline receives historic copper facade modules, recessed glazing/sunshades, low eaves, roof lantern and entrance shade. The separate arrivals building gets its own blue/glass facade. Height, subdivisions, roof lantern shape, furniture and renovation screen are estimates. Narrow grey pedestrian surfacing avoids covering the native pickup and parking roads. Waiting benches, a few luggage carts, bins, canopy lights and visitor boards distinguish the public approach.

A canonical city-map icon and aliases lead to a server-resolved arrival. Two photo points, one guide and two start/stop seats support a public visit. Three local traveller/greeter actors stay on clear pavement routes; they are not counted as online players. Colliders preserve clearance below canopies and block terminal walls, furniture and the screened work area. Generic room fallback is disabled for this outdoor landmark.

No check-in/security, terminal interiors, airline booking, airport jobs, live flight information, baggage interaction or virtual domestic flights are implemented. Future interior work should use the operator carousel evidence and updated photographs rather than reusing a generic room.

## Verification and remaining work

Tests cover source selection, nearby alias deduplication, preserving the unrelated bus terminal, safe arrival and camera, activity/road clearance, walking under canopies, approaching/leaving seats, continuous NPC routes, finite geometry/UVs and bounded static batching. The local API test preserves player identity/balance on arrival. Regression totals and browser/build evidence are in [implementation progress](implementation-progress.md).

Open: dated current exterior views, actual facade replacement design, construction partitions, measured roof/entrance levels, detailed interiors, luggage animation, shared-player poses and physical-device performance. **In progress**, not Accepted. Isolated model screenshots omit surrounding city/ground-road geometry; full-game evidence is recorded separately.
