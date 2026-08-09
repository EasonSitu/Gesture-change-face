# 来源与改动说明

## 主要参考来源

- 初始创意和交互方向参考 [sophiamyang/finger-frame-effect](https://github.com/sophiamyang/finger-frame-effect)。
- 人物滤镜的脸部跟踪、Three.js 示例结构和模型资源参考 [jeeliz/jeelizFaceFilter](https://github.com/jeeliz/jeelizFaceFilter)，本项目使用了其中的 [Werewolf](https://jeeliz.com/demos/faceFilter/demos/threejs/werewolf/)、[Tiger](https://jeeliz.com/demos/faceFilter/demos/threejs/tiger/)、[Dog](https://jeeliz.com/demos/faceFilter/demos/threejs/dog_face/) 和 [Anonymous](https://jeeliz.com/demos/faceFilter/demos/threejs/anonymous/) 示例资源。
- 手部关键点检测使用 [MediaPipe Tasks Vision](https://github.com/google-ai-edge/mediapipe/tree/master/mediapipe/tasks/web) 的 Hand Landmarker。
- 人物滤镜运行时使用 [Three.js](https://github.com/mrdoob/three.js)。

## 本项目做的改动

- 将原本的手指框选效果整理为一个无构建步骤的静态网页 MVP。
- 增加食指/拇指点位标记、四边形框线、点位短暂保留和双手捏合切换。
- 保留 Pixelate、Blur、Invert、Noir、Glitch 五个 Canvas 特效。
- 接入 Werewolf、Tiger、Dog、Anonymous 四个人物滤镜，并复用同一个摄像头流。
- 增加人物滤镜切换竞态保护，避免旧模型在新模型之后加载完成并重新显示。
- 将人物滤镜裁剪合成到手指四边形内部，框外保持原始摄像头画面。
- 所有检测和特效默认在浏览器本地运行，不需要 API key 或应用后端。

## 许可证与资源说明

Jeeliz FaceFilter 核心库仓库声明使用 Apache-2.0。人物示例代码和模型资源请以 [jeelizFaceFilter 仓库](https://github.com/jeeliz/jeelizFaceFilter) 及对应示例目录中的许可证、README 和来源要求为准。本项目没有复制这些模型文件到仓库，而是按需从公开 CDN 加载，并保留上面的来源链接。

本项目新增代码仅代表本项目的实现改动；它不改变第三方代码、模型或素材的原有版权和许可证。
