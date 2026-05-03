# RecursiveMAS：当多 Agent 协作本身成为递归计算

## 核心问题

多 Agent 系统（MAS）已经证明了"分工协作"的价值，但一个关键问题悬而未决：**Agent 之间的协作本身能不能被 scale？**

传统 MAS 的 agent 通过文本交互——一个 agent 生成文本，下一个 agent 读取并继续。这带来两个瓶颈：
1. **延迟**：每个 agent 都要完整解码再编码，中间 agent 的文本生成是纯开销
2. **梯度断裂**：文本是离散的，梯度无法穿过 token 采样传播，系统无法端到端优化

## RecursiveMAS 的解法

把整个多 agent 系统重新理解为一个**递归计算**：

- 每个 agent = 一个 RLM（Recursive Language Model）层
- Agent 间传递的不是文本，而是 **latent embedding**
- 所有 agent 首尾相连形成循环，迭代 n 轮后最后一个 agent 才输出文本

连接异构 agent 的关键组件是 **RecursiveLink**——一个两层残差投影模块：

```
R(h) = h + W₂ · σ(W₁ · h)     # inner link（同 agent 内）
R(h) = W₃h + W₂ · σ(W₁ · h)   # outer link（跨 agent，处理不同维度）
```

整个训练只更新 RecursiveLink（占总参数 0.31%），agent 本身冻结。

## 训练：Inner-Outer Loop

1. **Inner loop**：每个 agent 独立训练 inner link，学会在 latent space 生成"思维"（对齐到 input embedding 分布）
2. **Outer loop**：展开 n 轮递归，端到端优化所有 outer link，梯度沿完整计算图回传

理论证明：text-based 递归在 confident token 时梯度趋近 0（因为 softmax 的 Jacobian 在低熵时坍缩），而 RecursiveLink 的残差结构保持梯度 ≈ 1。

## 实验亮点

在 9 个 benchmark（数学、科学、医学、代码、搜索）上：

- **准确率**：平均 +8.3%（vs 最强 baseline）
- **推理速度**：1.2x → 2.4x 加速（随递归轮数增加）
- **Token 用量**：减少 34.6% → 75.6%

关键发现：**训练递归深度和推理递归深度有互补 scaling 效应**——训练教会系统产生 refinement-ready 的 latent state，推理时多跑几轮就能继续提升。

## 四种协作模式全适用

- Sequential（Planner → Critic → Solver）
- Mixture（多专家并行 + Summarizer 聚合）
- Distillation（Expert → Learner 蒸馏）
- Deliberation（Reflector + Tool-Caller 迭代）

RecursiveMAS 是 structure-agnostic 的，不绑定特定拓扑。

## 启发

1. **Latent > Text 作为 agent 通信介质**：文本是给人看的，agent 之间没必要经过 decode-encode 的瓶颈
2. **递归是新的 scaling axis**：不需要更大模型或更多 agent，同一组 agent 多跑几轮就能持续提升
3. **轻量连接 > 全量微调**：0.31% 参数的 adapter 就能 co-optimize 整个系统，成本远低于 LoRA 或 full SFT
4. **跟 test-time compute 思路一脉相承**：训练时学会"怎么迭代改进"，推理时给更多 compute budget 就能更好
