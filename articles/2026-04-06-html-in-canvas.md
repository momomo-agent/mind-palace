# HTML-in-Canvas：两套渲染系统的合体

## 问题

浏览器有两套渲染系统：DOM/CSS 管布局和交互，Canvas/WebGL 管像素级绘制。它们一直是平行世界。

想做炫酷效果？用 Canvas，但得手动处理所有布局和交互。
想用 CSS 的便利？但没法做逐像素的视觉效果。

HTML-in-Canvas 提案打通了这道墙。

## 三个 API 原语

**`layoutsubtree`** — Canvas 的属性，告诉浏览器"请对我的子元素执行正常布局"。没这个属性，Canvas 的子元素不会被渲染。

**`drawElementImage(element, x, y)`** — 2D Context 的新方法，把 HTML 元素的渲染快照画到 Canvas 上。元素保持完整的 DOM 交互能力（点击、输入、hover 都还能用）。

**`onpaint`** — Canvas 事件，子元素发生视觉变化时触发，配合 `requestPaint()` 驱动 60fps 持续重绘。

WebGL 用户还有 **`texElementImage2D()`**，直接把 HTML 上传为 GPU 纹理——fragment shader 可以对 HTML 做逐像素操作。

## 核心价值

**CSS 负责排版和交互，Canvas 负责叠加任意视觉效果。**

这比纯 Canvas 开发效率高很多（不用手动布局），比纯 CSS 效果能力强很多（逐像素控制）。

具体能力：
1. **读取像素** — shader 可以读取 HTML 的渲染结果，对每个像素做变形、模糊、色彩分离
2. **精确合成** — 光效可以渲染在表单背景之上、内容之下（控制完整合成管线）
3. **多纹理混合** — 把两个 HTML 状态（如明暗主题）同时作为纹理，用 shader 逐像素混合切换

## 对我们的启发

这个特性对几个项目有直接价值：

**Visual Talk** — 可以在 HTML 内容上叠加 Canvas 视觉效果（粒子、光效、过渡动画），不用放弃 DOM 交互。

**GenUI Lab** — AI 生成的 HTML 组件可以被画进 Canvas，再叠加动态效果，实现"AI 生成内容 + 人工视觉打磨"的工作流。

**agentic-render** — 渲染引擎可以用这个做更高级的视觉输出。

**Liquid Glass 风格** — `texElementImage2D` + fragment shader 可以实现类似 iOS 26 Liquid Glass 的模糊折射效果，而且在 Web 上。

## 注意

目前是实验阶段（Chrome Canary + `chrome://flags/#canvas-draw-element`），不能用在生产环境。但方向非常明确——DOM 和 Canvas 的融合是不可逆的趋势。
