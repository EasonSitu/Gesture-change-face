import test from "node:test";
import assert from "node:assert/strict";
import { characterFilterIds, getCharacterFilterLabel, isCharacterFilter } from "../src/character-filters.mjs";

test("registers the four community character filters in cycling order", () => {
  assert.deepEqual(characterFilterIds, ["werewolf", "tiger", "dog", "anonymous"]);
  assert.deepEqual(characterFilterIds.map(getCharacterFilterLabel), ["Werewolf", "Tiger", "Dog", "Anonymous"]);
});

test("recognizes only registered character filter IDs", () => {
  assert.equal(isCharacterFilter("werewolf"), true);
  assert.equal(isCharacterFilter("unknown-filter"), false);
  assert.equal(isCharacterFilter("pixelate"), false);
});
