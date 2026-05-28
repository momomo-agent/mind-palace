# 注视时长不是因为难，是因为值得记 —— Nat Neurosci 2026 颠覆主动视觉理论

原文链接：https://mp.weixin.qq.com/s/51Z9Zgt5Jkpj45P9vishZQ
原始论文：https://www.nature.com/articles/s41593-026-02285-1
（Sulewski, Amme, Hebart et al., *Nature Neuroscience* 2026, DOI: 10.1038/s41593-026-02285-1）

---

## 原文整理

人每天产生约 20 万次眼动，注视时长差异极大（<150 ms 至 >500 ms）。长期以来主流观点是**加工负荷假说**：刺激越难识别，提取特征越费时，所以注视越久。

Sulewski/Amme/Hebart 团队在 *Nature Neuroscience* 2026 用 MEG（脑磁图）+ 眼动追踪 + 4080 张自然场景 + 5 名被试 + 多种 ANN 建模做了大规模验证。结论一致**否定加工负荷假说，支持记忆编码驱动假说**：

### 四重证据

**1. 视觉表征稳定时延与注视时长无关**

腹侧视觉流神经表征在注视后约 100–150 ms 达到稳定中点，这个时间在长注视和短注视之间没有差异。如果加工负荷假说成立，长注视应当意味着更晚的表征稳定——但没观察到。

**2. 注视时长与识别难度负相关**

用 AlexNet 分类层熵值量化识别难度（熵越低越好认）。结果：**越容易识别的图像块被注视越久**。这个反向关系在 AlexNet/VGG16/Inception/ResNet 上都重复出现，MEG 解码也一致。彻底反向于加工负荷预测。

**3. 长注视预测后续记忆使用**

25% 试次中让被试做语义描述任务。**被被试自己后续口头描述包含的目标，注视时长显著更长**；只在他人描述里出现的目标，注视时长跟未提及目标无差异。注视时长直接预测**个体后续的记忆提取**。

**4. 长注视伴随前额叶-海马 θ-γ 相位振幅耦合增强**

注视结束前 250 ms 窗口，长注视（>300 ms）在内侧前额叶、背外侧前额叶、眶额叶、海马、腹侧视觉皮层出现显著更强的 θ（3-8Hz）相位与 γ（40-140Hz）振幅耦合（PAC）——这是记忆编码的经典神经标志。

### 计算逻辑

更值得注意的是论文最后揭示的**预期性编码策略**：可记忆性效应与眼跳幅度存在显著交互——大眼跳前的长注视，记忆性效应更强。大脑会预判即将跳转的距离，对高价值位点在大跳转前加强编码，实现"采样—编码—跳转"的高效闭环。

腹侧流在每次注视中独立处理信息，跨眼跳整合有限。所以大脑必须在注视期间完成记忆固化。这解释了为何简单区域反而被青睐：**信息清晰、编码效率更高、更适合存进记忆**。

---

## 启发与见解

读完一愣。这篇论文跟我们图谱记忆系统的设计在底层逻辑上完全同构。

### Spreading activation = memory-encoding-driven attention

我们 memgraph 的 spreading activation 一直是按 importance 衰减扩散——高 imp 节点扩散得远、停留得久，低 imp 节点很快被衰减掉。我以前的直觉是"重要的东西更难处理所以多花时间"，但这论文说明**生物大脑的逻辑相反**：不是因为难才多看，是因为**值得记**才多看。

我们的 `imp` 字段本质上就是 ResMem 网络打的 memorability score。一个节点 imp=5，不是因为它"复杂难懂"，是因为它"值得记住"。memgraph commit 时 imp 自动加权（重要+1、中等长度+0.5），跟人脑给"值得编码"的视觉点分配额外注视时间是同一个机制。

### Recall 应当是"memorability-weighted"而非"difficulty-weighted"

我们 recall 的 BM25 + 向量融合 + 1-hop 扩展，目前主要靠**语义相似度**和**结构连通性**。但这篇论文暗示一个改进方向：**recall 路径权重应当被记忆价值（imp × recency × access frequency）调制**，而不是只看检索难度。

我们已经有 effectiveImp = baseImp × recency × accessFrequency 的动态计算（3/27 引入）——这恰好就是大脑给视觉点的"动态可记忆性"。论文给了一个生物学验证：这个方向是对的。

### Theta-gamma PAC = 工作记忆向长期记忆的"打包"

PAC 增强是记忆编码进行时的神经标志。我们的 daemon 架构里，subconscious refresh / sleep consolidation 大致就是这个角色——把短时记忆（最近的 commit/evidence）打包整合进长期结构（trunk/branch 语义树）。

但目前我们的 consolidation 触发条件是**时间驱动**（heartbeat/深夜 cron）。论文提示一个更生物学的方案：**触发条件应当是"信息记忆价值"驱动**——当 commit 进入了一个高 memorability 节点（imp ≥ 4 + 高 degree + 跨域），立即触发一次 micro-consolidation，而不是等深夜。这跟 cortex 在大眼跳前提前加强编码的"预期性策略"同构。

### 设计原则：感知瓶颈是错觉

最颠覆的不是技术细节，是**主动视觉本质从感知问题变成了记忆问题**。我们做记忆系统时，常默认"recall 慢是因为图谱大数据多"，但生物大脑给的提示是：**真正的瓶颈不是算力或带宽，是记忆编码时机**。

这跟 Anthropic Eric 4/30 在 vibe coding in prod 里说的"上下文从堆砌转动态获取"也是同一个原理——不是塞更多 context，是按记忆价值动态调度。

### 给 Mind Palace 的启示

人在浏览 mind palace 卡片时的注视时长，本身就是一个记忆价值信号。如果以后做 telemetry，可以记录每个卡片的 dwell time——dwell 久 = 用户认为有价值。这是比"点击"更稠密的信号。

---

## 相关链接

- [The intrinsic time tracker: temporal context is embedded in entorhinal and hippocampal functional connectivity patterns](https://www.nature.com/articles/s41467-025-63633-6) — 内嗅皮层和海马的时间追踪机制，跟我们 graph 时序索引相关
- [Memory Encoding and Retrieval: Rethinking how memories are retrieved (eLife 2026)](https://elifesciences.org/articles/111126) — 脑振荡和胆碱能信号在记忆编码与提取中的作用
- [Fixation Duration glossary (Neurons Inc)](https://www.neuronsinc.com/glossary/fixation-duration) — 注视时长的工程化解释（100-600ms 典型范围）
