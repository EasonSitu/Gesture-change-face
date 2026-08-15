import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), "utf8");
}

test("documents the current product surface and online entry points", () => {
  const readme = read("README.md");
  assert.match(readme, /https:\/\/easonsitu\.github\.io\/Gesture-change-face\//);
  assert.match(readme, /在线体验由 GitHub Pages 提供/);
  assert.match(readme, /当前共有 14 个效果/);
  assert.match(readme, /无摄像头示例/);
  assert.match(readme, /双手捏合/);
  assert.match(readme, /localhost:8123/);
  assert.doesNotMatch(readme, /^## 部署/m);
  assert.doesNotMatch(readme, /三个新增滤镜的代码接入口/);
  assert.doesNotMatch(readme, /请通过每个 Meshy 模型页面的正常导出流程/);
});

test("keeps attribution focused on sources and current local assets", () => {
  const attributions = read("ATTRIBUTIONS.md");
  const meshyReadme = read("assets/meshy/README.md");
  assert.match(attributions, /sophiamyang\/finger-frame-effect/);
  assert.match(attributions, /assets\/meshy\/nuo-opera-mask\.glb/);
  assert.match(meshyReadme, /这三个 GLB 已随项目提供/);
  assert.match(meshyReadme, /运行时不访问 Meshy/);
  assert.doesNotMatch(attributions, /meshy2glb|解密拦截|Kenney Interface Sounds/);
  assert.doesNotMatch(meshyReadme, /加密的 .*\.meshy|请通过.*导出流程/);
});
