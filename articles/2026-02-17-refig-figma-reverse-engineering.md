# refig — 逆向工程 Figma .fig 二进制格式的离线渲染器

> **来源**: [r/GraphicsProgramming](https://www.reddit.com/r/GraphicsProgramming/comments/1r74wox/)
> **标签**: Develop, Design, Render

💡 **看点：不需要 Figma app 或浏览器，离线把 .fig 文件渲染成 PNG/SVG/PDF。**

---

## 背景

CI/pipeline 里处理 Figma 导出一直很痛苦：浏览器自动化慢且不稳定，Images API 依赖网络和 token，签名 URL 会过期，离线环境更是没法用。

## refig 的方案

**直接解析 .fig 二进制**，离线渲染：

- **.fig 解析**：Figma 的 .fig 是私有的 Kiwi 二进制格式（有时包在 ZIP 里），实现了底层解析器 fig-kiwi
- **统一中间表示**：.fig 和 REST JSON 都转成 Grida IR
- **渲染**：通过 WASM + Skia 渲染为 PNG/JPEG/WebP/PDF/SVG
- **图片处理**：.fig 内嵌图片字节；REST JSON 引用 hash，需要传入 images/ 目录

## 用法

```bash
npx @grida/refig ./design.fig --node "1:23" --out ./out.png
npx @grida/refig ./design.fig --export-all --out ./exports
```

## 链接

- npm: [@grida/refig](https://www.npmjs.com/package/@grida/refig)
- 仓库: [gridaco/grida](https://github.com/gridaco/grida)
