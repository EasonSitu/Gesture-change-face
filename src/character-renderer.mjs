import { isCharacterFilter } from "./character-filters.mjs";

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

const LOADERS = Object.freeze({
  werewolf: loadWerewolf,
  tiger: loadTiger,
  dog: loadDog,
  anonymous: loadAnonymous,
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
