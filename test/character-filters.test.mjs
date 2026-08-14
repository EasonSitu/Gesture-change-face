import test from "node:test";
import assert from "node:assert/strict";
import {
  characterFilterIds,
  getCharacterFilterAsset,
  getCharacterFilterLabel,
  getCharacterFilterSource,
  isCharacterFilter,
  isMeshyCharacterFilter,
} from "../src/character-filters.mjs";

test("registers the community and local Meshy character filters in cycling order", () => {
  assert.deepEqual(characterFilterIds, [
    "werewolf",
    "tiger",
    "dog",
    "anonymous",
    "pekingOpera",
    "nuoOpera",
    "yellowOpera",
  ]);
  assert.deepEqual(characterFilterIds.map(getCharacterFilterLabel), [
    "Werewolf",
    "Tiger",
    "Dog",
    "Anonymous",
    "Peking Opera",
    "Nuo Opera",
    "Yellow Opera",
  ]);
});

test("recognizes only registered character filter IDs", () => {
  assert.equal(isCharacterFilter("werewolf"), true);
  assert.equal(isCharacterFilter("unknown-filter"), false);
  assert.equal(isCharacterFilter("pixelate"), false);
});

test("maps Meshy filters to local GLB assets and keeps their source pages", () => {
  assert.equal(isMeshyCharacterFilter("pekingOpera"), true);
  assert.equal(isMeshyCharacterFilter("werewolf"), false);
  assert.equal(getCharacterFilterAsset("pekingOpera"), "assets/meshy/peking-opera-mask.glb");
  assert.equal(getCharacterFilterAsset("nuoOpera"), "assets/meshy/nuo-opera-mask.glb");
  assert.equal(getCharacterFilterAsset("yellowOpera"), "assets/meshy/yellow-opera-mask.glb");
  assert.equal(
    getCharacterFilterSource("pekingOpera"),
    "https://www.meshy.ai/zh/3d-models/Peking-Opera-Mask-Illustration-019513fc-b2a8-720c-bc4c-c4b5285146be",
  );
});
