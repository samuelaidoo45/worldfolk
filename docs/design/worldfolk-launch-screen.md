# Worldfolk launch experience

Updated 15 October 2026.

## Flow

1. The HTML paints a full-screen Accra loading/title surface before the game module runs.
2. Four real startup tasks are tracked: artwork, interface, server/profile response, map/3D initialization. The indicator counts completed tasks, not download bytes. No artificial wait or simulated percentage.
3. When ready, **Press Start** accepts a tap, click or Enter. Background controls are inert until this step finishes. Sound unlock uses that gesture and respects the existing sound preference.
4. The main menu uses a vertical console-style list: Enter world, Continue story for established profiles, World map, Friends & messages, How to play, Settings and Advertise. A compact player badge and actual online count sit at the top right. The next destination can be changed through the world map.
5. World map opens the existing searchable city catalogue. Selection previews a destination; entering is explicit. Registration remains required to enter gameplay.
6. City home returns to the menu without replaying the boot sequence. Refreshing starts the sequence again.

A failed asset or startup delay exposes Retry loading. Reduced motion disables the art fade. Narrow screens scroll vertically and keep the controls within the viewport.

## Visual direction

Original Worldfolk identity: indigo, warm gold, bold Outfit typography, cinematic Accra key art, compact console-style navigation. Akofena's public startup at https://akofena.reluspatial.com/ informed the loading → title → menu sequence. Its assets, branding and code were not copied.

The artwork is explicitly labelled as key art, not a gameplay screenshot. It does not change in-game building models or rendering fidelity.

## Asset provenance

- Tool/mode: built-in image generation, new image, opaque background.
- Asset: `public/game/assets/launch/accra-key-art.jpg` (1672 × 941, approximately 443 KiB).
- Original generated PNG converted to JPEG quality 84 for delivery; no remote art dependencies.
- Prompt:

> Use case: stylized-concept. Asset type: wide 16:9 original key art background for Worldfolk, a multiplayer life game set in Accra, Ghana. Premium cinematic illustrated game cover, polished realistic painterly 3D detail, warm sunset, atmospheric indigo shadows with amber sunlight. Main subjects on the RIGHT half: two stylish Ghanaian young adults in casual streetwear, woman with natural braided hair and man with short textured hair, standing beside a weathered cream-and-orange Accra taxi; a trotro minibus behind, believable Accra street, distant recognizable Black Star Gate with black star at top, coastal horizon, palms, varied concrete buildings and activity. Composition leaves left 45 percent quiet dark indigo street/shadow negative space for UI text. Camera at human height, broad city vista, confident inviting mood, strong foreground depth. No weapons, no logos, no writing, no text, no UI, no watermarks. Original Worldfolk promotional concept art; do not copy any GTA or Fortnite characters or branding. Detailed cinematic lighting, coherent geography-inspired montage rather than claiming a real photo. Output a landscape image.

## Verification

- Production build passes.
- Browser: actual loading task count reaches 4, title appears, Enter opens menu.
- Existing profile: select Mall without teleporting; search Spanner from full catalogue; enter gameplay; return to city menu.
- Signed out: choose Labadi, Enter world opens required registration; selection remains Labadi.
- Responsive inspection: desktop 1280 × 720, phone 390 × 844, landscape 844 × 390, tablet 768 × 1024. No horizontal overflow in measured phone/tablet menus; vertical scrolling on shorter viewports is intentional.
- Search titles and profile handles use textContent; generated menu markup contains only developer-defined static strings. Existing authentication and server authorization are retained.

Screenshots: `review-artifacts/worldfolk-title-screen.png`, `review-artifacts/worldfolk-launch-desktop.png`, `review-artifacts/worldfolk-launch-mobile.png`.

## Earlier release state

Deployed to https://worldfolk.world/game/ on 15 October 2026. Cloudflare Worker version: `f5027df6-db0c-4ef3-84a0-ecc9dd816aa5`. Verified the live startup reaches Press Start and Enter opens the Play menu with destination selection. Live capture: `review-artifacts/worldfolk-live-launch.png`.

## 15 October 2026 — Vertical game menu redesign

Replaced the website-style header, hero copy and destination card grid with a game menu inspired by the supplied Akofena screenshot. Worldfolk keeps its original Accra artwork and identity: condensed gold wordmark, a left-aligned vertical menu, gold selection rail, contextual hint, player badge and a small next-destination control. No Akofena artwork or branding was copied.

- Up/down, Home/End and Enter navigate the list; ordinary Tab navigation remains available. Pointer selection and keyboard focus stay aligned.
- World map retains full catalogue search and destination preview. Selection carries back to the main menu without moving the character.
- Friends uses the existing contacts/messages panel; account registration is required for signed-out players. Help uses the existing gameplay instructions. Settings offers the existing persistent sound preference and browser fullscreen, with an unavailable-browser message.
- A saved dead/arrested character gets Restart life as its primary action. The gameplay death overlay no longer covers the main menu. The restart action restores the character at home before entering gameplay.
- Portrait phones keep a single vertical list. Short landscape screens place the destination control at bottom right so the full menu remains visible. Safe areas, reduced motion and text labels are retained.

Verification: production build; six existing catalogue/logo/audio checks; browser checks for title → menu, arrow selection, settings, friends, map selection and return, help, and saved-character restart → home → menu. Inspected 390 × 844 portrait and 844 × 390 landscape with no horizontal overflow. The landscape list fits the viewport. Desktop 1280 × 720 and tablet 768 × 1024 also fit their viewport without horizontal overflow. During the earlier rapid resize/restart review, MapLibre logged retained-tile errors; later menu interactions continued to work. This menu pass does not certify the map engine’s resize handling.

Screenshots: `review-artifacts/worldfolk-console-menu-desktop.png`, `review-artifacts/worldfolk-console-menu-mobile.png`, `review-artifacts/worldfolk-console-menu-landscape.png`.

This redesign is a local update; the earlier deployment version above predates it.
