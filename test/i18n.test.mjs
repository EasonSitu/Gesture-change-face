import test from "node:test";
import assert from "node:assert/strict";
import {
  getCategoryLabel,
  getEffectLabel,
  getInitialLocale,
  getMessage,
  normalizeLocale,
} from "../src/i18n.mjs";

test("normalizes supported locales and falls back to simplified Chinese", () => {
  assert.equal(normalizeLocale("zh-TW"), "zh-TW");
  assert.equal(normalizeLocale("en-US"), "en");
  assert.equal(normalizeLocale("fr"), "zh-CN");
});

test("chooses locale from query, storage, then browser language", () => {
  assert.equal(getInitialLocale({ query: "?lang=en", stored: "zh-TW", browser: "zh-CN" }), "en");
  assert.equal(getInitialLocale({ query: "", stored: "zh-TW", browser: "en-US" }), "zh-TW");
  assert.equal(getInitialLocale({ query: "", stored: "", browser: "en-US" }), "en");
});

test("translates categories, effects, and interface messages", () => {
  assert.equal(getCategoryLabel("zh-CN", "faceChange"), "面具变脸");
  assert.equal(getCategoryLabel("zh-TW", "faceChange"), "面具變臉");
  assert.equal(getCategoryLabel("en", "faceChange"), "Face Change");
  assert.equal(getEffectLabel("zh-CN", "nuoOpera"), "傩戏");
  assert.equal(getEffectLabel("zh-TW", "nuoOpera"), "儺戲");
  assert.equal(getEffectLabel("en", "nuoOpera"), "Nuo Opera");
  assert.equal(getEffectLabel("zh-CN", "cartoon"), "漫画");
  assert.equal(getEffectLabel("zh-TW", "cartoon"), "漫畫");
  assert.equal(getEffectLabel("en", "cartoon"), "Cartoon");
  assert.equal(getEffectLabel("zh-CN", "sketch"), "线稿");
  assert.equal(getEffectLabel("zh-TW", "sketch"), "線稿");
  assert.equal(getEffectLabel("en", "sketch"), "Sketch");
  assert.equal(getMessage("zh-CN", "status.loadingEffectTitle"), "正在准备效果…");
  assert.equal(getMessage("zh-TW", "status.loadingEffectTitle"), "正在準備效果…");
  assert.equal(getMessage("en", "status.loadingEffectTitle"), "Preparing effect…");
  assert.equal(getMessage("zh-CN", "status.loadingEffectDetail"), "正在把「{effect}」放进画框。");
  assert.equal(getMessage("zh-TW", "controls.gestureNote"), "雙手捏合換效果，也可以直接點選。");
  assert.equal(getMessage("en", "controls.pinchEnabled"), "Enable pinch switching");
  assert.equal(getMessage("zh-CN", "document.stageLabel"), "互动画面");
  assert.equal(getMessage("en", "controls.capture"), "Save in 3 seconds");
  assert.equal(getMessage("zh-CN", "document.title"), "魔法画框 · FrameShift");
});
