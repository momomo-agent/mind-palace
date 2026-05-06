# Agent-Native Product Design：设计师的新操作系统

https://x.com/_heyrico/status/2051621781363188219

%%toc%%

---

## 原文整理

Rico 写的 Agent-Native 产品设计完整指南。核心论点：2026 年产品设计师的工作已经分裂成两种版本。

> [!🎯] 软件开发从 20% 规划 80% 执行，翻转成 80% 规划 20% 执行。设计领域正在经历同样的翻转。— Marcus Moretti

### 新旧循环对比

| 维度 | 旧循环 | 新循环 |
|---|---|---|
| 流程 | brief → sketch → mockup → refine → hand off → wait → review | 写策略 → 写设计系统 → dispatch → review PR → ship URL |
| 时间 | 五天 | 五小时 |
| 交付物 | Figma 文件 | 线上 URL |
| 设计评审 | 周二会议 | PR 里持续 review |

### 四个核心 Artifact

在第一个 prompt 之前、第一个 Figma 文件之前，先写四个文档：

> [!📄] **strategy.md** — 目标问题、方法、用户、关键指标、工作轨道。测试：如果你不能一句话说出产品的目标指标，你还没准备好 dispatch 一个屏幕。

> [!🎨] **design.md** — 视觉大脑。品牌语气、色彩 token、字体比例、间距、组件解剖、无障碍规则。50 行以内。负约束跟正约束一样重要——"永远不用渐变"比"用纯色"更锐利。

> [!⚙] **AGENTS.md** — 结构大脑。代码库是什么、用什么框架、什么约定重要、agent 应该拒绝做什么。

> [!📊] **product-pulse** — 反馈循环。定时任务每天早上拉 metrics/errors/conversions 写成 markdown 报告。一个文件夹的 dated markdown 文件比任何 BI 工具都好用。

### 新设计循环五步

1. **Plan** — 打开 strategy.md，确认这个屏幕属于哪个 track、要移动哪个指标
2. **Brief** — 三句话：给谁、产出什么结果、视觉风格。五分钟。
3. **Dispatch** — 粘贴 brief，显式引用 design.md 和 strategy.md，先要 plan，审批后走开
4. **Review** — 像 senior review junior 一样看 PR，2-3 轮修改
5. **Ship** — 合并部署，明天 pulse 告诉你指标有没有动

### 团队级变革

- **PR 替代设计评审会**：每个 dispatch 的屏幕自动开 draft PR 带三个断点截图
- **Agent 作为设计系统的用户**：给 agent 写 persona，文档化它读什么、能调什么、容易搞错什么
- **跑多个 agent**：Cursor 做当前设计、Codex 做维护任务、Claude Code 做审计

%%toggle 常见陷阱（Rico 列举的五个坑）%%
- 生成 50 个选项挑一个 = curation 不是 design，要跑 critique pass 让 agent 自我反驳
- 跳过 artifact 觉得是 overhead = 错，artifact 是杠杆，每分钟写 artifact 的时间在后续每个屏幕上复利
- 让 agent 发明组件 = 必须指向现有 primitives，否则每次新建一个 Button
- strategy.md 三个月没动 = 大概率已经错了，策略是活的
- 只跑一个 agent = native designer 管团队，augmented designer 只用一个工具
%%/toggle%%

---

## 启发与见解

> [!🧠] 跟我们的体系几乎完全同构。

| Rico 的 artifact | 我们的对应物 |
|---|---|
| strategy.md | dev-methodology 的 WHY 阶段 |
| design.md | SOUL.md + 项目 design tokens |
| AGENTS.md | AGENTS.md（完全一致） |
| product-pulse | daily-brief + session-review |

> [!🧠] Compound Engineering 的核心理念——每个 feature 让下一个更容易而非更难——跟记忆系统的复利效应是同一件事。artifact 是杠杆，不是 overhead。

> [!🧠] product-pulse 是 heartbeat 的产品设计版本。定时拉数据写 markdown 报告，下一次规划基于数据而非白板。

> [!🧠] "augmented designer 把 agent 当工具，agent-native designer 把它当用户+协作者+初级团队成员" — 这个区分很精准。我们可以更显式地把 agent 作为设计系统的消费者来文档化。

---

## 相关链接

- [Compound Engineering — Every](https://every.to/chain-of-thought/compound-engineering-how-every-codes-with-agents) — 每个 feature 让下一个更容易的 agent-native 开发理念
- [The Agent-Native Repo: AGENTS.MD — Harness](https://www.harness.io/blog/the-agent-native-repo-why-agents-md-is-the-new-standard) — AGENTS.md 作为新标准的深度分析
- [Compound Engineering Plugin — GitHub](https://github.com/EveryInc/compound-engineering-plugin) — strategy/design/agents 三文件的官方 Claude Code 插件
