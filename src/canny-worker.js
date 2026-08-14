let cvRuntime = null;

function dispose(value) {
  if (value && typeof value.delete === "function") value.delete();
}

function announceReady() {
  if (cvRuntime && typeof cvRuntime.Mat === "function" && typeof cvRuntime.Canny === "function") {
    self.postMessage({ type: "ready" });
    return true;
  }
  return false;
}

function loadRuntime() {
  try {
    importScripts("../assets/opencv.js");
    cvRuntime = self.cv;
    if (announceReady()) return;
    if (!cvRuntime) throw new Error("OpenCV.js did not expose cv in the worker");
    const previous = cvRuntime.onRuntimeInitialized;
    cvRuntime.onRuntimeInitialized = () => {
      if (typeof previous === "function") previous();
      if (!announceReady()) self.postMessage({ type: "error", error: "OpenCV.js Canny is not ready" });
    };
  } catch (error) {
    self.postMessage({ type: "error", error: error?.message || String(error) });
  }
}

function processFrame(message) {
  if (!cvRuntime) throw new Error("OpenCV.js worker is not ready");
  const { width, height, data } = message;
  let source;
  let gray;
  let blurred;
  let edges;
  let rgba;
  try {
    source = new cvRuntime.Mat(height, width, cvRuntime.CV_8UC4);
    source.data.set(new Uint8Array(data));
    gray = new cvRuntime.Mat();
    blurred = new cvRuntime.Mat();
    edges = new cvRuntime.Mat();
    rgba = new cvRuntime.Mat();
    cvRuntime.cvtColor(source, gray, cvRuntime.COLOR_RGBA2GRAY);
    cvRuntime.GaussianBlur(gray, blurred, new cvRuntime.Size(5, 5), 0, 0, cvRuntime.BORDER_DEFAULT);
    cvRuntime.Canny(blurred, edges, 60, 120, 3, false);
    cvRuntime.cvtColor(edges, rgba, cvRuntime.COLOR_GRAY2RGBA);
    const output = new Uint8ClampedArray(rgba.data);
    self.postMessage({
      type: "frame",
      effectVersion: message.effectVersion,
      requestId: message.requestId,
      width,
      height,
      data: output.buffer,
    }, [output.buffer]);
  } finally {
    dispose(rgba);
    dispose(edges);
    dispose(blurred);
    dispose(gray);
    dispose(source);
  }
}

self.addEventListener("message", (event) => {
  const message = event.data || {};
  if (message.type === "init") {
    loadRuntime();
    return;
  }
  if (message.type !== "frame") return;
  try {
    processFrame(message);
  } catch (error) {
    self.postMessage({ type: "error", error: error?.message || String(error) });
  }
});
