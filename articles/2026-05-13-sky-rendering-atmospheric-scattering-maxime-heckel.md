# 浏览器里的真实天空：Maxime Heckel 大气散射 Shader 教程

原文链接：https://blog.maximeheckel.com/posts/on-rendering-the-sky-sunsets-and-planets/

---

## 原文整理

Maxime Heckel（Three.js/React Three Fiber 社区知名博主）花了一个月做了一个完整的大气散射渲染教程，从零到行星级别，全部在浏览器实时运行。

### 三层递进结构

**第一层：Sky Dome（天空穹顶）**
- Raymarching 采样大气密度
- Rayleigh 散射（空气分子）：短波长散射更强 → 天空蓝色
- Mie 散射（气溶胶/灰尘）：前向散射 → 太阳周围的光晕
- 臭氧吸收：600nm 红光被吸收 → 天顶偏紫/深蓝
- Beer's Law 计算 transmittance（光在大气中的衰减）

**第二层：行星大气壳层**
- 从 sky dome 扩展到球体几何
- 射线-球体求交（inner/outer atmosphere boundary）
- 观察者可以在大气内部或外部
- 多重散射近似（光被散射后再次被散射）

**第三层：Hillaire LUT 优化**
- Sébastien Hillaire (Unreal Engine) 的 Production Ready Atmosphere Rendering
- 预计算 Transmittance LUT + Multi-Scattering LUT + Sky-View LUT + Aerial Perspective LUT
- 把 O(n²) 的嵌套 raymarching 降到 O(1) 的纹理查找
- Maxime 坦言这部分是"走出舒适区"，实现不完美但展示了思路

### 关键物理参数

| 参数 | 值 | 含义 |
|------|-----|------|
| Rayleigh Scale Height | 8 km | 空气密度指数衰减的特征高度 |
| Mie Scale Height | 1.2 km | 气溶胶集中在低层 |
| Atmosphere Height | 100 km | 卡门线 |
| Rayleigh β | (5.8, 13.5, 33.1) × 10⁻⁶ | RGB 散射系数，蓝 > 绿 > 红 |
| Mie β | 21 × 10⁻⁶ | 波长无关（灰白色） |
| Ozone β | (3.426, 8.298, 0.356) × 10⁻⁷ | 吸收红光，保留蓝紫 |

### 交互式 Widget

文章最大亮点是每个概念都配了可调参数的交互式 demo：
- 单条射线的 raymarching 步进可视化
- 太阳角度实时调节看日出日落
- 观察者高度从地面到太空连续变化
- Rayleigh/Mie/Ozone 各层独立开关

### 代码风格

GLSL 代码完整可运行，命名清晰（`rayleighDensity`, `viewOpticalDepth`, `transmittance`），注释到位。用 React Three Fiber 做 demo 框架。

---

## 启发与见解

### 1. 跟我们 sky-compare 项目的直接对照

我们 4 月做 sky-compare 天空渲染时用的是 globalMsFade 分段线性 + warmTint 2000K + ACES tonemap 的经验调参路线。Maxime 这篇是完全物理正确的路线——Rayleigh/Mie/Ozone 三层各自有物理系数，不需要手调 warmTint。

两条路线的 tradeoff：
- 物理正确路线：参数有物理意义，换场景不用重新调，但计算量大（嵌套 raymarching）
- 经验调参路线：快、可控、适合特定美术风格，但换场景要重新调

Hillaire LUT 是两者的桥梁——物理正确但预计算后 O(1) 查表，性能跟经验调参一样快。

### 2. 交互式 Widget 是 shader 教学的正确形态

静态代码 + 静态截图永远讲不清 shader。Maxime 的每个 widget 都让你拖参数看结果变化——这比任何文字解释都有效。

对 Momo 的启发：以后写 shader 相关的文章或教程，应该用 canvas + slider 做交互 demo，不是贴截图。Mind Palace 的文章格式可以考虑支持嵌入式 demo。

### 3. 臭氧层的视觉贡献被低估

大多数大气散射实现只做 Rayleigh + Mie，跳过臭氧。但臭氧吸收 600nm 红光的效果在高海拔和 twilight 时非常明显——天顶那种深蓝/紫色就是臭氧的贡献。我们 sky-compare 里没加这一层，如果要做"从太空看地球"的效果，臭氧是必须的。

### 4. Hillaire LUT 方案值得单独研究

4 张 LUT（Transmittance + Multi-Scattering + Sky-View + Aerial Perspective）把整个大气渲染降到纹理查找。这个方案是 Unreal Engine 5 的 Sky Atmosphere 组件的基础，也是目前游戏行业的标准做法。Shadertoy 上有完整实现可以直接跑。

---

## 相关链接

- [Production Ready Atmosphere Rendering — Hillaire (EGSR 2020)](https://sebh.github.io/publications/egsr2020.pdf) — Unreal Engine Sky Atmosphere 的理论基础，LUT 预计算方案
- [Production Sky Rendering — Shadertoy](https://www.shadertoy.com/view/slSXRW) — Hillaire 论文的可运行 Shadertoy 实现
- [Maxime Heckel 的 Volumetric Clouds 文章](https://blog.maximeheckel.com/posts/real-time-cloudscapes-with-volumetric-raymarching/) — 同作者的体积云教程，raymarching 基础相同
