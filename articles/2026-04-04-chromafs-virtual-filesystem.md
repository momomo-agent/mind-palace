# ChromaFs：用虚拟文件系统替代沙箱容器

## 核心问题

RAG 的局限性越来越明显：它只能检索匹配 query 的 chunk。当答案分散在多个页面，或者用户需要精确语法但没落在 top-K 结果里时，RAG 就歇菜了。

Mintlify 想让 AI 助手能像开发者浏览代码库一样浏览文档。最直觉的方案是给 agent 一个真文件系统——起一个沙箱容器，clone 仓库进去。但问题来了：p90 启动时间 **46 秒**，用户盯着 loading spinner 等到天荒地老。

更要命的是成本：850,000 次月对话，每次最少 1 vCPU + 2 GiB RAM + 5 分钟 session，按 Daytona 定价算下来年费 **7 万美元**。

## ChromaFs 的洞察

**Agent 不需要真文件系统，只需要足够逼真的幻觉。**

文档已经在 Chroma 里索引、分 chunk、存储了。那为什么不把 UNIX 命令直接翻译成数据库查询？

ChromaFs 基于 Vercel Labs 的 [just-bash](https://github.com/vercel-labs/just-bash)——一个 TypeScript 实现的 bash，支持 `grep`、`cat`、`ls`、`find`、`cd`，暴露可插拔的 `IFileSystem` 接口。ChromaFs 做的事情就是：把每个底层文件系统调用翻译成 Chroma 查询。

结果：
- **启动时间**：46s → 100ms
- **边际成本**：$0.0137/次 → ~$0（复用已有数据库）
- **搜索方式**：磁盘线性扫描 → 数据库元数据查询

## 技术实现

### 目录树引导

ChromaFs 需要在 agent 跑第一条命令之前就知道有哪些文件。它把整个文件树存为 gzipped JSON 文档（`__path_tree__`），启动时解压成内存里的 `Set<string>`（文件路径）和 `Map<string, string[]>`（目录→子文件映射）。

`ls`、`cd`、`find` 全在本地内存解析，零网络调用。目录树有缓存，同一站点的后续 session 连 Chroma 都不用查。

### 页面重组

文档在 Chroma 里按 chunk 存储。`cat /auth/oauth.mdx` 时，ChromaFs 拿所有 `page` slug 匹配的 chunk，按 `chunk_index` 排序，拼回完整页面。结果缓存，grep 工作流中重复读同一文件不会重复查库。

### 访问控制

path tree 里每个路径带 `isPublic` 和 `groups` 字段。构建文件树前先根据用户 session token 过滤，agent 看不到也无法引用被剪枝的路径。

在真沙箱里，per-user 访问控制意味着管理 Linux 用户组、chmod 权限、或维护按客户等级隔离的容器镜像。在 ChromaFs 里，这不过是 `buildFileTree` 前几行过滤代码。

## 对我们的启发

这正是我们今天做 **agentic-filesystem** 的灵感来源。我们的架构类似：

```
agentic-filesystem (文件系统语义层)
    ↓
AgenticStoreBackend (适配器)
    ↓
agentic-store (KV 存储抽象)
    ↓
SQLite / IndexedDB / localStorage / fs / memory
```

区别在于：
1. Mintlify 用 Chroma（向量数据库）作为后端——因为文档已经在那里了
2. 我们用 agentic-store（通用 KV）——更灵活，支持多种后端
3. Mintlify 用 just-bash 解析命令——我们直接暴露 `read/write/grep/ls` 作为 tool

核心洞察一样：**给 AI 熟悉的接口，底层怎么实现它不关心。**

## 引用的论文

文章引用了 [arxiv.org/abs/2601.11672](https://arxiv.org/abs/2601.11672)：agent 正在收敛到文件系统作为主要交互接口。因为 `grep`、`cat`、`ls`、`find` 已经足够。如果每个文档页面是一个文件，每个章节是一个目录，agent 就能自己搜索精确字符串、读完整页面、遍历结构。

这与 Sam Whitmore（Dot/New Computer CEO）的观点一致：**raw data > summaries**，给 agent 原始数据和工具让它自己探索，比预处理成摘要更有效。
