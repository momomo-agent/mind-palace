# 🔄 RecursiveMAS：当多 Agent 协作本身也能递归 Scale

> 论文：Recursive Multi-Agent Systems (arxiv 2604.25917)
> 作者：Jiaru Zou, Rui Pan, Ruizhong Qiu 等 (UIUC, Stanford, NVIDIA, MIT)
> 项目页：https://recursivemas.github.io

## 核心问题

递归语言模型（Recursive LM）已经证明了一件事：同一组 Transformer 层反复迭代，可以在 latent space 里不断加深推理。LoopLM 等工作把这个思路做到了单模型上。

但这篇论文问了一个更大的问题：**如果递归 scaling 对单模型有效，那多 agent 系统的协作本身，能不能也通过递归来 scale？**

答案是 RecursiveMAS——把整个多 agent 系统当成一个递归计算单元，每个 agent 就是这个"大循环"里的一层。

## 方法：怎么把异构 Agent 串成一个递归循环

### RecursiveLink：轻量级的跨模型桥梁

传统多 agent 系统的通信方式是文本——Agent A 生成文本，Agent B 读文本再生成。这有两个致命问题：

1. **慢**：每轮都要 decode 完整文本，vocabulary projection 的开销是 O(m|V|d_h)
2. **梯度断裂**：文本是离散的，argmax/softmax 会让梯度消失，没法端到端优化

RecursiveMAS 的解法是 **RecursiveLink**——一个两层残差投影模块，直接在 latent space 传递信息：

- **Inner Link**：在单个 agent 内部，把 last-layer hidden state 映射回 input embedding space，实现 latent thoughts 的自回归生成（不 decode 成文本）
- **Outer Link**：在不同 agent 之间，处理异构模型的 hidden dimension 差异，实现跨模型的 latent state 传输

结构极简：残差连接 + 两层线性 + GELU。参数量只有 13.12M（占整个系统的 0.31%），但效果拉满。

### 递归循环

把 N 个 agent 串成一个环：

```
A1 → (latent thoughts) → A2 → ... → AN → (回传给 A1) → 下一轮递归
```

中间轮次全部在 latent space 里协作，只有最后一轮的最后一个 agent 才 decode 出文本答案。这就是"系统级递归"——不是单个模型自己循环，而是整个 agent 团队一起循环。

### Inner-Outer Loop 训练

训练分两阶段，全程冻结所有 LLM 参数，只训练 RecursiveLink：

1. **Inner Loop**（模型级）：每个 agent 独立训练自己的 inner link，学会在 latent space 里生成 thoughts（用 cosine similarity 对齐 ground truth embedding）
2. **Outer Loop**（系统级）：展开 n 轮递归的完整计算图，用 cross-entropy loss 端到端优化所有 outer link，梯度沿递归路径反向传播

关键理论保证：文本交互的梯度范数 ≤ O(ε)（ε 是 softmax 熵，confident token 时趋近 0），而 RecursiveLink 的梯度范数 ≥ Ω(1 - √(log(1/δ)/d_h))，接近常数。这意味着递归再深，梯度也不会消失。

## 实验结果

在 9 个 benchmark 上测试（数学、科学、医学、代码、搜索），用 Qwen3/3.5、LLama-3、Gemma3、Mistral 等异构模型组合：

**核心数字：**
- 平均准确率提升 **8.3%**（对比最强 baseline）
- 推理加速 **1.2×–2.4×**
- Token 用量减少 **34.6%–75.6%**

递归越深，优势越大：
- r=1：比文本递归 MAS 高 8.1%
- r=2：高 19.6%
- r=3：高 20.2%

而且文本递归 MAS 在 r=3 时性能反而下降（token 爆炸 + 信息损耗），RecursiveMAS 则持续上升。

**训练成本对比：**

| 方法 | GPU 内存 | 可训练参数 | 成本 | 平均准确率 |
|------|---------|-----------|------|-----------|
| LoRA | 21.67 GB | 15.92M (0.37%) | $6.64 | 66.9% |
| Full-SFT | 41.40 GB | 4.21B (100%) | $9.67 | 68.6% |
| RecursiveMAS | **15.29 GB** | **13.12M (0.31%)** | **$4.27** | **74.9%** |

最少的参数、最低的成本、最高的准确率。

## 四种协作模式全覆盖

RecursiveMAS 不绑定特定拓扑，论文验证了四种常见模式：

1. **Sequential**（Planner → Critic → Solver）：链式分解问题
2. **Mixture**（多领域专家并行 → Summarizer 聚合）：比最强单专家高 6.2%
3. **Distillation**（Expert → Learner）：Learner 提升 8.0%，同时比 Expert 快 1.5×
4. **Deliberation**（Reflector + Tool-Caller 迭代）：工具调用场景也有效，提升 4.8%

## 与我们工作的关联

这篇论文对 OpenClaw 的多 agent 架构有直接启发：

**1. Latent Space 通信 vs 文本通信**

OpenClaw 当前的 agent 间通信是文本/JSON 格式。RecursiveMAS 证明了 latent space 通信在效率和可优化性上的巨大优势。虽然 OpenClaw 的 agent 用的是 API 模型（没有 hidden state 访问权限），但这个方向值得关注——随着开源模型能力提升和本地部署普及，latent 通信可能成为下一代 agent 框架的标配。

**2. 系统级递归优化**

RecursiveMAS 的核心洞察是：不要单独优化每个 agent，要把整个系统当成一个整体来优化。这和 OpenClaw 的 DevTeam workflow engine 理念一致——workflow 不只是 agent 的串联，而是一个有自己优化目标的系统。RecursiveMAS 的 inner-outer loop 训练范式，可以启发我们思考如何在 workflow 层面做端到端的优化。

**3. 异构 Agent 组合**

论文用了 Qwen、LLama、Gemma、Mistral 四个不同家族的模型组成异构系统，通过 RecursiveLink 统一它们的表示空间。这验证了一个重要假设：**不同模型的互补性可以通过适当的接口被有效利用**。OpenClaw 的多 agent 架构天然支持异构模型，这篇论文给出了更系统的理论和实验支撑。

**4. 递归作为新的 Scaling 轴**

传统 scaling 靠加参数、加数据、加 compute。递归提供了第四条路：**同样的系统跑多轮，每轮都在上一轮的基础上改进**。这对资源受限场景特别有价值——不需要更大的模型，只需要更多的递归轮次。

## 局限性

论文没有明确讨论的几个问题：

- **需要访问模型 hidden state**：对 API-only 模型不适用，这限制了实际部署场景
- **训练数据构造**：需要为每个 agent 角色构造专门的训练目标，数据工程成本不低
- **固定递归轮次**：训练和推理用相同的 n，没有动态退出机制
- **评估局限**：主要在 benchmark 上测试，缺少真实世界复杂任务的验证

## 一句话总结

RecursiveMAS 把递归 scaling 从单模型推广到多 agent 系统，用一个 13M 参数的轻量模块就实现了 8.3% 的准确率提升和 2.4× 的加速。核心洞察：**agent 协作本身就是一种可以被递归优化的计算**。
