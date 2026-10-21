# Kofi Annan Street — adjoining north-side buildings

**Release update — 19 October 2026:** this exterior pass is deployed at [worldfolk.world/game](https://worldfolk.world/game/) as Cloudflare version `ebe7f7be-0083-4d56-b719-6be29c9fd66c`. Implementation remains Partial; the local-only statements below describe the pre-release review. See [deployment evidence](implementation-progress.md#19-october-2026--roadside-release-acc-272276).

**19 October 2026 · ACC-273 · In progress / Partial · local only.**

This continues the [Mary Dei house frontage pass](airport-residential-frontages.md)
with three separate buildings directly facing Kofi Annan Street. It does not
complete Airport Residential or open private offices/residences.

## Reference survey

Panned and moved along Google Street View from Mary Dei towards the western
compounds. The available captures inspected show **July 2024**. The date selector
at the arch offered July 2024 and February 2016; no 2026 capture was available
there. Current paint, tenants and later construction still require newer images.
Google photographs remain research evidence, not shipped game textures.

| View | Observed features |
|---|---|
| [Arch and street nameboard](https://www.google.com/maps/@?api=1&map_action=pano&pano=DePKT5tkVC5s8qAaJKoSuQ&heading=0&pitch=0) | Terracotta central arch, raised veranda and metal rails, clipped hedge, gate, lawn, palms with painted bases and Geodrill board. |
| [Relative order from the west](https://www.google.com/maps/@?api=1&map_action=pano&pano=PYIY5nB9fhlxuP-6NUt0jg&heading=0&pitch=0) | Separate white screened building, low green-roofed extension and terracotta building; red-roof cream house to the east. |
| [Western cream building](https://www.google.com/maps/@?api=1&map_action=pano&pano=ahg_xU2KPxnkFhKdaTYsMQ&heading=0&pitch=0) | Three-storey cream frontage, broad brown roof, individual dark window bays, brown gate, white/grey boundary wall, low wire fence, trees and planted lawn. |

The [Geodrill operator's Accra office page](https://www.geodrill.ltd/contact/accra-office/)
supports the local office context. The roadside nameboard is visible in the
panorama; it does not establish ownership of neighbouring buildings or permission
to enter. No neighbouring business names, jobs or room layouts are invented.

## Native outlines and exterior work

| Native ID | Implemented form | Remaining limit |
|---|---|---|
| 2746717488 | Terracotta building: open extruded curved arch, recessed veranda, side bays, rails and central door | Relative parcel match; measured arch dimensions and concealed elevations unavailable. |
| 2407935214 | White two-storey building: diamond-pattern screen, separate window bays, blue-grey fascia and low red canopy | Pattern spacing and canopy depth estimated from partial views behind vegetation. |
| 1337567096 | Larger cream three-storey building: brown hip roof, window bays on native edges, floor bands and downpipes | Native outline retained; roof slopes, levels and window placement estimated. |

The original rings come unchanged from
`tests/fixtures/airport-residential-context.json`. Relative west/east order and
building form were checked in multiple panoramas. These matches are not surveyed
parcel boundaries. The low green-roofed extension has no confidently isolated
native outline in this pass and remains unresolved; it is not assigned another
building's footprint.

Shared gate/wall data drive rendering and collisions. Three driveway gaps cross
the lawn through low wire fence breaks. Clipped hedge, painted-base palms,
columnar broadleaf trees and two exterior observation prompts connect the views.
Unverified opposite-side buildings retain native geometry. Existing Regus rooms
and the earlier residential models remain available.

## Verification and evidence

- Tests retain the three native rings, check closed gates and retreat, sample
  public-road travel with a minibus and walker, verify clear observation points,
  and raycast the real arch opening, its solid piers and spandrel after batching.
- The complete local Residential block uses **38 static draws / 304,698 vertices**
  in the Node geometry check. This is not a physical-device frame-rate result.
- Reference evidence: `review-artifacts/kofi-next-*-reference-2024.png`.
- Model views: `kofi-next-arched-model.png`, `kofi-next-screened-model.png`,
  `kofi-next-cream-model.png`. The review fixture has separate views for all three.
- Final build and gameplay checks are recorded in
  [implementation progress](implementation-progress.md).

## Remaining work

Obtain current dated photographs, survey parcel alignment and measure heights,
arch/roof proportions and boundary/driveway positions. Resolve the green-roofed
extension, concealed elevations and exact vegetation placement. Physical-device
performance, multiplayer camera clearance and full realism acceptance remain open.

Next: survey the opposite Kofi Annan road-facing properties while keeping deeper
neighbourhoods and further private interiors behind the connected exterior queue.
