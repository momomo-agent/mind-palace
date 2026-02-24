# MemSkill：自进化 Agent 的"记忆技能"

> **来源**: [arXiv 2602.02474](https://arxiv.org/abs/2602.02474) · NTU、UIUC、UIC
> **小红书解读**: [作者自宣](https://www.xiaohongshu.com/discovery/item/698c5f60000000001b016f21)

💡 **看点：把"怎么构建记忆"从手工流水线升级为可学习、可进化的技能库。核心范式转变 — Skill-conditioned Generation。**

---

## 问题：手工记忆流水线的局限

目前很多 Agent Memory System 还停留在"手工搭记忆提取模块流水线"的范式：

- 过于 rigid，强依赖人类先验，难以泛化到新数据
- turn-level 的顺序处理不够 scalable，长轨迹下成本和维护负担都很重
- 固定模块无法自我进化

## 核心方案：Skill-conditioned Generation

不再逐 turn 跑一堆固定模块，而是以 span/chunk 为单位做总结。每次只需根据当前 span context 选取一小组相关的 memory skills 进行组合，把 skills + text span 一起输入 LLM，就能生成结构化的记忆更新。

### Controller → Executor 流程

给定一个 text span，Controller 先为 skill bank 中的候选 skills 打分并选择最佳 Top-K，避免把整个技能库塞进 LLM 造成干扰。随后 Executor 在这些 skills 条件约束下进行 span-level 的记忆生成与更新。

用强化学习训练 Controller，用下游任务反馈作为奖励信号，让它学会"什么时候该用哪些 skills"。

### Designer：从失败中自进化

为了减少 human prior，让 skills 能 self-evolve，设计了 Designer：

- 维护一个 failure-driven 的 hard-case buffer
- Designer 定期回看并提炼重复出现的失败模式
- 通过分析转化为 skill edits（更清晰的触发条件、更严格的抽取规则、更规范的输出 schema）或 new skills（补齐缺失的记忆技能）

## 实验结果

- **对话记忆**（LoCoMo、LongMemEval）：稳定提升
- **具身决策**（ALFWorld）：稳定提升
- **泛化能力**（LoCoMo → HotpotQA）：验证跨任务通用性

## 与我们记忆系统的关联

- **Skill Bank ↔ graph.json clusters** — 都用结构化方式组织记忆操作
- **Designer ↔ failure-tracker.js** — 都从失败案例中自进化
- **Controller 选 skill ↔ recall.js 扩散激活** — 都是根据上下文选择相关知识
- **span-level 处理** — 我们目前是 turn-level（每条消息触发 recall），span-level 更精准但实现更复杂

关键启发：MemSkill 的 Designer 机制跟我们的 failure-tracker + evolve 思路一致，但它用 RL 训练 Controller 选 skill 这步比我们的规则匹配更优雅。
