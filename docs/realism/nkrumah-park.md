# Kwame Nkrumah Memorial Park

## Implemented reconstruction — 13 October 2026

The park replaces the earlier generic mausoleum model with a coordinated outdoor visit: marble monument, bronze statue, fountain approach, planted grounds and a walk-in museum gallery. It uses the existing OpenStreetMap world and original Three.js geometry. No Mapbox subscription, downloaded reference photographs or new runtime service is required.

## Active references — reviewed 15 October 2026

Use the [current reference register](current-reference-images.md) and its image-specific dates. Previous source lists are retained in [the historical archive](historical-references.md).

- [Kwame Nkrumah -1.jpg](https://commons.wikimedia.org/wiki/File:Kwame_Nkrumah_-1.jpg) — **captured 2025-12-24**. Post-renovation marble silhouette, star, pools, jets, grey tiled paths and black approach railings.
- [Original Statue of Kwame Nkrumah.jpg](https://commons.wikimedia.org/wiki/File:Original_Statue_of_Kwame_Nkrumah.jpg) — **captured 2025-09-07**. Museum remnant display; separate from the intact pointing statue on the fountain approach. Do not infer historical vehicle identity from nearby uploader captions.
- [KNMP operator virtual tour](https://knmp.gov.gh/new/virtual-tour/) — **capture date unknown**. Official linked Matterport tour. Capture date unreported; individual rooms still require review.

The dated mausoleum photograph is after the 2023 renovation and replaces pre-renovation photos for current paths, railings, pools and marble. The original damaged-statue exhibit is separate from the intact pointing statue. Obtain a dated approach-statue view and renovated museum/reception rooms; do not infer them from old aerials.

## Playable visit

- Selecting Nkrumah Memorial Park on city home arrives on the central fountain approach facing the monument. It remains an outdoor location instead of opening a generic room.
- Walk around the statue and reflecting pools, follow the garden paths and enter the museum through its open doorway.
- Six activity spots: monument photo pose, fountain viewpoint, garden seat and three gallery/history stops. Use E or the touch interaction button. Sitting, posing and watching continue until the player stops the activity.
- A small local visitor crowd walks continuously along the garden paths, with fewer visitors at night. NPCs do not increase online-player counts.
- The museum roof hides for a visitor inside so the follow camera can see the gallery. Pools, monument supports, tomb, statue pedestal, exhibits and museum walls have shared collision footprints; the entrance and paths remain open.
- Short original historical captions use the game's existing dialogue and optional synthesized speech. They are not recordings of Nkrumah or the museum's audiovisual programme.

## Accuracy boundaries

This is a researched, stylized reconstruction, not a survey, scan or photorealistic digital twin. OSM anchors replace ways 632287728 (mausoleum) and 413669874 (museum shell). Dimensions, path widths, planting positions, fountain count and sculpture detail are visual estimates. The low museum is rendered at accessible ground level; its underground construction, renovated gallery layout, original artefacts, Cadillac display and audiovisual tunnel are not reproduced. The mausoleum interior/tomb is simplified. The entry/reception complex and the whole renovated campus remain future modelling work.

Static meshes are batched by material; only fountain jets and the museum roof need independent updates. Local procedural textures avoid extra image downloads. Phone GPU benchmarking and a site-survey accuracy review remain open.

## Verification

`tests/nkrumah-park.test.mjs` checks clear arrival, shell replacement, traversable paths and museum doorway, blocking pools/piers/exhibits, retreat from collisions, mesh-level doorway clearance, roof visibility and continuous pedestrian routes. `tests/fixtures/nkrumah-review.html` provides approach, aerial, statue, museum and walk views for visual review. Existing Independence precinct tests remain part of the regression run.
