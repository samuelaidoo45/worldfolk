# Contributing a place or city block

The goal is a recognizable Accra experience with usable approaches and activities. A footprint extrusion, named pin or themed interior alone does not finish a place.

## 1. Claim a bounded inventory item

Use [coverage-work-items.csv](../realism/coverage-work-items.csv) and its stable `ACC-*` ID. Check its next action and evidence fields. Open an issue with the ID, precise geographic bounds and intended exterior/ground/activity scope. Do one connected frontage/block at a time rather than promising an entire district.

## 2. Establish references

Collect official place photographs and dated street/overhead views where available. Record page URL, image/source URL, credit/licence, capture date, publication date and date checked in [reference-images.json](../realism/reference-images.json). A page's copyright year or recent upload does not establish a recent capture.

Identify silhouette, roof, facade rhythm, material, entrances, walls, ground surface, roadside furniture and approach. Mark obscured surfaces and measured dimensions as unverified. Do not infer a private interior or public access from an overhead image. Keep source imagery as research unless redistribution rights expressly allow using it as an asset.

## 3. Preserve geographic ownership

Use native contours/IDs from the committed map extract. Provide an inventory/builder and source hashes where applicable. Register authored source ownership so native generic buildings are suppressed only for the records the model replaces. Keep courtyard holes, real road lanes and neighbouring footprints clear. Do not flatten an entire block into invented paving/grass.

Useful examples:

- [Castle Drive / Asomdwe brief](../realism/castle-drive-asomdwe.md)
- `public/game/castle-asomdwe-data.js` — identity, approaches, activities and collision data.
- `scripts/realism/build-castle-asomdwe.py` — native inventory extraction.
- `scripts/realism/build-castle-asomdwe-layout.mjs` — prepared layout/clipping.
- `public/game/castle-asomdwe.js` — authored near/medium rendering.
- `tests/castle-asomdwe.test.mjs` — ownership, access, geometry and obstacle checks.

These are examples, not a requirement to duplicate every file for a small object.

## 4. Implement a playable visit

Connect the place to existing search/destination/arrival systems. Keep arrivals on valid usable ground with a safe route to the activity, door or viewing point. Place owned vehicles away from pedestrian routes. Match visible obstacles to collision and stairs/platforms to shared elevation rules. Persistent poses such as sitting must stop only through the player's intended control. Add only activities supported by the scope and setting.

## 5. Bound the rendering cost

Prepare expensive clipping/layout offline; cache/filter collision candidates. Reuse shared resources and provide authored medium identity where the LOD catalog requires it. Run source-hash and geometry budgets; document compressed bytes and draws. Avoid extra real-time lights/shadow passes. Follow [engineering standards](standards.md) and [asset rights](assets-and-licensing.md).

## 6. Verify and record partial work honestly

Verify approach, up/down, protected obstacles, activity start/stop, exit/resume and any server-authoritative arrival/elevation behavior. Inspect actual gameplay as well as model fixtures. Include evidence, test commands, remaining reference gaps and device limitations in the place brief and PR.

Update the detailed inventory row, then rebuild the derived records when changing their sources:

```sh
python3 scripts/realism/build-reference-audit.py
python3 scripts/realism/build-coverage.py
```

Rebuild affected LODs with `npm run assets:lods` when a hashed rendering source changes. Do not call a place complete just because the builder or screenshot passes; references, public access, activity behavior, physics and performance need their own acceptance.
