const CATEGORY_THEMES = Object.freeze({
  basic: "base",
  funMask: "fun-mask",
  faceChange: "face-change",
});

export const themeIds = Object.freeze(["base", "fun-mask", "face-change"]);

export function getThemeForCategory(category) {
  return CATEGORY_THEMES[category] || "base";
}
