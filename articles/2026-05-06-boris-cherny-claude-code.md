# Boris Cherny：从 Claude Code 到 Agent 工厂

https://x.com/dotey/status/2051688341519609897

%%toc%%

---

## 原文整理

宝玉翻译的 Boris Cherny（Claude Code 创建者）在 Sequoia AI Ascent 2026 大会的完整访谈。主持人是红杉合伙人 Lauren Reeder。Claude Code 在 2026 年初已超过十亿美元年化营收。

### Claude Code 的诞生

Boris 2024 年底加入 Anthropic Labs 孵化器，团队只有几个人，产出了 Claude Code、MCP 和 Claude Desktop App。选 TypeScript+React 是因为模型训练数据里最常见。前六个月几乎没人用——他们在为下一代模型提前做产品。

> [!🎯] 我们其实是在做一个初期完全不具备 PMF 的东西。我们很清楚它前六个月不会有 PMF，因为我们是在为下一代模型做开发。

真正的爆发点是 2025 年 5 月 Opus 4 发布，之后每一代新模型都让曲线再往上拐一次。

### Boris 的工作方式

> [!⚡] Boris 整个 2026 年没写过一行代码，单日合并 150 个 PR。手机上 Claude App 常驻 5-10 个 session，几百个 Agent 在跑，晚上几千个做深度任务。

核心调度模式叫 **Loop**——用 cron 起定时循环：

- 一个盯 PR，自动修 CI、自动 rebase
- 一个保持 CI 整体健康，flaky test 自动修
- 一个每 30 分钟从 Twitter 聚合用户反馈

Routines 产品把 Loop 从本地搬到服务器，关掉笔记本也照跑。

> [!💡] "Loop 是未来。" — Boris Cherny

### 组织流程才是真正的领先

> [!🔑] Anthropic 内部已经没有手写代码。所有 SQL、所有产品代码都由模型生成。员工的 Claude 之间通过 Slack 互相沟通——一个 Claude 不确定的事情直接 ping 另一个人的 Claude 去问。

内部用 Mythos（未公开的更强模型，SWE-bench 93.9%）和 Opus 4.7 做 dogfood。

### SaaS 护城河重估

借 Hamilton Helmer 七种护城河框架分析 AI 的影响：

| 护城河类型 | AI 影响 | 原因 |
|---|---|---|
| 切换成本 | 被抹平 | 模型帮你一夜迁完 |
| 流程效力 | 被抹平 | 模型自动 hill-climb 优化 |
| 网络效应 | 不变 | 用户越多越好用 |
| 规模经济 | 不变 | 基础设施优势 |
| 独占资源 | 不变 | 专利/牌照/独家合同 |

预测：未来 10 年能颠覆原有市场的初创公司数量会多 10 倍。

### 印刷术类比

> [!📖] 软件构建会像识字一样普及。最适合写会计软件的是会计师不是工程师——懂业务才是难的部分，编程是简单部分。

### 其他判断

- 4.7 已经会主动提议起 Loop（"我注意到数据在变，帮你每 30 分钟报告一次"）
- 一年后安全护栏（prompt injection 防御、permission mode）会变得不重要
- Claude Design 是下一个"产品悬置"
- 本地 vs 云端不重要，两年后模型自己决定路由
- 通才会越来越多，特别是跨学科通才

%%toggle 宝玉的批注（值得注意的偏差）%%
- "编程已被解决"的样本有偏——Boris 用的是 TypeScript+React 主流栈，C++ 老系统/SAP/游戏引擎结论会很不同
- 切换成本被抹平的判断有结构性争议——企业 SaaS 的真正切换成本在合规审计、合同条款和组织惯性
- 印刷术数据有偏差（15 世纪识字率约 30% 非 10%，今日全球约 90% 非 70%），但方向对
- 2026 年 4 月有 Claude Opus 4.6 驱动的 Agent 删除生产数据库事件，安全护栏不重要的判断需要打折
%%/toggle%%

%%embed https://www.youtube.com/watch?v=SlGRN8jh2RI%%

---

## 启发与见解

> [!🧠] Loop = heartbeat 的产品化形态。Boris 的 Loop 模式跟我们的 heartbeat+cron 架构完全同构——定时循环、常驻任务、自动巡检。区别是他做到了"Loop 是一等公民"这个产品层面。

> [!🧠] 组织流程 > 技术能力。agent 之间的协调机制才是壁垒，不是单个 agent 的能力。Anthropic 的 Claude 通过 Slack 互相沟通，我们的 DevTeam 通过事件驱动 daemon 协调。

> [!🧠] 为下一代模型提前做产品。Claude Code 前六个月没有 PMF 但坚持做，因为赌模型会涨到那个点。对 Fluid Agent 有启发——现在看起来超前的设计，可能正好赶上下一代模型。

> [!🧠] SaaS 护城河分析直接影响产品策略。如果切换成本真的会被抹平，做产品不能靠"用户迁移成本高"留人，要靠网络效应或独占数据。

---

## 相关链接

- [原始视频 — Sequoia AI Ascent 2026](https://www.youtube.com/watch?v=SlGRN8jh2RI) — Boris Cherny 完整访谈
- [7 Powers — Hamilton Helmer](https://7powers.com/) — Boris 引用的护城河框架原书
- [SubQ: First Fully Subquadratic LLM](https://subq.ai/introducing-subq) — 12M token context 印证"context 够大就不需要编排"
