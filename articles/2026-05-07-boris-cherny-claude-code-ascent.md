# Boris Cherny: Claude Code 从零到十亿美元的真实路径

原文链接：https://x.com/chenchengpro/status/2052029344227443170

视频原文：https://www.youtube.com/watch?v=SlGRN8jh2RI

---

## 原文整理

### 起源

2024 年底 Boris Cherny 加入 Anthropic 内部孵化器 Anthropic Labs，几个人的小团队产出了三样东西：Claude Code、MCP、Desktop App。做完团队解散，2026 年初由 Instagram 联合创始人 Mike Krieger 牵头重组。

### 增长曲线

- Claude Code 年化营收超十亿美元，被 Anthropic 称为"史上从研究预览到十亿美元产品最快的一次"
- 前六个月几乎没人用，Boris 自己也只用它写 10% 的代码
- 这是故意的——为下一代模型提前做产品，不追求早期 PMF
- 爆发点：2025 年 5 月 Opus 4 发布，之后每代模型（4.5→4.6→4.7）都让增长曲线再拐一次

### 技术选型的反直觉逻辑

选 TypeScript + React 不是技术偏好，是因为这两个在模型训练数据里极其常见（on-distribution）。2024 年底模型还不够聪明，语言和框架的选择直接决定模型能写多少。正因为选了模型最熟的栈，2025 年 10-11 月过了临界点：模型开始写 100% 的代码。

### Boris 的日常

- 2026 年至今没写过一行代码
- 每天合并几十个 PR，单日峰值 150 个
- 大部分工作在手机上完成
- Claude App 里常驻 5-10 个 session，每个 session 开一堆 Agent，加起来几百个在跑
- 晚上再起几千个做深度任务

### Loop 模式

最常用的模式叫 Loop——让 Claude 用 cron 起定时任务：
- 一个盯 PR 自动修 CI 和 rebase
- 一个保持 CI 健康（修 flaky test）
- 一个每 30 分钟从 Twitter 拉用户反馈做聚类

Anthropic 刚发布的 Routines 把 Loop 搬到服务器端，关掉笔记本也照跑。Boris 说"Loop 是未来"。

### 团队变化

Claude Code 团队里工程经理、产品经理、设计师、数据科学家、财务、用户研究员——每个人都在写代码。未来会出现大量跨学科通才：一个人同时懂产品、设计和数据科学。

### SaaS 终结论

借用 Hamilton Helmer 七种护城河框架：
- **会被 AI 抹平的**：切换成本（模型帮你一夜迁完所有工作流）、流程效力（4.7 能 hill-climb 任何目标）
- **不会变的**：网络效应、规模经济、独占资源
- 预测未来十年颠覆性创业公司数量是过去十年的 10 倍

### 产品 vs 模型

- 一年前 50/50，六个月前也是 50/50
- 产品永远重要——"不管模型多强，你最终得做出一个用户真的爱用的东西"
- 但随着模型变强，外面那层 harness 会变得没那么重要
- 一年后 prompt injection 防御、权限模式、human-in-the-loop 可能都不需要了

### Anthropic 内部状态

- 整个公司已经没有手写代码，所有 SQL 由模型生成
- 员工的 Claude 之间通过 Slack 互相沟通
- 真正的领先在组织流程的改造，不是技术

### 历史类比

印刷术。1400 年代欧洲约 10% 识字率，印刷术后 50 年出版文献比之前 1000 年总和还多，书的成本下降 100 倍。软件构建会经历同样过程，而且更快。

最尖锐的一句：写会计软件最合适的人不是工程师，是真正懂业务的会计师——编程是简单部分，懂领域才是难的部分。

---

## 启发与见解

**1. 我们的 heartbeat/cron 架构方向被验证了**

Boris 的 Loop 模式跟我们的 heartbeat + team daemon 本质一样——agent 常驻后台定时执行任务。区别在于他们有 Routines 把 Loop 搬到云端（关机也跑），我们还是本地 cron。这说明方向对了，下一步是考虑 Routines 化（服务器端常驻）。

**2. "为下一代模型提前做产品"的策略**

这跟典型 SaaS 的"先验证需求再做产品"完全相反。他们赌的是模型进步会让产品自然 PMF。这对我们的启发：做 agent 产品时，不要被当前模型能力限制想象力，设计要留出模型进步的空间。

**3. 组织流程改造 > 技术**

"技术大家都能拿到，但把整个公司从手写代码切到模型生成代码，让 Claude 之间互相问问题，这是组织行为的改造，比追技术慢得多。"——跟 kenefe 说的 strong workflow based 完全一致。工具不是瓶颈，流程和习惯才是。

**4. on-distribution 选型思维**

选技术栈不是看"最好的语言"，而是看"模型最熟的语言"。这个思路可以推广：给 agent 设计任务时，优先用模型训练数据里常见的模式和格式。

**5. 护城河重估**

切换成本和流程效力会被 AI 抹平，但网络效应和独占资源不会。对我们做产品的启发：不要靠"用户迁移成本高"来留人，要靠真正的网络效应或独占数据。

---

## 相关链接

- [Anthropic's Boris Cherny: Coding's Printing Press Moment (YouTube)](https://www.youtube.com/watch?v=SlGRN8jh2RI) — 完整访谈视频
- [Claude Code Routines (The Register)](https://www.theregister.com/2026/04/14/claude_code_routines/) — Routines 功能介绍，Loop 的服务器端版本
- [The Trillion Dollar Race to Automate Our Entire Lives (WSJ)](https://www.wsj.com/tech/ai/claude-code-cursor-codex-vibe-coding-52750531) — Claude Code 年化营收 $2.5B 的报道
