import {
  characterFilterIds,
  getCharacterFilterLabel,
} from "./character-filters.mjs";

const BASIC_EFFECTS = [
  { id: "pixelate", label: "Pixelate", category: "basic" },
  { id: "blur", label: "Blur", category: "basic" },
  { id: "invert", label: "Invert", category: "basic" },
  { id: "noir", label: "Noir", category: "basic" },
  { id: "glitch", label: "Glitch", category: "basic" },
  { id: "cartoon", label: "Cartoon", category: "basic" },
  { id: "sketch", label: "Sketch", category: "basic" },
];

const CATEGORY_DEFINITIONS = [
  { id: "basic", label: "基础效果" },
  { id: "funMask", label: "趣味面具" },
  { id: "faceChange", label: "面具变脸" },
];

const CHARACTER_EFFECTS = characterFilterIds.map((id) => ({
  id,
  label: getCharacterFilterLabel(id),
  category: ["pekingOpera", "nuoOpera", "yellowOpera"].includes(id) ? "faceChange" : "funMask",
}));

export const effectCategories = Object.freeze(
  CATEGORY_DEFINITIONS.map((category) => Object.freeze({ ...category })),
);

export const effectDefinitions = Object.freeze(
  [...BASIC_EFFECTS, ...CHARACTER_EFFECTS].map((effect) => Object.freeze({ ...effect })),
);

export const effectIds = Object.freeze(effectDefinitions.map(({ id }) => id));

export function getEffectCategory(id) {
  return effectDefinitions.find((effect) => effect.id === id)?.category || null;
}

export function getEffectIdsForCategories(categories = []) {
  const enabled = new Set(Array.isArray(categories) ? categories : []);
  return effectDefinitions
    .filter((effect) => enabled.has(effect.category))
    .map(({ id }) => id);
}
