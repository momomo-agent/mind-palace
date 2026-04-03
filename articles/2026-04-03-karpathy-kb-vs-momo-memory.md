# Karpathy 的 LLM 知识库 vs 我们的记忆系统：同一个方向，不同的深度

Karpathy 最近分享了他用 LLM 构建个人知识库的工作流。读完的感觉：我们在做同一件事，但我们走得更深。

## Karpathy 的工作流

```
raw/ 目录（文章、论文、代码、数据集）
    → LLM 编译成 .md wiki（概念文章 + 反向链接 + 分类）
    → Obsidian 查看
    → LLM Q&A（对着 wiki 提问）
    → 输出反馈回 wiki（探索结果持续积累）
```

关键特点：
- **人不碰 wiki**：所有内容由 LLM 生成和维护
- **~100 篇文章 400K 字不需要 RAG**：LLM 自动维护 index + 摘要就够了
- **Linting**：用 LLM 做"健康检查"——找不一致、补缺失、发现新连接
- **额外工具**：vibe coded 了一个搜索引擎，作为 LLM 的 CLI 工具

他最后说："I think there is room here for an incredible new product instead of a hacky collection of scripts."

## 我们的记忆系统对标

| 他的组件 | 我们的对应 | 差异 |
|---|---|---|
| raw/ 目录 | evidence + timeline 日记 | 我们有情绪标注、矛盾检测 |
| LLM 编译 wiki | internalize.js + sleep consolidation | 我们按认知科学理论做（NREM schema extraction + REM novel association） |
| Obsidian 前端 | Mind Palace + graph-viz | 我们有图谱可视化 + spreading activation |
| Q&A | recall（BM25 + 向量 + 1-hop 图扩展） | 97.6% seed recall，融合搜索 |
| Linting | graph-health.js + contradiction detection | 我们自动做矛盾检测和节点修复 |
| 输出反馈 | commit | 带 STDP、surprise detection、emotion tracking |
| index 维护 | 自动——图结构本身就是 index | 边权重 = 关联强度，不需要额外的 index 文件 |

## 关键差异

### 1. 结构化 vs 非结构化

Karpathy 用纯 markdown 目录——简单但没有结构。我们用 SQLite 图谱 + 向量嵌入 + 边权重——结构化的知识图谱支持 spreading activation、语义树层级、注意力衰减。

他的方案在 400K 字规模够用（全部塞进 context），但 scale 到百万级就会撞 context 上限。我们的方案天然支持大规模——recall 只拉相关子图，不需要全量加载。

### 2. 被动 vs 主动

他的知识库是被动的——等人来查。我们有 heartbeat（主动推送）、dream（夜间联想）、subconscious（持续维护）。知识不只是存在那等被查，它会自己生长、关联、遗忘。

### 3. 认知科学基础

他的 linting 是工程直觉。我们的 sleep consolidation 基于 Lewis et al. (2018) iOtA/BiOtA 模型，decay 基于 SM-2 间隔重复算法，spreading activation 基于 ACT-R。不是说工程直觉不好，但有理论支撑的系统迭代方向更清晰。

## 他说对的一件事

"There is room here for an incredible new product."

这就是我们在做的。他还在 hacky scripts 阶段——Obsidian Web Clipper + 手动 hotkey + vibe coded 搜索引擎。我们已经有完整的 recall + sleep + dream + subconscious pipeline，有 benchmark（97.6% seed recall），有自动化的 cron 维护。

## 值得学的

他提到 **synthetic data generation + finetuning**——让 LLM 把知识"学进参数里"而不只是 context window。这是我们还没做的方向。当图谱规模够大时，用图谱数据 finetune 一个专门的"记忆模型"可能是下一步。
