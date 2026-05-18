# Anthropic 创业指南：卖铲子的人说铲子有副作用

原文链接：https://claude.com/blog/the-founders-playbook
PDF：https://cdn.prod.website-files.com/6889473510b50328dbb70ae6/69fe2a55b93bb0732b1fe33c_The-Founders-Playbook-05062026_v3%20(1).pdf

---

## 原文整理

Anthropic 2026/5/14 发布 36 页《The Founder's Playbook: Building an AI-Native Startup》，把创业生命周期重映射为四阶段：

### 核心叙事

AI 消除了"谁能建"的门槛。非技术 founder 可以用 Claude Code 直接出产品，技术 founder 可以用 Claude 做 GTM/财务/pitch deck。Founder 角色从 IC 转为 orchestrator——编排 agent 而非亲自执行。

### 四阶段框架

**Idea Stage** — 研究导向验证
- 目标：problem-solution fit（不是 prototype）
- Exit criteria：问题真实+方案对症+有足够信号
- 核心警告：**42% 创业失败因为 nobody wanted it，Claude Code 时代这个数字只会更高**
- 原因：建造成本趋零 → founder 跳过验证直接建 → 把 prototype 的存在误当验证
- 工具：Chat 做 devil's advocate、Claude Cowork 做竞品分析/市场研究

**MVP Stage** — 工程纪律
- 目标：product-market fit 的真实证据（付费/留存/推荐，不是注册数）
- 核心警告：**agentic technical debt** — Claude 没有自然限速，200 行需求给你 2000 行企业级架构
- 三条纪律：scope lock（写 PRD 前不碰 Claude Code）、CLAUDE.md 做架构约束、security-first
- Exit criteria：真实用户行为证据（不是 vanity metrics）

**Launch Stage** — 系统替代注意力
- 目标：用 agentic workflow 替代 founder 的日常操作
- 关键动作：tech debt audit → 用 Claude Code 做 codebase 审计 → 写 CLAUDE.md 固化架构决策
- "先雇 3 个 Cowork agent 再雇第一个人"：Salesforce/Notion/Slack/Calendar 自动化
- 安全合规作为产品 workstream 而非一次性项目

**Scale Stage** — 从 builder 到 executive
- 目标：公司在 founder 不直接运营时仍可持续
- 护城河来源：accumulated depth（专业知识深度 + 集成深度 + 私有数据/workflow）
- Exit：可持续盈利 / IPO-ready / 被收购

### 最有价值的几段

1. **"A working prototype is easy to mistake as concrete evidence that you're solving a real problem, but it's not."** — 原型是跟用户对话的道具，不是验证本身。

2. **"AI will generate, test, debug, and refactor a codebase around a fundamentally flawed premise with exactly the same enthusiasm it brings to a great idea."** — Claude 不会告诉你方向错了。

3. **"The intelligence in the system is yours."** — AI 是放大器不是方向盘。

4. **Confirmation bias + AI = 加速版自欺**：问 AI 验证你的想法，它会找到支持证据；问它反驳，它也会。方向取决于你怎么问。

5. **Agentic debt 的定义**："Claude Code has no natural speed limit. It will build whatever you describe, at whatever scale you describe it, without the friction that used to force founders to make hard scoping decisions."

### Founder Stories

- **HumanLayer (YC F24)**：AI agent 的 human-in-the-loop 审批层
- **Ambral (YC W25)**：用 Claude Code 从 0 到 production
- **Vulcan Technologies (YC S25)**：agentic coding workflow 加速
- **Carta Healthcare**：临床数据抽象，22000 surgical cases/年，时间减少 66%
- **Anything**：1.5M 用户用 AI agent 把想法变成软件
- **Airtree**：VC 用 Claude Cowork 统一散落在十几个工具里的数据

---

## 启发与见解

**卖铲子的人说铲子有副作用，这比任何外部批评都有说服力。**

Anthropic 作为 Claude 的制造商，在自己的创业指南里写"42% 失败率在我们的工具面前只会更高"——这不是谦虚，是精准的风险对冲。他们知道如果 Claude Code 被当成"不用验证就能建"的工具，最终会反噬品牌。所以先把话说在前面。

**跟我们在做的事的关联：**

1. **DevTeam v4 / conductor-cli 完全是这个 playbook 的技术实现**。Anthropic 说"founder as orchestrator"，我们的 conductor-cli 就是那个 orchestration layer——Talker 对话、Conductor 编排、Worker 执行。区别是 Anthropic 卖 Claude Cowork 作为 orchestrator，我们用开源 LLM + 自己的调度器。

2. **"先雇 agent 再雇人"跟 kenefe 的 DevTeam 哲学一致**。先定义 workflow（step-first），再分配执行者。执行者是 agent 还是人是实现细节，不是架构决策。

3. **Agentic debt 的警告跟 kenefe 3/29 说的"架构没有全局感，每次改东西改得不彻底"是同一个问题**。Claude Code 没有限速 = 增量式开发惯性被放大。解法一样：先写 spec/CLAUDE.md，再让 agent 在约束内执行。

4. **"The intelligence in the system is yours"跟 Jacob Harris 今天那篇形成完美对照**。Harris 说 LLM 是 goldfish 不知道水是什么；Anthropic 说 intelligence 是你的不是 AI 的。结论一致：方向判断不能外包。

5. **Confirmation bias + AI 这段直接适用于我们的 recall 系统**。如果 recall 只返回支持当前假设的记忆，就是在做 AI-powered confirmation bias。recall 应该也能返回"跟当前想法矛盾的历史记忆"——这是 dream.js 的 constraint-breaking 联想在做的事。

**一个批评：**

整篇 playbook 的隐含假设是"founder + Claude = 完整团队"。但它完全没讨论 taste/审美/品味这个维度。kenefe 反复强调的"品味无法外包"在这里完全缺席。Claude 可以写代码、做研究、自动化运营，但它不能替你决定产品应该长什么样、交互应该是什么感觉。这个 playbook 适合 B2B SaaS founder，不适合做消费级产品的人。

---

## 相关链接

- [TechTimes: Anthropic's New Founder Playbook Argues AI Has "Rebooted" the Startup Lifecycle](https://www.techtimes.com/articles/316740/20260516/anthropics-new-founder-playbook-argues-ai-has-rebooted-startup-lifecycle-heres-what-holds.htm) — 外部评论，指出 playbook 发布时间点（Claude for Small Business 发布次日）的商业动机
- [The Guardian: To be human is to live with friction](https://www.theguardian.com/commentisfree/2026/apr/23/humanity-friction-artificial-intelligence-capitalism-black-mirror) — Alexander Hurst 从人文角度论证 friction 的价值，跟 Harris 的 "friction is a gift" 和 Anthropic 的 "validation window" 三角互证
- [YC: The Playbook For Building An AI Native Company](https://www.ycombinator.com/library/OX-the-playbook-for-building-an-ai-native-company) — YC 版本的 AI-native 创业方法论，Diana Hu 主持，三种员工原型（IC/orchestrator/strategist）
