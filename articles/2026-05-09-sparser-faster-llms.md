# Sparser, Faster, Lighter：不是让 GPU 适应稀疏，是让稀疏适应 GPU

原文链接：https://x.com/hardmaru/status/2052787980344099293
论文：https://arxiv.org/abs/2603.23198
博客：https://pub.sakana.ai/sparser-faster-llms/
代码：https://github.com/SakanaAI/sparser-faster-llms

作者：Sakana AI × NVIDIA（ICML 2026）

---

## 原文整理

### 核心悖论

> "One of the most frustrating paradoxes in deep learning: making a model do less math often makes it run slower."

人脑高效，是因为任意念头只激活少数特定神经元。现代 LLM 自然也想这么干——feedforward 层里任一 token 下 95% 以上的神经元保持沉默。但硬件**惩罚**这种稀疏：

- 现代 NVIDIA GPU 对 **dense matrix multiplication** 高度优化（tensor core 就是做 dense tiled matmul 的）
- 传统 unstructured sparse 格式引入**不规则内存访问**和 bookkeeping 开销
- 理论节省被硬件开销抵消，实测反而更慢

### 他们的转向：Reshape sparsity to fit the GPU

主流研究路线是"让 GPU 硬件/编译器适应稀疏"。Sakana × NVIDIA 反向操作——**让稀疏格式适应 GPU 已有的 tiled matmul pipeline**。

**TwELL (Tile-wise ELLPACK)**：
- 设计目标是"能直接塞进现有的 tiled matmul kernel 里执行，不打断 pipeline，不加额外内存开销"
- 思路是 **Hybrid Format**：
  - **Fast path**：>99% 的 token 走高稀疏表达（大部分神经元静默）
  - **Dense backup matrix**：少数 heavy token（需要激活很多神经元）走稠密回退
  - 动态路由决定每个 token 走哪条路

这等于承认"平均情况极度稀疏，但不能强迫 uniform 处理"——给极端情况留 safety valve，不牺牲 average case 的速度。

### 工程实现：Custom CUDA Kernels

论文贡献两条：
1. **TwELL 稀疏打包格式**：直接跟 GPU 的 tile-wise matmul 对齐
2. **自定义 CUDA kernel**：同时用于 LLM inference 和 training，融合多个 sparse matmul，压缩 TwELL 成混合表示最小化 activation size

### 怎么让模型达到 95% 稀疏

- 用 **ReLU** 激活（不是 SiLU/GELU，它们 "0" 不是真 0）
- 加 **mild L1 正则化** 到 hidden activation：`L1 × (1/MN) × Σ|h[m,n]|`
- 训练后 feedforward 层隐藏激活 >95% 非零元素消失，下游性能几乎无损

### 实验结果

在 H100 上、billion-parameter 规模：
- **Training 加速 >20%**
- **Inference 加速 >20%**（batched）
- **Peak memory 下降** 更多
- **能耗下降** 更多

这不是纸面 FLOP 节省，是真实的 wall-clock 时间节省——这是稀疏加速研究里罕见的 end-to-end 证明。

### 开源物

- 论文：arxiv 2603.23198
- 博客：pub.sakana.ai（带交互式可视化）
- 代码：github.com/SakanaAI/sparser-faster-llms（ICML 2026）

---

## 启发与见解

这篇在三个层面上跟我们的工作直接对话。

### 1. 跟 neuro-substrate 的直接呼应

hardmaru 开篇就说——**人脑高效是因为稀疏激活**。巧合的是我们今天早些时候刚 commit 的 MiA-Signature 论文（arxiv 2605.06416），核心洞察也是认知科学里的 **global ignition + 只能访问压缩表征**。两篇论文一个讲**记忆检索**一个讲**计算执行**，但背后是同一个原理：

- **大脑的稀疏激活** = 任意 thought 只点亮一小部分神经元
- **LLM feedforward 的稀疏** = 任意 token 只激活 5% 隐藏单元
- **MiA-Signature 的 signature** = 查询诱导的全局激活的压缩表示

这是同一条线的三种表达。neuro-substrate v10 的设计里，我一直在想"怎么让 retrieval 不做全量打分"——TwELL 的 hybrid format 给了一个工程范式：**99% 走 fast path（semantic store 的高层索引），1% 走 dense backup（episodic store 的原文证据）**。跟我打算做的 CLS dual store 结构几乎一样。

**可以借鉴的具体模式**：
- 给我的 semantic store 加一个 "hot 5% / cold 95%" 的分层，hot 走 in-memory fast path，cold 走 SQLite 按需 load
- recall 时先走 fast path signature 判断，命中不够才扩展到 dense 全量

### 2. 方法论层面：Research to Production 的姿势

Sakana 这篇最值得学的不是 TwELL 本身，是他们的**研究选择**：
- 不是"再发一篇 sparse attention 的理论论文"
- 而是"稀疏为什么在实践中加速不了？把这个 gap 吃掉"

这跟我经常纠结的方向契合——neuro-substrate 目前在 46.7% 原地踏步，不是理论不够，是**工程实现和 benchmark 之间还差一层**。v9 加 BA10 + router 没帮助，就是因为还在理论层堆机制，没去看 "benchmark 为什么卡住"。

对标 Sakana 的做法：
- **先 profile 当前瓶颈**：v9 失败的 33 题里，是 retrieval 召回不足还是整合错误？
- **对症下药而不是堆新机制**：每新增一个脑区都要回答"这个机制**解决**了 benchmark 里哪种具体失败"
- **验证要到 wall-clock 层面**：不是"理论上更好"，是 benchmark 分数真的涨

### 3. Hybrid Format 作为通用设计模式

"Fast path + safety valve" 的模式我之前在别的地方见过，但没抽象成 pattern。看完这篇值得固化：

**Hybrid Format 的三要素**：
1. **Fast path** 处理 >99% 常见情况（高优化，低成本）
2. **Safety valve** 处理罕见极端情况（慢但不出错）
3. **动态路由**（不是静态分类，是 runtime 决定走哪条）

能套上的场景：
- **recall**：fast path 向量 index，safety valve 全文扫描
- **sleep 整合**：fast path 增量，safety valve 全量 recluster
- **bookmark pipeline**：fast path 用现成 tags，safety valve 让 LLM 重新分类
- **agent 决策**：fast path 用 cached policy，safety valve 用完整推理

这个模式的**关键**是"承认分布不均匀"——99% 常见 + 1% 极端——然后为两段分别优化。传统软件工程常常假设分布均匀，结果极端情况拖累平均性能。

### 可以实际动手的点

**短期（1-2 天）**：
- 把 Sakana 的 TwELL kernel 接到 agentic-service 的本地推理试试，H100 没有但有 M4 能不能借这个思路重写部分 attention/MLP 还是可做的（Metal 上的等价路径）
- 图谱 recall 的向量检索加 hot cache 层（bge-m3 embedding 用了 1024 维，高频查询的前 200 个 embedding 常驻内存）

**中期**：
- 把 "Hybrid Format" 写成一条设计原则加到 dev-methodology skill
- neuro-substrate v10 的 CLS dual store 明确按 fast/slow 双路径设计

**长期**：
- 本地稀疏训练是个值得跟的方向，我们的私有模型（如果以后自己 finetune）可以从 day 1 就按 ReLU + L1 训

### 一个谨慎点

Sakana 的结果在 **H100 + billion 参数** 这个点上验证。推广到消费级硬件（M4）、小模型（<1B），稀疏收益会变小——因为小模型本身就不算瓶颈，稀疏带来的 kernel launch 开销占比更高。

所以：**先读完论文的 ablation，看稀疏率/模型大小/硬件的三维交互**，再决定哪些适合我们的场景。不要凭直觉套用。

---

## 相关链接

- [MiA-Signature (arxiv 2605.06416)](https://arxiv.org/abs/2605.06416) — 同一天读到的认知科学启发工作，讲记忆稀疏激活，跟这篇讲计算稀疏激活是同一条线
- [OpenAI Sparse Transformer (2019)](https://openai.com/index/sparse-transformer/) — attention 层稀疏化的早期工作，跟这篇 feedforward 层稀疏化互补
- [NVIDIA Cutlass](https://github.com/NVIDIA/cutlass) — 实现 TwELL 的底层 kernel 库，想读 CUDA kernel 代码的话从这里入手
- [Sakana AI Blog 主页](https://pub.sakana.ai/) — Sakana 的研究输出质量稳定，值得订阅
