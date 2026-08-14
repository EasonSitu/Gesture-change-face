import test from "node:test";
import assert from "node:assert/strict";
import {
  BASE_IMAGE_FILTER,
  CHARACTER_IMAGE_FILTER,
  DEMO_IMAGE_FILTER,
  NUO_OPERA_IMAGE_FILTER,
  composeCanvasFilters,
  getCharacterImageFilter,
  getSourceImageFilter,
} from "../src/brightness.mjs";

test("defines stronger brightness compensation for camera, demo, and character layers", () => {
  assert.equal(BASE_IMAGE_FILTER, "brightness(1.42) contrast(0.94) saturate(1.1)");
  assert.equal(DEMO_IMAGE_FILTER, "brightness(1.22) contrast(1.02) saturate(1.08)");
  assert.equal(CHARACTER_IMAGE_FILTER, "brightness(1.55) contrast(0.95) saturate(1.12)");
  assert.equal(NUO_OPERA_IMAGE_FILTER, "brightness(2.35) contrast(0.96) saturate(1.22)");
  assert.equal(getCharacterImageFilter("dog"), CHARACTER_IMAGE_FILTER);
  assert.equal(getCharacterImageFilter("nuoOpera"), NUO_OPERA_IMAGE_FILTER);
});

test("uses a dedicated source profile for camera and demo modes", () => {
  assert.equal(getSourceImageFilter(false), BASE_IMAGE_FILTER);
  assert.equal(getSourceImageFilter(true), DEMO_IMAGE_FILTER);
});

test("composes brightness compensation without dropping an active canvas effect", () => {
  assert.equal(
    composeCanvasFilters("none", BASE_IMAGE_FILTER),
    "brightness(1.42) contrast(0.94) saturate(1.1)",
  );
  assert.equal(
    composeCanvasFilters("blur(16px) saturate(1.15)", BASE_IMAGE_FILTER),
    "brightness(1.42) contrast(0.94) saturate(1.1) blur(16px) saturate(1.15)",
  );
});
