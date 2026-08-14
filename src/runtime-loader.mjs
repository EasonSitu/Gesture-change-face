const CHARACTER_RUNTIME_SCRIPTS = Object.freeze([
  "https://cdn.jsdelivr.net/gh/jeeliz/jeelizFaceFilter@master/libs/three/v97/three.min.js",
  "https://cdn.jsdelivr.net/npm/three@0.97.0/examples/js/loaders/GLTFLoader.js",
  "https://cdn.jsdelivr.net/gh/jeeliz/jeelizFaceFilter@master/dist/jeelizFaceFilter.js",
  "https://cdn.jsdelivr.net/gh/jeeliz/jeelizFaceFilter@master/helpers/JeelizThreeHelper.js",
]);

let runtimePromise = null;

export function getCharacterRuntimeScriptUrls() {
  return [...CHARACTER_RUNTIME_SCRIPTS];
}

function hasCharacterRuntime() {
  return Boolean(globalThis.THREE && globalThis.THREE.GLTFLoader && globalThis.JEELIZFACEFILTER && globalThis.JeelizThreeHelper);
}

function loadScript(url, documentRef) {
  return new Promise((resolve, reject) => {
    const script = documentRef.createElement("script");
    script.src = url;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load character runtime: ${url}`));
    documentRef.head.append(script);
  });
}

export function ensureCharacterRuntime({ documentRef = globalThis.document } = {}) {
  if (hasCharacterRuntime()) return Promise.resolve();
  if (!documentRef) return Promise.reject(new Error("Character runtime requires a document"));
  if (runtimePromise) return runtimePromise;

  runtimePromise = (async () => {
    for (const url of CHARACTER_RUNTIME_SCRIPTS) await loadScript(url, documentRef);
    if (!hasCharacterRuntime()) throw new Error("Character runtime loaded without the expected globals");
  })().catch((error) => {
    runtimePromise = null;
    throw error;
  });

  return runtimePromise;
}
