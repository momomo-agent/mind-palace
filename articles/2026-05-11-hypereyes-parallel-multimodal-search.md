# HyperEyes: 并行多模态搜索 Agent 的效率感知强化学习

原文链接：https://arxiv.org/abs/2605.07177

---

## 原文整理

### 核心问题

现有多模态搜索 agent 处理多实体查询时采用串行方式——每个实体一次 tool call，累积冗余交互轮次。对于可分解的查询，agent 应该 **search wider, not longer**：在一轮内并发派发多个 grounded query，而非串行排队。

### HyperEyes 方案

**Unified Grounded Search (UGS)**：把视觉定位（crop）和检索（search）合并为单一原子操作。传统方案是 "crop-then-search" 两阶段管道（早期定位错误会污染下游），UGS 让 bounding box 成为检索动作的参数，一次性定位所有目标实体并并行搜索。

**双粒度效率感知 RL 框架**：

1. **宏观层 — TRACE reward**：轨迹级奖励，reference 在训练过程中单调收紧，抑制冗余 tool call 但不过度限制真正需要多跳的搜索
2. **微观层 — On-Policy Distillation (OPD)**：在失败 rollout 上注入外部 teacher 的 dense token-level 修正信号，解决稀疏 outcome reward 的 credit assignment 问题

**训练数据**：Parallel-Amenable Data Synthesis Pipeline + Progressive Rejection Sampling，专门构造需要并行 tool 调用的多实体 QA 对。

### 关键实验发现

**更多 tool call ≠ 更高准确率**（Table 13）：
- FVQA：准确率在 budget=2 时最高(66.5%)，增加 call 反而下降
- BCVL：准确率在 budget=4 时最高(36.1%)，之后下降
- 这是普遍现象，不是 benchmark 特异性

**主实验结果**：
- HyperEyes-30B 比同级最强开源 agent 准确率 +9.9%，tool call 轮次减少 5.3×
- HyperEyes-235B 在 6 个 benchmark 上全面 Pareto 支配

**Unified Grounded Search vs 其他范式**（严格控制实验）：
- UGS: 58.2% acc / 2.04 turns（235B）
- LLM Crop: 53.0% / 2.7 turns
- Code Crop: 55.3% / 3.07 turns
- UGS 在准确率和效率上双赢

**鲁棒性**：
- 3 个随机种子，6 benchmark 平均准确率 std 仅 0.19 点
- 注入 10 个干扰证据后仍保持 90.6% 准确率

### Case Study: DeepEyes-V2 vs HyperEyes

多人物识别任务：
- DeepEyes-V2：串行 crop-then-search，12 轮，最终答错
- HyperEyes：1 轮并行定位所有 6 人 + 1 轮文本验证，3 轮完成，答对

### 技术细节

- 基座模型：Qwen3-VL-30B-A3B / Qwen3-VL-235B-A22B
- SFT 数据：~30K 对话
- RL 数据：30B 用 5.5K，235B 用 8.5K
- 训练基础设施：8 节点 × 8 GPU（NVIDIA H20 141GB）
- Rollout：SGLang，Training：Megatron-LM
- OPD teacher：HyperEyes-235B (RL) 作为 30B 的 teacher

---

## 启发与见解

1. **"效率作为一等训练目标"** 这个思路很有价值。我们的 conductor-cli 和 DevTeam 也面临类似问题——agent 倾向于多做几步"以防万一"，但额外步骤不仅浪费 token 还可能引入噪音。TRACE 的动态收紧 reference 是个好思路：不是硬限制 tool call 次数，而是让 reward 逐渐偏好更紧凑的轨迹。

2. **"crop-then-search 的串行依赖"** 跟我们在 DevTeam v4 里遇到的问题同构——前置步骤的错误会级联放大。UGS 的解法是把两步合并为原子操作，消除中间状态。这跟 kenefe 说的"架构不好才会有那么多小问题"是一回事。

3. **Table 13 的非单调关系** 是最有说服力的发现：更多搜索 ≠ 更好结果。这跟 Peter Steinberger 的"agentic trap"警告一致——agent 容易陷入"多做总比少做好"的陷阱。

4. **OPD（On-Policy Distillation）** 用大模型在小模型失败 rollout 上做 dense token-level 修正，比纯 outcome reward 的 credit assignment 好很多。这对我们训练 agent 行为有参考价值。

---

## 相关链接

- [Anthropic: How we built our multi-agent research system](https://www.anthropic.com/engineering/built-multi-agent-research-system) — 并行 tool calling 是速度和性能的关键转折点
- [Awesome RL-based Agentic Search Papers](https://github.com/ventr1c/Awesome-RL-based-Agentic-Search-Papers) — RL 搜索 agent 论文合集
- [ProMMSearchAgent](https://arxiv.org/pdf/2604.20486) — 另一个可泛化的多模态搜索 agent 方案
