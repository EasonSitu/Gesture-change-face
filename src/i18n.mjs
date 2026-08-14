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
    document: { title: "魔法画框 · FrameShift", stageLabel: "互动画面" },
    status: {
      loadingTitle: "正在准备体验…",
      loadingDetail: "首次打开可能需要几秒，之后会更快。",
      loadingEffectTitle: "正在准备效果…",
      loadingEffectDetail: "正在把「{effect}」放进画框。",
      loadingProgressLabel: "准备进度",
      cameraTitle: "正在打开摄像头…",
      cameraDetail: "允许摄像头后，就可以开始体验。",
      permissionTitle: "需要使用摄像头…",
      permissionDetail: "点击浏览器提示中的“允许”，把画面带进来。",
      retry: "再试一次",
      errorPermission: "摄像头还没打开。可以先看示例，也可以再试一次。",
      errorGeneric: "摄像头暂时没能打开：{error}",
      errorTitle: "摄像头暂时不可用",
      noFrame: "先把两只手放进画面，组成一个完整画框。",
      captureFailed: "保存失败，请再试一次。",
      captureSaved: "已保存",
      demoOperaOnly: "示范模式目前支持三种面具变脸效果。",
      demoCharacterFailed: "这个示范效果暂时没准备好。",
      characterFailed: "这个人物效果暂时没准备好。",
      effectFailed: "效果没有加载完成，请再试一次。",
      noCategory: "至少保留一类捏合效果。",
      pinchEffect: "已切换 · {effect}",
      demoLabel: "示范模式",
      fullscreenUnsupported: "当前浏览器不支持全屏。",
      fullscreenFailed: "全屏没有打开，请再试一次。",
    },
    controls: {
      help: "帮助",
      fullscreen: "进入全屏",
      exitFullscreen: "退出全屏",
      actions: "画面操作",
      effects: "效果",
      gestureControl: "操作方式",
      gestureSettings: "捏合切换设置",
      gestureNote: "双手捏合换效果，也可以直接点选。",
      pinchEnabled: "启用捏合切换",
      capture: "3 秒后保存",
      enableCamera: "启用摄像头",
      disableCamera: "关闭摄像头",
    },
    demo: { title: "示范模式", subtitle: "先试试，再打开摄像头" },
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
    document: { title: "魔法畫框 · FrameShift", stageLabel: "互動畫面" },
    status: {
      loadingTitle: "正在準備體驗…",
      loadingDetail: "第一次開啟可能需要幾秒，之後會更快。",
      loadingEffectTitle: "正在準備效果…",
      loadingEffectDetail: "正在把「{effect}」放進畫框。",
      loadingProgressLabel: "準備進度",
      cameraTitle: "正在開啟攝影機…",
      cameraDetail: "允許攝影機後，就可以開始體驗。",
      permissionTitle: "需要使用攝影機…",
      permissionDetail: "點擊瀏覽器提示中的「允許」，把畫面帶進來。",
      retry: "再試一次",
      errorPermission: "攝影機還沒開啟。可以先看示範，也可以再試一次。",
      errorGeneric: "攝影機暫時沒能開啟：{error}",
      errorTitle: "攝影機暫時不可用",
      noFrame: "先把雙手放進畫面，組成一個完整畫框。",
      captureFailed: "儲存失敗，請再試一次。",
      captureSaved: "已儲存",
      demoOperaOnly: "示範模式目前支援三種面具變臉效果。",
      demoCharacterFailed: "這個示範效果暫時沒準備好。",
      characterFailed: "這個人物效果暫時沒準備好。",
      effectFailed: "效果沒有載入完成，請再試一次。",
      noCategory: "至少保留一類捏合效果。",
      pinchEffect: "已切換 · {effect}",
      demoLabel: "示範模式",
      fullscreenUnsupported: "目前瀏覽器不支援全螢幕。",
      fullscreenFailed: "全螢幕沒有開啟，請再試一次。",
    },
    controls: {
      help: "說明",
      fullscreen: "進入全螢幕",
      exitFullscreen: "退出全螢幕",
      actions: "畫面操作",
      effects: "效果",
      gestureControl: "操作方式",
      gestureSettings: "捏合切換設定",
      gestureNote: "雙手捏合換效果，也可以直接點選。",
      pinchEnabled: "啟用捏合切換",
      capture: "3 秒後儲存",
      enableCamera: "啟用攝影機",
      disableCamera: "關閉攝影機",
    },
    demo: { title: "示範模式", subtitle: "先試試，再開啟攝影機" },
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
    document: { title: "FrameShift", stageLabel: "Interactive view" },
    status: {
      loadingTitle: "Getting the experience ready…",
      loadingDetail: "The first launch may take a few seconds, then it gets faster.",
      loadingEffectTitle: "Preparing effect…",
      loadingEffectDetail: "Placing {effect} inside the frame.",
      loadingProgressLabel: "Preparation progress",
      cameraTitle: "Starting the camera…",
      cameraDetail: "Allow camera access to get started.",
      permissionTitle: "Camera access needed…",
      permissionDetail: "Choose “Allow” in the browser prompt to bring your view in.",
      retry: "Try again",
      errorPermission: "Camera access is off. Try the example or try again.",
      errorGeneric: "The camera could not start: {error}",
      errorTitle: "Camera is unavailable",
      noFrame: "Place both hands in view to make a complete frame.",
      captureFailed: "Save failed. Try again.",
      captureSaved: "Saved",
      demoOperaOnly: "The example currently supports three face-change masks.",
      demoCharacterFailed: "This example effect is not ready yet.",
      characterFailed: "This character effect is not ready yet.",
      effectFailed: "The effect is not ready. Try again.",
      noCategory: "Keep at least one pinch category enabled.",
      pinchEffect: "Switched · {effect}",
      demoLabel: "Example mode",
      fullscreenUnsupported: "Fullscreen is not supported in this browser.",
      fullscreenFailed: "Fullscreen did not open. Try again.",
    },
    controls: {
      help: "Help",
      fullscreen: "Enter fullscreen",
      exitFullscreen: "Exit fullscreen",
      actions: "View controls",
      effects: "Effects",
      gestureControl: "How to play",
      gestureSettings: "Pinch switching",
      gestureNote: "Pinch with both hands to switch, or choose an effect.",
      pinchEnabled: "Enable pinch switching",
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
