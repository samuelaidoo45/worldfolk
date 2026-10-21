# Tetteh Quarshie Interchange — ACC-175

**In progress · local implementation · 16 October 2026.** This is the large N1/N4 interchange north of Accra Mall, separate from the small mall/Spanner roundabout and its cocoa-pod statue.

## Direct reference checks

- [Upper motorway panorama](https://www.google.com/maps/@?api=1&map_action=pano&pano=_SiKnGZgVIdYpc19Wv_Rqw&heading=350&pitch=0&fov=95), at 5.6231816, −0.1764356: **August 2024**. Visually reviewed the recessed lower road, grass banks, stone pitching, concrete edge parapet and steel guardrail. The selected capture predates the 2026 works.
- [Lower-road panorama](https://www.google.com/maps/@?api=1&map_action=pano&pano=vJqrzj-cl0CpaV8Jy23IYg&heading=355&pitch=0&fov=95), at 5.6228944, −0.1762764: **September 2024**. Panned from the north-facing underpass to the eastern retaining wall. Shows the two spans, exposed beams, three-lane carriageway, paved shoulder/drain, pale-blue walls, steel rail and stone-faced bank. The timeline at this position offers September 2024 and February 2016. This is not a 2026 capture.
- [Associated Consultants project photograph](https://www.linkedin.com/posts/associated-consultants-limited_we-were-honoured-to-host-the-ceo-of-the-ghana-activity-7439697166752800769-uDo5): the directly inspected photograph shows a concrete T-beam, launching gantry, deck edge, traffic and adjacent construction. The publisher describes visits on 14–15 March 2026; the exact capture day of this frame is unverified. This establishes ongoing beam work, not the final October lane configuration.
- [Ghana Highway Authority progress statement](https://www.linkedin.com/posts/highwaysghana_day-2-more-progress-at-tetteh-quarshie-interchange-activity-7438992812366499840-8D6s) describes three further T-beams launched on 15 March 2026. Text reviewed; the image gallery encountered a sign-in wall and is not claimed visually reviewed.
- The July 2026 Exploring with Mann YouTube reference surfaced in search but its account/video is unavailable. It was **not** used as visual acceptance evidence.

No Google pixels, third-party mural artwork, advertisements or video frames are imported as game textures. The blue paint and structural cues are interpreted using original materials. See [reference register](reference-images.json).

## Geometry and gameplay

- Uses 55 native OSM motorway/trunk records from the bundled extract. Displayed pieces are bounded to the interchange district and keep their original horizontal coordinates. Includes both bridge ways **40649950** and **40649987**, the mapped ramps, N4 carriageways and five source grass polygons. It does not invent new construction lanes or replace the routing graph with guessed connections.
- Two concrete bridge decks, longitudinal beams, pale-blue abutments/retaining walls, grey parapets, steel rails, sloping approach banks, asphalt and three-lane markings. Original route boards identify Madina, Tema, Lapaz and Airport connections; exact installed sign positions/typography are not surveyed. No fictional roadside businesses or benches are added to the motorway.
- **6.6 metres is an estimated deck height**, with smooth 180-metre approach profiles. Ramp endpoint heights follow their connected native roads. Horizontal dimensions follow map centrelines with the existing game road widths; vertical dimensions, wall extent and grading remain estimates.
- Vehicles, local ambient traffic, remote driving avatars, name tags and chase/cabin cameras use the road profile. Current carriageway tracking preserves local road identity through steering changes. Native bridge approach endpoints can change OSM layer; an underpass crossing cannot become a turn onto the bridge. Different-level bodies do not brake, collide or push each other, while same-level contact remains active.
- Supports and rail/wall collision are height-aware. Nearby collider selection is bounded; the slab is not an invisible ground wall. The client and server disallow leaving a car on raised motorway approaches; park beyond them before getting out. Ground-level lower-road exit remains available.
- Adds one canonical search/map destination, a clear ground-level arrival, guide and photo interaction. The generic street-name duplicate is suppressed in favour of the named interchange. Existing pedestrian routes/Spanner remain the intended walking approaches; no walkable motorway deck is advertised.
- Static rendering batches 6,622 parts to 13 draw batches before browser-only signs. Surface depth offsets remove distant overlay flicker. This is a draw-call count, not a hardware frame-rate guarantee. No extra network polling or map provider is introduced.

## Verification

**72 focused/regression tests pass**, including two local API checks. Production build, reference-registry audit and whitespace checks pass. See [implementation progress](implementation-progress.md). Checks cover continuous grades at road joins, main/lower minibus clearance, elevated guardrails, layer transitions, steering continuity and cross-level vehicle separation, plus existing traffic/Spanner/roundabout/terminal behaviour. Local API tests check safe exploration without losing identity/balance, refusal to get out on the bridge and permitted lower-road exit.

Browser review: isolated production model/physics preview completes an N1 548-metre and N4 435-metre drive at 4× with clear-lane checks. The full game finds one search result, selects the interchange, arrives at the guide, reads it and stops the activity. [Full-game arrival](../../review-artifacts/interchange-gameplay-arrival.png), [overview](../../review-artifacts/interchange-overview.png), [underpass](../../review-artifacts/interchange-underpass.png). Isolated scenes omit neighbouring city buildings. Full-game manual driving, a full public transport ride, shared deck acceptance and physical-phone frame times are not claimed tested.

## Remaining acceptance work

Obtain measured deck/approach levels and current 2026–2027 construction-completion photographs, drainage/kerb close-ups, exact lane/merge widths and final sign locations. Refine curved wall/parapet joins and bank surfaces, add surveyed street lighting and current roadside context. Test multiple players under/over one another, abrupt manual steering/reload at overlaps, complete live traffic routes and physical devices. Local road identity is not a new persisted server lane field; reload at an overlap initially resolves the road from saved position/heading. Keep ACC-175 In progress until these checks pass. Not deployed by this implementation pass.
