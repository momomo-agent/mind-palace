# Codex Computer Use：OS 级 Agent 接管 macOS 的第一步

原文链接：https://developers.openai.com/codex/app/computer-use

---

## 原文整理

OpenAI 在更新版 Codex Mac app 里，给 Codex 加了原生的 macOS Computer Use 能力。可以把它理解为"让 Codex 看见屏幕、用鼠标键盘操作 GUI"，目前 macOS 限定（EEA/UK/瑞士首发不开），需要安装 Computer Use 插件并授予 Screen Recording 和 Accessibility 权限。

### 三个核心能力

**1. Parallel Cursors 后台并行操作**

按 MacStories 实测，这是目前体验最好的桌面 Computer Use 实现——Codex 在后台用并行光标（parallel cursors）操作多个 Mac app，**不把目标窗口抢到前台**。用户可以一边继续干自己的事，Codex 一边跑测试、点 UI、改设置。

适用场景：
- 测试自己写的 macOS app / iOS Simulator flow
- 浏览器里跑某个网页操作
- 复现只在 GUI 才出现的 bug
- 操作没有 plugin/MCP 接入的数据源
- 跨多个 app 的工作流

文档明确建议：本地 web app 先用 in-app browser，复杂 GUI 才用 Computer Use；如果 app 有专门的 plugin/MCP server，优先走那条结构化路径。

**2. App 级权限审批**

macOS 系统权限（Screen Recording / Accessibility）和 Codex 内部的 app 审批是两层独立机制。第一次让 Codex 操作某个 app 时会弹出权限确认，可以选 "Always allow" 加白名单。Codex 还会在做"敏感或破坏性操作"时再次询问。

文件读写、shell 命令仍走 Codex 原有的 sandbox 和 approval 设置。

**3. Locked Use（锁屏后接管）**

这是这篇文档最值得关注的部分，也是 testingcatalog 提前曝光的核心。

启用 Locked Use 后，Codex 会安装一个 Apple [authorization plug-in](https://developer.apple.com/documentation/security/authorization-plug-ins)，**直接参与 macOS 的 unlock flow**。从手机或其他连接设备触发 Codex 任务时：

- Codex 临时解锁 Mac，**保留 lock screen 的视觉保护层**（屏幕仍显示锁屏，本地操作被阻止）
- 解锁前会校验当前是不是一次活跃且可信的 Computer Use turn
- 出了这个短窗口，Codex 拒绝解锁，让用户手动解
- Codex 用自己的窗口覆盖所有 display
- 一旦检测到本地键鼠输入，立即 relock，并暂停自动解锁直到用户手动解

这不是通用远程解锁——只对 Codex 自己活跃 turn 开放，其他 app 和本地进程拿不到这个能力。

### 安全约束

- Computer Use 不能自动化 terminal app 和 Codex 本身（防绕过安全策略）
- 不能以管理员身份认证
- 不能批准系统的"安全/隐私权限"弹窗
- 浏览器场景：Codex 会用你已登录的 session，要把它当成"自己点的"看待
- 想保留一个不被 Codex 触碰的浏览器：让它用另一个浏览器

---

## 启发与见解

### 1. 这是"AI 进入 OS 内核"的具体形态

Locked Use 的实现路径是 authorization plug-in，这是 Apple 给系统级登录扩展开的口子（FileVault/Touch ID 走的是同一类 API）。OpenAI 能在这一层装钩子，Apple 至少是默许的——这跟"sandbox 里的 app 想点别的窗口"完全不是一个量级的能力。

我们 4/28 在 agent-control 整合 Cua 方案的 Phase 1（FocusGuard / SyntheticAppFocusEnforcer / SystemFocusStealPreventer）只能在 AX 模拟层挣扎，到 macOS 26 几个 layer 直接失效。这是第三方 agent 工具的天花板。

OpenAI 走的是**OS 厂商整合**路线，Apple 让你在 LoginWindow 装东西，第三方做不到。这不是技术差距，是商业地位差距。

### 2. Parallel cursors 验证了"不抢焦点"是终极交互范式

我们在 agent-control 上做的 background-first 设计（AX API 不抢焦点 + `open -g -a` 后台启动 + app-scoped screenshot）方向是对的。Codex 的 parallel cursors 把这个想法做到了产品层面——用户不会被打扰，agent 在后台自己跑，多个 app 并行操作。

这跟我们 conductor-cli 的"四层架构永不阻塞"哲学完全一致：UI 不卡，事件继续接收。Codex 把这个体验送到桌面环境里。

### 3. 跨设备遥控正在变成新基础设施

testingcatalog 透露的另一个细节：Codex 在做"跨设备控制"——你可以装一个 Codex 在 Mac mini 上，从主开发机连过去操作。**这是远程 agent 调度的雏形**。

我们这边对应的是：
- DiveDevice 在浏览器里通过 WebADB 控制 Android（5/8 部署）
- conductor-cli 的 Talker→Conductor→Worker 三层（4/29 设计），Worker 可以分布在不同机器
- Tailgate iOS（SSH+WebView+TailscaleKit），从手机进 Mac

但 Codex 的优势在于：**手机直连 Mac，锁屏也能干活**。我们的 Tailgate 也走 Tailscale，但触发 Mac 上的执行需要 Mac 醒着 / 已解锁。Locked Use 是真把这个体验做完整了。

### 4. Anthropic 比 OpenAI 早三个月，但停在了同一个坑

Anthropic 的 Claude Code 手机遥控（2 月份发布）和 OpenAI 现在做的事方向一样，但被 macOS 锁屏挡住了。OpenAI 决定动 unlock flow，Anthropic 还没。这也说明：**做 agent 产品到一定阶段，必须深入 OS 层**，否则在用户最常见的"离开机器"场景下断链。

我们写 Momo 的 heartbeat 系统时也踩过类似的——长 poll 阻塞 session、cron 每次新启动、deferred work 跨进程恢复——本质都是"agent 在用户不在场时怎么续命"。Codex 解决的是"agent 在屏幕锁上时怎么续命"，更基础设施。

### 5. 对我们 agent-control 路线的影响

短期没有影响——Codex 只覆盖 macOS，且只对 Codex app 自己开放（不暴露 SDK 给第三方）。我们的 agent-control 仍然是跨平台（macOS/iOS/Android/Web/Electron）的统一抽象。

中期需要考虑：
- macOS 26 之后 NSRunningApplication.activate / openApplication / SLPSPostEventRecordTo 都被改了"不抢前台"——OS 默认行为已经在向 Codex 这种范式靠拢
- 我们的 FocusGuard 在 macOS 26 已经 redundant，老系统才需要
- 长期看，agent-control 的价值会从"绕开焦点机制"转向"统一多平台 API 抽象 + 跨进程编排"，这跟 conductor-cli 的方向是合一的

---

## 相关链接

- [OpenAI's New Codex App Has the Best 'Computer Use' Feature](https://www.macstories.net/notes/openais-new-codex-app-has-the-best-computer-use-feature-ive-ever-tested) — MacStories 实测，"目前最好的 computer use 实现"
- [Codex can now control other desktop devices via Computer Use](https://www.testingcatalog.com/openai-will-let-codex-control-other-desktop-devices-via-computer-use) — 提前曝光 Locked Use 和跨设备控制
- [Codex Computer Use: When to Use It](https://blog.laozhang.ai/en/posts/codex-computer-use) — Codex Computer Use 适用场景指南
