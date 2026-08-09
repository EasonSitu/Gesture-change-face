import { computeQuad, toMirroredPixel } from "./src/geometry.mjs";
import { bothHandsPinching, nextEffect } from "./src/gestures.mjs";
import { characterFilterIds, getCharacterFilterLabel, isCharacterFilter } from "./src/character-filters.mjs";
import { createCharacterRenderer } from "./src/character-renderer.mjs";
import { drawMirroredClippedImage } from "./src/frame-composite.mjs";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";
const QUERY = new URLSearchParams(location.search);
const DEMO = QUERY.has("demo");
const DEMO_PINCH = DEMO && QUERY.has("pinch");
const EFFECTS = [
  ["pixelate", "Pixelate"],
  ["blur", "Blur"],
  ["invert", "Invert"],
  ["noir", "Noir"],
  ["glitch", "Glitch"],
  ...characterFilterIds.map((id) => [id, getCharacterFilterLabel(id)]),
];
const EFFECT_IDS = EFFECTS.map(([id]) => id);
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
const retryButton = document.querySelector("#retry-button");
const retryCameraButton = document.querySelector("#retry-camera-button");
const gestureHint = document.querySelector("#gesture-hint");
const modeChip = document.querySelector("#mode-chip");
const effectToast = document.querySelector("#effect-toast");

const smallCanvas = document.createElement("canvas");
const smallCtx = smallCanvas.getContext("2d");

let effect = INITIAL_EFFECT;
let sourceCanvas = null;
let sourceCtx = null;
let landmarker = null;
let lastVideoTime = -1;
let lastResults = null;
let characterRenderer = null;
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
const MAX_TIP_LOST_FRAMES = 48;
const PINCH_COOLDOWN_MS = 900;

function buildToolbar() {
  for (const [id, label] of EFFECTS) {
    const button = document.createElement("button");
    button.className = "effect-button";
    button.type = "button";
    button.dataset.effect = id;
    button.innerHTML = `<span class="key">${EFFECTS.findIndex(([key]) => key === id) + 1}</span>${label}`;
    button.addEventListener("click", () => setEffect(id));
    toolbar.append(button);
  }
  setEffect(effect);
  window.addEventListener("keydown", (event) => {
    const index = Number.parseInt(event.key, 10) - 1;
    if (index >= 0 && index < EFFECTS.length) setEffect(EFFECTS[index][0]);
  });
}

function setEffect(id) {
  effect = id;
  toolbar.querySelectorAll("button").forEach((button) => {
    button.classList.toggle("active", button.dataset.effect === id);
  });

  if (!isCharacterFilter(id)) {
    faceCanvas?.classList.remove("visible");
    return;
  }

  if (DEMO || !characterRenderer) {
    if (DEMO) showEffectToast("人物滤镜请打开摄像头模式", performance.now());
    return;
  }

  characterRenderer.select(id)
    .then(() => {
      if (effect === id) faceCanvas.classList.add("visible");
    })
    .catch((error) => {
      if (effect !== id) return;
      faceCanvas.classList.remove("visible");
      showEffectToast("人物滤镜加载失败", performance.now());
      console.warn("Character filter unavailable", error);
    });
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
    const nextId = nextEffect(EFFECT_IDS, effect);
    setEffect(nextId);
    const label = EFFECTS.find(([id]) => id === nextId)?.[1] || nextId;
    showEffectToast(`双手捏合 · ${label}`, now);
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

function setStatus(title, detail, { error = false, hide = false } = {}) {
  statusTitle.textContent = title;
  statusDetail.textContent = detail;
  stageStatus.classList.toggle("error", error);
  stageStatus.classList.toggle("hidden", hide);
}

function setupDemo() {
  sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = 960;
  sourceCanvas.height = 540;
  sourceCtx = sourceCanvas.getContext("2d");
  canvas.width = sourceCanvas.width;
  canvas.height = sourceCanvas.height;
  modeChip.textContent = DEMO_PINCH ? "Demo mode · pinch simulation" : "Demo mode · no camera";
  retryCameraButton.classList.add("hidden");
}

function paintDemo(time) {
  const t = time / 1000;
  const width = sourceCanvas.width;
  const height = sourceCanvas.height;
  const gradient = sourceCtx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#1b2445");
  gradient.addColorStop(0.5, "#49254e");
  gradient.addColorStop(1, "#0e6d76");
  sourceCtx.fillStyle = gradient;
  sourceCtx.fillRect(0, 0, width, height);

  for (let i = 0; i < 9; i += 1) {
    const x = width * (0.12 + i * 0.1) + Math.sin(t * 0.8 + i) * 34;
    const y = height * (0.5 + Math.cos(t * 0.55 + i * 1.3) * 0.22);
    const radius = 22 + 16 * Math.sin(t + i * 0.8);
    sourceCtx.beginPath();
    sourceCtx.arc(x, y, Math.abs(radius), 0, Math.PI * 2);
    sourceCtx.fillStyle = `hsla(${(i * 41 + t * 28) % 360}, 82%, 68%, 0.78)`;
    sourceCtx.fill();
  }

  sourceCtx.strokeStyle = "rgba(255,255,255,0.1)";
  sourceCtx.lineWidth = 1;
  for (let x = 0; x < width; x += 48) {
    sourceCtx.beginPath();
    sourceCtx.moveTo(x, 0);
    sourceCtx.lineTo(x + Math.sin(t) * 30, height);
    sourceCtx.stroke();
  }

  sourceCtx.save();
  sourceCtx.translate(width, 0);
  sourceCtx.scale(-1, 1);
  sourceCtx.fillStyle = "rgba(255,255,255,0.9)";
  sourceCtx.font = "800 42px system-ui, sans-serif";
  sourceCtx.fillText("DEMO FEED", 42, 64);
  sourceCtx.fillStyle = "rgba(255,255,255,0.6)";
  sourceCtx.font = "500 16px system-ui, sans-serif";
  sourceCtx.fillText("fake landmarks · local canvas effects", 42, 92);
  sourceCtx.restore();
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
      { x: 0.29 + sway, y: 0.26 + lift },
      { x: 0.22 + sway, y: 0.62 + lift },
      { x: 0.27 + sway, y: 0.46 + lift },
    ),
    fakeHand(
      { x: 0.71 - sway, y: 0.26 - lift },
      { x: 0.78 - sway, y: 0.62 - lift },
      { x: 0.73 - sway, y: 0.46 - lift },
    ),
  ];
}

function drawSource(target, width, height) {
  const source = DEMO ? sourceCanvas : video;
  target.save();
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

function applyEffect(quad) {
  const width = canvas.width;
  const height = canvas.height;
  ctx.save();
  quadPath(ctx, quad);
  ctx.clip();
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
  return !DEMO && isCharacterFilter(effect) && faceCanvas?.classList.contains("visible");
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
      drawMirroredClippedImage(ctx, faceCanvas, corners, canvas.width, canvas.height);
      ctx.restore();
    } else {
      applyEffect(corners);
    }
    drawFrameOutline(corners);
  }
  drawTipMarkers(time);
  updateEffectToast(time);
  gestureHint.classList.toggle("hidden", presence > 0.5);
  requestAnimationFrame(loop);
}

async function initCamera() {
  setStatus("正在加载手部追踪…", "手部和人物滤镜都会在浏览器本地运行，不会上传摄像头画面。");
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

  setStatus("正在请求摄像头…", "请在浏览器弹窗中允许摄像头权限。");
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
  try {
    characterRenderer = createCharacterRenderer({
      canvas: faceCanvas,
      video,
      onReady: () => { modeChip.textContent = "Camera mode · local hand + character filters"; },
      onError: (error) => console.warn("Character renderer unavailable", error),
    });
    await characterRenderer.init();
    setEffect(effect);
  } catch (error) {
    characterRenderer = null;
    console.warn("Character renderer could not start", error);
  }
  modeChip.textContent = "Camera mode · local hand + character filters";
  setStatus("", "", { hide: true });
  requestAnimationFrame(loop);
}

function initDemo() {
  setupDemo();
  setStatus("", "", { hide: true });
  requestAnimationFrame(loop);
}

function showError(error) {
  const detail = error?.name === "NotAllowedError"
    ? "摄像头权限被拒绝了。你也可以先点击“打开无摄像头 Demo”。"
    : `启动失败：${error?.message || "未知错误"}。你可以先打开无摄像头 Demo。`;
  setStatus("暂时无法启动摄像头", detail, { error: true });
  retryButton.classList.remove("hidden");
}

buildToolbar();
retryButton.addEventListener("click", () => location.reload());
retryCameraButton.addEventListener("click", () => location.reload());

if (DEMO) {
  initDemo();
} else {
  initCamera().catch(showError);
}
