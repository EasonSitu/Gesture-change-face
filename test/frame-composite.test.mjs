import test from "node:test";
import assert from "node:assert/strict";
import { drawMirroredClippedImage } from "../src/frame-composite.mjs";

function createContextSpy() {
  const calls = [];
  const ctx = {
    save: () => calls.push(["save"]),
    restore: () => calls.push(["restore"]),
    beginPath: () => calls.push(["beginPath"]),
    moveTo: (...args) => calls.push(["moveTo", ...args]),
    lineTo: (...args) => calls.push(["lineTo", ...args]),
    closePath: () => calls.push(["closePath"]),
    clip: (...args) => calls.push(["clip", ...args]),
    translate: (...args) => calls.push(["translate", ...args]),
    scale: (...args) => calls.push(["scale", ...args]),
    drawImage: (...args) => calls.push(["drawImage", ...args]),
  };
  return { ctx, calls };
}

test("draws the character canvas mirrored and clipped to the hand frame", () => {
  const { ctx, calls } = createContextSpy();
  const source = { id: "face-canvas" };
  const quad = [
    { x: 10, y: 20 },
    { x: 110, y: 20 },
    { x: 110, y: 220 },
    { x: 10, y: 220 },
  ];

  assert.equal(drawMirroredClippedImage(ctx, source, quad, 320, 240, "evenodd"), true);
  assert.deepEqual(calls, [
    ["save"],
    ["beginPath"],
    ["moveTo", 10, 20],
    ["lineTo", 110, 20],
    ["lineTo", 110, 220],
    ["lineTo", 10, 220],
    ["closePath"],
    ["clip", "evenodd"],
    ["translate", 320, 0],
    ["scale", -1, 1],
    ["drawImage", source, 0, 0, 320, 240],
    ["restore"],
  ]);
});

test("does not draw when there is no valid frame", () => {
  const { ctx, calls } = createContextSpy();
  assert.equal(drawMirroredClippedImage(ctx, { id: "face-canvas" }, null, 320, 240), false);
  assert.deepEqual(calls, []);
});
