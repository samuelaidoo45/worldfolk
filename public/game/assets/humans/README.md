# Worldfolk civilian character bases

Source: Quaternius, **Universal Base Characters — Standard (free)**
https://quaternius.com/packs/universalbasecharacters.html
https://quaternius.itch.io/universal-base-characters

Downloaded 11 October 2026. CC0 1.0; original notice in LICENSE.txt.
Only the free Superhero male/female bases and two hairstyles are included.
No paid Source-pack assets are used. These are game models, not scans of real people.

Worldfolk adaptations:

- Body, eyes and brows retain the source skeleton and UVs.
- Buzzed hair / buns are attached to each model's head skeleton.
- Source textures resized to at most 1024 px and converted to WebP (88 colour / 95 normal-map quality).
- `human-garments.js` clips the weighted body surface into opaque shirt, trousers and footwear materials, with clean seams and slight garment volume.
- `human-character.js` adapts joint axes, creates independent skeletons, varies clothes, and animates movement and activities.
- Base rig faces +Z; Worldfolk uses -Z. Actor container performs that conversion.

The original model files keep their source filenames for provenance. The game
loads them as clothed civilians, never as unclothed bases. Detailed clothing
meshes, broader face/body variety, footwear and authored animation clips remain
later art passes; this is the first replacement for the primitive characters.

Loader: Three.js r160 GLTFLoader and SkeletonUtils, MIT (THREE-LICENSE.txt).
Regenerate `humanoid-loader.js` with `node scripts/assets/vendor-humanoid-loader.mjs`.
