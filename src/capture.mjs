export const CAPTURE_COUNTDOWN_SECONDS = 3;

export function getCaptureFilename(date = new Date()) {
  const stamp = date.toISOString().replace(/\D/g, "").slice(0, 14);
  return `finger-frame-${stamp}.png`;
}

export function getCaptureSize(sourceWidth, sourceHeight, maxWidth = 1920) {
  const width = Number.isFinite(sourceWidth) && sourceWidth > 0 ? sourceWidth : 16;
  const height = Number.isFinite(sourceHeight) && sourceHeight > 0 ? sourceHeight : 9;
  const limit = Number.isFinite(maxWidth) && maxWidth > 0 ? maxWidth : width;
  const scale = Math.min(1, limit / width);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

export function runCountdown({
  seconds = CAPTURE_COUNTDOWN_SECONDS,
  onTick = () => {},
  onComplete = () => {},
  setTimer = setTimeout,
  clearTimer = clearTimeout,
} = {}) {
  const duration = Number.isInteger(seconds) ? Math.max(0, seconds) : CAPTURE_COUNTDOWN_SECONDS;
  if (duration === 0) {
    onComplete();
    return () => {};
  }

  let remaining = duration;
  let timerId = null;
  let cancelled = false;

  const tick = () => {
    if (cancelled) return;
    remaining -= 1;
    if (remaining > 0) {
      onTick(remaining);
      timerId = setTimer(tick, 1000);
      return;
    }
    timerId = null;
    onComplete();
  };

  onTick(remaining);
  timerId = setTimer(tick, 1000);
  return () => {
    cancelled = true;
    if (timerId !== null) clearTimer(timerId);
  };
}
