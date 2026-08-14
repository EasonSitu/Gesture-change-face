export function getStageAspectRatio(width, height) {
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
    return "16 / 9";
  }
  return `${width} / ${height}`;
}
