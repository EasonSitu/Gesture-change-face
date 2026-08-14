import test from "node:test";
import assert from "node:assert/strict";
import {
  getCharacterFilterRotationY,
} from "../src/character-filters.mjs";
import {
  getMeshyTextureTransform,
} from "../src/character-renderer.mjs";

test("keeps all current Meshy opera masks facing the camera", () => {
  assert.equal(getCharacterFilterRotationY("pekingOpera"), 0);
  assert.equal(getCharacterFilterRotationY("nuoOpera"), 0);
  assert.equal(getCharacterFilterRotationY("yellowOpera"), 0);
});

test("reads KHR texture transforms from glTF texture info", () => {
  const transform = { offset: [0.1, 0.2], scale: [16, 16] };
  assert.deepEqual(
    getMeshyTextureTransform({ extensions: { KHR_texture_transform: transform } }, []),
    transform,
  );
});

