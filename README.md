# 魔法画框 FrameShift

一个打开网页就能玩的手势特效小工具：用两只手框住画面，再捏合切换效果。摄像头、手势识别和画面处理都在浏览器本地完成。

目前有 14 个滤镜：

- `Pixelate`、`Blur`、`Invert`、`Noir`、`Glitch`、`Cartoon`、`Sketch`：浏览器本地 Canvas 特效；其中 `Cartoon` 会降低颜色数量并叠加边缘描线，`Sketch` 使用 OpenCV.js 的 Canny 流程生成黑底白线稿，均只作用于手指框内。
- `Werewolf`、`Tiger`、`Dog`、`Anonymous`：来自 Jeeliz FaceFilter 示例的成熟人物滤镜，使用真实的脸部跟踪和 3D 模型资源。
- `Peking Opera`、`Nuo Opera`、`Yellow Opera`：新增的 Meshy 京剧/傩戏面具 GLB 滤镜，模型放在 `assets/meshy/` 后按需加载。

效果分为三类：基础效果、趣味面具、面具变脸。捏合切换提供一个总开关和三个分类开关；手动点击始终可以选择任意效果，设置会保存在当前浏览器中。

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

四个顶点关系固定为：左食指、右食指、右拇指、左拇指。形状不要求是矩形，可以是倾斜或不规则四边形；当手指翻转使这条固定路径发生交叉时，会使用 `evenodd` 填充规则显示为两个三角形区域。

当两只手同时把拇指和食指捏近时，会触发一次效果切换。松开后再次捏合，才会切换到下一个效果；每次切换有短暂冷却，避免一个动作连续跳过多个效果。点击“3 秒截图”后，用户可以把手放回画框，倒计时结束时自动下载当前 Canvas 合成画面。

人物滤镜会复用现有摄像头流，并按需加载对应模型和 Three.js/Jeeliz 运行库；打开基础效果时不会提前下载人物滤镜运行库。脸部 3D 画布会先和原始摄像头画面合成，再裁剪到双手指尖形成的四边形内；框外保持原始画面。`?demo` 会生成一个本地绘制的示范人物和固定手部轨迹，不需要站到摄像头前；其中三个 Opera 面具支持无摄像头固定预览，其他人物滤镜仍需要摄像头模式。

选择人物滤镜或 `Sketch` 时，画面中央会显示玻璃卡片和分阶段进度，素材准备完成后自动收起；切换到其他效果会立即取消旧的加载提示。桌面宽屏会把画面固定在左侧、功能区放在右侧，小屏幕仍会自动改为上下排列。

页面目前不加载或播放音效，交互反馈通过画面、提示和按钮状态呈现。

## Meshy 面具素材

三个新增滤镜的代码接入口已经完成，但 Meshy 页面直接提供的预览文件是加密的 `.meshy` 格式，不是浏览器可直接加载的 GLB。请通过每个 Meshy 模型页面的正常导出流程下载 GLB，再按 `assets/meshy/README.md` 的文件名放入项目。这样部署后只使用本地静态文件，不需要在网站运行时访问 Meshy，也不需要把账号信息或 API key 放入项目。

对应来源和许可证记录见 [ATTRIBUTIONS.md](ATTRIBUTIONS.md)。

## 测试

几何、手势和滤镜注册模块使用 Node 内置测试，不需要安装 npm 依赖：

```powershell
npm test
```

## 部署

这是纯静态网站，可以部署到任何支持静态文件的服务器、对象存储或静态托管平台。服务器只负责返回 HTML、JavaScript、CSS 和静态资源；手部检测、摄像头和特效都在用户浏览器本地执行。

MediaPipe runtime/WASM、手部模型和基础运行资源默认从公共 CDN 加载，因此首次打开需要网络连接；Three.js、GLTFLoader、Jeeliz FaceFilter 只在首次选择人物/面具时加载。若要完全自托管，可以把对应资源下载到站点内，再修改 `main.js`、`src/runtime-loader.mjs` 和 `src/character-renderer.mjs` 中的地址。

`Sketch` 首次选择时才按需加载 OpenCV.js：优先使用项目内固定的 `assets/opencv.js`，再以 [OpenCV.js 4.13.0 官方构建](https://docs.opencv.org/4.13.0/d7/de1/tutorial_js_canny.html)、固定版本发布构建和公共 CDN 运行库作为后备。项目内文件是兼容浏览器全局加载的 OpenCV.js 4.12.0 release build，因此静态部署不依赖第三方 CDN 才能使用线稿效果；每个候选地址都有超时保护，避免网络异常让页面一直等待。Canny 流程采用降噪、灰度化、梯度边缘筛选，再把结果绘制回当前 Canvas。

人物滤镜代码和模型资源来自 [jeeliz/jeelizFaceFilter](https://github.com/jeeliz/jeelizFaceFilter)，对应示例包括 [Werewolf](https://jeeliz.com/demos/faceFilter/demos/threejs/werewolf/)、[Tiger](https://jeeliz.com/demos/faceFilter/demos/threejs/tiger/)、[Dog](https://jeeliz.com/demos/faceFilter/demos/threejs/dog_face/) 和 [Anonymous](https://jeeliz.com/demos/faceFilter/demos/threejs/anonymous/)。新增面具模型的来源是三个 Meshy 社区模型页，具体链接、作者和页面许可证见 [ATTRIBUTIONS.md](ATTRIBUTIONS.md)。Jeeliz 核心库采用 Apache-2.0；第三方示例与模型资源请继续遵守各自页面和仓库的许可证，并保留来源说明。

更完整的来源、许可证和本项目改动记录见 [ATTRIBUTIONS.md](ATTRIBUTIONS.md)。初始手指框选创意参考 [sophiamyang/finger-frame-effect](https://github.com/sophiamyang/finger-frame-effect)。

## API key

本 MVP 不需要 API key，也没有上传摄像头画面的代码。只有以后接入云端 AI 风格迁移、视频保存或用户账号时，才需要后端和相应服务配置。
