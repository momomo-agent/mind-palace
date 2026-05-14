# Raycast 2.0 从零重写：Hybrid 架构的技术深度解析

原文链接：https://www.raycast.com/blog/a-technical-deep-dive-into-the-new-raycast

---

## 原文整理

### 背景

Raycast v1 是纯 AppKit 原生 macOS 应用，几乎不用标准 UI 组件，全部自建。SwiftUI 在 v1 生命周期内成熟但从未达到性能和控制力的标准。扩展生态从一开始就是 React+TS+Node，声明式 UI 由原生渲染。Notes 是第一次在主功能中使用 WebView（React app 挂在原生窗口的 web view 里），验证了 web 技术不破坏原生体感的可行性。

### 为什么重写

2023 年底开始考虑 Windows。但即使不做 Windows，原有架构也到了极限：
- 编译时间越来越长
- AppKit 越来越碍事
- 找深度 macOS 原生开发者越来越难
- 产品已从 launcher 扩展为 AI Chat/Notes/Extensions/Sync/File Search 的生产力平台

代号 "X-Ray"（cross-platform Raycast）。

### 选型过程

**排除 Electron**：虽然 VS Code/Linear/Superhuman 证明了 Electron 能做好产品，但 Raycast 需要深度 OS 集成（global hotkey、clipboard、accessibility API、floating window 不抢焦点、translucent panel），Electron 的 web-native 边界做这些很痛苦。也不想在 macOS 上捆绑 Chromium。

**排除 Tauri**：原生侧控制力不够，当时还太年轻。

**选择 Hybrid 自建**：自己写原生壳 + 系统 WebView。macOS 用 Xcode/Swift/AppKit + WKWebView，Windows 用 Visual Studio/C#/.NET 8/WPF + WebView2。完全控制每个部分之间的通信。

核心判断："We're not a web app with some native hooks sprinkled on top. We're a native app that uses web for its UI."

代价：相当于自己维护 Electron 给你的基础设施（IPC、调试、优化都要自己做）。

### 四层架构

1. **Host App**（平台原生）：Swift+AppKit / C#+.NET 8+WPF。管窗口、global hotkey、menu bar/tray、加载 WebView、监管 Node 进程
2. **Web Frontend**（共享）：一个 React+TS 项目，按窗口（Launcher/AI Chat/Notes/Settings）分 entry point，两平台共用
3. **Node Backend**（共享）：单个长驻 Node 进程，数据库访问、扩展运行时、长驻服务。feature 只写一次
4. **Rust Core**（性能/可移植）：数据层可与 iOS 共享，云同步 schema 与服务端共用，自建文件索引器（秒级全盘扫描）

IPC：平台 message handler + stdio transport。接口声明一处，四个运行时自动生成 typed client，编译时保证类型安全。

### 文件索引器

v1 依赖 Spotlight metadata，v2 用 Rust 从零自建。Windows 上直接读 NTFS Master File Table（唯一能秒级索引全盘的方式）。

### 让 WebView 感觉原生

**反 web convention**：
- 不用 `cursor: pointer`（桌面应用不这样）
- 不用 hover highlight（macOS 按钮/列表不高亮）
- Settings 是独立原生窗口
- Popover/Tooltip 是原生 window 不是 DOM 元素（可以超出 WebView 边界）
- macOS Tahoe 第一时间适配 Liquid Glass
- 消灭所有 view 切换时的闪烁

**与 WebKit throttling 死磕**：
- RAF/CSS animation/timer 在 view 不可见时被节流 → `alphaValue=0` + `windowOcclusionDetectionEnabled=false` 保持逻辑可见
- 展开窗口时 WebKit 认为新区域"在 viewport 外"不渲染 → WKWebView frame 始终保持展开尺寸
- 动画 resize 时 WebKit 暂停绘制 → 用 Core Animation implicit animation 替代 NSWindow.setFrame 动画
- 窗口打开闪白 → `_doAfterNextPresentationUpdate` 同步渲染完成再显示
- Emoji 渲染慢 → 启动时预热 emoji 字体

**Windows WebView2**：
- Acrylic blur-behind + custom title bar 需要精细协调
- 每个窗口独立 WebView2 environment
- 防止 Chromium 在窗口失焦时节流

### 内存与性能

v1: 200-300 MB | v2: 350-450 MB

v2 breakdown（窗口隐藏时）：
- WebView (WebContent): ~120-200 MB
- Node.js backend: ~150-200 MB
- Native app (Swift shell): ~40 MB
- WebKit GPU process: ~18 MB
- WebKit Networking: ~12 MB

空 WebView baseline ≈ 50 MB，空 Node ≈ 12 MB。

v2 更快的地方：Root search 包含全文件搜索（Rust 索引）；AI Chat/rich text 渲染 WebKit 比 TextKit 更优。

### Trade-offs

**更好**：开发速度（hot reload < 1s vs 重编译）、一个团队两平台、招人容易、rich UI 更好做、扩展更简单（不再需要单独装 Node）

**更难**：内存 baseline 更高、四运行时调试复杂、Windows 硬件多样性、某些原生行为（accessibility/drag-drop/IME）需要显式实现、冷启动窗口有短暂延迟

---

## 启发与见解

这篇文章对 Paw 的架构决策有直接参考价值。Paw 也是 Electron 应用，面临类似的"web 感 vs 原生感"张力。几个关键启发：

1. **"Native app that uses web for UI" vs "Web app with native hooks"** — 这个定位差异决定了所有后续决策。Paw 如果要做到 Raycast 级别的原生感，需要在 Electron 框架内尽可能模拟这种思路（或者未来考虑类似的 hybrid 路线）。

2. **反 web convention 清单可以直接抄** — no cursor:pointer、no hover highlight、popover 用原生窗口、settings 独立窗口。这些是低成本高回报的"去 web 感"手段。

3. **WebKit throttling 的解法** — 对任何频繁 show/hide 的桌面应用都适用。alphaValue=0 + 禁用 occlusion detection 是个通用 pattern。

4. **四运行时 typed IPC** — 接口声明一处、四端生成 typed client 的做法值得学习。跨运行时通信的类型安全是大型 hybrid 应用的生命线。

5. **内存诚实** — 他们没有回避 v2 比 v1 多用 50-100MB 的事实，而是解释了为什么这个 trade-off 值得（开发速度、跨平台、招人）。这种诚实的技术沟通方式值得学习。

6. **Rust 做性能关键路径** — 文件索引、数据层、云同步 schema 用 Rust，可以跨 iOS/macOS/Windows 共享。这是 Rust 在桌面应用中最合理的定位。

---

## 相关链接

- [How Raycast API Extensions Work](https://www.raycast.com/blog/how-raycast-api-extensions-work) — Felix 写的 v1 扩展架构，解释了为什么 React+TS+Node 从一开始就是 Raycast 的一部分
- [The New Raycast](https://www.raycast.com/blog/the-new-raycast) — 2.0 产品端 launch post
- [Tauri vs Electron 2026](https://tech-insider.org/tauri-vs-electron-2026/) — 两个框架的最新对比，Raycast 选择都不用的理由在文中
- [The Browser Company: Swift meets WinRT](https://speakinginswift.substack.com/p/swift-meet-winrt) — Raycast 提到的"更冒险"的路线，Arc 团队在 Windows 上跑 Swift
