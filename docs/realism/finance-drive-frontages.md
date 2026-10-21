# Finance Drive — western civic frontage pass

**21 October 2026 · Partial, local implementation.** Continues the Independence Square surroundings before extending further into Osu.

## Built

Five original exterior plates replace the provisional treatment, retaining every native contour and both courtyard holes:

| Native ID | Treatment | Evidence limit |
|---|---|---|
| 16546541 | Shared Finance Drive courtyard complex: pale fretwork, long recessed window/balcony rows, ochre/brown angular end cladding, reception canopy | Official 2021 entrance photograph and January 2016 frontage. Former Finance Ministry/GSS context; current occupancy and unchanged cladding not independently confirmed. |
| 596516562 | Adjoining tall gridded block: deep pale frames and inset window rows | January 2016 street scene; height remains native 20 m, not surveyed. |
| 1215731838 | Narrow connecting volume between the native courtyard and annex plates | Overhead/native context only; unseen elevations are provisional. |
| 1017656842 | Commission’s north frontage: seven tiers, vertical fins and folded entrance canopies | January 2016 panorama; 24 m height and canopy dimensions estimated. |
| 1028531778 | Separate rear Commission plate, retaining the open middle | Native/overhead massing; rear appearance extrapolated from the front, not photo-verified. |

Added bounded pale screen/metal compound edges, open pedestrian gate gaps and matching post/fence/tree colliders; flush paved/covered-drain strips; parking paint and roadside planting. **57 boundary sections, 43 paved pieces and three trees** are prepared offline with input hashes. Source imagery is used for observation, never copied into runtime textures. Exact gate positions, fence patterns, parking marks and landscaping remain estimates, with geometry clipped away from native roads/buildings.

The existing saved Finance Drive arrival remains intact. Its title and guide now explain the older complex. Added a searchable Public Services Commission arrival/guide and a persistent facade photo pose. These are outdoor visits; no invented ministry interiors or real government services are provided.

## Current identity correction

The [Ministry’s official notice of 6 February 2026](https://www.mofep.gov.gh/news-and-events/2026-02-06/relocation-of-the-ministry-of-finance-to-kanda) says full operations moved to **Tumu Avenue, Kanda on 9 February 2026**. The Finance Drive reconstruction must not be advertised as the current ministry headquarters. A nearby old map result is canonicalized to the historic Finance Drive visit; distant Kanda results remain separate.

The [PSC contact page](https://psc.gov.gh/contact-us/) still identifies Finance Drive. The [older GSS contact page](https://www2.statsghana.gov.gh/contact_us.html) identifies Finance Close, but does not establish exclusive/current occupancy of every shared plate. The panoramic frontage shows both GSS and Finance Ministry signage. The game therefore uses a shared/historical frontage description rather than assigning an unsupported exclusive tenant.

## References visually inspected

- [Official Finance Minister first-day gallery](https://www.mofep.gov.gh/multimedia/2021-04-07/finance-minister-first-day-at-work-2021), [entrance photograph](https://www.mofep.gov.gh/sites/default/files/multimedia/First-day-1.jpg): pale decorative screen, ochre/brown angular panels, gated driveway, canopy and palms. Gallery publication 7 April 2021; individual capture/EXIF unknown.
- [Courtyard frontage Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=hyNnYaogweNDsNtR33NjkQ&heading=2&pitch=8): **January 2016** in panorama UI. Balcony rails, white screens, shared signage and pale low boundary. Panned across the road and adjoining blocks.
- [Commission entrance Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=GOH77U1EJeWQkH0ySYnDGQ&heading=180&pitch=12): **January 2016**, seven window tiers, pronounced vertical fins and folded canopies.
- [Annex / landscaped frontage Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=WpCqsm1w8TwaVdB5jUi7TA&heading=354&pitch=8): **January 2016**, panned through the grid block, lawn, palms, trees and Electro Volta context.
- [Overhead context](https://www.google.com/maps/@5.55035,-0.1957,19z/data=!3m1!1e3), panned south: separate native plates, shared courtyard, parked rows and commission parcel. Individual imagery capture unavailable; 2026 copyright is not a capture date.

## Rendering and checks

The eleven precinct packages now total **457,591 near vertices**, compared with **498,220** in the previous public-space pass. Finance: **98,622 vertices / 14 draws**; Commission: **55,221 / six draws**, before browser signs. Ordinary distant context windows use flat inset glazing rather than separate boxes. Thin fence members use crossed ribbons. No extra per-frame callbacks, GPU lights or shadow passes. Global desktop/mobile streaming budgets are unchanged. Finance and Commission use authored coarse facade panels and roofs at distance, omitting fine fencing/planting; their medium binaries total 24,543 bytes compressed. Both courtyard holes and roof heights are regression checked. Finance and Commission now have generated medium assets; catalog: **43 static packages plus two human LODs**.

This is a geometry-cost comparison, not an FPS improvement claim. Existing frame-time spikes and physical-phone benchmarks remain open. Tests cover exact native ownership/holes, offline hash freshness, clear pavement and gates, safe arrivals, the route to the photo point, cached collisions, cost limits and API profile preservation. Browser/build results are recorded in `implementation-progress.md`.

## Remaining

Current dated photographs, measured heights, hidden/rear facades, exact gates/parking/landscaping, real access arrangements and phone/shared-player acceptance. Remaining unnamed northern/western ministry plates stay provisional. Nationalism Park’s unverified restaurant is unchanged. Next: Ghana Club/coastal surroundings, then Castle Drive/Asomdwe Park, while maintaining the Independence precinct priority.
