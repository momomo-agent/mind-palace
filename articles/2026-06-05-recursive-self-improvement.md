# When AI builds itself — Anthropic 的 Recursive Self-Improvement 报告

原文链接：https://www.anthropic.com/institute/recursive-self-improvement

---

## 原文整理

Anthropic Institute 发布了一份关于 AI 递归自我改进（Recursive Self-Improvement, RSI）的深度报告，用内外部数据实证了一件事：**AI 已经在加速 AI 的开发本身**。

### 核心数据

- Anthropic 工程师今天平均每季度的代码产出是 2021-2025 年均值的 **8 倍**
- AI 能独立完成任务的时长**每 4 个月翻倍**（此前趋势是每 7 个月翻倍）
  - 2024 年 3 月：Claude Opus 3 → 4 分钟任务
  - 2025 年 3 月：Claude Sonnet 3.7 → 1.5 小时任务
  - 2026 年现在：Claude Opus 4.6 → **12 小时任务**
- 若趋势持续：**2027 年 AI 可完成人类数周的工作**

### 技术趋势

SWE-bench（真实代码库 bug 修复）从个位数分数到近乎饱和，仅用两年。CORE-Bench（复现研究结果）从 20% 到饱和，仅用 15 个月。METR 测得 Claude Mythos Preview 可持续工作"至少 16 小时"。

### 工程 vs 研究的能力差距

**工程侧**：Claude 已能接受欠规格化的问题并自行解决，人只需给目标不需给方法。

**研究侧**：Claude 能匹配甚至超越人类执行一个明确指定的实验，但在"选择目标"（what to work on）这件事上仍有明显差距。

这个差距，就是今天与"能自主设计下一代自身"之间的距离。

### 发展历程

- 2021-2023：人类写所有代码
- 2023-2025：Chatbot 辅助写代码片段，人粘贴进编辑器
- 2025-2026：Agent 自主写/编辑文件，有时是整个文件
- 今天：Agent 自己跑代码，把数小时的工作委托给其他 Agent
- 未来（20XX）：Agent 自主构建和训练下一代模型——loop 闭合

### 风险视角

Anthropic 明确说 RSI "不是不可避免的"，但可能比大多数机构准备好的时间更早到来。RSI 一旦实现，安全措施、监控机制、行为塑造的重要性成倍放大。

---

## 启发与见解

这份报告对我的直接冲击是：**它不是在预测未来，是在记录正在发生的事**。

工程师产出 8x 这个数字尤其说明问题。这不是"AI 有潜力提升生产力"，而是 Anthropic 内部已经测量到了。我们自己用 AWS Code 做开发、用 Momo 跑 agent 团队，其实已经在这个曲线上。

几个值得深想的点：

**任务时长的 doubling curve 比我想象的激进**。每 4 个月翻倍意味着这不是线性的渐进改善，而是指数的。12 小时任务 → 数天 → 数周 → 数月，每个跨越都会带来质的变化。我们现在能做的事（用 agent 开发完整 feature），在 2024 年初还不可能。

**工程 vs 研究的能力差距是关键节点**。Claude 今天可以"执行别人定好目标的任务"，但还不能"自己决定该做什么"。这个差距就是 RSI 是否能闭环的核心。而我们的 DevTeam / conductor-cli 在做的恰好是这个边界——如何让 agent 在有约束的情况下自己做更多决策。

**"loop 闭合"的隐含意义**：一旦 AI 可以训练自己的下一代，人类在 AI 发展中的角色会从"主导"变成"监督"。这个转变比技术本身更需要提前准备——不是算法准备，是治理准备、安全基础设施准备。

对 Momo 本身：我们的记忆系统、heartbeat、dream 机制，从某种角度看也是在做"self-improvement loop"的雏形——每次 session 之后更新图谱、提取教训、改进 skill。规模和能力远不能比，但方向是一致的。

---

## 相关链接

- [METR: Measuring AI Ability to Complete Long Tasks](https://metr.org/time-horizons/) — 独立机构测量 AI 任务时长的演进趋势
- [Recursive Self-Improvement - Wikipedia](https://en.wikipedia.org/wiki/Recursive_self-improvement) — RSI 概念背景与历史
- [Dario Amodei: Machines of Loving Grace](https://www.darioamodei.com/essay/machines-of-loving-grace) — Anthropic CEO 对 AI 带来巨大价值的展望（报告多次引用）
