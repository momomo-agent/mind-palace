# Seeing Like an Agent：Claude Code 工具设计的四个教训

Thariq 是 Claude Code 的核心开发者。这篇文章不是理论框架，是他们踩过的坑和找到的路。每一个案例都指向同一个核心："Read your outputs, see like an agent."

## 1. AskUserQuestion：三次失败才找到正确形态

**问题：** Claude 不擅长主动提问。用户回答问题的体验也很慢。如何降低人机沟通的摩擦？

**Attempt #1 — 塞进 ExitPlanTool 的参数**

把"问题列表"作为 ExitPlanTool 的一个 array 参数。最简单的实现，但 Claude 困惑了——同时要求它输出计划和关于计划的问题，如果用户的回答和计划矛盾怎么办？它是不是要再调一次 ExitPlanTool？

**教训：一个工具不该承担两个目的。**

**Attempt #2 — 修改输出格式**

让 Claude 在 markdown 里用特殊格式写问题（带括号的选项列表），前端解析后渲染成 UI。最通用的方案，Claude 也勉强能输出——但不稳定。它会多写句子、漏掉选项、换格式。

**教训：自由格式输出不可靠。structured output 的价值不只是格式化，是约束。**

**Attempt #3 — 独立的 AskUserQuestion Tool**

单独建一个 tool，Claude 随时可以调用。调用时弹出 modal，阻塞 agent loop 直到用户回答。结构化输入保证了选项完整。

关键发现："Claude seemed to like calling this tool" — **最好的工具设计也没用，如果模型不理解怎么调用它。** 反过来说，模型"喜欢"调用的工具才是好工具。

### 对我们的启发

Paw 的交互设计也面临同样的问题——什么时候让 agent 主动提问？当前 Paw 用 delegate 事件，但没有结构化的提问机制。AskUserQuestion 的迭代过程说明：

- 别混合目的（plan ≠ question）
- 别依赖自由格式（markdown 解析不稳定）
- 给 agent 一个专门的、结构化的提问通道
- 测试标准不是"能不能输出"而是"模型是否自然地选择调用它"

## 2. TodoWrite → Task Tool：工具要跟模型能力一起演进

**阶段 1：** Claude 需要 TodoList 保持专注。给它 TodoWrite tool 写清单、逐项打勾。但它经常忘记要做什么，于是每 5 轮插入系统提醒。

**阶段 2：** 模型变强后（Opus 4.5），不需要被提醒了——反而被提醒后觉得必须严格遵循清单，不敢修改。而且 subagents 变好用了，但多个 subagent 怎么共享一个 TodoList？

**解决：** 用 Task Tool 替代 TodoWrite。Task 不是"保持专注"的拐杖，而是 agent 之间的协调协议——有依赖关系、跨 subagent 状态共享、可增删改。

**教训：模型能力提升时，旧工具可能从帮助变成限制。必须持续重新审视工具假设。**

### 对我们的启发

这跟我们的 board CLI 设计直接相关。board 是给 Momo 用的状态机，但如果模型能力继续提升，board 的强制门禁可能从"保护"变成"阻碍"。需要定期评估：哪些约束还有价值？哪些已经变成不必要的摩擦？

更深层的洞察：**工具设计不是一次性的，是持续的共演化。** 模型在变，工具也要跟着变。

## 3. RAG → Grep → Progressive Disclosure：让 agent 自己建 context

**阶段 1 — RAG 向量数据库：** 快速但需要 indexing 和 setup，跨环境不稳定。最大问题——Claude 是被动接收 context 而不是主动寻找。

**阶段 2 — Grep Tool：** 给 Claude 一个搜索工具，让它自己搜文件建 context。简单但有效——Claude 越来越擅长搜索。

**阶段 3 — Progressive Disclosure + Agent Skills：** 形式化了"渐进式披露"——Claude 读 skill 文件，skill 文件引用其他文件，递归搜索。不需要新 tool，只需要文件引用链。

**一年内的变化：** 从不能自建 context → 多层嵌套搜索精确找到需要的内容。

**教训：给 agent 搜索工具比喂它 context 更有效。Progressive disclosure 是加功能而不加 tool 的模式。**

### 对我们的启发

我们的 recall.js 就是这个路径——从 keyword search → BM25+向量 → 图扩展+spreading activation。但 Thariq 的洞察更根本：**最好的 context 是 agent 自己找的。** 我们的 AGENTS.md → SKILL.md → references/ 结构就是 progressive disclosure，但可以做得更彻底——让 recall 的搜索路径更透明，让 agent 理解"为什么找到这些"。

## 4. Guide Agent：不加 tool 也能加能力

**问题：** 用户问"怎么加 MCP"、"slash command 是什么"，Claude 答不上来。

**方案 1 — 塞进系统 prompt：** 大部分用户不会问这些，白白占 context，产生 context rot。

**方案 2 — 给 docs 链接让 Claude 搜索：** 能用但 Claude 会 load 太多内容只为找一个答案。

**方案 3 — Guide 子代理：** 专门的 subagent 负责搜索文档、返回精炼答案。不加 tool，用 progressive disclosure 触发。

**教训：~20 tools 已经够多了。加新 tool 的门槛应该很高——每多一个选项，模型就多一个要思考的决策分支。能用 progressive disclosure 解决的，不加 tool。**

### 对我们的启发

这解释了为什么 OpenClaw 的 skill 系统用 SKILL.md 文件而不是直接注册 tool——progressive disclosure 让 agent 按需发现能力，而不是一次性全部加载。

## 元教训

整篇文章最有价值的不是四个案例本身，而是背后的方法论：

1. **工具设计是共演化** — 模型在变，工具跟着变，没有终极形态
2. **"模型喜欢用"是最重要的测试标准** — 比"理论上更优"更重要
3. **Progressive disclosure > 塞 context** — 让 agent 主动搜索比被动喂养更好
4. **约束数量要克制** — 每个 tool 都是认知负担，能不加就不加
5. **Read your outputs** — 看 agent 的实际行为，不是你想象中的行为

这五条跟 kenefe 的"让 AI 理解而不是从规则上限制"理念完全一致。好的工具设计不是给模型画框，是给它合适的手。

## 参考

- [原文](https://x.com/trq212/status/2027463795355095314)
- [Claude Code Prompt Caching 文章](https://x.com/trq212) (ExitPlanTool 背景)
- [Agent Skills 文档](https://docs.anthropic.com/en/docs/agents)
