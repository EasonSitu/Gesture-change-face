export const OPENCV_SCRIPT_URL = "./assets/opencv.js";
export const OPENCV_FALLBACK_URLS = Object.freeze([
  "https://docs.opencv.org/4.13.0/opencv.js",
  "https://github.com/TechStark/opencv-js/releases/download/opencv-js-4.13.0-build3/opencv.js",
  "https://cdn.jsdelivr.net/npm/@techstark/opencv-js@4.12.0-release.1/dist/opencv.js",
  "https://unpkg.com/@techstark/opencv-js@4.12.0-release.1/dist/opencv.js",
]);

const pendingLoads = new WeakMap();

export function isOpenCvReady(globalRef = globalThis) {
  const cv = globalRef?.cv;
  return Boolean(cv && typeof cv.Mat === "function" && typeof cv.Canny === "function");
}

function appendScript(documentRef, script) {
  if (typeof documentRef.head?.append === "function") {
    documentRef.head.append(script);
    return;
  }
  if (typeof documentRef.head?.appendChild === "function") {
    documentRef.head.appendChild(script);
    return;
  }
  throw new Error("OpenCV.js could not find a document head");
}

function findExistingScript(documentRef, url) {
  const scripts = documentRef.querySelectorAll?.("script");
  const matchingScript = Array.from(scripts || []).find((script) => script.dataset?.opencvUrl === url);
  return matchingScript || documentRef.querySelector?.(`script[src="${url}"]`);
}

function waitForRuntime({ documentRef, globalRef, url, timeoutMs = 15000 }) {
  const existing = findExistingScript(documentRef, url);
  if (existing?.dataset?.opencvReady === "true" && isOpenCvReady(globalRef)) {
    return Promise.resolve(globalRef.cv);
  }

  return new Promise((resolve, reject) => {
    let settled = false;
    const timeoutId = setTimeout(() => {
      rejectWith(new Error(`OpenCV.js timed out after ${timeoutMs}ms`));
    }, timeoutMs);
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      callback(value);
    };
    const rejectWith = (error) => finish(reject, error);
    const resolveWith = (value) => finish(resolve, value);
    const onRuntimeReady = () => {
      if (isOpenCvReady(globalRef)) resolveWith(globalRef.cv);
      else rejectWith(new Error("OpenCV.js loaded without cv.Canny"));
    };
    const onScriptLoaded = (script) => {
      if (isOpenCvReady(globalRef)) {
        if (script?.dataset) script.dataset.opencvReady = "true";
        resolveWith(globalRef.cv);
        return;
      }

      const cv = globalRef?.cv;
      if (!cv) {
        rejectWith(new Error("OpenCV.js did not expose the cv runtime"));
        return;
      }

      const previous = cv.onRuntimeInitialized;
      cv.onRuntimeInitialized = () => {
        if (typeof previous === "function") previous();
        onRuntimeReady();
      };
    };

    if (existing) {
      existing.onload = () => onScriptLoaded(existing);
      existing.onerror = () => rejectWith(new Error("OpenCV.js failed to load"));
      if (isOpenCvReady(globalRef)) onScriptLoaded(existing);
      return;
    }

    const script = documentRef.createElement("script");
    script.async = true;
    script.src = url;
    if (script.dataset) script.dataset.opencvUrl = url;
    script.onload = () => onScriptLoaded(script);
    script.onerror = () => rejectWith(new Error("OpenCV.js failed to load"));
    try {
      appendScript(documentRef, script);
    } catch (error) {
      rejectWith(error);
    }
  });
}

export function loadOpenCv({
  documentRef = globalThis.document,
  globalRef = globalThis,
  url = OPENCV_SCRIPT_URL,
  urls,
  timeoutMs = 15000,
} = {}) {
  if (isOpenCvReady(globalRef)) return Promise.resolve(globalRef.cv);
  if (!documentRef) return Promise.reject(new Error("OpenCV.js needs a browser document"));

  const current = pendingLoads.get(documentRef);
  if (current) return current;

  const candidates = Array.from(new Set(urls || [url, ...OPENCV_FALLBACK_URLS]));
  const promise = candidates.reduce(
    (attempt, candidate) => attempt.catch(() => waitForRuntime({ documentRef, globalRef, url: candidate, timeoutMs })),
    Promise.reject(new Error("OpenCV.js candidates were exhausted")),
  ).finally(() => {
    pendingLoads.delete(documentRef);
  });
  pendingLoads.set(documentRef, promise);
  return promise;
}
