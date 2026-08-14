export const PINCH_CATEGORY_IDS = Object.freeze(["basic", "funMask", "faceChange"]);

export const DEFAULT_PINCH_SETTINGS = Object.freeze({
  enabled: true,
  categories: Object.freeze({
    basic: true,
    funMask: true,
    faceChange: true,
  }),
});

export function normalizePinchSettings(value) {
  const input = value && typeof value === "object" ? value : {};
  const sourceCategories = input.categories && typeof input.categories === "object"
    ? input.categories
    : {};

  return {
    enabled: input.enabled !== false,
    categories: Object.fromEntries(
      PINCH_CATEGORY_IDS.map((id) => [id, sourceCategories[id] !== false]),
    ),
  };
}

export function getEnabledPinchCategories(settings) {
  const normalized = normalizePinchSettings(settings);
  if (!normalized.enabled) return [];
  return PINCH_CATEGORY_IDS.filter((id) => normalized.categories[id]);
}
