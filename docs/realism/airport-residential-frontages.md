# Airport Residential — buildings facing Kofi Annan / Mary Dei

**Release update — 19 October 2026:** this exterior pass is deployed at [worldfolk.world/game](https://worldfolk.world/game/) as Cloudflare version `ebe7f7be-0083-4d56-b719-6be29c9fd66c`. Implementation remains Partial; the local-only statements below describe the pre-release review. See [deployment evidence](implementation-progress.md#19-october-2026--roadside-release-acc-272276).

**19 October 2026 · ACC-272 · In progress / Partial · local only.** This extends the existing [Regus / residential block](airport-residential-blocks.md). It is a bounded exterior pass, not completion of either street or the district.

## Reference survey

Navigated Google Street View along Mary Dei Amoah Road and Kofi Annan Street and panned both sides. Every inspected panorama displayed **July 2024**. These are dated historical references; they do not establish current 2026 paint, occupants, construction or boundaries. No Google photographs are shipped as game textures.

| View | Evidence and use |
|---|---|
| [Mary Dei street](https://www.google.com/maps/@?api=1&map_action=pano&pano=bfjgBl4NGL-tbQeC7rS2mw&heading=180&pitch=0) | Grass/cream western compound versus gravel/white eastern wall, palms, rail and drainage edge. |
| [Eastern compound](https://www.google.com/maps/@?api=1&map_action=pano&pano=jXQ3TVNiazdxHURQfoL1sg&heading=90&pitch=0) | White wall panels and sconces, palms and gravel. Concealed buildings remain native. |
| [Red-roofed residence and gate](https://www.google.com/maps/@?api=1&map_action=pano&pano=VileE1dRlcsw94UY9NdMfg&heading=270&pitch=0) | Broad tiled eaves, cream upper facade, stone panels, small annexes, satellite dish, dark gate and flower borders. |
| [Modern house](https://www.google.com/maps/@?api=1&map_action=pano&pano=MITDS4LADHLDvo5bQ5QFAA&heading=270&pitch=0) | White balcony frame, terracotta stair tower, horizontal rails, brown slatted gate and grass apron. |
| [Kofi Annan north frontage](https://www.google.com/maps/@?api=1&map_action=pano&pano=s4remvJ6Fko8UhrIbaNDbA&heading=0&pitch=0) | Cream/red-roof house with shaded veranda, separate window bays, external stair, low perforated fence, hedge and lawn. |

Searches also returned generic serviced-office stock images; they were not used to design neighbours. The Geodrill operator confirms a Kofi Annan address, but that does not prove which individual visible mass is its office. No new operator/owner signage or tenant identity is assigned to these models. The adjacent orange arched frontage was unresolved in this first pass. The next [north-side survey and implementation](kofi-annan-north-frontages.md) records the relative parcel match and remaining survey uncertainty.

## Implemented structures

All outer ground outlines are preserved from `tests/fixtures/airport-residential-context.json`. Map classes alone do not establish real building use.

| Native ID | Exterior interpretation | Scope |
|---|---|---|
| 2883827350 | Cream corner residence, red hip roof with ridge/course detail, deep upper frontage, stone panels and separate window bays | Refined existing model |
| 2883827352 | Low cream/red-roof annex | New; obscured portions estimated |
| 2883827354 | Small red-roofed gatehouse/annex with the visible roof dish | New; role inferred from relative position, private use unverified |
| 2883827346 | White modern residence, flat balcony frame, brick-coloured tower and metal rails | New; estimated facade dimensions |
| 2407935212 | Cream/red-roof veranda house with external stair | New; relative block/footprint match, survey alignment remains open |

This first batch replaced seven native records including the unchanged Regus office/carport. Other neighbours retain their mapped masses. Private compounds have closed gates and shared collision definitions. No private interiors, fabricated household names, new jobs or purchases were added. Existing Regus room visits remain available.

Updated gate aprons, wall panels, low perforated fence, hedge, lawn, flowering borders and attached wall sconces support these buildings. Two street-side observation prompts identify the exterior views. Generic stalls/signals/billboards remain excluded from this bounded block.

## Checks and evidence

- Focused tests cover native outline retention, closed gates and retreat, public street traversal by a minibus and walker, valid roof attributes after batching, Regus access/rooms and neighbouring Kofi sites.
- The visual review caught incomplete UV attributes when roof triangles shared a material with tile-course meshes; the authored roof now supplies UVs, and the regression checks attribute counts after batching.
- Reference screenshots: `review-artifacts/residential-frontage-*-reference-2024.png`.
- Model reviews: `residential-frontage-corner-house.png`, `residential-frontage-modern-house.png`, `residential-frontage-kofi-veranda.png`. Review fixture: `tests/fixtures/airport-residential-review.html`.
- Full-game browser evidence, build results and local state are recorded in [implementation progress](implementation-progress.md).

## Remaining acceptance

Obtain current dated photographs and measured facade/roof/gate dimensions; reconcile the northern house parcel against a survey and inspect concealed elevations. The 2024 panorama positions, relative masses and native outlines are useful references, not a survey. Street/ground placement and private stair shapes are approximate. Physical-device frame times and shared-player camera/interaction checks remain open. No photorealism or whole-street completion claim is made.

Continuation: see the [three north-side Kofi Annan frontages](kofi-annan-north-frontages.md). Keep deeper neighbourhood blocks and new interior work behind the exterior queue.
