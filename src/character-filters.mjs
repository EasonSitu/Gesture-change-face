const CHARACTER_FILTERS = Object.freeze({
  werewolf: Object.freeze({ label: "Werewolf", kind: "jeeliz" }),
  tiger: Object.freeze({ label: "Tiger", kind: "jeeliz" }),
  dog: Object.freeze({ label: "Dog", kind: "jeeliz" }),
  anonymous: Object.freeze({ label: "Anonymous", kind: "jeeliz" }),
  pekingOpera: Object.freeze({
    label: "Peking Opera",
    kind: "meshy",
    asset: "assets/meshy/peking-opera-mask.glb",
    rotationY: 0,
    source: "https://www.meshy.ai/zh/3d-models/Peking-Opera-Mask-Illustration-019513fc-b2a8-720c-bc4c-c4b5285146be",
  }),
  nuoOpera: Object.freeze({
    label: "Nuo Opera",
    kind: "meshy",
    asset: "assets/meshy/nuo-opera-mask.glb",
    rotationY: 0,
    source: "https://www.meshy.ai/vi/3d-models/019ca891-fbed-7097-ae80-bc7bcbad6fc7",
  }),
  yellowOpera: Object.freeze({
    label: "Yellow Opera",
    kind: "meshy",
    asset: "assets/meshy/yellow-opera-mask.glb",
    rotationY: 0,
    source: "https://www.meshy.ai/zh/3d-models/Yellow-Opera-Mask-01938564-2518-705e-a46a-ff69ee30544f",
  }),
});

export const characterFilterIds = Object.freeze(Object.keys(CHARACTER_FILTERS));

export function getCharacterFilterLabel(id) {
  return CHARACTER_FILTERS[id]?.label || id;
}

export function isCharacterFilter(id) {
  return characterFilterIds.includes(id);
}

export function isMeshyCharacterFilter(id) {
  return CHARACTER_FILTERS[id]?.kind === "meshy";
}

export function getCharacterFilterAsset(id) {
  return CHARACTER_FILTERS[id]?.asset || null;
}

export function getCharacterFilterRotationY(id) {
  return CHARACTER_FILTERS[id]?.rotationY || 0;
}

export function getCharacterFilterSource(id) {
  return CHARACTER_FILTERS[id]?.source || null;
}
