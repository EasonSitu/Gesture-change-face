const WRIST = 0;
const THUMB_TIP = 4;
const INDEX_TIP = 8;
const MIDDLE_MCP = 9;

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function isPinching(landmarks, threshold = 0.55) {
  if (!landmarks || landmarks.length < 10) return false;
  const handScale = distance(landmarks[WRIST], landmarks[MIDDLE_MCP]);
  if (handScale <= 0) return false;
  return distance(landmarks[THUMB_TIP], landmarks[INDEX_TIP]) < handScale * threshold;
}

export function bothHandsPinching(hands) {
  return Array.isArray(hands) && hands.length === 2 && hands.every((hand) => isPinching(hand));
}

export function nextEffect(effects, currentEffect) {
  if (!effects?.length) return currentEffect;
  const currentIndex = effects.indexOf(currentEffect);
  return effects[(currentIndex + 1 + effects.length) % effects.length];
}
