// MapLibre owns the canvas and drawing-buffer resolution. Three remembers the
// viewport from construction, then restores it after shadow/transmission passes.
// Refresh that remembered viewport before rendering, including after a resize or
// a gameplay pixel-ratio change. resetState alone only resets GL's viewport.
export function syncSharedViewport(renderer, gl) {
  renderer.resetState();
  const ratio = renderer.getPixelRatio();
  renderer.setViewport(0, 0, gl.drawingBufferWidth / ratio, gl.drawingBufferHeight / ratio);
  renderer.setScissorTest(false);
}
