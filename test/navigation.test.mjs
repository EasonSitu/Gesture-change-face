import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getModeToggleState } from "../src/mode-toggle.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("uses one mode toggle link for demo and camera modes", () => {
  const html = fs.readFileSync(path.join(projectRoot, "index.html"), "utf8");
  assert.match(html, /id="mode-toggle-button"/);
  assert.match(html, /data-mode-toggle/);
  assert.match(html, /data-i18n="controls\.enableCamera"/);
  assert.doesNotMatch(html, /data-i18n="controls\.demo"/);
  assert.doesNotMatch(html, /data-i18n="controls\.camera"/);
  assert.doesNotMatch(html, /id="retry-camera-button"/);
});

test("builds the correct destination and label key for each mode", () => {
  assert.deepEqual(getModeToggleState({ isDemo: true, locale: "zh-CN" }), {
    labelKey: "controls.enableCamera",
    href: "?lang=zh-CN",
  });
  assert.deepEqual(getModeToggleState({ isDemo: false, locale: "zh-TW" }), {
    labelKey: "controls.disableCamera",
    href: "?demo&lang=zh-TW",
  });
});
