# Accra Mall trotro terminal — ACC-261

Updated 15 October 2026. First playable pass; exact present-day bay and shelter design remains unverified.

## Placement and references

- [OpenStreetMap way 300519834](https://www.openstreetmap.org/way/300519834): the actual terminal boundary, retrieved from the public OSM API on 15 October 2026. The boundary nodes were last edited in November 2024. The bundled POI `601039668` is an osmium area identifier, **not** OSM way 601039668. Geometry and access-road coordinates are recorded in `public/game/mall-terminal-map.js` with ODbL attribution.
- [Spintex Road entrance panorama](https://www.google.com/maps/@5.6210436,-0.1734425,3a,90y,180h,90t/data=!3m7!1e1!3m5!1sILtdRwTImkMxWt6H00Lr_Q!2e0!7i16384!8i8192): visually reviewed; **capture August 2024**, not 2026. Worn road/compacted approach, concrete barriers, low roadside structures and roof framing are visible. No Street View panorama was available at the terminal POI itself. Entrance imagery does not verify the entire yard.
- [Accra Trotro station description](https://accratrotro.com/accra-mall-trotro-station/): June 2021 route/location context; it is historical evidence, not a current service timetable or photograph.

The station is south of the mall and is separate from Spanner and the mall roundabout. The three marked bays, corrugated waiting shelter, benches, driver desk and route boards are **authored game facilities inside the mapped boundary**. Their exact real-world dimensions, materials and positions are not established by the available imagery. No real businesses or temporary vendor roster were invented, and no Google imagery was imported as game textures.

## Playable implementation

- Searchable Accra Mall Bus Terminal destination, 2D icon and clear outdoor arrival.
- Mixed grey paving, worn asphalt and muted compacted ground, with mapped access roads, drainage detail and a covered waiting area. No new generated traffic lights.
- Three separated minibuses with marked boarding positions. Waiting queues, a mate, a driver, a walking visitor and seated passenger remain inside the terminal and clear of the departure corridor. Local NPCs are scenery and do not increase the online player count.
- Press **E / Interact** at a boarding point to buy an Airport City, Legon or Osu **Worldfolk game service**. These are fictional services with game fares, not claims about the real station's routes or prices.
- Boarding is validated at the server: registered player, correct terminal/service, player on foot near the bay, no active shift/rest, sufficient balance and a concurrent-request guard. The server calculates fares and routes; client-supplied fare/destination values are ignored.
- The journey follows a short authored yard connector, the mapped service-road approach and the authoritative OSM driving route. The boarded minibus is removed from the parked model and collider set so it cannot block itself. Other parked minibuses remain physical obstacles. Ambient road traffic is kept out of the reserved loading yard.
- Players boarding the same service during its departure window can share a ride ID and use the existing ride chat, passenger interaction, radio, outside camera, speed controls and Skip ride. Arrival records the trusted destination instead of labelling a terminal ride as home.
- Waiting benches use the persistent sitting interaction. Press **E / Stand up** when ready to leave.
- The driver desk opens **Mall terminal tro-tro driver** in Work. A shift supplies a minibus, requires passenger collection and driving to Airport City, and pays **₵180 in game** after the existing work tasks and shift timer. Work vehicles are restored after completion/cancellation; payment is protected against repeated collection.

## Related fixes

- Internal map-asset binding URLs now use `https://localhost/...`. The binding serves the request internally; it is not a network fetch to a user's computer. This works with Vite's development host check and the Cloudflare asset binding, fixing local road-graph/directory requests previously rejected with the synthetic `maps.internal` host.
- Terminal journeys reuse the existing 4×/8× simulation loop and swept road movement. The multiplier is applied once in the game loop; the terminal does not add another speed multiplier. Existing traffic checks cover accelerated playback and blocked movement.

## Verification and remaining work

Focused terminal tests cover canonical search/arrival, physical vehicle spacing, departure from every bay with parked vehicles present, passenger clearance, shelter access, seat interactions and collision-safe departure motion. Local registered-account API tests cover remote/spoofed boarding, concurrent charges, shared rides, skip/replay protection, workplace checks and single wage payout. Neighbouring roundabout, bridge, catalogue and traffic regression checks are included in the review run.

Screenshots and full-game review are recorded in [implementation progress](implementation-progress.md). Review fixture: `tests/fixtures/mall-terminal-review.html`. Its surrounding terrain is schematic; assess the full game's context separately.

Still required: recent yard/shelter close-ups, measured bay dimensions, confirmed materials and drainage, current real service research, richer boarding animations, shared NPC queue simulation and phone/multiplayer performance acceptance. ACC-261 stays **In progress**. Deployed to [worldfolk.world](https://worldfolk.world/game/) on 15 October 2026 as Cloudflare version `d04fe3ad-01d6-4ae6-a0ad-0cb1e19af8f7`. The live menu and asset delivery were verified; authenticated boarding and wage tests were performed locally, not against production player data.

Next: **ACC-262 — Spanner and mall bus-stop seating**.
