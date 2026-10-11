# Realism implementation progress

**Updated 11 October 2026.** The human/camera, walking and wardrobe, vehicle and Independence precinct exterior passes are live at [worldfolk.world](https://worldfolk.world/game/). The full realism milestones remain in progress.

## Current milestone status

| Order | Milestone | Status | Remaining acceptance work |
|---|---|---|---|
| 1 | Humans, animation, scale and camera | First pass deployed | Broader character variety, detailed clothing, authored animation, furniture alignment and device/crowd benchmarks |
| 2 | Vehicles, materials, lighting and street surfaces | First vehicle pass deployed; milestone in progress | Reference-based local vehicles and tro-tros, doors, occupants, projected headlights, surface/lighting review and performance checks |
| 3 | Independence precinct | Exterior and playable precinct pass deployed | Event crowds and complete visit acceptance |
| 4–8 | Accra Mall, Osu, Makola, Legon and Labadi | Queued for reference-based implementation and acceptance | Complete each location and its activities before expanding to the next |
| 9–12 | Religious spaces, heritage, daily-life loop and remaining areas | Queued | Follow the master checklist and location-level acceptance criteria |

**Latest verification:** 35 focused landmark, movement and vertical-navigation checks plus one authenticated HTTP/WebSocket/checkpoint test passed. The production build and full-game stair/camera review passed. These checks do not establish million-player capacity or a device-wide frame-rate guarantee.

**Next precinct work:** event crowds and complete visit acceptance. Shared human/vehicle refinements remain open; moving to the landmark package does not mark those milestones complete.

## 11 October 2026 — Walkable precinct and Unknown Soldier Memorial

- Shared stair and platform geometry now supports walking up/down both arch levels, grandstand aisles and the memorial steps. Deck guardrails stop falls, while vehicles remain on ground-level routes. The arch's central ground passage remains open.
- Camera height follows the player smoothly. Player and handle height is transmitted in HTTP/WebSocket presence and saved with movement, including reconnect/checkpoint handling. Server rejects invented heights and vertical jumps.
- Separate photo-referenced Unknown Soldier Memorial: stone plinth, bronze sentry and rifle, open ceremonial bowl, five platform steps and Ghana flag rows. Both its common name and the OSM name resolve to an outdoor approach.
- 87 mapped street/path sections supply the nearby kerbs, paving edges and one-way arrows. No invented road grid or new traffic signals.
- Removed generated doorway markers from these outdoor structures.

**Verification:** 35 focused landmark/movement/vertical-navigation tests and an authenticated HTTP/WebSocket/checkpoint integration test. Production build and browser review of both stair levels and the memorial. Shapes are authored approximations; additional monument sculpture detail, crowds and broader mobile performance acceptance remain open.

## 11 October 2026 — Walking, running and home wardrobe

**Status: deployed to worldfolk.world.** Cloudflare version `3bc834a3-e2f9-45e7-a826-21c5c0e149ce`.

- Replaced the sine-driven legs with stance/swing foot targets and two-bone leg solving. Walking has a supporting foot; running has a short flight phase. Hip height follows leg reach, ankles counter-rotate, and arms swing opposite the legs.
- Reduced walking speed from 2.6 to 1.65 metres/second. Running remains 5.2 metres/second and retains the existing Run toggle. Starts and stops blend smoothly.
- Relaxed, untucked casual shirt geometry, trousers and sneakers with a fine fabric weave. Four starter outfits: Everyday green, Coastal blue, Weekend rust and City casual.
- Added a physical wardrobe interaction in homes and **My life → Wardrobe**. Outfit changes persist in the existing profile and apply immediately to city and interior characters.
- Server validates the outfit, home ownership, distance and activity state. Clothing changes are unavailable during rest or a shift; equipped devices no longer replace clothing.
- Public polling and WebSocket presence include the outfit ID, so nearby players use the saved appearance without exposing inventory or session data.

**Verification:** 30 animation, movement, clothing and rest tests; an authenticated API integration check covering home restrictions, saving, account isolation, money preservation and two-player WebSocket appearance; production build and desktop/mobile browser checks of the walking/running rigs and home wardrobe. Live game returned HTTP 200; deployed gait and wardrobe modules match the verified source.

**Remaining realism work:** these are procedural gait improvements and casual garment variations on the existing rigs. Authored motion capture, terrain-aware foot placement, additional body types and independently modelled clothing remain open.

## 11 October 2026 — Human and camera foundation

**Status: first implementation pass deployed.** The entire city and the full character checklist are not complete.

### Implemented

- Locally hosted, licensed male and female humanoid meshes replace the primitive figures after loading.
- Real skeletons deform bodies, hands, elbows and knees. Shared geometry and textures are retained while each person has independent bones and clothing materials.
- Civilian shirt/trouser/footwear surface regions; hair, eyes and face detail; variation in clothing colour and skin tint.
- Speed-based walking/running cadence, smoothed start/stop, torso motion, sitting, sleeping, dancing, showering and driving poses.
- Existing persistent activity controls still decide when a player wakes, stands or stops an activity.
- City, interior and venue actors use the same character entry point. Loading preserves root position and current game state; leaving before load completion safely cancels the replacement.
- Camera pulled closer to human scale, with less empty foreground, retained first-person/overview modes and wall clearance. Venue framing updated too.
- Fixed sleeping orientation so the face points upward, and adjusted the new rig's seated height for the home sofa.

### Verification

- Production build succeeds.
- Focused tests cover shipped skeleton geometry, normalized skin weights, opaque garment groups, independent skeletons, crowd resource lifetime, walking/running/pose reset, camera body framing, room rest persistence and map rendering compatibility.
- Browser review of the character comparison and a local city scene.
- Both model bases, hair, textures and notices together are approximately 2.8 MB on disk. This is not a total game download or a measured frame-rate guarantee.
- Local review fixture: `tests/fixtures/human-review.html` (served only by the temporary review server, not published under `/game`).

### Still required before the full human milestone is accepted

- More distinct faces, body types, hair and clothing silhouettes; footwear and clothing meshes beyond fitted surface materials.
- Authored locomotion clips, foot placement on slopes/stairs, blinking and better furniture/vehicle hand placement.
- Device-specific frame-time measurements with full crowds and multiplayer action replication review.

### Sequence

The vehicle/material/lighting pass has started. The first landmark package is Independence precinct, followed by Accra Mall, Osu, Makola, Legon and Labadi. Each location must be accepted against real references and a complete playable visit.

## 11 October 2026 — Vehicle animation and cabin pass

**Status: first vehicle foundation pass deployed.** This does not finish the vehicle or city realism milestone.

### Implemented

- Transparent tinted glazing, dashboards, steering wheels and seats in passenger cars; open bus cabin with seat rows and window pillars.
- Cached wheel geometry, four moving wheels in two instanced draw calls per vehicle, front-wheel steering and distance-based wheel rotation.
- Animation connected to local driving, public rides, ambient traffic and remote player vehicles; reverse movement and accelerated rides use actual travelled distance.
- Brake lamps brighten under deceleration and release afterward; headlamp and tail-lamp emission follows day/night conditions.
- Large location jumps reset animation sampling without spinning the wheels or falsely triggering braking.
- Preserved the existing vehicle collision dimensions and routing. No database migration or account changes.

### Verification and remaining work

- Browser reviewed daylight, night, rolling wheels, steering and braking; no console errors in the review scene.
- Regression coverage includes wheel transforms, light state, cached geometry lifetime, reverse movement, jump handling, bus glazing and collision bounds.
- Passenger cars and buses remain procedural models. Exact local body references, detailed tro-tro variants, door animation, driver/passenger fitting, projected headlight illumination and device crowd benchmarks remain required.
- Vehicle review fixture: `tests/fixtures/vehicle-review.html`.

## Release record

The release sequence is recorded below. The latest Cloudflare release includes the shared foundations and the precinct exterior pass.

| Release | Commit | Cloudflare version | Deployment verification |
|---|---|---|---|
| Human/camera foundation | `50b16c4` | `2ddd642e-016c-48c2-b2b9-c41d0d8e10d5` | Live character module matched the committed source |
| Vehicle animation and cabins | `5ecf69a` | `57f9dabe-55bb-4071-9939-7b67bb34ad78` | Live vehicle model/motion modules matched the committed source; game HTTP 200 |

No database migrations or account changes were required for these releases. Location rows remain unaccepted until their reference and gameplay reviews are complete.

## 11 October 2026 — Independence precinct exterior pass

- Reconstructed the gate's stone courses, ring medallions, recessed date panel, three portals, coffered soffit, cornices and fountain gardens from exterior references.
- Replaced the seaward arch's solid bands with two open viewing decks, railings, stairs and a front black star; removed invented inscriptions.
- Rebuilt all eight mapped grandstands with open supports, terraces, bench bays, four aisles and Ghana-colour roof fascia facing the square.
- Shared ground-level collision definitions protect piers, fountains, stair bases and terraces while keeping the gate and arch centres passable.
- Added a reproducible exterior review fixture at `tests/fixtures/precinct-review.html`.

This exterior pass has since been extended with walkable platforms/stairs, the Unknown Soldier Memorial and mapped street details (see the update above). Event crowds and complete visit acceptance remain open. Models are not surveyed or photogrammetric reconstructions.

Verification: centre openings tested against both rendered mesh rays and collision polygons; fountain/stair/terrace boundaries and all eight inward-facing stands checked. Arrival framing raises the view by eight degrees to retain the arch crown. An obsolete pre-foundation camera-distance assertion was corrected; camera wall clearance remains tested. The initial final rebuild ran out of local disk space; removing the obsolete generated `.next` cache and temporary character archive allowed it to complete.

**Deployment:** Cloudflare version `ef55edad-5dad-47f1-955d-c4e77067a366` serves the precinct pass on `worldfolk.world`. The live precinct module matches the source byte-for-byte and `/game/` returns HTTP 200. Full-game review confirms the arch crown remains visible on arrival. No database migrations or account changes were made.
