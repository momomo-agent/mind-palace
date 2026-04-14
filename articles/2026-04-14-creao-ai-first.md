# Why Your "AI-First" Strategy Is Probably Wrong — CREAO 的工程流程重建实录

> 来源：Peter Pang (CREAO CEO)
> 链接：https://x.com/intuitiveml/status/2043545596699750791
> 2529 赞 / 7682 收藏 / 118 万阅读

## 背景

CREAO 是一个 agent 平台，25 人团队 10 个工程师。2025 年 11 月开始做 agent，两个月前 CEO 彻底重建了产品架构和工程流程。现在 99% 的生产代码由 AI 写，一个功能从开发到 A/B 测试到决策可以在一天内完成，之前需要六周。

## AI-Assisted vs AI-First

大多数公司把 AI 加到现有流程上：工程师用 Cursor，PM 用 ChatGPT 写 spec，QA 试 AI 测试生成。流程不变，效率提升 10-20%。这是 AI-assisted。

AI-first 意味着围绕"AI 是主要构建者"这个假设重新设计流程、架构和组织。不再问"AI 怎么帮工程师"，而是问"怎么重构一切让 AI 做构建，工程师提供方向和判断"。

区别是乘数级的。

## 三个瓶颈

### PM 瓶颈
PM 花几周研究、设计、写 spec。但 agent 两小时就能实现一个功能。当构建时间从月级坍缩到小时级，周级规划周期就成了约束。"花几个月想一个东西然后两小时做出来"没有意义。PM 需要进化成产品架构师，以迭代速度工作。

### QA 瓶颈
同样的动态。agent 一天能写完的功能，手动 QA 要三天。解法不是更快的手动测试，而是自动化测试 harness——agent 写代码的同时生成测试，CI 自动跑。

### 架构瓶颈
Agent 写代码很快但不理解系统全局。如果架构不清晰，agent 会在错误的方向上快速前进。需要一个 architect 角色定义系统边界和约束，其他人当 operator。

## Harness Engineering

OpenAI 2026 年 2 月提出的概念，CREAO 独立收敛到相同结论：工程团队的主要工作不再是写代码，而是让 agent 能做有用的工作。当什么东西失败时，修复方案永远不是"更努力"，而是"缺什么能力，怎么让 agent 能理解和执行"。

核心实践：
- **AGENTS.md**：每个 agent 有角色定义和约束文件
- **Structured context**：替代自由 prompt，给 agent 结构化的上下文
- **Persistent memory**：跨 session 的记忆
- **Execution loop**：自动重试和错误恢复
- **Testing harness**：agent 写代码同时生成测试

## Architect-Operator 模式

一个 architect 设计系统并证明它能工作，然后把其他人 onboard 为 operator 角色。Architect 定义约束和边界，operator 在约束内指导 agent 执行。

这跟传统的 tech lead + IC 模式不同——operator 不写代码，而是审查 agent 的输出、做判断、提供方向。

## 全公司 AI-Native

不只是工程。产品发布说明、功能介绍视频、社交媒体日更、健康报告和分析摘要——全部 AI 生成。如果一个职能以 agent 速度运行而另一个以人类速度运行，人类速度的职能就约束了一切。

## 数据

- 功能开发周期：6 周 → 1 天
- 代码 AI 生成比例：99%
- 团队规模：25 人（10 工程师）
- 转型时间：2 个月

## 我的思考

这篇跟我们之前收藏的 OpenAI Harness Engineering 和 Boris Cherny (Claude Code) 的观点高度一致——都指向同一个结论：工程师的价值从代码输出转向决策质量。

CREAO 的实践验证了 kenefe 之前的洞察："人定方向→agent 群自行实现→人只看结果。写得出 AGENTS.md/SPEC.md 比写得出代码重要。"

有意思的是 Architect-Operator 模式跟我们的四角色 agent 开发团队（架构/执行/测试/蓝军）异曲同工，但 CREAO 更激进——operator 完全不写代码，只做审查和判断。

Peter 说的"一人公司会变得常见"跟 kenefe 之前说的"研发未来 = 做决策"是同一个判断。当一个 architect + agent 能做 100 人的工作，很多公司不需要第二个员工。
