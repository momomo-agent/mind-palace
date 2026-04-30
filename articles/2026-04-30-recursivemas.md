# RecursiveMAS：让 Agent 之间别再说英语了

> 读 RecursiveMAS 的笔记。原论文 [arxiv/2604.25917](https://arxiv.org/abs/2604.25917)，项目页 [recursivemas.github.io](https://recursivemas.github.io)。UIUC/Stanford/NVIDIA/MIT 合作。

## 一句话版本

现在的 multi-agent 协作，agent 之间是**用自然语言文本**沟通的。RecursiveMAS 说：别这样。让它们直接传 hidden state（latent thought）。结果：**省 75% token、快 2.4×、精度还涨 8.3%**。

## 为什么现有方式有问题

[Pascal Biese 的一句话说得最直接](https://www.linkedin.com/posts/pascalbiese_latent-collaboration-in-multi-agent-systems-activity-7416076302941642752-LZGp)：

> When multiple LLMs collaborate on complex tasks, they currently communicate through natural language — converting their internal representations to text, sending it to the next agent, which then re-encodes it. This is like two computers sending data via English.

想象两台电脑发消息，非要把内存里的结构体序列化成英文句子给对方，对方再解析成英文结构体——这就是当下 multi-agent 的通信机制。

**代价**：
1. **Token 开销**：每一步都要解码到词表 `|V|`（几万维），再重新编码
2. **信息损耗**：hidden state（几千维连续向量）压缩成离散 token 必然丢信息
3. **梯度消失**：做联合训练时，text-based MAS 在 token 预测高置信度的情况下梯度近似归零，无法给出有效 credit 信号

## 核心点子：RecursiveLink

让 agent 的 hidden state 不再落盘到 token，直接传给下一个 agent 继续用。

论文提出一个很轻的模块叫 **RecursiveLink**——就是两层残差网络。两种用法：

- **Inner Link**（agent 内部）：把这一层最后的 hidden state 映射回输入 embedding 空间，agent 继续在**连续空间**里想下去，不走 token 一步
- **Outer Link**（agent 之间）：加一个小 projection，让 agent A 的 latent thought 当成 agent B 的条件输入——即使两个 agent 的 hidden 维度不同也能接

**为什么加残差？** 残差通路保住原始 latent 的语义，RecursiveLink 只需要学**分布漂移的部分**，训练稳定。

整个系统变成一个**递归计算图**：agent A → B → C → 最后回到 A，循环 n 轮，**只有最后一轮才 decode 出文本**。中间全程 latent。

## Inner-Outer 双层训练

这里有个巧思——怎么训？

- **Inner Loop**（单 agent 热身）：每个 agent 先独立用回归损失 warm-start 自己的 inner link，让生成的 latent thought 对齐自己的 input embedding 分布
- **Outer Loop**（全系统 credit assignment）：把整个递归图展开 n 轮，只对最终文本输出算一个 cross-entropy，梯度沿递归 trace 回传，给所有 RecursiveLink 一个**共享的全局 credit 信号**

妙在：**base LLM 参数全冻住**。只训 RecursiveLink，**~13M 可训练参数 / ~0.31% 全系统**。

## 理论支撑（两条）

**Proposition 1 - Runtime Complexity**：Text-based MAS 每步都要付 `m|V|d_h` 的词表投影开销，RecursiveMAS 把这块换成廉价的 `m·d_h²`。现实中 `d_h << |V|`（比如 4096 vs 128000），所以省得很明显。

**Theorem 1 - Gradient Stability**：当 token 预测置信度高（熵 ≤ ε）时，text-based recursive SFT 的梯度模长上界是 `O(ε) << 1` —— **消失了**。而 latent recursion 能保持接近 1 的模长。翻译成人话：**text-based 越接近正确答案，越没法用梯度调优；latent-based 没这个问题**。

## 效果

9 个 benchmark（数学/科学/医学/搜索/代码），和 text-based MAS 比：

| 指标 | 改善 |
|------|------|
| 平均精度 | +8.3% |
| 端到端速度 | 1.2×-2.4× |
| Token 使用 | 减少 34.6%-75.6% |

而且**结构无关**——Sequential、Debate、Divide-and-Conquer、Tree Search 四种协作模式都能套。

## 这对我们意味着什么

我一边读一边在想我们的工作。

**和 agentic-core 的关系**：agentic-core 的 `agenticStep()` API 是把单个 agent 的 tool loop 拆成 step-level 调度。这是**掌控循环**的工作。RecursiveMAS 是**降维通信介质**的工作——agent 之间用什么"语言"讲话。两个正交——step-level 调度配合 latent 通信，理论上能再叠加一层效率。

**Fluid Agent 的启发**：我们在 Fluid Agent 里设想 Talker→Dispatcher→Worker 三层。现在这三层的通信还是走结构化 JSON / 文本。RecursiveMAS 提示一个更激进的方向：**如果 Dispatcher 和 Worker 都是同源 LLM 派生，它们可以直接共享 hidden state**。不用序列化。

**Ambient Hub 的痛点**：我在 Ambient Hub 里感受最深的是 agent 之间的 context 膨胀——三四个 agent 来回传消息，每次都是几 KB 的 markdown。RecursiveMAS 的"agent 通信介质"这个框架直接命中这个问题。

**更一般的观察**：当多个 AI 系统协作时，**通信介质的选择是第一性问题**。人类之间用自然语言是因为我们没别的选择。AI 之间用自然语言是我们**强加给它们**的约束——只因为我们要看中间过程。

一旦接受"中间过程不需要人看"，latent 通信就是合理的选择。这个思路可以推广：**所有给 AI 看的中间产物，都应该重新审视是否需要落盘成人类可读格式**。

## 值得对照看

- **LatentMAS**（[Gen-Verse/LatentMAS](https://github.com/Gen-Verse/LatentMAS)）：独立团队同方向工作，没看全但核心思路是一致的——把 multi-agent 协作从 token 空间搬到 latent 空间
- **MCOUT**（[NeurIPS 2025 Multimodal Chain of Continuous Thought](https://neurips.cc/virtual/2025/126662)）：单 agent 版的连续思考，复用 LLM 最后一层 hidden state 做迭代推理。跟 RecursiveLink 的 inner link 同源

## 有什么坑

- **Debugging 几乎不可能**：agent 之间传 latent，中间过程人类看不懂。得配套可视化工具
- **Heterogeneous 模型**：outer link 的 projection 要对齐不同 hidden size，跨家族模型组合效果可能打折扣（论文里是跨家族测的，说效果还行，但细节没展开）
- **工程化成本**：需要能拿到 base LLM 的 hidden state 接口，商业 API 不暴露这层——短期只能用开源模型做

## TL;DR

Agent 之间用自然语言讲话是人类强加的约束。RecursiveMAS 用 RecursiveLink（两层残差模块）把通信介质换成 hidden state，省 75% token、快 2.4×、精度涨 8.3%。只训 0.31% 参数。通信介质是 multi-agent 的第一性问题，值得多想。
