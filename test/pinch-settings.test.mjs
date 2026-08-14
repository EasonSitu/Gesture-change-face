import test from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PINCH_SETTINGS,
  getEnabledPinchCategories,
  normalizePinchSettings,
} from "../src/pinch-settings.mjs";

test("defaults the pinch switch and all three categories to enabled", () => {
  assert.deepEqual(normalizePinchSettings(null), DEFAULT_PINCH_SETTINGS);
});

test("keeps category preferences while filling missing values safely", () => {
  assert.deepEqual(
    normalizePinchSettings({ enabled: false, categories: { basic: false } }),
    {
      enabled: false,
      categories: { basic: false, funMask: true, faceChange: true },
    },
  );
  assert.deepEqual(
    getEnabledPinchCategories({
      enabled: true,
      categories: { basic: false, funMask: true, faceChange: false },
    }),
    ["funMask"],
  );
});
