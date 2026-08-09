import test from "node:test";
import assert from "node:assert/strict";
import { bothHandsPinching, isPinching, nextEffect } from "../src/gestures.mjs";

const hand = ({ wrist, middle, thumb, index }) => {
  const landmarks = Array.from({ length: 21 }, () => ({ x: wrist.x, y: wrist.y }));
  landmarks[0] = wrist;
  landmarks[4] = thumb;
  landmarks[8] = index;
  landmarks[9] = middle;
  return landmarks;
};

test("isPinching detects thumb and index tips close relative to hand size", () => {
  const pinched = hand({
    wrist: { x: 0.3, y: 0.6 }, middle: { x: 0.3, y: 0.5 },
    thumb: { x: 0.42, y: 0.42 }, index: { x: 0.44, y: 0.43 },
  });
  const open = hand({
    wrist: { x: 0.3, y: 0.6 }, middle: { x: 0.3, y: 0.5 },
    thumb: { x: 0.18, y: 0.6 }, index: { x: 0.3, y: 0.2 },
  });

  assert.equal(isPinching(pinched), true);
  assert.equal(isPinching(open), false);
});

test("bothHandsPinching requires two hands to pinch at once", () => {
  const pinched = ({ offset = 0 } = {}) => hand({
    wrist: { x: 0.3 + offset, y: 0.6 }, middle: { x: 0.3 + offset, y: 0.5 },
    thumb: { x: 0.42 + offset, y: 0.42 }, index: { x: 0.44 + offset, y: 0.43 },
  });
  const open = hand({
    wrist: { x: 0.7, y: 0.6 }, middle: { x: 0.7, y: 0.5 },
    thumb: { x: 0.82, y: 0.6 }, index: { x: 0.7, y: 0.2 },
  });

  assert.equal(bothHandsPinching([pinched(), pinched({ offset: 0.4 })]), true);
  assert.equal(bothHandsPinching([pinched(), open]), false);
  assert.equal(bothHandsPinching([pinched()]), false);
});

test("nextEffect advances and wraps around the available effects", () => {
  const effects = ["pixelate", "blur", "glitch"];
  assert.equal(nextEffect(effects, "pixelate"), "blur");
  assert.equal(nextEffect(effects, "glitch"), "pixelate");
  assert.equal(nextEffect(effects, "missing"), "pixelate");
});
