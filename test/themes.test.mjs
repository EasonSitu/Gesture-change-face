import test from "node:test";
import assert from "node:assert/strict";
import { getThemeForCategory } from "../src/themes.mjs";

test("maps product effect categories to stable visual themes", () => {
  assert.equal(getThemeForCategory("basic"), "base");
  assert.equal(getThemeForCategory("funMask"), "fun-mask");
  assert.equal(getThemeForCategory("faceChange"), "face-change");
  assert.equal(getThemeForCategory("unknown"), "base");
});
