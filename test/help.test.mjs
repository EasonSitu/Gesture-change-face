import test from "node:test";
import assert from "node:assert/strict";
import { HELP_IMAGE_SRC, getHelpContent } from "../src/help.mjs";

test("provides a compact two-step help story in each supported locale", () => {
  assert.equal(HELP_IMAGE_SRC, "assets/help/frameshift-help-a.png");
  assert.deepEqual(getHelpContent("zh-CN").steps.map((step) => step.label), ["框住画面", "捏合换效果"]);
  assert.deepEqual(getHelpContent("zh-TW").steps.map((step) => step.label), ["框住畫面", "捏合換效果"]);
  assert.deepEqual(getHelpContent("en").steps.map((step) => step.label), ["Frame the screen", "Pinch to switch"]);
  assert.match(getHelpContent("zh-CN").imageAlt, /捏合/);
});
