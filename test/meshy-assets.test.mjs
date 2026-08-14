import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetNames = [
  "peking-opera-mask.glb",
  "nuo-opera-mask.glb",
  "yellow-opera-mask.glb",
];

function readGlbJson(filePath) {
  const data = fs.readFileSync(filePath);
  assert.equal(data.toString("ascii", 0, 4), "glTF");
  assert.equal(data.readUInt32LE(4), 2);
  assert.equal(data.readUInt32LE(8), data.length);

  const jsonChunkLength = data.readUInt32LE(12);
  const jsonChunkType = data.readUInt32LE(16);
  assert.equal(jsonChunkType, 0x4e4f534a);
  return JSON.parse(data.toString("utf8", 20, 20 + jsonChunkLength));
}

test("bundles three valid, Three.js-v97-compatible Meshy GLB assets", () => {
  for (const assetName of assetNames) {
    const filePath = path.join(projectRoot, "assets", "meshy", assetName);
    assert.equal(fs.existsSync(filePath), true, `${assetName} is missing`);
    assert.ok(fs.statSync(filePath).size > 1000, `${assetName} is empty`);
    const document = readGlbJson(filePath);
    assert.equal(document.asset.version, "2.0");
    assert.ok(document.meshes?.length > 0, `${assetName} has no meshes`);
    for (const texture of document.textures || []) {
      assert.equal(Number.isInteger(texture.source), true, `${assetName} has an unresolved texture source`);
    }
  }
});
