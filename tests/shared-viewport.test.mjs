import test from 'node:test';
import assert from 'node:assert/strict';
import {syncSharedViewport} from '../public/game/shared-viewport.js';

// Three's offscreen passes restore its cached viewport. resetState restores the
// GL viewport but leaves that cache untouched, so the two must agree each frame.
function sharedRenderer(gl, ratio = 1) {
  let cached = [0, 0, 1086, 1860], viewport = [...cached], scissor = true;
  return {
    getPixelRatio: () => ratio,
    resetState() { viewport = [0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight]; },
    setViewport(x, y, w, h) { cached = [x, y, w, h].map(v => Math.floor(v * ratio)); viewport = [...cached]; },
    setScissorTest(value) { scissor = value; },
    setSize() { assert.fail('The map owns drawing-buffer resizing'); },
    setPixelRatio() { assert.fail('Do not resize the canvas during a render'); },
    renderShadow() { viewport = [0, 0, 512, 512]; viewport = [...cached]; },
    get viewport() { return viewport; },
    get scissor() { return scissor; }
  };
}

test('shadow refresh and ordinary frames use the same viewport after gameplay lowers resolution', () => {
  const gl = {drawingBufferWidth: 543, drawingBufferHeight: 930}, renderer = sharedRenderer(gl);
  // Reproduce the previous fault: every shadow frame restores the old size.
  renderer.resetState();
  const ordinary = renderer.viewport;
  renderer.renderShadow();
  assert.notDeepEqual(renderer.viewport, ordinary);
  for (let frame = 0; frame < 60; frame++) {
    syncSharedViewport(renderer, gl);
    if (frame % 8 === 0) renderer.renderShadow();
    assert.deepEqual(renderer.viewport, [0, 0, 543, 930]);
    assert.equal(renderer.scissor, false);
  }
});

test('orientation, pixel ratio and canvas changes keep offscreen restoration in buffer pixels', () => {
  for (const ratio of [1, 1.25, 2]) {
    const gl = {drawingBufferWidth: 543, drawingBufferHeight: 930}, renderer = sharedRenderer(gl, ratio);
    for (const [width, height] of [[543,930], [930,543], [1728,992], [1086,1860]]) {
      gl.drawingBufferWidth = width; gl.drawingBufferHeight = height;
      syncSharedViewport(renderer, gl);
      renderer.renderShadow();
      assert.deepEqual(renderer.viewport, [0, 0, width, height]);
    }
  }
});
