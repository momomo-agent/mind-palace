# Codex Chronicle：被动屏幕记忆 vs 主动图谱记忆

来源：[OpenAI Developers](https://x.com/openaidevs/status/2046288243768082699)
文档：[Chronicle 官方文档](https://developers.openai.com/codex/memories/chronicle)

## Chronicle 是什么

OpenAI 给 Codex 桌面端加了一个叫 Chronicle 的功能：后台持续截屏，用 sandboxed agent 把截图内容总结成 markdown 记忆文件，存在本地。下次你跟 Codex 对话时，它能从这些记忆里找到你之前在做什么，不需要你重复解释上下文。

一句话：让 AI 拥有"刚才你在看什么"的感知能力。

## 技术架构

```
[屏幕] → 定期截图 → $TMPDIR/chronicle/screen_recording/（临时，6h 后删）
                          ↓
              [Sandboxed Agent] → OCR + 截图分析
                          ↓
              生成 markdown 记忆 → ~/.codex/memories_extensions/chronicle/
                          ↓
              [Codex 对话时] → 检索相关记忆作为 context
```

关键设计决策：

1. **截图是临时的，记忆是持久的** — 截图存 `$TMPDIR`，6 小时后自动删除。记忆是 markdown 文件，持久存储。这意味着 Chronicle 不是"回放录屏"，而是"从录屏中提取要点"。

2. **记忆是纯 markdown，未加密** — 用户可以直接读、编辑、删除。OpenAI 明确警告"其他程序也能访问这些文件"。这是个有意识的 trade-off：可审计性 > 安全性。

3. **截图发服务器处理** — 本地截图上传到 OpenAI 服务器生成记忆，处理完不保留截图。记忆文件存回本地。这意味着你的屏幕内容会过一遍 OpenAI 的服务器。

4. **消耗 rate limit 很快** — 后台 agent 持续运行，每次处理截图都算 API 调用。Pro 订阅（$200/月）的用户才能用，而且可能很快用完额度。

5. **需要 macOS Screen Recording + Accessibility 权限** — 这是 macOS 最敏感的两个权限。Screen Recording 能看到所有窗口内容，Accessibility 能读取 UI 元素。

## 跟我们的记忆系统对比

| 维度 | Chronicle | Momo 记忆系统 |
|------|-----------|--------------|
| 采集方式 | 被动（截屏） | 主动（对话中提取） |
| 存储格式 | 纯 markdown 文件 | SQLite graph.db + markdown |
| 检索方式 | 文件内容匹配（推测） | BM25 + bge-m3 向量 + RRF + 图扩展 |
| 关联能力 | 无（平面文件） | 图谱（节点+边+spreading activation） |
| 遗忘机制 | 手动删除 | decay.js 自动衰减 |
| 隐私 | 截图过服务器 | 全部本地 |
| 触发成本 | 持续消耗 rate limit | 零额外成本（对话内提取） |
| 覆盖范围 | 广（所有屏幕活动） | 窄（仅对话内容） |

## 核心洞察

### 被动采集 vs 主动记录

Chronicle 最大的创新不是技术（截屏+OCR 不新），而是产品决策：**记忆应该是被动的**。用户不应该需要"告诉 AI 记住什么"——AI 应该自己观察、自己记。

这跟人类记忆的工作方式一致：你不会"决定"要记住今天午饭吃了什么，它自然就记住了。Chronicle 试图复制这种被动记忆。

我们的系统是主动记录——每次对话中提取概念、commit 到图谱。精度更高（因为是从结构化对话中提取），但覆盖范围窄（只有对话内容，不知道 kenefe 在 Xcode 里改了什么代码、在浏览器里看了什么文章）。

### 两种路径可能互补

- **被动采集做广度**：知道用户在做什么、用什么工具、看什么内容
- **主动记录做深度**：理解概念关系、建立知识图谱、支持推理

理想的记忆系统可能是两者结合：Chronicle 式的被动感知提供"发生了什么"，图谱式的主动记录提供"这意味着什么"。

### 隐私是硬约束

Chronicle 的隐私模型很诚实但也很吓人：截图过服务器、记忆未加密、其他程序可访问。对于企业用户，这基本不可接受。我们的全本地方案在隐私上有天然优势。

### Rate limit 是产品瓶颈

后台 agent 持续运行消耗 rate limit，这意味着 Chronicle 和正常对话在争抢同一个额度池。$200/月的 Pro 用户可能发现开了 Chronicle 后对话次数明显减少。这个 trade-off 在当前定价下很痛。
