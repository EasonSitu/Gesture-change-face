export const characterFilterIds = Object.freeze(["werewolf", "tiger", "dog", "anonymous"]);

const LABELS = Object.freeze({
  werewolf: "Werewolf",
  tiger: "Tiger",
  dog: "Dog",
  anonymous: "Anonymous",
});

export function getCharacterFilterLabel(id) {
  return LABELS[id] || id;
}

export function isCharacterFilter(id) {
  return characterFilterIds.includes(id);
}
