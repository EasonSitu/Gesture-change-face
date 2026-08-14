import test from "node:test";
import assert from "node:assert/strict";
import {
  cartoonizeImageData,
  computeLumaEdge,
  quantizeChannel,
} from "../src/cartoon-effect.mjs";

test("quantizes a color channel into a fixed number of levels", () => {
  assert.equal(quantizeChannel(0, 4), 0);
  assert.equal(quantizeChannel(127, 4), 85);
  assert.equal(quantizeChannel(255, 4), 255);
});

test("detects a strong luminance edge between neighboring pixels", () => {
  const width = 5;
  const height = 3;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = x < 2 ? 0 : 255;
      const index = (y * width + x) * 4;
      pixels[index] = value;
      pixels[index + 1] = value;
      pixels[index + 2] = value;
      pixels[index + 3] = 255;
    }
  }

  assert.ok(computeLumaEdge(pixels, width, height, 2, 1) > 180);
});

test("cartoonizes colors, inks edges, and preserves alpha", () => {
  const width = 5;
  const height = 3;
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const value = x < 2 ? 30 : 230;
      const index = (y * width + x) * 4;
      pixels[index] = value;
      pixels[index + 1] = value + 5;
      pixels[index + 2] = value + 10;
      pixels[index + 3] = 173;
    }
  }

  const result = cartoonizeImageData(pixels, width, height, {
    levels: 4,
    edgeThreshold: 20,
    edgeSoftness: 20,
  });

  assert.equal(result.length, pixels.length);
  assert.equal(result[3], 173);
  assert.ok(result[2] !== pixels[2], "flat color should be quantized");
  const edgeIndex = (1 * width + 2) * 4;
  const flatIndex = (1 * width + 3) * 4;
  assert.ok(result[edgeIndex] < result[flatIndex], "edge pixel should receive a dark outline");
});
