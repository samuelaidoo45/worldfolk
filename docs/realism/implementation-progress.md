# Realism implementation progress

**Updated 11 October 2026.** The human/camera, vehicle and Independence precinct exterior passes are live at [worldfolk.world](https://worldfolk.world/game/). The full realism milestones remain in progress.

## Current milestone status

| Order | Milestone | Status | Remaining acceptance work |
|---|---|---|---|
| 1 | Humans, animation, scale and camera | First pass deployed | Broader character variety, detailed clothing, authored animation, furniture alignment and device/crowd benchmarks |
| 2 | Vehicles, materials, lighting and street surfaces | First vehicle pass deployed; milestone in progress | Reference-based local vehicles and tro-tros, doors, occupants, projected headlights, surface/lighting review and performance checks |
| 3 | Independence precinct | Exterior reconstruction pass deployed; full visit acceptance open | Vertical stair/platform access, Unknown Soldier Memorial, event crowds, connecting streets and complete visit acceptance |
| 4–8 | Accra Mall, Osu, Makola, Legon and Labadi | Queued for reference-based implementation and acceptance | Complete each location and its activities before expanding to the next |
| 9–12 | Religious spaces, heritage, daily-life loop and remaining areas | Queued | Follow the master checklist and location-level acceptance criteria |

**Latest verification:** 41 focused landmark, camera, movement and traffic checks passed; the production build succeeded. Exterior review covered the gate, arch, stands and mapped layout. Full-game review confirmed the authored arch and stands appear at Independence Square. No errors were reported in the exterior fixture. These checks do not establish million-player capacity or a device-wide frame-rate guarantee.

**Next precinct work:** vertical stair/platform access, the Unknown Soldier Memorial and connecting-street detail. Shared human/vehicle refinements remain open; moving to the landmark package does not mark those milestones complete.

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

This is a reference-based exterior pass. Platform access and vertical stair movement, the Unknown Soldier Memorial, event crowds and detailed surrounding streets remain incomplete. Models are not surveyed or photogrammetric reconstructions.

Verification: centre openings tested against both rendered mesh rays and collision polygons; fountain/stair/terrace boundaries and all eight inward-facing stands checked. Arrival framing raises the view by eight degrees to retain the arch crown. An obsolete pre-foundation camera-distance assertion was corrected; camera wall clearance remains tested. The initial final rebuild ran out of local disk space; removing the obsolete generated `.next` cache and temporary character archive allowed it to complete.

**Deployment:** Cloudflare version `ef55edad-5dad-47f1-955d-c4e77067a366` serves the precinct pass on `worldfolk.world`. The live precinct module matches the source byte-for-byte and `/game/` returns HTTP 200. Full-game review confirms the arch crown remains visible on arrival. No database migrations or account changes were made.
