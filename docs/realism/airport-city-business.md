# Airport City — Marriott, Stanbic Heights and Atlantic Tower

Implementation: **18 October 2026. Local only; not deployed.** Partial exterior/public-approach passes for ACC-140, ACC-029 and ACC-028. Four verified native source outlines receive distinct architecture. No full interior or surveyed reconstruction is claimed.

## References and identity decisions

### Accra Marriott Hotel (ACC-140)

- [Official hotel gallery](https://www.marriott.com/en-us/hotels/accmc-accra-marriott-hotel/photos/): front aerial and pool-side exterior photographs visually inspected. Cream walls with brown facade grids, stepped guest-wing heights, a dark cylindrical entrance feature, canopy and low events wing. Capture dates unknown; maintained gallery and website copyright dates do not establish a 2026 photo. Evidence: `review-artifacts/airport-offices-marriott-front-reference.png`, `airport-offices-marriott-pool-reference.png`.
- [Public approach Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=PkEduyhSO5T6m2s9-mFRVQ&heading=5&pitch=8): **February 2016** capture overlay. Shows the established cylinder/canopy and street context before the current branding/finishing. It is historical context, not current facade colour evidence. Screenshot: `review-artifacts/airport-offices-marriott-street-context-2016.png`.
- Native source **801590616**, an unnamed hotel footprint containing the mapped hotel POI. The existing extract's approximate default height is replaced by interpreted massing. Hotel rooms, lobby, pool access and hotel employment are not implemented here. Pool photographs help establish the rear massing; an invented pool is not placed into an unverified courtyard.

### Stanbic Heights (ACC-029)

- [Zutari Icon House / Stanbic Heights project](https://www.zutari.com/project/icon-house-office-building-development/), [front photograph](https://www.zutari.com/wp-content/uploads/2025/10/Icon-House.jpg): visually inspected completed building; engineer text read to confirm the former Icon House name. Rounded front, separated horizontal window openings, concrete shades and split ribbed roof guide the model. The October 2025 URL path is an upload hint, not a verified capture date. Screenshot: `review-artifacts/airport-offices-stanbic-engineer-reference.png`.
- [North Liberation Link Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=VdgMvJ6nYscGl1lDfssqSw&heading=240&pitch=12): visually inspected and panned, **August 2024** capture overlay. Confirms the facade/roof silhouette, street edge and adjoining approach. Screenshot: `review-artifacts/airport-offices-stanbic-street-reference-2024.png`.
- Native sources **687362746 and 687362748**, both named Icon House. Public approach only. Private bank/office areas, cash services, elevators and job activities are not simulated for this location in this pass. The curved front and upper roof are interpreted additions with collision coverage; they are not exact surveyed footprint details.

### Atlantic Tower (ACC-028)

- The operator website returned **Account Suspended** during review. It was not used as a working visual source.
- [Energoprojekt contractor gallery](https://www.energoprojekt.rs/atlantic-tower-faza-i-gana/?lang=en), [completed facade photograph](https://www.energoprojekt.rs/wp-content/uploads//2018/10/atlantic-towers-power-system-ghana-01-756x426.jpg): blue-glass frame, pale office strips, recessed glazing and podium visually inspected. Capture date unknown. The gallery's first marketing/design view is not proof of present tenants or details. Screenshot: `review-artifacts/airport-offices-atlantic-contractor-reference.png`.
- [Liberation Road Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=0E3WeYhlx8jflz4ImzvkrA&heading=95&pitch=15): visually inspected and panned, **August 2024** capture. Confirms the western completed tower and adjacent unfinished structure. Screenshot: `review-artifacts/airport-offices-atlantic-street-reference-2024.png`.
- Only source **801590622** is replaced. Source **801590612**, also named Atlantic Tower in the extract, is **not** replaced: its [February 2016 panorama](https://www.google.com/maps/@?api=1&map_action=pano&pano=L441jGD-ce4IIMIi_vpXzw&heading=260&pitch=10) shows SSNIT Emporium signage and different geometry. Its exact present identity remains unresolved. Nearby alias matching explicitly excludes that northern location. Evidence: `review-artifacts/airport-offices-atlantic-context-street-2016.png`.
- Adjacent unfinished structures, proposed Tower II forms, a connecting bridge and private office fit-outs are not presented as completed. No map label alone is taken as sufficient identity evidence.

## Implemented visitor experience

Each site has one canonical home-map/search destination, a server-resolved arrival, a photo activity, explicit start/stop sitting, a small visitor guide and two local scenery actors. Visitors stay off native carriageways and do not increase the real online-player count. Nearby source aliases deduplicate against the authored locations; a similarly named distant place remains independent.

Marriott uses stepped native guest/event outlines, the cylindrical entrance feature, canopy and warm grid facade. Stanbic uses two source masses, a rounded front and an interpreted split roof framework. Atlantic uses the verified western outline, glazed frame, pale window bands and podium. All geometry/materials/signs are original procedural assets; reference photographs are not imported into game textures.

Arrival, camera, guide and seat approaches clear native neighbouring buildings and roads. Furniture/canopy/cylinder/curved-front collision volumes match the authored additions. Narrow paving patches avoid covering service roads. Heights, subdivisions, small guide/seating furniture, roof curves and the hotel podium are estimates. The added visitor furniture is game furniture, not a surveyed claim about the real forecourt.

## Verification and outstanding work

Unit/regression checks cover exact source identity, preserving the ambiguous northern shell, spatial alias bounds, canonical map/search entries, safe arrivals/cameras, carriageway clearance, seat approach/return, continuous local visitors, overhead canopy clearance, solid walls/furniture, finite UV geometry and static batching. A local API test visits all three destinations without changing registered identity or balance. Totals, browser and build evidence appear in [implementation progress](implementation-progress.md).

Still open: dated current close photographs, measured heights/grades/roof structures, full boundary walls/landscaping/parking, detailed interiors, accurate hotel circulation/pool placement, actual public-access limits, shared activities and physical-device frame times. These items remain **In progress**, not Accepted. Isolated previews omit surrounding city/roads; full-game screenshots are separately identified.
