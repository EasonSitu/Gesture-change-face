export const DEFAULT_LOCALE = "zh-CN";

export const LOCALE_OPTIONS = Object.freeze([
  Object.freeze({ value: "zh-CN", label: "简体中文" }),
  Object.freeze({ value: "zh-TW", label: "繁體中文" }),
  Object.freeze({ value: "en", label: "English" }),
]);

const MESSAGES = Object.freeze({
  "zh-CN": {
    language: { label: "语言" },
    brandName: "魔法画框",
    document: { title: "魔法画框 · FrameShift", stageLabel: "实时画面" },
    status: {
      loadingTitle: "正在准备画面…",
      loadingDetail: "第一次打开可能需要几秒。",
      loadingEffectTitle: "正在加载效果…",
      loadingEffectDetail: "正在准备「{effect}」，请稍候。",
      loadingProgressLabel: "加载进度",
      cameraTitle: "正在准备摄像头…",
      cameraDetail: "允许摄像头后，就可以开始玩了。",
      permissionTitle: "请允许使用摄像头…",
      permissionDetail: "在浏览器弹窗中点击“允许”，即可开始。",
      retry: "重新尝试",
      errorPermission: "摄像头没有打开。你可以先看看示例，或重新尝试。",
      errorGeneric: "暂时无法打开摄像头：{error}",
      errorTitle: "摄像头暂时不可用",
      noFrame: "还没有识别到完整画框，再试一次",
      captureFailed: "截图失败，请重试",
      captureSaved: "画面已保存",
      demoOperaOnly: "示例暂时支持三个面具变脸效果",
      demoCharacterFailed: "示例效果加载失败",
      characterFailed: "人物滤镜加载失败",
      effectFailed: "效果加载失败，请重试",
      noCategory: "请至少开启一类捏合效果",
      pinchEffect: "双手捏合 · {effect}",
      demoLabel: "示例画面",
      fullscreenUnsupported: "当前浏览器不支持全屏",
      fullscreenFailed: "全屏未开启，请再试一次",
    },
    controls: {
      help: "使用帮助",
      fullscreen: "进入全屏",
      exitFullscreen: "退出全屏",
      actions: "画面操作",
      effects: "选择效果",
      gestureControl: "怎么玩？",
      gestureSettings: "捏合设置",
      gestureNote: "双手捏合切换，也可以直接点击",
      pinchEnabled: "捏合切换",
      capture: "3 秒后保存",
      enableCamera: "启用摄像头",
      disableCamera: "关闭摄像头",
    },
    demo: { title: "示例画面", subtitle: "试试不同效果" },
    categories: {
      basic: "基础效果",
      funMask: "趣味面具",
      faceChange: "面具变脸",
    },
    effects: {
      pixelate: "像素化",
      blur: "模糊",
      invert: "反色",
      noir: "黑白",
      glitch: "故障",
      cartoon: "漫画",
      sketch: "线稿",
      werewolf: "狼人",
      tiger: "老虎",
      dog: "小狗",
      anonymous: "匿名",
      pekingOpera: "京剧",
      nuoOpera: "傩戏",
      yellowOpera: "黄梅戏",
    },
  },
  "zh-TW": {
    language: { label: "語言" },
    brandName: "魔法畫框",
    document: { title: "魔法畫框 · FrameShift", stageLabel: "即時畫面" },
    status: {
      loadingTitle: "正在準備畫面…",
      loadingDetail: "第一次開啟可能需要幾秒。",
      loadingEffectTitle: "正在載入效果…",
      loadingEffectDetail: "正在準備「{effect}」，請稍候。",
      loadingProgressLabel: "載入進度",
      cameraTitle: "正在準備攝影機…",
      cameraDetail: "允許攝影機後，就可以開始玩了。",
      permissionTitle: "請允許使用攝影機…",
      permissionDetail: "在瀏覽器彈窗中點擊「允許」，即可開始。",
      retry: "重新嘗試",
      errorPermission: "攝影機沒有開啟。你可以先看看示範，或重新嘗試。",
      errorGeneric: "暫時無法開啟攝影機：{error}",
      errorTitle: "攝影機暫時不可用",
      noFrame: "還沒有辨識到完整畫框，再試一次",
      captureFailed: "截圖失敗，請重試",
      captureSaved: "畫面已儲存",
      demoOperaOnly: "示範暫時支援三個面具變臉效果",
      demoCharacterFailed: "示範效果載入失敗",
      characterFailed: "人物濾鏡載入失敗",
      effectFailed: "效果載入失敗，請重試",
      noCategory: "請至少開啟一類捏合效果",
      pinchEffect: "雙手捏合 · {effect}",
      demoLabel: "示範畫面",
      fullscreenUnsupported: "目前瀏覽器不支援全螢幕",
      fullscreenFailed: "全螢幕未開啟，請再試一次",
    },
    controls: {
      help: "使用說明",
      fullscreen: "進入全螢幕",
      exitFullscreen: "退出全螢幕",
      actions: "畫面操作",
      effects: "選擇效果",
      gestureControl: "怎麼玩？",
      gestureSettings: "捏合設定",
      gestureNote: "雙手捏合切換，也可以直接點擊",
      pinchEnabled: "捏合切換",
      capture: "3 秒後儲存",
      enableCamera: "啟用攝影機",
      disableCamera: "關閉攝影機",
    },
    demo: { title: "示範畫面", subtitle: "試試不同效果" },
    categories: {
      basic: "基礎效果",
      funMask: "趣味面具",
      faceChange: "面具變臉",
    },
    effects: {
      pixelate: "像素化",
      blur: "模糊",
      invert: "反色",
      noir: "黑白",
      glitch: "故障",
      cartoon: "漫畫",
      sketch: "線稿",
      werewolf: "狼人",
      tiger: "老虎",
      dog: "小狗",
      anonymous: "匿名",
      pekingOpera: "京劇",
      nuoOpera: "儺戲",
      yellowOpera: "黃梅戲",
    },
  },
  en: {
    language: { label: "Language" },
    brandName: "FrameShift",
    document: { title: "FrameShift", stageLabel: "Live view" },
    status: {
      loadingTitle: "Getting things ready…",
      loadingDetail: "The first launch may take a few seconds.",
      loadingEffectTitle: "Loading effect…",
      loadingEffectDetail: "Preparing {effect}. One moment.",
      loadingProgressLabel: "Loading progress",
      cameraTitle: "Preparing your camera…",
      cameraDetail: "Allow camera access to get started.",
      permissionTitle: "Camera permission needed…",
      permissionDetail: "Click “Allow” in the browser prompt to begin.",
      retry: "Try again",
      errorPermission: "Camera access is off. Try the example or try again.",
      errorGeneric: "The camera could not start: {error}",
      errorTitle: "Camera is unavailable",
      noFrame: "The full frame is not detected yet. Try again.",
      captureFailed: "Capture failed. Try again.",
      captureSaved: "Saved",
      demoOperaOnly: "The example currently supports three face-change masks",
      demoCharacterFailed: "The example effect could not load",
      characterFailed: "Character filter failed to load",
      effectFailed: "The effect could not load. Try again.",
      noCategory: "Enable at least one pinch category",
      pinchEffect: "Two-hand pinch · {effect}",
      demoLabel: "Example view",
      fullscreenUnsupported: "Fullscreen is not supported in this browser",
      fullscreenFailed: "Fullscreen could not start. Try again.",
    },
    controls: {
      help: "Help",
      fullscreen: "Enter fullscreen",
      exitFullscreen: "Exit fullscreen",
      actions: "View actions",
      effects: "Effects",
      gestureControl: "How to play",
      gestureSettings: "Pinch settings",
      gestureNote: "Pinch with both hands, or tap an effect",
      pinchEnabled: "Pinch to switch",
      capture: "Save in 3 seconds",
      enableCamera: "Enable camera",
      disableCamera: "Turn off camera",
    },
    demo: { title: "EXAMPLE", subtitle: "Try different effects" },
    categories: {
      basic: "Basic Effects",
      funMask: "Fun Masks",
      faceChange: "Face Change",
    },
    effects: {
      pixelate: "Pixelate",
      blur: "Blur",
      invert: "Invert",
      noir: "Noir",
      glitch: "Glitch",
      cartoon: "Cartoon",
      sketch: "Sketch",
      werewolf: "Werewolf",
      tiger: "Tiger",
      dog: "Dog",
      anonymous: "Anonymous",
      pekingOpera: "Peking Opera",
      nuoOpera: "Nuo Opera",
      yellowOpera: "Yellow Opera",
    },
  },
});

function readPath(value, key) {
  return key.split(".").reduce((current, segment) => current?.[segment], value);
}

export function normalizeLocale(value) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "zh-tw" || normalized.startsWith("zh-hk") || normalized.startsWith("zh-mo")) return "zh-TW";
  if (normalized === "en" || normalized.startsWith("en-")) return "en";
  return DEFAULT_LOCALE;
}

export function getInitialLocale({ query = "", stored = "", browser = "" } = {}) {
  const queryLocale = new URLSearchParams(query).get("lang");
  if (queryLocale) return normalizeLocale(queryLocale);
  if (stored) return normalizeLocale(stored);
  return normalizeLocale(browser);
}

export function getMessage(locale, key) {
  return readPath(MESSAGES[normalizeLocale(locale)], key) ?? key;
}

export function getCategoryLabel(locale, id) {
  return getMessage(locale, `categories.${id}`);
}

export function getEffectLabel(locale, id) {
  return getMessage(locale, `effects.${id}`);
}
