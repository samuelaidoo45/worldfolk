# Browser graphics: realism within a rendering budget

20 October 2026 · implemented locally, release pending

## Chosen approach

Keep the existing Three.js r160 / WebGL / MapLibre shared canvas and native OSM geometry. Improve measured rendering costs and asset quality in place. A Rust/Bevy, Unity or Unreal port is a separate engine migration, not a prerequisite for realistic assets. Wasm is useful when a profiler identifies expensive decoding, tessellation or simulation; it is not a replacement for accurate geometry, materials, lighting or a GPU budget. Avoid adding a second renderer/context or a speculative Wasm bridge.

The practical asset path is reference-checked Accra geometry, glTF/GLB models with explicit collision meshes and levels of detail, locally hosted PBR maps, shared GPU resources and spatial streaming. Use authored meshes for walkable/collidable places. Licensed photogrammetry can supply particular buildings; splats can supply distant scenery but require separate collision geometry and device/memory evaluation. OSM footprints alone do not encode a building's photographic facade. Google Street View/Earth pictures remain reference evidence, not runtime texture assets.

Primary guidance: [Three.js physically based materials](https://threejs.org/docs/pages/MeshStandardMaterial.html), [colour management](https://threejs.org/manual/pages/color-management.html), [prefiltered environment lighting](https://archive.threejs.org/docs/api/en/extras/PMREMGenerator.html), [WebAssembly performance patterns](https://web.dev/articles/webassembly-performance-patterns-for-web-apps).

## Implemented material and lighting pass

- Three licensed scanned surface families: plaster, concrete/paving and asphalt. Each has neutral albedo, OpenGL normal and packed ambient-occlusion/roughness maps at 512×512. Albedo is sRGB; normal/ORM remain linear. Shared map objects survive streaming disposal. Authored signs, facade sheets, roof patterns and glTF skin/clothing inputs are preserved.
- Metre-scale UV projection is applied after static object transforms are baked. Large walls/paving no longer stretch one primitive UV tile. No new vertices are added to already non-indexed batches; formerly indexed single surfaces are expanded to support independent face UVs. This changes topology representation, not collision bounds.
- A 1k pure-sky HDR supplies daytime reflections, including existing vehicle paint/glass. It is reflection lighting, not an image of Accra or a background replacement. Daylight hemisphere intensity is reduced to avoid washing out the surface contrast. Existing day/night/golden presets remain; only daytime uses this HDR.
- Road/paving patterns in the mapped layer upgrade to local scanned aggregate while retaining mapped surface masks and road markings. They are 2D map patterns, not PBR shading of MapLibre fill layers.
- Downloads are lazy and local, with neutral/procedural fallbacks. Failure never blocks world entry or movement. The HDR starts only when the 3D world renders. No provider API/CDN is queried during gameplay.

The runtime pack is **1,944,593 bytes** total (about 1.85 MiB): nine WebP maps and one HDR. This is transferred file size, not decoded GPU memory. Attribution, source URLs/authors, source MD5s and output SHA-256 values are in [`assets/materials/manifest.json`](../../public/game/assets/materials/manifest.json). [Poly Haven's CC0 licence](https://polyhaven.com/license) permits reuse; generic material scans are not claimed as Accra captures. RGBELoader is Three.js MIT code with its licence included.

Rebuild with `node scripts/realism/build-pbr-pack.mjs`. Existing manifest source pins are reused. `--refresh-sources` explicitly refreshes metadata/checksums. The script requires Node 22+, `sharp` and network access. Runtime assets are already built and do not require this command to start the game.

## Implemented efficiency controls

| Control | Desktop | Coarse-pointer/mobile |
| --- | --- | --- |
| Detailed landmark model cap | 20 | 12 |
| Static landmark vertex target | 1,200,000 | 650,000 |
| Static landmark draw target | 280 | 180 |
| Base load distance beyond compound radius | 230 m | 160 m |
| Generic detailed facades | nearest 48 within 220 m | nearest 24 within 140 m |
| Ambient NPC detail slots | 8 people + 16 vehicles | 4 people + 10 vehicles |
| Detailed human visibility | 90 m | 55 m |
| Vehicle visibility | 200 m | 150 m |
| Actor shadow distance | 38 m | 22 m |
| Shadow map | 1024² | 512² |

Large compound bounds and tall-building height extend their load range; height-derived distance is capped at 1,200 m. The closest model is retained even if it alone exceeds a target, so these vertex/draw figures are admission targets, not whole-frame hard limits. Unknown model cost is measured after first creation. Measured cost survives eviction, preventing repeatedly building/rejecting the same expensive package. Actors, generic facades, map rendering and shadows are additional frame costs.

Nearby models load first, one per rendered frame. A 100 m retention margin prevents boundary churn. Distant detailed models are removed and their owned geometries/materials/textures disposed; shared assets survive. Native map shells are restored for unloaded source IDs. Geometry streaming does not remove physics, routing, search or server players.

Ambient detail slots are assigned to the closest NPC people/vehicles with an 8 m retention preference, recalculated at 4 Hz. This caps local background rendering only; simulation and registered/remote player counts are unchanged.

Close characters animate every frame; animation beyond 15 m updates at 20 Hz, beyond 35 m at 10 Hz. Hidden distant NPCs skip movement/pose/pothole-render work. Vehicle wheel travel uses actual displacement when visible again, and hidden pothole histories are reset. Nearby rigged people retain their existing skin, clothes, skeletons and continuous actions. This retains distance culling/throttling and now adds prebuilt skinned body LODs (below). It does not add photogrammetric humans or crowd impostors.

Gameplay now keeps a stable pixel ratio, capped at 1.25× desktop / 1× coarse-pointer devices, bounded by the map’s original ratio. MapLibre alone resizes its shared canvas, only on view transitions. The earlier runtime resolution governor was removed from the custom-layer render path: resizing the drawing buffer after drawing could clear the current frame and cause visible flashes. The governor helper/tests remain for future work, but it does not change resolution during current gameplay. 2D/menu views restore the original pixel ratio.

## Diagnostics and acceptance

Append `?graphicsStats=1` to the local game URL to show a bounded 120-sample profiler. It separates CPU render submission p95, observed frame interval p95, draw calls, triangles, GPU geometry/texture **object counts**, loaded landmarks, static admission cost, pixel ratio and PBR loading status. Object counts are not driver memory bytes; CPU submission is not a GPU timer or total game-loop time. Initial shader compilation can be slow and is visible in early samples; use settled samples for comparisons.

Local verification and screenshots are recorded in `review-artifacts/pbr-performance-verification.json`. Device acceptance must still measure representative Android/iOS phones, desktop integrated graphics and a prolonged travel session. Do not infer 60 fps, millions of simultaneous rendered players or a universal percentage speedup from the local QA browser.

## Next asset work

1. Obtain licensed/current references and sufficiently detailed Accra-specific vehicles, people and location geometry. Keep measured dimensions and source accuracy separate from material polish.
2. Extend the new medium-detail meshes to the remaining large packages. Bake full-detail near models and material atlases offline to remove measured synchronous factory stalls; add explicit walk/collision meshes and far impostors before raising crowd density.
3. Profile decoding/upload size, then add KTX2/Basis textures and Meshopt/Draco decoding where their measured transfer/memory wins justify the Wasm decoders. Keep WebGL compatibility and fallbacks.
4. Benchmark cold entry, ten-minute walking/driving, rapid travel, background/restore and mobile heat/memory. Resolve shader compilation stalls and main-map/GPU costs before adding expensive post-processing.
5. Evaluate a WebGPU backend only after the shared MapLibre/WebGL integration and device coverage have a tested migration path. Preserve the working fallback.

No deployment, Git staging, commit or push is included in this implementation.

## Shader preparation and actual geometry LODs — 20 October follow-up

The shared renderer now has a single-flight preparation queue, pumped once per custom-layer frame. Initial scene shaders are prepared before the visible Three.js scene appears. New landmark roots remain staged until preparation completes, retaining the prior model/native map shell until an atomic replacement. Travel invalidates pending work and disposes rejected roots. Human fallback-to-rig upgrades also prepare the new material variants before replacing the existing character. The queue uploads initial material textures separately, precompiles colour and representative static/skinned/instanced depth variants, and bakes cached PMREM environment targets explicitly. Owned PMREM targets/materials are disposed with the world; shared source textures remain shared.

`WebGLRenderer.compileAsync` uses `KHR_parallel_shader_compile` when supported. Completion polling is asynchronous; the initial call can still block on driver work, especially without the extension. A preparation job is not a guaranteed sub-frame task. Full near-model factories, later texture-image upgrades, vertex-buffer uploads, shadow variants beyond the representative types, map work and simulation can still cause spikes. Queue completion wall time and synchronous submission maxima are shown separately in opt-in diagnostics.

`npm run assets:lods` runs pinned **meshoptimizer 1.1.1** offline. It emits 39 exterior packages, including Villaggio, Signature, Gallery, the Airport City towers, Senchi skyline, airport-bound groups, Mahama neighbourhood and railway/stables, plus two skinned civilian bodies. Geometry/source hashes, a reproducible build script and the MIT licence ship with the pack. Total: **1,240,588 → 615,386 triangles** (50.4% fewer across these packages), **34,106,640 bytes raw / 6,187,792 bytes gzip**. The catalog loads only selected packages; it is not one startup download. The loader handles both raw gzip and servers that automatically decompress it, and keeps a raw binary fallback for browsers without DecompressionStream.

Buildings switch using footprint-edge distance: full detail below 70 m desktop / 50 m mobile; change to medium beyond 110/80 m. Hysteresis retains the previous level between thresholds. Medium meshes preserve structural silhouettes and material colours while dropping small rails/mullions and close-only texture maps; distant casting shadows are omitted. Near authored geometry and its mapped collision remain unchanged. No-op update callbacks no longer exclude static towers and Polo/Senchi exteriors from the offline catalogue. Signature/Gallery pool material animation is frozen only in their distant meshes; genuinely animated packages retain their runtime implementation. Villaggio keeps all coloured facade cells but uses outward faces for distant panels/glazing: 516,576 → 77,534 vertices and 172,196 → 39,690 triangles. Structural slabs, supports, loggias and undercroft openings remain solid/open as authored.

Streaming ranks by footprint edge, reserves three/four mobile/desktop slots for prominent towers, and gives the closest eligible building full detail when it fits. Other exteriors are admitted at their lighter cost before spending remaining capacity on near upgrades. If a near model cannot fit, its medium exterior stays selected instead of disappearing into a native block. Offline near costs prevent expensive build-then-reject cycles; measured runtime costs supersede estimates. Pending replacements retain the old exterior until ready. The existing vertex/draw/model caps are unchanged.

Remote/NPC civilian bodies use the existing skeleton and material groups at both levels, preserving skin, shirt, trousers and shoes, individual outfits and sit/sleep/dance/shower poses. Male: **13,194 → 5,670 triangles**; female: **13,420 → 4,938**. Full-body geometry returns within 25 m desktop / 18 m mobile; reduced geometry starts beyond 35/28 m. The owned player's body remains full detail. Shared reduced geometry is cached for only the two body types and survives individual actor disposal. No browser-time simplification or replacement game engine is introduced.

## Benchmark prepared for physical devices

Open `?benchmark=1&graphicsStats=1` for a manual 60-second local-only capture, JSON export and visible JSON report. Startup and settled intervals, CPU submission, long tasks where available, peak object counts and final LOD/preparation statistics are kept separate. Interrupted/hidden/rotated runs cannot pass a comparison, and device classification defaults to unverified desktop/browser. A cold run reports the wait to its first rendered frame separately. See [physical-device procedure](mobile-performance-benchmark.md). The user chose to prepare this test for later; actual Android/iPhone results are still pending.
