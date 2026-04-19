# Anthropic Long-Running Agent Harness: 解决 AI 编程的持久性问题

> 来源：Anthropic Engineering Blog + ZenML 分析
> 标签：AI, Develop, Agent Architecture

## 核心问题

AI coding agent 在处理复杂项目时面临一个根本性挑战：context window 用完后，下一个 session 对之前的工作一无所知。就像让一群轮班工程师接力开发，但每个人上班时都失忆了。

即使有 compaction 技术（理论上能保留关键 context），前沿模型如 Opus 4.5 在多 session 场景下仍然无法完成生产级应用。

## 两个关键失败模式

Anthropic 在实践中发现了两个反复出现的失败模式：

**One-shotting（一次做太多）**：agent 试图在一个 context window 里完成整个应用，而不是增量推进。结果是 context 用到一半就耗尽，留下一堆半成品代码。下一个 session 的 agent 不得不花大量时间理解和修复前任的烂摊子，而不是推进新功能。

**Premature completion（过早宣布完成）**：当部分功能完成后，新 session 的 agent 会错误地判断整个项目已经完成。这是一个评估问题——没有结构化的进度追踪，agent 无法准确判断项目完成度。

## 解法：双 Agent 架构

Anthropic 的方案是一个双 agent harness（本质上是同一个模型配不同的 prompt）：

### Initializer Agent（只跑一次）

首次 session 运行，建立整个项目的脚手架：
- `init.sh`：定义如何启动开发服务器和运行应用
- `claude-progress.txt`：跨 session 的进度日志
- Feature list JSON：把高层 prompt 展开成数百个具体、可测试的需求
- 初始 git commit：建立版本控制基线

Feature list 是最巧妙的设计。对于一个"克隆 claude.ai"的项目，initializer 生成了 200+ 个带详细测试步骤的 feature，全部初始化为未完成状态。这迫使后续的 coding agent 增量工作，而不是试图一口吃成胖子。

### Coding Agent（每个 session 运行）

每个 session 读取 progress file 和 feature list，选择下一个要实现的 feature，完成后更新进度，确保代码处于"clean state"——可以合并到主分支、无重大 bug、有文档。

### Context Anxiety 与 Context Rotation

一个有趣的发现：Claude Sonnet 4.5 在感知到 context 快满时会草草收尾——Anthropic 称之为"context anxiety"。解法是 context rotation：在 context 用完前主动切换新 session，通过 progress file 保持连续性。

## 跟我们的关联

这个架构跟我们的 DevTeam v4 + board CLI 解决的是同一个问题：
- board 的 features.json = Anthropic 的 feature list JSON
- board 的状态机（INBOX→PLAN→DEV→TEST→GATE→DONE）= 他们的 progress tracking
- DevTeam 的 step-first workflow engine = 他们的 coding agent 增量推进

区别在于我们用了更复杂的多角色架构（架构 agent + 执行 agent + 测试 agent + 蓝军 agent），而 Anthropic 用的是更简单的双 agent 方案。Boris Cherny 说"always bet on the more general model"——也许简单方案在模型能力提升后会更有优势。

## 关键启发

1. **结构化进度追踪是 long-running agent 的命脉**——没有它，agent 要么重复工作要么过早收工
2. **Feature list 是最好的约束机制**——把大任务拆成小任务，迫使增量推进
3. **Clean state 原则**——每个 session 结束时代码必须可合并，这比"做完再说"的策略可靠得多
4. **Context anxiety 是真实存在的**——模型会因为 context 压力改变行为，需要主动管理
