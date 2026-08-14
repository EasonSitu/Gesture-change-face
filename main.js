import { computeQuad, isSelfIntersectingQuad, toMirroredPixel } from "./src/geometry.mjs?v=20260811-2";
import { bothHandsPinching, nextEffect } from "./src/gestures.mjs?v=20260811-2";
import {
  isCharacterFilter,
  isMeshyCharacterFilter,
} from "./src/character-filters.mjs?v=20260811-2";
import {
  effectCategories,
  effectDefinitions,
  getEffectCategory,
  getEffectIdsForCategories,
} from "./src/effects.mjs?v=20260811-5";
import { getThemeForCategory } from "./src/themes.mjs?v=20260811-1";
import {
  DEFAULT_PINCH_SETTINGS,
  getEnabledPinchCategories,
  normalizePinchSettings,
} from "./src/pinch-settings.mjs?v=20260811-5";
import {
  CAPTURE_COUNTDOWN_SECONDS,
  getCaptureFilename,
  getCaptureSize,
  runCountdown,
} from "./src/capture.mjs?v=20260813-1";
import { ensureCharacterRuntime } from "./src/runtime-loader.mjs?v=20260811-5";
import { createCharacterRenderer, createMeshyPreviewRenderer } from "./src/character-renderer.mjs?v=20260811-2";
import { drawMirroredClippedImage } from "./src/frame-composite.mjs?v=20260811-2";
import { drawDemoPerson } from "./src/demo-scene.mjs?v=20260811-2";
import { cartoonizeImageData } from "./src/cartoon-effect.mjs?v=20260812-1";
import {
  composeCanvasFilters,
  getCharacterImageFilter,
  getSourceImageFilter,
} from "./src/brightness.mjs?v=20260811-5";
import { getStageAspectRatio } from "./src/layout.mjs?v=20260811-1";
import { HELP_IMAGE_SRC, getHelpContent } from "./src/help.mjs?v=20260814-2";
import {
  getCategoryLabel,
  getEffectLabel as getLocalizedEffectLabel,
  getInitialLocale,
  getMessage,
  LOCALE_OPTIONS,
  normalizeLocale,
} from "./src/i18n.mjs?v=20260814-2";
import { getModeToggleState } from "./src/mode-toggle.mjs?v=20260814-1";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const QUERY = new URLSearchParams(location.search);
const DEMO = QUERY.has("demo");
const DEMO_PINCH = DEMO && QUERY.has("pinch");
const EFFECTS = effectDefinitions;
const PINCH_SETTINGS_KEY = "finger-frame-pinch-settings-v1";
const LOCALE_STORAGE_KEY = "finger-frame-locale-v1";
const requestedCharacter = QUERY.get("character");
const INITIAL_EFFECT = isCharacterFilter(requestedCharacter) ? requestedCharacter : "pixelate";

const video = document.querySelector("#video");
const faceCanvas = document.querySelector("#face-canvas");
const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");
const toolbar = document.querySelector("#toolbar");
const stageStatus = document.querySelector("#stage-status");
const statusTitle = document.querySelector("#status-title");
const statusDetail = document.querySelector("#status-detail");
const loadingMeter = document.querySelector("#loading-meter");
const loadingProgress = document.querySelector("#loading-progress");
const loadingProgressBar = document.querySelector("#loading-progress-bar");
const loadingProgressValue = document.querySelector("#loading-progress-value");
const retryButton = document.querySelector("#retry-button");
const effectToast = document.querySelector("#effect-toast");
const pinchToggle = document.querySelector("#pinch-toggle");
const pinchCategoryControls = document.querySelector("#pinch-category-controls");
const captureButton = document.querySelector("#capture-button");
const modeToggleButton = document.querySelector("#mode-toggle-button");
const captureCountdown = document.querySelector("#capture-countdown");
const localeButtons = document.querySelector("#locale-buttons");
const helpButton = document.querySelector("#help-button");
const helpDialog = document.querySelector("#help-dialog");
const helpImage = document.querySelector("#help-image");
const helpTitle = document.querySelector("#help-title");
const helpCloseButton = document.querySelector("#help-close-button");
const helpStartButton = document.querySelector("#help-start-button");
const fullscreenButton = document.querySelector("#fullscreen-button");
const fullscreenLabel = document.querySelector("#fullscreen-label");
const stageCard = document.querySelector(".stage-card");

const smallCanvas = document.createElement("canvas");
const smallCtx = smallCanvas.getContext("2d");
const cartoonCanvas = document.createElement("canvas");
const cartoonCtx = cartoonCanvas.getContext("2d", { willReadFrequently: true });
const cannyCanvas = document.createElement("canvas");
const cannyCtx = cannyCanvas.getContext("2d");
let cannyFrameReady = false;
let cannyFrameBusy = false;
let cannyRefreshTimer = 0;
let cannyWorker = null;
let cannyWorkerPromise = null;
let cannyWorkerReady = false;
let cannyFrameRequest = 0;
const CANNY_REFRESH_MS = 1000;
const CANNY_SOURCE_SCALE = 5;

let effect = INITIAL_EFFECT;
let pinchSettings = loadPinchSettings();
let sourceCanvas = null;
let sourceCtx = null;
let landmarker = null;
let lastVideoTime = -1;
let lastResults = null;
let characterRenderer = null;
let demoCharacterRenderer = null;
let characterRendererPromise = null;
let effectLoadVersion = 0;
let cannyWarningShown = false;
let cameraReady = false;
let corners = null;
let presence = 0;
let lostFrames = 0;
let jumpFrames = 0;
let frameActive = false;
const MAX_LOST_FRAMES = 18;
let tipMarks = [];
let tipPresence = 0;
let tipLostFrames = 0;
let pinchWasActive = false;
let pinchCooldownUntil = 0;
let effectToastUntil = 0;
let cancelCaptureCountdown = null;
let keyboardListenerInstalled = false;
const MAX_TIP_LOST_FRAMES = 48;
const PINCH_COOLDOWN_MS = 900;

function getStoredLocale() {
  try {
    return globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

let locale = getInitialLocale({
  query: location.search,
  stored: getStoredLocale(),
  browser: globalThis.navigator?.language || "",
});

function t(key, replacements = {}) {
  return Object.entries(replacements).reduce(
    (message, [name, value]) => message.replaceAll(`{${name}}`, String(value)),
    getMessage(locale, key),
  );
}

function syncStageAspectRatio(width, height) {
  stageCard?.style.setProperty("--stage-ratio", getStageAspectRatio(width, height));
}

function refreshPinchControlLabels() {
  pinchCategoryControls?.querySelectorAll("[data-category-label]").forEach((label) => {
    label.textContent = getCategoryLabel(locale, label.dataset.categoryLabel);
  });
}

function syncLocaleButtons() {
  if (!localeButtons) return;
  localeButtons.setAttribute("aria-label", t("language.label"));
  localeButtons.querySelectorAll("[data-locale]").forEach((button) => {
    const active = normalizeLocale(button.dataset.locale) === locale;
    const option = LOCALE_OPTIONS.find(({ value }) => value === normalizeLocale(button.dataset.locale));
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
    if (option) {
      button.setAttribute("aria-label", option.label);
      button.setAttribute("title", option.label);
    }
  });
}

function syncModeToggleButton() {
  if (!modeToggleButton) return;
  const state = getModeToggleState({ isDemo: DEMO, locale });
  modeToggleButton.href = state.href;
  modeToggleButton.textContent = t(state.labelKey);
  modeToggleButton.setAttribute("aria-label", t(state.labelKey));
  modeToggleButton.title = t(state.labelKey);
  modeToggleButton.dataset.mode = DEMO ? "camera" : "demo";
}

function syncHelpContent() {
  const content = getHelpContent(locale);
  if (helpTitle) helpTitle.textContent = content.title;
  if (helpImage) {
    helpImage.src = HELP_IMAGE_SRC;
    helpImage.alt = content.imageAlt;
  }
  if (helpCloseButton) helpCloseButton.setAttribute("aria-label", content.close);
  if (helpStartButton) helpStartButton.textContent = content.start;
  if (helpButton) {
    helpButton.setAttribute("aria-label", t("controls.help"));
    helpButton.title = t("controls.help");
  }
  content.steps.forEach((step, index) => {
    const number = index + 1;
    const label = document.querySelector(`#help-step-${number}-label`);
    const detail = document.querySelector(`#help-step-${number}-detail`);
    if (label) label.textContent = step.label;
    if (detail) detail.textContent = step.detail;
  });
}

function isFullscreenActive() {
  return Boolean(document.fullscreenElement);
}

function syncFullscreenButton() {
  const active = isFullscreenActive();
  const labelKey = active ? "controls.exitFullscreen" : "controls.fullscreen";
  document.documentElement.classList.toggle("is-fullscreen", active);
  if (!fullscreenButton) return;
  fullscreenButton.setAttribute("aria-pressed", String(active));
  fullscreenButton.setAttribute("aria-label", t(labelKey));
  fullscreenButton.title = t(labelKey);
  if (fullscreenLabel) fullscreenLabel.textContent = t(labelKey);
}

async function toggleFullscreen() {
  try {
    if (isFullscreenActive()) {
      if (typeof document.exitFullscreen !== "function") {
        showEffectToast(t("status.fullscreenUnsupported"), performance.now());
        return;
      }
      await document.exitFullscreen();
    } else {
      if (typeof document.documentElement.requestFullscreen !== "function") {
        showEffectToast(t("status.fullscreenUnsupported"), performance.now());
        return;
      }
      await document.documentElement.requestFullscreen();
    }
  } catch {
    showEffectToast(t("status.fullscreenFailed"), performance.now());
  }
  syncFullscreenButton();
}

function setHelpOpen(open) {
  if (!helpDialog) return;
  helpDialog.classList.toggle("open", open);
  helpDialog.setAttribute("aria-hidden", String(!open));
  if (open) helpCloseButton?.focus();
  else helpButton?.focus();
}

function applyTranslations() {
  document.documentElement.lang = locale;
  document.documentElement.dataset.locale = locale;
  document.title = t("document.title");
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    element.dataset.i18nAttr.split(";").forEach((entry) => {
      const separator = entry.indexOf(":");
      if (separator < 1) return;
      const attribute = entry.slice(0, separator);
      const key = entry.slice(separator + 1);
      element.setAttribute(attribute, t(key));
    });
  });
  refreshPinchControlLabels();
  syncLocaleButtons();
  syncModeToggleButton();
  syncHelpContent();
  syncFullscreenButton();
}

function setLocale(nextLocale) {
  locale = normalizeLocale(nextLocale);
  try {
    globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Language selection remains active for the current page if storage is unavailable.
  }
  applyTranslations();
  buildToolbar();
}

function loadPinchSettings() {
  try {
    const stored = globalThis.localStorage?.getItem(PINCH_SETTINGS_KEY);
    return normalizePinchSettings(stored ? JSON.parse(stored) : DEFAULT_PINCH_SETTINGS);
  } catch {
    return normalizePinchSettings(DEFAULT_PINCH_SETTINGS);
  }
}

function savePinchSettings() {
  try {
    globalThis.localStorage?.setItem(PINCH_SETTINGS_KEY, JSON.stringify(pinchSettings));
  } catch {
    // Settings are a convenience; camera and effects still work if storage is unavailable.
  }
}

function syncPinchControls() {
  if (pinchToggle) pinchToggle.checked = pinchSettings.enabled;
  pinchCategoryControls?.querySelectorAll("input[data-category]").forEach((input) => {
    input.checked = Boolean(pinchSettings.categories[input.dataset.category]);
  });
}

function buildPinchControls() {
  if (!pinchToggle || !pinchCategoryControls) return;
  pinchToggle.addEventListener("change", () => {
    pinchSettings = normalizePinchSettings({ ...pinchSettings, enabled: pinchToggle.checked });
    savePinchSettings();
    syncPinchControls();
  });

  for (const category of effectCategories) {
    const label = document.createElement("label");
    label.className = "category-toggle";
    label.innerHTML = `<input type="checkbox" data-category="${category.id}" /><span data-category-label="${category.id}"></span>`;
    const input = label.querySelector("input");
    input.checked = Boolean(pinchSettings.categories[category.id]);
    input.addEventListener("change", () => {
      pinchSettings = normalizePinchSettings({
        ...pinchSettings,
        categories: { ...pinchSettings.categories, [category.id]: input.checked },
      });
      savePinchSettings();
      syncPinchControls();
    });
    pinchCategoryControls.append(label);
  }
  refreshPinchControlLabels();
  syncPinchControls();
}

function getEffectLabel(id) {
  return getLocalizedEffectLabel(locale, id);
}

function ensureCameraCharacterRenderer() {
  if (characterRenderer) return Promise.resolve(characterRenderer);
  if (characterRendererPromise) return characterRendererPromise;
  characterRendererPromise = (async () => {
    await ensureCharacterRuntime();
    const renderer = createCharacterRenderer({
      canvas: faceCanvas,
      video,
      onError: (error) => console.warn("Character renderer unavailable", error),
    });
    await renderer.init();
    characterRenderer = renderer;
    return renderer;
  })().catch((error) => {
    characterRenderer = null;
    throw error;
  }).finally(() => {
    characterRendererPromise = null;
  });
  return characterRendererPromise;
}

function stopCannyRefresh() {
  if (cannyRefreshTimer) {
    window.clearTimeout(cannyRefreshTimer);
    cannyRefreshTimer = 0;
  }
}

function stopCannyWorker() {
  stopCannyRefresh();
  cannyWorker?.terminate();
  cannyWorker = null;
  cannyWorkerPromise = null;
  cannyWorkerReady = false;
  cannyFrameBusy = false;
}

function handleCannyWorkerMessage(message) {
  if (message?.type === "error") {
    cannyFrameBusy = false;
    if (!cannyWarningShown) {
      cannyWarningShown = true;
      showEffectToast(t("status.effectFailed"), performance.now());
      console.warn("Canny worker failed", message.error);
    }
    return;
  }
  if (message?.type !== "frame" || message.requestId !== cannyFrameRequest) return;
  if (!isCurrentEffectLoad("sketch", message.effectVersion)) return;
  try {
    const pixels = new Uint8ClampedArray(message.data);
    const image = new ImageData(pixels, message.width, message.height);
    cannyCtx.putImageData(image, 0, 0);
    cannyFrameReady = true;
  } catch (error) {
    if (!cannyWarningShown) {
      cannyWarningShown = true;
      showEffectToast(t("status.effectFailed"), performance.now());
      console.warn("Canny frame display failed", error);
    }
  } finally {
    cannyFrameBusy = false;
    if (isCurrentEffectLoad("sketch", message.effectVersion)) {
      scheduleCannyRefresh("sketch", message.effectVersion, CANNY_REFRESH_MS);
    }
  }
}

function ensureCannyWorker() {
  if (cannyWorkerReady && cannyWorker) return Promise.resolve(cannyWorker);
  if (cannyWorkerPromise) return cannyWorkerPromise;

  const worker = new Worker("./src/canny-worker.js?v=20260813-1");
  cannyWorker = worker;
  cannyWorkerPromise = new Promise((resolve, reject) => {
    const handleMessage = (event) => {
      const message = event.data;
      if (message?.type === "ready") {
        cannyWorkerReady = true;
        worker.removeEventListener("message", handleMessage);
        worker.addEventListener("message", (frameEvent) => handleCannyWorkerMessage(frameEvent.data));
        resolve(worker);
        return;
      }
      if (message?.type === "error") reject(new Error(message.error || "Canny worker failed"));
    };
    worker.addEventListener("message", handleMessage);
    worker.addEventListener("error", (event) => reject(event.error || new Error(event.message || "Canny worker failed")), { once: true });
    worker.postMessage({ type: "init" });
  }).catch((error) => {
    stopCannyWorker();
    throw error;
  }).finally(() => {
    cannyWorkerPromise = null;
  });
  return cannyWorkerPromise;
}

function scheduleCannyRefresh(id, version, delay = 0) {
  stopCannyRefresh();
  if (!isCurrentEffectLoad(id, version) || !cannyWorkerReady || !cannyWorker) return;

  cannyRefreshTimer = window.setTimeout(() => {
    cannyRefreshTimer = 0;
    if (!isCurrentEffectLoad(id, version) || !cannyWorkerReady || !cannyWorker) return;

    if (cannyFrameBusy) {
      scheduleCannyRefresh(id, version, CANNY_REFRESH_MS);
      return;
    }

    cannyFrameBusy = true;
    try {
      const cannyWidth = Math.max(2, Math.round(canvas.width / CANNY_SOURCE_SCALE));
      const cannyHeight = Math.max(2, Math.round(canvas.height / CANNY_SOURCE_SCALE));
      if (cannyCanvas.width !== cannyWidth || cannyCanvas.height !== cannyHeight) {
        cannyCanvas.width = cannyWidth;
        cannyCanvas.height = cannyHeight;
        cannyFrameReady = false;
      }
      drawSource(cannyCtx, cannyWidth, cannyHeight);
      const image = cannyCtx.getImageData(0, 0, cannyWidth, cannyHeight);
      cannyFrameRequest += 1;
      cannyWorker.postMessage({
        type: "frame",
        effectVersion: version,
        requestId: cannyFrameRequest,
        width: cannyWidth,
        height: cannyHeight,
        data: image.data.buffer,
      }, [image.data.buffer]);
      return;
    } catch (error) {
      cannyFrameBusy = false;
      if (!cannyWarningShown) {
        cannyWarningShown = true;
        showEffectToast(t("status.effectFailed"), performance.now());
        console.warn("Canny frame processing failed", error);
      }
    }
  }, delay);
}

function buildToolbar() {
  toolbar.replaceChildren();
  for (const category of effectCategories) {
    const section = document.createElement("section");
    section.className = "effect-group";
    section.innerHTML = `<div class="effect-group-heading"><h2>${getCategoryLabel(locale, category.id)}</h2></div>`;
    const buttons = document.createElement("div");
    buttons.className = "effect-group-buttons";
    EFFECTS
      .filter((definition) => definition.category === category.id)
      .forEach((definition) => {
        const button = document.createElement("button");
        button.className = "effect-button";
        button.type = "button";
        button.dataset.effect = definition.id;
        button.setAttribute("aria-pressed", "false");
        button.innerHTML = `<span class="key">${EFFECTS.indexOf(definition) + 1}</span>${getEffectLabel(definition.id)}`;
        button.addEventListener("click", () => {
          setEffect(definition.id);
        });
        buttons.append(button);
      });
    section.append(buttons);
    toolbar.append(section);
  }
  setEffect(effect);
  if (!keyboardListenerInstalled) {
    keyboardListenerInstalled = true;
    window.addEventListener("keydown", (event) => {
      const index = Number.parseInt(event.key, 10) - 1;
      if (index >= 0 && index < EFFECTS.length) {
        setEffect(EFFECTS[index].id);
      }
    });
  }
}

function setEffect(id) {
  effect = id;
  const loadVersion = ++effectLoadVersion;
  stopCannyWorker();
  cannyFrameReady = false;
  cannyFrameBusy = false;
  document.documentElement.dataset.theme = getThemeForCategory(getEffectCategory(id));
  toolbar.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.effect === id);
    button.setAttribute("aria-pressed", String(button.dataset.effect === id));
  });

  if (id === "sketch") {
    faceCanvas?.classList.remove("visible");
    setEffectLoading(id, loadVersion, 14);
    ensureCannyWorker()
      .then(() => {
        if (!isCurrentEffectLoad(id, loadVersion)) return;
        setEffectLoading(id, loadVersion, 78);
        setEffectLoading(id, loadVersion, 100);
        hideEffectLoading(id, loadVersion);
        scheduleCannyRefresh(id, loadVersion);
      })
      .catch((error) => {
        if (!isCurrentEffectLoad(id, loadVersion)) return;
        hideEffectLoading(id, loadVersion);
        showEffectToast(t("status.effectFailed"), performance.now());
        console.warn("OpenCV.js Canny effect unavailable", error);
      });
    return;
  }

  if (!isCharacterFilter(id)) {
    faceCanvas?.classList.remove("visible");
    setStatus("", "", { hide: true });
    return;
  }

  if (DEMO) {
    faceCanvas?.classList.remove("visible");
    if (!sourceCanvas) return;
    if (!isMeshyCharacterFilter(id)) {
      setStatus("", "", { hide: true });
      showEffectToast(t("status.demoOperaOnly"), performance.now());
      return;
    }
    setEffectLoading(id, loadVersion, 14);
    ensureCharacterRuntime()
      .then(() => {
        if (!isCurrentEffectLoad(id, loadVersion)) return null;
        setEffectLoading(id, loadVersion, 62);
        if (!demoCharacterRenderer) {
          demoCharacterRenderer = createMeshyPreviewRenderer({
            canvas: faceCanvas,
            onError: (error) => console.warn("Demo character renderer unavailable", error),
          });
        }
        return demoCharacterRenderer.select(id);
      })
      .then(() => {
        if (!isCurrentEffectLoad(id, loadVersion)) return;
        faceCanvas.classList.add("visible");
        setEffectLoading(id, loadVersion, 100);
        hideEffectLoading(id, loadVersion);
      })
      .catch((error) => {
        if (!isCurrentEffectLoad(id, loadVersion)) return;
        hideEffectLoading(id, loadVersion);
        showEffectToast(t("status.demoCharacterFailed"), performance.now());
        console.warn("Demo character filter unavailable", error);
      });
    return;
  }

  if (!cameraReady) {
    return;
  }

  setEffectLoading(id, loadVersion, 14);
  ensureCameraCharacterRenderer()
    .then((renderer) => {
      if (!isCurrentEffectLoad(id, loadVersion)) return null;
      setEffectLoading(id, loadVersion, 62);
      return renderer.select(id);
    })
    .then(() => {
      if (!isCurrentEffectLoad(id, loadVersion)) return;
      faceCanvas.classList.add("visible");
      setEffectLoading(id, loadVersion, 100);
      hideEffectLoading(id, loadVersion);
    })
    .catch((error) => {
      if (!isCurrentEffectLoad(id, loadVersion)) return;
      hideEffectLoading(id, loadVersion);
      faceCanvas.classList.remove("visible");
      showEffectToast(t("status.characterFailed"), performance.now());
      console.warn("Character filter unavailable", error);
    });
}

function isCurrentEffectLoad(id, version) {
  return effect === id && effectLoadVersion === version;
}

function setEffectLoading(id, version, progress) {
  if (!isCurrentEffectLoad(id, version)) return;
  const value = Math.max(0, Math.min(100, Math.round(progress)));
  setStatus(
    t("status.loadingEffectTitle"),
    t("status.loadingEffectDetail", { effect: getEffectLabel(id) }),
  );
  stageStatus.classList.add("loading");
  loadingMeter?.classList.remove("hidden");
  loadingProgressBar?.style.setProperty("width", `${value}%`);
  loadingProgress?.setAttribute("aria-valuenow", String(value));
  if (loadingProgressValue) loadingProgressValue.textContent = `${value}%`;
}

function hideEffectLoading(id, version) {
  if (!isCurrentEffectLoad(id, version)) return;
  setStatus("", "", { hide: true });
}

function showEffectToast(message, now) {
  if (!effectToast) return;
  effectToast.textContent = message;
  effectToast.classList.add("visible");
  effectToastUntil = now + PINCH_COOLDOWN_MS;
}

function collectTipMarks(hands) {
  if (!Array.isArray(hands) || hands.length === 0) return [];
  return hands
    .map((landmarks) => ({
      wristX: toMirroredPixel(landmarks[0], canvas.width, canvas.height).x,
      index: toMirroredPixel(landmarks[8], canvas.width, canvas.height),
      thumb: toMirroredPixel(landmarks[4], canvas.width, canvas.height),
    }))
    .sort((a, b) => a.wristX - b.wristX);
}

function updateTipMarks(hands) {
  const nextMarks = collectTipMarks(hands);
  if (nextMarks.length > 0) {
    tipMarks = nextMarks;
    tipPresence = 1;
    tipLostFrames = 0;
    return;
  }

  if (tipMarks.length === 0) return;
  tipLostFrames += 1;
  tipPresence = Math.max(0, 1 - Math.max(0, tipLostFrames - 12) / (MAX_TIP_LOST_FRAMES - 12));
  if (tipLostFrames > MAX_TIP_LOST_FRAMES) tipMarks = [];
}

function drawTipMarker(point, color, label) {
  ctx.beginPath();
  ctx.arc(point.x, point.y, 12, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(point.x, point.y, 4.5, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(point.x - 18, point.y);
  ctx.lineTo(point.x + 18, point.y);
  ctx.moveTo(point.x, point.y - 18);
  ctx.lineTo(point.x, point.y + 18);
  ctx.strokeStyle = `${color}99`;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.font = "800 12px system-ui, sans-serif";
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(label, point.x + 17, point.y - 14);
}

function drawTipMarkers(now) {
  if (tipMarks.length === 0 || tipPresence <= 0) return;
  const pulse = 1 + Math.sin(now / 180) * 0.08;
  ctx.save();
  ctx.globalAlpha = tipPresence;
  tipMarks.forEach((mark) => {
    const indexColor = pinchWasActive ? "#ff76c8" : "#73f7d2";
    const thumbColor = pinchWasActive ? "#ff76c8" : "#ffc46b";
    ctx.save();
    ctx.translate(mark.index.x, mark.index.y);
    ctx.scale(pulse, pulse);
    ctx.translate(-mark.index.x, -mark.index.y);
    drawTipMarker(mark.index, indexColor, "I");
    ctx.restore();
    drawTipMarker(mark.thumb, thumbColor, "T");
  });
  ctx.restore();
}

function updatePinch(hands, now) {
  const pinching = bothHandsPinching(hands);
  if (pinching && !pinchWasActive && now >= pinchCooldownUntil) {
    const pinchEffectIds = getEffectIdsForCategories(getEnabledPinchCategories(pinchSettings));
    if (pinchSettings.enabled && pinchEffectIds.length > 0) {
      const nextId = nextEffect(pinchEffectIds, effect);
      setEffect(nextId);
      showEffectToast(t("status.pinchEffect", { effect: getEffectLabel(nextId) }), now);
    } else if (pinchSettings.enabled) {
      showEffectToast(t("status.noCategory"), now);
    }
    pinchCooldownUntil = now + PINCH_COOLDOWN_MS;
  }
  pinchWasActive = pinching;
  return pinching;
}

function updateEffectToast(now) {
  if (effectToast && effectToastUntil > 0 && now >= effectToastUntil) {
    effectToast.classList.remove("visible");
    effectToastUntil = 0;
  }
}

function updateCaptureCountdown(remaining) {
  if (!captureCountdown) return;
  captureCountdown.textContent = String(remaining);
  captureCountdown.setAttribute("aria-hidden", "false");
  captureCountdown.classList.add("visible");
}

function hideCaptureCountdown() {
  if (!captureCountdown) return;
  captureCountdown.textContent = "";
  captureCountdown.setAttribute("aria-hidden", "true");
  captureCountdown.classList.remove("visible");
}

function downloadCapture(blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = getCaptureFilename();
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function renderCaptureFrame() {
  const size = getCaptureSize(canvas.width, canvas.height);
  const captureCanvas = document.createElement("canvas");
  captureCanvas.width = size.width;
  captureCanvas.height = size.height;
  const captureCtx = captureCanvas.getContext("2d");
  if (!captureCtx) return null;
  captureCtx.drawImage(canvas, 0, 0, size.width, size.height);
  return captureCanvas;
}

function captureCurrentFrame() {
  if (!corners || presence < 0.35) {
    showEffectToast(t("status.noFrame"), performance.now());
    return;
  }

  const captureCanvas = renderCaptureFrame();
  if (!captureCanvas) {
    showEffectToast(t("status.captureFailed"), performance.now());
    return;
  }

  if (typeof captureCanvas.toBlob === "function") {
    captureCanvas.toBlob((blob) => {
      if (!blob) {
        showEffectToast(t("status.captureFailed"), performance.now());
        return;
      }
      downloadCapture(blob);
      showEffectToast(t("status.captureSaved"), performance.now());
    }, "image/png");
    return;
  }

  const link = document.createElement("a");
  link.href = captureCanvas.toDataURL("image/png");
  link.download = getCaptureFilename();
  link.click();
  showEffectToast(t("status.captureSaved"), performance.now());
}

function startCaptureCountdown() {
  if (cancelCaptureCountdown) return;
  if (captureButton) captureButton.disabled = true;
  cancelCaptureCountdown = runCountdown({
    seconds: CAPTURE_COUNTDOWN_SECONDS,
    onTick: updateCaptureCountdown,
    onComplete: () => {
      cancelCaptureCountdown = null;
      hideCaptureCountdown();
      if (captureButton) captureButton.disabled = false;
      captureCurrentFrame();
    },
  });
}

function setStatus(title, detail, { error = false, hide = false } = {}) {
  statusTitle.textContent = title;
  statusDetail.textContent = detail;
  stageStatus.classList.toggle("error", error);
  stageStatus.classList.toggle("loading", !hide && !error);
  stageStatus.classList.toggle("hidden", hide);
  if (hide) {
    loadingMeter?.classList.add("hidden");
    loadingProgressBar?.style.setProperty("width", "0%");
    loadingProgress?.setAttribute("aria-valuenow", "0");
    if (loadingProgressValue) loadingProgressValue.textContent = "0%";
  }
}

function setupDemo() {
  sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = 960;
  sourceCanvas.height = 540;
  sourceCtx = sourceCanvas.getContext("2d");
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  faceCanvas.width = sourceCanvas.width;
  faceCanvas.height = sourceCanvas.height;
  syncStageAspectRatio(sourceCanvas.width, sourceCanvas.height);
}

function paintDemo(time) {
  const seconds = time / 1000;
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const gradient = sourceCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#1b2445");
  gradient.addColorStop(0.5, "#49254e");
  gradient.addColorStop(1, "#0e6d76");
  sourceCtx.fillStyle = gradient;
  sourceCtx.fillRect(0, 0, width, height);

  for (let i = 0; i < 9; i += 1) {
    const x = width * (0.12 + i * 0.1) + Math.sin(seconds * 0.8 + i) * 34;
    const y = height * (0.5 + Math.cos(seconds * 0.55 + i * 1.3) * 0.22);
    const radius = 22 + 16 * Math.sin(seconds + i * 0.8);
    sourceCtx.beginPath();
    sourceCtx.arc(x, y, Math.abs(radius), 0, Math.PI * 2);
    sourceCtx.fillStyle = `hsla(${(i * 41 + seconds * 28) % 360}, 82%, 68%, 0.78)`;
    sourceCtx.fill();
  }

  sourceCtx.strokeStyle = "rgba(255,255,255,0.1)";
  sourceCtx.lineWidth = 1;
  for (let x = 0; x < width; x += 48) {
    sourceCtx.beginPath();
    sourceCtx.moveTo(x, 0);
    sourceCtx.lineTo(x + Math.sin(seconds) * 30, height);
    sourceCtx.stroke();
  }

  sourceCtx.save();
  sourceCtx.translate(width, 0);
  sourceCtx.scale(-1, 1);
  sourceCtx.fillStyle = "rgba(255,255,255,0.9)";
  sourceCtx.font = "800 42px system-ui, sans-serif";
  sourceCtx.fillText(t("demo.title"), 42, 64);
  sourceCtx.fillStyle = "rgba(255,255,255,0.6)";
  sourceCtx.font = "500 16px system-ui, sans-serif";
  sourceCtx.fillText(t("demo.subtitle"), 42, 92);
  sourceCtx.restore();
  drawDemoPerson(sourceCtx, width, height, time, t("status.demoLabel"));
}

function fakeHand(index, thumb, wrist) {
  const landmarks = Array.from({ length: 21 }, () => ({ ...wrist }));
  landmarks[0] = wrist;
  landmarks[4] = thumb;
  landmarks[8] = index;
  landmarks[9] = { x: wrist.x, y: wrist.y - 0.1 };
  return landmarks;
}

function fakeHands(time) {
  const t = time / 1000;
  const sway = Math.sin(t * 0.8) * 0.025;
  const lift = Math.cos(t * 0.65) * 0.018;
  if (DEMO_PINCH) {
    return [
      fakeHand(
        { x: 0.42 + sway, y: 0.42 + lift },
        { x: 0.44 + sway, y: 0.43 + lift },
        { x: 0.27 + sway, y: 0.46 + lift },
      ),
      fakeHand(
        { x: 0.58 - sway, y: 0.42 - lift },
        { x: 0.56 - sway, y: 0.43 - lift },
        { x: 0.73 - sway, y: 0.46 - lift },
      ),
    ];
  }
  return [
    fakeHand(
        { x: 0.29 + sway, y: 0.18 + lift },
        { x: 0.22 + sway, y: 0.75 + lift },
      { x: 0.27 + sway, y: 0.46 + lift },
    ),
    fakeHand(
        { x: 0.71 - sway, y: 0.18 - lift },
        { x: 0.78 - sway, y: 0.75 - lift },
      { x: 0.73 - sway, y: 0.46 - lift },
    ),
  ];
}

function drawSource(target, width, height) {
  const source = DEMO ? sourceCanvas : video;
  target.save();
  target.filter = composeCanvasFilters(target.filter, getSourceImageFilter(DEMO));
  target.translate(width, 0);
  target.scale(-1, 1);
  target.drawImage(source, 0, 0, width, height);
  target.restore();
}

function quadPath(target, quad) {
  target.beginPath();
  target.moveTo(quad[0].x, quad[0].y);
  for (let index = 1; index < quad.length; index += 1) target.lineTo(quad[index].x, quad[index].y);
  target.closePath();
}

function quadFillRule(quad) {
  return isSelfIntersectingQuad(quad) ? "evenodd" : "nonzero";
}

function applyEffect(quad) {
  const width = canvas.width;
  const height = canvas.height;
  ctx.save();
  quadPath(ctx, quad);
  ctx.clip(quadFillRule(quad));
  ctx.globalAlpha = presence;

  if (effect === "pixelate") {
    const scale = 26;
    const smallWidth = Math.max(2, Math.round(width / scale));
    const smallHeight = Math.max(2, Math.round(height / scale));
    if (smallCanvas.width !== smallWidth || smallCanvas.height !== smallHeight) {
      smallCanvas.width = smallWidth;
      smallCanvas.height = smallHeight;
    }
    drawSource(smallCtx, smallWidth, smallHeight);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(smallCanvas, 0, 0, smallWidth, smallHeight, 0, 0, width, height);
    ctx.imageSmoothingEnabled = true;
  } else if (effect === "blur") {
    ctx.filter = "blur(16px) saturate(1.15)";
    drawSource(ctx, width, height);
    ctx.filter = "none";
  } else if (effect === "invert") {
    ctx.filter = "invert(1)";
    drawSource(ctx, width, height);
    ctx.filter = "none";
  } else if (effect === "noir") {
    ctx.filter = "grayscale(1) contrast(1.55) brightness(0.96)";
    drawSource(ctx, width, height);
    ctx.filter = "none";
  } else if (effect === "glitch") {
    const time = performance.now() / 1000;
    ctx.filter = "saturate(1.55) contrast(1.15)";
    drawSource(ctx, width, height);
    ctx.globalAlpha = presence * 0.32;
    ctx.globalCompositeOperation = "screen";
    ctx.translate(8 + Math.sin(time * 8) * 5, 0);
    drawSource(ctx, width, height);
    ctx.translate(-16 - Math.sin(time * 8) * 10, 0);
    drawSource(ctx, width, height);
    ctx.globalCompositeOperation = "source-over";
    ctx.filter = "none";
    ctx.globalAlpha = presence * 0.28;
    ctx.fillStyle = "#fff";
    for (let y = 0; y < height; y += 8) ctx.fillRect(0, y, width, 2);
  } else if (effect === "cartoon") {
    const scale = 3;
    const cartoonWidth = Math.max(2, Math.round(width / scale));
    const cartoonHeight = Math.max(2, Math.round(height / scale));
    if (cartoonCanvas.width !== cartoonWidth || cartoonCanvas.height !== cartoonHeight) {
      cartoonCanvas.width = cartoonWidth;
      cartoonCanvas.height = cartoonHeight;
    }

    cartoonCtx.imageSmoothingEnabled = true;
    cartoonCtx.filter = "saturate(1.28) contrast(1.16) brightness(1.05)";
    drawSource(cartoonCtx, cartoonWidth, cartoonHeight);
    cartoonCtx.filter = "none";

    const image = cartoonCtx.getImageData(0, 0, cartoonWidth, cartoonHeight);
    image.data.set(cartoonizeImageData(image.data, cartoonWidth, cartoonHeight, {
      levels: 5,
      edgeThreshold: 38,
      edgeSoftness: 34,
    }));
    cartoonCtx.putImageData(image, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(cartoonCanvas, 0, 0, cartoonWidth, cartoonHeight, 0, 0, width, height);
  } else if (effect === "sketch") {
    if (cannyFrameReady && cannyCanvas.width > 0 && cannyCanvas.height > 0) {
      ctx.imageSmoothingEnabled = true;
      ctx.filter = "contrast(1.2) brightness(1.08)";
      ctx.drawImage(cannyCanvas, 0, 0, cannyCanvas.width, cannyCanvas.height, 0, 0, width, height);
      ctx.filter = "none";
    }
  }

  ctx.restore();
}

function drawFrameOutline(quad) {
  const time = performance.now() / 1000;
  ctx.save();
  ctx.globalAlpha = presence;
  quadPath(ctx, quad);
  ctx.setLineDash([10, 8]);
  ctx.lineDashOffset = -time * 42;
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(255,255,255,0.95)";
  ctx.shadowColor = "rgba(0,0,0,0.65)";
  ctx.shadowBlur = 8;
  ctx.stroke();
  ctx.setLineDash([]);
  quad.forEach((point, index) => {
    const radius = 6 + Math.sin(time * 3 + index) * 1.2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  });
  ctx.restore();
}

function updateQuad(targetQuad, holdFrame = false) {
  if (targetQuad) {
    if (!corners) {
      corners = targetQuad;
      presence = Math.min(1, presence + 0.14);
      lostFrames = 0;
      jumpFrames = 0;
      frameActive = true;
      return;
    }

    const moved = targetQuad.reduce((sum, point, index) => {
      const current = corners[index];
      return sum + Math.hypot(point.x - current.x, point.y - current.y);
    }, 0) / targetQuad.length;

    if (moved > canvas.width * 0.3 && ++jumpFrames < 2) {
      lostFrames += 1;
      presence = Math.max(0, presence - 0.02);
      return;
    }

    const alpha = Math.min(0.86, Math.max(0.34, moved / (canvas.width * 0.05)));
    corners = corners.map((point, index) => ({
      x: point.x + (targetQuad[index].x - point.x) * alpha,
      y: point.y + (targetQuad[index].y - point.y) * alpha,
    }));
    presence = Math.min(1, presence + 0.14);
    lostFrames = 0;
    jumpFrames = 0;
    frameActive = true;
    return;
  }

  if (holdFrame && corners) {
    lostFrames = 0;
    presence = Math.min(1, presence + 0.04);
    return;
  }

  if (corners && ++lostFrames <= MAX_LOST_FRAMES) {
    presence = Math.min(1, presence + 0.04);
    return;
  }

  presence = Math.max(0, presence - 0.06);
  if (presence === 0) {
    corners = null;
    frameActive = false;
    jumpFrames = 0;
  }
}

function isCharacterCanvasActive() {
  const activeCharacter = DEMO ? isMeshyCharacterFilter(effect) : isCharacterFilter(effect);
  return activeCharacter && faceCanvas?.classList.contains("visible");
}

function loop(time) {
  if (DEMO) paintDemo(time);
  drawSource(ctx, canvas.width, canvas.height);

  if (DEMO) {
    lastResults = { landmarks: fakeHands(time) };
  } else if (landmarker && video.currentTime !== lastVideoTime) {
    lastVideoTime = video.currentTime;
    lastResults = landmarker.detectForVideo(video, performance.now());
  }

  const hands = lastResults?.landmarks;
  updateTipMarks(hands);
  const pinching = updatePinch(hands, time);
  const targetQuad = hands?.length === 2
    ? computeQuad(hands, canvas.width, canvas.height, frameActive)
    : null;
  updateQuad(targetQuad, pinching);

  if (corners && presence > 0.01) {
    if (isCharacterCanvasActive()) {
      ctx.save();
      ctx.globalAlpha = presence;
      ctx.filter = composeCanvasFilters(ctx.filter, getCharacterImageFilter(effect));
      drawMirroredClippedImage(ctx, faceCanvas, corners, canvas.width, canvas.height, quadFillRule(corners));
      ctx.restore();
    } else {
      applyEffect(corners);
    }
    drawFrameOutline(corners);
  }
  drawTipMarkers(time);
  updateEffectToast(time);
  requestAnimationFrame(loop);
}

async function initCamera() {
  setStatus(t("status.cameraTitle"), t("status.cameraDetail"));
  const { FilesetResolver, HandLandmarker } = await import("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14");
  const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
  landmarker = await HandLandmarker.createFromOptions(fileset, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.3,
    minHandPresenceConfidence: 0.3,
    minTrackingConfidence: 0.3,
  });

  setStatus(t("status.permissionTitle"), t("status.permissionDetail"));
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
    audio: false,
  });
  video.srcObject = stream;
  await new Promise((resolve) => { video.onloadedmetadata = resolve; });
  await video.play();
  canvas.width = video.videoWidth || 1280;
  canvas.height = video.videoHeight || 720;
  faceCanvas.width = canvas.width;
  faceCanvas.height = canvas.height;
  syncStageAspectRatio(canvas.width, canvas.height);
  cameraReady = true;
  setStatus("", "", { hide: true });
  if (isCharacterFilter(effect)) setEffect(effect);
  requestAnimationFrame(loop);
}

function initDemo() {
  setupDemo();
  setStatus("", "", { hide: true });
  setEffect(effect);
  requestAnimationFrame(loop);
}

function showError(error) {
  const detail = error?.name === "NotAllowedError"
    ? t("status.errorPermission")
    : t("status.errorGeneric", { error: error?.message || "Unknown error" });
  setStatus(t("status.errorTitle"), detail, { error: true });
  retryButton.classList.remove("hidden");
}

applyTranslations();
buildPinchControls();
buildToolbar();
localeButtons?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-locale]");
  if (button) setLocale(button.dataset.locale);
});
helpButton?.addEventListener("click", () => setHelpOpen(true));
helpCloseButton?.addEventListener("click", () => setHelpOpen(false));
helpStartButton?.addEventListener("click", () => setHelpOpen(false));
helpDialog?.querySelector("[data-help-close]")?.addEventListener("click", () => setHelpOpen(false));
fullscreenButton?.addEventListener("click", toggleFullscreen);
document.addEventListener("fullscreenchange", syncFullscreenButton);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && helpDialog?.classList.contains("open")) setHelpOpen(false);
});
retryButton.addEventListener("click", () => location.reload());
captureButton?.addEventListener("click", startCaptureCountdown);

if (DEMO) {
  initDemo();
} else {
  initCamera().catch(showError);
}
