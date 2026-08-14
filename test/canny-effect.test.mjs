import test from "node:test";
import assert from "node:assert/strict";
import { runCanny } from "../src/canny-effect.mjs";

test("runs the documented Canny pipeline and releases temporary matrices", () => {
  const calls = [];
  const deleted = [];
  class FakeMat {
    constructor() {
      this.id = `mat-${deleted.length + calls.length}`;
    }

    delete() {
      deleted.push(this);
    }
  }

  const cv = {
    Mat: FakeMat,
    Size: class Size {
      constructor(width, height) {
        this.width = width;
        this.height = height;
      }
    },
    COLOR_RGBA2GRAY: "rgba-to-gray",
    COLOR_GRAY2RGBA: "gray-to-rgba",
    BORDER_DEFAULT: "border-default",
    imread(canvas) {
      calls.push(["imread", canvas]);
      return new FakeMat();
    },
    cvtColor(source, target, code) {
      calls.push(["cvtColor", source, target, code]);
    },
    GaussianBlur(source, target, size, sigmaX, sigmaY, borderType) {
      calls.push(["GaussianBlur", source, target, size, sigmaX, sigmaY, borderType]);
    },
    Canny(source, target, lowThreshold, highThreshold, apertureSize, l2Gradient) {
      calls.push(["Canny", source, target, lowThreshold, highThreshold, apertureSize, l2Gradient]);
    },
    imshow(canvas, image) {
      calls.push(["imshow", canvas, image]);
    },
  };
  const inputCanvas = { id: "input" };
  const outputCanvas = { id: "output" };

  runCanny(cv, inputCanvas, outputCanvas);

  assert.equal(calls[0][0], "imread");
  assert.deepEqual(calls[1][0], "cvtColor");
  assert.equal(calls[1][3], "rgba-to-gray");
  assert.equal(calls[2][0], "GaussianBlur");
  assert.deepEqual([calls[2][3].width, calls[2][3].height], [5, 5]);
  assert.deepEqual(calls[3].slice(0, 5), ["Canny", calls[2][2], calls[3][2], 60, 120]);
  assert.deepEqual(calls[4].slice(0, 4), ["cvtColor", calls[3][2], calls[4][2], "gray-to-rgba"]);
  assert.equal(calls[5][0], "imshow");
  assert.equal(calls[5][1], outputCanvas);
  assert.equal(deleted.length, 5);
});
