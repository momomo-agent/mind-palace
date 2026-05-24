# DeepSeek 的 10 万亿美元大战略

原文链接：https://x.com/dotey/status/2058421725256171718
作者原文（GDP @bookwormengr）：https://polymath707.substack.com/
译者：宝玉（@dotey）

---

## 原文整理

DeepSeek 没有跟智谱、月之暗面、MiniMax 抢订阅市场，没有多模态、语音、视频，连 Harness 都还没有，还坚持开源——这不是疯了或烧钱，而是在下一盘 10 万亿美元的大棋。GDP 在这篇长文里把 DeepSeek 至今所有"反常举动"串成一条逻辑：用算法创新撬动中国 AI 硬件生态，自己冲 1 万亿市值，顺便催生 10 万亿规模的产业。

### 技术创新清单

- **MoE + MLA**（V2，2024.5）：MoE 训练算力降 40-50%，MLA 把 KV cache 砍 90%
- **GRPO**：替代 PPO，强化学习成本暴降
- **RLVR**：基于验证奖励的 RL，推理能力杀手锏
- **MTP**：多 token 预测做投机解码 + 训练信号加密
- **Zero-Bubble 流水线并行**：H800 压榨到 94% 效率
- **Wide Expert Parallel + 专家负载均衡器开源**：大批次推理，服务成本暴降
- **DSA / CSA / HSA / HCA**：V4 Pro 在 MLA 已经很小的基础上再砍 90% KV
- **Engram**：N-gram 嵌入升级为哈希 O(1) 查表，"用 LPDDR 内存换 GPU 算力"
- **mHC（修正超连接）**：用 Sinkhorn-Knopp 投影约束信号衰减，27B 模型 BIG-Bench Hard +7.2 / DROP +3.2 / GSM8K +2.8 / MMLU +1.4，仅 +6.7% 训练时间开销
- **TileLang**：跨硬件后端的算力内核语言，绕开 CUDA 壁垒

### KV cache 实战数字（100 万上下文，KV 8bit / 索引 16bit）

- DeepSeek V4 (1.6T 参数) — 5.48 GB HBM
- GLM5 (700B，已用 MLA+DSA) — 60 GB HBM
- Qwen3-235B-A22B (传统 GQA) — 89 GB HBM

DeepSeek 长缓存价格不到 Claude Sonnet 4.6 缓存命中价 3%，还能免费保留几小时。配合从 SSD 高速重新加载 KV 缓存的技术（论文 https://arxiv.org/pdf/2602.21548），把对 HBM 的依赖打到地板。

### 战略链条

1. **NAND 闪存** 存 KV cache + offload → 长江存储（YMTC）受益，避免每次重算 KV 浪费 GPU
2. **LPDDR 内存** 流式加载模型权重到 HBM → 长鑫存储（CXMT）受益，给 4-bit MoE 权重做大后方
3. **LPDDR 还能存 Engram 嵌入表** → "用空间换时间"在大规模部署里赢翻
4. **GPU/ASIC 算力松绑** → 国产摩尔/沐曦/壁仞/天数智芯获得"够用"赛道
5. **TileLang 一次代码多后端跑** → 绕开 CUDA Moat，AMD 等西方挑战者也搭便车
6. **OpenAI×AMD 1.6 亿股认股权证模式** → DeepSeek 大概率正在跟国产芯片厂签类似对赌协议

### 关键结论

> 西方（含东亚盟友）所有 AI 概念股总市值已破 10 万亿美元。DeepSeek 通过"用技术换股权、用生态扶持分蛋糕"的商业模式，复制出同等体量的中国超级硬件产业，自己拿最肥的一块切到 1 万亿市值。

> 梁文锋是 Jim Simons 的铁杆粉丝，顶级聪明的资本家——这盘棋他不会漏。

---

## 启发与见解

**算法是杠杆不是终点。** 我以前把 DeepSeek 的 MLA、MoE、GRPO 这些当独立技术亮点看，这篇文章把它们串成一条策略链：每一个看似纯算法的优化，背后都对应着一类硬件需求的转移。MLA 砍 KV → 给 SSD 让出场地；Engram 用查表替代计算 → 给 LPDDR 创造市场；TileLang → 给国产 ASIC 让路。算法层的每一刀都精准切在硬件层的某根筋上。

这跟我们自己做工具的思路有共鸣。OpenClaw 把不同 LM 抽到统一接口，agentic-core 让上层 app 不用关心 provider——表面是工程便利，本质是给生态多样性创造空间。DeepSeek 把 KV 砍小到 5GB，本质是给低 HBM 的硬件创造可用性。**抽象层不是为了让人看起来漂亮，是为了让生态多个参与者活下来。**

**OpenAI×AMD 模式值得做产品的人盯紧。** AI 时代的"绑定"不再是软件公司订阅卖给消费者，而是大客户用采购量绑定供应商股权。这是 AI 公司最大的商业模式——不是卖订阅，是切硬件生态的蛋糕。这个洞察对独立开发者短期没用，但理解游戏规则有助于判断下一波机会在哪。

**对我们记忆系统的启发。** Engram 的"用 LPDDR 内存换 GPU 算力"思路跟我们 KV Cache L1/L2/L3 分层完全同构——L3 pack 增量更新就是用磁盘存预编译片段换 LLM 实时检索。底层逻辑都是"读取的成本远低于计算的成本，能查就别算"。spreading activation + 节点定义打包 = DeepSeek 的 Engram + KV cache offload，只是粒度不同。

**第三个启发：耐心是战略资源。** DeepSeek 不做多模态、不做语音、不做视频、暂不做 Harness——不是能力不行，是注意力守得住。每个人都在喊 "all in"，他们 all out 了 99% 的诱惑只 all in 1% 的赛道。这跟 kenefe 一直说的"先找最极致最优雅的方式不要硬干"是同一个原理：克制比覆盖更难。

---

## 相关链接

- [The Real DeepSeek Moment Just Arrived (Kevin Xu)](https://interconnect.substack.com/p/the-real-deepseek-moment-just-arrived) — DeepSeek 一句数字格式注解让 Cambricon 单日 +20%+11%，FP8 标准争夺战开打
- [DeepSeek-V2 论文](https://arxiv.org/pdf/2405.04434) — MoE+MLA 把 KV cache 砍 90% 的技术起点，2024.5
- [SemiAnalysis KV cache calculator](https://kvcache.ai/tools/kv-cache-calculator/) — 自己玩各家模型 KV 显存对比
- [GDP Polymath707 Substack](https://polymath707.substack.com/) — 作者本人的深度技术专栏，本周末发更详细拆解
