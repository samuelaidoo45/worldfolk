# Kofi Annan Street — opposite-side offices and homes

**Release update — 19 October 2026:** this exterior pass is deployed at [worldfolk.world/game](https://worldfolk.world/game/) as Cloudflare version `ebe7f7be-0083-4d56-b719-6be29c9fd66c`. Implementation remains Partial; the local-only statements below describe the pre-release review. See [deployment evidence](implementation-progress.md#19-october-2026--roadside-release-acc-272276).

**19 October 2026 · ACC-274 · In progress / Partial · local only.**

This continues the [north-side frontage pass](kofi-annan-north-frontages.md)
with four separate mapped buildings on the Regus side of Kofi Annan Street.
It adds outdoor exploration, not new private interiors or insurance services.

## Evidence

| Reference | Observed features |
|---|---|
| [Regus and Ghana Life House, July 2024](https://www.google.com/maps/@?api=1&map_action=pano&pano=ahg_xU2KPxnkFhKdaTYsMQ&heading=165&pitch=0) | Separate grey Regus street block with shallow pitched roof/deep eaves; Ghana Life nameboard, green-framed pale glazed panels, cream side wing, green gate, grass and planting. Closer zoom was inspected. |
| [Cream balcony and tiled house, July 2024](https://www.google.com/maps/@?api=1&map_action=pano&pano=DePKT5tkVC5s8qAaJKoSuQ&heading=180&pitch=0) | Flat parapet, recessed balcony with patterned central screen, brown panel gate/stone piers, adjoining red pitched roofs, satellite dish, separate walls and lawns. |
| [Ghana Life operator page](https://www.ghanalifeinsurance.com.gh/) | Displays Ghana Life House, 19 Kofi Annan Street. The page has a 2021 copyright and no current image/capture date; it supports address/name context, not proof of present occupancy or current facade condition. |

The panoramas explicitly show **July 2024**, not 2026. No newer street capture
is claimed. Brand/name signs were authored as simple original nameboards;
Google imagery and third-party advertising artwork are not shipped as textures.
Temporary dismantled forecourt frames and old promotional posters were not copied
as permanent features without current evidence.

## Four retained native outlines

| Native ID | Exterior interpretation |
|---|---|
| 2518360966 | Grey Regus street-facing block: recessed lower veranda, columns, broad upper windows, shallow roof, deep eaves and fascia name. Separate from the existing rear workspace model. |
| 1330242142 | Ghana Life House frontage: green-framed pale glazing/blind panels, exposed reflective bays, narrow mullions, lower entry/louvred screen and cream west wing. |
| 1330242146 | Cream balcony-screen building: flat parapet, shaded upper setback, open square breeze-block pattern, rails and separate window bays. |
| 2883827358 | Tiled-roof house: native irregular outline, narrow gabled spine plus connected east wing roof, windows and roof-mounted dish. The roof leaves the native notches open. |

All four ground rings remain identical to
`tests/fixtures/airport-residential-context.json`. Placement is a relative
map/photograph match, not a cadastral survey. Heights, roof slopes, canopy
dimensions, hidden elevations and wall/gate positions are estimates. No owner
identity is assigned to the two residential-looking buildings.

Walls, separate gate aprons, pale green boundary paint, panel infill, grass,
clipped borders and trees connect these exteriors. Native service lane
**1351987027** is retained and profiled at **3.8 m**. Clearance testing caught an
estimated boundary crossing that lane; wall ends, grass and planting were split
to leave its approach open. The existing Regus service approach, arrival,
workspace doorway, carport passage and public room activities remain accessible.
The two new exterior observation prompts can be started and stopped normally.

## Verification

- **21 focused checks passed** across Residential/frontages and connected Kofi
  Annan sites: native ring retention, separate forms, gate contact/retreat,
  observation clearance, Regus access, walker/minibus traversal, roof-notch
  raycasts, finite attributes and bounded batching.
- The complete Residential block uses **44 static draws / 354,984 vertices** in
  the Node geometry check. This is not measured phone FPS or multiplayer acceptance.
- Model evidence: `review-artifacts/kofi-south-grey-model.png`,
  `kofi-south-glass-model.png`, `kofi-south-balcony-model.png`,
  `kofi-south-tiled-model.png`.
- Browser gameplay evidence: `kofi-south-gameplay-office-view.png` and
  `kofi-south-gameplay-home-view.png`. Both exterior descriptions were opened,
  stopped and followed by normal movement. No console errors were captured.
- Final build and local preview state are recorded in
  [implementation progress](implementation-progress.md).

## Open acceptance and next stretch

Obtain dated current images, confirm current operator occupancy, measure facades
and reconcile parcel boundaries. Review hidden elevations, remaining native
neighbours, physical devices and shared-player cameras. Keep these records
Partial until those gaps are resolved. The older Regus owner images and these
street views have different capture dates; do not treat them as one current survey.

Next: survey the next connected road-facing stretch towards the Shangri-La area;
keep concealed properties and new private interiors behind the exterior queue.
