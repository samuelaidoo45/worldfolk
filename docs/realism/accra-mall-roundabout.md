# ACC-260 — Accra Mall roundabout and approaches

Implemented 15 October 2026. Status: **In progress**.

## Active references — reviewed 15 October 2026

Use the [current reference register](current-reference-images.md) and its image-specific dates. Previous source lists are retained in [the historical archive](historical-references.md).

- [Installed Tetteh Quarshie cocoa-pod statue](https://www.tiktok.com/@musiq_buz/video/7583993473427049739) — **published 2025-12-15; capture date unknown**. Standing cocoa-pod statue, blue-rimmed fountain, stone facing, white lettering, jets and lawn. Publication date is not a surveyed installation or capture date.
- [Google Ghana Street View imagery update](https://blog.google/intl/en-africa/products/explore-get-answers/experience-the-vibrant-beauty-of-ghana-like-never-before-with-updated-street-view/) — **published 2026-06-17; capture date unknown**. Includes Independence Square, National Theatre, National Mosque and Ussher Fort images and a stadium viewing link. Release date does not date each panorama. Other subjects are inspection targets, not individually verified captures.

The statue reference is a dated upload preview, not a measured survey. The 2016 empty-island panorama is archived. Road and grass coordinates still follow the bundled OSM way IDs; lane paint, signs and kerb widths require a newer close-up. The cloverleaf interchange is a separate location.

## Implemented

- Continuous road ribbons follow the stored curves, with dark asphalt, grey paved paths, grass verge, low central kerb and island. Metre widths come from the existing road-class system; the island is inset from the mapped circulation line.
- Original lane dashes/arrows and one marked game crossing at the mapped Spanner approach. These guide gameplay and are **interpreted markings**, not a surveyed paint inventory. No invented business signs or vendor stalls were added.
- A dedicated Tetteh Quarshie model adds facial features, cap, collared shirt, cloth seams, trousers and a raised ribbed cocoa pod. The fountain has blue tile coping, irregular stone facing, curved white lettering, water and twelve animated jets using a fixed 192-particle pool. Small cycad clusters frame the lawn. Basin radius (5.3 m), statue scale, facing, planting and full inscription are interpreted from the partial reference, not measured.
- The fountain basin blocks pedestrians as well as vehicles. The central island blocks vehicles. Walkers can step onto the low grass island; pedestrian visitors stay on the mapped south approach. Search and arrival put the player on that path, outside the carriageway.
- Shared traffic limits slow circulating vehicles and yield to circulating traffic on entry. Public-transport recovery and auto-drive cannot override that yield. Generated signal poles are excluded within 65 metres of the roundabout centre.
- A persistent traffic-viewing activity uses the existing explicit-stop interaction. Local visitors are scenery and do not increase the online-player count.
- Static geometry batches from 866 source meshes into 16 meshes in the headless check, plus one particle system; browser lettering adds one mesh. The mini-map continues to use the existing road tiles.

## Verification and remaining work

- 24 focused and regression tests pass: mapped arc continuity, complete taxi/bus circuit against island/fountain collision, statue bounds, bounded animated spray, entry yield and resumption, pedestrian clearance, safe search arrival, lookout, surface orientation, batching and existing traffic/Spanner checks.
- Production build passes. Full-game browser review confirms search, safe arrival, reload/resume, complete scene loading and starting/stopping the traffic-viewing activity with no captured game console errors. Road materials use depth bias to prevent overlap with map ground.
- Statue correction was visually reviewed in the isolated renderer from the pedestrian approach and close-up, with no captured console warnings/errors. Evidence: `review-artifacts/quarshie-fountain.png`.
- Earlier full-scene evidence: `review-artifacts/mall-roundabout-gameplay.png` and `review-artifacts/mall-roundabout-overview.png`. Browser fixture: `tests/fixtures/mall-roundabout-review.html` provides overview, statue close-up, pedestrian approach, circle-following and day/night views.
- Current kerb dimensions, lane widths, crossing paint, signs, drains and interchange grades need a current field/photo survey. Ground is a stylized reconstruction; this is not a photogrammetric replica.
- Multiplayer activity poses and phone frame-time acceptance remain open. Terminal bays, bus-stop furniture, shop frontages and Ghud Park are separate queued work.
- Deployed to `worldfolk.world/game/` on 15 October 2026, Cloudflare version `652abc7f-ddc2-47b1-9132-fe9f764316e3`. Public module hashes match the production build.

Next item: **ACC-261 — Accra Mall trotro terminal**.
