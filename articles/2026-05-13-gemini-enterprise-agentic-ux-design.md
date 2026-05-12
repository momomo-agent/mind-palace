# Gemini Enterprise 的 Agentic UX 设计方法论

原文链接：https://www.figma.com/blog/how-to-design-agentic-tools-for-work/
推文：https://x.com/figma/status/2054222624864026913

---

## 原文整理

Figma 博客采访 Google Cloud AI 的 UX 负责人 Sheta Chatterjee，讲 Gemini Enterprise 如何设计 agentic 工具。核心挑战：让复杂的多 agent 工作流感觉简单、直觉、可信。

### 设计原则

> "Our guiding principle is that the user's focus should always be on their goal, not on managing AI. At the same time, it's crucial to make clear that the user can intervene."

### 四个关键设计决策

**1. AI Inbox：从 chat 到看板**

不再是一问一答的 chat thread，而是一个 living dashboard：
- 显示所有 agent 正在做什么
- 什么已完成、什么需要你介入
- "A visual workflow acts more like a team check-in than a back-and-forth chat thread"

这跟 Claude Code 的 Agent View 是同一个方向——agent 数量上去后，管理界面比单个 agent 能力更重要。

**2. Shared Project Space：AI 作为团队成员**

从个人 chat thread 转向持久化的共享项目空间：
- AI 在团队都能看到的空间里执行任务
- 每个请求归属到具体团队成员（accountability）
- 工程师上传技术 spec，设计师可以直接问 AI 要细节
- "The biggest problem with work today is silos, and AI creates a single source of truth"

**3. Harness 治理层：用户定义 agent 权限边界**

Agent Designer 让用户定义 "harness"——一个治理层：
- 指定 agent 能访问哪些数据
- 能用哪些工具
- 什么时候必须停下来请求许可
- "It puts security and logic directly in the hands of users"

**4. Proactive Nudges：非侵入式建议**

- "You have a project deadline approaching. Should I draft a status update?"
- Agent 在 chat 里"举手"表示有话说
- "These suggestions should feel magical, not like interruptions"

### 透明度设计

- 消费者版 Gemini 实时叙述它在做什么
- 企业版扩展为更细粒度的 thinking state
- 例：追踪产品发布健康度时，先陈述计划（理解项目→分析 SurveyMonkey 反馈→分析 Jira ticket→起草 memo）
- "It's a deliberate pause and moment of designed friction to ensure that the user is the ultimate authority"
- 所有回复都带 source citations

### 设计工具链

- Figma 是 single source of truth（从概念到交付）
- FigJam 做前期用户旅程映射和投票
- 设计系统在 Figma 里维护，跨消费者/企业团队共享
- "We can get to a level of detail in Figma that's not possible with vibe coding"

---

## 启发与见解

### 1. AI Inbox = Agent View = 我们的 board CLI

三个产品独立到达同一个结论：agent 多了之后，核心 UI 不是 chat，是状态看板。

- Claude Code → Agent View（左箭头打开总览）
- Gemini Enterprise → AI Inbox（living dashboard）
- Momo → board CLI（状态机驱动 INBOX→PLAN→DEV→TEST→GATE→DONE）

共同模式：一眼看到所有 agent 状态 + 只在需要介入时打断用户。

### 2. "Designed Friction" 是信任的关键

Sheta 说的 "deliberate pause" 跟 kenefe 之前说的 "prompt 哲学：引导不限制" 是同一个思路——不是不让 agent 做事，是在关键节点暂停让人确认。

对 Momo 的启发：DevTeam 的 gate 节点就是 designed friction。但现在 gate 只检查测试通过，没有"陈述计划让人确认"这一步。可以加一个 plan-preview 环节。

### 3. Shared Project Space 解决了 context 孤岛

现在 Momo 的 sub-agent 各自有独立 context，互相看不到。Gemini 的做法是让所有 agent 在同一个可见空间里工作，每个动作归属到人。

这跟 kenefe 说的 "context window = 注意力" 有张力——共享空间意味着更多 context 塞进去。但 Gemini 的解法是 agent 只在共享空间里留结果和归属，不是把所有 context 都共享。

### 4. Harness = 声明式权限，不是命令式限制

"定义 agent 能访问什么、能用什么工具、什么时候必须停" 这个模式跟 OpenClaw 的 allowCommands / allowReadPaths / allowWritePaths 完全同构。区别是 Gemini 把它做成了用户可配置的 UI，而不是开发者写 JSON。

---

## 相关链接

- [How to Design Agentic Tools for Work — Figma Blog](https://www.figma.com/blog/how-to-design-agentic-tools-for-work/) — 原文完整版含 UI 截图
- [Designing Trust Into AI Agents: Transparency Moments](https://reptile.haus/journal/transparency-moments-ai-agents-ux-trust-2026/) — 即使答案对了不解释也会侵蚀信任
- [The new Gemini Enterprise — Google Cloud Blog](https://cloud.google.com/blog/products/ai-machine-learning/the-new-gemini-enterprise-one-platform-for-agent-development) — 产品官方介绍
