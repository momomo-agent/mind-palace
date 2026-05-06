# Agent-Native Product Design：设计师的新操作系统

Rico 写了一篇 Agent-Native 产品设计的完整指南。核心论点：2026 年产品设计师的工作已经分裂成两种——还在以 Figma 为主要交付物的旧版本，和以 strategy+dispatch+review+ship 为循环的新版本。

## 核心翻转

旧循环：brief → sketch → mockup → refine → hand off → wait → review → cycle。五天。
新循环：写策略 → 写设计系统文件 → dispatch 屏幕 → review PR → ship URL。五小时。

Marcus Moretti 的总结最精准：软件开发从 20% 规划 80% 执行，翻转成 80% 规划 20% 执行。设计领域正在经历同样的翻转。

## 四个核心 Artifact

在第一个 prompt 之前、第一个 Figma 文件之前，先写四个文档：

**1. strategy.md** — 目标问题、方法、用户、关键指标、工作轨道。没有它 agent 不知道成功长什么样。测试：如果你不能一句话说出产品的目标指标，你还没准备好 dispatch 一个屏幕。

**2. design.md** — 视觉大脑。品牌语气、色彩 token、字体比例、间距、组件解剖、无障碍规则、暗色模式。50 行以内。负约束跟正约束一样重要——"永远不用渐变"比"用纯色"更锐利。

**3. AGENTS.md** — 结构大脑。代码库是什么、用什么框架、什么约定重要、agent 应该拒绝做什么。

**4. product-pulse** — 反馈循环。定时任务每天早上拉 metrics/errors/conversions 写成 markdown 报告。没有 pulse 就是盲飞。

## 关键洞察

- PR 替代设计评审会：每个 dispatch 的屏幕自动开 draft PR 带三个断点截图，评论有时间戳和线程。这是设计运营最大的未完成变革。
- Agent 作为设计系统的用户：给 agent 写 persona，文档化它读什么、能调什么、容易搞错什么。augmented designer 把 agent 当工具，agent-native designer 把它当用户+协作者+初级团队成员。
- 不要让 agent 发明组件：必须指向现有 primitives，否则它每次都会新建一个 Button。
- 跑多个 agent：Cursor 做当前设计、Codex 做昨天 dispatch 的维护任务、Claude Code 做审计。native designer 管团队，augmented designer 把所有问题塞进一个工具。

## 跟我们的体系对照

| Rico 的 artifact | 我们的对应物 |
|---|---|
| strategy.md | dev-methodology 的 WHY 阶段 |
| design.md | SOUL.md + 项目 design tokens |
| AGENTS.md | AGENTS.md（完全一致） |
| product-pulse | daily-brief + session-review |

Compound Engineering 的核心理念——每个 feature 让下一个更容易而非更难——跟我们的记忆系统复利效应完全同构。
