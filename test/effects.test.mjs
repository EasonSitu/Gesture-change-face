import test from "node:test";
import assert from "node:assert/strict";
import {
  effectCategories,
  effectDefinitions,
  effectIds,
  getEffectCategory,
  getEffectIdsForCategories,
} from "../src/effects.mjs";

test("groups the effects into three product-facing categories", () => {
  assert.deepEqual(effectCategories.map(({ id, label }) => ({ id, label })), [
    { id: "basic", label: "基础效果" },
    { id: "funMask", label: "趣味面具" },
    { id: "faceChange", label: "面具变脸" },
  ]);
  assert.equal(effectDefinitions.length, 14);
  assert.deepEqual(effectIds.slice(0, 7), ["pixelate", "blur", "invert", "noir", "glitch", "cartoon", "sketch"]);
  assert.equal(getEffectCategory("cartoon"), "basic");
  assert.equal(getEffectCategory("sketch"), "basic");
});

test("returns only the effects from the enabled pinch categories", () => {
  assert.deepEqual(getEffectIdsForCategories(["faceChange"]), [
    "pekingOpera",
    "nuoOpera",
    "yellowOpera",
  ]);
  assert.deepEqual(getEffectIdsForCategories(["basic", "funMask"]), [
    "pixelate",
    "blur",
    "invert",
    "noir",
    "glitch",
    "cartoon",
    "sketch",
    "werewolf",
    "tiger",
    "dog",
    "anonymous",
  ]);
  assert.equal(getEffectCategory("nuoOpera"), "faceChange");
});
