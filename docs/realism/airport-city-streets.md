# Airport City public street connections — ACC-197 (bounded first pass)

Updated 18 October 2026. **Local implementation; not deployed.** This covers the Airport City section of the Liberation Road inventory package, not the whole 37–Airport corridor.

## Boundary and native geometry

The area between South Liberation Link, Liberation Road, Airport Bypass and the Marriott approach links **Stanbic Heights, One Airport Square, Marina Mall, Atlantic Tower and Accra Marriott Hotel**. Thirty-nine native ways (38 roads/accesses and one pedestrian link) retain their coordinates, connectivity and one-way directions. Source IDs and estimated widths are in `public/game/airport-corridor-map.js`; the native building/road context cuts pavements away from mapped structures and driveway mouths. The private service loop 671179891 is deliberately excluded from the authored road surface: part of its older geometry intersects the hotel footprint. It remains in the source/context; no invented replacement route cuts through the hotel.

- Liberation Road: ways **120726241, 419694823**, separate three-lane carriageways; photo-estimated width 10.5 m each and an earth/shrub central reservation.
- South Liberation Link: **4790599, 11287152, 105550266, 637704090**, separately mapped directions retained.
- Internal public approaches: **33821774, 343681377–379, 448732033, 4790603**.
- Airport Bypass: **670348801, 1098504095–096, 1540073309**, with double centre lines, paved western frontage and bare eastern shoulder interpretation.
- Marina/Square/Marriott driveway connections: **187955047, 400795333, 1005601030, 1259200513, 1364098820**. These remain driveable openings, not continuous kerb walls.

## Visually reviewed references

- [Liberation Road, Atlantic Tower frontage](https://www.google.com/maps/@?api=1&map_action=pano&pano=0E3WeYhlx8jflz4ImzvkrA&heading=185&pitch=-8): **August 2024** capture overlay. Panned along the carriageways: three lanes, broken lane marks, central bare reservation/shrubs, pale kerbs, separate pedestrian edges and street lights. Evidence: `review-artifacts/airport-corridor-liberation-street-2024.png`.
- [Airport Bypass beside Marina Mall](https://www.google.com/maps/@?api=1&map_action=pano&pano=dSCwfYIjYovh8fgaOuRatg&heading=175&pitch=-8): **August 2024** capture overlay. Double road centre line, block-paved mall side, exposed soil opposite, raised mall frontage and separate service access. Evidence: `review-artifacts/airport-corridor-bypass-street-2024.png`.
- [Stanbic / North Liberation Link](https://www.google.com/maps/@?api=1&map_action=pano&pano=VdgMvJ6nYscGl1lDfssqSw&heading=240&pitch=12): **August 2024**, previously reviewed street view showing block paving, kerbs, planting and divided street approach. Evidence: `review-artifacts/airport-offices-stanbic-street-reference-2024.png`.
- [Marriott approach](https://www.google.com/maps/@?api=1&map_action=pano&pano=PkEduyhSO5T6m2s9-mFRVQ&heading=5&pitch=8): **February 2016**, historical covered-drain/forecourt context only. Current drain dimensions and configurations are unverified.

Checked on 18 October 2026 does **not** mean captured in 2026. These sources support an interpreted street pass, not a surveyed current reconstruction. Their images are reference-only and are not embedded as game textures. Pole positions, kerb/drain dimensions, shrub spacing and road widths are estimates.

## Implementation and behaviour

- Grey paving, road-facing kerbs, segmented covered drains, dark continuous road ribbons, lane marks and a planted reservation. Bare shoulders remain distinct from paved surfaces. Low kerb/drain geometry does not become a tall collision wall.
- Pavement pieces are cut against all nearby mapped carriageways and native building outlines. Lamp collision volumes stay outside roads and buildings. Unreferenced procedural lamps, billboards, MoMo kiosks and guessed signal poles are suppressed within the bounded area.
- Loaded map-tile fragments in the bounded area are replaced with the bundled detailed native way coordinates for road consumers; duplicate tile fragments collapse to one way. This keeps ambient navigation and safety aligned with the rendered road polygons without editing the source map extract.
- The shared road width override is used by the map style, ground polygons, pedestrian safety and ambient traffic. Existing roads beyond the selected native way IDs retain their previous widths.
- Buses/trucks can continue onto appropriate 7 m public roads using vehicle-width clearance, instead of rejecting every road narrower than 8 m. Narrow service accesses remain excluded for a bus. Existing braking, contact separation, collision sweeps and signal behaviour elsewhere remain active.
- Corrected Atlantic Tower arrival, outdoor seat, guide and visitor path after actual class-specific road-width checks exposed an older clearance-test error. Seats and pedestrians now avoid its nearby service driveway as well as Liberation Road.
- Precomputed pavement/prop placement avoids repeating thousands of geometry-clearance operations during startup. Rebuild with `node scripts/realism/build-airport-corridor.mjs` after changing geometry. Static meshes are batched; this is not a device frame-rate measurement.

## Airport Road extension

The next local pass adds the Airport First/Second directional waiting visits, the Airport Road junction and Marriott pedestrian link. See [stop and junction reference brief](airport-road-stops.md) for the additional way IDs, capture dates, stop-name ambiguity and verification. The native width override and rendered boundary now extend north to latitude 5.60665.

## Acceptance and next gaps

This remains **In progress**. A current on-site survey, exact crossing/stop locations, bus-stop shelter photographs, drainage/driveway grades, walls/fences, accessible ramps, tighter lane transitions and physical-phone/multiplayer acceptance are outstanding. No new zebra crossing, station, shelter, tenant or police post is invented from a place label. Surrounding unreferenced buildings keep their native shells.

The Airport First/Second and Marriott–Airport Road first pass remains partial. Next: the **Airport Road / Airport Bypass eastern junction and terminal links**, with reference-led crossing/island/grade checks.
