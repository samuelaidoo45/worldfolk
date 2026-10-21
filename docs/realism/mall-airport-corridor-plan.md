# Accra Mall to Airport View — connected city production

**User direction, 20 October 2026:** finish the buildings and surroundings along the Accra Mall–Airport View corridor before expanding elsewhere. Include Accra Polo Club, **Association International School** (confirmed by the user), tall buildings, ordinary road-facing structures and the whole connecting environment. This supersedes choosing an isolated next landmark or jumping directly to a separate Opeibea pass. Existing four-area work remains intact.

## Bounded inventory

[Every mapped object](mall-airport-corridor-objects.csv) · [Every selected place label](mall-airport-corridor-places.csv) · [Counts and limits](mall-airport-corridor-summary.json).

The initial production envelope follows both native Liberation Road carriageways from latitude 5.624 down to 5.6046, with a 220 m side buffer and explicit mall/interchange, Polo and Association campus spurs. These are production bounds, not official district or ownership boundaries. Survey the public street edge and visible adjoining parcels continuously; amend bounds when photographs reveal a missing frontage. Include the short connecting streets to the school and Polo Club rather than placing them on Liberation Road by assumption.

The checked-in extract yields **343 building geometry records, 312 road/path segments, 50 land-use records and 78 place labels**. Of the building records, 200 have a source-ID link to an authored landmark; 143 do not. The latest adjoining Mahama/Shangri-La pass adds 38 links, alongside eight separately recorded reference-only structure estimates. These are neither counts of unique real-world properties nor accepted reconstructions. Building parts, duplicate labels and default heights are explicit. The chosen envelope returns no mapped water/waterway feature; that does **not** establish that drains or water features are absent.

## Six connected sections, north to south

| Section | Coverage | Building records | Main work |
|---|---|---:|---|
| C01 | Mall, interchange and Villaggio | 29 | Close gaps between existing mall, outside shops, stops/terminal, bridge, roundabout, City Galleria and Villaggio passes; keep separate building identities and inspect remaining unnamed surroundings |
| C02 | African Regent and Shangri-La | 73 | Accept/refine existing exteriors; identify remaining roadside structures and their roof/wall/ground details; finish public connecting routes |
| C03 | Polo / Elizabeth / Senchi | 51 | Accra Polo Club, its field/clubhouse and public approach; The Elizabeth; separate Polo Court, Polo Heights and Polo Views records; shops, walls, access and planting |
| C04 | Mirage / KASS / offices | 79 | Mirage Residence, KASS Towers and adjacent offices/apartments; distinguish built towers from proposals and separate phases; continuous street frontage |
| C05 | Association / Opeibea | 36 | Association International School campus exterior and connecting street; neighbouring homes/offices/services, entrances, walls and pavements |
| C06 | Airport View approach | 75 | Finish roadside structures, police/services and hotel connections within the envelope; review existing Airport View exterior and access, without expanding farther south |

The bands organise work; sites can cross band boundaries. Source IDs, not band labels or proximity, control replacement. Existing outer mall-district assets beyond these bounds remain in the wider district inventory.

## Faster production method

1. **Survey a connected section once.** Inspect dated Street View on both street sides, current operator photographs and overhead/roof evidence. Record panorama URLs, capture dates, facade/roof forms, public entrances, land-cover boundaries and unidentified properties. Do not re-survey each building from scratch or guess concealed details.
2. **Prepare a batch manifest.** Select typically 8–15 verified exterior structures plus their shared street edge; complex landmarks can require a smaller batch. Every structure keeps its own native ID, geometry, reference URLs, uncertainty and status. Address names are not inferred from nearest POI labels.
3. **Build distinct shapes using shared components.** Reuse materials, windows, balcony/railing construction, roof generators, paving, drains, walls, trees and original surface textures. Match each facade's proportions, bay pattern and roof instead of cloning one finished building. Unique landmarks and towers still need individual massing.
4. **Prioritise skyline and road-facing detail.** Correct height/massing for reference-verified towers first; then ground floors, signs, walls, gates and public approaches. Use simple distant models and richer nearby detail, batched geometry and shared materials. The extract's common 4.5 m height is not tower evidence.
5. **Finish ground and circulation with the batch.** Asphalt, grey paving, bare ground and grass follow the references; add observed drainage, driveways, crossings, lighting, furniture and vegetation. Keep road lanes, bus paths and pavements clear. No generic stalls or traffic lights in unverified positions.
6. **Review the connected route.** One repeatable walkthrough and drive checks arrivals, wall/vehicle collisions and escape, crossing/boarding access, loading transitions, camera views and frame times. Then compare each structure with its references. Update statuses individually; no section is complete because a landmark is present.
7. **Interiors follow the exterior corridor.** New private rooms are deferred. Existing interiors and essential gameplay fixes remain available. Public access must reflect the venue; a school or private club is not made freely accessible just because it has a map label.

### Repeatable extraction

Run `python3 scripts/realism/build-mall-airport-corridor.py`. This scans the bundled native layers, links exact authored building IDs, assigns production sections and preserves manual CSV review fields by layer/source ID. A place label inside a footprint is recorded as a geometric relation, not verified ownership. It also writes a bounded native context fixture for subsequent model and clearance checks. The generator does **not** modify game models or turn queued properties into finished buildings.

## Priority research/implementation batches

- **Polo and Senchi batch:** ACC-168 Polo Club; ACC-280 The Elizabeth; ACC-281 separate estate/block survey. Native named records include Chukka 981756484, Saddle 981756490, Mallet 981756486, The Elizabeth 451713890 and Polo Views Block A 2174158622. Verify estate identities before grouping buildings under a name.
- **Skyline batch:** ACC-278 Mirage (place point falls in native ring 2491216740), ACC-279 KASS Towers (896570614), and reference-verified neighbours. This containment is not a survey. Native heights are unreliable here.
- **School/Opeibea batch:** ACC-277 Association International School; map point falls in 2883827434, but the whole campus must be identified separately rather than assigning every adjacent structure to the school.
- **Corridor gap/acceptance work:** ACC-282 is the parent route package, linked to existing ACC-146, ACC-197 and the mall/Shangri-La/Regent work. Finish remaining ordinary buildings and environment across all six sections.

## Research leads verified as text, not image acceptance

- [Accra Polo Club](https://accrapoloclub.com/contact/) identifies its Airport Bypass approach and distinguishes private club access from the restaurant. Current field, clubhouse, fencing and public-side photographs still need visual inspection.
- [Association International School](https://ais.edu.gh/new-home-page/) gives 6 Patrice Lumumba Road, Airport Residential. It is the Association confirmed by the user. Avoid similarly named international schools.
- [Mirage Residence](https://mirage.com.gh/) describes an 18-storey completed development and separately promotes Grand Mirage. Do not use Grand Mirage photos for Mirage by assumption.
- [KASS Towers](https://www.kasstowers.com/) gives 16 storeys / 52 m and mentions phases. Verify the photographed completion/phase and exact massing before applying a height.
- [The Elizabeth developer page](https://goldkeygroupgh.com/portfolio/the-elizabeth/) locates it on Senchi Street and says five storeys while a metric lists six levels. Resolve the counting difference against images. Do not copy another country's similarly named tower.

The initial inventory was a planning/extraction pass. The first implementation now adds [Polo / Elizabeth / Senchi](polo-elizabeth-senchi.md): five native building exteriors, the mapped Polo field, shared roadside surfaces, three outdoor visits and two local pedestrians. September/August 2024 Street View and an undated operator field photo were inspected. Current captures, measured dimensions and unverified parcel identities remain open. ACC-168, ACC-280, ACC-281 and parent ACC-282 are **local In progress / Partial**; ACC-277–279 remain Research. No section is accepted or complete.

C04 Mirage / KASS and the selected adjoining exteriors now have an ACC-286 pass. Next larger batch: C05 Association International School / Opeibea roadside properties. Retain the C03 current Court/Heights/Views/clubhouse/stable facade and measured-dimension gaps. ACC-284 now covers the bounded neighbouring native buildings and estimated missing roof structures. No deployment in this implementation pass.


## Bypass / northern Polo priority, 20 October 2026

User direction added the Mahama / Airport Bypass railway bridge leading up to Shangri-La and the buildings north of Polo. [ACC-283 implementation and reference limits](mahama-bypass.md) is local Partial: two native railway overbridges and their connecting track, concrete cutting/walls/pavements, eight native stable/service buildings, three outdoor visits and scoped road-side owned-car arrivals. August/September 2024 Street View and undated overhead imagery were inspected. The rail supplement is tracked [separately](mahama-bypass-rail-inventory.csv) because the original extract omitted railway ways. No train service is invented. Current photos, measurements, hidden facades, unmapped neighbours and device/shared-player acceptance remain open. Continue these C02/C03 accuracy gaps alongside the prepared Mirage / KASS and Association batches; no deployment.


## 20 October — neighbouring building closure (ACC-284)

[Per-building manifest and evidence](mahama-neighbourhood.md): all 52 selected native records around the Mahama rail link are accounted for (14 retained / 38 new), plus eight separately identified overhead geometry estimates. Four render groups retain native notches, roof types and courtyard voids; public visits and traffic clearance are checked locally. Current photo/dimension and private-access acceptance remain open. The selected map-record exterior pass is covered; the whole corridor remains In progress / Partial.


## Release state — 20 October 2026

This exterior pass is now deployed to [Worldfolk](https://worldfolk.world/game/) as **0f71d1b6-bd59-4a10-8ff1-4fd9bafa6544**, with the connected Polo and railway updates. Deployment does not close current-photo, measured-dimension, concealed-facade or physical-device/shared-player gaps. The pass remains **In progress / Partial**. Release evidence is in `review-artifacts/mahama-neighbourhood-deployment-check.json`; no database migration or Git stage/commit/push was performed.

## 20 October — airport-bound bypass exterior batch (ACC-285)

[The connected bypass pass](airport-bound.md) covers 137 selected native building records (126 new / eleven retained) plus three separate tower estimates: Four Points, GATA and the eastern Polo Views tower. Native Polo Views Block A and GCAA headquarters, ordinary compounds, low quarters and the native open field retain distinct forms. Six public visits, scoped arrival framing/parking and the bridge-to-junction road lanes are checked locally. Of the new native plates, **81 fall inside this Liberation Road inventory**; its links are now **152 / 343**, with **191 native-only**. The other 45 new plates are in the adjoining bypass/aviation spur and remain in the separate per-building manifest. These counts do not mark surveyed accuracy or private access complete. Local implementation only; current-photo, dimensions, hidden-facade and device/shared-player acceptance remain Partial.

## 20 October — Mirage / KASS / Senchi connected exterior batch (ACC-286)

[Coverage and evidence](senchi-skyline.md): 48 additional native plates, including two distinct skyline models and Sunshine's visible frontage, plus a separate canopy estimate. The forty remaining C04 building records and eight KASS neighbours are now authored Partial. C04 has **79 / 79** source links; the whole Liberation inventory has **200 / 343**, leaving **143 native-only** records. Source links are not acceptance of surveyed/current appearance. One small lodge keeps its raw source ring and a separately marked road-buffer trim. Four exterior visits and the connected Senchi/Liberation lanes are checked locally. The next exterior package is **Association International School and Opeibea**, before new private interiors. No deployment in this pass.
