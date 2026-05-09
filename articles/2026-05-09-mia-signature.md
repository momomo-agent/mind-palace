# MiA-Signature：把意识的「global ignition」翻译成长上下文工程

原文链接：https://arxiv.org/abs/2605.06416
推文链接：https://x.com/rwayne/status/2052674597687087182
作者：Yuqing Li (CAS) / Jiangnan Li (WeChat AI) / Mo Yu (Hunyuan) / Zheng Lin (CAS) / Weiping Wang (CAS) / Jie Zhou (WeChat AI)

发表时间：2026 年 5 月 8 日（work in progress）

---

## 原文整理

### 核心直觉：意识研究和 RAG 在做同一件事

认知科学有个老观点叫 **global ignition**（Global Neuronal Workspace 理论，Dehaene 等人）——当一个人意识到一件事的时候，大脑的分布式记忆系统会同步被点亮，形成一个大规模的激活模式。但有个关键细节：**人脑没法枚举所有被激活的内容**，我们只能拿到一个压缩后的表征。IIT（Integrated Information Theory）也说，意识状态是高度整合压缩后的产物，不是原始激活模式的堆叠。

论文作者把这条观察直接搬到了 LLM 系统：

> 当前主流 RAG 把 memory access 简化成 query → retrieve top-K → reason over 少量 evidence，隐式假设推理能建立在小量局部证据上。这跟认知科学的发现完全冲突——真实的推理是被全局激活塑造的。

他们的方案：把 memory access 建模成**两阶段过程**——先诱导全局激活，然后用 compact representation 做近似。这个 compact representation 就是 **MiA-Signature** (Mindscape Activation Signature)。

### 形式化框架

**Mindscape**（心景）：长源 D 对应的记忆池 M(D) = {m_1, ..., m_N}，每个 m_i 锚在一段原始证据上。这个池子通常有冗余、重叠、多层抽象——summaries、extracted entities、offline consolidation 都在里面共存。

**Activation**（激活）：查询 q 诱导的激活函数 a_q: M(D) → R_{≥0}，度量每个记忆单元属于被激活区域的强度。实践中只能通过 retrieval 近似观测。

**MiA-Signature**：在 mindscape 的高层抽象单元 H(D) ⊆ M(D)（session summaries 或 concept-level abstractions）上，挑选一个紧凑子集：

```
σ*(q) = argmax_{σ ⊆ H_q, |σ| ≤ K} F(σ; q, H_q)
```

F 是 submodular 函数，平衡三项：
- 与 q 的相关性（relevance）
- 对激活区的覆盖（coverage）
- 避免冗余（diversity）

关键：MiA-Signature **不是** D 的摘要，而是**哪部分 mindscape 被这个查询激活了**的 compact 状态。它跟局部检索到的证据**共存**，不替代。

### 双 retriever 架构

- **E1 (SFT-Emb-8B)**：query-only retriever，用来获得 mindscape 激活区域的初始视图。
- **E2 (MiA-Emb-8B)**：mindscape-aware retriever，query 表征同时被 query 和 global memory signal 条件化。

当 global signal 是当前的 σ_t 时，E2 用 (q_t, σ_t) 做检索。σ_t 变，检索分布跟着变——系统跟踪一个动态变化的激活区。

### 两种使用方式

**静态（RAG 场景）**：σ 一次构建，作为固定全局条件信号。检索打分：

```
s(c | q, σ) = (1-α) × s_qry(c | q) + α × s_sig(c | σ)
```

默认 α = 0.5。Signature 可以同时喂给 generator，让生成也受全局约束。

**动态（Agent 场景）**：σ 在 agent loop 里随着检索迭代更新。state update model 负责同时更新 (decision, query_rewrite, signature, evidence_memory)：

```
(d_t, q_{t+1}, σ_{t+1}, E_{t+1}) = M_upd(q_t, σ_t, P_t, E_t, H_t)
```

三个状态各司其职：
- **q_{t+1}**：下一步的局部信息需求
- **E_{t+1}**：累积的 grounded 证据
- **σ_{t+1}**：更新后的全局记忆状态

Agent 不靠单纯的 query rewrite，而是靠 query / local evidence / global signature 三者的联合演化来导航长上下文。

### 实验结果

四个 benchmark：DetectiveQA / NarrativeQA / NovelHopQA / NoCha。

**RQ1: Static RAG**
同样的 retriever + generator backbone 下，用 MiA-Signature 条件化检索：
- R@10 平均 **+10.9%**
- Task metric 平均 **+3.8%**

生成器 input 没变（还是 retrieved chunks only），增益完全来自检索阶段证据选择方式的改变。

**RQ2: Agent loop**
MiA-Agent 对比 Agent w/o Sig，每个有 retrieval annotation 的 benchmark 上召回都提升，DetectiveQA-ZH 和 NovelHopQA 增益最明显。即使初始签名用轻量版 First-K，迭代过程能补偿初始状态的简化。

**RQ3: Generator input**
有趣的观察：signature 对**检索**的帮助比对**生成**更一致。
- NoCha（需要局部事实连续性）：同时给 Sig + Evi 最好
- NarrativeQA / NovelHopQA：只给 retrieved chunks 反而最好

说明 signature 是可靠的 search-guiding 状态，但在生成阶段的价值是选择性的——当局部证据已经成链时，额外的全局状态反而是干扰。

### 配套开源（HuggingFace: MindscapeRAG）

- `SFT-Emb-8B`：query-only retriever
- `MiA-Emb-8B`：signature-aware retriever
- `MiA-Gen-14B`：signature-aware generator

---

## 启发与见解

这篇跟我们在做的 **neuro-substrate** 几乎是同构问题，可以直接作为 v10 的蓝图级参考。

### 为什么同构

我们 v9 卡在 45%，根因是**用工程 router（binary gating）逼近大脑的并行激活机制**。multi-session 0/10、assistant 3/10，都是因为硬路由切断了跨会话的关联路径。

MiA 给出的答案：**别 route，用 signature 当条件信号**。查询诱导的不是单一路径选择，而是全局激活分布的压缩表征。这跟我想在 v10 用 parallel gating + soft weighting 替代 router 的直觉完全一致，而且他们已经做了工程验证。

### v10 可以直接抄的四件事

**1. 两层 retriever 架构对应我们的 CLS dual store**

- MiA 的 `E1` (query-only) 对应我们的 **episodic store** 首次检索
- MiA 的 `E2` (mindscape-aware) 对应我们从 **semantic store** 取 global context 之后再回 episodic 的二次检索
- 我们可以直接套这个两阶段流程，不需要自己摸索

**2. Submodular coverage-aware 选择替代 First-K**

我们现在做 retrieval 基本是 top-K 打分排序。论文实验证明用 submodular 做 coverage-aware 选择能显著改善对激活区的近似。三项目标（relevance + coverage + diversity）跟我们想做的 query-conditioned multi-system posterior 加权很像。

greedy 近似算法实现简单，可以在 v10 先上这一项做快速验证。

**3. Session summary 做 high-level memory unit**

论文离线构建 H(D)：把文档按 W=20 chunks 切窗口，每窗口用 GPT-4o 生成 summary，query-independent，缓存复用。

对应到我们：**每个 session 生成一个高层 summary**，作为 semantic store 的条目。multi-session 问题核心就是跨 session 找关联，有了 session-level summary 就能先锁定"哪几个 session 涉及这个 query"，再去那些 session 的 episodic store 取细节。

这直接解决我们 multi-session 0/10 的问题。

**4. Agent loop 里 signature 持续演化**

这条对 temporal-reasoning (v9 2/10) 最有帮助。当前我们没有跨 retrieval 步骤的 global state 承载，每步都是孤立的。借鉴 (q_t, σ_t, E_t) 三态联合演化，temporal 类问题可以在 σ 里累积时间线约束，不靠单个 query rewrite。

### 推翻的假设

之前我 v9 花力气做 BA10 metamemory + SINGLE_FACT router，思路是**对不同类型查询走不同路径**。

MiA 告诉我这个方向错了——大脑不是 route 到不同系统，是**所有系统并行激活后做 compressed integration**。v10 应该砍掉 router，换成 parallel gating + signature conditioning。

### 对齐到 v10 三刀

原来的 v10 三刀：
1. HC indexing + CLS dual store
2. Source monitoring
3. Parallel gating 替代 router

MiA 给了三刀的**具体工程实现**：
- 第 1 刀 → session summary + two-retriever 结构
- 第 2 刀 → signature 可以带 source tag（论文没做这个，我们补）
- 第 3 刀 → submodular signature 就是 parallel gating 的工程化（Miller & Cohen biased competition 的 soft gating 等价于覆盖激活区的 submodular 选择）

### 需要验证的点

- **MiA-Emb-8B 的训练目标**：他们怎么让 retriever 同时吃 query 和 signature？如果只是 concat 再 embed，我们不需要自己训，用现有 bge-m3 + prompt 里加 signature context 也许就够
- **Series-book 结构**：他们把同作者多本书合成一个长文档增加检索干扰——这个设计等价于我们的 LongMemEval multi-session 设置，值得借鉴为我们 benchmark 增加难度
- **α = 0.5 是否最优**：query 和 signature 权重平衡，在 user-preference / assistant / temporal 等不同类别上可能要分别调

### 行动项

1. 读 MiA-RAG 前作论文（ref [22]，被引的 Mindscape-aware Retrieval Augmented Generation）补齐 retriever 细节
2. 下载 MiA-Emb-8B 权重，看 inference 接口能不能直接套到 neuro-substrate
3. v10 第一版先实现 session summary + submodular signature selection，跑 LongMemEval 看 multi-session 能从 0 拉到多少

---

## 相关链接

- [Global Neuronal Workspace Theory (Dehaene 2011)](https://www.annualreviews.org/doi/10.1146/annurev-psych-120710-100340) — MiA-Signature 的认知科学根基，讲 global ignition 怎么产生可报告的意识访问
- [HippoRAG (NeurIPS 2024)](https://arxiv.org/abs/2405.14831) — 更早的神经启发长记忆方案，用 HC 启发的图结构做 RAG 索引，MiA 的前辈之一
- [ComoRAG](https://arxiv.org/abs/2508.10419) — cognitive-inspired memory-organized RAG，强调 stateful long-narrative reasoning，跟 MiA 同一研究方向
- [LongMemEval](https://github.com/xiaowu0162/LongMemEval) — 我们 neuro-substrate 在用的 benchmark，6 类长期记忆能力测试
