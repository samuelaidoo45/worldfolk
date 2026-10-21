# Airport Residential — Kofi Annan / Mary Dei block

Implemented and deployed 18 October 2026 as Cloudflare version `553bf8c0-5739-4b24-ac3a-1c6992ede1eb` at [Worldfolk](https://worldfolk.world/game/). **ACC-206 remains In progress / Partial**: this is one bounded block, not completion of Airport Residential or Dzorwulu. **ACC-271** tracks the Regus address separately.

## Reference evidence

- [Regus, 19 Kofi Annan Street](https://www.regus.com/en/gh/3722): official address, parking and workspace identity. Its marketing gallery uses stock fallback images from other countries; those were excluded from modelling.
- [Regus Google Maps photographs](https://www.google.com/maps/search/?api=1&query=Regus+19+Kofi+Annan+Street+Accra): four operator-authored photographs inspected in the viewer, labelled **March 2026**: white two-storey office/dark roof and open parking canopy; blue-carpet workspace with white desks/black mesh chairs; turf courtyard with timber seating, beige cantilever parasol and white planters; white L-shaped kitchen/tan countertop, black sliding windows and wood-look floor. Ordinary photographs, **not navigable Street View**. The viewer supplies a month, not an exact day.
- [Mary Dei Amoah Road Street View](https://www.google.com/maps/@?api=1&map_action=pano&pano=jbjmOo-nkRAlsiSJ4zzkog&heading=20&pitch=0): **July 2024** capture at the Kofi Annan junction and the adjoining south-facing view. Panned to inspect cream/white compound walls, a cream two-storey residence with red-brown roof, columnar trees, palms, grass verge, grey walking edge, gravel and covered drains. This historical capture does not certify the entire street's present-day condition.
- Bundled OSM context: `tests/fixtures/airport-residential-context.json`, 76 building records, 13 road records, 9 land-use records in the extracted neighbourhood context. Outer geometry is native; it is not a measured building survey.

Reference screenshots: `review-artifacts/airport-residential-*-reference-*.png`. Copyrighted photographs remain reference evidence and are not shipped as game textures.

## Bounded implementation

| Object | Native ID | Implemented interpretation |
|---|---|---|
| Regus main office | 1330242140 | Exact outer outline, white two-storey window bands, dark pitched roof, cantilever canopy, entrance and name |
| Parking roof west of the office | 1330242138 | Exact outline; open underneath at 3.2 m, slim posts and panelled roof; replaces the generic solid shell |
| Mary Dei west residence | 2883827350 | Exact outer outline; cream facade, upper/lower window bands and red-brown pitched roof; exterior only |
| Kofi Annan Street | 34571980 | Native centreline, 7 m shared road width, bounded walking/drain strips with junction gaps |
| Mary Dei Amoah Road | 34572004 | Native centreline, 7 m shared width, west grass verge and east gravel/drain edge |
| Regus private approach | 1351987028 | Native centreline, photo-interpreted service drive, 3.8 m shared width; remains open under/alongside parking canopies |

Seven wall sections leave driveway openings. Sparse reference-supported trees, a street-name directory and restrained paving replace random lamps, stalls, billboards and traffic lights inside the bounded block. Other buildings remain native; unverified businesses, private owners and house interiors are not fabricated.

Regus has a searchable destination, safe arrival, explicit entrance, local visitor and three connected public visit scenes: workspace, courtyard and kitchen. Desk work opens a fictional Worldfolk coding role with three server-validated tasks and a ₵165 starting game wage. Seating persists until Stand up. Water uses the game catalogue and balance; no real booking, employment or Regus price is represented. Return to workspace to leave.

## Accuracy and acceptance gaps

- Heights, roof pitch, windows, canopy support details, wall/gate positions and room dimensions are estimated from photographs; no surveyed plan or exact floor layout is available. Public rooms are compact game interpretations, not a claim to reproduce the entire actual premises.
- Confirm the exact doorway, parking-panel arrangement, compound boundaries, driveway positions, drain covers and current street condition with a measured/local survey. The 2024 street capture remains a dated reference gap.
- No private residence access, invented tenant names, real workplace booking or wider district-completion claim.
- Shared-player interior pose checks, physical mobile-device frame times and night lighting acceptance remain outstanding.

## Verification

- Six focused geometry, access, room navigation, persistent seating, identity and mesh-budget checks; connected Kofi Annan/Villaggio/corridor/OSM regressions also run.
- Two disposable local API checks: proximity/catalogue prices, onsite hiring and tasks, early/wrong-task rejection, and single server-owned wage payout.
- Browser review covers the exterior and all three rooms; full-game travel and entry/exit verification recorded with gameplay screenshots.

Deployment verification: live page/API return 200; unauthenticated work actions return 401; nine runtime assets match source by SHA-256. Browser startup and public Regus search were checked without production gameplay mutations. Detailed room visits and purchases were tested locally.
