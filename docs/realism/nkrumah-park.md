# Kwame Nkrumah Memorial Park

## Implemented reconstruction — 13 October 2026

The park replaces the earlier generic mausoleum model with a coordinated outdoor visit: marble monument, bronze statue, fountain approach, planted grounds and a walk-in museum gallery. It uses the existing OpenStreetMap world and original Three.js geometry. No Mapbox subscription, downloaded reference photographs or new runtime service is required.

## Reference record

References were inspected on 13 October 2026. Photographs are visual references, not textures or redistributed game assets.

| Component | Real reference | What informs the model |
|---|---|---|
| Mausoleum | [Official mausoleum description and photograph](https://knmp.gov.gh/new/mausoleum/) | Don Arthur's inverted-sword design, curved marble blades, tall openings, black star, open core and reflecting water. The page describes the marble tomb and skylight. |
| Statue | [Graphic's monument photograph](https://www.graphic.com.gh/features/features/independent-monuments.html) | Raised pointing arm, draped bronze figure and dark pedestal on the central approach. The 2019 photograph predates the 2023 renovation. Facial detail is a simplified sculptural interpretation. |
| Fountains | [Graphic approach photograph](https://www.graphic.com.gh/images/2019/sept/17/kwame_nkrumah_park.jpg), [official refurbishment account](https://knmp.gov.gh/new/president-akufo-addo-re-opens-refurbished-kwame-nkrumah-memorial-park/) | Paired elongated pools, horn-playing figures and arcing jets. The refurbishment account confirms upgraded fountain lighting/audio; the game currently implements animated jets, not the real show programme. |
| Gardens and site arrangement | [Venue Tours park aerial](https://venuetoursgroup.com/thing-detail/Kwame-Nkrumah-Memorial-Park), [aerial photograph](https://venuetoursgroup.com/restaurant_image/67a230aa74efe1738682538.jpg) | Axial walk, parallel garden paths, lawns, mature canopy trees, pools and low museum behind the monument. The park boundary and monument anchor use the bundled OSM extract. |
| Museum | [Official description](https://knmp.gov.gh/new/mausoleum/), [official virtual tour](https://knmp.gov.gh/new/virtual-tour/), [GNA renovation report](https://gna.org.gh/2023/07/refurbished-kwame-nkrumah-memorial-park-in-pictures/) | Low, visually subordinate museum mass; modern pale entrance finishes; documented collection categories such as books, garments and luggage. The linked virtual tour was inspected at the reception, not treated as a survey of every gallery. The game includes an explicitly labelled interpretive timeline/gallery. |

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
