import {
  getCharacterFilterAsset,
  getCharacterFilterRotationY,
  isCharacterFilter,
  isMeshyCharacterFilter,
} from "./character-filters.mjs?v=20260811-2";

const JEELIZ_BASE = "https://cdn.jsdelivr.net/gh/jeeliz/jeelizFaceFilter@master";
const DEMO_BASE = JEELIZ_BASE + "/demos/threejs";

function assetUrl(path) {
  return DEMO_BASE + "/" + path;
}

function getThree() {
  const three = globalThis.THREE;
  if (!three) throw new Error("Three.js is not loaded");
  return three;
}

function getJeeliz() {
  const faceFilter = globalThis.JEELIZFACEFILTER;
  const helper = globalThis.JeelizThreeHelper;
  if (!faceFilter || !helper) throw new Error("Jeeliz FaceFilter is not loaded");
  return { faceFilter, helper };
}

function loadGeometry(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, resolve, undefined, reject);
  });
}

function loadGLTF(THREE, url) {
  if (typeof THREE.GLTFLoader !== "function") {
    throw new Error("GLTFLoader is not loaded");
  }
  return new Promise((resolve, reject) => {
    new THREE.GLTFLoader().load(url, resolve, undefined, reject);
  });
}

function loadTexture(THREE, url) {
  return new THREE.TextureLoader().load(url);
}

function addToFaceObject(faceObject, object) {
  object.visible = false;
  faceObject.add(object);
  return object;
}

async function loadWerewolf(THREE, faceObject) {
  const geometry = await loadGeometry(
    new THREE.JSONLoader(),
    assetUrl("werewolf/models/werewolf/werewolf_not_animated.json"),
  );
  const head = new THREE.Mesh(geometry, [
    new THREE.MeshPhongMaterial({
      map: loadTexture(THREE, assetUrl("werewolf/models/werewolf/head_diffuse.png")),
      normalMap: loadTexture(THREE, assetUrl("werewolf/models/werewolf/head_normal.jpg")),
      alphaMap: loadTexture(THREE, assetUrl("werewolf/models/werewolf/head_alpha.jpg")),
      transparent: true,
      morphTargets: true,
      shininess: 10,
    }),
    new THREE.MeshPhongMaterial({
      map: loadTexture(THREE, assetUrl("werewolf/models/werewolf/fur_diffuse.jpg")),
      normalMap: loadTexture(THREE, assetUrl("werewolf/models/werewolf/fur_normal.png")),
      alphaMap: loadTexture(THREE, assetUrl("werewolf/models/werewolf/fur_alpha.jpg")),
      transparent: true,
      depthWrite: false,
      shininess: 20,
      normalScale: new THREE.Vector2(2, 2),
    }),
    new THREE.MeshPhongMaterial({
      map: loadTexture(THREE, assetUrl("werewolf/models/werewolf/teeth_diffuse.jpg")),
      transparent: true,
      morphTargets: true,
      shininess: 0,
    }),
  ]);
  head.frustumCulled = false;
  head.renderOrder = 1000000;
  const group = new THREE.Object3D();
  group.add(head);
  group.scale.multiplyScalar(7);
  group.position.set(0, -1.2, -0.5);
  const ambient = new THREE.AmbientLight(0x888899, 1);
  const moonLight = new THREE.DirectionalLight(0xffd090, 1.2);
  moonLight.position.set(1, 2, 2);
  group.add(ambient, moonLight);
  return addToFaceObject(faceObject, group);
}

async function loadTiger(THREE, faceObject) {
  const geometry = await loadGeometry(
    new THREE.BufferGeometryLoader(),
    assetUrl("tiger/TigerHead.json"),
  );
  const mesh = new THREE.Mesh(geometry, [
    new THREE.MeshLambertMaterial({ color: 0xffffff }),
    new THREE.MeshPhongMaterial({
      map: loadTexture(THREE, assetUrl("tiger/white.png")),
      transparent: true,
    }),
    new THREE.MeshPhongMaterial({
      map: loadTexture(THREE, assetUrl("tiger/headTexture2.png")),
      transparent: true,
      shininess: 18,
    }),
    new THREE.MeshPhongMaterial({ color: 0x331100 }),
  ]);
  mesh.scale.set(2, 3, 2);
  mesh.position.set(0, 0.2, -0.48);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1000000;
  const group = new THREE.Object3D();
  group.add(mesh);
  group.add(new THREE.AmbientLight(0xffffff, 0.45));
  const light = new THREE.DirectionalLight(0xff8833, 1.6);
  light.position.set(0, 0.5, 1);
  group.add(light);
  return addToFaceObject(faceObject, group);
}

async function loadDog(THREE, faceObject) {
  const earsGeometry = await loadGeometry(
    new THREE.BufferGeometryLoader(),
    assetUrl("dog_face/models/dog/dog_ears.json"),
  );
  const noseGeometry = await loadGeometry(
    new THREE.BufferGeometryLoader(),
    assetUrl("dog_face/models/dog/dog_nose.json"),
  );
  const tongueGeometry = await loadGeometry(
    new THREE.JSONLoader(),
    assetUrl("dog_face/models/dog/dog_tongue.json"),
  );

  const ears = new THREE.Mesh(earsGeometry, new THREE.MeshPhongMaterial({
    map: loadTexture(THREE, assetUrl("dog_face/models/dog/texture_ears.jpg")),
    alphaMap: loadTexture(THREE, assetUrl("dog_face/models/dog/alpha_ears_256.jpg")),
    bumpMap: loadTexture(THREE, assetUrl("dog_face/models/dog/normal_ears.jpg")),
    transparent: true,
    alphaTest: 0.01,
    shininess: 1.5,
  }));
  ears.scale.multiplyScalar(0.025);
  ears.position.y = -0.3;
  ears.frustumCulled = false;

  const nose = new THREE.Mesh(noseGeometry, new THREE.MeshPhongMaterial({
    map: loadTexture(THREE, assetUrl("dog_face/models/dog/texture_nose.jpg")),
    bumpMap: loadTexture(THREE, assetUrl("dog_face/models/dog/normal_nose.jpg")),
    shininess: 1.5,
  }));
  nose.scale.multiplyScalar(0.018);
  nose.position.set(0, -0.05, 0.15);
  nose.frustumCulled = false;

  const tongueMaterial = new THREE.MeshPhongMaterial({
    map: loadTexture(THREE, assetUrl("dog_face/models/dog/dog_tongue.jpg")),
    transparent: true,
    morphTargets: true,
    opacity: 0,
  });
  const tongue = new THREE.Mesh(tongueGeometry, tongueMaterial);
  tongue.scale.multiplyScalar(2);
  tongue.position.y = -0.28;
  tongue.visible = false;
  tongue.frustumCulled = false;

  const group = new THREE.Object3D();
  group.add(ears, nose, tongue);
  group.userData.tongue = tongue;
  group.add(new THREE.AmbientLight(0xffffff, 0.8));
  const light = new THREE.DirectionalLight(0xffffff, 0.7);
  light.position.set(0, 1, 2);
  group.add(light);
  return addToFaceObject(faceObject, group);
}

async function loadAnonymous(THREE, faceObject) {
  const geometry = await loadGeometry(
    new THREE.BufferGeometryLoader(),
    assetUrl("anonymous/models/anonymous/anonymous.json"),
  );
  const mesh = new THREE.Mesh(geometry, new THREE.MeshLambertMaterial({
    map: loadTexture(THREE, assetUrl("anonymous/models/anonymous/anonymous.png")),
    transparent: true,
    alphaTest: 0.01,
  }));
  mesh.frustumCulled = false;
  mesh.scale.multiplyScalar(0.065);
  mesh.position.fromArray([0, -0.75, 0.35]);
  mesh.renderOrder = 1000000;
  const group = new THREE.Object3D();
  group.add(mesh);
  group.add(new THREE.AmbientLight(0xffffff, 0.9));
  return addToFaceObject(faceObject, group);
}

function normalizeMeshyMask(THREE, scene, rotationY = 0, targetHeight = 2.65) {
  scene.rotation.set(0, rotationY, 0);
  scene.updateMatrixWorld(true);

  const bounds = new THREE.Box3().setFromObject(scene);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const sourceHeight = Math.max(size.y, 0.001);
  const scale = targetHeight / sourceHeight;

  scene.scale.setScalar(scale);
  scene.position.set(
    -center.x * scale,
    -center.y * scale - 0.16,
    -center.z * scale + 0.24,
  );
  scene.updateMatrixWorld(true);
  return scene;
}

function applyTextureTransform(THREE, texture, transform) {
  if (!texture || !transform) return;
  const offset = transform.offset || [0, 0];
  const scale = transform.scale || [1, 1];
  texture.offset.set(offset[0], offset[1]);
  texture.repeat.set(scale[0], scale[1]);
  if (transform.rotation !== undefined) texture.rotation = transform.rotation;
  if (scale[0] !== 1 || scale[1] !== 1) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
  }
  texture.needsUpdate = true;
}

export function getMeshyTextureTransform(textureInfo, textures = []) {
  if (!textureInfo) return null;
  return textureInfo.extensions?.KHR_texture_transform
    || textures[textureInfo.index]?.extensions?.KHR_texture_transform
    || null;
}

function applyMeshyTextureTransforms(THREE, gltf, scene) {
  const definitions = gltf.parser?.json?.materials || [];
  const textureMappings = [
    ["map", (definition) => definition.pbrMetallicRoughness?.baseColorTexture],
    ["metalnessMap", (definition) => definition.pbrMetallicRoughness?.metallicRoughnessTexture],
    ["roughnessMap", (definition) => definition.pbrMetallicRoughness?.metallicRoughnessTexture],
    ["normalMap", (definition) => definition.normalTexture],
    ["aoMap", (definition) => definition.occlusionTexture],
    ["emissiveMap", (definition) => definition.emissiveTexture],
  ];
  const textures = gltf.parser?.json?.textures || [];

  scene.traverse((node) => {
    if (!node.isMesh) return;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((material, index) => {
      const definition = definitions[index] || definitions[0];
      if (!material || !definition) return;
      textureMappings.forEach(([property, getTexture]) => {
        const reference = getTexture(definition);
        const transform = getMeshyTextureTransform(reference, textures);
        applyTextureTransform(THREE, material[property], transform);
      });
    });
  });
}

function configureMeshyMaterials(THREE, scene) {
  scene.traverse((node) => {
    if (!node.isMesh) return;
    node.frustumCulled = false;
    node.renderOrder = 1000000;
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach((material) => {
      if (!material) return;
      material.side = THREE.DoubleSide;
      material.transparent = false;
      material.opacity = 1;
      material.depthTest = true;
      material.depthWrite = true;
      material.blending = THREE.NormalBlending;
      material.needsUpdate = true;
    });
  });
}

function addMeshyLights(THREE, group, id) {
  const isNuoOpera = id === "nuoOpera";
  group.add(new THREE.AmbientLight(0xffffff, isNuoOpera ? 1.35 : 0.82));
  const keyLight = new THREE.DirectionalLight(0xffe4c4, isNuoOpera ? 1.8 : 1.2);
  keyLight.position.set(0.8, 1.4, 2.2);
  group.add(keyLight);
  if (isNuoOpera) {
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.75);
    fillLight.position.set(-1.4, 0.4, 1.5);
    group.add(fillLight);
  }
}

async function loadMeshyGroup(THREE, id, targetHeight = 2.65) {
  const asset = getCharacterFilterAsset(id);
  if (!asset) throw new Error(`Missing Meshy asset for ${id}`);

  const gltf = await loadGLTF(THREE, asset);
  const scene = gltf.scene || gltf.scenes?.[0];
  if (!scene) throw new Error(`Meshy asset has no scene: ${id}`);

  applyMeshyTextureTransforms(THREE, gltf, scene);
  configureMeshyMaterials(THREE, scene);
  normalizeMeshyMask(THREE, scene, getCharacterFilterRotationY(id), targetHeight);
  const group = new THREE.Object3D();
  group.add(scene);
  addMeshyLights(THREE, group, id);
  group.userData.sourceAsset = asset;
  return group;
}

async function loadMeshyMask(THREE, faceObject, id) {
  const group = await loadMeshyGroup(THREE, id);
  return addToFaceObject(faceObject, group);
}

export function createMeshyPreviewRenderer({ canvas, onError = () => {} }) {
  let renderer = null;
  let scene = null;
  let camera = null;
  let initialized = false;
  let initializing = null;
  let activeId = null;
  let selectionVersion = 0;
  const groups = new Map();

  function render() {
    if (!renderer || !scene || !camera) return;
    renderer.clear(true, true, true);
    renderer.render(scene, camera);
  }

  function init() {
    if (initialized) return true;
    if (initializing) return initializing;
    initializing = Promise.resolve().then(() => {
      const THREE = getThree();
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2));
      renderer.setSize(canvas.width, canvas.height, false);
      renderer.setClearColor(0x000000, 0);
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(32, canvas.width / Math.max(canvas.height, 1), 0.1, 100);
      camera.position.set(0, 0, 5.5);
      camera.lookAt(0, 0, 0);
      initialized = true;
      return true;
    }).catch((error) => {
      initializing = null;
      onError(error);
      throw error;
    });
    return initializing;
  }

  async function select(id) {
    if (!isMeshyCharacterFilter(id)) return false;
    const requestVersion = ++selectionVersion;
    activeId = id;
    groups.forEach((group) => { group.visible = false; });
    await init();
    if (!groups.has(id)) {
      const group = await loadMeshyGroup(getThree(), id, 1.75);
      group.visible = false;
      scene.add(group);
      groups.set(id, group);
    }
    if (requestVersion !== selectionVersion) {
      groups.get(id).visible = false;
      return false;
    }
    groups.get(id).visible = true;
    render();
    return true;
  }

  return {
    init,
    select,
    render,
    isReady: () => initialized,
    getActiveId: () => activeId,
    dispose: () => {
      renderer?.dispose?.();
      groups.clear();
      selectionVersion += 1;
      activeId = null;
      initialized = false;
      initializing = null;
      renderer = null;
      scene = null;
      camera = null;
    },
  };
}

const LOADERS = Object.freeze({
  werewolf: loadWerewolf,
  tiger: loadTiger,
  dog: loadDog,
  anonymous: loadAnonymous,
  pekingOpera: (THREE, faceObject) => loadMeshyMask(THREE, faceObject, "pekingOpera"),
  nuoOpera: (THREE, faceObject) => loadMeshyMask(THREE, faceObject, "nuoOpera"),
  yellowOpera: (THREE, faceObject) => loadMeshyMask(THREE, faceObject, "yellowOpera"),
});

export function createCharacterRenderer({ canvas, video, onReady = () => {}, onError = () => {} }) {
  let faceFilter = null;
  let helper = null;
  let threeStuffs = null;
  let threeCamera = null;
  let activeId = null;
  let selectionVersion = 0;
  let initialized = false;
  let initializing = null;
  const groups = new Map();

  function setVisible(id) {
    groups.forEach((group, groupId) => {
      group.visible = groupId === id;
    });
  }

  async function init() {
    if (initialized) return true;
    if (initializing) return initializing;
    initializing = new Promise((resolve, reject) => {
      try {
        ({ faceFilter, helper } = getJeeliz());
        const THREE = getThree();
        faceFilter.init({
          canvas,
          NNCPath: JEELIZ_BASE + "/neuralNets/",
          videoSettings: { videoElement: video },
          callbackReady: (errorCode, spec) => {
            if (errorCode) {
              reject(new Error("Jeeliz FaceFilter failed: " + errorCode));
              return;
            }
            try {
              threeStuffs = helper.init(spec, () => {});
              threeCamera = helper.create_camera();
              initialized = true;
              onReady();
              resolve(true);
            } catch (error) {
              reject(error);
            }
          },
          callbackTrack: (detectState) => {
            const dogGroup = groups.get("dog");
            if (dogGroup?.userData.tongue) {
              const tongue = dogGroup.userData.tongue;
              const open = detectState?.expressions?.[0] > 0.65;
              tongue.visible = dogGroup.visible && open;
              tongue.material.opacity = open ? 1 : 0;
            }
            if (threeStuffs && threeCamera) helper.render(detectState, threeCamera);
          },
        });
        void THREE;
      } catch (error) {
        reject(error);
      }
    }).catch((error) => {
      initializing = null;
      onError(error);
      throw error;
    });
    return initializing;
  }

  async function select(id) {
    if (!isCharacterFilter(id)) return false;
    const requestVersion = ++selectionVersion;
    activeId = id;
    setVisible(null);
    await init();
    if (!groups.has(id)) {
      const loader = LOADERS[id];
      if (!loader || (isMeshyCharacterFilter(id) && !getCharacterFilterAsset(id))) {
        throw new Error(`Character filter is not configured: ${id}`);
      }
      const group = await loader(getThree(), threeStuffs.faceObject);
      groups.set(id, group);
    }
    if (requestVersion !== selectionVersion) {
      groups.get(id).visible = false;
      return false;
    }
    setVisible(id);
    return true;
  }

  return {
    init,
    select,
    isReady: () => initialized,
    getActiveId: () => activeId,
    dispose: () => {
      if (faceFilter?.destroy) faceFilter.destroy();
      groups.clear();
      selectionVersion += 1;
      activeId = null;
      initialized = false;
      initializing = null;
    },
  };
}
