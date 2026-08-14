# 来源与改动说明

## 主要参考来源

- 初始创意和交互方向参考 [sophiamyang/finger-frame-effect](https://github.com/sophiamyang/finger-frame-effect)。
- 人物滤镜的脸部跟踪、Three.js 示例结构和模型资源参考 [jeeliz/jeelizFaceFilter](https://github.com/jeeliz/jeelizFaceFilter)，本项目使用了其中的 [Werewolf](https://jeeliz.com/demos/faceFilter/demos/threejs/werewolf/)、[Tiger](https://jeeliz.com/demos/faceFilter/demos/threejs/tiger/)、[Dog](https://jeeliz.com/demos/faceFilter/demos/threejs/dog_face/) 和 [Anonymous](https://jeeliz.com/demos/faceFilter/demos/threejs/anonymous/) 示例资源。
- 手部关键点检测使用 [MediaPipe Tasks Vision](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/tasks/web) 的 Hand Landmarker。
- 仓库内保留的 [Kenney Interface Sounds](https://kenney.nl/assets/interface-sounds) 文件仅作为未使用的本地素材归档；素材包采用 Creative Commons CC0，当前页面不会加载或播放这些文件。
- 人物滤镜运行时使用 [Three.js](https://github.com/mrdoob/three.js)。
- `Sketch` 的边缘检测使用 [OpenCV.js Canny 官方示例](https://docs.opencv.org/4.13.0/d7/de1/tutorial_js_canny.html)，运行库按首次选择效果时按需加载；项目内的 `assets/opencv.js` 是兼容浏览器全局加载的 OpenCV.js 4.12.0 release build，来源为 [TechStark/opencv-js release](https://github.com/TechStark/opencv-js/releases)，官方文档构建和远程地址仅作为后备。

### 新增 Meshy 面具素材

三个新增面具来自 Meshy 社区模型页。三个页面在本次接入时均标注为 CC0，项目只保留本地 GLB 和来源页，不把 Meshy 账号信息、签名下载地址或运行时 API key 放进仓库。

- [Peking Opera Mask Illustration](https://www.meshy.ai/zh/3d-models/Peking-Opera-Mask-Illustration-019513fc-b2a8-720c-bc4c-c4b5285146be)：作者 `inbornts`；本地文件 `assets/meshy/peking-opera-mask.glb`。
- [A traditional Chinese Nuo opera mask with fierce red and gold demon face, carved wood texture, ornate horns and fangs, ceremonial theater prop](https://www.meshy.ai/vi/3d-models/019ca891-fbed-7097-ae80-bc7bcbad6fc7)：作者 `boliu`；本地文件 `assets/meshy/nuo-opera-mask.glb`。
- [Yellow Opera Mask](https://www.meshy.ai/zh/3d-models/Yellow-Opera-Mask-01938564-2518-705e-a46a-ff69ee30544f)：作者 `53505495`；本地文件 `assets/meshy/yellow-opera-mask.glb`。

接入日期：2026-08-11。页面许可标签以各模型页当前显示为准；如后续重新下载或替换模型，请重新核对单独模型页的许可证和作者信息。

素材取得流程参考社区工具 [youssef02/meshy2glb](https://github.com/youssef02/meshy2glb) 的 Worker 解密拦截思路；该工具没有复制进本项目，仓库只保存已经整理好的本地 GLB 文件。

## 本项目做的改动

- 将原本的手指框选效果整理为一个无构建步骤的静态网页 MVP。
- 增加食指/拇指点位标记、四边形框线、点位短暂保留和双手捏合切换。
- 保留 Pixelate、Blur、Invert、Noir、Glitch 五个 Canvas 特效。
- 新增 Cartoon 颜色分层/边缘描线效果和基于 OpenCV.js `cv.Canny()` 的 Sketch 线稿效果，均限制在手指框选区域内。
- 接入 Werewolf、Tiger、Dog、Anonymous 四个人物滤镜，并复用同一个摄像头流。
- 增加人物滤镜切换竞态保护，避免旧模型在新模型之后加载完成并重新显示。
- 将人物滤镜裁剪合成到手指四边形内部，框外保持原始摄像头画面。
- 保留原有四个人物滤镜，并新增 Peking Opera、Nuo Opera、Yellow Opera 三个本地 GLB 滤镜；使用 Three.js v97 兼容的 GLTFLoader 按需加载。
- 对 Meshy GLB 做离线兼容整理，使 WebP 纹理源可以被当前 GLTFLoader 读取；原始模型只作为外部来源，不在运行时从 Meshy 请求。
- 所有检测和特效默认在浏览器本地运行，不需要 API key 或应用后端。

## 许可证与资源说明

Jeeliz FaceFilter 核心库仓库声明使用 Apache-2.0。人物示例代码和模型资源请以 [jeelizFaceFilter 仓库](https://github.com/jeeliz/jeelizFaceFilter) 及对应示例目录中的许可证、README 和来源要求为准。本项目没有复制 Jeeliz 示例模型文件到仓库，而是按需从公开 CDN 加载，并保留上面的来源链接。三个新增 Meshy 面具以本地 GLB 形式放在 `assets/meshy/`，来源页和作者信息列在上面；使用前请同时遵守对应模型页的许可和来源要求。

本项目新增代码仅代表本项目的实现改动；它不改变第三方代码、模型或素材的原有版权和许可证。
