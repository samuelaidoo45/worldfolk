# Nationalism Park and stadium perimeter — second exterior pass

**21 October 2026 · Partial.** This continues the [Independence precinct](independence-neighbourhood.md) before further Osu expansion. It adds documented park objects and the stadium’s public edge; it does not certify every amenity’s current position or reconstruct unseen interiors.

## Implemented

- Nationalism Park’s low pale wall and dark metal fence, with open gaps at public approaches and mapped footpaths. The native park polygon determines the boundary; offsets, heights and gate widths are estimates.
- Egg-on-stone sculpture: pale egg, rough stone mound, three circular stone tiers and six freestanding, simplified cultural motifs. The motifs are distinct original meshes informed by the photograph; exact sculpture likenesses remain provisional.
- Six dandelion-shaped light installations and small ground bulbs, following the photographed forms. These are emissive meshes, with no additional GPU light or shadow-map passes.
- A grey washroom/service block with raised ventilated roof, two dark doorways, geometric facade, roof tanks, a low mural wall and paved forecourt. The colour treatment is original; the source mural is not copied as a texture. Its placement and dimensions are estimated. The closed exterior has matching colliders; no invented indoor floor plan is available.
- Playground: coloured climbing tower, roof, steps, slide, spring riders, sand and turf surfaces, low fencing and an open entrance. These are scenery, not a completed climbing/riding game. The commissioning-day inflatable bus is omitted because its permanence is unverified.
- Connected path branches and a circular walk around the egg sculpture. Short segments are clipped against parcel edges, carriageways, service structures and monuments. Existing park sitting remains available; the new sculpture photo and playground guide use persistent activity controls.
- Stadium boundary walls in the yellow/ochre treatment visible from Starlets ’91 Road; lighter metal sections elsewhere remain overhead/context estimates. Entry gaps preserve the saved stadium forecourt and mapped approaches. Covered roadside verges/drain details remain flush and walkable.
- Four western tennis courts follow their exact native pitch contours, with separate markings and nets. An outdoor court-view guide is added. Buildings and roads remain clear.
- Two estimated zebra markings on the mapped western/southern 28 February Road footpath approaches. Paint is explicitly provisional; no additional traffic signals are invented at every road node.
- The tall Crossroads memorial has moved from the earlier central guess towards the eastern triangular memorial court seen overhead. This improves its relationship to the park, but coordinates/orientation and dimensions are still estimates, not a surveyed placement.

## Evidence actually inspected

All sources were checked on **21 October 2026**. Publication, event, image capture and review dates are separate. Reference screenshots are documentation only; no reference pixels enter runtime textures.

| Source | What it establishes | Date limitations |
|---|---|---|
| [GTA / Visit Ghana park page](https://visitghana.com/nationalism-park-accra/) | Redeveloped facilities, fencing, illumination, egg sculpture and park use; visible Bonnie monument photograph | Published 17 April 2025. Individual image capture unverified. Several embedded gallery URLs are malformed; their intended image host did not resolve and was not treated as new evidence. |
| [Commissioning gallery](https://www.primenewsghana.com/general-news/photos-akufo-addo-commissions-rehabilitated-nationalism-park-at-osu.html) | Photographs credited in-frame to Ghana Armed Forces Public Relations; direct images below were visually inspected | Published 5 December 2024, reporting the 2 December event. Individual capture/EXIF dates unverified; filename folders do not establish capture dates. |
| [Service block / mural photograph](https://www.primenewsghana.com/images/2024/sept/download_1sss.jpg) | Grey geometric frontage, doors/approach, low colourful mural wall, shallow roofs and tanks | Capture unverified; geometry/painting interpreted, not copied. |
| [Egg sculpture photograph](https://www.primenewsghana.com/images/2024/sept/download_1dd.jpg) | White egg, irregular stone mound, circular stone tiers, freestanding motifs and adjacent paths | Capture unverified; exact dimensions and positions unknown. |
| [Light garden photograph](https://www.primenewsghana.com/images/2024/sept/download.jpg) | Tall dandelion forms, small bulbs, patchy lawn/planting, pale boundary and black metal fence | Capture unverified; not a lighting-output measurement or a complete site plan. |
| [Playground photograph](https://www.primenewsghana.com/images/2024/sept/download_1d.jpg) | Coloured tower/slide and spring riders, sand/turf, low mesh fence and inflatable display | Capture unverified. The temporary-looking inflatable is not assumed permanent. |
| [Stadium Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=xlilecTB2RFb4kqorbMEXg&heading=10&pitch=12) | Panned both ways: yellow wall, entrance opening, roadside trees, paved verge and bollards | **August 2024** shown by panorama UI. This precedes the park redevelopment; historical ad campaigns are omitted. |
| [Overhead context](https://www.google.com/maps/@5.5496579,-0.1920034,19z/data=!3m1!1e3) | Separate park paths/facilities, eastern memorial court, stadium edge and western courts | Individual imagery capture unavailable. Provider copyright 2026 does not prove a 2026 capture. The native OSM extract remains the boundary/court source. |

## Cost and access checks

Ten precinct packages total **498,220 near vertices** before browser signs. Stadium: **96,814 vertices / 14 batched draws**. Park: **59,634 vertices / 17 draws**. Thin wire/netting uses crossed ribbons and a few vertex-colour material profiles, rather than hundreds of capped cylinders or separate colour draws. Global desktop/mobile stream budgets are unchanged. The stadium medium package is rebaked; park detail remains a bounded near package. This is not a real-phone or smooth-frame-rate acceptance claim.

The 390 boundary sections, 232 short path sections, covered verges and two crossings are baked offline by `node scripts/realism/build-independence-public-spaces.mjs`; source hashes prevent stale layouts after input changes. Nested road/parcel surveys do not run at game startup. Collider shapes/bounds are cached and filtered to the local refresh area. Regression checks cover native boundaries, roads/buildings, open park/stadium/playground gates, actual hard obstacles, mapped court identity, activity reachability, and an unobstructed route from park arrival to the new activities. Existing square stairs/platforms and medium assets remain under regression checks. Final test/build/browser results are recorded in `implementation-progress.md`.

## Still open

- Restaurant/snack-bar and souvenir frontage: facilities are documented, but no trustworthy exterior/position was established. The user has no additional photo or pin. No unrelated cafe or generic room has been substituted.
- Current measured park layout, memorial likenesses, exact lighting count, fence/entrance positions, washroom ramp geometry/access and unseen elevations.
- Full-angle current stadium gates, service buildings, all court surrounds and a reference-matched stadium interior. Existing simulated match remains available.
- The park’s full real visitor opening/access operation is unverified. Game access is not a promise of real-world opening hours.
- Northern/eastern/coastal precinct extensions and provisional ministry facades remain in the precinct queue ahead of further Osu work.
