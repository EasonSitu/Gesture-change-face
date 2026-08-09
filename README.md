# Finger Frame MVP

一个无构建步骤的浏览器小实验：MediaPipe 在浏览器里追踪双手，四个拇指/食指指尖形成一个四边形，Canvas 只在四边形内绘制特效。

目前有 9 个滤镜：

- `Pixelate`、`Blur`、`Invert`、`Noir`、`Glitch`：原有 Canvas 特效。
- `Werewolf`、`Tiger`、`Dog`、`Anonymous`：来自 Jeeliz FaceFilter 示例的成熟人物滤镜，使用真实的脸部跟踪和 3D 模型资源。

## 本地运行

在本目录运行任意静态文件服务器：

```powershell
py -m http.server 8123
```

打开：

- 摄像头模式：<http://localhost:8123>
- 无摄像头 Demo：<http://localhost:8123/?demo>
- 捏合模拟 Demo：<http://localhost:8123/?demo&pinch>
- 摄像头模式并预选人物滤镜：<http://localhost:8123/?character=werewolf>

摄像头模式需要允许浏览器权限。正式部署时必须使用 HTTPS；Demo 模式不需要摄像头权限。

画布上的 `I` 和 `T` 标记分别表示食指尖和拇指尖。即使四个点暂时不能组成有效四边形，最近一次检测到的点位也会短暂保留并淡出。

当两只手同时把拇指和食指捏近时，会触发一次效果切换。松开后再次捏合，才会切换到下一个效果；每次切换有短暂冷却，避免一个动作连续跳过多个效果。

人物滤镜会复用现有摄像头流，并按需加载对应模型。脸部 3D 画布会先和原始摄像头画面合成，再裁剪到双手指尖形成的四边形内；框外保持原始画面。人物滤镜需要摄像头模式，`?demo` 只用于查看原有 Canvas 特效。

## 测试

几何、手势和滤镜注册模块使用 Node 内置测试，不需要安装 npm 依赖：

```powershell
node --test test/geometry.test.mjs test/gestures.test.mjs test/character-filters.test.mjs test/frame-composite.test.mjs
```

## 部署

这是纯静态网站，可以部署到任何支持静态文件的服务器、对象存储或静态托管平台。服务器只负责返回 HTML、JavaScript、CSS 和静态资源；手部检测、摄像头和特效都在用户浏览器本地执行。

MediaPipe runtime/WASM、手部模型、Jeeliz FaceFilter、Three.js 和人物模型默认从公共 CDN 加载，因此首次打开需要网络连接。若要完全自托管，可以把对应资源下载到站点内，再修改 `main.js` 和 `src/character-renderer.mjs` 中的地址。

人物滤镜代码和模型资源来自 [jeeliz/jeelizFaceFilter](https://github.com/jeeliz/jeelizFaceFilter)，对应示例包括 [Werewolf](https://jeeliz.com/demos/faceFilter/demos/threejs/werewolf/)、[Tiger](https://jeeliz.com/demos/faceFilter/demos/threejs/tiger/)、[Dog](https://jeeliz.com/demos/faceFilter/demos/threejs/dog_face/) 和 [Anonymous](https://jeeliz.com/demos/faceFilter/demos/threejs/anonymous/)。Jeeliz 核心库采用 Apache-2.0；示例代码与模型资源请继续遵守原仓库及对应目录的许可证，并保留来源说明。

更完整的来源、许可证和本项目改动记录见 [ATTRIBUTIONS.md](ATTRIBUTIONS.md)。初始手指框选创意参考 [sophiamyang/finger-frame-effect](https://github.com/sophiamyang/finger-frame-effect)。

## API key

本 MVP 不需要 API key，也没有上传摄像头画面的代码。只有以后接入云端 AI 风格迁移、视频保存或用户账号时，才需要后端和相应服务配置。
