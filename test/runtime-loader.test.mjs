import test from "node:test";
import assert from "node:assert/strict";
import { getCharacterRuntimeScriptUrls } from "../src/runtime-loader.mjs";

test("keeps character runtime scripts out of the initial page load", () => {
  assert.deepEqual(getCharacterRuntimeScriptUrls(), [
    "https://cdn.jsdelivr.net/gh/jeeliz/jeelizFaceFilter@master/libs/three/v97/three.min.js",
    "https://cdn.jsdelivr.net/npm/three@0.97.0/examples/js/loaders/GLTFLoader.js",
    "https://cdn.jsdelivr.net/gh/jeeliz/jeelizFaceFilter@master/dist/jeelizFaceFilter.js",
    "https://cdn.jsdelivr.net/gh/jeeliz/jeelizFaceFilter@master/helpers/JeelizThreeHelper.js",
  ]);
});
