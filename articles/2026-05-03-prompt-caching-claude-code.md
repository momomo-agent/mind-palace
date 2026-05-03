# Prompt Caching 是构建 Claude Code 的一切

Anthropic 工程团队发布了一篇技术博客，分享了构建 Claude Code 过程中关于 Prompt Caching 的 7 条经验教训。核心观点：**前缀匹配是 Prompt Caching 的本质，所有系统设计都应围绕这个约束展开。**

## 为什么缓存是基建而非优化

Claude Code 是长对话产品，用户一个 session 可能聊几十轮，每轮都要带上完整上下文。没有缓存，延迟和成本都会爆炸。Anthropic 内部把缓存命中率当作基础设施级指标监控，命中率下降会触发 oncall 告警。

## 7 条经验

### 1. Prompt 排列顺序决定缓存效率

越不容易变的内容越往前放：静态 system prompt → 工具定义 → CLAUDE.md → Session 上下文 → 对话消息。前缀匹配意味着只要前面的内容不变，后面新增的部分就能复用之前的计算。

常见坑：在静态 prompt 里嵌时间戳、工具定义排列顺序不确定（dict/set）、工具参数更新。一个小细节就能让整条缓存链断裂。

### 2. 用消息传递更新，别改 Prompt

信息过时了怎么办？不改 prompt，把更新塞进下一轮的 user message 或 tool result 里（用 `<system-reminder>` 标签）。Prompt 是不可变的基础设施，消息才是流动的信息层。

### 3. 不要中途换模型

缓存跟模型绑定。100k token 的对话从 Opus 切到 Haiku 回答一个简单问题，重建缓存的成本比让 Opus 直接回答还高。需要用小模型时，用子 Agent——独立上下文、独立缓存，不污染主对话。

### 4. 不要增删工具

工具定义是缓存前缀的一部分。加一个、减一个，整个对话的缓存全部重建。看似在优化，实则在添乱。

### 5. Plan Mode 的巧妙设计

进入 Plan Mode 不移除执行类工具，而是加 `EnterPlanMode` / `ExitPlanMode` 两个特殊工具。工具集始终不变，缓存始终有效。额外好处：模型可以自主判断何时进入规划模式。

### 6. 延迟加载 MCP 工具

几十个 MCP 工具不全塞进 prompt，而是放轻量 stub（`defer_loading: true`），模型需要时再通过 Tool Search 拉取完整 schema。前缀始终只包含 stub，缓存稳定。

### 7. Cache-Safe Forking 做 Compaction

长对话需要压缩时，压缩请求复用主对话完全一样的 system prompt、工具定义、上下文，只在末尾追加压缩指令。这样压缩操作共享主对话的缓存链，几乎零额外成本。

## 一句话总结

先确定约束，再围绕约束做设计。Prompt Caching 不是做完了顺便加的优化，而是从第一天起就要围绕它来设计架构。
