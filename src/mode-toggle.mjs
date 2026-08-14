export function getModeToggleState({ isDemo = false, locale = "zh-CN" } = {}) {
  const language = encodeURIComponent(locale);
  return isDemo
    ? { labelKey: "controls.enableCamera", href: `?lang=${language}` }
    : { labelKey: "controls.disableCamera", href: `?demo&lang=${language}` };
}
