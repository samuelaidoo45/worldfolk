# Mirage Residence / KASS Towers / Senchi exteriors

20 October 2026 · ACC-286 · **Implemented locally / In progress / Partial**

## Connected coverage

This batch covers the forty remaining unlinked native building plates in corridor section C04, plus eight adjoining plates around KASS. The [per-building manifest](senchi-skyline-buildings.csv) lists **48 new native records: two principal towers and 46 neighbouring structures**, including the Sunshine frontage. It closes C04's selected map-record exterior queue, not a photographic survey or acceptance of all present-day properties. Earlier airport-bound, Polo and Senchi source owners remain intact.

Four streaming groups keep the native roofs/compounds distinct: Mirage and adjoining properties (7 records), KASS and its neighbours (16), northern Senchi frontages (14) and western roof courts (11). Heights, concealed facades, roof pitches and exact finishes remain estimates. Unknown properties are not branded from nearby map labels.

### Mirage Residence — 2491216740

The **original Mirage Residence** on Senchi/Liberation Road is modelled separately from **Grand Mirage**. Three flowing white balcony lobes, thin pale rails, grey core walls, timber screen bays and recessed glazing follow the September 2024 panorama and the operator's exterior hero photograph. The operator currently describes an 18-storey tower; the model uses 18 approximate floor spacings, **not a surveyed metric height**. The native ground plate is retained; the narrower upper core and balcony projections are authored interpretations.

Five broadleaf trees, a cream boundary wall, a mixed grass/soil verge and the native west-Liberation footpath follow the observed roadside character. Tree positions, canopy sizes, boundary alignment and paving widths are estimates. Grand Mirage's popup imagery is explicitly excluded from this model.

### KASS Towers — 896570614

The native compound plate anchors the glazed vertical spines, recessed centre, deep pale balcony bands and two planted zigzag terrace levels seen in August 2024. Front steps, rails, palms, glazing and an original text wordmark support recognition. The upper mass and terrace depths are estimates, not surveyed tower subdivisions.

Older operator/indexed text contains conflicting storey/height figures and phase descriptions. The official KASS browser page returned an expired-certificate warning; it was **not bypassed**. The model follows the dated built-form Street View rather than treating an old marketing counter as a verified height. Approximately 16 levels and a roughly 50 m body are **massing estimates**.

The podium and apartment floors remain closed. Exterior entry steps are visual details of that private podium; they do not grant public upper-floor or private apartment access. Public Senchi pavements remain at ground level.

### Sunshine Healthcare frontage

The August 2024 view opposite KASS visibly names Sunshine Healthcare, with yellow/red walls, a pink guard lodge, metal fencing and an open covered forecourt. Its company page also lists Plot 83A, Senchi Street. Two low source plates (2491216756 and 2625105216) and the small lodge (3107069828) receive the observed colour family; their exact parcel/room allocation remains an interpretation.

The canopy is **one separately identified manual viewing estimate**, not a new native building polygon. It has overhead clearance and solid support posts; gate gaps remain open for exterior walking. Original canvas lettering is used; no photographed sign or other reference pixels are loaded by the game. No medical treatment, clinic interior, operating hours or staff services are implemented or certified.

### Ordinary frontages and streets

The other buildings retain individual native contours, roof notches and low hipped/gabled/service-roof forms. Overhead context supports roof families, while hidden elevations and openings remain estimates. Senchi paving/covered drain details follow the native street lines and are broken at mapped driveways and side-road crossings. No new generic traffic signals or roadside stalls are added.

**One explicit footprint correction:** the west edge of source **3107069828** intrudes into the native Senchi vehicle-lane buffer. Its complete source polygon remains in `rings`; the effective render/collision polygon is separately stored as `renderRings`, with an `estimated-west-edge-trim-to-clear-native-Senchi-road-buffer` provenance field. This preserves the source evidence without placing a newly authored lodge in the driving lane. A current measured footprint is still required; this correction is not passed off as native map geometry.

## Visually reviewed references

Checked **20 October 2026**. Website check/copyright dates are not photo capture dates.

1. [Mirage official homepage](https://mirage.com.gh/) — original Residence hero photo: rounded white balcony ribbons, grey walls, timber bays and silver rails. **Photo capture date unknown**. The separately labelled Grand Mirage promotion was dismissed and not used for this tower.
2. [Mirage Liberation Road panorama](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=5.6120,-0.17626&heading=270&pitch=10&fov=95) — selector **September 2024**, panorama `LUc4JnYGmvayq3gc2ki6uA`; full curved elevation, broadleaf trees, grass/bare verge and cream wall. The farther-north panorama `Ay0Gi1Y97UaEmX1MXE0iMQ` is heavily tree-obscured and is used for ground context only.
3. [KASS front panorama](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=5.61110,-0.17730&heading=270&pitch=15&fov=80) — selector **August 2024**, panorama `t8q6rCeUpy0ng18fMlsaqQ`. Panned upward to inspect upper spines/balconies, then compared with entry steps, rail and terrace planters.
4. [KASS southern frontage](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=5.61074,-0.17736&heading=305&pitch=15&fov=100) — selector **August 2024**, panorama `K1fDn91GHoDQg5jeUbhIhw`; oblique cantilevers, glazing, palms, planted edge and steps.
5. [Sunshine opposite-side panorama](https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=5.6110782,-0.1773989&heading=90&pitch=0&fov=100) — selector **August 2024**, the same front panorama facing east. Visible clinic name, yellow/red frontage, small pink lodge and canopy. [Company address](https://www.linkedin.com/company/sunshine-healthcare-ltd) supports the Senchi location; it does not establish exact current building bounds.
6. [Connected overhead roof context](https://www.google.com/maps/@5.61225,-0.1771,427m/data=!3m1!1e3) — **capture date unknown**. Separate roofs, setbacks, tree/forecourt context and gaps were visually reviewed. Native mapped heights are not used as evidence of tower height.

Reference screenshots are retained in `review-artifacts/skyline-*-reference*.png`. The game uses original geometry and materials; imagery is viewing evidence only. Existing OSM attribution remains in place.

## Access, verification and limits

Four searchable exterior visits have persistent start/stop guides: Mirage, KASS, Sunshine frontage and the western Senchi roof courts. Scoped initial headings face their subjects and owned cars/minibuses park beside the viewing axis. Arbitrary resumed positions are unaffected. Native Senchi/Liberation directions and geometry are shared by rendering, traffic and safety; no invented road grid is introduced.

The generator pins all 48 IDs and retains full native source rings. Focused checks cover unique source ownership, effective footprint provenance, exact native road paths/directions/widths, both Liberation carriageways and Senchi vehicle lanes, public arrival/parking clearance, mapped driveway gaps, trees/walls, canopy headroom/supports, finite geometry and streaming/draw budgets. Earlier Polo, Mahama, airport-bound, corridor, auth and retained-map regressions remain required.

Current measured dimensions, hidden facades, exact property boundaries, private access, present-day roof/tenant changes, high-detail assets and physical-device/shared-player acceptance remain open. This is a connected **Partial exterior pass**, with no claim of a photorealistic surveyed reconstruction.

### Completed local verification

- **84 focused tests passed** across the new skyline package and the preceding airport-bound, Mahama, Polo, Regent, Shangri-La, interchange, Residential/Kofi Annan, auth-handoff and retained-map suites. Production build, JavaScript syntax and scoped whitespace checks passed.
- Repeated native map/context/manifest generation is byte-for-byte deterministic. The four new groups total **82 static draws / 503,146 vertices** in Node, excluding browser canvas signs. This is a geometry budget check, not a physical-device FPS measurement.
- All six model-review cameras were inspected. Full-game local walkthroughs reached Mirage, KASS and Sunshine, started/stopped their persistent exterior guides and resumed movement. The western compounds arrival/guide is covered by unit checks and its model camera was reviewed. No errors were captured in the model-preview or game console.
- Evidence is saved under `review-artifacts/senchi-skyline-*.png`, `review-artifacts/skyline-*-gameplay-guide.png` and `review-artifacts/senchi-skyline-verification.json`. The existing disposable local QA profile was used; no production player records changed.

**Release:** local implementation only. No staging, commit, push, database migration or deployment is part of this turn. The latest deployed version remains `0f71d1b6-bd59-4a10-8ff1-4fd9bafa6544`.
