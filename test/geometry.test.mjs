import test from "node:test";
import assert from "node:assert/strict";
import { computeQuad, isSelfIntersectingQuad, polygonArea } from "../src/geometry.mjs";

const hand = ({ wrist, middle, thumb, index }) => {
  const landmarks = Array.from({ length: 21 }, () => ({ x: wrist.x, y: wrist.y }));
  landmarks[0] = wrist;
  landmarks[4] = thumb;
  landmarks[8] = index;
  landmarks[9] = middle;
  return landmarks;
};

test("computeQuad mirrors coordinates and keeps anatomical corner order", () => {
  const leftOnScreen = hand({
    wrist: { x: 0.25, y: 0.55 }, middle: { x: 0.25, y: 0.45 },
    index: { x: 0.25, y: 0.2 }, thumb: { x: 0.2, y: 0.55 },
  });
  const rightOnScreen = hand({
    wrist: { x: 0.75, y: 0.55 }, middle: { x: 0.75, y: 0.45 },
    index: { x: 0.75, y: 0.2 }, thumb: { x: 0.8, y: 0.55 },
  });

  const quad = computeQuad([leftOnScreen, rightOnScreen], 1000, 600);

  assert.deepEqual(quad.map(({ x, y }) => ({ x: Math.round(x), y: Math.round(y) })), [
    { x: 250, y: 120 }, { x: 750, y: 120 },
    { x: 800, y: 330 }, { x: 200, y: 330 },
  ]);
});

test("computeQuad preserves an irregular quadrilateral in anatomical order", () => {
  const leftOnScreen = hand({
    wrist: { x: 0.7, y: 0.55 }, middle: { x: 0.7, y: 0.45 },
    index: { x: 0.75, y: 0.16 }, thumb: { x: 0.85, y: 0.65 },
  });
  const rightOnScreen = hand({
    wrist: { x: 0.3, y: 0.55 }, middle: { x: 0.3, y: 0.45 },
    index: { x: 0.2, y: 0.25 }, thumb: { x: 0.35, y: 0.7 },
  });

  const quad = computeQuad([leftOnScreen, rightOnScreen], 1000, 600);

  assert.deepEqual(quad.map(({ x, y }) => ({ x: Math.round(x), y: Math.round(y) })), [
    { x: 250, y: 96 }, { x: 800, y: 150 },
    { x: 650, y: 420 }, { x: 150, y: 390 },
  ]);
});

test("recognizes the flipped fixed-order quad as two crossed triangles", () => {
  const crossed = [
    { x: 100, y: 100 }, { x: 400, y: 400 },
    { x: 100, y: 400 }, { x: 400, y: 100 },
  ];
  const irregular = [
    { x: 100, y: 100 }, { x: 420, y: 140 },
    { x: 360, y: 400 }, { x: 80, y: 350 },
  ];

  assert.equal(isSelfIntersectingQuad(crossed), true);
  assert.equal(isSelfIntersectingQuad(irregular), false);
});

test("keeps a flipped hand arrangement instead of replacing it with a convex hull", () => {
  const leftOnScreen = hand({
    wrist: { x: 0.75, y: 0.55 }, middle: { x: 0.75, y: 0.45 },
    index: { x: 0.9, y: 1 / 6 }, thumb: { x: 0.6, y: 1 / 6 },
  });
  const rightOnScreen = hand({
    wrist: { x: 0.25, y: 0.55 }, middle: { x: 0.25, y: 0.45 },
    index: { x: 0.6, y: 2 / 3 }, thumb: { x: 0.9, y: 2 / 3 },
  });

  const quad = computeQuad([leftOnScreen, rightOnScreen], 1000, 600);

  assert.equal(isSelfIntersectingQuad(quad), true);
  assert.deepEqual(quad.map(({ x, y }) => ({ x: Math.round(x), y: Math.round(y) })), [
    { x: 100, y: 100 }, { x: 400, y: 400 },
    { x: 100, y: 400 }, { x: 400, y: 100 },
  ]);
});

test("computeQuad rejects a hand whose thumb and index are closed", () => {
  const closed = hand({
    wrist: { x: 0.25, y: 0.55 }, middle: { x: 0.25, y: 0.45 },
    index: { x: 0.25, y: 0.2 }, thumb: { x: 0.26, y: 0.2 },
  });
  const open = hand({
    wrist: { x: 0.75, y: 0.55 }, middle: { x: 0.75, y: 0.45 },
    index: { x: 0.75, y: 0.2 }, thumb: { x: 0.85, y: 0.55 },
  });

  assert.equal(computeQuad([closed, open], 1000, 600), null);
});

test("computeQuad rejects a nearly zero-area frame", () => {
  const first = hand({
    wrist: { x: 0.49, y: 0.5 }, middle: { x: 0.49, y: 0.45 },
    index: { x: 0.49, y: 0.48 }, thumb: { x: 0.45, y: 0.5 },
  });
  const second = hand({
    wrist: { x: 0.51, y: 0.5 }, middle: { x: 0.51, y: 0.45 },
    index: { x: 0.51, y: 0.48 }, thumb: { x: 0.55, y: 0.5 },
  });

  assert.equal(computeQuad([first, second], 1000, 600), null);
});

test("polygonArea is independent of point winding", () => {
  const clockwise = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
  const counterClockwise = [...clockwise].reverse();
  assert.equal(polygonArea(clockwise), 100);
  assert.equal(polygonArea(counterClockwise), 100);
});
