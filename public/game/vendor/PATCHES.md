# MapLibre local patch

The vendored MapLibre GL JS 5.6.0 retains its original BSD licence. On 19 October
2026, the retained-tile child handling from upstream
[PR #6388](https://github.com/maplibre/maplibre-gl-js/pull/6388/files) was backported.
The engine can receive one overscaled child while its covering zoom is below the
source maximum. It must check the child count before reading four children.

This corrects the `undefined.key` exception reproduced when travelling between
Mary Dei Amoah Road and Independence Square. Only the two child coverage checks
in `_updateRetainedTiles` and the header note differ from the existing bundle.
Remove this backport when updating to a release containing that upstream fix.

`tests/maplibre-retained-tiles.test.mjs` executes the method extracted from the
actual shipped bundle, covering single overscaled children, four children and
parent fallback. No exception suppression or tile-request disabling is used.
