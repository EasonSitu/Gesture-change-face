export const BASE_IMAGE_FILTER = "brightness(1.42) contrast(0.94) saturate(1.1)";
export const DEMO_IMAGE_FILTER = "brightness(1.22) contrast(1.02) saturate(1.08)";
export const CHARACTER_IMAGE_FILTER = "brightness(1.55) contrast(0.95) saturate(1.12)";
export const NUO_OPERA_IMAGE_FILTER = "brightness(2.35) contrast(0.96) saturate(1.22)";

export function getSourceImageFilter(isDemo = false) {
  return isDemo ? DEMO_IMAGE_FILTER : BASE_IMAGE_FILTER;
}

export function getCharacterImageFilter(id) {
  return id === "nuoOpera" ? NUO_OPERA_IMAGE_FILTER : CHARACTER_IMAGE_FILTER;
}

export function composeCanvasFilters(existingFilter = "none", adjustmentFilter = "none") {
  const current = existingFilter && existingFilter !== "none" ? existingFilter : "";
  const adjustment = adjustmentFilter && adjustmentFilter !== "none" ? adjustmentFilter : "";
  return [adjustment, current].filter(Boolean).join(" ") || "none";
}
