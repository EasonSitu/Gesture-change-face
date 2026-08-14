import test from "node:test";
import assert from "node:assert/strict";
import {
  OPENCV_FALLBACK_URLS,
  OPENCV_SCRIPT_URL,
  isOpenCvReady,
  loadOpenCv,
} from "../src/opencv-loader.mjs";

test("uses the official OpenCV.js runtime URL and recognizes a ready runtime", async () => {
  assert.equal(OPENCV_SCRIPT_URL, "./assets/opencv.js");
  assert.equal(OPENCV_FALLBACK_URLS.length, 4);
  assert.equal(OPENCV_FALLBACK_URLS[0], "https://docs.opencv.org/4.13.0/opencv.js");
  const globalRef = {
    cv: {
      Mat: class Mat {},
      Canny() {},
    },
  };

  assert.equal(isOpenCvReady(globalRef), true);
  assert.equal(await loadOpenCv({ documentRef: null, globalRef }), globalRef.cv);
});

test("injects OpenCV.js once when the runtime is not ready", async () => {
  const globalRef = {};
  let appendedScript;
  let createCount = 0;
  const documentRef = {
    createElement(tagName) {
      assert.equal(tagName, "script");
      createCount += 1;
      return {};
    },
    head: {
      append(script) {
        appendedScript = script;
        globalRef.cv = {
          Mat: class Mat {},
          Canny() {},
        };
        script.onload();
      },
    },
  };

  const cv = await loadOpenCv({ documentRef, globalRef });

  assert.equal(createCount, 1);
  assert.equal(appendedScript.src, OPENCV_SCRIPT_URL);
  assert.equal(appendedScript.async, true);
  assert.equal(cv, globalRef.cv);
});

test("tries a fallback CDN after an OpenCV script error", async () => {
  const globalRef = {};
  const scripts = [];
  const documentRef = {
    createElement() {
      return {};
    },
    head: {
      append(script) {
        scripts.push(script);
        if (scripts.length === 1) {
          script.onerror();
          return;
        }
        globalRef.cv = { Mat: class Mat {}, Canny() {} };
        script.onload();
      },
    },
  };

  const cv = await loadOpenCv({
    documentRef,
    globalRef,
    urls: ["https://example.invalid/opencv.js", "https://cdn.example.test/opencv.js"],
  });

  assert.equal(scripts.length, 2);
  assert.equal(scripts[0].src, "https://example.invalid/opencv.js");
  assert.equal(scripts[1].src, "https://cdn.example.test/opencv.js");
  assert.equal(cv, globalRef.cv);
});
