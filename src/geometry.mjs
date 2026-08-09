export const LANDMARKS = {
  WRIST: 0,
  THUMB_TIP: 4,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
};

export function toMirroredPixel(landmark, width, height) {
  return {
    x: (1 - landmark.x) * width,
    y: landmark.y * height,
  };
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function polygonArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    area += current.x * next.y - next.x * current.y;
  }
  return Math.abs(area / 2);
}

function angleSort(points) {
  const center = points.reduce(
    (sum, point) => ({ x: sum.x + point.x / points.length, y: sum.y + point.y / points.length }),
    { x: 0, y: 0 },
  );
  return [...points].sort(
    (a, b) => Math.atan2(a.y - center.y, a.x - center.x) - Math.atan2(b.y - center.y, b.x - center.x),
  );
}

export function computeQuad(hands, width, height, frameActive = false) {
  if (!Array.isArray(hands) || hands.length !== 2) return null;

  const info = hands.map((landmarks) => {
    const wrist = toMirroredPixel(landmarks[LANDMARKS.WRIST], width, height);
    return {
      index: toMirroredPixel(landmarks[LANDMARKS.INDEX_TIP], width, height),
      thumb: toMirroredPixel(landmarks[LANDMARKS.THUMB_TIP], width, height),
      wristX: wrist.x,
      scale: distance(wrist, toMirroredPixel(landmarks[LANDMARKS.MIDDLE_MCP], width, height)) + 1,
    };
  });

  const needed = frameActive ? 0.2 : 0.75;
  if (info.some((hand) => distance(hand.thumb, hand.index) < hand.scale * needed)) return null;

  info.sort((a, b) => a.wristX - b.wristX);
  const [left, right] = info;
  const points = [left.index, right.index, right.thumb, left.thumb];
  const hull = angleSort(points);
  const minimumArea = width * height * (frameActive ? 0.0005 : 0.005);
  return polygonArea(hull) < minimumArea ? null : points;
}
