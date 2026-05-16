# 用 iOS Simulator + XCTest 当"无痕爬虫"

原文链接：https://x.com/barret_china/status/2055663814725787726

---

## 原文整理

Barret 在推文里讲了一个 LinkedIn 被检测到爬取后想出来的"安全替代方案"，原文如下：

> 通过 Xcode simulator 启动一个模拟器，再加上苹果自家的 UI 测试框架 XTest，走 Accessibility API 读取 App 界面的元素树（按钮/文本框/文本内容），并模拟点击、输入、滚动，这样就可以安全地拿到很多被限制的内容了，例如微信/小红书等内容读取。
>
> 之前爬取 LinkedIn 内容的时候，被平台检测到，还发出了警告，想到了这个安全的操作，让 AI Agent 尝试了下，确实可行。
>
> iOS Simulator 里跑的是真 Safari / App，发出去的每个请求都带着合法 User-Agent、TLS 指纹，服务端看到的就一普通 iPhone 用户在刷 feed。因此技术上几乎无痕😄

附了一段 27 秒的演示视频，展示 Agent 在 iOS 模拟器里自动操作 App 的全过程。

核心机制可以拆成三层：

**1. 执行层下沉**

传统爬虫站在 HTTP 层——构造请求、伪造 header、轮换代理。平台的反爬武器也都长在这一层：TLS 指纹、JA3、Cloudflare bot score、行为分析。

把执行层从 HTTP 下沉到 OS UI 自动化层，所有这些武器全部失效。模拟器跑的就是真 App 真 Safari，请求是 App 自己发的，TLS 指纹、User-Agent、签名头、设备特征全都合法。

**2. AX API 当数据接口**

iOS Accessibility API 本来是给视障用户的——读屏软件需要知道屏幕上每个元素的内容、位置、状态。XCTest 把这套 API 包装成自动化测试框架，开发者能拿来跑 UI 测试。

但凡能被 VoiceOver 读出来的内容，都能被 AX API 拿到。也就是说 App 渲染出的所有可见元素，从结构化的元素树到文本内容，都可以程序化读取。这条管道天然合法（残障人士辅助），App 没法关。

**3. 模拟点击/滚动**

XCUIApplication 的 `tap()` / `swipeUp()` / `typeText()` 在模拟器里是真的事件分发，不是合成事件。从 App 视角看跟真用户操作没区别。

---

## 启发与见解

### 这条思路印证 agent-control 的方向是对的

我们做 agent-control 的时候已经走过类似的路径——macOS 平台用 AX API 而不是 cliclick，Electron 用 CDP 而不是合成事件。原则是**站在系统正规接口的肩膀上**，不模拟、不绕过、不对抗。

Barret 这条把同样的原则扩展到 iOS：

- macOS → AXApplication 树
- iOS → XCTest + AX API
- Web → DevTools Protocol
- Android → ADB UiAutomator

每个平台都有 OS 级的"无障碍接口"作为合法切入点。agent-control 已经覆盖前三个，**iOS Simulator 这一支应该被当成 agent-control 的下一个 platform 来做**，而不是单独的爬虫工具。

### "绕反爬"是错误命题

主流爬虫思路一直在往复杂里走——residential proxy、headless 浏览器指纹库、行为模拟、AI 解 captcha。每一层都是跟平台的猫鼠游戏，平台升级就要跟着升级。

Barret 这条思路的优雅之处：**不绕了**。不是发更聪明的请求，是直接当真用户。

这其实是工程上的一种典型"换层"思维——当前层（HTTP）的对抗已经卷到极致，往上一层（OS UI）反而是空的，因为平台在那一层做不了反爬（不能禁止用户用 App）。

### 对 momo 项目的具体启示

**1. agent-control iOS Simulator 平台**

加 `agent-control -p ios-sim --app <bundle-id>`，包装 `xcrun simctl` + WebDriverAgent + AX 读取。命令面跟 macOS 平台对齐：snapshot/click/fill/screenshot。

**2. PocketClaw / Visual Talk 的内容理解**

PocketClaw 在手机本地跑的时候，让它"看"App 的能力可以走 AX API（真机权限不同，需要 Accessibility 权限），但 dev 阶段先在模拟器里训练理解流程是可行的。

**3. 信息聚合类 Agent**

Visual Talk 想做"读小红书/抖音内容然后给我总结"——直接拿 HTTP 几乎不可能（验证签名+TLS 指纹+心跳）。模拟器 + AX 这条路给信息聚合类 Agent 留了一个干净的入口。

### 边界与风险

- **法律灰色**：技术上无痕不代表合规。微信/小红书的 ToS 明确禁止自动化访问，无论从哪一层。商业用途建议老老实实拿 API 授权。
- **效率**：UI 自动化比 HTTP 慢 2-3 个数量级。适合"我自己用"或低频聚合，不适合规模化。
- **App Store 审核**：这套机制只能在自己的开发机/服务器跑，做成 App 提交会被拒（Apple 限制 App 间互相控制）。
- **真机限制**：iOS 真机的 AX 权限需要用户手动授权，且不允许应用读取其他 App 的内容。这条思路本质只在模拟器里跑。

### 一个更大的思考：执行层下沉是 Agent 时代的通用策略

不只是爬虫。所有"被 API 限制住的 Agent 任务"都可以问一下：能不能下沉到 UI 自动化层？

- LLM API 限速 → Agent 自己开浏览器用 ChatGPT 网页版（已经有人在做）
- SaaS 没 API → Agent 操控网页/App
- 数据被锁在 App 里 → Agent 当用户进 App 拿

执行层下沉的代价是慢和粗糙，收益是绕过了一切上层限制。Agent 时代这个 trade-off 越来越值——慢一点没关系，能跑就行。

---

## 相关链接

- [WhisperTest: A Voice-Control-based Library for iOS UI Automation (CCS 2025)](https://gunesacar.net/assets/whisper-test-ios-automation-ccs-25.pdf) — iOS UI 自动化方案的学术综述，把 Apple 安全模型限制和现有 scrape 屏幕内容的所有路径列了一遍
- [Appium XCUITest Driver](https://appium.github.io/appium.io/docs/en/drivers/ios-xcuitest/) — 把 Apple XCUITest 通过 WebDriver 协议暴露给脚本，是 Barret 思路的标准工程化方案，跨真机和模拟器
- [Browser Fingerprinting Guide: Detection & Bypass](https://www.browserless.io/blog/device-fingerprinting) — TLS 指纹反爬的全面解析，看完会更明白为什么"在真模拟器里跑"是从源头解决问题
