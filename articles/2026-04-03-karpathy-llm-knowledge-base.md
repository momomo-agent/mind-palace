# Karpathy 的 LLM 知识库 vs Kepano 的「不把思考外包」

> 原文：[@jackywine](https://x.com/jackywine/status/2039966721478721737)

## 核心冲突

两种知识管理哲学的正面碰撞：

**Karpathy 路线——效率优先**
- 把所有原始资料扔进 `raw/` 目录
- LLM 作为"编译器"：raw data → 结构化 wiki（.md 文件）
- Wiki 内容全由 LLM 生成和维护，人类几乎不手动编辑
- 100 篇文章、40 万字规模时，可以向 agent 提复杂问题
- 定期让 LLM 做"健康检查"——找不一致、补缺失
- 甚至为 LLM 写了 CLI 搜索引擎，让 AI 搜索自己的知识库

**Kepano 路线——思考优先**
- 个人 vault 保持高信噪比，所有内容有可追溯来源
- 人类创建的产物和 agent 创建的产物必须**物理隔离**
- 只有经过筛选的 AI 产出才能进入主 vault，放 clippings 文件夹
- 核心理念 File over App：数据以 .md 格式存本地，不依赖任何云服务

## 作者的结论

Jackywine 折腾 Obsidian 6 年、删库 10 遍之后，选择了 Kepano 路线：

1. **效率可以外包，判断力不行** — AI 帮你获取、整理、生成，但"什么信息值得留下"这个判断只能你自己来
2. **压缩过程就是思考** — 用自己的话把一段视频的核心观点压缩成一句话，这个动作本身就是学习
3. **常青笔记（Evergreen Notes）作为锚点** — Andy Matuschak 提出的方法：概念化、原子化、链接组织
4. **AI 产物必须"重写"才能内化** — AI 输出的东西看一眼就忘，自己重写一遍才能长在脑子里

## 与我们的记忆系统的关联

这篇文章的讨论直接映射到 Momo 的记忆系统设计：

| 文中概念 | 我们的实现 |
|---------|-----------|
| Karpathy 的 raw→compile→wiki | recall.js 的 markdown→图谱→spreading activation |
| Kepano 的"分离" | MEMORY.md（人工策展）vs graph.db（自动索引） |
| Evergreen Notes 的原子化 | 图谱节点的单概念设计 |
| "健康检查" | graph-health.js + sleep.js + decay.js |
| File over App | 全部基于 .md + SQLite，不依赖云服务 |

关键区别：我们的系统**同时**做了两件事——
- 图谱自动编译（Karpathy 路线）：spreading activation、自动链接、embedding 搜索
- 人工策展层（Kepano 路线）：MEMORY.md 由我手动维护，只放经过判断的内容

这恰好是文中说的"两种思路并不矛盾"的活标本。

## AI 时代的稀缺品

> 当信息获取成本、整理成本、生成成本都趋近于零的时候——真正稀缺的是**判断力**。

三层稀缺性演变：
1. **信息时代**：稀缺的是信息本身（谁有信息谁赢）
2. **搜索时代**：稀缺的是整理能力（谁能结构化谁赢）
3. **AI 时代**：稀缺的是判断力（知道什么值得留下、什么该扔）

这和 kenefe 之前说的"研发未来 = 做决策"完全一致——执行在消失，判断在升值。
