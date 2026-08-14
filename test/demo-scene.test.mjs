import test from "node:test";
import assert from "node:assert/strict";
import { getDemoPersonLayout } from "../src/demo-scene.mjs";

test("keeps the synthetic demo person inside the two-hand frame", () => {
  const layout = getDemoPersonLayout(960, 540);
  const { face } = layout;
  assert.ok(face.x - face.rx > 960 * 0.25);
  assert.ok(face.x + face.rx < 960 * 0.75);
  assert.ok(face.y - face.ry > 540 * 0.12);
  assert.ok(face.y + face.ry < 540 * 0.78);
  assert.ok(layout.shoulders.top < 540 * 0.82);
});

