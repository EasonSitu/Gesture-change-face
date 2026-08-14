import test from "node:test";
import assert from "node:assert/strict";
import { getCaptureFilename, getCaptureSize, runCountdown } from "../src/capture.mjs";

test("runs the three-second capture countdown before completion", () => {
  const pending = [];
  const ticks = [];
  let completed = 0;
  runCountdown({
    seconds: 3,
    onTick: (remaining) => ticks.push(remaining),
    onComplete: () => { completed += 1; },
    setTimer: (callback) => {
      pending.push(callback);
      return pending.length;
    },
    clearTimer: () => {},
  });

  assert.deepEqual(ticks, [3]);
  assert.equal(completed, 0);
  pending.shift()();
  pending.shift()();
  pending.shift()();
  assert.deepEqual(ticks, [3, 2, 1]);
  assert.equal(completed, 1);
});

test("creates a predictable PNG filename for a capture", () => {
  assert.equal(
    getCaptureFilename(new Date("2026-08-11T04:34:56.000Z")),
    "finger-frame-20260811043456.png",
  );
});

test("keeps the exported capture proportional to the rendered frame", () => {
  assert.deepEqual(getCaptureSize(1280, 720, 1920), { width: 1280, height: 720 });
  assert.deepEqual(getCaptureSize(2560, 1440, 1920), { width: 1920, height: 1080 });
  assert.deepEqual(getCaptureSize(720, 1280, 1920), { width: 720, height: 1280 });
});
