# Realism implementation progress

## 11 October 2026 — Human and camera foundation

**Status: first implementation pass, locally verified.** The entire city and the full character checklist are not complete.

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

### Next in the agreed sequence

Vehicle/material/lighting pass, then a reference-based Independence precinct visit,
followed by Accra Mall, Osu, Makola, Legon and Labadi. Each location must be accepted
against real references and a complete playable visit.
