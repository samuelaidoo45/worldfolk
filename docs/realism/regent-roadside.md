# African Regent / Liberation Road frontage

**Release update — 19 October 2026:** this exterior pass is deployed at [worldfolk.world/game](https://worldfolk.world/game/) as Cloudflare version `ebe7f7be-0083-4d56-b719-6be29c9fd66c`. Implementation remains Partial; the local-only statements below describe the pre-release review. See [deployment evidence](implementation-progress.md#19-october-2026--roadside-release-acc-272276).

ACC-276 · reviewed 19 October 2026 · **local In progress / Partial exterior pass**.

## Coverage and native geometry

Extends north from the Shangri-La junction along the western side of Liberation Road. Bounds: longitude −0.1770 to −0.1760, latitude 5.61835 to 5.61935. Three low structures retain the exact bundled source rings **2475838476, 2475838246 and 2475838248**. Their relative match to the visible compound is provisional; no business identity or ownership is assigned. Western neighbours **2475838250, 2475838252 and 2475838254** remain native and unclaimed.

Native road **510151406** retains the existing shared 10.5 m profile. The roadside boundary is estimated at 13 m west of the road centre; the stone-to-panel transition at latitude 5.61872 is also estimated. The raised compound has a 1.55 m authored base. These are modelling dimensions, not a measured survey.

## References inspected

| Source | Actual capture evidence | Visible features |
|---|---|---|
| [Raised compound, Liberation Road](https://www.google.com/maps/@?api=1&map_action=pano&pano=Qk9P7WJcFU500DFIVxg-FA&heading=270&pitch=0) | September 2024; position 5.6185466, −0.17625; inspected west and north | Low cream structures/red roofs, sloping stone retaining wall, rail fence, narrow trees, black water tank and public footway |
| [Hotel east boundary](https://www.google.com/maps/@?api=1&map_action=pano&pano=c79ukj8p5JbNTITkM5tg2w&heading=270&pitch=0) | September 2024; position 5.6189542, −0.1762778 | Cream panels, peach piers/coping, small black wall lights, short palms, soil strip/guard wires, paving/drain opening and low hotel return with horizontal glazing |
| [Northern hotel approach](https://www.google.com/maps/@?api=1&map_action=pano&pano=witI1bGg9iFSwmJgdYOe1w&heading=95&pitch=0) | July 2024; reinspected for entrance context | Peach entrance arch, pale wall, trees, red/white kerbs and drains. Entrance remains on this northern approach |
| [African Regent operator gallery](https://www.theafricanregenthotel.com/gallery) | Photograph capture unknown; reviewed 19 October 2026 | Lower pool-side wing and taller room blocks/turrets; supports the distinction between hotel wings, not exact dimensions |

No verified 2025–2026 photograph of these exact frontages was found. Check dates are not capture dates. Street View screenshots are review evidence; no Google imagery, advertisements, mural or photographic textures are shipped. Original geometry and surface patterns are used.

## Local implementation

- Three separate low native shells with fitted gable, hip and mono roofs, cream finishes and raised foundations. Concealed rooms and elevations remain unspecified.
- Sloping retaining face with original irregular stone geometry and light mortar, metal railings, ribbed black tank, columnar trees and broad leaves.
- Cream hotel wall panels, peach piers/coping, black sconces, short feather palms and a thin bare-soil verge with low guard wires.
- Continuous public paving and slotted drain covers sampled against native road/building geometry. No invented gate through the Liberation Road wall.
- Searchable **African Regent · Liberation Road frontage**, public arrival, two persistent outdoor observation guides and one pavement pedestrian. E explicitly starts and stops each guide. Private compound walls stay closed.
- Existing African Regent east return corrected to estimated two-storey 6.4 m cream/horizontal-window massing; northern room block stays 19.2 m. Two floating roof details moved onto supported native roof areas. Outer hotel footprint, original northern arrival and outdoor pool activities remain intact.
- Renderer, source replacement and collision use shared IDs/rings. Generic roadside props are suppressed within the authored block.

## Verification

`node --test tests/regent-roadside.test.mjs tests/shangri-la.test.mjs tests/villaggio-neighbours.test.mjs` passes **23 focused checks**: exact source rings, unknown-neighbour retention, search/arrival/guides, continuous public pavement and minibus clearance, contact/retreat, pedestrian continuity, finite geometry/UVs, fitted roof rays and supported hotel roof details. JavaScript syntax, whitespace checks and the production build pass.

New roadside scene: **14 static draws / 64,317 vertices** in Node. This is geometry accounting, not measured physical-device FPS.

Full-game local review used the existing disposable test profile: launched, searched the new name, selected the destination, signed in and arrived directly at its guide. Opened/stopped the guide, met the closed wall and retreated, then moved along the frontage. No console errors captured. Daylight model views were reviewed separately. Evidence:

- `review-artifacts/regent-roadside-gameplay-guide.png`
- `review-artifacts/regent-roadside-gameplay-walk.png`
- `review-artifacts/regent-roadside-raised-model.png`
- `review-artifacts/regent-roadside-wall-model.png`
- `review-artifacts/regent-roadside-street-model.png`
- `review-artifacts/regent-south-retaining-wall-reference-2024.png`
- `review-artifacts/regent-east-wall-reference-2024.png`

## Still open

Obtain current dated photos, measured roof/facade/wall dimensions, exact parcel alignment and hidden-side views. The separate unfinished concrete structure/mural frontage and western compound identities remain unresolved and are not reconstructed by guesswork. The northern connection, full driveway detail, phone frame times and shared-player camera acceptance remain pending. This is a stylized reference-informed exterior pass, not an exact or photorealistic replica.

Inventory now contains **276 packages: 42 In progress / 228 Queued / 6 Expansion**, with **132 reference records**. The four-area exterior pass remains incomplete. Next survey: Opeibea roadside buildings and public approaches; retain the documented African Regent/interchange gaps. No stage, commit, push or deployment in this pass.
