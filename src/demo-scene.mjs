export function getDemoPersonLayout(width, height) {
  const face = {
    x: width * 0.5,
    y: height * 0.45,
    rx: Math.min(width * 0.14, 150),
    ry: Math.min(height * 0.26, 175),
  };
  return {
    face,
    neck: {
      x: face.x - face.rx * 0.34,
      y: face.y + face.ry * 0.64,
      width: face.rx * 0.68,
      height: height * 0.2,
    },
    shoulders: {
      top: height * 0.68,
      left: width * 0.21,
      right: width * 0.79,
      bottom: height * 1.08,
    },
  };
}

function ellipse(ctx, x, y, radiusX, radiusY) {
  ctx.beginPath();
  ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
}

function drawEye(ctx, x, y, width, height, blink, pupilOffset) {
  ctx.save();
  ctx.translate(x, y);
  if (blink) {
    ctx.strokeStyle = "#44313b";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-width * 0.45, 0);
    ctx.quadraticCurveTo(0, height * 0.12, width * 0.45, 0);
    ctx.stroke();
  } else {
    ellipse(ctx, 0, 0, width, height);
    ctx.fillStyle = "#fffdf7";
    ctx.fill();
    ellipse(ctx, pupilOffset, 1, width * 0.42, height * 0.62);
    ctx.fillStyle = "#2e2340";
    ctx.fill();
    ellipse(ctx, pupilOffset - width * 0.11, -height * 0.22, width * 0.12, height * 0.2);
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    ctx.fill();
  }
  ctx.restore();
}

export function drawDemoPerson(ctx, width, height, time = 0, label = "Example view") {
  const layout = getDemoPersonLayout(width, height);
  const t = time / 1000;
  const sway = Math.sin(t * 0.8) * width * 0.008;
  const blink = Math.sin(t * 1.15) > 0.93;
  const face = { ...layout.face, x: layout.face.x + sway, y: layout.face.y + Math.cos(t * 0.65) * 3 };

  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 14;
  const shirtGradient = ctx.createLinearGradient(0, layout.shoulders.top, 0, layout.shoulders.bottom);
  shirtGradient.addColorStop(0, "#1d2947");
  shirtGradient.addColorStop(1, "#090d1b");
  ctx.beginPath();
  ctx.moveTo(layout.shoulders.left + sway, layout.shoulders.bottom);
  ctx.lineTo(layout.shoulders.left + width * 0.06 + sway, layout.shoulders.top);
  ctx.quadraticCurveTo(width * 0.5 + sway, layout.shoulders.top - height * 0.06, layout.shoulders.right - width * 0.06 + sway, layout.shoulders.top);
  ctx.lineTo(layout.shoulders.right + sway, layout.shoulders.bottom);
  ctx.closePath();
  ctx.fillStyle = shirtGradient;
  ctx.fill();
  ctx.restore();

  const neckGradient = ctx.createLinearGradient(0, layout.neck.y, 0, layout.neck.y + layout.neck.height);
  neckGradient.addColorStop(0, "#f4bd9d");
  neckGradient.addColorStop(1, "#c9796f");
  ctx.fillStyle = neckGradient;
  ctx.fillRect(layout.neck.x + sway, layout.neck.y, layout.neck.width, layout.neck.height);

  ctx.fillStyle = "#d98d80";
  ellipse(ctx, face.x - face.rx * 0.95, face.y + 0.02 * face.ry, face.rx * 0.18, face.ry * 0.28);
  ctx.fill();
  ellipse(ctx, face.x + face.rx * 0.95, face.y + 0.02 * face.ry, face.rx * 0.18, face.ry * 0.28);
  ctx.fill();

  const skinGradient = ctx.createLinearGradient(face.x - face.rx, face.y - face.ry, face.x + face.rx, face.y + face.ry);
  skinGradient.addColorStop(0, "#ffd9b8");
  skinGradient.addColorStop(0.56, "#f3b08e");
  skinGradient.addColorStop(1, "#bf6d70");
  ctx.fillStyle = skinGradient;
  ellipse(ctx, face.x, face.y, face.rx, face.ry);
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  ctx.ellipse(face.x, face.y - face.ry * 0.52, face.rx * 1.02, 0.6 * face.ry, 0, Math.PI, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#1d1a2b";
  ctx.fillRect(face.x - face.rx * 1.2, face.y - 0.9 * face.ry, face.rx * 2.4, 0.75 * face.ry);
  ctx.restore();

  ctx.fillStyle = "#281c2f";
  ctx.beginPath();
  ctx.moveTo(face.x - face.rx * 0.95, face.y - 0.44 * face.ry);
  ctx.quadraticCurveTo(face.x - face.rx * 0.7, face.y - 0.98 * face.ry, face.x - face.rx * 0.08, face.y - 0.88 * face.ry);
  ctx.quadraticCurveTo(face.x + face.rx * 0.52, face.y - 0.98 * face.ry, face.x + face.rx * 0.97, face.y - 0.36 * face.ry);
  ctx.lineTo(face.x + face.rx * 0.75, face.y - 0.6 * face.ry);
  ctx.quadraticCurveTo(face.x + face.rx * 0.15, face.y - 0.72 * face.ry, face.x - face.rx * 0.18, face.y - 0.6 * face.ry);
  ctx.quadraticCurveTo(face.x - face.rx * 0.58, face.y - 0.72 * face.ry, face.x - face.rx * 0.95, face.y - 0.44 * face.ry);
  ctx.fill();

  ctx.strokeStyle = "#6a3d4c";
  ctx.lineWidth = Math.max(3, width * 0.004);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(face.x - face.rx * 0.58, face.y - 0.18 * face.ry);
  ctx.quadraticCurveTo(face.x - face.rx * 0.28, face.y - 0.28 * face.ry, face.x - face.rx * 0.05, face.y - 0.16 * face.ry);
  ctx.moveTo(face.x + face.rx * 0.05, face.y - 0.16 * face.ry);
  ctx.quadraticCurveTo(face.x + face.rx * 0.28, face.y - 0.28 * face.ry, face.x + face.rx * 0.58, face.y - 0.18 * face.ry);
  ctx.stroke();
  drawEye(ctx, face.x - face.rx * 0.31, face.y - 0.03 * face.ry, face.rx * 0.17, 0.11 * face.ry, blink, Math.sin(t) * face.rx * 0.035);
  drawEye(ctx, face.x + face.rx * 0.31, face.y - 0.03 * face.ry, face.rx * 0.17, 0.11 * face.ry, blink, Math.sin(t) * face.rx * 0.035);

  ctx.strokeStyle = "rgba(141,76,76,0.55)";
  ctx.lineWidth = Math.max(2, width * 0.0025);
  ctx.beginPath();
  ctx.moveTo(face.x, face.y + 0.02 * face.ry);
  ctx.quadraticCurveTo(face.x - face.rx * 0.08, face.y + 0.28 * face.ry, face.x + face.rx * 0.08, face.y + 0.3 * face.ry);
  ctx.stroke();
  ctx.fillStyle = "#9e4f67";
  ellipse(ctx, face.x, face.y + 0.47 * face.ry, face.rx * 0.22, 0.07 * face.ry);
  ctx.fill();
  ctx.strokeStyle = "rgba(105,45,65,0.8)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(face.x - face.rx * 0.2, face.y + 0.47 * face.ry);
  ctx.quadraticCurveTo(face.x, face.y + 0.57 * face.ry, face.x + face.rx * 0.2, face.y + 0.47 * face.ry);
  ctx.stroke();

  ctx.fillStyle = "rgba(241,111,116,0.2)";
  ellipse(ctx, face.x - face.rx * 0.64, face.y + 0.25 * face.ry, face.rx * 0.2, 0.1 * face.ry);
  ctx.fill();
  ellipse(ctx, face.x + face.rx * 0.64, face.y + 0.25 * face.ry, face.rx * 0.2, 0.1 * face.ry);
  ctx.fill();

  ctx.save();
  ctx.translate(width, 0);
  ctx.scale(-1, 1);
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.font = "700 15px system-ui, sans-serif";
  ctx.fillText(label, 28, height - 24);
  ctx.restore();
  return layout;
}
