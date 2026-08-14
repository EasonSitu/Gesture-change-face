const DEFAULT_LOW_THRESHOLD = 60;
const DEFAULT_HIGH_THRESHOLD = 120;
const DEFAULT_APERTURE_SIZE = 3;

function dispose(value) {
  if (value && typeof value.delete === "function") value.delete();
}

export function runCanny(
  cv,
  inputCanvas,
  outputCanvas,
  {
    lowThreshold = DEFAULT_LOW_THRESHOLD,
    highThreshold = DEFAULT_HIGH_THRESHOLD,
    apertureSize = DEFAULT_APERTURE_SIZE,
  } = {},
) {
  if (!cv?.Mat || typeof cv.Canny !== "function") {
    throw new Error("OpenCV.js Canny is not ready");
  }

  let source;
  let gray;
  let blurred;
  let edges;
  let rgba;
  try {
    source = cv.imread(inputCanvas);
    gray = new cv.Mat();
    blurred = new cv.Mat();
    edges = new cv.Mat();
    rgba = new cv.Mat();
    cv.cvtColor(source, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);
    cv.Canny(blurred, edges, lowThreshold, highThreshold, apertureSize, false);
    cv.cvtColor(edges, rgba, cv.COLOR_GRAY2RGBA);
    cv.imshow(outputCanvas, rgba);
  } finally {
    dispose(rgba);
    dispose(edges);
    dispose(blurred);
    dispose(gray);
    dispose(source);
  }

  return outputCanvas;
}
