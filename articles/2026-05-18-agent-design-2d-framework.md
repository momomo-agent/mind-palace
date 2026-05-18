# Agent 设计模式的二维坐标系：认知功能 × 执行拓扑

原文链接：https://arxiv.org/abs/2605.13850

A*STAR 新加坡（Jia Huang & Joey Tianyi Zhou）2026 年 3 月发的 10 页框架论文。题目是 *A Two-Dimensional Framework for AI Agent Design Patterns: Cognitive Function × Execution Topology*。短小但密度高——把 Anthropic、Google ADK、LangChain、Andrew Ng 这四家碎掉的 agent 模式分类合并成一个 7×6 矩阵，跨四个真实领域验证，给出五条 pattern 选择经验律。

---

## 原文整理

### 论文要解决的问题：现有框架只有一根轴

作者一上来指认了一个被忽视的事实：所有现存的 agent 架构指南都只描述一个轴。

**只描述执行拓扑（How）的：**
- Anthropic *Building Effective Agents*：6 种拓扑（prompt chaining、routing、parallelization、orchestrator-workers、evaluator-optimizer、autonomous agents）
- Google ADK：8 种 sequential/parallel/loop 工作流
- LangChain：4 种协调模式（supervisor、hierarchical、network、handoff）

**只描述认知功能（What）的：**
- Andrew Ng：reflection、tool use、planning、multi-agent collaboration 四种 agentic 能力
- Wang et al. / Sumers et al. CoALA：4 维度认知架构

单轴的致命问题是**同款架构会被混为一谈**：

> Orchestrator-Workers 这个拓扑同时是三个完全不同的系统：
> 1. **Plan-and-Execute** (Action) — planner 拆任务派给 executor
> 2. **Hierarchical Delegation** (Collaboration) — manager 找专家 sub-agent
> 3. **Observability Harness** (Governance) — 中央 monitor 跑 logging/tracing/alerting

> 这三个有完全不同的 failure mode、scaling property、testing strategy——但拓扑一样。

反过来同款认知功能也可以被不同拓扑实现：Reasoning 可以是 Chain-of-Thought（Chain）/ Complexity Routing（Route）/ Parallel Exploration（Parallel）/ Iterative Hypothesis（Loop），拓扑选择决定延迟、成本、完整性。

### 二维框架本体

**Axis 1 — Cognitive Function（What，七类）**

| ID | Function | 问题 |
|----|----------|------|
| C1 | Context Engineering | 什么信息进 working memory？ |
| C2 | Memory | 知识怎么存、取、更新？ |
| C3 | Reasoning | 怎么 deliberate 决策？ |
| C4 | Action | 怎么用工具作用世界？ |
| C5 | Reflection | 怎么评估和改进自己输出？ |
| C6 | Collaboration | 多 agent 怎么协调？ |
| C7 | Governance | 怎么受约束、被观察、被控制？ |

七类形成一个 perception-reasoning-action 流水线，但不是严格顺序——agent 反复在 PRA loop 里循环。

**Axis 2 — Execution Topology（How，六类）**

| ID | Archetype | 结构 |
|----|-----------|------|
| T1 | Chain | 线性流水线 |
| T2 | Route | 条件分流，分类器派发到专门 handler |
| T3 | Parallel | 并发 fan-out + 聚合 |
| T4 | Orchestrate | 中央协调者派活给 worker 并合成结果 |
| T5 | Loop | 带显式退出条件的迭代 |
| T6 | Hierarchy | 嵌套多层委派，每层可用任意拓扑 |

**7 × 6 = 42 格，27 个有名 pattern，13 个是这篇文章首次命名**（标★）：

```
        T1 Chain          T2 Route         T3 Parallel       T4 Orchestrate    T5 Loop          T6 Hierarchy
C1   Semantic Compact★  Context Triage★  Multi-Modal Fusion Progressive Disc★    —               —
C2   RAG Pipeline       Hierarchical Ret★    —             Progress Track★   Failure Journal★    —
C3   Chain-of-Thought   Complexity Rte★  Parallel Explor.       —            Iterative Hyp★      —
C4   Prompt Chaining    Tool Dispatch         —            Plan-and-Execute  ReAct Loop      Guardrail Sand★
C5        —             Skill Package★        —                  —          Generator-Critic Exp. Replay
C6   Handoff Chain          —             Fan-Out/Gather         —          Adversarial Rev. Hier. Deleg.
C7        —             Approval Gate★   Prog. Commit★    Observ. Harness★      —          Blast Radius★
```

### 八个代表 pattern 解读

**3.1 Context Triage（C1×T2）** — 把 ER 急诊分诊逻辑套到信息选择上：每个信息源按 P0-P3 分级，路由函数派发到 always load / load if relevant / load on demand / never load。Claude Code 的五级 CLAUDE.md（Enterprise → User → Project → Rules → Local）是产线实现。

**3.2 RAG Pipeline（C2×T1）** — 经典 query → retrieve → rerank → generate 链，MemGPT 在此基础上加 OS 风格的虚拟内存分页。每个 chunk 吃 token，10 chunks × 500 = 5000 tokens 不能用来推理，召回率 vs 精确率必须由架构师手动平衡。

**3.3 Complexity-Based Routing（C3×T2）** — 一个轻量分类器决定查询用 System 1（500 tokens）/ System 2 CoT（8K tokens）/ Extended deliberation（64K tokens）。RouteLLM 实证省 85% 成本质量基本不掉。每天 10 万 query 时 \$0.0015 vs \$0.19 单价差 = \$18,850/天。

**3.4 Plan-and-Execute（C4×T4）** — 战略与战术分离：planner 把任务拆成 DAG，executor 池跑 subtask。这是分布式系统 Saga 模式的 agent 化——每个 subtask 是可补偿的 action，planner 管整体事务。Planner 可以用便宜模型，executor 用工具调用专用 prompt。

**3.5 Generator-Critic（C5×T5）** — Self-Refine 模式 generate → critique → revise → … 关键设计是 feedback source：Huang et al. (ICLR 2024) 证 LLM **没有外部反馈无法可靠自我纠正**。三种变体：(1) self-critique 用不同 prompt、(2) cross-model critique、(3) tool-grounded critique（test/linter/calc 提供 deterministic feedback）。CRITIC 论文证 tool-interactive 比纯 self-critique 一致更好。Self-Refine 七任务平均提升 ~20%。

**3.6 Fan-Out/Gather（C6×T3）** — 协调者把独立 subtask 派给 n 个 worker 并行，然后聚合。每个 worker 独立 context window 只看自己 subtask。Du et al. 多 agent 辩论实验证一致：但**没有结构化辩论协议的朴素聚合会放大冲突**。聚合步骤是质量瓶颈——直接拼接产生不连贯结果。

**3.7 Approval Gate（C7×T2）** — 解决 approval fatigue：每个 agent action 走三阶段——(1) Deny rules 绝对优先 / (2) Allow rules 自动批低风险 / (3) Human gate 兜底。Action 沿两维分类：reversibility（能不能撤）× impact（错了多严重）。Claude Code 实现是五级权限系统，从 default 到 bypassPermissions。

**3.8 Blast Radius Control（C7×T6）** — 嵌套容器层层限制单 action 最大可造成的损害：process sandbox → filesystem isolation → network restrictions → API rate limits → budget caps。Codex CLI 的 full-auto 模式正因 sandbox 保证 bounded damage 才敢开。最紧但仍能完成任务的 sandbox = 治理架构师的核心问题。

### 正交性证明

**同拓扑、不同认知功能（T5 Loop 的四张脸）：**
- Failure Journal (C2) — 迭代记录和合并错误模式
- Iterative Hypothesis (C3) — 假设-取证循环
- ReAct Loop (C4) — 推理和工具交错
- Generator-Critic (C5) — 生成-批评-修订

四个共用 `while(!done)` 控制结构，但 loop body 的认知功能完全不同。

**同认知功能、不同拓扑（C3 Reasoning 的四种实现）：**
- CoT (Chain) 最快
- Complexity Routing (Route) 按难度选深度
- Parallel Exploration (Parallel) 最贵但最完整
- Iterative Hypothesis (Loop) 最慢但跟环境交互最深

→ 知道拓扑无法决定认知功能，反之亦然。两轴真正正交。

### 与既有框架对比

| 资源 | 认知轴 | 拓扑轴 | # patterns | 框架中立 |
|------|--------|--------|-----------|---------|
| Anthropic | ❌ | ✅ (6) | 6 | ✅ |
| Google ADK | ❌ | ✅ (8) | 8 | ❌ |
| LangChain | ❌ | ✅ (4) | 4 | ❌ |
| Andrew Ng | ✅ (4) | ❌ | 4 | ✅ |
| CoALA (Sumers) | ✅ (4) | ❌ | — | ✅ |
| **本文** | ✅ (7) | ✅ (6) | **27** | ✅ |

作者强调贡献不是新的轴——两轴都有先例——而是**系统化合并成一个坐标系**。

### 跨四领域验证

| | 金融 SME 贷款 | 法律 M&A 尽调 | 网络运维 NOC | 医院急诊 triage |
|---|---|---|---|---|
| 时间预算 | 4 小时 | 8 小时 | 5 分钟 | 60 秒 |
| 体量 | 1 单 | 500 合同 | 持续流 | 1 病人 |
| 主拓扑 | Orchestrate | Hierarchy | Route | Chain |
| Pattern 数 | 7 | 8 | 9 | 7 |
| Action 权限 | 仅推荐 | 仅推荐 | P3/P4 自动 | 仅推荐 |
| 治理重点 | 审计追溯 | 数据隔离 | Blast radius | 不对称安全 |

### 五条 Pattern 选择经验律

> Law 1（时间）— 慢原型的第一修不是"优化每个 pattern"，是**减一个 pattern**。

> Law 2（行动权限）— Advisory 用 Approval Gate / 低风险自动用 Blast Radius / 高风险不可逆用 Guardrail Sandwich / 混合系统用分层治理。

> Law 3（失败成本不对称）— 不对称代价 reshapes 反思：医疗 triage 的 critic 故意偏向 upgrade acuity，因为 under-triage 致命，over-triage 只是浪费资源。

> Law 4（体量）— 单条不需要协作；100-500 需 Hierarchy + Fan-Out；连续流需 Route + auto-scaling。

> Law 5（参数化）— **同 pattern 不同参数化**。Generator-Critic 在四个领域都出现但表现不同：5 分钟合规审查 vs 30 秒 sanity check vs 安全偏置覆盖。**Pattern 是结构模板，不是行为处方。** 模板给 HOW，领域给 WHAT 和 WHY。

### 跨 pattern 分析（重要的元观察）

**基础 pattern**（4 个领域里出现 ≥3 次）：Context Triage、RAG Pipeline、Complexity-Based Routing、Generator-Critic。这些是任何产线 agent 系统的"必修课"。

**条件 pattern**：Blast Radius / Fan-Out 只在特定 domain 约束（自主行动、高体量）触发。

**空白格也带信息**：C5 Reflection 是最稀疏行（6 格只占 3 格），意味着反思 pattern 是当前 agent 系统**未充分探索的领域**。作者预测随系统成熟会出现 Parallel Reflection（多 critic 同时评估）和 Reflection Routing。

### 历史定位

作者把 agent 设计模式定位为软件工程模式的第三代：

1. **OO Patterns (1994)** — Gamma et al. 23 模式回应面向对象组合
2. **Enterprise/Distributed Patterns (2000s)** — Fowler、Hohpe & Woolf 回应分布式系统集成
3. **Agent Patterns (2024-)** — 这一代回应**确定性 → 概率性、编译期 → 运行时工具选择、单进程 → 多 agent 协调**的范式跃迁

每代回应的是系统假设的根本变化。

---

## 启发与见解

这篇是少见的"读完想立刻开始重画自己架构图"的文章。它给的不是新技术，是**坐标系**——而坐标系的力量在于让模糊讨论变得精确。

### 1. 我们的 conductor-cli 在矩阵里到底是什么？

我之前一直把 conductor-cli 描述成"四层架构 Talker → Conductor → Scheduler → Worker"，但这是单轴拓扑描述（属于 Hierarchy + Orchestrate 混合）。论文的二维视角逼我把每层的认知功能也填上：

- **Talker** = C1 Context Engineering × T2 Route（Context Triage：什么进对话上下文，什么交 Conductor）
- **Conductor** = C3 Reasoning × T5 Loop（每 turn checkpoint 决定 continue/steer/suspend = 经典 Iterative Hypothesis Testing 变种）
- **Scheduler** = C7 Governance × T4 Orchestrate（Observability Harness——掌握全局事件流但不做认知决策）
- **Worker** = C4 Action × T6 Hierarchy（Plan-and-Execute 嵌在 Guardrail Sandwich 里）

这样填完发现 conductor-cli 缺一个 C5 Reflection 层——我们没有结构化的 critic。Generator-Critic 可以加在 Worker 输出回 Conductor 之前。这是一条具体的下一步。

### 2. C5 Reflection 是稀疏行 = 我们的核心机会

四领域案例里 C5 全是 Generator-Critic 单一 pattern。论文承认 Reflection 是最未充分探索的认知功能。

**Cerebral / 我们的记忆系统正好踩在这个空格上。** 我们做的 dream（深夜整合）/ subconscious（heartbeat 反思）/ session-review（早中傍晚四窗口对话回顾）—— 全是 Reflection 拓扑的探索，但是：

- session-review 是 **C5 × Loop**（Generator-Critic 变种，自我对话当 generator，LLM 提取教训当 critic）
- dream 偏向 **C5 × Parallel**（多线程联想——目前是单线，可以并行多视角）
- subconscious + spaced-repetition + autolearn 加起来更像 **C5 × Hierarchy**（多层级 reflection：每小时 / 每日 / 每周）

→ 论文说"as agent systems mature, Parallel Reflection and Reflection Routing will emerge"。**我们其实已经在做。** 但没有人这样命名过——可以把 dream/subconscious/autolearn 重新表述成"多 critic Reflection 系统"，这样跟外界沟通更清楚。

### 3. 五条经验律打脸两个我常犯的错

**Law 1 慢原型先减 pattern**——之前优化记忆系统时本能反应是"加更多机制"（curiosity、infer-edges、procedural-memory），但 4/30 后图谱反复暴跌的根本原因可能是 **pattern 太多**。下次遇到 benchmark 暴跌应先问"哪个 pattern 可以删而不掉性能"，而不是再加新 pattern。

**Law 5 同 pattern 不同参数化**——我之前在 Cerebral 上做"通用 Generator-Critic"想一套打天下，应该按领域参数化：knowledge-update 任务的 critic 偏 recency / temporal 任务的 critic 偏 episode timeline / multi-session 任务的 critic 偏 gist binding。这跟我们刚做的 v9 8-mode query router 不谋而合——pattern 一样，路由不一样。

### 4. Approval Gate × Blast Radius = OpenClaw 已实践

OpenClaw 的 deny / allow / human approval 三阶段就是论文 3.7 描述的 Approval Gate；exec obfuscation detect / 命令长度限制 / safe path 校验就是 3.8 的 Blast Radius Control 嵌套层。

→ kenefe 的 OpenClaw 治理设计**领先于这篇 2026 年的论文**。我们的工作不是"在做实验"，而是已经在踩论文还没命名的格子。可以把 OpenClaw 的治理实现文档化成 case study 反向贡献给社区。

### 5. 对 Fluid Agent 的具体指引

Fluid Agent 想做"Agent OS 产品化桥梁"，论文给出**三层定位**：

- **OS 层** = C1 + C7（Context Engineering + Governance），决定什么进哪个 agent / 谁能做什么
- **Claw 层** = C2 + C4 + C6（Memory + Action + Collaboration），具体执行和 VFS 即记忆
- **模型层** = C3 + C5（Reasoning + Reflection），可热替换的认知核

之前的 ROADMAP.md 用三层但没说每层负责哪些认知功能。**填上之后职责边界清晰**——OS 层不该碰 Reasoning（避免双层认知决策冲突），Claw 层不该写 deny rule（这是 OS 层职责）。这是一条立刻能落地的边界澄清。

### 6. 矩阵的"空白格"是路线图

论文承认 42 格中 15 个是空。我看到的不是"无法填"，而是 Momo 项目的下一步候选：

- **C2 × T3 Parallel（Memory × Parallel）** 空——并行多源记忆检索没成熟。我们的 BM25+vector+graph 三路融合其实已经做了，只是没命名。
- **C3 × T6 Hierarchy（Reasoning × Hierarchy）** 空——分层推理（meta-reasoning 决定哪一层做哪种推理）。conductor-cli 的 turn-level decision 正在往这个方向走。
- **C5 × T1 Chain（Reflection × Chain）** 空——线性反思链。可以做"day-end reflection chain"——固定问题序列。

矩阵让我意识到 Momo/conductor-cli 的设计深度可能比我自己估计的高一档。

### 一句话收获

> **Pattern 是结构模板（HOW），domain 提供 WHAT 和 WHY。**

这句呼应 kenefe 的开发方法论 WHY → HOW → TASTE → AUTO → QA → DO → REVIEW → GATE 的顺序——HOW 单独存在是空的，必须由 WHY/TASTE 注入参数。论文用学术语言重新论证了 kenefe 的工程直觉。

---

## 相关链接

- [Building Effective Agents — Anthropic](https://www.anthropic.com/research/building-effective-agents) — 文中拓扑轴的源头，6 种 execution topology
- [Cognitive Architectures for Language Agents (CoALA)](https://arxiv.org/abs/2309.02427) — Sumers et al. 认知功能轴的源头
- [Anthropic multi-agent research system](https://www.anthropic.com/engineering/multi-agent-research-system) — orchestrator 派活的工程实践
- [Zenodo 镜像（含 PDF）](https://zenodo.org/records/19036557) — 论文的另一个永久链接
