export const HELP_IMAGE_SRC = "assets/help/frameshift-help-a.png";

const HELP_CONTENT = Object.freeze({
  "zh-CN": Object.freeze({
    title: "怎么用？",
    close: "关闭帮助",
    start: "开始体验",
    imageAlt: "双手框住画面，再捏合切换效果",
    steps: Object.freeze([
      Object.freeze({ label: "框住画面", detail: "食指在上，拇指在下。" }),
      Object.freeze({ label: "捏合换效果", detail: "两只手同时捏合。" }),
    ]),
  }),
  "zh-TW": Object.freeze({
    title: "怎麼用？",
    close: "關閉說明",
    start: "開始體驗",
    imageAlt: "雙手框住畫面，再捏合切換效果",
    steps: Object.freeze([
      Object.freeze({ label: "框住畫面", detail: "食指在上，拇指在下。" }),
      Object.freeze({ label: "捏合換效果", detail: "兩隻手同時捏合。" }),
    ]),
  }),
  en: Object.freeze({
    title: "How to use",
    close: "Close help",
    start: "Get started",
    imageAlt: "Frame the view with both hands, then pinch to switch effects",
    steps: Object.freeze([
      Object.freeze({ label: "Frame the screen", detail: "Index fingers up, thumbs down." }),
      Object.freeze({ label: "Pinch to switch", detail: "Pinch with both hands." }),
    ]),
  }),
});

export function getHelpContent(locale = "zh-CN") {
  return HELP_CONTENT[locale] || HELP_CONTENT["zh-CN"];
}
