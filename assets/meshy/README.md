# 本地戏曲面具素材

这三个 GLB 已随项目提供，并用于“面具变脸”分类：

- `peking-opera-mask.glb`
- `nuo-opera-mask.glb`
- `yellow-opera-mask.glb`

用户选择对应效果后，页面会按需读取本地文件。运行时不访问 Meshy，不需要 Meshy 账号，也不需要 API key。来源页、作者记录和许可证核对边界见仓库根目录的 [ATTRIBUTIONS.md](../../ATTRIBUTIONS.md)。

如果未来替换模型：

1. 先确认模型页面当前显示的作者、许可证和再分发要求；
2. 保留与新文件对应的来源记录；
3. 使用上面的文件名替换模型；
4. 运行 `scripts/normalize-meshy-glb.mjs`，检查 Three.js v97 能否读取模型及其 WebP 纹理；
5. 运行 `npm test`，再在摄像头和示例模式中各切换一次面具效果。
