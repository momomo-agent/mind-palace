# Karpathy 的 LLM Wiki：从 RAG 到知识复利

## RAG 的根本问题

Karpathy 一针见血：RAG 每次都在从头发现知识。问一个需要综合五篇文档的问题，LLM 每次都要重新找到并拼凑相关片段。没有积累，没有复利。NotebookLM、ChatGPT 文件上传、大多数 RAG 系统都是这样。

这不是工程问题，是范式问题。

## LLM Wiki 的核心

不是在查询时从原始文档检索，而是让 LLM **增量构建和维护一个持久 wiki**——结构化、互相链接的 markdown 文件集合。

添加新源文档时，LLM 不是索引它等以后检索。它读完，提取关键信息，整合进已有 wiki：更新实体页，修订主题摘要，标记新数据与旧结论的矛盾，强化或挑战正在演进的综合。知识编译一次，然后持续更新。

**wiki 是持久的复利资产。** 交叉引用已经建好了。矛盾已经被标记了。综合已经反映了所有你读过的内容。

## 三层架构

1. **Raw Sources** — 源文档集合。文章、论文、图片、数据。不可变，LLM 只读不写。这是真理来源。
2. **Wiki** — LLM 生成的 markdown 目录。摘要、实体页、概念页、对比、综述、综合。LLM 完全拥有这一层。
3. **Schema** — AGENTS.md / CLAUDE.md，告诉 LLM wiki 的结构、规范、工作流。关键配置文件——把 LLM 从通用聊天机器人变成有纪律的 wiki 维护者。

## 跟我们的对比

我们的记忆系统和 Karpathy 的 LLM Wiki 本质上是同一个范式：

| Karpathy LLM Wiki | 我们的记忆系统 |
|---|---|
| Raw Sources | memory/timeline/*.md（日记原文） |
| Wiki | MEMORY.md + memory/projects/*.md + memory/lessons/*.md |
| Schema | AGENTS.md + SOUL.md + HEARTBEAT.md |
| 交叉引用 | graph.db（节点+边+扩散激活） |
| 查询 | recall.js（BM25 + bge-m3 向量 + 图扩展） |
| 整合 | dream + subconscious + internalize |
| 矛盾检测 | graph-health.js + benchmark |

差异：
1. 我们额外有 **图谱层**（graph.db）做概念关联和扩散激活，Karpathy 的方案用 markdown 链接实现交叉引用
2. 我们有 **主动整合**（dream/subconscious），Karpathy 的方案主要是被动（添加源文档时触发）
3. 我们有 **遗忘机制**（decay.js），Karpathy 的方案只增不减
4. Karpathy 用 Obsidian 做可视化 IDE，我们用图谱可视化

## Idea File 的洞察

另一个更 meta 的洞察：在 agent 时代，**分享想法比分享代码更有价值**。

以前你写好代码开源，别人 clone 来用。现在你写好一个 idea file（刻意保持抽象/模糊），别人把它丢给自己的 agent，agent 根据具体需求定制实现。

代码是具体的、僵硬的。想法是抽象的、可塑的。当 agent 能把想法变成代码时，分享想法的杠杆率远高于分享代码。

这跟 kenefe 3/9 说的一致：**研发未来 = 做决策**。执行向的工作被 agent 吞掉，人的价值在于想法和判断。

14.7K likes，2.2M views。Karpathy 一条推文的影响力比大多数公司的产品发布都大。
