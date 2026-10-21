# Independence Square — surrounding buildings and public spaces

**21 October 2026 · local Partial exterior pass.** The user moved the production priority back to the whole Independence Square area before further Osu expansion. This brief defines the immediate ring explicitly: longitude **−0.1976 to −0.1905**, latitude **5.5453 to 5.5528**. It includes the square, stadium, Nationalism Park, Finance Drive/nearby ministry blocks and Ghana Club's coastal frontage. It is a bounded production area, not a surveyed neighbourhood boundary.

The [second public-space pass](independence-public-spaces.md) adds documented park facilities, perimeter/court detail and updated access checks. Restaurant/snack-bar frontage remains unverified.

## Inventory and implementation

[All 158 native building records](independence-neighbourhood-buildings.csv) are accounted for: ten existing gate/arch/grandstand records are retained and 148 receive new or revised exteriors. Six of the 148 plates belong to the five special building families below; the remaining 142 are **context estimates with native heights and overhead massing**, not individually verified facade reconstructions. Unknown properties retain anonymous identities. All native contours and courtyard holes are preserved.

| Place / area | Implemented exterior | Evidence and open accuracy work |
|---|---|---|
| Accra Sports Stadium, ACC-163 | Native crescent plus separate west stand; stepped seating, continuous raked underside, west service blades/media glazing, canopy, pitch/goals, four floodlight banks | August 2024 street approach; inspected exterior photographs and GFA pitch photograph. Heights, colours, structural cross-sections and mast positions remain estimates. The existing simulated match interior is retained, not certified as the exact real stadium interior. |
| Electro Volta House, ACC-289 | Pale rounded horizontal ribbons, dark window bands, glazed base, entrance sign and roof service block | January 2016 Finance Drive panorama. A current dated full exterior is still needed. Tower height is a photo estimate. |
| Ghana Water Company Head Office, ACC-290 | Long native contour, repeated pale window frames/pilasters, four windowed tiers and restrained roof | September 2024 public-road panorama. Verify current paint, operator naming, roof/rear and measured height. |
| Ghana Club, ACC-291 | Raised timber room, pale shutters/louvres, supporting posts and hipped roof | February 2016 Beach Drive panorama. Current photographs, compound boundary and access remain open. |
| Finance Drive courtyard offices / adjoining ministries, ACC-022 / ACC-287 | Individual native volumes, retained courtyard holes, roofs, window openings and slab bands | Overhead context and native metadata only. Facades, occupancy and default heights are unverified; this is context coverage, not acceptance of every ministry. |
| Nationalism Park, ACC-288 | Estimated layouts for the tall split 28 February memorial with three busts, Bonnie memorial composition, clipped paths, benches, low path lamps and planting | Official tourism redevelopment report; inspected GTA monument image and February 2026 GAF ceremony photo. Exact monument coordinates/orientation, sculpture likenesses and garden layouts are estimates. Restaurant/snack-bar, playground, fence and service buildings require individually located current references. |
| Existing ceremonial core | Black Star Gate, Unknown Soldier, Independence Arch, walkable platforms and eight stands remain authored | Earlier evidence and unresolved acceptance items remain in their original briefs. |

The stadium keeps its saved destination ID. The server now resolves the canonical forecourt for entry instead of the old pitch coordinates encoded in that ID; all seven new visits have explicit server coordinates. Search removes duplicate mapped entries for these exact places while preserving remote branches. Outdoor guides, park sitting and scenery visitors use existing activity controls. The stadium's match visit remains available.

## References inspected in this pass

Street View capture dates below were read from the panorama UI. Capture, publication and review dates are separate. No reference pixels are copied into game textures.

- [Electro Volta frontage](https://www.google.com/maps/@?api=1&map_action=pano&pano=DwJGcQ0PiLZJ4N83t4250Q&heading=355&pitch=12) — January 2016; tower was panned upwards to inspect its bands/roof. [Finance Drive approach](https://www.google.com/maps/@?api=1&map_action=pano&pano=sZuOex7HzME8mZNX1h-Lug&heading=305&pitch=5) is also January 2016.
- [Ghana Water public frontage](https://www.google.com/maps/@?api=1&map_action=pano&pano=sQQaTYL4IjtAIEzyRdQQxw&heading=305&pitch=10) — September 2024; windowed block, pale boundary, vegetation and bare roadside verge.
- [Stadium / Starlets '91 Road](https://www.google.com/maps/@?api=1&map_action=pano&pano=xlilecTB2RFb4kqorbMEXg&heading=10&pitch=12) — August 2024; perimeter/low frontage, verge, paths, road mouth and floodlights. Historical adverts are not imported as current campaigns.
- [Stadium west-stand photograph](https://tortoisepath.com/place/accra-sports-stadium/) — inspected the linked exterior image: warm service blades, blue media glazing, cream frame, stairs and broad white canopy. Capture date unknown; a 2024 upload path is not capture evidence.
- [GFA training gallery](https://www.ghanafa.org/photos-stepping-up-the-intensity-ahead-of-chad-qualifier) — inspected the [pitch-side photograph](https://cdn.ghanafa.org/2025/03/FB_IMG_1742513361492-1.jpg). It supports pitch/seat context; it is monochrome and does not establish current seat colours. Individual capture date unverified.
- [Ghana Club side](https://www.google.com/maps/@?api=1&map_action=pano&pano=Vez5wczGBFvOXcmeErqjNg&heading=75&pitch=5) — February 2016; raised green timber room, pale louvres, hipped roof and bare foreground. The opposite view was inspected separately to avoid assigning the wrong building to the club.
- [GTA park opening report](https://ghana.travel/2024/12/20/nationalism-park-officially-opens-to-the-public/) — published 20 December 2024; establishes redevelopment and facilities. [GTA monument image](https://x.com/ghanatourismGTA/status/1863978526434611281) was inspected directly; capture date unknown. The official report identifies the Bonnie monument. Search-generated image descriptions incorrectly identified the bust; those descriptions were not used as identity evidence.
- [GAF 28 February 2026 ceremony](https://www.gafonline.mil.gh/index.php/blog-details/ghana-observes-78th-commemoration-of-28th-february-crossroad-shooting-incident) and its [inspected photograph](https://www.gafonline.mil.gh/images/news/1772291457_avatar_p1SUs920FJ.jpg) — tall split pale slabs, three busts/plinths and stepped setting. Event/publication date is recorded separately from unknown image EXIF/capture metadata. Ceremonial wreaths, carpets and guards are temporary event staging and are not placed permanently.
- Google Maps satellite context was inspected for roofs, the crescent/field, separate office compounds and the coastline. Provider copyright dates do not prove individual capture dates. Native geometry in the bundled OSM extract remains the footprint source.

## Checks and cost

- **24 focused precinct/Osu tests passed**, plus **25 rendering/streaming/LOD/viewport checks** and **one local API integration test**. The API test visits and enters all seven destinations with profile/balance retained, and rejects the stadium's former encoded pitch point as an entry point.
- Native coverage/sole ownership, untouched contours and courtyard holes, open stadium pitch, road/building/solid clearance, park path clipping, search branches, bounded visitors, finite geometry and static cost are checked.
- Near models now total **498,220 vertices** across ten streamable packages before browser signage. The stadium is **96,814 vertices / 14 draws**. The full cost table is `review-artifacts/independence-model-costs.json`.
- The medium catalog now has **41 static packages**, adding the stadium and Electro Volta. Assets remain loaded on demand. Desktop/mobile stream limits and the shared-viewport fix are retained. No frame-rate or real-phone acceptance claim is made.
- Production build and browser evidence are recorded in `implementation-progress.md` after the final review. The isolated context fixture uses a broad review camera and no shadow pass; live gameplay retains its normal lighting/shadows.

## Finish the precinct before expanding Osu

| Section | Current state | Required next work |
|---|---|---|
| Ceremonial square / roundabout | Existing Partial models and walks | Current proportions, street surfaces/signals, event crowd scheduling, shared poses and device acceptance |
| Stadium / Nationalism Park | New Partial pass | Current full-angle stadium, ancillary courts/entrances, measured memorial placement, measured park fence, restaurant/snack-bar frontage, playground/service placement and accessibility |
| Western Finance / Customs / ministry blocks | All selected immediate-ring plates represented; most facades provisional | Individually identify and photograph road-facing offices, annexes, compound walls, gates, drains and public footpaths |
| Ghana Club / southern coastal edge | Club Partial; coastal visit added | Current club/compound, Marine Drive, paved/bare/sand boundaries, coastal facilities and connecting public walks |
| Eastern Castle Drive / Asomdwe approaches | Queued beyond this immediate-ring boundary | Survey all ordinary roadside buildings and Asomdwe Park before modelling their actual forms/access |
| Northern Starlets / conference-centre connection | Immediate ring Partial; northern extension queued | Stadium ancillary frontages, roads and identified offices towards the conference centre and State House |
| Further Osu | Existing Oxford Street first block retained | Resume adjacent Oxford Street shops, side streets, churches, homes and other locations after the precinct sequence above |

This inventory is not a census and does not mark the entire surrounding district realistic or complete. Unseen facades and missing post-extract structures remain explicit work, rather than receiving invented identities or interiors.

## Finance Drive follow-up · 21 October 2026

The [Finance Drive pass](finance-drive-frontages.md) replaces four additional context plates and revises the original courtyard facade (five native plates total). Ordinary provisional context is now **138 plates**. The former ministry/GSS frontage is labelled with the Ministry’s February 2026 move to Kanda; Public Services Commission has its own visit. Original footprint ownership and courtyard holes remain. Current occupancy, hidden elevations and exact landscaping/access are still Partial.


## Ghana Club / coastal follow-up — 21 October 2026

See [the coastal brief](ghana-club-coast.md) for the raised club exterior, bounded compound, original soil/grass/compacted verge coverage, reference dates and public-access limits. Native building inventory remains 158 records / 138 provisional ordinary plates. Thirteen near packages now total 454,276 vertices; 44 static + two human medium assets stay within the 6.5 MB compressed gate. Nine canonical visits include the coastal-road guide. 58 focused tests + one local API test and build passed; live club photo pose verified. Local only; current exact appearance and physical-phone acceptance remain Partial.
