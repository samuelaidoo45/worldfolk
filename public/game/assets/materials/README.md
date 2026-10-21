# Worldfolk shared material pack

Generic scanned PBR material detail from **Poly Haven**, CC0-1.0. These scans are not photos of Accra. The HDR is pure-sky reflection lighting only. Runtime downloads are served locally with the game, never through the Poly Haven API.

- Plastered Wall 05 — Charlotte Baglioni
- Concrete Floor 02 — Rob Tuytel
- Asphalt 02 — Rob Tuytel
- Kloofendal 48d Partly Cloudy (Pure Sky) — Greg Zaal; sky edits by Jarod Guest

Sources, authors, source checksums and output hashes are in `manifest.json`.
Licence: https://polyhaven.com/license · https://creativecommons.org/publicdomain/zero/1.0/

512px WebP albedo is neutralised to retain authored building colours. Normal maps remain OpenGL convention; ORM stores occlusion red, roughness green, metallic blue. Only AO/roughness are used. All non-colour inputs remain linear. Nine texture maps plus the 1k HDR total 1,944,593 transferred bytes; GPU memory is larger.

Build: `node scripts/realism/build-pbr-pack.mjs` from the repository root. RGBELoader comes from Three.js r160; its MIT licence is included as `THREE-LICENSE.txt`.
