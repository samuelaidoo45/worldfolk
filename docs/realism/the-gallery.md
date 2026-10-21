# The Gallery apartments — ACC-258

Implemented locally, 13 October 2026. Status: **In progress**.

## Active references — reviewed 15 October 2026

Use the [current reference register](current-reference-images.md) and its image-specific dates. Previous source lists are retained in [the historical archive](historical-references.md).

- [The Gallery current operator gallery](https://www.galleryghana.com/) — **capture date unknown**. Current maintained galleries for roof pool, garden, gym, cafe and terrace; image capture dates are not published.
- [The Gallery one-bedroom operator photographs](https://www.galleryghana.com/gallery-1-bed-apartment) — **capture date unknown**. Use the actual apartment gallery for furniture; representative units differ from one another.

Use the live operator’s actual room and amenity galleries. The 2022 developer-CDN photographs are historical supplements. Dated current capture, apartment-specific furniture and entrance/roof access still need verification.

## Playable implementation

- Search **The Gallery Apartments** on City home to arrive outside the courtyard. Follow the central path to the glowing apartment entrance.
- Three white balcony residences, recessed glazing/timber screens, name panel, entrance canopy, planted garden, bench and rooftop pool details.
- Courtyard photo and sitting interactions; bounded NPC visitors stay in the clear central corridor.
- Furnished one-bedroom visit with paired grey sofas and teal accents, bedroom, bathroom, kitchen, wardrobe and balcony. Sleep, sit, shower and cook continue until explicitly stopped. Clothes use the existing wardrobe menu.
- The entrance uses the existing authenticated, server-distance-checked visit flow. Leaving returns to the same courtyard position.
- Geometry is original code-authored mesh work. Reference photographs are linked, not packaged as textures.

## Verification

- 21 focused checks pass across Gallery, Signature, Villaggio, apartments and Accra Mall, including shell replacement, safe arrival/entrance, collision retreat, furniture/exit reachability, persistent activities, 240 seconds of clear visitor routes and bounded draw groups.
- Browser: local authenticated City-home search → outdoor arrival → walk to door → enter furnished unit → return to courtyard. Fixture review verifies seating, sleeping and shower start/stop; no browser console errors.
- Production build passed.
- [Exterior review](../../review-artifacts/gallery-exterior.png) · [Courtyard review](../../review-artifacts/gallery-courtyard.png) · [Apartment review](../../review-artifacts/gallery-apartment.png).

## Remaining accuracy and gameplay work

This is a recognizable photo-informed reconstruction, not a surveyed or photogrammetric replica. Upper-floor divisions, landscape arrangement, window spacing and interior dimensions are estimates. The representative apartment is an original playable plan, not an occupied resident's exact home. The reference's entrance stairs, roof lift/stair access, cafe, gym and parking interiors remain unimplemented. The roof pool is visible scenery; roof access/swimming is not enabled. Ownership, shared apartment presence, needs recovery from visit activities and mobile performance acceptance remain open. Deployed to worldfolk.world on 13 October 2026 (Cloudflare version `27c76abd-c270-422d-91a1-6b1d547d08b1`).
