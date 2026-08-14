# 来源、许可与实现边界

这份文件记录项目使用的第三方技术、示例资源和本地模型，也说明哪些部分是本项目自己的组合与改动。第三方资源的许可证可能随仓库、示例目录或模型页面变化，发布或替换资源前应再次核对对应页面。

## 主要技术来源

- 手指框选的初始创意和交互方向参考 [sophiamyang/finger-frame-effect](https://github.com/sophiamyang/finger-frame-effect)。本项目重新组织了页面结构、效果分类、加载流程、截图流程和多语言界面。
- 手部关键点检测使用 [MediaPipe Tasks Vision](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/tasks/web) 的 Hand Landmarker。
- 人物滤镜的脸部跟踪、Three.js 示例结构和部分人物资源参考 [jeeliz/jeelizFaceFilter](https://github.com/jeeliz/jeelizFaceFilter)。本项目使用其公开示例中的 [Werewolf](https://jeeliz.com/demos/faceFilter/demos/threejs/werewolf/)、[Tiger](https://jeeliz.com/demos/faceFilter/demos/threejs/tiger/)、[Dog](https://jeeliz.com/demos/faceFilter/demos/threejs/dog_face/) 和 [Anonymous](https://jeeliz.com/demos/faceFilter/demos/threejs/anonymous/) 资源。
- 人物渲染运行时使用 [Three.js](https://github.com/mrdoob/three.js) 和对应的 GLTFLoader。
- `Sketch` 的边缘检测参考 [OpenCV.js Canny 官方示例](https://docs.opencv.org/4.13.0/d7/de1/tutorial_js_canny.html)。仓库内的 `assets/opencv.js` 是兼容浏览器全局加载的 OpenCV.js 4.12.0 release build，来源记录为 [TechStark/opencv-js releases](https://github.com/TechStark/opencv-js/releases)；官方文档构建和远程地址只作为后备路径。

## 本地戏曲面具素材

三个戏曲面具模型来自 Meshy 社区模型页，当前运行时只读取仓库内的本地 GLB，不会访问 Meshy，也不包含 Meshy 账号信息、签名下载地址或 API key。以下作者信息和页面状态是接入时记录，模型使用、再分发或替换前请以对应页面当前显示的许可证和来源要求为准。

- [Peking Opera Mask Illustration](https://www.meshy.ai/zh/3d-models/Peking-Opera-Mask-Illustration-019513fc-b2a8-720c-bc4c-c4b5285146be)：接入时记录作者为 `inbornts`；本地文件为 `assets/meshy/peking-opera-mask.glb`。
- [A traditional Chinese Nuo opera mask with fierce red and gold demon face, carved wood texture, ornate horns and fangs, ceremonial theater prop](https://www.meshy.ai/vi/3d-models/019ca891-fbed-7097-ae80-bc7bcbad6fc7)：接入时记录作者为 `boliu`；本地文件为 `assets/meshy/nuo-opera-mask.glb`。
- [Yellow Opera Mask](https://www.meshy.ai/zh/3d-models/Yellow-Opera-Mask-01938564-2518-705e-a46a-ff69ee30544f)：接入时记录作者为 `53505495`；本地文件为 `assets/meshy/yellow-opera-mask.glb`。

接入日期：2026-08-11。仓库只保留已经整理好的本地 GLB 和来源记录；运行时不会请求 Meshy 页面或第三方模型接口。若未来替换模型，应先保存新的来源与许可证记录，再运行 `scripts/normalize-meshy-glb.mjs` 检查 Three.js v97 所需的纹理兼容性。

## 本项目的实现改动

- 将手指框选的核心想法整理为无构建步骤的静态网页，并提供摄像头模式和无摄像头示例模式。
- 增加食指、拇指点位标记、四边形框线、点位短暂保留、不规则四边形和交叉双三角形区域。
- 将 14 个效果分为基础效果、趣味面具和面具变脸三类，并提供总捏合开关和分类开关。
- 保留 Pixelate、Blur、Invert、Noir、Glitch 五个 Canvas 效果，新增 Cartoon 颜色分层/边缘描线和基于 `cv.Canny()` 的 Sketch 线稿效果。
- 接入 Werewolf、Tiger、Dog、Anonymous 四个人物滤镜，复用同一个摄像头流。
- 将人物滤镜与本地戏曲面具裁剪到手指四边形内部，框外保持原始摄像头画面。
- 对人物模型和 OpenCV.js 采用按需加载、加载进度、失败回退和过期结果保护，减少首次打开的等待和快速切换时的错乱。
- 增加示例模式、帮助弹窗、三语界面、响应式布局、全屏模式、权限提示、三秒截图和模式切换。
- 所有检测和特效默认在浏览器本地运行，不需要 API key 或应用后端。

## 许可证与使用边界

- Jeeliz FaceFilter 核心仓库声明使用 Apache-2.0。人物示例代码、示例目录和模型资源请以 [jeelizFaceFilter 仓库](https://github.com/jeeliz/jeelizFaceFilter) 及对应目录中的许可证、README 和来源要求为准。
- 本项目没有把 Jeeliz 示例模型文件重新复制进仓库，而是按需从公开运行地址加载，并在上面保留来源链接。若未来改为完全自托管，需要同时保留对应的许可证和来源说明。
- MediaPipe、Three.js、OpenCV.js 以及其他 CDN 运行资源请遵守各自项目的许可证和发布条款。
- 三个 Meshy 面具以本地 GLB 形式放在 `assets/meshy/`，作者和来源页列在上面。页面许可应以当前模型页为准，不应仅凭本文件的历史记录推断后续替换文件仍然适用。
- 本项目新增代码只代表本项目的实现改动，不改变第三方代码、模型或素材原有的版权和许可证。
