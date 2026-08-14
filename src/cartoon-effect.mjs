function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function quantizeChannel(value, levels = 5) {
  const safeLevels = Math.max(2, Math.round(levels));
  const step = 255 / (safeLevels - 1);
  return clampChannel(Math.round(clampChannel(value) / step) * step);
}

function luminanceAt(pixels, width, height, x, y) {
  const safeX = Math.max(0, Math.min(width - 1, x));
  const safeY = Math.max(0, Math.min(height - 1, y));
  const index = (safeY * width + safeX) * 4;
  return pixels[index] * 0.299 + pixels[index + 1] * 0.587 + pixels[index + 2] * 0.114;
}

export function computeLumaEdge(pixels, width, height, x, y) {
  const center = luminanceAt(pixels, width, height, x, y);
  const horizontal = Math.abs(luminanceAt(pixels, width, height, x - 1, y) - luminanceAt(pixels, width, height, x + 1, y));
  const vertical = Math.abs(luminanceAt(pixels, width, height, x, y - 1) - luminanceAt(pixels, width, height, x, y + 1));
  const diagonalA = Math.abs(luminanceAt(pixels, width, height, x - 1, y - 1) - luminanceAt(pixels, width, height, x + 1, y + 1));
  const diagonalB = Math.abs(luminanceAt(pixels, width, height, x + 1, y - 1) - luminanceAt(pixels, width, height, x - 1, y + 1));
  const neighborDifference = Math.max(
    Math.abs(center - luminanceAt(pixels, width, height, x - 1, y)),
    Math.abs(center - luminanceAt(pixels, width, height, x + 1, y)),
    Math.abs(center - luminanceAt(pixels, width, height, x, y - 1)),
    Math.abs(center - luminanceAt(pixels, width, height, x, y + 1)),
  );
  return Math.min(255, Math.max(horizontal, vertical, diagonalA * 0.7, diagonalB * 0.7, neighborDifference));
}

export function cartoonizeImageData(
  pixels,
  width,
  height,
  { levels = 5, edgeThreshold = 42, edgeSoftness = 36 } = {},
) {
  const result = new Uint8ClampedArray(pixels);
  const safeSoftness = Math.max(1, edgeSoftness);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const edge = computeLumaEdge(pixels, width, height, x, y);
      const ink = Math.max(0, Math.min(1, (edge - edgeThreshold) / safeSoftness));
      const shade = 1 - ink * 0.84;
      result[index] = clampChannel(quantizeChannel(pixels[index], levels) * shade);
      result[index + 1] = clampChannel(quantizeChannel(pixels[index + 1], levels) * shade);
      result[index + 2] = clampChannel(quantizeChannel(pixels[index + 2], levels) * shade);
      result[index + 3] = pixels[index + 3];
    }
  }

  return result;
}
