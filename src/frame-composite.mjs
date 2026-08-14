export function drawMirroredClippedImage(ctx, source, quad, width, height, fillRule = "nonzero") {
  if (!Array.isArray(quad) || quad.length < 3) return false;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(quad[0].x, quad[0].y);
  for (let index = 1; index < quad.length; index += 1) {
    ctx.lineTo(quad[index].x, quad[index].y);
  }
  ctx.closePath();
  ctx.clip(fillRule);
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(source, 0, 0, width, height);
  ctx.restore();
  return true;
}
