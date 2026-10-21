# Asset rights, sources and licensing

## Original source code

Worldfolk’s original source code and documentation are licensed under the **Apache License 2.0**, as selected by the owner. See [LICENSE](../../LICENSE) and [NOTICE](../../NOTICE). Intentionally submitted contributions follow that licence unless explicitly stated otherwise; disclose incompatible third-party or commissioned terms before submission. No separate CLA or copyright assignment is introduced by this guide.

The source licence does not relicense third-party code, OSM-derived data, separately licensed models/materials, logos, private player content or research imagery. Preserve their own terms and attribution. The official [Apache 2.0 text](https://www.apache.org/licenses/LICENSE-2.0.txt) defines the licence; this guide is an inventory/workflow aid.

## Separately licensed data and dependencies

Third-party rights continue to apply regardless of the eventual source licence:

| Material | Source of terms / provenance |
| --- | --- |
| OpenStreetMap data and derived map assets | [ODbL attribution](../../public/maps/README.html), [map build guide](../../scripts/maps/README.md) |
| Three.js | [Bundled notice](../../public/game/THREE-LICENSE.txt) |
| MapLibre | [Bundled notice](../../public/game/vendor/MAPLIBRE-LICENSE.txt) |
| Character source assets | [Character licence](../../public/game/assets/humans/LICENSE.txt), [asset notes](../../public/game/assets/humans/README.md) |
| Materials | [Material pack notes](../../public/game/assets/materials/README.md) |
| Place logos | [Per-logo source register](../../public/game/logos/sources.json) |
| Research photos | [Reference register](../realism/reference-images.json); check each source independently |

Real names/logos identify places and do not imply endorsement. An asset being visible on Google Images, Street View, social media or a business website does not grant permission to bundle its pixels in the game.

## Adding an asset

Record the creator, original source URL, licence/permission, required attribution, modifications and intended use. Keep the licence text with third-party source assets and preserve existing notices. For original art/audio/code, identify authorship; for generated material describe the process and review rights before redistribution. Do not include identifiable player photos or private uploads as test/game assets without appropriate rights.

Optimize geometry/textures/audio and supply source plus derived outputs where practical. Include scale/axis/material notes and regeneration steps. Do not use AI-created imagery or inferred geometry as evidence that a real facade actually looks that way. Research-only reference images remain distinct from runtime assets.

If rights are unclear, link the reference and explain the gap rather than copying it. Maintainers should resolve rights before accepting new distributable assets or changing the source licence.
