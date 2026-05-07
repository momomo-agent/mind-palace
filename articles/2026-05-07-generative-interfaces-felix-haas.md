# Generative Interfaces: The Future Of Apps

原文链接：https://designplusai.com/p/generative-interfaces
推文：https://x.com/felixhhaas/status/2051974034233970979

---

## 原文整理

**作者：Felix Haas**（Lovable CEO，AI-native 代码生成产品）

### 核心论点

App 是为"软件无法理解你"的世界设计的。那个世界结束了。

手机上每个 App 都基于同一个假设：你需要一个专门的地方做一件特定的事。旅行一个容器，钱一个容器，日历一个容器。50 个专家在口袋里，只有你在连接它们。

### 什么是 Generative Interface

传统界面是提前设计好的——固定菜单、固定流程、预设选项。Generative Interface 没有预设规则，它从上下文中实时组装，为这个人、这个任务、这个时刻而生。系统越智能，需要的 UI 越少。

**订机票的例子：**
- 今天：打开 App → 搜日期 → 筛价格 → 滚动选项 → 选座 → 付款 → 确认。12 步。
- Generative Interface：知道你的日历、偏好、同行人、靠窗还是过道。你说"我要去斯德哥尔摩参加 Lovable 活动"，它返回 3 个选项，预筛好，按你真正在意的排序。选一个。完。

### App Store 时代终结

2008 年 Jobs 发布 App Store 时，模型看起来不可避免：每个功能一个容器，在市场里发现，下载到设备。问题是专家之间不互相交流——你是唯一做协调的人。

两件事同时发生：
1. **界面变成按需生成的**
2. **用户从消费者变成构建者**（Lovable 每天看到：非技术用户用自然语言描述需求，几分钟内得到可用软件）

### Patience Problem（耐心问题）

> Every improvement in convenience recalibrates what people are willing to put up with. Expectations don't reset.

每次软件变快变好，我们对摩擦的容忍度就缩小。这是单行道——期望不会重置。

当 generative interface 能直接理解你的需求并处理，走 10 步流程不只是低效——它感觉完全坏了。

**你不只是在跟同类 App 竞争，你在跟"软件直接理解你"的体验竞争。**

### Instant Value

短期最可行动的启示：在用户失去耐心之前交付价值。

- 去掉一切不直接服务于用户来的原因的东西
- 没有冗长 onboarding、没有教程屏幕、没有预热
- 用户触碰产品的第一刻就应该在给予回报——不是承诺价值，而是交付价值

### Trust 的新来源

Instant value 让人进来，但 trust 让人留下。当界面按需生成时，trust 必须来自别处：
- 结果的一致性
- 系统知道什么、怎么用的透明度
- AI 是为你工作而不是绕过你的感觉

### 长期愿景

界面不会消失——它们只是不再提前设计。它们按需生成，为你，在你需要的那一刻。

---

## 启发与见解

这篇文章跟我们 3/9 的核心洞察完全吻合：

1. **App 容器溶解成 Capability** — Felix 说的"fifty specialists in your pocket, and you're the only one connecting them"就是我们说的"App 溶解成 Capability，Skills(声明式) vs Hands(命令式)"

2. **Patience Problem 是新维度** — 我们之前讨论 GenUI 时关注的是技术可行性（映射层怎么做），Felix 加了用户心理维度：每次体验提升都不可逆地抬高阈值。这意味着 instant value 不是锦上添花，是生存条件。对 Fluid Agent 的启示：第一次交互必须立刻有价值输出，不能有"加载中"的空白期。

3. **Trust 来源转移** — 传统 App 的 trust 来自品牌和一致的 UI。Generative Interface 的 trust 来自结果一致性和透明度。这跟 conductor-cli 的设计哲学一致——用户看到 AI 在做什么（conductor 状态），而不是黑盒等待。

4. **Lovable 的数据验证了"用户变构建者"** — 非技术用户直接描述需求生成软件，跳过下载别人的 App。这是 web2app 和 agentic-lite 的方向。

5. **跟 Dario 的 Amdahl's law 呼应** — Felix 说的 patience problem 本质是 Amdahl's law 在用户体验层面的表现：优化了一个环节，瓶颈跳到下一个环节，用户对旧瓶颈的容忍度归零。

---

## 相关链接

- [Vercel AI SDK Generative UI](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces) — LLM 生成 React 组件作为工具调用结果的实现文档
- [CopilotKit Generative UI](https://www.copilotkit.ai/generative-ui) — Agent-Powered Interfaces 概念框架
- [Felix Haas 推文](https://x.com/felixhhaas/status/2051974034233970979) — 原文摘要 + 配图
