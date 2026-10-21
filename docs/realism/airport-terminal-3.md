# Accra International Airport — Terminal 3 (ACC-172)

Implementation pass: **16 October 2026. Local only; not deployed.** Covers the recognizable exterior and a public landside visit. This is a partial reconstruction with native horizontal outlines and photo-estimated heights, details and circulation interpretation.

## References and decisions

- [GACL project page](https://www.gacl.com.gh/projects/) and its [completed-building aerial](https://www.gacl.com.gh/wp-content/uploads/2018/11/ssss.jpg), visually reviewed: broad barrel roof, three skylight strips, glass facade, raised departures road, lower arrival approach, curved ramps and parking shelters. The image URL includes 2018, but no exact capture date was verified. Screenshot: `review-artifacts/airport-t3-operator-aerial-reference.png`.
- [Official Ministry naming announcement, 23 February 2026](https://www.mot.gov.gh/10/16/1/328/government-reverts-kotoka-international-airport-to-accra-international-airport) establishes current **Accra International Airport** wording and a phased transition. Historical Kotoka names remain search aliases. Exact lettering position and style on each terminal need current close-up confirmation.
- The requested Street View point near the forecourt resolved to a [Continent Media concourse photosphere](https://www.google.com/maps/@?api=1&map_action=pano&pano=CIHM0ogKEICAgICm_9PLxAE&heading=0&pitch=0). Visually inspected and panned its glazing, columns and trusses. The bottom overlay says **October 2019 capture**; its header says January 2022. These dates are distinct. No current external Street View at that point was obtained. Screenshot: `review-artifacts/airport-t3-interior-reference-2019.png`.
- The contractor's [project gallery](https://michelettighana.com/nu/portfolio/kotoka-international-airport-terminal-3/) prominently shows construction; it was not treated as the completed facade. A recent news image of the renamed airport was viewed, but its precise terminal identity is uncertain, so its architecture was not copied onto Terminal 3. The CediRates source article returned 404.
- [Ministry report of the August 2026 car-park/hotel groundbreaking](https://mot.gov.gh/10/16/1/363/president-mahama-breaks-ground-for-multi-purpose-car-park-and-airport-hotel-complex-at-accra-international-airport), [April concourse groundbreaking](https://www.mot.gov.gh/10/16/1/338/president-john-dramani-mahama-cuts-sod-for-new-concourse-at-the-accra-international-airport) and [Terminal 2 works](https://www.mot.gov.gh/10/16/1/332/transport-minister-inspects-ongoing-works-at-terminal-2-of-accra-international-airport) prevent proposed future renderings being represented as completed infrastructure. The exact October 2026 construction footprint still needs verification.

Original geometry and procedural materials are used throughout. Reference photos, Google pixels and real advertising are not imported as runtime textures. The register keeps unknown capture dates explicit.

## Mapped and authored scope

Replaces exactly **10 source ways**: main terminal `1197119150`, covered arrivals `2420073752`, six enclosed gate links `2676037408/10/12/14/16/18`, and parking walkway covers `2420018458/60`. Another building named Terminal 3 (`604752520`) is elsewhere in Accra and remains untouched. No district-wide generic deletion.

Added broad curved roof sections and skylights, white/blue cladding, curtain-wall modules, interpreted upper departure volume and canopy arms, six native gate-link silhouettes, public covered waiting space, benches, a marked crossing, visitor boards. The 18 October access update removes the old active parking layout and adds a separate north/CIP annex sample; see [parking/access follow-up](airport-parking-access.md). Parking-stall subdivisions, ground details and furniture are interpretations, not a measured parking survey or a count of every real bay.

The raised road follows native ways **626883873 → 626883875 → 626883872**. The **6 m deck height**, 9 m width and smooth ramp profiles are estimates. Shared road elevation now covers both Tetteh Quarshie and the airport through `road-elevation.js`; the existing `road-surface.js` pothole implementation remains intact. Player/NPC/remote vehicles, cameras, body contacts, road following and server vehicle exit use the shared elevation. Cross-level contacts and a ground-level wall under the bridge are avoided. Supports and rails use explicit lower/upper height bounds.

## Playable visit

- Canonical airport destination and historical search aliases, redirecting the old mapped Terminal 3 Car Park visit outside the closed works.
- Public arrival at the clear covered arrivals area with a broader view; the guide and marked crossing lead toward the covered arrival space.
- Photography, a visitor guide and three explicit start/stop seats. A small local traveller/greeter group uses tested clear routes; NPCs do not inflate online-player counts.
- Walk beneath the departure road and around the covered waiting area. Vehicle travel is supported on the elevated loop; exit is available again at ground level. Walking access to the upper departure platform is not yet implemented.
- The full security/check-in/baggage/interior sequence, live flights, boarding, working airline desks and new jobs are not implemented. The visible gate links do not promise a complete airside visit. The generic-room fallback is disabled for this outdoor landmark.

## Verification and open acceptance work

Unit tests cover exact source selection, aliases, profile-preserving API arrival, camera/road/native-building clearance, seat access, visitor continuity, height-continuous ramp joins, road identity through steering changes, cross-level contacts, a complete vehicle traversal, finite geometry/UVs and bounded static batches. Local API checks cover raised-road exit refusal and ground-level exit. Wider traffic/interchange/movement regressions and the production build are run; totals are recorded in `implementation-progress.md`.

Browser review checks overview, public arrival and departure levels, covered waiting, and a **504 m 4× departure-loop drive preview**. The isolated fixture omits unreviewed surrounding city buildings and ground-road context. Full-game checks use only a disposable local QA profile.

Current front/side/roof and construction photographs, surveyed levels, detailed terminal signage, kerbs/drainage, airport-specific interior circulation, luggage animation, dynamic parking, upper pedestrian access, synchronized multi-player under/over visits and physical-device frame times remain open. ACC-172 is **In progress**, not Accepted.
