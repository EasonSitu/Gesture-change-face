import test from "node:test";
import assert from "node:assert/strict";
import { getStageAspectRatio } from "../src/layout.mjs";

test("keeps the stage aspect ratio synchronized with the camera source", () => {
  assert.equal(getStageAspectRatio(1280, 720), "1280 / 720");
  assert.equal(getStageAspectRatio(720, 1280), "720 / 1280");
  assert.equal(getStageAspectRatio(0, 720), "16 / 9");
});
